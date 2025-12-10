'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sunrise,
  Camera,
  Share2,
  Smile,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center min-h-full px-6 text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-linear-to-br from-amber-200/40 to-orange-300/30 blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 rounded-full bg-linear-to-br from-violet-200/40 to-pink-300/30 blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-500/30">
          <Sunrise className="h-10 w-10 text-white" />
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 leading-tight">
          Capture your day
          <br />
          <span className="bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            in one beautiful card
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-10 max-w-xs mx-auto leading-relaxed">
          A visual diary that&apos;s easy to create and beautiful to share
        </p>

        {/* Card Mockup */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative mx-auto"
        >
          {/* Phone frame suggestion */}
          <div className="relative w-56 mx-auto">
            {/* Shadow */}
            <div className="absolute inset-0 bg-linear-to-br from-neutral-900/20 to-neutral-900/5 rounded-3xl blur-xl transform translate-y-4 scale-95" />

            {/* Card */}
            <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-amber-50 via-white to-violet-50 dark:from-amber-950/30 dark:via-neutral-900 dark:to-violet-950/30 p-5 shadow-2xl border border-white/50 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {SAMPLE_CARD.date}
                </span>
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-neutral-800 dark:text-neutral-200 text-sm leading-relaxed mb-4">
                {SAMPLE_CARD.text}
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
                  feeling great
                </span>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-linear-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg"
          >
            <span className="text-xl">💫</span>
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="absolute -bottom-2 -left-4 w-10 h-10 rounded-xl bg-linear-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg"
          >
            <span className="text-lg">🌟</span>
          </motion.div>
        </motion.div>
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
    <div className="flex flex-col items-center justify-center min-h-full px-6 text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-linear-to-br from-violet-200/40 to-purple-300/30 blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 rounded-full bg-linear-to-br from-pink-200/40 to-rose-300/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-purple-500/30">
          <span className="text-4xl">👋</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 leading-tight">
          Nice to meet you!
        </h2>

        {/* Subtext */}
        <p className="text-neutral-600 dark:text-neutral-400 mb-10 max-w-xs mx-auto">
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
            className="w-full px-6 py-4 rounded-3xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 text-center text-lg font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm transition-all"
            autoFocus
          />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
            You can change this anytime in settings
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Screen 3: How It Works
function Screen3() {
  const steps = [
    {
      icon: Smile,
      label: 'Choose your mood',
      desc: 'Track how you feel',
      color: 'from-amber-400 to-orange-500',
      emoji: '😊',
    },
    {
      icon: Camera,
      label: 'Write & attach photo',
      desc: 'Capture your day',
      color: 'from-violet-400 to-purple-500',
      emoji: '📝',
    },
    {
      icon: Share2,
      label: 'Share as image',
      desc: 'Export and share',
      color: 'from-pink-400 to-rose-500',
      emoji: '🖼️',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 h-48 rounded-full bg-linear-to-br from-violet-200/40 to-purple-300/30 blur-3xl" />
        <div className="absolute bottom-40 right-10 w-56 h-56 rounded-full bg-linear-to-br from-pink-200/40 to-rose-300/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Headline */}
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Simple as 1-2-3
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-10">
          Create your daily recap in seconds
        </p>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.15 + 0.2 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-100 dark:border-neutral-700 shadow-sm"
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl bg-linear-to-br flex items-center justify-center text-white shrink-0',
                  step.color
                )}
              >
                <span className="text-2xl">{step.emoji}</span>
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {step.label}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {step.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Screen 4: What You Can Do Next
function Screen4({
  onComplete,
  onStartCreate,
}: {
  onComplete: () => void;
  onStartCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-linear-to-br from-amber-200/30 via-violet-200/30 to-pink-200/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-32 h-32 mx-auto mb-8"
        >
          <motion.span
            animate={{ rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 text-5xl"
          >
            🎯
          </motion.span>
          <motion.span
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: 0.3 }}
            className="absolute bottom-0 left-4 text-3xl"
          >
            ✨
          </motion.span>
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
            className="absolute bottom-2 right-4 text-3xl"
          >
            💫
          </motion.span>
        </motion.div>

        {/* Headline */}
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          You&apos;re all set!
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-2 leading-relaxed">
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            Reflect.
          </span>{' '}
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            Celebrate small wins.
          </span>
        </p>
        <p className="text-neutral-600 dark:text-neutral-400 mb-10 leading-relaxed">
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            Share your story.
          </span>
        </p>

        {/* Feature pills */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 justify-center mb-10"
        >
          {[
            'Mood tracking',
            'Photo upload',
            'Export as image',
            'Privacy-first',
          ].map((feature) => (
            <span
              key={feature}
              className="px-4 py-2 rounded-full bg-white/80 dark:bg-neutral-800/80 border border-neutral-100 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300 shadow-sm"
            >
              {feature}
            </span>
          ))}
        </motion.div>

        {/* CTA - Floating Button */}
        <Button
          onClick={onStartCreate}
          className="h-12 px-6 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-400/30"
        >
          Begin your daily recap
        </Button>

        <Button
          variant="ghost"
          onClick={onComplete}
          className="mt-3 text-neutral-600 dark:text-neutral-400"
        >
          Explore First
        </Button>
      </motion.div>
    </div>
  );
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [userName, setUserName] = useState('');
  const { setUserName: saveUserName } = useCardStore();

  const handleStartCreate = useCallback(() => {
    if (userName.trim()) {
      saveUserName(userName.trim());
    }
    onComplete();
    router.push('/create');
  }, [onComplete, router, userName, saveUserName]);

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
    <Screen4
      key="screen4"
      onComplete={onComplete}
      onStartCreate={handleStartCreate}
    />,
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Background overlay - full screen */}
      <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-950" />

      {/* Onboarding container - constrained */}
      <div className="relative max-w-md w-full h-full bg-linear-to-b from-amber-50 via-white to-violet-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 shadow-2xl shadow-black/20 overflow-hidden">
        {/* Grain texture */}
        <div className="grain-subtle absolute inset-0 pointer-events-none opacity-50" />

        {/* Content */}
        <div className="relative h-full flex flex-col safe-area-inset">
          {/* Skip button */}
          {currentScreen < 2 && (
            <div className="absolute top-4 right-4 z-20">
              <Button
                variant="ghost"
                onClick={onComplete}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
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
          <div className="p-6 pb-8">
            <div className="flex items-center justify-between gap-4">
              {/* Back button - left side */}
              {currentScreen > 0 ? (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentScreen(currentScreen - 1)}
                  className="h-12 px-5 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div className="w-24" />
              )}

              {/* Dots - center */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentScreen(i)}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      i === currentScreen
                        ? 'w-8 bg-linear-to-r from-amber-500 to-orange-500'
                        : 'w-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                    )}
                  />
                ))}
              </div>

              {/* Next button - right side */}
              {currentScreen < 2 ? (
                <Button
                  onClick={handleNext}
                  disabled={currentScreen === 1 && !userName.trim()}
                  className="h-12 px-6 rounded-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <div className="w-24" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
