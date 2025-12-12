'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Brain, Calendar, Flame, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Utility function to get time-based greeting
function getGreeting(): { title: string; subtitle: string } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      title: 'Good morning',
      subtitle: 'Ready to start your day?',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      title: 'Good afternoon',
      subtitle: 'How has your day been so far?',
    };
  } else if (hour >= 17 && hour < 22) {
    return {
      title: 'Good evening',
      subtitle: 'Ready to reflect on your day?',
    };
  } else {
    return {
      title: 'Good evening',
      subtitle: "Time to capture today's moments",
    };
  }
}

// Utility function to format today's date
function getTodayDate(): string {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Hero Question Card Component
function HeroQuestionCard() {
  const router = useRouter();
  const greeting = getGreeting();
  const todayDate = getTodayDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30 rounded-3xl p-8 shadow-lg border border-amber-100/50 dark:border-amber-900/30 mb-6"
    >
      <div className="mb-6">
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
          {todayDate}
        </p>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {greeting.title}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          {greeting.subtitle}
        </p>
      </div>

      <div className="mb-6 p-5 bg-white/60 dark:bg-black/20 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 backdrop-blur-sm">
        <p className="text-neutral-600 dark:text-neutral-300 italic text-center text-lg font-medium">
          "What stood out today?"
        </p>
      </div>

      <Button
        onClick={() => router.push('/create')}
        className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-base rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
      >
        Start Today's Recap
      </Button>
    </motion.div>
  );
}

// Dashboard Tile Component
interface DashboardTileProps {
  variant: 'mood' | 'calendar' | 'streak' | 'insights' | 'highlights';
  delay?: number;
}

function DashboardTile({ variant, delay = 0 }: DashboardTileProps) {
  const configs = {
    mood: {
      title: 'Mood Map',
      icon: <Brain className="h-5 w-5" />,
      content: (
        <div className="flex items-center justify-center h-20">
          <svg className="w-16 h-16" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray="5,5"
              className="text-neutral-300 dark:text-neutral-700"
              opacity="0.5"
            />
          </svg>
        </div>
      ),
      description: 'Your emotional patterns',
    },
    calendar: {
      title: 'Monthly Calendar',
      icon: <Calendar className="h-5 w-5" />,
      content: (
        <div className="grid grid-cols-7 gap-1 h-20 opacity-40">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ),
      description: 'Track your consistency',
    },
    streak: {
      title: 'Streak',
      icon: <Flame className="h-5 w-5" />,
      content: (
        <div className="flex flex-col items-center justify-center h-20">
          <div className="text-5xl font-black text-neutral-300 dark:text-neutral-700">
            0
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
            days yet
          </p>
        </div>
      ),
      description: 'Build momentum daily',
    },
    insights: {
      title: 'Insights',
      icon: <TrendingUp className="h-5 w-5" />,
      content: (
        <div className="flex items-center justify-center h-20">
          <p className="text-sm text-center text-neutral-400 dark:text-neutral-600 italic px-4">
            Your patterns will appear here
          </p>
        </div>
      ),
      description: 'Discover what matters',
    },
    highlights: {
      title: 'Highlights',
      icon: <Sparkles className="h-5 w-5" />,
      content: (
        <div className="flex items-center justify-center h-20 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl opacity-50 blur-sm" />
          <p className="relative text-xs text-neutral-400 dark:text-neutral-600 text-center px-4">
            Your best moments
          </p>
        </div>
      ),
      description: 'Celebrate wins',
    },
  };

  const config = configs[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="text-neutral-500 dark:text-neutral-400">
          {config.icon}
        </div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
          {config.title}
        </h3>
      </div>
      {config.content}
      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-3">
        {config.description}
      </p>
    </motion.div>
  );
}

// Main Empty State Component
export function EmptyStateHome() {
  return (
    <div className="max-w-md mx-auto px-5 pt-32 pb-24 min-h-screen">
      <HeroQuestionCard />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
          What You'll Unlock
        </h3>
      </motion.div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <DashboardTile variant="streak" delay={0.4} />
        <DashboardTile variant="mood" delay={0.5} />
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <DashboardTile variant="calendar" delay={0.6} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DashboardTile variant="insights" delay={0.7} />
        <DashboardTile variant="highlights" delay={0.8} />
      </div>

      {/* Motivational Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-neutral-500 dark:text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Start building a habit of reflection. Just a few minutes each day to
          capture what matters.
        </p>
      </motion.div>
    </div>
  );
}
