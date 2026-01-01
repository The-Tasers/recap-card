'use client';

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useCheckInStore,
  hydrateCheckInStore,
  getDateString,
  getTodayDateString,
} from '@/lib/checkin-store';
import { useOptionsStore } from '@/lib/options-store';
import { CheckInFlow } from '@/components/checkin-flow';
import { DayRecap } from '@/components/day-recap';
import { generateMoodGradient } from '@/components/moment-blob';
import { AppFooter, AppLogo } from '@/components/app-footer';
import { SettingsButton } from '@/components/settings-button';
import { SignupPrompt } from '@/components/signup-prompt';
import { FeedbackModal } from '@/components/feedback-modal';
import { ExpectationTone, CheckIn, EXPECTATION_TONES } from '@/lib/types';
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
  TrendingUp,
  Layers,
  CloudSun,
  CloudRain,
  CloudFog,
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
  Zap,
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

// Icons for morning expectation tones
const TONE_ICONS: Record<ExpectationTone, LucideIcon> = {
  calm: Sun,
  excited: Sparkles,
  anxious: CloudRain,
  uncertain: HelpCircle,
  energized: Zap,
  heavy: CloudFog,
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
function formatDateNav(
  date: Date,
  isToday: boolean,
  language: 'en' | 'ru'
): string {
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  if (isToday) {
    const monthDay = date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });
    return language === 'ru' ? `Сегодня · ${monthDay}` : `Today · ${monthDay}`;
  }
  const weekday = date.toLocaleDateString(locale, { weekday: 'short' });
  const monthDay = date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
  return `${weekday} · ${monthDay}`;
}

// Check if two check-ins overlap in time (within 60 mins)
function areCheckInsOverlapping(a: CheckIn, b: CheckIn): boolean {
  const timeA = new Date(a.timestamp).getTime();
  const timeB = new Date(b.timestamp).getTime();
  const sixtyMins = 60 * 60 * 1000;
  return Math.abs(timeA - timeB) < sixtyMins;
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
    if (
      areCheckInsOverlapping(currentGroup[currentGroup.length - 1], sorted[i])
    ) {
      currentGroup.push(sorted[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [sorted[i]];
    }
  }
  groups.push(currentGroup);
  return groups;
}

// State colors - red→green gradient like onboarding, slightly softened
const STATE_COLORS: Record<string, string> = {
  neutral: '#94a3b8',
  // Energy: drained(red) → tired(orange) → calm(lime) → energized(green)
  drained: '#f87171', // red-400
  tired: '#fb923c', // orange-400
  calm: '#a3e635', // lime-400
  energized: '#4ade80', // green-400
  // Emotion: frustrated(red) → anxious(orange) → uncertain(amber) → content(lime) → grateful(green)
  frustrated: '#f87171', // red-400
  anxious: '#fb923c', // orange-400
  uncertain: '#fbbf24', // amber-400
  content: '#a3e635', // lime-400
  grateful: '#34d399', // emerald-400
  // Tension: scattered(red) → distracted(orange) → focused(lime) → present(green)
  scattered: '#f87171', // red-400
  distracted: '#fb923c', // orange-400
  focused: '#a3e635', // lime-400
  present: '#4ade80', // green-400
};

// States that need dark text for a11y contrast (light backgrounds)
const DARK_TEXT_STATES = new Set([
  'calm', // lime-400 - light
  'content', // lime-400 - light
  'focused', // lime-400 - light
  'uncertain', // amber-400 - light
  'tired', // orange-400 - can be borderline
]);

// Memoized animation constants to prevent recreation on every render
const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
};
const SPRING_TRANSITION_FAST = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
};
const SPRING_TRANSITION_SNAPPY = {
  type: 'spring' as const,
  stiffness: 800,
  damping: 40,
};

