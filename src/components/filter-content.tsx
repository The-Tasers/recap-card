'use client';

import { Calendar, Image as ImageIcon, Tag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MOODS, PREDEFINED_TAGS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SearchFilters } from './search-filter';

interface FilterContentProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  compact?: boolean;
}

export function FilterContent({
  filters,
  onFiltersChange,
  compact = false,
}: FilterContentProps) {
  if (compact) {
    // Compact desktop layout - all in one row
    return (
      <div className="flex flex-wrap items-start gap-4">
        {/* Mood Filter - Multiselect */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
            Mood:
          </label>
          <div className="flex gap-1.5">
            <button
              onClick={() => onFiltersChange({ ...filters, moods: [] })}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-medium transition-colors',
                filters.moods.length === 0
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              All
            </button>
            {MOODS.map((mood) => {
              const isSelected = filters.moods.includes(mood.value);
              return (
                <button
                  key={mood.value}
                  onClick={() => {
                    const newMoods = isSelected
                      ? filters.moods.filter((m) => m !== mood.value)
                      : [...filters.moods, mood.value];
                    onFiltersChange({ ...filters, moods: newMoods });
                  }}
                  className={cn(
                    'px-2 py-1 rounded-xl text-base transition-colors',
                    isSelected
                      ? 'bg-primary/20 ring-1 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                  title={mood.label}
                >
                  {mood.emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5 inline mr-1" />
            Date:
          </label>
          <Select
            value={filters.dateRange}
            onValueChange={(value: SearchFilters['dateRange']) =>
              onFiltersChange({ ...filters, dateRange: value })
            }
          >
            <SelectTrigger className="w-[130px] h-8 rounded-xl text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Photo Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
            <ImageIcon className="h-3.5 w-3.5 inline mr-1" />
            Picture:
          </label>
          <Select
            value={filters.hasPhoto}
            onValueChange={(value: 'all' | 'yes' | 'no') =>
              onFiltersChange({ ...filters, hasPhoto: value })
            }
          >
            <SelectTrigger className="w-[120px] h-8 rounded-xl text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">With</SelectItem>
              <SelectItem value="no">Without</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
            <Tag className="h-3.5 w-3.5 inline mr-1" />
            Tags:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  const newTags = filters.tags.includes(tag)
                    ? filters.tags.filter((t) => t !== tag)
                    : [...filters.tags, tag];
                  onFiltersChange({ ...filters, tags: newTags });
                }}
                className={cn(
                  'px-2.5 py-1 rounded-xl text-xs font-medium',
                  filters.tags.includes(tag)
                    ? 'bg-violet-500 text-white'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Original mobile layout
  return (
    <div className="space-y-6 py-4">
      {/* Mood Filter - Multiselect */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Mood</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFiltersChange({ ...filters, moods: [] })}
            className={cn(
              'px-3 py-1.5 rounded-xl text-sm',
              filters.moods.length === 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            )}
          >
            All
          </button>
          {MOODS.map((mood) => {
            const isSelected = filters.moods.includes(mood.value);
            return (
              <button
                key={mood.value}
                onClick={() => {
                  const newMoods = isSelected
                    ? filters.moods.filter((m) => m !== mood.value)
                    : [...filters.moods, mood.value];
                  onFiltersChange({ ...filters, moods: newMoods });
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-sm',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                {mood.emoji}
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Picture
        </label>
        <Select
          value={filters.hasPhoto}
          onValueChange={(value: 'all' | 'yes' | 'no') =>
            onFiltersChange({ ...filters, hasPhoto: value })
          }
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All recaps</SelectItem>
            <SelectItem value="yes">With picture</SelectItem>
            <SelectItem value="no">Without picture</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Date Range
        </label>
        <Select
          value={filters.dateRange}
          onValueChange={(value: SearchFilters['dateRange']) =>
            onFiltersChange({ ...filters, dateRange: value })
          }
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                const newTags = filters.tags.includes(tag)
                  ? filters.tags.filter((t) => t !== tag)
                  : [...filters.tags, tag];
                onFiltersChange({ ...filters, tags: newTags });
              }}
              className={cn(
                'px-3 py-1.5 rounded-xl text-sm font-medium',
                filters.tags.includes(tag)
                  ? 'bg-linear-to-r from-violet-500 to-purple-600 text-white'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
