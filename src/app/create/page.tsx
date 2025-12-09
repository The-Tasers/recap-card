'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  AlertCircle,
  X,
  Plus,
  Eye,
  Edit2,
} from 'lucide-react';
import { useCardStore } from '@/lib/store';
import {
  Mood,
  DailyCard,
  CardBlock,
  PaletteId,
  StoryTemplateId,
  TypographySetId,
} from '@/lib/types';
import { generateId } from '@/lib/export';
import { MoodSelector } from '@/components/mood-selector';
import { PhotoUploader } from '@/components/photo-uploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
import { ThemeSelector } from '@/components/theme-selector';
import { DailyQuestionCard } from '@/components/daily-question';
import { StoryPreview } from '@/components/story-preview';

const MAX_CHARS = 500;

export default function CreatePage() {
  const router = useRouter();
  const { addCard, updateCard, getCardByDate, error, setError } =
    useCardStore();

  // Basic fields
  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood>('great');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();

  // New design system fields
  const [palette, setPalette] = useState<PaletteId>('warmCinematic');
  const [storyTemplate, setStoryTemplate] =
    useState<StoryTemplateId>('photoHero');
  const [typography, setTypography] = useState<TypographySetId>('modernGeo');
  const [showGrain, setShowGrain] = useState(true);
  const [showVignette, setShowVignette] = useState(true);

  // Legacy fields
  const [blocks, setBlocks] = useState<CardBlock[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [existingCard, setExistingCard] = useState<DailyCard | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const charCount = text.length;
  const isValid = text.trim().length > 0 && charCount <= MAX_CHARS;

  // Tag handlers
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    setTags((prev) => {
      if (prev.includes(tag)) return prev;
      return [...prev, tag];
    });
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
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
      palette,
      storyTemplate,
      typography,
      showGrain,
      showVignette,
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
        'Failed to save. Try removing the photo or deleting old entries.'
      );
      setIsSubmitting(false);
    }
  };

  // Preview card data
  const previewCard = {
    text,
    mood,
    photoUrl,
    blocks: blocks.length > 0 ? blocks : undefined,
    tags: tags.length > 0 ? tags : undefined,
    createdAt: new Date().toISOString(),
  };

  // Preview Mode
  if (showPreview) {
    return (
      <div className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-white">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-neutral-100/90 dark:bg-neutral-950/90 backdrop-blur-sm border-b border-neutral-200/60 dark:border-white/10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Story Preview</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(false)}
              className="text-neutral-900 hover:bg-neutral-200/60 dark:text-white dark:hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Preview Area */}
        <div className="w-full flex flex-col items-center justify-center px-4 pt-8 pb-32 min-h-[calc(100vh-120px)] gap-4">
          {/* Story Preview - 9:16 aspect ratio */}
          <div className="mx-auto">
            <StoryPreview
              card={previewCard}
              palette={palette}
              typography={typography}
              storyTemplate={storyTemplate}
              showGrain={showGrain}
              showVignette={showVignette}
              scale="preview"
            />
          </div>

          {/* Dimensions info */}
          <p className="text-xs text-neutral-500 dark:text-white/50 text-center">
            Story format: 1080 × 1920px (9:16)
            <br />
            <span className="text-neutral-400 dark:text-white/30">
              Optimized for Instagram & TikTok Stories
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-100/95 dark:bg-neutral-950/95 backdrop-blur-sm border-t border-neutral-200/60 dark:border-white/10 p-4 pb-safe">
          <div className="max-w-md mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-full h-12 bg-neutral-200/30 dark:bg-white/5 border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-white hover:bg-neutral-200/60 dark:hover:bg-white/10"
              onClick={() => setShowPreview(false)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              className="flex-1 rounded-full h-12 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-white/90"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              <Check className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-32">
      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-destructive font-medium">Storage Full</p>
            <p className="text-xs text-destructive/80">{error}</p>
          </div>
        </div>
      )}

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
              Capture Today
            </h1>
            <p className="text-sm text-muted-foreground">How was your day?</p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
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
            Add a photo
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
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              onBlur={handleAddTag}
              placeholder="Add a tag..."
              className="rounded-full"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddTag}
              className="rounded-full shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Visual Style */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Visual Style
          </label>
          <div className="flex justify-center">
            <ThemeSelector
              palette={palette}
              storyTemplate={storyTemplate}
              typography={typography}
              showGrain={showGrain}
              showVignette={showVignette}
              onPaletteChange={setPalette}
              onTemplateChange={setStoryTemplate}
              onTypographyChange={setTypography}
              onGrainChange={setShowGrain}
              onVignetteChange={setShowVignette}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={!text.trim()}
            className="flex-1 rounded-full h-12 text-base"
            size="lg"
          >
            <Eye className="h-5 w-5 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="flex-1 rounded-full h-12 text-base"
            size="lg"
          >
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                Save
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
