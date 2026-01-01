'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Cloud,
  CloudOff,
  X,
  LogOut,
  Loader2,
  Check,
  Lock,
  Eye,
  EyeOff,
  Palette,
  Globe,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColorTheme, COLOR_THEMES, ALL_COLOR_THEMES } from '@/lib/types';
import { useSettingsStore, clearIndexedDB } from '@/lib/store';
import { useCheckInStore } from '@/lib/checkin-store';
import { applyColorTheme } from '@/components/theme-provider';
import { useAuth } from '@/components/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { LANGUAGES } from '@/lib/i18n/translations';
import { FeedbackModal } from '@/components/feedback-modal';

const CONTACT_EMAIL = 'support@recapz.app';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function SettingsPanel({ isOpen, onClose, isMobile }: SettingsPanelProps) {
  const router = useRouter();
  const { user, signOut, updatePassword } = useAuth();
  const { checkIns, days, clearAllData } = useCheckInStore();
  const { colorTheme, setColorTheme } = useSettingsStore();
  const { t, language, setLanguage } = useI18n();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
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

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
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
      setShowDeleteAccountDialog(false);
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordError(null);
    }
  }, [isOpen]);

  const handleThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme);
    applyColorTheme(theme);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError(t('settings.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t('settings.passwordTooShort'));
      return;
    }

    setIsChangingPassword(true);
    const { error } = await updatePassword(newPassword);

    if (error) {
      setPasswordError(t(`auth.error.${error}` as TranslationKey));
      setIsChangingPassword(false);
    } else {
      toast.success(t('settings.passwordUpdated'));
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
    setTimeout(() => {
      onClose();
      router.push('/');
    }, 500);
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      if (user) {
        const supabase = createClient();
        await Promise.all([
          supabase.from('checkins').delete().eq('user_id', user.id),
          supabase.from('days').delete().eq('user_id', user.id),
          supabase.from('people').delete().eq('user_id', user.id),
          supabase.from('contexts').delete().eq('user_id', user.id).eq('is_default', false),
        ]);
      }

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

      toast.success(t('toast.accountDeleted'));
      setShowDeleteAccountDialog(false);
      onClose();

      setTimeout(() => {
        router.push('/');
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(t('toast.failedToDeleteAccount'));
    } finally {
      setIsDeletingAccount(false);
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
        {/* Account Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('settings.account')}
          </h2>

          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${
                      ALL_COLOR_THEMES.find((t) => t.value === colorTheme)
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
                        color: ALL_COLOR_THEMES.find(
                          (t) => t.value === colorTheme
                        )?.preview.accent,
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {signOutStatus === 'signed-out'
                      ? t('settings.signedOut')
                      : user.email}
                  </p>
                  {signOutStatus === 'idle' && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Cloud className="h-3 w-3" />
                      <span>{t('settings.syncing')}</span>
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
                    {t('settings.changePassword')}
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
                        placeholder={t('settings.newPassword')}
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
                        placeholder={t('settings.confirmPassword')}
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
                        {t('settings.cancel')}
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
                        {isChangingPassword
                          ? t('settings.saving')
                          : t('settings.save')}
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
                    className="w-full py-2 text-sm text-destructive/50 cursor-pointer hover:text-destructive transition-colors"
                  >
                    {t('settings.deleteAccount')}
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
                      {t('settings.deleteAccountConfirm')}
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => setShowDeleteAccountDialog(false)}
                        disabled={isDeletingAccount}
                        className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors disabled:opacity-50"
                      >
                        {t('settings.cancel')}
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="text-sm text-destructive/70 cursor-pointer hover:text-destructive font-medium transition-colors disabled:opacity-50"
                      >
                        {isDeletingAccount
                          ? t('settings.deleting')
                          : t('settings.yesDelete')}
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
                  {t('settings.signInPrompt')}
                </p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 h-10" variant="outline" asChild>
                  <Link href="/login" onClick={onClose}>{t('settings.signIn')}</Link>
                </Button>
                <Button className="flex-1 h-10" asChild>
                  <Link href="/signup" onClick={onClose}>{t('settings.signUp')}</Link>
                </Button>
              </div>
            </div>
          )}
        </section>

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
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ru')}
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

          <div className="flex gap-2">
            {/* Contact email */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t('settings.contact')}
              </span>
            </a>

            {/* Feedback button */}
            <button
              onClick={() => {
                onClose();
                // Delay to let settings close first
                setTimeout(() => setShowFeedbackModal(true), 200);
              }}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <ThumbsUp className="h-4 w-4 text-primary fill-primary" />
              <span className="text-sm font-medium text-primary">
                {t('settings.leaveFeedback')}
              </span>
            </button>
          </div>
        </section>
      </div>

    </div>
  );

  return (
    <>
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

      {/* Feedback Modal - rendered outside settings panel */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </>
  );
}
