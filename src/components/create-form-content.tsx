'use client';

import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCardStore } from '@/lib/store';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { useAuth } from '@/components/auth-provider';
import {
  Mood,
  DailyCard,
  CardBlock,
  BlockId,
  BLOCK_DEFINITIONS,
} from '@/lib/types';
import { generateId } from '@/lib/export';
import {
  uploadImage,
  compressImageToDataUrl,
  deleteImage,
  isSupabaseStorageUrl,
} from '@/lib/supabase/storage';
import { MoodSelector } from '@/components/mood-selector';
import { PhotoUploader, PhotoData } from '@/components/photo-uploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InlineBlockForm } from '@/components/blocks/inline-block-form';
import { DailyQuestionCard } from '@/components/daily-question';

const MAX_CHARS = 200;

interface CreateFormContentProps {
  onSuccess?: (cardId: string) => void;
  onCancel?: () => void;
  selectedDate?: Date;
}

export function CreateFormContent({
  onSuccess,
  onCancel,
  selectedDate,
}: CreateFormContentProps) {
  const { addCard, updateCard, getCardByDate, error, setError } =
    useCardStore();
  const { saveRecapToCloud, isAuthenticated } = useSupabaseSync();
  const { user } = useAuth();

  // Basic fields
  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood>('great');
  const [photoData, setPhotoData] = useState<PhotoData | undefined>();

  // Initialize all blocks
  const initializeBlocks = (): Record<BlockId, CardBlock> => {
    const blockIds: BlockId[] = [
      'sleep',
      'weather',
      'meals',
      'selfcare',
      'health',
    ];
    const initialBlocks: Record<BlockId, CardBlock> = {} as Record<
      BlockId,
      CardBlock
    >;

    blockIds.forEach((blockId, index) => {
      const definition = BLOCK_DEFINITIONS[blockId];
      initialBlocks[blockId] = {
        id: generateId(),
        type: definition.type,
        blockId,
        label: definition.label,
        value: definition.type === 'number' ? 0 : [],
        order: index,
      };
    });

    return initialBlocks;
  };

  const [blocks, setBlocks] = useState<Record<BlockId, CardBlock>>(
    initializeBlocks()
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [existingCard, setExistingCard] = useState<DailyCard | null>(null);

  // Question handler
  const handleSelectQuestion = (question: string) => {
    setText((prev) => (prev ? `${prev}\n\n${question}` : question));
  };

  const charCount = text.length;

  const handleSubmit = async () => {
    const targetDate = selectedDate || new Date();

    // Check if the target date is in the future
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );

    if (target > today) {
      toast.error('Time travel not supported yet! 🚀', {
        description:
          'You can only create recaps for today or past days. The future is still unwritten!',
      });
      return;
    }

    const todayCard = getCardByDate(targetDate.toISOString());
    if (todayCard) {
      setExistingCard(todayCard);
      setShowOverwriteDialog(true);
      return;
    }

    await saveCard();
  };

  const saveCard = async (overwrite = false) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Handle image upload/processing
      let photoUrl: string | undefined;

      if (photoData?.file) {
        // New file selected - need to upload
        if (user?.id) {
          // Authenticated user: upload to Supabase Storage
          const { url, error } = await uploadImage(photoData.file, user.id);
          if (error) {
            toast.error('Image upload failed', { description: error });
            setIsSubmitting(false);
            return;
          }
          photoUrl = url ?? undefined;
        } else {
          // Anonymous user: compress to base64
          photoUrl = await compressImageToDataUrl(photoData.file);
        }

        // If overwriting and there was an existing image, delete it
        if (
          overwrite &&
          existingCard?.photoUrl &&
          isSupabaseStorageUrl(existingCard.photoUrl)
        ) {
          await deleteImage(existingCard.photoUrl);
        }
      }

      // Revoke preview URL to free memory
      if (photoData?.previewUrl) {
        URL.revokeObjectURL(photoData.previewUrl);
      }

      // Convert blocks object to array and filter non-empty ones
      const blocksArray = Object.values(blocks);
      const nonEmptyBlocks = blocksArray.filter((block) => {
        if (block.type === 'number') {
          return (
            block.value !== null &&
            block.value !== undefined &&
            block.value !== 0
          );
        } else if (block.type === 'multiselect') {
          return Array.isArray(block.value) && block.value.length > 0;
        }
        return false;
      });

      const targetDate = selectedDate || new Date();
      const cardData = {
        text: text.trim(),
        mood,
        photoUrl,
        blocks: nonEmptyBlocks.length > 0 ? nonEmptyBlocks : undefined,
        createdAt: targetDate.toISOString(),
      };

      if (overwrite && existingCard) {
        const updatedCard = { ...existingCard, ...cardData };
        const success = updateCard(existingCard.id, cardData);
        if (success) {
          // Sync to cloud if authenticated
          if (isAuthenticated) {
            const cloudSuccess = await saveRecapToCloud(updatedCard);
            if (!cloudSuccess) {
              toast.error('Cloud sync failed', {
                description:
                  'Recap saved locally but failed to sync to cloud. Will retry on next login.',
              });
            }
          }
          onSuccess?.(existingCard.id);
        } else {
          setIsSubmitting(false);
        }
      } else {
        const newCard: DailyCard = {
          ...cardData,
          id: generateId(),
        };
        const success = addCard(newCard);
        if (success) {
          // Sync to cloud if authenticated
          if (isAuthenticated) {
            const cloudSuccess = await saveRecapToCloud(newCard);
            if (!cloudSuccess) {
              toast.error('Cloud sync failed', {
                description:
                  'Recap saved locally but failed to sync to cloud. Will retry on next login.',
              });
            }
          }
          onSuccess?.(newCard.id);
        } else {
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      console.error('Failed to save card', err);
      setError(
        'Failed to save. Try removing the photo or deleting old recaps.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-destructive font-medium">Storage Full</p>
            <p className="text-xs text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-6 pb-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600">
        {/* Mood Selector */}
        <div>
          <label className="block text-sm font-medium text-center text-neutral-700 dark:text-neutral-300 mb-3">
            How was your day?
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Blocks - Always visible */}
        <InlineBlockForm blocks={blocks} onChange={setBlocks} />

        {/* Text Input - Moved to bottom */}
        <div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              What happened today?
            </label>
          </div>
          <div className="mb-4">
            {/* Daily Question */}
            <DailyQuestionCard onSelectQuestion={handleSelectQuestion} />
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="A quick note..."
            className="min-h-[80px] rounded-2xl resize-none text-base"
            maxLength={MAX_CHARS + 50}
          />
          <div className="flex justify-end mt-2">
            <span className="text-xs text-muted-foreground">
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Photo Upload - Moved to last */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Picture of the Day
          </label>
          <PhotoUploader value={photoData} onChange={setPhotoData} />
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4">
        <div className="flex gap-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 rounded-2xl h-12 text-base font-semibold"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-2xl h-12 text-base font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 hover:shadow-md hover:shadow-amber-500/25"
            size="lg"
          >
            {isSubmitting ? (
              'Saving this moment...'
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Done
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overwrite Dialog */}
      <Dialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recap Already Exists</DialogTitle>
            <DialogDescription>
              You already have a recap for today. Would you like to replace it
              with this new one?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowOverwriteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowOverwriteDialog(false);
                saveCard(true);
              }}
            >
              Replace Recap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
