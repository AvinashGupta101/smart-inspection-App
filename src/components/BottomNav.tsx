import React from 'react';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  AlertOctagon,
  FileBarChart,
  User,
} from 'lucide-react';
import { AppTab, User as UserType } from '../types';
import { UserAvatar } from './UserAvatar';

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  openIssuesCount: number;
  pendingInspectionsCount: number;
  currentUser?: UserType;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  openIssuesCount,
  pendingInspectionsCount,
  currentUser,
}) => {
  const items = [
    { id: 'dashboard' as AppTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sites' as AppTab, label: 'Sites', icon: Building2 },
    {
      id: 'inspections' as AppTab,
      label: 'Inspections',
      icon: ClipboardCheck,
      badge: pendingInspectionsCount > 0 ? pendingInspectionsCount : undefined,
    },
    {
      id: 'issues' as AppTab,
      label: 'Issues',
      icon: AlertOctagon,
      badge: openIssuesCount > 0 ? openIssuesCount : undefined,
    },
    { id: 'reports' as AppTab, label: 'Reports', icon: FileBarChart },
    { id: 'profile' as AppTab, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 md:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-lg">
      <div className="grid grid-cols-6 h-16 items-center px-1">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 relative transition-all ${
                isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {item.id === 'profile' && currentUser ? (
                  <UserAvatar
                    user={currentUser}
                    size="xs"
                    className={`ring-1 transition-all ${
                      isActive ? 'ring-orange-600 scale-105' : 'ring-slate-300'
                    }`}
                  />
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                )}
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-orange-600 text-white text-[9px] font-extrabold flex items-center justify-center ring-1 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-orange-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
