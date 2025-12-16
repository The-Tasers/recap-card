'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { MoodSelector } from '@/components/mood-selector';
import { Mood, DailyCard } from '@/lib/types';

// Format date nicely
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

interface FormHeaderProps {
  isVisible: boolean;
  editingCard: DailyCard | null;
  mood: Mood | undefined;
  editMood: Mood | undefined;
  onBack: () => void;
  onMoodChange: (mood: Mood) => void;
}

export function FormHeader({
  isVisible,
  editingCard,
  mood,
  editMood,
  onBack,
  onMoodChange,
}: FormHeaderProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative sticky top-0 z-40"
        >
          <div className="max-w-lg mx-auto pt-8 px-6 space-y-3 bg-background">
            {/* Back button and date row */}
            <div className="relative flex items-center">
              <motion.button
                onClick={() => {
                  window.scrollTo(0, 0);
                  onBack();
                }}
                className="absolute top-0 h-full flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back</span>
              </motion.button>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-center text-foreground w-full"
              >
                {editingCard
                  ? new Date(editingCard.createdAt).toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      }
                    )
                  : formatDate(new Date())}
              </motion.p>
            </div>
            {/* Mood selector */}
            <MoodSelector
              value={editingCard ? editMood : mood}
              onChange={onMoodChange}
              size="sm"
            />
          </div>
          <div className="bg-gradient-to-b from-background via-background to-transparent h-8 w-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
