'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { DailyCard, Mood, CardBlock, BlockId } from './types';

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

// Error codes and messages
export const STORAGE_ERROR_CODES = {
  DB_NOT_AVAILABLE: 'DB_NOT_AVAILABLE',
  DB_OPEN_FAILED: 'DB_OPEN_FAILED',
  DB_READ_FAILED: 'DB_READ_FAILED',
  DB_WRITE_FAILED: 'DB_WRITE_FAILED',
  DB_DELETE_FAILED: 'DB_DELETE_FAILED',
  DB_CLEAR_FAILED: 'DB_CLEAR_FAILED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  MIGRATION_FAILED: 'MIGRATION_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type StorageErrorCode = typeof STORAGE_ERROR_CODES[keyof typeof STORAGE_ERROR_CODES];

const ERROR_MESSAGES: Record<StorageErrorCode, { title: string; description: string }> = {
  [STORAGE_ERROR_CODES.DB_NOT_AVAILABLE]: {
    title: 'Storage unavailable',
    description: 'Your browser doesn\'t support local storage. Data won\'t be saved.',
  },
  [STORAGE_ERROR_CODES.DB_OPEN_FAILED]: {
    title: 'Storage error',
    description: 'Failed to open storage. Try refreshing the page.',
  },
  [STORAGE_ERROR_CODES.DB_READ_FAILED]: {
    title: 'Read error',
    description: 'Failed to load your data. Try refreshing the page.',
  },
  [STORAGE_ERROR_CODES.DB_WRITE_FAILED]: {
    title: 'Save error',
    description: 'Failed to save your data. Please try again.',
  },
  [STORAGE_ERROR_CODES.DB_DELETE_FAILED]: {
    title: 'Delete error',
    description: 'Failed to delete data. Please try again.',
  },
  [STORAGE_ERROR_CODES.DB_CLEAR_FAILED]: {
    title: 'Clear error',
    description: 'Failed to clear data. Please try again.',
  },
  [STORAGE_ERROR_CODES.QUOTA_EXCEEDED]: {
    title: 'Storage full',
    description: 'Storage limit reached. Try removing some old recaps or photos.',
  },
  [STORAGE_ERROR_CODES.MIGRATION_FAILED]: {
    title: 'Migration error',
    description: 'Failed to migrate your data. Some recaps may be missing.',
  },
  [STORAGE_ERROR_CODES.UNKNOWN_ERROR]: {
    title: 'Unexpected error',
    description: 'Something went wrong. Please try again.',
  },
};

// Storage error class
export class StorageError extends Error {
  code: StorageErrorCode;
  originalError?: unknown;

  constructor(code: StorageErrorCode, originalError?: unknown) {
    const message = ERROR_MESSAGES[code];
    super(message.description);
    this.name = 'StorageError';
    this.code = code;
    this.originalError = originalError;
  }

  get title(): string {
    return ERROR_MESSAGES[this.code].title;
  }

  get description(): string {
    return ERROR_MESSAGES[this.code].description;
  }
}

// Show error toast
function showStorageError(error: StorageError): void {
  toast.error(error.title, {
    description: error.description,
  });
}

// Determine error code from IndexedDB error
function getErrorCode(error: unknown): StorageErrorCode {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError') {
      return STORAGE_ERROR_CODES.QUOTA_EXCEEDED;
    }
    if (error.name === 'NotFoundError') {
      return STORAGE_ERROR_CODES.DB_NOT_AVAILABLE;
    }
  }
  return STORAGE_ERROR_CODES.UNKNOWN_ERROR;
}

interface CardStore {
  cards: DailyCard[];
  hydrated: boolean;
  error: string | null;
  draftEntry: DraftEntry | null;
  setHydrated: (state: boolean) => void;
  setError: (error: string | null) => void;
  addCard: (card: DailyCard) => boolean;
  updateCard: (id: string, updates: Partial<DailyCard>) => boolean;
  deleteCard: (id: string) => void;
  getById: (id: string) => DailyCard | undefined;
  getCardByDate: (date: string) => DailyCard | undefined;
  setCards: (cards: DailyCard[]) => void;
  saveDraft: (draft: Omit<DraftEntry, 'lastUpdated'>) => void;
  clearDraft: () => void;
}

// IndexedDB helpers
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new StorageError(STORAGE_ERROR_CODES.DB_NOT_AVAILABLE));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      const error = new StorageError(STORAGE_ERROR_CODES.DB_OPEN_FAILED, request.error);
      console.error('IndexedDB open error:', request.error);
      reject(error);
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

