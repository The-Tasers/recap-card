'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCardStore, useSettingsStore, saveLocalCards } from '@/lib/store';
import { getTodayRecap } from '@/lib/daily-utils';
import { groupCardsByWeek } from '@/lib/date-utils';
import { SignupPrompt } from '@/components/signup-prompt';
import { FeedbackModal } from '@/components/feedback-modal';
import { Onboarding, useOnboarding } from '@/components/onboarding';
import { PhotoData } from '@/components/photo-uploader';
import { RecapForm } from '@/components/recap-form';
import { MoodSelectView } from '@/components/mood-select-view';
import { TodayView } from '@/components/today-view';
import { FormHeader } from '@/components/form-header';
import { uploadImage, compressImageToDataUrl } from '@/lib/supabase/storage';
import { useAuth } from '@/components/auth-provider';
import {
  DailyCard,
  Mood,
  CardBlock,
  BlockId,
  BLOCK_DEFINITIONS,
  MAX_RECAPS,
} from '@/lib/types';
import { Activity } from 'lucide-react';
import { generateId } from '@/lib/export';
import { useSyncContext } from '@/components/sync-provider';
import { deleteImage, isSupabaseStorageUrl } from '@/lib/supabase/storage';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type SaveStatus = 'idle' | 'saving' | 'saved';

