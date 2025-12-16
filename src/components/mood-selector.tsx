'use client';

import { motion } from 'framer-motion';
import { Mood, MOODS } from '@/lib/types';
import { MOOD_ICONS } from '@/lib/icons';
import { cn } from '@/lib/utils';

// Simple solid mood colors (non-gradient)
const MOOD_COLORS = {
  great: 'bg-emerald-500',
  good: 'bg-green-500',
  neutral: 'bg-amber-500',
  bad: 'bg-orange-500',
  terrible: 'bg-red-500',
};

// Mood colors - simple solid colors
const MOOD_STYLES = {
  great: {
    base: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700',
    hover: 'hover:bg-emerald-200 dark:hover:bg-emerald-800/50',
    selected:
      'bg-emerald-500 border-emerald-600 border-3 shadow-lg shadow-emerald-500/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  good: {
    base: 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700',
    hover: 'hover:bg-green-200 dark:hover:bg-green-800/50',
    selected:
      'bg-green-500 border-green-600 border-3 shadow-lg shadow-green-500/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  neutral: {
    base: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700',
    hover: 'hover:bg-amber-200 dark:hover:bg-amber-800/50',
    selected:
      'bg-amber-500 border-amber-600 border-3 shadow-lg shadow-amber-500/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  bad: {
    base: 'bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700',
    hover: 'hover:bg-orange-200 dark:hover:bg-orange-800/50',
    selected:
      'bg-orange-500 border-orange-600 border-3 shadow-lg shadow-orange-500/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  terrible: {
    base: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700',
    hover: 'hover:bg-red-200 dark:hover:bg-red-800/50',
    selected: 'bg-red-500 border-red-600 border-3 shadow-lg shadow-red-500/30',
    iconColor: 'text-red-600 dark:text-red-400',
  },
};

interface MoodSelectorProps {
  value?: Mood;
  onChange: (mood: Mood) => void;
  size?: 'sm' | 'md' | 'lg';
  showPreview?: boolean;
}

export function MoodSelector({
  value,
  onChange,
  size = 'sm',
  showPreview = false,
}: MoodSelectorProps) {
  const sizeClasses = {
    sm: 'py-2 px-3',
    md: 'p-3',
    lg: 'p-2 md:p-4',
  };

  const iconSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-6 w-6 md:h-10 md:w-10',
  };

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  // Individual button animation variants
  const buttonVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.8,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <div className="space-y-4">
      <motion.div
        className="flex flex-wrap justify-center gap-3 py-1 px-1"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {MOODS.map((mood) => {
          const isSelected = value === mood.value;
          const styles = MOOD_STYLES[mood.value];

          return (
            <motion.button
              key={mood.value}
              type="button"
              onClick={() => onChange(mood.value)}
              className={cn(
                'rounded-2xl border-2 relative overflow-hidden cursor-pointer',
                sizeClasses[size],
                isSelected
                  ? `${styles.selected}`
                  : `${styles.base} ${styles.hover}`
              )}
              title={mood.label}
              variants={buttonVariants}
              animate={{
                scale: isSelected ? 1.15 : 1,
                y: isSelected ? -6 : 0,
              }}
              whileHover={{
                scale: isSelected ? 1.2 : 1.12,
                y: -8,
                transition: {
                  type: 'spring',
                  stiffness: 400,
                  damping: 15,
                },
              }}
              whileTap={{
                scale: 0.9,
                rotate: [-2, 2, -2, 0],
                transition: { duration: 0.2 },
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
            >
              {/* Ripple effect on selection */}
              {isSelected && (
                <motion.div
                  className="absolute z-1 inset-0 bg-white/30 rounded-2xl"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}
              <motion.span
                aria-label={mood.label}
                className={cn(
                  'relative z-10 block',
                  isSelected ? 'text-white' : styles.iconColor
                )}
                animate={{
                  rotate: isSelected ? [0, -15, 15, -10, 10, -5, 5, 0] : 0,
                  scale: isSelected ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: isSelected ? 0.6 : 0.3,
                  ease: 'easeInOut',
                }}
              >
                {(() => {
                  const Icon = MOOD_ICONS[mood.value];
                  return <Icon className={iconSizeClasses[size]} />;
                })()}
              </motion.span>
            </motion.button>
          );
        })}
      </motion.div>
      {showPreview && value && (
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className={cn('w-full h-20 rounded-2xl', MOOD_COLORS[value])}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
          <p className="text-sm text-muted-foreground">
            Preview of {MOODS.find((m) => m.value === value)?.label} mood
          </p>
        </motion.div>
      )}
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
