'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Info, FileJson } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { downloadJson } from '@/lib/export';
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
import { useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const { cards, hydrated, theme, setTheme, setHasSeenOnboarding } =
    useCardStore();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleClearAll = () => {
    setHasSeenOnboarding(false);
    localStorage.removeItem('recap-cards');
    router.push('/');
    setTimeout(() => window.location.reload(), 100);
  };

  const handleExportJson = () => {
    downloadJson(
      cards,
      `recap-backup-${new Date().toISOString().split('T')[0]}.json`
    );
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
          Settings
        </h1>
      </header>

      <div className="space-y-6">
        {/* Theme */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-neutral-200/50 dark:border-neutral-700/60">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-300 mb-3">
            Appearance
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('system')}
              className={`flex-1 p-3 rounded-xl border transition-colors ${
                theme === 'system'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
              }`}
            >
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                System
              </p>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 p-3 rounded-xl border transition-colors ${
                theme === 'light'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
              }`}
            >
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                Light
              </p>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 p-3 rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
              }`}
            >
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                Dark
              </p>
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-neutral-200/50 dark:border-neutral-700/60">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-300 mb-3">
            Export Data
          </h2>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExportJson}
            >
              <FileJson className="h-4 w-4 mr-2" />
              Export as JSON Backup
            </Button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-neutral-200/50 dark:border-neutral-700/60">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-300 mb-3">
            Data Management
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            All data is stored locally on your device. No data is sent to any
            server.
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
                  This will permanently delete all your recaps. This action
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
              <p className="text-sm font-medium">Day Recap</p>
              <p className="text-xs text-muted-foreground">
                A minimalist daily journaling app. Capture your moments in
                beautiful, shareable cards.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Version 0.0.1
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
