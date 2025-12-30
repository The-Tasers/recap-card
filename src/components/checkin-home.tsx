'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useCheckInStore,
  hydrateCheckInStore,
  getDateString,
  getTodayDateString,
} from '@/lib/checkin-store';
import { useOptionsStore } from '@/lib/options-store';
import { CheckInFlow } from '@/components/checkin-flow';
import { MorningExpectation } from '@/components/morning-expectation';
import { DayRecap } from '@/components/day-recap';
import { generateMoodGradient } from '@/components/moment-blob';
import { AppFooter, AppLogo } from '@/components/app-footer';
import { SettingsButton } from '@/components/settings-button';
import { SignupPrompt } from '@/components/signup-prompt';
import { FeedbackModal } from '@/components/feedback-modal';
import { ExpectationTone, CheckIn } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/components/auth-provider';
import {
  Activity,
  Plus,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CloudSun,
  CloudRain,
  Smile,
  AlertCircle,
  ThumbsDown,
  HelpCircle,
  Target,
  Shuffle,
  Eye,
  EyeOff,
  Minus,
  Meh,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { TranslationKey } from '@/lib/i18n/translations';

type ViewMode = 'home' | 'morning' | 'checkin';

// Hook to detect mobile vs desktop
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// State icons matching moment-blob.tsx
const STATE_ICONS: Record<string, LucideIcon> = {
  neutral: Minus,
  energized: Sun,
  calm: CloudSun,
  tired: Moon,
  drained: CloudRain,
  content: Smile,
  anxious: AlertCircle,
  frustrated: ThumbsDown,
  grateful: Sparkles,
  uncertain: HelpCircle,
  focused: Target,
  scattered: Shuffle,
  present: Eye,
  distracted: EyeOff,
};

// Get day progress as a fraction (0-1) for full 24-hour day
function getDayProgress(date?: Date): number {
  const now = date || new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  const totalMinutes = 24 * 60;
  return currentMinutes / totalMinutes;
}

// Get position on arc based on time (0-1 progress through day)
function getArcPosition(progress: number): { x: number; y: number } {
  const angle = Math.PI * (1 - progress);
  const x = 100 + 90 * Math.cos(angle);
  const y = 110 - 90 * Math.sin(angle);
  return { x, y };
}

// Get position for a check-in based on its timestamp
function getCheckInArcPosition(timestamp: string): { x: number; y: number } {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const progress = (hours * 60 + minutes) / (24 * 60);
  return getArcPosition(progress);
}

// Format date for navigation
function formatDateNav(date: Date, isToday: boolean, language: 'en' | 'ru'): string {
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  if (isToday) {
    const monthDay = date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    return language === 'ru' ? `Сегодня · ${monthDay}` : `Today · ${monthDay}`;
  }
  const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
  const monthDay = date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  return `${weekday} · ${monthDay}`;
}

// Check if two check-ins overlap in time (within 30 mins)
function areCheckInsOverlapping(a: CheckIn, b: CheckIn): boolean {
  const timeA = new Date(a.timestamp).getTime();
  const timeB = new Date(b.timestamp).getTime();
  const thirtyMins = 30 * 60 * 1000;
  return Math.abs(timeA - timeB) < thirtyMins;
}

// Group overlapping check-ins
function groupOverlappingCheckIns(checkIns: CheckIn[]): CheckIn[][] {
  if (checkIns.length === 0) return [];
  const sorted = [...checkIns].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const groups: CheckIn[][] = [];
  let currentGroup: CheckIn[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (areCheckInsOverlapping(currentGroup[currentGroup.length - 1], sorted[i])) {
      currentGroup.push(sorted[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [sorted[i]];
    }
  }
  groups.push(currentGroup);
  return groups;
}

// State colors
const STATE_COLORS: Record<string, string> = {
  neutral: '#94a3b8',
  drained: '#f87171',
  tired: '#fb923c',
  calm: '#84cc16',
  energized: '#22c55e',
  frustrated: '#ef4444',
  anxious: '#f97316',
  uncertain: '#fbbf24',
  content: '#a3e635',
  grateful: '#10b981',
  scattered: '#f87171',
  distracted: '#fb923c',
  focused: '#84cc16',
  present: '#22c55e',
};

export function CheckInHome() {
  const { t, language } = useI18n();
  const { user } = useAuth();

  const {
    hydrated,
    getOrCreateToday,
    getDayByDate,
    setMorningExpectation,
    days,
    checkIns,
    getCheckInsForDay,
  } = useCheckInStore();

  const { loadOptions, states, contexts } = useOptionsStore();

  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedGroupIndex, setExpandedGroupIndex] = useState<number | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<CheckIn | null>(null);
  const [selectedMomentOrigin, setSelectedMomentOrigin] = useState<{ x: number; y: number } | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRecapPanel, setShowRecapPanel] = useState(false);
  const isMobile = useIsMobile();
  const arcContainerRef = useRef<HTMLDivElement>(null);

  // Date navigation
  const isToday = useMemo(() => {
    return getDateString(selectedDate) === getTodayDateString();
  }, [selectedDate]);

  const navigateDate = useCallback(
    (direction: -1 | 1) => {
      if (direction === 1 && isToday) return; // Can't go forward past today
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + direction);
      // Don't go past today
      if (newDate > new Date()) return;
      setSelectedDate(newDate);
      setExpandedGroupIndex(null);
      setSelectedMoment(null);
    },
    [selectedDate, isToday]
  );

  // Hydrate stores on mount
  useEffect(() => {
    hydrateCheckInStore();
    loadOptions(user?.id);
  }, [loadOptions, user?.id]);

  // Keyboard navigation for date
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'home') return;
      if (e.key === 'ArrowLeft') {
        navigateDate(-1);
      } else if (e.key === 'ArrowRight') {
        navigateDate(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, navigateDate]);

  // Check if should show feedback modal
  useEffect(() => {
    if (!hydrated) return;
    const feedbackGiven = localStorage.getItem('recapz_feedback_given') === 'true';
    if (feedbackGiven) return;
    const lastPrompt = localStorage.getItem('recapz_feedback_last_prompt');
    const today = new Date().toDateString();
    if (lastPrompt === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayDay = days.find((d) => d.date === yesterdayStr);
    if (yesterdayDay) {
      const yesterdayCheckIns = checkIns.filter((c) => c.dayId === yesterdayDay.id);
      if (yesterdayCheckIns.length >= 2) {
        const timer = setTimeout(() => {
          setShowFeedbackModal(true);
          localStorage.setItem('recapz_feedback_last_prompt', today);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [hydrated, days, checkIns]);

  const optionsLoaded = states.length > 0;
  const isReady = hydrated && optionsLoaded;

  // Get data for selected date
  const selectedDay = useMemo(() => {
    return getDayByDate(getDateString(selectedDate));
  }, [selectedDate, getDayByDate, days]);

  const selectedDayCheckIns = useMemo(() => {
    if (!selectedDay) return [];
    return getCheckInsForDay(selectedDay.id);
  }, [selectedDay, getCheckInsForDay, checkIns]);

  // Group overlapping check-ins
  const checkInGroups = useMemo(() => {
    return groupOverlappingCheckIns(selectedDayCheckIns);
  }, [selectedDayCheckIns]);

  // Arc progress for selected day
  const arcProgress = useMemo(() => {
    if (isToday) {
      return getDayProgress();
    }
    // For past days, show full arc
    return 1;
  }, [isToday]);

  // Morning check
  const isMorning = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 12;
  }, []);

  const showMorningPrompt =
    isToday &&
    isMorning &&
    selectedDay &&
    !selectedDay.morningExpectationTone &&
    selectedDayCheckIns.length === 0;

  // Handlers
  const handleMorningExpectation = (tone: ExpectationTone) => {
    const day = getOrCreateToday();
    setMorningExpectation(day.id, tone);
    setViewMode('home');
  };

  const handleSkipMorning = () => setViewMode('home');

  const handleStartCheckIn = useCallback(() => {
    getOrCreateToday();
    setViewMode('checkin');
  }, [getOrCreateToday]);

  const handleCheckInComplete = () => {
    setViewMode('home');
    setExpandedGroupIndex(null);
    setSelectedMoment(null);
  };

  const handleGroupTap = (groupIndex: number, event?: React.MouseEvent) => {
    const group = checkInGroups[groupIndex];
    if (group.length === 1) {
      // Single moment - select/deselect it (show in arc center)
      if (selectedMoment?.id === group[0].id) {
        setSelectedMoment(null);
        setSelectedMomentOrigin(null);
      } else {
        // Calculate origin position from arc
        const checkIn = group[0];
        const pos = getCheckInArcPosition(checkIn.timestamp);
        setSelectedMomentOrigin({ x: pos.x, y: pos.y });
        setSelectedMoment(checkIn);
      }
    } else {
      // Multiple moments - expand/collapse group to show grid in arc center
      if (expandedGroupIndex === groupIndex) {
        setExpandedGroupIndex(null);
      } else {
        setExpandedGroupIndex(groupIndex);
      }
      setSelectedMoment(null);
      setSelectedMomentOrigin(null);
    }
  };

  const handleMomentSelect = (checkIn: CheckIn, event?: React.MouseEvent) => {
    // Select moment from expanded group - collapse group and show moment
    const pos = getCheckInArcPosition(checkIn.timestamp);
    setSelectedMomentOrigin({ x: pos.x, y: pos.y });
    setSelectedMoment(checkIn);
    setExpandedGroupIndex(null); // Collapse the group, return others to arc
  };

  const handleCanvasClick = () => {
    setExpandedGroupIndex(null);
    setSelectedMoment(null);
    setSelectedMomentOrigin(null);
  };

  // Loading state
  if (!isReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <span className="text-2xl font-bold tracking-wide uppercase flex items-center">
          <span className="text-[#ef4444]">R</span>
          <span className="text-[#f97316]">E</span>
          <span className="text-[#eab308]">C</span>
          <span className="text-[#84cc16]">A</span>
          <span className="text-[#22c55e]">P</span>
          <Activity className="h-6 w-6 text-primary" strokeWidth={3} />
        </span>
      </div>
    );
  }

  // Morning expectation view
  if (viewMode === 'morning' || (viewMode === 'home' && showMorningPrompt)) {
    return (
      <div className="h-screen-dynamic flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center px-6">
          <MorningExpectation
            onSelect={handleMorningExpectation}
            onSkip={handleSkipMorning}
          />
        </div>
      </div>
    );
  }

  // Check-in flow view
  if (viewMode === 'checkin') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="h-screen-dynamic flex flex-col bg-background"
      >
        <div className="flex-1 px-6 pt-6">
          <div className="w-full max-w-md mx-auto h-full">
            <CheckInFlow
              onComplete={handleCheckInComplete}
              onCancel={() => setViewMode('home')}
              isAuthenticated={!!user}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Main home view
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-screen-dynamic flex flex-col bg-background"
      onClick={handleCanvasClick}
    >
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-2">
        <div className="w-full max-w-md md:max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div className="w-10" />
            <AppLogo size="lg" />
            <SettingsButton isAuthenticated={!!user} />
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Date Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateDate(-1);
            }}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="text-lg font-medium text-foreground min-w-[160px] text-center">
            {formatDateNav(selectedDate, isToday, language)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateDate(1);
            }}
            disabled={isToday}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isToday
                ? 'text-muted-foreground/30 cursor-not-allowed'
                : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Day Arc */}
        <motion.div
          ref={arcContainerRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative z-10 w-full max-w-md md:max-w-lg"
        >
          <div className="relative w-full aspect-[200/120]">
            {/* Arc SVG */}
            <svg
              viewBox="0 0 200 120"
              className="w-full h-full"
              style={{ overflow: 'visible' }}
            >
              {/* Background arc */}
              <path
                d="M 10 110 A 90 90 0 0 1 190 110"
                fill="none"
                stroke="url(#dayGradientBg)"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.25"
              />
              {/* Progress arc */}
              <motion.path
                d="M 10 110 A 90 90 0 0 1 190 110"
                fill="none"
                stroke="url(#dayGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: arcProgress }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="dayGradientBg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e3a5f" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="75%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#1e3a5f" />
                </linearGradient>
                <linearGradient id="dayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e3a5f" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="75%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#1e3a5f" />
                </linearGradient>
              </defs>
            </svg>

            {/* Moment orbs - grouped */}
            {checkInGroups.map((group, groupIndex) => {
              const isGroupExpanded = expandedGroupIndex === groupIndex;
              // Use first check-in's position as group anchor
              const anchorPos = getCheckInArcPosition(group[0].timestamp);

              if (group.length === 1) {
                // Single orb
                const checkIn = group[0];
                const color = STATE_COLORS[checkIn.stateId] || '#94a3b8';
                const isSelected = selectedMoment?.id === checkIn.id;
                return (
                  <motion.div
                    key={checkIn.id}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${(anchorPos.x / 200) * 100}%`,
                      top: `${(anchorPos.y / 120) * 100}%`,
                      zIndex: isSelected ? 5 : 10,
                    }}
                    initial={{ scale: 0, x: '-50%', y: '-50%' }}
                    animate={{ scale: isSelected ? 0.5 : 1, x: '-50%', y: '-50%', opacity: isSelected ? 0.5 : 1 }}
                    transition={{
                      delay: 0.4 + groupIndex * 0.1,
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupTap(groupIndex);
                    }}
                  >
                    <motion.div
                      className="w-10 h-10 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${color}, ${color}cc)`,
                      }}
                      animate={{ y: isSelected ? 0 : [0, -3, 0] }}
                      transition={{
                        duration: 2.5,
                        repeat: isSelected ? 0 : Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <div
                        className="absolute rounded-full bg-white/40"
                        style={{
                          width: '35%',
                          height: '25%',
                          left: '18%',
                          top: '15%',
                          filter: 'blur(2px)',
                        }}
                      />
                    </motion.div>
                  </motion.div>
                );
              }

              // Multiple overlapping orbs - show single merged gradient orb
              // Check if one of the group's moments is currently selected/expanded
              const hasSelectedMoment = group.some(c => selectedMoment?.id === c.id);
              const remainingCount = hasSelectedMoment ? group.length - 1 : group.length;

              // Generate gradient from all colors in the group
              const groupColors = group.map(c => STATE_COLORS[c.stateId] || '#94a3b8');
              const mergedGradient = groupColors.length === 2
                ? `radial-gradient(circle at 30% 30%, ${groupColors[0]}dd 0%, transparent 50%), radial-gradient(circle at 70% 70%, ${groupColors[1]}dd 0%, transparent 50%), radial-gradient(circle, ${groupColors[0]}88 0%, ${groupColors[1]}88 100%)`
                : groupColors.length === 3
                ? `radial-gradient(circle at 25% 25%, ${groupColors[0]}dd 0%, transparent 45%), radial-gradient(circle at 75% 30%, ${groupColors[1]}dd 0%, transparent 45%), radial-gradient(circle at 50% 75%, ${groupColors[2]}dd 0%, transparent 45%), radial-gradient(circle, ${groupColors[0]}66 0%, ${groupColors[1]}66 50%, ${groupColors[2]}66 100%)`
                : `radial-gradient(circle at 20% 20%, ${groupColors[0]}dd 0%, transparent 40%), radial-gradient(circle at 80% 25%, ${groupColors[1] || groupColors[0]}dd 0%, transparent 40%), radial-gradient(circle at 25% 80%, ${groupColors[2] || groupColors[0]}dd 0%, transparent 40%), radial-gradient(circle at 75% 75%, ${groupColors[3] || groupColors[1] || groupColors[0]}dd 0%, transparent 40%), radial-gradient(circle, ${groupColors[0]}55 0%, ${groupColors[1] || groupColors[0]}55 50%, ${groupColors[2] || groupColors[0]}55 100%)`;

              return (
                <motion.div
                  key={`group-${groupIndex}`}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${(anchorPos.x / 200) * 100}%`,
                    top: `${(anchorPos.y / 120) * 100}%`,
                    zIndex: isGroupExpanded || hasSelectedMoment ? 5 : 10,
                  }}
                  initial={{ scale: 0, x: '-50%', y: '-50%' }}
                  animate={{
                    scale: hasSelectedMoment ? 0.5 : 1,
                    x: '-50%',
                    y: '-50%',
                    opacity: hasSelectedMoment ? 0.5 : 1,
                  }}
                  transition={{
                    delay: 0.4 + groupIndex * 0.1,
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isGroupExpanded) {
                      handleGroupTap(groupIndex, e);
                    }
                  }}
                >
                  {/* Single merged gradient orb - hide when expanded to grid */}
                  {!isGroupExpanded && (
                    <motion.div
                      className="w-11 h-11 rounded-full relative"
                      style={{ background: mergedGradient }}
                      animate={{ y: hasSelectedMoment ? 0 : [0, -3, 0] }}
                      transition={{
                        duration: 2.5,
                        repeat: hasSelectedMoment ? 0 : Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {/* Glass highlight */}
                      <div
                        className="absolute rounded-full bg-white/35"
                        style={{
                          width: '35%',
                          height: '25%',
                          left: '18%',
                          top: '15%',
                          filter: 'blur(2px)',
                        }}
                      />
                      {/* Count badge - show remaining count when one is selected */}
                      {remainingCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {remainingCount}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}

            {/* Current time indicator (sun/moon) - only for today, not clickable */}
            {isToday && (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: `${(getArcPosition(getDayProgress()).x / 200) * 100}%`,
                  top: `${(getArcPosition(getDayProgress()).y / 120) * 100}%`,
                  zIndex: 5,
                }}
                initial={{ opacity: 0, scale: 0.5, x: '-50%', y: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              >
                {getDayProgress() >= 0.79 || getDayProgress() < 0.21 ? (
                  <Moon className="h-5 w-5 text-indigo-400" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500" />
                )}
              </motion.div>
            )}

            {/* Time labels */}
            <Moon className="absolute left-0 bottom-0 h-4 w-4 text-indigo-400/60" />
            <Sun className="absolute left-1/2 -translate-x-1/2 top-0 h-4 w-4 text-amber-500/60" />
            <Moon className="absolute right-0 bottom-0 h-4 w-4 text-indigo-400/60" />

            {/* Expanded group grid - centered inside arc for selection */}
            <AnimatePresence>
              {expandedGroupIndex !== null && checkInGroups[expandedGroupIndex] && (
                <motion.div
                  key="expanded-grid"
                  className="absolute left-1/2 top-[70%] -translate-x-1/2 -translate-y-1/2 z-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div className="flex items-center gap-4">
                    {checkInGroups[expandedGroupIndex].map((checkIn, i) => {
                      const color = STATE_COLORS[checkIn.stateId] || '#94a3b8';
                      return (
                        <motion.div
                          key={checkIn.id}
                          className="cursor-pointer relative"
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{
                            delay: i * 0.05,
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMomentSelect(checkIn, e);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div
                            className="w-12 h-12 rounded-full relative"
                            style={{
                              background: `radial-gradient(circle at 35% 35%, ${color}, ${color}cc)`,
                            }}
                          >
                            {/* Glass highlight */}
                            <div
                              className="absolute rounded-full bg-white/40"
                              style={{
                                width: '35%',
                                height: '25%',
                                left: '18%',
                                top: '15%',
                                filter: 'blur(2px)',
                              }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected moment - animates from arc position to center */}
            <AnimatePresence mode="wait">
              {selectedMoment && (() => {
                const state = states.find((s) => s.id === selectedMoment.stateId);
                const context = contexts.find((c) => c.id === selectedMoment.contextId);
                const color = STATE_COLORS[selectedMoment.stateId] || '#94a3b8';
                const Icon = STATE_ICONS[selectedMoment.stateId] || Meh;
                const stateLabel = state ? t(`state.${state.id}` as TranslationKey) || state.label : '';
                const contextLabel = context ? t(`context.${context.id}` as TranslationKey) || context.label : '';
                const time = new Date(selectedMoment.timestamp).toLocaleTimeString(
                  language === 'ru' ? 'ru-RU' : 'en-US',
                  { hour: 'numeric', minute: '2-digit' }
                );

                // Calculate initial position from origin (arc position) to center
                const originX = selectedMomentOrigin ? (selectedMomentOrigin.x / 200) * 100 : 50;
                const originY = selectedMomentOrigin ? (selectedMomentOrigin.y / 120) * 100 : 75;

                return (
                  <motion.div
                    key={selectedMoment.id}
                    className="absolute cursor-pointer"
                    style={{ zIndex: 30 }}
                    initial={{
                      left: `${originX}%`,
                      top: `${originY}%`,
                      scale: 0.4,
                      opacity: 0,
                      x: '-50%',
                      y: '-50%',
                    }}
                    animate={{
                      left: '50%',
                      top: '75%',
                      scale: 1,
                      opacity: 1,
                      x: '-50%',
                      y: '-50%',
                    }}
                    exit={{
                      left: `${originX}%`,
                      top: `${originY}%`,
                      scale: 0.4,
                      opacity: 0,
                      x: '-50%',
                      y: '-50%',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMoment(null);
                      setSelectedMomentOrigin(null);
                    }}
                  >
                    {/* Subtle glow effect */}
                    <div
                      className="absolute inset-0 rounded-full blur-lg opacity-25"
                      style={{ backgroundColor: color }}
                    />
                    {/* Large orb with full info */}
                    <motion.div
                      className="relative w-28 h-28 md:w-32 md:h-32 rounded-full flex flex-col items-center justify-center text-white"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${color}, ${color}cc)`,
                      }}
                    >
                      {/* Glass highlight */}
                      <div
                        className="absolute rounded-full bg-white/30"
                        style={{
                          width: '40%',
                          height: '25%',
                          left: '15%',
                          top: '12%',
                          filter: 'blur(3px)',
                        }}
                      />
                      {/* Content */}
                      <Icon className="w-6 h-6 mb-1" />
                      <span className="text-sm font-semibold leading-tight text-center px-2">
                        {stateLabel}
                      </span>
                      {contextLabel && (
                        <span className="text-xs opacity-80 leading-tight mt-0.5">
                          {contextLabel}
                        </span>
                      )}
                      <span className="text-xs opacity-60 mt-1">{time}</span>
                    </motion.div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Action buttons - below arc, fixed height container to prevent layout shift */}
        <div className="mt-6 h-[40px] sm:h-[44px] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 sm:gap-3"
          >
            {/* Add Moment - only on Today */}
            {isToday && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartCheckIn();
                }}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full bg-primary text-primary-foreground text-sm sm:text-base font-medium cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{t('checkin.add') || 'Add moment'}</span>
              </motion.button>
            )}

            {/* View day recap - always available when there are moments */}
            {selectedDayCheckIns.length > 0 && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRecapPanel(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-card/80 backdrop-blur-sm border border-border text-muted-foreground text-sm sm:text-base font-medium cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full"
                  style={{ background: generateMoodGradient(selectedDayCheckIns) }}
                />
                <span>{t('home.seeReflection') || 'View recap'}</span>
              </motion.button>
            )}

            {/* Empty state for selected day - shown inline with buttons */}
            {selectedDayCheckIns.length === 0 && !isToday && (
              <span className="text-sm text-muted-foreground">
                {t('home.emptyPast') || 'A quiet day'}
              </span>
            )}
          </motion.div>
        </div>

        {/* Empty explanation for today only - below buttons, fixed height to prevent shift */}
        <div className="h-[24px] mt-4 flex items-center justify-center">
          {selectedDayCheckIns.length === 0 && isToday && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground text-center max-w-xs"
            >
              {t('home.emptyExplanation') || 'Catch how you feel as the day unfolds'}
            </motion.p>
          )}
        </div>

        {/* Multi-day insights teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Open multi-day insights screen
            }}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            <span>{t('home.insightsTeaser') || 'Patterns emerge over time'}</span>
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-6">
        <AppFooter showLogo={false} />
      </div>

      {/* Signup prompt */}
      <SignupPrompt />

      {/* Feedback modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* Day Recap Panel - Bottom sheet on mobile, modal on desktop */}
      <AnimatePresence>
        {showRecapPanel && selectedDay && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowRecapPanel(false)}
            />

            {/* Panel/Modal */}
            {isMobile ? (
              // Mobile: Bottom sheet
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl max-h-[85vh] overflow-hidden"
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pb-3">
                  <h2 className="text-lg font-semibold">{t('recap.title') || 'Your day'}</h2>
                  <button
                    onClick={() => setShowRecapPanel(false)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 pb-8 max-h-[calc(85vh-80px)]">
                  <DayRecap day={selectedDay} checkIns={selectedDayCheckIns} />
                </div>
              </motion.div>
            ) : (
              // Desktop: Centered modal
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden max-h-[80vh]"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h2 className="text-lg font-semibold">{t('recap.title') || 'Your day'}</h2>
                  <button
                    onClick={() => setShowRecapPanel(false)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 py-4 max-h-[calc(80vh-80px)]">
                  <DayRecap day={selectedDay} checkIns={selectedDayCheckIns} />
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
