'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Palette } from 'lucide-react';
import { AppLogo } from '@/components/app-footer';
import { useI18n } from '@/lib/i18n';
import { LANGUAGES, type Language } from '@/lib/i18n/translations';
import { useSettingsStore } from '@/lib/store';
import { COLOR_THEMES, type ColorTheme } from '@/lib/types';
import { applyColorTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

// 5 mood orb colors matching the spectrum - scattered organic layout
const MOOD_ORBS = [
  { color: '#ef4444', size: 38, x: -70, y: -25 },   // red - frustrated/drained
  { color: '#f97316', size: 42, x: 65, y: -45 },    // orange - anxious/tired
  { color: '#eab308', size: 36, x: -55, y: 50 },    // yellow - uncertain
  { color: '#84cc16', size: 44, x: 70, y: 35 },     // lime - calm/content
  { color: '#22c55e', size: 40, x: -20, y: -65 },   // green - energized/grateful
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
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t, language, setLanguage } = useI18n();
  const { colorTheme, setColorTheme } = useSettingsStore();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const currentLanguage = LANGUAGES.find((l) => l.value === language);
  const currentTheme = COLOR_THEMES.find((th) => th.value === colorTheme);

  // Refs for click-outside handling
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Close language menu if clicking outside
      if (
        showLanguageMenu &&
        languageButtonRef.current &&
        !languageButtonRef.current.contains(target) &&
        languageMenuRef.current &&
        !languageMenuRef.current.contains(target)
      ) {
        setShowLanguageMenu(false);
      }

      // Close theme menu if clicking outside
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

  const handleContinue = () => {
    setCookie(ONBOARDING_COOKIE, 'true');
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6 overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/8 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="max-w-sm w-full flex flex-col items-center justify-center text-center relative z-10">
        {/* Floating mood orbs - organic scattered layout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative w-48 h-48 md:w-56 md:h-56 mb-6"
        >
          {/* Central mixed gradient orb - represents a day recap */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-28 md:h-28 rounded-full"
            style={{
              background: `
                radial-gradient(circle at 20% 20%, #ef4444dd 0%, transparent 40%),
                radial-gradient(circle at 80% 25%, #f97316dd 0%, transparent 40%),
                radial-gradient(circle at 25% 80%, #eab308dd 0%, transparent 40%),
                radial-gradient(circle at 75% 75%, #84cc16dd 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, #22c55e88 0%, #84cc1688 50%, #f9731688 100%)
              `,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Glass highlight */}
            <div
              className="absolute rounded-full bg-white/30"
              style={{
                width: '40%',
                height: '30%',
                left: '15%',
                top: '12%',
                filter: 'blur(4px)',
              }}
            />
          </motion.div>

          {/* Scattered mood orbs */}
          {MOOD_ORBS.map((orb, index) => (
            <motion.div
              key={index}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: orb.size,
                height: orb.size,
                background: `radial-gradient(circle at 35% 35%, ${orb.color}, ${orb.color}99)`,
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: 1,
                x: orb.x - orb.size / 2,
                y: orb.y - orb.size / 2,
              }}
              transition={{
                delay: 0.5 + index * 0.08,
                type: 'spring',
                stiffness: 180,
                damping: 18,
              }}
            >
              {/* Glass highlight */}
              <div
                className="absolute rounded-full bg-white/40"
                style={{
                  width: '35%',
                  height: '25%',
                  left: '18%',
                  top: '15%',
                  filter: 'blur(2px)',
                }}
              />
              {/* Float animation */}
              <motion.div
                className="w-full h-full"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 2.5 + index * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.2,
                }}
              />
            </motion.div>
          ))}

          {/* Soft glow */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full blur-2xl -z-10 bg-primary/15"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Logo - bigger */}
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

        {/* Description - calm reflective copy */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-6 max-w-xs leading-relaxed"
        >
          {t('onboarding.description')}
        </motion.p>

        {/* CTA Button - less shadow, faster hover */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleContinue}
          className="w-full py-4 px-8 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg transition-transform duration-100 cursor-pointer"
        >
          {t('onboarding.button')}
        </motion.button>

        {/* Settings bar with language and theme selectors */}
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
                        language === lang.value
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50'
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
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: currentTheme?.preview.accent }}
              />
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
                        colorTheme === theme.value
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasCompletedOnboarding = getCookie(ONBOARDING_COOKIE);
      setShowOnboarding(!hasCompletedOnboarding);
      setChecked(true);
    }
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding, checked };
}
