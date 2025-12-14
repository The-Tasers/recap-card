'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, User, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WelcomePage() {
  const router = useRouter();
  const { setUserName, setHasSeenOnboarding, theme, setTheme } = useCardStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');

  // Set theme to system preference on mount if not already set
  useEffect(() => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const handleComplete = () => {
    if (name.trim()) {
      setUserName(name.trim());
    }
    setHasSeenOnboarding(true);

    // Set cookie
    document.cookie = 'hasSeenOnboarding=true; max-age=31536000; path=/';

    router.push('/');
  };

  const steps = [
    {
      title: (
        <>
          Notice your day,
          <br />
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            one moment at a time
          </span>
        </>
      ),
      description: (
        <>
          This isn&apos;t about productivity or perfect days.
          <br />
          It&apos;s about awareness - pausing to see how you feel.
        </>
      ),
      graphics: (
        <div className="relative w-full max-w-xl mx-auto mb-4">
          <div className="flex gap-2 sm:gap-4 justify-center items-center">
            {/* Floating card examples */}
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -5 }}
              animate={{
                opacity: 1,
                y: [0, -8, 0],
                rotate: -5,
              }}
              transition={{
                opacity: { delay: 0.4, duration: 0.6 },
                y: {
                  delay: 1,
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className="w-24 h-32 sm:w-32 sm:h-44 lg:w-40 lg:h-52 rounded-2xl p-3 sm:p-4 shadow-xl bg-gradient-to-br from-green-500 to-emerald-500 transform"
            >
              <div className="flex flex-col gap-1 sm:gap-2 h-full">
                <span className="text-2xl sm:text-3xl lg:text-4xl">😄</span>
                <p className="text-[10px] sm:text-xs lg:text-sm text-white/90 font-medium line-clamp-3">
                  Morning coffee hit different today
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: [0, -10, 0],
                rotate: 2,
              }}
              transition={{
                opacity: { delay: 0.5, duration: 0.6 },
                y: {
                  delay: 1.2,
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className="w-24 h-32 sm:w-32 sm:h-44 lg:w-40 lg:h-52 rounded-2xl p-3 sm:p-4 shadow-xl bg-gradient-to-br from-yellow-400 to-yellow-500 transform"
            >
              <div className="flex flex-col gap-1 sm:gap-2 h-full">
                <span className="text-2xl sm:text-3xl lg:text-4xl">😐</span>
                <p className="text-[10px] sm:text-xs lg:text-sm text-white/90 font-medium line-clamp-3">
                  Just another quiet evening
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, rotate: 5 }}
              animate={{
                opacity: 1,
                y: [0, -12, 0],
                rotate: 5,
              }}
              transition={{
                opacity: { delay: 0.6, duration: 0.6 },
                y: {
                  delay: 1.4,
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className="w-24 h-32 sm:w-32 sm:h-44 lg:w-40 lg:h-52 rounded-2xl p-3 sm:p-4 shadow-xl bg-gradient-to-br from-lime-500 to-lime-400 transform"
            >
              <div className="flex flex-col gap-1 sm:gap-2 h-full">
                <span className="text-2xl sm:text-3xl lg:text-4xl">🙂</span>
                <p className="text-[10px] sm:text-xs lg:text-sm text-white/90 font-medium line-clamp-3">
                  Small wins add up
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      ),
      action: (
        <Button
          onClick={() => setCurrentStep(1)}
          size="lg"
          className="h-14 px-12 text-lg rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-400/30 hover:shadow-xl hover:scale-105 transition-all"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      ),
    },
    {
      title: 'What should we call you?',
      description: 'This helps personalize your experience',
      graphics: null,
      action: (
        <div className="w-full max-w-md space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name (optional)"
              className="h-14 pl-12 text-lg rounded-2xl border-neutral-300 dark:border-neutral-700 focus:border-amber-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleComplete();
                }
              }}
            />
          </div>
          <Button
            onClick={handleComplete}
            size="lg"
            className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-400/30 hover:shadow-xl hover:scale-105 transition-all"
          >
            Get started
          </Button>
        </div>
      ),
    },
  ];

  const handleBackClick = () => {
    setCurrentStep(currentStep - 1);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-neutral-50 via-orange-50/30 to-amber-50/30 dark:from-neutral-950 dark:via-orange-950/10 dark:to-amber-950/10 relative">
      {/* Fixed top panel */}
      <div className="w-full max-w-2xl flex items-center justify-between px-4 pt-4 mb-4 sm:mb-8">
        {/* Back button - only visible on step 2 */}
        <button
          onClick={handleBackClick}
          className={cn(
            'p-2 rounded-xl bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-neutral-800/50 transition-colors',
            currentStep !== 1 && 'invisible'
          )}
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Theme Toggle */}
        <div className="flex items-center gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-neutral-200/50 dark:border-neutral-700/50">
          <button
            onClick={() => setTheme('light')}
            className={`p-2 rounded-xl transition-colors ${
              theme === 'light'
                ? 'bg-amber-500 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            aria-label="Light mode"
          >
            <Sun className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-2 rounded-xl transition-colors ${
              theme === 'dark'
                ? 'bg-amber-500 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            aria-label="Dark mode"
          >
            <Moon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content container for fade animation */}
      <div className="max-w-2xl w-full relative flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
            className="w-full text-center space-y-4 sm:space-y-6 px-4 pb-4"
          >
            {/* Graphics */}
            {currentStepData.graphics && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {currentStepData.graphics}
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight"
            >
              {currentStepData.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-base sm:text-lg lg:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed"
            >
              {currentStepData.description}
            </motion.p>

            {/* Action */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col items-center gap-4 pt-2 sm:pt-4"
            >
              {currentStepData.action}
            </motion.div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 pt-4 sm:pt-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'w-2 bg-neutral-300 dark:bg-neutral-700'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
