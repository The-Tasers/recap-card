'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Info, User, LogOut, Cloud, CloudOff, Loader2, UserX } from 'lucide-react';
import { useCardStore, clearIndexedDB } from '@/lib/store';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { user, signOut, loading: authLoading } = useAuth();
  const { cards } = useCardStore();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleClearAll = async () => {
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
          return;
        }
      }

      await clearIndexedDB();
      toast.success('All data cleared');
      setShowClearDialog(false);
      onOpenChange(false);
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      // Clear local data
      await clearIndexedDB();

      toast.success('Account deleted successfully');
      setShowDeleteAccountDialog(false);
      onOpenChange(false);

      // Reload to clear any cached state
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? 'right' : 'bottom'}
        className={
          isDesktop
            ? 'p-0 flex flex-col overflow-hidden w-[500px] max-w-[90vw]'
            : 'h-[85vh] rounded-t-3xl px-0'
        }
      >
        <div className="flex flex-col h-full">
          {/* Handle bar - only on mobile */}
          {!isDesktop && (
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </div>
          )}

          <SheetHeader className={isDesktop ? "px-6 py-6 border-b border-border" : "px-6 pb-4 border-b border-border"}>
            <SheetTitle className="text-xl font-semibold">Settings</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Account */}
            <div className="bg-muted/50 dark:bg-neutral-900 rounded-2xl p-4 space-y-4 border border-border/30">
              <h2 className="text-sm font-medium">Account</h2>

              {authLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-background dark:bg-neutral-800 rounded-xl border border-border/30">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
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
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                  <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
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
                          This will permanently delete your account, all your recaps, and photos.
                          This action cannot be undone.
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
                      <Link href="/login" onClick={() => onOpenChange(false)}>Sign In</Link>
                    </Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90" asChild>
                      <Link href="/signup" onClick={() => onOpenChange(false)}>Sign Up</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Data */}
            <div className="bg-muted/50 dark:bg-neutral-900 rounded-2xl p-4 space-y-4 border border-border/30">
              <h2 className="text-sm font-medium">Data</h2>
              <p className="text-xs text-muted-foreground">
                {cards.length} {cards.length === 1 ? 'entry' : 'entries'} saved
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
                      {user ? ' from both your device and the cloud' : ''}.
                      This cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleClearAll}>
                      Delete Everything
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* About */}
            <div className="bg-muted/50 dark:bg-neutral-900 rounded-2xl p-4 border border-border/30">
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
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
