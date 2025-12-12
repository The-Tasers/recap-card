'use client';

import {
  Calendar,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
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
}

export function FilterContent({ filters, onFiltersChange }: FilterContentProps) {
  return (
    <div className="space-y-6 py-4">
      {/* Mood Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Mood</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFiltersChange({ ...filters, mood: 'all' })}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm',
              filters.mood === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            )}
          >
            All
          </button>
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => onFiltersChange({ ...filters, mood: mood.value })}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm',
                filters.mood === mood.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Photo
        </label>
        <Select
          value={filters.hasPhoto}
          onValueChange={(value: 'all' | 'yes' | 'no') =>
            onFiltersChange({ ...filters, hasPhoto: value })
          }
        >
          <SelectTrigger className="w-full rounded-full">
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
          <SelectTrigger className="w-full rounded-full">
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
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
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
