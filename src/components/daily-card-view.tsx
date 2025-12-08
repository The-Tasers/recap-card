'use client';

import { forwardRef } from 'react';
import { DailyCard, MOODS, THEMES, FONT_PRESETS } from '@/lib/types';
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
    const theme = card.theme ? THEMES[card.theme] : THEMES.sunrise;
    const font = card.font ? FONT_PRESETS[card.font] : FONT_PRESETS.system;
    const moodData = MOODS.find((m) => m.value === card.mood);

    // For photo header template
    if (card.template === 'photoHeader' && !isCompact) {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(
            'rounded-3xl overflow-hidden shadow-lg border-0',
            onClick && 'cursor-pointer hover:shadow-xl hover:scale-[1.01]',
            card.darkMode && 'dark',
            font.className,
            className
          )}
        >
          {card.photoUrl && (
            <div className="relative h-56">
              <img
                src={card.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm font-medium">
                    {new Date(card.createdAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-2xl">{moodData?.emoji}</span>
                </div>
              </div>
            </div>
          )}
          <div
            className={cn(
              'p-5 space-y-3 bg-gradient-to-br',
              theme.gradient
            )}
          >
            {!card.photoUrl && (
              <div className="flex items-center justify-between">
                <DateBadge date={card.createdAt} variant="muted" />
                <MoodBadge mood={card.mood} />
              </div>
            )}
            <p className="text-base leading-relaxed">{card.text}</p>
            {card.blocks && card.blocks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {card.blocks.slice(0, 4).map((block) => (
                  <div
                    key={block.id}
                    className="px-3 py-1.5 rounded-full bg-black/5 text-xs"
                  >
                    {block.label}: {block.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // For ultra minimal template
    if (card.template === 'ultraMinimal' && !isCompact) {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(
            'rounded-3xl border shadow-sm overflow-hidden',
            card.darkMode ? 'bg-neutral-900 text-white' : 'bg-white',
            onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.01]',
            font.className,
            className
          )}
        >
          <div className="p-8 space-y-6">
            <div className="text-center">
              <span className="text-4xl">{moodData?.emoji}</span>
            </div>
            <p className="text-lg leading-relaxed text-center">{card.text}</p>
            {card.photoUrl && (
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={card.photoUrl}
                  alt=""
                  className="w-full h-40 object-cover"
                />
              </div>
            )}
            <div className="text-center text-sm text-muted-foreground">
              {new Date(card.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      );
    }

    // For mixed grid template
    if (card.template === 'mixedGrid' && !isCompact) {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={cn(
            'rounded-3xl border-0 shadow-lg overflow-hidden',
            card.darkMode && 'dark',
            onClick && 'cursor-pointer hover:shadow-xl hover:scale-[1.01]',
            font.className,
            className
          )}
        >
          <div
            className={cn(
              'p-5 space-y-4 bg-gradient-to-br',
              theme.gradient
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{moodData?.emoji}</span>
              <div className="flex-1">
                <DateBadge date={card.createdAt} variant="muted" />
              </div>
            </div>
            <p className="text-base leading-relaxed">{card.text}</p>
            <div className="grid grid-cols-2 gap-2">
              {card.photoUrl && (
                <div className="col-span-2 rounded-xl overflow-hidden">
                  <img
                    src={card.photoUrl}
                    alt=""
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
              {card.blocks?.map((block) => (
                <div
                  key={block.id}
                  className="p-3 rounded-xl bg-white/50 backdrop-blur-sm"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {block.label}
                  </div>
                  <div className="text-sm font-medium truncate">
                    {block.value || '—'}
                  </div>
                </div>
              ))}
            </div>
            {card.tags && card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-white/50 text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default template (original design + enhancements)
    const backgroundStyle = card.photoUrl && isCompact
      ? {
          backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.95)), url(${card.photoUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : undefined;

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'rounded-3xl p-6 transition-all duration-200',
          'border border-neutral-200/50 shadow-sm',
          onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.01]',
          card.darkMode && 'dark bg-neutral-900 text-white border-neutral-700',
          !card.darkMode && `bg-gradient-to-br ${theme.gradient}`,
          font.className,
          className
        )}
        style={backgroundStyle}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <DateBadge date={card.createdAt} variant="muted" />
          <MoodBadge mood={card.mood} size={isCompact ? 'sm' : 'md'} />
        </div>

        <p
          className={cn(
            'leading-relaxed whitespace-pre-wrap',
            card.darkMode ? 'text-neutral-100' : 'text-neutral-800',
            isCompact ? 'text-sm line-clamp-3' : 'text-base'
          )}
        >
          {card.text}
        </p>

        {card.photoUrl && !isCompact && (
          <div className="mt-4 rounded-2xl overflow-hidden">
            <img
              src={card.photoUrl}
              alt="Card photo"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {card.blocks && card.blocks.length > 0 && !isCompact && (
          <div className="space-y-2 pt-4 mt-4 border-t border-black/5">
            {card.blocks.map((block) => (
              <BlockDisplay key={block.id} block={block} />
            ))}
          </div>
        )}

        {card.tags && card.tags.length > 0 && !isCompact && (
          <div className="flex flex-wrap gap-1.5 pt-3 mt-3">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  card.darkMode
                    ? 'bg-white/10 text-white/70'
                    : 'bg-black/5 text-muted-foreground'
                )}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Compact view indicators */}
        {isCompact && (card.blocks?.length || card.tags?.length || card.photoUrl) && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-black/5 text-xs text-muted-foreground">
            {card.photoUrl && <span>📷</span>}
            {card.blocks && card.blocks.length > 0 && (
              <span>+{card.blocks.length} detail{card.blocks.length > 1 ? 's' : ''}</span>
            )}
            {card.tags && card.tags.length > 0 && (
              <span>#{card.tags.length} tag{card.tags.length > 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

DailyCardView.displayName = 'DailyCardView';
