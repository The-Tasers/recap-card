'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
} from 'framer-motion';
import { Trash2, Undo2, Moon } from 'lucide-react';
import {
  MOOD_ICONS,
  WEATHER_ICONS,
  MEAL_ICONS,
  SELFCARE_ICONS,
  HEALTH_ICONS,
  EXERCISE_ICONS,
} from '@/lib/icons';
import {
  DailyCard,
  WEATHER_OPTIONS,
  MEAL_OPTIONS,
  SELFCARE_OPTIONS,
  HEALTH_OPTIONS,
  EXERCISE_OPTIONS,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// Map of blockId to options for label lookup
const BLOCK_OPTIONS: Record<string, { value: string; label: string }[]> = {
  weather: WEATHER_OPTIONS,
  meals: MEAL_OPTIONS,
  selfcare: SELFCARE_OPTIONS,
  health: HEALTH_OPTIONS,
  exercise: EXERCISE_OPTIONS,
};

// Map of blockId to icon lookup
const BLOCK_ICON_MAPS: Record<string, Record<string, LucideIcon>> = {
  weather: WEATHER_ICONS,
  meals: MEAL_ICONS,
  selfcare: SELFCARE_ICONS,
  health: HEALTH_ICONS,
  exercise: EXERCISE_ICONS,
};

// Get icon for a block value
function getBlockIcon(blockId: string, value: string): LucideIcon | null {
  const iconMap = BLOCK_ICON_MAPS[blockId];
  return iconMap?.[value] || null;
}

// Get label for a block value
function getBlockLabel(blockId: string, value: string): string {
  const options = BLOCK_OPTIONS[blockId];
  const option = options?.find((opt) => opt.value === value);
  return option?.label || value;
}

// Tooltip component with mobile tap support - renders tooltip in portal to avoid overflow clipping
function BlockTooltip({
  icon: Icon,
  label,
  onInteraction,
}: {
  icon: LucideIcon;
  label: string;
  onInteraction: (e: React.MouseEvent | React.TouchEvent) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ensure we're on client side for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close tooltip on click outside and auto-hide
  useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (buttonRef.current && !buttonRef.current.contains(target)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Auto-hide after 2 seconds
    timeoutRef.current = setTimeout(() => setShowTooltip(false), 2000);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showTooltip]);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onInteraction(e);
    setShowTooltip(!showTooltip);
  };

  // Calculate position directly from button ref
  const getTooltipStyle = (): React.CSSProperties => {
    if (!buttonRef.current) return { display: 'none' };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
      transform: 'translate(-50%, -100%)',
    };
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="p-1.5 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors"
        aria-label={label}
      >
        <Icon className="h-3.5 w-3.5 text-muted-foreground/70" />
      </button>
      {mounted && showTooltip && createPortal(
        <div
          style={getTooltipStyle()}
          className="px-2 py-1 text-xs font-medium bg-foreground text-background rounded-md whitespace-nowrap z-[100] shadow-lg pointer-events-none"
        >
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>,
        document.body
      )}
    </>
  );
}

// Subtle mood accent - just enough to give warmth without overwhelming
const MOOD_ACCENTS: Record<string, string> = {
  great: 'text-emerald-600 dark:text-emerald-400',
  good: 'text-green-600 dark:text-green-400',
  neutral: 'text-amber-600 dark:text-amber-400',
  bad: 'text-orange-600 dark:text-orange-400',
  terrible: 'text-red-600 dark:text-red-400',
};

// Warm delete messages
const DELETE_MESSAGES = [
  'Letting go...',
  'Making space...',
  'Released',
  'Gone gently',
  'Fading away...',
];

