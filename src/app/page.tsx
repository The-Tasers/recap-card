'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCardStore } from '@/lib/store';
import { DailyCard } from '@/lib/types';
import { DailyCardView } from '@/components/daily-card-view';
import { EmptyState } from '@/components/empty-state';
import {
  SearchBar,
  SearchFilters,
  useCardSearch,
  extractTags,
} from '@/components/search-filter';
import { CalendarView } from '@/components/calendar-view';
import { Sparkles, CalendarDays, TrendingUp, List, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  mood: 'all',
  hasPhoto: 'all',
  dateRange: 'all',
  tags: [],
};

// Group cards by month for timeline display
function groupByMonth(cards: DailyCard[]) {
  const groups: { month: string; cards: DailyCard[] }[] = [];
  const monthMap = new Map<string, DailyCard[]>();

  cards.forEach((card) => {
    const date = new Date(card.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
      groups.push({ month: monthLabel, cards: monthMap.get(monthKey)! });
    }
    monthMap.get(monthKey)!.push(card);
  });

  return groups;
}

export default function HomePage() {
  const router = useRouter();
  const { cards, hydrated } = useCardStore();
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const availableTags = useMemo(() => extractTags(cards), [cards]);
  const filteredCards = useCardSearch(cards, filters);
  const groupedCards = useMemo(() => groupByMonth(filteredCards), [filteredCards]);

  // Get card for selected date
  const selectedCard = useMemo(() => {
    if (!selectedDate) return null;
    return cards.find(
      (c) => new Date(c.createdAt).toDateString() === selectedDate.toDateString()
    );
  }, [cards, selectedDate]);

  // Stats
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
        (c) =>
          new Date(c.createdAt).toDateString() === checkDate.toDateString()
      );
      if (hasCard) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return { total: cards.length, thisMonth: cardsThisMonth, streak };
  }, [cards]);

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
          {/* Stats Bar */}
          <div className="flex gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-amber-50">
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-neutral-800">
                {stats.total}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="flex-1 text-center border-l border-black/10">
              <div className="text-2xl font-bold text-neutral-800 flex items-center justify-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {stats.thisMonth}
              </div>
              <div className="text-xs text-muted-foreground">This Month</div>
            </div>
            <div className="flex-1 text-center border-l border-black/10">
              <div className="text-2xl font-bold text-neutral-800 flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {stats.streak}
              </div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mb-4">
            <SearchBar
              filters={filters}
              onFiltersChange={setFilters}
              availableTags={availableTags}
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex-1 rounded-full"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="flex-1 rounded-full"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendar
            </Button>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="space-y-4 mb-6">
              <CalendarView
                cards={cards}
                onSelectDate={setSelectedDate}
                selectedDate={selectedDate}
              />
              {selectedCard && (
                <DailyCardView
                  card={selectedCard}
                  variant="compact"
                  onClick={() => router.push(`/card/${selectedCard.id}`)}
                />
              )}
              {selectedDate && !selectedCard && (
                <div className="text-center py-8 text-muted-foreground">
                  No entry for this date
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          {viewMode === 'list' && (
            <div className="space-y-6">
            {filteredCards.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No cards match your search
              </div>
            ) : (
              groupedCards.map((group) => (
                <div key={group.month}>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-2">
                    {group.month}
                  </h2>
                  <div className="space-y-3">
                    {group.cards.map((card) => (
                      <DailyCardView
                        key={card.id}
                        card={card}
                        variant="compact"
                        onClick={() => router.push(`/card/${card.id}`)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          )}
        </>
      )}
    </div>
  );
}
