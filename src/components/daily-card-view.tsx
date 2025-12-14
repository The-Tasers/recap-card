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
  variant?: 'default' | 'compact' | 'calendar';
  onClick?: () => void;
  className?: string;
}

export const DailyCardView = forwardRef<HTMLDivElement, DailyCardViewProps>(
  ({ card, variant = 'default', onClick, className }, ref) => {
    const isCompact = variant === 'compact';
    const isCalendar = variant === 'calendar';
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

    // Minimal calendar card - only mood emoji and background
    if (isCalendar) {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(
            'rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer relative overflow-hidden aspect-square lg:aspect-4/5 xl:aspect-5/6',
            'hover:shadow-lg hover:scale-[1.02]',
            moodGradients[card.mood],
            className
          )}
        >
          {/* Mood Emoji - centered */}
          <div className="relative z-10">
            <span className="text-3xl lg:text-4xl xl:text-5xl">
              {moodData?.emoji}
            </span>
          </div>
        </div>
      );
    }

    // Compact card for timeline view
    if (isCompact) {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(
            'rounded-2xl p-3 flex flex-col lg:p-6 transition-all duration-200 cursor-pointer relative overflow-hidden',
            'hover:shadow-lg lg:hover:scale-[1.02] min-h-[140px] lg:min-h-[220px] xl:min-h-[280px] h-full',
            moodGradients[card.mood],
            className
          )}
        >
          {/* Content - on top of background */}
          <div className="relative z-0 flex flex-col gap-2 lg:gap-4 flex-1">
            <div className="flex flex-col gap-2 lg:gap-3 flex-1">
              <div className="flex items-start justify-between gap-2 lg:gap-3 mb-1 lg:mb-3">
                <span className="text-xs lg:text-base text-white/90 font-semibold">
                  {new Date(card.createdAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-2xl lg:text-4xl">{moodData?.emoji}</span>
              </div>
              <p
                className={cn(
                  'text-sm lg:text-lg leading-snug lg:leading-relaxed line-clamp-2 text-white font-semibold',
                  typography.bodyClass
                )}
              >
                {card.text}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Default fallback - layout matching screenshot
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'rounded-3xl overflow-hidden shadow-xl relative',
          moodGradients[card.mood],
          onClick && 'cursor-pointer hover:shadow-2xl hover:scale-[1.01]',
          className
        )}
      >
        <div className="flex relative z-0">
          {/* Left side - Date and Mood */}
          <div className="flex flex-col items-center justify-start gap-2 lg:gap-3 p-2 lg:p-4 bg-white/20 min-w-[70px] lg:min-w-[100px]">
            <div className="flex flex-col items-center">
              <div className="text-3xl lg:text-5xl mb-1 lg:mb-2">
                {moodData?.emoji}
              </div>
              <div className="text-xs lg:text-sm font-semibold text-white/90 text-center">
                {new Date(card.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                })}
              </div>
              <div className="text-[10px] lg:text-xs font-medium text-white/80 text-center">
                {new Date(card.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                })}
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex-1 p-3 lg:p-4 space-y-2 lg:space-y-3 overflow-hidden">
            {/* Blocks in horizontal row - exclude sleep */}
            {card.blocks &&
              card.blocks.filter((b) => b.blockId !== 'sleep').length > 0 && (
                <div className="flex gap-1.5 lg:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 lg:-mx-4 px-3 lg:px-4">
                  {card.blocks
                    .filter((b) => b.blockId !== 'sleep')
                    .map((block) => (
                      <div
                        key={block.id}
                        className="flex-shrink-0 px-2 py-1.5 lg:px-3 lg:py-2 rounded-xl bg-white/30 backdrop-blur-sm"
                      >
                        <BlockDisplay block={block} compact />
                      </div>
                    ))}
                </div>
              )}

            {/* Text content */}
            {card.text && (
              <p className="text-xs lg:text-sm text-white/95 leading-relaxed font-medium">
                {card.text}
              </p>
            )}

            {/* Photo */}
            {card.photoUrl && (
              <div className="rounded-xl lg:rounded-2xl overflow-hidden aspect-square w-full max-w-[200px]">
                <img
                  src={card.photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Sleep info if available */}
            {card.blocks?.find((b) => b.blockId === 'sleep' && b.value) && (
              <div className="flex items-center gap-1.5 lg:gap-2 pt-1 lg:pt-2 text-xs lg:text-sm text-white/80">
                <span>🌙</span>
                <span>
                  {card.blocks.find((b) => b.blockId === 'sleep')?.value} hrs
                </span>
              </div>
            )}
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
                'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
            }}
          />
        )}
      </div>
    );
  }
);

DailyCardView.displayName = 'DailyCardView';
