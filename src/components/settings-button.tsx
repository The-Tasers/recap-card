'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Cloud,
  CloudOff,
} from 'lucide-react';
import { COLOR_THEMES } from '@/lib/types';
import { useSettingsStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { SettingsPanel } from '@/components/settings-panel';

interface SettingsButtonProps {
  isAuthenticated: boolean;
}

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export function SettingsButton({ isAuthenticated }: SettingsButtonProps) {
  const { colorTheme } = useSettingsStore();
  const currentTheme = COLOR_THEMES.find((t) => t.value === colorTheme);
  const isMobile = useIsMobile();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleClick = () => {
    setIsSettingsOpen(true);
  };

  return (
    <>
      {/* Avatar button with sync indicator */}
      <motion.button
        className={cn(
          'relative flex items-center justify-center cursor-pointer rounded-full p-1',
          'bg-muted/50 hover:bg-muted transition-colors'
        )}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Avatar circle */}
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
          style={{
            backgroundColor: isAuthenticated
              ? `${currentTheme?.preview.accent}20`
              : 'transparent',
          }}
        >
          <User
            className="h-5 w-5"
            style={{ color: currentTheme?.preview.accent }}
          />
        </div>

        {/* Sync indicator badge */}
        <div
          className={cn(
            'absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-accent-foreground',
            isAuthenticated ? 'text-primary' : 'text-muted-foreground/70'
          )}
        >
          {isAuthenticated ? (
            <Cloud className="h-2.5 w-2.5 text-primary-foreground" />
          ) : (
            <CloudOff className="h-2.5 w-2.5 text-background" />
          )}
        </div>
      </motion.button>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMobile={isMobile}
      />
    </>
  );
}
