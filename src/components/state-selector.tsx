'use client';

import { motion } from 'framer-motion';
import { State } from '@/lib/types';
import { useOptionsStore } from '@/lib/options-store';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import {
  Sun,
  CloudSun,
  Moon,
  CloudRain,
  Smile,
  Meh,
  AlertCircle,
  ThumbsDown,
  Sparkles,
  HelpCircle,
  Target,
  Shuffle,
  Eye,
  EyeOff,
  Minus,
  type LucideIcon,
} from 'lucide-react';

// Icons for each state
const STATE_ICONS: Record<string, LucideIcon> = {
  neutral: Minus,
  energized: Sun,
  calm: CloudSun,
  tired: Moon,
  drained: CloudRain,
  content: Smile,
  anxious: AlertCircle,
  frustrated: ThumbsDown,
  grateful: Sparkles,
  uncertain: HelpCircle,
  focused: Target,
  scattered: Shuffle,
  present: Eye,
  distracted: EyeOff,
};

// State-specific colors using red→green gradient like app logo
// Bad states: red/orange, Neutral: yellow/amber, Good states: lime/green/emerald
const STATE_COLORS: Record<string, { base: string; selected: string; icon: string }> = {
  // Neutral - gray (center point)
  neutral: {
    base: 'bg-slate-400/10 border-slate-400/30 hover:bg-slate-400/20',
    selected: 'bg-slate-400 border-slate-400',
    icon: 'text-slate-500',
  },
  // Energy states: drained(red) → tired(orange) → calm(lime) → energized(green)
  drained: {
    base: 'bg-red-400/10 border-red-400/30 hover:bg-red-400/20',
    selected: 'bg-red-400 border-red-400',
    icon: 'text-red-500',
  },
  tired: {
    base: 'bg-orange-400/10 border-orange-400/30 hover:bg-orange-400/20',
    selected: 'bg-orange-400 border-orange-400',
    icon: 'text-orange-500',
  },
  calm: {
    base: 'bg-lime-500/10 border-lime-500/30 hover:bg-lime-500/20',
    selected: 'bg-lime-500 border-lime-500',
    icon: 'text-lime-600',
  },
  energized: {
    base: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20',
    selected: 'bg-green-500 border-green-500',
    icon: 'text-green-600',
  },
  // Emotion states: frustrated(red) → anxious(orange) → uncertain(amber) → content(lime) → grateful(green)
  frustrated: {
    base: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20',
    selected: 'bg-red-500 border-red-500',
    icon: 'text-red-600',
  },
  anxious: {
    base: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20',
    selected: 'bg-orange-500 border-orange-500',
    icon: 'text-orange-600',
  },
  uncertain: {
    base: 'bg-amber-400/10 border-amber-400/30 hover:bg-amber-400/20',
    selected: 'bg-amber-400 border-amber-400',
    icon: 'text-amber-500',
  },
  content: {
    base: 'bg-lime-400/10 border-lime-400/30 hover:bg-lime-400/20',
    selected: 'bg-lime-400 border-lime-400',
    icon: 'text-lime-500',
  },
  grateful: {
    base: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
    selected: 'bg-emerald-500 border-emerald-500',
    icon: 'text-emerald-600',
  },
  // Tension states: scattered(red) → distracted(orange) → focused(lime) → present(green)
  scattered: {
    base: 'bg-red-400/10 border-red-400/30 hover:bg-red-400/20',
    selected: 'bg-red-400 border-red-400',
    icon: 'text-red-500',
  },
  distracted: {
    base: 'bg-orange-400/10 border-orange-400/30 hover:bg-orange-400/20',
    selected: 'bg-orange-400 border-orange-400',
    icon: 'text-orange-500',
  },
  focused: {
    base: 'bg-lime-500/10 border-lime-500/30 hover:bg-lime-500/20',
    selected: 'bg-lime-500 border-lime-500',
    icon: 'text-lime-600',
  },
  present: {
    base: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20',
    selected: 'bg-green-500 border-green-500',
    icon: 'text-green-600',
  },
};

const DEFAULT_STATE_COLORS = {
  base: 'bg-slate-400/10 border-slate-400/30 hover:bg-slate-400/20',
  selected: 'bg-slate-400 border-slate-400',
  icon: 'text-slate-500',
};

// States ordered within each category from challenging to positive
// This makes it easier to find what you're feeling
const CATEGORY_STATE_ORDER: Record<string, string[]> = {
  // Energy: drained → tired → calm → energized (low to high, negative to positive)
  energy: ['drained', 'tired', 'calm', 'energized'],
  // Emotion: frustrated → anxious → uncertain → content → grateful (negative to positive)
  emotion: ['frustrated', 'anxious', 'uncertain', 'content', 'grateful'],
  // Tension: scattered → distracted → focused → present (chaotic to centered)
  tension: ['scattered', 'distracted', 'focused', 'present'],
  // Neutral stands alone
  neutral: ['neutral'],
};

