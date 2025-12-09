import { formatDate } from '@/lib/export';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

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
      {formatDate(date)}
    </span>
  );
}
