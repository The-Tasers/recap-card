'use client';

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useCheckInStore,
  getDateString,
  getTodayDateString,
} from '@/lib/checkin-store';
import { useOptionsStore } from '@/lib/options-store';
import { CheckInFlow } from '@/components/checkin-flow';
import { DayRecap } from '@/components/day-recap';
import { DatePickerTimeline } from '@/components/date-picker-timeline';
import { generateMoodGradient } from '@/components/moment-blob';
import { AppFooter, AppLogo } from '@/components/app-footer';
import { SettingsButton } from '@/components/settings-button';
import {
  ExpectationTone,
  CheckIn,
  EXPECTATION_TONES,
  ALL_COLOR_THEMES,
} from '@/lib/types';
import { useSettingsStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import {
  trackInsightsOpen,
  trackInsightsClose,
  trackDayRecapOpen,
  trackDayRecapClose,
  trackDateNavigation,
  trackDateSelect,
} from '@/lib/analytics';
import {
  Activity,
  Plus,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Cloud,
  CloudRain,
  CloudFog,
  Smile,
  Frown,
  HelpCircle,
  AlertCircle,
  Target,
  Shuffle,
  Eye,
  EyeOff,
  X,
  Zap,
  Battery,
  Heart,
  Minus,
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

// State icons by category
const STATE_ICONS: Record<string, LucideIcon> = {
  // Neutral
  neutral: Minus,
  // Energy (low to high)
  drained: Battery,
  tired: Moon,
  calm: Cloud,
  rested: Sun,
  energized: Zap,
  // Emotion (negative to positive)
  frustrated: Frown,
  anxious: AlertCircle,
  uncertain: HelpCircle,
  content: Smile,
  grateful: Heart,
  // Tension (scattered to present)
  overwhelmed: CloudRain,
  distracted: EyeOff,
  scattered: Shuffle,
  focused: Target,
  present: Eye,
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

// =============================================================================
// STATE COLOR SYSTEM
// =============================================================================
// Three categories, each with distinct visual language:
// - Emotion: red → orange → yellow → lime → green (classic bad→good valence)
// - Energy: blue/cyan family (cool energy feel)
// - Tension/Focus: purple/violet family (mental clarity)
// =============================================================================

const STATE_COLORS: Record<string, string> = {
  // Neutral
  neutral: '#94a3b8', // slate-400
  // EMOTION category: red → orange → yellow → lime → green (classic bad→good)
  frustrated: '#ef4444', // red-500
  anxious: '#f97316', // orange-500
  uncertain: '#eab308', // yellow-500
  content: '#84cc16', // lime-500
  grateful: '#22c55e', // green-500

  // ENERGY category: indigo/cyan family (cool energy feel)
  // drained → tired → calm → rested → energized
  drained: '#6366f1', // indigo-500
  tired: '#818cf8', // indigo-400
  calm: '#a5b4fc', // indigo-300
  rested: '#38bdf8', // sky-400
  energized: '#22d3ee', // cyan-400

  // TENSION/FOCUS category: purple/violet family (mental clarity)
  // overwhelmed → distracted → scattered → focused → present
  overwhelmed: '#7c3aed', // violet-600
  distracted: '#9333ea', // purple-600
  scattered: '#a855f7', // purple-500
  focused: '#c084fc', // purple-400
  present: '#e879f9', // fuchsia-400
};

// States that need dark text for a11y contrast (light backgrounds)
const DARK_TEXT_STATES = new Set([
  'uncertain', // yellow-500
  'content', // lime-500
  'calm', // indigo-300 - light
  'rested', // sky-400 - light
  'energized', // cyan-400 - bright
  'focused', // purple-400
  'present', // fuchsia-400
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

  const containerTransition = useMemo(
    () => ({
      ...SPRING_TRANSITION,
      delay: groupIndex * 0.1,
    }),
    [groupIndex]
  );

  const size = isSelected ? 24 : 32;

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
      whileHover={{ scale: 1.15 }}
      transition={{ ...containerTransition, scale: { duration: 0.15 } }}
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
    >
      {/* State orb */}
      <div
        className="rounded-full"
        style={{
          background: color,
          width: size,
          height: size,
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

  const size = isGroupExpanded || hasSelectedMoment ? 24 : 44;

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
      whileHover={{ scale: hasSelectedMoment ? 0.55 : 1.1 }}
      transition={{ ...containerTransition, scale: { duration: 0.15 } }}
      onClick={(e) => {
        e.stopPropagation();
        onTap(e);
      }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Rotating gradient layer for multi-color orbs */}
        <motion.div
          className="rounded-full absolute inset-0"
          style={{
            ...orbStyle,
            opacity: isGroupExpanded || hasSelectedMoment ? 0.6 : 1,
            boxShadow:
              isGroupExpanded || hasSelectedMoment
                ? 'none'
                : `0 0 12px ${groupColors[0]}50`,
          }}
          animate={
            group.length > 1 && !isGroupExpanded && !hasSelectedMoment
              ? { rotate: 360 }
              : { rotate: 0 }
          }
          transition={
            group.length > 1 && !isGroupExpanded && !hasSelectedMoment
              ? { duration: 20, repeat: Infinity, ease: 'linear' }
              : { duration: 0.3 }
          }
        />
        {/* Badge stays fixed, not rotating */}
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
      {/* The orb */}
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

// Day Globe - Simplified Earth surface inside the arc
// Arc uses: center (100, 110), radius 90 - Earth overflows bottom with fade
interface DayGlobeProps {
  dayProgress: number;
  isExpanded: boolean;
  isDarkTheme?: boolean;
}

const DayGlobe = memo(function DayGlobe({
  isExpanded,
  isDarkTheme = true,
}: DayGlobeProps) {
  // Colors depend on theme only - simple, decorative
  let oceanColor: string;
  let landColor: string;

  if (isDarkTheme) {
    // Dark theme: visible ocean, subtle land
    oceanColor = `rgba(40, 100, 150, 0.2)`;
    landColor = `rgba(35, 60, 45, 0.5)`;
  } else {
    // Light theme: visible ocean, subtle land
    oceanColor = `rgba(100, 160, 200, 0.35)`;
    landColor = `rgba(180, 160, 130, 0.25)`;
  }

  // Earth geometry - fits within arc, only overflows at bottom
  // Arc goes from (10, 110) to (190, 110), so Earth should stay within x: 10-190
  const cx = 100;
  const cy = 110; // Slightly lower to not overlap arc at top
  const r = 88; // Smaller radius to not overlap arc

  // Decorative city lights - only shown on dark theme as ambient visual
  const cities = [
    // Spread across visible area
    { x: 45, y: 55, size: 1.2 },
    { x: 38, y: 62, size: 1.0 },
    { x: 52, y: 50, size: 0.9 },
    { x: 95, y: 48, size: 1.1 },
    { x: 102, y: 52, size: 0.9 },
    { x: 108, y: 46, size: 1.0 },
    { x: 135, y: 52, size: 1.3 },
    { x: 128, y: 58, size: 1.0 },
    { x: 142, y: 48, size: 0.8 },
    { x: 100, y: 70, size: 0.9 },
    { x: 55, y: 85, size: 1.0 },
    { x: 160, y: 80, size: 0.8 },
  ];

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: isExpanded ? 0.3 : 1,
      }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <svg
        viewBox="0 0 200 120"
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Vertical fade - solid at top, fades towards bottom */}
          <linearGradient id="earthFadeV" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="50%" stopColor="white" stopOpacity="1" />
            <stop offset="75%" stopColor="white" stopOpacity="0.6" />
            <stop offset="90%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          {/* Horizontal fade - solid in center, fades at edges */}
          <linearGradient id="earthFadeH" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="15%" stopColor="white" stopOpacity="0.5" />
            <stop offset="30%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="1" />
            <stop offset="85%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          {/* Clip path for Earth circle */}
          <clipPath id="earthClip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
          {/* Combined mask - multiply both gradients */}
          <mask id="earthMask">
            <rect
              x="0"
              y="0"
              width="200"
              height="130"
              fill="url(#earthFadeV)"
            />
          </mask>
          <mask id="earthMaskH">
            <rect
              x="0"
              y="0"
              width="200"
              height="130"
              fill="url(#earthFadeH)"
            />
          </mask>
        </defs>

        {/* Earth with fade mask - overflows at bottom */}
        <g mask="url(#earthMask)">
          <g mask="url(#earthMaskH)">
            {/* Ocean base */}
            <circle cx={cx} cy={cy} r={r} fill={oceanColor} />

            {/* Recognizable continents - simplified but identifiable */}
            {/* Positions adjusted for shifted Earth center */}
            {/* North America - moved right to avoid arc overlap */}
            <path
              d="M 35 60 L 43 47 L 57 43 L 65 50 L 60 60 L 67 65 L 63 75 L 53 77 L 45 70 L 40 63 Z"
              fill={landColor}
            />
            {/* Greenland */}
            <ellipse cx="70" cy="38" rx="9" ry="7" fill={landColor} />

            {/* Europe */}
            <path
              d="M 86 45 L 93 41 L 103 43 L 106 50 L 100 57 L 93 55 L 88 50 Z"
              fill={landColor}
            />

            {/* Africa */}
            <path
              d="M 93 60 L 106 57 L 116 63 L 118 80 L 110 95 L 98 93 L 93 80 L 90 67 Z"
              fill={landColor}
            />

            {/* Asia */}
            <path
              d="M 108 43 L 123 37 L 143 40 L 158 47 L 163 60 L 153 70 L 138 65 L 128 60 L 118 55 L 110 47 Z"
              fill={landColor}
            />

            {/* Australia */}
            <path
              d="M 150 83 L 165 80 L 172 87 L 168 97 L 155 100 L 148 93 Z"
              fill={landColor}
            />

            {/* South America */}
            <path
              d="M 50 83 L 58 77 L 66 83 L 63 97 L 53 105 L 46 100 L 48 90 Z"
              fill={landColor}
            />

            {/* Decorative city lights - only shown on dark theme */}
            {isDarkTheme &&
              cities.map((city, i) => (
                <g key={i}>
                  {/* Outer glow */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={city.size * 1.8}
                    fill="rgba(255, 200, 100, 0.15)"
                  />
                  {/* Inner bright point */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={city.size * 0.6}
                    fill="rgba(255, 250, 200, 0.6)"
                  />
                </g>
              ))}

            {/* Subtle atmosphere glow at edge */}
            {/* <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={
                isDarkTheme
                  ? `rgba(100, 160, 200, ${0.1 + dayness * 0.08})`
                  : `rgba(80, 140, 180, ${0.15 + dayness * 0.1})`
              }
              strokeWidth="2"
            /> */}
          </g>
        </g>
      </svg>
    </motion.div>
  );
});

// Current Time Halo - subtle indicator showing current position in the day
interface CurrentTimeHaloProps {
  progress: number; // 0-1 through the day
  isHidden: boolean;
}

const CurrentTimeHalo = memo(function CurrentTimeHalo({
  progress,
  isHidden,
}: CurrentTimeHaloProps) {
  // Calculate position on arc
  const pos = getArcPosition(progress);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${(pos.x / 200) * 100}%`,
        top: `${(pos.y / 120) * 100}%`,
        zIndex: 5,
      }}
      initial={{ opacity: 0, scale: 0.5, x: '-50%', y: '-50%' }}
      animate={{
        opacity: isHidden ? 0.3 : 1,
        scale: isHidden ? 0.7 : 1,
        x: '-50%',
        y: '-50%',
      }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
    >
      {/* Outer soft glow - breathing animation */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 24,
          height: 24,
          left: '50%',
          top: '50%',
          x: '-50%',
          y: '-50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Inner bright point */}
      <div
        className="relative rounded-full"
        style={{
          width: 8,
          height: 8,
          background:
            'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)',
          boxShadow: '0 0 8px rgba(255,255,255,0.5)',
        }}
      />
    </motion.div>
  );
});

interface CheckInHomeProps {
  initialOpenCheckIn?: boolean;
  onCheckInOpened?: () => void;
}

export function CheckInHome({
  initialOpenCheckIn,
  onCheckInOpened,
}: CheckInHomeProps) {
  const { t, language } = useI18n();
  const { colorTheme } = useSettingsStore();

  // Determine if current theme is dark
  const isDarkTheme = useMemo(() => {
    const theme = ALL_COLOR_THEMES.find((t) => t.value === colorTheme);
    return theme?.isDark ?? true;
  }, [colorTheme]);

  const {
    hydrated,
    getOrCreateToday,
    getDayByDate,
    setMorningExpectation,
    days,
    checkIns,
    getCheckInsForDay,
  } = useCheckInStore();

  const { states, contexts } = useOptionsStore();

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
  const [showRecapPanel, setShowRecapPanel] = useState(false);
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeUpdateTrigger, setTimeUpdateTrigger] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const isMobile = useIsMobile();
  const arcContainerRef = useRef<HTMLDivElement>(null);

  // Open check-in flow if triggered from onboarding
  useEffect(() => {
    if (initialOpenCheckIn && hydrated) {
      setViewMode('checkin');
      onCheckInOpened?.();
    }
  }, [initialOpenCheckIn, hydrated, onCheckInOpened]);

  // Update arc progress and current time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setTimeUpdateTrigger((t) => t + 1);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Date navigation
  const isToday = useMemo(() => {
    return getDateString(selectedDate) === getTodayDateString();
  }, [selectedDate]);

  // Check if at oldest allowed date (30 days back)
  const isAtOldestDate = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected.getTime() <= thirtyDaysAgo.getTime();
  }, [selectedDate]);

  const navigateDate = useCallback(
    (direction: -1 | 1) => {
      if (direction === 1 && isToday) return; // Can't go forward past today
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + direction);
      // Don't go past today
      if (newDate > new Date()) return;
      // Don't go back more than 30 days (sync with calendar panel)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      if (newDate < thirtyDaysAgo) return;
      trackDateNavigation(direction === -1 ? 'prev' : 'next');
      setSelectedDate(newDate);
      setExpandedGroupIndex(null);
      setSelectedMoment(null);
      setSelectedMomentGroupIndex(null);
    },
    [selectedDate, isToday]
  );

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

  // Arc progress for selected day (updates every minute via timeUpdateTrigger)
  const arcProgress = useMemo(() => {
    if (isToday) {
      return getDayProgress();
    }
    // For past days, show full arc
    return 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isToday, timeUpdateTrigger]);

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
            <SettingsButton />
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
          className="relative flex flex-col items-center gap-1 mb-6"
        >
          {/* Top row: Calendar + Today button */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                trackDateNavigation('calendar');
                setShowDatePicker(true);
              }}
              className="p-1.5 rounded-xl bg-primary/10 text-primary hover:scale-105 transition-all cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
            </button>
            {!isToday && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  trackDateSelect(0);
                  setSelectedDate(new Date());
                  setExpandedGroupIndex(null);
                  setSelectedMoment(null);
                  setSelectedMomentGroupIndex(null);
                }}
                className="px-2 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer text-xs font-medium text-primary"
              >
                {t('home.today')}
              </button>
            )}
          </div>

          {/* Date row with arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isAtOldestDate) navigateDate(-1);
              }}
              disabled={isAtOldestDate}
              className={`p-3 -m-1 rounded-full transition-colors ${
                isAtOldestDate
                  ? 'text-muted-foreground/20 cursor-default'
                  : 'hover:bg-muted/50 active:bg-muted cursor-pointer text-muted-foreground/70 hover:text-foreground'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <span className="text-lg font-medium min-w-[140px] text-center text-foreground">
              {formatDateNav(selectedDate, isToday, language)}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isToday) navigateDate(1);
              }}
              disabled={isToday}
              className={`p-3 -m-1 rounded-full transition-colors ${
                isToday
                  ? 'text-muted-foreground/20 cursor-default'
                  : 'hover:bg-muted/50 active:bg-muted cursor-pointer text-muted-foreground/70 hover:text-foreground'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Current time - always reserve space to prevent layout shift */}
          <span
            className={`text-sm h-5 ${
              isToday && currentTime ? 'text-muted-foreground' : 'invisible'
            }`}
          >
            {currentTime || '00:00'}
          </span>

          {/* Date Picker - inline for desktop, bottom sheet for mobile */}
          <DatePickerTimeline
            isOpen={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const selected = new Date(date);
              selected.setHours(0, 0, 0, 0);
              const daysFromToday = Math.round(
                (selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );
              trackDateSelect(daysFromToday);
              setSelectedDate(date);
              setExpandedGroupIndex(null);
              setSelectedMoment(null);
              setSelectedMomentGroupIndex(null);
            }}
            isMobile={isMobile}
          />
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

            {/* Day Globe - Earth visual, moments orbit above like satellites */}
            <DayGlobe
              dayProgress={getDayProgress()}
              isExpanded={!!selectedMoment || expandedGroupIndex !== null}
              isDarkTheme={isDarkTheme}
            />

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

            {/* Current time halo - subtle brightness indicator on arc, only for today */}
            {isToday && (
              <CurrentTimeHalo
                progress={getDayProgress()}
                isHidden={!!selectedMoment || expandedGroupIndex !== null}
              />
            )}

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
                  const Icon =
                    STATE_ICONS[selectedMoment.stateId] || HelpCircle;
                  const stateLabel = state
                    ? t(`state.${state.id}` as TranslationKey) || state.label
                    : '';
                  const contextLabel = context
                    ? context.isDefault
                      ? t(`context.${context.id}` as TranslationKey) ||
                        context.label
                      : context.label
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

                    {/* View day recap - primary for past days, secondary for today */}
                    {selectedDayCheckIns.length > 0 &&
                      (!isToday || getDayProgress() >= 0.5) && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            trackDayRecapOpen(selectedDayCheckIns.length);
                            setShowRecapPanel(true);
                          }}
                          className={`flex items-center gap-2 rounded-full font-medium cursor-pointer transition-colors ${
                            isToday
                              ? 'px-4 py-2 bg-muted/60 border border-muted-foreground/20 text-foreground hover:bg-muted hover:border-muted-foreground/30 text-sm'
                              : 'px-5 py-2.5 bg-primary text-primary-foreground text-sm shadow-lg'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            className={`rounded-full ${
                              isToday ? 'w-3 h-3' : 'w-4 h-4'
                            }`}
                            style={{
                              background:
                                generateMoodGradient(selectedDayCheckIns),
                              boxShadow: `0 0 ${
                                isToday ? '6px' : '8px'
                              } ${generateMoodGradient(selectedDayCheckIns)}`,
                            }}
                          />
                          <span>
                            {isToday
                              ? t('home.seeReflection')
                              : t('home.seeDayRecap')}
                          </span>
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

        {/* Insights button with rotating intriguing labels */}
        <InsightsButton
          onClick={() => {
            trackInsightsOpen();
            setShowInsightsPanel(true);
          }}
        />
      </div>

      {/* Footer */}
      <div className="shrink-0 px-6">
        <AppFooter showLogo={false} />
      </div>

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
              onClick={() => {
                trackDayRecapClose();
                setShowRecapPanel(false);
              }}
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
                    {isToday ? t('home.seeReflection') : t('home.seeDayRecap')}
                  </h2>
                  <button
                    onClick={() => {
                      trackDayRecapClose();
                      setShowRecapPanel(false);
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 pb-8 max-h-[calc(85vh-80px)]">
                  <DayRecap
                    day={selectedDay}
                    checkIns={selectedDayCheckIns}
                    isToday={isToday}
                  />
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
                    {isToday ? t('home.seeReflection') : t('home.seeDayRecap')}
                  </h2>
                  <button
                    onClick={() => {
                      trackDayRecapClose();
                      setShowRecapPanel(false);
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 py-4 max-h-[calc(80vh-80px)]">
                  <DayRecap
                    day={selectedDay}
                    checkIns={selectedDayCheckIns}
                    isToday={isToday}
                  />
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
              onClick={() => {
                trackInsightsClose();
                setShowInsightsPanel(false);
              }}
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
                  <h2 className="text-xl font-semibold">
                    {t('insights.title')}
                  </h2>
                  <button
                    onClick={() => {
                      trackInsightsClose();
                      setShowInsightsPanel(false);
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
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
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <h2 className="text-xl font-semibold">
                    {t('insights.title')}
                  </h2>
                  <button
                    onClick={() => {
                      trackInsightsClose();
                      setShowInsightsPanel(false);
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
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

// Rotating button labels - curiosity-driven
const INSIGHTS_BUTTON_COUNT = 3;

// Insights button with rotating intriguing labels
function InsightsButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  // Pick random initial label
  const [labelIndex, setLabelIndex] = useState(() =>
    Math.floor(Math.random() * INSIGHTS_BUTTON_COUNT)
  );

  // Rotate every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % INSIGHTS_BUTTON_COUNT);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const label =
    t(`insights.button.${labelIndex}` as TranslationKey) || 'See patterns?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
      className="mt-8 text-center"
    >
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 border border-violet-500/20 text-foreground/90 hover:from-violet-500/20 hover:via-fuchsia-500/20 hover:to-pink-500/20 hover:border-violet-500/30 transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Subtle animated glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-pink-500/5 blur-lg"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <Sparkles className="relative h-4 w-4 text-violet-400 group-hover:text-violet-300 transition-colors" />
        <span className="relative text-sm font-medium">{label}</span>
      </motion.button>
    </motion.div>
  );
}

// Positive states for mood scoring
const POSITIVE_STATES = new Set([
  'grateful',
  'content',
  'energized',
  'calm',
  'focused',
  'present',
]);
const NEGATIVE_STATES = new Set([
  'frustrated',
  'anxious',
  'drained',
  'tired',
  'scattered',
  'distracted',
]);

// Insight thresholds: more moments = more/better insights
// 4 moments = 1 insight, 8 = 2, 12 = 3, 18 = 4, 25+ = 5 insights
const INSIGHT_THRESHOLDS = [4, 8, 12, 18, 25] as const;

// Insight type - stores text and data for rendering
interface DynamicInsight {
  type:
    | 'contextState'
    | 'personState'
    | 'timeComparison'
    | 'weekTrend'
    | 'generic';
  text: string;
  icon?: 'context' | 'person' | 'time' | 'trend' | 'sparkle';
  color?: string;
  // Highlighted parts for rich rendering
  highlightedParts?: {
    subject?: string; // context/person name
    subjectColor?: string;
    result?: string; // state/outcome
    resultColor?: string;
  };
}

// Insights panel content - Progressive insights based on moment count
function InsightsPanelContent() {
  const { t, language } = useI18n();
  const { days, checkIns } = useCheckInStore();
  const { states, contexts, people } = useOptionsStore();

  // Get all data from last 30 days (we'll use all available data)
  const allData = useMemo(() => {
    const result = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = getDateString(date);
      const day = days.find((d) => d.date === dateStr);
      const dayCheckIns = day ? checkIns.filter((c) => c.dayId === day.id) : [];
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      result.push({
        date,
        dateStr,
        day,
        checkIns: dayCheckIns,
        isToday: i === 0,
        isWeekend,
      });
    }
    return result;
  }, [days, checkIns]);

  const totalMoments = allData.reduce((sum, d) => sum + d.checkIns.length, 0);

  // Calculate how many insights to show based on moments
  // 4 = 1, 8 = 2, 12 = 3, 18 = 4, 25+ = 5 insights
  const maxInsightsToShow =
    totalMoments >= INSIGHT_THRESHOLDS[4]
      ? 5
      : totalMoments >= INSIGHT_THRESHOLDS[3]
      ? 4
      : totalMoments >= INSIGHT_THRESHOLDS[2]
      ? 3
      : totalMoments >= INSIGHT_THRESHOLDS[1]
      ? 2
      : totalMoments >= INSIGHT_THRESHOLDS[0]
      ? 1
      : 0;

  // Next threshold to unlock more insights
  const nextThreshold =
    totalMoments < INSIGHT_THRESHOLDS[0]
      ? INSIGHT_THRESHOLDS[0]
      : totalMoments < INSIGHT_THRESHOLDS[1]
      ? INSIGHT_THRESHOLDS[1]
      : totalMoments < INSIGHT_THRESHOLDS[2]
      ? INSIGHT_THRESHOLDS[2]
      : totalMoments < INSIGHT_THRESHOLDS[3]
      ? INSIGHT_THRESHOLDS[3]
      : totalMoments < INSIGHT_THRESHOLDS[4]
      ? INSIGHT_THRESHOLDS[4]
      : null;

  const momentsToNextInsight = nextThreshold ? nextThreshold - totalMoments : 0;

  // Generate REAL dynamic insights from actual data
  const insights = useMemo((): DynamicInsight[] => {
    if (maxInsightsToShow === 0) return [];

    // Helper to get insight-specific state form (noun form that works after "brings"/"приносит")
    const getInsightStateLabel = (stateId: string) => {
      // First try insight-specific form
      const insightForm = t(`insights.state.${stateId}` as TranslationKey);
      if (insightForm && insightForm !== `insights.state.${stateId}`) {
        return insightForm;
      }
      // Fallback to regular state label
      const state = states.find((s) => s.id === stateId);
      return state
        ? t(`state.${state.id}` as TranslationKey) || state.label
        : stateId;
    };

    // Helper to get translated context label
    const getContextLabel = (contextId: string) => {
      const context = contexts.find((c) => c.id === contextId);
      if (!context) return contextId;
      // Use translation for default contexts, label for custom ones
      if (context.isDefault) {
        return t(`context.${context.id}` as TranslationKey) || context.label;
      }
      return context.label;
    };

    // Helper to get person label for insights (uses instrumental case in Russian)
    const getInsightPersonLabel = (personId: string) => {
      const person = people.find((p) => p.id === personId);
      if (!person) return personId;
      // Use insight-specific translation for default people (instrumental case in Russian)
      if (person.isDefault) {
        return (
          t(`insights.person.${person.id}` as TranslationKey) ||
          t(`person.${person.label.toLowerCase()}` as TranslationKey) ||
          person.label
        );
      }
      return person.label;
    };

    const allCheckIns = allData.flatMap((d) => d.checkIns);
    const detected: DynamicInsight[] = [];

    // 1. Find context → state correlations (the main insight type user wants)
    // Group check-ins by context and find dominant state for each
    const contextGroups = new Map<
      string,
      {
        positive: number;
        negative: number;
        total: number;
        dominantState: string;
      }
    >();

    allCheckIns.forEach((c) => {
      if (!c.contextId) return;
      const group = contextGroups.get(c.contextId) || {
        positive: 0,
        negative: 0,
        total: 0,
        dominantState: '',
      };
      group.total++;
      if (POSITIVE_STATES.has(c.stateId)) group.positive++;
      if (NEGATIVE_STATES.has(c.stateId)) group.negative++;
      contextGroups.set(c.contextId, group);
    });

    // Find contexts with clear patterns (at least 2 check-ins)
    contextGroups.forEach((group, contextId) => {
      if (group.total < 2) return;

      // Find the most common state for this context
      const statesInContext = allCheckIns
        .filter((c) => c.contextId === contextId)
        .map((c) => c.stateId);

      const stateCount = new Map<string, number>();
      statesInContext.forEach((s) =>
        stateCount.set(s, (stateCount.get(s) || 0) + 1)
      );

      let dominantState = '';
      let maxCount = 0;
      stateCount.forEach((count, stateId) => {
        if (count > maxCount) {
          maxCount = count;
          dominantState = stateId;
        }
      });

      // Only show if dominant state appears in at least 50% of check-ins for this context
      if (dominantState && maxCount >= group.total * 0.5) {
        const contextLabel = getContextLabel(contextId);
        const stateLabel = getInsightStateLabel(dominantState);
        const stateColor = STATE_COLORS[dominantState] || '#94a3b8';
        const context = contexts.find((c) => c.id === contextId);
        const contextColor = context ? '#60a5fa' : '#94a3b8'; // blue for context

        detected.push({
          type: 'contextState',
          text:
            t('insights.contextMakesState', {
              context: contextLabel,
              state: stateLabel,
            }) || `${contextLabel} → often ${stateLabel}`,
          icon: 'context',
          color: stateColor,
          highlightedParts: {
            subject: contextLabel,
            subjectColor: contextColor,
            result: stateLabel,
            resultColor: stateColor,
          },
        });
      }
    });

    // 2. Find person → state correlations
    const personGroups = new Map<string, string[]>();
    allCheckIns.forEach((c) => {
      if (!c.personId) return;
      const states = personGroups.get(c.personId) || [];
      states.push(c.stateId);
      personGroups.set(c.personId, states);
    });

    personGroups.forEach((stateIds, personId) => {
      if (stateIds.length < 2) return;

      const stateCount = new Map<string, number>();
      stateIds.forEach((s) => stateCount.set(s, (stateCount.get(s) || 0) + 1));

      let dominantState = '';
      let maxCount = 0;
      stateCount.forEach((count, stateId) => {
        if (count > maxCount) {
          maxCount = count;
          dominantState = stateId;
        }
      });

      if (dominantState && maxCount >= stateIds.length * 0.5) {
        const personLabel = getInsightPersonLabel(personId);
        const stateLabel = getInsightStateLabel(dominantState);
        const stateColor = STATE_COLORS[dominantState] || '#94a3b8';
        const personColor = '#f472b6'; // pink for people

        detected.push({
          type: 'personState',
          text:
            t('insights.personMakesState', {
              person: personLabel,
              state: stateLabel,
            }) || `With ${personLabel} → ${stateLabel}`,
          icon: 'person',
          color: stateColor,
          highlightedParts: {
            subject: personLabel,
            subjectColor: personColor,
            result: stateLabel,
            resultColor: stateColor,
          },
        });
      }
    });

    // 3. Morning vs evening comparison
    const morningCheckIns = allCheckIns.filter((c) => {
      const hour = new Date(c.timestamp).getHours();
      return hour >= 5 && hour < 12;
    });
    const eveningCheckIns = allCheckIns.filter((c) => {
      const hour = new Date(c.timestamp).getHours();
      return hour >= 17 && hour < 24;
    });

    if (morningCheckIns.length >= 2 && eveningCheckIns.length >= 2) {
      const morningPositive =
        morningCheckIns.filter((c) => POSITIVE_STATES.has(c.stateId)).length /
        morningCheckIns.length;
      const eveningPositive =
        eveningCheckIns.filter((c) => POSITIVE_STATES.has(c.stateId)).length /
        eveningCheckIns.length;

      if (morningPositive > eveningPositive + 0.25) {
        const comparison = t('insights.comparison.better') || 'better';
        detected.push({
          type: 'timeComparison',
          text:
            t('insights.morningVsEvening', { comparison }) ||
            `Mornings feel ${comparison} than evenings`,
          icon: 'time',
          color: '#f97316', // orange - morning
        });
      } else if (eveningPositive > morningPositive + 0.25) {
        const comparison = t('insights.comparison.better') || 'better';
        detected.push({
          type: 'timeComparison',
          text:
            t('insights.eveningVsMorning', { comparison }) ||
            `Evenings feel ${comparison} than mornings`,
          icon: 'time',
          color: '#c084fc', // purple - evening
        });
      }
    }

    // 4. Weekend boost
    const weekdayCheckIns = allData
      .filter((d) => !d.isWeekend)
      .flatMap((d) => d.checkIns);
    const weekendCheckIns = allData
      .filter((d) => d.isWeekend)
      .flatMap((d) => d.checkIns);

    if (weekdayCheckIns.length >= 3 && weekendCheckIns.length >= 2) {
      const weekdayPositive =
        weekdayCheckIns.filter((c) => POSITIVE_STATES.has(c.stateId)).length /
        weekdayCheckIns.length;
      const weekendPositive =
        weekendCheckIns.filter((c) => POSITIVE_STATES.has(c.stateId)).length /
        weekendCheckIns.length;

      if (weekendPositive > weekdayPositive + 0.25) {
        detected.push({
          type: 'generic',
          text: t('insights.weekendBoost') || 'Weekends lift your mood',
          icon: 'sparkle',
          color: '#22c55e', // green - positive
        });
      }
    }

    // 5. Week trend (recent vs earlier)
    const recentCheckIns = allData.slice(-3).flatMap((d) => d.checkIns);
    const earlierCheckIns = allData.slice(0, -3).flatMap((d) => d.checkIns);

    if (recentCheckIns.length >= 3 && earlierCheckIns.length >= 3) {
      const recentPositive =
        recentCheckIns.filter((c) => POSITIVE_STATES.has(c.stateId)).length /
        recentCheckIns.length;
      const earlierPositive =
        earlierCheckIns.filter((c) => POSITIVE_STATES.has(c.stateId)).length /
        earlierCheckIns.length;

      if (recentPositive > earlierPositive + 0.2) {
        detected.push({
          type: 'weekTrend',
          text: t('insights.betterRecently') || 'Things are looking up lately',
          icon: 'trend',
          color: '#22c55e', // green - positive
        });
      } else if (earlierPositive > recentPositive + 0.2) {
        detected.push({
          type: 'weekTrend',
          text: t('insights.harderRecently') || 'This week has been heavier',
          icon: 'trend',
          color: '#ef4444', // red - harder
        });
      }
    }

    // 6. Energy consistency
    const uniqueStates = new Set(allCheckIns.map((c) => c.stateId)).size;
    if (uniqueStates <= 3 && allCheckIns.length >= 5) {
      detected.push({
        type: 'generic',
        text: t('insights.steadyWeek') || 'Your energy has been steady',
        icon: 'sparkle',
        color: '#38bdf8', // blue - calm
      });
    } else if (uniqueStates >= 6 && allCheckIns.length >= 6) {
      detected.push({
        type: 'generic',
        text: t('insights.variedWeek') || 'A week of ups and downs',
        icon: 'sparkle',
        color: '#a855f7', // purple - varied
      });
    }

    // Prioritize: context/person insights first, then time, then generic
    detected.sort((a, b) => {
      const priority: Record<string, number> = {
        contextState: 0,
        personState: 1,
        timeComparison: 2,
        weekTrend: 3,
        generic: 4,
      };
      return priority[a.type] - priority[b.type];
    });

    return detected.slice(0, 5); // Max 5 insights
  }, [allData, maxInsightsToShow, states, contexts, people, t]);

  // Get icon component for insight type
  const getInsightIcon = (insight: DynamicInsight) => {
    const iconClass = 'h-5 w-5 shrink-0';
    // Use subject color for context/person icons, otherwise use the main color
    const iconColor = insight.highlightedParts?.subjectColor || insight.color;
    const style = iconColor ? { color: iconColor } : undefined;

    switch (insight.icon) {
      case 'context':
        return <Activity className={iconClass} style={style} />;
      case 'person':
        return <Smile className={iconClass} style={style} />;
      case 'time':
        return <Sun className={iconClass} style={style} />;
      case 'trend':
        return <Zap className={iconClass} style={style} />;
      case 'sparkle':
      default:
        return <Sparkles className={iconClass} style={style} />;
    }
  };

  // Render insight text with highlighted parts
  const renderInsightText = (insight: DynamicInsight) => {
    const { text, highlightedParts } = insight;

    if (
      !highlightedParts ||
      (!highlightedParts.subject && !highlightedParts.result)
    ) {
      return text;
    }

    // Replace subject and result with highlighted spans
    const parts: React.ReactNode[] = [];
    let remainingText = text;

    // Find and highlight subject
    if (highlightedParts.subject) {
      const subjectIndex = remainingText.indexOf(highlightedParts.subject);
      if (subjectIndex !== -1) {
        if (subjectIndex > 0) {
          parts.push(remainingText.slice(0, subjectIndex));
        }
        parts.push(
          <span
            key="subject"
            className="font-semibold"
            style={{ color: highlightedParts.subjectColor }}
          >
            {highlightedParts.subject}
          </span>
        );
        remainingText = remainingText.slice(
          subjectIndex + highlightedParts.subject.length
        );
      }
    }

    // Find and highlight result
    if (highlightedParts.result) {
      const resultIndex = remainingText.indexOf(highlightedParts.result);
      if (resultIndex !== -1) {
        if (resultIndex > 0) {
          parts.push(remainingText.slice(0, resultIndex));
        }
        parts.push(
          <span
            key="result"
            className="font-semibold"
            style={{ color: highlightedParts.resultColor }}
          >
            {highlightedParts.result}
          </span>
        );
        remainingText = remainingText.slice(
          resultIndex + highlightedParts.result.length
        );
      }
    }

    // Add remaining text
    if (remainingText) {
      parts.push(remainingText);
    }

    return parts.length > 0 ? parts : text;
  };

  // Render example insight text with multiple highlighted words
  const renderExampleInsight = (
    text: string,
    highlights: { word: string; color: string }[]
  ): React.ReactNode => {
    if (!highlights.length) return text;

    const parts: React.ReactNode[] = [];
    let remainingText = text;
    let keyIndex = 0;

    // Sort highlights by their position in text to process in order
    const sortedHighlights = [...highlights].sort((a, b) => {
      const posA = text.toLowerCase().indexOf(a.word.toLowerCase());
      const posB = text.toLowerCase().indexOf(b.word.toLowerCase());
      return posA - posB;
    });

    for (const highlight of sortedHighlights) {
      const lowerRemaining = remainingText.toLowerCase();
      const lowerWord = highlight.word.toLowerCase();
      const index = lowerRemaining.indexOf(lowerWord);

      if (index !== -1) {
        // Add text before the highlight
        if (index > 0) {
          parts.push(remainingText.slice(0, index));
        }
        // Add the highlighted word (preserve original case from text)
        const actualWord = remainingText.slice(
          index,
          index + highlight.word.length
        );
        parts.push(
          <span
            key={`highlight-${keyIndex++}`}
            className="font-semibold not-italic"
            style={{ color: highlight.color }}
          >
            {actualWord}
          </span>
        );
        remainingText = remainingText.slice(index + highlight.word.length);
      }
    }

    // Add any remaining text
    if (remainingText) {
      parts.push(remainingText);
    }

    return parts.length > 0 ? parts : text;
  };

  // Limit insights based on moment count
  const visibleInsights = insights.slice(0, maxInsightsToShow);

  // Examples to show (only show examples that don't have a real insight yet)
  const exampleTypes = ['context', 'person', 'time'] as const;
  const coveredTypes = new Set(
    visibleInsights.map((i) =>
      i.type === 'contextState'
        ? 'context'
        : i.type === 'personState'
        ? 'person'
        : 'time'
    )
  );
  const remainingExamples = exampleTypes.filter((t) => !coveredTypes.has(t));

  return (
    <div className="flex flex-col py-2">
      {/* Progress indicator - moments count */}
      {totalMoments > 0 && (
        <div className="mb-4 px-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground/60 mb-2">
            <span>{t('insights.momentCount', { count: totalMoments })}</span>
            {momentsToNextInsight > 0 && maxInsightsToShow < 5 && (
              <span>
                {t('insights.toNext', { count: momentsToNextInsight })}
              </span>
            )}
          </div>
          {/* Progress bar showing insight unlocks */}
          <div className="flex gap-1">
            {INSIGHT_THRESHOLDS.map((threshold, i) => (
              <div
                key={threshold}
                className="flex-1 h-1 rounded-full overflow-hidden bg-muted/30"
              >
                <motion.div
                  className="h-full bg-foreground/60"
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      totalMoments >= threshold
                        ? '100%'
                        : i === 0
                        ? `${(totalMoments / threshold) * 100}%`
                        : totalMoments >= INSIGHT_THRESHOLDS[i - 1]
                        ? `${
                            ((totalMoments - INSIGHT_THRESHOLDS[i - 1]) /
                              (threshold - INSIGHT_THRESHOLDS[i - 1])) *
                            100
                          }%`
                        : '0%',
                  }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real insights first */}
      {visibleInsights.length > 0 && (
        <div className="space-y-3 mb-4">
          {visibleInsights.map((insight, i) => (
            <motion.div
              key={`${insight.type}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-muted"
            >
              <div
                className="mt-0.5 p-1.5 rounded-lg"
                style={{
                  backgroundColor: `${
                    insight.highlightedParts?.subjectColor || insight.color
                  }15`,
                }}
              >
                {getInsightIcon(insight)}
              </div>
              <p className="text-base text-foreground leading-relaxed pt-0.5">
                {renderInsightText(insight)}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Examples for what's coming (only show uncovered types) */}
      {remainingExamples.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-2">
            {t('insights.examplesTitle')}
          </p>

          {remainingExamples.includes('context') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: visibleInsights.length * 0.1 + 0.2 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-muted/50"
            >
              <div
                className="mt-0.5 p-1.5 rounded-lg"
                style={{ backgroundColor: '#60a5fa15' }}
              >
                <Activity className="h-4 w-4" style={{ color: '#60a5fa' }} />
              </div>
              <p className="text-sm text-muted-foreground/80 leading-relaxed italic pt-0.5">
                {renderExampleInsight(
                  t('insights.example.1' as TranslationKey),
                  language === 'ru'
                    ? [
                        { word: 'работы', color: '#60a5fa' },
                        { word: 'дома', color: '#60a5fa' },
                      ]
                    : [
                        { word: 'work', color: '#60a5fa' },
                        { word: 'home', color: '#60a5fa' },
                      ]
                )}
              </p>
            </motion.div>
          )}

          {remainingExamples.includes('person') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: visibleInsights.length * 0.1 + 0.3 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-muted/50"
            >
              <div
                className="mt-0.5 p-1.5 rounded-lg"
                style={{ backgroundColor: '#f472b615' }}
              >
                <Smile className="h-4 w-4" style={{ color: '#f472b6' }} />
              </div>
              <p className="text-sm text-muted-foreground/80 leading-relaxed italic pt-0.5">
                {renderExampleInsight(
                  t('insights.example.2' as TranslationKey),
                  language === 'ru'
                    ? [{ word: 'друзьями', color: '#f472b6' }]
                    : [{ word: 'friends', color: '#f472b6' }]
                )}
              </p>
            </motion.div>
          )}

          {remainingExamples.includes('time') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: visibleInsights.length * 0.1 + 0.4 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-muted/50"
            >
              <div
                className="mt-0.5 p-1.5 rounded-lg"
                style={{ backgroundColor: '#f9731615' }}
              >
                <Sun className="h-4 w-4" style={{ color: '#f97316' }} />
              </div>
              <p className="text-sm text-muted-foreground/80 leading-relaxed italic pt-0.5">
                {renderExampleInsight(
                  t('insights.example.3' as TranslationKey),
                  language === 'ru'
                    ? [
                        { word: 'Утром', color: '#f97316' },
                        { word: 'вечеру', color: '#f97316' },
                      ]
                    : [
                        { word: 'Morning', color: '#f97316' },
                        { word: 'evening', color: '#f97316' },
                      ]
                )}
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Empty state message */}
      {totalMoments === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted-foreground/50 pt-3 text-center"
        >
          {t('insights.emptyNoDays' as TranslationKey) ||
            'Start tracking moments to see patterns'}
        </motion.p>
      )}

      {/* Progress message when have some data but not max insights */}
      {totalMoments > 0 && maxInsightsToShow < 5 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground/40 pt-3 text-center"
        >
          {t('insights.moreToUnlock' as TranslationKey) ||
            'More moments reveal deeper patterns'}
        </motion.p>
      )}
    </div>
  );
}
