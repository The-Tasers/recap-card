'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Day, CheckIn } from '@/lib/types';
import { useOptionsStore } from '@/lib/options-store';
import {
  computeDaySummary,
  generateDailySummaryText,
  generateExpectationComparisonText,
  generateClosingLine,
} from '@/lib/recap-utils';
import { generateMoodGradient } from '@/components/moment-blob';
import { useI18n } from '@/lib/i18n';
import { formatDate } from '@/lib/date-utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Dot,
} from 'lucide-react';

// State colors for background glow - matches checkin-flow colors
const STATE_COLORS: Record<string, { glow: string }> = {
  neutral: { glow: 'rgba(148, 163, 184, 0.3)' },
  // EMOTION: red → orange → yellow → lime → green
  frustrated: { glow: 'rgba(239, 68, 68, 0.35)' },
  anxious: { glow: 'rgba(249, 115, 22, 0.35)' },
  uncertain: { glow: 'rgba(234, 179, 8, 0.35)' },
  content: { glow: 'rgba(132, 204, 22, 0.35)' },
  grateful: { glow: 'rgba(34, 197, 94, 0.35)' },
  // ENERGY: blue/cyan family
  drained: { glow: 'rgba(49, 46, 129, 0.35)' },
  tired: { glow: 'rgba(96, 165, 250, 0.35)' },
  calm: { glow: 'rgba(56, 189, 248, 0.35)' },
  energized: { glow: 'rgba(34, 211, 238, 0.35)' },
  // TENSION/FOCUS: purple/violet family
  scattered: { glow: 'rgba(126, 34, 206, 0.35)' },
  distracted: { glow: 'rgba(168, 85, 247, 0.35)' },
  focused: { glow: 'rgba(167, 139, 250, 0.35)' },
  present: { glow: 'rgba(232, 121, 249, 0.35)' },
};

const DEFAULT_COLORS = { glow: 'rgba(148, 163, 184, 0.3)' };

interface DayRecapProps {
  day: Day;
  checkIns: CheckIn[];
  isToday?: boolean;
}

/**
 * Day Recap Component - Compact sentence-based insights
 */
