'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
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

export default function CreatePage() {
  const router = useRouter();
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

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setError(null);

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

    const cardData = {
      text: text.trim(),
      mood,
      photoUrl,
      blocks: blocks.length > 0 ? blocks : undefined,
      tags: tags.length > 0 ? tags : undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      if (overwrite && existingCard) {
        const success = updateCard(existingCard.id, cardData);
        if (success) {
          router.push(`/card/${existingCard.id}`);
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
          router.push(`/card/${newCard.id}`);
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
    <div className="max-w-md mx-auto pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 px-4 py-4 mb-6">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-destructive font-medium">
                Storage Full
              </p>
              <p className="text-xs text-destructive/80">{error}</p>
            </div>
          </div>
        )}
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
              Capture Today
            </h1>
            <p className="text-sm text-muted-foreground">How was your day?</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4">
        {/* Daily Question */}
        <DailyQuestionCard onSelectQuestion={handleSelectQuestion} />

        {/* Mood Selector */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            How are you feeling?
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Text Input */}
        <div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              What happened today?
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
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Photo of the Day
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
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Tags
          </label>

          <div className="flex flex-wrap gap-2">
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full rounded-full h-12 text-base"
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