// Generate rich mixed gradient for merged orbs
// opacity suffix adds transparency (e.g., 'e6' = 90%)
function generateMergedGradient(
  colors: string[],
  opacitySuffix: string = ''
): string {
  const c = colors.map((color) => `${color}${opacitySuffix}`);
  if (c.length === 1) {
    return c[0];
  }
  if (c.length === 2) {
    // Two colors: overlapping radial gradients for rich blend
    return `
      radial-gradient(circle at 30% 30%, ${c[0]} 0%, transparent 60%),
      radial-gradient(circle at 70% 70%, ${c[1]} 0%, transparent 60%),
      radial-gradient(circle, ${c[0]} 0%, ${c[1]} 100%)
    `;
  }
  if (c.length === 3) {
    // Three colors: triangle arrangement
    return `
      radial-gradient(circle at 30% 25%, ${c[0]} 0%, transparent 50%),
      radial-gradient(circle at 70% 25%, ${c[1]} 0%, transparent 50%),
      radial-gradient(circle at 50% 75%, ${c[2]} 0%, transparent 50%),
      radial-gradient(circle, ${c[0]} 0%, ${c[1]} 50%, ${c[2]} 100%)
    `;
  }
  // 4+ colors: four corners arrangement
  return `
    radial-gradient(circle at 25% 25%, ${c[0]} 0%, transparent 45%),
    radial-gradient(circle at 75% 25%, ${c[1]} 0%, transparent 45%),
    radial-gradient(circle at 25% 75%, ${c[2] || c[0]} 0%, transparent 45%),
    radial-gradient(circle at 75% 75%, ${c[3] || c[1]} 0%, transparent 45%),
    radial-gradient(circle, ${c[0]} 0%, ${c[1]} 33%, ${c[2] || c[0]} 66%, ${
    c[3] || c[1]
  } 100%)
  `;
}

// Memoized Single Orb component
interface SingleOrbProps {
  checkIn: CheckIn;
  anchorPos: { x: number; y: number };
  isSelected: boolean;
  groupIndex: number;
  onTap: () => void;
}

const SingleOrb = memo(function SingleOrb({
  checkIn,
  anchorPos,
  isSelected,
  groupIndex,
  onTap,
}: SingleOrbProps) {
  const color = STATE_COLORS[checkIn.stateId] || '#94a3b8';

  const containerStyle = useMemo(
    () => ({
      left: `${(anchorPos.x / 200) * 100}%`,
      top: `${(anchorPos.y / 120) * 100}%`,
      zIndex: isSelected ? 5 : 10,
    }),
    [anchorPos.x, anchorPos.y, isSelected]
  );

  // Slight transparency to orbs on arc (e6 = 90% opacity)
  const orbStyle = useMemo(
    () => ({
      background: `${color}e6`,
    }),
    [color]
  );

  const containerTransition = useMemo(
    () => ({
      ...SPRING_TRANSITION,
      delay: groupIndex * 0.1,
    }),
    [groupIndex]
  );

  return (
    <motion.div
      key={checkIn.id}
      className="absolute cursor-pointer"
      style={containerStyle}
      initial={{ scale: 0, x: '-50%', y: '-50%' }}
      animate={{
        scale: 1,
        x: '-50%',
        y: '-50%',
      }}
      transition={containerTransition}
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
    >
      <div
        className="rounded-full"
        style={{
          ...orbStyle,
          width: isSelected ? 24 : 32,
          height: isSelected ? 24 : 32,
          opacity: isSelected ? 0.6 : 1,
          boxShadow: isSelected ? 'none' : `0 0 10px ${color}50`,
        }}
      />
    </motion.div>
  );
});

// Memoized Merged Orb component
interface MergedOrbProps {
  group: CheckIn[];
  anchorPos: { x: number; y: number };
  isGroupExpanded: boolean;
  hasSelectedMoment: boolean;
  remainingCount: number;
  groupIndex: number;
  onTap: (e: React.MouseEvent) => void;
}

