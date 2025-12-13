'use client';

import { useMemo, useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, List } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { DailyCard } from '@/lib/types';
import { SearchBar, SearchFilters } from '@/components/search-filter';
import { CalendarView } from '@/components/calendar-view';
import { DailyCardView } from '@/components/daily-card-view';
import { CardTableView } from '@/components/card-table-view';
import { EditSheet } from '@/components/edit-sheet';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  moods: [],
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
    moods:
      mood === 'great' ||
      mood === 'good' ||
      mood === 'neutral' ||
      mood === 'bad' ||
      mood === 'terrible'
        ? [mood]
        : DEFAULT_FILTERS.moods,
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

    const moodMatch =
      filters.moods.length === 0 || filters.moods.includes(card.mood);

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
  const { isChecking } = useOnboardingGuard();
  const { cards, hydrated, deleteCard } = useCardStore();
  const [cardToDelete, setCardToDelete] = useState<DailyCard | null>(null);
  const [cardToEdit, setCardToEdit] = useState<DailyCard | null>(null);

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

  const handleDelete = (card: DailyCard) => {
    setCardToDelete(card);
  };

  const confirmDelete = () => {
    if (cardToDelete) {
      deleteCard(cardToDelete.id);
      setCardToDelete(null);
    }
  };

  const handleEdit = (card: DailyCard) => {
    setCardToEdit(card);
  };

  if (!hydrated || isChecking) {
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
            <div className="flex gap-2 lg:hidden" aria-label="View mode">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  'rounded-xl h-10 w-10 transition-all duration-200'
                )}
                onClick={() => {
                  setViewMode('list');
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('view', 'list');
                  router.push(`/timeline?${params.toString()}`);
                }}
                aria-pressed={viewMode === 'list'}
              >
                <List className={cn('h-4 w-4 transition-colors')} />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  'rounded-xl h-10 w-10 transition-all duration-200'
                )}
                onClick={() => {
                  setViewMode('calendar');
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('view', 'calendar');
                  router.push(`/timeline?${params.toString()}`);
                }}
                aria-pressed={viewMode === 'calendar'}
              >
                <CalendarDays className={cn('h-4 w-4 transition-colors')} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 lg:px-8 py-6 lg:py-8">
        {/* Search Bar with View Options */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-4">
            <div className="flex-1">
              <SearchBar
                filters={localFilters}
                onFiltersChange={setLocalFilters}
              />
            </div>
            {/* Desktop: View mode buttons */}
            <div
              className="hidden lg:flex gap-2 shrink-0"
              aria-label="View mode"
            >
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                className={cn('rounded-xl size-9 transition-all duration-200')}
                onClick={() => {
                  setViewMode('list');
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('view', 'list');
                  router.push(`/timeline?${params.toString()}`);
                }}
                aria-pressed={viewMode === 'list'}
              >
                <List className={cn('h-5 w-5 transition-colors')} />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="icon"
                className={cn('rounded-xl size-9 transition-all duration-200')}
                onClick={() => {
                  setViewMode('calendar');
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('view', 'calendar');
                  router.push(`/timeline?${params.toString()}`);
                }}
                aria-pressed={viewMode === 'calendar'}
              >
                <CalendarDays className={cn('h-5 w-5 transition-colors')} />
              </Button>
            </div>
          </div>
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
            <>
              {/* Desktop: Table View */}
              <CardTableView
                cards={filteredCards}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              {/* Mobile: Single Column List View */}
              <div className="lg:hidden grid grid-cols-1 gap-4">
                {filteredCards.map((card) => (
                  <DailyCardView
                    key={card.id}
                    card={card}
                    variant="compact"
                    onClick={() => router.push(`/card/${card.id}`)}
                  />
                ))}
              </div>

              {/* Edit Sheet */}
              {cardToEdit && (
                <EditSheet
                  cardId={cardToEdit.id}
                  open={!!cardToEdit}
                  onOpenChange={(open) => !open && setCardToEdit(null)}
                />
              )}

              {/* Delete Dialog */}
              <Dialog
                open={!!cardToDelete}
                onOpenChange={(open) => !open && setCardToDelete(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Recap</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this recap? This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCardToDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirmDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )
        ) : (
          <CalendarView
            cards={filteredCards}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            showNavigation={true}
          />
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
