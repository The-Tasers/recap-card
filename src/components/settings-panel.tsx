'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Cloud,
  CloudOff,
  ArrowLeft,
  LogOut,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { ColorTheme, COLOR_THEMES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCardStore } from '@/lib/store';
import { applyColorTheme } from '@/components/theme-provider';

interface SettingsPanelProps {
  onBack: () => void;
  user: { email?: string } | null;
  authLoading: boolean;
  cardsCount: number;
  onSignOut: () => void;
  onClearAll: () => void;
  onDeleteAccount: () => void;
}

export function SettingsPanel({
  onBack,
  user,
  authLoading,
  cardsCount,
  onSignOut,
  onClearAll,
  onDeleteAccount,
}: SettingsPanelProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { colorTheme, setColorTheme } = useCardStore();

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    await onDeleteAccount();
    setIsDeletingAccount(false);
  };

  const handleThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme);
    applyColorTheme(theme);
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col pt-6 pb-8"
    >
      {/* Header - minimal like form header */}
      <div className="flex items-center justify-between mb-8">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-1.5 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer py-2 -ml-2 pl-2 pr-3"
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </motion.button>

        <h1 className="text-lg font-medium text-foreground">Settings</h1>

        {/* Spacer for centering */}
        <div className="w-16" />
      </div>

      {/* Content - scrollable, calm */}
      <div className="flex-1 space-y-6 overflow-y-auto">
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
                <div className="h-9 w-9 rounded-full flex items-center justify-center bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Cloud className="h-3 w-3" />
                    <span>Syncing</span>
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <Dialog
                open={showDeleteAccountDialog}
                onOpenChange={setShowDeleteAccountDialog}
              >
                <DialogTrigger asChild>
                  <button className="w-full py-2 text-sm text-muted-foreground/50 hover:text-destructive transition-colors">
                    Delete account
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      This will permanently delete your account, all your recaps,
                      and photos. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteAccountDialog(false)}
                      disabled={isDeletingAccount}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                    >
                      {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {COLOR_THEMES.map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                className={cn(
                  'relative rounded-xl p-2 transition-all cursor-pointer border-2',
                  colorTheme === theme.value
                    ? 'border-primary'
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
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
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
              {cardsCount} {cardsCount === 1 ? 'entry' : 'entries'} saved
              {user ? ' locally and in the cloud' : ' locally'}
            </p>
          </div>

          <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <DialogTrigger asChild>
              <button className="w-full py-2 text-sm text-muted-foreground/50 hover:text-destructive transition-colors">
                Clear all data
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear All Data</DialogTitle>
                <DialogDescription>
                  This will permanently delete all your entries
                  {user ? ' from both your device and the cloud' : ''}. This
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowClearDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onClearAll();
                    setShowClearDialog(false);
                  }}
                >
                  Delete Everything
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        {/* About - minimal footer */}
        <section className="pt-4 mt-auto">
          <p className="text-xs text-muted-foreground/40 text-center">
            Recapp · Version 0.1.0
          </p>
        </section>
      </div>
    </motion.div>
  );
}
