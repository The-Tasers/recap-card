'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  X,
  Plus,
  Check,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  CardBlock,
  WEATHER_OPTIONS,
  MEAL_OPTIONS,
  SELFCARE_OPTIONS,
  HEALTH_OPTIONS,
  EXERCISE_OPTIONS,
  SOCIAL_OPTIONS,
  PRODUCTIVITY_OPTIONS,
  HOBBIES_OPTIONS,
  BlockId,
} from '@/lib/types';
import {
  BLOCK_ICONS,
  WEATHER_ICONS,
  MEAL_ICONS,
  SELFCARE_ICONS,
  HEALTH_ICONS,
  EXERCISE_ICONS,
  SOCIAL_ICONS,
  PRODUCTIVITY_ICONS,
  HOBBIES_ICONS,
} from '@/lib/icons';
import { cn } from '@/lib/utils';
import { validateImage } from '@/lib/supabase/storage';
import { PhotoData } from '@/components/photo-uploader';
import type { LucideIcon } from 'lucide-react';
import { useI18n, useTranslatedOptions } from '@/lib/i18n';

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

  // Social
  SOCIAL_OPTIONS.forEach((opt) => {
    options.push({
      id: `social-${opt.value}`,
      blockId: 'social',
      value: opt.value,
      label: opt.label,
      icon: SOCIAL_ICONS[opt.value],
    });
  });

  // Productivity
  PRODUCTIVITY_OPTIONS.forEach((opt) => {
    options.push({
      id: `productivity-${opt.value}`,
      blockId: 'productivity',
      value: opt.value,
      label: opt.label,
      icon: PRODUCTIVITY_ICONS[opt.value],
    });
  });

  // Hobbies
  HOBBIES_OPTIONS.forEach((opt) => {
    options.push({
      id: `hobbies-${opt.value}`,
      blockId: 'hobbies',
      value: opt.value,
      label: opt.label,
      icon: HOBBIES_ICONS[opt.value],
    });
  });

  return options;
}

interface QuickAdditionsProps {
  blocks: Record<BlockId, CardBlock>;
  onBlocksChange: (blocks: Record<BlockId, CardBlock>) => void;
  photoData: PhotoData | undefined;
  onPhotoChange: (photo: PhotoData | undefined) => void;
  saveButton?: React.ReactNode;
}

type BottomSheetMode = 'sleep' | 'details' | null;
type SleepPickerFocus = 'bedtime' | 'wake' | null;
type InlinePanelMode = 'sleep' | 'details' | null;

