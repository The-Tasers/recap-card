'use client';

import { useEffect, useState } from 'react';
import { useCardStore } from '@/lib/store';
import { AppLogo } from '@/components/app-footer';

interface AppLoaderProps {
  children: React.ReactNode;
}

export function AppLoader({ children }: AppLoaderProps) {
  const { hydrated } = useCardStore();
  const [showLoader, setShowLoader] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (hydrated) {
      // Give letters time to animate before fading out
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Remove loader from DOM after fade out
        setTimeout(() => setShowLoader(false), 300);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hydrated]);

  return (
    <>
      {/* Loading overlay */}
      {showLoader && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <AppLogo size="xl" animated />
        </div>
      )}

      {/* Main content - hidden during load to prevent flash */}
      <div className={hydrated ? 'app-loaded' : 'app-loading'}>{children}</div>
    </>
  );
}
