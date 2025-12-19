'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User } from 'lucide-react';
import { COLOR_THEMES } from '@/lib/types';
import { useCardStore } from '@/lib/store';

interface SettingsButtonProps {
  isVisible: boolean;
  isAuthenticated: boolean;
}

export function SettingsButton({
  isVisible,
  isAuthenticated,
}: SettingsButtonProps) {
  const router = useRouter();
  const { colorTheme } = useCardStore();
  const currentTheme = COLOR_THEMES.find((t) => t.value === colorTheme);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="absolute top-4 right-3 z-50">
          <motion.button
            className="flex items-center gap-1.5 p-2 rounded-full text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => router.push('/settings')}
            whileHover={
              isAuthenticated ? { scale: 1.05 } : { scale: 1.1, rotate: 15 }
            }
            whileTap={{ scale: 0.95 }}
          >
            {isAuthenticated ? (
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${currentTheme?.preview.accent}20` }}
              >
                <User
                  className="h-3.5 w-3.5"
                  style={{ color: currentTheme?.preview.accent }}
                />
              </div>
            ) : (
              <Settings className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
