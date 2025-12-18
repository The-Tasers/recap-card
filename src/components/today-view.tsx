'use client';

import { motion } from 'framer-motion';
import { TimelineEntry } from '@/components/timeline-entry';
import { SyncStatusIndicator } from '@/components/sync-status-indicator';
import { DailyCard } from '@/lib/types';
import { type SyncNotification } from '@/components/sync-provider';

interface CardGroup {
  label: string;
  cards: DailyCard[];
}

interface TodayViewProps {
  todayEntry: DailyCard;
  groupedEntries: CardGroup[];
  pastEntriesCount: number;
  onEdit: (card: DailyCard) => void;
  onDelete: (cardId: string) => void;
  onUndo: (cardId: string) => void;
  isTodayPendingDelete?: boolean;
  isAuthenticated?: boolean;
  syncNotification?: SyncNotification;
}

export function TodayView({
  todayEntry,
  groupedEntries,
  onEdit,
  onDelete,
  onUndo,
  isTodayPendingDelete = false,
  isAuthenticated = false,
  syncNotification,
}: TodayViewProps) {
  // Flatten all entries into a single timeline
  const allPastEntries = groupedEntries.flatMap((group) => group.cards);

  return (
    <motion.div
      key="today"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, position: 'relative' as const }}
      exit={{
        opacity: 0,
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
      }}
      transition={{ duration: 0.15 }}
      className="pt-8 md:pt-12 pb-16"
    >
      {/* App name and sync status */}
      <p className="text-xs font-bold tracking-widest uppercase text-center mb-2">
        <span className="text-emerald-500">R</span>
        <span className="text-green-500">e</span>
        <span className="text-amber-500">c</span>
        <span className="text-orange-500">a</span>
        <span className="text-red-500">p</span>
        <span className="text-primary">z</span>
      </p>
      <SyncStatusIndicator
        isAuthenticated={isAuthenticated}
        syncNotification={syncNotification}
        className="justify-center mb-4"
      />

      {/* Today's entry - given prominence */}
      <TimelineEntry
        card={todayEntry}
        isToday
        onEdit={() => onEdit(todayEntry)}
        onDelete={() => onDelete(todayEntry.id)}
        onUndo={() => onUndo(todayEntry.id)}
        isPendingDelete={isTodayPendingDelete}
      />

      {/* Past entries - continuous flow */}
      {allPastEntries.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border/30">
          <div className="space-y-1">
            {allPastEntries.map((card) => (
              <TimelineEntry
                key={card.id}
                card={card}
                onEdit={() => onEdit(card)}
                onDelete={() => onDelete(card.id)}
                onUndo={() => onUndo(card.id)}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
