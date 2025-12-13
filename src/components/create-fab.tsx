'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateSheet } from './create-sheet';
import { useCardStore } from '@/lib/store';

export function CreateFAB() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { cards, hydrated } = useCardStore();

  // Check if today's recap already exists
  const hasTodaysRecap = () => {
    if (!hydrated) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return cards.some((card) => {
      const cardDate = new Date(card.createdAt);
      return cardDate >= today && cardDate < tomorrow;
    });
  };

  // Hide FAB on create/edit/card detail pages or if today's recap exists
  const shouldHide =
    pathname === '/create' ||
    (pathname.startsWith('/card/') && pathname.endsWith('/edit')) ||
    (pathname.startsWith('/card/') && !pathname.endsWith('/edit')) || // Single card detail page
    hasTodaysRecap();

  if (shouldHide) return null;

  return (
    <>
      <div className="lg:hidden fixed bottom-24 left-0 right-0 z-40 pointer-events-none">
        <div className="max-w-md mx-auto px-6 flex justify-end">
          <button
            onClick={() => setIsSheetOpen(true)}
            className={cn(
              'pointer-events-auto',
              'flex items-center justify-center h-14 w-14 rounded-2xl',
              'bg-linear-to-br from-amber-400 to-orange-500',
              'text-white shadow-lg shadow-amber-500/40',
              'hover:shadow-xl hover:shadow-amber-500/50',
              'transition-all duration-200',
              'hover:scale-105 active:scale-95'
            )}
            aria-label="Create new recap"
          >
            <PencilLine className="h-6 w-6 stroke-[2.5px]" />
          </button>
        </div>
      </div>

      <CreateSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
