'use client';

import { useMemo, useState, Suspense, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Clock, CalendarDays, Pin } from 'lucide-react';

import { useCardStore } from '@/lib/store';
import { Onboarding } from '@/components/onboarding';
import { DailyCardView } from '@/components/daily-card-view';
import {
  getGreeting,
  getTodayDateFormatted,
  getTodayRecap,
  getLastNDaysMoodData,
  type MoodDayData,
} from '@/lib/daily-utils';
import { MoodMapTile } from '@/components/mood-map-tile';
import { DailyCard } from '@/lib/types';
import { cn } from '@/lib/utils';

// Countdown Timer with CTA Component
export function DayCountdown({
  hasRecapToday,
  onCreateClick,
}: {
  hasRecapToday: boolean;
  onCreateClick?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);

      // Contextual messages based on time of day
      const currentHour = now.getHours();
      if (currentHour >= 5 && currentHour < 12) {
        setMessage('Start your day with reflection ✨');
      } else if (currentHour >= 12 && currentHour < 17) {
        setMessage('Take a moment to capture today 🌟');
      } else if (currentHour >= 17 && currentHour < 22) {
        setMessage('Evening is perfect for reflection 🌙');
      } else if (currentHour >= 22 || currentHour < 2) {
        setMessage('End the day with your thoughts 💫');
      } else {
        // 2am-5am - very late night/early morning
        setMessage('Tomorrow is a fresh start 🌅');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // Only show countdown in the evening (after 6pm until midnight)
  const currentHour = new Date().getHours();
  const shouldShowCountdown = currentHour >= 18;

  if (hasRecapToday || !shouldShowCountdown) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex flex-col items-center gap-3 px-5 py-4 bg-linear-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30 border-2 border-amber-300/60 dark:border-amber-800/50 rounded-2xl shadow-lg shadow-amber-500/10 dark:shadow-amber-900/20">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-linear-to-r from-amber-400/5 via-orange-400/5 to-rose-400/5 dark:from-amber-400/10 dark:via-orange-400/10 dark:to-rose-400/10 rounded-2xl blur-xl" />

        <div className="relative flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
          <span className="text-sm font-bold text-amber-800 dark:text-amber-300 tabular-nums">
            {timeLeft} to reflect on today
          </span>
        </div>
        <p className="relative text-xs text-amber-700/90 dark:text-amber-400/90 font-semibold">
          {message}
        </p>

        {/* CTA Button */}
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="relative w-full mt-1 h-11 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            Capture Today&apos;s Moment
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Header Component (Mobile only - desktop has sidebar)
function Header() {
  return (
    <header className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200/50 dark:border-neutral-800/50">
      <div className="max-w-md mx-auto px-5 py-4">
        <h1 className="relative text-4xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight inline-block">
          RECAP<span className="text-amber-500 absolute -right-1 -z-1">P</span>
        </h1>
      </div>
    </header>
  );
}

// Unified Dashboard Component (greeting + progress tiles)
function Dashboard({
  userName,
  hasRecapToday,
  isEmptyState = true,
  stats,
  moodData,
  todayRecap,
}: {
  userName: string;
  hasRecapToday: boolean;
  isEmptyState?: boolean;
  stats: { streak: number; total: number };
  moodData: MoodDayData[];
  todayRecap: DailyCard | undefined | null;
}) {
  const router = useRouter();
  const greeting = getGreeting(userName);
  const todayDate = getTodayDateFormatted();

  const handleStreakClick = () => {
    // If today's recap exists, navigate to it; otherwise create new
    if (todayRecap) {
      router.push(`/card/${todayRecap.id}`);
    } else {
      router.push('/create');
    }
  };

  const handleTotalClick = () => {
    router.push('/timeline?view=list');
  };

  const handleCreateClick = () => {
    router.push('/create');
  };

  return (
    <>
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="my-6"
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

        {/* Countdown Timer with CTA - under greeting */}
        <DayCountdown
          hasRecapToday={hasRecapToday}
          onCreateClick={handleCreateClick}
        />
      </motion.div>

      {/* Progress Section */}
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
          {/* Streak Tile - Different styles based on state */}
          <div
            onClick={handleStreakClick}
            className={cn(
              'rounded-2xl p-5 shadow-sm border cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200',
              isEmptyState
                ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                : 'bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-900/50'
            )}
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
            <p className="text-xs text-center text-neutral-500 dark:text-neutral-500 mt-3">
              Build momentum daily
            </p>
          </div>

          {/* Total Recaps Tile */}
          <div
            onClick={handleTotalClick}
            className="rounded-2xl p-5 shadow-sm border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Total Recaps
              </h3>
            </div>
            <div className="flex flex-col items-center justify-center h-20">
              <div className="text-5xl font-black text-blue-500">
                {stats.total}
              </div>
              <p className="text-xs text-blue-500 mt-1">all time</p>
            </div>
            <p className="text-xs text-center text-neutral-500 dark:text-neutral-500 mt-3">
              Every moment counts
            </p>
          </div>
        </div>

        {/* Mood Map - Full width */}
        <div className="mt-4">
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
              Start building a habit of reflection. Just a few minutes each day
              to capture what matters.
            </p>
          </motion.div>
        )}
      </motion.div>
    </>
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

  const handleStreakClick = () => {
    router.push('/timeline?view=calendar');
  };

  const handleTotalClick = () => {
    router.push('/timeline?view=list');
  };

  // Get mood data for last 28 days (4 weeks) - before early return
  const moodData = useMemo(() => getLastNDaysMoodData(cards, 28), [cards]);

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

      {/* Mobile Header */}
      <Header />

      {/* Desktop Page Header */}
      <div className="hidden lg:block sticky top-0 z-10 h-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="px-8 h-full flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {getGreeting(userName)}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {getTodayDateFormatted()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 lg:px-8 pb-24 lg:py-8">
        {/* Desktop: Dashboard Grid Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Top Stats Bar - Desktop Only */}
          <div className="hidden lg:flex lg:col-span-12 lg:gap-4 lg:mb-6 lg:items-stretch">
            {/* Streak Card */}
            <div
              onClick={handleStreakClick}
              className="flex-1 rounded-2xl flex flex-col gap-2 p-5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Streak
                </p>
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <p className="text-9xl font-black text-orange-500">
                  {stats.streak}
                </p>
                <p className="text-3xl text-orange-500 mt-1">
                  {stats.streak === 0
                    ? 'days yet'
                    : stats.streak === 1
                    ? 'day'
                    : 'days'}
                </p>
              </div>
            </div>

            {/* Total Recaps Card */}
            <div
              onClick={handleTotalClick}
              className="flex-1 rounded-2xl flex flex-col gap-2 p-5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-500" />
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Total Recaps
                </p>
              </div>
              <div className="flex flex-col items-center justify-center flex-1">
                <p className="text-9xl font-black text-blue-500">
                  {stats.total}
                </p>
                <p className="text-3xl mt-1 text-blue-500">all time</p>
              </div>
            </div>

            {/* Mood Map - constrained width */}
            <div className="flex-1">
              <MoodMapTile moodData={moodData} />
            </div>
          </div>

          {/* Mobile Dashboard */}
          <div className="lg:hidden">
            <Dashboard
              userName={userName}
              hasRecapToday={hasCards ? !!getTodayRecap(cards) : false}
              stats={stats}
              moodData={moodData}
              todayRecap={hasCards ? getTodayRecap(cards) : null}
              isEmptyState={!hasCards}
            />
          </div>

          {/* Pinned Cards - Full Width on Desktop */}
          {hasCards && hasPinnedCards && (
            <div className="lg:col-span-12 mb-6 lg:mb-0">
              <div className="mb-4 flex items-center gap-2">
                <Pin className="size-5 -rotate-45" />
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Pinned Recaps
                </h2>
              </div>
              <div className="relative -mr-4 lg:mx-0">
                <div
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pr-4 lg:px-0 pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {pinnedCards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="snap-start h-full shrink-0 w-[65%] lg:w-auto first:ml-0"
                    >
                      <DailyCardView
                        card={card}
                        variant="compact"
                        onClick={() => router.push(`/card/${card.id}`)}
                        className="flex flex-col"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Recaps - Full Width on Desktop */}
          {hasCards && (
            <div className="lg:col-span-12 mt-6 lg:mt-0">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Recent Recaps
                </h2>
              </div>
              <div className="relative -mr-4 lg:mx-0">
                <div
                  ref={scrollRef}
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pr-4 lg:px-0 pb-4 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:overflow-visible"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {effectiveCards.slice(0, 12).map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="snap-start shrink-0 h-full w-[65%] lg:w-auto first:ml-0"
                    >
                      <DailyCardView
                        card={card}
                        variant="compact"
                        onClick={() => router.push(`/card/${card.id}`)}
                        className="flex flex-col"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
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
