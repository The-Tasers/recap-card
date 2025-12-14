'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useCardStore } from '@/lib/store';
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
  const { cards, hasSeenFirstRecapCelebration, setHasSeenFirstRecapCelebration } = useCardStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    // Show celebration if:
    // 1. User hasn't seen it before
    // 2. There is exactly 1 card (first recap just created)
    if (!hasSeenFirstRecapCelebration && cards.length === 1) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cards.length, hasSeenFirstRecapCelebration]);

  const handleClose = () => {
    setIsOpen(false);
    setHasSeenFirstRecapCelebration(true);
  };

  const CelebrationContent = () => (
    <div className="text-center py-6 lg:py-8">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="text-7xl lg:text-8xl animate-bounce">🎉</div>
          <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-amber-500 animate-pulse" />
        </div>
      </div>

      <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
        Congratulations! 🌟
      </h2>

      <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto leading-relaxed">
        You&apos;ve captured your first moment! This is the beginning of your journey to mindful reflection.
      </p>

      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-6 mb-6 border border-amber-200 dark:border-amber-900/50">
        <p className="text-sm lg:text-base text-neutral-700 dark:text-neutral-300">
          <span className="font-semibold">💡 Tip:</span> Make it a daily habit! Even a few words can help you track your journey and discover patterns over time.
        </p>
      </div>

      <Button
        onClick={handleClose}
        className="w-full lg:w-auto px-8 h-12 rounded-2xl text-base font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/40 hover:shadow-xl hover:shadow-amber-500/50"
      >
        Let&apos;s keep going! 🚀
      </Button>
    </div>
  );

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
