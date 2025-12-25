'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, LogOut } from 'lucide-react';
import { COLOR_THEMES } from '@/lib/types';
import { useSettingsStore } from '@/lib/store';
import { useAuth } from '@/components/auth-provider';
import { useI18n } from '@/lib/i18n';

interface SettingsButtonProps {
  isAuthenticated: boolean;
}

export function SettingsButton({ isAuthenticated }: SettingsButtonProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { colorTheme } = useSettingsStore();
  const { t } = useI18n();
  const currentTheme = COLOR_THEMES.find((t) => t.value === colorTheme);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPopoverOpen]);

  const handleClick = () => {
    if (isAuthenticated) {
      setIsPopoverOpen(!isPopoverOpen);
    } else {
      router.push('/settings');
    }
  };

  const handleSettingsClick = () => {
    setIsPopoverOpen(false);
    router.push('/settings');
  };

  const handleLogout = async () => {
    setIsPopoverOpen(false);
    await signOut();
    router.push('/');
  };

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        className="flex items-center gap-1.5 p-2 rounded-full text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer"
        onClick={handleClick}
        whileHover={isAuthenticated ? { scale: 1.05 } : { scale: 1.1, rotate: 15 }}
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

      {/* Popover menu for authenticated users */}
      <AnimatePresence>
        {isPopoverOpen && isAuthenticated && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-40 z-50"
          >
            <div className="py-1">
              {/* Settings option */}
              <button
                type="button"
                onClick={handleSettingsClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                {t('settings.title')}
              </button>

              {/* Logout option */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t('settings.logOut')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
