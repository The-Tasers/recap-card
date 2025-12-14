'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, CalendarDays, PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateSheet } from './create-sheet';

export function BottomNav() {
  const pathname = usePathname();
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  // Hide bottom nav on card detail, edit pages, and welcome page
  const shouldHide =
    pathname === '/welcome' ||
    (pathname.startsWith('/card/') && pathname.endsWith('/edit')) ||
    (pathname.startsWith('/card/') && !pathname.endsWith('/edit'));

  if (shouldHide) return null;

  const handleCreateClick = () => {
    setIsCreateSheetOpen(true);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 pb-safe z-50 pointer-events-none">
        <div className="max-w-md mx-auto px-6 pb-6">
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-black/10 dark:shadow-black/40 border border-neutral-200/80 dark:border-neutral-700/50 pointer-events-auto">
            <div className="flex items-center justify-between h-16 px-4">
              {/* Left: Nav buttons */}
              <div className="flex items-center gap-1">
                {/* Home */}
                <Link
                  href="/"
                  className={cn(
                    'flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-200',
                    pathname === '/'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  )}
                >
                  <Home className="h-5 w-5 stroke-[2.5px]" />
                </Link>

                {/* Timeline */}
                <Link
                  href="/timeline"
                  className={cn(
                    'flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-200',
                    pathname === '/timeline'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  )}
                >
                  <CalendarDays className="h-5 w-5 stroke-[2.5px]" />
                </Link>

                {/* Settings */}
                <Link
                  href="/settings"
                  className={cn(
                    'flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-200',
                    pathname === '/settings'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  )}
                >
                  <Settings className="h-5 w-5 stroke-[2.5px]" />
                </Link>
              </div>

              {/* Right: Create button */}
              <button
                onClick={handleCreateClick}
                className="flex items-center justify-center h-12 w-12 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/40 hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Capture today"
              >
                <PencilLine className="h-5 w-5 stroke-[2.5px]" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <CreateSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
      />
    </>
  );
}
