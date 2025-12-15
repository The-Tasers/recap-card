'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Info, User, LogOut, Cloud, CloudOff, Loader2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { useAuth } from '@/components/auth-provider';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { clearIndexedDB } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SettingsPage() {
  const router = useRouter();
  const { isChecking } = useOnboardingGuard();
  const { user, signOut, loading: authLoading } = useAuth();
  const { updateProfileName } = useSupabaseSync();
  const {
    cards,
    hydrated,
    setHasSeenOnboarding,
    userName,
    setUserName,
  } = useCardStore();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showAccountData, setShowAccountData] = useState(false);
  const [nameInput, setNameInput] = useState(userName || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleClearAll = async () => {
    try {
      // If user is logged in, delete cloud data first
      if (user) {
        const supabase = createClient();
        const { error } = await supabase
          .from('recaps')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting cloud recaps:', error);
          toast.error('Failed to delete cloud data', {
            description: 'Could not delete your cloud recaps. Please try again.',
          });
          return;
        }
      }

      // Clear local data
      setHasSeenOnboarding(false);
      await clearIndexedDB();

      toast.success('All data cleared', {
        description: user ? 'Local and cloud data have been deleted.' : 'Local data has been deleted.',
      });

      router.push('/');
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data', {
        description: 'Something went wrong. Please try again.',
      });
    }
  };

  const handleSaveName = async () => {
    const newName = nameInput.trim();
    setUserName(newName);
    if (user) {
      await updateProfileName(newName);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out', {
      description: 'You have been signed out successfully.',
    });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();

      // Delete all recaps from cloud
      const { error: recapsError } = await supabase
        .from('recaps')
        .delete()
        .eq('user_id', user.id);

      if (recapsError) {
        throw recapsError;
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Sign out
      await signOut();

      // Clear local data
      setHasSeenOnboarding(false);
      await clearIndexedDB();

      toast.success('Account deleted', {
        description: 'Your account and all data have been deleted.',
      });

      router.push('/');
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Delete failed', {
        description: 'Failed to delete account. Please try again.',
      });
    }
    setIsDeleting(false);
    setShowDeleteAccountDialog(false);
  };

  if (!hydrated || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Shared Account & Profile content component
  const AccountProfileContent = ({ isDesktop = false }: { isDesktop?: boolean }) => (
    <div className={isDesktop ? 'space-y-6' : 'space-y-4'}>
      {/* Profile Name Section */}
      <div>
        <label
          htmlFor={isDesktop ? 'userName-desktop' : 'userName'}
          className="text-sm text-neutral-600 dark:text-neutral-400 mb-1.5 block"
        >
          Your Name
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id={isDesktop ? 'userName-desktop' : 'userName'}
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name"
              className="pl-9"
            />
          </div>
          <Button
            onClick={handleSaveName}
            disabled={nameInput === userName || nameInput.trim() === ''}
            size="default"
          >
            Save
          </Button>
        </div>
      </div>

      {/* Account Section */}
      {authLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        </div>
      ) : user ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {user.email}
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Cloud className="h-3 w-3" />
                <span>Syncing enabled</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className={`text-destructive hover:text-destructive ${isDesktop ? '' : 'w-full'}`}
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>

          {/* Account Data & Delete Section */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setShowAccountData(!showAccountData)}
              className="flex items-center justify-between w-full text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <span>Account data & deletion</span>
              {showAccountData ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showAccountData && (
              <div className="mt-3 space-y-3">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl text-xs space-y-1.5">
                  <p><span className="font-medium">User ID:</span> {user.id}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Cloud recaps:</span> {cards.length} saved</p>
                  <p><span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                </div>

                <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Account
                      </DialogTitle>
                      <DialogDescription>
                        This will permanently delete your account and all your data from our servers. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-3 bg-destructive/10 rounded-lg text-sm">
                      <p className="font-medium text-destructive mb-2">The following will be deleted:</p>
                      <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                        <li>Your profile ({user.email})</li>
                        <li>All {cards.length} recaps in the cloud</li>
                        <li>All synced data</li>
                      </ul>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteAccountDialog(false)}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
            <CloudOff className="h-5 w-5 text-neutral-400" />
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Sign in to sync your recaps across devices
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="flex-1 bg-amber-500 hover:bg-amber-600" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-32 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 h-24 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200/50 dark:border-neutral-700/50">
        <div className="px-4 lg:px-8 h-full flex items-center">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full lg:hidden"
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-neutral-800 dark:text-neutral-100">
                  Settings
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 hidden lg:block">
                  Manage your preferences and data
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
        {/* Mobile: Grid Layout */}
        <div className="lg:hidden grid grid-cols-1 gap-6">
        {/* Account & Profile - Merged */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-neutral-200/50 dark:border-neutral-700/60">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-300 mb-3">
            Account & Profile
          </h2>
          <AccountProfileContent />
        </div>

        {/* Theme */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-neutral-200/50 dark:border-neutral-700/60">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
              Appearance
            </h2>
            <ThemeToggle size="md" />
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-neutral-200/50 dark:border-neutral-700/60">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-300 mb-3">
            Data Management
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {user
              ? 'Your recaps are stored locally and synced to the cloud.'
              : 'Your recaps are stored locally on your device.'}
          </p>
          <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear All Data</DialogTitle>
                <DialogDescription>
                  This will permanently delete all your recaps{user ? ' from both your device and the cloud' : ''}. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowClearDialog(false)}
                >
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
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-neutral-200/50 dark:border-neutral-700/60">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-300 mb-3">
            About
          </h2>
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Recapp</p>
              <p className="text-xs text-muted-foreground">
                A minimalist daily journaling app. Capture your moments in
                beautiful, shareable recaps.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Version 0.0.1
              </p>
            </div>
          </div>
        </div>
        </div>

        {/* Desktop: Two Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left column - Main settings */}
          <div className="lg:col-span-7 space-y-6">
            {/* Account & Profile */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/60">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Account & Profile
              </h2>
              <AccountProfileContent isDesktop />
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/60">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Data Management
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {user
                  ? 'Your recaps are stored locally and synced to the cloud.'
                  : 'Your recaps are stored locally on your device.'}
              </p>
              <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear All Data</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all your recaps{user ? ' from both your device and the cloud' : ''}. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowClearDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleClearAll}>
                      Delete Everything
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Right column - Appearance & About */}
          <div className="lg:col-span-5 space-y-6">
            {/* Appearance */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/60">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Appearance
                </h2>
                <ThemeToggle size="md" />
              </div>
            </div>

            {/* About */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/60">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                About
              </h2>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Recapp</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A minimalist daily journaling app. Capture your moments in beautiful, shareable recaps.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Version 0.0.1
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
