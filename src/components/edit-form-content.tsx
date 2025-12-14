'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCardStore } from '@/lib/store';
import { Mood, CardBlock, BlockId, BLOCK_DEFINITIONS } from '@/lib/types';
import { generateId } from '@/lib/export';
import { MoodSelector } from '@/components/mood-selector';
import { PhotoUploader } from '@/components/photo-uploader';
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

  const card = hydrated ? getById(cardId) : undefined;

  // Basic fields
  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();

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
      setPhotoUrl(card.photoUrl);

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

    if (!card) {
      setIsSubmitting(false);
      return;
    }

    const success = updateCard(card.id, {
      text: text.trim(),
      mood,
      photoUrl,
      blocks: nonEmptyBlocks.length > 0 ? nonEmptyBlocks : undefined,
    });

    if (success) {
      toast.success('Recap updated! ✨', {
        description: 'Your changes have been saved successfully.'
      });
      onSuccess?.(card.id);
    } else {
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
          <PhotoUploader value={photoUrl} onChange={setPhotoUrl} />
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
            className="flex-1 rounded-2xl h-12 text-base font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/40 hover:shadow-xl hover:shadow-amber-500/50"
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
