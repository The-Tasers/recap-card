'use client';

import { useSupabaseSync } from '@/hooks/useSupabaseSync';

/**
 * SyncProvider component that initializes the Supabase sync hook.
 * This component doesn't render anything - it just ensures the sync
 * hook is active and will automatically sync on user login.
 */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  // Initialize the sync hook - this will auto-sync when user logs in
  useSupabaseSync();

  return <>{children}</>;
}
