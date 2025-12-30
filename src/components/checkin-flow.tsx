'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useOptionsStore } from '@/lib/options-store';
import { useCheckInStore } from '@/lib/checkin-store';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { FREE_PLAN_LIMITS, State } from '@/lib/types';
import {
  X,
  Check,
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
  Briefcase,
  Home,
  Car,
  Users,
  User,
  Dumbbell,
  ShoppingBag,
  Plus,
  LogIn,
  Undo2,
  Trash2,
  type LucideIcon,
} from 'lucide-react';

// State icons
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

// Context icons
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

// State colors for orbs (matching moment-blob.tsx)
const STATE_ORB_COLORS: Record<
  string,
  { bg: string; glow: string; rgb: string }
> = {
  neutral: {
    bg: 'bg-slate-400/80',
    glow: 'rgba(148, 163, 184, 0.4)',
    rgb: '#94a3b8',
  },
  drained: {
    bg: 'bg-red-400',
    glow: 'rgba(248, 113, 113, 0.5)',
    rgb: '#f87171',
  },
  tired: {
    bg: 'bg-orange-400',
    glow: 'rgba(251, 146, 60, 0.5)',
    rgb: '#fb923c',
  },
  calm: { bg: 'bg-lime-500', glow: 'rgba(132, 204, 22, 0.5)', rgb: '#84cc16' },
  energized: {
    bg: 'bg-green-500',
    glow: 'rgba(34, 197, 94, 0.5)',
    rgb: '#22c55e',
  },
  frustrated: {
    bg: 'bg-red-500',
    glow: 'rgba(239, 68, 68, 0.5)',
    rgb: '#ef4444',
  },
  anxious: {
    bg: 'bg-orange-500',
    glow: 'rgba(249, 115, 22, 0.5)',
    rgb: '#f97316',
  },
  uncertain: {
    bg: 'bg-amber-400',
    glow: 'rgba(251, 191, 36, 0.5)',
    rgb: '#fbbf24',
  },
  content: {
    bg: 'bg-lime-400',
    glow: 'rgba(163, 230, 53, 0.5)',
    rgb: '#a3e635',
  },
  grateful: {
    bg: 'bg-emerald-500',
    glow: 'rgba(16, 185, 129, 0.5)',
    rgb: '#10b981',
  },
  scattered: {
    bg: 'bg-red-400',
    glow: 'rgba(248, 113, 113, 0.5)',
    rgb: '#f87171',
  },
  distracted: {
    bg: 'bg-orange-400',
    glow: 'rgba(251, 146, 60, 0.5)',
    rgb: '#fb923c',
  },
  focused: {
    bg: 'bg-lime-500',
    glow: 'rgba(132, 204, 22, 0.5)',
    rgb: '#84cc16',
  },
  present: {
    bg: 'bg-green-500',
    glow: 'rgba(34, 197, 94, 0.5)',
    rgb: '#22c55e',
  },
};

const DEFAULT_ORB_COLORS = {
  bg: 'bg-slate-400/80',
  glow: 'rgba(148, 163, 184, 0.4)',
  rgb: '#94a3b8',
};

// Category order for state display
const CATEGORY_STATE_ORDER: Record<string, string[]> = {
  energy: ['drained', 'tired', 'calm', 'energized'],
  emotion: ['frustrated', 'anxious', 'uncertain', 'content', 'grateful'],
  tension: ['scattered', 'distracted', 'focused', 'present'],
};

const CATEGORY_ORDER = ['energy', 'emotion', 'tension'];

interface CheckInFlowProps {
  onComplete: () => void;
  onCancel: () => void;
  isAuthenticated?: boolean;
}

// State orb component for selection
interface StateOrbProps {
  state: State;
  isSelected: boolean;
  size: 'sm' | 'md' | 'lg';
  onSelect: () => void;
  showLabel?: boolean;
}

