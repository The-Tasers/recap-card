'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laugh, Smile, Meh, Frown, Angry } from 'lucide-react';
import { useCardStore, clearIndexedDB } from '@/lib/store';
import { getTodayRecap } from '@/lib/daily-utils';
import { formatDate, groupCardsByWeek } from '@/lib/date-utils';
import { applyMoodClass } from '@/components/theme-provider';
import { createClient } from '@/lib/supabase/client';
import { SignupPrompt } from '@/components/signup-prompt';
import { PhotoData } from '@/components/photo-uploader';
import { RecapForm } from '@/components/recap-form';
import { SettingsPanel } from '@/components/settings-panel';
import { MoodSelectView } from '@/components/mood-select-view';
import { TodayView } from '@/components/today-view';
import { FormHeader } from '@/components/form-header';
import { DoneButton } from '@/components/done-button';
import { SettingsButton } from '@/components/settings-button';
import { uploadImage, compressImageToDataUrl } from '@/lib/supabase/storage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/components/auth-provider';
import {
  DailyCard,
  Mood,
  CardBlock,
  BlockId,
  BLOCK_DEFINITIONS,
} from '@/lib/types';
import { generateId } from '@/lib/export';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { toast } from 'sonner';
import { deleteImage, isSupabaseStorageUrl } from '@/lib/supabase/storage';

