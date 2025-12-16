'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  DailyCard,
  ThemeId,
  THEMES,
  FontPreset,
  FONT_PRESETS,
  MOODS,
} from '@/lib/types';
import { MOOD_ICONS } from '@/lib/icons';
import { MoodBadge } from '@/components/mood-selector';
import { DateBadge } from '@/components/date-badge';
import { BlockDisplay } from './block-editor';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardTemplateProps {
  card: DailyCard;
  className?: string;
}

const getThemeClasses = (themeId: ThemeId = 'sunrise') => {
  const theme = THEMES[themeId];
  return theme.gradient;
};

const getFontClasses = (fontId: FontPreset = 'system') => {
  const font = FONT_PRESETS[fontId];
  return font.className;
};

// Default Template (original design)
export const DefaultTemplate = forwardRef<HTMLDivElement, CardTemplateProps>(
  ({ card, className }, ref) => {
    const themeClasses = getThemeClasses(card.theme);
    const fontClasses = getFontClasses(card.font);

    return (
      <Card
        ref={ref}
        className={cn(
          'w-full max-w-sm mx-auto rounded-3xl border-0 shadow-lg overflow-hidden',
          card.darkMode && 'dark',
          className
        )}
      >
        <CardContent
          className={cn(
            'p-6 space-y-4 bg-linear-to-br',
            themeClasses,
            fontClasses
          )}
        >
          {card.photoUrl && (
            <div className="rounded-2xl overflow-hidden -mx-1">
              <img
                src={card.photoUrl}
                alt=""
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <DateBadge date={card.createdAt} />
            <MoodBadge mood={card.mood} />
          </div>

          <p className="text-base leading-relaxed text-foreground">
            {card.text}
          </p>

          {card.blocks && card.blocks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-black/5">
              {card.blocks.map((block) => (
                <BlockDisplay key={block.id} block={block} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);
DefaultTemplate.displayName = 'DefaultTemplate';

// Photo Header Template - large photo at top
export const PhotoHeaderTemplate = forwardRef<
  HTMLDivElement,
  CardTemplateProps
>(({ card, className }, ref) => {
  const themeClasses = getThemeClasses(card.theme);
  const fontClasses = getFontClasses(card.font);
  const moodData = MOODS.find((m) => m.value === card.mood);

  return (
    <Card
      ref={ref}
      className={cn(
        'w-full max-w-sm mx-auto rounded-3xl border-0 shadow-lg overflow-hidden',
        card.darkMode && 'dark',
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
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-medium">
                {new Date(card.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {(() => {
                const MoodIconComp = MOOD_ICONS[card.mood];
                return <MoodIconComp className="h-6 w-6" />;
              })()}
            </div>
          </div>
        </div>
      )}

      <CardContent
        className={cn(
          'p-5 space-y-3 bg-linear-to-br',
          themeClasses,
          fontClasses
        )}
      >
        {!card.photoUrl && (
          <div className="flex items-center justify-between">
            <DateBadge date={card.createdAt} />
            <MoodBadge mood={card.mood} />
          </div>
        )}

        <p className="text-base leading-relaxed text-foreground">{card.text}</p>

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
      </CardContent>
    </Card>
  );
});
PhotoHeaderTemplate.displayName = 'PhotoHeaderTemplate';

// Ultra Minimal Template - clean, text-focused
export const UltraMinimalTemplate = forwardRef<
  HTMLDivElement,
  CardTemplateProps
>(({ card, className }, ref) => {
  const fontClasses = getFontClasses(card.font);
  const moodData = MOODS.find((m) => m.value === card.mood);

  return (
    <Card
      ref={ref}
      className={cn(
        'w-full max-w-sm mx-auto rounded-3xl border shadow-sm overflow-hidden',
        card.darkMode ? 'bg-neutral-900 text-white' : 'bg-white',
        className
      )}
    >
      <CardContent className={cn('p-8 space-y-6', fontClasses)}>
        <div className="text-center flex justify-center">
          {(() => {
            const MoodIconComp = MOOD_ICONS[card.mood];
            return <MoodIconComp className="h-10 w-10" />;
          })()}
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
      </CardContent>
    </Card>
  );
});
UltraMinimalTemplate.displayName = 'UltraMinimalTemplate';

// Mixed Grid Template - blocks in a grid layout
export const MixedGridTemplate = forwardRef<HTMLDivElement, CardTemplateProps>(
  ({ card, className }, ref) => {
    const themeClasses = getThemeClasses(card.theme);
    const fontClasses = getFontClasses(card.font);
    const moodData = MOODS.find((m) => m.value === card.mood);

    return (
      <Card
        ref={ref}
        className={cn(
          'w-full max-w-sm mx-auto rounded-3xl border-0 shadow-lg overflow-hidden',
          card.darkMode && 'dark',
          className
        )}
      >
        <CardContent
          className={cn(
            'p-5 space-y-4 bg-linear-to-br',
            themeClasses,
            fontClasses
          )}
        >
          <div className="flex items-start gap-3">
            {(() => {
              const MoodIconComp = MOOD_ICONS[card.mood];
              return <MoodIconComp className="h-8 w-8" />;
            })()}
            <div className="flex-1">
              <DateBadge date={card.createdAt} />
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
        </CardContent>
      </Card>
    );
  }
);
MixedGridTemplate.displayName = 'MixedGridTemplate';

// Template renderer - picks the right template based on card.template
export const DailyCardView = forwardRef<HTMLDivElement, CardTemplateProps>(
  ({ card, className }, ref) => {
    const templateId = card.template || 'default';

    switch (templateId) {
      case 'photoHeader':
        return (
          <PhotoHeaderTemplate ref={ref} card={card} className={className} />
        );
      case 'ultraMinimal':
        return (
          <UltraMinimalTemplate ref={ref} card={card} className={className} />
        );
      case 'mixedGrid':
        return (
          <MixedGridTemplate ref={ref} card={card} className={className} />
        );
      default:
        return <DefaultTemplate ref={ref} card={card} className={className} />;
    }
  }
);
DailyCardView.displayName = 'DailyCardView';
