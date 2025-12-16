'use client';

import { RefObject } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { InlineQuestionHint } from '@/components/daily-question';
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
  onSelectQuestion: (question: string) => void;
}

const animations = {
  create: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  edit: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
};

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
  onSelectQuestion,
}: RecapFormProps) {
  const anim = animations[mode];

  return (
    <motion.div
      key={mode}
      initial={anim.initial}
      animate={anim.animate}
      exit={anim.exit}
      transition={anim.transition}
      className="space-y-6 pb-24"
    >
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        autoFocus
        className="min-h-[120px] rounded-2xl resize-none text-base border-0 bg-neutral-50 dark:bg-neutral-900 focus-visible:ring-1"
      />

      {!text.trim() && (
        <InlineQuestionHint onSelect={onSelectQuestion} />
      )}

      <div className="space-y-6">
        <InlineBlockForm blocks={blocks} onChange={setBlocks} mood={mood} />
        <PhotoUploader
          value={photoData}
          onChange={setPhotoData}
          collapsible
        />
      </div>
    </motion.div>
  );
}
