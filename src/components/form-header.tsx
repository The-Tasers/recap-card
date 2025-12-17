'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { MoodSelector } from '@/components/mood-selector';
import { Mood, DailyCard } from '@/lib/types';

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
        <div className="sticky top-0 z-40">
          <div className="max-w-lg mx-auto pt-6 px-6 bg-background">
            {/* Minimal header - back and mood only */}
            <div className="flex items-center justify-between">
              {/* Back - subtle, not demanding */}
              <motion.button
                onClick={() => {
                  window.scrollTo(0, 0);
                  onBack();
                }}
                className="flex items-center gap-1.5 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer py-2 -ml-2 pl-2 pr-3"
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back</span>
              </motion.button>

              {/* Mood - small, subtle, in corner */}
              <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                <MoodSelector
                  value={editingCard ? editMood : mood}
                  onChange={onMoodChange}
                  size="sm"
                />
              </div>
            </div>
          </div>
          {/* Minimal fade */}
          <div className="bg-gradient-to-b from-background to-transparent h-3 w-full" />
        </div>
      )}
    </AnimatePresence>
  );
}
