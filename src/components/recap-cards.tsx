'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
  useAnimationControls,
} from 'framer-motion';

// Hook to detect if we're on mobile (for swipe behavior)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
import { Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MOOD_ICONS,
  BLOCK_ICONS,
  WEATHER_ICONS,
  MEAL_ICONS,
  SELFCARE_ICONS,
  HEALTH_ICONS,
} from '@/lib/icons';
import {
  DailyCard,
  MOODS,
  Mood,
  CardBlock,
  WEATHER_OPTIONS,
  MEAL_OPTIONS,
  SELFCARE_OPTIONS,
  HEALTH_OPTIONS,
} from '@/lib/types';
import { cn } from '@/lib/utils';

// Mood color mapping for gradient overlay
const MOOD_COLORS: Record<Mood, string> = {
  great: 'rgba(16, 185, 129, 0.85)', // emerald
  good: 'rgba(34, 197, 94, 0.85)', // green
  neutral: 'rgba(245, 158, 11, 0.85)', // amber
  bad: 'rgba(249, 115, 22, 0.85)', // orange
  terrible: 'rgba(239, 68, 68, 0.85)', // red
};

// Format relative date for stream
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cardDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffDays = Math.floor(
    (today.getTime() - cardDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  if (diffDays < 14) {
    return `Last ${date.toLocaleDateString('en-US', { weekday: 'long' })}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper to render block details with tooltips
function BlockDetails({ blocks }: { blocks?: CardBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  const sleepBlock = blocks.find((b) => b.blockId === 'sleep' && b.value !== 0);
  const weatherBlock = blocks.find(
    (b) =>
      b.blockId === 'weather' && Array.isArray(b.value) && b.value.length > 0
  );
  const mealsBlock = blocks.find(
    (b) => b.blockId === 'meals' && Array.isArray(b.value) && b.value.length > 0
  );
  const selfcareBlock = blocks.find(
    (b) =>
      b.blockId === 'selfcare' && Array.isArray(b.value) && b.value.length > 0
  );
  const healthBlock = blocks.find(
    (b) =>
      b.blockId === 'health' && Array.isArray(b.value) && b.value.length > 0
  );

  const hasAny =
    sleepBlock || weatherBlock || mealsBlock || selfcareBlock || healthBlock;
  if (!hasAny) return null;

  const SleepIcon = BLOCK_ICONS.sleep;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {sleepBlock && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 text-white/90 text-xs cursor-default">
              <SleepIcon className="h-3.5 w-3.5" />
              <span>{sleepBlock.value}h</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>{sleepBlock.value} hours of sleep</TooltipContent>
        </Tooltip>
      )}
      {weatherBlock && Array.isArray(weatherBlock.value) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 text-white/90 text-xs cursor-default">
              {weatherBlock.value.slice(0, 2).map((w) => {
                const WeatherIcon = WEATHER_ICONS[w];
                return WeatherIcon ? (
                  <WeatherIcon key={w} className="h-3.5 w-3.5" />
                ) : null;
              })}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Weather:{' '}
            {weatherBlock.value
              .map((w) => {
                const opt = WEATHER_OPTIONS.find((o) => o.value === w);
                return opt?.label || w;
              })
              .join(', ')}
          </TooltipContent>
        </Tooltip>
      )}
      {mealsBlock && Array.isArray(mealsBlock.value) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 text-white/90 text-xs cursor-default">
              {mealsBlock.value.map((m) => {
                const MealIcon = MEAL_ICONS[m];
                return MealIcon ? (
                  <MealIcon key={m} className="h-3.5 w-3.5" />
                ) : null;
              })}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Meals:{' '}
            {mealsBlock.value
              .map((m) => {
                const opt = MEAL_OPTIONS.find((o) => o.value === m);
                return opt?.label || m;
              })
              .join(', ')}
          </TooltipContent>
        </Tooltip>
      )}
      {selfcareBlock && Array.isArray(selfcareBlock.value) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 text-white/90 text-xs cursor-default">
              {selfcareBlock.value.map((s) => {
                const SelfcareIcon = SELFCARE_ICONS[s];
                return SelfcareIcon ? (
                  <SelfcareIcon key={s} className="h-3.5 w-3.5" />
                ) : null;
              })}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Self-care:{' '}
            {selfcareBlock.value
              .map((s) => {
                const opt = SELFCARE_OPTIONS.find((o) => o.value === s);
                return opt?.label || s;
              })
              .join(', ')}
          </TooltipContent>
        </Tooltip>
      )}
      {healthBlock && Array.isArray(healthBlock.value) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 text-white/90 text-xs cursor-default">
              {healthBlock.value.map((h) => {
                const HealthIcon = HEALTH_ICONS[h];
                return HealthIcon ? (
                  <HealthIcon key={h} className="h-3.5 w-3.5" />
                ) : null;
              })}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Health:{' '}
            {healthBlock.value
              .map((h) => {
                const opt = HEALTH_OPTIONS.find((o) => o.value === h);
                return opt?.label || h;
              })
              .join(', ')}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// Swipe threshold to reveal delete button
const SWIPE_THRESHOLD = -60;

// Simple card display for stream with swipe-to-delete
export function StreamCard({
  card,
  onEdit,
  onDelete,
}: {
  card: DailyCard;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const moodData = MOODS.find((m) => m.value === card.mood);
  const cardDate = new Date(card.createdAt);
  const MoodIcon = MOOD_ICONS[card.mood];
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimationControls();
  const [isDragging, setIsDragging] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Transform x position to delete button opacity
  const deleteOpacity = useTransform(x, [-60, -30, 0], [1, 0.5, 0]);

  // Reset card position
  const resetPosition = () => {
    controls.start({ x: 0 });
    setIsRevealed(false);
  };

  // Initial mount animation
  useEffect(() => {
    controls.start({ opacity: 1, scale: 1 });
  }, [controls]);

  // Handle click outside to reset
  useEffect(() => {
    if (!isRevealed) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        resetPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isRevealed]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);
    // If swiped past threshold, keep revealed; otherwise snap back
    if (info.offset.x < SWIPE_THRESHOLD / 2) {
      setIsRevealed(true);
    } else {
      resetPosition();
    }
  };

  return (
    <div ref={containerRef} className="relative py-2 -my-2">
      {/* Delete button (revealed on swipe) - mobile only */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -right-2 h-[calc(100%-1rem)] top-2 rounded-2xl w-14 bg-red-500 flex items-center justify-center md:hidden cursor-pointer"
        style={{ opacity: deleteOpacity }}
        whileTap={{ scale: 0.95 }}
      >
        <Trash2 className="h-5 w-5 text-white" />
      </motion.button>

      <motion.div
        className="w-full relative group cursor-pointer"
        onClick={() => !isDragging && !isRevealed && onEdit()}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={controls}
        style={{ x: isMobile ? x : 0 }}
        drag={isMobile ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: -70, right: 0 }}
        dragElastic={{ left: 0.2, right: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: isDragging ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <motion.div
          className="rounded-2xl p-5 relative overflow-hidden transition-shadow duration-300"
          style={{
            background: `linear-gradient(135deg, ${MOOD_COLORS[card.mood]} 0%, var(--primary) 50%, var(--primary) 100%)`,
            boxShadow: `0 10px 25px -5px ${MOOD_COLORS[card.mood].replace('0.85', '0.4')}, 0 4px 6px -2px rgba(0, 0, 0, 0.1)`,
          }}
        >
          {/* Desktop delete button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 text-white/60 hover:bg-black/40 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer hidden md:flex"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </motion.button>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3 md:pr-8">
              <div className="flex items-center gap-2">
                <MoodIcon className="h-6 w-6 text-white" />
                <span className="text-sm font-medium text-white/90">
                  {moodData?.label}
                </span>
              </div>
              <span className="text-xs text-white/70">
                {formatRelativeDate(cardDate)}
              </span>
            </div>
            {card.text && (
              <p className="text-white/95 text-base leading-relaxed line-clamp-3">
                {card.text}
              </p>
            )}
            <BlockDetails blocks={card.blocks} />
            {card.photoUrl && (
              <div className="mt-3 rounded-xl overflow-hidden">
                <img
                  src={card.photoUrl}
                  alt=""
                  className="w-full h-32 object-cover"
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Today's card (larger display) with swipe-to-delete
export function TodayCard({
  card,
  onEdit,
  onDelete,
}: {
  card: DailyCard;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const moodData = MOODS.find((m) => m.value === card.mood);
  const MoodIcon = MOOD_ICONS[card.mood];
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimationControls();
  const [isDragging, setIsDragging] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Transform x position to delete button opacity
  const deleteOpacity = useTransform(x, [-60, -30, 0], [1, 0.5, 0]);

  // Reset card position
  const resetPosition = () => {
    controls.start({ x: 0 });
    setIsRevealed(false);
  };

  // Initial mount animation
  useEffect(() => {
    controls.start({ opacity: 1, scale: 1 });
  }, [controls]);

  // Handle click outside to reset
  useEffect(() => {
    if (!isRevealed) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        resetPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isRevealed]);

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);
    // If swiped past threshold, keep revealed; otherwise snap back
    if (info.offset.x < SWIPE_THRESHOLD / 2) {
      setIsRevealed(true);
    } else {
      resetPosition();
    }
  };

  return (
    <div ref={containerRef} className="relative py-3 -my-3">
      {/* Delete button (revealed on swipe) - mobile only */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute -right-2 h-[calc(100%-1.5rem)] top-3 rounded-3xl w-16 bg-red-500 flex items-center justify-center md:hidden cursor-pointer"
        style={{ opacity: deleteOpacity }}
        whileTap={{ scale: 0.95 }}
      >
        <Trash2 className="h-5 w-5 text-white" />
      </motion.button>

      <motion.div
        className="w-full group cursor-pointer"
        onClick={() => !isDragging && !isRevealed && onEdit()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={controls}
        style={{ x: isMobile ? x : 0 }}
        drag={isMobile ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={{ left: 0.3, right: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: isDragging ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <motion.div
          className="rounded-3xl p-6 md:p-8 min-h-[200px] relative overflow-hidden transition-shadow duration-500"
          style={{
            background: `linear-gradient(135deg, ${MOOD_COLORS[card.mood]} 0%, var(--primary) 50%, var(--primary) 100%)`,
            boxShadow: `0 20px 40px -10px ${MOOD_COLORS[card.mood].replace('0.85', '0.5')}, 0 8px 16px -4px rgba(0, 0, 0, 0.15)`,
          }}
        >
          {/* Desktop delete button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/60 hover:bg-black/40 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer hidden md:flex"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>

          <div className="relative z-10 pr-10">
            <div className="flex items-center gap-3 mb-4">
              <MoodIcon className="h-10 w-10 text-white" />
              <span className="text-xl font-semibold text-white">
                {moodData?.label}
              </span>
            </div>
            {card.text && (
              <p className="text-white/95 text-lg leading-relaxed">
                {card.text}
              </p>
            )}
            <BlockDetails blocks={card.blocks} />
            {card.photoUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden">
                <img
                  src={card.photoUrl}
                  alt=""
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
