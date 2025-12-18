'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
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
  const handleDone = () => {
    window.scrollTo(0, 0);
    onBack();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="sticky top-0 z-40 w-full">
          <div className="w-full max-w-lg mx-auto pt-6 px-4 sm:px-6 bg-background">
            {/* Header - mood on left, done on right (or back button if not editing) */}
            <div className="w-full flex items-center justify-between gap-2">
              {/* Mood - left side, allow to shrink on small screens */}
              <div className="opacity-60 hover:opacity-100 transition-opacity duration-300 min-w-0 overflow-x-auto sm:overflow-visible">
                <MoodSelector
                  value={editingCard ? editMood : mood}
                  onChange={onMoodChange}
                  size="sm"
                />
              </div>

              {/* Done button when editing, back button otherwise - never shrink */}
              {editingCard ? (
                <motion.button
                  onClick={handleDone}
                  className="shrink-0 flex items-center gap-1 p-2 md:px-3 md:py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer rounded-full hover:bg-primary/10"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Done editing"
                >
                  <Check className="h-5 w-5 md:h-4 md:w-4" />
                  <span className="hidden md:inline">Done</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleDone}
                  className="shrink-0 p-2 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer rounded-full hover:bg-muted/30"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Go back"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
              )}
            </div>
          </div>
          {/* Minimal fade */}
          <div className="bg-gradient-to-b from-background to-transparent h-3 w-full" />
        </div>
      )}
    </AnimatePresence>
  );
}
