import React from 'react';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  AlertOctagon,
  FileBarChart,
  Radio,
  Users,
  Settings,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { AppTab, UserRole, User as UserType } from '../types';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  openIssuesCount: number;
  criticalIssuesCount: number;
  pendingInspectionsCount: number;
  onLogout: () => void;
  userRole: UserRole;
  currentUser?: UserType;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  openIssuesCount,
  criticalIssuesCount,
  pendingInspectionsCount,
  onLogout,
  userRole,
  currentUser,
}) => {
  const mainNavItems = [
    { id: 'dashboard' as AppTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sites' as AppTab, label: 'Sites', icon: Building2 },
    {
      id: 'inspections' as AppTab,
      label: 'Inspections',
      icon: ClipboardCheck,
      badge: pendingInspectionsCount > 0 ? pendingInspectionsCount : undefined,
      badgeColor: 'bg-orange-100 text-orange-800',
    },
    {
      id: 'issues' as AppTab,
      label: 'Issues & Defects',
      icon: AlertOctagon,
      badge: openIssuesCount > 0 ? openIssuesCount : undefined,
      badgeColor: criticalIssuesCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-800',
    },
    { id: 'reports' as AppTab, label: 'Reports', icon: FileBarChart },
    {
      id: 'monitoring' as AppTab,
      label: 'Live Monitoring',
      icon: Radio,
      badge: 'SIM',
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
  ];

  const adminItems = [
    { id: 'users' as AppTab, label: 'Users & Roles', icon: Users },
    { id: 'settings' as AppTab, label: 'Settings & Data', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-col justify-between hidden md:flex shrink-0 h-[calc(100vh-4rem)] sticky top-16 border-r border-slate-800">
      {/* Upper Navigation */}
      <div className="p-4 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Operations
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v1.0.1</span>
          </div>
          <nav className="space-y-1">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white text-orange-700' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Management
            </span>
          </div>
          <nav className="space-y-1">
            {adminItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Industrial Compliance Badge */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center gap-2 text-orange-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wide">ISO 45001 & OSHA</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Industrial workplace safety & continuous compliance verification standard.
          </p>
        </div>
      </div>

      {/* Bottom Profile / Logout */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={() => onSelectTab('profile')}
          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs transition-colors ${
            activeTab === 'profile'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <UserAvatar user={currentUser} size="sm" />
          <div className="flex-1 min-w-0 text-left">
            <p className="font-bold truncate text-xs leading-tight">
              {currentUser?.name || 'My Profile'}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
              {currentUser?.role || 'Operator'}
            </p>
          </div>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
