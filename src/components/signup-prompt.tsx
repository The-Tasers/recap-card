'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { useCardStore } from '@/lib/store';
import { Mood } from '@/lib/types';
import { cn } from '@/lib/utils';

const PROMPT_THRESHOLD = 3; // Show after 3 entries
const STORAGE_KEY = 'signup-prompt-dismissed';

// Mood-specific button colors using new palette
const MOOD_BUTTON_CLASSES: Record<Mood, string> = {
  great: 'bg-[#22c55e] hover:bg-[#16a34a]',
  good: 'bg-[#84cc16] hover:bg-[#65a30d]',
  okay: 'bg-[#eab308] hover:bg-[#ca8a04]',
  low: 'bg-[#f97316] hover:bg-[#ea580c]',
  rough: 'bg-[#ef4444] hover:bg-[#dc2626]',
};

// Mood-specific prompt background colors
const MOOD_BG_CLASSES: Record<Mood, string> = {
  great: 'from-[#22c55e]/10 to-[#22c55e]/5 dark:from-[#22c55e]/20 dark:to-[#22c55e]/10 border-[#22c55e]/30',
  good: 'from-[#84cc16]/10 to-[#84cc16]/5 dark:from-[#84cc16]/20 dark:to-[#84cc16]/10 border-[#84cc16]/30',
  okay: 'from-[#eab308]/10 to-[#eab308]/5 dark:from-[#eab308]/20 dark:to-[#eab308]/10 border-[#eab308]/30',
  low: 'from-[#f97316]/10 to-[#f97316]/5 dark:from-[#f97316]/20 dark:to-[#f97316]/10 border-[#f97316]/30',
  rough: 'from-[#ef4444]/10 to-[#ef4444]/5 dark:from-[#ef4444]/20 dark:to-[#ef4444]/10 border-[#ef4444]/30',
};

// Mood-specific icon colors
const MOOD_ICON_CLASSES: Record<Mood, { bg: string; text: string }> = {
  great: { bg: 'bg-[#22c55e]/20', text: 'text-[#22c55e]' },
  good: { bg: 'bg-[#84cc16]/20', text: 'text-[#84cc16]' },
  okay: { bg: 'bg-[#eab308]/20', text: 'text-[#eab308]' },
  low: { bg: 'bg-[#f97316]/20', text: 'text-[#f97316]' },
  rough: { bg: 'bg-[#ef4444]/20', text: 'text-[#ef4444]' },
};

export function SignupPrompt() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { cards, hydrated } = useCardStore();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Get the most recent card's mood for theming
  const latestMood: Mood = cards.length > 0 ? cards[0].mood : 'okay';

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

  const handleSignUp = () => {
    handleDismiss();
    router.push('/signup');
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
                  Keep your days safe
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {cards.length} {cards.length === 1 ? 'day' : 'days'} captured.
                  Sign in to keep them across devices.
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
                    onClick={handleSignUp}
                  >
                    Sign up
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
