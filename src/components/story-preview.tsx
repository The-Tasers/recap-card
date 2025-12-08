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
import { cn } from '@/lib/utils';

// Story dimensions - 9:16 aspect ratio (1080x1920 for export)
export const STORY_DIMENSIONS = {
  width: 1080,
  height: 1920,
  aspectRatio: '9/16',
  previewWidth: 270, // 1/4 scale for preview
  previewHeight: 480,
};

interface StoryPreviewProps {
  card: Partial<DailyCard> & { mood: DailyCard['mood']; text: string };
  palette?: PaletteId;
  typography?: TypographySetId;
  storyTemplate?: DailyCard['storyTemplate'];
  showGrain?: boolean;
  showVignette?: boolean;
  scale?: 'preview' | 'export';
  className?: string;
}

export const StoryPreview = forwardRef<HTMLDivElement, StoryPreviewProps>(
  (
    {
      card,
      palette: paletteProp,
      typography: typographyProp,
      storyTemplate: templateProp,
      showGrain: showGrainProp,
      showVignette: showVignetteProp,
      scale = 'preview',
      className,
    },
    ref
  ) => {
    const paletteId: PaletteId =
      paletteProp || (card.palette as PaletteId) || 'warmCinematic';
    const typographyId: TypographySetId =
      typographyProp || (card.typography as TypographySetId) || 'modernGeo';
    const template = templateProp || card.storyTemplate || 'photoHero';
    const showGrain = showGrainProp ?? card.showGrain ?? true;
    const showVignette = showVignetteProp ?? card.showVignette ?? false;

    const palette = COLOR_PALETTES[paletteId];
    const typography = TYPOGRAPHY_SETS[typographyId];
    const moodData = MOODS.find((m) => m.value === card.mood);
    const moodColor = palette.moodColors[card.mood];

    const isExport = scale === 'export';
    const containerStyle = isExport
      ? { width: STORY_DIMENSIONS.width, height: STORY_DIMENSIONS.height }
      : { aspectRatio: STORY_DIMENSIONS.aspectRatio };

    const fontSize = (base: number) => `${base * (isExport ? 1 : 0.5)}px`;

    // Use createdAt or fallback to empty string for consistent date display
    const dateValue = card.createdAt || new Date().toISOString();

    // Photo Hero Template (default)
    if (template === 'photoHero') {
      return (
        <div
          ref={ref}
          className={cn(
            'relative overflow-hidden flex flex-col',
            !isExport && 'rounded-2xl shadow-xl',
            className
          )}
          style={{
            ...containerStyle,
            background: palette.background,
          }}
        >
          {/* Photo Section - 60% */}
          {card.photoUrl ? (
            <div className="relative flex-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

              {/* Date & Mood overlay on photo */}
              <div className="absolute bottom-0 left-0 right-0 p-[5%] flex items-end justify-between">
                <div>
                  <div
                    className={cn(
                      'uppercase tracking-wider opacity-80',
                      typography.microClass
                    )}
                    style={{
                      color: '#fff',
                      fontSize: fontSize(14),
                    }}
                  >
                    {new Date(dateValue).toLocaleDateString('en-US', {
                      weekday: 'long',
                    })}
                  </div>
                  <div
                    className={cn('font-bold', typography.headlineClass)}
                    style={{
                      color: '#fff',
                      fontSize: fontSize(48),
                      lineHeight: 1.1,
                    }}
                  >
                    {new Date(dateValue).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: fontSize(72),
                    filter: `drop-shadow(0 0 ${
                      isExport ? 16 : 8
                    }px ${moodColor})`,
                  }}
                >
                  {moodData?.emoji}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex-3 p-[5%] flex flex-col justify-end"
              style={{ background: palette.gradient }}
            >
              <div
                className={cn(
                  'uppercase tracking-wider opacity-70',
                  typography.microClass
                )}
                style={{
                  color: palette.textSecondary,
                  fontSize: fontSize(14),
                }}
              >
                {new Date(dateValue).toLocaleDateString('en-US', {
                  weekday: 'long',
                })}
              </div>
              <div className="flex items-end justify-between">
                <div
                  className={cn('font-bold', typography.headlineClass)}
                  style={{
                    color: palette.textPrimary,
                    fontSize: fontSize(56),
                    lineHeight: 1.1,
                  }}
                >
                  {new Date(dateValue).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div
                  style={{
                    fontSize: fontSize(64),
                    filter: `drop-shadow(0 0 ${
                      isExport ? 16 : 8
                    }px ${moodColor})`,
                  }}
                >
                  {moodData?.emoji}
                </div>
              </div>
            </div>
          )}

          {/* Content Section - 40% */}
          <div
            className="flex-4 p-[5%] flex flex-col justify-center"
            style={{ background: palette.surface }}
          >
            <p
              className={cn('leading-relaxed', typography.bodyClass)}
              style={{
                color: palette.textPrimary,
                fontSize: fontSize(24),
                lineHeight: 1.6,
              }}
            >
              {card.text || 'Write about your day...'}
            </p>

            {/* Blocks */}
            {card.blocks && card.blocks.length > 0 && (
              <div className="grid grid-cols-2 gap-[2%] mt-[4%]">
                {card.blocks.slice(0, 4).map((block) => (
                  <div
                    key={block.id}
                    className="rounded-xl p-[8%]"
                    style={{ background: `${palette.accent}20` }}
                  >
                    <div
                      style={{
                        color: palette.textSecondary,
                        fontSize: fontSize(12),
                      }}
                    >
                      {block.label}
                    </div>
                    <div
                      style={{
                        color: palette.textPrimary,
                        fontSize: fontSize(18),
                        fontWeight: 600,
                      }}
                    >
                      {block.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tags */}
            {card.tags && card.tags.length > 0 && (
              <div className="flex flex-wrap gap-[2%] mt-[4%]">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full"
                    style={{
                      background: `${palette.accent}30`,
                      color: palette.accent,
                      fontSize: fontSize(14),
                      padding: `${isExport ? 8 : 4}px ${isExport ? 16 : 8}px`,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Safe zone indicator (preview only) */}
          {!isExport && (
            <div className="absolute top-2 left-2 right-2 h-8 border-t-2 border-dashed border-white/20 pointer-events-none" />
          )}
          {!isExport && (
            <div className="absolute bottom-2 left-2 right-2 h-8 border-b-2 border-dashed border-white/20 pointer-events-none" />
          )}

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
          className={cn(
            'relative overflow-hidden flex flex-col items-center justify-center',
            !isExport && 'rounded-2xl shadow-xl',
            className
          )}
          style={{
            ...containerStyle,
            background: palette.gradient,
          }}
        >
          <div className="text-center p-[8%] max-w-[85%]">
            <div
              style={{
                fontSize: fontSize(80),
                filter: `drop-shadow(0 0 ${isExport ? 20 : 10}px ${moodColor})`,
                marginBottom: isExport ? 40 : 20,
              }}
            >
              {moodData?.emoji}
            </div>

            <blockquote
              className={cn(typography.headlineClass)}
              style={{
                color: palette.textPrimary,
                fontSize: fontSize(32),
                lineHeight: 1.5,
              }}
            >
              &ldquo;{card.text || 'Write your thoughts...'}&rdquo;
            </blockquote>

            <div
              className={cn('mt-[6%]', typography.microClass)}
              style={{
                color: palette.textSecondary,
                fontSize: fontSize(16),
              }}
            >
              {new Date(dateValue).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          {/* Safe zone indicator (preview only) */}
          {!isExport && (
            <>
              <div className="absolute top-2 left-2 right-2 h-8 border-t-2 border-dashed border-white/20 pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 h-8 border-b-2 border-dashed border-white/20 pointer-events-none" />
            </>
          )}

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
          className={cn(
            'relative overflow-hidden',
            !isExport && 'rounded-2xl shadow-xl',
            className
          )}
          style={containerStyle}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.photoUrl}
            alt=""
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10" />

          {/* Glass card at bottom */}
          <div className="absolute bottom-[5%] left-[5%] right-[5%]">
            <div
              className="rounded-2xl p-[5%] border border-white/20"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center justify-between mb-[4%]">
                <div
                  style={{
                    fontSize: fontSize(56),
                    filter: `drop-shadow(0 0 ${
                      isExport ? 12 : 6
                    }px ${moodColor})`,
                  }}
                >
                  {moodData?.emoji}
                </div>
                <div
                  style={{
                    color: '#fff',
                    fontSize: fontSize(16),
                    opacity: 0.8,
                  }}
                >
                  {new Date(dateValue).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <p
                className={typography.bodyClass}
                style={{
                  color: '#fff',
                  fontSize: fontSize(22),
                  lineHeight: 1.5,
                }}
              >
                {card.text || 'Write about your day...'}
              </p>
            </div>
          </div>

          {/* Safe zone indicator (preview only) */}
          {!isExport && (
            <>
              <div className="absolute top-2 left-2 right-2 h-8 border-t-2 border-dashed border-white/20 pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 h-8 border-b-2 border-dashed border-white/20 pointer-events-none" />
            </>
          )}

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
          className={cn(
            'relative overflow-hidden flex flex-col',
            !isExport && 'rounded-2xl shadow-xl',
            className
          )}
          style={{
            ...containerStyle,
            background: palette.background,
          }}
        >
          <div className="p-[6%] flex-1 flex flex-col">
            {/* Magazine header */}
            <div
              className="flex items-center justify-between pb-[4%] border-b"
              style={{ borderColor: `${palette.textSecondary}30` }}
            >
              <div
                className={cn(
                  'uppercase tracking-[0.3em]',
                  typography.microClass
                )}
                style={{
                  color: palette.textSecondary,
                  fontSize: fontSize(14),
                }}
              >
                Daily Recap
              </div>
              <div style={{ fontSize: fontSize(48) }}>{moodData?.emoji}</div>
            </div>

            {/* Big date */}
            <div
              className={cn(
                'font-black tracking-tight mt-[6%]',
                typography.headlineClass
              )}
              style={{
                color: palette.textPrimary,
                fontSize: fontSize(72),
                lineHeight: 1,
              }}
            >
              {new Date(dateValue).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>

            {/* Photo if exists */}
            {card.photoUrl && (
              <div
                className="rounded-xl overflow-hidden mt-[5%] shrink-0"
                style={{ height: '30%' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Text content */}
            <p
              className={cn('mt-[5%] flex-1', typography.bodyClass)}
              style={{
                color: palette.textPrimary,
                fontSize: fontSize(24),
                lineHeight: 1.6,
              }}
            >
              {card.text || 'Write about your day...'}
            </p>

            {/* Blocks as metrics */}
            {card.blocks && card.blocks.length > 0 && (
              <div
                className="grid grid-cols-2 gap-[3%] pt-[4%] mt-auto border-t"
                style={{ borderColor: `${palette.textSecondary}20` }}
              >
                {card.blocks.slice(0, 4).map((block) => (
                  <div key={block.id} className="text-center p-[4%]">
                    <div
                      style={{
                        color: palette.accent,
                        fontSize: fontSize(36),
                        fontWeight: 700,
                      }}
                    >
                      {block.value}
                    </div>
                    <div
                      className="uppercase tracking-wider"
                      style={{
                        color: palette.textSecondary,
                        fontSize: fontSize(12),
                      }}
                    >
                      {block.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safe zone indicator (preview only) */}
          {!isExport && (
            <>
              <div className="absolute top-2 left-2 right-2 h-8 border-t-2 border-dashed border-white/20 pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 h-8 border-b-2 border-dashed border-white/20 pointer-events-none" />
            </>
          )}

          {showGrain && (
            <div className="grain-subtle absolute inset-0 pointer-events-none" />
          )}
        </div>
      );
    }

    // Default fallback - same as photoHero
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden flex flex-col',
          !isExport && 'rounded-2xl shadow-xl',
          className
        )}
        style={{
          ...containerStyle,
          background: palette.gradient,
        }}
      >
        <div className="p-[6%] flex-1 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-[4%]">
            <div>
              <div
                className={cn(
                  'uppercase tracking-wider opacity-70',
                  typography.microClass
                )}
                style={{
                  color: palette.textSecondary,
                  fontSize: fontSize(14),
                }}
              >
                {new Date(dateValue).toLocaleDateString('en-US', {
                  weekday: 'long',
                })}
              </div>
              <div
                className={cn('font-bold', typography.headlineClass)}
                style={{
                  color: palette.textPrimary,
                  fontSize: fontSize(48),
                  lineHeight: 1.1,
                }}
              >
                {new Date(dateValue).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div
              style={{
                fontSize: fontSize(56),
                filter: `drop-shadow(0 0 ${isExport ? 16 : 8}px ${moodColor})`,
              }}
            >
              {moodData?.emoji}
            </div>
          </div>

          <p
            className={cn('leading-relaxed', typography.bodyClass)}
            style={{
              color: palette.textPrimary,
              fontSize: fontSize(24),
              lineHeight: 1.6,
            }}
          >
            {card.text || 'Write about your day...'}
          </p>

          {card.photoUrl && (
            <div
              className="rounded-2xl overflow-hidden mt-[5%]"
              style={{ height: '35%' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Safe zone indicator (preview only) */}
        {!isExport && (
          <>
            <div className="absolute top-2 left-2 right-2 h-8 border-t-2 border-dashed border-white/20 pointer-events-none" />
            <div className="absolute bottom-2 left-2 right-2 h-8 border-b-2 border-dashed border-white/20 pointer-events-none" />
          </>
        )}

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

StoryPreview.displayName = 'StoryPreview';
