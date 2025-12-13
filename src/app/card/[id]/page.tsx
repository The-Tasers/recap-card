'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { useOnboardingGuard } from '@/hooks/useOnboardingGuard';

import { DailyCardView } from '@/components/daily-card-view';
import { Button } from '@/components/ui/button';
import { EditSheet } from '@/components/edit-sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isChecking } = useOnboardingGuard();
  const { getById, deleteCard, hydrated } = useCardStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  const cardId = params.id as string;
  const card = hydrated ? getById(cardId) : undefined;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  if (!hydrated || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="max-w-md lg:max-w-3xl mx-auto px-4 lg:px-8 py-6">
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
            Not Found
          </h1>
        </header>
        <div className="text-center py-12 text-muted-foreground">
          This card doesn&apos;t exist or has been deleted.
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteCard(card.id);
    router.push('/timeline');
  };

  const handleEdit = () => {
    // Always open sheet for both mobile and desktop
    setShowEditSheet(true);
  };

  return (
    <div className="max-w-md lg:max-w-3xl mx-auto pb-32">
      <header className="sticky top-0 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 z-10 h-20 mb-6">
        <div className="px-4 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
                {new Date(card.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleEdit}
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <div className="px-4 lg:px-8 lg:max-w-4xl lg:mx-auto">
        {/* Card View */}
        <DailyCardView card={card} />

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Recap</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this recap? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Sheet for mobile */}
        <EditSheet
          cardId={card.id}
          open={showEditSheet}
          onOpenChange={setShowEditSheet}
        />
      </div>
    </div>
  );
}