// Category display order - neutral first, then the rest
const CATEGORY_ORDER: string[] = ['neutral', 'energy', 'emotion', 'tension'];

// Translation keys for categories (uses state.* keys that already exist)
const CATEGORY_TRANSLATION_KEYS: Record<string, string> = {
  neutral: 'state.neutral',
  energy: 'state.energy',
  emotion: 'state.emotion',
  tension: 'state.tension',
};

interface StateSelectorProps {
  value?: string;
  onChange: (stateId: string) => void;
}

export function StateSelector({ value, onChange }: StateSelectorProps) {
  const { t } = useI18n();
  const { states } = useOptionsStore();

  // Get states organized by category, sorted within each category
  const getOrderedStatesForCategory = (category: string): State[] => {
    const order = CATEGORY_STATE_ORDER[category] || [];
    return order
      .map(id => states.find(s => s.id === id))
      .filter((s): s is State => s !== undefined);
  };

  const renderStateButton = (state: State) => {
    const isSelected = value === state.id;
    const colors = STATE_COLORS[state.id] || DEFAULT_STATE_COLORS;
    const Icon = STATE_ICONS[state.id] || Meh;

    return (
      <motion.button
        key={state.id}
        type="button"
        onClick={() => onChange(state.id)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors cursor-pointer',
          isSelected ? `${colors.selected} text-white` : colors.base
        )}
        whileTap={{ scale: 0.96 }}
        initial={false}
        animate={{
          scale: isSelected ? 1.02 : 1,
        }}
        transition={{ duration: 0.1 }}
      >
        <Icon
          className={cn('h-4 w-4 shrink-0', isSelected ? 'text-white' : colors.icon)}
        />
        <span
          className={cn(
            'text-sm font-medium',
            isSelected ? 'text-white' : 'text-foreground'
          )}
        >
          {t(`state.${state.id}` as any) || state.label}
        </span>
      </motion.button>
    );
  };

  // Render neutral state bigger without category label
  const renderNeutralState = () => {
    const neutralState = states.find(s => s.id === 'neutral');
    if (!neutralState) return null;

    const isSelected = value === 'neutral';
    const colors = STATE_COLORS['neutral'] || DEFAULT_STATE_COLORS;
    const Icon = STATE_ICONS['neutral'] || Meh;

    return (
      <motion.button
        type="button"
        onClick={() => onChange('neutral')}
        className={cn(
          'flex items-center justify-center gap-2 px-5 py-3 rounded-xl border transition-colors cursor-pointer w-full',
          isSelected ? `${colors.selected} text-white` : colors.base
        )}
        whileTap={{ scale: 0.98 }}
        initial={false}
        animate={{ scale: isSelected ? 1.02 : 1 }}
        transition={{ duration: 0.1 }}
      >
        <Icon className={cn('h-5 w-5 shrink-0', isSelected ? 'text-white' : colors.icon)} />
        <span className={cn('text-base font-medium', isSelected ? 'text-white' : 'text-foreground')}>
          {t('state.neutral' as any) || neutralState.label}
        </span>
      </motion.button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Neutral state - bigger, no category label */}
      {renderNeutralState()}

      {/* Other categories with labels */}
      {CATEGORY_ORDER.filter(cat => cat !== 'neutral').map((category) => {
        const categoryStates = getOrderedStatesForCategory(category);
        if (categoryStates.length === 0) return null;

        // Translate category label using existing state.* keys
        const translationKey = CATEGORY_TRANSLATION_KEYS[category];
        const categoryLabel = translationKey ? t(translationKey as any) : category;

        return (
          <div key={category} className="space-y-2">
            {/* Category label - subtle, not colored */}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              {categoryLabel}
            </p>
            {/* States in this category */}
            <div className="flex flex-wrap gap-2">
              {categoryStates.map((state) => renderStateButton(state))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Compact badge version for displaying selected state
interface StateBadgeProps {
  stateId: string;
  size?: 'sm' | 'md';
}

export function StateBadge({ stateId, size = 'md' }: StateBadgeProps) {
  const { t } = useI18n();
  const { states } = useOptionsStore();
  const state = states.find((s) => s.id === stateId);
  if (!state) return null;

  const colors = STATE_COLORS[stateId] || DEFAULT_STATE_COLORS;
  const Icon = STATE_ICONS[stateId] || Meh;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border',
        colors.base,
        sizeClasses[size]
      )}
    >
      <Icon className={cn(iconSizes[size], colors.icon)} />
      <span className="font-medium">{t(`state.${stateId}` as any) || state.label}</span>
    </span>
  );
}
