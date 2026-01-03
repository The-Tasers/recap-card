'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Globe, Palette } from 'lucide-react';
import { AppLogo } from '@/components/app-footer';
import { useI18n } from '@/lib/i18n';
import { LANGUAGES, type Language } from '@/lib/i18n/translations';
import { useSettingsStore } from '@/lib/store';
import { COLOR_THEMES, type ColorTheme } from '@/lib/types';
import { applyColorTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

// Hook to track cursor/touch proximity and calculate push displacement for orbs
function useOrbProximity(orbCount: number, proximity = 80, pushStrength = 25) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Create spring-animated displacement values for each orb
  const displacements = useRef(
    Array.from({ length: orbCount }, () => ({
      x: useMotionValue(0),
      y: useMotionValue(0),
    }))
  ).current;

  // Create springs for smooth animation
  const springs = displacements.map((d) => ({
    x: useSpring(d.x, { stiffness: 300, damping: 25 }),
    y: useSpring(d.y, { stiffness: 300, damping: 25 }),
  }));

  const calculatePush = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    orbRefs.current.forEach((orbEl, index) => {
      if (!orbEl) return;

      const orbRect = orbEl.getBoundingClientRect();
      const orbCenterX = orbRect.left + orbRect.width / 2;
      const orbCenterY = orbRect.top + orbRect.height / 2;

      // Distance from cursor to orb center
      const dx = clientX - orbCenterX;
      const dy = clientY - orbCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < proximity && distance > 0) {
        // Push away from cursor - inverse direction, strength falls off with distance
        const strength = (1 - distance / proximity) * pushStrength;
        const pushX = -(dx / distance) * strength;
        const pushY = -(dy / distance) * strength;

        displacements[index].x.set(pushX);
        displacements[index].y.set(pushY);
      } else {
        // Return to original position
        displacements[index].x.set(0);
        displacements[index].y.set(0);
      }
    });
  }, [proximity, pushStrength, displacements]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    calculatePush(e.clientX, e.clientY);
  }, [calculatePush]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      calculatePush(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [calculatePush]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      calculatePush(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [calculatePush]);

  const handleMouseLeave = useCallback(() => {
    // Reset all orbs when cursor leaves
    displacements.forEach((d) => {
      d.x.set(0);
      d.y.set(0);
    });
  }, [displacements]);

  const handleTouchEnd = useCallback(() => {
    // Reset all orbs when touch ends
    displacements.forEach((d) => {
      d.x.set(0);
      d.y.set(0);
    });
  }, [displacements]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseLeave, handleTouchMove, handleTouchStart, handleTouchEnd]);

  return { containerRef, orbRefs, springs };
}

// Warmer, softer orb colors - less saturated, more amber/coral tones
const MOOD_ORBS = [
  { color: '#f59e0b', size: 32, x: -75, y: -25, floatY: [0, 8, 0], floatX: [0, 5, 0], duration: 4.0, angle: 215, haloIntensity: 0.5 },  // amber
  { color: '#84cc16', size: 28, x: -20, y: -70, floatY: [0, 10, 0], floatX: [0, 4, 0], duration: 3.5, angle: 270, haloIntensity: 0.4 }, // lime
  { color: '#fb923c', size: 30, x: 70, y: -45, floatY: [0, 7, 0], floatX: [0, -4, 0], duration: 3.8, angle: 315, haloIntensity: 0.45 }, // orange
  { color: '#34d399', size: 26, x: -60, y: 50, floatY: [0, -9, 0], floatX: [0, 5, 0], duration: 4.2, angle: 145, haloIntensity: 0.35 }, // emerald
  { color: '#fbbf24', size: 34, x: 75, y: 40, floatY: [0, -8, 0], floatX: [0, -5, 0], duration: 3.6, angle: 45, haloIntensity: 0.5 },   // yellow
];

// Softer background orbs - warm tones
const BACKGROUND_ORBS = [
  { color: '#f59e0b15', size: 160, x: '15%', y: '20%', floatY: [0, -15, 0], duration: 10 },
  { color: '#84cc1612', size: 140, x: '80%', y: '15%', floatY: [0, -12, 0], duration: 12 },
  { color: '#fb923c10', size: 120, x: '10%', y: '70%', floatY: [0, -14, 0], duration: 11 },
  { color: '#fbbf2412', size: 180, x: '75%', y: '75%', floatY: [0, -18, 0], duration: 13 },
];

export const ONBOARDING_COOKIE = 'onboarding-completed';

// Cookie helper functions
function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

