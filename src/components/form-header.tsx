'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { DailyCard } from '@/lib/types';
import { formatRelativeDate } from '@/lib/date-utils';

interface FormHeaderProps {
  isVisible: boolean;
  editingCard: DailyCard | null;
  onBack: () => void;
  onDiscard: () => void;
  showDiscardConfirm: boolean;
  onCancelDiscard: () => void;
}

export function FormHeader({
  isVisible,
  editingCard,
  onBack,
  onDiscard,
  showDiscardConfirm,
  onCancelDiscard,
}: FormHeaderProps) {
  // Get the date to display
  const displayDate = editingCard
    ? formatRelativeDate(new Date(editingCard.createdAt))
    : 'Today';
  const handleBack = () => {
    window.scrollTo(0, 0);
    onBack();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="sticky top-0 z-40 w-full">
          <div className="w-full max-w-lg mx-auto pt-6 px-6 bg-background">
            {/* Fixed height container to prevent layout shift */}
            <div className="h-9 relative">
              <AnimatePresence mode="wait">
                {showDiscardConfirm ? (
                  /* Discard confirmation inline */
                  <motion.div
                    key="discard-confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-muted-foreground">
                      Discard changes?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onCancelDiscard}
                        className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={onDiscard}
                        className="px-3 py-1.5 text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors rounded-lg hover:bg-rose-500/10"
                      >
                        Discard
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* Normal header */
                  <motion.div
                    key="normal-header"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex items-center justify-between gap-2"
                  >
                  {/* Back button - left side, negative margin to align icon with content */}
                  <motion.button
                    onClick={handleBack}
                    className="shrink-0 -ml-2 p-2 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer rounded-full hover:bg-muted/30"
                    whileTap={{ scale: 0.95 }}
                    aria-label="Go back"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>

                  {/* Date - center */}
                  <span className="text-sm font-medium text-muted-foreground">
                    {displayDate}
                  </span>

                  {/* Spacer - right side (save button moved to form bottom) */}
                  <div className="w-5" />
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>
          {/* Minimal fade */}
          <div className="bg-gradient-to-b from-background to-transparent h-3 w-full" />
        </div>
      )}
    </AnimatePresence>
  );
}
