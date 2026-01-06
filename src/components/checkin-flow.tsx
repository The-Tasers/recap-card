'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOptionsStore } from '@/lib/options-store';
import { useCheckInStore } from '@/lib/checkin-store';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { State } from '@/lib/types';
import {
  X,
  Check,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Smile,
  Frown,
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
  Undo2,
  Trash2,
  TreePine,
  Plane,
  UtensilsCrossed,
  GraduationCap,
  Heart,
  Baby,
  PawPrint,
  UserPlus,
  HeartHandshake,
  Battery,
  Zap,
  AlertCircle,
  HelpCircle,
  MapPin,
  Coffee,
  Dog,
  type LucideIcon,
} from 'lucide-react';

// State icons by category
const STATE_ICONS: Record<string, LucideIcon> = {
  // Neutral
  neutral: Minus,
  // Energy (low to high)
  drained: Battery,
  tired: Moon,
  calm: Cloud,
  rested: Sun,
  energized: Zap,
  // Emotion (negative to positive)
  frustrated: Frown,
  anxious: AlertCircle,
  uncertain: HelpCircle,
  content: Smile,
  grateful: Heart,
  // Tension (scattered to present)
  overwhelmed: CloudRain,
  distracted: EyeOff,
  scattered: Shuffle,
  focused: Target,
  present: Eye,
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
  rest: Coffee,
  outdoors: MapPin,
  eating: UtensilsCrossed,
  learning: GraduationCap,
  travel: Plane,
};

// Person icons
const PERSON_ICONS: Record<string, LucideIcon> = {
  partner: Heart,
  family: Users,
  friends: Smile,
  colleagues: Briefcase,
  kids: Baby,
  pets: Dog,
  strangers: UserPlus,
  clients: HeartHandshake,
};

// =============================================================================
// STATE COLOR SYSTEM
// =============================================================================
// Three categories, each with distinct visual language:
// - Emotion: red↔green valence spectrum ("How did it feel?")
// - Energy: amber/orange family with intensity ("How much energy?")
// - Tension: blue/indigo family with intensity ("How focused/strained?")
// =============================================================================

const STATE_ORB_COLORS: Record<
  string,
  { bg: string; glow: string; rgb: string }
> = {
  neutral: {
    bg: 'bg-slate-400/80',
    glow: 'rgba(148, 163, 184, 0.35)',
    rgb: '#94a3b8',
  },

  // EMOTION category: red → orange → yellow → lime → green (classic bad→good)
  frustrated: {
    bg: 'bg-red-500',
    glow: 'rgba(239, 68, 68, 0.4)',
    rgb: '#ef4444',
  },
  anxious: {
    bg: 'bg-orange-500',
    glow: 'rgba(249, 115, 22, 0.4)',
    rgb: '#f97316',
  },
  uncertain: {
    bg: 'bg-yellow-500',
    glow: 'rgba(234, 179, 8, 0.4)',
    rgb: '#eab308',
  },
  content: {
    bg: 'bg-lime-500',
    glow: 'rgba(132, 204, 22, 0.4)',
    rgb: '#84cc16',
  },
  grateful: {
    bg: 'bg-green-500',
    glow: 'rgba(34, 197, 94, 0.4)',
    rgb: '#22c55e',
  },

  // ENERGY category: blue/cyan family (cool energy feel)
  // drained(dark) → tired → calm → rested → energized(bright)
  drained: {
    bg: 'bg-indigo-500',
    glow: 'rgba(99, 102, 241, 0.4)',
    rgb: '#6366f1',
  },
  tired: {
    bg: 'bg-indigo-400',
    glow: 'rgba(129, 140, 248, 0.4)',
    rgb: '#818cf8',
  },
  calm: {
    bg: 'bg-indigo-300',
    glow: 'rgba(165, 180, 252, 0.4)',
    rgb: '#a5b4fc',
  },
  rested: {
    bg: 'bg-sky-400',
    glow: 'rgba(56, 189, 248, 0.4)',
    rgb: '#38bdf8',
  },
  energized: {
    bg: 'bg-cyan-400',
    glow: 'rgba(34, 211, 238, 0.4)',
    rgb: '#22d3ee',
  },

  // TENSION/FOCUS category: purple/violet family (mental clarity)
  // overwhelmed → distracted → scattered → focused → present(clear)
  overwhelmed: {
    bg: 'bg-violet-600',
    glow: 'rgba(124, 58, 237, 0.4)',
    rgb: '#7c3aed',
  },
  distracted: {
    bg: 'bg-purple-600',
    glow: 'rgba(147, 51, 234, 0.4)',
    rgb: '#9333ea',
  },
  scattered: {
    bg: 'bg-purple-500',
    glow: 'rgba(168, 85, 247, 0.4)',
    rgb: '#a855f7',
  },
  focused: {
    bg: 'bg-purple-400',
    glow: 'rgba(192, 132, 252, 0.4)',
    rgb: '#c084fc',
  },
  present: {
    bg: 'bg-fuchsia-400',
    glow: 'rgba(232, 121, 249, 0.4)',
    rgb: '#e879f9',
  },
};