export default function Canvas() {
  const {
    cards,
    hydrated,
    addCard,
    updateCard,
    deleteCard,
    getById,
    draftEntry,
    saveDraft,
    clearDraft,
  } = useCardStore();
  const { saveRecapToCloud, deleteRecapFromCloud, isAuthenticated } =
    useSupabaseSync();
  const { user, signOut, loading: authLoading } = useAuth();

  // Initialize blocks helper
  const initializeBlocks = (): Record<BlockId, CardBlock> => {
    const blockIds: BlockId[] = [
      'sleep',
      'weather',
      'meals',
      'selfcare',
      'health',
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

  // Check-in state
  const [mood, setMood] = useState<Mood | undefined>(draftEntry?.mood);
  const [text, setText] = useState(draftEntry?.text || '');
  const [blocks, setBlocks] =
    useState<Record<BlockId, CardBlock>>(initializeBlocks);
  const [photoData, setPhotoData] = useState<PhotoData | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCard, setEditingCard] = useState<DailyCard | null>(null);
  const [editMood, setEditMood] = useState<Mood | undefined>();
  const [editText, setEditText] = useState('');
  const [editBlocks, setEditBlocks] =
    useState<Record<BlockId, CardBlock>>(initializeBlocks);
  const [editPhotoData, setEditPhotoData] = useState<PhotoData | undefined>();
  const [showSettings, setShowSettings] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Today's entry
  const todayEntry = useMemo(() => getTodayRecap(cards), [cards]);

  // Past entries (excluding today)
  const pastEntries = useMemo(() => {
    const today = new Date().toDateString();
    return cards.filter((c) => new Date(c.createdAt).toDateString() !== today);
  }, [cards]);

  // Grouped past entries
  const groupedEntries = useMemo(
    () => groupCardsByWeek(pastEntries),
    [pastEntries]
  );

  // Current mood for theming
  const currentMood: Mood =
    todayEntry?.mood || (cards.length > 0 ? cards[0].mood : 'neutral');

  // Auto-save draft
  useEffect(() => {
    if (mood && !todayEntry) {
      saveDraft({ mood, text });
    }
  }, [mood, text, todayEntry, saveDraft]);

  // Auto-focus textarea when mood selected
  useEffect(() => {
    if (mood && !todayEntry && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mood, todayEntry]);

  // Handle save
  const handleSave = async () => {
    if (!mood) return;

    setIsSubmitting(true);

    try {
      let photoUrl: string | undefined;
      if (photoData?.file) {
        if (user?.id) {
          const { url, error } = await uploadImage(photoData.file, user.id);
          if (error) {
            toast.error('Image upload failed', { description: error });
            setIsSubmitting(false);
            return;
          }
          photoUrl = url ?? undefined;
        } else {
          photoUrl = await compressImageToDataUrl(photoData.file);
        }
      }

      if (photoData?.previewUrl) {
        URL.revokeObjectURL(photoData.previewUrl);
      }

      const blocksArray = Object.values(blocks);
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

      const newCard: DailyCard = {
        id: generateId(),
        mood,
        text: text.trim(),
        photoUrl,
        blocks: nonEmptyBlocks.length > 0 ? nonEmptyBlocks : undefined,
        createdAt: new Date().toISOString(),
      };

      const success = addCard(newCard);
      if (success) {
        clearDraft();
        setMood(undefined);
        setText('');
        setBlocks(initializeBlocks());
        setPhotoData(undefined);

        if (isAuthenticated) {
          const cloudSuccess = await saveRecapToCloud(newCard);
          if (!cloudSuccess) {
            toast.error('Cloud sync failed', {
              description: 'Saved locally. Will sync when possible.',
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to save', err);
      toast.error('Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle question selection
  const handleSelectQuestion = (question: string) => {
    if (editingCard) {
      setEditText((prev) => (prev ? `${prev}\n\n${question}` : question));
    } else {
      setText((prev) => (prev ? `${prev}\n\n${question}` : question));
    }
    textareaRef.current?.focus();
  };

  // Start editing a card
  const startEdit = (card: DailyCard) => {
    setEditingCard(card);
    setEditMood(card.mood);
    setEditText(card.text);
    setEditPhotoData(
      card.photoUrl ? { existingUrl: card.photoUrl } : undefined
    );
    applyMoodClass(card.mood);

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

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingCard || !editMood) return;

    setIsSubmitting(true);

    try {
      let photoUrl: string | undefined;
      const originalPhotoUrl = editingCard.photoUrl;
      const photoWasRemoved = editPhotoData?.markedForDeletion === true;
      const hasNewPhoto = !!editPhotoData?.file;

      if (hasNewPhoto && editPhotoData?.file) {
        if (user?.id) {
          const { url, error } = await uploadImage(editPhotoData.file, user.id);
          if (error) {
            toast.error('Image upload failed', { description: error });
            setIsSubmitting(false);
            return;
          }
          photoUrl = url ?? undefined;
        } else {
          photoUrl = await compressImageToDataUrl(editPhotoData.file);
        }

        if (originalPhotoUrl && isSupabaseStorageUrl(originalPhotoUrl)) {
          await deleteImage(originalPhotoUrl);
        }
      } else if (photoWasRemoved) {
        if (originalPhotoUrl && isSupabaseStorageUrl(originalPhotoUrl)) {
          await deleteImage(originalPhotoUrl);
        }
        photoUrl = undefined;
      } else {
        photoUrl = originalPhotoUrl;
      }

      if (editPhotoData?.previewUrl) {
        URL.revokeObjectURL(editPhotoData.previewUrl);
      }

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

      const updates = {
        text: editText.trim(),
        mood: editMood,
        photoUrl,
        blocks: nonEmptyBlocks.length > 0 ? nonEmptyBlocks : undefined,
      };

      const success = updateCard(editingCard.id, updates);

      if (success) {
        if (isAuthenticated) {
          const updatedCard: DailyCard = { ...editingCard, ...updates };
          const cloudSuccess = await saveRecapToCloud(updatedCard);
          if (!cloudSuccess) {
            toast.error('Cloud sync failed', {
              description: 'Saved locally. Will sync when possible.',
            });
          }
        }
        cancelEdit();
      } else {
        toast.error('Failed to save');
      }
    } catch (err) {
      console.error('Failed to update card', err);
      toast.error('Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteCardId) return;
    const card = getById(deleteCardId);
    if (!card) return;

    setIsDeleting(true);

    try {
      if (card.photoUrl && isSupabaseStorageUrl(card.photoUrl)) {
        await deleteImage(card.photoUrl);
      }

      if (isAuthenticated) {
        await deleteRecapFromCloud(card.id);
      }

      deleteCard(card.id);
      setDeleteCardId(null);
    } catch (err) {
      console.error('Failed to delete card', err);
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  // Settings handlers
  const handleClearAll = async () => {
    try {
      if (user) {
        const supabase = createClient();
        const { error } = await supabase
          .from('recaps')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting cloud recaps:', error);
          toast.error('Failed to delete cloud data');
          return;
        }
      }

      await clearIndexedDB();
      toast.success('All data cleared');
      setShowSettings(false);
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    setShowSettings(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/account/delete', { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      await clearIndexedDB();
      await signOut();

      toast.success('Account deleted successfully');
      setShowSettings(false);

      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  // Handle back from create form
  const handleBackFromCreate = () => {
    setMood(undefined);
    setText('');
    setBlocks(initializeBlocks());
    setPhotoData(undefined);
    clearDraft();
  };

  // Handle mood change
  const handleMoodChange = (newMood: Mood) => {
    if (editingCard) {
      setEditMood(newMood);
    } else {
      setMood(newMood);
    }
    applyMoodClass(newMood);
  };

  // Loading state
  if (!hydrated) {
    const moodIcons = [
      { Icon: Laugh, color: 'text-green-500' },
      { Icon: Smile, color: 'text-lime-500' },
      { Icon: Meh, color: 'text-yellow-500' },
      { Icon: Frown, color: 'text-orange-500' },
      { Icon: Angry, color: 'text-red-500' },
    ];

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            RECAPP
          </h1>
          <div className="flex gap-3">
            {moodIcons.map(({ Icon, color }, i) => (
              <span
                key={i}
                className={`animate-bounce ${color}`}
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '0.6s',
                }}
              >
                <Icon className="h-7 w-7" />
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isInFormMode =
    (!showSettings && !editingCard && !todayEntry && mood) || editingCard;

  return (
    <div className="min-h-screen bg-background">
      {/* Settings button */}
      <SettingsButton
        isVisible={!showSettings && !editingCard}
        isAuthenticated={!!user}
        currentMood={currentMood}
        onClick={() => setShowSettings(true)}
      />

      {/* Done button */}
      <DoneButton
        isVisible={!!isInFormMode}
        mood={editingCard ? editMood : mood}
        isSubmitting={isSubmitting}
        disabled={
          isSubmitting ||
          (!editingCard && !mood) ||
          (!!editingCard && !editMood)
        }
        onSave={editingCard ? handleSaveEdit : handleSave}
      />

      {/* Form header */}
      <FormHeader
        isVisible={!!isInFormMode}
        editingCard={editingCard}
        mood={mood}
        editMood={editMood}
        onBack={editingCard ? cancelEdit : handleBackFromCreate}
        onMoodChange={handleMoodChange}
      />

      <div className="max-w-lg mx-auto px-6 py-8 md:py-12">
        {/* Date header */}
        {!showSettings && !editingCard && (todayEntry || !mood) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-lg text-foreground mb-8"
          >
            {formatDate(new Date())}
          </motion.p>
        )}

        <AnimatePresence mode="wait">
          {/* Edit mode */}
          {editingCard && (
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
              onSelectQuestion={handleSelectQuestion}
            />
          )}

          {/* Settings */}
          {showSettings && (
            <SettingsPanel
              onBack={() => setShowSettings(false)}
              user={user}
              authLoading={authLoading}
              currentMood={currentMood}
              cardsCount={cards.length}
              onSignOut={handleSignOut}
              onClearAll={handleClearAll}
              onDeleteAccount={handleDeleteAccount}
            />
          )}

          {/* Initial mood selection */}
          {!showSettings && !editingCard && !todayEntry && !mood && (
            <MoodSelectView
              mood={mood}
              onMoodChange={handleMoodChange}
              hasEntries={cards.length > 0}
            />
          )}

          {/* Create form */}
          {!showSettings && !editingCard && !todayEntry && mood && (
            <RecapForm
              mode="create"
              text={text}
              setText={setText}
              blocks={blocks}
              setBlocks={setBlocks}
              photoData={photoData}
              setPhotoData={setPhotoData}
              mood={mood}
              textareaRef={textareaRef}
              onSelectQuestion={handleSelectQuestion}
            />
          )}

          {/* Today view with memory stream */}
          {!showSettings && !editingCard && todayEntry && (
            <TodayView
              todayEntry={todayEntry}
              groupedEntries={groupedEntries}
              pastEntriesCount={pastEntries.length}
              onEdit={startEdit}
              onDelete={setDeleteCardId}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Sign-up prompt */}
      <SignupPrompt />

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteCardId}
        onOpenChange={(open) => !open && setDeleteCardId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recap</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recap? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteCardId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
