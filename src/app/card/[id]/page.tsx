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
  Smartphone,
  Square,
} from 'lucide-react';
import { useCardStore } from '@/lib/store';
import {
  exportCardImage,
  exportStoryImage,
  downloadImage,
  shareImage,
  formatFullDate,
} from '@/lib/export';
import { DailyCardView } from '@/components/daily-card-view';
import { StoryPreview } from '@/components/story-preview';
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
  const storyRef = useRef<HTMLDivElement>(null);
  const { getById, deleteCard, hydrated } = useCardStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStoryPreview, setShowStoryPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'card' | 'story'>('card');
  const [card, setCard] = useState<ReturnType<typeof getById>>(undefined);

  const cardId = params.id as string;

  useEffect(() => {
    if (hydrated) {
      setCard(getById(cardId));
    }
  }, [hydrated, cardId, getById]);

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

  const handleExport = async (format: 'card' | 'story' = 'card') => {
    const ref = format === 'story' ? storyRef : cardRef;
    if (!ref.current) return;
    setIsExporting(true);
    setExportFormat(format);

    try {
      const exportFn = format === 'story' ? exportStoryImage : exportCardImage;
      const dataUrl = await exportFn(ref.current);
      const suffix = format === 'story' ? '-story' : '';
      const filename = `recap-${formatFullDate(card.createdAt).replace(
        /\s/g,
        '-'
      )}${suffix}.jpg`;

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

  const handleDownload = async (format: 'card' | 'story' = 'card') => {
    const ref = format === 'story' ? storyRef : cardRef;
    if (!ref.current) return;
    setIsExporting(true);
    setExportFormat(format);

    try {
      const exportFn = format === 'story' ? exportStoryImage : exportCardImage;
      const dataUrl = await exportFn(ref.current);
      const suffix = format === 'story' ? '-story' : '';
      const filename = `recap-${formatFullDate(card.createdAt).replace(
        /\s/g,
        '-'
      )}${suffix}.jpg`;
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
                onClick={() => handleExport('card')}
                disabled={isExporting}
              >
                <Square className="h-5 w-5 mr-3" />
                Share as Card
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-12"
                onClick={() => setShowStoryPreview(true)}
                disabled={isExporting}
              >
                <Smartphone className="h-5 w-5 mr-3" />
                Share as Story (9:16)
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-12"
                onClick={() => handleDownload('card')}
                disabled={isExporting}
              >
                <Download className="h-5 w-5 mr-3" />
                Download Card
              </Button>
              <Link href={`/card/${card.id}/edit`}>
                <Button variant="ghost" className="justify-start h-12 w-full">
                  <Edit className="h-5 w-5 mr-3" />
                  Edit Recap
                </Button>
              </Link>
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
      </header>

      {/* Card View */}
      <DailyCardView ref={cardRef} card={card} />

      {/* Quick Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          className="flex-1 rounded-full h-12"
          onClick={() => handleExport('card')}
          disabled={isExporting}
        >
          <Share2 className="h-4 w-4 mr-2" />
          {isExporting && exportFormat === 'card' ? 'Exporting...' : 'Share'}
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-full h-12"
          onClick={() => setShowStoryPreview(true)}
          disabled={isExporting}
        >
          <Smartphone className="h-4 w-4 mr-2" />
          Story
        </Button>
        <ShareLinkDialog
          card={card}
          trigger={
            <Button variant="outline" className="flex-1 rounded-full h-12">
              <Link2 className="h-4 w-4 mr-2" />
              Link
            </Button>
          }
        />
      </div>

      {/* Story Preview Dialog */}
      <Dialog open={showStoryPreview} onOpenChange={setShowStoryPreview}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Story Preview (9:16)</DialogTitle>
            <DialogDescription>
              Perfect for Instagram, TikTok, and other social stories
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 py-4">
            <StoryPreview ref={storyRef} card={card} />
          </div>
          <DialogFooter className="px-4 pb-4 gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleDownload('story')}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleExport('story')}
              disabled={isExporting}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isExporting && exportFormat === 'story' ? 'Sharing...' : 'Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recap</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recap? This action cannot be
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
