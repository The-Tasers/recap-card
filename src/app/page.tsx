'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCardStore } from '@/lib/store';
import { Mood } from '@/lib/types';
import { DailyCardView } from '@/components/daily-card-view';
import { EmptyState } from '@/components/empty-state';
import { MoodFilter } from '@/components/mood-filter';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { cards, hydrated } = useCardStore();
  const [moodFilter, setMoodFilter] = useState<Mood | 'all'>('all');

  const filteredCards = useMemo(() => {
    if (moodFilter === 'all') return cards;
    return cards.filter((card) => card.mood === moodFilter);
  }, [cards, moodFilter]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold text-neutral-800">Day Recap</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Your daily moments, beautifully captured
        </p>
      </header>

      {cards.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Filters */}
          <div className="mb-6">
            <MoodFilter value={moodFilter} onChange={setMoodFilter} />
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {filteredCards.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No cards match this filter
              </div>
            ) : (
              filteredCards.map((card) => (
                <DailyCardView
                  key={card.id}
                  card={card}
                  variant="compact"
                  onClick={() => router.push(`/card/${card.id}`)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
