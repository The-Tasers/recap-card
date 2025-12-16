'use client';

import { useEffect } from 'react';
import { useCardStore } from '@/lib/store';
import { Mood } from '@/lib/types';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const MOOD_CLASSES = ['mood-great', 'mood-good', 'mood-neutral', 'mood-bad', 'mood-terrible'] as const;

function getMoodClass(mood: Mood): string {
  const moodMap: Record<Mood, string> = {
    great: 'mood-great',
    good: 'mood-good',
    neutral: 'mood-neutral',
    bad: 'mood-bad',
    terrible: 'mood-terrible',
  };
  return moodMap[mood];
}

function getTodaysMood(cards: { createdAt: string; mood: Mood }[]): Mood | null {
  const today = new Date().toDateString();
  const todayCard = cards.find(
    (card) => new Date(card.createdAt).toDateString() === today
  );
  return todayCard?.mood ?? null;
}

// Utility function to apply mood class immediately (for preview during editing)
export function applyMoodClass(mood: Mood): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  MOOD_CLASSES.forEach((cls) => root.classList.remove(cls));
  root.classList.add(getMoodClass(mood));
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { hydrated, cards } = useCardStore();

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;

    // Clear all mood classes first
    MOOD_CLASSES.forEach((cls) => root.classList.remove(cls));

    // Always dark mode
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');

    // Apply mood class for accent colors based on today's entry
    const todaysMood = getTodaysMood(cards);
    if (todaysMood) {
      root.classList.add(getMoodClass(todaysMood));
    } else {
      // Default to neutral if no entry today
      root.classList.add('mood-neutral');
    }
  }, [hydrated, cards]);

  return <>{children}</>;
}
