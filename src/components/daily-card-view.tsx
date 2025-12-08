'use client';

import { forwardRef } from 'react';
import { DailyCard } from '@/lib/types';
import { MoodBadge } from './mood-selector';
import { DateBadge } from './date-badge';
import { cn } from '@/lib/utils';

interface DailyCardViewProps {
  card: DailyCard;
  variant?: 'default' | 'compact';
  onClick?: () => void;
  className?: string;
}

export const DailyCardView = forwardRef<HTMLDivElement, DailyCardViewProps>(
  ({ card, variant = 'default', onClick, className }, ref) => {
    const isCompact = variant === 'compact';

    const backgroundStyle = card.photoUrl
      ? {
          backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.95)), url(${card.photoUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : undefined;

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'rounded-3xl p-6 transition-all duration-200',
          'bg-gradient-to-br from-amber-50/80 via-white to-violet-50/80',
          'border border-neutral-200/50 shadow-sm',
          onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.01]',
          className
        )}
        style={backgroundStyle}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <DateBadge date={card.createdAt} variant="muted" />
          <MoodBadge mood={card.mood} size={isCompact ? 'sm' : 'md'} />
        </div>

        <p
          className={cn(
            'text-neutral-800 leading-relaxed whitespace-pre-wrap',
            isCompact ? 'text-sm line-clamp-3' : 'text-base'
          )}
        >
          {card.text}
        </p>

        {card.photoUrl && !isCompact && (
          <div className="mt-4 rounded-2xl overflow-hidden">
            <img
              src={card.photoUrl}
              alt="Card photo"
              className="w-full h-48 object-cover"
            />
          </div>
        )}
      </div>
    );
  }
);

DailyCardView.displayName = 'DailyCardView';
