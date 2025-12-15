'use client';

import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MOODS, BLOCK_DEFINITIONS, BlockId } from '@/lib/types';
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
      <div className="flex flex-wrap items-center gap-4">
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
                <Tooltip key={mood.value}>
                  <TooltipTrigger asChild>
                    <button
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
                    >
                      {mood.emoji}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{mood.label}</p>
                  </TooltipContent>
                </Tooltip>
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

        {/* Details Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
            Details:
          </label>
          <div className="flex gap-1.5">
            {(Object.keys(BLOCK_DEFINITIONS) as BlockId[]).map((blockId) => {
              const isSelected = filters.blocks.includes(blockId);
              const definition = BLOCK_DEFINITIONS[blockId];
              return (
                <Tooltip key={blockId}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        const newBlocks = isSelected
                          ? filters.blocks.filter((b) => b !== blockId)
                          : [...filters.blocks, blockId];
                        onFiltersChange({ ...filters, blocks: newBlocks });
                      }}
                      className={cn(
                        'px-2 py-1 rounded-xl text-base transition-colors',
                        isSelected
                          ? 'bg-primary/20 ring-1 ring-primary'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      {definition.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{definition.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
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
              <Tooltip key={mood.value}>
                <TooltipTrigger asChild>
                  <button
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>{mood.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Details Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Details</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BLOCK_DEFINITIONS) as BlockId[]).map((blockId) => {
            const isSelected = filters.blocks.includes(blockId);
            const definition = BLOCK_DEFINITIONS[blockId];
            return (
              <button
                key={blockId}
                onClick={() => {
                  const newBlocks = isSelected
                    ? filters.blocks.filter((b) => b !== blockId)
                    : [...filters.blocks, blockId];
                  onFiltersChange({ ...filters, blocks: newBlocks });
                }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-sm flex items-center gap-1.5',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                <span>{definition.icon}</span>
                <span>{definition.label}</span>
              </button>
            );
          })}
        </div>
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
    </div>
  );
}
