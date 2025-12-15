'use client';

import Link from 'next/link';
import { User, Settings, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useCardStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ThemeToggle } from './theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface UserMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserMenuSheet({ open, onOpenChange }: UserMenuSheetProps) {
  const { user, signOut, loading } = useAuth();
  const { userName } = useCardStore();

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-safe">
        <SheetHeader className="sr-only">
          <SheetTitle>Account Menu</SheetTitle>
        </SheetHeader>

        {/* User Info Header */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'h-12 w-12 rounded-full flex items-center justify-center shrink-0',
              user ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-neutral-200 dark:bg-neutral-700'
            )}>
              {user && initials ? (
                <span className="text-base font-semibold text-amber-700 dark:text-amber-300">
                  {initials}
                </span>
              ) : (
                <User className={cn(
                  'h-6 w-6',
                  user ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500 dark:text-neutral-400'
                )} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {user ? (userName || 'User') : 'Guest'}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                {user ? user.email : 'Sign in to sync'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-3 pb-2 space-y-1">
          {/* Theme Toggle Row */}
          <div className="flex items-center justify-between h-11 px-3 rounded-xl">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Theme
            </span>
            <ThemeToggle size="sm" variant="compact" />
          </div>

          <Link
            href="/settings"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 w-full h-11 px-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>

          {user ? (
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="flex items-center gap-3 w-full h-11 px-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 w-full h-11 px-3 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <LogIn className="h-5 w-5" />
              Sign In
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
