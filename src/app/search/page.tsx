'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { DailyCard } from '@/lib/types';
import { SearchBar, SearchFilters } from '@/components/search-filter';
import { DailyCardView } from '@/components/daily-card-view';
import { Button } from '@/components/ui/button';

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  mood: 'all',
  hasPhoto: 'all',
  dateRange: 'all',
  tags: [],
};

function filtersFromParams(params: ReturnType<typeof useSearchParams>) {
  const dateRange = params.get('dateRange');
  const mood = params.get('mood');
  const hasPhoto = params.get('hasPhoto');

  return {
    ...DEFAULT_FILTERS,
    dateRange:
      dateRange === 'today' ||
      dateRange === 'week' ||
      dateRange === 'month' ||
      dateRange === 'year'
        ? dateRange
        : DEFAULT_FILTERS.dateRange,
    mood:
      mood === 'great' ||
      mood === 'good' ||
      mood === 'neutral' ||
      mood === 'bad' ||
      mood === 'terrible'
        ? mood
        : DEFAULT_FILTERS.mood,
    hasPhoto:
      hasPhoto === 'yes' || hasPhoto === 'no' || hasPhoto === 'all'
        ? hasPhoto
        : DEFAULT_FILTERS.hasPhoto,
  } satisfies SearchFilters;
}

function filterCards(cards: DailyCard[], filters: SearchFilters) {
  const now = new Date();

  const matchesDateRange = (createdAt: string) => {
    const date = new Date(createdAt);
    switch (filters.dateRange) {
      case 'today': {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return date >= start;
      }
      case 'week': {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        return date >= start;
      }
      case 'month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return date >= start;
      }
      case 'year': {
        const start = new Date(now.getFullYear(), 0, 1);
        return date >= start;
      }
      default:
        return true;
    }
  };

  return cards.filter((card) => {
    const textMatch = filters.query
      ? card.text.toLowerCase().includes(filters.query.toLowerCase())
      : true;

    const moodMatch = filters.mood === 'all' || card.mood === filters.mood;

    const photoMatch =
      filters.hasPhoto === 'all'
        ? true
        : filters.hasPhoto === 'yes'
        ? Boolean(card.photoUrl)
        : !card.photoUrl;

    const dateMatch = matchesDateRange(card.createdAt);

    const tagsMatch =
      filters.tags.length === 0 ||
      (card.tags || []).some((tag) => filters.tags.includes(tag));

    return textMatch && moodMatch && photoMatch && dateMatch && tagsMatch;
  });
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cards, hydrated } = useCardStore();
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    setFilters(filtersFromParams(searchParams));
  }, [searchParams]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((card) => {
      card.tags?.forEach((tag) => set.add(tag));
    });
    return Array.from(set);
  }, [cards]);

  const filteredCards = useMemo(() => {
    const result = filterCards(cards, filters);
    return [...result].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [cards, filters]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <header className="mb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Search
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Find your cards
          </p>
        </div>
      </header>

      <div className="mb-6">
        <SearchBar
          filters={filters}
          onFiltersChange={setFilters}
          availableTags={availableTags}
        />
      </div>

      {filteredCards.length === 0 ? (
        <div className="text-center text-sm text-neutral-500 dark:text-neutral-400 py-16">
          {cards.length === 0
            ? 'No cards yet. Create your first recap.'
            : 'No cards match your search.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCards.map((card) => (
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
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-muted-foreground">
          Loading...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
