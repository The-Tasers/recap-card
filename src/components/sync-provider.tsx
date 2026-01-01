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
import { useCheckInStore, hydrateCheckInStore } from '@/lib/checkin-store';
import { createClient } from '@/lib/supabase/client';
import type { Day, CheckIn, Person, Context } from '@/lib/types';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

// Database error codes for translation
export type DbErrorCode =
  | 'connectionFailed'
  | 'uniqueViolation'
  | 'foreignKeyViolation'
  | 'notNullViolation'
  | 'checkViolation'
  | 'timeout'
  | 'tooManyRequests'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'conflict'
  | 'serverError'
  | 'networkError'
  | 'unknown';

/**
 * Map Supabase/Postgres error to translation code
 */
function getDbErrorCode(error: PostgrestError | Error | unknown): DbErrorCode {
  // Handle PostgrestError
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError;
    const code = pgError.code || '';
    const message = (pgError.message || '').toLowerCase();

    // PostgreSQL error codes (SQLSTATE)
    if (code.startsWith('08')) return 'connectionFailed';
    if (code === '23505') return 'uniqueViolation';
    if (code === '23503') return 'foreignKeyViolation';
    if (code === '23502') return 'notNullViolation';
    if (code === '23514') return 'checkViolation';
    if (code === '57014') return 'timeout';
    if (code === 'PGRST301') return 'timeout';
    if (code === '42501') return 'forbidden';

    // HTTP status codes in message or code
    if (message.includes('401') || code === '401') return 'unauthorized';
    if (message.includes('403') || code === '403') return 'forbidden';
    if (message.includes('404') || code === '404') return 'notFound';
    if (message.includes('409') || code === '409') return 'conflict';
    if (message.includes('429') || code === '429') return 'tooManyRequests';
    if (message.includes('500') || message.includes('502') || message.includes('503')) return 'serverError';
  }

  // Handle generic errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
      return 'networkError';
    }
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('unauthorized') || message.includes('jwt')) return 'unauthorized';
  }

  return 'unknown';
}

export type SyncNotification = {
  type: 'success' | 'error';
  message: string;
} | null;

interface SyncContextValue {
  isAuthenticated: boolean;
  isSyncing: boolean;
  syncNotification: SyncNotification;
  showNotification: (type: 'success' | 'error', message: string) => void;
  syncNow: () => Promise<void>;
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
  const { t } = useI18n();
  const supabase = createClient() as AnySupabase;

  // Get store actions
  const setHydrated = useCheckInStore((s) => s.setHydrated);

  // Track if initial sync has been done for this session
  const hasSyncedRef = useRef(false);
  const previousUserIdRef = useRef<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync notification state
  const [syncNotification, setSyncNotification] = useState<SyncNotification>(null);
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

