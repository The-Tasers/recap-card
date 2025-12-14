'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
  onEdit?: (card: DailyCard) => void;
  onDelete?: (card: DailyCard) => void;
  onCreateForDate?: (date: Date) => void;
}

export function CalendarView({
  cards,
  onSelectDate,
  selectedDate,
  showNavigation = true,
  currentMonth: propCurrentMonth,
  onEdit,
  onDelete,
  onCreateForDate,
}: CalendarViewProps) {
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

  const getMoodColor = (mood: string) => {
    const moodData = MOODS.find((m) => m.value === mood);
    return moodData?.color || 'bg-muted';
  };

  return (
    <div className="max-w-xl lg:max-w-lg mx-auto space-y-3 lg:space-y-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-3 lg:p-4">
        {/* Header - Mobile and Desktop navigation */}
        {showNavigation && (
          <div className="flex items-center justify-between mb-3 lg:mb-4 gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevMonth}
                className="h-8 w-8"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                className="h-8 w-8"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={monthOptions[currentMonth.getMonth()]}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
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
                className="text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
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
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-semibold text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid - Compact view with emojis */}
        <div className="grid grid-cols-7 gap-1 relative z-0">
          {daysInMonth.map((date, i) => {
            if (!date) {
              return (
                <div
                  key={`empty-${i}`}
                  className="flex flex-col items-center gap-1"
                ></div>
              );
            }

            const card = cardsByDate.get(date.toDateString());
            const hasCard = !!card;
            const isSelected =
              selectedDate &&
              date.toDateString() === selectedDate.toDateString();
            const moodData = hasCard
              ? MOODS.find((m) => m.value === card.mood)
              : null;

            return (
              <div
                key={date.toISOString()}
                className="flex flex-col items-center gap-1"
              >
                <button
                  onClick={() => {
                    if (hasCard) {
                      onSelectDate(date);
                    } else if (onCreateForDate) {
                      // Check if date is in the future
                      const now = new Date();
                      const today = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                      );
                      const targetDate = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                      );

                      if (targetDate > today) {
                        toast.error('Time travel not supported yet! 🚀', {
                          description:
                            'You can only create recaps for today or past days. The future is still unwritten!',
                        });
                      } else {
                        onCreateForDate(date);
                      }
                    }
                  }}
                  className={cn(
                    'w-full rounded-lg flex cursor-pointer items-center justify-center p-1.5 lg:p-2 transition-all duration-200 h-10 lg:h-16',
                    hasCard && getMoodColor(card.mood),
                    hasCard && 'lg:hover:scale-105 lg:hover:shadow-md',
                    !hasCard &&
                      'hover:bg-muted/30 border border-dashed lg:hover:scale-105 lg:hover:border-solid lg:hover:border-neutral-300 dark:lg:hover:border-neutral-600'
                  )}
                >
                  {/* Emoji - centered */}
                  {hasCard && moodData && (
                    <span className="text-xl lg:text-2xl">
                      {moodData.emoji}
                    </span>
                  )}
                </button>

                {/* Day number - below cell, centered */}
                <span
                  className={cn(
                    'text-xs font-semibold rounded-full px-1.5 lg:px-2.5 py-0.5 min-w-5 text-center',
                    isSelected && 'bg-green-500 text-white',
                    !isSelected && 'text-muted-foreground'
                  )}
                >
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected card display */}
      {selectedDate && cardsByDate.get(selectedDate.toDateString()) && (
        <div className="space-y-2">
          {/* Action buttons - Above card */}
          {(onEdit || onDelete) && (
            <div className="flex gap-1 justify-end">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const selectedCard = cardsByDate.get(
                      selectedDate.toDateString()
                    );
                    if (selectedCard) onEdit(selectedCard);
                  }}
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const selectedCard = cardsByDate.get(
                      selectedDate.toDateString()
                    );
                    if (selectedCard) onDelete(selectedCard);
                  }}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Selected card - using default variant like timeline mobile */}
          <DailyCardView
            card={cardsByDate.get(selectedDate.toDateString())!}
            variant="default"
          />
        </div>
      )}
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
