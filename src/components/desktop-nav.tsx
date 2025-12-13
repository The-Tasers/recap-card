'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Settings,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  PencilLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './layout-wrapper';
import { Button } from './ui/button';
import { DayCountdown } from '@/app/page';
import { useCardStore } from '@/lib/store';
import { getTodayRecap } from '@/lib/daily-utils';
import { CreateSheet } from './create-sheet';

export function DesktopNav() {
  const { cards } = useCardStore();
  const hasCards = cards.length > 0;
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  const hasRecapToday = hasCards ? !!getTodayRecap(cards) : false;
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <nav
      className={cn(
        'hidden lg:flex lg:overflow-hidden lg:flex-col  lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:border-r lg:border-neutral-200 dark:lg:border-neutral-800 lg:bg-white dark:lg:bg-neutral-900 lg:p-6 lg:z-40',
        isCollapsed ? 'lg:w-20 sidebar-collapsed lg:items-center' : 'lg:w-64'
      )}
    >
      {/* Logo */}
      <div className="mb-6 overflow-hidden">
        {!isCollapsed ? (
          <>
            <Link href="/">
              <h1 className="relative text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight inline-block">
                RECAP
                <span className="text-amber-500 absolute -right-1 -z-1">P</span>
              </h1>
            </Link>

            <p className="text-xs truncate text-neutral-500 dark:text-neutral-400 mt-1">
              Your daily mindfulness companion
            </p>
          </>
        ) : (
          <>
            <Link href="/">
              <h1 className="relative text-3xl font-black text-neutral-900 min-w-8 dark:text-neutral-100 tracking-tight text-center inline-block">
                P
                <span className="text-amber-500 absolute right-0.5 -z-1">
                  P
                </span>
              </h1>
            </Link>
            <p className="text-xs truncate text-neutral-500 dark:text-neutral-400 mt-1">
              {'\u00A0'}
            </p>
          </>
        )}
      </div>

      {/* Navigation Section - Create + Links grouped at top */}
      <div className="space-y-2 mb-8 flex-1">
        {!isCollapsed && <DayCountdown hasRecapToday={hasRecapToday} />}

        {/* Create Button - Primary CTA (hide on settings page) */}

        <button
          onClick={() => setIsCreateSheetOpen(true)}
          className={cn(
            'flex gap-2 h-12 cursor-pointer w-full items-center rounded-xl font-semibold transition-all',
            'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/40 hover:shadow-lg hover:shadow-amber-500/50',
            isCollapsed ? 'w-12 p-0 mx-auto justify-center' : 'px-4'
          )}
        >
          <PencilLine className="h-5 w-5 stroke-[2.5px]" />
          {!isCollapsed && <span>New Recap</span>}
        </button>

        <Link
          href="/"
          className={cn(
            'flex items-center mt-10 gap-3 rounded-xl transition-all',
            pathname === '/'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white',
            isCollapsed ? 'h-12 w-12 mx-auto justify-center' : 'h-12 px-4'
          )}
          title={isCollapsed ? 'Timeline' : ''}
        >
          <LayoutDashboard className="h-5 w-5 stroke-2" />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        <Link
          href="/timeline"
          className={cn(
            'flex items-center gap-3 rounded-xl transition-all',
            pathname === '/timeline'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white',
            isCollapsed ? 'h-12 w-12 mx-auto justify-center' : 'h-12 px-4'
          )}
          title={isCollapsed ? 'Timeline' : ''}
        >
          <CalendarDays className="h-5 w-5 stroke-2" />
          {!isCollapsed && <span>Timeline</span>}
        </Link>

        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-xl transition-all',
            pathname === '/settings'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white',
            isCollapsed ? 'h-12 w-12 mx-auto justify-center' : 'h-12 px-4'
          )}
          title={isCollapsed ? 'Settings' : ''}
        >
          <Settings className="h-5 w-5 stroke-2" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </div>

      {/* Footer with Collapse Toggle */}
      <div
        className={cn(
          'pt-4 border-t border-neutral-200 dark:border-neutral-800',
          isCollapsed
            ? 'flex justify-center'
            : 'flex items-center justify-between'
        )}
      >
        {!isCollapsed && (
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            Version 0.0.1
          </p>
        )}
        <Button
          variant="ghost"
          className="size-10"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Create Sheet */}
      <CreateSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
      />
    </nav>
  );
}
