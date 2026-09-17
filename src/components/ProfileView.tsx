import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  Building,
  Mail,
  Phone,
  Award,
  Smartphone,
  CheckCircle2,
  Lock,
  Save,
  Clock,
  Fingerprint,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { User } from '../types';
import { UserAvatar } from './UserAvatar';
import { ProfilePhotoUploader } from './ProfilePhotoUploader';

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onOpenAuthModal,
  onLogout,
  onShowToast,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [organization, setOrganization] = useState(currentUser.organization);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setPhone(currentUser.phone || '');
    setOrganization(currentUser.organization);
  }, [currentUser]);

  const handlePhotoUpdated = (newPhotoUrl: string, firebaseUid?: string) => {
    onUpdateUser({
      ...currentUser,
      avatarUrl: newPhotoUrl,
      ...(firebaseUid ? { firebaseUid } : {}),
    });
  };

  const handlePhotoRemoved = () => {
    onUpdateUser({
      ...currentUser,
      avatarUrl: '',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name,
      email,
      phone,
      organization,
    });
    setSaveSuccess(true);
    onShowToast?.('success', 'Profile credentials updated and saved to local storage.');
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      onOpenAuthModal();
    }
    onShowToast?.('info', 'Logged out. Please authenticate or select an active user.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            user={currentUser}
            size="xl"
            className="ring-2 ring-orange-500/30 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{currentUser.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 uppercase">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.organization}</p>
            <span className="text-[11px] font-mono text-slate-400">ID: {currentUser.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenAuthModal}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Switch Profile</span>
          </button>
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Cloud Photo Uploader Component */}
      <ProfilePhotoUploader
        currentUser={currentUser}
        onPhotoUpdated={handlePhotoUpdated}
        onPhotoRemoved={handlePhotoRemoved}
        onShowToast={onShowToast}
      />

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile records updated and synced with local storage engine.</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-orange-600" />
          <span>Operator Credentials & Contact</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Enterprise</label>
              <input
                type="text"
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Field Telephone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Industrial Certifications Block */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-600" />
          <span>Active Field Certifications</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900">OSHA 30-Hour General Industry</div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Verified • Valid thru 2028</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900">NFPA 70E Arc Flash Safety</div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Certified • Level 3</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900">ISO 45001 Lead Auditor</div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Accredited Assessor</span>
          </div>
        </div>
      </div>

      {/* Platform & Mobile Web Architecture Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
          <Smartphone className="w-4 h-4" />
          <span>Application Platform Information</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-bold block">Engine</span>
            <span className="font-bold text-white">Smart Inspection v2.4</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-bold block">Platform</span>
            <span className="font-bold text-white">Mobile Web / PWA</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-bold block">Camera Mode</span>
            <span className="font-bold text-emerald-400">Environment Active</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-bold block">Offline Mode</span>
            <span className="font-bold text-white">Local Cache Enabled</span>
          </div>
        </div>
      </div>

      {/* Account Session Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Session & Security</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Log out of the current operational terminal or switch to another team member profile.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAuthModal}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            Switch Account
          </button>
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Sign Out of Field Session?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are currently signed in as <span className="font-bold text-slate-800">{currentUser.name}</span> ({currentUser.role}). Unsaved form drafts may be lost.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-colors"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
