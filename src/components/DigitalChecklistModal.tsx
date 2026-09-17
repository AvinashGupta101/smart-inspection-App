import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Save,
  Send,
  AlertTriangle,
  X,
  PlusCircle,
  Flame,
  FileCheck,
  Info,
} from 'lucide-react';
import {
  Inspection,
  ChecklistItem,
  ChecklistItemStatus,
  UserRole,
  Issue,
} from '../types';

interface DigitalChecklistModalProps {
  inspection: Inspection;
  checklistItems: ChecklistItem[];
  onSaveItems: (items: ChecklistItem[]) => void;
  onSubmitInspection: (inspection: Inspection, result: 'Pass' | 'Conditional Pass' | 'Fail', summary: string) => void;
  onCreateIssueFromChecklist: (item: ChecklistItem) => void;
  onClose: () => void;
  userRole: UserRole;
  onShowToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const DigitalChecklistModal: React.FC<DigitalChecklistModalProps> = ({
  inspection,
  checklistItems = [],
  onSaveItems,
  onSubmitInspection,
  onCreateIssueFromChecklist,
  onClose,
  userRole,
  onShowToast,
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(checklistItems || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [saveToast, setSaveToast] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [findingsSummary, setFindingsSummary] = useState(inspection?.findingsSummary || '');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Categories
  const categories = ['ALL', 'Safety', 'Electrical', 'Equipment', 'Environment'];

  // Status marking
  const handleSetStatus = (itemId: string, status: ChecklistItemStatus) => {
    if (userRole === 'VIEWER') return;
    setItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, status } : it))
    );
  };

  const handleSetRemarks = (itemId: string, remarks: string) => {
    if (userRole === 'VIEWER') return;
    setItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, remarks } : it))
    );
  };

  // Photo handling
  const handlePhotoUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (userRole === 'VIEWER') return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setItems(prev =>
        prev.map(it =>
          it.id === itemId
            ? {
                ...it,
                evidencePhotoUrl: result,
                evidencePhotoName: file.name,
              }
            : it
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (itemId: string) => {
    if (userRole === 'VIEWER') return;
    setItems(prev =>
      prev.map(it =>
        it.id === itemId
          ? {
              ...it,
              evidencePhotoUrl: undefined,
              evidencePhotoName: undefined,
            }
          : it
      )
    );
  };

  // Metrics
  const totalCount = (items || []).length;
  const passCount = (items || []).filter(it => it.status === 'Pass').length;
  const failCount = (items || []).filter(it => it.status === 'Fail').length;
  const naCount = (items || []).filter(it => it.status === 'Not Applicable').length;
  const pendingCount = (items || []).filter(it => it.status === 'Pending').length;

  const answeredCount = passCount + failCount + naCount;
  const completionPercentage = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // Filtered items
  const filteredItems = (items || []).filter(
    it => selectedCategory === 'ALL' || it.category === selectedCategory
  );

  // Save Progress
  const handleSaveProgress = () => {
    onSaveItems(items);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
    onShowToast?.('success', 'Checklist responses and evidence saved locally.');
  };

  // Submit Inspection with strict verification
  const handleSubmit = () => {
    if (userRole === 'VIEWER') {
      const msg = 'Viewer role cannot submit inspections.';
      setSubmitError(msg);
      onShowToast?.('error', msg);
      return;
    }

    if (pendingCount > 0) {
      const msg = `Cannot complete inspection: ${pendingCount} required checklist item(s) are still Pending. Mark all items before submitting.`;
      setSubmitError(msg);
      onShowToast?.('error', msg);
      return;
    }

    // Determine final result
    let finalResult: 'Pass' | 'Conditional Pass' | 'Fail' = 'Pass';
    if (failCount > 2) {
      finalResult = 'Fail';
    } else if (failCount > 0) {
      finalResult = 'Conditional Pass';
    }

    const defaultSummary =
      finalResult === 'Pass'
        ? 'All critical checkpoints passed compliance standards.'
        : `${failCount} item(s) failed inspection standards. Corrective action required.`;

    onSaveItems(items);
    onSubmitInspection(
      {
        ...inspection,
        completionPercentage: 100,
        status: 'Completed',
      },
      finalResult,
      findingsSummary.trim() || defaultSummary
    );
    onShowToast?.('success', `Inspection ${inspection.inspectionId} submitted with result: ${finalResult}.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] font-bold text-orange-400 bg-orange-950/80 border border-orange-700/50 px-2 py-0.5 rounded">
                {inspection.inspectionId}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                {inspection.type}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {inspection.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Site: <span className="font-bold text-white">{inspection.siteName}</span> • Inspector:{' '}
              <span className="font-bold text-orange-300">{inspection.inspectorName}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Quick Stats Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Completion Bar */}
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Checklist Completion</span>
                <span className="font-mono text-orange-600">{completionPercentage}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    completionPercentage === 100
                      ? 'bg-emerald-500'
                      : completionPercentage > 50
                      ? 'bg-orange-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Quick Counters */}
            <div className="flex items-center gap-2 text-xs font-bold shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{passCount} Pass</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span>{failCount} Fail</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>{naCount} N/A</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{pendingCount} Pending</span>
              </span>
            </div>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 border-b border-slate-200 overflow-x-auto bg-white">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mr-1">
            Section:
          </span>
          {categories.map(cat => {
            const catCount =
              cat === 'ALL' ? items.length : items.filter(it => it.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {catCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Validation error toast if any */}
        {submitError && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between text-xs text-red-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
            <button
              onClick={() => setSubmitError(null)}
              className="text-red-500 hover:text-red-800 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success toast */}
        {saveToast && (
          <div className="mx-4 sm:mx-6 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Inspection checklist progress successfully saved to database!</span>
          </div>
        )}

        {/* Checklist Items Scrollable List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.status === 'Fail'
                  ? 'border-red-300 bg-red-50/20 shadow-xs'
                  : item.status === 'Pass'
                  ? 'border-emerald-200 bg-emerald-50/15'
                  : item.status === 'Not Applicable'
                  ? 'border-slate-200 bg-slate-50/50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>

                {/* Status Marking Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(item.id, 'Pass')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                      item.status === 'Pass'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(item.id, 'Fail')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                      item.status === 'Fail'
                        ? 'bg-red-600 text-white border-red-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Fail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(item.id, 'Not Applicable')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                      item.status === 'Not Applicable'
                        ? 'bg-slate-700 text-white border-slate-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>N/A</span>
                  </button>
                </div>
              </div>

              {/* Remarks & Evidence Section */}
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Remarks Input */}
                <div className="md:col-span-8">
                  <input
                    type="text"
                    placeholder="Inspector remarks, specific measurements, observations..."
                    value={item.remarks}
                    disabled={userRole === 'VIEWER'}
                    onChange={e => handleSetRemarks(item.id, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                {/* Evidence Photo Upload or Preview */}
                <div className="md:col-span-4 flex items-center justify-between gap-2">
                  {item.evidencePhotoUrl ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={item.evidencePhotoUrl}
                        alt="Evidence"
                        onClick={() => setLightboxImage(item.evidencePhotoUrl!)}
                        className="w-8 h-8 rounded-md object-cover ring-1 ring-slate-300 cursor-pointer hover:opacity-80"
                      />
                      <span className="text-[11px] text-slate-500 font-mono truncate max-w-[90px]">
                        {item.evidencePhotoName || 'Photo'}
                      </span>
                      {userRole !== 'VIEWER' && (
                        <button
                          onClick={() => handleRemovePhoto(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50 text-[11px] font-bold text-slate-600 hover:text-orange-700 cursor-pointer transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Attach Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        disabled={userRole === 'VIEWER'}
                        onChange={e => handlePhotoUpload(item.id, e)}
                      />
                    </label>
                  )}

                  {/* Escalate Fail to Issue Button */}
                  {item.status === 'Fail' && userRole !== 'VIEWER' && (
                    <button
                      type="button"
                      onClick={() => onCreateIssueFromChecklist(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-xs transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Flame className="w-3 h-3" />
                      <span>Log Issue</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Findings Summary input */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Final Inspector Findings & Executive Notes
            </label>
            <textarea
              rows={2}
              placeholder="Summary of site conditions, recommended corrective deadlines, executive sign-off remarks..."
              value={findingsSummary}
              disabled={userRole === 'VIEWER'}
              onChange={e => setFindingsSummary(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              {pendingCount > 0
                ? `${pendingCount} item(s) pending. Complete all items before final submission.`
                : 'All checklist items verified. Ready for submission.'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
            >
              Close
            </button>

            {userRole !== 'VIEWER' && (
              <>
                <button
                  onClick={handleSaveProgress}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition-colors"
                >
                  <Save className="w-4 h-4 text-orange-600" />
                  <span>Save Progress</span>
                </button>

                <button
                  onClick={handleSubmit}
                  className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all active:scale-95 ${
                    pendingCount > 0
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Final Inspection</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl max-h-[80vh] relative">
            <img
              src={lightboxImage}
              alt="Evidence preview"
              className="rounded-xl max-h-[80vh] object-contain shadow-2xl"
            />
            <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              Click anywhere to close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
