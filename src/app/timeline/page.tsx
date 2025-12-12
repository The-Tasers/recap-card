'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, List } from 'lucide-react';
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

  // Derive filters and view mode from search params
  const filters = useMemo(
    () => filtersFromParams(searchParams),
    [searchParams]
  );
  const viewModeFromParams = useMemo(() => {
    const view = searchParams.get('view');
    return view === 'calendar' || view === 'list' ? view : 'list';
  }, [searchParams]);

  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(
    viewModeFromParams
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Update local state when URL params change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalFilters(filters);
    setViewMode(viewModeFromParams);
  }, [filters, viewModeFromParams]);

  const filteredCards = useMemo(() => {
    const result = filterCards(cards, localFilters);
    return [...result].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [cards, localFilters]);

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
    <div className="pb-24 min-h-screen">
      {/* Page Header */}
      <header className="sticky top-0 z-10 h-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
        <div className="px-4 lg:px-8 h-full flex items-center">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full lg:hidden"
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  Timeline
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {filteredCards.length}{' '}
                  {filteredCards.length === 1 ? 'recap' : 'recaps'}
                </p>
              </div>
            </div>
            <div className="flex gap-2" aria-label="View mode">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  'rounded-full h-10 w-10 lg:h-11 lg:w-11 transition-all duration-200'
                )}
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
              >
                <List
                  className={cn('h-4 w-4 lg:h-5 lg:w-5 transition-colors')}
                />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  'rounded-full h-10 w-10 lg:h-11 lg:w-11 transition-all duration-200'
                )}
                onClick={() => setViewMode('calendar')}
                aria-pressed={viewMode === 'calendar'}
              >
                <CalendarDays
                  className={cn('h-4 w-4 lg:h-5 lg:w-5 transition-colors')}
                />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 lg:px-8 py-6 lg:py-8">
        {/* Search Bar */}
        <div className="mb-6 lg:mb-8">
          <SearchBar filters={localFilters} onFiltersChange={setLocalFilters} />
        </div>

        {viewMode === 'list' ? (
          filteredCards.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {cards.length === 0
                  ? 'No recaps yet.'
                  : 'No recaps match your filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div className="lg:grid lg:grid-cols-[400px_1fr] lg:gap-8 space-y-4 lg:space-y-0">
            <div className="lg:sticky lg:top-32 lg:h-fit">
              <CalendarView
                cards={filteredCards}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>

            <div>
              {cardsForSelectedDate.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {selectedDate
                      ? 'No recap on this day.'
                      : cards.length === 0
                      ? 'No recaps yet.'
                      : 'Select a day to view recaps'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
