'use client';

import { Mood, MOODS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';

interface MoodFilterProps {
  value: Mood | 'all';
  onChange: (mood: Mood | 'all') => void;
}

export function MoodFilter({ value, onChange }: MoodFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onChange('all')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          value === 'all'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        )}
      >
        <Filter className="h-3.5 w-3.5" />
        All
      </button>
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onChange(mood.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            value === mood.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          <span>{mood.emoji}</span>
          {mood.label}
        </button>
      ))}
    </div>
  );
}
