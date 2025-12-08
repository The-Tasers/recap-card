'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '@/lib/store';
import { DailyCard, COLOR_PALETTES, STORY_TEMPLATES, PaletteId } from '@/lib/types';
import { DailyCardView } from '@/components/daily-card-view';
import { Onboarding } from '@/components/onboarding';
import {
  Sparkles,
  Plus,
  Calendar,
  TrendingUp,
  ChevronRight,
  Share2,
  ArrowRight,
  Palette,
  Layout,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Sample cards for showcasing when user has no cards
const SAMPLE_CARDS: Partial<DailyCard>[] = [
  {
    id: 'sample-1',
    mood: 'great',
    text: 'Perfect morning coffee and finished my project!',
    createdAt: new Date().toISOString(),
    palette: 'pastelDream',
  },
  {
    id: 'sample-2',
    mood: 'good',
    text: 'Took a long walk in the park today. Feeling refreshed.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    palette: 'warmCinematic',
  },
  {
    id: 'sample-3',
    mood: 'neutral',
    text: 'Regular day at work. Looking forward to the weekend.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    palette: 'forestMist',
  },
];

// Palette showcase data
const SHOWCASE_PALETTES: PaletteId[] = [
  'pastelDream',
  'warmCinematic',
  'cyberGradient',
  'forestMist',
  'sunsetBoulevard',
];

// Hero Section Component
function HeroSection({ hasCards }: { hasCards: boolean }) {
  return (
    <section className="relative mb-8 overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-linear-to-br from-amber-200/50 to-orange-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -right-20 w-52 h-52 rounded-full bg-linear-to-br from-violet-200/50 to-pink-200/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 pt-2 pb-6">
        {/* App branding */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Day Recap</h1>
            <p className="text-xs text-neutral-500">Your visual diary</p>
          </div>
        </div>

        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight mb-3">
            Create beautiful daily
            <br />
            <span className="bg-linear-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              recap cards
            </span>{' '}
            you&apos;ll want
            <br />
            to share
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed max-w-[280px]">
            A personal visual diary that&apos;s easy to create and beautiful to share on stories
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6"
        >
          <Link href="/create">
            <Button className="h-14 px-8 rounded-2xl text-base font-semibold bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-orange-500/25">
              <Plus className="h-5 w-5 mr-2" />
              {hasCards ? "Create Today's Card" : 'Create Your First Card'}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Story Mockup Component - shows card in phone frame
function StoryMockup({ palette }: { palette: PaletteId }) {
  const paletteData = COLOR_PALETTES[palette];

  return (
    <div className="relative">
      {/* Phone frame */}
      <div className="relative w-28 h-48 rounded-2xl bg-neutral-900 p-1 shadow-xl">
        {/* Screen */}
        <div
          className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: paletteData.gradient }}
        >
          {/* Mini card content */}
          <div className="w-[85%] aspect-9/16 rounded-lg p-2 flex flex-col justify-end" style={{ background: paletteData.surface }}>
            <div className="space-y-1">
              <div className="h-1 w-8 rounded-full" style={{ background: paletteData.textSecondary }} />
              <div className="h-1 w-12 rounded-full" style={{ background: paletteData.textSecondary }} />
              <div className="h-1.5 w-6 rounded-full" style={{ background: paletteData.accent }} />
            </div>
          </div>
        </div>
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-neutral-800" />
      </div>
    </div>
  );
}

// Templates Carousel
function TemplatesCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const templates = Object.entries(STORY_TEMPLATES).slice(0, 6);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
            <Layout className="h-4 w-4 text-violet-500" />
            Card Templates
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            8 beautiful layouts for your stories
          </p>
        </div>
        <Link href="/create">
          <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-700 -mr-2">
            See all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div
        ref={containerRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {templates.map(([id, template]) => (
          <motion.div
            key={id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 snap-start"
          >
            <Link href="/create">
              <div className="w-24 h-36 rounded-xl bg-linear-to-br from-neutral-100 to-neutral-50 border border-neutral-100 flex flex-col items-center justify-center p-3 cursor-pointer hover:border-amber-200 transition-colors">
                <div className="w-full aspect-9/16 rounded-lg bg-linear-to-br from-amber-50 to-violet-50 mb-2 flex items-end p-1.5">
                  <div className="w-full space-y-0.5">
                    <div className="h-0.5 w-6 rounded-full bg-neutral-300" />
                    <div className="h-0.5 w-4 rounded-full bg-neutral-200" />
                  </div>
                </div>
                <span className="text-[10px] text-neutral-600 text-center line-clamp-1">
                  {template.name}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Color Themes Showcase
function ThemesShowcase() {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
            <Palette className="h-4 w-4 text-amber-500" />
            Color Themes
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            7 cinematic palettes to match your mood
          </p>
        </div>
        <Link href="/create">
          <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-700 -mr-2">
            Explore
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        {SHOWCASE_PALETTES.map((paletteId) => {
          const palette = COLOR_PALETTES[paletteId];
          return (
            <motion.div
              key={paletteId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="shrink-0"
            >
              <Link href="/create">
                <div className="w-20 cursor-pointer group">
                  <div
                    className="w-20 h-20 rounded-2xl shadow-md group-hover:shadow-lg transition-shadow border border-white/50"
                    style={{ background: palette.gradient }}
                  >
                    <div className="w-full h-full rounded-2xl flex items-end p-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: palette.accent }} />
                        <div className="w-2 h-2 rounded-full" style={{ background: palette.textSecondary }} />
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-600 mt-1.5 block text-center">
                    {palette.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// Shareability Showcase
function ShareabilitySection() {
  return (
    <section className="mb-8">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-500 to-purple-600 p-6 text-white">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl transform translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 blur-xl transform -translate-x-6 translate-y-6" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="shrink-0">
            <StoryMockup palette="cyberGradient" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide opacity-80">
                Story-Ready
              </span>
            </div>
            <h3 className="font-bold text-lg leading-tight mb-1">
              Perfect for Instagram & TikTok
            </h3>
            <p className="text-xs opacity-80 leading-relaxed">
              Cards export in 9:16 format, optimized for stories
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Stats Bar Component
function StatsBar({ stats }: { stats: { total: number; thisMonth: number; streak: number } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 gap-3 mb-6"
    >
      <div className="text-center p-3 rounded-2xl bg-linear-to-br from-amber-50 to-orange-50 border border-amber-100">
        <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
        <div className="text-[10px] text-neutral-500 uppercase tracking-wide">Total</div>
      </div>
      <div className="text-center p-3 rounded-2xl bg-linear-to-br from-violet-50 to-purple-50 border border-violet-100">
        <div className="text-2xl font-bold text-neutral-900 flex items-center justify-center gap-1">
          <Calendar className="h-4 w-4" />
          {stats.thisMonth}
        </div>
        <div className="text-[10px] text-neutral-500 uppercase tracking-wide">This Month</div>
      </div>
      <div className="text-center p-3 rounded-2xl bg-linear-to-br from-pink-50 to-rose-50 border border-pink-100">
        <div className="text-2xl font-bold text-neutral-900 flex items-center justify-center gap-1">
          <TrendingUp className="h-4 w-4" />
          {stats.streak}
        </div>
        <div className="text-[10px] text-neutral-500 uppercase tracking-wide">Day Streak</div>
      </div>
    </motion.div>
  );
}

// Recent Cards Timeline
function RecentTimeline({ cards, onCardClick }: { cards: DailyCard[]; onCardClick: (id: string) => void }) {
  const recentCards = cards.slice(0, 5);

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-900">Your Timeline</h3>
        {cards.length > 5 && (
          <Link href="/?view=timeline">
            <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-700 -mr-2">
              View all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {recentCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <DailyCardView
              card={card}
              variant="compact"
              onClick={() => onCardClick(card.id)}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Empty State - New User Experience
function NewUserExperience() {
  return (
    <>
      {/* Sample cards showcase */}
      <section className="mb-8">
        <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Example Cards
        </h3>
        <div className="space-y-3">
          {SAMPLE_CARDS.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="opacity-80"
            >
              <DailyCardView
                card={card as DailyCard}
                variant="compact"
              />
            </motion.div>
          ))}
        </div>
      </section>

      <TemplatesCarousel />
      <ThemesShowcase />
      <ShareabilitySection />
    </>
  );
}

// Main Home Page Component
export default function HomePage() {
  const router = useRouter();
  const { cards, hydrated, hasSeenOnboarding, setHasSeenOnboarding } = useCardStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  // Show onboarding for new users
  useEffect(() => {
    if (hydrated && !hasSeenOnboarding && cards.length === 0) {
      setShowOnboarding(true);
    }
  }, [hydrated, hasSeenOnboarding, cards.length]);

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

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

  return (
    <>
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Grain texture overlay */}
        <div className="grain-subtle fixed inset-0 pointer-events-none opacity-30" />

        {/* Hero Section */}
        <HeroSection hasCards={hasCards} />

        {hasCards ? (
          <>
            {/* Stats */}
            <StatsBar stats={stats} />

            {/* Recent cards */}
            <RecentTimeline
              cards={cards}
              onCardClick={(id) => router.push(`/card/${id}`)}
            />

            {/* Templates and themes for existing users */}
            <TemplatesCarousel />
            <ThemesShowcase />
          </>
        ) : (
          <NewUserExperience />
        )}

        {/* Floating CTA for returning users with cards */}
        {hasCards && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
          >
            <Link href="/create">
              <Button className="h-14 px-6 rounded-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xl shadow-orange-500/30 text-base font-semibold">
                <Plus className="h-5 w-5 mr-2" />
                Add Today&apos;s Card
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </>
  );
}
