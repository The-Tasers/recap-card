'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Info, FileJson, User } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { downloadJson } from '@/lib/export';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useState } from 'react';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';

export default function SettingsPage() {
  const router = useRouter();
  const { isChecking } = useOnboardingGuard();
  const {
    cards,
    hydrated,
    theme,
    setTheme,
    setHasSeenOnboarding,
    userName,
    setUserName,
  } = useCardStore();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [nameInput, setNameInput] = useState(userName || '');

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
      `recapp-backup-${new Date().toISOString().split('T')[0]}.json`
    );
  };

  if (!hydrated || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="pb-32 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 h-24 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200/50 dark:border-neutral-700/50">
        <div className="px-4 lg:px-8 h-full flex items-center">
          <div className="flex items-center gap-4 w-full max-w-4xl mx-auto">
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
      </header>

      <div className="px-4 lg:px-8 py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
        {/* Mobile: Grid Layout */}
        <div className="lg:hidden grid grid-cols-1 gap-6">
        {/* Profile */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-neutral-200/50 dark:border-neutral-700/60">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-300 mb-3">
            Profile
          </h2>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="userName"
                className="text-sm text-neutral-600 dark:text-neutral-400 mb-1.5 block"
              >
                Your Name
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="userName"
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name"
                    className="pl-9"
                  />
                </div>
                <Button
                  onClick={() => setUserName(nameInput.trim())}
                  disabled={nameInput === userName || nameInput.trim() === ''}
                  size="default"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

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
              className="w-full"
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

        {/* Desktop: Tabbed Layout */}
        <div className="hidden lg:block">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/60">
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Profile Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="userName-desktop"
                      className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 block"
                    >
                      Your Name
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          id="userName-desktop"
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="Enter your name"
                          className="pl-9"
                        />
                      </div>
                      <Button
                        onClick={() => setUserName(nameInput.trim())}
                        disabled={nameInput === userName || nameInput.trim() === ''}
                        size="default"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/60">
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Appearance
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex-1 p-4 rounded-xl border transition-colors ${
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
                    className={`flex-1 p-4 rounded-xl border transition-colors ${
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
                    className={`flex-1 p-4 rounded-xl border transition-colors ${
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
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data" className="space-y-6">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/60">
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Export Data
                </h2>
                <div className="space-y-3">
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

              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/60">
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Data Management
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  All data is stored locally on your device. No data is sent to any server.
                </p>
                <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive justify-start"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear All Data</DialogTitle>
                      <DialogDescription>
                        This will permanently delete all your recaps. This action cannot be undone.
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
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-700/60">
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  About Recapp
                </h2>
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
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
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
    </div>
  );
}
