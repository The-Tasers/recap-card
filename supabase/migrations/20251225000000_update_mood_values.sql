-- Update mood constraint to use new values
-- Old: 'great', 'good', 'neutral', 'bad', 'terrible'
-- New: 'great', 'good', 'okay', 'low', 'rough'

-- First, update any existing records with old mood values
UPDATE public.recaps SET mood = 'okay' WHERE mood = 'neutral';
UPDATE public.recaps SET mood = 'low' WHERE mood = 'bad';
UPDATE public.recaps SET mood = 'rough' WHERE mood = 'terrible';

-- Drop the old constraint
ALTER TABLE public.recaps DROP CONSTRAINT IF EXISTS recaps_mood_check;

-- Add the new constraint with updated values
ALTER TABLE public.recaps
  ADD CONSTRAINT recaps_mood_check
  CHECK (mood IN ('great', 'good', 'okay', 'low', 'rough'));

-- Add deleted_at column for soft deletes
ALTER TABLE public.recaps
  ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone DEFAULT NULL;

-- Create index for efficient filtering of non-deleted recaps
CREATE INDEX IF NOT EXISTS recaps_deleted_at_idx ON public.recaps(deleted_at);
