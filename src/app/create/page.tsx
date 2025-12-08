'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useCardStore } from '@/lib/store';
import { Mood, DailyCard } from '@/lib/types';
import { generateId } from '@/lib/export';
import { MoodSelector } from '@/components/mood-selector';
import { PhotoUploader } from '@/components/photo-uploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const MAX_CHARS = 500;

export default function CreatePage() {
  const router = useRouter();
  const { addCard, updateCard, getCardByDate, error, setError } = useCardStore();

  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [existingCard, setExistingCard] = useState<DailyCard | null>(null);

  const charCount = text.length;
  const isValid = text.trim().length > 0 && charCount <= MAX_CHARS;

  const handleSubmit = async () => {
    if (!isValid) return;
    setError(null);

    // Check for existing card today
    const todayCard = getCardByDate(new Date().toISOString());
    if (todayCard) {
      setExistingCard(todayCard);
      setShowOverwriteDialog(true);
      return;
    }

    await saveCard();
  };

  const saveCard = async (overwrite = false) => {
    setIsSubmitting(true);
    setError(null);

    const cardData = {
      text: text.trim(),
      mood,
      photoUrl,
      createdAt: new Date().toISOString(),
    };

    try {
      if (overwrite && existingCard) {
        const success = updateCard(existingCard.id, cardData);
        if (success) {
          router.push(`/card/${existingCard.id}`);
        } else {
          setIsSubmitting(false);
        }
      } else {
        const newCard: DailyCard = {
          id: generateId(),
          ...cardData,
        };
        const success = addCard(newCard);
        if (success) {
          router.push(`/card/${newCard.id}`);
        } else {
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      setError('Failed to save. Try removing the photo or deleting old entries.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-destructive font-medium">Storage Full</p>
            <p className="text-xs text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-neutral-800">New Entry</h1>
          <p className="text-sm text-muted-foreground">
            How was your day?
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Mood Selector */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            How are you feeling?
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            What happened today?
          </label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write about your day..."
            className="min-h-[150px] rounded-2xl resize-none text-base"
            maxLength={MAX_CHARS + 50} // Allow slight overflow for UX
          />
          <div className="flex justify-end mt-2">
            <span
              className={`text-xs ${
                charCount > MAX_CHARS
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Add a photo
          </label>
          <PhotoUploader value={photoUrl} onChange={setPhotoUrl} />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full rounded-full h-12 text-base"
          size="lg"
        >
          {isSubmitting ? (
            'Saving...'
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Save Entry
            </>
          )}
        </Button>
      </div>

      {/* Overwrite Dialog */}
      <Dialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entry Already Exists</DialogTitle>
            <DialogDescription>
              You already have an entry for today. Would you like to replace it
              with this new one?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowOverwriteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowOverwriteDialog(false);
                saveCard(true);
              }}
            >
              Replace Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
