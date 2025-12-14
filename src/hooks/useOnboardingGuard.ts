'use client';

import { useCardStore } from '@/lib/store';

/**
 * Returns loading state while the store is hydrating.
 * Middleware handles onboarding redirects via cookies.
 */
export function useOnboardingGuard() {
  const { hydrated } = useCardStore();

  // Return loading state while checking
  return { isChecking: !hydrated };
}