export function DayRecap({ day, checkIns, isToday }: DayRecapProps) {
  const { t, language } = useI18n();
  const { states, contexts, people } = useOptionsStore();

  // Compute summary dynamically
  const summary = useMemo(
    () => computeDaySummary(day, checkIns, people, states),
    [day, checkIns, people, states]
  );

  // Translation helper
  const translate = (key: string, params?: Record<string, string | number>) => {
    const result = t(key as any, params as any);
    return result || '';
  };

  // No check-ins state
  if (summary.totalCheckIns === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{translate('recap.noCheckins') || 'No check-ins recorded today.'}</p>
      </div>
    );
  }

  // Generate texts
  const summaryText = generateDailySummaryText(summary, states, translate);
  const expectationText = day.morningExpectationTone
    ? generateExpectationComparisonText(
        day.morningExpectationTone,
        summary,
        states,
        translate
      )
    : null;
  const closingText = generateClosingLine(new Date(day.date), translate);

  // Energy trend icon
  const TrendIcon =
    summary.energyTrend === 'rising'
      ? TrendingUp
      : summary.energyTrend === 'falling'
      ? TrendingDown
      : Minus;

  // Generate context insight sentence
  const getContextInsight = () => {
    const entries = Array.from(summary.contextDistribution.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    if (entries.length === 0) return null;

    const topContext = contexts.find((c) => c.id === entries[0][0]);
    if (!topContext) return null;

    const topName = topContext.isDefault
      ? translate(`context.${entries[0][0]}`) || topContext.label
      : topContext.label;

    if (entries.length === 1) {
      return (
        translate('recap.contextSingle', { context: topName }) ||
        `Spent time ${topName.toLowerCase()}`
      );
    }

    const secondContext = contexts.find((c) => c.id === entries[1][0]);
    const secondName = secondContext
      ? secondContext.isDefault
        ? translate(`context.${entries[1][0]}`) || secondContext.label
        : secondContext.label
      : '';

    return (
      translate('recap.contextMultiple', {
        first: topName,
        second: secondName,
      }) || `Mostly ${topName.toLowerCase()}, also ${secondName.toLowerCase()}`
    );
  };

  // Generate people insight sentence
  const getPeopleInsight = () => {
    if (summary.mentionedPeople.length === 0) return null;

    const names = summary.mentionedPeople.map((p) =>
      p.isDefault
        ? translate(`person.${p.label.toLowerCase()}`) || p.label
        : p.label
    );
    if (names.length === 1) {
      return (
        translate('recap.peopleSingle', { person: names[0] }) ||
        `Time with ${names[0]}`
      );
    }
    return (
      translate('recap.peopleMultiple', { people: names.join(', ') }) ||
      `Time with ${names.join(' and ')}`
    );
  };

  const contextInsight = getContextInsight();
  const peopleInsight = getPeopleInsight();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Hero - Orb with main insight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl bg-gradient-to-br from-card to-muted/30 border p-5 overflow-hidden"
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-20 blur-3xl"
          style={{
            background: summary.dominantState
              ? STATE_COLORS[summary.dominantState]?.glow || DEFAULT_COLORS.glow
              : DEFAULT_COLORS.glow,
          }}
        />

        <div className="relative flex items-center gap-4">
          {/* Merged gradient orb - smaller */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.2,
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            className="relative shrink-0"
          >
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 rounded-full blur-xl opacity-50"
              style={{ background: generateMoodGradient(checkIns) }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Main gradient orb */}
            <motion.div
              className="relative w-16 h-16 rounded-full shadow-lg"
              style={{ background: generateMoodGradient(checkIns) }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              {/* Glass highlight */}
              <div
                className="absolute rounded-full bg-white/30"
                style={{
                  width: '45%',
                  height: '35%',
                  left: '12%',
                  top: '10%',
                  filter: 'blur(6px)',
                }}
              />
            </motion.div>
            {/* Moment count badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-background flex items-center justify-center text-xs font-bold text-foreground shadow-md">
              {checkIns.length}
            </div>
          </motion.div>

          {/* Date and main insight */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">
              {formatDate(new Date(day.date), language)}
            </p>
            <p className="text-base font-medium text-foreground leading-snug">
              {summaryText}
            </p>
          </div>
        </div>

        {/* Overall mood and energy trend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground"
        >
          {/* Overall mood */}
          {summary.overallMood && (
            <span className="font-medium">
              {translate(`recap.mood.${summary.overallMood}`)}
            </span>
          )}

          {/* Energy trend */}
          {summary.energyTrend && summary.totalCheckIns >= 2 && (
            <span className="flex items-center gap-1.5">
              <TrendIcon className="h-3.5 w-3.5 shrink-0" />
              <span>
                {summary.energyTrend === 'rising' &&
                  (translate('recap.energyRising') || 'Energy rose')}
                {summary.energyTrend === 'falling' &&
                  (translate('recap.energyFalling') || 'Energy fell')}
                {summary.energyTrend === 'stable' &&
                  (translate('recap.energyStable') || 'Energy steady')}
                {summary.energyTrend === 'mixed' &&
                  (translate('recap.energyMixed') || 'Energy varied')}
              </span>
            </span>
          )}
        </motion.div>
      </motion.div>

      {/* Insights as sentences */}
      {(contextInsight || peopleInsight || expectationText) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 px-1"
        >
          {expectationText && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>{expectationText}</span>
            </div>
          )}

          {contextInsight && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>{contextInsight}</span>
            </div>
          )}

          {peopleInsight && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>{peopleInsight}</span>
            </div>
          )}
        </motion.div>
      )}


      {/* Closing observation */}
      {closingText && !isToday && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-3"
        >
          <div className="inline-flex items-center gap-2 text-muted-foreground/60">
            <Dot className="h-3 w-3" />
            <p className="text-sm italic">{closingText}</p>
            <Dot className="h-3 w-3" />
          </div>
        </motion.div>
      )}

      {/* Today's encouragement message */}
      {isToday && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-3"
        >
          <p className="text-sm text-muted-foreground">
            {translate('recap.keepNoticing') || 'Keep noticing moments as your day unfolds'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
