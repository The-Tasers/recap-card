'use client';

import { useRef, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  Edit,
  MoreVertical,
  Link2,
  Sparkles,
} from 'lucide-react';
import { useCardStore } from '@/lib/store';
import {
  exportCardImage,
  downloadImage,
  shareImage,
  formatFullDate,
} from '@/lib/export';
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
import { ShareLinkDialog } from '@/components/share-link';

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const { getById, deleteCard, hydrated } = useCardStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [card, setCard] = useState<ReturnType<typeof getById>>(undefined);

  const cardId = params.id as string;

  useEffect(() => {
    if (hydrated) {
      setCard(getById(cardId));
    }
  }, [hydrated, cardId, getById]);

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
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-neutral-800">Not Found</h1>
        </header>
        <div className="text-center py-12 text-muted-foreground">
          This card doesn&apos;t exist or has been deleted.
        </div>
      </div>
    );
  }

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await exportCardImage(cardRef.current);
      const filename = `recap-${formatFullDate(card.createdAt).replace(
        /\s/g,
        '-'
      )}.png`;

      // Try native share first (mobile)
      const shared = await shareImage(dataUrl, 'My Day Recap');
      if (!shared) {
        // Fallback to download
        downloadImage(dataUrl, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await exportCardImage(cardRef.current);
      const filename = `recap-${formatFullDate(card.createdAt).replace(
        /\s/g,
        '-'
      )}.png`;
      downloadImage(dataUrl, filename);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    deleteCard(card.id);
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-neutral-800">
              {formatFullDate(card.createdAt)}
            </h1>
          </div>
        </div>

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
                onClick={handleExport}
                disabled={isExporting}
              >
                <Share2 className="h-5 w-5 mr-3" />
                Share Card
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-12"
                onClick={handleDownload}
                disabled={isExporting}
              >
                <Download className="h-5 w-5 mr-3" />
                Download Image
              </Button>
              <Link href={`/card/${card.id}/edit`}>
                <Button variant="ghost" className="justify-start h-12 w-full">
                  <Edit className="h-5 w-5 mr-3" />
                  Edit Entry
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="justify-start h-12 text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-5 w-5 mr-3" />
                Delete Entry
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Card View */}
      <DailyCardView ref={cardRef} card={card} />

      {/* Quick Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Link href={`/card/${card.id}/story`} className="flex-1">
          <Button
            className="w-full rounded-full h-12 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create Story
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 mt-3">
        <Button
          variant="outline"
          className="flex-1 rounded-full h-12"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Share2 className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Share Image'}
        </Button>
        <ShareLinkDialog
          card={card}
          trigger={
            <Button variant="outline" className="flex-1 rounded-full h-12">
              <Link2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          }
        />
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry? This action cannot be
              undone.
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
  );
}
