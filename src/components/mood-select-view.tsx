'use client';

import { motion } from 'framer-motion';
import { MoodSelector } from '@/components/mood-selector';
import { Mood } from '@/lib/types';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[60vh] space-y-10"
    >
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center text-2xl md:text-3xl font-medium text-neutral-700 dark:text-neutral-300"
      >
        How does today feel?
      </motion.h1>

      <MoodSelector value={mood} onChange={onMoodChange} size="lg" />

      {!hasEntries && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-muted-foreground"
        >
          Your journey starts with one moment.
        </motion.p>
      )}
    </motion.div>
  );
}
