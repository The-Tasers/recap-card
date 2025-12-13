'use client';

import { useMemo, useState, Suspense, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Clock, CalendarDays } from 'lucide-react';

import { useCardStore } from '@/lib/store';
import { Onboarding } from '@/components/onboarding';
import {
  getGreeting,
  getTodayDateFormatted,
  getTodayRecap,
  getLastNDaysMoodData,
  type MoodDayData,
} from '@/lib/daily-utils';
import { MoodMapTile } from '@/components/mood-map-tile';
import { CreateSheet } from '@/components/create-sheet';
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
      className="mb-6"
    >
      <div className="relative flex flex-col items-center gap-2 md:gap-2.5 px-3 py-3 md:px-4 md:py-3 bg-linear-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30 border border-amber-300/60 dark:border-amber-800/50 rounded-xl md:rounded-2xl shadow-sm">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-linear-to-r from-amber-400/5 via-orange-400/5 to-rose-400/5 dark:from-amber-400/10 dark:via-orange-400/10 dark:to-rose-400/10 rounded-xl md:rounded-2xl blur-xl" />

        <div className="relative flex items-center gap-1.5 md:gap-2">
          <Clock className="h-3 w-3 md:h-4 md:w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
          <span className="text-xs md:text-sm font-bold text-amber-800 dark:text-amber-300 tabular-nums">
            {timeLeft} to reflect
          </span>
        </div>
        <p className="relative text-[10px] md:text-xs text-amber-700/90 dark:text-amber-400/90 font-semibold">
          {message}
        </p>

        {/* CTA Button */}
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="relative w-full h-8 md:h-9 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs md:text-sm rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            Capture Today
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
  onCreateClick,
}: {
  userName: string;
  hasRecapToday: boolean;
  isEmptyState?: boolean;
  stats: { streak: number; total: number };
  moodData: MoodDayData[];
  todayRecap: DailyCard | undefined | null;
  onCreateClick: () => void;
}) {
  const router = useRouter();
  const greeting = getGreeting(userName);
  const todayDate = getTodayDateFormatted();

  const handleStreakClick = () => {
    router.push('/timeline?view=calendar');
  };

  const handleTotalClick = () => {
    router.push('/timeline?view=list');
  };

  const handleCreateClick = () => {
    onCreateClick();
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
          {!isEmptyState && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Your daily mindfulness companion
            </p>
          )}
        </div>

        {/* Countdown Timer with CTA - under greeting */}
        <DayCountdown
          hasRecapToday={hasRecapToday}
          onCreateClick={handleCreateClick}
        />
      </motion.div>

      {/* Progress Section - Hide until first recap */}
      {!isEmptyState && (
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

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Streak Tile - Different styles based on state */}
            <div
              onClick={handleStreakClick}
              className={cn(
                'rounded-2xl p-3 md:p-5 shadow-sm border cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200',
                isEmptyState
                  ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                  : 'bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-900/50'
              )}
            >
              <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                <h3 className="font-semibold text-sm md:text-base text-neutral-900 dark:text-neutral-100">
                  Streak
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center h-16 md:h-20">
                <div
                  className={cn(
                    'text-4xl md:text-5xl font-black',
                    stats.streak > 0
                      ? 'text-orange-500'
                      : 'text-neutral-300 dark:text-neutral-700'
                  )}
                >
                  {stats.streak}
                </div>
                <p
                  className={cn(
                    'text-[10px] md:text-xs mt-1',
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
              <p className="text-[10px] md:text-xs text-center text-neutral-500 dark:text-neutral-500 mt-2 md:mt-3">
                Build momentum daily
              </p>
            </div>

            {/* Total Recaps Tile */}
            <div
              onClick={handleTotalClick}
              className="rounded-2xl p-3 md:p-5 shadow-sm border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                <CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                <h3 className="font-semibold text-sm md:text-base text-neutral-900 dark:text-neutral-100">
                  Total
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center h-16 md:h-20">
                <div className="text-4xl md:text-5xl font-black text-blue-500">
                  {stats.total}
                </div>
                <p className="text-[10px] md:text-xs text-blue-500 mt-1">
                  all time
                </p>
              </div>
              <p className="text-[10px] md:text-xs text-center text-neutral-500 dark:text-neutral-500 mt-2 md:mt-3">
                Every moment counts
              </p>
            </div>
          </div>

          {/* Mood Map - Full width */}
          <div className="mt-4">
            <MoodMapTile moodData={moodData} />
          </div>
        </motion.div>
      )}

      {/* Motivational Message - Empty State */}
      {isEmptyState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 lg:mt-12"
        >
          <div className="bg-linear-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-3xl p-6 lg:p-10 border border-violet-200 dark:border-violet-900/50 shadow-sm">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-4 lg:mb-6">
                <span className="text-5xl lg:text-7xl">🌟</span>
              </div>
              <h3 className="text-xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 lg:mb-4">
                Start Your Mindful Journey
              </h3>
              <p className="text-sm lg:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 lg:mb-6">
                Track your mood, celebrate wins, and reflect daily.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 text-left">
                <div className="bg-white/50 dark:bg-neutral-900/50 rounded-2xl p-4 lg:p-5">
                  <div className="text-2xl lg:text-3xl mb-2">🧘</div>
                  <h4 className="font-semibold text-sm lg:text-base text-neutral-900 dark:text-neutral-100 mb-1">
                    Daily Mindfulness
                  </h4>
                  <p className="text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">
                    Practice self-awareness by reflecting on your day
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-neutral-900/50 rounded-2xl p-4 lg:p-5">
                  <div className="text-2xl lg:text-3xl mb-2">📊</div>
                  <h4 className="font-semibold text-sm lg:text-base text-neutral-900 dark:text-neutral-100 mb-1">
                    Track Your Mood
                  </h4>
                  <p className="text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">
                    Gain insights into your emotional patterns
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-neutral-900/50 rounded-2xl p-4 lg:p-5">
                  <div className="text-2xl lg:text-3xl mb-2">🎯</div>
                  <h4 className="font-semibold text-sm lg:text-base text-neutral-900 dark:text-neutral-100 mb-1">
                    Celebrate Progress
                  </h4>
                  <p className="text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">
                    Build meaningful habits, one day at a time
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateClick}
                className="mt-6 lg:mt-8 w-full lg:w-auto lg:px-12 h-12 lg:h-14 bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold text-sm lg:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                Create Your First Recap
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

// Main Home Page Component
function HomePageInner() {
  const router = useRouter();
  const { cards, hydrated, hasSeenOnboarding, userName, setHasSeenOnboarding } =
    useCardStore();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

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
          {/* Top Stats Bar - Desktop Only - Hide until first recap */}
          {hasCards && (
            <div className="hidden lg:flex lg:col-span-12 lg:gap-3 xl:gap-4 lg:mb-6 lg:items-stretch">
              {/* Streak & Total Container - Stack on medium, horizontal on xl */}
              <div className="flex lg:flex-col xl:flex-row lg:gap-3 xl:gap-4 xl:flex-1 lg:h-full">
                {/* Streak Card */}
                <div
                  onClick={handleStreakClick}
                  className={cn(
                    'flex-1 rounded-2xl flex flex-col border gap-2 p-4 xl:p-5 hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer',
                    !hasCards
                      ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                      : 'bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-900/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 xl:h-5 xl:w-5 text-orange-500" />
                    <p className="font-semibold text-lg xl:text-2xl text-neutral-900 dark:text-neutral-100">
                      Streak
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center flex-1">
                    <p className="text-6xl xl:text-9xl font-black text-orange-500">
                      {stats.streak}
                    </p>
                    <p className="text-xl xl:text-3xl text-orange-500 mt-1">
                      {stats.streak === 0
                        ? 'days yet'
                        : stats.streak === 1
                        ? 'day'
                        : 'days'}
                    </p>
                  </div>
                  <p className="text-xs text-center text-neutral-500 dark:text-neutral-500 mt-2">
                    Build momentum daily
                  </p>
                </div>

                {/* Total Recaps Card */}
                <div
                  onClick={handleTotalClick}
                  className="flex-1 rounded-2xl flex flex-col gap-2 p-4 xl:p-5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 xl:h-5 xl:w-5 text-blue-500" />
                    <p className="font-semibold text-lg xl:text-2xl text-neutral-900 dark:text-neutral-100">
                      Total
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center flex-1">
                    <p className="text-6xl xl:text-9xl font-black text-blue-500">
                      {stats.total}
                    </p>
                    <p className="text-xl xl:text-3xl mt-1 text-blue-500">
                      all time
                    </p>
                  </div>
                  <p className="text-xs text-center text-neutral-500 dark:text-neutral-500 mt-2">
                    Every moment counts
                  </p>
                </div>
              </div>

              {/* Mood Map - constrained width */}
              <div className="flex-1 lg:h-full">
                <MoodMapTile moodData={moodData} />
              </div>
            </div>
          )}

          {/* Mobile Dashboard */}
          <div className="lg:hidden">
            <Dashboard
              userName={userName}
              hasRecapToday={hasCards ? !!getTodayRecap(cards) : false}
              stats={stats}
              moodData={moodData}
              todayRecap={hasCards ? getTodayRecap(cards) : null}
              isEmptyState={!hasCards}
              onCreateClick={() => setIsCreateSheetOpen(true)}
            />
          </div>

          {/* Desktop Empty State - Welcome Block */}
          {!hasCards && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="hidden lg:block lg:col-span-12 mt-8"
            >
              <div className="bg-linear-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-3xl p-10 border border-violet-200 dark:border-violet-900/50 shadow-sm">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="mb-6">
                    <span className="text-7xl">🌟</span>
                  </div>
                  <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                    Start Your Mindful Journey
                  </h3>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                    Track your mood, celebrate wins, and reflect daily.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-left">
                    <div className="bg-white/50 dark:bg-neutral-900/50 rounded-2xl p-5">
                      <div className="text-3xl mb-2">🧘</div>
                      <h4 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 mb-1">
                        Daily Mindfulness
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Practice self-awareness by reflecting on your day
                      </p>
                    </div>
                    <div className="bg-white/50 dark:bg-neutral-900/50 rounded-2xl p-5">
                      <div className="text-3xl mb-2">📊</div>
                      <h4 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 mb-1">
                        Track Your Mood
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Gain insights into your emotional patterns
                      </p>
                    </div>
                    <div className="bg-white/50 dark:bg-neutral-900/50 rounded-2xl p-5">
                      <div className="text-3xl mb-2">🎯</div>
                      <h4 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 mb-1">
                        Celebrate Progress
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Build meaningful habits, one day at a time
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCreateSheetOpen(true)}
                    className="mt-8 w-auto px-12 h-14 bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    Create Your First Recap
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Create Sheet */}
      <CreateSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
      />
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
