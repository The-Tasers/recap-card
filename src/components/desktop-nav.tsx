'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  CalendarDays,
  LayoutDashboard,
  PencilLine,
  Settings,
  LogOut,
  LogIn,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DayCountdown } from '@/app/page';
import { useCardStore } from '@/lib/store';
import { useAuth } from '@/components/auth-provider';
import { getTodayRecap } from '@/lib/daily-utils';
import { CreateSheet } from './create-sheet';
import { ThemeToggle } from './theme-toggle';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DesktopNav() {
  const { cards, userName } = useCardStore();
  const { user, signOut, loading } = useAuth();
  const hasCards = cards.length > 0;
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const hasRecapToday = hasCards ? !!getTodayRecap(cards) : false;
  const pathname = usePathname();

  // Hide on welcome page and auth pages
  if (
    pathname === '/welcome' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth')
  ) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
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
    <nav className="hidden lg:flex lg:overflow-hidden lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:border-r lg:border-neutral-200 dark:lg:border-neutral-800 lg:bg-white dark:lg:bg-neutral-900 lg:p-6 lg:z-40 lg:w-64">
      {/* Logo */}
      <div className="mb-6 overflow-hidden">
        <Link href="/">
          <h1 className="relative text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight inline-block">
            RECAP
            <span className="text-amber-500 absolute -right-1 -z-1">P</span>
          </h1>
        </Link>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-tight">
          Notice your day, one moment at a time
        </p>
      </div>

      {/* Navigation Section - Create + Links grouped at top */}
      <div className="space-y-2 mb-8 flex-1">
        <DayCountdown hasRecapToday={hasRecapToday} />

        {/* Create Button - Primary CTA */}
        <button
          onClick={() => setIsCreateSheetOpen(true)}
          className="flex gap-2 h-12 cursor-pointer w-full items-center rounded-xl font-semibold transition-all bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 hover:shadow-md hover:shadow-amber-500/25 px-4"
        >
          <PencilLine className="h-5 w-5 stroke-[2.5px]" />
          <span>Capture Today</span>
        </button>

        <Link
          href="/"
          className={cn(
            'flex items-center mt-10 gap-3 rounded-xl transition-all h-12 px-4',
            pathname === '/'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
          )}
        >
          <LayoutDashboard className="h-5 w-5 stroke-2" />
          <span>Today</span>
        </Link>

        <Link
          href="/timeline"
          className={cn(
            'flex items-center gap-3 rounded-xl transition-all h-12 px-4',
            pathname === '/timeline'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
          )}
        >
          <CalendarDays className="h-5 w-5 stroke-2" />
          <span>Your Days</span>
        </Link>
      </div>

      {/* User Section at Bottom */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                user ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-neutral-200 dark:bg-neutral-700'
              )}>
                {user && initials ? (
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    {initials}
                  </span>
                ) : (
                  <User className={cn(
                    'h-5 w-5',
                    user ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500 dark:text-neutral-400'
                  )} />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {user ? (userName || 'User') : 'Guest'}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {user ? user.email : 'Sign in to sync'}
                </p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="w-56 p-0 rounded-xl overflow-hidden mb-2"
            sideOffset={8}
          >
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
                onClick={() => setIsUserMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-sm transition-colors',
                  pathname === '/settings'
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
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
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Create Sheet */}
      <CreateSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
      />
    </nav>
  );
}
