'use client';

import { useMemo, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sunrise } from 'lucide-react';

import { DailyCard } from '@/lib/types';
import { useCardStore } from '@/lib/store';
import { Onboarding } from '@/components/onboarding';
import { DailyCardView } from '@/components/daily-card-view';

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
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekCount = cards.filter(
    (c) => new Date(c.createdAt) >= startOfWeek
  ).length;

  return (
    <div className="mb-6 space-y-3">
      {/* Primary stats - larger tiles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-5 bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-lg">
          <div className="text-4xl font-bold mb-1">{stats.total}</div>
          <div className="text-sm opacity-90">Total Recaps</div>
        </div>
        <div className="rounded-2xl p-5 bg-linear-to-br from-violet-500 to-purple-600 text-white shadow-lg">
          <div className="text-4xl font-bold mb-1">{stats.streak}</div>
          <div className="text-sm opacity-90">Day Streak 🔥</div>
        </div>
      </div>

      {/* Secondary stats - compact */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl p-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {weekCount}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            This Week
          </div>
        </div>
        <div className="flex-1 rounded-xl p-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {stats.thisMonth}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            This Month
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Home Page Component
function HomePageInner() {
  const router = useRouter();
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

        {/* Recent Cards */}
        {hasCards && (
          <div className="mb-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Recent
            </h3>
          </div>
        )}

        {/* Cards Display */}
        {!hasCards ? (
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400 text-sm">
            No cards yet. Tap the 📓 Recap button to create your first one.
          </div>
        ) : (
          <div className="space-y-3">
            {effectiveCards.map((card) => (
              <DailyCardView
                key={card.id}
                card={card}
                variant="compact"
                onClick={() => router.push(`/card/${card.id}`)}
              />
            ))}
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
