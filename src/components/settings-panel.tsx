'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Cloud,
  CloudOff,
  Trash2,
  ArrowLeft,
  LogOut,
  UserX,
  Loader2,
  Info,
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
import { Mood } from '@/lib/types';
import { cn } from '@/lib/utils';

// Mood-specific avatar colors
const MOOD_AVATAR_CLASSES: Record<Mood, { bg: string; text: string }> = {
  great: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/50',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  good: {
    bg: 'bg-green-100 dark:bg-green-900/50',
    text: 'text-green-600 dark:text-green-400',
  },
  neutral: {
    bg: 'bg-amber-100 dark:bg-amber-900/50',
    text: 'text-amber-600 dark:text-amber-400',
  },
  bad: {
    bg: 'bg-orange-100 dark:bg-orange-900/50',
    text: 'text-orange-600 dark:text-orange-400',
  },
  terrible: {
    bg: 'bg-red-100 dark:bg-red-900/50',
    text: 'text-red-600 dark:text-red-400',
  },
};

// Mood-specific button colors
const MOOD_BUTTON_CLASSES: Record<Mood, string> = {
  great: 'bg-emerald-500 hover:bg-emerald-600',
  good: 'bg-green-500 hover:bg-green-600',
  neutral: 'bg-amber-500 hover:bg-amber-600',
  bad: 'bg-orange-500 hover:bg-orange-600',
  terrible: 'bg-red-500 hover:bg-red-600',
};

interface SettingsPanelProps {
  onBack: () => void;
  user: { email?: string } | null;
  authLoading: boolean;
  currentMood: Mood;
  cardsCount: number;
  onSignOut: () => void;
  onClearAll: () => void;
  onDeleteAccount: () => void;
}

export function SettingsPanel({
  onBack,
  user,
  authLoading,
  currentMood,
  cardsCount,
  onSignOut,
  onClearAll,
  onDeleteAccount,
}: SettingsPanelProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    await onDeleteAccount();
    setIsDeletingAccount(false);
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="space-y-6"
    >
      {/* Back button */}
      <div className="relative">
        <motion.button
          onClick={onBack}
          className="absolute left-0 h-full flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </motion.button>

        {/* Settings Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl text-center font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Settings
        </motion.h1>
      </div>

      {/* Account Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-muted/50 dark:bg-neutral-900 rounded-2xl p-4 space-y-4 border border-border/30"
      >
        <h2 className="text-sm font-medium">Account</h2>

        {authLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-background dark:bg-neutral-800 rounded-xl border border-border/30">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center',
                  MOOD_AVATAR_CLASSES[currentMood].bg
                )}
              >
                <User
                  className={cn(
                    'h-5 w-5',
                    MOOD_AVATAR_CLASSES[currentMood].text
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <Cloud className="h-3 w-3" />
                  <span>Syncing enabled</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={onSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <Dialog
              open={showDeleteAccountDialog}
              onOpenChange={setShowDeleteAccountDialog}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
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
                    {isDeletingAccount ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Account'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-background dark:bg-neutral-800 rounded-xl border border-border/30">
              <CloudOff className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Sign in to sync across devices
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                className={cn(
                  'flex-1 text-white',
                  MOOD_BUTTON_CLASSES[currentMood]
                )}
                asChild
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Data Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-muted/50 dark:bg-neutral-900 rounded-2xl p-4 space-y-4 border border-border/30"
      >
        <h2 className="text-sm font-medium">Data</h2>
        <p className="text-xs text-muted-foreground">
          {cardsCount} {cardsCount === 1 ? 'entry' : 'entries'} saved
          {user ? ' locally and in the cloud' : ' locally'}
        </p>
        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
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
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-muted/50 dark:bg-neutral-900 rounded-2xl p-4 border border-border/30"
      >
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Recapp</p>
            <p className="text-xs text-muted-foreground mt-1">
              Notice your day, one moment at a time.
            </p>
            <p className="text-xs text-muted-foreground mt-2">Version 0.1.0</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
