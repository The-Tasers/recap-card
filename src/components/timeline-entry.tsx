'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Undo2,
  Moon,
  X,
  ZoomIn,
  Pencil,
  ChevronUp,
  MoreVertical,
} from 'lucide-react';
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

// Mood icon colors - matching the app's mood color palette
const MOOD_ACCENTS: Record<string, string> = {
  great: 'text-[#22c55e]',
  good: 'text-[#84cc16]',
  okay: 'text-[#eab308]',
  low: 'text-[#f97316]',
  rough: 'text-[#ef4444]',
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
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  // For older entries, use a gentle format
  const sameYear = date.getFullYear() === now.getFullYear();
  if (sameYear) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
  const [deleteMessage, setDeleteMessage] = useState('');
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [blocksExpanded, setBlocksExpanded] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const entryRef = useRef<HTMLDivElement>(null);
  const MoodIcon = MOOD_ICONS[card.mood];
  const cardDate = new Date(card.createdAt);

  // Close card menu on click outside or escape
  useEffect(() => {
    if (!showCardMenu) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setShowCardMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCardMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCardMenu]);

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
    }
  };

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
      <div ref={entryRef}>
        <AnimatePresence mode="popLayout">
          {!isDeleting ? (
            <motion.div
              key={card.id}
              data-card-id={card.id}
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
              {/* Entry content */}
              <motion.div
                role="button"
                tabIndex={0}
                className={cn(
                  'relative transition-colors duration-200 rounded-xl -mx-3 px-3 py-3',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  // Light theme: add subtle border and stronger background for visibility
                  'border border-transparent dark:border-transparent',
                  isToday
                    ? 'bg-muted/50 hover:bg-muted/60 border-border/30'
                    : 'bg-muted/20 hover:bg-muted/40 border-border/20 hover:border-border/30'
                )}
                onClick={() => {
                  // Click to expand/collapse cards with more content
                  if (hasMoreContent && !isToday) {
                    setIsExpanded(!isExpanded);
                  }
                }}
                onKeyDown={(e) => {
                  // Enter/Space - expand/collapse cards with more content
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (hasMoreContent && !isToday) {
                      setIsExpanded(!isExpanded);
                    }
                  }
                }}
              >
                {/* Date and mood row */}
                <div className="flex items-center gap-3">
                  <MoodIcon
                    className={cn('h-5 w-5', MOOD_ACCENTS[card.mood])}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formatNaturalDate(cardDate)}
                  </span>
                  {/* 3-dot menu button - always visible on mobile, hover on desktop */}
                  <div className="ml-auto relative">
                    <button
                      ref={menuButtonRef}
                      className={cn(
                        'h-7 w-7 cursor-pointer rounded-full flex items-center justify-center text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground transition-all duration-200 z-10',
                        // Always visible on mobile, show on hover on desktop, keep visible when menu is open
                        showCardMenu
                          ? 'opacity-100'
                          : 'md:opacity-0 md:group-hover:opacity-100'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCardMenu(!showCardMenu);
                      }}
                      aria-label="Card menu"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {/* Popover menu */}
                    <AnimatePresence>
                      {showCardMenu && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-32 z-50"
                        >
                          <div className="py-1">
                            {/* Edit option */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCardMenu(false);
                                onEdit();
                              }}
                              className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                              Edit
                            </button>

                            {/* Delete option */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCardMenu(false);
                                handleDelete();
                              }}
                              className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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

                      {/* Blocks - shown as text chips with expand/collapse */}
                      {hasBlocks && (
                        <div className="mt-3 space-y-2">
                          {(() => {
                            // Collect all block items (excluding sleep)
                            type BlockItem = {
                              icon: LucideIcon;
                              label: string;
                              key: string;
                            };
                            const allItems: BlockItem[] = [];
                            let sleepLabel: string | null = null;

                            card.blocks?.forEach((block) => {
                              // Handle sleep block specially - save for later
                              if (
                                block.blockId === 'sleep' &&
                                typeof block.value === 'number' &&
                                block.value > 0
                              ) {
                                sleepLabel = formatSleepDuration(block.value);
                              }
                              // Handle multiselect blocks
                              if (Array.isArray(block.value)) {
                                block.value.forEach((value, valueIndex) => {
                                  const Icon = getBlockIcon(
                                    block.blockId,
                                    value
                                  );
                                  const label = getBlockLabel(
                                    block.blockId,
                                    value
                                  );
                                  if (Icon) {
                                    allItems.push({
                                      icon: Icon,
                                      label,
                                      key: `${block.blockId}-${value}-${valueIndex}`,
                                    });
                                  }
                                });
                              }
                            });

                            // Calculate visible items (roughly 2 rows worth - about 6 items)
                            const maxVisible = 6;
                            const hasMore = allItems.length > maxVisible;
                            const visibleItems = blocksExpanded
                              ? allItems
                              : allItems.slice(0, maxVisible);
                            const hiddenCount = allItems.length - maxVisible;

                            return (
                              <>
                                {allItems.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {visibleItems.map((item) => {
                                      const Icon = item.icon;
                                      return (
                                        <span
                                          key={item.key}
                                          className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-muted text-xs text-muted-foreground"
                                        >
                                          <Icon className="h-3 w-3" />
                                          <span>{item.label}</span>
                                        </span>
                                      );
                                    })}
                                    {/* Show +N more button when collapsed and has more items */}
                                    {hasMore && !blocksExpanded && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setBlocksExpanded(true);
                                        }}
                                        className="inline-flex items-center px-2 py-1 rounded-sm bg-primary/10 text-xs text-primary font-medium hover:bg-primary/20 transition-colors"
                                      >
                                        +{hiddenCount} more
                                      </button>
                                    )}
                                    {/* Show "less" button when expanded */}
                                    {blocksExpanded && hasMore && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setBlocksExpanded(false);
                                        }}
                                        className="inline-flex items-center gap-0.5 px-2 py-1 rounded-sm bg-primary/10 text-xs text-primary font-medium hover:bg-primary/20 transition-colors"
                                      >
                                        <ChevronUp className="h-3 w-3" />
                                        Less
                                      </button>
                                    )}
                                  </div>
                                )}
                                {/* Sleep chip - shown at bottom with primary styling like +N more */}
                                {sleepLabel && (
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-primary/10 text-xs text-primary font-medium">
                                      <Moon className="h-3 w-3" />
                                      <span>{sleepLabel}</span>
                                    </span>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
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
      </div>

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
