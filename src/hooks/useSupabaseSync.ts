'use client';

import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { useCardStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import type { DailyCard } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Helper to get untyped client for flexible queries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

export function useSupabaseSync() {
  const { user } = useAuth();
  const { cards, setCards } = useCardStore();
  const supabase = createClient() as AnySupabase;

  // Track if initial sync has been done for this session
  const hasSyncedRef = useRef(false);
  const previousUserIdRef = useRef<string | null>(null);

  // Sync local recaps to Supabase (upload local recaps that don't exist in cloud)
  const syncRecapsToCloud = useCallback(async () => {
    if (!user || cards.length === 0) return { uploaded: 0 };

    try {
      // Get existing recaps from Supabase
      const { data: cloudRecaps } = await supabase
        .from('recaps')
        .select('id, created_at')
        .eq('user_id', user.id);

      const cloudRecapIds = new Set(cloudRecaps?.map((r) => r.id) || []);

      // Find local recaps not in cloud
      const recapsToUpload = cards.filter((card) => !cloudRecapIds.has(card.id));

      if (recapsToUpload.length === 0) return { uploaded: 0 };

      // Upload missing recaps
      const { error } = await supabase.from('recaps').insert(
        recapsToUpload.map((card) => ({
          id: card.id,
          user_id: user.id,
          text: card.text,
          mood: card.mood,
          photo_url: card.photoUrl,
          blocks: card.blocks,
          created_at: card.createdAt,
        }))
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
  }, [user, cards, supabase]);

  // Fetch recaps from cloud
  const fetchRecapsFromCloud = useCallback(async (): Promise<DailyCard[]> => {
    if (!user) return [];

    try {
      const { data: cloudRecaps, error } = await supabase
        .from('recaps')
        .select('*')
        .eq('user_id', user.id)
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

  // Full sync: merge local and cloud recaps
  const performFullSync = useCallback(async () => {
    if (!user) return;

    try {
      // 1. Get cloud recaps
      const cloudRecaps = await fetchRecapsFromCloud();
      const cloudRecapIds = new Set(cloudRecaps.map((r) => r.id));

      // 2. Find local recaps that need to be uploaded (not in cloud)
      const localOnlyRecaps = cards.filter((card) => !cloudRecapIds.has(card.id));

      // 3. Upload local-only recaps to cloud
      if (localOnlyRecaps.length > 0) {
        const { error } = await supabase.from('recaps').insert(
          localOnlyRecaps.map((card) => ({
            id: card.id,
            user_id: user.id,
            text: card.text,
            mood: card.mood,
            photo_url: card.photoUrl,
            blocks: card.blocks,
            created_at: card.createdAt,
          }))
        );

        if (error) {
          console.error('Error uploading local recaps:', error);
          toast.error('Sync error', {
            description: 'Failed to upload some recaps to cloud.',
          });
        }
      }

      // 4. Merge: combine cloud recaps with local-only recaps
      const localRecapIds = new Set(cards.map((c) => c.id));
      const cloudOnlyRecaps = cloudRecaps.filter((r) => !localRecapIds.has(r.id));

      // 5. If there are cloud recaps not in local, add them
      if (cloudOnlyRecaps.length > 0 || localOnlyRecaps.length > 0) {
        // Combine all recaps, removing duplicates by id
        const allRecapsMap = new Map<string, DailyCard>();

        // Add cloud recaps first (they're the source of truth)
        cloudRecaps.forEach((recap) => allRecapsMap.set(recap.id, recap));

        // Add local recaps (will overwrite if same id - but cloud should win for existing)
        cards.forEach((card) => {
          if (!allRecapsMap.has(card.id)) {
            allRecapsMap.set(card.id, card);
          }
        });

        // Sort by createdAt descending
        const mergedRecaps = Array.from(allRecapsMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
  }, [user, cards, fetchRecapsFromCloud, setCards, supabase]);

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

  // Delete a recap from cloud
  const deleteRecapFromCloud = useCallback(
    async (cardId: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from('recaps')
          .delete()
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

  // Auto-sync on user login/change
  useEffect(() => {
    // Reset sync flag when user changes
    if (user?.id !== previousUserIdRef.current) {
      hasSyncedRef.current = false;
      previousUserIdRef.current = user?.id ?? null;
    }

    if (user && !hasSyncedRef.current) {
      hasSyncedRef.current = true;

      // Perform full sync (upload local to cloud, download cloud to local)
      performFullSync();
    }
  }, [user, performFullSync]);

  return {
    syncRecapsToCloud,
    fetchRecapsFromCloud,
    saveRecapToCloud,
    deleteRecapFromCloud,
    performFullSync,
    isAuthenticated: !!user,
  };
}