function StateOrb({
  state,
  isSelected,
  size,
  onSelect,
  showLabel = true,
}: StateOrbProps) {
  const { t } = useI18n();
  const colors = STATE_ORB_COLORS[state.id] || DEFAULT_ORB_COLORS;
  const Icon = STATE_ICONS[state.id] || Meh;

  const sizeConfig = {
    sm: { orb: 'w-12 h-12', icon: 'w-5 h-5', text: 'text-xs' },
    md: { orb: 'w-16 h-16', icon: 'w-6 h-6', text: 'text-sm' },
    lg: { orb: 'w-20 h-20', icon: 'w-8 h-8', text: 'text-base' },
  };

  const config = sizeConfig[size];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className="flex flex-col items-center gap-1.5 cursor-pointer"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.08 }}
    >
      <motion.div
        className={cn(
          'rounded-full flex items-center justify-center text-white shadow-md transition-shadow',
          colors.bg,
          config.orb
        )}
        animate={{
          scale: isSelected ? 1.1 : 1,
          boxShadow: isSelected
            ? `0 0 24px ${colors.glow}`
            : `0 2px 8px rgba(0,0,0,0.1)`,
        }}
        whileHover={{
          boxShadow: `0 0 16px ${colors.glow}`,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Icon className={config.icon} />
      </motion.div>
      {showLabel && (
        <span
          className={cn(
            config.text,
            'font-medium text-foreground text-center leading-tight'
          )}
        >
          {t(`state.${state.id}` as any) || state.label}
        </span>
      )}
    </motion.button>
  );
}

// Selected state display at top center
interface SelectedStateDisplayProps {
  stateId: string;
  onTap: () => void;
}

function SelectedStateDisplay({ stateId, onTap }: SelectedStateDisplayProps) {
  const { t } = useI18n();
  const { states } = useOptionsStore();
  const state = states.find((s) => s.id === stateId);
  if (!state) return null;

  const colors = STATE_ORB_COLORS[stateId] || DEFAULT_ORB_COLORS;
  const Icon = STATE_ICONS[stateId] || Meh;

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <motion.button
        type="button"
        onClick={onTap}
        className="cursor-pointer"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center text-white',
            colors.bg
          )}
          style={{
            boxShadow: `0 0 24px ${colors.glow}`,
          }}
        >
          <Icon className="w-7 h-7" />
        </motion.div>
      </motion.button>
      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold text-foreground">
          {t(`state.${stateId}` as any) || state.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {t('checkin.tapToChange')}
        </span>
      </div>
    </motion.div>
  );
}

// Inline discard confirmation - icon buttons
interface InlineDiscardMessageProps {
  isVisible: boolean;
  onDiscard: () => void;
  onKeepEditing: () => void;
}

