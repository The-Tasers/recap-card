'use client';

import { motion } from 'framer-motion';
import { TimelineEntry } from '@/components/timeline-entry';
import { AppFooter, AppLogo } from '@/components/app-footer';
import { SettingsButton } from '@/components/settings-button';
import { SyncStatusIndicator } from '@/components/sync-status-indicator';
import { DailyCard } from '@/lib/types';
import { type SyncNotification } from '@/components/sync-provider';
import { formatDate } from '@/lib/date-utils';
import { useI18n } from '@/lib/i18n';

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
  onDismissUndo: (cardId: string) => void;
  isTodayPendingDelete?: boolean;
  pendingDeleteIds?: string[];
  isAuthenticated?: boolean;
  syncNotification?: SyncNotification;
}

export function TodayView({
  todayEntry,
  groupedEntries,
  onEdit,
  onDelete,
  onUndo,
  onDismissUndo,
  isTodayPendingDelete = false,
  pendingDeleteIds = [],
  isAuthenticated = false,
  syncNotification,
}: TodayViewProps) {
  const { language } = useI18n();
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
      className="pt-6 h-full flex flex-col"
    >
      {/* Header with logo and settings */}
      <div className="shrink-0 px-6 flex items-center justify-between">
        <div className="w-11" /> {/* Spacer for centering */}
        <AppLogo size="lg" />
        <SettingsButton isAuthenticated={isAuthenticated} />
      </div>

      {/* Date and sync status */}
      <div className="flex items-center justify-center gap-2 mt-4 mb-1.5 shrink-0 px-6">
        <span className="text-base text-muted-foreground">
          {formatDate(new Date(), language)}
        </span>
        <SyncStatusIndicator
          isAuthenticated={isAuthenticated}
          syncNotification={syncNotification}
        />
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 px-6 overflow-y-auto overflow-x-hidden py-2">
        {/* Today's entry - given prominence */}
        <TimelineEntry
          card={todayEntry}
          isToday
          onEdit={() => onEdit(todayEntry)}
          onDelete={() => onDelete(todayEntry.id)}
          onUndo={() => onUndo(todayEntry.id)}
          onDismissUndo={() => onDismissUndo(todayEntry.id)}
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
                  onDismissUndo={() => onDismissUndo(card.id)}
                  isPendingDelete={pendingDeleteIds.includes(card.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer - fixed at bottom */}
      <AppFooter className="px-6" showLogo={false} />
    </motion.div>
  );
}
