'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { useCheckInStore } from '@/lib/checkin-store';
import { useI18n } from '@/lib/i18n';

const PROMPT_THRESHOLD = 3; // Show after 3 check-ins
const STORAGE_KEY = 'signup-prompt-dismissed';

export function SignupPrompt() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const { checkIns, hydrated } = useCheckInStore();
  const [delayedShow, setDelayedShow] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check dismissal state from localStorage on mount
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  });

  // Compute whether prompt should be visible
  const shouldShow = useMemo(() => {
    return (
      hydrated &&
      !loading &&
      !user &&
      checkIns.length >= PROMPT_THRESHOLD &&
      !dismissed
    );
  }, [hydrated, loading, user, checkIns.length, dismissed]);

  // Handle delayed show with timer - only set state in timer callback
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (shouldShow) {
      timerRef.current = setTimeout(() => setDelayedShow(true), 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [shouldShow]);

  const handleDismiss = () => {
    setDelayedShow(false);
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSignUp = () => {
    handleDismiss();
    router.push('/signup');
  };

  // Only show if both conditions are met
  const isVisible = shouldShow && delayedShow;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto"
        >
          <div className="bg-card rounded-2xl p-5 border border-border shadow-lg">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                <Cloud className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1">
                  {t('signupPrompt.title')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('signupPrompt.description', { count: checkIns.length })}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDismiss}
                    className="flex-1"
                  >
                    {t('signupPrompt.later')}
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleSignUp}>
                    {t('signupPrompt.signUp')}
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
