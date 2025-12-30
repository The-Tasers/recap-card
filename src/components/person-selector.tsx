'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FREE_PLAN_LIMITS } from '@/lib/types';
import { useOptionsStore } from '@/lib/options-store';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { User, Plus, X, LogIn } from 'lucide-react';

interface PersonSelectorProps {
  value?: string;
  onChange: (personId: string | undefined) => void;
  onAddPerson?: (label: string) => void;
  isPaidUser?: boolean;
  showLoginPrompt?: boolean;
}

export function PersonSelector({
  value,
  onChange,
  onAddPerson,
  isPaidUser = false,
  showLoginPrompt = false,
}: PersonSelectorProps) {
  const { t } = useI18n();
  const { people, getCustomPeople } = useOptionsStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [showLoginNotice, setShowLoginNotice] = useState(false);

  // Custom people count for limit check
  const customPeople = getCustomPeople();

  // Check if user can add more people (only counts custom people)
  const canAddPerson = isPaidUser || customPeople.length < FREE_PLAN_LIMITS.maxCustomPeople;

  const handleAddButtonClick = () => {
    if (showLoginPrompt) {
      // Not logged in - show login notice
      setShowLoginNotice(true);
      setTimeout(() => setShowLoginNotice(false), 3000);
    } else if (canAddPerson) {
      setIsAdding(true);
    }
  };

  const handleAddPerson = () => {
    if (newLabel.trim() && onAddPerson && canAddPerson) {
      onAddPerson(newLabel.trim());
      setNewLabel('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPerson();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewLabel('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Skip/No one option */}
        <motion.button
          type="button"
          onClick={() => onChange(undefined)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-colors cursor-pointer',
            !value
              ? 'bg-muted border-muted-foreground/30 text-foreground'
              : 'bg-muted/50 border-muted hover:bg-muted hover:border-muted-foreground/20'
          )}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <X className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {t('person.skip')}
          </span>
        </motion.button>

        {/* All people (default + custom) from options store */}
        {people.map((person) => {
          const isSelected = value === person.id;
          // Use translation for default people based on label
          const translationKey = person.isDefault
            ? `person.${person.label.toLowerCase()}`
            : null;
          const label = translationKey
            ? t(translationKey as 'person.partner') || person.label
            : person.label;

          return (
            <motion.button
              key={person.id}
              type="button"
              onClick={() => onChange(person.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-colors cursor-pointer',
                isSelected
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-muted/50 border-muted hover:bg-muted hover:border-muted-foreground/20'
              )}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <User
                className={cn(
                  'h-4 w-4',
                  isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                )}
              />
              <span className="text-sm font-medium">{label}</span>
            </motion.button>
          );
        })}

        {/* Add new person button/input - always visible */}
        {isAdding ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('person.addNew')}
              className="px-3 py-2 text-sm rounded-l-xl border-2 border-r-0 border-primary bg-background focus:outline-none w-24"
              autoFocus
              maxLength={20}
            />
            <button
              type="button"
              onClick={handleAddPerson}
              disabled={!newLabel.trim()}
              className="px-3 py-2 text-sm rounded-none border-2 border-l-0 border-r-0 border-primary bg-primary text-primary-foreground font-medium disabled:opacity-50 cursor-pointer"
            >
              {t('form.add')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewLabel('');
              }}
              className="px-3 py-2 text-sm rounded-r-xl border-2 border-l-0 border-muted bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {t('form.cancel')}
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
              <span className="text-sm">{t('person.addNew')}</span>
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
      {!showLoginPrompt && !canAddPerson && (
        <p className="text-xs text-muted-foreground mt-2">
          {t('upgrade.customPersonLimit')}
        </p>
      )}
    </div>
  );
}

// Compact badge version
interface PersonBadgeProps {
  personId: string;
  size?: 'sm' | 'md';
}

export function PersonBadge({ personId, size = 'md' }: PersonBadgeProps) {
  const { t } = useI18n();
  const { people } = useOptionsStore();
  const person = people.find((p) => p.id === personId);
  if (!person) return null;

  // Use translation for default people based on label
  const translationKey = person.isDefault
    ? `person.${person.label.toLowerCase()}`
    : null;
  const label = translationKey
    ? t(translationKey as 'person.partner') || person.label
    : person.label;

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
      <User className={cn(iconSizes[size], 'text-muted-foreground')} />
      <span className="font-medium text-muted-foreground">{label}</span>
    </span>
  );
}
