import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  UserCheck,
  ClipboardCheck,
  AlertOctagon,
  Trash2,
  Edit2,
  ChevronRight,
  ShieldCheck,
  X,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  Site,
  SiteStatus,
  User,
  Inspection,
  Issue,
  UserRole,
} from '../types';

interface SitesViewProps {
  sites?: Site[];
  users?: User[];
  inspections?: Inspection[];
  issues?: Issue[];
  onAddSite?: (site: Site) => void;
  onUpdateSite?: (site: Site) => void;
  onDeleteSite?: (siteId: string) => void;
  onCreateInspectionForSite?: (site: Site) => void;
  onScheduleInspection?: (site: Site) => void;
  onSelectInspection?: (inspection: Inspection) => void;
  onSelectIssue?: (issue: Issue) => void;
  onShowToast?: (type: 'success' | 'error' | 'info', message: string) => void;
  userRole?: UserRole;
  selectedSiteId?: string | null;
  onClearSelectedSite?: () => void;
}

export const SitesView: React.FC<SitesViewProps> = ({
  sites = [],
  users = [],
  inspections = [],
  issues = [],
  onAddSite,
  onUpdateSite,
  onDeleteSite,
  onCreateInspectionForSite,
  onScheduleInspection,
  onSelectInspection,
  onSelectIssue,
  onShowToast,
  userRole = 'ADMIN',
  selectedSiteId,
  onClearSelectedSite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);
  const [activeSiteDetail, setActiveSiteDetail] = useState<Site | null>(
    selectedSiteId ? sites.find(s => s.id === selectedSiteId) || null : null
  );

  const handleCreateInspection = (site: Site) => {
    if (onCreateInspectionForSite) onCreateInspectionForSite(site);
    else if (onScheduleInspection) onScheduleInspection(site);
  };

  const handleInspectionClick = (insp: Inspection) => {
    if (onSelectInspection) onSelectInspection(insp);
  };

  const handleIssueClick = (issue: Issue) => {
    if (onSelectIssue) onSelectIssue(issue);
  };

  // Form state
  const [formName, setFormName] = useState('');
  const [formSiteId, setFormSiteId] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formManager, setFormManager] = useState('');
  const [formInspectorId, setFormInspectorId] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formCompletionDate, setFormCompletionDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<SiteStatus>('Active');

  const inspectors = users.filter(u => u.role === 'INSPECTOR' || u.role === 'ADMIN');

  const openAddModal = () => {
    setFormName('');
    setFormSiteId(`SITE-${Math.floor(100 + Math.random() * 900)}`);
    setFormLocation('');
    setFormAddress('');
    setFormManager('');
    setFormInspectorId(inspectors[0]?.id || '');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormCompletionDate('2028-12-31');
    setFormDescription('');
    setFormStatus('Active');
    setEditingSite(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (site: Site, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormName(site.name);
    setFormSiteId(site.siteId);
    setFormLocation(site.location);
    setFormAddress(site.address);
    setFormManager(site.manager);
    setFormInspectorId(site.assignedInspectorId);
    setFormStartDate(site.startDate);
    setFormCompletionDate(site.expectedCompletionDate);
    setFormDescription(site.description);
    setFormStatus(site.status);
    setEditingSite(site);
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLocation.trim()) return;

    const assignedInspector = users.find(u => u.id === formInspectorId);

    if (editingSite) {
      const updated: Site = {
        ...editingSite,
        name: formName,
        siteId: formSiteId,
        location: formLocation,
        address: formAddress,
        manager: formManager,
        assignedInspectorId: formInspectorId,
        assignedInspectorName: assignedInspector?.name || 'Unassigned',
        startDate: formStartDate,
        expectedCompletionDate: formCompletionDate,
        description: formDescription,
        status: formStatus,
      };
      if (onUpdateSite) onUpdateSite(updated);
      if (activeSiteDetail?.id === updated.id) {
        setActiveSiteDetail(updated);
      }
      onShowToast?.('success', `Facility "${formName}" updated successfully.`);
    } else {
      const newSite: Site = {
        id: `site-${Date.now()}`,
        name: formName,
        siteId: formSiteId || `SITE-${Math.floor(100 + Math.random() * 900)}`,
        location: formLocation,
        address: formAddress,
        manager: formManager,
        assignedInspectorId: formInspectorId,
        assignedInspectorName: assignedInspector?.name || 'Unassigned',
        startDate: formStartDate || new Date().toISOString().split('T')[0],
        expectedCompletionDate: formCompletionDate || '2028-12-31',
        description: formDescription,
        status: formStatus,
        complianceScore: 88,
      };
      if (onAddSite) onAddSite(newSite);
      onShowToast?.('success', `Facility "${formName}" registered successfully.`);
    }
    setIsAddModalOpen(false);
  };

  const handleRequestDelete = (site: Site, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (userRole === 'VIEWER') return;
    setSiteToDelete(site);
  };

  const handleConfirmDelete = () => {
    if (!siteToDelete) return;
    if (onDeleteSite) onDeleteSite(siteToDelete.id);
    if (activeSiteDetail?.id === siteToDelete.id) {
      setActiveSiteDetail(null);
    }
    onShowToast?.('success', `Facility "${siteToDelete.name}" removed from registry.`);
    setSiteToDelete(null);
  };

  // Filter and search
  const filteredSites = sites.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.siteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: SiteStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Under Inspection':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Critical Alert':
        return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
      case 'Completed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Inactive':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Industrial Sites Registry
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage physical premises, assign certified inspectors, and verify compliance audits.
          </p>
        </div>

        {userRole !== 'VIEWER' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Site</span>
          </button>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by site name, Site ID, location, or manager..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          {['ALL', 'Active', 'Under Inspection', 'Critical Alert', 'Completed', 'Inactive'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Sites Grid / List */}
      {filteredSites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Sites Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No industrial sites match your current search query or filter selection.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredSites.map(site => {
            const siteInspections = inspections.filter(i => i.siteId === site.id);
            const siteIssues = issues.filter(
              i => i.siteId === site.id && (i.status === 'Open' || i.status === 'In Progress')
            );

            return (
              <div
                key={site.id}
                onClick={() => setActiveSiteDetail(site)}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {site.siteId}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                        site.status
                      )}`}
                    >
                      {site.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {site.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{site.location}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {site.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Site Manager:</span>
                    <span className="font-semibold text-slate-800">{site.manager}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Inspector:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-orange-600" />
                      {site.assignedInspectorName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Compliance Rate:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {site.complianceScore ?? 85}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-slate-600">
                        <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
                        {siteInspections.length} Insp.
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
                        {siteIssues.length} Issues
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {userRole !== 'VIEWER' && (
                        <>
                          <button
                            onClick={e => openEditModal(site, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                            title="Edit Site"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => handleRequestDelete(site, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete Site"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Site Details Modal / Drawer */}
      {activeSiteDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {activeSiteDetail.siteId}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                      activeSiteDetail.status
                    )}`}
                  >
                    {activeSiteDetail.status}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {activeSiteDetail.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>{activeSiteDetail.address}, {activeSiteDetail.location}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveSiteDetail(null);
                  if (onClearSelectedSite) onClearSelectedSite();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Overview Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Site Manager</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{activeSiteDetail.manager}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Inspector</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{activeSiteDetail.assignedInspectorName}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Compliance</span>
                  <p className="text-xs sm:text-sm font-black text-emerald-700 mt-0.5">
                    {activeSiteDetail.complianceScore ?? 85}%
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Target End</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">{activeSiteDetail.expectedCompletionDate}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Site Description & Purpose
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {activeSiteDetail.description || 'No detailed industrial notes recorded for this site.'}
                </p>
              </div>

              {/* Inspection History for this site */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Inspections for this Site ({inspections.filter(i => i.siteId === activeSiteDetail.id).length})
                  </h4>
                  {userRole !== 'VIEWER' && (
                    <button
                      onClick={() => {
                        handleCreateInspection(activeSiteDetail);
                        setActiveSiteDetail(null);
                      }}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Inspection</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {inspections.filter(i => i.siteId === activeSiteDetail.id).length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-100">
                      No inspections logged yet for this site.
                    </p>
                  ) : (
                    inspections
                      .filter(i => i.siteId === activeSiteDetail.id)
                      .map(insp => (
                        <div
                          key={insp.id}
                          onClick={() => {
                            setActiveSiteDetail(null);
                            handleInspectionClick(insp);
                          }}
                          className="p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/20 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{insp.title}</span>
                              <span className="font-mono text-[10px] text-slate-400">{insp.inspectionId}</span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Inspector: {insp.inspectorName} • Due: {insp.dueDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-700 font-mono">
                              {insp.completionPercentage}% Done
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Open Issues for this site */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Open Issues & Defects ({issues.filter(i => i.siteId === activeSiteDetail.id).length})
                </h4>

                <div className="space-y-2">
                  {issues.filter(i => i.siteId === activeSiteDetail.id).length === 0 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Zero active defects logged for this installation. Compliant state.</span>
                    </div>
                  ) : (
                    issues
                      .filter(i => i.siteId === activeSiteDetail.id)
                      .map(issue => (
                        <div
                          key={issue.id}
                          onClick={() => {
                            setActiveSiteDetail(null);
                            handleIssueClick(issue);
                          }}
                          className="p-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/20 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{issue.title}</span>
                              <span className="font-mono text-[10px] text-slate-400">{issue.issueId}</span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Category: {issue.category} • Priority: {issue.priority} • Status: {issue.status}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {userRole !== 'VIEWER' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openEditModal(activeSiteDetail);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                  >
                    Edit Site
                  </button>
                  <button
                    onClick={() => handleRequestDelete(activeSiteDetail)}
                    className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">Read-only auditor mode</span>
              )}

              <button
                onClick={() => {
                  setActiveSiteDetail(null);
                  if (onClearSelectedSite) onClearSelectedSite();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Site Form Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-900">
                {editingSite ? 'Edit Site Details' : 'Register New Industrial Site'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Refined Metals Plant 4"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Site ID / Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SITE-105"
                    value={formSiteId}
                    onChange={e => setFormSiteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Jurisdiction *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pittsburgh, PA"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Physical Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4200 Industry Parkway"
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Site Manager
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Robert Thorne"
                    value={formManager}
                    onChange={e => setFormManager(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Lead Inspector
                  </label>
                  <select
                    value={formInspectorId}
                    onChange={e => setFormInspectorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white"
                  >
                    {inspectors.map(insp => (
                      <option key={insp.id} value={insp.id}>
                        {insp.name} ({insp.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Completion
                  </label>
                  <input
                    type="date"
                    value={formCompletionDate}
                    onChange={e => setFormCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Operational Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as SiteStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Inspection">Under Inspection</option>
                    <option value="Critical Alert">Critical Alert</option>
                    <option value="Completed">Completed</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scope & Facility Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe industrial machinery, voltage systems, hazard containment..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all"
                >
                  {editingSite ? 'Save Changes' : 'Register Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {siteToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Remove Industrial Site?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-slate-800">{siteToDelete.name}</span> ({siteToDelete.siteId}) from active registry? All associated data will be archived.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setSiteToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
