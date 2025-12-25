'use client';

import Link from 'next/link';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const LETTER_COLORS = {
  R: '#22c55e',
  E: '#84cc16',
  C: '#eab308',
  A: '#f97316',
  P: '#ef4444',
};

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  muted?: boolean;
  animated?: boolean;
}

export function AppLogo({
  className,
  size = 'sm',
  href,
  muted = false,
  animated = false,
}: AppLogoProps) {
  const sizeConfig = {
    sm: { text: 'text-xs', icon: 'h-3 w-3' },
    md: { text: 'text-base', icon: 'h-4 w-4' },
    lg: { text: 'text-lg', icon: 'h-5 w-5' },
    xl: { text: 'text-2xl', icon: 'h-6 w-6' },
  };

  const { text: textSize, icon: iconSize } = sizeConfig[size];

  const content = (
    <span
      className={cn(
        textSize,
        'font-bold tracking-wide uppercase flex items-center'
      )}
    >
      {Object.entries(LETTER_COLORS).map(([letter, color]) => (
        <span
          key={letter}
          className={muted ? 'transition-colors' : ''}
          style={{ color: muted ? `${color}80` : color }}
        >
          {letter}
        </span>
      ))}
      {animated ? (
        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center"
        >
          <Activity
            className={cn(
              iconSize,
              'rotate-45 text-primary',
              muted && 'opacity-50 group-hover:opacity-80 transition-opacity'
            )}
            strokeWidth={3}
          />
        </motion.span>
      ) : (
        <Activity
          className={cn(
            iconSize,
            'rotate-45 text-primary',
            muted && 'opacity-50 group-hover:opacity-80 transition-opacity'
          )}
          strokeWidth={3}
        />
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={cn('cursor-pointer', className)}>
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
}

interface AppFooterProps {
  className?: string;
  showLogo?: boolean;
}

export function AppFooter({ className, showLogo = true }: AppFooterProps) {
  return (
    <div
      className={cn(
        'shrink-0 py-6 group flex flex-col items-center gap-2',
        className
      )}
    >
      {showLogo && <AppLogo size="sm" href="/" muted />}
      <div className="relative flex items-center justify-center text-xs text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors">
        <span>·</span>
        <Link
          href="/privacy"
          className="absolute right-[calc(50%+8px)] hover:text-muted-foreground transition-colors"
        >
          Privacy
        </Link>
        <Link
          href="/terms"
          className="absolute left-[calc(50%+8px)] hover:text-muted-foreground transition-colors"
        >
          Terms
        </Link>
      </div>
    </div>
  );
}
