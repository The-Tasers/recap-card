'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCardStore } from '@/lib/store';

/**
 * Redirects to home page if onboarding has not been completed.
 * Use this hook in pages that should not be accessible before onboarding.
 */
export function useOnboardingGuard() {
  const router = useRouter();
  const { hasSeenOnboarding, hydrated } = useCardStore();

  useEffect(() => {
    // Wait for store to hydrate before checking
    if (!hydrated) return;

    // Redirect to home if onboarding not completed
    if (!hasSeenOnboarding) {
      router.push('/');
    }
  }, [hasSeenOnboarding, hydrated, router]);

  // Return loading state while checking
  return { isChecking: !hydrated || !hasSeenOnboarding };
}
