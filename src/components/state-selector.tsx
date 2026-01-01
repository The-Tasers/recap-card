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
  Frown,
  Annoyed,
  Laugh,
  Target,
  Shuffle,
  Eye,
  EyeOff,
  Minus,
  type LucideIcon,
} from 'lucide-react';

// Icons for each state
// Emotion category uses face emoticons from bad to good
const STATE_ICONS: Record<string, LucideIcon> = {
  neutral: Minus,
  energized: Sun,
  calm: CloudSun,
  tired: Moon,
  drained: CloudRain,
  // Emotion: faces from bad to good
  frustrated: Frown,      // 😠 worst
  anxious: Annoyed,       // 😟 bad
  uncertain: Meh,         // 😐 neutral
  content: Smile,         // 🙂 good
  grateful: Laugh,        // 😄 best
  focused: Target,
  scattered: Shuffle,
  present: Eye,
  distracted: EyeOff,
};

// State colors - distinct color families for each category
const STATE_COLORS: Record<string, { base: string; selected: string; icon: string }> = {
  // Neutral - gray
  neutral: {
    base: 'bg-slate-400/10 border-slate-400/30 hover:bg-slate-400/20',
    selected: 'bg-slate-400/70 border-slate-400',
    icon: 'text-slate-500',
  },
  // Emotion: red → orange → yellow → lime → green (classic bad→good)
  frustrated: {
    base: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20',
    selected: 'bg-red-500 border-red-500',
    icon: 'text-red-500',
  },
  anxious: {
    base: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20',
    selected: 'bg-orange-500 border-orange-500',
    icon: 'text-orange-500',
  },
  uncertain: {
    base: 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20',
    selected: 'bg-yellow-500 border-yellow-500',
    icon: 'text-yellow-600',
  },
  content: {
    base: 'bg-lime-500/10 border-lime-500/30 hover:bg-lime-500/20',
    selected: 'bg-lime-500 border-lime-500',
    icon: 'text-lime-600',
  },
  grateful: {
    base: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20',
    selected: 'bg-green-500 border-green-500',
    icon: 'text-green-600',
  },
  // Energy: blue/cyan family (cool energy feel)
  drained: {
    base: 'bg-indigo-900/10 border-indigo-900/30 hover:bg-indigo-900/20',
    selected: 'bg-indigo-900 border-indigo-900',
    icon: 'text-indigo-900',
  },
  tired: {
    base: 'bg-blue-400/10 border-blue-400/30 hover:bg-blue-400/20',
    selected: 'bg-blue-400 border-blue-400',
    icon: 'text-blue-500',
  },
  calm: {
    base: 'bg-sky-400/10 border-sky-400/30 hover:bg-sky-400/20',
    selected: 'bg-sky-400 border-sky-400',
    icon: 'text-sky-500',
  },
  energized: {
    base: 'bg-cyan-400/10 border-cyan-400/30 hover:bg-cyan-400/20',
    selected: 'bg-cyan-400 border-cyan-400',
    icon: 'text-cyan-500',
  },
  // Tension/Focus: purple/violet family (mental clarity)
  scattered: {
    base: 'bg-purple-700/10 border-purple-700/30 hover:bg-purple-700/20',
    selected: 'bg-purple-700 border-purple-700',
    icon: 'text-purple-700',
  },
  distracted: {
    base: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20',
    selected: 'bg-purple-500 border-purple-500',
    icon: 'text-purple-500',
  },
  focused: {
    base: 'bg-violet-400/10 border-violet-400/30 hover:bg-violet-400/20',
    selected: 'bg-violet-400 border-violet-400',
    icon: 'text-violet-500',
  },
  present: {
    base: 'bg-fuchsia-400/10 border-fuchsia-400/30 hover:bg-fuchsia-400/20',
    selected: 'bg-fuchsia-400 border-fuchsia-400',
    icon: 'text-fuchsia-500',
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
