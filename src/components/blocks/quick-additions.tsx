'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  CardBlock,
  BLOCK_DEFINITIONS,
  WEATHER_OPTIONS,
  MEAL_OPTIONS,
  SELFCARE_OPTIONS,
  HEALTH_OPTIONS,
  EXERCISE_OPTIONS,
  BlockId,
} from '@/lib/types';
import {
  BLOCK_ICONS,
  WEATHER_ICONS,
  MEAL_ICONS,
  SELFCARE_ICONS,
  HEALTH_ICONS,
  EXERCISE_ICONS,
} from '@/lib/icons';
import { cn } from '@/lib/utils';
import { validateImage } from '@/lib/supabase/storage';
import { PhotoData } from '@/components/photo-uploader';
import type { LucideIcon } from 'lucide-react';

// All available quick additions in one flat list
interface QuickOption {
  id: string;
  blockId: BlockId | 'photo';
  value: string;
  label: string;
  icon: LucideIcon;
}

function getAllOptions(): QuickOption[] {
  const options: QuickOption[] = [];

  // Weather
  WEATHER_OPTIONS.forEach((opt) => {
    options.push({
      id: `weather-${opt.value}`,
      blockId: 'weather',
      value: opt.value,
      label: opt.label,
      icon: WEATHER_ICONS[opt.value],
    });
  });

  // Meals
  MEAL_OPTIONS.forEach((opt) => {
    options.push({
      id: `meals-${opt.value}`,
      blockId: 'meals',
      value: opt.value,
      label: opt.label,
      icon: MEAL_ICONS[opt.value],
    });
  });

  // Self-care
  SELFCARE_OPTIONS.forEach((opt) => {
    options.push({
      id: `selfcare-${opt.value}`,
      blockId: 'selfcare',
      value: opt.value,
      label: opt.label,
      icon: SELFCARE_ICONS[opt.value],
    });
  });

  // Health
  HEALTH_OPTIONS.forEach((opt) => {
    options.push({
      id: `health-${opt.value}`,
      blockId: 'health',
      value: opt.value,
      label: opt.label,
      icon: HEALTH_ICONS[opt.value],
    });
  });

  // Exercise
  EXERCISE_OPTIONS.forEach((opt) => {
    options.push({
      id: `exercise-${opt.value}`,
      blockId: 'exercise',
      value: opt.value,
      label: opt.label,
      icon: EXERCISE_ICONS[opt.value],
    });
  });

  return options;
}

interface QuickAdditionsProps {
  blocks: Record<BlockId, CardBlock>;
  onBlocksChange: (blocks: Record<BlockId, CardBlock>) => void;
  photoData: PhotoData | undefined;
  onPhotoChange: (photo: PhotoData | undefined) => void;
}