  // Full sync: merge local and cloud data
  const performFullSync = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);

    try {
      // 1. Fetch all cloud data
      const [cloudDays, cloudCheckIns, cloudPeople, cloudContexts] = await Promise.all([
        supabase.from('days').select('*').eq('user_id', user.id),
        supabase.from('checkins').select('*').eq('user_id', user.id),
        supabase.from('people').select('*').eq('user_id', user.id),
        supabase.from('contexts').select('*').or(`user_id.eq.${user.id},is_default.eq.true`),
      ]);

      // Check for errors
      if (cloudDays.error) throw cloudDays.error;
      if (cloudCheckIns.error) throw cloudCheckIns.error;
      if (cloudPeople.error) throw cloudPeople.error;
      if (cloudContexts.error) throw cloudContexts.error;

      // 2. Get current local data directly from store (avoid stale closure)
      const currentState = useCheckInStore.getState();
      const localDays = currentState.days;
      const localCheckIns = currentState.checkIns;
      const localPeople = currentState.people;
      const localCustomContexts = currentState.customContexts;

      // 3. Merge data (cloud is source of truth, but keep local-only items)
      // Build sets of cloud IDs
      const cloudDayIds = new Set((cloudDays.data || []).map((d: { id: string }) => d.id));
      const cloudCheckInIds = new Set((cloudCheckIns.data || []).map((c: { id: string }) => c.id));
      const cloudPeopleIds = new Set((cloudPeople.data || []).map((p: { id: string }) => p.id));
      const cloudContextIds = new Set((cloudContexts.data || []).map((c: { id: string }) => c.id));

      // Find local-only items (not in cloud)
      const localOnlyDays = localDays.filter((d) => !cloudDayIds.has(d.id));
      const localOnlyCheckIns = localCheckIns.filter((c) => !cloudCheckInIds.has(c.id));
      const localOnlyPeople = localPeople.filter((p) => !cloudPeopleIds.has(p.id));
      const localOnlyContexts = localCustomContexts.filter((c) => !cloudContextIds.has(c.id));

      // 4. Upload local-only items to cloud
      if (localOnlyDays.length > 0) {
        const { error } = await supabase.from('days').upsert(
          localOnlyDays.map((d) => ({
            id: d.id,
            user_id: user.id,
            date: d.date,
            morning_expectation_tone: d.morningExpectationTone,
            created_at: d.createdAt,
          })),
          { onConflict: 'id' }
        );
        if (error) console.error('Error uploading days:', error);
      }

      if (localOnlyPeople.length > 0) {
        const { error } = await supabase.from('people').upsert(
          localOnlyPeople.map((p) => ({
            id: p.id,
            user_id: user.id,
            label: p.label,
          })),
          { onConflict: 'id' }
        );
        if (error) console.error('Error uploading people:', error);
      }

      if (localOnlyContexts.length > 0) {
        const { error } = await supabase.from('contexts').upsert(
          localOnlyContexts.map((c) => ({
            id: c.id,
            user_id: user.id,
            label: c.label,
            is_default: false,
          })),
          { onConflict: 'id' }
        );
        if (error) console.error('Error uploading contexts:', error);
      }

      if (localOnlyCheckIns.length > 0) {
        const { error } = await supabase.from('checkins').upsert(
          localOnlyCheckIns.map((c) => ({
            id: c.id,
            user_id: user.id,
            day_id: c.dayId,
            timestamp: c.timestamp,
            state_id: c.stateId,
            context_id: c.contextId,
            person_id: c.personId || null,
          })),
          { onConflict: 'id' }
        );
        if (error) console.error('Error uploading check-ins:', error);
      }

      // 5. Fetch final cloud data (includes newly uploaded)
      const [finalDays, finalCheckIns, finalPeople, finalContexts] = await Promise.all([
        supabase.from('days').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('checkins').select('*').eq('user_id', user.id).order('timestamp', { ascending: false }),
        supabase.from('people').select('*').eq('user_id', user.id),
        supabase.from('contexts').select('*').or(`user_id.eq.${user.id},is_default.eq.true`),
      ]);

      // 6. Transform and update local store
      const mergedDays: Day[] = (finalDays.data || []).map((d: {
        id: string;
        user_id: string;
        date: string;
        morning_expectation_tone: string | null;
        created_at: string;
      }) => ({
        id: d.id,
        userId: d.user_id,
        date: d.date,
        morningExpectationTone: d.morning_expectation_tone as Day['morningExpectationTone'],
        createdAt: d.created_at,
      }));

      const mergedCheckIns: CheckIn[] = (finalCheckIns.data || []).map((c: {
        id: string;
        day_id: string;
        timestamp: string;
        state_id: string;
        context_id: string;
        person_id: string | null;
        note: string | null;
      }) => ({
        id: c.id,
        dayId: c.day_id,
        timestamp: c.timestamp,
        stateId: c.state_id,
        contextId: c.context_id,
        personId: c.person_id || undefined,
      }));

      const mergedPeople: Person[] = (finalPeople.data || []).map((p: {
        id: string;
        user_id: string | null;
        label: string;
        is_default: boolean;
      }) => ({
        id: p.id,
        userId: p.user_id || undefined,
        label: p.label,
        isDefault: p.is_default,
      }));

      const mergedCustomContexts: Context[] = (finalContexts.data || [])
        .filter((c: { is_default: boolean }) => !c.is_default)
        .map((c: {
          id: string;
          label: string;
          is_default: boolean;
          user_id: string | null;
        }) => ({
          id: c.id,
          label: c.label,
          isDefault: false,
          userId: c.user_id || undefined,
        }));

      // Update store
      useCheckInStore.setState({
        days: mergedDays,
        checkIns: mergedCheckIns,
        people: mergedPeople,
        customContexts: mergedCustomContexts,
        hydrated: true,
      });

      // Show success if we uploaded anything
      const uploadedCount = localOnlyDays.length + localOnlyCheckIns.length + localOnlyPeople.length + localOnlyContexts.length;
      if (uploadedCount > 0) {
        showSyncNotification('success', t('sync.synced', { count: uploadedCount }));
      }
    } catch (error) {
      console.error('Error during sync:', error);
      const errorCode = getDbErrorCode(error);
      showSyncNotification('error', t(`db.error.${errorCode}` as TranslationKey));
    } finally {
      setIsSyncing(false);
    }
  }, [user, supabase, showSyncNotification, t]);

  // Manual sync trigger
  const syncNow = useCallback(async () => {
    if (user && !isSyncing) {
      await performFullSync();
    }
  }, [user, isSyncing, performFullSync]);

  // Initialize: Load local data and sync with cloud if authenticated
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Reset sync flag when user changes
    if (user?.id !== previousUserIdRef.current) {
      hasSyncedRef.current = false;
      previousUserIdRef.current = user?.id ?? null;
    }

    const initialize = async () => {
      // First, hydrate from IndexedDB
      await hydrateCheckInStore();

      if (user) {
        // User is authenticated - sync with cloud
        if (!hasSyncedRef.current) {
          hasSyncedRef.current = true;
          await performFullSync();
        }
      } else {
        // User is not authenticated - just use local data (already hydrated)
        setHydrated(true);
      }
    };

    initialize();
  }, [user, authLoading, setHydrated, performFullSync]);

  const contextValue: SyncContextValue = {
    isAuthenticated: !!user,
    isSyncing,
    syncNotification,
    showNotification: showSyncNotification,
    syncNow,
  };

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
    </SyncContext.Provider>
  );
}
