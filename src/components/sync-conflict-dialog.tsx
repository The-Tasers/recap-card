'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Smartphone } from 'lucide-react';

export type SyncResolution = 'cloud' | 'local';

interface SyncConflictDialogProps {
  open: boolean;
  conflictCount: number;
  onResolve: (resolution: SyncResolution) => void;
}

export function SyncConflictDialog({
  open,
  conflictCount,
  onResolve,
}: SyncConflictDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-xs overflow-hidden">
              {/* Header */}
              <div className="px-5 pt-5 pb-3 text-center">
                <p className="text-base font-semibold text-foreground">
                  {conflictCount} {conflictCount === 1 ? 'recap differs' : 'recaps differ'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose which version to keep
                </p>
              </div>

              {/* Options */}
              <div className="px-4 pb-4 space-y-2">
                <button
                  onClick={() => onResolve('local')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                  <Smartphone className="h-4 w-4" />
                  Use this device
                </button>

                <button
                  onClick={() => onResolve('cloud')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted/50 text-muted-foreground font-medium text-sm hover:bg-muted active:scale-[0.98] transition-all"
                >
                  <Cloud className="h-4 w-4" />
                  Use account
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
