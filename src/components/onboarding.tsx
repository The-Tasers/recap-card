'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCardStore } from '@/lib/store';

interface OnboardingProps {
  onComplete: () => void;
}

// Sample card for mockups
const SAMPLE_CARD = {
  mood: 'great' as const,
  text: 'Had an amazing morning walk. The sunrise was incredible today.',
  date: new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }),
};

// Screen 1: What This App Does
function Screen1() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-full px-6 lg:px-16 text-center lg:text-left lg:gap-16">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 lg:w-[600px] lg:h-[600px] rounded-full bg-linear-to-br from-amber-200/40 to-orange-300/30 blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 lg:w-[700px] lg:h-[700px] rounded-full bg-linear-to-br from-violet-200/40 to-pink-300/30 blur-3xl" />
      </div>

      {/* Content - Left side on desktop */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex-1 lg:max-w-2xl"
      >
        {/* Headline */}
        <h1 className="text-3xl lg:text-6xl xl:text-7xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 lg:mb-8 leading-tight">
          Notice your day,
          <br />
          <span className="bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            one moment at a time
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-neutral-600 dark:text-neutral-400 text-lg lg:text-2xl mb-10 lg:mb-0 max-w-xs lg:max-w-xl mx-auto lg:mx-0 leading-relaxed">
          This isn&apos;t about productivity or perfect days.
          <br className="hidden lg:block" />
          It&apos;s about awareness - pausing to see how you feel.
        </p>
      </motion.div>

      {/* Card Mockup - Right side on desktop */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 flex-1 lg:flex lg:items-center lg:justify-center"
      >
        <div className="relative w-56 lg:w-96 xl:w-[450px] mx-auto">
          {/* Floating elements - positioned outside card */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute -top-4 -right-4 lg:-top-16 lg:-right-16 xl:-top-20 xl:-right-20 w-12 h-12 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-2xl bg-linear-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg z-10"
          >
            <span className="text-xl lg:text-3xl xl:text-4xl">💫</span>
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="absolute -bottom-2 -left-4 lg:-bottom-12 lg:-left-12 xl:-bottom-16 xl:-left-16 w-10 h-10 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-xl bg-linear-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg z-10"
          >
            <span className="text-lg lg:text-2xl xl:text-3xl">🌟</span>
          </motion.div>

          {/* Shadow */}
          <div className="absolute inset-0 bg-linear-to-br from-neutral-900/20 to-neutral-900/5 rounded-3xl blur-xl transform translate-y-4 scale-95" />

          {/* Card */}
          <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-amber-50 via-white to-violet-50 dark:from-amber-950/30 dark:via-neutral-900 dark:to-violet-950/30 p-5 lg:p-8 xl:p-10 shadow-2xl border border-white/50 dark:border-neutral-700 z-20">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <span className="text-sm lg:text-lg font-medium text-neutral-500 dark:text-neutral-400">
                {SAMPLE_CARD.date}
              </span>
              <span className="text-2xl lg:text-4xl">✨</span>
            </div>
            <p className="text-neutral-800 dark:text-neutral-200 text-sm lg:text-lg xl:text-xl leading-relaxed mb-4 lg:mb-6">
              {SAMPLE_CARD.text}
            </p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 lg:px-5 lg:py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs lg:text-base font-medium">
                feeling great
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Screen 2: Name Input
function Screen2({
  userName,
  setUserName,
}: {
  userName: string;
  setUserName: (name: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 lg:px-20 text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 lg:w-[600px] lg:h-[600px] rounded-full bg-linear-to-br from-violet-200/40 to-purple-300/30 blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 lg:w-[700px] lg:h-[700px] rounded-full bg-linear-to-br from-pink-200/40 to-rose-300/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm lg:max-w-3xl"
      >
        {/* Icon */}
        <div className="w-20 h-20 lg:w-36 lg:h-36 rounded-3xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-8 lg:mb-12 shadow-xl shadow-purple-500/30">
          <span className="text-4xl lg:text-7xl">👋</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl lg:text-6xl xl:text-7xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 lg:mb-8 leading-tight">
          Nice to meet you!
        </h2>

        {/* Subtext */}
        <p className="text-neutral-600 dark:text-neutral-400 text-base lg:text-2xl xl:text-3xl mb-10 lg:mb-16 max-w-xs lg:max-w-2xl mx-auto leading-relaxed">
          What would you like us to call you?
        </p>

        {/* Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name"
            className="w-full px-6 py-4 lg:px-10 lg:py-7 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-2 border-neutral-200 dark:border-neutral-700 text-center text-lg lg:text-3xl xl:text-4xl font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 shadow-sm transition-all"
            autoFocus
          />
          <p className="text-xs lg:text-base text-neutral-500 dark:text-neutral-400 mt-3 lg:mt-6">
            You can change this anytime in settings
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Screen 4: Welcome
function Screen4({
  userName,
  onComplete,
}: {
  userName: string;
  onComplete: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 lg:px-20 text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/5 left-1/2 -translate-x-1/2 w-80 h-80 lg:w-[700px] lg:h-[700px] rounded-full bg-linear-to-br from-amber-200/30 via-violet-200/30 to-pink-200/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm lg:max-w-4xl"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-32 h-32 lg:w-48 lg:h-48 mx-auto mb-8 lg:mb-12"
        >
          <motion.span
            animate={{ rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 text-5xl lg:text-8xl"
          >
            🎉
          </motion.span>
          <motion.span
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: 0.3 }}
            className="absolute bottom-0 left-4 lg:left-8 text-3xl lg:text-6xl"
          >
            ✨
          </motion.span>
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
            className="absolute bottom-2 right-4 lg:right-8 text-3xl lg:text-6xl"
          >
            💫
          </motion.span>
        </motion.div>

        {/* Headline */}
        <h2 className="text-3xl lg:text-6xl xl:text-7xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 lg:mb-8">
          You&apos;re all set{userName ? `, ${userName}` : ''}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg lg:text-2xl xl:text-3xl mb-12 lg:mb-20 max-w-2xl mx-auto leading-relaxed">
          Just one small moment each day is enough.
          <br className="hidden lg:block" />
          Over time, you&apos;ll see patterns in how your days feel.
        </p>

        {/* CTA Button */}
        <Button
          onClick={onComplete}
          className="h-14 lg:h-20 xl:h-24 px-8 lg:px-16 text-lg lg:text-2xl xl:text-3xl rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-400/30 hover:shadow-xl hover:scale-105 transition-all"
        >
          Notice today&apos;s moment
        </Button>
      </motion.div>
    </div>
  );
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [userName, setUserName] = useState('');
  const { setUserName: saveUserName } = useCardStore();

  const handleNext = useCallback(() => {
    if (currentScreen === 1 && userName.trim()) {
      saveUserName(userName.trim());
    }
    if (currentScreen < 2) {
      setCurrentScreen(currentScreen + 1);
    } else {
      if (userName.trim()) {
        saveUserName(userName.trim());
      }
      onComplete();
    }
  }, [currentScreen, onComplete, userName, saveUserName]);

  const screens = [
    <Screen1 key="screen1" />,
    <Screen2 key="screen2" userName={userName} setUserName={setUserName} />,
    <Screen4 key="screen4" userName={userName} onComplete={onComplete} />,
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
      {/* Onboarding container - constrained on mobile, wider on desktop */}
      <div className="relative max-w-md lg:max-w-6xl w-full h-full lg:h-[90vh] lg:rounded-3xl bg-linear-to-b from-amber-0 via-white to-violet-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 shadow-2xl shadow-black/20 overflow-hidden">
        {/* Grain texture */}
        <div className="grain-subtle absolute inset-0 pointer-events-none opacity-50" />

        {/* Content */}
        <div className="relative h-full flex flex-col safe-area-inset">
          {/* Skip button */}
          {currentScreen < 2 && (
            <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-20">
              <Button
                variant="ghost"
                onClick={onComplete}
                className="h-10 lg:h-12 px-4 lg:px-6 text-base lg:text-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 rounded-2xl"
              >
                Skip
              </Button>
            </div>
          )}

          {/* Screens */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                {screens[currentScreen]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="p-6 pb-8 lg:p-10 lg:pb-12">
            <div className="flex items-center justify-between gap-4 lg:gap-8">
              {/* Back button - left side */}
              {currentScreen > 0 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentScreen(currentScreen - 1)}
                  className="h-12 w-12 lg:h-16 lg:w-16 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80"
                >
                  <ArrowLeft className="h-4 w-4 lg:h-6 lg:w-6" />
                </Button>
              ) : (
                <div className="w-12 lg:w-16" />
              )}

              {/* Dots - center */}
              <div className="flex gap-2 lg:gap-4">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentScreen(i)}
                    className={cn(
                      'h-2 lg:h-3 rounded-full transition-all duration-300',
                      i === currentScreen
                        ? 'w-8 lg:w-14 bg-linear-to-r from-amber-500 to-orange-500'
                        : 'w-2 lg:w-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                    )}
                  />
                ))}
              </div>

              {/* Next button - right side */}
              {currentScreen < 2 ? (
                <Button
                  onClick={handleNext}
                  disabled={currentScreen === 1 && !userName.trim()}
                  className="h-12 lg:h-16 px-6 lg:px-16 lg:min-w-[200px] text-base lg:text-xl rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4 lg:h-6 lg:w-6 ml-2" />
                </Button>
              ) : (
                <div className="w-24 lg:w-[200px]" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
