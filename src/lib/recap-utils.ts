/**
 * Dynamic Summary Computation Utils
 *
 * All summaries are computed on-the-fly from check-in data.
 * No insights are persisted - everything is derived.
 *
 * COPY RULES:
 * - Observational language only ("appeared", "shifted", "mostly")
 * - No "you should" or advice
 * - No scores, ratings, or productivity language
 * - No evaluative words ("good day", "bad day", "successful")
 * - Compare without judging ("calmer than expected", "more than yesterday")
 */

import {
  CheckIn,
  Day,
  Person,
  State,
  Context,
  ExpectationTone,
  getStateById,
  EXPECTATION_TONES,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface DaySummary {
  // Basic stats
  totalCheckIns: number;
  timespan: { first: Date; last: Date } | null;

  // Dominant patterns
  dominantState: string | null;
  dominantContext: string | null;
  dominantCategory: 'energy' | 'emotion' | 'tension' | null;

  // Distributions
  stateDistribution: Map<string, number>;
  contextDistribution: Map<string, number>;
  categoryDistribution: Map<string, number>;

  // People
  mentionedPeople: Person[];

  // Energy trend (if multiple check-ins)
  energyTrend: 'rising' | 'falling' | 'stable' | 'mixed' | null;

  // Morning expectation comparison
  expectationMatch: 'matched' | 'better' | 'different' | null;
}

export interface PeriodSummary {
  // Time range
  days: number;
  totalCheckIns: number;

  // Most common patterns
  topStates: Array<{ id: string; count: number; percentage: number }>;
  topContexts: Array<{ id: string; count: number; percentage: number }>;

  // Trends
  averageCheckInsPerDay: number;
  mostActiveDay: string | null; // day of week
  mostActiveTime: 'morning' | 'afternoon' | 'evening' | 'night' | null;

  // People frequency
  topPeople: Array<{ person: Person; count: number }>;
}

// ============================================================================
// DAILY SUMMARY COMPUTATION
// ============================================================================

export function computeDaySummary(
  day: Day,
  checkIns: CheckIn[],
  people: Person[],
  states: State[]
): DaySummary {
  const result: DaySummary = {
    totalCheckIns: checkIns.length,
    timespan: null,
    dominantState: null,
    dominantContext: null,
    dominantCategory: null,
    stateDistribution: new Map(),
    contextDistribution: new Map(),
    categoryDistribution: new Map(),
    mentionedPeople: [],
    energyTrend: null,
    expectationMatch: null,
  };

  if (checkIns.length === 0) return result;

  // Sort by timestamp
  const sorted = [...checkIns].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Timespan
  result.timespan = {
    first: new Date(sorted[0].timestamp),
    last: new Date(sorted[sorted.length - 1].timestamp),
  };

  // Count states and contexts
  const stateCounts = new Map<string, number>();
  const contextCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const personIds = new Set<string>();

  checkIns.forEach((c) => {
    // States
    stateCounts.set(c.stateId, (stateCounts.get(c.stateId) || 0) + 1);

    // Categories
    const state = getStateById(c.stateId, states);
    if (state) {
      categoryCounts.set(
        state.category,
        (categoryCounts.get(state.category) || 0) + 1
      );
    }

    // Contexts
    contextCounts.set(c.contextId, (contextCounts.get(c.contextId) || 0) + 1);

    // People
    if (c.personId) {
      personIds.add(c.personId);
    }
  });

  result.stateDistribution = stateCounts;
  result.contextDistribution = contextCounts;
  result.categoryDistribution = categoryCounts;

  // Find dominants
  result.dominantState = findDominant(stateCounts);
  result.dominantContext = findDominant(contextCounts);
  result.dominantCategory = findDominant(categoryCounts) as
    | 'energy'
    | 'emotion'
    | 'tension'
    | null;

  // Mentioned people
  result.mentionedPeople = people.filter((p) => personIds.has(p.id));

  // Energy trend (needs 2+ check-ins)
  if (checkIns.length >= 2) {
    result.energyTrend = computeEnergyTrend(sorted);
  }

  // Expectation comparison
  if (day.morningExpectationTone && result.dominantState) {
    result.expectationMatch = compareExpectation(
      day.morningExpectationTone,
      result.dominantState
    );
  }

  return result;
}

// ============================================================================
// PERIOD AGGREGATION
// ============================================================================

export function computePeriodSummary(
  days: Day[],
  checkIns: CheckIn[],
  people: Person[]
): PeriodSummary {
  const result: PeriodSummary = {
    days: days.length,
    totalCheckIns: checkIns.length,
    topStates: [],
    topContexts: [],
    averageCheckInsPerDay: 0,
    mostActiveDay: null,
    mostActiveTime: null,
    topPeople: [],
  };

  if (checkIns.length === 0) return result;

  // Count all states and contexts
  const stateCounts = new Map<string, number>();
  const contextCounts = new Map<string, number>();
  const personCounts = new Map<string, number>();
  const dayOfWeekCounts = new Map<number, number>();
  const timeOfDayCounts = new Map<string, number>();

  checkIns.forEach((c) => {
    stateCounts.set(c.stateId, (stateCounts.get(c.stateId) || 0) + 1);
    contextCounts.set(c.contextId, (contextCounts.get(c.contextId) || 0) + 1);

    if (c.personId) {
      personCounts.set(c.personId, (personCounts.get(c.personId) || 0) + 1);
    }

    const date = new Date(c.timestamp);
    const dow = date.getDay();
    dayOfWeekCounts.set(dow, (dayOfWeekCounts.get(dow) || 0) + 1);

    const hour = date.getHours();
    const timeOfDay = getTimeOfDay(hour);
    timeOfDayCounts.set(timeOfDay, (timeOfDayCounts.get(timeOfDay) || 0) + 1);
  });

  // Top states
  result.topStates = Array.from(stateCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      id,
      count,
      percentage: Math.round((count / checkIns.length) * 100),
    }));

  // Top contexts
  result.topContexts = Array.from(contextCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      id,
      count,
      percentage: Math.round((count / checkIns.length) * 100),
    }));

  // Average check-ins per day
  const daysWithCheckIns = new Set(checkIns.map((c) => c.dayId)).size;
  result.averageCheckInsPerDay =
    daysWithCheckIns > 0
      ? Math.round((checkIns.length / daysWithCheckIns) * 10) / 10
      : 0;

  // Most active day of week
  const topDow = findDominant(dayOfWeekCounts);
  if (topDow !== null) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    result.mostActiveDay = dayNames[topDow];
  }

  // Most active time of day
  result.mostActiveTime = findDominant(timeOfDayCounts) as
    | 'morning'
    | 'afternoon'
    | 'evening'
    | 'night'
    | null;

  // Top people
  result.topPeople = Array.from(personCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([personId, count]) => ({
      person: people.find((p) => p.id === personId)!,
      count,
    }))
    .filter((p) => p.person);

  return result;
}

