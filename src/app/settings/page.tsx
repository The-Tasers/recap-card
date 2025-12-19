'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  User,
  Cloud,
  CloudOff,
  ChevronLeft,
  LogOut,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { ColorTheme, COLOR_THEMES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCardStore, clearIndexedDB } from '@/lib/store';
import { applyColorTheme } from '@/components/theme-provider';
import { useAuth } from '@/components/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { AppFooter } from '@/components/app-footer';

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { cards, colorTheme, setColorTheme } = useCardStore();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme);
    applyColorTheme(theme);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    router.push('/');
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      if (user) {
        const supabase = createClient();
        const { error } = await supabase
          .from('recaps')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting cloud recaps:', error);
          toast.error('Failed to delete cloud data');
          setIsClearing(false);
          return;
        }
      }

      await clearIndexedDB();
      toast.success('All data cleared');
      setShowClearConfirm(false);
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const response = await fetch('/api/account/delete', { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      await clearIndexedDB();
      await signOut();

      toast.success('Account deleted');
      setShowDeleteAccountDialog(false);

      setTimeout(() => {
        router.push('/');
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="h-screen-dynamic bg-background overflow-hidden">
      <div className="max-w-lg mx-auto h-full px-6 pt-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            onClick={() => router.back()}
            className="p-2 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer rounded-md hover:bg-muted/30"
            whileTap={{ scale: 0.95 }}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>

          <h1 className="text-lg font-medium">Settings</h1>

          {/* Spacer for centering */}
          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 gap-6 overflow-y-auto">
          {/* Account Section */}
          <section className="space-y-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Account
            </h2>

            {authLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
              </div>
            ) : user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${
                        COLOR_THEMES.find((t) => t.value === colorTheme)
                          ?.preview.accent
                      }20`,
                    }}
                  >
                    <User
                      className="h-4 w-4"
                      style={{
                        color: COLOR_THEMES.find((t) => t.value === colorTheme)
                          ?.preview.accent,
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Cloud className="h-3 w-3" />
                      <span>Syncing</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-muted-foreground/50 cursor-pointer hover:text-foreground transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {!showDeleteAccountDialog ? (
                    <motion.button
                      key="delete-account-trigger"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowDeleteAccountDialog(true)}
                      className="w-full py-2 text-sm text-muted-foreground/50 cursor-pointer hover:text-destructive transition-colors"
                    >
                      Delete account
                    </motion.button>
                  ) : (
                    <motion.div
                      key="delete-account-confirm"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-3"
                    >
                      <p className="text-sm text-destructive/70 text-center">
                        This will permanently delete your account, all your
                        recaps, and photos. This cannot be undone.
                      </p>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => setShowDeleteAccountDialog(false)}
                          disabled={isDeletingAccount}
                          className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors disabled:opacity-50"
                        >
                          Keep Account
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount}
                          className="text-sm text-destructive/70 cursor-pointer hover:text-destructive font-medium transition-colors disabled:opacity-50"
                        >
                          {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <CloudOff className="h-4 w-4 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Sign in to sync across devices
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-10" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button className="flex-1 h-10" asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Appearance Section */}
          <section className="space-y-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Appearance
            </h2>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 py-1 px-1">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleThemeChange(theme.value)}
                  className={cn(
                    'relative rounded-xl p-2 transition-all cursor-pointer border-2 overflow-visible',
                    colorTheme === theme.value
                      ? 'border-primary'
                      : !theme.isDark
                      ? 'border-border/40 hover:border-border/70'
                      : 'border-transparent hover:border-border/50'
                  )}
                  style={{ backgroundColor: theme.preview.bg }}
                >
                  {/* Theme preview */}
                  <div className="space-y-1.5">
                    <div
                      className="rounded-lg p-1.5 h-8"
                      style={{ backgroundColor: theme.preview.card }}
                    >
                      <div
                        className="w-full h-1 rounded-full opacity-60"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                      <div
                        className="w-2/3 h-0.5 rounded-full mt-1 opacity-30"
                        style={{
                          backgroundColor: theme.isDark ? '#ffffff' : '#3d3528',
                        }}
                      />
                    </div>
                    <p
                      className="text-[9px] font-medium text-center truncate"
                      style={{
                        color: theme.isDark ? '#ffffff' : '#3d3528',
                      }}
                    >
                      {theme.label}
                    </p>
                  </div>

                  {/* Selected indicator */}
                  {colorTheme === theme.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Data Section */}
          <section className="space-y-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Data
            </h2>

            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">
                {cards.length} {cards.length === 1 ? 'recap' : 'recaps'} saved
                {user ? ' locally and in the cloud' : ' locally'}
              </p>
            </div>

            {cards.length > 0 && (
              <AnimatePresence mode="wait">
                {!showClearConfirm ? (
                  <motion.button
                    key="clear-trigger"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full py-2 text-sm cursor-pointer text-muted-foreground/50 hover:text-destructive transition-colors"
                  >
                    Clear all data
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
                      This will permanently delete {cards.length}{' '}
                      {cards.length === 1 ? 'recap' : 'recaps'}
                      {user ? ' from your device and the cloud' : ''}. This
                      cannot be undone.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        disabled={isClearing}
                        className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        Keep My Data
                      </button>
                      <button
                        onClick={handleClearAll}
                        disabled={isClearing}
                        className="text-sm text-destructive/70 cursor-pointer hover:text-destructive font-medium transition-colors disabled:opacity-50"
                      >
                        {isClearing ? 'Deleting...' : 'Delete All'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </section>

        </div>

        {/* Footer */}
        <AppFooter />
      </div>
    </div>
  );
}
