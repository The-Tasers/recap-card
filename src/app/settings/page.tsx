'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Trash2,
  Info,
  Download,
  FileJson,
  Calendar,
} from 'lucide-react';
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
import { MoodStats, MoodHeatmap } from '@/components/calendar-view';
import { useState } from 'react';

export default function SettingsPage() {
  const { cards, hydrated } = useCardStore();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleClearAll = () => {
    localStorage.removeItem('recap-cards');
    window.location.reload();
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
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-neutral-800">Settings</h1>
      </header>

      <div className="space-y-6">
        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/50">
          <h2 className="text-sm font-medium text-neutral-500 mb-3">
            Your Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-xl">
              <p className="text-2xl font-semibold text-primary">
                {cards.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Entries</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-2xl font-semibold text-amber-600">
                {cards.length > 0
                  ? Math.ceil(
                      (new Date().getTime() -
                        new Date(
                          cards[cards.length - 1]?.createdAt
                        ).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground">Days Journaling</p>
            </div>
          </div>
        </div>

        {/* Mood Heatmap */}
        {cards.length > 0 && <MoodHeatmap cards={cards} months={3} />}

        {/* Mood Distribution */}
        {cards.length > 0 && <MoodStats cards={cards} />}

        {/* Export Options */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/50">
          <h2 className="text-sm font-medium text-neutral-500 mb-3">
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
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/50">
          <h2 className="text-sm font-medium text-neutral-500 mb-3">
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
                  This will permanently delete all your entries. This action
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
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/50">
          <h2 className="text-sm font-medium text-neutral-500 mb-3">About</h2>
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">AI Day Recap</p>
              <p className="text-xs text-muted-foreground">
                A minimalist daily journaling app. Capture your moments in
                beautiful, shareable cards.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Version 1.1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
