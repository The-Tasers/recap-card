'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  UserX,
  LogOut,
  LogIn,
  Cloud,
  Smartphone,
  X,
  CloudOff,
} from 'lucide-react';
import { COLOR_THEMES } from '@/lib/types';
import { useSettingsStore } from '@/lib/store';
import { useAuth } from '@/components/auth-provider';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

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
  const router = useRouter();
  const { signOut } = useAuth();
  const { colorTheme } = useSettingsStore();
  const { t } = useI18n();
  const currentTheme = COLOR_THEMES.find((t) => t.value === colorTheme);
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popover when clicking outside (for desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, isMobile]);

  // Lock body scroll when bottom sheet is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, isMobile]);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    router.push('/settings');
  };

  const handleAuthClick = async () => {
    setIsOpen(false);
    if (isAuthenticated) {
      await signOut();
      router.push('/');
    } else {
      router.push('/login');
    }
  };

  // Menu content as JSX (not a component)
  const menuContent = (
    <div className="py-2">
      {/* Settings option */}
      <button
        type="button"
        onClick={handleSettingsClick}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 active:bg-muted transition-colors cursor-pointer"
      >
        <Settings className="h-4 w-4 text-muted-foreground" />
        {t('settings.title')}
      </button>

      {/* Sign in/out option */}
      <button
        type="button"
        onClick={handleAuthClick}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer',
          isAuthenticated
            ? 'text-destructive hover:bg-destructive/10 active:bg-destructive/20'
            : 'text-foreground hover:bg-muted/50 active:bg-muted'
        )}
      >
        {isAuthenticated ? (
          <>
            <LogOut className="h-4 w-4" />
            {t('settings.logOut')}
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4 text-muted-foreground" />
            {t('settings.signIn')}
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="relative">
      {/* Avatar button with sync indicator - bigger with subtle bg */}
      <motion.button
        ref={buttonRef}
        className={cn(
          'relative flex items-center justify-center cursor-pointer rounded-full p-1',
          'bg-muted/50 hover:bg-muted transition-colors'
        )}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Avatar circle - bigger */}
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
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

      {/* Desktop: Popover */}
      <AnimatePresence>
        {isOpen && !isMobile && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-44 z-50"
          >
            {menuContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile: Bottom Sheet */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl z-50 pb-safe"
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center',
                      isAuthenticated ? 'bg-primary/20' : 'bg-muted'
                    )}
                  >
                    {isAuthenticated ? (
                      <Cloud className="h-4 w-4 text-primary" />
                    ) : (
                      <CloudOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {isAuthenticated
                        ? t('settings.cloudSync')
                        : t('settings.localOnly')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isAuthenticated
                        ? t('settings.cloudSyncDesc')
                        : t('settings.localOnlyDesc')}
                    </p>
                  </div>
                </div>
                {/* Close icon button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="border-t border-border">{menuContent}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