const DEFAULT_ORB_COLORS = {
  bg: 'bg-slate-400/80',
  glow: 'rgba(148, 163, 184, 0.4)',
  rgb: '#94a3b8',
};

// Category order for state display
const CATEGORY_STATE_ORDER: Record<string, string[]> = {
  energy: ['drained', 'tired', 'calm', 'rested', 'energized'],
  emotion: ['frustrated', 'anxious', 'uncertain', 'content', 'grateful'],
  tension: ['overwhelmed', 'distracted', 'scattered', 'focused', 'present'],
};

const CATEGORY_ORDER = ['energy', 'emotion', 'tension'];

interface CheckInFlowProps {
  onComplete: () => void;
  onCancel: () => void;
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
  const Icon = STATE_ICONS[state.id] || HelpCircle;

  const sizeConfig = {
    sm: {
      orb: 'w-10 h-10 sm:w-12 sm:h-12',
      icon: 'w-4 h-4 sm:w-5 sm:h-5',
      text: 'text-[9px] sm:text-xs',
    },
    md: {
      orb: 'w-11 h-11 sm:w-14 sm:h-14',
      icon: 'w-5 h-5 sm:w-6 sm:h-6',
      text: 'text-[10px] sm:text-xs',
    },
    lg: {
      orb: 'w-14 h-14 sm:w-18 sm:h-18',
      icon: 'w-6 h-6 sm:w-7 sm:h-7',
      text: 'text-[10px] sm:text-sm',
    },
  };

  const config = sizeConfig[size];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className="flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
    >
      <motion.div
        className={cn(
          'rounded-full flex items-center justify-center text-white shadow-sm transition-shadow',
          colors.bg,
          config.orb
        )}
        animate={{
          scale: isSelected ? 1.05 : 1,
          boxShadow: isSelected
            ? `0 0 12px ${colors.glow}`
            : `0 1px 4px rgba(0,0,0,0.1)`,
        }}
        whileHover={{
          boxShadow: `0 0 8px ${colors.glow}`,
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
          {t(`state.${state.id}` as TranslationKey) || state.label}
        </span>
      )}
    </motion.button>
  );
}

// Selected state display at top center
interface SelectedStateDisplayProps {
  stateId: string;
  contextId?: string;
  onTap: () => void;
}