export function QuickAdditions({
  blocks,
  onBlocksChange,
  photoData,
  onPhotoChange,
  saveButton,
}: QuickAdditionsProps) {
  const { t } = useI18n();
  const { getOptionLabel } = useTranslatedOptions();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [bottomSheetMode, setBottomSheetMode] = useState<BottomSheetMode>(null);
  const [inlinePanelMode, setInlinePanelMode] = useState<InlinePanelMode>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<BlockId>>(
    new Set()
  );
  const photoInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect desktop (md breakpoint = 768px)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Sleep state - stored as number of minutes
  const sleepValue = (blocks.sleep?.value as number) || 0;

  // Time picker state
  const [bedHour, setBedHour] = useState(11);
  const [bedMinute, setBedMinute] = useState(0);
  const [bedPeriod, setBedPeriod] = useState<'AM' | 'PM'>('PM');
  const [wakeHour, setWakeHour] = useState(7);
  const [wakeMinute, setWakeMinute] = useState(0);
  const [wakePeriod, setWakePeriod] = useState<'AM' | 'PM'>('AM');
  const [sleepPickerTouched, setSleepPickerTouched] = useState(false);
  const [sleepPickerFocus, setSleepPickerFocus] =
    useState<SleepPickerFocus>(null);

  // Convert picker state to minutes from midnight
  const getMinutesFromPicker = (
    hour: number,
    minute: number,
    period: 'AM' | 'PM'
  ): number => {
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
    const hourSuffix = t('form.sleepHoursSuffix');
    const minSuffix = t('form.sleepMinutesSuffix');
    if (mins === 0) return `${hours}${hourSuffix}`;
    return `${hours}${hourSuffix} ${mins}${minSuffix}`;
  };

  // Get current calculated minutes
  const currentBedMinutes = getMinutesFromPicker(bedHour, bedMinute, bedPeriod);
  const currentWakeMinutes = getMinutesFromPicker(
    wakeHour,
    wakeMinute,
    wakePeriod
  );
  const calculatedMinutes = calculateSleepMinutes(
    currentBedMinutes,
    currentWakeMinutes
  );

  // Save sleep value helper (stores minutes)
  const saveSleep = useCallback(
    (minutes: number) => {
      onBlocksChange({
        ...blocks,
        sleep: {
          ...blocks.sleep,
          value: minutes,
        },
      });
    },
    [blocks, onBlocksChange]
  );

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

  // Throttle ref for option toggle
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
    setSleepPickerTouched(false);
    setSleepPickerFocus(null);
    // Close whichever panel is open
    setBottomSheetMode(null);
    setInlinePanelMode(null);
  };

  // Options for picker wheels
  const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minuteOptions = [0, 10, 20, 30, 40, 50];
  const periodOptions: ('AM' | 'PM')[] = ['AM', 'PM'];

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

  // Categories for the accordion
  const categories: { id: BlockId; label: string; icon: LucideIcon }[] = [
    { id: 'weather', label: t('category.weather'), icon: BLOCK_ICONS.weather },
    { id: 'meals', label: t('category.meals'), icon: BLOCK_ICONS.meals },
    { id: 'selfcare', label: t('category.selfcare'), icon: BLOCK_ICONS.selfcare },
    { id: 'health', label: t('category.health'), icon: BLOCK_ICONS.health },
    { id: 'exercise', label: t('category.exercise'), icon: BLOCK_ICONS.exercise },
    { id: 'social', label: t('category.social'), icon: BLOCK_ICONS.social },
    { id: 'productivity', label: t('category.productivity'), icon: BLOCK_ICONS.productivity },
    { id: 'hobbies', label: t('category.hobbies'), icon: BLOCK_ICONS.hobbies },
  ];

  const getCategoryOptions = (blockId: BlockId) => {
    return allOptions.filter((opt) => opt.blockId === blockId);
  };

  const toggleCategory = (categoryId: BlockId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Check if any additions have been made
  const hasAdditions = displayUrl || sleepValue > 0 || selectedItems.length > 0;

  // Close bottom sheet
  const closeBottomSheet = useCallback(() => {
    if (bottomSheetMode === 'sleep' && sleepPickerTouched) {
      saveSleep(calculatedMinutes);
    }
    setBottomSheetMode(null);
    setSleepPickerTouched(false);
    setSleepPickerFocus(null);
  }, [bottomSheetMode, sleepPickerTouched, calculatedMinutes, saveSleep]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeBottomSheet();
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopoverOpen]);

  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (bottomSheetMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [bottomSheetMode]);

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden file input */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
      />

      {/* Summary chips - shows what's been added - ABOVE */}
      {hasAdditions && (
        <div className="flex items-center gap-2 flex-wrap">
          {displayUrl && (
            <motion.button
              type="button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleRemovePhoto}
              className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
            >
              <img
                src={displayUrl}
                alt=""
                className="h-5 w-5 rounded-full object-cover"
              />
              <span>{t('form.photo')}</span>
              <X className="h-3 w-3 opacity-60" />
            </motion.button>
          )}

          {sleepValue > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-sm"
            >
              <button
                type="button"
                onClick={() => {
                  if (isDesktop) {
                    setInlinePanelMode('sleep');
                  } else {
                    setBottomSheetMode('sleep');
                  }
                }}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <BLOCK_ICONS.sleep className="h-3.5 w-3.5" />
                <span>{formatSleepDuration(sleepValue)}</span>
              </button>
              <button
                type="button"
                onClick={clearSleep}
                className="p-0.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3 opacity-60" />
              </button>
            </motion.div>
          )}

          {selectedItems.length > 0 && (
            <motion.button
              type="button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => {
                if (isDesktop) {
                  setInlinePanelMode('details');
                } else {
                  setBottomSheetMode('details');
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{selectedItems.length} {t('form.details').toLowerCase()}</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Inline panels for desktop - ABOVE add button */}
      <AnimatePresence>
        {inlinePanelMode && isDesktop && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border bg-popover mb-3 overflow-hidden min-w-[320px]">
              {/* Panel header with close button */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <span className="text-sm font-medium text-foreground">
                  {inlinePanelMode === 'sleep' ? t('form.sleepHours') : t('form.addDetails')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (inlinePanelMode === 'sleep' && sleepPickerTouched) {
                      saveSleep(calculatedMinutes);
                    }
                    setInlinePanelMode(null);
                    setSleepPickerFocus(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Inline sleep picker */}
              {inlinePanelMode === 'sleep' && (
                <div className="space-y-4 p-4">
                  {/* Drum picker container - only visible when a button is active */}
                  <AnimatePresence>
                    {sleepPickerFocus && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="relative rounded-2xl border border-border/50 p-4 mb-4">
                          {/* Wheel picker columns - scrollable */}
                          <div className="flex justify-center gap-2">
                            {/* Hour column */}
                            <div className="flex flex-col items-center h-[200px] overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                              {hourOptions.map((h) => {
                                const currentHour =
                                  sleepPickerFocus === 'bedtime'
                                    ? bedHour
                                    : wakeHour;
                                const isSelectedHour = h === currentHour;
                                return (
                                  <button
                                    key={h}
                                    type="button"
                                    onClick={() => {
                                      if (sleepPickerFocus === 'bedtime')
                                        setBedHour(h);
                                      else setWakeHour(h);
                                      setSleepPickerTouched(true);
                                    }}
                                    className={cn(
                                      'w-16 py-2 text-2xl font-medium transition-all snap-center shrink-0',
                                      isSelectedHour
                                        ? 'text-primary bg-primary/10 rounded-lg'
                                        : 'text-muted-foreground/40'
                                    )}
                                  >
                                    {h}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Minute column */}
                            <div className="flex flex-col items-center h-[200px] overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                              {minuteOptions.map((m) => {
                                const currentMinute =
                                  sleepPickerFocus === 'bedtime'
                                    ? bedMinute
                                    : wakeMinute;
                                const isSelectedMinute = m === currentMinute;
                                return (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => {
                                      if (sleepPickerFocus === 'bedtime')
                                        setBedMinute(m);
                                      else setWakeMinute(m);
                                      setSleepPickerTouched(true);
                                    }}
                                    className={cn(
                                      'w-16 py-2 text-2xl font-medium transition-all snap-center shrink-0',
                                      isSelectedMinute
                                        ? 'text-primary bg-primary/10 rounded-lg'
                                        : 'text-muted-foreground/40'
                                    )}
                                  >
                                    {m.toString().padStart(2, '0')}
                                  </button>
                                );
                              })}
                            </div>

                            {/* AM/PM column */}
                            <div className="flex flex-col items-center justify-center">
                              {periodOptions.map((p) => {
                                const currentPeriod =
                                  sleepPickerFocus === 'bedtime'
                                    ? bedPeriod
                                    : wakePeriod;
                                const isSelectedPeriod = p === currentPeriod;
                                return (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => {
                                      if (sleepPickerFocus === 'bedtime')
                                        setBedPeriod(p);
                                      else setWakePeriod(p);
                                      setSleepPickerTouched(true);
                                    }}
                                    className={cn(
                                      'w-16 py-2 text-xl font-medium transition-all',
                                      isSelectedPeriod
                                        ? 'text-primary bg-primary/10 rounded-lg'
                                        : 'text-muted-foreground/40'
                                    )}
                                  >
                                    {p}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bedtime / Wake toggle buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSleepPickerFocus(
                          sleepPickerFocus === 'bedtime' ? null : 'bedtime'
                        )
                      }
                      className={cn(
                        'flex-1 py-3 px-4 rounded-xl text-center transition-colors',
                        sleepPickerFocus === 'bedtime'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted/30 text-muted-foreground'
                      )}
                    >
                      <span className="text-xs block mb-0.5">{t('form.bedtime')}</span>
                      <span className="text-lg font-semibold">
                        {bedHour.toString().padStart(2, '0')}:
                        {bedMinute.toString().padStart(2, '0')} {bedPeriod}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSleepPickerFocus(
                          sleepPickerFocus === 'wake' ? null : 'wake'
                        )
                      }
                      className={cn(
                        'flex-1 py-3 px-4 rounded-xl text-center transition-colors',
                        sleepPickerFocus === 'wake'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted/30 text-muted-foreground'
                      )}
                    >
                      <span className="text-xs block mb-0.5">{t('form.wakeUp')}</span>
                      <span className="text-lg font-semibold">
                        {wakeHour.toString().padStart(2, '0')}:
                        {wakeMinute.toString().padStart(2, '0')} {wakePeriod}
                      </span>
                    </button>
                  </div>

                  {/* Sleep duration display + actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {formatSleepDuration(calculatedMinutes)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t('form.sleep')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sleepValue > 0 && (
                        <button
                          type="button"
                          onClick={clearSleep}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                        >
                          {t('form.clear')}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          saveSleep(calculatedMinutes);
                          setInlinePanelMode(null);
                          setSleepPickerTouched(false);
                          setSleepPickerFocus(null);
                        }}
                        className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Inline details picker */}
              {inlinePanelMode === 'details' && (
                <div className="flex flex-col max-h-[400px]">
                  {/* Scrollable content with subtle scrollbar */}
                  <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
                    <div className="divide-y divide-border/30">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isExpanded = expandedCategories.has(cat.id);
                        const categorySelections = getSelectedValues(cat.id);
                        const hasSelections = categorySelections.length > 0;

                        return (
                          <div key={cat.id}>
                            {/* Category header */}
                            <button
                              type="button"
                              onClick={() => toggleCategory(cat.id)}
                              className="w-full flex items-center justify-between px-4 py-3 text-foreground hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Icon
                                  className={cn(
                                    'h-5 w-5',
                                    hasSelections
                                      ? 'text-primary'
                                      : 'text-muted-foreground'
                                  )}
                                />
                                <span
                                  className={cn(
                                    'text-base',
                                    hasSelections && 'text-primary font-medium'
                                  )}
                                >
                                  {cat.label}
                                </span>
                              </div>
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                            </button>

                            {/* Category options */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden bg-muted/10"
                                >
                                  <div className="px-4 py-3 flex flex-wrap gap-2">
                                    {getCategoryOptions(cat.id).map((opt) => {
                                      const selected = isSelected(
                                        cat.id,
                                        opt.value
                                      );
                                      const OptIcon = opt.icon;

                                      return (
                                        <button
                                          key={opt.id}
                                          type="button"
                                          onClick={() =>
                                            toggleOption(cat.id, opt.value)
                                          }
                                          className={cn(
                                            'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-colors',
                                            selected
                                              ? 'bg-primary text-primary-foreground'
                                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                          )}
                                        >
                                          <OptIcon className="h-4 w-4" />
                                          <span>{getOptionLabel(cat.id, opt.value)}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fixed Done button at bottom */}
                  <div className="shrink-0 px-4 py-3 border-t border-border/50 bg-popover">
                    <button
                      type="button"
                      onClick={() => setInlinePanelMode(null)}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      {t('form.done')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add details button with popover and save button - BELOW */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative">
          <motion.button
            ref={buttonRef}
            type="button"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={cn(
              'flex items-center justify-center gap-2 h-10 rounded-full transition-colors bg-primary/10 text-primary hover:bg-primary/20',
              isPopoverOpen ? 'w-10' : 'px-5'
            )}
            whileTap={{ scale: 0.95 }}
            disabled={isProcessingPhoto}
          >
            {isPopoverOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">{t('form.addDetails')}</span>
              </>
            )}
          </motion.button>

          {/* Popover menu */}
          <AnimatePresence>
            {isPopoverOpen && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-[200px]"
              >
                <div className="py-1">
                  {/* Photo option */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      photoInputRef.current?.click();
                    }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      {t('form.photo')}
                    </div>
                    {displayUrl && <Check className="h-4 w-4 text-primary" />}
                  </button>

                  {/* Sleep option */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      setSleepPickerTouched(false);
                      if (isDesktop) {
                        setInlinePanelMode(
                          inlinePanelMode === 'sleep' ? null : 'sleep'
                        );
                      } else {
                        setBottomSheetMode('sleep');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BLOCK_ICONS.sleep className="h-4 w-4 text-muted-foreground" />
                      {t('form.sleepHours')}
                    </div>
                    {sleepValue > 0 && (
                      <span className="text-xs text-primary font-medium">
                        {formatSleepDuration(sleepValue)}
                      </span>
                    )}
                  </button>

                  {/* Details option */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      if (isDesktop) {
                        setInlinePanelMode(
                          inlinePanelMode === 'details' ? null : 'details'
                        );
                      } else {
                        setBottomSheetMode('details');
                      }
                    }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                      {t('form.details')}
                    </div>
                    {selectedItems.length > 0 && (
                      <span className="text-xs text-primary font-medium">
                        {selectedItems.length}
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Save button */}
        {saveButton}
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {bottomSheetMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Sleep picker mode */}
              {bottomSheetMode === 'sleep' && (
                <div className="px-4 pb-8">
                  <div className="space-y-4">
                    {/* Drum picker container - only visible when a button is active */}
                    <AnimatePresence>
                      {sleepPickerFocus && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="relative rounded-2xl border border-border/50 p-4">
                            {/* Wheel picker columns - scrollable */}
                            <div className="flex justify-center gap-2">
                              {/* Hour column */}
                              <div className="flex flex-col items-center h-[200px] overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {hourOptions.map((h) => {
                                  const currentHour =
                                    sleepPickerFocus === 'bedtime'
                                      ? bedHour
                                      : wakeHour;
                                  const isSelected = h === currentHour;
                                  return (
                                    <button
                                      key={h}
                                      type="button"
                                      onClick={() => {
                                        if (sleepPickerFocus === 'bedtime')
                                          setBedHour(h);
                                        else setWakeHour(h);
                                        setSleepPickerTouched(true);
                                      }}
                                      className={cn(
                                        'w-16 py-2 text-2xl font-medium transition-all snap-center shrink-0',
                                        isSelected
                                          ? 'text-primary bg-primary/10 rounded-lg'
                                          : 'text-muted-foreground/40'
                                      )}
                                    >
                                      {h}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Minute column */}
                              <div className="flex flex-col items-center h-[200px] overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {minuteOptions.map((m) => {
                                  const currentMinute =
                                    sleepPickerFocus === 'bedtime'
                                      ? bedMinute
                                      : wakeMinute;
                                  const isSelected = m === currentMinute;
                                  return (
                                    <button
                                      key={m}
                                      type="button"
                                      onClick={() => {
                                        if (sleepPickerFocus === 'bedtime')
                                          setBedMinute(m);
                                        else setWakeMinute(m);
                                        setSleepPickerTouched(true);
                                      }}
                                      className={cn(
                                        'w-16 py-2 text-2xl font-medium transition-all snap-center shrink-0',
                                        isSelected
                                          ? 'text-primary bg-primary/10 rounded-lg'
                                          : 'text-muted-foreground/40'
                                      )}
                                    >
                                      {m.toString().padStart(2, '0')}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* AM/PM column */}
                              <div className="flex flex-col items-center justify-center">
                                {periodOptions.map((p) => {
                                  const currentPeriod =
                                    sleepPickerFocus === 'bedtime'
                                      ? bedPeriod
                                      : wakePeriod;
                                  const isSelected = p === currentPeriod;
                                  return (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => {
                                        if (sleepPickerFocus === 'bedtime')
                                          setBedPeriod(p);
                                        else setWakePeriod(p);
                                        setSleepPickerTouched(true);
                                      }}
                                      className={cn(
                                        'w-16 py-2 text-xl font-medium transition-all',
                                        isSelected
                                          ? 'text-primary bg-primary/10 rounded-lg'
                                          : 'text-muted-foreground/40'
                                      )}
                                    >
                                      {p}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bedtime / Wake toggle buttons - BELOW */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setSleepPickerFocus(
                            sleepPickerFocus === 'bedtime' ? null : 'bedtime'
                          )
                        }
                        className={cn(
                          'flex-1 py-3 px-4 rounded-xl text-center transition-colors',
                          sleepPickerFocus === 'bedtime'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted/30 text-muted-foreground'
                        )}
                      >
                        <span className="text-xs block mb-0.5">{t('form.bedtime')}</span>
                        <span className="text-lg font-semibold">
                          {bedHour.toString().padStart(2, '0')}:
                          {bedMinute.toString().padStart(2, '0')} {bedPeriod}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSleepPickerFocus(
                            sleepPickerFocus === 'wake' ? null : 'wake'
                          )
                        }
                        className={cn(
                          'flex-1 py-3 px-4 rounded-xl text-center transition-colors',
                          sleepPickerFocus === 'wake'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted/30 text-muted-foreground'
                        )}
                      >
                        <span className="text-xs block mb-0.5">{t('form.wakeUp')}</span>
                        <span className="text-lg font-semibold">
                          {wakeHour.toString().padStart(2, '0')}:
                          {wakeMinute.toString().padStart(2, '0')} {wakePeriod}
                        </span>
                      </button>
                    </div>

                    {/* Sleep duration display + actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          {formatSleepDuration(calculatedMinutes)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {t('form.sleep')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {sleepValue > 0 && (
                          <button
                            type="button"
                            onClick={clearSleep}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                          >
                            {t('form.clear')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            saveSleep(calculatedMinutes);
                            setBottomSheetMode(null);
                            setSleepPickerTouched(false);
                            setSleepPickerFocus(null);
                          }}
                          className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Details picker mode - Accordion style */}
              {bottomSheetMode === 'details' && (
                <div className="flex flex-col max-h-[70vh]">
                  {/* Scrollable content */}
                  <div className="overflow-y-auto flex-1 pb-4">
                    <div className="divide-y divide-border/50">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isExpanded = expandedCategories.has(cat.id);
                        const categorySelections = getSelectedValues(cat.id);
                        const hasSelections = categorySelections.length > 0;

                        return (
                          <div key={cat.id}>
                            {/* Category header */}
                            <button
                              type="button"
                              onClick={() => toggleCategory(cat.id)}
                              className="w-full flex items-center justify-between px-6 py-4 text-foreground hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Icon
                                  className={cn(
                                    'h-5 w-5',
                                    hasSelections
                                      ? 'text-primary'
                                      : 'text-muted-foreground'
                                  )}
                                />
                                <span
                                  className={cn(
                                    'text-base',
                                    hasSelections && 'text-primary font-medium'
                                  )}
                                >
                                  {cat.label}
                                </span>
                              </div>
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                            </button>

                            {/* Category options */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden bg-muted/20"
                                >
                                  <div className="px-6 py-3 flex flex-wrap gap-2">
                                    {getCategoryOptions(cat.id).map((opt) => {
                                      const selected = isSelected(
                                        cat.id,
                                        opt.value
                                      );
                                      const OptIcon = opt.icon;

                                      return (
                                        <button
                                          key={opt.id}
                                          type="button"
                                          onClick={() =>
                                            toggleOption(cat.id, opt.value)
                                          }
                                          className={cn(
                                            'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-colors',
                                            selected
                                              ? 'bg-primary text-primary-foreground'
                                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                          )}
                                        >
                                          <OptIcon className="h-4 w-4" />
                                          <span>{getOptionLabel(cat.id, opt.value)}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fixed Done button at bottom */}
                  <div className="shrink-0 px-6 py-4 border-t border-border/50 bg-background">
                    <button
                      type="button"
                      onClick={() => setBottomSheetMode(null)}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      {t('form.done')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
