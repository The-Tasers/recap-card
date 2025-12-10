'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, List, NotebookPen } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { DailyCard } from '@/lib/types';
import { SearchBar, SearchFilters } from '@/components/search-filter';
import { CalendarView } from '@/components/calendar-view';
import { DailyCardView } from '@/components/daily-card-view';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

function TimelineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cards, hydrated } = useCardStore();
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Initialize filters from search params on mount
  useEffect(() => {
    setFilters(filtersFromParams(searchParams));
  }, [searchParams]);

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

  const cardsForSelectedDate = useMemo(() => {
    if (!selectedDate) return filteredCards;
    return filteredCards.filter(
      (card) =>
        new Date(card.createdAt).toDateString() === selectedDate.toDateString()
    );
  }, [filteredCards, selectedDate]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Loading your recaps...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-24">
      <header className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 px-4 py-4 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
                Timeline
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                All your recaps, in one place
              </p>
            </div>
          </div>
          <div className="flex gap-2" aria-label="View mode">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'rounded-full h-10 w-10',
                viewMode === 'list' &&
                  'bg-primary/10 text-primary border-primary'
              )}
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'rounded-full h-10 w-10',
                viewMode === 'calendar' &&
                  'bg-primary/10 text-primary border-primary'
              )}
              onClick={() => setViewMode('calendar')}
              aria-pressed={viewMode === 'calendar'}
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4">
        <div className="mb-6">
          <SearchBar filters={filters} onFiltersChange={setFilters} />
        </div>

        {viewMode === 'list' ? (
          filteredCards.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <NotebookPen className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {cards.length === 0
                  ? 'No recaps yet.'
                  : 'No recaps match your filters.'}
              </p>
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
          )
        ) : (
          <div className="space-y-4">
            <CalendarView
              cards={filteredCards}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {cardsForSelectedDate.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <NotebookPen className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {selectedDate
                    ? 'No recap on this day.'
                    : cards.length === 0
                    ? 'No recaps yet.'
                    : 'No recaps match your filters.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cardsForSelectedDate.map((card) => (
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
        )}
      </div>
    </div>
  );
}

export default function TimelinePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-muted-foreground">
          Loading your recaps...
        </div>
      }
    >
      <TimelineContent />
    </Suspense>
  );
}
