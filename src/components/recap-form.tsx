'use client';

import { RefObject, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickAdditions } from '@/components/blocks/quick-additions';
import { PhotoData } from '@/components/photo-uploader';
import { CardBlock, BlockId, Mood } from '@/lib/types';
import { cn } from '@/lib/utils';

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
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  isSubmitting?: boolean;
  onSave?: () => void;
  saveStatus?: SaveStatus;
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
  textareaRef,
  isSubmitting,
  onSave,
  saveStatus = 'idle',
}: RecapFormProps) {
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
      {/* Writing area - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder="What happened today..."
          autoFocus
          className={cn(
            'w-full h-full flex resize-none text-xl leading-relaxed bg-transparent border-0 outline-none placeholder:text-muted-foreground/30 focus:outline-none caret-primary scrollbar-themed',
            isFlashing && 'animate-limit-shake text-rose-400/60'
          )}
        />
      </div>

      {/* Bottom section - fixed at bottom, doesn't scroll */}
      <div className="shrink-0 pt-4 space-y-3">
        {/* Quick additions - always visible */}
        <QuickAdditions
          blocks={blocks}
          onBlocksChange={setBlocks}
          photoData={photoData}
          onPhotoChange={setPhotoData}
        />

        {/* Save button (create mode) or auto-save status (edit mode) */}
        {onSave ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/40">⌘ + Enter</span>
            <motion.button
              initial={{ opacity: 0.6 }}
              whileHover={{ opacity: 1 }}
              onClick={onSave}
              disabled={isSubmitting || !mood}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </motion.button>
          </div>
        ) : (
          mode === 'edit' && (
            <div className="flex items-center justify-end h-6">
              <AnimatePresence mode="wait">
                {saveStatus === 'saving' && (
                  <motion.span
                    key="saving"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground/60"
                  >
                    Saving...
                  </motion.span>
                )}
                {saveStatus === 'saved' && (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground/60"
                  >
                    Saved
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}
