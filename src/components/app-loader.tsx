'use client';

import { useEffect, useState } from 'react';
import { Laugh, Smile, Meh, Frown, Angry } from 'lucide-react';
import { useCardStore } from '@/lib/store';

const MOOD_ICONS = [
  { Icon: Laugh, color: 'text-green-500' },
  { Icon: Smile, color: 'text-lime-500' },
  { Icon: Meh, color: 'text-yellow-500' },
  { Icon: Frown, color: 'text-orange-500' },
  { Icon: Angry, color: 'text-red-500' },
];

interface AppLoaderProps {
  children: React.ReactNode;
}

export function AppLoader({ children }: AppLoaderProps) {
  const { hydrated } = useCardStore();
  const [showLoader, setShowLoader] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (hydrated) {
      // Give emojis time to animate before fading out
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
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-neutral-950 transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex flex-col items-center gap-8">
            {/* Logo */}
            <div className="relative">
              <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
                RECAPP
              </h1>
            </div>

            {/* Animated mood icons with bounce */}
            <div className="flex gap-3">
              {MOOD_ICONS.map(({ Icon, color }, i) => (
                <span
                  key={i}
                  className={`animate-bounce ${color}`}
                  style={{
                    animationDelay: `${i * 100}ms`,
                    animationDuration: '0.6s',
                  }}
                >
                  <Icon className="h-7 w-7" />
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
