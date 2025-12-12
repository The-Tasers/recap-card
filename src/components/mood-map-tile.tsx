'use client';

import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { MoodDayData } from '@/lib/daily-utils';
import type { Mood } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface MoodMapTileProps {
  moodData: MoodDayData[];
  delay?: number;
}

// Mood colors matching the card gradients
const MOOD_COLORS: Record<Mood, string> = {
  great: '#22C55E', // green-500
  good: '#84CC16', // lime-500
  neutral: '#EAB308', // yellow-500
  bad: '#F97316', // orange-500
  terrible: '#EF4444', // red-500
};

// Day labels (S M T W T F S)
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function MoodMapTile({ moodData }: MoodMapTileProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/timeline?dateRange=month&view=calendar');
  };

  // Group days by week (7 days per week)
  const weeks: MoodDayData[][] = [];
  for (let i = 0; i < moodData.length; i += 7) {
    weeks.push(moodData.slice(i, i + 7));
  }

  // Calculate which weeks should be faded (first week = oldest)
  const totalWeeks = weeks.length;
  const fadeWeeks = Math.max(0, totalWeeks - 3); // Fade all but last 3 weeks

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-violet-500" />
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
          Mood Map
        </h3>
      </div>

      <div className="flex flex-col gap-3 justify-center items-center">
        {/* Day labels column */}
        <div className="flex gap-1.5">
          {DAY_LABELS.map((label, idx) => (
            <div
              key={idx}
              className="size-6 lg:size-8 flex items-center justify-center text-[16px] text-neutral-400 dark:text-neutral-600 font-medium"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid columns */}
        <div className="flex flex-col gap-1.5">
          {weeks.map((week, weekIndex) => {
            const shouldFade = weekIndex < fadeWeeks;

            return (
              <div key={weekIndex} className="flex gap-1.5">
                {week.map((day, dayIndex) => {
                  const cellColor = day.mood ? MOOD_COLORS[day.mood] : null;

                  return (
                    <Tooltip key={`${weekIndex}-${dayIndex}`}>
                      <TooltipTrigger>
                        <div
                          className={cn(
                            'size-6 lg:size-8 rounded-sm transition-all duration-200',
                            shouldFade && 'opacity-30',
                            !day.hasRecap &&
                              'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
                            day.hasRecap && 'hover:scale-[1.1] hover:shadow-md'
                          )}
                          style={
                            cellColor
                              ? { backgroundColor: cellColor }
                              : undefined
                          }
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {day.hasRecap
                          ? `${day.date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}: ${day.mood}`
                          : day.date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          Your daily mood over the last {moodData.length} days
        </p>
      </div>
    </div>
  );
}
