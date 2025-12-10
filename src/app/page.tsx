'use client';

import { useMemo, useState, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame } from 'lucide-react';

import { useCardStore } from '@/lib/store';
import { Onboarding } from '@/components/onboarding';
import { DailyCardView } from '@/components/daily-card-view';
import {
  getGreeting,
  getTodayDateFormatted,
  getDailyQuestion,
  getTodayRecap,
  getLast7DaysMoodData,
} from '@/lib/daily-utils';
import { MoodMapTile } from '@/components/mood-map-tile';
import { DailyCard } from '@/lib/types';
import { cn } from '@/lib/utils';

// Header Component (Simplified - no greeting/username)
function Header() {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm">
      <div className="max-w-md mx-auto px-5 py-4">
        <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
          RECAP<span className="text-amber-500">P</span>
        </h1>
      </div>
    </header>
  );
}

// Greeting Block Component (shows greeting + question if no recap today)
function GreetingBlock({
  userName,
  hasRecapToday,
}: {
  userName: string;
  hasRecapToday: boolean;
}) {
  const router = useRouter();
  const greeting = getGreeting(userName);
  const todayDate = getTodayDateFormatted();
  const dailyQuestion = !hasRecapToday ? getDailyQuestion() : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      {/* Date and Greeting */}
      <div className="mb-4">
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          {todayDate}
        </p>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {greeting}
        </h2>
      </div>

      {/* Question Block (only if no recap today) */}
      {!hasRecapToday && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30 rounded-2xl p-4 shadow-md border border-amber-100/50 dark:border-amber-900/30"
        >
          <div className="mb-3 p-3 bg-white/60 dark:bg-black/20 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-800 backdrop-blur-sm">
            <p className="text-neutral-700 dark:text-neutral-200 italic text-center text-sm font-medium">
              &ldquo;{dailyQuestion}&rdquo;
            </p>
          </div>

          <button
            onClick={() => router.push('/create')}
            className="w-full h-11 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            Start Today&apos;s Recap
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Simplified Dashboard (only Streak + Mood Map)
function SimplifiedDashboard({
  isEmptyState = true,
  stats,
  moodData,
  todayRecap,
}: {
  isEmptyState?: boolean;
  stats: { streak: number };
  moodData: (number | null)[];
  todayRecap: DailyCard | undefined | null;
}) {
  const router = useRouter();

  const handleStreakClick = () => {
    // If today's recap exists, navigate to it; otherwise create new
    if (todayRecap) {
      router.push(`/card/${todayRecap.id}`);
    } else {
      router.push('/create');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="space-y-4 mb-4"
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Progress
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Streak Tile */}
        <div
          onClick={handleStreakClick}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Your Streak
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center h-20">
            <div
              className={cn(
                'text-5xl font-black',
                stats.streak > 0
                  ? 'text-orange-500'
                  : 'text-neutral-300 dark:text-neutral-700'
              )}
            >
              {stats.streak}
            </div>
            <p
              className={cn(
                'text-xs  mt-1',
                stats.streak > 0
                  ? 'text-orange-500'
                  : 'text-neutral-400 dark:text-neutral-600'
              )}
            >
              {stats.streak === 0
                ? 'days yet'
                : stats.streak === 1
                ? 'day'
                : 'days'}
            </p>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-3">
            Build momentum daily
          </p>
        </div>

        {/* Mood Map Tile */}
        <MoodMapTile moodData={moodData} />
      </div>

      {/* Motivational Message */}
      {isEmptyState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-neutral-500 dark:text-neutral-500 max-w-sm mx-auto leading-relaxed">
            Start building a habit of reflection. Just a few minutes each day to
            capture what matters.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Main Home Page Component
function HomePageInner() {
  const router = useRouter();
  const { cards, hydrated, hasSeenOnboarding, userName, setHasSeenOnboarding } =
    useCardStore();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    // Calculate this week's progress (Mon-Sun)
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const cardsThisWeek = cards.filter(
      (c) => new Date(c.createdAt) >= startOfWeek
    ).length;

    const weekProgress = Math.round((cardsThisWeek / 7) * 100);

    return {
      total: cards.length,
      thisMonth: cardsThisMonth,
      streak,
      thisWeek: cardsThisWeek,
      weekProgress,
    };
  }, [cards]);

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    setOnboardingDismissed(true);
  };

  // Get mood data for last 7 days (before early return)
  const moodData = useMemo(() => getLast7DaysMoodData(cards), [cards]);

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
  // Sort cards: pinned first, then by date
  const sortedCards = [...cards].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const effectiveCards = hasCards ? sortedCards : [];
  const pinnedCards = effectiveCards.filter((card) => card.isPinned);
  const hasPinnedCards = pinnedCards.length > 0;

  return (
    <>
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      {/* Header (no username/greeting) */}
      <Header />

      {/* Show Empty State if no cards */}
      {!hasCards ? (
        <div className="max-w-md mx-auto px-5">
          {/* Greeting Block */}
          <GreetingBlock userName={userName} hasRecapToday={false} />

          {/* Dashboard Tiles */}
          <SimplifiedDashboard
            stats={stats}
            moodData={moodData}
            todayRecap={null}
          />
        </div>
      ) : (
        <div className="max-w-md mx-auto px-5 pb-24 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm">
          {/* Greeting Block */}
          <GreetingBlock
            userName={userName}
            hasRecapToday={!!getTodayRecap(cards)}
          />

          {/* Simplified Dashboard - Same as Empty State */}
          <SimplifiedDashboard
            stats={stats}
            moodData={moodData}
            todayRecap={getTodayRecap(cards)}
            isEmptyState={false}
          />

          {/* Pinned Cards Section */}
          {hasPinnedCards && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Pinned Recaps
                </h2>
              </div>
              <div className="relative -mx-4 mb-8">
                <div
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {pinnedCards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="snap-start shrink-0 w-[65%] first:ml-0 relative"
                    >
                      <DailyCardView
                        card={card}
                        variant="compact"
                        onClick={() => router.push(`/card/${card.id}`)}
                        className="min-h-[180px] flex flex-col"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Recaps Section */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Recent Recaps
            </h2>
          </div>

          {/* Cards Carousel */}
          <div className="relative -mx-4">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {effectiveCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="snap-start shrink-0 w-[65%] first:ml-0 relative"
                >
                  <DailyCardView
                    card={card}
                    variant="compact"
                    onClick={() => router.push(`/card/${card.id}`)}
                    className="min-h-[180px] flex flex-col"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
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