export function QuickAdditions({
  blocks,
  onBlocksChange,
  photoData,
  onPhotoChange,
}: QuickAdditionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState<BlockId | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  // Close pickers when clicking outside
  useEffect(() => {
    if (!showPicker && !showSleepPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
        setShowSleepPicker(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker, showSleepPicker]);

  const allOptions = getAllOptions();

  // Get currently selected values
  const getSelectedValues = (blockId: BlockId): string[] => {
    const block = blocks[blockId];
    if (!block) return [];
    if (Array.isArray(block.value)) return block.value;
    return [];
  };

  const isSelected = (blockId: BlockId, value: string): boolean => {
    return getSelectedValues(blockId).includes(value);
  };

  const toggleOption = (blockId: BlockId, value: string) => {
    const currentValues = getSelectedValues(blockId);
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onBlocksChange({
      ...blocks,
      [blockId]: {
        ...blocks[blockId],
        value: newValues,
      },
    });
  };

  // Get all selected items for display
  const selectedItems = allOptions.filter((opt) =>
    isSelected(opt.blockId as BlockId, opt.value)
  );

  // Sleep value
  const sleepValue = (blocks.sleep?.value as number) || 0;

  const setSleepValue = (hours: number) => {
    onBlocksChange({
      ...blocks,
      sleep: {
        ...blocks.sleep,
        value: hours,
      },
    });
  };

  // Photo handling
  const displayUrl = photoData?.markedForDeletion
    ? undefined
    : photoData?.previewUrl || photoData?.existingUrl;

  const handlePhotoSelect = async (file: File | undefined) => {
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error('Invalid image', { description: validation.error });
      return;
    }

    setIsProcessingPhoto(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      onPhotoChange({
        file,
        previewUrl,
        existingUrl: photoData?.existingUrl,
      });
    } catch {
      toast.error('Failed to process image');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    if (photoData?.previewUrl) {
      URL.revokeObjectURL(photoData.previewUrl);
    }
    if (photoData?.existingUrl) {
      onPhotoChange({
        existingUrl: photoData.existingUrl,
        markedForDeletion: true,
      });
    } else {
      onPhotoChange(undefined);
    }
  };

  // Categories for the picker
  const categories: { id: BlockId; label: string; icon: LucideIcon }[] = [
    { id: 'weather', label: 'Weather', icon: BLOCK_ICONS.weather },
    { id: 'meals', label: 'Meals', icon: BLOCK_ICONS.meals },
    { id: 'selfcare', label: 'Self-care', icon: BLOCK_ICONS.selfcare },
    { id: 'health', label: 'Health', icon: BLOCK_ICONS.health },
    { id: 'exercise', label: 'Exercise', icon: BLOCK_ICONS.exercise },
  ];

  const getCategoryOptions = (blockId: BlockId) => {
    return allOptions.filter((opt) => opt.blockId === blockId);
  };

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Fixed action row - doesn't shift */}
      <div className="flex items-center gap-3">
        {/* Photo */}
        <button
          type="button"
          onClick={() =>
            displayUrl ? handleRemovePhoto() : photoInputRef.current?.click()
          }
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors',
            displayUrl
              ? 'bg-primary/10 text-primary'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
          disabled={isProcessingPhoto}
        >
          {displayUrl ? (
            <>
              <img
                src={displayUrl}
                alt=""
                className="h-5 w-5 rounded object-cover"
              />
              <span>Photo</span>
              <X className="h-3 w-3 opacity-60" />
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>Photo</span>
            </>
          )}
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
        />

        {/* Sleep button */}
        <button
          type="button"
          onClick={() => {
            setShowSleepPicker(!showSleepPicker);
            setShowPicker(false);
          }}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors',
            showSleepPicker
              ? 'bg-primary text-primary-foreground'
              : sleepValue > 0
              ? 'bg-primary/10 text-primary'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
        >
          <BLOCK_ICONS.sleep className="h-4 w-4" />
          <span>{sleepValue > 0 ? `${sleepValue}h` : 'Sleep'}</span>
        </button>

        {/* Add details button */}
        <button
          type="button"
          onClick={() => {
            setShowPicker(!showPicker);
            setShowSleepPicker(false);
          }}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors',
            showPicker
              ? 'bg-primary text-primary-foreground'
              : selectedItems.length > 0
              ? 'bg-primary/10 text-primary'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
        >
          <Plus
            className={cn(
              'h-4 w-4 transition-transform',
              showPicker && 'rotate-45'
            )}
          />
          <span>
            {selectedItems.length > 0
              ? `${selectedItems.length} added`
              : 'Details'}
          </span>
        </button>
      </div>

      {/* Sleep picker */}
      <AnimatePresence>
        {showSleepPicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pt-2 space-y-3">
              {/* Quick presets */}
              <div className="flex flex-wrap gap-2">
                {[5, 6, 7, 8, 9].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSleepValue(h)}
                    className={cn(
                      'h-9 w-12 rounded-xl text-sm font-medium transition-colors',
                      sleepValue === h
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {h}h
                  </button>
                ))}
              </div>
              {/* Fine-tune slider */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={14}
                  step={0.5}
                  value={sleepValue}
                  onChange={(e) => setSleepValue(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
                />
                <span
                  className={cn(
                    'w-12 text-center text-sm font-medium tabular-nums',
                    sleepValue > 0 ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {sleepValue > 0 ? `${sleepValue}h` : '—'}
                </span>
              </div>
              {/* Clear button */}
              {sleepValue > 0 && (
                <button
                  type="button"
                  onClick={() => setSleepValue(0)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected items - shown below when there are any */}
      <AnimatePresence>
        {selectedItems.length > 0 && !showPicker && !showSleepPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2">
              {selectedItems.map((item) => (
                <motion.button
                  key={item.id}
                  type="button"
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() =>
                    toggleOption(item.blockId as BlockId, item.value)
                  }
                  className="h-7 px-2 rounded-lg bg-primary/10 text-primary flex items-center gap-1.5 text-xs hover:bg-primary/20 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="h-3 w-3" />
                  <span>{item.label}</span>
                  <X className="h-2.5 w-2.5 opacity-60" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pt-2 space-y-3">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  const hasSelections = getSelectedValues(cat.id).length > 0;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setActiveCategory(isActive ? null : cat.id)
                      }
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : hasSelections
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Options for active category */}
              <AnimatePresence mode="wait">
                {activeCategory && (
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-wrap gap-2"
                  >
                    {getCategoryOptions(activeCategory).map((opt) => {
                      const selected = isSelected(activeCategory, opt.value);
                      const Icon = opt.icon;

                      return (
                        <motion.button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            toggleOption(activeCategory, opt.value)
                          }
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors',
                            selected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          )}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{opt.label}</span>
                          {selected && <Check className="h-3.5 w-3.5 ml-0.5" />}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
