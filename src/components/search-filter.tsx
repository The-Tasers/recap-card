'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FilterIcon,
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
import { DailyCard, Mood, MOODS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FilterContent } from './filter-content';

export interface SearchFilters {
  query: string;
  moods: Mood[];
  hasPhoto: 'all' | 'yes' | 'no';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  tags: string[];
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  moods: [],
  hasPhoto: 'all',
  dateRange: 'all',
  tags: [],
};

interface SearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export function SearchBar({ filters, onFiltersChange }: SearchBarProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<SearchFilters>(filters);
  const [isDesktopFiltersExpanded, setIsDesktopFiltersExpanded] =
    useState(false);

  const hasActiveFilters =
    filters.moods.length > 0 ||
    filters.hasPhoto !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.tags.length > 0;

  const hasTempFilters =
    tempFilters.moods.length > 0 ||
    tempFilters.hasPhoto !== 'all' ||
    tempFilters.dateRange !== 'all' ||
    tempFilters.tags.length > 0;

  const clearFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
    setTempFilters(DEFAULT_FILTERS);
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setIsSheetOpen(false);
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (open) {
      // Reset temp filters to current filters when opening
      setTempFilters(filters);
    }
    setIsSheetOpen(open);
  };

  return (
    <div className="space-y-4">
      {/* Mobile: Search bar + filter button */}
      <div className="flex gap-2 lg:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your recaps..."
            value={filters.query}
            onChange={(e) =>
              onFiltersChange({ ...filters, query: e.target.value })
            }
            className="pl-9 pr-9 rounded-xl"
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

        {/* Mobile: Sheet */}
        <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'rounded-xl shrink-0',
                hasActiveFilters && 'bg-primary/10 border-primary text-primary'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl pb-safe flex flex-col max-h-[90vh]"
          >
            <SheetHeader className="shrink-0">
              <div className="flex items-center justify-between pr-8">
                <SheetTitle>Filters</SheetTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTempFilters(DEFAULT_FILTERS)}
                  disabled={!hasTempFilters}
                  className="text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </Button>
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">
              <FilterContent
                filters={tempFilters}
                onFiltersChange={setTempFilters}
              />
            </div>
            {/* Apply Button */}
            <div className="shrink-0 py-4 border-t border-neutral-200 dark:border-neutral-800 ">
              <Button
                onClick={applyFilters}
                className="w-full h-12 rounded-xl text-base font-semibold"
                size="lg"
              >
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Filters toggle and search on same line */}
      <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
        <div className="flex items-center gap-4 h-8">
          <Button
            variant="secondary"
            onClick={() =>
              setIsDesktopFiltersExpanded(!isDesktopFiltersExpanded)
            }
            className={cn(
              'flex items-center gap-2 text-sm font-semibold transition-colors px-3 py-1.5 rounded-lg',
              isDesktopFiltersExpanded
                ? 'text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800'
                : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            )}
          >
            <FilterIcon className="h-4 w-4" />
            Filters
            {isDesktopFiltersExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Desktop: Search bar on right */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your recaps..."
            value={filters.query}
            onChange={(e) =>
              onFiltersChange({ ...filters, query: e.target.value })
            }
            className="pl-9 pr-9 rounded-xl"
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
      </div>

      {/* Desktop: Filter content (collapsible) */}
      <div className="hidden lg:block">
        {isDesktopFiltersExpanded && (
          <FilterContent
            filters={filters}
            onFiltersChange={onFiltersChange}
            compact={true}
          />
        )}
      </div>

      {/* Active filter pills - Mobile only */}
      {hasActiveFilters && (
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Active Filters
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-7 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.moods.map((mood) => (
              <FilterPill
                key={mood}
                label={MOODS.find((m) => m.value === mood)?.emoji || ''}
                onRemove={() =>
                  onFiltersChange({
                    ...filters,
                    moods: filters.moods.filter((m) => m !== mood),
                  })
                }
              />
            ))}
            {filters.hasPhoto !== 'all' && (
              <FilterPill
                label={
                  filters.hasPhoto === 'yes'
                    ? '📷 With picture'
                    : '📷 No picture'
                }
                onRemove={() =>
                  onFiltersChange({ ...filters, hasPhoto: 'all' })
                }
              />
            )}
            {filters.dateRange !== 'all' && (
              <FilterPill
                label={`📅 ${filters.dateRange}`}
                onRemove={() =>
                  onFiltersChange({ ...filters, dateRange: 'all' })
                }
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
    <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-xl p-1 -mr-1"
        aria-label="Remove filter"
      >
        <X className="h-4 w-4" />
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

    // Mood filter - multiselect
    if (filters.moods.length > 0) {
      result = result.filter((card) => filters.moods.includes(card.mood));
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
