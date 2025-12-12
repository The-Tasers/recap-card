'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DailyCard, Mood, MOODS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FilterContent } from './filter-content';

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
}

export function SearchBar({ filters, onFiltersChange }: SearchBarProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
            placeholder="Search your recaps..."
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

        {/* Desktop: Popover */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'rounded-full shrink-0 hidden lg:flex',
                hasActiveFilters && 'bg-primary/10 border-primary text-primary'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Filters</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 disabled:opacity-50"
              >
                Clear All
              </Button>
            </div>
            <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
          </PopoverContent>
        </Popover>

        {/* Mobile: Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'rounded-full shrink-0 lg:hidden',
                hasActiveFilters && 'bg-primary/10 border-primary text-primary'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader>
              <div className="flex items-center justify-between pr-8">
                <SheetTitle>Filters</SheetTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 disabled:opacity-0"
                >
                  Clear All
                </Button>
              </div>
            </SheetHeader>
            <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
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
              label={
                filters.hasPhoto === 'yes' ? '📷 With picture' : '📷 No picture'
              }
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

function FilterPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5"
      >
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
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

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
