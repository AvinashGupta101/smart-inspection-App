import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  UserCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronRight,
  X,
  FileText,
  Percent,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  Inspection,
  InspectionType,
  InspectionStatus,
  PriorityLevel,
  Site,
  User,
  UserRole,
} from '../types';

interface InspectionsViewProps {
  inspections?: Inspection[];
  sites?: Site[];
  users?: User[];
  onAddInspection: (inspection: Inspection) => void;
  onUpdateInspection?: (inspection: Inspection) => void;
  onDeleteInspection?: (inspectionId: string) => void;
  onOpenChecklist: (inspection: Inspection) => void;
  onShowToast?: (type: 'success' | 'error' | 'info', message: string) => void;
  userRole?: UserRole;
  preSelectedSite?: Site | null;
  onClearPreSelectedSite?: () => void;
}

export const InspectionsView: React.FC<InspectionsViewProps> = ({
  inspections = [],
  sites = [],
  users = [],
  onAddInspection,
  onUpdateInspection,
  onDeleteInspection,
  onOpenChecklist,
  onShowToast,
  userRole = 'ADMIN',
  preSelectedSite,
  onClearPreSelectedSite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(!!preSelectedSite);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
  const [inspectionToDelete, setInspectionToDelete] = useState<Inspection | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSiteId, setFormSiteId] = useState(preSelectedSite?.id || sites[0]?.id || '');
  const [formInspectorId, setFormInspectorId] = useState(
    (users || []).find(u => u.role === 'INSPECTOR')?.id || (users || [])[0]?.id || ''
  );
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [formType, setFormType] = useState<InspectionType>('Safety Inspection');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('High');
  const [formStatus, setFormStatus] = useState<InspectionStatus>('Pending');
  const [formDescription, setFormDescription] = useState('');

  const inspectors = users.filter(u => u.role === 'INSPECTOR' || u.role === 'ADMIN');

  const openCreateModal = () => {
    setFormTitle('');
    setFormSiteId(preSelectedSite?.id || sites[0]?.id || '');
    setFormInspectorId(inspectors[0]?.id || '');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setFormType('Safety Inspection');
    setFormPriority('High');
    setFormStatus('Pending');
    setFormDescription('');
    setEditingInspection(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (insp: Inspection, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormTitle(insp.title);
    setFormSiteId(insp.siteId);
    setFormInspectorId(insp.inspectorId);
    setFormDate(insp.date);
    setFormDueDate(insp.dueDate);
    setFormType(insp.type);
    setFormPriority(insp.priority);
    setFormStatus(insp.status);
    setFormDescription(insp.description || '');
    setEditingInspection(insp);
    setIsAddModalOpen(true);
  };

  const handleSaveInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const selectedSite = sites.find(s => s.id === formSiteId);
    const selectedInspector = users.find(u => u.id === formInspectorId);

    if (editingInspection) {
      const updated: Inspection = {
        ...editingInspection,
        title: formTitle,
        siteId: formSiteId,
        siteName: selectedSite?.name || editingInspection.siteName,
        inspectorId: formInspectorId,
        inspectorName: selectedInspector?.name || editingInspection.inspectorName,
        date: formDate,
        dueDate: formDueDate,
        type: formType,
        priority: formPriority,
        status: formStatus,
        description: formDescription,
      };
      if (onUpdateInspection) onUpdateInspection(updated);
      onShowToast?.('success', `Inspection ${updated.inspectionId} updated successfully.`);
    } else {
      const newInsp: Inspection = {
        id: `insp-${Date.now()}`,
        inspectionId: `INSP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        title: formTitle,
        siteId: formSiteId,
        siteName: selectedSite?.name || 'Unknown Site',
        inspectorId: formInspectorId,
        inspectorName: selectedInspector?.name || 'Unassigned',
        date: formDate,
        dueDate: formDueDate,
        type: formType,
        status: 'Pending',
        priority: formPriority,
        description: formDescription,
        completionPercentage: 0,
      };

      onAddInspection(newInsp);
      onShowToast?.('success', `Inspection ${newInsp.inspectionId} scheduled successfully.`);
    }

    setIsAddModalOpen(false);
    setEditingInspection(null);
    if (onClearPreSelectedSite) onClearPreSelectedSite();
  };

  const handleRequestDelete = (insp: Inspection, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (userRole === 'VIEWER') return;
    setInspectionToDelete(insp);
  };

  const handleConfirmDelete = () => {
    if (!inspectionToDelete) return;
    if (onDeleteInspection) onDeleteInspection(inspectionToDelete.id);
    onShowToast?.('success', `Inspection ${inspectionToDelete.inspectionId} deleted.`);
    setInspectionToDelete(null);
  };

  // Filtered Inspections
  const filtered = (inspections || []).filter(insp => {
    const matchesSearch =
      insp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.inspectionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insp.inspectorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || insp.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || insp.type === typeFilter;
    const matchesPriority = priorityFilter === 'ALL' || insp.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusBadge = (status: InspectionStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Site Inspection Work Orders
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conduct verified industrial audits, execute standard digital checklists, and log defects in real-time.
          </p>
        </div>

        {userRole !== 'VIEWER' && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Inspection</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, site, inspector..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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
              <option value="ALL">All Statuses ({inspections.length})</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
            >
              <option value="ALL">All Inspection Types</option>
              <option value="Safety Inspection">Safety Inspection</option>
              <option value="Electrical Inspection">Electrical Inspection</option>
              <option value="Equipment Inspection">Equipment Inspection</option>
              <option value="Construction Inspection">Construction Inspection</option>
              <option value="Quality Inspection">Quality Inspection</option>
              <option value="Environmental Inspection">Environmental Inspection</option>
              <option value="Routine Inspection">Routine Inspection</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Counts */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Showing {filtered.length} inspections:</span>
          <button
            onClick={() => setStatusFilter('Pending')}
            className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
              statusFilter === 'Pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pending: {inspections.filter(i => i.status === 'Pending').length}
          </button>
          <button
            onClick={() => setStatusFilter('In Progress')}
            className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
              statusFilter === 'In Progress'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            In Progress: {inspections.filter(i => i.status === 'In Progress').length}
          </button>
          <button
            onClick={() => setStatusFilter('Completed')}
            className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
              statusFilter === 'Completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Completed: {inspections.filter(i => i.status === 'Completed').length}
          </button>
          {(searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className="text-xs text-orange-600 hover:underline font-bold ml-auto"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Inspections List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Inspections Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No work orders match the current filter selection. Adjust parameters or create a new inspection.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setTypeFilter('ALL');
              setPriorityFilter('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(insp => (
            <div
              key={insp.id}
              onClick={() => onOpenChecklist(insp)}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-orange-400 hover:shadow-md transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {insp.inspectionId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                      insp.status
                    )}`}
                  >
                    {insp.status}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${getPriorityBadge(
                      insp.priority
                    )}`}
                  >
                    {insp.priority}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">• {insp.type}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {insp.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {insp.siteName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                    {insp.inspectorName}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Due: {insp.dueDate}
                  </span>
                </div>

                {insp.description && (
                  <p className="text-xs text-slate-600 line-clamp-1">{insp.description}</p>
                )}
              </div>

              {/* Right Side: Completion Gauge & Action Buttons */}
              <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="w-28 sm:w-32">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500 text-[11px]">Checklist</span>
                    <span className="font-mono text-slate-800">{insp.completionPercentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        insp.completionPercentage === 100
                          ? 'bg-emerald-500'
                          : insp.completionPercentage > 50
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${insp.completionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {userRole !== 'VIEWER' && (
                    <>
                      <button
                        onClick={e => openEditModal(insp, e)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Edit Inspection"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => handleRequestDelete(insp, e)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Inspection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenChecklist(insp)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 group-hover:bg-orange-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    <span>Checklist</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Inspection Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-900">
                {editingInspection ? 'Edit Inspection Work Order' : 'Schedule Site Inspection'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingInspection(null);
                  if (onClearPreSelectedSite) onClearPreSelectedSite();
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInspection} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inspection Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arc Flash Boundary & Substation Thermal Scan"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Industrial Site *
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
                    Assigned Lead Inspector *
                  </label>
                  <select
                    value={formInspectorId}
                    onChange={e => setFormInspectorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white"
                  >
                    {inspectors.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inspection Scope
                  </label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as InspectionType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white"
                  >
                    <option value="Safety Inspection">Safety Inspection</option>
                    <option value="Electrical Inspection">Electrical Inspection</option>
                    <option value="Equipment Inspection">Equipment Inspection</option>
                    <option value="Construction Inspection">Construction Inspection</option>
                    <option value="Quality Inspection">Quality Inspection</option>
                    <option value="Environmental Inspection">Environmental Inspection</option>
                    <option value="Routine Inspection">Routine Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority Rating
                  </label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white font-bold"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {editingInspection && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as InspectionStatus)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white font-bold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scheduled Start Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Completion Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={e => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scope of Inspection & Special Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Specific test criteria, lockout-tagout requirements, PPE class..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingInspection(null);
                    if (onClearPreSelectedSite) onClearPreSelectedSite();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all"
                >
                  {editingInspection ? 'Save Inspection' : 'Schedule Inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {inspectionToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Delete Inspection Order?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">{inspectionToDelete.inspectionId}</span> ({inspectionToDelete.title})? This will also remove all associated checklist answers.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setInspectionToDelete(null)}
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
