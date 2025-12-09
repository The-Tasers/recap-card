'use client';

import { forwardRef } from 'react';
import { DailyCard, MOODS } from '@/lib/types';
import {
  COLOR_PALETTES,
  PaletteId,
  StoryTemplateId,
} from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface StoryCardProps {
  card: DailyCard;
  template?: StoryTemplateId;
  palette?: PaletteId;
  showGrain?: boolean;
  showVignette?: boolean;
  className?: string;
}

// Helper to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
    month: date.toLocaleDateString('en-US', { month: 'long' }),
    day: date.getDate(),
    year: date.getFullYear(),
    short: date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
  };
};

// ============================================
// PHOTO HERO TEMPLATE
// ============================================
export const PhotoHeroTemplate = forwardRef<HTMLDivElement, StoryCardProps>(
  (
    {
      card,
      palette = 'warmCinematic',
      showGrain = true,
      showVignette = true,
      className,
    },
    ref
  ) => {
    const colors = COLOR_PALETTES[palette];
    const moodData = MOODS.find((m) => m.value === card.mood);
    const date = formatDate(card.createdAt);

    return (
      <div
        ref={ref}
        className={cn(
          'story-card relative flex flex-col',
          showGrain && 'grain-subtle',
          className
        )}
        style={{ backgroundColor: colors.background }}
      >
        {/* Photo Section */}
        {card.photoUrl && (
          <div className="relative flex-1 min-h-[50%]">
            <img
              src={card.photoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            <div
              className={cn(
                'absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent',
                showVignette && 'vignette-light'
              )}
            />
          </div>
        )}

        {/* Content Section */}
        <div
          className="flex-1 p-6 flex flex-col justify-end space-y-4"
          style={{
            background: `linear-gradient(135deg, ${colors.surface}, ${colors.background})`,
          }}
        >
          {/* Date */}
          <div
            className="text-story-micro"
            style={{ color: colors.textSecondary }}
          >
            {date.weekday}, {date.month} {date.day}
          </div>

          {/* Main Text */}
          <p
            className="text-story-body leading-relaxed"
            style={{ color: colors.textPrimary }}
          >
            &ldquo;{card.text}&rdquo;
          </p>

          {/* Mood */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">{moodData?.emoji}</span>
            <span
              className="text-sm font-medium"
              style={{ color: colors.moodColors[card.mood] }}
            >
              {moodData?.label} Day
            </span>
          </div>

          {/* Metrics */}
          {card.blocks && card.blocks.length > 0 && (
            <div
              className="flex gap-4 pt-4 border-t"
              style={{ borderColor: `${colors.textSecondary}20` }}
            >
              {card.blocks.slice(0, 3).map((block) => (
                <div key={block.id} className="flex items-center gap-2">
                  <span className="text-lg">{block.icon}</span>
                  <span
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {block.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Branding */}
          <div
            className="text-story-micro pt-4"
            style={{ color: colors.textSecondary }}
          >
            AI DAY RECAP
          </div>
        </div>
      </div>
    );
  }
);
PhotoHeroTemplate.displayName = 'PhotoHeroTemplate';

// ============================================
// GLASS CARDS TEMPLATE
// ============================================
export const GlassCardsTemplate = forwardRef<HTMLDivElement, StoryCardProps>(
  ({ card, palette = 'cyberGradient', showGrain = true, className }, ref) => {
    const colors = COLOR_PALETTES[palette];
    const moodData = MOODS.find((m) => m.value === card.mood);
    const date = formatDate(card.createdAt);

    return (
      <div
        ref={ref}
        className={cn(
          'story-card relative',
          showGrain && 'grain-subtle',
          className
        )}
      >
        {/* Background - Photo or Gradient */}
        {card.photoUrl ? (
          <img
            src={card.photoUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className={cn('absolute inset-0 animate-gradient')}
            style={{ background: colors.gradient }}
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center p-6 space-y-6">
          {/* Main Glass Card */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <div className="text-story-micro text-white/60">
              {date.month.toUpperCase()} {date.day}, {date.year}
            </div>

            <div className="w-12 h-0.5 bg-white/30" />

            <p className="text-story-body text-white leading-relaxed">
              &ldquo;{card.text}&rdquo;
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-3xl">{moodData?.emoji}</span>
              <span className="text-white/80 font-medium">
                {moodData?.label}
              </span>
            </div>
          </div>

          {/* Metric Cards */}
          {card.blocks && card.blocks.length > 0 && (
            <div className="flex gap-3">
              {card.blocks.slice(0, 2).map((block) => (
                <div
                  key={block.id}
                  className="glass rounded-2xl px-5 py-4 flex-1 text-center"
                >
                  <div className="text-2xl mb-1">{block.icon}</div>
                  <div className="text-white font-bold">{block.value}</div>
                  <div className="text-white/50 text-xs">{block.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Branding */}
          <div className="text-center text-white/40 text-story-micro">
            AI DAY RECAP
          </div>
        </div>
      </div>
    );
  }
);
GlassCardsTemplate.displayName = 'GlassCardsTemplate';

// ============================================
// MAGAZINE COVER TEMPLATE
// ============================================
export const MagazineCoverTemplate = forwardRef<HTMLDivElement, StoryCardProps>(
  ({ card, palette = 'warmCinematic', showGrain = true, className }, ref) => {
    const colors = COLOR_PALETTES[palette];
    const moodData = MOODS.find((m) => m.value === card.mood);
    const date = formatDate(card.createdAt);

    return (
      <div
        ref={ref}
        className={cn(
          'story-card relative flex flex-col p-6',
          showGrain && 'grain-subtle',
          className
        )}
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div
              className="text-4xl font-black tracking-tight"
              style={{ color: colors.textPrimary }}
            >
              AI DAY
            </div>
            <div
              className="text-xl font-light tracking-widest"
              style={{ color: colors.accent }}
            >
              RECAP™
            </div>
          </div>
          <div
            className="text-right text-story-micro"
            style={{ color: colors.textSecondary }}
          >
            {date.month.toUpperCase()}
            <br />
            {date.year}
          </div>
        </div>

        {/* Big Date */}
        <div className="mb-8">
          <div
            className="text-8xl font-black leading-none"
            style={{ color: colors.accent }}
          >
            {date.day}
          </div>
          <div
            className="text-2xl font-light uppercase tracking-widest"
            style={{ color: colors.textSecondary }}
          >
            {date.weekday}
          </div>
        </div>

        {/* Photo */}
        {card.photoUrl && (
          <div className="relative rounded-2xl overflow-hidden mb-8 flex-1 min-h-[200px]">
            <img
              src={card.photoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Quote */}
        <div className="flex-1 flex flex-col justify-end">
          <p
            className="text-story-headline font-serif italic leading-tight mb-6"
            style={{ color: colors.textPrimary }}
          >
            &ldquo;{card.text.slice(0, 100)}
            {card.text.length > 100 ? '...' : ''}&rdquo;
          </p>

          {/* Mood Bar */}
          <div
            className="flex items-center gap-4 pt-4 border-t"
            style={{ borderColor: `${colors.textSecondary}30` }}
          >
            <span className="text-4xl">{moodData?.emoji}</span>
            <div className="flex-1">
              <div
                className="h-1 rounded-full"
                style={{
                  backgroundColor: colors.moodColors[card.mood],
                }}
              />
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: colors.moodColors[card.mood] }}
            >
              {moodData?.label} Day
            </span>
          </div>
        </div>
      </div>
    );
  }
);
MagazineCoverTemplate.displayName = 'MagazineCoverTemplate';

// ============================================
// CENTERED QUOTE TEMPLATE
// ============================================
export const CenteredQuoteTemplate = forwardRef<HTMLDivElement, StoryCardProps>(
  ({ card, palette = 'pastelDream', showGrain = false, className }, ref) => {
    const colors = COLOR_PALETTES[palette];
    const moodData = MOODS.find((m) => m.value === card.mood);
    const date = formatDate(card.createdAt);

    return (
      <div
        ref={ref}
        className={cn(
          'story-card relative flex flex-col items-center justify-center p-8 text-center',
          showGrain && 'grain-subtle',
          className
        )}
        style={{ background: colors.gradient }}
      >
        {/* Mood Emoji */}
        <div className="text-6xl mb-8">{moodData?.emoji}</div>

        {/* Date */}
        <div
          className="text-story-micro mb-2"
          style={{ color: colors.textSecondary }}
        >
          {date.month.toUpperCase()} {date.day}
        </div>

        {/* Decorative Dots */}
        <div
          className="flex gap-2 mb-8"
          style={{ color: colors.textSecondary }}
        >
          <span>·</span>
          <span>·</span>
          <span>·</span>
        </div>

        {/* Quote */}
        <p
          className="text-story-headline font-serif leading-tight max-w-[280px]"
          style={{ color: colors.textPrimary }}
        >
          &ldquo;{card.text}&rdquo;
        </p>

        {/* Decorative Dots */}
        <div
          className="flex gap-2 mt-8 mb-4"
          style={{ color: colors.textSecondary }}
        >
          <span>·</span>
          <span>·</span>
          <span>·</span>
        </div>

        {/* Mood Label */}
        <div
          className="text-sm font-medium"
          style={{ color: colors.moodColors[card.mood] }}
        >
          {moodData?.label} Day
        </div>

        {/* Photo if exists */}
        {card.photoUrl && (
          <div className="mt-8 rounded-2xl overflow-hidden w-48 h-48">
            <img
              src={card.photoUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Branding */}
        <div
          className="absolute bottom-8 text-story-micro"
          style={{ color: colors.textSecondary }}
        >
          AI DAY RECAP
        </div>
      </div>
    );
  }
);
CenteredQuoteTemplate.displayName = 'CenteredQuoteTemplate';

// ============================================
// SPLIT MOOD TEMPLATE
// ============================================
export const SplitMoodTemplate = forwardRef<HTMLDivElement, StoryCardProps>(
  ({ card, palette = 'forestMist', showGrain = true, className }, ref) => {
    const colors = COLOR_PALETTES[palette];
    const moodData = MOODS.find((m) => m.value === card.mood);
    const date = formatDate(card.createdAt);

    const getMoodPercentage = (mood: string) => {
      const percentages = {
        great: 100,
        good: 75,
        neutral: 50,
        bad: 25,
        terrible: 10,
      };
      return percentages[mood as keyof typeof percentages] || 50;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'story-card relative',
          showGrain && 'grain-subtle',
          className
        )}
        style={{ backgroundColor: colors.background }}
      >
        {/* Top Half - Split */}
        <div className="flex h-1/2">
          {/* Left - Date & Mood */}
          <div
            className="w-1/2 p-6 flex flex-col justify-center"
            style={{ backgroundColor: colors.surface }}
          >
            <div
              className="text-story-micro mb-2"
              style={{ color: colors.textSecondary }}
            >
              {date.weekday.toUpperCase()}
            </div>
            <div
              className="text-5xl font-black"
              style={{ color: colors.textPrimary }}
            >
              {date.month.slice(0, 3).toUpperCase()}
            </div>
            <div
              className="text-7xl font-black leading-none"
              style={{ color: colors.accent }}
            >
              {date.day}
            </div>
            <div className="mt-6">
              <span className="text-4xl">{moodData?.emoji}</span>
              <div
                className="text-sm font-medium mt-2"
                style={{ color: colors.moodColors[card.mood] }}
              >
                {moodData?.label.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Right - Photo */}
          <div className="w-1/2">
            {card.photoUrl ? (
              <img
                src={card.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: colors.gradient }}
              />
            )}
          </div>
        </div>

        {/* Bottom Half - Text & Metrics */}
        <div className="h-1/2 p-6 flex flex-col">
          {/* Quote */}
          <p
            className="text-story-body leading-relaxed flex-1"
            style={{ color: colors.textPrimary }}
          >
            &ldquo;{card.text}&rdquo;
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {(card.blocks || []).slice(0, 4).map((block) => (
              <div
                key={block.id}
                className="rounded-xl p-3"
                style={{ backgroundColor: colors.surface }}
              >
                <div
                  className="text-xs mb-1"
                  style={{ color: colors.textSecondary }}
                >
                  {block.label.toUpperCase()}
                </div>
                <div className="metric-bar mb-2">
                  <div
                    className="metric-bar-fill"
                    style={{
                      width: `${getMoodPercentage(card.mood)}%`,
                      backgroundColor: colors.accent,
                    }}
                  />
                </div>
                <div
                  className="text-lg font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  {block.value}
                </div>
              </div>
            ))}
          </div>

          {/* Branding */}
          <div
            className="text-center text-story-micro mt-4"
            style={{ color: colors.textSecondary }}
          >
            AI DAY RECAP
          </div>
        </div>
      </div>
    );
  }
);
SplitMoodTemplate.displayName = 'SplitMoodTemplate';

// ============================================
// SCRAPBOOK TEMPLATE
// ============================================
export const ScrapbookTemplate = forwardRef<HTMLDivElement, StoryCardProps>(
  ({ card, palette = 'earthyRaw', className }, ref) => {
    const colors = COLOR_PALETTES[palette];
    const moodData = MOODS.find((m) => m.value === card.mood);
    const date = formatDate(card.createdAt);

    return (
      <div
        ref={ref}
        className={cn('story-card relative p-6 paper-texture', className)}
        style={{ backgroundColor: colors.background }}
      >
        {/* Decorative Stars */}
        <div
          className="absolute top-8 right-8 text-2xl"
          style={{ color: colors.accent }}
        >
          ✦
        </div>
        <div
          className="absolute top-16 right-16 text-lg"
          style={{ color: colors.textSecondary }}
        >
          ✦
        </div>

        {/* Date with decorative elements */}
        <div className="text-center mb-8 mt-4">
          <span
            className="text-story-micro"
            style={{ color: colors.textSecondary }}
          >
            ✦
          </span>
          <span
            className="mx-3 text-lg"
            style={{
              color: colors.textPrimary,
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
            }}
          >
            {date.month.toLowerCase()} {date.day}th
          </span>
          <span
            className="text-story-micro"
            style={{ color: colors.textSecondary }}
          >
            ✦
          </span>
        </div>

        {/* Photo with tape */}
        {card.photoUrl && (
          <div className="relative mx-auto w-[80%] mb-8">
            {/* Tape strips */}
            <div
              className="absolute -top-3 left-4 w-16 h-6 rounded-sm transform -rotate-6 z-10"
              style={{ backgroundColor: 'rgba(255, 250, 230, 0.9)' }}
            />
            <div
              className="absolute -top-3 right-4 w-16 h-6 rounded-sm transform rotate-6 z-10"
              style={{ backgroundColor: 'rgba(255, 250, 230, 0.9)' }}
            />
            {/* Photo */}
            <div className="polaroid-frame photo-tilted">
              <img
                src={card.photoUrl}
                alt=""
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        )}

        {/* Handwritten-style text */}
        <div
          className="relative mx-4 p-4 mb-6"
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
            &ldquo;{card.text}&rdquo;
          </p>
        </div>

        {/* Mood sticker */}
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: colors.surface,
              border: `2px solid ${colors.accent}`,
            }}
          >
            <span className="text-2xl">{moodData?.emoji}</span>
            <span
              className="text-sm font-medium"
              style={{ color: colors.accent }}
            >
              {moodData?.label}!
            </span>
          </div>
        </div>

        {/* Star ratings */}
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className="text-xl"
              style={{
                color:
                  star <=
                  (card.mood === 'great'
                    ? 5
                    : card.mood === 'good'
                    ? 4
                    : card.mood === 'neutral'
                    ? 3
                    : 2)
                    ? colors.accent
                    : colors.textSecondary,
              }}
            >
              ★
            </span>
          ))}
        </div>

        {/* Blocks as stickers */}
        {card.blocks && card.blocks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {card.blocks.slice(0, 3).map((block) => (
              <div
                key={block.id}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                }}
              >
                {block.icon} {block.value}
              </div>
            ))}
          </div>
        )}

        {/* Branding with squiggle */}
        <div
          className="text-center mt-auto"
          style={{ color: colors.textSecondary }}
        >
          <span className="text-sm">～ ai day recap ♡ ～</span>
        </div>
      </div>
    );
  }
);
ScrapbookTemplate.displayName = 'ScrapbookTemplate';

// ============================================
// DARK CINEMA TEMPLATE
// ============================================
export const DarkCinemaTemplate = forwardRef<HTMLDivElement, StoryCardProps>(
  (
    {
      card,
      palette = 'infraredNeon',
      showGrain = true,
      showVignette = true,
      className,
    },
    ref
  ) => {
    const colors = COLOR_PALETTES[palette];
    const moodData = MOODS.find((m) => m.value === card.mood);
    const date = formatDate(card.createdAt);

    return (
      <div
        ref={ref}
        className={cn(
          'story-card relative flex flex-col',
          showGrain && 'grain-heavy',
          showVignette && 'vignette',
          className
        )}
        style={{ backgroundColor: colors.background }}
      >
        {/* Top bar texture */}
        <div className="h-16" style={{ backgroundColor: colors.surface }} />

        {/* Photo with cinematic crop */}
        <div className="relative px-6 py-4">
          <div
            className="rounded-lg overflow-hidden"
            style={{ boxShadow: `0 0 60px ${colors.accent}30` }}
          >
            {card.photoUrl ? (
              <img
                src={card.photoUrl}
                alt=""
                className="w-full h-56 object-cover"
              />
            ) : (
              <div
                className="w-full h-56"
                style={{ background: colors.gradient }}
              />
            )}
          </div>
        </div>

        {/* Bottom bar texture */}
        <div className="h-8" style={{ backgroundColor: colors.surface }} />

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Date - Cinematic style */}
          <div
            className="text-center text-story-micro tracking-[0.3em] mb-8"
            style={{ color: colors.textSecondary }}
          >
            {date.month.toUpperCase()} {date.day}, {date.year}
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div
              className="h-px flex-1"
              style={{ backgroundColor: colors.textSecondary }}
            />
            <span style={{ color: colors.accent }}>◆</span>
            <div
              className="h-px flex-1"
              style={{ backgroundColor: colors.textSecondary }}
            />
          </div>

          {/* Quote */}
          <p
            className="text-story-subheadline text-center leading-relaxed flex-1"
            style={{ color: colors.textPrimary }}
          >
            &ldquo;{card.text}&rdquo;
          </p>

          {/* Mood Indicator - Dot Scale */}
          <div className="flex flex-col items-center mt-8">
            <div className="flex gap-2 mb-3">
              {['terrible', 'bad', 'neutral', 'good', 'great'].map(
                (mood, index) => (
                  <div
                    key={mood}
                    className={cn(
                      'mood-dot transition-all',
                      card.mood === mood && 'mood-dot-active'
                    )}
                    style={{
                      backgroundColor:
                        card.mood === mood
                          ? colors.moodColors[card.mood]
                          : colors.textSecondary + '40',
                      transform: card.mood === mood ? 'scale(1.5)' : 'scale(1)',
                    }}
                  />
                )
              )}
            </div>
            <span
              className="text-sm"
              style={{ color: colors.moodColors[card.mood] }}
            >
              {moodData?.label} Day
            </span>
          </div>

          {/* Metrics bar */}
          {card.blocks && card.blocks.length > 0 && (
            <div
              className="flex justify-center gap-6 mt-6 pt-4 border-t text-sm"
              style={{
                borderColor: colors.textSecondary + '30',
                color: colors.textSecondary,
              }}
            >
              {card.blocks.slice(0, 3).map((block) => (
                <span key={block.id}>
                  {block.icon} {block.value}
                </span>
              ))}
            </div>
          )}

          {/* Branding */}
          <div
            className="text-center text-story-micro mt-6"
            style={{ color: colors.textSecondary }}
          >
            AI DAY RECAP
          </div>
        </div>
      </div>
    );
  }
);
DarkCinemaTemplate.displayName = 'DarkCinemaTemplate';

// ============================================
// GRID COLLAGE TEMPLATE
// ============================================
export const GridCollageTemplate = forwardRef<HTMLDivElement, StoryCardProps>(
  ({ card, palette = 'cyberGradient', showGrain = true, className }, ref) => {
    const colors = COLOR_PALETTES[palette];
    const moodData = MOODS.find((m) => m.value === card.mood);
    const date = formatDate(card.createdAt);

    return (
      <div
        ref={ref}
        className={cn(
          'story-card relative flex flex-col',
          showGrain && 'grain-subtle',
          className
        )}
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: colors.textSecondary + '30' }}
        >
          <span
            className="text-story-micro tracking-widest"
            style={{ color: colors.textSecondary }}
          >
            {date.month.toUpperCase()} {date.day}
          </span>
          <span
            className="text-story-micro tracking-widest"
            style={{ color: colors.accent }}
          >
            {date.year}
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 flex-1">
          {/* Top Left - Photo or Gradient */}
          <div className="relative">
            {card.photoUrl ? (
              <img
                src={card.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: colors.gradient }}
              />
            )}
          </div>

          {/* Top Right - Mood */}
          <div
            className="flex flex-col items-center justify-center p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <span className="text-5xl mb-2">{moodData?.emoji}</span>
            <span
              className="text-lg font-bold"
              style={{ color: colors.moodColors[card.mood] }}
            >
              {moodData?.label.toUpperCase()}
            </span>
            <span
              className="text-xs mt-1"
              style={{ color: colors.textSecondary }}
            >
              DAY
            </span>
          </div>

          {/* Bottom Left - Text */}
          <div
            className="col-span-2 p-6 flex items-center"
            style={{ backgroundColor: colors.background }}
          >
            <p
              className="text-story-body leading-relaxed"
              style={{ color: colors.textPrimary }}
            >
              &ldquo;{card.text}&rdquo;
            </p>
          </div>
        </div>

        {/* Metrics Row */}
        <div
          className="grid grid-cols-2 border-t"
          style={{ borderColor: colors.textSecondary + '30' }}
        >
          {(card.blocks || []).slice(0, 2).map((block, index) => (
            <div
              key={block.id}
              className={cn('p-4 text-center', index === 0 && 'border-r')}
              style={{
                borderColor: colors.textSecondary + '30',
                backgroundColor: colors.surface,
              }}
            >
              <div className="text-2xl mb-1">{block.icon}</div>
              <div
                className="text-xl font-bold"
                style={{ color: colors.textPrimary }}
              >
                {block.value}
              </div>
              <div className="text-xs" style={{ color: colors.textSecondary }}>
                {block.label}
              </div>
            </div>
          ))}
          {(!card.blocks || card.blocks.length < 2) && (
            <div
              className="p-4 flex items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <span
                className="text-story-micro"
                style={{ color: colors.textSecondary }}
              >
                AI DAY RECAP
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
GridCollageTemplate.displayName = 'GridCollageTemplate';

// ============================================
// MAIN STORY CARD COMPONENT
// ============================================
export const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(
  ({ card, template = 'photoHero', palette, ...props }, ref) => {
    const templates = {
      photoHero: PhotoHeroTemplate,
      glassCards: GlassCardsTemplate,
      gridCollage: GridCollageTemplate,
      magazineCover: MagazineCoverTemplate,
      centeredQuote: CenteredQuoteTemplate,
      splitMood: SplitMoodTemplate,
      scrapbookStyle: ScrapbookTemplate,
      darkCinema: DarkCinemaTemplate,
    };

    const TemplateComponent = templates[template] || PhotoHeroTemplate;

    return (
      <TemplateComponent ref={ref} card={card} palette={palette} {...props} />
    );
  }
);
StoryCard.displayName = 'StoryCard';