export default function Canvas() {
  const {
    cards,
    hydrated,
    addCard,
    updateCard,
    softDeleteCard,
    restoreCard,
    removePendingDelete,
    pendingDeletes,
  } = useCardStore();
  const { clearDraft } = useSettingsStore();
  const { language, t } = useI18n();
  const { showOnboarding, completeOnboarding, checked: onboardingChecked } = useOnboarding();
  const {
    saveRecapToCloud,
    deleteRecapFromCloud,
    restoreRecapInCloud,
    isAuthenticated,
    syncNotification,
    showNotification,
  } = useSyncContext();
  const { user } = useAuth();

  // Initialize blocks helper
  const initializeBlocks = (): Record<BlockId, CardBlock> => {
    const blockIds: BlockId[] = [
      'sleep',
      'weather',
      'meals',
      'selfcare',
      'health',
      'exercise',
      'social',
      'productivity',
      'hobbies',
    ];
    const initialBlocks: Record<BlockId, CardBlock> = {} as Record<
      BlockId,
      CardBlock
    >;

    blockIds.forEach((blockId, index) => {
      const definition = BLOCK_DEFINITIONS[blockId];
      initialBlocks[blockId] = {
        id: generateId(),
        type: definition.type,
        blockId,
        label: definition.label,
        value: definition.type === 'number' ? 0 : [],
        order: index,
      };
    });

    return initialBlocks;
  };

  // Edit state
  const [editingCard, setEditingCard] = useState<DailyCard | null>(null);
  const [isCreating, setIsCreating] = useState(false); // True when creating new card (not yet saved)
  const [editMood, setEditMood] = useState<Mood | undefined>();
  const [editText, setEditText] = useState('');
  const [editBlocks, setEditBlocks] =
    useState<Record<BlockId, CardBlock>>(initializeBlocks);
  const [editPhotoData, setEditPhotoData] = useState<PhotoData | undefined>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSavingRef = useRef(false);
  // Store original values to detect changes
  const originalValuesRef = useRef<{
    text: string;
    mood: Mood | undefined;
    blocks: CardBlock[];
    photoUrl: string | undefined;
  } | null>(null);

  // Today's entry (including pending deletes to show undo state)
  const todayEntry = useMemo(() => {
    // First check active cards
    const activeToday = getTodayRecap(cards);
    if (activeToday) return activeToday;

    // Check if today's entry is pending delete (so we can show undo)
    const today = new Date().toDateString();
    const pendingToday = pendingDeletes.find(
      (pd) => new Date(pd.card.createdAt).toDateString() === today
    );
    return pendingToday?.card ?? null;
  }, [cards, pendingDeletes]);

  // Check if user has reached the demo limit
  const isAtLimit = cards.length >= MAX_RECAPS && !todayEntry;

  // Check if today's entry is in pending delete state
  const isTodayPendingDelete = useMemo(() => {
    if (!todayEntry) return false;
    return pendingDeletes.some((pd) => pd.card.id === todayEntry.id);
  }, [todayEntry, pendingDeletes]);

  // Past entries (excluding today) - include pending deletes to show undo state
  const pastEntries = useMemo(() => {
    const today = new Date().toDateString();
    const activePast = cards.filter(
      (c) => new Date(c.createdAt).toDateString() !== today
    );

    // Also include past entries that are pending delete
    const pendingPast = pendingDeletes
      .filter((pd) => new Date(pd.card.createdAt).toDateString() !== today)
      .map((pd) => pd.card);

    // Combine and sort by date (newest first)
    const combined = [...activePast, ...pendingPast];
    combined.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return combined;
  }, [cards, pendingDeletes]);

  // Grouped past entries
  const groupedEntries = useMemo(
    () => groupCardsByWeek(pastEntries, language),
    [pastEntries, language]
  );

  // Save function for edit/create mode (handles text, mood, blocks, and photos)
  const saveCard = useCallback(async () => {
    if (!editMood) return;
    if (isSavingRef.current) return; // Prevent re-entry during save

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      const blocksArray = Object.values(editBlocks);
      const nonEmptyBlocks = blocksArray.filter((block) => {
        if (block.type === 'number') {
          return (
            block.value !== null &&
            block.value !== undefined &&
            block.value !== 0
          );
        } else if (block.type === 'multiselect') {
          return Array.isArray(block.value) && block.value.length > 0;
        }
        return false;
      });

      // Handle photo changes
      let photoUrl: string | undefined;
      const originalPhotoUrl = editingCard?.photoUrl;
      const photoWasRemoved = editPhotoData?.markedForDeletion === true;
      const hasNewPhoto = !!editPhotoData?.file;

      if (hasNewPhoto && editPhotoData?.file) {
        // Upload new photo
        if (user?.id) {
          const { url, errorCode } = await uploadImage(editPhotoData.file, user.id);
          if (errorCode) {
            showNotification('error', t(`storage.error.${errorCode}` as TranslationKey));
            setSaveStatus('idle');
            return;
          }
          photoUrl = url ?? undefined;
        } else {
          photoUrl = await compressImageToDataUrl(editPhotoData.file);
        }

        // Delete old photo if it was in Supabase storage and user is authenticated
        if (
          originalPhotoUrl &&
          isSupabaseStorageUrl(originalPhotoUrl) &&
          isAuthenticated
        ) {
          await deleteImage(originalPhotoUrl);
        }

        // Clear the file from editPhotoData to prevent re-upload, keep previewUrl for display
        if (editPhotoData.previewUrl) {
          URL.revokeObjectURL(editPhotoData.previewUrl);
        }
        setEditPhotoData({ existingUrl: photoUrl });
      } else if (photoWasRemoved) {
        // Photo was removed - only delete from cloud if authenticated
        if (
          originalPhotoUrl &&
          isSupabaseStorageUrl(originalPhotoUrl) &&
          isAuthenticated
        ) {
          await deleteImage(originalPhotoUrl);
        }
        photoUrl = undefined;
      } else {
        // Keep existing photo
        photoUrl = editPhotoData?.existingUrl || originalPhotoUrl;
      }

      if (isCreating) {
        // Check if this is the first recap (before adding)
        const isFirstRecap = cards.length === 0;
        const feedbackShown = localStorage.getItem('feedback-shown-after-first');

        // Creating a new card
        const newCard: DailyCard = {
          id: generateId(),
          mood: editMood,
          text: editText.trim(),
          photoUrl,
          createdAt: new Date().toISOString(),
          blocks: nonEmptyBlocks.length > 0 ? nonEmptyBlocks : undefined,
        };

        addCard(newCard);
        clearDraft();
        setIsCreating(false);
        setEditingCard(newCard);

        // Sync to cloud or save locally
        if (isAuthenticated) {
          await saveRecapToCloud(newCard);
        } else {
          const updatedCards = useCardStore.getState().cards;
          saveLocalCards(updatedCards);
        }

        // Show feedback modal after first recap creation
        if (isFirstRecap && !feedbackShown) {
          localStorage.setItem('feedback-shown-after-first', 'true');
          setTimeout(() => setShowFeedbackModal(true), 500);
        }

        // Update original values after successful save
        originalValuesRef.current = {
          text: editText.trim(),
          mood: editMood,
          blocks: nonEmptyBlocks,
          photoUrl,
        };
      } else if (editingCard) {
        // Updating existing card
        const updates = {
          text: editText.trim(),
          mood: editMood,
          photoUrl,
          blocks: nonEmptyBlocks.length > 0 ? nonEmptyBlocks : undefined,
        };

        updateCard(editingCard.id, updates);

        if (isAuthenticated) {
          const updatedCard: DailyCard = { ...editingCard, ...updates };
          await saveRecapToCloud(updatedCard);
        } else {
          // Save to IndexedDB for anonymous users
          const updatedCards = useCardStore.getState().cards;
          saveLocalCards(updatedCards);
        }

        // Update editingCard reference with new photoUrl
        if (photoUrl !== editingCard.photoUrl) {
          setEditingCard({ ...editingCard, ...updates });
        }

        // Update original values after successful save
        originalValuesRef.current = {
          text: editText.trim(),
          mood: editMood,
          blocks: nonEmptyBlocks,
          photoUrl,
        };
      }

      setSaveStatus('saved');
      setIsDirty(false);

      // Exit form after successful save
      setEditingCard(null);
      setIsCreating(false);
      setSaveStatus('idle');
    } catch (err) {
      console.error('Save failed', err);
      setSaveStatus('idle');
    } finally {
      isSavingRef.current = false;
    }
  }, [
    editingCard,
    isCreating,
    editMood,
    editText,
    editBlocks,
    editPhotoData,
    addCard,
    updateCard,
    clearDraft,
    isAuthenticated,
    saveRecapToCloud,
    showNotification,
    user?.id,
    t,
    cards.length,
  ]);

  // Track dirty state when edit fields change
  useEffect(() => {
    // In create mode, always dirty if we have a mood
    if (isCreating) {
      setIsDirty(!!editMood);
      return;
    }

    if (!editingCard || !originalValuesRef.current) return;

    const original = originalValuesRef.current;
    const currentBlocks = Object.values(editBlocks).filter((block) => {
      if (block.type === 'number') {
        return (
          block.value !== null && block.value !== undefined && block.value !== 0
        );
      } else if (block.type === 'multiselect') {
        return Array.isArray(block.value) && block.value.length > 0;
      }
      return false;
    });

    // Get current photo URL
    const currentPhotoUrl = editPhotoData?.markedForDeletion
      ? undefined
      : editPhotoData?.file
      ? 'new-file'
      : editPhotoData?.existingUrl;
    const originalPhotoUrl = original.photoUrl;

    // Compare values
    const textChanged = editText.trim() !== original.text;
    const moodChanged = editMood !== original.mood;
    const photoChanged =
      currentPhotoUrl !== originalPhotoUrl &&
      !(currentPhotoUrl === undefined && originalPhotoUrl === undefined);

    // Simple blocks comparison
    const blocksChanged =
      JSON.stringify(
        currentBlocks.map((b) => ({ blockId: b.blockId, value: b.value }))
      ) !==
      JSON.stringify(
        original.blocks.map((b) => ({ blockId: b.blockId, value: b.value }))
      );

    setIsDirty(textChanged || moodChanged || photoChanged || blocksChanged);
  }, [editText, editMood, editBlocks, editPhotoData, editingCard, isCreating]);

  // Start editing a card
  const startEdit = (card: DailyCard) => {
    setEditingCard(card);
    setEditMood(card.mood);
    setEditText(card.text);
    setEditPhotoData(
      card.photoUrl ? { existingUrl: card.photoUrl } : undefined
    );

    const existingBlocks = initializeBlocks();
    if (card.blocks) {
      card.blocks.forEach((block) => {
        if (block.blockId in existingBlocks) {
          existingBlocks[block.blockId] = block;
        }
      });
    }
    setEditBlocks(existingBlocks);

    // Store original values for dirty tracking
    originalValuesRef.current = {
      text: card.text,
      mood: card.mood,
      blocks: card.blocks || [],
      photoUrl: card.photoUrl,
    };
    setIsDirty(false);
  };

  // Cancel editing (discard changes)
  const cancelEdit = useCallback(() => {
    setEditingCard(null);
    setIsCreating(false);
    setEditMood(undefined);
    setEditText('');
    setEditBlocks(initializeBlocks());
    setEditPhotoData(undefined);
    setIsDirty(false);
    setShowDiscardConfirm(false);
    originalValuesRef.current = null;
  }, []);

  // Attempt to go back - shows confirm if dirty
  const handleBack = useCallback(() => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      cancelEdit();
    }
  }, [isDirty, cancelEdit]);

  // Global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - exit current mode (with confirm if dirty)
      if (e.key === 'Escape') {
        if (showDiscardConfirm) {
          // If confirm dialog is open, close it
          e.preventDefault();
          setShowDiscardConfirm(false);
          return;
        }
        // If editing, attempt to exit (will show confirm if dirty)
        if (editingCard) {
          e.preventDefault();
          handleBack();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCard, showDiscardConfirm, handleBack]);

  // Handle soft delete - moves card to pending deletes with undo window
  const handleDelete = async (cardId: string) => {
    const card = softDeleteCard(cardId);
    if (!card) return;

    try {
      // Soft delete in cloud (set deleted_at timestamp)
      if (isAuthenticated) {
        await deleteRecapFromCloud(card.id);
      }

      // After undo window expires, permanently delete
      setTimeout(async () => {
        const stillPending = useCardStore.getState().getPendingDelete(cardId);
        if (stillPending) {
          // User didn't undo, permanently delete
          removePendingDelete(cardId);

          // Delete photo from cloud if exists and user is authenticated
          if (
            card.photoUrl &&
            isSupabaseStorageUrl(card.photoUrl) &&
            isAuthenticated
          ) {
            await deleteImage(card.photoUrl);
          }
        }
      }, 5000); // 5 second undo window
    } catch (err) {
      console.error('Failed to delete card', err);
    }
  };

  // Handle undo delete - restores card from pending deletes
  const handleUndo = async (cardId: string) => {
    const restored = restoreCard(cardId);
    if (!restored) return;

    try {
      // Restore in cloud (clear deleted_at timestamp)
      if (isAuthenticated) {
        await restoreRecapInCloud(cardId);
      }
      showNotification('success', t('sync.restored'));
    } catch (err) {
      console.error('Failed to restore card', err);
    }
  };

  // Handle dismiss undo - immediately finalize deletion without waiting
  const handleDismissUndo = async (cardId: string) => {
    const pending = useCardStore.getState().getPendingDelete(cardId);
    if (!pending) return;

    // Permanently remove from pending deletes
    removePendingDelete(cardId);

    // Delete photo from cloud if exists and user is authenticated
    if (
      pending.card.photoUrl &&
      isSupabaseStorageUrl(pending.card.photoUrl) &&
      isAuthenticated
    ) {
      await deleteImage(pending.card.photoUrl);
    }
  };

  // Handle mood change - opens form for creating/editing
  const handleMoodChange = async (newMood: Mood) => {
    if (editingCard || isCreating) {
      // Just update mood for existing card being edited or new card being created
      setEditMood(newMood);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return;
    }

    // Start creating a new card (not saved until user clicks Done)
    setIsCreating(true);
    setEditMood(newMood);
    setEditText('');
    setEditBlocks(initializeBlocks());
    setEditPhotoData(undefined);
    originalValuesRef.current = null;
  };

  // Loading state
  if (!hydrated || !onboardingChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <span className="text-2xl font-bold tracking-wide uppercase flex items-center">
          <span className="text-[#ef4444]">R</span>
          <span className="text-[#f97316]">E</span>
          <span className="text-[#eab308]">C</span>
          <span className="text-[#84cc16]">A</span>
          <span className="text-[#22c55e]">P</span>
          <Activity className="h-6 w-6 text-primary" strokeWidth={3} />
        </span>
      </div>
    );
  }

  // Show onboarding for first-time users
  if (showOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const isInFormMode = !!editingCard || isCreating;

  return (
    <div className="h-screen-dynamic flex flex-col bg-background">
      {/* Form header */}
      <FormHeader
        isVisible={isInFormMode}
        editingCard={editingCard}
        onBack={handleBack}
        onDiscard={cancelEdit}
        showDiscardConfirm={showDiscardConfirm}
        onCancelDiscard={() => setShowDiscardConfirm(false)}
      />

      {/* Edit/Create mode */}
      {(editingCard || isCreating) && (
        <div className="max-w-lg w-full mx-auto h-full px-6 relative flex flex-col overflow-hidden">
          <AnimatePresence>
            <RecapForm
              mode={isCreating ? 'create' : 'edit'}
              text={editText}
              setText={setEditText}
              blocks={editBlocks}
              setBlocks={setEditBlocks}
              photoData={editPhotoData}
              setPhotoData={setEditPhotoData}
              mood={editMood}
              onMoodChange={handleMoodChange}
              textareaRef={textareaRef}
              onSave={saveCard}
              saveStatus={saveStatus}
              isDirty={isDirty}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Mood selection - show when no today entry and not editing/creating */}
      {!editingCard && !isCreating && !todayEntry && (
        <div className="max-w-lg w-full mx-auto h-full relative flex flex-col overflow-hidden">
          <AnimatePresence>
            <MoodSelectView
              mood={undefined}
              onMoodChange={handleMoodChange}
              hasEntries={cards.length > 0}
              isAuthenticated={!!user}
              syncNotification={syncNotification}
              groupedEntries={groupedEntries}
              onEdit={startEdit}
              onDelete={handleDelete}
              onUndo={handleUndo}
              onDismissUndo={handleDismissUndo}
              pendingDeleteIds={pendingDeletes.map((pd) => pd.card.id)}
              isAtLimit={isAtLimit}
              currentCount={cards.length}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Today view - wider container on desktop */}
      {!editingCard && !isCreating && todayEntry && (
        <div className="max-w-lg w-full mx-auto h-full relative flex flex-col overflow-y-auto overflow-x-hidden">
          <AnimatePresence>
            <TodayView
              todayEntry={todayEntry}
              groupedEntries={groupedEntries}
              pastEntriesCount={pastEntries.length}
              onEdit={startEdit}
              onDelete={handleDelete}
              onUndo={handleUndo}
              onDismissUndo={handleDismissUndo}
              isTodayPendingDelete={isTodayPendingDelete}
              pendingDeleteIds={pendingDeletes.map((pd) => pd.card.id)}
              isAuthenticated={!!user}
              syncNotification={syncNotification}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Sign-up prompt */}
      <SignupPrompt />

      {/* Feedback modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
}
