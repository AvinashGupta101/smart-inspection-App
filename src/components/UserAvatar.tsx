import React, { useState } from 'react';
import { User, HardHat } from 'lucide-react';

export interface UserAvatarProps {
  user?: {
    name?: string;
    avatarUrl?: string;
    role?: string;
    email?: string;
  } | null;
  name?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showRoleBadge?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px] rounded-md',
  sm: 'w-8 h-8 text-xs rounded-lg',
  md: 'w-10 h-10 text-sm rounded-xl',
  lg: 'w-14 h-14 text-base rounded-xl',
  xl: 'w-20 h-20 text-xl rounded-2xl',
  '2xl': 'w-28 h-28 text-3xl rounded-3xl',
};

const ICON_SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
  '2xl': 'w-14 h-14',
};

// Generates stable consistent color palette based on name
function getAvatarBgColor(name?: string): string {
  if (!name) return 'bg-slate-800 text-slate-200 border-slate-700';
  const colors = [
    'bg-slate-800 text-orange-400 border-slate-700',
    'bg-zinc-800 text-amber-400 border-zinc-700',
    'bg-stone-800 text-emerald-400 border-stone-700',
    'bg-neutral-800 text-sky-400 border-neutral-700',
    'bg-slate-900 text-white border-slate-800',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  name: explicitName,
  avatarUrl: explicitAvatarUrl,
  size = 'md',
  className = '',
}) => {
  const displayName = explicitName || user?.name || 'User';
  const photoUrl = explicitAvatarUrl !== undefined ? explicitAvatarUrl : user?.avatarUrl;
  const [imageError, setImageError] = useState(false);

  // If photo is valid and has not error-loaded
  const hasPhoto = Boolean(photoUrl && photoUrl.trim() && !imageError);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const iconSizeClass = ICON_SIZES[size] || ICON_SIZES.md;
  const initials = getInitials(displayName);
  const colorClass = getAvatarBgColor(displayName);

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none overflow-hidden ${sizeClass} ${className}`}
      title={displayName}
    >
      {hasPhoto ? (
        <img
          src={photoUrl}
          alt={displayName}
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      ) : (
        /* Default Avatar with Industrial Styling and Initials / Icon */
        <div
          className={`w-full h-full flex flex-col items-center justify-center font-bold tracking-wider border shadow-xs ${colorClass}`}
        >
          {initials ? (
            <span>{initials}</span>
          ) : (
            <HardHat className={iconSizeClass} />
          )}
        </div>
      )}
    </div>
  );
};
