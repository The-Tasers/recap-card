'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { useCardStore } from '@/lib/store';
import { Mood } from '@/lib/types';
import { cn } from '@/lib/utils';

const PROMPT_THRESHOLD = 3; // Show after 3 entries
const STORAGE_KEY = 'signup-prompt-dismissed';

// Mood-specific button colors
const MOOD_BUTTON_CLASSES: Record<Mood, string> = {
  great: 'bg-emerald-500 hover:bg-emerald-600',
  good: 'bg-green-500 hover:bg-green-600',
  neutral: 'bg-amber-500 hover:bg-amber-600',
  bad: 'bg-orange-500 hover:bg-orange-600',
  terrible: 'bg-red-500 hover:bg-red-600',
};

// Mood-specific prompt background colors
const MOOD_BG_CLASSES: Record<Mood, string> = {
  great: 'from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200/50 dark:border-emerald-800/50',
  good: 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200/50 dark:border-green-800/50',
  neutral: 'from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200/50 dark:border-amber-800/50',
  bad: 'from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200/50 dark:border-orange-800/50',
  terrible: 'from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 border-red-200/50 dark:border-red-800/50',
};

// Mood-specific icon colors
const MOOD_ICON_CLASSES: Record<Mood, { bg: string; text: string }> = {
  great: { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-600 dark:text-emerald-400' },
  good: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400' },
  neutral: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400' },
  bad: { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-600 dark:text-orange-400' },
  terrible: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400' },
};

export function SignupPrompt() {
  const { user, loading } = useAuth();
  const { cards, hydrated } = useCardStore();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Get the most recent card's mood for theming
  const latestMood: Mood = cards.length > 0 ? cards[0].mood : 'neutral';

  useEffect(() => {
    // Check if user previously dismissed
    if (typeof window !== 'undefined') {
      const wasDismissed = localStorage.getItem(STORAGE_KEY);
      if (wasDismissed) {
        setDismissed(true);
      }
    }
  }, []);

  useEffect(() => {
    // Show prompt conditions:
    // 1. Store is hydrated
    // 2. Not loading auth
    // 3. User is not signed in
    // 4. User has at least PROMPT_THRESHOLD entries
    // 5. User hasn't dismissed
    if (
      hydrated &&
      !loading &&
      !user &&
      cards.length >= PROMPT_THRESHOLD &&
      !dismissed
    ) {
      // Delay showing to avoid interrupting the flow
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [hydrated, loading, user, cards.length, dismissed]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto"
        >
          <div className={cn(
            'bg-gradient-to-br rounded-2xl p-5 border',
            MOOD_BG_CLASSES[latestMood]
          )}>
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className={cn(
                'h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
                MOOD_ICON_CLASSES[latestMood].bg
              )}>
                <Cloud className={cn('h-6 w-6', MOOD_ICON_CLASSES[latestMood].text)} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  Keep your moments safe
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  You've captured {cards.length} {cards.length === 1 ? 'moment' : 'moments'}!
                  Sign up to sync across devices and never lose them.
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDismiss}
                    className="flex-1"
                  >
                    Maybe later
                  </Button>
                  <Button
                    size="sm"
                    className={cn('flex-1 text-white', MOOD_BUTTON_CLASSES[latestMood])}
                    asChild
                  >
                    <Link href="/signup">
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      Sign up free
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
