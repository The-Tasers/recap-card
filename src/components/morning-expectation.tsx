'use client';

import { motion } from 'framer-motion';
import { ExpectationTone, EXPECTATION_TONES } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  Sun,
  Sparkles,
  CloudRain,
  HelpCircle,
  Zap,
  CloudFog,
  type LucideIcon,
} from 'lucide-react';

// Icons for each tone
const TONE_ICONS: Record<ExpectationTone, LucideIcon> = {
  calm: Sun,
  excited: Sparkles,
  anxious: CloudRain,
  uncertain: HelpCircle,
  energized: Zap,
  heavy: CloudFog,
};

interface MorningExpectationProps {
  onSelect: (tone: ExpectationTone) => void;
  onSkip: () => void;
}

export function MorningExpectation({ onSelect, onSkip }: MorningExpectationProps) {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full px-6"
    >
      <h1 className="text-xl md:text-2xl font-medium text-center mb-2">
        {t('morning.question') || 'How does today feel right now?'}
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-8">
        {t('morning.hint') || 'Set an expectation for the day ahead'}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
        {EXPECTATION_TONES.map((tone) => {
          const Icon = TONE_ICONS[tone.value];

          return (
            <motion.button
              key={tone.value}
              type="button"
              onClick={() => onSelect(tone.value)}
              className={cn(
                'flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-colors cursor-pointer',
                'bg-muted/50 border-muted hover:bg-muted hover:border-muted-foreground/30'
              )}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Icon
                className="h-6 w-6"
                style={{ color: tone.color }}
              />
              <span className="text-sm font-medium">
                {t(`tone.${tone.value}` as any) || tone.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={onSkip}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        {t('morning.skip') || 'Skip for now'}
      </button>
    </motion.div>
  );
}

// Badge for displaying expectation tone
interface ExpectationBadgeProps {
  tone: ExpectationTone;
  size?: 'sm' | 'md';
}

export function ExpectationBadge({ tone, size = 'md' }: ExpectationBadgeProps) {
  const { t } = useI18n();
  const toneInfo = EXPECTATION_TONES.find((t) => t.value === tone);
  if (!toneInfo) return null;

  const Icon = TONE_ICONS[tone];

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
        'inline-flex items-center rounded-lg bg-muted/50 border border-muted',
        sizeClasses[size]
      )}
    >
      <Icon
        className={iconSizes[size]}
        style={{ color: toneInfo.color }}
      />
      <span className="font-medium text-muted-foreground">
        {t(`tone.${tone}` as any) || toneInfo.label}
      </span>
    </span>
  );
}
