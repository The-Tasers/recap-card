'use client';

import {
  CardBlock,
  BLOCK_DEFINITIONS,
  WEATHER_OPTIONS,
  MEAL_OPTIONS,
  SELFCARE_OPTIONS,
  HEALTH_OPTIONS,
  BlockId,
} from '@/lib/types';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InlineBlockFormProps {
  blocks: Record<BlockId, CardBlock>;
  onChange: (blocks: Record<BlockId, CardBlock>) => void;
}

export function InlineBlockForm({ blocks, onChange }: InlineBlockFormProps) {
  const updateBlock = (blockId: BlockId, value: string | number | string[]) => {
    onChange({
      ...blocks,
      [blockId]: {
        ...blocks[blockId],
        value,
      },
    });
  };

  const renderWeatherBlock = () => {
    const block = blocks.weather;
    const selectedValues = (block.value as string[]) || [];

    const toggleOption = (optionValue: string) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue]; // Allow multiple selections
      updateBlock('weather', newValues);
    };

    return (
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {BLOCK_DEFINITIONS.weather.icon} {BLOCK_DEFINITIONS.weather.label}
        </label>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {WEATHER_OPTIONS.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl border-2 transition-all shrink-0 w-[80px]',
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20'
                    : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-600'
                )}
              >
                <span className="text-xl">{option.icon}</span>
                <span
                  className={cn(
                    'text-[10px] font-medium whitespace-nowrap',
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

    return (
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {BLOCK_DEFINITIONS.meals.icon} {BLOCK_DEFINITIONS.meals.label}
        </label>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {MEAL_OPTIONS.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl border-2 transition-all shrink-0 w-[80px]',
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20'
                    : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-600'
                )}
              >
                <span className="text-xl">{option.icon}</span>
                <span
                  className={cn(
                    'text-[10px] font-medium whitespace-nowrap',
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

    return (
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {BLOCK_DEFINITIONS.selfcare.icon} {BLOCK_DEFINITIONS.selfcare.label}
        </label>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {SELFCARE_OPTIONS.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl border-2 transition-all shrink-0 w-[80px]',
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20'
                    : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-600'
                )}
              >
                <span className="text-xl">{option.icon}</span>
                <span
                  className={cn(
                    'text-[10px] font-medium whitespace-nowrap',
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

    return (
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {BLOCK_DEFINITIONS.health.icon} {BLOCK_DEFINITIONS.health.label}
        </label>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {HEALTH_OPTIONS.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl border-2 transition-all shrink-0 w-[80px]',
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20'
                    : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-600'
                )}
              >
                <span className="text-xl">{option.icon}</span>
                <span
                  className={cn(
                    'text-[10px] font-medium whitespace-nowrap',
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
      </div>
    );
  };

  const renderSleepBlock = () => {
    const block = blocks.sleep;

    return (
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {BLOCK_DEFINITIONS.sleep.icon} {BLOCK_DEFINITIONS.sleep.label}
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
          className="rounded-xl"
          min={0}
          max={24}
          step={0.5}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderWeatherBlock()}
      {renderMealsBlock()}
      {renderSelfCareBlock()}
      {renderHealthBlock()}
      {renderSleepBlock()}
    </div>
  );
}
