'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { colorTheme, setColorTheme } = useCardStore();
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current theme index
  const currentThemeIndex = COLOR_THEMES.findIndex(
    (t) => t.value === colorTheme
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isThemeOpen) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const newIndex = prev <= 0 ? COLOR_THEMES.length - 1 : prev - 1;
            return newIndex;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const newIndex = prev >= COLOR_THEMES.length - 1 ? 0 : prev + 1;
            return newIndex;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            const theme = COLOR_THEMES[highlightedIndex];
            setColorTheme(theme.value);
            applyColorTheme(theme.value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsThemeOpen(false);
          setHighlightedIndex(-1);
          themeButtonRef.current?.focus();
          break;
      }
    },
    [isThemeOpen, highlightedIndex, setColorTheme]
  );

  // Add keyboard listener
  useEffect(() => {
    if (isThemeOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isThemeOpen, handleKeyDown]);

  // Handle focus/blur for theme button
  const handleThemeFocus = () => {
    setIsThemeOpen(true);
    setHighlightedIndex(currentThemeIndex >= 0 ? currentThemeIndex : 0);
  };

  const handleThemeBlur = (e: React.FocusEvent) => {
    // Check if focus is moving to a child element
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsThemeOpen(false);
    setHighlightedIndex(-1);
  };

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
          {/* Theme picker - bottom left corner, expands upward on hover/focus */}
          <motion.div
            ref={containerRef}
            className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            onMouseEnter={() => {
              setIsThemeOpen(true);
              setHighlightedIndex(
                currentThemeIndex >= 0 ? currentThemeIndex : 0
              );
            }}
            onMouseLeave={() => {
              if (document.activeElement !== themeButtonRef.current) {
                setIsThemeOpen(false);
                setHighlightedIndex(-1);
              }
            }}
            onBlur={handleThemeBlur}
          >
            {/* Theme options - expand upward on hover/focus */}
            <AnimatePresence>
              {isThemeOpen && (
                <motion.div
                  className="flex flex-col items-center gap-1.5 px-1.5 py-2 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 overflow-hidden"
                  initial={{ opacity: 0, scaleY: 0, originY: 1 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                  {COLOR_THEMES.map((theme, index) => {
                    const isHighlighted = highlightedIndex === index;
                    const isSelected = colorTheme === theme.value;

                    return (
                      <motion.button
                        key={theme.value}
                        onClick={(e) => handleThemeClick(theme.value, e)}
                        className={cn(
                          'relative w-6 h-6 rounded-full cursor-pointer overflow-hidden shrink-0',
                          'ring-offset-background focus-visible:outline-none',
                          isSelected && 'ring-2 ring-primary ring-offset-1',
                          !isSelected && !theme.isDark && 'border border-border/60'
                        )}
                        style={{ backgroundColor: theme.preview.bg }}
                        animate={{
                          scale: isHighlighted ? 1.15 : 1,
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        title={theme.label}
                        tabIndex={-1}
                      >
                        {/* Two-color split: background on left, accent on right */}
                        <span
                          className="absolute top-0 right-0 w-1/2 h-full"
                          style={{ backgroundColor: theme.preview.accent }}
                        />
                        {/* Highlight ring for keyboard navigation */}
                        {isHighlighted && !isSelected && (
                          <motion.span
                            className="absolute inset-0 rounded-full ring-2 ring-foreground/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                        {/* Check mark for selected */}
                        {isSelected && (
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
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Theme trigger button */}
            <motion.button
              ref={themeButtonRef}
              className="p-2.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onFocus={handleThemeFocus}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!isThemeOpen) {
                    setIsThemeOpen(true);
                    setHighlightedIndex(
                      currentThemeIndex >= 0 ? currentThemeIndex : 0
                    );
                  }
                }
              }}
              aria-label="Select theme"
              aria-expanded={isThemeOpen}
            >
              <Palette className="h-5 w-5" />
            </motion.button>
          </motion.div>

          {/* Settings button - bottom right corner */}
          <motion.button
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-3 pr-3 py-2.5 rounded-full bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border/50 transition-colors cursor-pointer"
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
