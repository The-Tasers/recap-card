'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, Plus, Eye, Edit2 } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import {
  Mood,
  CardBlock,
  PaletteId,
  StoryTemplateId,
  TypographySetId,
} from '@/lib/types';
import { MoodSelector } from '@/components/mood-selector';
import { PhotoUploader } from '@/components/photo-uploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { BlockList } from '@/components/blocks/block-editor';
import { BlockPicker } from '@/components/blocks/block-picker';
import { ThemeSelector } from '@/components/theme-selector';
import { StoryPreview } from '@/components/story-preview';

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
  const [tagInput, setTagInput] = useState('');
  const [palette, setPalette] = useState<PaletteId>('warmCinematic');
  const [storyTemplate, setStoryTemplate] =
    useState<StoryTemplateId>('photoHero');
  const [typography, setTypography] = useState<TypographySetId>('modernGeo');
  const [showGrain, setShowGrain] = useState(true);
  const [showVignette, setShowVignette] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (card) {
      setText(card.text);
      setMood(card.mood);
      setPhotoUrl(card.photoUrl);
      setBlocks(card.blocks || []);
      setTags(card.tags || []);
      setPalette(card.palette || 'warmCinematic');
      setStoryTemplate(card.storyTemplate || 'photoHero');
      setTypography(card.typography || 'modernGeo');
      setShowGrain(card.showGrain ?? true);
      setShowVignette(card.showVignette ?? false);
    }
  }, [card]);

  const charCount = text.length;
  const isValid = text.trim().length > 0 && charCount <= MAX_CHARS;

  // Tag handlers
  const handleAddTag = () => {
    const tag = tagInput
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
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
      palette,
      storyTemplate,
      typography,
      showGrain,
      showVignette,
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

  // Preview card data
  const previewCard = {
    text,
    mood,
    photoUrl,
    blocks: blocks.length > 0 ? blocks : undefined,
    tags: tags.length > 0 ? tags : undefined,
    createdAt: card.createdAt,
  };

  // Preview Mode
  if (showPreview) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-neutral-950/90 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(false)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Story Preview</h1>
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
        </header>

        {/* Preview Area */}
        <div className="flex flex-col items-center justify-center px-4 py-8">
          {/* Story Preview - 9:16 aspect ratio */}
          <div className="w-full max-w-[270px]">
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
          <p className="text-xs text-white/50 mt-4 text-center">
            Story format: 1080 × 1920px (9:16)
            <br />
            <span className="text-white/30">
              Optimized for Instagram & TikTok Stories
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-sm border-t border-white/10 p-4 pb-safe">
          <div className="max-w-md mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-full h-12 bg-white/5 border-white/20 text-white hover:bg-white/10"
              onClick={() => setShowPreview(false)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              className="flex-1 rounded-full h-12 bg-white text-black hover:bg-white/90"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              <Check className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/card/${card.id}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-neutral-800">
              Edit Entry
            </h1>
            <p className="text-sm text-muted-foreground">
              Update your thoughts
            </p>
          </div>
        </div>
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
      </header>

      <div className="space-y-6">
        {/* Mood Selector */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            How are you feeling?
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
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
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Photo
          </label>
          <PhotoUploader value={photoUrl} onChange={setPhotoUrl} />
        </div>

        {/* Blocks */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
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
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
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
    </div>
  );
}
