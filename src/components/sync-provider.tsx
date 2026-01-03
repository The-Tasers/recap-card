'use client';

import { useEffect, useRef } from 'react';
import { hydrateCheckInStore } from '@/lib/checkin-store';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const isInitializedRef = useRef(false);

  // Initialize: Hydrate from IndexedDB
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    hydrateCheckInStore();
  }, []);

  return <>{children}</>;
}
