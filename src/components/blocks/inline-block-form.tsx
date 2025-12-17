'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Moon } from 'lucide-react';
import {
  CardBlock,
  BLOCK_DEFINITIONS,
  WEATHER_OPTIONS,
  MEAL_OPTIONS,
  SELFCARE_OPTIONS,
  HEALTH_OPTIONS,
  BlockId,
  Mood,
} from '@/lib/types';
import { BLOCK_ICONS, WEATHER_ICONS, MEAL_ICONS, SELFCARE_ICONS, HEALTH_ICONS } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// Animated option button component
function OptionButton({
  isSelected,
  onClick,
  icon: Icon,
  label,
}: {
  isSelected: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  mood?: Mood;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl border-2 shrink-0 w-20 cursor-pointer',
        isSelected
          ? 'border-primary bg-primary/15'
          : 'border-border bg-muted/50'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.div
        animate={isSelected ? { scale: 1.15 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <Icon
          className={cn(
            'h-5 w-5 transition-colors',
            isSelected ? 'text-primary' : 'text-muted-foreground'
          )}
        />
      </motion.div>
      <span
        className={cn(
          'text-[10px] font-medium whitespace-nowrap transition-colors',
          isSelected ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </motion.button>
  );
}

// Selected items summary for collapsed state
interface SelectedItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

function SelectedItemsSummary({
  items,
  maxVisible = 3,
}: {
  items: SelectedItem[];
  mood?: Mood;
  maxVisible?: number;
}) {
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {visibleItems.map((item) => (
        <Tooltip key={item.value}>
          <TooltipTrigger asChild>
            <span className="p-1 rounded-lg bg-primary/15">
              <item.icon className="h-4 w-4 text-primary" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {item.label}
          </TooltipContent>
        </Tooltip>
      ))}
      {remainingCount > 0 && (
        <span className="text-xs font-medium px-1.5 py-0.5 rounded-lg bg-primary/15 text-primary">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

interface InlineBlockFormProps {
  blocks: Record<BlockId, CardBlock>;
  onChange: (blocks: Record<BlockId, CardBlock>) => void;
  mood?: Mood;
  collapsible?: boolean;
}

export function InlineBlockForm({ blocks, onChange, mood, collapsible = true }: InlineBlockFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateBlock = (blockId: BlockId, value: string | number | string[]) => {
    onChange({
      ...blocks,
      [blockId]: {
        ...blocks[blockId],
        value,
      },
    });
  };

  // Get all selected items for summary
  const getSelectedItems = (): SelectedItem[] => {
    const items: SelectedItem[] = [];

    // Weather
    const weatherValues = (blocks.weather?.value as string[]) || [];
    weatherValues.forEach((v) => {
      const option = WEATHER_OPTIONS.find((o) => o.value === v);
      if (option) {
        items.push({ icon: WEATHER_ICONS[v], label: option.label, value: `weather-${v}` });
      }
    });

    // Meals
    const mealValues = (blocks.meals?.value as string[]) || [];
    mealValues.forEach((v) => {
      const option = MEAL_OPTIONS.find((o) => o.value === v);
      if (option) {
        items.push({ icon: MEAL_ICONS[v], label: option.label, value: `meals-${v}` });
      }
    });

    // Self-care
    const selfcareValues = (blocks.selfcare?.value as string[]) || [];
    selfcareValues.forEach((v) => {
      const option = SELFCARE_OPTIONS.find((o) => o.value === v);
      if (option) {
        items.push({ icon: SELFCARE_ICONS[v], label: option.label, value: `selfcare-${v}` });
      }
    });

    // Health
    const healthValues = (blocks.health?.value as string[]) || [];
    healthValues.forEach((v) => {
      const option = HEALTH_OPTIONS.find((o) => o.value === v);
      if (option) {
        items.push({ icon: HEALTH_ICONS[v], label: option.label, value: `health-${v}` });
      }
    });

    return items;
  };

  // Check if sleep has a value
  const sleepValue = blocks.sleep?.value as number;
  const hasSleep = sleepValue > 0;
  const selectedItems = getSelectedItems();
  const hasSelections = selectedItems.length > 0 || hasSleep;

  const renderWeatherBlock = () => {
    const block = blocks.weather;
    const selectedValues = (block.value as string[]) || [];

    const toggleOption = (optionValue: string) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      updateBlock('weather', newValues);
    };

    const WeatherBlockIcon = BLOCK_ICONS.weather;

    return (
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
          <WeatherBlockIcon className="h-4 w-4" /> {BLOCK_DEFINITIONS.weather.label}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {WEATHER_OPTIONS.map((option) => (
            <OptionButton
              key={option.value}
              isSelected={selectedValues.includes(option.value)}
              onClick={() => toggleOption(option.value)}
              icon={WEATHER_ICONS[option.value]}
              label={option.label}
              mood={mood}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderMealsBlock = () => {
    const block = blocks.meals;
    const selectedValues = (block.value as string[]) || [];

    const toggleOption = (optionValue: string) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      updateBlock('meals', newValues);
    };

    const MealsBlockIcon = BLOCK_ICONS.meals;

    return (
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
          <MealsBlockIcon className="h-4 w-4" /> {BLOCK_DEFINITIONS.meals.label}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {MEAL_OPTIONS.map((option) => (
            <OptionButton
              key={option.value}
              isSelected={selectedValues.includes(option.value)}
              onClick={() => toggleOption(option.value)}
              icon={MEAL_ICONS[option.value]}
              label={option.label}
              mood={mood}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSelfCareBlock = () => {
    const block = blocks.selfcare;
    const selectedValues = (block.value as string[]) || [];

    const toggleOption = (optionValue: string) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      updateBlock('selfcare', newValues);
    };

    const SelfcareBlockIcon = BLOCK_ICONS.selfcare;

    return (
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
          <SelfcareBlockIcon className="h-4 w-4" /> {BLOCK_DEFINITIONS.selfcare.label}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SELFCARE_OPTIONS.map((option) => (
            <OptionButton
              key={option.value}
              isSelected={selectedValues.includes(option.value)}
              onClick={() => toggleOption(option.value)}
              icon={SELFCARE_ICONS[option.value]}
              label={option.label}
              mood={mood}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderHealthBlock = () => {
    const block = blocks.health;
    const selectedValues = (block.value as string[]) || [];

    const toggleOption = (optionValue: string) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      updateBlock('health', newValues);
    };

    const HealthBlockIcon = BLOCK_ICONS.health;

    return (
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
          <HealthBlockIcon className="h-4 w-4" /> {BLOCK_DEFINITIONS.health.label}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {HEALTH_OPTIONS.map((option) => (
            <OptionButton
              key={option.value}
              isSelected={selectedValues.includes(option.value)}
              onClick={() => toggleOption(option.value)}
              icon={HEALTH_ICONS[option.value]}
              label={option.label}
              mood={mood}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSleepBlock = () => {
    const block = blocks.sleep;
    const SleepBlockIcon = BLOCK_ICONS.sleep;

    return (
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
          <SleepBlockIcon className="h-4 w-4" /> {BLOCK_DEFINITIONS.sleep.label}
        </label>
        <Input
          type="number"
          inputMode="numeric"
          value={
            block.value === 0 || block.value === ''
              ? ''
              : (block.value as number)
          }
          onChange={(e) =>
            updateBlock(
              'sleep',
              e.target.value === '' ? 0 : Number(e.target.value)
            )
          }
          placeholder="Hours of sleep"
          className="rounded-xl focus-visible:ring-primary/50"
          min={0}
          max={24}
          step={0.5}
        />
      </div>
    );
  };

  const content = (
    <div className="space-y-6">
      {renderWeatherBlock()}
      {renderMealsBlock()}
      {renderSelfCareBlock()}
      {renderHealthBlock()}
      {renderSleepBlock()}
    </div>
  );

  // Non-collapsible mode
  if (!collapsible) {
    return content;
  }

  // Collapsible mode
  return (
    <div className="space-y-2">
      <motion.button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer',
          'bg-muted hover:bg-muted/80'
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <BLOCK_ICONS.weather className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Add Details
          </span>
          {hasSelections && !isExpanded && (
            <div className="flex items-center gap-2">
              <SelectedItemsSummary items={selectedItems} maxVisible={3} />
              {hasSleep && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-medium bg-primary/15 text-primary">
                      <Moon className="h-3 w-3" />
                      {sleepValue}h
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {sleepValue} hours of sleep
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
