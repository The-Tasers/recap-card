'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DailyCard } from './types';

interface CardStore {
  cards: DailyCard[];
  hydrated: boolean;
  setHydrated: (state: boolean) => void;
  addCard: (card: DailyCard) => void;
  updateCard: (id: string, updates: Partial<DailyCard>) => void;
  deleteCard: (id: string) => void;
  getById: (id: string) => DailyCard | undefined;
  getCardByDate: (date: string) => DailyCard | undefined;
}

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],
      hydrated: false,
      setHydrated: (state) => set({ hydrated: state }),
      addCard: (card) =>
        set((state) => ({
          cards: [card, ...state.cards],
        })),
      updateCard: (id, updates) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, ...updates } : card
          ),
        })),
      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
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
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
