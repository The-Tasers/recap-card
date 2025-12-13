'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyCard, MOODS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DailyCardView } from '@/components/daily-card-view';

interface CalendarViewProps {
  cards: DailyCard[];
  onSelectDate: (date: Date | null) => void;
  selectedDate: Date | null;
  showNavigation?: boolean;
  currentMonth?: Date;
}

export function CalendarView({
  cards,
  onSelectDate,
  selectedDate,
  showNavigation = true,
  currentMonth: propCurrentMonth,
}: CalendarViewProps) {
  const router = useRouter();
  const [internalCurrentMonth, setInternalCurrentMonth] = useState(new Date());

  // Use internal state for month navigation
  const currentMonth = internalCurrentMonth;
  const setCurrentMonth = setInternalCurrentMonth;

  const monthOptions = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsFromCards = cards.map((card) =>
      new Date(card.createdAt).getFullYear()
    );
    const minFromCards = yearsFromCards.length
      ? Math.min(...yearsFromCards)
      : currentYear;
    const maxFromCards = yearsFromCards.length
      ? Math.max(...yearsFromCards)
      : currentYear;

    // Give a little range even if no recaps yet
    const rangeStart = Math.min(minFromCards, currentYear - 3);
    const rangeEnd = 2100;

    const list: number[] = [];
    for (let y = rangeStart; y <= rangeEnd; y++) {
      list.push(y);
    }
    return list;
  }, [cards]);

  const cardsByDate = useMemo(() => {
    const map = new Map<string, DailyCard>();
    cards.forEach((card) => {
      const dateKey = new Date(card.createdAt).toDateString();
      map.set(dateKey, card);
    });
    return map;
  }, [cards]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of month
    // Adjust for Monday start: getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We want Monday to be 0, so we subtract 1 and handle Sunday (0) as 6
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  const goToPrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleMonthChange = (value: string) => {
    const monthIndex = monthOptions.indexOf(value);
    if (monthIndex === -1) return;
    setCurrentMonth((prev) => new Date(prev.getFullYear(), monthIndex, 1));
  };

  const handleYearChange = (value: string) => {
    const yearNum = Number(value);
    if (Number.isNaN(yearNum)) return;
    setCurrentMonth((prev) => new Date(yearNum, prev.getMonth(), 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getMoodColor = (mood: string) => {
    const moodData = MOODS.find((m) => m.value === mood);
    return moodData?.color || 'bg-muted';
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4 lg:p-6">
      {/* Header - Mobile and Desktop navigation */}
      {showNavigation && (
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevMonth}
              className="h-8 w-8 lg:h-10 lg:w-10"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              className="h-8 w-8 lg:h-10 lg:w-10"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={monthOptions[currentMonth.getMonth()]}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="text-sm lg:text-base border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 lg:px-3 py-1 lg:py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              aria-label="Select month"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={currentMonth.getFullYear()}
              onChange={(e) => handleYearChange(e.target.value)}
              className="text-sm lg:text-base border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 lg:px-3 py-1 lg:py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              aria-label="Select year"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 lg:gap-3 mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div
            key={i}
            className="text-center text-xs lg:text-sm font-semibold text-muted-foreground py-1 lg:py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid - Mobile: Small cards, Desktop: Full cards */}
      <div className="grid grid-cols-7 gap-1 lg:gap-3 relative z-0">
        {daysInMonth.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="lg:aspect-[3/4]" />;
          }

          const card = cardsByDate.get(date.toDateString());
          const hasCard = !!card;

          return (
            <div
              key={date.toISOString()}
              className={cn(
                'relative',
                isToday(date) && 'ring-2 ring-primary ring-offset-1 rounded-lg'
              )}
            >
              {hasCard ? (
                // Mobile: Small card preview, Desktop: Full card
                <div className="lg:hidden flex">
                  <button
                    onClick={() => router.push(`/card/${card.id}`)}
                    className="w-full aspect-square rounded-lg overflow-hidden relative group hover:ring-2 hover:ring-primary transition-all"
                  >
                    {/* Mini card with mood gradient background */}
                    <div
                      className={cn(
                        'absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity',
                        getMoodColor(card.mood)
                      )}
                    />
                    <div className="relative h-full p-1 flex items-start justify-center">
                      <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {date.getDate()}
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                // Mobile: Empty day cell
                <div className="lg:hidden">
                  <div className="w-full aspect-square rounded-lg flex items-start justify-center p-1 hover:bg-muted/30 transition-colors">
                    <span className="text-xs text-muted-foreground">
                      {date.getDate()}
                    </span>
                  </div>
                </div>
              )}

              {/* Desktop: Minimal calendar card or empty state */}
              <div className="hidden lg:block">
                {hasCard ? (
                  <div className="w-full">
                    <DailyCardView
                      card={card}
                      variant="calendar"
                      onClick={() => router.push(`/card/${card.id}`)}
                      className="h-full"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-3/4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex items-start justify-center p-2 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
                    <span className="text-sm font-medium text-neutral-400 dark:text-neutral-600">
                      {date.getDate()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarNavigation({
  currentMonth,
  onMonthChange,
  onYearChange,
  onPrevMonth,
  onNextMonth,
  cards,
}: {
  currentMonth: Date;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  cards: DailyCard[];
}) {
  const monthOptions = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsFromCards = cards.map((card) =>
      new Date(card.createdAt).getFullYear()
    );
    const minFromCards = yearsFromCards.length
      ? Math.min(...yearsFromCards)
      : currentYear;
    const maxFromCards = yearsFromCards.length
      ? Math.max(...yearsFromCards)
      : currentYear;

    const rangeStart = Math.min(minFromCards, currentYear - 3);
    const rangeEnd = 2100;

    const list: number[] = [];
    for (let y = rangeStart; y <= rangeEnd; y++) {
      list.push(y);
    }
    return list;
  }, [cards]);

  return (
    <div className="flex items-center justify-between gap-2 p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevMonth}
          className="rounded-full"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="rounded-full"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={monthOptions[currentMonth.getMonth()]}
          onChange={(e) => {
            const monthIndex = monthOptions.indexOf(e.target.value);
            if (monthIndex !== -1) onMonthChange(monthIndex);
          }}
          className="text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          aria-label="Select month"
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={currentMonth.getFullYear()}
          onChange={(e) => {
            const yearNum = Number(e.target.value);
            if (!Number.isNaN(yearNum)) onYearChange(yearNum);
          }}
          className="text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          aria-label="Select year"
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
