'use client';

import { motion } from 'framer-motion';
import { Archive } from 'lucide-react';
import { MAX_RECAPS } from '@/lib/types';

interface LimitReachedProps {
  currentCount: number;
}

export function LimitReached({ currentCount }: LimitReachedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center px-6 py-8"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-4">
        <Archive className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-medium text-foreground mb-2">
        Your week is full
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        You have {currentCount} of {MAX_RECAPS} recaps saved.
        Remove an older day to make room for today.
      </p>
    </motion.div>
  );
}
