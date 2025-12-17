'use client';

import { motion } from 'framer-motion';
import { MoodSelector } from '@/components/mood-selector';
import { Mood } from '@/lib/types';
import { formatDate } from '@/lib/date-utils';

interface MoodSelectViewProps {
  mood: Mood | undefined;
  onMoodChange: (mood: Mood) => void;
  hasEntries: boolean;
}

export function MoodSelectView({
  mood,
  onMoodChange,
  hasEntries,
}: MoodSelectViewProps) {
  return (
    <motion.div
      key="mood-select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex-1 flex flex-col items-center justify-center"
    >
      <p className="text-center text-lg text-foreground mb-8">
        {formatDate(new Date())}
      </p>

      <h1 className="text-center text-2xl md:text-3xl font-medium text-neutral-700 dark:text-neutral-300 mb-8">
        How does today feel?
      </h1>

      <div className="py-4">
        <MoodSelector value={mood} onChange={onMoodChange} size="lg" />
      </div>

      {!hasEntries && (
        <p className="text-center text-sm text-muted-foreground mt-8">
          Your journey starts with one moment.
        </p>
      )}
    </motion.div>
  );
}