async function getFromDB(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => {
        const error = new StorageError(STORAGE_ERROR_CODES.DB_READ_FAILED, request.error);
        console.error('IndexedDB read error:', request.error);
        reject(error);
      };

      request.onsuccess = () => resolve(request.result ?? null);
    });
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(STORAGE_ERROR_CODES.DB_READ_FAILED, error);
  }
}

async function setToDB(key: string, value: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onerror = () => {
        const code = getErrorCode(request.error);
        const error = new StorageError(code, request.error);
        console.error('IndexedDB write error:', request.error);
        reject(error);
      };

      request.onsuccess = () => resolve();
    });
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    const code = getErrorCode(error);
    throw new StorageError(code, error);
  }
}

async function removeFromDB(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => {
        const error = new StorageError(STORAGE_ERROR_CODES.DB_DELETE_FAILED, request.error);
        console.error('IndexedDB delete error:', request.error);
        reject(error);
      };

      request.onsuccess = () => resolve();
    });
  } catch (error) {
    // Log but don't throw on delete errors
    console.error('IndexedDB remove error:', error);
  }
}

// Clear IndexedDB - exported for use in settings
export async function clearIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => {
        const error = new StorageError(STORAGE_ERROR_CODES.DB_CLEAR_FAILED, request.error);
        console.error('IndexedDB clear error:', request.error);
        showStorageError(error);
        reject(error);
      };

      request.onsuccess = () => resolve();
    });
  } catch (error) {
    // Fallback: try to delete the whole database
    if (typeof window !== 'undefined') {
      indexedDB.deleteDatabase(DB_NAME);
    }
    if (error instanceof StorageError) {
      showStorageError(error);
    }
  }
}

// Custom IndexedDB storage adapter for Zustand
const indexedDBStorage: StateStorage = {
  getItem: async (name) => {
    if (typeof window === 'undefined') return null;

    try {
      // Try IndexedDB first
      const idbValue = await getFromDB(name);
      if (idbValue) return idbValue;

      // Fallback: migrate from localStorage if exists
      try {
        const lsValue = localStorage.getItem(name);
        if (lsValue) {
          // Migrate to IndexedDB
          await setToDB(name, lsValue);
          localStorage.removeItem(name);
          return lsValue;
        }
      } catch (migrationError) {
        const error = new StorageError(STORAGE_ERROR_CODES.MIGRATION_FAILED, migrationError);
        console.error('Migration error:', migrationError);
        showStorageError(error);
      }

      return null;
    } catch (error) {
      if (error instanceof StorageError) {
        showStorageError(error);
      }
      return null;
    }
  },

  setItem: async (name, value) => {
    if (typeof window === 'undefined') return;

    try {
      await setToDB(name, value);
    } catch (error) {
      if (error instanceof StorageError) {
        showStorageError(error);
      }
      throw error;
    }
  },

  removeItem: async (name) => {
    if (typeof window === 'undefined') return;
    await removeFromDB(name);
  },
};

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],
      hydrated: false,
      error: null,
      draftEntry: null,
      setHydrated: (state) => set({ hydrated: state }),
      setError: (error) => set({ error }),
      setCards: (cards) => set({ cards }),
      addCard: (card) => {
        try {
          set((state) => ({
            cards: [card, ...state.cards],
            error: null,
          }));
          return true;
        } catch (error) {
          const storageError = new StorageError(STORAGE_ERROR_CODES.QUOTA_EXCEEDED, error);
          showStorageError(storageError);
          set({ error: storageError.description });
          return false;
        }
      },
      updateCard: (id, updates) => {
        try {
          set((state) => ({
            cards: state.cards.map((card) =>
              card.id === id ? { ...card, ...updates } : card
            ),
            error: null,
          }));
          return true;
        } catch (error) {
          const storageError = new StorageError(STORAGE_ERROR_CODES.QUOTA_EXCEEDED, error);
          showStorageError(storageError);
          set({ error: storageError.description });
          return false;
        }
      },
      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
          error: null,
        })),
      getById: (id) => get().cards.find((card) => card.id === id),
      getCardByDate: (date) => {
        const targetDate = new Date(date).toDateString();
        return get().cards.find(
          (card) => new Date(card.createdAt).toDateString() === targetDate
        );
      },
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
      name: 'recap-cards',
      storage: createJSONStorage(() => indexedDBStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
