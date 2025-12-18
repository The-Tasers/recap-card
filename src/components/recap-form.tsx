'use client';

import { RefObject, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickAdditions } from '@/components/blocks/quick-additions';
import { PhotoData } from '@/components/photo-uploader';
import { CardBlock, BlockId, Mood } from '@/lib/types';

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
  saveStatus = 'idle',
}: RecapFormProps) {
  // Track typing state to hide UI while actively writing
  const isTyping = useTypingState(text);

  // Show quick additions always - text is optional
  const showSecondaryUI = !isTyping;

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
      <div className="flex-1 min-h-0 overflow-y-auto">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder=""
          autoFocus
          className="w-full h-full flex resize-none text-xl leading-relaxed bg-transparent border-0 outline-none placeholder:text-muted-foreground/30 focus:outline-none caret-primary"
        />
      </div>

      {/* Bottom section - fixed at bottom, doesn't scroll */}
      <div className="shrink-0 pt-4 space-y-3">
        {/* Quick additions - show after typing */}
        <AnimatePresence>
          {showSecondaryUI && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <QuickAdditions
                blocks={blocks}
                onBlocksChange={setBlocks}
                photoData={photoData}
                onPhotoChange={setPhotoData}
              />
            </motion.div>
          )}
        </AnimatePresence>

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
