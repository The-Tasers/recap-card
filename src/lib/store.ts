'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { DailyCard, Mood, CardBlock, BlockId, ColorTheme } from './types';

// Draft entry type for preserving state across sessions
export interface DraftEntry {
  mood?: Mood;
  text?: string;
  blocks?: Record<BlockId, CardBlock>;
  photoDataUrl?: string;
  selectedDate?: string;
  lastUpdated: string;
}

const DB_NAME = 'recapp-db';
const STORE_NAME = 'recapp-store';
const DB_VERSION = 1;
const LOCAL_CARDS_KEY = 'local-cards';

// ============================================================================
// IndexedDB Helpers - Standalone storage for local (anonymous) cards
// ============================================================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// Load local cards from IndexedDB
export async function loadLocalCards(): Promise<DailyCard[]> {
  if (typeof window === 'undefined') return [];

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(LOCAL_CARDS_KEY);

      request.onerror = () => {
        console.error('Failed to load local cards:', request.error);
        resolve([]);
      };

      request.onsuccess = () => {
        const data = request.result;
        if (data && Array.isArray(data)) {
          resolve(data);
        } else {
          resolve([]);
        }
      };
    });
  } catch (error) {
    console.error('Failed to load local cards:', error);
    return [];
  }
}

// Save local cards to IndexedDB
export async function saveLocalCards(cards: DailyCard[]): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(cards, LOCAL_CARDS_KEY);

      request.onerror = () => {
        console.error('Failed to save local cards:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to save local cards:', error);
  }
}

// Clear all local cards from IndexedDB
export async function clearLocalCards(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(LOCAL_CARDS_KEY);

      request.onerror = () => {
        console.error('Failed to clear local cards:', request.error);
        resolve();
      };

      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to clear local cards:', error);
  }
}

// Clear entire IndexedDB (for settings/logout)
export async function clearIndexedDB(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => {
        console.error('Failed to clear IndexedDB:', request.error);
        resolve();
      };

      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to clear IndexedDB:', error);
    // Fallback: try to delete the whole database
    if (typeof window !== 'undefined') {
      indexedDB.deleteDatabase(DB_NAME);
    }
  }
}

// ============================================================================
// Pending Delete State (for undo functionality)
// ============================================================================

interface PendingDelete {
  card: DailyCard;
  deletedAt: number;
}

// ============================================================================
// Main Card Store - Runtime memory store (source of truth)
// ============================================================================

interface CardStore {
  // State
  cards: DailyCard[];
  pendingDeletes: PendingDelete[];
  hydrated: boolean;
  error: string | null;

  // Actions
  setHydrated: (state: boolean) => void;
  setError: (error: string | null) => void;
  setCards: (cards: DailyCard[]) => void;
  addCard: (card: DailyCard) => void;
  updateCard: (id: string, updates: Partial<DailyCard>) => void;
  deleteCard: (id: string) => void;
  softDeleteCard: (id: string) => DailyCard | undefined;
  restoreCard: (id: string) => boolean;
  removePendingDelete: (id: string) => void;
  clearAllCards: () => void;

  // Selectors
  getById: (id: string) => DailyCard | undefined;
  getCardByDate: (date: string) => DailyCard | undefined;
  getPendingDelete: (id: string) => PendingDelete | undefined;
}

export const useCardStore = create<CardStore>()((set, get) => ({
  // Initial state
  cards: [],
  pendingDeletes: [],
  hydrated: false,
  error: null,

  // Actions
  setHydrated: (state) => set({ hydrated: state }),
  setError: (error) => set({ error }),
  setCards: (cards) => set({ cards }),

  addCard: (card) => {
    set((state) => ({
      cards: [card, ...state.cards],
      error: null,
    }));
  },

  updateCard: (id, updates) => {
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === id ? { ...card, ...updates } : card
      ),
      error: null,
    }));
  },

  deleteCard: (id) =>
    set((state) => ({
      cards: state.cards.filter((card) => card.id !== id),
      pendingDeletes: state.pendingDeletes.filter((pd) => pd.card.id !== id),
      error: null,
    })),

  softDeleteCard: (id) => {
    const card = get().cards.find((c) => c.id === id);
    if (!card) return undefined;

    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
      pendingDeletes: [
        ...state.pendingDeletes,
        { card, deletedAt: Date.now() },
      ],
      error: null,
    }));
    return card;
  },

  restoreCard: (id) => {
    const pendingDelete = get().pendingDeletes.find((pd) => pd.card.id === id);
    if (!pendingDelete) return false;

    set((state) => {
      const restoredCard = pendingDelete.card;
      const newCards = [...state.cards];
      const insertIndex = newCards.findIndex(
        (c) => new Date(c.createdAt) < new Date(restoredCard.createdAt)
      );
      if (insertIndex === -1) {
        newCards.push(restoredCard);
      } else {
        newCards.splice(insertIndex, 0, restoredCard);
      }

      return {
        cards: newCards,
        pendingDeletes: state.pendingDeletes.filter((pd) => pd.card.id !== id),
        error: null,
      };
    });
    return true;
  },

  removePendingDelete: (id) =>
    set((state) => ({
      pendingDeletes: state.pendingDeletes.filter((pd) => pd.card.id !== id),
    })),

  clearAllCards: () => set({ cards: [], pendingDeletes: [] }),

  // Selectors
  getById: (id) => get().cards.find((card) => card.id === id),

  getCardByDate: (date) => {
    const targetDate = new Date(date).toDateString();
    return get().cards.find(
      (card) => new Date(card.createdAt).toDateString() === targetDate
    );
  },

  getPendingDelete: (id) => get().pendingDeletes.find((pd) => pd.card.id === id),
}));

// ============================================================================
// Settings Store - Persisted to localStorage (colorTheme, draftEntry)
// ============================================================================

interface SettingsStore {
  colorTheme: ColorTheme;
  draftEntry: DraftEntry | null;
  setColorTheme: (theme: ColorTheme) => void;
  saveDraft: (draft: Omit<DraftEntry, 'lastUpdated'>) => void;
  clearDraft: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      colorTheme: 'midnight' as ColorTheme,
      draftEntry: null,

      setColorTheme: (theme) => set({ colorTheme: theme }),

      saveDraft: (draft) => {
        set({
          draftEntry: {
            ...draft,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      clearDraft: () => set({ draftEntry: null }),
    }),
    {
      name: 'recap-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================================
// Helper to show storage errors
// ============================================================================

export function showStorageError(message: string): void {
  toast.error('Storage error', {
    description: message,
  });
}
