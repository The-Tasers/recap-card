'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ColorTheme } from './types';
import type { Language } from './i18n/translations';

const DB_NAME = 'recapz-db';
const STORE_NAME = 'recapz-store';

// ============================================================================
// IndexedDB Helpers
// ============================================================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    // Use version 3 to trigger upgrade and clean up legacy data
    const request = indexedDB.open(DB_NAME, 3);

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
};

// ============================================================================
// Settings Store - Persisted to localStorage
// ============================================================================

interface SettingsStore {
  colorTheme: ColorTheme;
  language: Language;
  setColorTheme: (theme: ColorTheme) => void;
  setLanguage: (lang: Language) => void;
}

// Helper to set language cookie (accessible from server)
function setLanguageCookie(lang: Language) {
  if (typeof document !== 'undefined') {
    // Set cookie with 1 year expiry, accessible across the site
    document.cookie = `language=${lang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  }
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      colorTheme: 'daylight' as ColorTheme,
      language: 'en' as Language,

      setColorTheme: (theme) => set({ colorTheme: theme }),
      setLanguage: (lang) => {
        setLanguageCookie(lang);
        set({ language: lang });
      },
    }),
    {
      name: 'recap-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
