'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyCard, MOODS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  cards: DailyCard[];
  onSelectDate: (date: Date | null) => void;
  selectedDate: Date | null;
}

export function CalendarView({
  cards,
  onSelectDate,
  selectedDate,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    const startPadding = firstDay.getDay();
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

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const getMoodColor = (mood: string) => {
    const moodData = MOODS.find((m) => m.value === mood);
    return moodData?.color || 'bg-muted';
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevMonth}
            className="rounded-full"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="rounded-full"
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

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            key={i}
            className="text-center text-xs text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const card = cardsByDate.get(date.toDateString());
          const hasCard = !!card;

          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelectDate(isSelected(date) ? null : date)}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-all',
                isToday(date) && 'ring-2 ring-primary ring-offset-1',
                isSelected(date) && 'bg-primary text-primary-foreground',
                !isSelected(date) && hasCard && 'bg-muted/50 hover:bg-muted',
                !isSelected(date) && !hasCard && 'hover:bg-muted/30'
              )}
            >
              <span
                className={cn(
                  isSelected(date) ? 'text-primary-foreground' : ''
                )}
              >
                {date.getDate()}
              </span>
              {hasCard && !isSelected(date) && (
                <div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full mt-0.5',
                    getMoodColor(card.mood)
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