function InlineDiscardMessage({
  isVisible,
  onDiscard,
  onKeepEditing,
}: InlineDiscardMessageProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5 sm:gap-2"
        >
          {/* Back button - continue editing */}
          <motion.button
            onClick={onKeepEditing}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <Undo2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>
          {/* Exit button - discard and close */}
          <motion.button
            onClick={onDiscard}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CheckInFlow({
  onComplete,
  onCancel,
  isAuthenticated = false,
}: CheckInFlowProps) {
  const { t } = useI18n();
  const { addCheckIn, addPerson, addContext, getOrCreateToday } =
    useCheckInStore();
  const { states, contexts, people, getCustomContexts, getCustomPeople } =
    useOptionsStore();

  const [stateId, setStateId] = useState<string | undefined>();
  const [contextId, setContextId] = useState<string | undefined>();
  const [personId, setPersonId] = useState<string | undefined>();
  const [showDiscardMessage, setShowDiscardMessage] = useState(false);
  const [showStateSelector, setShowStateSelector] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Custom items for add functionality
  const [isAddingContext, setIsAddingContext] = useState(false);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newContextLabel, setNewContextLabel] = useState('');
  const [newPersonLabel, setNewPersonLabel] = useState('');
  const [showLoginNotice, setShowLoginNotice] = useState<
    'context' | 'person' | null
  >(null);

  // Close login notice on click outside
  useEffect(() => {
    if (!showLoginNotice) return;

    const handleClickOutside = () => {
      setShowLoginNotice(null);
    };

    // Add listener with a small delay to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showLoginNotice]);

  const customContexts = getCustomContexts();
  const customPeople = getCustomPeople();
  const canAddContext =
    customContexts.length < FREE_PLAN_LIMITS.maxCustomContexts;
  const canAddPerson = customPeople.length < FREE_PLAN_LIMITS.maxCustomPeople;

  // Check if user has made any changes
  const hasChanges = stateId || contextId || personId;

  // Get states organized by category
  const getOrderedStatesForCategory = useCallback(
    (category: string): State[] => {
      const order = CATEGORY_STATE_ORDER[category] || [];
      return order
        .map((id) => states.find((s) => s.id === id))
        .filter((s): s is State => s !== undefined);
    },
    [states]
  );

  const neutralState = useMemo(
    () => states.find((s) => s.id === 'neutral'),
    [states]
  );

  // Handle close - always allow, show inline message if has changes
  const handleClose = useCallback(() => {
    if (hasChanges && !showDiscardMessage) {
      setShowDiscardMessage(true);
    } else {
      onCancel();
    }
  }, [hasChanges, showDiscardMessage, onCancel]);

  // Handle state selection
  const handleStateSelect = useCallback((id: string) => {
    setStateId(id);
    setShowStateSelector(false);
    setShowDiscardMessage(false);
  }, []);

  // Handle tapping selected state to go back to selector
  const handleSelectedStateTap = useCallback(() => {
    setShowStateSelector(true);
  }, []);

  // Handle context selection
  const handleContextSelect = useCallback((id: string) => {
    setContextId(id);
    setShowDiscardMessage(false);
  }, []);

  // Handle person selection
  const handlePersonSelect = useCallback((id: string | undefined) => {
    setPersonId(id);
    setShowDiscardMessage(false);
  }, []);

  // Handle adding custom context
  const handleAddContext = useCallback(() => {
    if (newContextLabel.trim() && canAddContext) {
      const context = addContext(newContextLabel.trim());
      setContextId(context.id);
      setNewContextLabel('');
      setIsAddingContext(false);
    }
  }, [newContextLabel, canAddContext, addContext]);

  // Handle adding custom person
  const handleAddPerson = useCallback(() => {
    if (newPersonLabel.trim() && canAddPerson) {
      const person = addPerson(newPersonLabel.trim());
      setPersonId(person.id);
      setNewPersonLabel('');
      setIsAddingPerson(false);
    }
  }, [newPersonLabel, canAddPerson, addPerson]);

  // Handle add button click with login check
  const handleAddButtonClick = useCallback(
    (type: 'context' | 'person') => {
      if (!isAuthenticated) {
        setShowLoginNotice(type);
        return;
      }
      if (type === 'context' && canAddContext) {
        setIsAddingContext(true);
      } else if (type === 'person' && canAddPerson) {
        setIsAddingPerson(true);
      }
    },
    [isAuthenticated, canAddContext, canAddPerson]
  );

  // Complete the check-in with success animation
  const handleDone = useCallback(() => {
    if (!stateId || !contextId || isSaving) return;

    setIsSaving(true);

    const today = getOrCreateToday();
    addCheckIn({
      dayId: today.id,
      timestamp: new Date().toISOString(),
      stateId,
      contextId,
      personId,
    });

    // Show success screen briefly
    setShowSuccess(true);
    setTimeout(() => {
      onComplete();
    }, 1200);
  }, [
    stateId,
    contextId,
    personId,
    getOrCreateToday,
    addCheckIn,
    onComplete,
    isSaving,
  ]);

  const canComplete = !!stateId && !!contextId;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 pb-4">
        <div className="relative flex items-center justify-center h-10">
          {/* Close button / Discard confirmation - absolute left */}
          <div className="absolute left-0 top-0">
            <AnimatePresence mode="wait">
              {showDiscardMessage ? (
                <InlineDiscardMessage
                  key="discard"
                  isVisible={true}
                  onDiscard={onCancel}
                  onKeepEditing={() => setShowDiscardMessage(false)}
                />
              ) : (
                <motion.button
                  key="close"
                  onClick={handleClose}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Title - centered with responsive text and padding */}
          <h2 className="text-base sm:text-lg font-semibold px-12 sm:px-14 text-center leading-tight">
            {t('checkin.stateQuestion')}
          </h2>

          {/* Save button - absolute right */}
          <motion.button
            onClick={handleDone}
            disabled={!canComplete || isSaving}
            className={cn(
              'absolute right-0 top-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all',
              canComplete
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
            whileTap={canComplete ? { scale: 0.95 } : undefined}
          >
            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>
        </div>
      </div>

      {/* Content - Single scrollable area */}
      <div className="flex-1 overflow-x-visible scrollbar-hide space-y-6">
        {/* State Selection / Selected State - single AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait" initial={false}>
          {showStateSelector ? (
            <motion.div
              key="state-selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Neutral state - prominent at top */}
              {neutralState && (
                <div className="flex justify-center pb-4 border-b border-border/50 overflow-visible">
                  <StateOrb
                    state={neutralState}
                    isSelected={stateId === 'neutral'}
                    size="lg"
                    onSelect={() => handleStateSelect('neutral')}
                  />
                </div>
              )}

              {/* Other categories */}
              {CATEGORY_ORDER.map((category) => {
                const categoryStates = getOrderedStatesForCategory(category);
                if (categoryStates.length === 0) return null;

                return (
                  <div key={category} className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
                      {t(`state.${category}` as any)}
                    </p>
                    <div className="flex justify-center gap-3 flex-wrap">
                      {categoryStates.map((state) => (
                        <StateOrb
                          key={state.id}
                          state={state}
                          isSelected={stateId === state.id}
                          size="md"
                          onSelect={() => handleStateSelect(state.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : stateId ? (
            <motion.div
              key="selected-state-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex justify-center py-4 overflow-visible"
            >
              <SelectedStateDisplay
                stateId={stateId}
                onTap={handleSelectedStateTap}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Context selection - shown after state is selected, hides immediately when returning to state selector */}
        {stateId && !showStateSelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1],
              delay: 0.15,
            }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-foreground">
              {t('checkin.contextQuestion')}
            </p>
            <div className="flex flex-wrap gap-2">
              {contexts.map((context) => {
                const isSelected = contextId === context.id;
                const Icon = CONTEXT_ICONS[context.id] || ShoppingBag;
                const isCustom = !context.isDefault;

                return (
                  <motion.button
                    key={context.id}
                    type="button"
                    onClick={() => handleContextSelect(context.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-muted/50 border-muted hover:bg-muted hover:border-muted-foreground/20'
                    )}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {!isCustom && (
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isSelected
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground'
                        )}
                      />
                    )}
                    <span className="text-sm font-medium">
                      {t(`context.${context.id}` as any) || context.label}
                    </span>
                  </motion.button>
                );
              })}

              {/* Add context button */}
              {isAddingContext ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newContextLabel}
                    onChange={(e) => setNewContextLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddContext();
                      if (e.key === 'Escape') {
                        setIsAddingContext(false);
                        setNewContextLabel('');
                      }
                    }}
                    placeholder={t('context.addCustom')}
                    className="px-3 py-2 text-sm rounded-l-xl border-2 border-r-0 border-primary bg-background focus:outline-none w-24"
                    autoFocus
                    maxLength={20}
                  />
                  <button
                    onClick={handleAddContext}
                    disabled={!newContextLabel.trim()}
                    className="px-3 py-2 text-sm border-2 border-l-0 border-r-0 border-primary bg-primary text-primary-foreground font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {t('form.add')}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingContext(false);
                      setNewContextLabel('');
                    }}
                    className="px-3 py-2 text-sm rounded-r-xl border-2 border-l-0 border-muted bg-muted text-muted-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <motion.button
                    type="button"
                    onClick={() => handleAddButtonClick('context')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground cursor-pointer"
                    whileTap={{ scale: 0.95 }}
                  >
                    {!isAuthenticated ? (
                      <LogIn className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span className="text-sm">{t('context.addCustom')}</span>
                  </motion.button>
                  <AnimatePresence>
                    {showLoginNotice === 'context' && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-0 top-full mt-2 z-10 px-4 py-3 rounded-xl bg-card border border-border shadow-lg min-w-48"
                      >
                        <p className="text-sm text-muted-foreground">
                          <Link
                            href="/login"
                            className="font-medium text-primary hover:underline"
                          >
                            {t('settings.signIn')}
                          </Link>{' '}
                          {t('customItem.loginPrompt')}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Person selection - shown after context is selected, hides immediately when returning to state selector */}
        {stateId && contextId && !showStateSelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1],
              delay: 0.2,
            }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-foreground">
              {t('checkin.personQuestion')}
            </p>
            <div className="flex flex-wrap gap-2">
              {/* Skip option */}
              <motion.button
                type="button"
                onClick={() => handlePersonSelect(undefined)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-colors cursor-pointer',
                  !personId
                    ? 'bg-muted border-muted-foreground/30 text-foreground'
                    : 'bg-muted/50 border-muted hover:bg-muted hover:border-muted-foreground/20'
                )}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('person.skip')}</span>
              </motion.button>

              {people.map((person) => {
                const isSelected = personId === person.id;
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
                    onClick={() => handlePersonSelect(person.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-muted/50 border-muted hover:bg-muted hover:border-muted-foreground/20'
                    )}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <User
                      className={cn(
                        'h-4 w-4',
                        isSelected
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground'
                      )}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </motion.button>
                );
              })}

              {/* Add person button */}
              {isAddingPerson ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newPersonLabel}
                    onChange={(e) => setNewPersonLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddPerson();
                      if (e.key === 'Escape') {
                        setIsAddingPerson(false);
                        setNewPersonLabel('');
                      }
                    }}
                    placeholder={t('person.addNew')}
                    className="px-3 py-2 text-sm rounded-l-xl border-2 border-r-0 border-primary bg-background focus:outline-none w-24"
                    autoFocus
                    maxLength={20}
                  />
                  <button
                    onClick={handleAddPerson}
                    disabled={!newPersonLabel.trim()}
                    className="px-3 py-2 text-sm border-2 border-l-0 border-r-0 border-primary bg-primary text-primary-foreground font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {t('form.add')}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingPerson(false);
                      setNewPersonLabel('');
                    }}
                    className="px-3 py-2 text-sm rounded-r-xl border-2 border-l-0 border-muted bg-muted text-muted-foreground cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <motion.button
                    type="button"
                    onClick={() => handleAddButtonClick('person')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground cursor-pointer"
                    whileTap={{ scale: 0.95 }}
                  >
                    {!isAuthenticated ? (
                      <LogIn className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span className="text-sm">{t('person.addNew')}</span>
                  </motion.button>
                  <AnimatePresence>
                    {showLoginNotice === 'person' && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-0 top-full mt-2 z-10 px-4 py-3 rounded-xl bg-card border border-border shadow-lg min-w-48"
                      >
                        <p className="text-sm text-muted-foreground">
                          <Link
                            href="/login"
                            className="font-medium text-primary hover:underline"
                          >
                            {t('settings.signIn')}
                          </Link>{' '}
                          {t('customItem.loginPrompt')}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Success screen overlay */}
      <AnimatePresence>
        {showSuccess && stateId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background z-50"
          >
            {/* Success orb with state color */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="relative"
            >
              {/* Outer glow */}
              <motion.div
                className="absolute rounded-full blur-3xl"
                style={{
                  backgroundColor:
                    STATE_ORB_COLORS[stateId]?.glow || DEFAULT_ORB_COLORS.glow,
                  width: '200%',
                  height: '200%',
                  left: '-50%',
                  top: '-50%',
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              {/* Main orb - flat design */}
              <motion.div
                className={cn(
                  'w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg',
                  STATE_ORB_COLORS[stateId]?.bg || DEFAULT_ORB_COLORS.bg
                )}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                >
                  <Check className="h-10 w-10" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Success text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-lg font-medium text-foreground"
            >
              {t('checkin.momentSaved')}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
