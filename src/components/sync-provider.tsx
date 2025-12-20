'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from '@/components/auth-provider';
import { useCardStore, loadLocalCards, clearLocalCards } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import {
  SyncConflictDialog,
  type SyncResolution,
} from '@/components/sync-conflict-dialog';
import type { DailyCard } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

// Helper for pluralization
const pluralize = (count: number, singular: string, plural: string) =>
  count === 1 ? `${count} ${singular}` : `${count} ${plural}`;

export interface SyncConflict {
  localCards: DailyCard[];
  cloudCards: DailyCard[];
  conflictCount: number;
}

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

  // Conflict state
  const [syncConflict, setSyncConflict] = useState<SyncConflict | null>(null);

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

  // Resolve sync conflict based on user choice
  const resolveSyncConflict = useCallback(
    async (resolution: SyncResolution) => {
      if (!user || !syncConflict) return;

      const { localCards, cloudCards } = syncConflict;

      const getDateStr = (card: DailyCard) =>
        new Date(card.createdAt).toISOString().split('T')[0];

      // Build maps by date
      const localByDate = new Map<string, DailyCard>();
      localCards.forEach((card) => localByDate.set(getDateStr(card), card));

      const cloudByDate = new Map<string, DailyCard>();
      cloudCards.forEach((card) => cloudByDate.set(getDateStr(card), card));

      // Find all unique dates
      const allDates = new Set([...localByDate.keys(), ...cloudByDate.keys()]);

      try {
        // Merge recaps by date based on resolution
        const mergedByDate = new Map<string, DailyCard>();
        const toUpsertToCloud: DailyCard[] = [];
        const toDeleteFromCloud: string[] = [];

        allDates.forEach((date) => {
          const localCard = localByDate.get(date);
          const cloudCard = cloudByDate.get(date);

          if (localCard && cloudCard) {
            // Conflict: same date exists in both - use chosen source
            if (resolution === 'cloud') {
              mergedByDate.set(date, cloudCard);
            } else {
              mergedByDate.set(date, localCard);
              // Need to update cloud with local version
              toUpsertToCloud.push(localCard);
              if (cloudCard.id !== localCard.id) {
                toDeleteFromCloud.push(cloudCard.id);
              }
            }
          } else if (localCard) {
            // Only in local - keep it and upload to cloud
            mergedByDate.set(date, localCard);
            toUpsertToCloud.push(localCard);
          } else if (cloudCard) {
            // Only in cloud - keep it
            mergedByDate.set(date, cloudCard);
          }
        });

        // Delete cloud cards that are being replaced
        if (toDeleteFromCloud.length > 0) {
          const { error: deleteError } = await supabase
            .from('recaps')
            .update({ deleted_at: new Date().toISOString() })
            .in('id', toDeleteFromCloud);

          if (deleteError) {
            console.error('[Sync] Delete error:', deleteError);
          }
        }

        // Upsert local cards to cloud
        if (toUpsertToCloud.length > 0) {
          const { error: upsertError } = await supabase
            .from('recaps')
            .upsert(
              toUpsertToCloud.map((card) => ({
                id: card.id,
                user_id: user.id,
                text: card.text,
                mood: card.mood,
                photo_url: card.photoUrl,
                blocks: card.blocks,
                created_at: card.createdAt,
                deleted_at: null,
              })),
              { onConflict: 'id' }
            );

          if (upsertError) {
            console.error('[Sync] Upsert error:', upsertError);
            throw upsertError;
          }
        }

        // Sort merged recaps by date descending
        const mergedRecaps = Array.from(mergedByDate.values()).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Clear local IndexedDB - cloud is now source of truth
        await clearLocalCards();

        // Update memory store
        setCards(mergedRecaps);

        showSyncNotification(
          'success',
          `Synced ${pluralize(mergedRecaps.length, 'recap', 'recaps')}`
        );

        // Clear conflict state
        setSyncConflict(null);
      } catch (error) {
        console.error('Error resolving sync conflict:', error);
        showSyncNotification('error', 'Sync failed');
      }
    },
    [user, syncConflict, setCards, supabase, showSyncNotification]
  );

  // Full sync: auto-merge local and cloud recaps by date
  const performFullSync = useCallback(async (localCards: DailyCard[]) => {
    if (!user) return;

    const getDateStr = (card: DailyCard) =>
      new Date(card.createdAt).toISOString().split('T')[0];

    try {
      // 1. Get cloud recaps (excluding soft-deleted ones)
      const cloudRecaps = await fetchRecapsFromCloud();

      // 2. Build maps by date
      const cloudByDate = new Map<string, DailyCard>();
      cloudRecaps.forEach((card) => cloudByDate.set(getDateStr(card), card));

      const localByDate = new Map<string, DailyCard>();
      localCards.forEach((card) => localByDate.set(getDateStr(card), card));

      // 3. Detect conflicts: same date with different IDs
      let conflictCount = 0;
      for (const localCard of localCards) {
        const localDate = getDateStr(localCard);
        const cloudCard = cloudByDate.get(localDate);

        // Conflict: same date, different IDs (both have active recaps)
        if (cloudCard && cloudCard.id !== localCard.id) {
          conflictCount++;
        }
      }

      // 4. If there are conflicts, show dialog
      if (conflictCount > 0) {
        setSyncConflict({ localCards, cloudCards: cloudRecaps, conflictCount });
        return { conflict: true };
      }

      // 5. No conflicts - auto-merge
      // Cloud is source of truth, only upload local cards for dates cloud doesn't have
      const mergedByDate = new Map<string, DailyCard>();

      // Start with cloud recaps
      cloudRecaps.forEach((card) => mergedByDate.set(getDateStr(card), card));

      // Add local recaps only for dates not in cloud
      const localOnlyCards: DailyCard[] = [];
      localCards.forEach((card) => {
        const date = getDateStr(card);
        if (!cloudByDate.has(date)) {
          mergedByDate.set(date, card);
          localOnlyCards.push(card);
        }
      });

      // 6. Upload local-only recaps to cloud
      if (localOnlyCards.length > 0) {
        const { error } = await supabase.from('recaps').upsert(
          localOnlyCards.map((card) => ({
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

      // 7. Sort merged recaps by date descending
      const mergedRecaps = Array.from(mergedByDate.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // 8. Clear local IndexedDB - cloud is now source of truth
      await clearLocalCards();

      // 9. Update memory store
      setCards(mergedRecaps);

      const cloudOnlyCount = cloudRecaps.filter(
        (c) => !localByDate.has(getDateStr(c))
      ).length;

      if (localOnlyCards.length > 0 || cloudOnlyCount > 0) {
        showSyncNotification(
          'success',
          `Synced ${pluralize(mergedRecaps.length, 'recap', 'recaps')}`
        );
      }

      return {
        uploaded: localOnlyCards.length,
        downloaded: cloudOnlyCount,
      };
    } catch (error) {
      console.error('Error during full sync:', error);
      showSyncNotification('error', 'Sync failed');
      return { uploaded: 0, downloaded: 0 };
    }
  }, [user, fetchRecapsFromCloud, setCards, supabase, showSyncNotification]);

  // Save a single recap to cloud
  const saveRecapToCloud = useCallback(
    async (card: DailyCard) => {
      if (!user) return false;

      try {
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
    [user, supabase]
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
      <SyncConflictDialog
        open={!!syncConflict}
        conflictCount={syncConflict?.conflictCount ?? 0}
        onResolve={resolveSyncConflict}
      />
    </SyncContext.Provider>
  );
}
