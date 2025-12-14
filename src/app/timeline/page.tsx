'use client';

import { useMemo, useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  List,
  PencilLine,
  Edit,
  Trash2,
} from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { DailyCard } from '@/lib/types';
import { SearchBar, SearchFilters } from '@/components/search-filter';
import { CalendarView } from '@/components/calendar-view';
import { DailyCardView } from '@/components/daily-card-view';
import { EditSheet } from '@/components/edit-sheet';
import { CreateSheet } from '@/components/create-sheet';
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
  blocks: [],
  dateRange: 'all',
};

function filtersFromParams(params: ReturnType<typeof useSearchParams>) {
  const dateRange = params.get('dateRange');
  const mood = params.get('mood');

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

    const blockMatch =
      filters.blocks.length === 0 ||
      filters.blocks.some((blockId) =>
        card.blocks?.some((block) => block.blockId === blockId)
      );

    const dateMatch = matchesDateRange(card.createdAt);

    return textMatch && moodMatch && blockMatch && dateMatch;
  });
}

function TimelineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isChecking } = useOnboardingGuard();
  const { cards, hydrated, deleteCard } = useCardStore();
  const [cardToDelete, setCardToDelete] = useState<DailyCard | null>(null);
  const [cardToEdit, setCardToEdit] = useState<DailyCard | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [createForDate, setCreateForDate] = useState<Date | undefined>(
    undefined
  );

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

  // Initialize selected date from URL parameter if present
  const initialSelectedDate = useMemo(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const date = new Date(dateParam);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }, [searchParams]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialSelectedDate
  );

  // Update local state when URL params change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalFilters(filters);
    setViewMode(viewModeFromParams);
    setSelectedDate(initialSelectedDate);
  }, [filters, viewModeFromParams, initialSelectedDate]);

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

  const handleCreateForDate = (date: Date) => {
    setCreateForDate(date);
    setIsCreateSheetOpen(true);
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
      <header className="sticky top-0 z-10 h-24 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
        <div className="px-4 lg:px-8 h-full flex items-center">
          <div className="flex items-center justify-between gap-3 w-full max-w-4xl mx-auto">
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
                  Your Days
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {filteredCards.length}{' '}
                  {filteredCards.length === 1
                    ? 'moment captured'
                    : 'moments captured'}
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
        <div className="max-w-4xl mx-auto">
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
                  className={cn(
                    'rounded-xl size-9 transition-all duration-200'
                  )}
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
                  className={cn(
                    'rounded-xl size-9 transition-all duration-200'
                  )}
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
              cards.length === 0 ? (
                // True empty state - no cards at all
                <>
                  {/* Desktop empty state */}
                  <div className="hidden lg:block">
                    <div className="bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30 rounded-3xl p-12 border border-amber-200 dark:border-amber-900/50 shadow-sm">
                      <div className="max-w-2xl mx-auto text-center">
                        <div className="mb-6">
                          <span className="text-6xl">📅</span>
                        </div>
                        <h3 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                          Your journey starts here
                        </h3>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
                          Each day holds moments worth noticing.
                          <br />
                          Start capturing what stands out to you.
                        </p>
                        <button
                          onClick={() => setIsCreateSheetOpen(true)}
                          className="inline-flex items-center cursor-pointer gap-2 px-12 h-14 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base rounded-2xl shadow-lg shadow-amber-500/40 hover:shadow-xl hover:shadow-amber-500/50 transition-all duration-200 hover:scale-[1.02]"
                        >
                          <PencilLine className="h-5 w-5" />
                          Capture today&apos;s moment
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Mobile empty state */}
                  <div className="lg:hidden text-center py-16">
                    <div className="mb-4">
                      <span className="text-5xl">📅</span>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                      Your journey starts here
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                      Start capturing what stands out to you.
                    </p>
                    <button
                      onClick={() => setIsCreateSheetOpen(true)}
                      className="inline-flex items-center cursor-pointer gap-2 px-8 h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-amber-500/40 hover:shadow-xl hover:shadow-amber-500/50 transition-all duration-200"
                    >
                      <PencilLine className="h-4 w-4" />
                      Capture today&apos;s moment
                    </button>
                  </div>
                </>
              ) : (
                // Filtered empty state - cards exist but filtered out
                <div className="text-center py-16">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No recaps match your filters.
                  </p>
                </div>
              )
            ) : (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 gap-4 w-full lg:max-w-xl">
                  {filteredCards.map((card) => (
                    <div key={card.id} className="space-y-2">
                      {/* Action buttons - Above card */}
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(card);
                          }}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(card);
                          }}
                          className="h-8 w-8 "
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Card */}
                      <DailyCardView card={card} variant="default" />
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <CalendarView
              cards={filteredCards}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              showNavigation={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateForDate={handleCreateForDate}
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
                  Are you sure you want to delete this recap? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setCardToDelete(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Sheet */}
          {cardToEdit && (
            <EditSheet
              cardId={cardToEdit.id}
              open={!!cardToEdit}
              onOpenChange={(open) => !open && setCardToEdit(null)}
            />
          )}
        </div>
      </div>

      {/* Create Sheet */}
      <CreateSheet
        open={isCreateSheetOpen}
        onOpenChange={(open) => {
          setIsCreateSheetOpen(open);
          if (!open) setCreateForDate(undefined);
        }}
        selectedDate={createForDate}
      />
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
