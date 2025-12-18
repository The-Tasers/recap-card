'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { useCardStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import type { DailyCard } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SyncResolution } from '@/components/sync-conflict-dialog';

// Helper to get untyped client for flexible queries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

export interface SyncConflict {
  localCards: DailyCard[];
  cloudCards: DailyCard[];
}

export function useSupabaseSync() {
  const { user } = useAuth();
  const { setCards, hydrated } = useCardStore();
  const supabase = createClient() as AnySupabase;

  // Track if initial sync has been done for this session
  const hasSyncedRef = useRef(false);
  const previousUserIdRef = useRef<string | null>(null);

  // Conflict state
  const [syncConflict, setSyncConflict] = useState<SyncConflict | null>(null);

  // Sync local recaps to Supabase (upload local recaps that don't exist in cloud)
  const syncRecapsToCloud = useCallback(async () => {
    const localCards = useCardStore.getState().cards;
    if (!user || localCards.length === 0) return { uploaded: 0 };

    try {
      // Get existing recaps from Supabase
      const { data: cloudRecaps } = await supabase
        .from('recaps')
        .select('id, created_at')
        .eq('user_id', user.id);

      const cloudRecapIds = new Set(cloudRecaps?.map((r) => r.id) || []);

      // Find local recaps not in cloud
      const recapsToUpload = localCards.filter((card) => !cloudRecapIds.has(card.id));

      if (recapsToUpload.length === 0) return { uploaded: 0 };

      // Upload missing recaps (use upsert to handle potential duplicates)
      const { error } = await supabase.from('recaps').upsert(
        recapsToUpload.map((card) => ({
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
        console.error('Error syncing recaps:', error);
        return { uploaded: 0, error };
      }

      return { uploaded: recapsToUpload.length };
    } catch (error) {
      console.error('Error syncing recaps:', error);
      return { uploaded: 0, error };
    }
  }, [user, supabase]);

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
        toast.error('Failed to load recaps', {
          description: 'Could not fetch your recaps from cloud.',
        });
        return [];
      }

      return (cloudRecaps || []).map((recap): DailyCard => ({
        id: recap.id,
        text: recap.text,
        mood: recap.mood,
        photoUrl: recap.photo_url ?? undefined,
        blocks: recap.blocks as DailyCard['blocks'],
        createdAt: recap.created_at,
      }));
    } catch (error) {
      console.error('Error fetching recaps:', error);
      return [];
    }
  }, [user, supabase]);

  // Check for sync conflicts (both local and cloud have different data)
  const checkForConflicts = useCallback(async () => {
    if (!user) return null;

    try {
      const cloudRecaps = await fetchRecapsFromCloud();
      const localCards = useCardStore.getState().cards;

      // No conflict if either is empty
      if (localCards.length === 0 || cloudRecaps.length === 0) {
        return null;
      }

      // Check if there are differences (not just same data)
      const localIds = new Set(localCards.map((c) => c.id));
      const cloudIds = new Set(cloudRecaps.map((c) => c.id));

      const hasLocalOnly = localCards.some((c) => !cloudIds.has(c.id));
      const hasCloudOnly = cloudRecaps.some((c) => !localIds.has(c.id));

      // Conflict exists if both sides have unique data
      if (hasLocalOnly && hasCloudOnly) {
        return { localCards, cloudCards: cloudRecaps };
      }

      return null;
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      return null;
    }
  }, [user, fetchRecapsFromCloud]);

  // Resolve sync conflict based on user choice
  const resolveSyncConflict = useCallback(
    async (resolution: SyncResolution) => {
      if (!user || !syncConflict) return;

      const { localCards, cloudCards } = syncConflict;

      try {
        if (resolution === 'cloud') {
          // Use cloud data - just replace local with cloud
          setCards(cloudCards);
          toast.success('Synced from cloud', {
            description: `Loaded ${cloudCards.length} recaps from cloud.`,
          });
        } else if (resolution === 'local') {
          // Use local data - replace cloud with local
          // First, delete all cloud recaps for this user
          await supabase.from('recaps').delete().eq('user_id', user.id);

          // Then upload all local recaps
          if (localCards.length > 0) {
            await supabase.from('recaps').insert(
              localCards.map((card) => ({
                id: card.id,
                user_id: user.id,
                text: card.text,
                mood: card.mood,
                photo_url: card.photoUrl,
                blocks: card.blocks,
                created_at: card.createdAt,
              }))
            );
          }
          toast.success('Synced to cloud', {
            description: `Uploaded ${localCards.length} recaps to cloud.`,
          });
        } else if (resolution === 'merge') {
          // Merge both - combine all unique recaps
          const allRecapsMap = new Map<string, DailyCard>();

          // Add cloud recaps first
          cloudCards.forEach((recap) => allRecapsMap.set(recap.id, recap));

          // Add local recaps (won't overwrite existing)
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

          // Upload local-only recaps to cloud (use upsert to handle potential duplicates)
          const cloudIds = new Set(cloudCards.map((c) => c.id));
          const localOnlyRecaps = localCards.filter((c) => !cloudIds.has(c.id));

          if (localOnlyRecaps.length > 0) {
            await supabase.from('recaps').upsert(
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
          }

          toast.success('Recaps merged', {
            description: `You now have ${mergedRecaps.length} recaps.`,
          });
        }

        // Clear conflict state
        setSyncConflict(null);
      } catch (error) {
        console.error('Error resolving sync conflict:', error);
        toast.error('Sync failed', {
          description: 'Could not sync your recaps. Please try again.',
        });
      }
    },
    [user, syncConflict, setCards, supabase]
  );

  // Full sync: merge local and cloud recaps (used when no conflict or auto-merge)
  const performFullSync = useCallback(async () => {
    if (!user) return;

    try {
      // 1. Get cloud recaps (excluding soft-deleted ones)
      const cloudRecaps = await fetchRecapsFromCloud();
      const cloudRecapIds = new Set(cloudRecaps.map((r) => r.id));

      // 2. Get fresh local cards from store (avoid stale closure)
      const localCards = useCardStore.getState().cards;

      // 3. Check for conflict - if both have data and they're not identical, show dialog
      const localIds = new Set(localCards.map((c) => c.id));
      const hasLocalOnly = localCards.some((c) => !cloudRecapIds.has(c.id));
      const hasCloudOnly = cloudRecaps.some((c) => !localIds.has(c.id));

      // Show conflict dialog if both local and cloud have data that differs
      // This includes: different entries, same-day entries with different IDs, etc.
      if (localCards.length > 0 && cloudRecaps.length > 0 && (hasLocalOnly || hasCloudOnly)) {
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
          toast.error('Sync error', {
            description: 'Failed to upload some recaps to cloud.',
          });
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

      return { uploaded: localOnlyRecaps.length, downloaded: cloudOnlyRecaps.length };
    } catch (error) {
      console.error('Error during full sync:', error);
      toast.error('Sync failed', {
        description: 'Could not sync your recaps. Please try again.',
      });
      return { uploaded: 0, downloaded: 0 };
    }
  }, [user, fetchRecapsFromCloud, setCards, supabase]);

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
      performFullSync();
    }
  }, [user, hydrated, performFullSync]);

  return {
    syncRecapsToCloud,
    fetchRecapsFromCloud,
    saveRecapToCloud,
    deleteRecapFromCloud,
    restoreRecapInCloud,
    permanentlyDeleteRecapFromCloud,
    performFullSync,
    checkForConflicts,
    resolveSyncConflict,
    syncConflict,
    isAuthenticated: !!user,
  };
}
