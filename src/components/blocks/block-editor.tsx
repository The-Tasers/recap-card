'use client';

import { useState } from 'react';
import { GripVertical, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CardBlock, BlockType, BLOCK_DEFINITIONS, BlockId } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
        if (block.blockId === 'oneLine' || block.blockId === 'gratitude') {
          return (
            <Input
              value={block.value as string}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={definition.placeholder}
              className="rounded-xl"
            />
          );
        }
        return (
          <Textarea
            value={block.value as string}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={definition.placeholder}
            className="rounded-xl min-h-[80px] resize-none"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={block.value as number}
            onChange={(e) => handleValueChange(Number(e.target.value) || 0)}
            placeholder={definition.placeholder}
            className="rounded-xl w-32"
            min={0}
          />
        );
      
      case 'link':
        return (
          <Input
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
            value={block.value as number}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            className="w-full"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-neutral-200/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-neutral-50/50">
        <div className="flex flex-col gap-0.5">
          {!isFirst && onMoveUp && (
            <button
              onClick={onMoveUp}
              className="p-0.5 hover:bg-neutral-200 rounded transition-colors"
            >
              <ChevronUp className="h-3 w-3 text-neutral-400" />
            </button>
          )}
          {!isLast && onMoveDown && (
            <button
              onClick={onMoveDown}
              className="p-0.5 hover:bg-neutral-200 rounded transition-colors"
            >
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>
          )}
        </div>
        
        <span className="text-lg">{definition.icon}</span>
        <span className="text-sm font-medium text-neutral-700 flex-1">
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
          className="p-1 hover:bg-red-100 rounded transition-colors"
        >
          <X className="h-4 w-4 text-neutral-400 hover:text-red-500" />
        </button>
      </div>
      
      {/* Content */}
      {!isCollapsed && (
        <div className="p-3 pt-0">
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
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    newBlocks.forEach((b, i) => (b.order = i));
    onChange(newBlocks);
  };

  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
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
          <span className="text-lg font-semibold">
            {block.value}
            {block.blockId === 'sleep' && ' hrs'}
            {block.blockId === 'steps' && ' steps'}
          </span>
        );
      
      case 'link':
        const isSpotifyLink = String(block.value).includes('spotify');
        return (
          <span className={cn(
            "text-sm",
            isSpotifyLink && "text-green-600"
          )}>
            {block.value}
          </span>
        );
      
      default:
        return (
          <p className={cn(
            "text-neutral-700",
            compact ? "text-sm line-clamp-2" : "text-base"
          )}>
            {block.value}
          </p>
        );
    }
  };

  return (
    <div className={cn(
      "flex items-start gap-2",
      compact ? "py-1" : "py-2"
    )}>
      <span className="text-base shrink-0">{definition.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{block.label}</p>
        {renderValue()}
      </div>
    </div>
  );
}