// Format date naturally - like how you'd describe it to a friend
function formatNaturalDate(date: Date): string {
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

  // For older entries, use a gentle format
  const sameYear = date.getFullYear() === now.getFullYear();
  if (sameYear) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Detect mobile by screen width
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

interface TimelineEntryProps {
  card: DailyCard;
  isToday?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUndo?: () => void;
  isPendingDelete?: boolean;
}

export function TimelineEntry({
  card,
  isToday = false,
  onEdit,
  onDelete,
  onUndo,
  isPendingDelete: externalPendingDelete = false,
}: TimelineEntryProps) {
  const [isExpanded, setIsExpanded] = useState(isToday);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(externalPendingDelete);
  const [deleteMessage, setDeleteMessage] = useState(
    externalPendingDelete
      ? DELETE_MESSAGES[Math.floor(Math.random() * DELETE_MESSAGES.length)]
      : ''
  );
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const MoodIcon = MOOD_ICONS[card.mood];
  const cardDate = new Date(card.createdAt);
  const isMobile = useIsMobile();

  // Swipe gesture state
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-80, 0],
    ['rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0)']
  );
  const deleteButtonOpacity = useTransform(x, [-60, -30, 0], [1, 0.5, 0]);
  const deleteButtonScale = useTransform(x, [-60, -30, 0], [1, 0.9, 0.8]);

  // Clear pending delete after timeout
  useEffect(() => {
    if (pendingDelete) {
      deleteTimeoutRef.current = setTimeout(() => {
        setPendingDelete(false);
      }, 3000);
    }
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, [pendingDelete]);

  // Handle delete with animation - now shows longer state with undo option
  const handleDelete = () => {
    setDeleteMessage(
      DELETE_MESSAGES[Math.floor(Math.random() * DELETE_MESSAGES.length)]
    );
    setIsDeleting(true);
    // Call onDelete immediately (soft delete), the undo window is shown in the UI
    onDelete();
  };

  // Handle undo
  const handleUndo = () => {
    if (onUndo) {
      onUndo();
      setIsDeleting(false);
      setPendingDelete(false);
    }
  };

  // Handle delete with confirmation (keyboard)
  const handleDeleteRequest = () => {
    if (pendingDelete) {
      handleDelete();
    } else {
      setPendingDelete(true);
    }
  };

  // Handle swipe end - snap open or closed, don't auto-delete
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50 && isMobile) {
      // Snap to open position to reveal delete button
      setIsSwipedOpen(true);
    } else {
      // Snap back closed
      setIsSwipedOpen(false);
    }
  };

  // Close swipe when clicking elsewhere or after timeout
  useEffect(() => {
    if (isSwipedOpen) {
      const timer = setTimeout(() => setIsSwipedOpen(false), 5000);

      // Close on click outside
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        const target = e.target as HTMLElement;
        // Check if click is outside this card entry
        if (!target.closest(`[data-card-id="${card.id}"]`)) {
          setIsSwipedOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isSwipedOpen, card.id]);

  // Truncate text for collapsed view
  const shouldTruncate = card.text && card.text.length > 120 && !isExpanded;
  const displayText = shouldTruncate
    ? card.text.slice(0, 120).trim() + '…'
    : card.text;

  const hasPhoto = !!card.photoUrl;
  const hasBlocks = card.blocks && card.blocks.length > 0;
  const hasMoreContent = hasPhoto || hasBlocks || shouldTruncate;

  return (
    <AnimatePresence mode="popLayout">
      {!isDeleting ? (
        <motion.div
          key={card.id}
          data-card-id={card.id}
          layout
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            x: -100,
            filter: 'blur(8px)',
            transition: { duration: 0.3, ease: 'easeOut' },
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
            opacity: { duration: 0.2 },
          }}
          className={cn('group relative', isToday && 'pb-2')}
        >
          {/* Swipe delete button (mobile only) */}
          {isMobile && (
            <motion.div
              className="absolute inset-0 rounded-xl flex items-center justify-end pr-3"
              style={{ background }}
            >
              <motion.button
                className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                style={{
                  opacity: deleteButtonOpacity,
                  scale: deleteButtonScale,
                }}
                animate={{
                  opacity: isSwipedOpen ? 1 : 0,
                  scale: isSwipedOpen ? 1 : 0.8,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
              </motion.button>
            </motion.div>
          )}

          {/* Entry content - draggable on mobile */}
          <motion.div
            role="button"
            tabIndex={0}
            drag={isMobile ? 'x' : false}
            dragConstraints={{ left: -80, right: 0 }}
            dragElastic={{ left: 0.2, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x }}
            animate={{ x: isSwipedOpen ? -60 : 0 }}
            className={cn(
              'relative cursor-pointer transition-colors duration-200 rounded-xl -mx-3 px-3 py-3',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              // Light theme: add subtle border and stronger background for visibility
              'border border-transparent dark:border-transparent',
              isToday
                ? 'bg-muted/50 hover:bg-muted/60 border-border/30'
                : 'bg-muted/20 hover:bg-muted/40 border-border/20 hover:border-border/30',
              pendingDelete && 'bg-destructive/5 border-destructive/20'
            )}
            onClick={() => {
              // Close swipe if open
              if (isSwipedOpen) {
                setIsSwipedOpen(false);
                return;
              }
              if (pendingDelete) return;
              if (hasMoreContent && !isToday) {
                setIsExpanded(!isExpanded);
              } else {
                onEdit();
              }
            }}
            onKeyDown={(e) => {
              // Escape - cancel pending delete
              if (e.key === 'Escape' && pendingDelete) {
                e.preventDefault();
                setPendingDelete(false);
                return;
              }
              // Enter/Space - open for editing (or confirm delete if pending)
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (pendingDelete) {
                  handleDelete();
                } else {
                  onEdit();
                }
              }
              // Delete/Backspace - delete card (with confirmation)
              if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                handleDeleteRequest();
              }
            }}
          >
            {/* Date and mood row */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={pendingDelete ? { scale: [1, 1.2, 1] } : {}}
                transition={{
                  repeat: pendingDelete ? Infinity : 0,
                  duration: 1,
                }}
              >
                <MoodIcon className={cn('h-5 w-5', MOOD_ACCENTS[card.mood])} />
              </motion.div>
              <AnimatePresence mode="wait">
                {pendingDelete ? (
                  <motion.span
                    key="delete-confirm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-sm text-destructive font-medium"
                  >
                    Press again to let go
                  </motion.span>
                ) : (
                  <motion.span
                    key="date"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-sm text-muted-foreground"
                  >
                    {formatNaturalDate(cardDate)}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Hover delete button (desktop only) */}
              {!isMobile && (
                <button
                  className="h-7 w-7 rounded-full ml-auto bg-destructive/0 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all duration-200 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRequest();
                  }}
                  aria-label="Delete entry"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-destructive/70 transition-colors" />
                </button>
              )}
            </div>

            {/* Text content */}
            {card.text && (
              <p
                className={cn(
                  'text-foreground leading-relaxed mt-2',
                  isToday ? 'text-lg' : 'text-base'
                )}
              >
                {displayText}
              </p>
            )}

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {/* Photo */}
                  {hasPhoto && (
                    <motion.div
                      className="mt-4 rounded-xl overflow-hidden"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <img
                        src={card.photoUrl}
                        alt=""
                        className={cn(
                          'w-full object-cover',
                          isToday ? 'max-h-64' : 'max-h-48'
                        )}
                      />
                    </motion.div>
                  )}

                  {/* Blocks - shown as icons with tooltips */}
                  {hasBlocks && (
                    <motion.div
                      className="mt-3 flex flex-wrap gap-1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {card.blocks?.flatMap((block, blockIndex) => {
                        // Handle sleep block specially
                        if (block.blockId === 'sleep' && typeof block.value === 'number' && block.value > 0) {
                          return (
                            <motion.div
                              key={`sleep-${blockIndex}`}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.1 + blockIndex * 0.03 }}
                            >
                              <BlockTooltip
                                icon={Moon}
                                label={`${block.value}h sleep`}
                                onInteraction={(e) => e.stopPropagation()}
                              />
                            </motion.div>
                          );
                        }
                        // Handle multiselect blocks
                        if (Array.isArray(block.value)) {
                          return block.value.map((value, valueIndex) => {
                            const Icon = getBlockIcon(block.blockId, value);
                            const label = getBlockLabel(block.blockId, value);
                            if (!Icon) return null;
                            return (
                              <motion.div
                                key={`${block.blockId}-${value}-${valueIndex}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 + (blockIndex + valueIndex) * 0.03 }}
                              >
                                <BlockTooltip
                                  icon={Icon}
                                  label={label}
                                  onInteraction={(e) => e.stopPropagation()}
                                />
                              </motion.div>
                            );
                          });
                        }
                        return null;
                      })}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : (
        // Deleting state - show message with undo option for longer
        <motion.div
          key={`${card.id}-deleting`}
          initial={{ opacity: 1, height: 'auto' }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-center gap-3 py-4 px-3 rounded-xl bg-muted/30">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-muted-foreground/70 italic"
            >
              {deleteMessage}
            </motion.span>
            {onUndo && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onClick={handleUndo}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

