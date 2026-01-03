'use client';

import { create } from 'zustand';
import { State, Context, Person, StateCategory } from './types';

// ============================================================================
// Default Data (Local Only - No Database)
// ============================================================================

const DEFAULT_STATES: State[] = [
  // Neutral
  { id: 'neutral', label: 'Neutral', category: 'neutral', isDefault: true },
  // Energy
  { id: 'energized', label: 'Energized', category: 'energy', isDefault: true },
  { id: 'calm', label: 'Calm', category: 'energy', isDefault: true },
  { id: 'tired', label: 'Tired', category: 'energy', isDefault: true },
  { id: 'drained', label: 'Drained', category: 'energy', isDefault: true },
  // Emotion
  { id: 'grateful', label: 'Grateful', category: 'emotion', isDefault: true },
  { id: 'content', label: 'Content', category: 'emotion', isDefault: true },
  { id: 'uncertain', label: 'Uncertain', category: 'emotion', isDefault: true },
  { id: 'anxious', label: 'Anxious', category: 'emotion', isDefault: true },
  { id: 'frustrated', label: 'Frustrated', category: 'emotion', isDefault: true },
  // Tension
  { id: 'present', label: 'Present', category: 'tension', isDefault: true },
  { id: 'focused', label: 'Focused', category: 'tension', isDefault: true },
  { id: 'distracted', label: 'Distracted', category: 'tension', isDefault: true },
  { id: 'scattered', label: 'Scattered', category: 'tension', isDefault: true },
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
];

const DEFAULT_PEOPLE: Person[] = [
  { id: 'partner', label: 'Partner', isDefault: true },
  { id: 'family', label: 'Family', isDefault: true },
  { id: 'friends', label: 'Friends', isDefault: true },
  { id: 'colleagues', label: 'Colleagues', isDefault: true },
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
