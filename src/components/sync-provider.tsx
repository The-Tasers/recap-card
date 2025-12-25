'use client';

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@/components/auth-provider';
import { useCardStore, loadLocalCards, clearLocalCards } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import type { DailyCard, Mood } from '@/lib/types';
import { MAX_RECAPS } from '@/lib/types';
import { uploadDataUrlImage, isDataUrl } from '@/lib/supabase/storage';

// Valid mood values for database constraint
const VALID_MOODS: Mood[] = ['great', 'good', 'okay', 'low', 'rough'];
const isValidMood = (mood: unknown): mood is Mood =>
  typeof mood === 'string' && VALID_MOODS.includes(mood as Mood);
import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

// Helper for pluralization
const pluralize = (count: number, singular: string, plural: string) =>
  count === 1 ? `${count} ${singular}` : `${count} ${plural}`;

export type SyncNotification = {
  type: 'success' | 'error';
  message: string;
} | null;

interface SyncContextValue {
  saveRecapToCloud: (card: DailyCard) => Promise<boolean>;
  deleteRecapFromCloud: (cardId: string) => Promise<boolean>;
  restoreRecapInCloud: (cardId: string) => Promise<boolean>;
  permanentlyDeleteRecapFromCloud: (cardId: string) => Promise<boolean>;
  isAuthenticated: boolean;
  syncNotification: SyncNotification;
  showNotification: (type: 'success' | 'error', message: string) => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within SyncProvider');
  }
  return context;
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { setCards, setHydrated } = useCardStore();
  const supabase = createClient() as AnySupabase;

  // Track if initial sync has been done for this session
  const hasSyncedRef = useRef(false);
  const previousUserIdRef = useRef<string | null>(null);

  // Sync notification state
  const [syncNotification, setSyncNotification] =
    useState<SyncNotification>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show a sync notification that auto-dismisses
  const showSyncNotification = useCallback(
    (type: 'success' | 'error', message: string) => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      setSyncNotification({ type, message });
      notificationTimeoutRef.current = setTimeout(() => {
        setSyncNotification(null);
      }, 3000);
    },
    []
  );

  // Fetch recaps from cloud (excluding soft-deleted)
  const fetchRecapsFromCloud = useCallback(async (): Promise<DailyCard[]> => {
    if (!user) return [];

    try {
      const { data: cloudRecaps, error } = await supabase
        .from('recaps')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recaps:', error);
        showSyncNotification('error', 'Failed to load recaps');
        return [];
      }

      return (cloudRecaps || []).map(
        (recap): DailyCard => ({
          id: recap.id,
          text: recap.text,
          mood: recap.mood,
          photoUrl: recap.photo_url ?? undefined,
          blocks: recap.blocks as DailyCard['blocks'],
          createdAt: recap.created_at,
        })
      );
    } catch (error) {
      console.error('Error fetching recaps:', error);
      return [];
    }
  }, [user, supabase, showSyncNotification]);

  // Full sync: cloud is source of truth, merge local cards for missing dates
  // Flow:
  // 1. Load cloud recaps
  // 2. Check local - if have recaps for dates not in cloud, upload them
  // 3. Load again from cloud and show final list
  const performFullSync = useCallback(
    async (localCards: DailyCard[]) => {
      if (!user) return;

      const getDateStr = (card: DailyCard) =>
        new Date(card.createdAt).toISOString().split('T')[0];

      try {
        // 1. Load cloud recaps (source of truth)
        const cloudRecaps = await fetchRecapsFromCloud();

        // 2. Build set of dates that exist in cloud
        const cloudDates = new Set<string>();
        cloudRecaps.forEach((card) => cloudDates.add(getDateStr(card)));

        // 3. Find local recaps for dates that don't exist in cloud
        // Also filter out cards with invalid mood values
        const localOnlyCards = localCards.filter(
          (card) => !cloudDates.has(getDateStr(card)) && isValidMood(card.mood)
        );

        // 4. Upload local-only recaps to cloud (including their images)
        if (localOnlyCards.length > 0) {
          // First, upload any local data URL images to cloud storage
          const cardsWithUploadedImages = await Promise.all(
            localOnlyCards.map(async (card) => {
              if (card.photoUrl && isDataUrl(card.photoUrl)) {
                // Upload the data URL image to Supabase storage
                const { url, error } = await uploadDataUrlImage(
                  card.photoUrl,
                  user.id
                );
                if (error) {
                  console.error('Error uploading image for card:', card.id, error);
                  // Keep the data URL if upload fails (will be lost but recap is saved)
                  return { ...card, photoUrl: undefined };
                }
                return { ...card, photoUrl: url ?? undefined };
              }
              return card;
            })
          );

          const { error } = await supabase.from('recaps').upsert(
            cardsWithUploadedImages.map((card) => ({
              id: card.id,
              user_id: user.id,
              text: card.text,
              mood: card.mood,
              photo_url: card.photoUrl,
              blocks: card.blocks,
              created_at: card.createdAt,
            })),
            { onConflict: 'id' }
          );

          if (error) {
            console.error('Error uploading local recaps:', error);
            showSyncNotification('error', 'Failed to upload');
          }
        }

        // 5. Load final list from cloud (to ensure consistency)
        const finalRecaps =
          localOnlyCards.length > 0
            ? await fetchRecapsFromCloud()
            : cloudRecaps;

        // 6. Clear local IndexedDB - cloud is now source of truth
        await clearLocalCards();

        // 7. Update memory store with final cloud data
        setCards(finalRecaps);

        // 8. Show notification if we synced anything
        if (localOnlyCards.length > 0) {
          showSyncNotification(
            'success',
            `Synced ${pluralize(finalRecaps.length, 'recap', 'recaps')}`
          );
        }

        return {
          uploaded: localOnlyCards.length,
          total: finalRecaps.length,
        };
      } catch (error) {
        console.error('Error during full sync:', error);
        showSyncNotification('error', 'Sync failed');
        return { uploaded: 0, total: 0 };
      }
    },
    [user, fetchRecapsFromCloud, setCards, supabase, showSyncNotification]
  );

  // Save a single recap to cloud (with limit check for new recaps)
  const saveRecapToCloud = useCallback(
    async (card: DailyCard) => {
      if (!user) return false;

      try {
        // Check if this is a new recap (not an update)
        const { data: existing } = await supabase
          .from('recaps')
          .select('id')
          .eq('id', card.id)
          .single();

        // If it's a new recap, check the limit
        if (!existing) {
          const { count } = await supabase
            .from('recaps')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .is('deleted_at', null);

          if (count !== null && count >= MAX_RECAPS) {
            showSyncNotification('error', 'Limit reached. Remove an older day first.');
            return false;
          }
        }

        const { error } = await supabase.from('recaps').upsert({
          id: card.id,
          user_id: user.id,
          text: card.text,
          mood: card.mood,
          photo_url: card.photoUrl,
          blocks: card.blocks,
          created_at: card.createdAt,
        });

        if (error) {
          console.error('Error saving recap:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error saving recap:', error);
        return false;
      }
    },
    [user, supabase, showSyncNotification]
  );

  // Soft delete a recap from cloud
  const deleteRecapFromCloud = useCallback(
    async (cardId: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from('recaps')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', cardId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting recap:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error deleting recap:', error);
        return false;
      }
    },
    [user, supabase]
  );

  // Restore a soft-deleted recap
  const restoreRecapInCloud = useCallback(
    async (cardId: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from('recaps')
          .update({ deleted_at: null })
          .eq('id', cardId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error restoring recap:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error restoring recap:', error);
        return false;
      }
    },
    [user, supabase]
  );

  // Permanently delete a recap from cloud
  const permanentlyDeleteRecapFromCloud = useCallback(
    async (cardId: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from('recaps')
          .delete()
          .eq('id', cardId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error permanently deleting recap:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error permanently deleting recap:', error);
        return false;
      }
    },
    [user, supabase]
  );

  // Initialize: Load local cards and sync with cloud if authenticated
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Reset sync flag when user changes
    if (user?.id !== previousUserIdRef.current) {
      hasSyncedRef.current = false;
      previousUserIdRef.current = user?.id ?? null;
    }

    const initialize = async () => {
      // Load local cards from IndexedDB
      const localCards = await loadLocalCards();

      if (user) {
        // User is authenticated - sync with cloud
        if (!hasSyncedRef.current) {
          hasSyncedRef.current = true;
          await performFullSync(localCards);
        }
      } else {
        // User is not authenticated - use local cards
        setCards(localCards);
      }

      // Mark as hydrated
      setHydrated(true);
    };

    initialize();
  }, [user, authLoading, setCards, setHydrated, performFullSync]);

  const contextValue: SyncContextValue = {
    saveRecapToCloud,
    deleteRecapFromCloud,
    restoreRecapInCloud,
    permanentlyDeleteRecapFromCloud,
    isAuthenticated: !!user,
    syncNotification,
    showNotification: showSyncNotification,
  };

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
    </SyncContext.Provider>
  );
}
