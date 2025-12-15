'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCardStore } from '@/lib/store';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function FirstRecapCelebration() {
  const router = useRouter();
  const { cards, hasSeenFirstRecapCelebration, setHasSeenFirstRecapCelebration } = useCardStore();
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Check if we should show signup prompt (at 5 recaps for non-authenticated users)
  const shouldShowSignupPrompt = !authLoading && !user && cards.length === 5;

  useEffect(() => {
    // Show celebration if:
    // 1. User hasn't seen it before
    // 2. There is exactly 1 card (first recap just created)
    // OR show signup prompt at 5 recaps for non-authenticated users
    if (!hasSeenFirstRecapCelebration && cards.length === 1) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    } else if (shouldShowSignupPrompt) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cards.length, hasSeenFirstRecapCelebration, shouldShowSignupPrompt]);

  const handleClose = () => {
    setIsOpen(false);
    setHasSeenFirstRecapCelebration(true);
  };

  const handleSignUp = () => {
    setIsOpen(false);
    setHasSeenFirstRecapCelebration(true);
    router.push('/signup');
  };

  const handleLater = () => {
    setIsOpen(false);
    // Don't set hasSeenFirstRecapCelebration for signup prompts so it can show again later
    if (cards.length === 1) {
      setHasSeenFirstRecapCelebration(true);
    }
  };

  // Different content for first recap celebration vs signup prompt at 5 recaps
  const CelebrationContent = () => {
    const isSignupPrompt = shouldShowSignupPrompt;
    const showSignUpOption = !authLoading && !user;

    if (isSignupPrompt) {
      // Signup prompt at 5 recaps
      return (
        <div className="text-center py-4 lg:py-6">
          <div className="text-5xl lg:text-6xl mb-4">🎯</div>

          <h2 className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            5 recaps already!
          </h2>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
            Keep them safe with a free account — sync across devices, never lose your memories.
          </p>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSignUp}
              className="w-full h-11 rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 text-white"
            >
              Create Free Account
            </Button>
            <button
              onClick={handleLater}
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 py-2"
            >
              Maybe later
            </button>
          </div>
        </div>
      );
    }

    // First recap celebration
    return (
      <div className="text-center py-4 lg:py-6">
        <div className="text-5xl lg:text-6xl mb-4">🎉</div>

        <h2 className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          First recap captured!
        </h2>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
          {showSignUpOption
            ? "Great start! Create a free account to sync your recaps across devices and keep them safe."
            : "Great start! Keep capturing moments — even a few words help you notice patterns over time."
          }
        </p>

        <div className="flex flex-col gap-2">
          {showSignUpOption ? (
            <>
              <Button
                onClick={handleSignUp}
                className="w-full h-11 rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 text-white"
              >
                Create Free Account
              </Button>
              <button
                onClick={handleClose}
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 py-2"
              >
                Continue without account
              </button>
            </>
          ) : (
            <Button
              onClick={handleClose}
              className="w-full h-11 rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 text-white"
            >
              Keep going
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="sr-only">First Recap Celebration</DialogTitle>
          </DialogHeader>
          <CelebrationContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl pb-safe"
      >
        <SheetHeader>
          <SheetTitle className="sr-only">First Recap Celebration</SheetTitle>
        </SheetHeader>
        <CelebrationContent />
      </SheetContent>
    </Sheet>
  );
}
