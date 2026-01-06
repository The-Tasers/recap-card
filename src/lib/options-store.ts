'use client';

import { create } from 'zustand';
import { State, Context, Person, StateCategory } from './types';

// ============================================================================
// Default Data (Local Only - No Database)
// ============================================================================

const DEFAULT_STATES: State[] = [
  // Neutral
  { id: 'neutral', label: 'Neutral', category: 'neutral', isDefault: true },
  // Energy category (low to high) - 5 states
  { id: 'drained', label: 'Drained', category: 'energy', isDefault: true },
  { id: 'tired', label: 'Tired', category: 'energy', isDefault: true },
  { id: 'calm', label: 'Calm', category: 'energy', isDefault: true },
  { id: 'rested', label: 'Rested', category: 'energy', isDefault: true },
  { id: 'energized', label: 'Energized', category: 'energy', isDefault: true },
  // Emotion category (negative to positive) - 5 states
  { id: 'frustrated', label: 'Frustrated', category: 'emotion', isDefault: true },
  { id: 'anxious', label: 'Anxious', category: 'emotion', isDefault: true },
  { id: 'uncertain', label: 'Uncertain', category: 'emotion', isDefault: true },
  { id: 'content', label: 'Content', category: 'emotion', isDefault: true },
  { id: 'grateful', label: 'Grateful', category: 'emotion', isDefault: true },
  // Tension category (scattered to present) - 5 states
  { id: 'overwhelmed', label: 'Overwhelmed', category: 'tension', isDefault: true },
  { id: 'distracted', label: 'Distracted', category: 'tension', isDefault: true },
  { id: 'scattered', label: 'Scattered', category: 'tension', isDefault: true },
  { id: 'focused', label: 'Focused', category: 'tension', isDefault: true },
  { id: 'present', label: 'Present', category: 'tension', isDefault: true },
];

const DEFAULT_CONTEXTS: Context[] = [
  { id: 'work', label: 'Work', isDefault: true },
  { id: 'home', label: 'Home', isDefault: true },
  { id: 'commute', label: 'Commute', isDefault: true },
  { id: 'social', label: 'Social', isDefault: true },
  { id: 'alone', label: 'Alone', isDefault: true },
  { id: 'exercise', label: 'Exercise', isDefault: true },
  { id: 'errands', label: 'Errands', isDefault: true },
  { id: 'rest', label: 'Rest', isDefault: true },
  { id: 'outdoors', label: 'Outdoors', isDefault: true },
  { id: 'eating', label: 'Eating', isDefault: true },
  { id: 'learning', label: 'Learning', isDefault: true },
  { id: 'travel', label: 'Travel', isDefault: true },
];

const DEFAULT_PEOPLE: Person[] = [
  { id: 'partner', label: 'Partner', isDefault: true },
  { id: 'family', label: 'Family', isDefault: true },
  { id: 'friends', label: 'Friends', isDefault: true },
  { id: 'colleagues', label: 'Colleagues', isDefault: true },
  { id: 'kids', label: 'Kids', isDefault: true },
  { id: 'pets', label: 'Pets', isDefault: true },
  { id: 'strangers', label: 'Strangers', isDefault: true },
  { id: 'clients', label: 'Clients', isDefault: true },
];

// ============================================================================
// Options Store Interface
// ============================================================================

interface OptionsStore {
  // Data
  states: State[];
  contexts: Context[];
  people: Person[];

  // Loading state
  loading: boolean;
  loaded: boolean;
  error: string | null;

  // Computed getters
  getStatesByCategory: (category: StateCategory) => State[];
  getDefaultContexts: () => Context[];
  getCustomContexts: () => Context[];
  getDefaultPeople: () => Person[];
  getCustomPeople: () => Person[];

  // Actions
  loadOptions: (userId?: string, force?: boolean) => Promise<void>;
  reset: () => void;
}

// ============================================================================
// Options Store Implementation (Local Only)
// ============================================================================

export const useOptionsStore = create<OptionsStore>()((set, get) => ({
  // Initial state with defaults
  states: DEFAULT_STATES,
  contexts: DEFAULT_CONTEXTS,
  people: DEFAULT_PEOPLE,
  loading: false,
  loaded: true, // Already loaded with defaults
  error: null,

  // ============================================================================
  // Computed Getters
  // ============================================================================

  getStatesByCategory: (category: StateCategory) => {
    return get().states.filter((s) => s.category === category);
  },

  getDefaultContexts: () => {
    return get().contexts.filter((c) => c.isDefault);
  },

  getCustomContexts: () => {
    return get().contexts.filter((c) => !c.isDefault);
  },

  getDefaultPeople: () => {
    return get().people.filter((p) => p.isDefault);
  },

  getCustomPeople: () => {
    return get().people.filter((p) => !p.isDefault);
  },

  // ============================================================================
  // Load Options (No-op for local-only mode)
  // ============================================================================

  loadOptions: async () => {
    // Data is already loaded with defaults, nothing to fetch
    set({ loaded: true });
  },

  // ============================================================================
  // Reset Store
  // ============================================================================

  reset: () => {
    set({
      states: DEFAULT_STATES,
      contexts: DEFAULT_CONTEXTS,
      people: DEFAULT_PEOPLE,
      loading: false,
      loaded: true,
      error: null,
    });
  },
}));
