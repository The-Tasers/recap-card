'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useCardStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ThemeToggle } from './theme-toggle';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export function UserAvatar({ size = 'md', showName = false, className }: UserAvatarProps) {
  const { user, signOut, loading } = useAuth();
  const { userName } = useCardStore();
  const [open, setOpen] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    toast.success('Signed out', {
      description: 'You have been signed out successfully.',
    });
  };

  // Get initials from name or email
  const getInitials = () => {
    if (userName) {
      return userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return null;
  };

  const initials = getInitials();

  const AvatarButton = (
    <button
      className={cn(
        'flex items-center gap-2 rounded-full transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
        className
      )}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center transition-colors',
          sizeClasses[size],
          user
            ? 'bg-amber-100 dark:bg-amber-900/50'
            : 'bg-neutral-200 dark:bg-neutral-700'
        )}
      >
        {user && initials ? (
          <span className={cn(
            'font-semibold text-amber-700 dark:text-amber-300',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {initials}
          </span>
        ) : (
          <User
            className={cn(
              iconSizes[size],
              user
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-neutral-500 dark:text-neutral-400'
            )}
          />
        )}
      </div>
      {showName && (
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hidden lg:block">
          {userName || user?.email?.split('@')[0] || 'Guest'}
        </span>
      )}
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {AvatarButton}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 p-0 rounded-xl overflow-hidden"
        sideOffset={8}
      >
        {/* User Info Header */}
        <div className="px-3 pt-3 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
              user ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-neutral-200 dark:bg-neutral-700'
            )}>
              {user && initials ? (
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  {initials}
                </span>
              ) : (
                <User className={cn(
                  'h-4 w-4',
                  user ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500 dark:text-neutral-400'
                )} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {user ? (userName || 'User') : 'Guest'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {user ? user.email : 'Sign in to sync'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-1.5">
          {/* Theme Toggle Row */}
          <div className="flex items-center justify-between h-9 px-2.5 rounded-lg mb-1">
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Theme</span>
            <ThemeToggle size="sm" variant="compact" />
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-700 my-1.5" />

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>

          {user ? (
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
