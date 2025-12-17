'use client';

import { RefObject, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineBlockForm } from '@/components/blocks/inline-block-form';
import { PhotoUploader, PhotoData } from '@/components/photo-uploader';
import { CardBlock, BlockId, Mood } from '@/lib/types';

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
}

// Auto-resize textarea hook
function useAutoResize(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  }, [ref, value]);
}

// Track if user is actively typing
function useTypingState(text: string, delay = 1500) {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (text) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), delay);
      return () => clearTimeout(timer);
    }
  }, [text, delay]);

  return isTyping;
}

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
}: RecapFormProps) {
  // Track typing state to hide UI while actively writing
  const isTyping = useTypingState(text);

  // Track if user has finished their initial thought (paused typing with content)
  const hasContent = text.trim().length > 0;
  const showSecondaryUI = hasContent && !isTyping;

  // Auto-resize the textarea
  useAutoResize(textareaRef, text);

  // Handle keyboard shortcut for save
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onSave && !isSubmitting) {
        e.preventDefault();
        onSave();
      }
    },
    [onSave, isSubmitting]
  );

  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col pt-4 pb-8"
    >
      {/* Writing area - takes focus */}
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder=""
          autoFocus
          className="w-full min-h-32 resize-none text-xl leading-relaxed bg-transparent border-0 outline-none placeholder:text-muted-foreground/30 focus:outline-none caret-primary"
        />
      </div>

      {/* Secondary UI - only appears after user pauses writing */}
      <AnimatePresence>
        {showSecondaryUI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-8 space-y-4"
          >
            {/* Optional additions - collapsed by default */}
            <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
              <InlineBlockForm blocks={blocks} onChange={setBlocks} mood={mood} />
              <PhotoUploader
                value={photoData}
                onChange={setPhotoData}
                collapsible
              />
            </div>

            {/* Save - appears subtly */}
            {onSave && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                onClick={onSave}
                disabled={isSubmitting || !mood}
                className="w-full py-3 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save entry'}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimal save hint when no content yet */}
      <AnimatePresence>
        {!hasContent && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="mt-auto pt-8 text-center text-xs text-muted-foreground"
          >
            ⌘ + Enter to save
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
