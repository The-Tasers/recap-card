'use client';

import { forwardRef } from 'react';
import {
  DailyCard,
  MOODS,
  COLOR_PALETTES,
  TYPOGRAPHY_SETS,
  PaletteId,
  TypographySetId,
} from '@/lib/types';
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

    // Mood-based gradients - matching mood emoji colors
    // great: green (#22C55E), good: lime (#84CC16), neutral: yellow (#EAB308), bad: orange (#F97316), terrible: red (#EF4444)
    const moodGradients = {
      great:
        'bg-gradient-to-br from-green-500/90 via-emerald-500/85 to-green-600/90',
      good: 'bg-gradient-to-br from-lime-500/90 via-lime-400/85 to-lime-600/90',
      neutral:
        'bg-gradient-to-br from-yellow-400/90 via-yellow-300/85 to-yellow-500/90',
      bad: 'bg-gradient-to-br from-orange-500/90 via-orange-400/85 to-orange-600/90',
      terrible:
        'bg-gradient-to-br from-red-500/90 via-red-400/85 to-red-600/90',
    };

    // Compact card for timeline view
    if (isCompact) {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(
            'rounded-2xl p-5 flex flex-col lg:p-6 transition-all duration-200 cursor-pointer relative overflow-hidden',
            'hover:shadow-lg lg:hover:scale-[1.02] min-h-[200px] lg:min-h-[220px] xl:min-h-[280px] h-full',
            moodGradients[card.mood],
            className
          )}
        >
          {/* Photo Background - Semi-transparent */}
          {card.photoUrl && (
            <div className="absolute inset-0 z-0">
              <img
                src={card.photoUrl}
                alt=""
                className="w-full h-full object-cover opacity-10"
              />
            </div>
          )}

          {/* Content - on top of background */}
          <div className="relative z-10 flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-sm lg:text-base text-neutral-900/70 dark:text-white/80 font-semibold">
                  {new Date(card.createdAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-3xl lg:text-4xl">{moodData?.emoji}</span>
              </div>
              <p
                className={cn(
                  'text-base lg:text-lg leading-relaxed line-clamp-2 text-neutral-900 dark:text-white font-semibold',
                  typography.bodyClass
                )}
              >
                {card.text}
              </p>
            </div>
            {card.tags && card.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {card.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-sm bg-white/50 dark:bg-black/40 px-3 py-1 rounded-full text-neutral-900 dark:text-white font-semibold backdrop-blur-sm"
                  >
                    #{tag}
                  </span>
                ))}
                {card.tags.length > 2 && (
                  <span className="text-sm bg-white/50 dark:bg-black/40 px-3 py-1 rounded-full text-neutral-900 dark:text-white font-semibold backdrop-blur-sm">
                    +{card.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
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
          moodGradients[card.mood],
          className
        )}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div
                className={cn(
                  'text-xs uppercase tracking-wider text-neutral-900/70 dark:text-white/80 font-semibold',
                  typography.microClass
                )}
              >
                {new Date(card.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                })}
              </div>
              <div
                className={cn(
                  'text-xl font-bold text-neutral-900 dark:text-white',
                  typography.headlineClass
                )}
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
            className={cn(
              'leading-relaxed text-neutral-900 dark:text-white font-medium',
              typography.bodyClass
            )}
          >
            {card.text}
          </p>

          {card.photoUrl && (
            <div className="rounded-2xl overflow-hidden">
              <img src={card.photoUrl} alt="" className="w-full object-cover" />
            </div>
          )}

          {card.blocks && card.blocks.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-4">
              {card.blocks.map((block) => (
                <div
                  key={block.id}
                  className="p-3 rounded-xl bg-white/50 dark:bg-black/40"
                >
                  <BlockDisplay block={block} compact />
                </div>
              ))}
            </div>
          )}

          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs bg-white/50 dark:bg-black/40 text-neutral-900 dark:text-white font-medium backdrop-blur-sm"
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
