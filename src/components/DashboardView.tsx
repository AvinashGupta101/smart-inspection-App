import React from 'react';
import {
  Building2,
  ClipboardCheck,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  MapPin,
  ChevronRight,
  Activity,
  Calendar,
} from 'lucide-react';
import {
  Site,
  Inspection,
  Issue,
  ActivityItem,
  AppTab,
  UserRole,
} from '../types';

interface DashboardViewProps {
  sites?: Site[];
  inspections?: Inspection[];
  issues?: Issue[];
  activities?: ActivityItem[];
  onNavigate?: (tab: AppTab) => void;
  onNavigateTo?: (tab: AppTab) => void;
  onAddSite?: () => void;
  onCreateInspection?: () => void;
  onSelectSite?: (site: Site) => void;
  onSelectInspection?: (inspection: Inspection) => void;
  onSelectIssue?: (issue: Issue) => void;
  onOpenChecklist?: (inspection: Inspection) => void;
  telemetry?: Record<string, any>;
  userRole?: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sites = [],
  inspections = [],
  issues = [],
  activities = [],
  onNavigate,
  onNavigateTo,
  onAddSite,
  onCreateInspection,
  onSelectSite,
  onSelectInspection,
  onSelectIssue,
  onOpenChecklist,
  telemetry = {},
  userRole = 'ADMIN',
}) => {
  const handleNav = (tab: AppTab) => {
    if (onNavigate) onNavigate(tab);
    else if (onNavigateTo) onNavigateTo(tab);
  };

  const handleInspectionClick = (insp: Inspection) => {
    if (onSelectInspection) onSelectInspection(insp);
    else if (onOpenChecklist) onOpenChecklist(insp);
    else handleNav('inspections');
  };

  const handleSiteClick = (site: Site) => {
    if (onSelectSite) onSelectSite(site);
    else handleNav('sites');
  };

  const handleIssueClick = (issue: Issue) => {
    if (onSelectIssue) onSelectIssue(issue);
    else handleNav('issues');
  };

  // KPI Calculations
  const totalSites = (sites || []).length;
  const activeSites = (sites || []).filter(s => s.status === 'Active' || s.status === 'Under Inspection').length;

  const totalInspections = (inspections || []).length;
  const pendingInspections = (inspections || []).filter(i => i.status === 'Pending').length;
  const inProgressInspections = (inspections || []).filter(i => i.status === 'In Progress').length;
  const completedInspections = (inspections || []).filter(i => i.status === 'Completed').length;
  const overdueInspections = (inspections || []).filter(i => i.status === 'Overdue').length;

  const openIssues = (issues || []).filter(i => i.status === 'Open').length;
  const inProgressIssues = (issues || []).filter(i => i.status === 'In Progress').length;
  const resolvedIssues = (issues || []).filter(i => i.status === 'Resolved' || i.status === 'Closed').length;
  const criticalIssues = (issues || []).filter(i => i.priority === 'Critical' && i.status !== 'Closed').length;

  // Compliance average
  const complianceSum = sites.reduce((acc, s) => acc + (s.complianceScore ?? 85), 0);
  const avgCompliance = totalSites > 0 ? Math.round(complianceSum / totalSites) : 0;

  // Status badge stylers
  const getSiteBadge = (status: Site['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Under Inspection':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Critical Alert':
        return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      case 'Completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Inactive':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getInspectionBadge = (status: Inspection['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getIssueBadge = (priority: Issue['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-amber-100 text-amber-900 border border-amber-200';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
              Operations Control Center
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Real-Time Site Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Continuous compliance tracking, safety verification, and immediate defect escalation.
          </p>
        </div>

        {/* Working Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {userRole !== 'VIEWER' && (
            <>
              <button
                onClick={onAddSite}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Site</span>
              </button>
              <button
                onClick={onCreateInspection}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <ClipboardCheck className="w-4 h-4 text-orange-400" />
                <span>Create Inspection</span>
              </button>
            </>
          )}
          <button
            onClick={() => handleNav('reports')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            <span>View Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {/* Total Sites */}
        <div
          onClick={() => handleNav('sites')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:border-orange-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Building2 className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Total</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{totalSites}</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">Total Sites</p>
        </div>

        {/* Active Sites */}
        <div
          onClick={() => handleNav('sites')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase text-emerald-600">Online</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{activeSites}</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">Active Sites</p>
        </div>

        {/* Total Inspections */}
        <div
          onClick={() => handleNav('inspections')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <ClipboardCheck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Audits</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{totalInspections}</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">Total Insp.</p>
        </div>

        {/* Pending Inspections */}
        <div
          onClick={() => handleNav('inspections')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase text-amber-600">Queue</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">{pendingInspections}</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">Pending Insp.</p>
        </div>

        {/* Completed Inspections */}
        <div
          onClick={() => handleNav('inspections')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase text-emerald-600">Done</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">{completedInspections}</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">Completed</p>
        </div>

        {/* Open Issues */}
        <div
          onClick={() => handleNav('issues')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <AlertOctagon className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase text-amber-600">Open</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{openIssues}</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">Open Issues</p>
        </div>

        {/* Critical Issues */}
        <div
          onClick={() => handleNav('issues')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-red-200 shadow-xs bg-red-50/30 hover:border-red-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <Flame className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase text-red-600">Urgent</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600">{criticalIssues}</div>
          <p className="text-[11px] text-red-800 font-semibold mt-0.5 truncate">Critical Issues</p>
        </div>

        {/* Compliance Percentage */}
        <div
          onClick={() => handleNav('reports')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:border-orange-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase text-orange-600">Score</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{avgCompliance}%</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">Compliance %</p>
        </div>
      </div>

      {/* Interactive Charts & Visual Breakdowns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Inspection Status & Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Inspection Progress
            </h3>
            <button
              onClick={() => handleNav('inspections')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
                </span>
                <span>{completedInspections} ({totalInspections > 0 ? Math.round((completedInspections / totalInspections) * 100) : 0}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalInspections > 0 ? (completedInspections / totalInspections) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> In Progress
                </span>
                <span>{inProgressInspections} ({totalInspections > 0 ? Math.round((inProgressInspections / totalInspections) * 100) : 0}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalInspections > 0 ? (inProgressInspections / totalInspections) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending
                </span>
                <span>{pendingInspections} ({totalInspections > 0 ? Math.round((pendingInspections / totalInspections) * 100) : 0}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalInspections > 0 ? (pendingInspections / totalInspections) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Overdue
                </span>
                <span>{overdueInspections} ({totalInspections > 0 ? Math.round((overdueInspections / totalInspections) * 100) : 0}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalInspections > 0 ? (overdueInspections / totalInspections) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Inspection Velocity</span>
            <span className="font-bold text-slate-800">
              {totalInspections > 0 ? Math.round(((completedInspections + inProgressInspections * 0.5) / totalInspections) * 100) : 0}% active
            </span>
          </div>
        </div>

        {/* Chart 2: Issue Status & Criticality Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Issue Status Breakdown
            </h3>
            <button
              onClick={() => onNavigate('issues')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View Issues</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-red-50 border border-red-100">
              <span className="text-[10px] font-bold uppercase text-red-600 tracking-wider">Critical</span>
              <div className="text-2xl font-black text-red-700 mt-1">{criticalIssues}</div>
              <span className="text-[10px] text-red-600">Immediate action</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Open</span>
              <div className="text-2xl font-black text-amber-800 mt-1">{openIssues}</div>
              <span className="text-[10px] text-amber-700">Awaiting fix</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">In Progress</span>
              <div className="text-2xl font-black text-blue-800 mt-1">{inProgressIssues}</div>
              <span className="text-[10px] text-blue-700">Remediation underway</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Resolved</span>
              <div className="text-2xl font-black text-emerald-800 mt-1">{resolvedIssues}</div>
              <span className="text-[10px] text-emerald-700">Verified & closed</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Resolution Ratio</span>
            <span className="font-bold text-emerald-700">
              {issues.length > 0 ? Math.round((resolvedIssues / issues.length) * 100) : 100}%
            </span>
          </div>
        </div>

        {/* Chart 3: Site Compliance Leaderboard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Site Compliance Rates
            </h3>
            <button
              onClick={() => onNavigate('sites')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Manage Sites</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {sites.slice(0, 4).map(site => {
              const score = site.complianceScore ?? 80;
              const color =
                score >= 90
                  ? 'bg-emerald-500'
                  : score >= 75
                  ? 'bg-blue-500'
                  : score >= 60
                  ? 'bg-amber-500'
                  : 'bg-red-500';

              return (
                <div
                  key={site.id}
                  onClick={() => onSelectSite(site)}
                  className="group cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800 truncate max-w-[170px] group-hover:text-orange-600">
                      {site.name}
                    </span>
                    <span className="font-mono font-bold text-slate-700">{score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Regulatory Threshold</span>
            <span className="font-bold text-slate-700 font-mono">≥ 80% Required</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Sites Overview & Inspection Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sites Overview Table (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Site Overview</h3>
              <p className="text-xs text-slate-500">
                Registered industrial installations and inspection status
              </p>
            </div>
            <button
              onClick={() => handleNav('sites')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All Sites</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3 px-4">Site Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4 text-center">Open Issues</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sites.map(site => {
                  const siteIssues = issues.filter(
                    i => i.siteId === site.id && (i.status === 'Open' || i.status === 'In Progress')
                  );
                  const siteInspections = inspections.filter(i => i.siteId === site.id);
                  const completedSiteInspections = siteInspections.filter(i => i.status === 'Completed').length;
                  const progressPct =
                    siteInspections.length > 0
                      ? Math.round((completedSiteInspections / siteInspections.length) * 100)
                      : 0;

                  return (
                    <tr
                      key={site.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleSiteClick(site)}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400 font-normal">
                            {site.siteId}
                          </span>
                          <span className="group-hover:text-orange-600 transition-colors">
                            {site.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{site.location}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${getSiteBadge(
                            site.status
                          )}`}
                        >
                          {site.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="w-24">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-0.5">
                            <span>{completedSiteInspections}/{siteInspections.length}</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {siteIssues.length > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            {siteIssues.length}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-orange-600 group-hover:translate-x-0.5 inline-block transition-transform font-bold text-xs">
                          Details →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspection & Recent Issues Column */}
        <div className="space-y-6">
          {/* Inspection Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Inspection Overview</h3>
              <button
                onClick={() => handleNav('inspections')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                All Inspections
              </button>
            </div>

            <div className="space-y-2.5">
              {inspections.slice(0, 3).map(insp => (
                <div
                  key={insp.id}
                  onClick={() => handleInspectionClick(insp)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-orange-300 hover:bg-orange-50/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-orange-600 line-clamp-1">
                      {insp.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border shrink-0 ${getInspectionBadge(
                        insp.status
                      )}`}
                    >
                      {insp.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{insp.siteName}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Due: {insp.dueDate}
                    </span>
                    <span className="font-bold text-slate-700 font-mono">
                      {insp.completionPercentage}% Done
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Overview & Recent Criticals */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Open Critical Issues</h3>
              <button
                onClick={() => handleNav('issues')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                All Issues
              </button>
            </div>

            <div className="space-y-2.5">
              {issues.slice(0, 3).map(issue => (
                <div
                  key={issue.id}
                  onClick={() => handleIssueClick(issue)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-red-300 hover:bg-red-50/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-red-700 line-clamp-1">
                      {issue.title}
                    </span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${getIssueBadge(
                        issue.priority
                      )}`}
                    >
                      {issue.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                    <span className="truncate max-w-[150px]">{issue.siteName}</span>
                    <span className="font-semibold text-slate-700">Status: {issue.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900">Recent Site Activity Audit Log</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Live Audit Trail</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {(activities || []).slice(0, 4).map(act => (
            <div
              key={act.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span className="uppercase tracking-wider font-mono">{act.type}</span>
                  <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{act.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{act.description}</p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-medium">
                By: <span className="font-semibold text-slate-700">{act.userName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
