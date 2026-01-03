'use client';

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import { hydrateCheckInStore } from '@/lib/checkin-store';

export type SyncNotification = {
  type: 'success' | 'error';
  message: string;
} | null;

interface SyncContextValue {
  isSyncing: boolean;
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
  const isInitializedRef = useRef(false);
  const [isSyncing] = useState(false);

  // Sync notification state
  const [syncNotification, setSyncNotification] = useState<SyncNotification>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show a notification that auto-dismisses
  const showNotification = useCallback(
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

  // Initialize: Hydrate from IndexedDB only
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    hydrateCheckInStore();
  }, []);

  const contextValue: SyncContextValue = {
    isSyncing,
    syncNotification,
    showNotification,
  };

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
    </SyncContext.Provider>
  );
}
