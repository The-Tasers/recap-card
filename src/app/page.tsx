'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCardStore } from '@/lib/store';
import { getTodayRecap } from '@/lib/daily-utils';
import { groupCardsByWeek } from '@/lib/date-utils';
import { SignupPrompt } from '@/components/signup-prompt';
import { PhotoData } from '@/components/photo-uploader';
import { RecapForm } from '@/components/recap-form';
import { MoodSelectView } from '@/components/mood-select-view';
import { TodayView } from '@/components/today-view';
import { FormHeader } from '@/components/form-header';
import { SettingsButton } from '@/components/settings-button';
import { uploadImage, compressImageToDataUrl } from '@/lib/supabase/storage';
import { useAuth } from '@/components/auth-provider';
import {
  DailyCard,
  Mood,
  CardBlock,
  BlockId,
  BLOCK_DEFINITIONS,
} from '@/lib/types';
import { Laugh, Smile, Meh, Frown, Angry } from 'lucide-react';
import { generateId } from '@/lib/export';
import { useSyncContext } from '@/components/sync-provider';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { deleteImage, isSupabaseStorageUrl } from '@/lib/supabase/storage';

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
    clearDraft,
  } = useCardStore();
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
  const [editMood, setEditMood] = useState<Mood | undefined>();
  const [editText, setEditText] = useState('');
  const [editBlocks, setEditBlocks] =
    useState<Record<BlockId, CardBlock>>(initializeBlocks);
  const [editPhotoData, setEditPhotoData] = useState<PhotoData | undefined>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

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
    () => groupCardsByWeek(pastEntries),
    [pastEntries]
  );

  // Global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - exit current mode
      if (e.key === 'Escape') {
        // If editing, exit edit mode
        if (editingCard) {
          e.preventDefault();
          cancelEdit();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCard]);

  // Auto-save function for edit mode (handles text, mood, blocks, and photos)
  const performAutoSave = useCallback(async () => {
    if (!editingCard || !editMood) return;
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
      const originalPhotoUrl = editingCard.photoUrl;
      const photoWasRemoved = editPhotoData?.markedForDeletion === true;
      const hasNewPhoto = !!editPhotoData?.file;

      if (hasNewPhoto && editPhotoData?.file) {
        // Upload new photo
        if (user?.id) {
          const { url, error } = await uploadImage(editPhotoData.file, user.id);
          if (error) {
            showNotification('error', 'Image upload failed');
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

      const updates = {
        text: editText.trim(),
        mood: editMood,
        photoUrl,
        blocks: nonEmptyBlocks.length > 0 ? nonEmptyBlocks : undefined,
      };

      const success = updateCard(editingCard.id, updates);

      if (success && isAuthenticated) {
        const updatedCard: DailyCard = { ...editingCard, ...updates };
        await saveRecapToCloud(updatedCard);
      }

      // Update editingCard reference with new photoUrl
      if (success && photoUrl !== editingCard.photoUrl) {
        setEditingCard({ ...editingCard, ...updates });
      }

      setSaveStatus('saved');

      // Clear "saved" status after a delay
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Auto-save failed', err);
      setSaveStatus('idle');
    } finally {
      isSavingRef.current = false;
    }
  }, [
    editingCard,
    editMood,
    editText,
    editBlocks,
    editPhotoData,
    updateCard,
    isAuthenticated,
    saveRecapToCloud,
    user?.id,
  ]);

  // Debounced auto-save for text changes (1 second delay)
  const debouncedAutoSave = useDebouncedCallback(performAutoSave, 1000);

  // Trigger auto-save when edit fields change (including photo)
  useEffect(() => {
    if (editingCard && editMood) {
      debouncedAutoSave();
    }
  }, [
    editText,
    editMood,
    editBlocks,
    editPhotoData,
    editingCard,
    debouncedAutoSave,
  ]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

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
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCard(null);
    setEditMood(undefined);
    setEditText('');
    setEditBlocks(initializeBlocks());
    setEditPhotoData(undefined);
  };

  // Done editing - save immediately then exit
  const handleDone = useCallback(async () => {
    // Force immediate save before exiting
    await performAutoSave();
    cancelEdit();
  }, [performAutoSave]);

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
      showNotification('success', 'Recap restored');
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

  // Handle mood change - creates card immediately when selecting mood for new entry
  const handleMoodChange = async (newMood: Mood) => {
    if (editingCard) {
      // Just update mood for existing card being edited
      setEditMood(newMood);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return;
    }

    // Create a new card immediately when mood is selected
    const newCard: DailyCard = {
      id: generateId(),
      mood: newMood,
      text: '',
      createdAt: new Date().toISOString(),
    };

    const success = addCard(newCard);
    if (success) {
      clearDraft();
      // Immediately start editing the new card
      startEdit(newCard);

      // Sync to cloud in background
      if (isAuthenticated) {
        saveRecapToCloud(newCard).catch(console.error);
      }
    }
  };

  // Loading state
  if (!hydrated) {
    const moodIcons = [
      { Icon: Laugh, color: 'text-emerald-500' },
      { Icon: Smile, color: 'text-green-500' },
      { Icon: Meh, color: 'text-amber-500' },
      { Icon: Frown, color: 'text-orange-500' },
      { Icon: Angry, color: 'text-red-500' },
    ];

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex items-center gap-1">
          {moodIcons.map(({ Icon, color }, i) => (
            <Icon
              key={i}
              className={`w-7 h-7 animate-bounce ${color}`}
              style={{
                animationDelay: `${i * 80}ms`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const isInFormMode = !!editingCard;

  return (
    <div className="h-screen-dynamic flex flex-col bg-background">
      {/* Form header */}
      <FormHeader
        isVisible={isInFormMode}
        editingCard={editingCard}
        mood={undefined}
        editMood={editMood}
        onBack={handleDone}
        onMoodChange={handleMoodChange}
      />

      {/* Edit mode */}
      {editingCard && (
        <div className="max-w-lg w-full mx-auto h-full px-6 relative flex flex-col overflow-hidden">
          <AnimatePresence>
            <RecapForm
              mode="edit"
              text={editText}
              setText={setEditText}
              blocks={editBlocks}
              setBlocks={setEditBlocks}
              photoData={editPhotoData}
              setPhotoData={setEditPhotoData}
              mood={editMood}
              textareaRef={textareaRef}
              saveStatus={saveStatus}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Mood selection - show when no today entry and not editing */}
      {!editingCard && !todayEntry && (
        <div className="max-w-lg w-full mx-auto h-full relative flex flex-col overflow-hidden">
          <SettingsButton isVisible={true} isAuthenticated={!!user} />
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
            />
          </AnimatePresence>
        </div>
      )}

      {/* Today view - wider container on desktop */}
      {!editingCard && todayEntry && (
        <div className="max-w-lg w-full mx-auto h-full relative flex flex-col overflow-y-auto overflow-x-hidden">
          <SettingsButton isVisible={true} isAuthenticated={!!user} />
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
    </div>
  );
}
