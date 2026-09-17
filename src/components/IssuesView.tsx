import React, { useState } from 'react';
import {
  AlertOctagon,
  Plus,
  Search,
  Filter,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  UserCheck,
  Camera,
  MessageSquare,
  Send,
  X,
  Edit2,
  ChevronRight,
  Upload,
  Trash2,
  ShieldAlert,
  ArrowLeft,
  Check,
} from 'lucide-react';
import {
  Issue,
  IssueCategory,
  IssuePriority,
  IssueStatus,
  PriorityLevel,
  Site,
  Inspection,
  User,
  UserRole,
} from '../types';

interface IssuesViewProps {
  issues?: Issue[];
  sites?: Site[];
  inspections?: Inspection[];
  users?: User[];
  currentUser: User;
  onAddIssue: (issue: Issue) => void;
  onUpdateIssue: (issue: Issue) => void;
  onDeleteIssue?: (issueId: string) => void;
  onShowToast?: (type: 'success' | 'error' | 'info', message: string) => void;
  userRole?: UserRole;
  preFilledItem?: {
    title: string;
    description: string;
    siteId: string;
    siteName: string;
    inspectionId: string;
    inspectionTitle: string;
    checklistItemId: string;
    category: IssueCategory;
    evidenceUrl?: string;
  } | null;
  onClearPreFilledItem?: () => void;
}

