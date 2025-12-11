'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trash2,
  MoreVertical,
  Edit,
  Pin,
  PinOff,
} from 'lucide-react';
import { useCardStore } from '@/lib/store';

import { DailyCardView } from '@/components/daily-card-view';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getById, deleteCard, togglePin, hydrated } = useCardStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const cardId = params.id as string;
  const card = hydrated ? getById(cardId) : undefined;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
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
    router.push('/');
  };

  const handleTogglePin = () => {
    togglePin(card.id);
  };

  const handleEdit = () => {
    router.push(`/card/${card.id}/edit`);
  };

  return (
    <div className="max-w-md mx-auto pb-32">
      <header className="sticky top-0 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 z-10 flex items-center h-20 justify-between mb-6 px-4 py-4">
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

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Card Options</SheetTitle>
              </SheetHeader>
              <div className="grid gap-2 py-4">
                <Button
                  variant="ghost"
                  className="justify-start h-12"
                  onClick={handleTogglePin}
                >
                  {card.isPinned ? (
                    <>
                      <PinOff className="h-5 w-5 mr-3" />
                      Unpin from Home
                    </>
                  ) : (
                    <>
                      <Pin className="h-5 w-5 mr-3" />
                      Pin to Home
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start h-12 text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-5 w-5 mr-3" />
                  Delete Recap
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <div className="px-4">
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
      </div>
    </div>
  );
}
