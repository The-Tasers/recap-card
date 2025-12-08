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

export function CalendarView({ cards, onSelectDate, selectedDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
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
    <div className="bg-white rounded-2xl border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <Button variant="ghost" size="icon" onClick={goToNextMonth} className="rounded-full">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground py-1">
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
              <span className={cn(isSelected(date) ? 'text-primary-foreground' : '')}>
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

// Mood Heatmap - shows mood distribution over time
interface MoodHeatmapProps {
  cards: DailyCard[];
  months?: number;
}

export function MoodHeatmap({ cards, months = 3 }: MoodHeatmapProps) {
  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);

    const weeks: { date: Date; card?: DailyCard }[][] = [];
    let currentWeek: { date: Date; card?: DailyCard }[] = [];

    // Add padding for first week
    const firstDayOfWeek = startDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: new Date(0) }); // placeholder
    }

    const cardMap = new Map<string, DailyCard>();
    cards.forEach((card) => {
      cardMap.set(new Date(card.createdAt).toDateString(), card);
    });

    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const card = cardMap.get(currentDate.toDateString());
      currentWeek.push({ date: new Date(currentDate), card });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [cards, months]);

  const getMoodIntensity = (mood?: string): string => {
    if (!mood) return 'bg-muted/30';
    switch (mood) {
      case 'great':
        return 'bg-green-500';
      case 'good':
        return 'bg-lime-400';
      case 'neutral':
        return 'bg-yellow-400';
      case 'bad':
        return 'bg-orange-400';
      case 'terrible':
        return 'bg-red-500';
      default:
        return 'bg-muted/30';
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-4">
      <h3 className="text-sm font-medium mb-3">Mood History</h3>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {heatmapData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={cn(
                  'w-3 h-3 rounded-sm',
                  day.date.getTime() === 0 ? 'bg-transparent' : getMoodIntensity(day.card?.mood)
                )}
                title={
                  day.card
                    ? `${day.date.toLocaleDateString()}: ${day.card.mood}`
                    : day.date.getTime() > 0
                    ? day.date.toLocaleDateString()
                    : ''
                }
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-muted/30" />
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <div className="w-3 h-3 rounded-sm bg-orange-400" />
          <div className="w-3 h-3 rounded-sm bg-yellow-400" />
          <div className="w-3 h-3 rounded-sm bg-lime-400" />
          <div className="w-3 h-3 rounded-sm bg-green-500" />
        </div>
        <span>Better</span>
      </div>
    </div>
  );
}

// Mood Stats - shows mood distribution
interface MoodStatsProps {
  cards: DailyCard[];
}

export function MoodStats({ cards }: MoodStatsProps) {
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    MOODS.forEach((m) => (counts[m.value] = 0));
    cards.forEach((card) => {
      counts[card.mood] = (counts[card.mood] || 0) + 1;
    });
    return counts;
  }, [cards]);

  const total = cards.length || 1;

  return (
    <div className="bg-white rounded-2xl border p-4">
      <h3 className="text-sm font-medium mb-3">Mood Distribution</h3>
      <div className="space-y-2">
        {MOODS.map((mood) => {
          const count = stats[mood.value] || 0;
          const percentage = Math.round((count / total) * 100);
          return (
            <div key={mood.value} className="flex items-center gap-2">
              <span className="text-lg w-6">{mood.emoji}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', mood.color)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
