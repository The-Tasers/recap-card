'use client';

import { useRouter } from 'next/navigation';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DailyCard } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CardTableViewProps {
  cards: DailyCard[];
  onEdit?: (card: DailyCard) => void;
  onDelete?: (card: DailyCard) => void;
}

const MOOD_COLORS: Record<string, string> = {
  great: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  good: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  neutral: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  bad: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  terrible: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const MOOD_EMOJIS: Record<string, string> = {
  great: '😄',
  good: '🙂',
  neutral: '😐',
  bad: '😟',
  terrible: '😢',
};

export function CardTableView({ cards, onEdit, onDelete }: CardTableViewProps) {
  const router = useRouter();
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };


  const handleRowClick = (cardId: string, event: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons or their container
    const target = event.target as HTMLElement;
    if (target.closest('[data-actions-cell]')) {
      return;
    }
    router.push(`/card/${cardId}`);
  };

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Mood
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Content
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Tags
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300 w-16">

            </th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr
              key={card.id}
              onClick={(e) => handleRowClick(card.id, e)}
              className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {/* Date */}
              <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                {formatDate(card.createdAt)}
              </td>

              {/* Mood */}
              <td className="py-3 px-4">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium',
                    MOOD_COLORS[card.mood] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                  )}
                >
                  <span className="text-sm">{MOOD_EMOJIS[card.mood] || '😐'}</span>
                  {card.mood}
                </span>
              </td>

              {/* Content */}
              <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300 max-w-md">
                <div className="line-clamp-2">{card.text}</div>
              </td>

              {/* Tags */}
              <td className="py-3 px-4">
                {card.tags && card.tags.length > 0 ? (
                  <div className="flex items-center flex-wrap gap-1">
                    {card.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                      >
                        #{tag}
                      </span>
                    ))}
                    {card.tags.length > 2 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 cursor-help">
                            +{card.tags.length - 2}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {card.tags.slice(2).join(', ')}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-neutral-400 dark:text-neutral-600">—</span>
                )}
              </td>

              {/* Actions */}
              <td className="py-3 px-4" data-actions-cell>
                <div className="flex items-center justify-center">
                  <Popover
                    open={openPopoverId === card.id}
                    onOpenChange={(open) => setOpenPopoverId(open ? card.id : null)}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1" align="end">
                      <div className="flex flex-col">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            className="justify-start h-9 px-2 text-sm font-normal"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPopoverId(null);
                              onEdit(card);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            className="justify-start h-9 px-2 text-sm font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPopoverId(null);
                              onDelete(card);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {cards.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No recaps to display
          </p>
        </div>
      )}
    </div>
  );
}
