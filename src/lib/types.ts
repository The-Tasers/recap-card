// ============================================================================
// APP CONFIGURATION
// ============================================================================

// App color themes
export type ColorTheme = 'midnight' | 'daylight';

export const COLOR_THEMES: {
  value: ColorTheme;
  label: string;
  description: string;
  preview: { bg: string; card: string; accent: string };
  isDark: boolean;
}[] = [
  {
    value: 'midnight',
    label: 'Midnight',
    description: 'Deep violet dark',
    preview: { bg: '#1f1d2b', card: '#2a2839', accent: '#8b7cf5' },
    isDark: true,
  },
  {
    value: 'daylight',
    label: 'Daylight',
    description: 'Clean light mode',
    preview: { bg: '#faf8fc', card: '#fdfcfe', accent: '#8b7cf5' },
    isDark: false,
  },
];

// ============================================================================
// FREE PLAN LIMITS
// ============================================================================

export const FREE_PLAN_LIMITS = {
  maxCustomContexts: 1,
  maxCustomPeople: 1,
};

// ============================================================================
// CHECK-IN & REFLECTION SYSTEM - CORE TYPES
// ============================================================================

/**
 * State categories for check-ins
 * These are fixed categories that organize states in the UI
 */
export type StateCategory = 'energy' | 'emotion' | 'tension' | 'neutral';

/**
 * State represents a feeling/mood option in the check-in flow
 * Loaded from database (states table)
 */
export interface State {
  id: string;
  label: string;
  category: StateCategory;
  isDefault: boolean;
}

/**
 * Context represents where/what activity the user is doing
 * Loaded from database (contexts table)
 */
export interface Context {
  id: string;
  label: string;
  isDefault: boolean;
  userId?: string; // null for defaults, set for user-created
}

/**
 * Person represents who was involved in the check-in
 * Loaded from database (people table)
 */
export interface Person {
  id: string;
  label: string;
  isDefault: boolean;
  userId?: string; // null for defaults, set for user-created
}

/**
 * Morning expectation tone options
 */
export type ExpectationTone =
  | 'calm'
  | 'excited'
  | 'anxious'
  | 'uncertain'
  | 'energized'
  | 'heavy';

/**
 * Day entity - one per calendar day per user
 */
export interface Day {
  id: string;
  userId?: string; // null for anonymous/local
  date: string; // YYYY-MM-DD format
  morningExpectationTone?: ExpectationTone;
  createdAt: string;
}

/**
 * CheckIn entity - multiple per day, the core data unit
 */
export interface CheckIn {
  id: string;
  dayId: string;
  timestamp: string;
  stateId: string;
  contextId: string;
  personId?: string;
}

// ============================================================================
// EXPECTATION TONES (UI configuration - not database-driven)
// ============================================================================

export const EXPECTATION_TONES: {
  value: ExpectationTone;
  label: string;
  color: string;
}[] = [
  { value: 'calm', label: 'Calm', color: '#6b9e8a' },
  { value: 'excited', label: 'Excited', color: '#eab308' },
  { value: 'anxious', label: 'Anxious', color: '#f97316' },
  { value: 'uncertain', label: 'Uncertain', color: '#a1a1aa' },
  { value: 'energized', label: 'Energized', color: '#22c55e' },
  { value: 'heavy', label: 'Heavy', color: '#8b7cf5' },
];

export const getExpectationToneInfo = (tone: ExpectationTone) => {
  return EXPECTATION_TONES.find((t) => t.value === tone) || EXPECTATION_TONES[0];
};

// ============================================================================
// HELPER FUNCTIONS FOR WORKING WITH LOADED DATA
// ============================================================================

/**
 * Find a state by ID from a list of states
 */
export const getStateById = (id: string, states: State[]): State | undefined => {
  return states.find((s) => s.id === id);
};

/**
 * Filter states by category
 */
export const getStatesByCategory = (category: StateCategory, states: State[]): State[] => {
  return states.filter((s) => s.category === category);
};

/**
 * Find a context by ID from combined list
 */
export const getContextById = (id: string, contexts: Context[]): Context | undefined => {
  return contexts.find((c) => c.id === id);
};

/**
 * Find a person by ID from combined list
 */
export const getPersonById = (id: string, people: Person[]): Person | undefined => {
  return people.find((p) => p.id === id);
};

/**
 * Separate default and custom items from a combined list
 */
export const separateDefaultAndCustom = <T extends { isDefault: boolean }>(
  items: T[]
): { defaults: T[]; custom: T[] } => {
  return {
    defaults: items.filter((item) => item.isDefault),
    custom: items.filter((item) => !item.isDefault),
  };
};
