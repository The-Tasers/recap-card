'use client';

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCheckInStore, getDateString, getTodayDateString } from '@/lib/checkin-store';
import { useI18n } from '@/lib/i18n';

interface DatePickerTimelineProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  isMobile: boolean;
}

// Generate array of dates going back from today (oldest first, today last)
function generateDateList(daysBack: number = 30): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from oldest and go to today
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }

  return dates;
}

// Get month key for a date
function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function DatePickerTimeline({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  isMobile,
}: DatePickerTimelineProps) {
  const { language, t } = useI18n();
  const { days, checkIns } = useCheckInStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleMonth, setVisibleMonth] = useState<string>('');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const allDates = useMemo(() => generateDateList(30), []);

  // Get check-in counts per day
  const checkInCountByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    days.forEach((day) => {
      const dayCheckIns = checkIns.filter((c) => c.dayId === day.id);
      counts[day.date] = dayCheckIns.length;
    });
    return counts;
  }, [days, checkIns]);

  const todayStr = getTodayDateString();
  const selectedDateStr = getDateString(selectedDate);

  // Format month name
  const formatMonth = useCallback((date: Date) => {
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }, [language]);

  // Update scroll button visibility
  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Update visible month based on scroll position
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;

    // Find the date chip closest to center
    const chips = container.querySelectorAll('[data-date]');
    let closestChip: Element | null = null;
    let closestDistance = Infinity;

    chips.forEach((chip) => {
      const chipRect = chip.getBoundingClientRect();
      const chipCenterX = chipRect.left + chipRect.width / 2;
      const distance = Math.abs(chipCenterX - centerX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestChip = chip;
      }
    });

    if (closestChip) {
      const dateStr = (closestChip as HTMLElement).dataset.date;
      if (dateStr) {
        const date = new Date(dateStr);
        setVisibleMonth(formatMonth(date));
      }
    }

    updateScrollButtons();
  }, [formatMonth, updateScrollButtons]);

  // Scroll by amount
  const scrollBy = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200; // pixels to scroll
    scrollRef.current.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  // Scroll to selected date when opened and initialize month
  useEffect(() => {
    if (isOpen) {
      // Set initial visible month
      setVisibleMonth(formatMonth(selectedDate));

      // Wait for render, then scroll to selected date
      const timeoutId = setTimeout(() => {
        if (selectedRef.current && scrollRef.current) {
          selectedRef.current.scrollIntoView({
            inline: 'center',
            block: 'nearest',
            behavior: 'instant'
          });
          // Update buttons after scroll
          setTimeout(() => {
            updateScrollButtons();
          }, 50);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, selectedDate, formatMonth, updateScrollButtons]);

  // Lock body scroll on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, isMobile]);

  // Close on click outside for desktop
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile, onClose]);

  const handleDateClick = useCallback((date: Date) => {
    onSelectDate(date);
    onClose();
  }, [onSelectDate, onClose]);

  // Get weekday abbreviation
  const getWeekday = useCallback((date: Date) => {
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    return date.toLocaleDateString(locale, { weekday: 'short' });
  }, [language]);

  // Check if this is first day of a month (for month separators)
  const isFirstOfMonth = useCallback((date: Date, index: number) => {
    if (index === 0) return false;
    const prevDate = allDates[index - 1];
    return getMonthKey(date) !== getMonthKey(prevDate);
  }, [allDates]);

  // Get short month name for separator
  const getShortMonth = useCallback((date: Date) => {
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short' });
  }, [language]);

  // Render date chips inline
  const renderDateChips = (className: string = '') => (
    <div
      ref={scrollRef}
      className={`flex gap-1.5 overflow-x-auto scrollbar-hide px-4 ${className}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      onScroll={handleScroll}
    >
      {/* Start indicator */}
      <div className="shrink-0 flex items-center justify-center min-w-16 h-14 text-[10px] text-muted-foreground/40 text-center leading-tight">
        {t('datePicker.endOfTimeline')}
      </div>
      {allDates.map((date, index) => {
        const dateStr = getDateString(date);
        const isToday = dateStr === todayStr;
        const isSelected = dateStr === selectedDateStr;
        const hasData = (checkInCountByDate[dateStr] || 0) > 0;
        const showMonthSeparator = isFirstOfMonth(date, index);

        return (
          <div key={dateStr} className="flex items-center gap-1.5 shrink-0">
            {/* Month separator - shows before this date when it's first of a new month */}
            {showMonthSeparator && (
              <div className="flex items-center justify-center min-w-8 h-14 text-[10px] text-muted-foreground/50 font-medium">
                {getShortMonth(date)}
              </div>
            )}
            <motion.button
              data-date={date.toISOString()}
              ref={isSelected ? selectedRef : undefined}
              onClick={() => handleDateClick(date)}
              className={`
                relative shrink-0 flex flex-col items-center justify-center
                min-w-12 h-14 rounded-xl cursor-pointer transition-all
                ${isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : isToday
                    ? 'bg-primary/20 text-foreground hover:bg-primary/30 ring-1 ring-primary/40'
                    : hasData
                      ? 'bg-muted/80 text-foreground hover:bg-muted'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              {/* Weekday */}
              <span className={`text-[9px] uppercase tracking-wide ${
                isSelected ? 'opacity-80' : 'opacity-60'
              }`}>
                {getWeekday(date)}
              </span>
              {/* Day number */}
              <span className="text-sm font-medium">
                {date.getDate()}
              </span>
              {/* Today indicator or Activity dot */}
              {isToday && !isSelected ? (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
              ) : hasData && !isSelected ? (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary/60" />
              ) : null}
            </motion.button>
          </div>
        );
      })}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {isMobile ? (
            // Mobile: Bottom sheet with horizontal chips
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={onClose}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl z-50"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
              >
                {/* Handle */}
                <div className="flex justify-center py-3">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
                </div>

                {/* Month indicator */}
                <div className="px-4 pb-2">
                  <motion.span
                    key={visibleMonth}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium text-foreground capitalize"
                  >
                    {visibleMonth}
                  </motion.span>
                </div>

                {/* Horizontal scrolling chips */}
                {renderDateChips('pb-6')}
              </motion.div>
            </>
          ) : (
            // Desktop: Horizontal chips in popover with nav buttons
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.1 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover border border-border rounded-xl z-50 shadow-lg overflow-hidden"
              style={{ width: 'min(480px, 90vw)' }}
            >
              {/* Header with month and nav buttons */}
              <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                {/* Left nav button */}
                <button
                  onClick={() => scrollBy('left')}
                  disabled={!canScrollLeft}
                  className={`p-1 rounded-md transition-colors ${
                    canScrollLeft
                      ? 'hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground'
                      : 'text-muted-foreground/20 cursor-default'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Month indicator */}
                <motion.span
                  key={visibleMonth}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-medium text-muted-foreground capitalize"
                >
                  {visibleMonth}
                </motion.span>

                {/* Right nav button */}
                <button
                  onClick={() => scrollBy('right')}
                  disabled={!canScrollRight}
                  className={`p-1 rounded-md transition-colors ${
                    canScrollRight
                      ? 'hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground'
                      : 'text-muted-foreground/20 cursor-default'
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              {renderDateChips('pb-3')}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
