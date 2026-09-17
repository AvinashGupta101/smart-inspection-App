import React, { useState } from 'react';
import {
  ShieldAlert,
  HardHat,
  Radio,
  UserCheck,
  Bell,
  ChevronDown,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { User, UserRole, ActivityItem } from '../types';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  currentUser: User;
  onSwitchRole?: (role: UserRole) => void;
  onRoleChange?: (role: UserRole) => void;
  activities?: ActivityItem[];
  simulatedOnline?: boolean;
  isSimulating?: boolean;
  onOpenProfile?: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchRole,
  onRoleChange,
  activities = [],
  simulatedOnline,
  isSimulating,
  onOpenProfile,
  onOpenAuthModal,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isOnline = simulatedOnline ?? isSimulating ?? true;

  const handleRoleSelect = (role: UserRole) => {
    if (onRoleChange) onRoleChange(role);
    if (onSwitchRole) onSwitchRole(role);
    setShowRoleMenu(false);
  };

  const handleProfileClick = () => {
    if (onOpenAuthModal) onOpenAuthModal();
    else if (onOpenProfile) onOpenProfile();
  };

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-orange-500 text-white border-orange-600',
    INSPECTOR: 'bg-blue-600 text-white border-blue-700',
    VIEWER: 'bg-slate-700 text-white border-slate-800',
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 flex-shrink-0">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                SMART INSPECTION
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-orange-100 text-orange-800 border border-orange-200">
                PRO INDUSTRIAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide hidden sm:block">
              SMART MONITORING & INSPECTION • <span className="text-orange-600 font-semibold">Safer Sites. Smarter Decisions.</span>
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Simulated Telemetry Status Pill */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700"
            title="Telemetry Simulation Engine"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <Radio className="w-3.5 h-3.5 text-slate-500" />
            <span>Simulated Feed</span>
          </div>

          {/* Android Mobile / PWA badge */}
          <div
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium"
            title="PWA / Mobile responsive application"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mobile-First Web & Android Ready</span>
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                roleColors[currentUser.role]
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{currentUser.role}</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Test Role
                  </p>
                </div>
                {(['ADMIN', 'INSPECTOR', 'VIEWER'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 ${
                      currentUser.role === role ? 'text-orange-600 font-bold bg-orange-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          role === 'ADMIN'
                            ? 'bg-orange-500'
                            : role === 'INSPECTOR'
                            ? 'bg-blue-600'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span>{role}</span>
                    </div>
                    {currentUser.role === role && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Activity Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Activity Feed"
            >
              <Bell className="w-5 h-5" />
              {(activities?.length || 0) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-600" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live Site Activity Log
                  </span>
                  <span className="text-[10px] text-slate-500">Real-time</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {(activities?.length || 0) === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">No activity recorded yet</div>
                  ) : (
                    (activities || []).slice(0, 8).map(act => (
                      <div key={act.id} className="p-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {act.severity === 'critical' ? (
                              <Flame className="w-4 h-4 text-red-600" />
                            ) : act.severity === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">{act.title}</p>
                            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{act.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                              <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>•</span>
                              <span>{act.userName}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <UserAvatar
              user={currentUser}
              size="sm"
              className="ring-1 ring-slate-300"
            />
            <div className="text-left hidden xl:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 truncate max-w-[110px]">{currentUser.organization}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