// ============================================================================
// COPY GENERATION (Observational, No Advice)
// ============================================================================

/**
 * Generate daily summary text.
 * Rules: observational, no advice, no scores.
 */
export function generateDailySummaryText(
  summary: DaySummary,
  states: State[],
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (summary.totalCheckIns === 0) {
    return t('recap.noCheckins');
  }

  const state = summary.dominantState
    ? getStateById(summary.dominantState, states)
    : null;
  const stateLabel = state
    ? t(`state.${state.id}`)?.toLowerCase() || state.label.toLowerCase()
    : '';

  if (summary.totalCheckIns === 1) {
    return t('recap.singleCheckin', { state: stateLabel });
  }

  return t('recap.multipleCheckins', {
    count: summary.totalCheckIns,
    state: stateLabel,
  });
}

/**
 * Generate morning vs reality comparison text.
 * Rules: neutral comparison, no judgment.
 */
export function generateExpectationComparisonText(
  morningTone: ExpectationTone,
  summary: DaySummary,
  states: State[],
  t: (key: string, params?: Record<string, string | number>) => string
): string | null {
  if (!summary.dominantState) return null;

  const expectation = EXPECTATION_TONES.find((e) => e.value === morningTone);
  const dominantState = getStateById(summary.dominantState, states);

  if (!expectation || !dominantState) return null;

  const expectationLabel =
    t(`tone.${expectation.value}`)?.toLowerCase() ||
    expectation.label.toLowerCase();
  const stateLabel =
    t(`state.${dominantState.id}`)?.toLowerCase() ||
    dominantState.label.toLowerCase();

  switch (summary.expectationMatch) {
    case 'better':
      return t('recap.betterThanExpected', {
        expectation: expectationLabel,
        state: stateLabel,
      });
    case 'different':
      return t('recap.differentThanExpected', {
        expectation: expectationLabel,
        state: stateLabel,
      });
    default:
      return t('recap.asExpected', {
        expectation: expectationLabel,
        state: stateLabel,
      });
  }
}

