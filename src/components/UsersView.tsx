import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  X,
  UserCheck,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { UserAvatar } from './UserAvatar';

interface UsersViewProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: User) => void;
  onSelectUser: (user: User) => void;
  userRole: UserRole;
  onShowToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onAddUser,
  onSelectUser,
  userRole,
  onShowToast,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('INSPECTOR');
  const [organization, setOrganization] = useState(currentUser.organization || 'Apex Industrial Corp');
  const [phone, setPhone] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      onShowToast?.('error', 'Name and corporate email are required.');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      organization,
      phone,
      active: true,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    };

    onAddUser(newUser);
    onShowToast?.('success', `Team member ${newUser.name} (${newUser.role}) added successfully.`);
    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'INSPECTOR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VIEWER':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              User Directory & Role Permissions
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enforce role-based access control (RBAC): Administrators, Certified Field Inspectors, and Read-Only Auditors.
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {/* Permissions Guide Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-orange-600 font-bold text-sm mb-1">
            <Shield className="w-4 h-4" />
            <span>ADMINISTRATOR</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Full operational governance. Register/delete sites, schedule all audits, resolve defects, and export regulatory reports.
          </p>
          <span className="text-[11px] font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded">
            Full Read & Write Access
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-1">
            <UserCheck className="w-4 h-4" />
            <span>CERTIFIED INSPECTOR</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Execute digital checklists, record photos, log defect work orders, and submit compliance scores on site.
          </p>
          <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
            Checklists & Defect Execution
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>AUDITOR / VIEWER</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Client or regulatory auditor overview. Read-only access to view completed audits, KPIs, and reports.
          </p>
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            Read-Only Inspection Access
          </span>
        </div>
      </div>

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(user => {
          const isCurrent = user.id === currentUser.id;

          return (
            <div
              key={user.id}
              className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                  : 'border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      user={user}
                      size="lg"
                      className="ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-600 text-white uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{user.organization}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active Account
                </span>

                {!isCurrent && (
                  <button
                    onClick={() => {
                      onSelectUser(user);
                      onShowToast?.('info', `Switched active user to ${user.name} (${user.role}).`);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                  >
                    Switch to this User
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-900">Add Team Member</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="alex.mercer@apexindustrial.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">System Role *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white font-bold"
                >
                  <option value="ADMIN">ADMIN (Full Access)</option>
                  <option value="INSPECTOR">INSPECTOR (Audits & Checklists)</option>
                  <option value="VIEWER">VIEWER (Read-Only Auditor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
