'use client';

import { useState } from 'react';
import {
  Plus,
  Music,
  Footprints,
  Moon,
  Heart,
  Cloud,
  Star,
  ChevronDown,
} from 'lucide-react';
import { BlockId, CardBlock, BLOCK_DEFINITIONS } from '@/lib/types';
import { generateId } from '@/lib/export';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BlockPickerProps {
  onSelect: (block: CardBlock) => void;
  existingBlockIds: string[];
}

export function BlockPicker({ onSelect, existingBlockIds }: BlockPickerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSelect = (blockId: BlockId) => {
    const definition = BLOCK_DEFINITIONS[blockId];
    const newBlock: CardBlock = {
      id: generateId(),
      type: definition.type,
      blockId,
      label: definition.label,
      value: definition.type === 'number' ? 0 : definition.type === 'multiselect' ? [] : '',
      order: existingBlockIds.length,
    };
    onSelect(newBlock);
    setSheetOpen(false);
    setDropdownOpen(false);
  };

  const availableBlocks = (Object.keys(BLOCK_DEFINITIONS) as BlockId[]).filter(
    (id) => !existingBlockIds.includes(id)
  );

  return (
    <>
      {/* Mobile: Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full rounded-full lg:hidden">
            <Plus className="h-4 w-4 mr-2" />
            Add Block
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Add a Block</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {availableBlocks.map((blockId) => {
              const def = BLOCK_DEFINITIONS[blockId];
              return (
                <button
                  key={blockId}
                  onClick={() => handleSelect(blockId)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  <span className="text-xl">{def.icon}</span>
                  <span className="text-sm font-medium">{def.label}</span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: Dropdown */}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full rounded-xl hidden lg:flex"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Block
            <ChevronDown className="h-4 w-4 ml-auto" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[407px]">
          {availableBlocks.map((blockId) => {
            const def = BLOCK_DEFINITIONS[blockId];
            return (
              <DropdownMenuItem
                key={blockId}
                onClick={() => handleSelect(blockId)}
                className="cursor-pointer"
              >
                <span className="text-lg mr-2">{def.icon}</span>
                <span className="text-sm font-medium">{def.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

// Quick add buttons for the editor
interface QuickAddButtonsProps {
  onAddBlock: (blockId: BlockId) => void;
  existingBlockIds: string[];
}

const QUICK_ADD_ITEMS: { blockId: BlockId; icon: React.ReactNode }[] = [
  { blockId: 'sleep', icon: <Moon className="h-4 w-4" /> },
  { blockId: 'weather', icon: <Cloud className="h-4 w-4" /> },
  { blockId: 'meals', icon: <Star className="h-4 w-4" /> },
  { blockId: 'selfcare', icon: <Star className="h-4 w-4" /> },
  { blockId: 'health', icon: <Star className="h-4 w-4" /> },
];

export function QuickAddButtons({
  onAddBlock,
  existingBlockIds,
}: QuickAddButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_ADD_ITEMS.map(({ blockId, icon }) => {
        const isAdded = existingBlockIds.includes(blockId);
        const def = BLOCK_DEFINITIONS[blockId];

        return (
          <button
            key={blockId}
            onClick={() => !isAdded && onAddBlock(blockId)}
            disabled={isAdded}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              isAdded
                ? 'bg-primary/10 text-primary cursor-default'
                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            )}
            title={def.label}
          >
            {icon}
            <span className="hidden sm:inline">{def.label}</span>
          </button>
        );
      })}
    </div>
  );
}
