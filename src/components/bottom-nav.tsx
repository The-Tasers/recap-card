'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, Search, CalendarDays, NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const isCreatePage = pathname === '/create' || pathname.startsWith('/card/') && pathname.endsWith('/edit');

  return (
    <nav className="fixed bottom-0 left-0 right-0 pb-6 z-50 pointer-events-none">
      <div className="max-w-md mx-auto px-6">
        <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xl rounded-full shadow-lg shadow-black/10 dark:shadow-black/30 border border-neutral-200/50 dark:border-neutral-700/50 pointer-events-auto relative">
          <div className="flex justify-around items-center h-16 px-2">
            {/* Home */}
            <Link
              href="/"
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full transition-colors duration-200 flex-1',
                pathname === '/'
                  ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-700/50'
              )}
            >
              <Home className="h-5 w-5 stroke-2" />
              <span className="text-[10px] font-semibold">Home</span>
            </Link>

            {/* Search */}
            <Link
              href="/search"
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full transition-colors duration-200 flex-1',
                pathname === '/search'
                  ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-700/50'
              )}
            >
              <Search className="h-5 w-5 stroke-2" />
              <span className="text-[10px] font-semibold">Search</span>
            </Link>

            {/* Recap Button - Center (Floating) */}
            <div className="flex-1 flex justify-center">
              <Link
                href="/create"
                className="flex flex-col items-center justify-center -mt-8"
              >
                <div className={cn(
                  'rounded-full p-4 shadow-xl transition-all duration-200',
                  isCreatePage
                    ? 'bg-linear-to-r from-amber-500 to-orange-500 shadow-orange-400/40'
                    : 'bg-linear-to-r from-amber-500/95 to-orange-500/95 hover:from-amber-500 hover:to-orange-500 shadow-orange-400/30 hover:shadow-orange-400/50'
                )}>
                  <NotebookPen className="h-6 w-6 text-white stroke-[2.5px]" />
                </div>
                <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 mt-1">Recap</span>
              </Link>
            </div>

            {/* Timeline */}
            <Link
              href="/timeline"
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full transition-colors duration-200 flex-1',
                pathname === '/timeline'
                  ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-700/50'
              )}
            >
              <CalendarDays className="h-5 w-5 stroke-2" />
              <span className="text-[10px] font-semibold">Timeline</span>
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full transition-colors duration-200 flex-1',
                pathname === '/settings'
                  ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-700/50'
              )}
            >
              <Settings className="h-5 w-5 stroke-2" />
              <span className="text-[10px] font-semibold">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
