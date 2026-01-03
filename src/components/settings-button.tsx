'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsPanel } from '@/components/settings-panel';

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

export function SettingsButton() {
  const isMobile = useIsMobile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleClick = () => {
    setIsSettingsOpen(true);
  };

  return (
    <>
      <motion.button
        className={cn(
          'relative flex items-center justify-center cursor-pointer rounded-full p-2',
          'text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
        )}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Settings className="h-5 w-5" />
      </motion.button>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMobile={isMobile}
      />
    </>
  );
}
