'use client';

import { formatDate } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface DateBadgeProps {
  date: string;
  variant?: 'default' | 'muted';
  showIcon?: boolean;
}

export function DateBadge({
  date,
  variant = 'default',
  showIcon = false,
}: DateBadgeProps) {
  const { language } = useI18n();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
        variant === 'default'
          ? 'bg-white/80 text-neutral-900 dark:bg-white/10 dark:text-white'
          : 'bg-neutral-100 text-neutral-700 dark:bg-white/5 dark:text-neutral-100'
      )}
    >
      {showIcon && <Calendar className="h-3.5 w-3.5" />}
      {formatDate(new Date(date), language)}
    </span>
  );
}
