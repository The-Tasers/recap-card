'use client';

import { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, Calendar, Image, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DailyCard, Mood, MOODS } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface SearchFilters {
  query: string;
  mood: Mood | 'all';
  hasPhoto: 'all' | 'yes' | 'no';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  tags: string[];
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  mood: 'all',
  hasPhoto: 'all',
  dateRange: 'all',
  tags: [],
};

interface SearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags: string[];
}

export function SearchBar({ filters, onFiltersChange, availableTags }: SearchBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters =
    filters.mood !== 'all' ||
    filters.hasPhoto !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.tags.length > 0;

  const clearFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your cards..."
            value={filters.query}
            onChange={(e) =>
              onFiltersChange({ ...filters, query: e.target.value })
            }
            className="pl-9 pr-9 rounded-full"
          />
          {filters.query && (
            <button
              onClick={() => onFiltersChange({ ...filters, query: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'rounded-full shrink-0',
                hasActiveFilters && 'bg-primary/10 border-primary text-primary'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
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
                      onClick={() =>
                        onFiltersChange({ ...filters, mood: mood.value })
                      }
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
                  <Image className="h-4 w-4" />
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
                    <SelectItem value="all">All cards</SelectItem>
                    <SelectItem value="yes">With photo</SelectItem>
                    <SelectItem value="no">Without photo</SelectItem>
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
              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          const newTags = filters.tags.includes(tag)
                            ? filters.tags.filter((t) => t !== tag)
                            : [...filters.tags, tag];
                          onFiltersChange({ ...filters, tags: newTags });
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm',
                          filters.tags.includes(tag)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full rounded-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.mood !== 'all' && (
            <FilterPill
              label={MOODS.find((m) => m.value === filters.mood)?.emoji || ''}
              onRemove={() => onFiltersChange({ ...filters, mood: 'all' })}
            />
          )}
          {filters.hasPhoto !== 'all' && (
            <FilterPill
              label={filters.hasPhoto === 'yes' ? '📷 With photo' : '📷 No photo'}
              onRemove={() => onFiltersChange({ ...filters, hasPhoto: 'all' })}
            />
          )}
          {filters.dateRange !== 'all' && (
            <FilterPill
              label={`📅 ${filters.dateRange}`}
              onRemove={() => onFiltersChange({ ...filters, dateRange: 'all' })}
            />
          )}
          {filters.tags.map((tag) => (
            <FilterPill
              key={tag}
              label={`#${tag}`}
              onRemove={() =>
                onFiltersChange({
                  ...filters,
                  tags: filters.tags.filter((t) => t !== tag),
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:bg-primary/20 rounded-full p-0.5">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// Hook for filtering cards
export function useCardSearch(cards: DailyCard[], filters: SearchFilters) {
  return useMemo(() => {
    let result = [...cards];

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      result = result.filter(
        (card) =>
          card.text.toLowerCase().includes(query) ||
          card.blocks?.some(
            (block) =>
              block.label.toLowerCase().includes(query) ||
              String(block.value).toLowerCase().includes(query)
          ) ||
          card.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Mood filter
    if (filters.mood !== 'all') {
      result = result.filter((card) => card.mood === filters.mood);
    }

    // Photo filter
    if (filters.hasPhoto === 'yes') {
      result = result.filter((card) => card.photoUrl);
    } else if (filters.hasPhoto === 'no') {
      result = result.filter((card) => !card.photoUrl);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let startDate: Date;
      switch (filters.dateRange) {
        case 'today':
          startDate = startOfDay;
          break;
        case 'week':
          startDate = new Date(startOfDay);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(startOfDay);
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(startOfDay);
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = new Date(0);
      }

      result = result.filter((card) => new Date(card.createdAt) >= startDate);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      result = result.filter((card) =>
        filters.tags.every((tag) => card.tags?.includes(tag))
      );
    }

    return result;
  }, [cards, filters]);
}

// Extract all unique tags from cards
export function extractTags(cards: DailyCard[]): string[] {
  const tagSet = new Set<string>();
  cards.forEach((card) => {
    card.tags?.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}
