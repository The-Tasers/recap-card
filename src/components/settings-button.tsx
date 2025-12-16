'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Cloud, User } from 'lucide-react';
import { Mood } from '@/lib/types';
import { cn } from '@/lib/utils';

const MOOD_AVATAR_CLASSES: Record<Mood, { bg: string; text: string }> = {
  great: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/50',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  good: {
    bg: 'bg-green-100 dark:bg-green-900/50',
    text: 'text-green-600 dark:text-green-400',
  },
  neutral: {
    bg: 'bg-amber-100 dark:bg-amber-900/50',
    text: 'text-amber-600 dark:text-amber-400',
  },
  bad: {
    bg: 'bg-orange-100 dark:bg-orange-900/50',
    text: 'text-orange-600 dark:text-orange-400',
  },
  terrible: {
    bg: 'bg-red-100 dark:bg-red-900/50',
    text: 'text-red-600 dark:text-red-400',
  },
};

interface SettingsButtonProps {
  isVisible: boolean;
  isAuthenticated: boolean;
  currentMood: Mood;
  onClick: () => void;
}

export function SettingsButton({
  isVisible,
  isAuthenticated,
  currentMood,
  onClick,
}: SettingsButtonProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={onClick}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-3 pr-3 py-2.5 rounded-full bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground shadow-lg border border-border/50 transition-colors cursor-pointer"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 12px 28px -8px rgba(0, 0, 0, 0.15)',
            y: -2,
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {isAuthenticated ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: 'easeInOut',
                }}
              >
                <Cloud className="h-4 w-4 text-green-500" />
              </motion.div>
              <div
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center',
                  MOOD_AVATAR_CLASSES[currentMood].bg
                )}
              >
                <User
                  className={cn('h-3.5 w-3.5', MOOD_AVATAR_CLASSES[currentMood].text)}
                />
              </div>
            </>
          ) : (
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Settings className="h-5 w-5" />
            </motion.div>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
