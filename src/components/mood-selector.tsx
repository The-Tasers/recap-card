'use client';

import { Mood, MOODS } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  value: Mood;
  onChange: (mood: Mood) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function MoodSelector({
  value,
  onChange,
  size = 'md',
}: MoodSelectorProps) {
  const sizeClasses = {
    sm: 'text-2xl p-2',
    md: 'text-3xl p-3',
    lg: 'text-4xl p-4',
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={cn(
            'rounded-2xl transition-all duration-200 hover:scale-110',
            sizeClasses[size],
            value === mood.value
              ? 'bg-primary/10 ring-2 ring-primary scale-110'
              : 'bg-muted/50 hover:bg-muted'
          )}
          title={mood.label}
        >
          <span role="img" aria-label={mood.label}>
            {mood.emoji}
          </span>
        </button>
      ))}
    </div>
  );
}

interface MoodBadgeProps {
  mood: Mood;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function MoodBadge({
  mood,
  showLabel = false,
  size = 'md',
}: MoodBadgeProps) {
  const moodInfo = MOODS.find((m) => m.value === mood) || MOODS[2];

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
  };

  return (
    <span className={cn('inline-flex items-center gap-1', sizeClasses[size])}>
      <span role="img" aria-label={moodInfo.label}>
        {moodInfo.emoji}
      </span>
      {showLabel && (
        <span className="text-sm text-muted-foreground">{moodInfo.label}</span>
      )}
    </span>
  );
}
