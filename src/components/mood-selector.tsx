'use client';

import { Mood, MOODS } from '@/lib/types';
import { cn } from '@/lib/utils';

// Mood-based gradients matching card design - from emoji colors
// great: green, good: lime, neutral: yellow, bad: orange, terrible: red
const MOOD_GRADIENTS = {
  great:
    'bg-gradient-to-br from-green-500/90 via-emerald-500/85 to-green-600/90',
  good: 'bg-gradient-to-br from-lime-500/90 via-lime-400/85 to-lime-600/90',
  neutral:
    'bg-gradient-to-br from-yellow-400/90 via-yellow-300/85 to-yellow-500/90',
  bad: 'bg-gradient-to-br from-orange-500/90 via-orange-400/85 to-orange-600/90',
  terrible: 'bg-gradient-to-br from-red-500/90 via-red-400/85 to-red-600/90',
};

// Mood colors for borders and backgrounds
const MOOD_STYLES = {
  great: {
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    ring: 'ring-green-500',
  },
  good: {
    border: 'border-lime-500',
    bg: 'bg-lime-500/10',
    ring: 'ring-lime-500',
  },
  neutral: {
    border: 'border-yellow-400',
    bg: 'bg-yellow-400/10',
    ring: 'ring-yellow-400',
  },
  bad: {
    border: 'border-orange-500',
    bg: 'bg-orange-500/10',
    ring: 'ring-orange-500',
  },
  terrible: {
    border: 'border-red-500',
    bg: 'bg-red-500/10',
    ring: 'ring-red-500',
  },
};

interface MoodSelectorProps {
  value: Mood;
  onChange: (mood: Mood) => void;
  size?: 'sm' | 'md' | 'lg';
  showPreview?: boolean;
}

export function MoodSelector({
  value,
  onChange,
  size = 'md',
  showPreview = false,
}: MoodSelectorProps) {
  const sizeClasses = {
    sm: 'text-2xl p-2',
    md: 'text-3xl p-3',
    lg: 'text-4xl p-4',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-3 py-1 px-4">
        {MOODS.map((mood) => {
          const isSelected = value === mood.value;
          const styles = MOOD_STYLES[mood.value];

          return (
            <button
              key={mood.value}
              type="button"
              onClick={() => onChange(mood.value)}
              className={cn(
                'rounded-2xl transition-all duration-200 hover:scale-110 border-2',
                sizeClasses[size],
                isSelected
                  ? `${styles.bg} ${styles.border} ring-2 ${styles.ring} scale-110`
                  : 'bg-muted/30 border-muted hover:bg-muted/50'
              )}
              title={mood.label}
            >
              <span role="img" aria-label={mood.label}>
                {mood.emoji}
              </span>
            </button>
          );
        })}
      </div>
      {showPreview && (
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              'w-full h-20 rounded-2xl transition-all duration-300',
              MOOD_GRADIENTS[value]
            )}
          />
          <p className="text-sm text-muted-foreground">
            Preview of {MOODS.find((m) => m.value === value)?.label} mood
          </p>
        </div>
      )}
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

// Export mood gradients for use in other components
export { MOOD_GRADIENTS };
