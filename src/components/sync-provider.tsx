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
import { useCardStore } from '@/lib/store';
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
  const { user } = useAuth();
  const { setCards, hydrated } = useCardStore();
  const supabase = createClient() as AnySupabase;

  // Track if initial sync has been done for this session
  const hasSyncedRef = useRef(false);
  const previousUserIdRef = useRef<string | null>(null);

  // Conflict state
  const [syncConflict, setSyncConflict] = useState<SyncConflict | null>(null);

  // Sync notification state (replaces toasts)
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

      try {
        if (resolution === 'cloud') {
          // Use cloud data - just replace local with cloud
          setCards(cloudCards);
          showSyncNotification(
            'success',
            `Synced ${pluralize(
              cloudCards.length,
              'recap',
              'recaps'
            )} from cloud`
          );
        } else if (resolution === 'local') {
          // Use local data - sync to cloud based on ID and date matching
          const getDateStr = (card: DailyCard) =>
            new Date(card.createdAt).toISOString().split('T')[0];

          console.log('[Sync] Resolution: local');
          console.log(
            '[Sync] Local cards:',
            localCards.map((c) => ({
              id: c.id,
              date: getDateStr(c),
              text: c.text.slice(0, 20),
            }))
          );
          console.log(
            '[Sync] Cloud cards:',
            cloudCards.map((c) => ({
              id: c.id,
              date: getDateStr(c),
              text: c.text.slice(0, 20),
            }))
          );

          // Build maps for comparison
          const localById = new Map(localCards.map((c) => [c.id, c]));
          const localByDate = new Map(
            localCards.map((c) => [getDateStr(c), c])
          );
          const cloudById = new Map(cloudCards.map((c) => [c.id, c]));
          const cloudByDate = new Map(
            cloudCards.map((c) => [getDateStr(c), c])
          );

          const toUpsert: DailyCard[] = [];
          const toDelete: string[] = [];

          // Process each local card
          for (const localCard of localCards) {
            const localDate = getDateStr(localCard);
            const cloudCardSameId = cloudById.get(localCard.id);
            const cloudCardSameDate = cloudByDate.get(localDate);

            if (cloudCardSameId) {
              // Same ID exists in cloud - update it
              console.log(
                `[Sync] Card ${localCard.id}: same ID in cloud, will update`
              );
              toUpsert.push(localCard);
            } else if (
              cloudCardSameDate &&
              cloudCardSameDate.id !== localCard.id
            ) {
              // Different ID but same date - delete cloud card, insert local
              console.log(
                `[Sync] Card ${localCard.id}: same date ${localDate}, different cloud ID ${cloudCardSameDate.id}, will delete cloud and insert local`
              );
              toDelete.push(cloudCardSameDate.id);
              toUpsert.push(localCard);
            } else {
              // New date - just insert
              console.log(
                `[Sync] Card ${localCard.id}: new date ${localDate}, will insert`
              );
              toUpsert.push(localCard);
            }
          }

          // Find cloud cards that don't have matching local cards (by ID or date)
          for (const cloudCard of cloudCards) {
            const cloudDate = getDateStr(cloudCard);
            const hasLocalSameId = localById.has(cloudCard.id);
            const hasLocalSameDate = localByDate.has(cloudDate);

            if (!hasLocalSameId && !hasLocalSameDate) {
              // Cloud card has no matching local card - delete it
              console.log(
                `[Sync] Cloud card ${cloudCard.id}: no matching local (date ${cloudDate}), will delete`
              );
              toDelete.push(cloudCard.id);
            }
          }

          console.log(
            '[Sync] To upsert:',
            toUpsert.length,
            'To delete:',
            toDelete.length
          );

          // Delete cloud cards that need to be removed
          if (toDelete.length > 0) {
            const uniqueDeletes = [...new Set(toDelete)];
            console.log('[Sync] Deleting cloud cards:', uniqueDeletes);
            const { error: deleteError } = await supabase
              .from('recaps')
              .update({ deleted_at: new Date().toISOString() })
              .in('id', uniqueDeletes);

            if (deleteError) {
              console.error('[Sync] Delete error:', deleteError);
            } else {
              console.log('[Sync] Delete success');
            }
          }

          // Upsert local cards to cloud
          if (toUpsert.length > 0) {
            console.log(
              '[Sync] Upserting cards:',
              toUpsert.map((c) => c.id)
            );
            const { error: upsertError, data: upsertData } = await supabase
              .from('recaps')
              .upsert(
                toUpsert.map((card) => ({
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
            console.log('[Sync] Upsert success:', upsertData);
          }

          showSyncNotification(
            'success',
            `Synced ${pluralize(localCards.length, 'recap', 'recaps')} to cloud`
          );
        }

        // Clear conflict state
        setSyncConflict(null);
      } catch (error) {
        console.error('Error resolving sync conflict:', error);
        showSyncNotification('error', 'Sync failed');
      }
    },
    [user, syncConflict, setCards, supabase, showSyncNotification]
  );

  // Full sync: merge local and cloud recaps (used when no conflict or auto-merge)
  const performFullSync = useCallback(async () => {
    if (!user) return;

    const getDateStr = (card: DailyCard) =>
      new Date(card.createdAt).toISOString().split('T')[0];

    try {
      // 1. Get cloud recaps (excluding soft-deleted ones)
      const cloudRecaps = await fetchRecapsFromCloud();
      const cloudRecapIds = new Set(cloudRecaps.map((r) => r.id));

      // 2. Get fresh local cards from store (avoid stale closure)
      const localCards = useCardStore.getState().cards;

      // 3. Check for conflict - compare IDs and content
      const localIds = new Set(localCards.map((c) => c.id));
      const hasLocalOnly = localCards.some((c) => !cloudRecapIds.has(c.id));
      const hasCloudOnly = cloudRecaps.some((c) => !localIds.has(c.id));

      // Normalize blocks for comparison - handle undefined/null and sort by blockId for consistent comparison
      const normalizeBlocks = (blocks: DailyCard['blocks']): string => {
        if (!blocks || blocks.length === 0) return '[]';
        // Sort blocks by blockId for consistent comparison, normalize values
        const sorted = [...blocks].sort((a, b) =>
          a.blockId.localeCompare(b.blockId)
        );
        // Normalize each block to handle undefined/null differences
        const normalized = sorted.map((block) => ({
          id: block.id,
          blockId: block.blockId,
          type: block.type,
          label: block.label,
          value: block.value ?? null,
          order: block.order,
          icon: block.icon ?? null,
          weatherCondition: block.weatherCondition ?? null,
          temperature: block.temperature ?? null,
          temperatureUnit: block.temperatureUnit ?? null,
        }));
        return JSON.stringify(normalized);
      };

      // Check if any shared cards have different content
      const cloudCardsMap = new Map(cloudRecaps.map((c) => [c.id, c]));
      const hasContentDifference = localCards.some((localCard) => {
        const cloudCard = cloudCardsMap.get(localCard.id);
        if (!cloudCard) return false; // Different IDs handled by hasLocalOnly/hasCloudOnly

        // Compare content fields
        const textDiff = localCard.text !== cloudCard.text;
        const moodDiff = localCard.mood !== cloudCard.mood;
        const photoDiff =
          (localCard.photoUrl ?? null) !== (cloudCard.photoUrl ?? null);
        const localBlocksNormalized = normalizeBlocks(localCard.blocks);
        const cloudBlocksNormalized = normalizeBlocks(cloudCard.blocks);
        const blocksDiff = localBlocksNormalized !== cloudBlocksNormalized;

        return textDiff || moodDiff || photoDiff || blocksDiff;
      });

      // Show conflict dialog if there are any differences (IDs or content)
      const hasConflict =
        localCards.length > 0 &&
        cloudRecaps.length > 0 &&
        (hasLocalOnly || hasCloudOnly || hasContentDifference);

      if (hasConflict) {
        setSyncConflict({ localCards, cloudCards: cloudRecaps });
        return { conflict: true };
      }

      // 4. No conflict - either one side is empty, or they have identical data
      // Find local recaps that need to be uploaded (not in cloud)
      const localOnlyRecaps = localCards.filter(
        (card) => !cloudRecapIds.has(card.id)
      );

      // 5. Upload local-only recaps to cloud (use upsert to handle potential duplicates)
      if (localOnlyRecaps.length > 0) {
        const { error } = await supabase.from('recaps').upsert(
          localOnlyRecaps.map((card) => ({
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

      // 6. Merge: combine cloud recaps with local-only recaps
      const cloudOnlyRecaps = cloudRecaps.filter((r) => !localIds.has(r.id));

      // 7. If there are cloud recaps not in local, add them
      if (cloudOnlyRecaps.length > 0 || localOnlyRecaps.length > 0) {
        // Combine all recaps, removing duplicates by id
        const allRecapsMap = new Map<string, DailyCard>();

        // Add cloud recaps first (they're the source of truth)
        cloudRecaps.forEach((recap) => allRecapsMap.set(recap.id, recap));

        // Add local-only recaps (ones not in cloud yet)
        localCards.forEach((card) => {
          if (!allRecapsMap.has(card.id)) {
            allRecapsMap.set(card.id, card);
          }
        });

        // Sort by createdAt descending
        const mergedRecaps = Array.from(allRecapsMap.values()).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Update local store
        setCards(mergedRecaps);
      }

      return {
        uploaded: localOnlyRecaps.length,
        downloaded: cloudOnlyRecaps.length,
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

  // Soft delete a recap from cloud (set deleted_at timestamp)
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

  // Restore a soft-deleted recap (clear deleted_at)
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

  // Auto-sync on user login/change (only after store is hydrated)
  useEffect(() => {
    // Reset sync flag when user changes
    if (user?.id !== previousUserIdRef.current) {
      hasSyncedRef.current = false;
      previousUserIdRef.current = user?.id ?? null;
    }

    // Wait for store to hydrate before syncing to ensure local cards are loaded
    if (user && hydrated && !hasSyncedRef.current) {
      hasSyncedRef.current = true;

      // Perform full sync (upload local to cloud, download cloud to local)
      // Use setTimeout to avoid calling setState synchronously within effect
      setTimeout(() => {
        performFullSync();
      }, 0);
    }
  }, [user, hydrated, performFullSync]);

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
        localCount={syncConflict?.localCards.length ?? 0}
        cloudCount={syncConflict?.cloudCards.length ?? 0}
        onResolve={resolveSyncConflict}
      />
    </SyncContext.Provider>
  );
}
