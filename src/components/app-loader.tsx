'use client';

import { useEffect, useState } from 'react';
import { useCardStore } from '@/lib/store';

interface AppLoaderProps {
  children: React.ReactNode;
}

export function AppLoader({ children }: AppLoaderProps) {
  const { hydrated } = useCardStore();
  const [showLoader, setShowLoader] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (hydrated) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Remove loader from DOM after fade out
        setTimeout(() => setShowLoader(false), 300);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hydrated]);

  return (
    <>
      {/* Loading overlay */}
      {showLoader && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-neutral-100 dark:bg-neutral-950 transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex flex-col items-center gap-6">
            {/* Logo - matching desktop nav exactly */}
            <div className="relative animate-fade-in">
              <h1 className="relative text-4xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight inline-block">
                RECAP
                <span className="text-amber-500 absolute -right-1 -z-1">P</span>
              </h1>
            </div>

            {/* Animated mood emojis */}
            <div className="flex gap-2">
              {['😄', '🙂', '😐', '😔', '😢'].map((emoji, i) => (
                <span
                  key={emoji}
                  className="text-2xl"
                  style={{
                    opacity: 0,
                    animation: `bounceIn 0.4s ease-out ${i * 100}ms forwards`,
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content - hidden during load to prevent flash */}
      <div className={hydrated ? 'app-loaded' : 'app-loading'}>
        {children}
      </div>
    </>
  );
}
