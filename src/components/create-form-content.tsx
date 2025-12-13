'use client';

import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { Mood, DailyCard, CardBlock, PREDEFINED_TAGS } from '@/lib/types';
import { generateId } from '@/lib/export';
import { MoodSelector } from '@/components/mood-selector';
import { PhotoUploader } from '@/components/photo-uploader';
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
import { BlockList } from '@/components/blocks/block-editor';
import { BlockPicker } from '@/components/blocks/block-picker';
import { DailyQuestionCard } from '@/components/daily-question';

const MAX_CHARS = 500;

interface CreateFormContentProps {
  onSuccess?: (cardId: string) => void;
  onCancel?: () => void;
}

export function CreateFormContent({
  onSuccess,
  onCancel,
}: CreateFormContentProps) {
  const { addCard, updateCard, getCardByDate, error, setError } =
    useCardStore();

  // Basic fields
  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood>('great');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();

  // Legacy fields
  const [blocks, setBlocks] = useState<CardBlock[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [existingCard, setExistingCard] = useState<DailyCard | null>(null);

  const charCount = text.length;

  const isValid =
    text.trim().length > 0 && charCount <= MAX_CHARS && tags.length > 0;

  const [showValidationError, setShowValidationError] = useState(false);

  const getValidationMessage = () => {
    const errors = [];
    if (text.trim().length === 0) errors.push('recap text');
    if (tags.length === 0) errors.push('at least one tag');
    if (charCount > MAX_CHARS)
      errors.push(`reduce text to ${MAX_CHARS} characters`);

    if (errors.length === 0) return '';
    if (errors.length === 1) return `Please add ${errors[0]}`;
    return `Please add ${errors.slice(0, -1).join(', ')} and ${
      errors[errors.length - 1]
    }`;
  };

  // Tag handlers
  const handleToggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Question handler
  const handleSelectQuestion = (question: string) => {
    setText((prev) => (prev ? `${prev}\n\n${question}` : question));
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setShowValidationError(true);
      setTimeout(() => setShowValidationError(false), 3000);
      return;
    }
    setError(null);
    setShowValidationError(false);

    const todayCard = getCardByDate(new Date().toISOString());
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

    const nonEmptyBlocks = blocks.filter((block) => {
      if (block.type === 'text' || block.type === 'link') {
        return (block.value as string).trim().length > 0;
      } else if (block.type === 'number') {
        return block.value !== null && block.value !== undefined;
      } else if (block.type === 'weather') {
        return (
          block.value !== null &&
          block.value !== undefined &&
          block.temperature !== undefined &&
          block.weatherCondition !== undefined
        );
      }

      return false;
    });

    const cardData = {
      text: text.trim(),
      mood,
      photoUrl,
      blocks: nonEmptyBlocks.length > 0 ? nonEmptyBlocks : undefined,
      tags: tags.length > 0 ? tags : undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      if (overwrite && existingCard) {
        const success = updateCard(existingCard.id, cardData);
        if (success) {
          onSuccess?.(existingCard.id);
        } else {
          setIsSubmitting(false);
        }
      } else {
        const newCard: DailyCard = {
          id: generateId(),
          ...cardData,
        };
        const success = addCard(newCard);
        if (success) {
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
        {/* Daily Question */}
        <DailyQuestionCard onSelectQuestion={handleSelectQuestion} />

        {/* Mood Selector */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            How are you feeling? <span className="text-destructive">*</span>
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Text Input */}
        <div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              What happened today? <span className="text-destructive">*</span>
            </label>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write about your day..."
            className="min-h-[150px] lg:min-h-[200px] rounded-2xl resize-none text-base lg:text-lg"
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

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Picture of the Day
          </label>
          <PhotoUploader value={photoUrl} onChange={setPhotoUrl} />
        </div>

        {/* Blocks */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Add details
          </label>
          {blocks.length > 0 && (
            <div className="mb-4">
              <BlockList blocks={blocks} onChange={setBlocks} />
            </div>
          )}
          <BlockPicker
            onSelect={(block) => setBlocks((prev) => [...prev, block])}
            existingBlockIds={blocks.map((b) => b.blockId)}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Tags <span className="text-destructive">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Select at least one tag to categorize your recap
          </p>

          <div className="flex flex-wrap gap-2">
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`px-4 py-2 rounded-xl text-sm font-medium md:transition-colors ${
                  tags.includes(tag)
                    ? 'bg-linear-to-r from-violet-500 to-purple-600 text-white shadow-md'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4">
        {showValidationError && (
          <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive font-medium">
              {getValidationMessage()}
            </p>
          </div>
        )}

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
            className="flex-1 rounded-2xl h-12 text-base font-semibold shadow-lg"
            size="lg"
          >
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Save Recap
              </>
            )}
          </Button>
        </div>

        {!isValid && !showValidationError && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Fill in all required fields (*) to save
          </p>
        )}
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