/**
 * Generate context distribution text.
 * Example: "Most moments were at work (5) and home (3)."
 */
export function generateContextDistributionText(
  summary: DaySummary,
  allContexts: Context[],
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (summary.contextDistribution.size === 0) return '';

  const sorted = Array.from(summary.contextDistribution.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const parts = sorted.map(([contextId, count]) => {
    const context = allContexts.find((c) => c.id === contextId);
    const label = context
      ? t(`context.${contextId}`)?.toLowerCase() || context.label.toLowerCase()
      : contextId;
    return `${label} (${count})`;
  });

  return parts.join(', ');
}

/**
 * Generate a neutral closing line.
 * Rotates based on day of week for variety.
 */
export function generateClosingLine(
  date: Date,
  t: (key: string) => string
): string {
  const lines = [
    t('recap.closing.1'),
    t('recap.closing.2'),
    t('recap.closing.3'),
  ].filter(Boolean);

  if (lines.length === 0) return '';

  const dayOfWeek = date.getDay();
  return lines[dayOfWeek % lines.length];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function findDominant<T extends string | number>(
  counts: Map<T, number>
): T | null {
  let max = 0;
  let dominant: T | null = null;

  counts.forEach((count, key) => {
    if (count > max) {
      max = count;
      dominant = key;
    }
  });

  return dominant;
}

function getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Compute energy trend from sorted check-ins.
 * Uses energy category states as proxy for energy level.
 */
function computeEnergyTrend(
  sortedCheckIns: CheckIn[]
): 'rising' | 'falling' | 'stable' | 'mixed' {
  // Map states to energy levels (higher = more energy)
  const energyLevels: Record<string, number> = {
    energized: 4,
    calm: 3,
    tired: 2,
    drained: 1,
    // Non-energy states get neutral value
    content: 3,
    anxious: 2,
    frustrated: 2,
    grateful: 3,
    uncertain: 2,
    focused: 3,
    scattered: 2,
    present: 3,
    distracted: 2,
    neutral: 2.5,
  };

  const levels = sortedCheckIns.map(
    (c) => energyLevels[c.stateId] ?? 2.5
  );

  if (levels.length < 2) return 'stable';

  // Compare first half average to second half average
  const mid = Math.floor(levels.length / 2);
  const firstHalf = levels.slice(0, mid);
  const secondHalf = levels.slice(mid);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 0.5) return 'rising';
  if (diff < -0.5) return 'falling';

  // Check for variance (mixed day)
  const variance =
    levels.reduce((sum, l) => sum + Math.pow(l - firstAvg, 2), 0) /
    levels.length;
  if (variance > 1) return 'mixed';

  return 'stable';
}

/**
 * Compare morning expectation with actual day outcome.
 */
function compareExpectation(
  expectation: ExpectationTone,
  dominantState: string
): 'matched' | 'better' | 'different' {
  // Group expectations and states by positivity
  const positiveExpectations: ExpectationTone[] = ['calm', 'excited', 'energized'];
  const negativeExpectations: ExpectationTone[] = ['anxious', 'uncertain', 'heavy'];

  const positiveStates = [
    'energized',
    'calm',
    'content',
    'grateful',
    'focused',
    'present',
    'neutral',
  ];
  const negativeStates = [
    'tired',
    'drained',
    'anxious',
    'frustrated',
    'uncertain',
    'scattered',
    'distracted',
  ];

  const expectedPositive = positiveExpectations.includes(expectation);
  const wasPositive = positiveStates.includes(dominantState);
  const wasNegative = negativeStates.includes(dominantState);

  if (expectedPositive && wasPositive) return 'matched';
  if (!expectedPositive && wasNegative) return 'matched';
  if (!expectedPositive && wasPositive) return 'better';

  return 'different';
}
