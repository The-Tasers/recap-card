'use client';

import { useEffect, useState } from 'react';
import { Laugh, Smile, Meh, Frown, Angry } from 'lucide-react';
import { useCardStore } from '@/lib/store';

const MOOD_ICONS = [
  { Icon: Laugh, color: 'text-emerald-500' },
  { Icon: Smile, color: 'text-green-500' },
  { Icon: Meh, color: 'text-amber-500' },
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
          <div className="flex items-center gap-1">
            {MOOD_ICONS.map(({ Icon, color }, i) => (
              <Icon
                key={i}
                className={`w-8 h-8 animate-bounce ${color}`}
                style={{
                  animationDelay: `${i * 80}ms`,
                  animationDuration: '0.8s',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main content - hidden during load to prevent flash */}
      <div className={hydrated ? 'app-loaded' : 'app-loading'}>{children}</div>
    </>
  );
}
