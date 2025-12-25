'use client';

import { RefObject, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { QuickAdditions } from '@/components/blocks/quick-additions';
import { MoodSelector } from '@/components/mood-selector';
import { PhotoData } from '@/components/photo-uploader';
import { CardBlock, BlockId, Mood } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

type SaveStatus = 'idle' | 'saving' | 'saved';

interface RecapFormProps {
  mode: 'create' | 'edit';
  text: string;
  setText: (text: string) => void;
  blocks: Record<BlockId, CardBlock>;
  setBlocks: (blocks: Record<BlockId, CardBlock>) => void;
  photoData: PhotoData | undefined;
  setPhotoData: (data: PhotoData | undefined) => void;
  mood: Mood | undefined;
  onMoodChange: (mood: Mood) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  isSubmitting?: boolean;
  onSave?: () => void;
  saveStatus?: SaveStatus;
  isDirty?: boolean;
}

const MAX_TEXT_LENGTH = 1000;

export function RecapForm({
  mode,
  text,
  setText,
  blocks,
  setBlocks,
  photoData,
  setPhotoData,
  mood,
  onMoodChange,
  textareaRef,
  isSubmitting,
  onSave,
  saveStatus = 'idle',
  isDirty = false,
}: RecapFormProps) {
  const { t } = useI18n();
  const [isFlashing, setIsFlashing] = useState(false);

  // Trigger flash + shake effect
  const triggerFlash = () => {
    // Reset to restart animation
    setIsFlashing(false);
    // Use requestAnimationFrame to ensure the class is removed before re-adding
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsFlashing(true);
      });
    });
    // Auto-reset after animation completes
    setTimeout(() => setIsFlashing(false), 300);
  };

  // Handle text change with character limit and visual feedback
  // We don't use maxLength prop because it blocks input before events fire on mobile
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;

    // If trying to exceed limit, flash and truncate
    if (newText.length > MAX_TEXT_LENGTH) {
      triggerFlash();
      setText(newText.slice(0, MAX_TEXT_LENGTH));
      return;
    }

    setText(newText);
  };

  // Move cursor to end of text on mount
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea && text) {
      textarea.setSelectionRange(text.length, text.length);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle keyboard shortcut for save - works globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === 'Enter' &&
        onSave &&
        !isSubmitting &&
        mood
      ) {
        e.preventDefault();
        onSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, isSubmitting, mood]);

  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col pt-4 pb-4 min-h-0"
    >
      {/* Mood selector row */}
      <div className="shrink-0 pb-4">
        <MoodSelector
          value={mood}
          onChange={onMoodChange}
          size="lg"
          fullWidth
        />
      </div>

      {/* Writing area - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder={t('form.placeholder')}
          autoFocus
          className={cn(
            'w-full h-full flex resize-none text-xl leading-relaxed bg-transparent border-0 outline-none placeholder:text-muted-foreground/30 focus:outline-none caret-primary scrollbar-themed',
            isFlashing && 'animate-limit-shake text-rose-400/60'
          )}
        />
      </div>

      {/* Bottom section - fixed at bottom, doesn't scroll */}
      <div className="shrink-0 pt-4">
        {/* Quick additions with save button */}
        <QuickAdditions
          blocks={blocks}
          onBlocksChange={setBlocks}
          photoData={photoData}
          onPhotoChange={setPhotoData}
          saveButton={
            isDirty && mood ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={onSave}
                disabled={saveStatus === 'saving'}
                className="shrink-0 flex items-center gap-1 p-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.95 }}
                aria-label="Save"
              >
                {saveStatus === 'saving' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
              </motion.button>
            ) : null
          }
        />
      </div>
    </motion.div>
  );
}
