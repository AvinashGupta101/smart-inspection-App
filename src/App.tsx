import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { tickTelemetry, generateAnomalyEvent, TelemetryEvent } from './services/telemetry';
import {
  Site,
  Inspection,
  ChecklistItem,
  Issue,
  User,
  UserRole,
  NavTab,
  TelemetryReading,
  ActivityLog,
  IssueCategory,
} from './types';

// Layout & View Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { SitesView } from './components/SitesView';
import { InspectionsView } from './components/InspectionsView';
import { DigitalChecklistModal } from './components/DigitalChecklistModal';
import { IssuesView } from './components/IssuesView';
import { ReportsView } from './components/ReportsView';
import { LiveMonitoringView } from './components/LiveMonitoringView';
import { UsersView } from './components/UsersView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Global Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Core Database State
  const [sites, setSites] = useState<Site[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(StorageService.getCurrentUser());
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Telemetry Simulation State
  const [telemetry, setTelemetry] = useState<Record<string, TelemetryReading>>({});
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modals & Cross-Module Contexts
  const [activeChecklistInspection, setActiveChecklistInspection] = useState<Inspection | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [preSelectedSiteForInspection, setPreSelectedSiteForInspection] = useState<Site | null>(null);
  const [preFilledIssue, setPreFilledIssue] = useState<{
    title: string;
    description: string;
    siteId: string;
    siteName: string;
    inspectionId: string;
    inspectionTitle: string;
    checklistItemId: string;
    category: IssueCategory;
    evidenceUrl?: string;
  } | null>(null);

  // Initial Data Load
  const refreshData = () => {
    setSites(StorageService.getSites());
    setInspections(StorageService.getInspections());
    setChecklistItems(StorageService.getChecklistItems());
    setIssues(StorageService.getIssues());
    setUsers(StorageService.getUsers());
    setCurrentUser(StorageService.getCurrentUser());
    setActivities(StorageService.getActivities());
    setTelemetry(StorageService.getTelemetry());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Real-time Telemetry Simulator Loop (3.5s interval)
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setTelemetry(prevTelemetry => {
        if (Object.keys(prevTelemetry).length === 0) return prevTelemetry;
        const currentSites = sites.length > 0 ? sites : StorageService.getSites();
        const { readings, newEvents } = tickTelemetry(prevTelemetry, currentSites);

        if (newEvents.length > 0) {
          setTelemetryEvents(prev => [...newEvents, ...prev].slice(0, 30));
        }

        StorageService.saveTelemetry(readings);
        return readings;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [isSimulating]);

  // Telemetry anomaly manual trigger
  const handleTriggerAnomaly = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    const { updatedTelemetry, event } = generateAnomalyEvent(siteId, site.name);
    setTelemetry(prev => ({
      ...prev,
      [siteId]: updatedTelemetry,
    }));
    setTelemetryEvents(prev => [event, ...prev].slice(0, 30));
    StorageService.saveTelemetry({
      ...telemetry,
      [siteId]: updatedTelemetry,
    });
  };

  // Site Handlers
  const handleAddSite = (newSite: Site) => {
    const updated = [newSite, ...sites];
    setSites(updated);
    StorageService.saveSites(updated);
    StorageService.logActivity(
      'Site Registered',
      `Site ${newSite.name} (${newSite.siteId}) registered.`,
      currentUser.name,
      newSite.id,
      newSite.name
    );
    setActivities(StorageService.getActivities());
  };

  const handleUpdateSite = (updatedSite: Site) => {
    const updated = sites.map(s => (s.id === updatedSite.id ? updatedSite : s));
    setSites(updated);
    StorageService.saveSites(updated);
    StorageService.logActivity(
      'Site Updated',
      `Facility profile for ${updatedSite.name} updated.`,
      currentUser.name,
      updatedSite.id,
      updatedSite.name
    );
    setActivities(StorageService.getActivities());
  };

  const handleDeleteSite = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    const updated = sites.filter(s => s.id !== siteId);
    setSites(updated);
    StorageService.saveSites(updated);
    if (site) {
      StorageService.logActivity(
        'Site Decommissioned',
        `Facility ${site.name} removed from active monitoring.`,
        currentUser.name
      );
      setActivities(StorageService.getActivities());
    }
  };

  // Cross-Navigation: Schedule Inspection directly for a specific site
  const handleScheduleInspectionForSite = (site: Site) => {
    setPreSelectedSiteForInspection(site);
    setActiveTab('inspections');
  };

  // Inspection Handlers
  const handleAddInspection = (newInsp: Inspection) => {
    const updated = [newInsp, ...inspections];
    setInspections(updated);
    StorageService.saveInspections(updated);
    StorageService.logActivity(
      'Inspection Scheduled',
      `Inspection ${newInsp.inspectionId} scheduled for ${newInsp.siteName}.`,
      currentUser.name,
      newInsp.siteId,
      newInsp.siteName
    );
    setActivities(StorageService.getActivities());
  };

  const handleUpdateInspection = (updatedInsp: Inspection) => {
    const updated = inspections.map(i => (i.id === updatedInsp.id ? updatedInsp : i));
    setInspections(updated);
    StorageService.saveInspections(updated);
    StorageService.logActivity(
      'Inspection Updated',
      `Inspection ${updatedInsp.inspectionId} (${updatedInsp.title}) details modified.`,
      currentUser.name,
      updatedInsp.siteId,
      updatedInsp.siteName
    );
    setActivities(StorageService.getActivities());
  };

  const handleDeleteInspection = (inspectionId: string) => {
    const target = inspections.find(i => i.id === inspectionId);
    StorageService.deleteInspection(inspectionId);
    const updated = inspections.filter(i => i.id !== inspectionId);
    setInspections(updated);
    if (target) {
      StorageService.logActivity(
        'Inspection Deleted',
        `Inspection order ${target.inspectionId} removed from records.`,
        currentUser.name,
        target.siteId,
        target.siteName
      );
      setActivities(StorageService.getActivities());
    }
  };

  const handleOpenChecklist = (inspection: Inspection) => {
    setActiveChecklistInspection(inspection);
  };

  const handleSaveChecklistItems = (items: ChecklistItem[]) => {
    setChecklistItems(items);
    StorageService.saveChecklistItems(items);

    // Update the completion percentage on the inspection
    if (activeChecklistInspection) {
      const answered = items.filter(it => it.status !== 'Pending').length;
      const percentage = items.length > 0 ? Math.round((answered / items.length) * 100) : 0;
      const updatedInsp: Inspection = {
        ...activeChecklistInspection,
        completionPercentage: percentage,
        status: percentage === 100 ? activeChecklistInspection.status : 'In Progress',
      };

      const updatedList = inspections.map(i => (i.id === updatedInsp.id ? updatedInsp : i));
      setInspections(updatedList);
      StorageService.saveInspections(updatedList);
      setActiveChecklistInspection(updatedInsp);
    }
  };

  const handleSubmitInspection = (
    submittedInsp: Inspection,
    result: 'Pass' | 'Conditional Pass' | 'Fail',
    summary: string
  ) => {
    const completed: Inspection = {
      ...submittedInsp,
      status: 'Completed',
      completionPercentage: 100,
      result,
      findingsSummary: summary,
    };

    const updatedList = inspections.map(i => (i.id === completed.id ? completed : i));
    setInspections(updatedList);
    StorageService.saveInspections(updatedList);

    // Also update site compliance score dynamically
    const site = sites.find(s => s.id === completed.siteId);
    if (site) {
      const scoreDelta = result === 'Pass' ? 2 : result === 'Conditional Pass' ? -4 : -10;
      const newScore = Math.max(50, Math.min(100, (site.complianceScore || 85) + scoreDelta));
      const updatedSite: Site = {
        ...site,
        complianceScore: newScore,
      };
      const updatedSites = sites.map(s => (s.id === updatedSite.id ? updatedSite : s));
      setSites(updatedSites);
      StorageService.saveSites(updatedSites);
    }

    StorageService.logActivity(
      'Inspection Completed',
      `Work order ${completed.inspectionId} submitted with result: ${result}.`,
      currentUser.name,
      completed.siteId,
      completed.siteName
    );
    setActivities(StorageService.getActivities());
    setActiveChecklistInspection(null);
  };

  // Cross-Module: Escalate failed checklist item directly into a tracked issue!
  const handleCreateIssueFromChecklist = (item: ChecklistItem) => {
    if (!activeChecklistInspection) return;

    setPreFilledIssue({
      title: `${item.title} Defect`,
      description: item.remarks || `Checklist item failed inspection: ${item.description}`,
      siteId: activeChecklistInspection.siteId,
      siteName: activeChecklistInspection.siteName,
      inspectionId: activeChecklistInspection.id,
      inspectionTitle: activeChecklistInspection.title,
      checklistItemId: item.id,
      category: (item.category as IssueCategory) || 'Safety',
      evidenceUrl: item.evidencePhotoUrl,
    });

    setActiveChecklistInspection(null);
    setActiveTab('issues');
  };

  // Issue Handlers
  const handleAddIssue = (newIssue: Issue) => {
    const updated = [newIssue, ...issues];
    setIssues(updated);
    StorageService.saveIssues(updated);

    // Increment site hazard count
    const site = sites.find(s => s.id === newIssue.siteId);
    if (site) {
      const updatedSite = { ...site, activeIssues: (site.activeIssues || 0) + 1 };
      const updatedSites = sites.map(s => (s.id === updatedSite.id ? updatedSite : s));
      setSites(updatedSites);
      StorageService.saveSites(updatedSites);
    }

    StorageService.logActivity(
      'Defect Logged',
      `Hazard ${newIssue.issueId} (${newIssue.priority} Priority) flagged at ${newIssue.siteName}.`,
      currentUser.name,
      newIssue.siteId,
      newIssue.siteName
    );
    setActivities(StorageService.getActivities());
  };

  const handleUpdateIssue = (updatedIssue: Issue) => {
    const updated = issues.map(iss => (iss.id === updatedIssue.id ? updatedIssue : iss));
    setIssues(updated);
    StorageService.saveIssues(updated);

    StorageService.logActivity(
      'Defect Updated',
      `Issue ${updatedIssue.issueId} shifted to ${updatedIssue.status}.`,
      currentUser.name,
      updatedIssue.siteId,
      updatedIssue.siteName
    );
    setActivities(StorageService.getActivities());
  };

  const handleDeleteIssue = (issueId: string) => {
    const target = issues.find(i => i.id === issueId);
    StorageService.deleteIssue(issueId);
    const updated = issues.filter(i => i.id !== issueId);
    setIssues(updated);

    if (target) {
      StorageService.logActivity(
        'Defect Deleted',
        `Defect issue ${target.issueId} (${target.title}) was removed.`,
        currentUser.name,
        target.siteId,
        target.siteName
      );
      setActivities(StorageService.getActivities());
    }
  };

  const handleLogout = () => {
    setIsAuthModalOpen(true);
    showToast('info', 'Field session ended. Please select an operational user or re-authenticate.');
  };

  // User & Profile Handlers
  const handleRoleChange = (role: UserRole) => {
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    StorageService.setCurrentUser(updated);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    StorageService.setCurrentUser(updatedUser);
    const updatedList = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updatedList);
    StorageService.saveUsers(updatedList);
  };

  const handleAddUser = (newUser: User) => {
    const updated = [...users, newUser];
    setUsers(updated);
    StorageService.saveUsers(updated);
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
  };

  // Reset database to initial factory state
  const handleResetDatabase = () => {
    StorageService.resetDatabase();
    refreshData();
    showToast('info', 'Database reset to industrial demo seed data.');
  };

  const openIssuesCount = issues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;
  const criticalIssuesCount = issues.filter(i => i.priority === 'Critical' && i.status !== 'Resolved' && i.status !== 'Closed').length;
  const pendingInspectionsCount = inspections.filter(i => i.status !== 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased selection:bg-orange-500 selection:text-white">
      {/* Top Industrial Header */}
      <Header
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
        isSimulating={isSimulating}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          openIssuesCount={openIssuesCount}
          criticalIssuesCount={criticalIssuesCount}
          pendingInspectionsCount={pendingInspectionsCount}
          onLogout={handleLogout}
          userRole={currentUser.role}
          currentUser={currentUser}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                sites={sites}
                inspections={inspections}
                issues={issues}
                activities={activities}
                telemetry={telemetry}
                onNavigateTo={setActiveTab}
                onOpenChecklist={handleOpenChecklist}
                onAddSite={() => setActiveTab('sites')}
                onCreateInspection={() => setActiveTab('inspections')}
                onSelectSite={site => handleScheduleInspectionForSite(site)}
                onSelectInspection={inspection => handleOpenChecklist(inspection)}
                onSelectIssue={() => setActiveTab('issues')}
                userRole={currentUser.role}
              />
            )}

            {activeTab === 'sites' && (
              <SitesView
                sites={sites}
                users={users}
                inspections={inspections}
                issues={issues}
                onAddSite={handleAddSite}
                onUpdateSite={handleUpdateSite}
                onDeleteSite={handleDeleteSite}
                onScheduleInspection={handleScheduleInspectionForSite}
                onCreateInspectionForSite={handleScheduleInspectionForSite}
                onSelectInspection={handleOpenChecklist}
                onSelectIssue={() => setActiveTab('issues')}
                userRole={currentUser.role}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'inspections' && (
              <InspectionsView
                inspections={inspections}
                sites={sites}
                users={users}
                onAddInspection={handleAddInspection}
                onUpdateInspection={handleUpdateInspection}
                onDeleteInspection={handleDeleteInspection}
                onOpenChecklist={handleOpenChecklist}
                userRole={currentUser.role}
                preSelectedSite={preSelectedSiteForInspection}
                onClearPreSelectedSite={() => setPreSelectedSiteForInspection(null)}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'issues' && (
              <IssuesView
                issues={issues}
                sites={sites}
                inspections={inspections}
                users={users}
                currentUser={currentUser}
                onAddIssue={handleAddIssue}
                onUpdateIssue={handleUpdateIssue}
                onDeleteIssue={handleDeleteIssue}
                userRole={currentUser.role}
                preFilledItem={preFilledIssue}
                onClearPreFilledItem={() => setPreFilledIssue(null)}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView
                sites={sites}
                inspections={inspections}
                issues={issues}
                checklists={checklistItems}
                currentUser={currentUser}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'monitoring' && (
              <LiveMonitoringView
                sites={sites}
                telemetry={telemetry}
                telemetryEvents={telemetryEvents}
                isSimulating={isSimulating}
                onToggleSimulation={() => setIsSimulating(!isSimulating)}
                onTriggerTestAnomaly={handleTriggerAnomaly}
              />
            )}

            {activeTab === 'users' && (
              <UsersView
                users={users}
                currentUser={currentUser}
                onAddUser={handleAddUser}
                onSelectUser={handleSelectUser}
                userRole={currentUser.role}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                onUpdateUser={handleUpdateUser}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onLogout={handleLogout}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                onResetDatabase={handleResetDatabase}
                onRefreshData={refreshData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        openIssuesCount={openIssuesCount}
        pendingInspectionsCount={pendingInspectionsCount}
        currentUser={currentUser}
      />

      {/* Digital Inspection Checklist Modal */}
      {activeChecklistInspection && (
        <DigitalChecklistModal
          inspection={activeChecklistInspection}
          checklistItems={checklistItems}
          onSaveItems={handleSaveChecklistItems}
          onSubmitInspection={handleSubmitInspection}
          onCreateIssueFromChecklist={handleCreateIssueFromChecklist}
          onClose={() => setActiveChecklistInspection(null)}
          userRole={currentUser.role}
          onShowToast={showToast}
        />
      )}

      {/* Authentication & Profile Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onLoginSuccess={user => {
          setCurrentUser(user);
          showToast('success', `Welcome back, ${user.name}! Authenticated as ${user.role}.`);
        }}
        onRegisterUser={user => {
          handleAddUser(user);
          showToast('success', `New user profile created for ${user.name}.`);
        }}
      />

      {/* Standardized Global Toast Notification System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
