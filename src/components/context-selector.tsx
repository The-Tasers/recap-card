'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FREE_PLAN_LIMITS } from '@/lib/types';
import { useOptionsStore } from '@/lib/options-store';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import {
  Briefcase,
  Home,
  Car,
  Users,
  User,
  Dumbbell,
  ShoppingBag,
  Moon,
  Plus,
  LogIn,
  type LucideIcon,
} from 'lucide-react';

// Icons for default contexts
const CONTEXT_ICONS: Record<string, LucideIcon> = {
  work: Briefcase,
  home: Home,
  commute: Car,
  social: Users,
  alone: User,
  exercise: Dumbbell,
  errands: ShoppingBag,
  rest: Moon,
};

interface ContextSelectorProps {
  value?: string;
  onChange: (contextId: string) => void;
  onAddContext?: (label: string) => void;
  isPaidUser?: boolean;
  showLoginPrompt?: boolean;
}

export function ContextSelector({
  value,
  onChange,
  onAddContext,
  isPaidUser = false,
  showLoginPrompt = false,
}: ContextSelectorProps) {
  const { t } = useI18n();
  const { contexts, getCustomContexts } = useOptionsStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [showLoginNotice, setShowLoginNotice] = useState(false);

  // Contexts are loaded from the database via options store
  const customContexts = getCustomContexts();

  // Check if user can add more custom contexts
  const canAddCustomContext =
    isPaidUser || customContexts.length < FREE_PLAN_LIMITS.maxCustomContexts;

  const handleAddButtonClick = () => {
    if (showLoginPrompt) {
      // Not logged in - show login notice
      setShowLoginNotice(true);
      setTimeout(() => setShowLoginNotice(false), 3000);
    } else if (canAddCustomContext) {
      setIsAdding(true);
    }
  };

  const handleAddContext = () => {
    if (newLabel.trim() && onAddContext && canAddCustomContext) {
      onAddContext(newLabel.trim());
      setNewLabel('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddContext();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewLabel('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {contexts.map((context) => {
          const isSelected = value === context.id;
          const Icon = CONTEXT_ICONS[context.id] || ShoppingBag;
          const isCustom = !context.isDefault;

          return (
            <motion.button
              key={context.id}
              type="button"
              onClick={() => onChange(context.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-colors cursor-pointer',
                isSelected
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-muted/50 border-muted hover:bg-muted hover:border-muted-foreground/20'
              )}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {!isCustom && (
                <Icon
                  className={cn(
                    'h-4 w-4',
                    isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                />
              )}
              <span className="text-sm font-medium">
                {t(`context.${context.id}` as any) || context.label}
              </span>
            </motion.button>
          );
        })}

        {/* Add new context button/input - always visible */}
        {isAdding ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('context.addCustom') || 'Context name'}
              className="px-3 py-2 text-sm rounded-l-xl border-2 border-r-0 border-primary bg-background focus:outline-none w-28"
              autoFocus
              maxLength={20}
            />
            <button
              type="button"
              onClick={handleAddContext}
              disabled={!newLabel.trim()}
              className="px-3 py-2 text-sm rounded-none border-2 border-l-0 border-r-0 border-primary bg-primary text-primary-foreground font-medium disabled:opacity-50 cursor-pointer"
            >
              {t('form.add') || 'Add'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewLabel('');
              }}
              className="px-3 py-2 text-sm rounded-r-xl border-2 border-l-0 border-muted bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {t('form.cancel') || '✕'}
            </button>
          </div>
        ) : (
          <div className="relative">
            <motion.button
              type="button"
              onClick={handleAddButtonClick}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed transition-colors cursor-pointer',
                showLoginPrompt
                  ? 'border-muted-foreground/20 text-muted-foreground/60'
                  : 'border-muted-foreground/30 hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'
              )}
              whileTap={{ scale: 0.95 }}
            >
              {showLoginPrompt ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="text-sm">{t('context.addCustom')}</span>
            </motion.button>
            {/* Tooltip for login prompt */}
            <AnimatePresence>
              {showLoginNotice && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  className="absolute left-0 top-full mt-2 z-10 px-3 py-2 rounded-lg bg-foreground text-background text-xs font-medium shadow-lg whitespace-nowrap"
                >
                  {t('customItem.loginRequired')}
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-foreground rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Soft upgrade prompt when limit reached (only when logged in) */}
      {!showLoginPrompt && !canAddCustomContext && (
        <p className="text-xs text-muted-foreground mt-2">
          {t('upgrade.customContextLimit')}
        </p>
      )}
    </div>
  );
}

// Compact badge version
interface ContextBadgeProps {
  contextId: string;
  size?: 'sm' | 'md';
}

export function ContextBadge({ contextId, size = 'md' }: ContextBadgeProps) {
  const { t } = useI18n();
  const { contexts } = useOptionsStore();
  const context = contexts.find((c) => c.id === contextId);
  if (!context) return null;

  const Icon = CONTEXT_ICONS[contextId];

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
      {Icon && (
        <Icon className={cn(iconSizes[size], 'text-muted-foreground')} />
      )}
      <span className="font-medium text-muted-foreground">
        {t(`context.${contextId}` as any) || context.label}
      </span>
    </span>
  );
}
