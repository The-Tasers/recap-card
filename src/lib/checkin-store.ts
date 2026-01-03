'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Day, CheckIn, ExpectationTone } from './types';

// ============================================================================
// IndexedDB Storage Keys
// ============================================================================

const DB_NAME = 'recapz-db';
const STORE_NAME = 'recapz-store';
const DB_VERSION = 3; // Must match version in store.ts
const LOCAL_DAYS_KEY = 'local-days';
const LOCAL_CHECKINS_KEY = 'local-checkins';

// ============================================================================
// IndexedDB Helpers
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

async function loadFromDB<T>(key: string, defaultValue: T): Promise<T> {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => {
        console.error(`Failed to load ${key}:`, request.error);
        resolve(defaultValue);
      };

      request.onsuccess = () => {
        const data = request.result;
        resolve(data ?? defaultValue);
      };
    });
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    return defaultValue;
  }
}

async function saveToDB<T>(key: string, data: T): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, key);

      request.onerror = () => {
        console.error(`Failed to save ${key}:`, request.error);
        reject(request.error);
      };

      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function generateId(): string {
  return uuidv4();
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // YYYY-MM-DD in local timezone
}

export function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // YYYY-MM-DD in local timezone
}

// ============================================================================
// Check-in Store Interface
// ============================================================================

interface CheckInStore {
  // State
  days: Day[];
  checkIns: CheckIn[];
  hydrated: boolean;

  // Actions - Days
  getOrCreateToday: () => Day;
  getDayByDate: (date: string) => Day | undefined;
  setMorningExpectation: (dayId: string, tone: ExpectationTone) => void;

  // Actions - Check-ins
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => CheckIn;
  updateCheckIn: (id: string, updates: Partial<CheckIn>) => void;
  deleteCheckIn: (id: string) => void;

  // Actions - Store
  setHydrated: (state: boolean) => void;
  clearAllData: () => void;

  // Selectors
  getTodayCheckIns: () => CheckIn[];
  getCheckInsForDay: (dayId: string) => CheckIn[];
  getToday: () => Day | undefined;
}

// ============================================================================
// Check-in Store Implementation
// ============================================================================

export const useCheckInStore = create<CheckInStore>()((set, get) => ({
  // Initial state
  days: [],
  checkIns: [],
  hydrated: false,

  // ============================================================================
  // Day Actions
  // ============================================================================

  getOrCreateToday: () => {
    const todayDate = getTodayDateString();
    let today = get().days.find((d) => d.date === todayDate);

    if (!today) {
      today = {
        id: generateId(),
        date: todayDate,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        days: [today!, ...state.days],
      }));
      // Persist to IndexedDB
      saveToDB(LOCAL_DAYS_KEY, get().days);
    }

    return today;
  },

  getDayByDate: (date: string) => {
    return get().days.find((d) => d.date === date);
  },

  setMorningExpectation: (dayId: string, tone: ExpectationTone) => {
    set((state) => ({
      days: state.days.map((d) =>
        d.id === dayId ? { ...d, morningExpectationTone: tone } : d
      ),
    }));
    saveToDB(LOCAL_DAYS_KEY, get().days);
  },

  // ============================================================================
  // Check-in Actions
  // ============================================================================

  addCheckIn: (checkInData) => {
    const checkIn: CheckIn = {
      id: generateId(),
      ...checkInData,
    };

    set((state) => ({
      checkIns: [checkIn, ...state.checkIns],
    }));
    saveToDB(LOCAL_CHECKINS_KEY, get().checkIns);

    return checkIn;
  },

  updateCheckIn: (id, updates) => {
    set((state) => ({
      checkIns: state.checkIns.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    saveToDB(LOCAL_CHECKINS_KEY, get().checkIns);
  },

  deleteCheckIn: (id) => {
    set((state) => ({
      checkIns: state.checkIns.filter((c) => c.id !== id),
    }));
    saveToDB(LOCAL_CHECKINS_KEY, get().checkIns);
  },

  // ============================================================================
  // Store Actions
  // ============================================================================

  setHydrated: (state) => set({ hydrated: state }),

  clearAllData: () => {
    set({
      days: [],
      checkIns: [],
    });
    saveToDB(LOCAL_DAYS_KEY, []);
    saveToDB(LOCAL_CHECKINS_KEY, []);
  },

  // ============================================================================
  // Selectors
  // ============================================================================

  getToday: () => {
    const todayDate = getTodayDateString();
    return get().days.find((d) => d.date === todayDate);
  },

  getTodayCheckIns: () => {
    const today = get().getToday();
    if (!today) return [];
    return get()
      .checkIns.filter((c) => c.dayId === today.id)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  },

  getCheckInsForDay: (dayId: string) => {
    return get()
      .checkIns.filter((c) => c.dayId === dayId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  },
}));

// ============================================================================
// Hydration Function
// ============================================================================

export async function hydrateCheckInStore(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Skip if already hydrated (e.g., after navigation)
  if (useCheckInStore.getState().hydrated) {
    return;
  }

  try {
    const [days, checkIns] = await Promise.all([
      loadFromDB<Day[]>(LOCAL_DAYS_KEY, []),
      loadFromDB<CheckIn[]>(LOCAL_CHECKINS_KEY, []),
    ]);

    useCheckInStore.setState({
      days,
      checkIns,
      hydrated: true,
    });
  } catch (error) {
    console.error('Failed to hydrate check-in store:', error);
    useCheckInStore.setState({ hydrated: true });
  }
}

// ============================================================================
// Local Storage for Check-in Draft (for in-progress check-ins)
// ============================================================================

export interface CheckInDraft {
  stateId?: string;
  contextId?: string;
  personId?: string;
  note?: string;
  lastUpdated: string;
}

interface CheckInDraftStore {
  draft: CheckInDraft | null;
  saveDraft: (draft: Omit<CheckInDraft, 'lastUpdated'>) => void;
  clearDraft: () => void;
}

export const useCheckInDraftStore = create<CheckInDraftStore>()(
  persist(
    (set) => ({
      draft: null,

      saveDraft: (draft) => {
        set({
          draft: {
            ...draft,
            lastUpdated: new Date().toISOString(),
          },
        });
      },

      clearDraft: () => set({ draft: null }),
    }),
    {
      name: 'checkin-draft',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
