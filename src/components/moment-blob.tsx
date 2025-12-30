'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckIn, getStateById, StateCategory } from '@/lib/types';
import { useOptionsStore } from '@/lib/options-store';
import { useI18n } from '@/lib/i18n';
import {
  Sun,
  CloudSun,
  Moon,
  CloudRain,
  Smile,
  AlertCircle,
  ThumbsDown,
  Sparkles,
  HelpCircle,
  Target,
  Shuffle,
  Eye,
  EyeOff,
  Minus,
  Meh,
  type LucideIcon,
} from 'lucide-react';

// Icons matching state-selector.tsx exactly
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

// State-specific colors using red→green gradient like app logo
// Bad states: red/orange, Neutral: gray, Good states: lime/green/emerald
const STATE_COLORS: Record<string, { bg: string; text: string; glow: string }> =
  {
    // Neutral - gray
    neutral: {
      bg: 'bg-slate-400/80',
      text: 'text-white',
      glow: 'rgba(148, 163, 184, 0.3)',
    },
    // Energy: drained(red) → tired(orange) → calm(lime) → energized(green)
    drained: {
      bg: 'bg-red-400',
      text: 'text-white',
      glow: 'rgba(248, 113, 113, 0.4)',
    },
    tired: {
      bg: 'bg-orange-400',
      text: 'text-white',
      glow: 'rgba(251, 146, 60, 0.4)',
    },
    calm: {
      bg: 'bg-lime-500',
      text: 'text-white',
      glow: 'rgba(132, 204, 22, 0.4)',
    },
    energized: {
      bg: 'bg-green-500',
      text: 'text-white',
      glow: 'rgba(34, 197, 94, 0.4)',
    },
    // Emotion: frustrated(red) → anxious(orange) → uncertain(amber) → content(lime) → grateful(green)
    frustrated: {
      bg: 'bg-red-500',
      text: 'text-white',
      glow: 'rgba(239, 68, 68, 0.4)',
    },
    anxious: {
      bg: 'bg-orange-500',
      text: 'text-white',
      glow: 'rgba(249, 115, 22, 0.4)',
    },
    uncertain: {
      bg: 'bg-amber-400',
      text: 'text-white',
      glow: 'rgba(251, 191, 36, 0.4)',
    },
    content: {
      bg: 'bg-lime-400',
      text: 'text-white',
      glow: 'rgba(163, 230, 53, 0.4)',
    },
    grateful: {
      bg: 'bg-emerald-500',
      text: 'text-white',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
    // Tension: scattered(red) → distracted(orange) → focused(lime) → present(green)
    scattered: {
      bg: 'bg-red-400',
      text: 'text-white',
      glow: 'rgba(248, 113, 113, 0.4)',
    },
    distracted: {
      bg: 'bg-orange-400',
      text: 'text-white',
      glow: 'rgba(251, 146, 60, 0.4)',
    },
    focused: {
      bg: 'bg-lime-500',
      text: 'text-white',
      glow: 'rgba(132, 204, 22, 0.4)',
    },
    present: {
      bg: 'bg-green-500',
      text: 'text-white',
      glow: 'rgba(34, 197, 94, 0.4)',
    },
  };

const DEFAULT_COLORS = {
  bg: 'bg-slate-400/80',
  text: 'text-white',
  glow: 'rgba(148, 163, 184, 0.3)',
};

// RGB colors for gradient generation
const STATE_RGB_COLORS: Record<string, string> = {
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

// Generate a smooth radial/linear gradient string from check-ins (blob-like, not sectored)
export function generateMoodGradient(checkIns: CheckIn[]): string {
  if (checkIns.length === 0) return 'radial-gradient(circle, #94a3b8, #94a3b8)';
  if (checkIns.length === 1) {
    const color = STATE_RGB_COLORS[checkIns[0].stateId] || '#94a3b8';
    return `radial-gradient(circle, ${color}, ${color})`;
  }

  // Count occurrences of each state for weighted gradient
  const stateCount = new Map<string, number>();
  checkIns.forEach((c) => {
    stateCount.set(c.stateId, (stateCount.get(c.stateId) || 0) + 1);
  });

  // Sort by count (dominant first) then create gradient stops
  const sortedStates = Array.from(stateCount.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  // Get unique colors
  const colors = sortedStates.map(
    ([stateId]) => STATE_RGB_COLORS[stateId] || '#94a3b8'
  );

  // Create smooth radial gradient with colors blending from center outward
  // Dominant color in center, others blend outward
  if (colors.length === 1) {
    return `radial-gradient(circle, ${colors[0]}, ${colors[0]})`;
  }

  if (colors.length === 2) {
    return `radial-gradient(circle at 30% 30%, ${colors[0]} 0%, ${colors[1]} 100%)`;
  }

  // For 3+ colors, create a mesh-like gradient using multiple radial gradients
  // Use the top colors weighted by frequency
  const topColors = colors.slice(0, 4);

  if (topColors.length === 3) {
    return `radial-gradient(circle at 25% 25%, ${topColors[0]}dd 0%, transparent 50%),
            radial-gradient(circle at 75% 25%, ${topColors[1]}dd 0%, transparent 50%),
            radial-gradient(circle at 50% 75%, ${topColors[2]}dd 0%, transparent 50%),
            radial-gradient(circle, ${topColors[0]}88 0%, ${topColors[1]}88 50%, ${topColors[2]}88 100%)`;
  }

  // 4+ colors
  return `radial-gradient(circle at 20% 20%, ${
    topColors[0]
  }dd 0%, transparent 45%),
          radial-gradient(circle at 80% 20%, ${
            topColors[1]
          }dd 0%, transparent 45%),
          radial-gradient(circle at 20% 80%, ${
            topColors[2] || topColors[0]
          }dd 0%, transparent 45%),
          radial-gradient(circle at 80% 80%, ${
            topColors[3] || topColors[1]
          }dd 0%, transparent 45%),
          radial-gradient(circle, ${topColors[0]}66 0%, ${
    topColors[1]
  }66 33%, ${topColors[2] || topColors[0]}66 66%, ${
    topColors[3] || topColors[1]
  }66 100%)`;
}

// Get dominant color from check-ins
export function getDominantColor(checkIns: CheckIn[]): string {
  if (checkIns.length === 0) return '#94a3b8';

  const stateCount = new Map<string, number>();
  checkIns.forEach((c) => {
    stateCount.set(c.stateId, (stateCount.get(c.stateId) || 0) + 1);
  });

  let maxCount = 0;
  let dominantState = checkIns[0].stateId;
  stateCount.forEach((count, stateId) => {
    if (count > maxCount) {
      maxCount = count;
      dominantState = stateId;
    }
  });

  return STATE_RGB_COLORS[dominantState] || '#94a3b8';
}

// Large sizes to fill available space - responsive to count
// Desktop sizes are larger (1.15x)
function getOrbSize(index: number, total: number, isDesktop = false): number {
  const scale = isDesktop ? 1.15 : 1;
  if (total === 1) return Math.round(180 * scale); // Single orb: very prominent
  if (total === 2) return Math.round(140 * scale); // Two orbs: large
  if (total === 3) return Math.round(115 * scale); // Three orbs: good size
  if (total === 4) return Math.round(120 * scale); // Four orbs: 2x2 grid - big!
  if (total === 5) return Math.round(100 * scale); // Five orbs
  if (total === 6) return Math.round(95 * scale); // Six orbs: 2x3 grid
  if (total <= 8) return Math.round(80 * scale); // 7-8 orbs
  // 9+ orbs: still reasonable size
  return Math.round(68 * scale);
}

// Hook to detect desktop
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return isDesktop;
}

// Floating animation patterns - different for each orb
function getFloatAnimation(index: number) {
  const patterns = [
    { y: [-3, 3, -3], x: [2, -2, 2], duration: 4 },
    { y: [4, -4, 4], x: [-3, 3, -3], duration: 5 },
    { y: [-2, 4, -2], x: [3, -1, 3], duration: 4.5 },
    { y: [3, -3, 3], x: [-2, 2, -2], duration: 5.5 },
    { y: [-4, 2, -4], x: [1, -3, 1], duration: 4.2 },
  ];
  return patterns[index % patterns.length];
}

interface MomentOrbProps {
  checkIn: CheckIn;
  index: number;
  total: number;
  onTap?: () => void;
  isExpanded?: boolean;
  hasExpandedSibling?: boolean; // true when another orb is expanded
  isDesktop?: boolean;
}

function MomentOrb({
  checkIn,
  index,
  total,
  onTap,
  isExpanded,
  hasExpandedSibling,
  isDesktop,
}: MomentOrbProps) {
  const { t, language } = useI18n();
  const { states, contexts } = useOptionsStore();

  const state = getStateById(checkIn.stateId, states);
  const context = contexts.find((c) => c.id === checkIn.contextId);

  const Icon = STATE_ICONS[checkIn.stateId] || Meh;
  const colors = STATE_COLORS[checkIn.stateId] || DEFAULT_COLORS;

  const time = new Date(checkIn.timestamp).toLocaleTimeString(
    language === 'ru' ? 'ru-RU' : 'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
    }
  );

  const stateLabel = state ? t(`state.${state.id}` as any) || state.label : '';
  const contextLabel = context
    ? t(`context.${context.id}` as any) || context.label
    : '';

  const baseSize = getOrbSize(index, total, isDesktop);
  // Keep normal size always, only expanded orb grows
  const collapsedSize = baseSize;
  const expandedSize = 160;
  const iconSize = Math.round(collapsedSize * 0.4);
  const floatAnim = getFloatAnimation(index);

  const springConfig = { type: 'spring' as const, stiffness: 260, damping: 26 };

  return (
    <motion.div
      className="relative"
      style={{ zIndex: isExpanded ? 50 : 1 }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: isExpanded ? 0 : floatAnim.y,
        x: isExpanded ? 0 : floatAnim.x,
      }}
      transition={{
        opacity: { duration: 0.3, delay: index * 0.08 },
        scale: { ...springConfig, delay: index * 0.08 },
        y: isExpanded
          ? springConfig
          : {
              duration: floatAnim.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            },
        x: isExpanded
          ? springConfig
          : {
              duration: floatAnim.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            },
      }}
    >
      {/* Glow effect with state color */}
      <motion.div
        className="absolute rounded-full blur-xl -z-10"
        style={{ backgroundColor: colors.glow }}
        animate={{
          width: isExpanded ? expandedSize * 1.5 : collapsedSize * 1.4,
          height: isExpanded ? expandedSize * 1.5 : collapsedSize * 1.4,
          left: isExpanded ? -expandedSize * 0.25 : -collapsedSize * 0.2,
          top: isExpanded ? -expandedSize * 0.25 : -collapsedSize * 0.2,
          opacity: isExpanded ? 0.7 : 0.5,
        }}
        transition={springConfig}
      />

      {/* Drop shadow for expanded orb */}
      {isExpanded && (
        <motion.div
          className="absolute rounded-full bg-black/30 blur-2xl -z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            width: expandedSize * 1.2,
            height: expandedSize * 0.4,
            left: -expandedSize * 0.1,
            top: expandedSize * 0.9,
          }}
          transition={springConfig}
        />
      )}

      {/* The orb with state-specific color */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onTap?.();
        }}
        className={`relative rounded-full ${colors.bg} ${colors.text} flex items-center justify-center cursor-pointer shadow-lg`}
        animate={{
          width: isExpanded ? expandedSize : collapsedSize,
          height: isExpanded ? expandedSize : collapsedSize,
        }}
        whileTap={{ scale: 0.95 }}
        transition={springConfig}
      >
        {/* Glass highlight */}
        <div
          className="absolute rounded-full bg-white/25"
          style={{
            width: '50%',
            height: '40%',
            left: '10%',
            top: '8%',
            filter: 'blur(6px)',
          }}
        />

        {/* Content */}
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center justify-center text-center px-3 relative z-10"
          >
            <Icon className="w-7 h-7 mb-1.5" />
            <span className="text-base font-semibold leading-tight">
              {stateLabel}
            </span>
            {contextLabel && (
              <span className="text-sm opacity-80 leading-tight mt-0.5">
                {contextLabel}
              </span>
            )}
            <span className="text-xs opacity-60 mt-1.5">{time}</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="relative z-10"
          >
            <Icon style={{ width: iconSize, height: iconSize }} />
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  );
}

