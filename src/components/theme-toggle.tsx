'use client';

import { Moon, Sun } from 'lucide-react';
import { useCardStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  size?: 'sm' | 'md';
  variant?: 'default' | 'compact';
  className?: string;
}

export function ThemeToggle({ size = 'sm', variant = 'default', className }: ThemeToggleProps) {
  const { theme, setTheme } = useCardStore();

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const padding = variant === 'compact' ? 'p-1.5' : (size === 'sm' ? 'p-2' : 'p-2.5');

  return (
    <div className={cn(
      'flex items-center',
      variant === 'compact'
        ? 'gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5'
        : 'gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-neutral-200/50 dark:border-neutral-700/50',
      className
    )}>
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'transition-colors',
          variant === 'compact' ? 'rounded-md' : 'rounded-xl',
          padding,
          theme === 'light'
            ? 'bg-amber-500 text-white'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        )}
        aria-label="Light theme"
      >
        <Sun className={iconSize} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'transition-colors',
          variant === 'compact' ? 'rounded-md' : 'rounded-xl',
          padding,
          theme === 'dark'
            ? 'bg-amber-500 text-white'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        )}
        aria-label="Dark theme"
      >
        <Moon className={iconSize} />
      </button>
    </div>
  );
}
