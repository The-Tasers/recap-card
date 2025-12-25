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
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-8"
    >
      <div className="max-w-sm w-full h-full flex flex-col items-center justify-center gap-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 flex justify-center"
        >
          <AppLogo size="lg" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-medium text-foreground mb-4"
        >
          {t('onboarding.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground leading-relaxed mb-12"
        >
          {t('onboarding.description')}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={handleContinue}
          className="w-full py-4 px-8 rounded-2xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          {t('onboarding.button')}
        </motion.button>

        {/* Bar with language and theme selectors */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2"
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
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm"
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
                        'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
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
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm"
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
                        'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
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
