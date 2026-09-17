import React, { useState } from 'react';
import {
  Settings,
  Database,
  RotateCcw,
  Download,
  Upload,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  CloudOff,
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface SettingsViewProps {
  onResetDatabase: () => void;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetDatabase,
  onRefreshData,
}) => {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Safety threshold settings
  const [maxTemp, setMaxTemp] = useState('42.0');
  const [maxVibration, setMaxVibration] = useState('4.5');
  const [maxNoise, setMaxNoise] = useState('85.0');
  const [maxGas, setMaxGas] = useState('20.0');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      'smart_inspection_thresholds',
      JSON.stringify({
        maxTemp: parseFloat(maxTemp),
        maxVibration: parseFloat(maxVibration),
        maxNoise: parseFloat(maxNoise),
        maxGas: parseFloat(maxGas),
      })
    );
    showToast('Industrial safety threshold parameters updated.');
  };

  const handleExportDatabase = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      sites: StorageService.getSites(),
      inspections: StorageService.getInspections(),
      checklistItems: StorageService.getChecklistItems(),
      issues: StorageService.getIssues(),
      users: StorageService.getUsers(),
      activities: StorageService.getActivities(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute(
      'download',
      `SmartInspection_Backup_${new Date().toISOString().split('T')[0]}.json`
    );
    dlAnchorElem.click();
    showToast('Full system backup archive exported as JSON.');
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.sites && json.inspections && json.issues) {
          StorageService.saveSites(json.sites);
          StorageService.saveInspections(json.inspections);
          StorageService.saveChecklistItems(json.checklistItems || []);
          StorageService.saveIssues(json.issues);
          if (json.users) StorageService.saveUsers(json.users);
          onRefreshData();
          showToast('Database successfully restored from JSON backup archive!');
        } else {
          showToast('Invalid backup file schema.');
        }
      } catch (err) {
        showToast('Error reading backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteReset = () => {
    onResetDatabase();
    setResetConfirm(false);
    showToast('Database reset to clean factory defaults with industrial seed data.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            System Settings & Data Governance
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure alarm thresholds, manage offline database persistence, and perform verified system backups.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cloud & Firebase Connection Status Notice */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <CloudOff className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Cloud Sync (Firebase) Connection Status</span>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            Not Connected • Local Engine Active
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Cloud backend synchronization (Firebase / Cloud Firestore) is currently not connected. The application is operating in fully autonomous offline-first mode: all sites, inspections, checklist proofs, and defect logs are safely persisted to your local browser storage engine and will remain intact across page reloads.
        </p>
      </div>

      {/* Safety Alarm Thresholds */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Sliders className="w-4 h-4 text-orange-600" />
          <span>Industrial Telemetry Alert Limits</span>
        </div>
        <p className="text-xs text-slate-500">
          Automatic escalation triggers for temperature, mechanical vibration, acoustic noise, and VOC gas thresholds.
        </p>

        <form onSubmit={handleSaveThresholds} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Max Motor Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={maxTemp}
                onChange={e => setMaxTemp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
              <span className="text-[10px] text-slate-400">Default: 42.0°C</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Max Vibration Velocity (mm/s ISO 10816)
              </label>
              <input
                type="number"
                step="0.1"
                value={maxVibration}
                onChange={e => setMaxVibration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
              <span className="text-[10px] text-slate-400">Default: 4.5 mm/s</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Acoustic Noise Limit (dB OSHA)
              </label>
              <input
                type="number"
                step="0.5"
                value={maxNoise}
                onChange={e => setMaxNoise(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
              <span className="text-[10px] text-slate-400">Default: 85.0 dB</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                VOC Gas Alarm Threshold (ppm)
              </label>
              <input
                type="number"
                step="1"
                value={maxGas}
                onChange={e => setMaxGas(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
              <span className="text-[10px] text-slate-400">Default: 20 ppm</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all"
            >
              Update Alarm Limits
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Data Migration */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Database className="w-4 h-4 text-orange-600" />
          <span>Local Storage Persistence & Migration</span>
        </div>
        <p className="text-xs text-slate-500">
          Export current inspections, sites, and checklists to an offline JSON file, or restore from a previous archive.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportDatabase}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Backup Archive (JSON)</span>
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Restore From JSON</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportDatabase}
            />
          </label>
        </div>
      </div>

      {/* Database Factory Reset */}
      <div className="bg-red-50/50 rounded-2xl border border-red-200 p-6 space-y-3">
        <div className="flex items-center gap-2 text-red-900 font-bold text-base">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Factory Database Re-seed</span>
        </div>
        <p className="text-xs text-red-700 leading-relaxed">
          Reset local storage back to fresh initial seed data. This will reload the 3 default sites, standardized checklists, inspections, and defect logs.
        </p>

        {resetConfirm ? (
          <div className="p-4 bg-white rounded-xl border border-red-300 space-y-3">
            <p className="text-xs font-bold text-slate-900">
              Are you sure you want to re-seed? Any newly added sites or photos will be reset.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExecuteReset}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Yes, Reset All Data
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Database</span>
          </button>
        )}
      </div>
    </div>
  );
};
