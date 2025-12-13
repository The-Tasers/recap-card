'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { Mood, CardBlock, PREDEFINED_TAGS, DailyCard } from '@/lib/types';
import { MoodSelector } from '@/components/mood-selector';
import { PhotoUploader } from '@/components/photo-uploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BlockList } from '@/components/blocks/block-editor';
import { BlockPicker } from '@/components/blocks/block-picker';

const MAX_CHARS = 500;

interface EditFormContentProps {
  cardId: string;
  onSuccess?: (cardId: string) => void;
  onCancel?: () => void;
}

export function EditFormContent({ cardId, onSuccess, onCancel }: EditFormContentProps) {
  const { getById, updateCard, hydrated } = useCardStore();

  const card = hydrated ? getById(cardId) : undefined;

  // Basic fields
  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();

  // New design system fields
  const [blocks, setBlocks] = useState<CardBlock[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (card) {
      setText(card.text);
      setMood(card.mood);
      setPhotoUrl(card.photoUrl);
      setBlocks(card.blocks || []);
      setTags(card.tags || []);
    }
  }, [card]);

  const charCount = text.length;
  const isValid =
    text.trim().length > 0 && charCount <= MAX_CHARS && tags.length > 0;

  const [showValidationError, setShowValidationError] = useState(false);

  const getValidationMessage = () => {
    const errors = [];
    if (text.trim().length === 0) errors.push('recap text');
    if (tags.length === 0) errors.push('at least one tag');
    if (charCount > MAX_CHARS) errors.push(`reduce text to ${MAX_CHARS} characters`);

    if (errors.length === 0) return '';
    if (errors.length === 1) return `Please add ${errors[0]}`;
    return `Please add ${errors.slice(0, -1).join(', ')} and ${errors[errors.length - 1]}`;
  };

  // Tag handlers
  const handleToggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!isValid || !card) {
      setShowValidationError(true);
      setTimeout(() => setShowValidationError(false), 3000);
      return;
    }

    setShowValidationError(false);
    setIsSubmitting(true);
    const success = updateCard(card.id, {
      text: text.trim(),
      mood,
      photoUrl,
      blocks: blocks.length > 0 ? blocks : undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    if (success) {
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
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-3">
            How are you feeling? <span className="text-destructive">*</span>
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Text Input */}
        <div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
              What happened today? <span className="text-destructive">*</span>
            </label>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write about your day..."
            className="min-h-[150px] rounded-2xl resize-none text-base"
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
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-3">
            Picture of the Day
          </label>
          <PhotoUploader value={photoUrl} onChange={setPhotoUrl} />
        </div>

        {/* Blocks */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
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
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
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
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
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
                Save Changes
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
    </div>
  );
}
