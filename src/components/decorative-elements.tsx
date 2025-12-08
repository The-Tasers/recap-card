'use client';

import { cn } from '@/lib/utils';
import { Mood } from '@/lib/types';
import { COLOR_PALETTES, PaletteId, MOOD_ICONS } from '@/lib/design-system';

// ============================================
// MOOD INDICATORS
// ============================================

interface MoodIndicatorProps {
  mood: Mood;
  variant?: 'dotScale' | 'gradientBar' | 'emojiLabel' | 'ring';
  palette?: PaletteId;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function MoodIndicator({
  mood,
  variant = 'emojiLabel',
  palette = 'warmCinematic',
  size = 'md',
  showLabel = true,
  className,
}: MoodIndicatorProps) {
  const colors = COLOR_PALETTES[palette];
  const moodColor = colors.moodColors[mood];
  const moodInfo = MOOD_ICONS[mood];

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const moodOrder: Mood[] = ['terrible', 'bad', 'neutral', 'good', 'great'];
  const moodIndex = moodOrder.indexOf(mood);

  switch (variant) {
    case 'dotScale':
      return (
        <div className={cn('flex items-center gap-2', className)}>
          <div className="flex gap-1.5">
            {moodOrder.map((m, i) => (
              <div
                key={m}
                className={cn(
                  'rounded-full transition-all duration-300',
                  size === 'sm' && 'w-2 h-2',
                  size === 'md' && 'w-3 h-3',
                  size === 'lg' && 'w-4 h-4'
                )}
                style={{
                  backgroundColor:
                    i === moodIndex ? moodColor : `${colors.textSecondary}40`,
                  transform: i === moodIndex ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
          {showLabel && (
            <span
              className={cn(sizeClasses[size], 'font-medium')}
              style={{ color: moodColor }}
            >
              {moodInfo.label}
            </span>
          )}
        </div>
      );

    case 'gradientBar':
      const percentage = ((moodIndex + 1) / moodOrder.length) * 100;
      return (
        <div className={cn('w-full', className)}>
          <div
            className={cn(
              'w-full rounded-full overflow-hidden',
              size === 'sm' && 'h-1.5',
              size === 'md' && 'h-2',
              size === 'lg' && 'h-3'
            )}
            style={{ backgroundColor: `${colors.textSecondary}30` }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                background: `linear-gradient(90deg, ${colors.moodColors.terrible}, ${colors.moodColors.neutral}, ${colors.moodColors.great})`,
              }}
            />
          </div>
          {showLabel && (
            <div
              className={cn('mt-2', sizeClasses[size], 'font-medium')}
              style={{ color: moodColor }}
            >
              {moodInfo.label}
            </div>
          )}
        </div>
      );

    case 'ring':
      const ringSize = size === 'sm' ? 60 : size === 'md' ? 80 : 100;
      return (
        <div className={cn('flex flex-col items-center', className)}>
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              width: ringSize,
              height: ringSize,
              border: `4px solid ${moodColor}`,
              boxShadow: `0 0 20px ${moodColor}40`,
            }}
          >
            <span
              className={cn(
                size === 'sm' && 'text-2xl',
                size === 'md' && 'text-3xl',
                size === 'lg' && 'text-4xl'
              )}
            >
              {moodInfo.emoji}
            </span>
          </div>
          {showLabel && (
            <span
              className={cn('mt-2', sizeClasses[size], 'font-medium')}
              style={{ color: moodColor }}
            >
              {moodInfo.label}
            </span>
          )}
        </div>
      );

    case 'emojiLabel':
    default:
      return (
        <div className={cn('flex items-center gap-2', className)}>
          <span
            className={cn(
              size === 'sm' && 'text-xl',
              size === 'md' && 'text-2xl',
              size === 'lg' && 'text-4xl'
            )}
          >
            {moodInfo.emoji}
          </span>
          {showLabel && (
            <span
              className={cn(sizeClasses[size], 'font-medium')}
              style={{ color: moodColor }}
            >
              {moodInfo.label}
            </span>
          )}
        </div>
      );
  }
}

// ============================================
// METRIC CARDS
// ============================================

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  progress?: number; // 0-100
  palette?: PaletteId;
  variant?: 'default' | 'compact' | 'glass';
  className?: string;
}

export function MetricCard({
  icon,
  label,
  value,
  unit,
  progress,
  palette = 'warmCinematic',
  variant = 'default',
  className,
}: MetricCardProps) {
  const colors = COLOR_PALETTES[palette];

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          className
        )}
        style={{ backgroundColor: `${colors.surface}` }}
      >
        <span className="text-sm">{icon}</span>
        <span
          className="text-sm font-medium"
          style={{ color: colors.textPrimary }}
        >
          {value}
          {unit && (
            <span
              className="text-xs ml-0.5"
              style={{ color: colors.textSecondary }}
            >
              {unit}
            </span>
          )}
        </span>
      </div>
    );
  }

  if (variant === 'glass') {
    return (
      <div className={cn('glass rounded-2xl p-4', className)}>
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-white font-bold text-xl">
          {value}
          {unit && <span className="text-sm text-white/60 ml-1">{unit}</span>}
        </div>
        <div className="text-white/50 text-xs mt-1">{label}</div>
        {progress !== undefined && (
          <div className="metric-bar mt-2">
            <div
              className="metric-bar-fill bg-white/80"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn('rounded-xl p-4', className)}
      style={{ backgroundColor: colors.surface }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span
          className="text-xs uppercase tracking-wide"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </span>
      </div>
      {progress !== undefined && (
        <div
          className="h-1.5 rounded-full mb-2 overflow-hidden"
          style={{ backgroundColor: `${colors.textSecondary}30` }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: colors.accent,
            }}
          />
        </div>
      )}
      <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
        {value}
        {unit && (
          <span
            className="text-sm font-normal ml-1"
            style={{ color: colors.textSecondary }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// DECORATIVE ELEMENTS
// ============================================

interface DecorativeStarsProps {
  count?: number;
  palette?: PaletteId;
  className?: string;
}

export function DecorativeStars({
  count = 3,
  palette = 'warmCinematic',
  className,
}: DecorativeStarsProps) {
  const colors = COLOR_PALETTES[palette];

  return (
    <div className={cn('flex gap-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'transition-opacity',
            i % 2 === 0 ? 'text-lg' : 'text-xs'
          )}
          style={{
            color:
              i === Math.floor(count / 2)
                ? colors.accent
                : colors.textSecondary,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

interface DecorativeDotsProps {
  count?: number;
  palette?: PaletteId;
  className?: string;
}

export function DecorativeDots({
  count = 3,
  palette = 'warmCinematic',
  className,
}: DecorativeDotsProps) {
  const colors = COLOR_PALETTES[palette];

  return (
    <div
      className={cn('flex gap-2', className)}
      style={{ color: colors.textSecondary }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i}>·</span>
      ))}
    </div>
  );
}

interface DecorativeDividerProps {
  variant?: 'line' | 'dots' | 'diamond' | 'wave';
  palette?: PaletteId;
  className?: string;
}

export function DecorativeDivider({
  variant = 'line',
  palette = 'warmCinematic',
  className,
}: DecorativeDividerProps) {
  const colors = COLOR_PALETTES[palette];

  switch (variant) {
    case 'dots':
      return (
        <div
          className={cn('flex items-center justify-center gap-2', className)}
        >
          <span style={{ color: colors.textSecondary }}>· · ·</span>
        </div>
      );

    case 'diamond':
      return (
        <div className={cn('flex items-center gap-4', className)}>
          <div
            className="h-px flex-1"
            style={{ backgroundColor: colors.textSecondary + '40' }}
          />
          <span style={{ color: colors.accent }}>◆</span>
          <div
            className="h-px flex-1"
            style={{ backgroundColor: colors.textSecondary + '40' }}
          />
        </div>
      );

    case 'wave':
      return (
        <div
          className={cn('text-center text-2xl', className)}
          style={{ color: colors.textSecondary }}
        >
          ～～～
        </div>
      );

    case 'line':
    default:
      return (
        <div
          className={cn('h-px w-12 mx-auto', className)}
          style={{ backgroundColor: colors.textSecondary + '40' }}
        />
      );
  }
}

// ============================================
// STAR RATING
// ============================================

interface StarRatingProps {
  value: number; // 1-5
  palette?: PaletteId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StarRating({
  value,
  palette = 'warmCinematic',
  size = 'md',
  className,
}: StarRatingProps) {
  const colors = COLOR_PALETTES[palette];

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex gap-0.5', sizeClasses[size], className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: star <= value ? colors.accent : colors.textSecondary + '40',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ============================================
// DATE BADGE (Story-optimized)
// ============================================

interface StoryDateBadgeProps {
  date: string;
  variant?: 'full' | 'compact' | 'editorial';
  palette?: PaletteId;
  className?: string;
}

export function StoryDateBadge({
  date,
  variant = 'full',
  palette = 'warmCinematic',
  className,
}: StoryDateBadgeProps) {
  const colors = COLOR_PALETTES[palette];
  const d = new Date(date);

  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  const day = d.getDate();
  const year = d.getFullYear();

  if (variant === 'compact') {
    return (
      <div
        className={cn('text-story-micro tracking-widest', className)}
        style={{ color: colors.textSecondary }}
      >
        {month.toUpperCase().slice(0, 3)} {day}
      </div>
    );
  }

  if (variant === 'editorial') {
    return (
      <div className={cn('flex flex-col', className)}>
        <div
          className="text-7xl font-black leading-none"
          style={{ color: colors.accent }}
        >
          {day}
        </div>
        <div
          className="text-xl font-light uppercase tracking-widest"
          style={{ color: colors.textSecondary }}
        >
          {month.slice(0, 3)}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn('text-center', className)}>
      <div
        className="text-story-micro tracking-widest"
        style={{ color: colors.textSecondary }}
      >
        {weekday.toUpperCase()}
      </div>
      <div className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
        {month} {day}
      </div>
      <div className="text-sm" style={{ color: colors.textSecondary }}>
        {year}
      </div>
    </div>
  );
}

// ============================================
// QUOTE BLOCK
// ============================================

interface QuoteBlockProps {
  text: string;
  palette?: PaletteId;
  variant?: 'default' | 'large' | 'handwritten';
  className?: string;
}

export function QuoteBlock({
  text,
  palette = 'warmCinematic',
  variant = 'default',
  className,
}: QuoteBlockProps) {
  const colors = COLOR_PALETTES[palette];

  if (variant === 'large') {
    return (
      <p
        className={cn(
          'text-story-headline font-serif leading-tight',
          className
        )}
        style={{ color: colors.textPrimary }}
      >
        &ldquo;{text}&rdquo;
      </p>
    );
  }

  if (variant === 'handwritten') {
    return (
      <div
        className={cn('relative p-4', className)}
        style={{
          border: `2px dashed ${colors.textSecondary}40`,
          borderRadius: '4px',
        }}
      >
        <p
          className="text-lg leading-relaxed"
          style={{
            color: colors.textPrimary,
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
          }}
        >
          &ldquo;{text}&rdquo;
        </p>
      </div>
    );
  }

  // Default
  return (
    <p
      className={cn('text-story-body leading-relaxed', className)}
      style={{ color: colors.textPrimary }}
    >
      &ldquo;{text}&rdquo;
    </p>
  );
}

// ============================================
// BRANDING FOOTER
// ============================================

interface BrandingFooterProps {
  variant?: 'default' | 'minimal' | 'playful';
  palette?: PaletteId;
  className?: string;
}

export function BrandingFooter({
  variant = 'default',
  palette = 'warmCinematic',
  className,
}: BrandingFooterProps) {
  const colors = COLOR_PALETTES[palette];

  if (variant === 'minimal') {
    return (
      <div
        className={cn('text-story-micro', className)}
        style={{ color: colors.textSecondary }}
      >
        AI DAY RECAP
      </div>
    );
  }

  if (variant === 'playful') {
    return (
      <div
        className={cn('text-sm', className)}
        style={{ color: colors.textSecondary }}
      >
        ～ ai day recap ♡ ～
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="h-px flex-1"
        style={{ backgroundColor: colors.textSecondary + '30' }}
      />
      <span
        className="text-story-micro"
        style={{ color: colors.textSecondary }}
      >
        AI DAY RECAP
      </span>
      <div
        className="h-px flex-1"
        style={{ backgroundColor: colors.textSecondary + '30' }}
      />
    </div>
  );
}
