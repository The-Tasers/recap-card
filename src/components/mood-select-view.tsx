'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MoodSelector } from '@/components/mood-selector';
import { AppFooter } from '@/components/app-footer';
import { SyncStatusIndicator } from '@/components/sync-status-indicator';
import { TimelineEntry } from '@/components/timeline-entry';
import { DailyCard, Mood, MOODS } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';
import { type SyncNotification } from '@/components/sync-provider';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CardGroup {
  label: string;
  cards: DailyCard[];
}

interface MoodSelectViewProps {
  mood: Mood | undefined;
  onMoodChange: (mood: Mood) => void;
  hasEntries: boolean;
  isAuthenticated?: boolean;
  syncNotification?: SyncNotification;
  groupedEntries?: CardGroup[];
  onEdit?: (card: DailyCard) => void;
  onDelete?: (cardId: string) => void;
  onUndo?: (cardId: string) => void;
  onDismissUndo?: (cardId: string) => void;
  pendingDeleteIds?: string[];
}

export function MoodSelectView({
  mood,
  onMoodChange,
  hasEntries,
  isAuthenticated = false,
  syncNotification,
  groupedEntries = [],
  onEdit,
  onDelete,
  onUndo,
  onDismissUndo,
  pendingDeleteIds = [],
}: MoodSelectViewProps) {
  // Track highlighted mood for keyboard navigation (-1 means no highlight until user presses arrow)
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasUsedKeyboard, setHasUsedKeyboard] = useState(false);
  const [showPastEntries, setShowPastEntries] = useState(false);

  // Flatten all entries into a single timeline
  const allPastEntries = groupedEntries.flatMap((group) => group.cards);

  // Arrow keys to navigate, Enter to select
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!hasUsedKeyboard) {
          // First arrow press - start at neutral and move left
          setHasUsedKeyboard(true);
          setHighlightedIndex(Math.max(0, 2 - 1)); // Start from neutral, go left
        } else {
          setHighlightedIndex((prev) => Math.max(0, prev - 1));
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!hasUsedKeyboard) {
          // First arrow press - start at neutral and move right
          setHasUsedKeyboard(true);
          setHighlightedIndex(Math.min(MOODS.length - 1, 2 + 1)); // Start from neutral, go right
        } else {
          setHighlightedIndex((prev) => Math.min(MOODS.length - 1, prev + 1));
        }
      } else if (
        e.key === 'Enter' &&
        hasUsedKeyboard &&
        highlightedIndex >= 0
      ) {
        e.preventDefault();
        const moodValue = MOODS[highlightedIndex]?.value;
        if (moodValue) {
          onMoodChange(moodValue);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMoodChange, highlightedIndex, hasUsedKeyboard]);

  // When showing past entries, render a scrollable view
  if (showPastEntries && allPastEntries.length > 0) {
    return (
      <motion.div
        key="past-entries"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex-1 flex flex-col pt-8"
      >
        {/* Header with back button - fixed */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <button
            onClick={() => setShowPastEntries(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronUp className="h-4 w-4" />
            Back to today
          </button>
          <SyncStatusIndicator
            isAuthenticated={isAuthenticated}
            syncNotification={syncNotification}
          />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-y-auto py-2">
          <div className="space-y-1">
            {allPastEntries.map((card) => (
              <TimelineEntry
                key={card.id}
                card={card}
                onEdit={() => onEdit?.(card)}
                onDelete={() => onDelete?.(card.id)}
                onUndo={() => onUndo?.(card.id)}
                onDismissUndo={() => onDismissUndo?.(card.id)}
                isPendingDelete={pendingDeleteIds.includes(card.id)}
              />
            ))}
          </div>
        </div>

        {/* Footer - fixed at bottom */}
        <AppFooter />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="mood-select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex-1 flex flex-col h-full"
    >
      {/* Centered content area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <p className="text-lg text-foreground">{formatDate(new Date())}</p>
          <SyncStatusIndicator
            isAuthenticated={isAuthenticated}
            syncNotification={syncNotification}
          />
        </div>

        <h1 className="text-center text-2xl md:text-3xl font-medium text-neutral-700 dark:text-neutral-300 mb-8">
          How does today feel?
        </h1>

        <div className="py-4">
          <MoodSelector
            value={mood}
            onChange={onMoodChange}
            size="lg"
            highlightedIndex={highlightedIndex}
          />
        </div>

        {!hasEntries && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            Pick a mood to start your first recap.
          </p>
        )}

        {/* View past entries button */}
        {hasEntries && allPastEntries.length > 0 && (
          <button
            onClick={() => setShowPastEntries(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-8"
          >
            <ChevronDown className="h-4 w-4" />
            View {allPastEntries.length} past {allPastEntries.length === 1 ? 'recap' : 'recaps'}
          </button>
        )}
      </div>

      {/* Footer */}
      <AppFooter />
    </motion.div>
  );
}
