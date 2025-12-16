'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Mood } from '@/lib/types';
import { cn } from '@/lib/utils';

const MOOD_BUTTON_CLASSES: Record<Mood, string> = {
  great: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30',
  good: 'bg-green-500 hover:bg-green-600 shadow-green-500/30',
  neutral: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
  bad: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30',
  terrible: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
};

interface DoneButtonProps {
  isVisible: boolean;
  mood: Mood | undefined;
  isSubmitting: boolean;
  disabled: boolean;
  onSave: () => void;
}

export function DoneButton({
  isVisible,
  mood,
  isSubmitting,
  disabled,
  onSave,
}: DoneButtonProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8"
        >
          <div className="flex justify-center">
            <Button
              onClick={onSave}
              disabled={disabled}
              className={cn(
                'h-12 rounded-2xl w-48 text-white font-semibold shadow-lg',
                mood && MOOD_BUTTON_CLASSES[mood]
              )}
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Done
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
