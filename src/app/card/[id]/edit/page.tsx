'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { Mood, CardBlock, PREDEFINED_TAGS } from '@/lib/types';
import { MoodSelector } from '@/components/mood-selector';
import { PhotoUploader } from '@/components/photo-uploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BlockList } from '@/components/blocks/block-editor';
import { BlockPicker } from '@/components/blocks/block-picker';

// Enable static export for offline support
export const dynamic = 'force-static';
export const dynamicParams = true;

const MAX_CHARS = 500;

export default function EditCardPage() {
  const params = useParams();
  const router = useRouter();
  const { getById, updateCard, hydrated } = useCardStore();

  const cardId = params.id as string;
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

  // Tag handlers
  const handleToggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async () => {
    if (!isValid || !card) return;

    setIsSubmitting(true);
    updateCard(card.id, {
      text: text.trim(),
      mood,
      photoUrl,
      blocks: blocks.length > 0 ? blocks : undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
    router.push(`/card/${card.id}`);
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

  return (
    <div className="max-w-md mx-auto pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 h-20 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 px-4 py-4 mb-6">
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
              Edit Recap
            </h1>
            <p className="text-sm text-muted-foreground">
              Update your thoughts
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4">
        {/* Mood Selector */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-3">
            How are you feeling?
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
            What happened today?
          </label>
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
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
            Photo of the Day
          </label>
          <PhotoUploader value={photoUrl} onChange={setPhotoUrl} />
        </div>

        {/* Blocks */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-3">
            Details
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
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-3">
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