// Visual canvas that renders moments as floating orbs
interface MomentsTimelineProps {
  checkIns: CheckIn[];
  onMomentTap?: (checkIn: CheckIn) => void;
  expandedId?: string | null;
}

// Get grid layout class based on count - optimized for filling space with larger gaps
function getGridLayout(count: number): string {
  if (count === 1) return 'grid grid-cols-1 place-items-center';
  if (count === 2) return 'grid grid-cols-2 place-items-center gap-6';
  if (count === 3) return 'grid grid-cols-3 place-items-center gap-4';
  if (count === 4) return 'grid grid-cols-2 place-items-center gap-5';
  if (count === 5) return 'grid grid-cols-3 place-items-center gap-4';
  if (count === 6) return 'grid grid-cols-3 place-items-center gap-4';
  if (count <= 8) return 'grid grid-cols-3 place-items-center gap-3';
  // 9+ orbs: 4 columns
  return 'grid grid-cols-4 place-items-center gap-3';
}

export function MomentsTimeline({
  checkIns,
  onMomentTap,
  expandedId,
}: MomentsTimelineProps) {
  const isDesktop = useIsDesktop();

  // Sort by time (oldest first for left-to-right display)
  const sorted = useMemo(
    () =>
      [...checkIns].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    [checkIns]
  );

  if (checkIns.length === 0) return null;

  const gridClass = getGridLayout(sorted.length);

  const hasAnyExpanded = expandedId !== null && expandedId !== undefined;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Orbs container with adaptive grid - larger on desktop */}
      <div className={`${gridClass} px-4 max-w-sm md:max-w-md md:gap-6`}>
        {sorted.map((checkIn, index) => (
          <MomentOrb
            key={checkIn.id}
            checkIn={checkIn}
            index={index}
            total={sorted.length}
            onTap={() => onMomentTap?.(checkIn)}
            isExpanded={expandedId === checkIn.id}
            hasExpandedSibling={hasAnyExpanded && expandedId !== checkIn.id}
            isDesktop={isDesktop}
          />
        ))}
      </div>
    </div>
  );
}
