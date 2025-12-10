'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, MoveUp, MoveDown } from 'lucide-react';
import { CardBlock, BLOCK_DEFINITIONS } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

      case 'weather':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Condition
              </label>
              <Select
                value={block.weatherCondition || ''}
                onValueChange={(value) => {
                  onChange({
                    ...block,
                    weatherCondition: value,
                    value: `${value}${
                      block.temperature
                        ? `, ${block.temperature}°${
                            block.temperatureUnit || 'C'
                          }`
                        : ''
                    }`,
                  });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select condition..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="☀️ Sunny">☀️ Sunny</SelectItem>
                  <SelectItem value="⛅ Partly Cloudy">
                    ⛅ Partly Cloudy
                  </SelectItem>
                  <SelectItem value="☁️ Cloudy">☁️ Cloudy</SelectItem>
                  <SelectItem value="🌧️ Rainy">🌧️ Rainy</SelectItem>
                  <SelectItem value="⛈️ Stormy">⛈️ Stormy</SelectItem>
                  <SelectItem value="🌨️ Snowy">🌨️ Snowy</SelectItem>
                  <SelectItem value="🌫️ Foggy">🌫️ Foggy</SelectItem>
                  <SelectItem value="🌬️ Windy">🌬️ Windy</SelectItem>
                  <SelectItem value="🥵 Hot">🥵 Hot</SelectItem>
                  <SelectItem value="🥶 Cold">🥶 Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Temperature
                </label>
                <Input
                  type="number"
                  value={block.temperature || ''}
                  onChange={(e) => {
                    const temp = Number(e.target.value);
                    onChange({
                      ...block,
                      temperature: temp || undefined,
                      value: `${block.weatherCondition || ''}${
                        temp ? `, ${temp}°${block.temperatureUnit || 'C'}` : ''
                      }`,
                    });
                  }}
                  placeholder="20"
                  className="rounded-xl"
                />
              </div>
              <div className="w-20">
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Unit
                </label>
                <Select
                  value={block.temperatureUnit || 'C'}
                  onValueChange={(value: 'C' | 'F') => {
                    onChange({
                      ...block,
                      temperatureUnit: value,
                      value: `${block.weatherCondition || ''}${
                        block.temperature
                          ? `, ${block.temperature}°${value}`
                          : ''
                      }`,
                    });
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">°C</SelectItem>
                    <SelectItem value="F">°F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
            {block.blockId === 'steps' && ' steps'}
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
            className="text-sm underline hover:no-underline transition-all text-neutral-900 dark:text-white hover:text-neutral-700 dark:hover:text-white/80 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {linkValue}
          </a>
        ) : (
          <span className="text-sm text-neutral-900 dark:text-white font-medium">
            {block.value}
          </span>
        );

      case 'weather':
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-neutral-900 dark:text-white">
              {block.weatherCondition || block.value}
            </span>
            {block.temperature && (
              <span className="text-sm text-neutral-600 dark:text-white/70">
                {block.temperature}°{block.temperatureUnit || 'C'}
              </span>
            )}
          </div>
        );

      default:
        return (
          <p
            className={cn(
              'text-neutral-700 dark:text-neutral-300',
              compact ? 'text-sm line-clamp-2' : 'text-base'
            )}
          >
            {block.value}
          </p>
        );
    }
  };

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
