'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, CalendarDays, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const isCreatePage =
    pathname === '/create' ||
    (pathname.startsWith('/card/') && pathname.endsWith('/edit'));

  return (
    <nav className="fixed bottom-0 left-0 right-0 pb-safe z-50 pointer-events-none">
      <div className="max-w-sm mx-auto px-8 pb-6">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-lg shadow-black/10 dark:shadow-black/40 border border-neutral-200/80 dark:border-neutral-700/50 pointer-events-auto">
          <div className="flex items-center justify-between h-16 px-2">
            {/* Home */}
            <Link
              href="/"
              className={cn(
                'flex items-center justify-center gap-2 h-12 px-4 rounded-2xl transition-all duration-200',
                pathname === '/'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              <Home className="h-5 w-5 stroke-2" />
              {pathname === '/' && (
                <span className="text-sm font-semibold">Home</span>
              )}
            </Link>

            {/* Timeline */}
            <Link
              href="/timeline"
              className={cn(
                'flex items-center justify-center gap-2 h-12 px-4 rounded-2xl transition-all duration-200',
                pathname === '/timeline'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              <CalendarDays className="h-5 w-5 stroke-2" />
              {pathname === '/timeline' && (
                <span className="text-sm font-semibold">Timeline</span>
              )}
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              className={cn(
                'flex items-center justify-center gap-2 h-12 px-4 rounded-2xl transition-all duration-200',
                pathname === '/settings'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              <Settings className="h-5 w-5 stroke-2" />
              {pathname === '/settings' && (
                <span className="text-sm font-semibold">Settings</span>
              )}
            </Link>

            {/* Create Button - FAB on the right */}
            <Link
              href="/create"
              className={cn(
                'flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-200 ml-1',
                isCreatePage
                  ? 'bg-linear-to-br from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-500/20'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/40 hover:shadow-lg hover:shadow-amber-500/50'
              )}
            >
              <Plus className="h-6 w-6 stroke-[2.5px]" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
