'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MoodSelector } from '@/components/mood-selector';
import { SyncStatusIndicator } from '@/components/sync-status-indicator';
import { Mood, MOODS } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';
import { type SyncNotification } from '@/components/sync-provider';

interface MoodSelectViewProps {
  mood: Mood | undefined;
  onMoodChange: (mood: Mood) => void;
  hasEntries: boolean;
  isAuthenticated?: boolean;
  syncNotification?: SyncNotification;
}

export function MoodSelectView({
  mood,
  onMoodChange,
  hasEntries,
  isAuthenticated = false,
  syncNotification,
}: MoodSelectViewProps) {
  // Track highlighted mood for keyboard navigation (-1 means no highlight until user presses arrow)
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasUsedKeyboard, setHasUsedKeyboard] = useState(false);

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
      } else if (e.key === 'Enter' && hasUsedKeyboard && highlightedIndex >= 0) {
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

  return (
    <motion.div
      key="mood-select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex-1 flex flex-col items-center justify-center"
    >
      <p className="text-xs font-bold tracking-widest uppercase mb-3">
        <span className="text-emerald-500">R</span>
        <span className="text-green-500">e</span>
        <span className="text-amber-500">c</span>
        <span className="text-orange-500">a</span>
        <span className="text-red-500">p</span>
        <span className="text-primary">z</span>
      </p>
      <div className="flex items-center justify-center gap-3 mb-8">
        <p className="text-lg text-foreground">{formatDate(new Date())}</p>
        <SyncStatusIndicator isAuthenticated={isAuthenticated} syncNotification={syncNotification} />
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
          Your journey starts with one moment.
        </p>
      )}
    </motion.div>
  );
}