interface OnboardingProps {
  onComplete: (openCheckIn: boolean) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t, language, setLanguage } = useI18n();
  const { colorTheme, setColorTheme } = useSettingsStore();

  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const currentLanguage = LANGUAGES.find((l) => l.value === language);
  const currentTheme = COLOR_THEMES.find((th) => th.value === colorTheme);

  // Orb proximity effect - orbs push away from cursor/touch
  const { containerRef: orbContainerRef, orbRefs, springs } = useOrbProximity(MOOD_ORBS.length);

  // Refs for click-outside handling
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        showLanguageMenu &&
        languageButtonRef.current &&
        !languageButtonRef.current.contains(target) &&
        languageMenuRef.current &&
        !languageMenuRef.current.contains(target)
      ) {
        setShowLanguageMenu(false);
      }

      if (
        showThemeMenu &&
        themeButtonRef.current &&
        !themeButtonRef.current.contains(target) &&
        themeMenuRef.current &&
        !themeMenuRef.current.contains(target)
      ) {
        setShowThemeMenu(false);
      }
    };

    if (showLanguageMenu || showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageMenu, showThemeMenu]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  const handleThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme);
    applyColorTheme(theme);
    setShowThemeMenu(false);
  };

  const handleTryItNow = () => {
    setCookie(ONBOARDING_COOKIE, 'true');
    onComplete(true); // true = open check-in flow
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6 overflow-hidden"
    >
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {BACKGROUND_ORBS.map((orb, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              width: orb.size * 2,
              height: orb.size * 2,
              left: orb.x,
              top: orb.y,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: orb.floatY,
            }}
            transition={{
              opacity: { duration: 1, delay: index * 0.2 },
              scale: { duration: 1, delay: index * 0.2 },
              y: { duration: orb.duration, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-sm w-full flex flex-col items-center justify-center text-center relative z-10"
      >
        {/* Floating mood orbs */}
        <motion.div
          ref={orbContainerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative w-44 h-44 md:w-52 md:h-52 mb-6"
        >
          {/* Central gradient orb - warmer colors */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, #f59e0b 0%, transparent 50%),
                radial-gradient(circle at 70% 30%, #84cc16 0%, transparent 50%),
                radial-gradient(circle at 30% 70%, #fb923c 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, #34d399 0%, transparent 50%),
                radial-gradient(circle, #fbbf24 0%, #f59e0b 50%, #84cc16 100%)
              `,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
          />

          {/* Animated halos */}
          {MOOD_ORBS.map((orb, index) => {
            const rad = (orb.angle * Math.PI) / 180;
            const edgeX = 50 + Math.cos(rad) * 50;
            const edgeY = 50 + Math.sin(rad) * 50;
            const minOpacity = orb.haloIntensity * 0.2;
            const maxOpacity = orb.haloIntensity * 0.6;
            return (
              <motion.div
                key={`halo-${index}`}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${edgeX}% ${edgeY}%, ${orb.color} 0%, transparent 55%)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [minOpacity, maxOpacity, minOpacity] }}
                transition={{
                  opacity: { duration: orb.duration, repeat: Infinity, ease: 'easeInOut', delay: orb.duration * 0.25 },
                }}
              />
            );
          })}

          {/* Scattered orbs */}
          {MOOD_ORBS.map((orb, index) => (
            <motion.div
              key={index}
              ref={(el) => { orbRefs.current[index] = el; }}
              className="absolute left-1/2 top-1/2"
              style={{
                marginLeft: orb.x - orb.size / 2,
                marginTop: orb.y - orb.size / 2,
                x: springs[index].x,
                y: springs[index].y,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{ delay: 0.5 + index * 0.08, type: 'spring', stiffness: 180, damping: 18 }}
            >
              <motion.div
                className="rounded-full"
                style={{ width: orb.size, height: orb.size, background: orb.color }}
                animate={{ y: orb.floatY, x: orb.floatX }}
                transition={{
                  y: { duration: orb.duration, repeat: Infinity, ease: 'easeInOut' },
                  x: { duration: orb.duration * 1.3, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
            </motion.div>
          ))}

          {/* Soft glow */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-36 md:h-36 rounded-full blur-2xl -z-10 bg-amber-500/10"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-3"
        >
          <AppLogo size="xl" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-xl font-semibold text-foreground mb-2"
        >
          {t('onboarding.title')}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-6 max-w-xs leading-relaxed text-sm"
        >
          {t('onboarding.description')}
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTryItNow}
          className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium text-base cursor-pointer"
        >
          {t('onboarding.button')}
        </motion.button>

        {/* Settings bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-3 mt-6"
        >
          {/* Language selector */}
          <div className="relative">
            <button
              ref={languageButtonRef}
              type="button"
              onClick={() => {
                setShowLanguageMenu(!showLanguageMenu);
                setShowThemeMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm cursor-pointer"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{currentLanguage?.flag}</span>
            </button>

            <AnimatePresence>
              {showLanguageMenu && (
                <motion.div
                  ref={languageMenuRef}
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-32 z-50"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => handleLanguageChange(lang.value)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer',
                        language === lang.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                      )}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme selector */}
          <div className="relative">
            <button
              ref={themeButtonRef}
              type="button"
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowLanguageMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm cursor-pointer"
            >
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: currentTheme?.preview.accent }} />
            </button>

            <AnimatePresence>
              {showThemeMenu && (
                <motion.div
                  ref={themeMenuRef}
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-36 z-50"
                >
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => handleThemeChange(theme.value)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer',
                        colorTheme === theme.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                      )}
                    >
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.preview.accent }} />
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);
  const [shouldOpenCheckIn, setShouldOpenCheckIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasCompletedOnboarding = getCookie(ONBOARDING_COOKIE);
      setShowOnboarding(!hasCompletedOnboarding);
      setChecked(true);
    }
  }, []);

  const completeOnboarding = (openCheckIn: boolean) => {
    setShowOnboarding(false);
    setShouldOpenCheckIn(openCheckIn);
  };

  const clearOpenCheckIn = () => {
    setShouldOpenCheckIn(false);
  };

  return { showOnboarding, completeOnboarding, checked, shouldOpenCheckIn, clearOpenCheckIn };
}
