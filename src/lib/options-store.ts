'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { State, Context, Person, StateCategory } from './types';
import { DbState, DbContext, DbPerson } from './supabase/types';
import { createClient } from './supabase/client';

// ============================================================================
// Options Store Interface
// ============================================================================

interface OptionsStore {
  // Data loaded from database
  states: State[];
  contexts: Context[]; // All contexts (default + user's custom)
  people: Person[]; // All people (default + user's custom)

  // Loading state
  loading: boolean;
  loaded: boolean; // Prevents re-fetching static data
  error: string | null;

  // Computed getters
  getStatesByCategory: (category: StateCategory) => State[];
  getDefaultContexts: () => Context[];
  getCustomContexts: () => Context[];
  getDefaultPeople: () => Person[];
  getCustomPeople: () => Person[];

  // Actions
  loadOptions: (userId?: string, force?: boolean) => Promise<void>;
  addCustomContext: (label: string, userId: string) => Promise<Context>;
  addCustomPerson: (label: string, userId: string) => Promise<Person>;
  deleteCustomContext: (id: string) => Promise<void>;
  deleteCustomPerson: (id: string) => Promise<void>;
  reset: () => void;
}

// ============================================================================
// Database to App Type Converters
// ============================================================================

function dbStateToAppState(dbState: DbState): State {
  return {
    id: dbState.id,
    label: dbState.label,
    category: dbState.category as StateCategory,
    isDefault: dbState.is_default,
  };
}

function dbContextToAppContext(dbContext: DbContext): Context {
  return {
    id: dbContext.id,
    label: dbContext.label,
    isDefault: dbContext.is_default,
    userId: dbContext.user_id ?? undefined,
  };
}

function dbPersonToAppPerson(dbPerson: DbPerson): Person {
  return {
    id: dbPerson.id,
    label: dbPerson.label,
    isDefault: dbPerson.is_default,
    userId: dbPerson.user_id ?? undefined,
  };
}

// ============================================================================
// Options Store Implementation
// ============================================================================

export const useOptionsStore = create<OptionsStore>()((set, get) => ({
  // Initial state
  states: [],
  contexts: [],
  people: [],
  loading: false,
  loaded: false,
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
  // Load Options from Database
  // ============================================================================

  loadOptions: async (userId?: string, force?: boolean) => {
    // Skip if already loaded (unless forced)
    if (get().loaded && !force) {
      return;
    }

    // Skip if already loading
    if (get().loading) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const supabase = createClient();

      // Load all states (always public)
      const { data: statesData, error: statesError } = await supabase
        .from('states')
        .select('*')
        .order('category', { ascending: true });

      if (statesError) throw statesError;

      // Load contexts (default + user's custom if authenticated)
      const { data: contextsData, error: contextsError } = await supabase
        .from('contexts')
        .select('*')
        .order('is_default', { ascending: false })
        .order('label', { ascending: true });

      if (contextsError) throw contextsError;

      // Load people (default + user's custom if authenticated)
      const { data: peopleData, error: peopleError } = await supabase
        .from('people')
        .select('*')
        .order('is_default', { ascending: false })
        .order('label', { ascending: true });

      if (peopleError) throw peopleError;

      set({
        states: ((statesData || []) as DbState[]).map(dbStateToAppState),
        contexts: ((contextsData || []) as DbContext[]).map(dbContextToAppContext),
        people: ((peopleData || []) as DbPerson[]).map(dbPersonToAppPerson),
        loading: false,
        loaded: true,
        error: null,
      });
    } catch (error) {
      console.error('Failed to load options:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load options',
      });
    }
  },

  // ============================================================================
  // Add Custom Context (uses UUID)
  // ============================================================================

  addCustomContext: async (label: string, userId: string): Promise<Context> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('contexts')
      .insert({
        id: uuidv4(),
        label: label.trim(),
        user_id: userId,
        is_default: false,
      })
      .select()
      .single();

    if (error) throw error;

    const newContext = dbContextToAppContext(data as DbContext);
    set((state) => ({
      contexts: [...state.contexts, newContext],
    }));

    return newContext;
  },

  // ============================================================================
  // Add Custom Person (uses UUID from database default)
  // ============================================================================

  addCustomPerson: async (label: string, userId: string): Promise<Person> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('people')
      .insert({
        label: label.trim(),
        user_id: userId,
        is_default: false,
      })
      .select()
      .single();

    if (error) throw error;

    const newPerson = dbPersonToAppPerson(data as DbPerson);
    set((state) => ({
      people: [...state.people, newPerson],
    }));

    return newPerson;
  },

  // ============================================================================
  // Delete Custom Context
  // ============================================================================

  deleteCustomContext: async (id: string) => {
    const supabase = createClient();

    const { error } = await supabase.from('contexts').delete().eq('id', id);

    if (error) throw error;

    set((state) => ({
      contexts: state.contexts.filter((c) => c.id !== id),
    }));
  },

  // ============================================================================
  // Delete Custom Person
  // ============================================================================

  deleteCustomPerson: async (id: string) => {
    const supabase = createClient();

    const { error } = await supabase.from('people').delete().eq('id', id);

    if (error) throw error;

    set((state) => ({
      people: state.people.filter((p) => p.id !== id),
    }));
  },

  // ============================================================================
  // Reset Store
  // ============================================================================

  reset: () => {
    set({
      states: [],
      contexts: [],
      people: [],
      loading: false,
      loaded: false,
      error: null,
    });
  },
}));
