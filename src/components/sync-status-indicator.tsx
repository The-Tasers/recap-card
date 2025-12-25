'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Smartphone, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type SyncNotification } from '@/components/sync-provider';
import { useI18n } from '@/lib/i18n';

interface SyncStatusIndicatorProps {
  isAuthenticated: boolean;
  syncNotification?: SyncNotification;
  className?: string;
}

export function SyncStatusIndicator({
  isAuthenticated,
  syncNotification,
  className,
}: SyncStatusIndicatorProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-muted-foreground/50',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {syncNotification ? (
          <motion.div
            key="notification"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'flex items-center gap-1.5',
              syncNotification.type === 'success' && 'text-primary/70',
              syncNotification.type === 'error' && 'text-destructive/70'
            )}
          >
            {syncNotification.type === 'success' ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            <span className="text-xs">{syncNotification.message}</span>
          </motion.div>
        ) : (
          <motion.div
            key="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-muted-foreground rounded-sm bg-muted px-2 py-1"
          >
            {isAuthenticated ? (
              <>
                <Cloud className="h-3.5 w-3.5" />
                <span className="text-xs">{t('sync.syncedStatus')}</span>
              </>
            ) : (
              <>
                <Smartphone className="h-3.5 w-3.5" />
                <span className="text-xs">{t('sync.localStatus')}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
