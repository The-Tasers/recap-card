'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  CardBlock,
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

  // Sleep state - stored as number of hours
  const sleepValue = (blocks.sleep?.value as number) || 0;

  // Time picker state - separate hours, minutes, period for wheel-style picker
  const [bedHour, setBedHour] = useState(11);
  const [bedMinute, setBedMinute] = useState(0);
  const [bedPeriod, setBedPeriod] = useState<'AM' | 'PM'>('PM');
  const [wakeHour, setWakeHour] = useState(7);
  const [wakeMinute, setWakeMinute] = useState(0);
  const [wakePeriod, setWakePeriod] = useState<'AM' | 'PM'>('AM');
  const [bedtimePickerOpen, setBedtimePickerOpen] = useState(false);
  const [wakePickerOpen, setWakePickerOpen] = useState(false);
  const [sleepPickerTouched, setSleepPickerTouched] = useState(false);
  const bedtimeRef = useRef<HTMLDivElement>(null);
  const wakeRef = useRef<HTMLDivElement>(null);

  // Convert picker state to minutes from midnight
  const getMinutesFromPicker = (hour: number, minute: number, period: 'AM' | 'PM'): number => {
    let h = hour;
    if (period === 'AM' && hour === 12) h = 0;
    else if (period === 'PM' && hour !== 12) h = hour + 12;
    return h * 60 + minute;
  };

  // Calculate sleep duration in minutes from times
  const calculateSleepMinutes = (bedMin: number, wakeMin: number): number => {
    if (wakeMin > bedMin) {
      return wakeMin - bedMin;
    } else {
      return 24 * 60 - bedMin + wakeMin;
    }
  };

  // Format sleep duration compactly (e.g., "7h 30m" or "8h")
  const formatSleepDuration = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Get current calculated minutes
  const currentBedMinutes = getMinutesFromPicker(bedHour, bedMinute, bedPeriod);
  const currentWakeMinutes = getMinutesFromPicker(wakeHour, wakeMinute, wakePeriod);
  const calculatedMinutes = calculateSleepMinutes(currentBedMinutes, currentWakeMinutes);

  // Save sleep value helper (stores minutes)
  const saveSleep = useCallback((minutes: number) => {
    onBlocksChange({
      ...blocks,
      sleep: {
        ...blocks.sleep,
        value: minutes,
      },
    });
  }, [blocks, onBlocksChange]);

  // Close pickers when clicking outside - auto-save sleep
  useEffect(() => {
    if (!showPicker && !showSleepPicker) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Prevent the click from reaching other elements (like textarea) which would open keyboard
        e.preventDefault();
        e.stopPropagation();

        // Only auto-save sleep if user actually changed values
        if (showSleepPicker && sleepPickerTouched) {
          saveSleep(calculatedMinutes);
        }
        setShowPicker(false);
        setShowSleepPicker(false);
        setSleepPickerTouched(false);
        setActiveCategory(null);
        setBedtimePickerOpen(false);
        setWakePickerOpen(false);
      }
    };

    // Use capture phase to intercept before other handlers
    document.addEventListener('mousedown', handleClickOutside, { capture: true });
    document.addEventListener('touchstart', handleClickOutside, { capture: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, { capture: true });
      document.removeEventListener('touchstart', handleClickOutside, { capture: true });
    };
  }, [showPicker, showSleepPicker, calculatedMinutes, sleepPickerTouched, saveSleep]);

  // Close bedtime/wake dropdowns when clicking outside them (but inside sleep picker)
  useEffect(() => {
    if (!bedtimePickerOpen && !wakePickerOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;

      // Close bedtime picker if clicking outside it
      if (bedtimePickerOpen && bedtimeRef.current && !bedtimeRef.current.contains(target)) {
        setBedtimePickerOpen(false);
      }

      // Close wake picker if clicking outside it
      if (wakePickerOpen && wakeRef.current && !wakeRef.current.contains(target)) {
        setWakePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [bedtimePickerOpen, wakePickerOpen]);

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

  // Throttle ref for option toggle - prevents rapid clicks
  const lastToggleRef = useRef<number>(0);
  const THROTTLE_MS = 150;

  const toggleOption = (blockId: BlockId, value: string) => {
    const now = Date.now();
    if (now - lastToggleRef.current < THROTTLE_MS) return;
    lastToggleRef.current = now;

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

  // Clear sleep values
  const clearSleep = () => {
    setBedHour(11);
    setBedMinute(0);
    setBedPeriod('PM');
    setWakeHour(7);
    setWakeMinute(0);
    setWakePeriod('AM');
    saveSleep(0);
    setShowSleepPicker(false);
    setSleepPickerTouched(false);
  };

  // Clear all block options
  const clearAllOptions = () => {
    const clearedBlocks = { ...blocks };
    (['weather', 'meals', 'selfcare', 'health', 'exercise'] as BlockId[]).forEach((blockId) => {
      if (clearedBlocks[blockId]) {
        clearedBlocks[blockId] = { ...clearedBlocks[blockId], value: [] };
      }
    });
    onBlocksChange(clearedBlocks);
    setActiveCategory(null);
  };

  // Format time for display
  const formatTime = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Options for picker wheels
  const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minuteOptions = [0, 10, 20, 30, 40, 50];
  const periodOptions: ('AM' | 'PM')[] = ['AM', 'PM'];

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!bedtimePickerOpen && !wakePickerOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        bedtimePickerOpen &&
        bedtimeRef.current &&
        !bedtimeRef.current.contains(e.target as Node)
      ) {
        setBedtimePickerOpen(false);
      }
      if (
        wakePickerOpen &&
        wakeRef.current &&
        !wakeRef.current.contains(e.target as Node)
      ) {
        setWakePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [bedtimePickerOpen, wakePickerOpen]);

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

  // Categories for the picker - compact labels for mobile
  const categories: { id: BlockId; label: string; icon: LucideIcon }[] = [
    { id: 'weather', label: 'Weather', icon: BLOCK_ICONS.weather },
    { id: 'meals', label: 'Meals', icon: BLOCK_ICONS.meals },
    { id: 'selfcare', label: 'Hygiene', icon: BLOCK_ICONS.selfcare },
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
            // Only auto-save when closing if user actually changed values
            if (showSleepPicker && sleepPickerTouched) {
              saveSleep(calculatedMinutes);
            }
            if (!showSleepPicker) {
              setSleepPickerTouched(false);
            }
            setShowSleepPicker(!showSleepPicker);
            setShowPicker(false);
          }}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors min-w-[100px]',
            showSleepPicker
              ? 'bg-primary text-primary-foreground'
              : sleepValue > 0
              ? 'bg-primary/10 text-primary'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
        >
          <BLOCK_ICONS.sleep className="h-4 w-4 shrink-0" />
          <span className="truncate">{sleepValue > 0 ? formatSleepDuration(sleepValue) : 'Sleep'}</span>
        </button>

        {/* Add details button */}
        <button
          type="button"
          onClick={() => {
            // Only auto-save sleep if user actually changed values
            if (showSleepPicker && sleepPickerTouched) {
              saveSleep(calculatedMinutes);
            }
            setShowPicker(!showPicker);
            setShowSleepPicker(false);
            setSleepPickerTouched(false);
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
            <div className="pt-3 space-y-4">
              {/* Time pickers row */}
              <div className="flex items-start gap-4">
                {/* Bedtime picker */}
                <div ref={bedtimeRef} className="flex-1 flex flex-col items-center relative">
                  {/* Wheel-style dropdown - opens upward */}
                  <AnimatePresence>
                    {bedtimePickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 left-0 right-0 z-10"
                      >
                        <div className="rounded-xl bg-background border border-border shadow-lg overflow-hidden">
                          <div className="flex">
                            {/* Hours column */}
                            <div className="flex-1 h-40 overflow-y-auto scrollbar-themed border-r border-border/50">
                              {hourOptions.map((h) => (
                                <button
                                  key={h}
                                  type="button"
                                  onClick={() => { setBedHour(h); setSleepPickerTouched(true); }}
                                  className={cn(
                                    'w-full py-2 text-center text-sm transition-colors',
                                    bedHour === h
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-muted text-foreground'
                                  )}
                                >
                                  {h}
                                </button>
                              ))}
                            </div>
                            {/* Minutes column */}
                            <div className="flex-1 h-40 overflow-y-auto scrollbar-themed border-r border-border/50">
                              {minuteOptions.map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => { setBedMinute(m); setSleepPickerTouched(true); }}
                                  className={cn(
                                    'w-full py-2 text-center text-sm transition-colors',
                                    bedMinute === m
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-muted text-foreground'
                                  )}
                                >
                                  {m.toString().padStart(2, '0')}
                                </button>
                              ))}
                            </div>
                            {/* AM/PM column */}
                            <div className="flex-1 h-40 overflow-y-auto scrollbar-themed">
                              {periodOptions.map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => { setBedPeriod(p); setSleepPickerTouched(true); }}
                                  className={cn(
                                    'w-full py-2 text-center text-sm transition-colors',
                                    bedPeriod === p
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-muted text-foreground'
                                  )}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={() => {
                      setBedtimePickerOpen(!bedtimePickerOpen);
                      setWakePickerOpen(false);
                    }}
                    className={cn(
                      'w-full py-3 px-4 rounded-xl text-lg font-medium transition-colors',
                      bedtimePickerOpen
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-foreground hover:bg-muted'
                    )}
                  >
                    {formatTime(bedHour, bedMinute, bedPeriod)}
                  </button>
                  <span className="text-xs text-muted-foreground mt-1.5">Went to bed</span>
                </div>

                {/* Wake time picker */}
                <div ref={wakeRef} className="flex-1 flex flex-col items-center relative">
                  {/* Wheel-style dropdown - opens upward */}
                  <AnimatePresence>
                    {wakePickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 left-0 right-0 z-10"
                      >
                        <div className="rounded-xl bg-background border border-border shadow-lg overflow-hidden">
                          <div className="flex">
                            {/* Hours column */}
                            <div className="flex-1 h-40 overflow-y-auto scrollbar-themed border-r border-border/50">
                              {hourOptions.map((h) => (
                                <button
                                  key={h}
                                  type="button"
                                  onClick={() => { setWakeHour(h); setSleepPickerTouched(true); }}
                                  className={cn(
                                    'w-full py-2 text-center text-sm transition-colors',
                                    wakeHour === h
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-muted text-foreground'
                                  )}
                                >
                                  {h}
                                </button>
                              ))}
                            </div>
                            {/* Minutes column */}
                            <div className="flex-1 h-40 overflow-y-auto scrollbar-themed border-r border-border/50">
                              {minuteOptions.map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => { setWakeMinute(m); setSleepPickerTouched(true); }}
                                  className={cn(
                                    'w-full py-2 text-center text-sm transition-colors',
                                    wakeMinute === m
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-muted text-foreground'
                                  )}
                                >
                                  {m.toString().padStart(2, '0')}
                                </button>
                              ))}
                            </div>
                            {/* AM/PM column */}
                            <div className="flex-1 h-40 overflow-y-auto scrollbar-themed">
                              {periodOptions.map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => { setWakePeriod(p); setSleepPickerTouched(true); }}
                                  className={cn(
                                    'w-full py-2 text-center text-sm transition-colors',
                                    wakePeriod === p
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-muted text-foreground'
                                  )}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={() => {
                      setWakePickerOpen(!wakePickerOpen);
                      setBedtimePickerOpen(false);
                    }}
                    className={cn(
                      'w-full py-3 px-4 rounded-xl text-lg font-medium transition-colors',
                      wakePickerOpen
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 text-foreground hover:bg-muted'
                    )}
                  >
                    {formatTime(wakeHour, wakeMinute, wakePeriod)}
                  </button>
                  <span className="text-xs text-muted-foreground mt-1.5">Woke up</span>
                </div>
              </div>

              {/* Sleep duration display + actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-primary">
                    {formatSleepDuration(calculatedMinutes)}
                  </span>
                  <span className="text-sm text-muted-foreground">sleep</span>
                </div>
                <div className="flex items-center gap-2">
                  {sleepValue > 0 && (
                    <button
                      type="button"
                      onClick={clearSleep}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      saveSleep(calculatedMinutes);
                      setShowSleepPicker(false);
                      setSleepPickerTouched(false);
                    }}
                    className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
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
                {selectedItems.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllOptions}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear</span>
                  </button>
                )}
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
