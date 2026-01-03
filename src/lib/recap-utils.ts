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

export type OverallMood = 'great' | 'good' | 'neutral' | 'low' | 'rough';

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

  // Overall mood (computed from average energy levels)
  overallMood: OverallMood | null;
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
    overallMood: null,
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
    result.energyTrend = computeEnergyTrend(sorted, states);
  }

  // Expectation comparison
  if (day.morningExpectationTone && result.dominantState) {
    result.expectationMatch = compareExpectation(
      day.morningExpectationTone,
      result.dominantState,
      states
    );
  }

  // Compute overall mood from average energy levels
  result.overallMood = computeOverallMood(checkIns, states);

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

  // Check if there's a truly dominant state (appears > 1 time and > 40% of total)
  const dominantCount = summary.dominantState
    ? summary.stateDistribution.get(summary.dominantState) || 0
    : 0;
  const dominantPercentage = (dominantCount / summary.totalCheckIns) * 100;
  const hasClearDominant = dominantCount > 1 && dominantPercentage > 40;

  // Base text: just count
  const countText = t('recap.multipleCheckins', { count: summary.totalCheckIns });

  // Add dominant state only if clearly dominant
  if (hasClearDominant && stateLabel) {
    const dominantText = t('recap.dominantState', { state: stateLabel });
    return `${countText} ${dominantText}`;
  }

  // Otherwise show mixed states
  if (summary.stateDistribution.size > 1) {
    const mixedText = t('recap.mixedStates');
    if (mixedText) {
      return `${countText} ${mixedText}`;
    }
  }

  return countText;
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
      ? context.isDefault
        ? t(`context.${contextId}`)?.toLowerCase() || context.label.toLowerCase()
        : context.label.toLowerCase()
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
 * Get energy level from a state.
 * Energy category states have direct levels: energized=4, calm=3, tired=2, drained=1
 * Other categories are mapped based on positive/negative nature.
 */
function getEnergyLevel(stateId: string, states: State[]): number {
  const state = getStateById(stateId, states);
  if (!state) return 2.5; // neutral fallback

  // Energy category states have clear energy levels
  if (state.category === 'energy') {
    const energyLevels: Record<string, number> = {
      energized: 4,
      calm: 3,
      tired: 2,
      drained: 1,
    };
    return energyLevels[stateId] ?? 2.5;
  }

  // Emotion states: map to energy equivalents
  if (state.category === 'emotion') {
    const emotionToEnergy: Record<string, number> = {
      grateful: 3.5, // positive, energizing
      content: 3,    // positive, calm
      anxious: 2.5,  // negative but can be activating
      uncertain: 2,  // draining uncertainty
      frustrated: 2, // draining
    };
    return emotionToEnergy[stateId] ?? 2.5;
  }

  // Tension/focus states: map to energy equivalents
  if (state.category === 'tension') {
    const tensionToEnergy: Record<string, number> = {
      focused: 3.5,   // engaged, energizing
      present: 3,     // calm engagement
      distracted: 2,  // draining
      scattered: 1.5, // very draining
    };
    return tensionToEnergy[stateId] ?? 2.5;
  }

  return 2.5; // neutral fallback
}

/**
 * Compute energy trend from sorted check-ins.
 * Uses actual state data to determine energy levels.
 */
function computeEnergyTrend(
  sortedCheckIns: CheckIn[],
  states: State[]
): 'rising' | 'falling' | 'stable' | 'mixed' {
  const levels = sortedCheckIns.map((c) => getEnergyLevel(c.stateId, states));

  if (levels.length < 2) return 'stable';

  // Compare first half average to second half average
  const mid = Math.floor(levels.length / 2);
  const firstHalf = levels.slice(0, mid);
  const secondHalf = levels.slice(mid);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  // Use smaller threshold (0.3) for more sensitive trend detection
  if (diff > 0.3) return 'rising';
  if (diff < -0.3) return 'falling';

  // Check for variance (mixed day) - indicates ups and downs
  const overallAvg = levels.reduce((a, b) => a + b, 0) / levels.length;
  const variance =
    levels.reduce((sum, l) => sum + Math.pow(l - overallAvg, 2), 0) /
    levels.length;
  if (variance > 0.8) return 'mixed';

  return 'stable';
}

/**
 * Compute overall mood from check-ins based on average energy levels.
 * Maps energy level to mood: 1-1.8=rough, 1.8-2.3=low, 2.3-2.8=neutral, 2.8-3.4=good, 3.4+=great
 */
function computeOverallMood(
  checkIns: CheckIn[],
  states: State[]
): OverallMood | null {
  if (checkIns.length === 0) return null;

  const levels = checkIns.map((c) => getEnergyLevel(c.stateId, states));
  const avgLevel = levels.reduce((a, b) => a + b, 0) / levels.length;

  // Map average energy level to mood
  // Energy scale: 1 (drained) to 4 (energized)
  if (avgLevel >= 3.4) return 'great';
  if (avgLevel >= 2.8) return 'good';
  if (avgLevel >= 2.3) return 'neutral';
  if (avgLevel >= 1.8) return 'low';
  return 'rough';
}

/**
 * Get expected energy level from morning expectation tone.
 */
function getExpectationEnergyLevel(expectation: ExpectationTone): number {
  const expectationLevels: Record<ExpectationTone, number> = {
    energized: 4,
    excited: 3.5,
    calm: 3,
    uncertain: 2,
    anxious: 2,
    heavy: 1.5,
  };
  return expectationLevels[expectation] ?? 2.5;
}

/**
 * Compare morning expectation with actual day outcome.
 * Uses energy level comparison for more accurate matching.
 */
function compareExpectation(
  expectation: ExpectationTone,
  dominantState: string,
  states: State[]
): 'matched' | 'better' | 'different' {
  const expectedLevel = getExpectationEnergyLevel(expectation);
  const actualLevel = getEnergyLevel(dominantState, states);

  const diff = actualLevel - expectedLevel;

  // Within 0.5 points = matched
  if (Math.abs(diff) <= 0.5) return 'matched';

  // Actual was better than expected
  if (diff > 0.5) return 'better';

  // Actual was different (worse) than expected
  return 'different';
}
