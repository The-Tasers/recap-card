'use client';

import { motion } from 'framer-motion';
import { Mood, MOODS } from '@/lib/types';
import { MOOD_ICONS } from '@/lib/icons';
import { cn } from '@/lib/utils';

// Simple solid mood colors (non-gradient) - using hex values
const MOOD_COLORS = {
  great: 'bg-[#22c55e]',
  good: 'bg-[#84cc16]',
  okay: 'bg-[#eab308]',
  low: 'bg-[#f97316]',
  rough: 'bg-[#ef4444]',
};

// Mood colors - simple solid colors with new palette
const MOOD_STYLES = {
  great: {
    base: 'bg-[#22c55e]/10 border-[#22c55e]/30',
    hover: 'hover:bg-[#22c55e]/20',
    selected: 'bg-[#22c55e] border-[#22c55e] border-3',
    iconColor: 'text-[#22c55e]',
  },
  good: {
    base: 'bg-[#84cc16]/10 border-[#84cc16]/30',
    hover: 'hover:bg-[#84cc16]/20',
    selected: 'bg-[#84cc16] border-[#84cc16] border-3',
    iconColor: 'text-[#84cc16]',
  },
  okay: {
    base: 'bg-[#eab308]/10 border-[#eab308]/30',
    hover: 'hover:bg-[#eab308]/20',
    selected: 'bg-[#eab308] border-[#eab308] border-3',
    iconColor: 'text-[#eab308]',
  },
  low: {
    base: 'bg-[#f97316]/10 border-[#f97316]/30',
    hover: 'hover:bg-[#f97316]/20',
    selected: 'bg-[#f97316] border-[#f97316] border-3',
    iconColor: 'text-[#f97316]',
  },
  rough: {
    base: 'bg-[#ef4444]/10 border-[#ef4444]/30',
    hover: 'hover:bg-[#ef4444]/20',
    selected: 'bg-[#ef4444] border-[#ef4444] border-3',
    iconColor: 'text-[#ef4444]',
  },
};

interface MoodSelectorProps {
  value?: Mood;
  onChange: (mood: Mood) => void;
  size?: 'sm' | 'md' | 'lg';
  highlightedIndex?: number;
  fullWidth?: boolean;
}

export function MoodSelector({
  value,
  onChange,
  size = 'sm',
  highlightedIndex,
  fullWidth = false,
}: MoodSelectorProps) {
  const sizeClasses = {
    sm: 'p-2.5',
    md: 'p-3',
    lg: 'p-2 md:p-3',
  };

  const iconSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-7 w-7 md:h-9 md:w-9',
  };

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  // Individual button animation variants - simple fade with scale
  const getButtonVariants = (isSelected: boolean) => ({
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    show: {
      opacity: 1,
      scale: isSelected ? 1.1 : 1,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25,
      },
    },
  });

  return (
    <div className="space-y-4">
      <motion.div
        className={cn(
          'flex py-1',
          fullWidth ? 'w-full' : 'justify-center gap-2'
        )}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {MOODS.map((mood, index) => {
          const isSelected = value === mood.value;
          const isHighlighted = highlightedIndex === index;
          const styles = MOOD_STYLES[mood.value];

          return (
            <div
              key={mood.value}
              className={cn('flex justify-center', fullWidth && 'flex-1')}
            >
              <motion.button
                type="button"
                onClick={() => onChange(mood.value)}
                className={cn(
                  'rounded-2xl border-2 relative overflow-hidden cursor-pointer',
                  sizeClasses[size],
                  isSelected
                    ? `${styles.selected}`
                    : `${styles.base} ${styles.hover}`,
                  // Keyboard highlight - subtle ring
                  isHighlighted &&
                    !isSelected &&
                    'ring-2 ring-primary/50 ring-offset-2 ring-offset-background'
                )}
                title={mood.label}
                variants={getButtonVariants(isSelected)}
                whileTap={{
                  scale: 0.95,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 15,
                }}
              >
                {/* Ripple effect on selection */}
                {isSelected && (
                  <motion.div
                    className="absolute z-1 inset-0 bg-white/30 rounded-2xl"
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                )}
                <span
                  aria-label={mood.label}
                  className={cn(
                    'relative z-10 block',
                    isSelected ? 'text-white' : styles.iconColor
                  )}
                >
                  {(() => {
                    const Icon = MOOD_ICONS[mood.value];
                    return <Icon className={iconSizeClasses[size]} />;
                  })()}
                </span>
              </motion.button>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

interface MoodBadgeProps {
  mood: Mood;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function MoodBadge({
  mood,
  showLabel = false,
  size = 'md',
}: MoodBadgeProps) {
  const moodInfo = MOODS.find((m) => m.value === mood) || MOODS[2];
  const Icon = MOOD_ICONS[mood];

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
  };

  return (
    <span className="inline-flex items-center gap-1">
      <Icon className={iconSizes[size]} aria-label={moodInfo.label} />
      {showLabel && (
        <span className="text-sm text-muted-foreground">{moodInfo.label}</span>
      )}
    </span>
  );
}

// Export mood colors for use in other components
export { MOOD_COLORS };