const MergedOrb = memo(function MergedOrb({
  group,
  anchorPos,
  isGroupExpanded,
  hasSelectedMoment,
  remainingCount,
  groupIndex,
  onTap,
}: MergedOrbProps) {
  const groupColors = useMemo(
    () => group.map((c) => STATE_COLORS[c.stateId] || '#94a3b8'),
    [group]
  );

  // Slight transparency (e6 = 90% opacity)
  const mergedGradient = useMemo(
    () => generateMergedGradient(groupColors, 'e6'),
    [groupColors]
  );

  const containerStyle = useMemo(
    () => ({
      left: `${(anchorPos.x / 200) * 100}%`,
      top: `${(anchorPos.y / 120) * 100}%`,
      zIndex: isGroupExpanded || hasSelectedMoment ? 5 : 10,
    }),
    [anchorPos.x, anchorPos.y, isGroupExpanded, hasSelectedMoment]
  );

  const containerTransition = useMemo(
    () => ({
      ...SPRING_TRANSITION,
      delay: groupIndex * 0.1,
    }),
    [groupIndex]
  );

  const orbStyle = useMemo(
    () => ({
      background: mergedGradient,
    }),
    [mergedGradient]
  );

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={containerStyle}
      initial={{ scale: 0, x: '-50%', y: '-50%' }}
      animate={{
        scale: hasSelectedMoment ? 0.5 : 1,
        x: '-50%',
        y: '-50%',
        opacity: hasSelectedMoment ? 0.5 : 1,
      }}
      transition={containerTransition}
      onClick={(e) => {
        e.stopPropagation();
        onTap(e);
      }}
    >
      <div
        className="rounded-full relative"
        style={{
          ...orbStyle,
          width: isGroupExpanded || hasSelectedMoment ? 24 : 44,
          height: isGroupExpanded || hasSelectedMoment ? 24 : 44,
          opacity: isGroupExpanded || hasSelectedMoment ? 0.6 : 1,
          boxShadow: isGroupExpanded || hasSelectedMoment ? 'none' : `0 0 12px ${groupColors[0]}50`,
        }}
      >
        {remainingCount > 0 && !isGroupExpanded && !hasSelectedMoment && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {remainingCount}
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Memoized Expanded Grid Orb component
interface ExpandedGridOrbProps {
  checkIn: CheckIn;
  index: number;
  onSelect: (checkIn: CheckIn, e: React.MouseEvent) => void;
}

const ExpandedGridOrb = memo(function ExpandedGridOrb({
  checkIn,
  index,
  onSelect,
}: ExpandedGridOrbProps) {
  const color = STATE_COLORS[checkIn.stateId] || '#94a3b8';

  const transition = useMemo(
    () => ({
      delay: index * 0.05,
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    }),
    [index]
  );

  // Format time from timestamp
  const time = useMemo(() => {
    const date = new Date(checkIn.timestamp);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }, [checkIn.timestamp]);

  return (
    <motion.div
      className="cursor-pointer flex flex-col items-center gap-1"
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={transition}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(checkIn, e);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* The orb with subtle glow */}
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 12px ${color}40`,
        }}
      />
      {/* Time label */}
      <span className="text-[10px] text-muted-foreground/70">{time}</span>
    </motion.div>
  );
});

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
  const [expandedGroupIndex, setExpandedGroupIndex] = useState<number | null>(
    null
  );
  const [selectedMoment, setSelectedMoment] = useState<CheckIn | null>(null);
  const [selectedMomentOrigin, setSelectedMomentOrigin] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedMomentGroupIndex, setSelectedMomentGroupIndex] = useState<
    number | null
  >(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRecapPanel, setShowRecapPanel] = useState(false);
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
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
      setSelectedMomentGroupIndex(null);
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
    const feedbackGiven =
      localStorage.getItem('recapz_feedback_given') === 'true';
    if (feedbackGiven) return;
    const lastPrompt = localStorage.getItem('recapz_feedback_last_prompt');
    const today = new Date().toDateString();
    if (lastPrompt === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const yesterdayDay = days.find((d) => d.date === yesterdayStr);
    if (yesterdayDay) {
      const yesterdayCheckIns = checkIns.filter(
        (c) => c.dayId === yesterdayDay.id
      );
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
    return hour >= 5 && hour < 12;
  }, []);

  // Show inline morning prompt on today view (not full-screen overlay)
  const showInlineMorningPrompt =
    isToday && isMorning && selectedDay && !selectedDay.morningExpectationTone;

  // Handlers
  const handleMorningExpectation = (tone: ExpectationTone) => {
    const day = getOrCreateToday();
    setMorningExpectation(day.id, tone);
  };

  const handleStartCheckIn = useCallback(() => {
    getOrCreateToday();
    setViewMode('checkin');
  }, [getOrCreateToday]);

  const handleCheckInComplete = () => {
    setViewMode('home');
    setExpandedGroupIndex(null);
    setSelectedMoment(null);
    setSelectedMomentGroupIndex(null);
  };

  const handleGroupTap = (groupIndex: number, event?: React.MouseEvent) => {
    const group = checkInGroups[groupIndex];
    if (group.length === 1) {
      // Single moment - select/deselect it (show in arc center)
      if (selectedMoment?.id === group[0].id) {
        setSelectedMoment(null);
        setSelectedMomentOrigin(null);
        setSelectedMomentGroupIndex(null);
      } else {
        // Close any expanded group first
        setExpandedGroupIndex(null);
        // Calculate origin position from arc
        const checkIn = group[0];
        const pos = getCheckInArcPosition(checkIn.timestamp);
        setSelectedMomentOrigin({ x: pos.x, y: pos.y });
        setSelectedMoment(checkIn);
        setSelectedMomentGroupIndex(null); // Single moments don't have a group to return to
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
      setSelectedMomentGroupIndex(null);
    }
  };

  const handleMomentSelect = (checkIn: CheckIn, event?: React.MouseEvent) => {
    // Select moment from expanded group - animate from grid center (not arc position)
    // Grid is at left-1/2 top-[70%] in the arc container (200x120 viewBox)
    // x: 100 = 50% of 200, y: 84 = 70% of 120
    setSelectedMomentOrigin({ x: 100, y: 84 });
    setSelectedMoment(checkIn);
    setSelectedMomentGroupIndex(expandedGroupIndex); // Remember which group this came from
    setExpandedGroupIndex(null); // Collapse the group, return others to arc
  };

  const handleCanvasClick = () => {
    setExpandedGroupIndex(null);
    setSelectedMoment(null);
    setSelectedMomentOrigin(null);
    setSelectedMomentGroupIndex(null);
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
          <Activity
            className="h-6 w-6 text-primary rotate-45"
            strokeWidth={3}
          />
        </span>
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
        <div className="flex-1 px-6 pt-6 pb-6 overflow-hidden">
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
          className="flex items-center gap-2 mb-6"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateDate(-1);
            }}
            className="p-3 -m-1 rounded-full hover:bg-muted/50 active:bg-muted transition-colors cursor-pointer text-muted-foreground/70 hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isToday) {
                setSelectedDate(new Date());
                setExpandedGroupIndex(null);
                setSelectedMoment(null);
                setSelectedMomentGroupIndex(null);
              }
            }}
            className={`text-lg font-medium min-w-[160px] text-center px-2 py-1 rounded-lg transition-colors ${
              isToday
                ? 'text-foreground cursor-default'
                : 'text-foreground hover:bg-muted/50 cursor-pointer'
            }`}
          >
            {formatDateNav(selectedDate, isToday, language)}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateDate(1);
            }}
            disabled={isToday}
            className={`p-3 -m-1 rounded-full transition-colors ${
              isToday
                ? 'text-muted-foreground/20 cursor-not-allowed'
                : 'hover:bg-muted/50 active:bg-muted text-muted-foreground/70 hover:text-foreground cursor-pointer'
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Inline Morning Tone Selector - shows on today morning if not set */}
        <AnimatePresence>
          {showInlineMorningPrompt && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md overflow-hidden"
            >
              <div className="text-center mb-3">
                <p className="text-sm text-muted-foreground">
                  {t('morning.question') || 'How does today feel?'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                {EXPECTATION_TONES.map((tone) => {
                  const Icon = TONE_ICONS[tone.value];
                  return (
                    <motion.button
                      key={tone.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMorningExpectation(tone.value);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-muted hover:bg-muted hover:border-muted-foreground/30 transition-colors cursor-pointer"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Icon className="h-4 w-4" style={{ color: tone.color }} />
                      <span className="text-xs font-medium text-foreground">
                        {t(`tone.${tone.value}` as TranslationKey) ||
                          tone.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            <motion.svg
              viewBox="0 0 200 120"
              className="w-full h-full"
              style={{ overflow: 'visible' }}
              animate={{
                opacity:
                  selectedMoment || expandedGroupIndex !== null ? 0.4 : 1,
              }}
              transition={{ duration: 0.3 }}
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
                <linearGradient
                  id="dayGradientBg"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#1e3a5f" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="75%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#1e3a5f" />
                </linearGradient>
                <linearGradient
                  id="dayGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#1e3a5f" />
                  <stop offset="25%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="75%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#1e3a5f" />
                </linearGradient>
              </defs>
            </motion.svg>

            {/* Moment orbs - grouped (using memoized components) */}
            {checkInGroups.map((group, groupIndex) => {
              const isGroupExpanded = expandedGroupIndex === groupIndex;
              const anchorPos = getCheckInArcPosition(group[0].timestamp);

              if (group.length === 1) {
                const checkIn = group[0];
                return (
                  <SingleOrb
                    key={checkIn.id}
                    checkIn={checkIn}
                    anchorPos={anchorPos}
                    isSelected={selectedMoment?.id === checkIn.id}
                    groupIndex={groupIndex}
                    onTap={() => handleGroupTap(groupIndex)}
                  />
                );
              }

              const hasSelectedMoment = group.some(
                (c) => selectedMoment?.id === c.id
              );
              const remainingCount = hasSelectedMoment
                ? group.length - 1
                : group.length;

              return (
                <MergedOrb
                  key={`group-${groupIndex}`}
                  group={group}
                  anchorPos={anchorPos}
                  isGroupExpanded={isGroupExpanded}
                  hasSelectedMoment={hasSelectedMoment}
                  remainingCount={remainingCount}
                  groupIndex={groupIndex}
                  onTap={(e) => handleGroupTap(groupIndex, e)}
                />
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
            <Moon className="absolute -left-0.5 -bottom-1 sm:left-0 sm:bottom-0 h-4 w-4 sm:h-5 sm:w-5 text-indigo-400/60" />
            <Sun className="absolute left-1/2 -translate-x-1/2 top-0 h-4 w-4 sm:h-5 sm:w-5 text-amber-500/60" />
            <Moon className="absolute -right-0.5 -bottom-1 sm:right-0 sm:bottom-0 h-4 w-4 sm:h-5 sm:w-5 text-indigo-400/60" />


            {/* Expanded group grid - centered inside arc for selection */}
            <AnimatePresence>
              {expandedGroupIndex !== null &&
                checkInGroups[expandedGroupIndex] && (
                  <motion.div
                    key="expanded-grid"
                    className="absolute left-1/2 top-[70%] -translate-x-1/2 -translate-y-1/2 z-20"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={SPRING_TRANSITION_FAST}
                  >
                    <div className="flex items-center gap-2">
                      {checkInGroups[expandedGroupIndex].map((checkIn, i) => (
                        <ExpandedGridOrb
                          key={checkIn.id}
                          checkIn={checkIn}
                          index={i}
                          onSelect={handleMomentSelect}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>


            {/* Selected moment - animates from arc position to center */}
            <AnimatePresence mode="popLayout">
              {selectedMoment &&
                (() => {
                  const state = states.find(
                    (s) => s.id === selectedMoment.stateId
                  );
                  const context = contexts.find(
                    (c) => c.id === selectedMoment.contextId
                  );
                  const color =
                    STATE_COLORS[selectedMoment.stateId] || '#94a3b8';
                  const textColor = DARK_TEXT_STATES.has(selectedMoment.stateId)
                    ? 'text-gray-900'
                    : 'text-white';
                  const Icon = STATE_ICONS[selectedMoment.stateId] || Meh;
                  const stateLabel = state
                    ? t(`state.${state.id}` as TranslationKey) || state.label
                    : '';
                  const contextLabel = context
                    ? t(`context.${context.id}` as TranslationKey) ||
                      context.label
                    : '';
                  const time = new Date(
                    selectedMoment.timestamp
                  ).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  });

                  // Calculate initial position from origin (arc position) to center
                  const originX = selectedMomentOrigin
                    ? (selectedMomentOrigin.x / 200) * 100
                    : 50;
                  const originY = selectedMomentOrigin
                    ? (selectedMomentOrigin.y / 120) * 100
                    : 75;

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
                        top: '65%',
                        scale: 1,
                        opacity: 1,
                        x: '-50%',
                        y: '-50%',
                        transition: SPRING_TRANSITION_SNAPPY,
                      }}
                      exit={{
                        scale: 0.3,
                        opacity: 0,
                        x: '-50%',
                        y: '-50%',
                        transition: { duration: 0.08 },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Return to the expanded group grid if the moment came from a group
                        if (selectedMomentGroupIndex !== null) {
                          setExpandedGroupIndex(selectedMomentGroupIndex);
                        }
                        setSelectedMoment(null);
                        setSelectedMomentOrigin(null);
                        setSelectedMomentGroupIndex(null);
                      }}
                    >
                      {/* Subtle glow effect - reduced for better text visibility */}
                      <div
                        className="absolute inset-0 rounded-full blur-xl opacity-15"
                        style={{ backgroundColor: color }}
                      />
                      {/* Orb with full info - larger on desktop to fill arc space */}
                      <motion.div
                        className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full flex flex-col items-center justify-center ${textColor}`}
                        style={{ background: color }}
                      >
                        {/* Content */}
                        <Icon className="w-5 h-5 md:w-7 md:h-7 mb-1 md:mb-2" />
                        <span className="text-sm md:text-base font-semibold leading-tight text-center px-2 md:px-3">
                          {stateLabel}
                        </span>
                        {contextLabel && (
                          <span className="text-xs md:text-sm opacity-70 leading-tight mt-0.5 md:mt-1">
                            {contextLabel}
                          </span>
                        )}
                        <span className="text-xs md:text-sm opacity-50 mt-1 md:mt-1.5">
                          {time}
                        </span>
                      </motion.div>
                    </motion.div>
                  );
                })()}
            </AnimatePresence>

            {/* Contextual message when viewing a moment - inside arc below orb */}
            <AnimatePresence mode="wait">
              {selectedMoment && (
                <motion.p
                  key="moment-context"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="absolute left-1/2 top-[100%] -translate-x-1/2 text-xs text-muted-foreground/60 text-center z-20"
                >
                  {t('home.momentContext') || 'One moment in a larger day.'}
                </motion.p>
              )}
            </AnimatePresence>

            {/* CTA buttons inside arc - shown when no moment is selected and no group expanded */}
            <AnimatePresence mode="wait">
              {!selectedMoment && expandedGroupIndex === null && (
                <motion.div
                  key="arc-cta-buttons"
                  className="absolute left-1/2 top-[75%] -translate-x-1/2 -translate-y-1/2 z-20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="flex flex-col items-center gap-2">
                    {/* Add Moment - only on Today */}
                    {isToday && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartCheckIn();
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium cursor-pointer shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus className="h-4 w-4" />
                        <span>{t('checkin.add') || 'Add moment'}</span>
                      </motion.button>
                    )}

                    {/* View day recap - subtle, secondary to main CTA, only in second half of day */}
                    {selectedDayCheckIns.length > 0 &&
                      (!isToday || getDayProgress() >= 0.5) && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRecapPanel(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-muted-foreground/70 hover:text-muted-foreground text-sm font-medium cursor-pointer transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full opacity-70"
                            style={{
                              background:
                                generateMoodGradient(selectedDayCheckIns),
                            }}
                          />
                          <span>{t('home.seeReflection') || 'View recap'}</span>
                        </motion.button>
                      )}

                    {/* Empty state for selected day */}
                    {selectedDayCheckIns.length === 0 && !isToday && (
                      <span className="text-sm text-muted-foreground">
                        {t('home.emptyPast') || 'A quiet day'}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Empty explanation for today only - below buttons */}
        <div className="h-[24px] mt-4 flex items-center justify-center">
          <AnimatePresence>
            {!selectedMoment && selectedDayCheckIns.length === 0 && isToday && (
              <motion.p
                key="empty-explanation"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground text-center max-w-xs"
              >
                {t('home.emptyExplanation') ||
                  'Catch how you feel as the day unfolds'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Multi-day insights teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setShowInsightsPanel(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-muted/50 text-muted-foreground/80 hover:bg-muted/50 hover:border-muted hover:text-foreground transition-colors cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-sm font-medium">
              {t('home.insightsTeaser') || 'Patterns emerge over time'}
            </span>
          </motion.button>
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
                  <h2 className="text-lg font-semibold">
                    {t('recap.title') || 'Your day'}
                  </h2>
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
                  <h2 className="text-lg font-semibold">
                    {t('recap.title') || 'Your day'}
                  </h2>
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

      {/* Insights Panel - Bottom sheet on mobile, modal on desktop */}
      <AnimatePresence>
        {showInsightsPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowInsightsPanel(false)}
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
                <div className="flex items-center justify-between px-6 pb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t('insights.title') || 'Your patterns'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('insights.subtitle') || 'Based on the last 7 days'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInsightsPanel(false)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 pb-10 max-h-[calc(85vh-120px)]">
                  <InsightsPanelContent />
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
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {t('insights.title') || 'Your patterns'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('insights.subtitle') || 'Based on the last 7 days'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInsightsPanel(false)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 py-6 max-h-[calc(80vh-120px)]">
                  <InsightsPanelContent />
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Insights panel content - shows placeholder/example insights
function InsightsPanelContent() {
  const { t } = useI18n();

  // Example insight patterns to show what user could see after a week
  const exampleInsights = [
    {
      icon: Shuffle,
      color: '#fb923c',
      text:
        t('insights.example.1') ||
        'Days with many context switches felt heavier overall.',
    },
    {
      icon: Smile,
      color: '#34d399',
      text:
        t('insights.example.2') ||
        'Low energy followed social moments more than solitary ones.',
    },
    {
      icon: HelpCircle,
      color: '#fbbf24',
      text:
        t('insights.example.3') ||
        'Uncertain mornings rarely led to focused evenings.',
    },
    {
      icon: Zap,
      color: '#4ade80',
      text:
        t('insights.example.4') ||
        'A few intense moments shaped the day more than many neutral ones.',
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Explanation */}
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Layers className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-medium text-foreground text-lg">
          {t('insights.needMoreData') || 'Keep checking in'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-3 leading-relaxed">
          {t('insights.needMoreDataDesc') ||
            'Patterns emerge after a few days of moments. Even missed days count — they show contrast.'}
        </p>
      </div>

      {/* Example insights preview */}
      <div className="space-y-4 flex-1 pt-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('insights.exampleTitle') || 'What you might see'}
        </p>

        <div className="space-y-3">
          {exampleInsights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-muted/30"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${insight.color}20` }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: insight.color }}
                  />
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed pt-1">
                  {insight.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer encouragement */}
      <div className="text-center pt-6 pb-2 mt-auto">
        <p className="text-xs text-muted-foreground">
          {t('insights.keepGoing') || 'Keep noticing moments.'}
        </p>
      </div>
    </div>
  );
}
