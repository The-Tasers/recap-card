'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Cloud, User, Check, Palette } from 'lucide-react';
import { ColorTheme, COLOR_THEMES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCardStore } from '@/lib/store';
import { applyColorTheme } from '@/components/theme-provider';

interface SettingsButtonProps {
  isVisible: boolean;
  isAuthenticated: boolean;
  onClick: () => void;
}

export function SettingsButton({
  isVisible,
  isAuthenticated,
  onClick,
}: SettingsButtonProps) {
  const [isThemeHovered, setIsThemeHovered] = useState(false);
  const { colorTheme, setColorTheme } = useCardStore();

  const handleThemeClick = (theme: ColorTheme, e: React.MouseEvent) => {
    e.stopPropagation();
    setColorTheme(theme);
    applyColorTheme(theme);
  };

  const currentTheme = COLOR_THEMES.find((t) => t.value === colorTheme);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Theme picker - bottom left corner, expands upward on hover */}
          <motion.div
            className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            onMouseEnter={() => setIsThemeHovered(true)}
            onMouseLeave={() => setIsThemeHovered(false)}
          >
            {/* Theme options - expand upward on hover */}
            <AnimatePresence>
              {isThemeHovered && (
                <motion.div
                  className="flex flex-col items-center gap-1.5 px-1.5 py-2 rounded-full bg-card/90 backdrop-blur-sm shadow-lg border border-border/50 overflow-hidden"
                  initial={{ opacity: 0, scaleY: 0, originY: 1 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                  {COLOR_THEMES.map((theme) => (
                    <motion.button
                      key={theme.value}
                      onClick={(e) => handleThemeClick(theme.value, e)}
                      className={cn(
                        'relative w-6 h-6 rounded-full cursor-pointer overflow-hidden shrink-0',
                        'ring-offset-background focus-visible:outline-none',
                        colorTheme === theme.value &&
                          'ring-2 ring-primary ring-offset-1'
                      )}
                      style={{ backgroundColor: theme.preview.bg }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      title={theme.label}
                    >
                      {/* Two-color split: background on left, accent on right */}
                      <span
                        className="absolute top-0 right-0 w-1/2 h-full"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                      {/* Check mark for selected */}
                      {colorTheme === theme.value && (
                        <motion.span
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check
                            className="h-3 w-3"
                            style={{ color: theme.isDark ? '#fff' : '#333' }}
                          />
                        </motion.span>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Theme trigger button */}
            {(() => {
              return (
                <motion.div
                  className="p-2.5 rounded-full backdrop-blur-sm shadow-lg border border-border/50 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: currentTheme?.preview.bg,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Palette
                    className="h-6 w-6"
                    style={{ color: currentTheme?.preview.accent }}
                  />
                </motion.div>
              );
            })()}
          </motion.div>

          {/* Settings button - bottom right corner */}
          <motion.button
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-3 pr-3 py-2.5 rounded-full bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground shadow-lg border border-border/50 transition-colors cursor-pointer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              delay: 0.1,
            }}
            onClick={onClick}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 12px 28px -8px rgba(0, 0, 0, 0.15)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {isAuthenticated ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'easeInOut',
                  }}
                >
                  <Cloud className="h-4 w-4 text-green-500" />
                </motion.div>
                <div className="h-6 w-6 rounded-full flex items-center justify-center bg-primary/20">
                  <User
                    className="h-3.5 w-3.5"
                    style={{ color: currentTheme?.preview.accent }}
                  />
                </div>
              </>
            ) : (
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Settings className="h-5 w-5" />
              </motion.div>
            )}
          </motion.button>
        </>
      )}
    </AnimatePresence>
  );
}