function SelectedStateDisplay({ stateId, contextId, onTap }: SelectedStateDisplayProps) {
  const { t } = useI18n();
  const { states, contexts } = useOptionsStore();
  const state = states.find((s) => s.id === stateId);
  if (!state) return null;

  const colors = STATE_ORB_COLORS[stateId] || DEFAULT_ORB_COLORS;
  const Icon = STATE_ICONS[stateId] || HelpCircle;

  // Get context label if selected
  const context = contextId ? contexts.find((c) => c.id === contextId) : null;
  const contextLabel = context
    ? context.isDefault
      ? t(`context.${context.id}` as TranslationKey) || context.label
      : context.label
    : null;

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
          {t(`state.${stateId}` as TranslationKey) || state.label}
        </span>
        {contextLabel && (
          <span className="text-xs text-muted-foreground">
            {contextLabel}
          </span>
        )}
        {!contextLabel && (
          <span className="text-xs text-muted-foreground">
            {t('checkin.tapToChange')}
          </span>
        )}
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
}: CheckInFlowProps) {
  const { t } = useI18n();
  const { addCheckIn, getOrCreateToday, checkIns } = useCheckInStore();
  const { states, contexts, people } = useOptionsStore();

  const [stateId, setStateId] = useState<string | undefined>();
  const [contextId, setContextId] = useState<string | undefined>();
  const [personId, setPersonId] = useState<string | undefined>();
  const [showDiscardMessage, setShowDiscardMessage] = useState(false);
  const [showStateSelector, setShowStateSelector] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFirstMoment, setIsFirstMoment] = useState(false);

  // Check if user has made any changes
  const hasChanges = stateId || contextId || personId;

  // Get states organized by category
  const getOrderedStatesForCategory = useCallback(
    (category: string): State[] => {
      const order = CATEGORY_STATE_ORDER[category] || [];

      return order
        .map((id) => states.find((s) => s.id === id))
        .filter(Boolean) as State[];
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

  // Complete the check-in with success animation
  const handleDone = useCallback(() => {
    if (!stateId || !contextId || isSaving) return;

    setIsSaving(true);

    // Check if this is the first ever moment before adding
    const isFirst = checkIns.length === 0;
    setIsFirstMoment(isFirst);

    const today = getOrCreateToday();
    addCheckIn({
      dayId: today.id,
      timestamp: new Date().toISOString(),
      stateId,
      contextId,
      personId,
    });

    // Show success screen
    setShowSuccess(true);

    // For first moment, don't auto-close - user clicks button
    // For subsequent moments, auto-close after brief delay
    if (!isFirst) {
      setTimeout(() => {
        onComplete();
      }, 1200);
    }
  }, [
    stateId,
    contextId,
    personId,
    getOrCreateToday,
    addCheckIn,
    onComplete,
    isSaving,
    checkIns.length,
  ]);

  const canComplete = !!stateId && !!contextId;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - fixed */}
      <div className="shrink-0 pb-2 sm:pb-4 sticky top-0 z-10 bg-background">
        <div className="relative flex items-center justify-center h-10">
          {/* Title - centered */}
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-semibold leading-tight">
              {t('checkin.stateQuestion')}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('checkin.stateHint')}
            </p>
          </div>

          {/* Close button / Discard confirmation - absolute right */}
          <div className="absolute right-0 top-0">
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
        </div>
      </div>

      {/* Content - Single scrollable area */}
      <div className="flex-1 overflow-y-auto overflow-x-visible scrollbar-hide space-y-4 sm:space-y-6 pb-8">
        {/* State Selection / Selected State - single AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait" initial={false}>
          {showStateSelector ? (
            <motion.div
              key="state-selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-2 sm:space-y-4 pt-1"
            >
              {/* Neutral state - prominent at top */}
              {neutralState && (
                <div className="flex justify-center pb-1.5 sm:pb-3 border-b border-border/50">
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
                  <div key={category} className="space-y-1 sm:space-y-2">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
                      {t(`state.${category}` as TranslationKey)}
                    </p>
                    <div className="flex justify-center gap-1 sm:gap-2">
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
                contextId={contextId}
                onTap={handleSelectedStateTap}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Context selection - shown after state is selected */}
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
                // Use translation for default contexts, label for custom ones
                const label = context.isDefault
                  ? t(`context.${context.id}` as TranslationKey) || context.label
                  : context.label;

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
                    whileTap={{ scale: 0.97 }}
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
                    <span className="text-sm font-medium">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Person selection - shown after context is selected */}
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
                whileTap={{ scale: 0.97 }}
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
                const PersonIcon = PERSON_ICONS[person.id] || User;

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
                    whileTap={{ scale: 0.97 }}
                  >
                    <PersonIcon
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
            </div>
          </motion.div>
        )}
      </div>

      {/* Save button - sticky at bottom on mobile, shown after context is selected */}
      <AnimatePresence>
        {stateId && contextId && !showStateSelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, delay: 0.25 }}
            className="shrink-0 pt-3 pb-2 bg-background sticky bottom-0 border-t border-border/50"
          >
            <motion.button
              onClick={handleDone}
              disabled={!canComplete || isSaving}
              className={cn(
                'w-full py-3 rounded-xl font-medium text-base transition-all',
                canComplete
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
              whileTap={canComplete ? { scale: 0.98 } : undefined}
            >
              {t('checkin.save')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

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

            {/* Success text - different for first moment */}
            {isFirstMoment ? (
              <>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 text-lg font-medium text-foreground"
                >
                  {t('onboarding.successTitle')}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-2 text-sm text-muted-foreground text-center max-w-[250px]"
                >
                  {t('onboarding.successDesc')}
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={onComplete}
                  className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-base hover:bg-primary/90 transition-colors"
                >
                  {t('onboarding.continue')}
                </motion.button>
              </>
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-lg font-medium text-foreground"
              >
                {t('checkin.momentSaved')}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
