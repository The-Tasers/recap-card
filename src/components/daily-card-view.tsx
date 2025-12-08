'use client';

import { forwardRef } from 'react';
import {
  DailyCard,
  MOODS,
  COLOR_PALETTES,
  TYPOGRAPHY_SETS,
  PaletteId,
  StoryTemplateId,
  TypographySetId,
} from '@/lib/types';
import { MoodBadge } from './mood-selector';
import { DateBadge } from './date-badge';
import { BlockDisplay } from './blocks/block-editor';
import { cn } from '@/lib/utils';

interface DailyCardViewProps {
  card: DailyCard;
  variant?: 'default' | 'compact';
  onClick?: () => void;
  className?: string;
}

export const DailyCardView = forwardRef<HTMLDivElement, DailyCardViewProps>(
  ({ card, variant = 'default', onClick, className }, ref) => {
    const isCompact = variant === 'compact';
    const paletteId: PaletteId = (card.palette as PaletteId) || 'warmCinematic';
    const typographyId: TypographySetId =
      (card.typography as TypographySetId) || 'modernGeo';
    const palette = COLOR_PALETTES[paletteId];
    const typography = TYPOGRAPHY_SETS[typographyId];
    const moodData = MOODS.find((m) => m.value === card.mood);
    const moodColor = palette.moodColors[card.mood];
    const showGrain = card.showGrain ?? true;
    const showVignette = card.showVignette ?? false;

    // Determine if dark palette
    const isDark = [
      'warmCinematic',
      'cyberGradient',
      'infraredNeon',
      'forestMist',
      'sunsetBoulevard',
    ].includes(card.palette || 'warmCinematic');

    // Compact card for timeline view
    if (isCompact) {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(
            'rounded-2xl p-4 transition-all duration-200 cursor-pointer',
            'hover:shadow-lg hover:scale-[1.02]',
            className
          )}
          style={{
            background: palette.gradient,
            color: palette.textPrimary,
          }}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="text-xs opacity-70">
              {new Date(card.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="text-xl">{moodData?.emoji}</span>
          </div>
          <p
            className={cn(
              'text-sm leading-relaxed line-clamp-3',
              typography.bodyClass
            )}
            style={{ color: palette.textPrimary }}
          >
            {card.text}
          </p>
          {(card.blocks?.length || card.tags?.length || card.photoUrl) && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-xs opacity-60">
              {card.photoUrl && <span>📷</span>}
              {card.blocks && card.blocks.length > 0 && (
                <span>
                  +{card.blocks.length} detail
                  {card.blocks.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      );
    }

    // Full card view based on story template
    const template = card.storyTemplate || 'photoHero';

    // Photo Hero Template
    if (template === 'photoHero') {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(
            'rounded-3xl overflow-hidden shadow-xl relative',
            onClick && 'cursor-pointer hover:shadow-2xl hover:scale-[1.01]',
            className
          )}
          style={{ background: palette.background }}
        >
          {/* Photo Section */}
          {card.photoUrl && (
            <div className="relative h-64">
              <img
                src={card.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <div
                    className={cn(
                      'text-xs uppercase tracking-wider opacity-70 mb-1',
                      typography.microClass
                    )}
                    style={{ color: palette.textSecondary }}
                  >
                    {new Date(card.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                    })}
                  </div>
                  <div
                    className={cn(
                      'text-2xl font-bold',
                      typography.headlineClass
                    )}
                    style={{ color: '#fff' }}
                  >
                    {new Date(card.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div
                  className="text-4xl"
                  style={{ filter: `drop-shadow(0 0 8px ${moodColor})` }}
                >
                  {moodData?.emoji}
                </div>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div
            className="p-6 space-y-4"
            style={{ background: palette.surface }}
          >
            {!card.photoUrl && (
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div
                    className={cn(
                      'text-xs uppercase tracking-wider opacity-70',
                      typography.microClass
                    )}
                    style={{ color: palette.textSecondary }}
                  >
                    {new Date(card.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                    })}
                  </div>
                  <div
                    className={cn(
                      'text-xl font-bold',
                      typography.headlineClass
                    )}
                    style={{ color: palette.textPrimary }}
                  >
                    {new Date(card.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="text-3xl">{moodData?.emoji}</div>
              </div>
            )}

            <p
              className={cn('leading-relaxed', typography.bodyClass)}
              style={{ color: palette.textPrimary }}
            >
              {card.text}
            </p>

            {card.blocks && card.blocks.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-4">
                {card.blocks.map((block) => (
                  <div
                    key={block.id}
                    className="p-3 rounded-xl"
                    style={{ background: `${palette.accent}20` }}
                  >
                    <div
                      className="text-xs opacity-60 mb-1"
                      style={{ color: palette.textSecondary }}
                    >
                      {block.label}
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: palette.textPrimary }}
                    >
                      {block.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {card.tags && card.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      background: `${palette.accent}30`,
                      color: palette.accent,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Effects */}
          {showGrain && (
            <div className="grain-subtle absolute inset-0 pointer-events-none" />
          )}
          {showVignette && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
              }}
            />
          )}
        </div>
      );
    }

    // Centered Quote Template
    if (template === 'centeredQuote') {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(
            'rounded-3xl overflow-hidden shadow-xl relative min-h-[400px] flex flex-col items-center justify-center p-8',
            onClick && 'cursor-pointer hover:shadow-2xl hover:scale-[1.01]',
            className
          )}
          style={{ background: palette.gradient }}
        >
          <div className="text-center space-y-6 max-w-sm">
            <div
              className="text-5xl mb-4"
              style={{ filter: `drop-shadow(0 0 12px ${moodColor})` }}
            >
              {moodData?.emoji}
            </div>
            <blockquote
              className={cn(
                'text-xl leading-relaxed',
                typography.headlineClass
              )}
              style={{ color: palette.textPrimary }}
            >
              &ldquo;{card.text}&rdquo;
            </blockquote>
            <div
              className={cn('text-sm opacity-70', typography.microClass)}
              style={{ color: palette.textSecondary }}
            >
              {new Date(card.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          {showGrain && (
            <div className="grain-subtle absolute inset-0 pointer-events-none" />
          )}
          {showVignette && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
              }}
            />
          )}
        </div>
      );
    }

    // Glass Cards Template
    if (template === 'glassCards' && card.photoUrl) {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(
            'rounded-3xl overflow-hidden shadow-xl relative',
            onClick && 'cursor-pointer hover:shadow-2xl hover:scale-[1.01]',
            className
          )}
        >
          <img
            src={card.photoUrl}
            alt=""
            className="w-full h-[450px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">{moodData?.emoji}</span>
                <span className="text-sm text-white/70">
                  {new Date(card.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p
                className={cn(
                  'text-white leading-relaxed',
                  typography.bodyClass
                )}
              >
                {card.text}
              </p>
            </div>
          </div>

          {showGrain && (
            <div className="grain-subtle absolute inset-0 pointer-events-none" />
          )}
        </div>
      );
    }

    // Magazine Cover Template
    if (template === 'magazineCover') {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(
            'rounded-3xl overflow-hidden shadow-xl relative',
            onClick && 'cursor-pointer hover:shadow-2xl hover:scale-[1.01]',
            className
          )}
          style={{ background: palette.background }}
        >
          <div className="p-8 space-y-6">
            {/* Magazine-style header */}
            <div
              className="flex items-center justify-between border-b pb-4"
              style={{ borderColor: `${palette.textSecondary}30` }}
            >
              <div
                className={cn(
                  'text-xs uppercase tracking-[0.3em]',
                  typography.microClass
                )}
                style={{ color: palette.textSecondary }}
              >
                Daily Recap
              </div>
              <div className="text-4xl">{moodData?.emoji}</div>
            </div>

            {/* Big headline date */}
            <div
              className={cn(
                'text-5xl font-black tracking-tight',
                typography.headlineClass
              )}
              style={{ color: palette.textPrimary }}
            >
              {new Date(card.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>

            {card.photoUrl && (
              <div className="rounded-xl overflow-hidden">
                <img
                  src={card.photoUrl}
                  alt=""
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <p
              className={cn('text-lg leading-relaxed', typography.bodyClass)}
              style={{ color: palette.textPrimary }}
            >
              {card.text}
            </p>

            {card.blocks && card.blocks.length > 0 && (
              <div
                className="grid grid-cols-2 gap-3 pt-4 border-t"
                style={{ borderColor: `${palette.textSecondary}20` }}
              >
                {card.blocks.slice(0, 4).map((block) => (
                  <div key={block.id} className="text-center p-3">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: palette.accent }}
                    >
                      {block.value}
                    </div>
                    <div
                      className="text-xs uppercase tracking-wider opacity-60"
                      style={{ color: palette.textSecondary }}
                    >
                      {block.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showGrain && (
            <div className="grain-subtle absolute inset-0 pointer-events-none" />
          )}
        </div>
      );
    }

    // Default fallback - similar to photoHero but simpler
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'rounded-3xl overflow-hidden shadow-xl relative',
          onClick && 'cursor-pointer hover:shadow-2xl hover:scale-[1.01]',
          className
        )}
        style={{ background: palette.gradient }}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div
                className={cn(
                  'text-xs uppercase tracking-wider opacity-70',
                  typography.microClass
                )}
                style={{ color: palette.textSecondary }}
              >
                {new Date(card.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                })}
              </div>
              <div
                className={cn('text-xl font-bold', typography.headlineClass)}
                style={{ color: palette.textPrimary }}
              >
                {new Date(card.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div
              className="text-3xl"
              style={{ filter: `drop-shadow(0 0 8px ${moodColor})` }}
            >
              {moodData?.emoji}
            </div>
          </div>

          <p
            className={cn('leading-relaxed', typography.bodyClass)}
            style={{ color: palette.textPrimary }}
          >
            {card.text}
          </p>

          {card.photoUrl && (
            <div className="rounded-2xl overflow-hidden">
              <img
                src={card.photoUrl}
                alt=""
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {card.blocks && card.blocks.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-4">
              {card.blocks.map((block) => (
                <div
                  key={block.id}
                  className="p-3 rounded-xl"
                  style={{ background: `${palette.surface}` }}
                >
                  <div
                    className="text-xs opacity-60 mb-1"
                    style={{ color: palette.textSecondary }}
                  >
                    {block.label}
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: palette.textPrimary }}
                  >
                    {block.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs"
                  style={{
                    background: `${palette.accent}30`,
                    color: palette.accent,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {showGrain && (
          <div className="grain-subtle absolute inset-0 pointer-events-none" />
        )}
        {showVignette && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
            }}
          />
        )}
      </div>
    );
  }
);

DailyCardView.displayName = 'DailyCardView';
