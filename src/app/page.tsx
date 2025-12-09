'use client';

import { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Sunrise } from 'lucide-react';

import { DailyCard, Mood } from '@/lib/types';
import { useCardStore } from '@/lib/store';
import { Onboarding } from '@/components/onboarding';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Hero Section Component (mobile main screen)
function HeroSection() {
  return (
    <section className="mb-6 text-center">
      <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-400/30">
        <Sunrise className="h-7 w-7 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
        Day Recap
      </h1>
      <p className="text-base text-neutral-800 dark:text-neutral-200 mt-3 font-medium">
        Capture today in one beautiful card.
      </p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
        Mood, notes, photo — ready to share.
      </p>
    </section>
  );
}

// Dashboard status (no filters)
function DashboardFilters({
  cards,
  stats,
}: {
  cards: DailyCard[];
  stats: { total: number; thisMonth: number; streak: number };
}) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const todayCount = cards.filter(
    (c) => new Date(c.createdAt).toDateString() === startOfToday.toDateString()
  ).length;

  const weekCount = cards.filter(
    (c) => new Date(c.createdAt) >= startOfWeek
  ).length;

  const moodCounts = cards.reduce<Record<string, number>>((acc, card) => {
    acc[card.mood] = (acc[card.mood] || 0) + 1;
    return acc;
  }, {});

  const moodOrder = ['great', 'good', 'neutral', 'bad', 'terrible'] as const;
  type MoodCount = { mood: Mood; count: number };
  const topMood = moodOrder.reduce<MoodCount>(
    (best, mood) => {
      const count = moodCounts[mood] || 0;
      if (count > best.count) return { mood, count };
      return best;
    },
    { mood: 'neutral', count: 0 }
  );

  const moodMeta: Record<
    Mood,
    { label: string; emoji: string; accent: string }
  > = {
    great: {
      label: 'Overall great',
      emoji: '😊',
      accent: 'from-amber-500 to-orange-500',
    },
    good: {
      label: 'Overall good',
      emoji: '🙂',
      accent: 'from-green-500 to-emerald-500',
    },
    neutral: {
      label: 'Steady',
      emoji: '😌',
      accent: 'from-slate-500 to-slate-600',
    },
    bad: {
      label: 'Tough stretch',
      emoji: '😕',
      accent: 'from-orange-500 to-amber-600',
    },
    terrible: {
      label: 'Rough patch',
      emoji: '😞',
      accent: 'from-rose-500 to-red-600',
    },
  };

  const moodTile = moodMeta[topMood.mood] || moodMeta.neutral;

  const tiles = [
    {
      label: moodTile.label,
      value: `${topMood.count || 'No'} recent card${
        topMood.count === 1 ? '' : 's'
      }`,
      accent: moodTile.accent,
      foot:
        topMood.count > 0
          ? 'Based on your latest mood entries'
          : 'Add a card to see your mood',
      emoji: moodTile.emoji,
    },
    {
      label: 'Streak',
      value: `${stats.streak} day${stats.streak === 1 ? '' : 's'}`,
      accent: 'from-neutral-900 to-neutral-700',
      foot: 'Keep the chain going',
      emoji: '🔥',
    },
    {
      label: 'This week',
      value: `${weekCount} card${weekCount === 1 ? '' : 's'}`,
      accent: 'from-violet-500 to-purple-600',
      foot:
        todayCount > 0
          ? 'Logged today already'
          : 'Log today to boost your week',
      emoji: '📅',
    },
    {
      label: 'Life recap',
      value: `${stats.total || 0} card${stats.total === 1 ? '' : 's'}`,
      accent: 'from-teal-500 to-emerald-600',
      foot: stats.total > 0 ? 'Your story so far' : 'Start your streak today',
      emoji: '🧭',
    },
  ];

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
          Your recap
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tiles.map((item) => (
          <div
            key={item.label}
            className={cn(
              'rounded-2xl p-4 text-white shadow-lg shadow-black/10 bg-linear-to-br min-h-[120px] flex flex-col justify-between',
              item.accent
            )}
          >
            <div className="flex items-center gap-2 text-sm opacity-90">
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </div>
            <div className="text-2xl font-semibold leading-tight">
              {item.value}
            </div>
            <div className="text-xs opacity-80">{item.foot}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Home Page Component
function HomePageInner() {
  const { cards, hydrated, hasSeenOnboarding, setHasSeenOnboarding } =
    useCardStore();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const cardsThisMonth = cards.filter(
      (c) => new Date(c.createdAt) >= thisMonth
    ).length;

    // Calculate streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const hasCard = cards.some(
        (c) => new Date(c.createdAt).toDateString() === checkDate.toDateString()
      );
      if (hasCard) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return { total: cards.length, thisMonth: cardsThisMonth, streak };
  }, [cards]);

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    setOnboardingDismissed(true);
  };

  const showOnboarding =
    hydrated &&
    !hasSeenOnboarding &&
    cards.length === 0 &&
    !onboardingDismissed;

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-muted-foreground"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  const hasCards = cards.length > 0;
  const effectiveCards = hasCards ? cards : [];
  const placeholderStats = hasCards
    ? stats
    : { total: 0, thisMonth: 0, streak: 0 };

  return (
    <>
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      {/* Main content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Hero Section */}
        <HeroSection />

        <DashboardFilters cards={effectiveCards} stats={placeholderStats} />

        {/* Floating CTA for both new and returning users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
        >
          <Link href="/create">
            <Button className="h-12 px-6 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-400/30">
              <Plus className="h-5 w-5 mr-2" />
              {hasCards ? 'Log today’s mood' : 'Begin your daily recap'}
            </Button>
          </Link>
        </motion.div>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-muted-foreground">
          Loading...
        </div>
      }
    >
      <HomePageInner />
    </Suspense>
  );
}
