'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, MoveUp, MoveDown } from 'lucide-react';
import {
  CardBlock,
  BLOCK_DEFINITIONS,
  WEATHER_OPTIONS,
  MEAL_OPTIONS,
  SELFCARE_OPTIONS,
  HEALTH_OPTIONS,
} from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { cn } from '@/lib/utils';

interface BlockEditorProps {
  block: CardBlock;
  onChange: (block: CardBlock) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function BlockEditor({
  block,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const definition = BLOCK_DEFINITIONS[block.blockId];

  const handleValueChange = (value: string | number) => {
    onChange({ ...block, value });
  };

  const renderInput = () => {
    switch (block.type) {
      case 'text':
        return (
          <Textarea
            autoFocus
            value={block.value as string}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={definition.placeholder}
            className="rounded-xl min-h-20 resize-none"
          />
        );

      case 'number':
        return (
          <Input
            autoFocus
            type="number"
            value={
              block.value === 0 || block.value === ''
                ? ''
                : (block.value as number)
            }
            onChange={(e) =>
              handleValueChange(
                e.target.value === '' ? '' : Number(e.target.value)
              )
            }
            placeholder={definition.placeholder}
            className="rounded-xl w-32"
            min={0}
          />
        );

      case 'link':
        return (
          <Input
            autoFocus
            value={block.value as string}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={definition.placeholder}
            className="rounded-xl"
          />
        );

      case 'slider':
        return (
          <input
            type="range"
            min={0}
            max={10}
            autoFocus
            value={block.value as number}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            className="w-full"
          />
        );

      case 'multiselect':
        const getOptions = () => {
          switch (block.blockId) {
            case 'weather':
              return WEATHER_OPTIONS;
            case 'meals':
              return MEAL_OPTIONS;
            case 'selfcare':
              return SELFCARE_OPTIONS;
            case 'health':
              return HEALTH_OPTIONS;
            default:
              return [];
          }
        };

        const options = getOptions();
        const selectedValues = (block.value as string[]) || [];

        const toggleOption = (optionValue: string) => {
          const newValues = selectedValues.includes(optionValue)
            ? selectedValues.filter((v) => v !== optionValue)
            : [...selectedValues, optionValue];
          onChange({ ...block, value: newValues });
        };

        return (
          <div className="grid grid-cols-2 gap-2">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all',
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20'
                      : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-600'
                  )}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isSelected
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-neutral-600 dark:text-neutral-400'
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="flex flex-col gap-0.5">
          {!isFirst && onMoveUp && (
            <button
              onClick={onMoveUp}
              className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
            >
              <MoveUp className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
            </button>
          )}
          {!isLast && onMoveDown && (
            <button
              onClick={onMoveDown}
              className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
            >
              <MoveDown className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
            </button>
          )}
        </div>

        <span className="text-lg">{definition.icon}</span>
        <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500 flex-1">
          {block.label}
        </span>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-neutral-200 rounded transition-colors"
        >
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-neutral-400" />
          )}
        </button>

        <button
          onClick={onRemove}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
        >
          <X className="h-4 w-4 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400" />
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-3 pt-3 bg-neutral-50/30 dark:bg-neutral-900/30">
          {renderInput()}
        </div>
      )}
    </div>
  );
}

interface BlockListProps {
  blocks: CardBlock[];
  onChange: (blocks: CardBlock[]) => void;
}

export function BlockList({ blocks, onChange }: BlockListProps) {
  const handleBlockChange = (index: number, block: CardBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = block;
    onChange(newBlocks);
  };

  const handleRemove = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index - 1],
    ];
    newBlocks.forEach((b, i) => (b.order = i));
    onChange(newBlocks);
  };

  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [
      newBlocks[index + 1],
      newBlocks[index],
    ];
    newBlocks.forEach((b, i) => (b.order = i));
    onChange(newBlocks);
  };

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <BlockEditor
          key={block.id}
          block={block}
          onChange={(b) => handleBlockChange(index, b)}
          onRemove={() => handleRemove(index)}
          onMoveUp={() => handleMoveUp(index)}
          onMoveDown={() => handleMoveDown(index)}
          isFirst={index === 0}
          isLast={index === blocks.length - 1}
        />
      ))}
    </div>
  );
}

// Block display for card view
interface BlockDisplayProps {
  block: CardBlock;
  compact?: boolean;
}

export function BlockDisplay({ block, compact }: BlockDisplayProps) {
  const definition = BLOCK_DEFINITIONS[block.blockId];

  if (!block.value && block.value !== 0) return null;

  const renderValue = () => {
    switch (block.type) {
      case 'number':
        return (
          <span className="text-lg font-semibold text-neutral-900 dark:text-white">
            {block.value}
            {block.blockId === 'sleep' && ' hrs'}
          </span>
        );

      case 'link':
        const linkValue = String(block.value);
        const isUrl =
          linkValue.startsWith('http://') || linkValue.startsWith('https://');

        return isUrl ? (
          <a
            href={linkValue}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline block truncate hover:no-underline transition-all text-neutral-900 dark:text-white hover:text-neutral-700 dark:hover:text-white/80 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {linkValue}
          </a>
        ) : (
          <span className="text-sm text-neutral-900 dark:text-white font-medium">
            {block.value}
          </span>
        );

      case 'multiselect':
        const getOptionsForDisplay = () => {
          switch (block.blockId) {
            case 'weather':
              return WEATHER_OPTIONS;
            case 'meals':
              return MEAL_OPTIONS;
            case 'selfcare':
              return SELFCARE_OPTIONS;
            case 'health':
              return HEALTH_OPTIONS;
            default:
              return [];
          }
        };

        const optionsForDisplay = getOptionsForDisplay();
        const selectedValuesForDisplay = (block.value as string[]) || [];

        if (selectedValuesForDisplay.length === 0) return null;

        return (
          <div className="flex flex-wrap gap-1.5">
            {selectedValuesForDisplay.map((val) => {
              const option = optionsForDisplay.find((o) => o.value === val);
              if (!option) return null;
              return (
                <Tooltip key={val}>
                  <TooltipTrigger asChild>
                    <span className="text-lg cursor-default">
                      {option.icon}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{option.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        );

      default:
        return (
          <p
            className={cn(
              'text-neutral-600 dark:text-white/70',
              compact ? 'text-sm line-clamp-2' : 'text-base'
            )}
          >
            {block.value}
          </p>
        );
    }
  };

  // For multiselect blocks, render inline without wrapper
  if (block.type === 'multiselect') {
    return <div className="py-1">{renderValue()}</div>;
  }

  return (
    <div className={cn('flex items-start gap-2', compact ? 'py-1' : 'py-2')}>
      <span className="text-base shrink-0">{definition.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-600 dark:text-white/70 mb-0.5 font-medium">
          {block.label}
        </p>
        {renderValue()}
      </div>
    </div>
  );
}
