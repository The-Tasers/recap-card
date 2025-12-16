'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { TodayCard, StreamCard } from '@/components/recap-cards';
import { DailyCard } from '@/lib/types';

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
}

export function TodayView({
  todayEntry,
  groupedEntries,
  pastEntriesCount,
  onEdit,
  onDelete,
}: TodayViewProps) {
  return (
    <motion.div
      key="today"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <TodayCard
        card={todayEntry}
        onEdit={() => onEdit(todayEntry)}
        onDelete={() => onDelete(todayEntry.id)}
      />

      {/* Scroll hint */}
      {pastEntriesCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center text-muted-foreground"
        >
          <ChevronDown className="h-5 w-5 animate-bounce" />
          <span className="text-xs">scroll for past days</span>
        </motion.div>
      )}

      {/* Memory Stream */}
      {groupedEntries.length > 0 && (
        <div className="space-y-6 pt-4">
          {groupedEntries.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">
                {group.label}
              </p>
              <div className="space-y-3">
                {group.cards.map((card) => (
                  <StreamCard
                    key={card.id}
                    card={card}
                    onEdit={() => onEdit(card)}
                    onDelete={() => onDelete(card.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
