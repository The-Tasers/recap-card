'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
} from 'framer-motion';
import { Trash2, Undo2, Moon, X, ZoomIn } from 'lucide-react';
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

// Format sleep duration from minutes (e.g., "7h 30m" or "8h")
function formatSleepDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
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
  const [tooltipState, setTooltipState] = useState<{
    show: boolean;
    top: number;
    left: number;
    align: 'center' | 'left' | 'right';
  }>({ show: false, top: 0, left: 0, align: 'center' });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close tooltip on click outside and auto-hide
  useEffect(() => {
    if (!tooltipState.show) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (buttonRef.current && !buttonRef.current.contains(target)) {
        setTooltipState((prev) => ({ ...prev, show: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Auto-hide after 2 seconds
    timeoutRef.current = setTimeout(
      () => setTooltipState((prev) => ({ ...prev, show: false })),
      2000
    );

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [tooltipState.show]);

  const showTooltipAtPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const tooltipWidth = 120; // Approximate max tooltip width
      const centerX = rect.left + rect.width / 2;
      const padding = 8;

      // Determine alignment based on position
      let align: 'center' | 'left' | 'right' = 'center';
      let left = centerX;

      if (centerX - tooltipWidth / 2 < padding) {
        // Too close to left edge - align left
        align = 'left';
        left = rect.left;
      } else if (centerX + tooltipWidth / 2 > screenWidth - padding) {
        // Too close to right edge - align right
        align = 'right';
        left = rect.right;
      }

      setTooltipState({
        show: true,
        top: rect.top - 8,
        left,
        align,
      });
    }
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onInteraction(e);
    if (tooltipState.show) {
      setTooltipState((prev) => ({ ...prev, show: false }));
    } else {
      showTooltipAtPosition();
    }
  };

  // Check if we're on client side for portal
  const isClient = typeof window !== 'undefined';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={showTooltipAtPosition}
        onMouseLeave={() =>
          setTooltipState((prev) => ({ ...prev, show: false }))
        }
        className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
        aria-label={label}
      >
        <Icon className="h-3.5 w-3.5 text-primary/70" />
      </button>
      {isClient &&
        tooltipState.show &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: tooltipState.top,
              left: tooltipState.left,
              transform:
                tooltipState.align === 'center'
                  ? 'translate(-50%, -100%)'
                  : tooltipState.align === 'left'
                  ? 'translate(0, -100%)'
                  : 'translate(-100%, -100%)',
            }}
            className="px-2 py-1 text-xs font-medium bg-foreground text-background rounded-md whitespace-nowrap z-[100] shadow-lg pointer-events-none"
          >
            {label}
            <div
              className="absolute top-full border-4 border-transparent border-t-foreground"
              style={{
                left:
                  tooltipState.align === 'center'
                    ? '50%'
                    : tooltipState.align === 'left'
                    ? '12px'
                    : 'auto',
                right: tooltipState.align === 'right' ? '12px' : 'auto',
                transform:
                  tooltipState.align === 'center' ? 'translateX(-50%)' : 'none',
              }}
            />
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
  onDismissUndo?: () => void;
  isPendingDelete?: boolean;
}

export function TimelineEntry({
  card,
  isToday = false,
  onEdit,
  onDelete,
  onUndo,
  onDismissUndo,
  isPendingDelete: externalPendingDelete = false,
}: TimelineEntryProps) {
  const [isExpanded, setIsExpanded] = useState(isToday);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  // Check if we're on client side for photo viewer portal
  const isClient = typeof window !== 'undefined';

  // Derive isDeleting from external prop or local delete message
  const isDeleting = externalPendingDelete || deleteMessage !== '';

  // Get a deterministic delete message based on card ID (no Math.random during render)
  const getDeleteMessage = () => {
    const index =
      card.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      DELETE_MESSAGES.length;
    return DELETE_MESSAGES[index];
  };

  // Use local message if set, otherwise get deterministic message for external delete
  const displayDeleteMessage = deleteMessage || getDeleteMessage();

  // Close photo viewer on escape key
  useEffect(() => {
    if (!showPhotoViewer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPhotoViewer(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPhotoViewer]);

  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const MoodIcon = MOOD_ICONS[card.mood];
  const cardDate = new Date(card.createdAt);
  const isMobile = useIsMobile();

  // Swipe gesture state
  const x = useMotionValue(0);
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
    setDeleteMessage(getDeleteMessage());
    // Call onDelete immediately (soft delete), the undo window is shown in the UI
    onDelete();
  };

  // Handle undo
  const handleUndo = () => {
    if (onUndo) {
      onUndo();
      setDeleteMessage('');
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

  // Collapse expanded card when clicking outside (for non-today cards)
  useEffect(() => {
    if (isExpanded && !isToday && !showPhotoViewer) {
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        const target = e.target as HTMLElement;
        // Check if click is outside this card entry and not in photo viewer
        if (
          !target.closest(`[data-card-id="${card.id}"]`) &&
          !target.closest('[data-photo-viewer]')
        ) {
          setIsExpanded(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [isExpanded, isToday, card.id, showPhotoViewer]);

  // Truncate text for collapsed view
  const shouldTruncate = card.text && card.text.length > 120 && !isExpanded;
  const displayText = shouldTruncate
    ? card.text.slice(0, 120).trim() + '…'
    : card.text;

  const hasPhoto = !!card.photoUrl;
  const hasBlocks = card.blocks && card.blocks.length > 0;
  const hasMoreContent = hasPhoto || hasBlocks || shouldTruncate;

  return (
    <>
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
                className="absolute top-0 bottom-0 right-0 w-12 rounded-r-xl flex items-center justify-end pr-1"
                style={{ marginBottom: isToday ? '8px' : 0 }}
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
              dragDirectionLock
              onDragEnd={handleDragEnd}
              style={{ x, touchAction: isMobile ? 'pan-y' : 'auto' }}
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

                // For cards with more content: click to expand first, then click again to open
                if (hasMoreContent && !isToday && !isExpanded) {
                  setIsExpanded(true);
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
                  <MoodIcon
                    className={cn('h-5 w-5', MOOD_ACCENTS[card.mood])}
                  />
                </motion.div>
                <span className="text-sm text-muted-foreground">
                  {formatNaturalDate(cardDate)}
                </span>
                {/* Hover delete button or confirmation (desktop only) */}
                {!isMobile && (
                  <div className="ml-auto flex items-center justify-end min-w-[90px] h-7">
                    <AnimatePresence mode="wait">
                      {pendingDelete ? (
                        <motion.div
                          key="delete-confirm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 h-7"
                        >
                          <button
                            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingDelete(false);
                            }}
                            aria-label="Cancel delete"
                          >
                            Cancel
                          </button>
                          <button
                            className="text-xs text-destructive/70 hover:text-destructive font-medium transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete();
                            }}
                            aria-label="Confirm delete"
                          >
                            Delete
                          </button>
                        </motion.div>
                      ) : (
                        <button
                          key="delete-button"
                          className="h-7 w-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive/70 transition-all duration-200 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRequest();
                          }}
                          aria-label="Delete entry"
                        >
                          <Trash2 className="h-3.5 w-3.5 transition-colors" />
                        </button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Text content */}
              {card.text && (
                <p
                  className={cn(
                    'text-foreground leading-relaxed wrap-break-word line-clamp-3 mt-2',
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
                    {/* Photo with zoom button */}
                    {hasPhoto && (
                      <motion.div
                        className="mt-4 rounded-xl overflow-hidden relative"
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
                          draggable={false}
                        />
                        {/* Zoom button */}
                        <motion.button
                          type="button"
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors cursor-pointer shadow-sm"
                          onPointerDownCapture={(e) => e.stopPropagation()}
                          onTouchStartCapture={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowPhotoViewer(true);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="View full size"
                        >
                          <ZoomIn className="h-3.5 w-3.5 text-primary" />
                        </motion.button>
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
                          if (
                            block.blockId === 'sleep' &&
                            typeof block.value === 'number' &&
                            block.value > 0
                          ) {
                            return (
                              <motion.div
                                key={`sleep-${blockIndex}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 + blockIndex * 0.03 }}
                              >
                                <BlockTooltip
                                  icon={Moon}
                                  label={`${formatSleepDuration(
                                    block.value
                                  )} sleep`}
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
                                  transition={{
                                    delay:
                                      0.1 + (blockIndex + valueIndex) * 0.03,
                                  }}
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
                {displayDeleteMessage}
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
              {onDismissUndo && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  onClick={onDismissUndo}
                  className="p-1 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo viewer - fullscreen lightbox (separate from card AnimatePresence) */}
      {isClient &&
        createPortal(
          <AnimatePresence>
            {showPhotoViewer && card.photoUrl && (
              <motion.div
                key="photo-viewer"
                data-photo-viewer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
                onClick={() => setShowPhotoViewer(false)}
              >
                <motion.img
                  src={card.photoUrl}
                  alt=""
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
                  onClick={() => setShowPhotoViewer(false)}
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
