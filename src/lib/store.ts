'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { DailyCard } from './types';

interface CardStore {
  cards: DailyCard[];
  hydrated: boolean;
  error: string | null;
  setHydrated: (state: boolean) => void;
  setError: (error: string | null) => void;
  addCard: (card: DailyCard) => boolean;
  updateCard: (id: string, updates: Partial<DailyCard>) => boolean;
  deleteCard: (id: string) => void;
  getById: (id: string) => DailyCard | undefined;
  getCardByDate: (date: string) => DailyCard | undefined;
}

// Custom storage with error handling for quota exceeded
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      // Quota exceeded - this will be caught by the store
      console.error('Storage quota exceeded:', error);
      throw error;
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // Ignore errors on remove
    }
  },
};

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],
      hydrated: false,
      error: null,
      setHydrated: (state) => set({ hydrated: state }),
      setError: (error) => set({ error }),
      addCard: (card) => {
        try {
          set((state) => ({
            cards: [card, ...state.cards],
            error: null,
          }));
          return true;
        } catch (error) {
          set({
            error:
              'Storage quota exceeded. Try removing some old entries or photos.',
          });
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
          set({
            error:
              'Storage quota exceeded. Try removing the photo or some old entries.',
          });
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
    }),
    {
      name: 'recap-cards',
      storage: createJSONStorage(() => safeLocalStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
