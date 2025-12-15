'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCardStore } from '@/lib/store';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { useAuth } from '@/components/auth-provider';
import { Mood, CardBlock, BlockId, BLOCK_DEFINITIONS, DailyCard } from '@/lib/types';
import { generateId } from '@/lib/export';
import { uploadImage, compressImageToDataUrl, deleteImage, isSupabaseStorageUrl } from '@/lib/supabase/storage';
import { MoodSelector } from '@/components/mood-selector';
import { PhotoUploader, PhotoData } from '@/components/photo-uploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { InlineBlockForm } from '@/components/blocks/inline-block-form';

const MAX_CHARS = 200;

interface EditFormContentProps {
  cardId: string;
  onSuccess?: (cardId: string) => void;
  onCancel?: () => void;
}

export function EditFormContent({
  cardId,
  onSuccess,
  onCancel,
}: EditFormContentProps) {
  const { getById, updateCard, hydrated } = useCardStore();
  const { saveRecapToCloud, isAuthenticated } = useSupabaseSync();
  const { user } = useAuth();

  const card = hydrated ? getById(cardId) : undefined;

  // Basic fields
  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
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

  useEffect(() => {
    if (card) {
      setText(card.text);
      setMood(card.mood);
      // Initialize photoData with existing URL if present
      setPhotoData(card.photoUrl ? { existingUrl: card.photoUrl } : undefined);

      // Convert existing blocks array to Record format
      const existingBlocks = initializeBlocks();
      if (card.blocks) {
        card.blocks.forEach((block) => {
          if (block.blockId in existingBlocks) {
            existingBlocks[block.blockId] = block;
          }
        });
      }
      setBlocks(existingBlocks);
    }
  }, [card]);

  const charCount = text.length;
  const isValid = text.trim().length > 0 && charCount <= MAX_CHARS;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (!card) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Handle image upload/processing
      let photoUrl: string | undefined;
      const originalPhotoUrl = card.photoUrl;

      // Check if user explicitly removed the photo
      const photoWasRemoved = photoData?.markedForDeletion === true;
      // Check if user selected a new photo
      const hasNewPhoto = !!photoData?.file;

      if (hasNewPhoto && photoData?.file) {
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

        // Delete old image from storage if it exists
        if (originalPhotoUrl && isSupabaseStorageUrl(originalPhotoUrl)) {
          await deleteImage(originalPhotoUrl);
        }
      } else if (photoWasRemoved) {
        // Photo was removed - delete from storage
        if (originalPhotoUrl && isSupabaseStorageUrl(originalPhotoUrl)) {
          await deleteImage(originalPhotoUrl);
        }
        photoUrl = undefined;
      } else {
        // No change to photo - keep original URL
        photoUrl = originalPhotoUrl;
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
            block.value !== null && block.value !== undefined && block.value !== 0
          );
        } else if (block.type === 'multiselect') {
          return Array.isArray(block.value) && block.value.length > 0;
        }
        return false;
      });

      const updates = {
        text: text.trim(),
        mood,
        photoUrl,
        blocks: nonEmptyBlocks.length > 0 ? nonEmptyBlocks : undefined,
      };

      const success = updateCard(card.id, updates);

      if (success) {
        // Sync to cloud if authenticated
        if (isAuthenticated) {
          const updatedCard: DailyCard = { ...card, ...updates };
          const cloudSuccess = await saveRecapToCloud(updatedCard);
          if (!cloudSuccess) {
            toast.error('Cloud sync failed', {
              description: 'Recap saved locally but failed to sync to cloud. Will retry on next login.',
            });
          }
        }
        toast.success('Recap updated!', {
          description: 'Your changes have been saved successfully.'
        });
        onSuccess?.(card.id);
      } else {
        toast.error('Failed to save', {
          description: 'Could not update the recap. Please try again.',
        });
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Failed to update card', err);
      toast.error('Failed to save', {
        description: 'Could not update the recap. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  if (!hydrated || !card) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600">
        {/* Mood Selector */}
        <div>
          <label className="block text-sm font-medium text-center text-neutral-700 dark:text-neutral-200 mb-3">
            How was your day?
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Blocks - Always visible */}
        <InlineBlockForm blocks={blocks} onChange={setBlocks} />

        {/* Text Input - Moved to bottom */}
        <div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
              What happened today?
            </label>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="A quick note..."
            className="min-h-20 rounded-2xl resize-none text-base"
            maxLength={MAX_CHARS + 50}
          />
          <div className="flex justify-end mt-2">
            <span
              className={`text-xs ${
                charCount > MAX_CHARS
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Photo Upload - Moved to last */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-3">
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
              'Saving...'
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Done
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
