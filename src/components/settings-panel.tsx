'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Palette,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { ColorTheme, COLOR_THEMES } from '@/lib/types';
import { useSettingsStore, clearIndexedDB } from '@/lib/store';
import { useCheckInStore } from '@/lib/checkin-store';
import { applyColorTheme } from '@/components/theme-provider';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { LANGUAGES } from '@/lib/i18n/translations';
import {
  trackSettingsOpen,
  trackThemeChange,
  trackLanguageChange,
  trackDataClear,
} from '@/lib/analytics';

const CONTACT_EMAIL = 'support@recapz.app';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function SettingsPanel({ isOpen, onClose, isMobile }: SettingsPanelProps) {
  const { checkIns, days, clearAllData } = useCheckInStore();
  const { colorTheme, setColorTheme } = useSettingsStore();
  const { t, language, setLanguage } = useI18n();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Lock body scroll when open and track settings open
  useEffect(() => {
    if (isOpen) {
      trackSettingsOpen();
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Reset states when closing
  useEffect(() => {
    if (!isOpen) {
      setShowClearConfirm(false);
    }
  }, [isOpen]);

  const handleThemeChange = (theme: ColorTheme) => {
    trackThemeChange(theme);
    setColorTheme(theme);
    applyColorTheme(theme);
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      trackDataClear();
      clearAllData();
      await clearIndexedDB();
      toast.success(t('toast.allDataCleared'));
      setShowClearConfirm(false);
      onClose();
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error(t('toast.failedToClearData'));
    } finally {
      setIsClearing(false);
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-lg font-medium">{t('settings.title')}</h1>
        <motion.button
          type="button"
          onClick={onClose}
          className="p-2 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer rounded-md hover:bg-muted/30"
          whileTap={{ scale: 0.95 }}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Appearance Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('settings.appearance')}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Theme Dropdown */}
            <div className="rounded-xl bg-muted/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {t('settings.theme')}
                </span>
              </div>
              <select
                value={colorTheme}
                onChange={(e) =>
                  handleThemeChange(e.target.value as ColorTheme)
                }
                className="w-full h-9 px-3 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors text-sm cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                {COLOR_THEMES.map((theme) => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Dropdown */}
            <div className="rounded-xl bg-muted/30 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {t('settings.language')}
                </span>
              </div>
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value as 'en' | 'ru';
                  trackLanguageChange(newLang);
                  setLanguage(newLang);
                }}
                className="w-full h-9 px-3 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors text-sm cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Data Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('settings.data')}
          </h2>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {t('settings.daysCaptured', { count: days.length })}
            </p>
          </div>

          {checkIns.length > 0 && (
            <AnimatePresence mode="wait">
              {!showClearConfirm ? (
                <motion.button
                  key="clear-trigger"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full py-2 text-sm cursor-pointer text-destructive/50 hover:text-destructive transition-colors"
                >
                  {t('settings.clearData')}
                </motion.button>
              ) : (
                <motion.div
                  key="clear-confirm"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-destructive/70 text-center">
                    {t('settings.clearDataConfirm', { count: checkIns.length })}
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      disabled={isClearing}
                      className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      {t('settings.keepData')}
                    </button>
                    <button
                      onClick={handleClearAll}
                      disabled={isClearing}
                      className="text-sm text-destructive/70 cursor-pointer hover:text-destructive font-medium transition-colors disabled:opacity-50"
                    >
                      {isClearing
                        ? t('settings.deleting')
                        : t('settings.deleteAll')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </section>

        {/* About Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('settings.about')}
          </h2>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t('settings.contact')}
            </span>
          </a>
        </section>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Panel/Dialog */}
          {isMobile ? (
            // Mobile: Bottom sheet sliding up
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl z-50 max-h-[90vh] flex flex-col"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Drag handle */}
              <div className="flex justify-center py-2 shrink-0">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>
              {content}
            </motion.div>
          ) : (
            // Desktop: Centered dialog
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border rounded-2xl z-50 w-full max-w-md max-h-[80vh] flex flex-col shadow-xl"
            >
              {content}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
