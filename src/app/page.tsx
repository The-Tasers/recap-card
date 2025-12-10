'use client';

import { useMemo, useState, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Calendar, Sparkles, NotebookPen } from 'lucide-react';

import { useCardStore } from '@/lib/store';
import { Onboarding } from '@/components/onboarding';
import { DailyCardView } from '@/components/daily-card-view';

// Header Component
function Header({ userName }: { userName: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 mb-1 tracking-tight">
        RECAPP
      </h1>
      {userName && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Welcome back, {userName}
        </p>
      )}
    </header>
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

      {/* Main content */}
      <div className="max-w-md mx-auto px-5 py-6 pb-24">
        {/* Header */}
        <Header userName={userName} />

        {/* Weekly Progress Block */}
        <div className="mb-6 bg-linear-to-br from-violet-500 to-purple-600 dark:from-violet-600 dark:to-purple-700 rounded-3xl p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-sm text-violet-100 mb-1">Weekly recaps</p>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {stats.thisWeek} OF 7 DAYS
            </h2>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-violet-100 flex items-center gap-1">
                {stats.thisWeek === 7 ? (
                  <>
                    Perfect week! <Sparkles className="h-3 w-3" />
                  </>
                ) : (
                  `${7 - stats.thisWeek} ${
                    7 - stats.thisWeek === 1 ? 'recap' : 'recaps'
                  } to go`
                )}
              </span>
              <span className="text-xs font-semibold text-white">
                {stats.weekProgress}%
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${stats.weekProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="bg-linear-to-br from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-orange-100 mb-1 flex items-center gap-1.5">
              <Flame className="h-4 w-4" />
              Streak
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {stats.streak}
              </span>
              <span className="text-sm text-orange-100 font-medium">
                {stats.streak === 1 ? 'recap' : 'recaps'}
              </span>
            </div>
          </div>
          <div className="bg-linear-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-emerald-100 mb-1 flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              This Month
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {stats.thisMonth}
              </span>
              <span className="text-sm text-emerald-100 font-medium">
                {stats.thisMonth === 1 ? 'recap' : 'recaps'}
              </span>
            </div>
          </div>
        </div>

        {/* Pinned Cards Section */}
        {hasPinnedCards && (
          <>
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
          </>
        )}

        {/* Recent Recaps Section */}
        {hasCards && (
          <div className="mb-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Recent Recaps
            </h2>
          </div>
        )}

        {/* Cards Carousel */}
        {!hasCards ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
              <NotebookPen className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              No recaps yet
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Tap the button below to create your first daily recap
            </p>
          </div>
        ) : (
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
        )}
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