export const IssuesView: React.FC<IssuesViewProps> = ({
  issues = [],
  sites = [],
  inspections = [],
  users = [],
  currentUser,
  onAddIssue,
  onUpdateIssue,
  onDeleteIssue,
  onShowToast,
  userRole = 'ADMIN',
  preFilledItem,
  onClearPreFilledItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(!!preFilledItem);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [activeIssueDetail, setActiveIssueDetail] = useState<Issue | null>(null);
  const [issueToDelete, setIssueToDelete] = useState<Issue | null>(null);

  // Comment input
  const [newCommentText, setNewCommentText] = useState('');

  // Form State
  const [formTitle, setFormTitle] = useState(preFilledItem?.title || '');
  const [formDescription, setFormDescription] = useState(preFilledItem?.description || '');
  const [formSiteId, setFormSiteId] = useState(preFilledItem?.siteId || sites[0]?.id || '');
  const [formInspectionId, setFormInspectionId] = useState(preFilledItem?.inspectionId || '');
  const [formCategory, setFormCategory] = useState<IssueCategory>(preFilledItem?.category || 'Safety');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('High');
  const [formAssignedTo, setFormAssignedTo] = useState(users[1]?.id || users[0]?.id || '');
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [formEvidenceUrl, setFormEvidenceUrl] = useState<string | undefined>(
    preFilledItem?.evidenceUrl
  );
  const [formEvidenceName, setFormEvidenceName] = useState<string | undefined>(
    preFilledItem?.evidenceUrl ? 'flaw_evidence.jpg' : undefined
  );

  const openCreateModal = () => {
    setFormTitle('');
    setFormDescription('');
    setFormSiteId(sites[0]?.id || '');
    setFormInspectionId('');
    setFormCategory('Safety');
    setFormPriority('High');
    setFormAssignedTo(users[1]?.id || users[0]?.id || '');
    setFormDueDate(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
    setFormEvidenceUrl(undefined);
    setFormEvidenceName(undefined);
    setEditingIssue(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (issue: Issue, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormTitle(issue.title);
    setFormDescription(issue.description);
    setFormSiteId(issue.siteId);
    setFormInspectionId(issue.relatedInspectionId || '');
    setFormCategory(issue.category);
    setFormPriority(issue.priority);
    setFormAssignedTo(issue.assignedTo);
    setFormDueDate(issue.dueDate);
    setFormEvidenceUrl(issue.evidenceUrl);
    setFormEvidenceName(issue.evidenceName);
    setEditingIssue(issue);
    setIsCreateModalOpen(true);
  };

  const handleSaveIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onShowToast?.('error', 'Issue title is required.');
      return;
    }

    const selectedSite = sites.find(s => s.id === formSiteId);
    const selectedInspection = inspections.find(i => i.id === formInspectionId);
    const assignedUser = users.find(u => u.id === formAssignedTo);

    if (editingIssue) {
      const updated: Issue = {
        ...editingIssue,
        title: formTitle,
        description: formDescription,
        siteId: formSiteId,
        siteName: selectedSite?.name || editingIssue.siteName,
        relatedInspectionId: formInspectionId || undefined,
        relatedInspectionTitle: selectedInspection?.title || undefined,
        category: formCategory,
        priority: formPriority,
        assignedTo: formAssignedTo,
        assignedToName: assignedUser?.name || editingIssue.assignedToName,
        dueDate: formDueDate,
        evidenceUrl: formEvidenceUrl,
        evidenceName: formEvidenceName,
      };

      onUpdateIssue(updated);
      if (activeIssueDetail?.id === updated.id) {
        setActiveIssueDetail(updated);
      }
      onShowToast?.('success', `Issue ${updated.issueId} updated successfully.`);
    } else {
      const newIssue: Issue = {
        id: `iss-${Date.now()}`,
        issueId: `ISS-${Math.floor(100 + Math.random() * 900)}`,
        title: formTitle,
        description: formDescription,
        siteId: formSiteId,
        siteName: selectedSite?.name || 'Unknown Site',
        relatedInspectionId: formInspectionId || undefined,
        relatedInspectionTitle: selectedInspection?.title || undefined,
        relatedChecklistItemId: preFilledItem?.checklistItemId,
        category: formCategory,
        priority: formPriority,
        status: 'Open',
        assignedTo: formAssignedTo,
        assignedToName: assignedUser?.name || 'Unassigned',
        dueDate: formDueDate,
        createdAt: new Date().toISOString(),
        evidenceUrl: formEvidenceUrl,
        evidenceName: formEvidenceName,
        comments: [],
      };

      onAddIssue(newIssue);
      onShowToast?.('success', `Hazard issue ${newIssue.issueId} logged successfully.`);
    }

    setIsCreateModalOpen(false);
    setEditingIssue(null);
    if (onClearPreFilledItem) onClearPreFilledItem();
  };

  const handleStatusChange = (issue: Issue, newStatus: IssueStatus) => {
    if (userRole === 'VIEWER') return;

    const updated: Issue = {
      ...issue,
      status: newStatus,
      resolvedAt:
        newStatus === 'Resolved' && !issue.resolvedAt
          ? new Date().toISOString()
          : issue.resolvedAt,
      closedAt:
        newStatus === 'Closed' && !issue.closedAt
          ? new Date().toISOString()
          : issue.closedAt,
    };

    // Auto-log comment for audit trail
    updated.comments = [
      ...(updated.comments || []),
      {
        id: `comm-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        role: currentUser.role,
        text: `Status shifted to ${newStatus}.`,
        createdAt: new Date().toISOString(),
      },
    ];

    onUpdateIssue(updated);
    if (activeIssueDetail?.id === issue.id) {
      setActiveIssueDetail(updated);
    }
    onShowToast?.('success', `Issue ${issue.issueId} marked as ${newStatus}.`);
  };

  const handleQuickAssign = (issue: Issue, newUserId: string) => {
    if (userRole === 'VIEWER') return;
    const targetUser = users.find(u => u.id === newUserId);
    if (!targetUser) return;

    const updated: Issue = {
      ...issue,
      assignedTo: targetUser.id,
      assignedToName: targetUser.name,
      comments: [
        ...(issue.comments || []),
        {
          id: `comm-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          role: currentUser.role,
          text: `Re-assigned issue to ${targetUser.name} (${targetUser.role}).`,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    onUpdateIssue(updated);
    if (activeIssueDetail?.id === issue.id) {
      setActiveIssueDetail(updated);
    }
    onShowToast?.('success', `Issue reassigned to ${targetUser.name}.`);
  };

  const handleMarkResolved = (issue: Issue) => {
    handleStatusChange(issue, 'Resolved');
  };

  const handleRequestDelete = (issue: Issue, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (userRole === 'VIEWER') return;
    setIssueToDelete(issue);
  };

  const handleConfirmDelete = () => {
    if (!issueToDelete) return;
    if (onDeleteIssue) onDeleteIssue(issueToDelete.id);
    if (activeIssueDetail?.id === issueToDelete.id) {
      setActiveIssueDetail(null);
    }
    onShowToast?.('success', `Issue ${issueToDelete.issueId} deleted.`);
    setIssueToDelete(null);
  };

  const handleAddComment = (issue: Issue) => {
    if (!newCommentText.trim() || userRole === 'VIEWER') return;

    const comment = {
      id: `comm-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated: Issue = {
      ...issue,
      comments: [...(issue.comments || []), comment],
    };

    onUpdateIssue(updated);
    setActiveIssueDetail(updated);
    setNewCommentText('');
    onShowToast?.('success', 'Comment posted to audit trail.');
  };

  const handleUploadEvidence = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormEvidenceUrl(reader.result as string);
      setFormEvidenceName(file.name);
      onShowToast?.('info', `Attached photographic evidence: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Filters
  const filtered = issues.filter(iss => {
    const matchesSearch =
      iss.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iss.issueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iss.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iss.assignedToName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || iss.status === statusFilter;
    const matchesCat = categoryFilter === 'ALL' || iss.category === categoryFilter;
    const matchesPri = priorityFilter === 'ALL' || iss.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCat && matchesPri;
  });

  const getPriorityStyle = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-300';
    }
  };

  const getStatusStyle = (status: IssueStatus) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Closed':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Open':
      default:
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Hazard & Defect Tracking
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track corrective action requests (CAR), monitor OSHA non-compliances, and verify remediation progress.
          </p>
        </div>

        {userRole !== 'VIEWER' && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Report Defect</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, keyword, assignee..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
            >
              <option value="ALL">All Statuses ({issues.length})</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="Safety">Safety</option>
              <option value="Electrical">Electrical</option>
              <option value="Equipment">Equipment</option>
              <option value="Construction">Construction</option>
              <option value="Quality">Quality</option>
              <option value="Environment">Environment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Quick Filter:</span>
          <button
            onClick={() => setStatusFilter('Open')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
              statusFilter === 'Open'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-800 hover:bg-red-100'
            }`}
          >
            Open ({issues.filter(i => i.status === 'Open').length})
          </button>
          <button
            onClick={() => setStatusFilter('In Progress')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
              statusFilter === 'In Progress'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            In Progress ({issues.filter(i => i.status === 'In Progress').length})
          </button>
          <button
            onClick={() => setStatusFilter('Resolved')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
              statusFilter === 'Resolved'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Resolved ({issues.filter(i => i.status === 'Resolved').length})
          </button>
          {(searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className="text-xs text-red-600 hover:underline font-bold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Issues Card Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Defects Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No tracked issues match the current filter selection. Adjust your parameters or create a defect report.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setCategoryFilter('ALL');
              setPriorityFilter('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(issue => (
            <div
              key={issue.id}
              onClick={() => setActiveIssueDetail(issue)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {issue.issueId}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${getPriorityStyle(
                        issue.priority
                      )}`}
                    >
                      {issue.priority}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(
                      issue.status
                    )}`}
                  >
                    {issue.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
                  {issue.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {issue.description}
                </p>

                <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{issue.siteName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-600">
                      <UserCheck className="w-3 h-3 text-orange-600" />
                      <span className="truncate max-w-[120px]">{issue.assignedToName}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {issue.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Strip */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {(issue.comments || []).length}
                  </span>
                  {issue.evidenceUrl && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Camera className="w-3.5 h-3.5" />
                      Photo
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {userRole !== 'VIEWER' && (
                    <>
                      <button
                        onClick={e => openEditModal(issue, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                        title="Edit Issue"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => handleRequestDelete(issue, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete Issue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <span className="text-xs font-bold text-red-600 flex items-center gap-0.5 ml-1">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Issue Detail Modal */}
      {activeIssueDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {activeIssueDetail.issueId}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${getPriorityStyle(
                      activeIssueDetail.priority
                    )}`}
                  >
                    {activeIssueDetail.priority}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusStyle(
                      activeIssueDetail.status
                    )}`}
                  >
                    {activeIssueDetail.status}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {activeIssueDetail.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeIssueDetail.siteName}</span>
                  <span>•</span>
                  <span>Category: <strong>{activeIssueDetail.category}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-1">
                {userRole !== 'VIEWER' && (
                  <button
                    onClick={e => openEditModal(activeIssueDetail, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                    title="Edit Issue"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setActiveIssueDetail(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* One-Click Resolution Strip */}
              {userRole !== 'VIEWER' && activeIssueDetail.status !== 'Resolved' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">Remediation Completed?</h4>
                      <p className="text-[11px] text-emerald-700">Mark this defect as resolved once repairs have been inspected.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkResolved(activeIssueDetail)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                </div>
              )}

              {/* Lifecycle and Assignee Management */}
              {userRole !== 'VIEWER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {/* Status update */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Defect Lifecycle Status
                    </label>
                    <select
                      value={activeIssueDetail.status}
                      onChange={e => handleStatusChange(activeIssueDetail, e.target.value as IssueStatus)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {/* Assign to */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Assigned Responsible Party
                    </label>
                    <select
                      value={activeIssueDetail.assignedTo}
                      onChange={e => handleQuickAssign(activeIssueDetail, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Defect Description & Hazard Details
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                  {activeIssueDetail.description}
                </p>
              </div>

              {/* Photographic Evidence */}
              {activeIssueDetail.evidenceUrl && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Photographic Inspection Evidence
                  </h4>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={activeIssueDetail.evidenceUrl}
                      alt="Evidence"
                      className="rounded-lg max-h-60 w-full object-cover shadow-xs"
                    />
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      {activeIssueDetail.evidenceName || 'defect_evidence.jpg'}
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Comments & Audit Discussion */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Remediation Discussion & Activity Log ({(activeIssueDetail.comments || []).length})
                </h4>

                <div className="space-y-2 mb-3">
                  {(activeIssueDetail.comments || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-100">
                      No remarks added yet. Post notes on parts ordered or repair status.
                    </p>
                  ) : (
                    (activeIssueDetail.comments || []).map(comm => (
                      <div
                        key={comm.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{comm.userName}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 uppercase">
                              {comm.role}
                            </span>
                          </span>
                          <span className="font-mono text-[10px]">
                            {new Date(comm.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{comm.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Post New Comment */}
                {userRole !== 'VIEWER' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add an update on repairs, contractors or parts..."
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddComment(activeIssueDetail);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                    <button
                      onClick={() => handleAddComment(activeIssueDetail)}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {userRole !== 'VIEWER' ? (
                <button
                  onClick={() => handleRequestDelete(activeIssueDetail)}
                  className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => setActiveIssueDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Issue Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-900">
                {editingIssue ? 'Edit Defect / Hazard Issue' : 'Log Defect / Hazard Issue'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingIssue(null);
                  if (onClearPreFilledItem) onClearPreFilledItem();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIssue} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Defect Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exposed 480V Cable in Pump Room 3"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Industrial Facility *
                  </label>
                  <select
                    value={formSiteId}
                    onChange={e => setFormSiteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white"
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.siteId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Related Inspection Order
                  </label>
                  <select
                    value={formInspectionId}
                    onChange={e => setFormInspectionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white"
                  >
                    <option value="">-- Standalone Hazard --</option>
                    {inspections.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.inspectionId} - {i.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as IssueCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white"
                  >
                    <option value="Safety">Safety Violation</option>
                    <option value="Electrical">Electrical Hazard</option>
                    <option value="Equipment">Equipment Defect</option>
                    <option value="Construction">Structural Integrity</option>
                    <option value="Quality">Quality Standard</option>
                    <option value="Environment">Environmental / Spill</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Severity Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white font-bold"
                  >
                    <option value="Critical">Critical (Immediate Stop Work)</option>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Responsible Party *
                  </label>
                  <select
                    value={formAssignedTo}
                    onChange={e => setFormAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Remediation Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={e => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Defect Description & Safety Impact *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain exact location, equipment tag, danger to workers, and containment..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              {/* Photographic Evidence Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photographic Evidence (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 hover:border-red-500 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>Attach Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadEvidence}
                      className="hidden"
                    />
                  </label>

                  {formEvidenceUrl && (
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{formEvidenceName || 'Evidence Attached'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormEvidenceUrl(undefined);
                          setFormEvidenceName(undefined);
                        }}
                        className="text-red-500 hover:underline text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingIssue(null);
                    if (onClearPreFilledItem) onClearPreFilledItem();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all"
                >
                  {editingIssue ? 'Save Issue' : 'Submit Defect Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {issueToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Delete Defect Report?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">{issueToDelete.issueId}</span> ({issueToDelete.title})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIssueToDelete(null)}
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
