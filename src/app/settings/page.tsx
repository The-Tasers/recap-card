'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Cloud,
  CloudOff,
  ChevronLeft,
  LogOut,
  Loader2,
  Check,
  Download,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import { ColorTheme, COLOR_THEMES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCardStore, useSettingsStore, clearIndexedDB } from '@/lib/store';
import { applyColorTheme } from '@/components/theme-provider';
import { useAuth } from '@/components/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { AppFooter, AppLogo } from '@/components/app-footer';

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut, updatePassword, loading: authLoading } = useAuth();
  const { cards } = useCardStore();
  const { colorTheme, setColorTheme } = useSettingsStore();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [signOutStatus, setSignOutStatus] = useState<
    'idle' | 'signing-out' | 'signed-out'
  >('idle');

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme);
    applyColorTheme(theme);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    const { error } = await updatePassword(newPassword);

    if (error) {
      setPasswordError(error);
      setIsChangingPassword(false);
    } else {
      toast.success('Password updated');
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutStatus('signing-out');
    await signOut();
    setSignOutStatus('signed-out');
    setTimeout(() => router.push('/'), 500);
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

  const handleExportCSV = () => {
    if (cards.length === 0) {
      toast.error('No data to export');
      return;
    }

    // CSV header
    const headers = [
      'Date',
      'Mood',
      'Text',
      'Sleep',
      'Weather',
      'Meals',
      'Self-care',
      'Health',
      'Exercise',
    ];

    // Convert cards to CSV rows
    const rows = cards.map((card) => {
      const date = new Date(card.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      // Get block values
      const getBlockValue = (blockId: string) => {
        const block = card.blocks?.find((b) => b.blockId === blockId);
        if (!block) return '';
        if (Array.isArray(block.value)) return block.value.join('; ');
        // Format sleep as hours and minutes
        if (
          blockId === 'sleep' &&
          typeof block.value === 'number' &&
          block.value > 0
        ) {
          const hours = Math.floor(block.value / 60);
          const mins = block.value % 60;
          if (mins === 0) return `${hours}h`;
          return `${hours}h ${mins}m`;
        }
        return String(block.value);
      };

      // Escape CSV field (handle commas, quotes, newlines)
      const escapeCSV = (field: string) => {
        if (
          field.includes(',') ||
          field.includes('"') ||
          field.includes('\n')
        ) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      };

      return [
        date,
        card.mood,
        escapeCSV(card.text || ''),
        getBlockValue('sleep'),
        getBlockValue('weather'),
        getBlockValue('meals'),
        getBlockValue('selfcare'),
        getBlockValue('health'),
        getBlockValue('exercise'),
      ].join(',');
    });

    // Combine header and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Recapz-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
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
      <div className="max-w-lg mx-auto h-full px-6 pt-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.button
            type="button"
            onClick={() => router.push('/')}
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
        <div className="flex flex-col flex-1 gap-6 overflow-y-auto mt-6">
          {/* Account Section */}
          <section className="space-y-3">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Account
            </h2>

            {user ? (
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
                    {signOutStatus === 'signed-out' ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <User
                        className="h-4 w-4"
                        style={{
                          color: COLOR_THEMES.find(
                            (t) => t.value === colorTheme
                          )?.preview.accent,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {signOutStatus === 'signed-out'
                        ? 'Signed out'
                        : user.email}
                    </p>
                    {signOutStatus === 'idle' && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Cloud className="h-3 w-3" />
                        <span>Syncing</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={signOutStatus !== 'idle'}
                    className="p-2 text-muted-foreground/50 cursor-pointer hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {signOutStatus === 'signing-out' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Change password section */}
                <AnimatePresence mode="wait">
                  {!showChangePassword ? (
                    <motion.button
                      key="change-password-trigger"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowChangePassword(true)}
                      className="w-full py-2 text-sm text-muted-foreground/50 cursor-pointer hover:text-foreground transition-colors"
                    >
                      Change password
                    </motion.button>
                  ) : (
                    <motion.form
                      key="change-password-form"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      onSubmit={handleChangePassword}
                      className="space-y-3 p-3 rounded-xl bg-muted/30"
                    >
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full h-10 pl-10 pr-10 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={confirmNewPassword}
                          onChange={(e) =>
                            setConfirmNewPassword(e.target.value)
                          }
                          required
                          className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border/50 focus:border-primary focus:outline-none transition-colors text-sm"
                        />
                      </div>
                      {passwordError && (
                        <p className="text-xs text-destructive text-center">
                          {passwordError}
                        </p>
                      )}
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowChangePassword(false);
                            setNewPassword('');
                            setConfirmNewPassword('');
                            setPasswordError(null);
                          }}
                          disabled={isChangingPassword}
                          className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={
                            isChangingPassword ||
                            !newPassword ||
                            !confirmNewPassword
                          }
                          className="text-sm text-primary cursor-pointer hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                        >
                          {isChangingPassword ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

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
                      className="space-y-2"
                    >
                      <p className="text-sm text-destructive/70 text-center">
                        Delete your account and all data?
                      </p>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => setShowDeleteAccountDialog(false)}
                          disabled={isDeletingAccount}
                          className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount}
                          className="text-sm text-destructive/70 cursor-pointer hover:text-destructive font-medium transition-colors disabled:opacity-50"
                        >
                          {isDeletingAccount ? 'Deleting...' : 'Yes, delete'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/50 space-y-4">
                <div className="flex items-center gap-3">
                  <CloudOff className="h-4 w-4 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Sign in to sync across devices
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 h-10" variant="outline" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button className="flex-1 h-10" asChild>
                    <Link href="/signup">Sign up</Link>
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

            <div className="grid grid-cols-3 gap-3 py-1 px-1">
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

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground">
                {cards.length} {cards.length === 1 ? 'recap' : 'recaps'} saved
                {user ? ' locally and in the cloud' : ' locally'}
              </p>
              {cards.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  disabled={exportSuccess}
                  className={cn(
                    'p-2 cursor-pointer transition-colors rounded-md',
                    exportSuccess
                      ? 'text-emerald-500'
                      : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/50'
                  )}
                  aria-label="Export data as CSV"
                >
                  {exportSuccess ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
              )}
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
                      {user ? ' from your device and the cloud' : ''}.
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
