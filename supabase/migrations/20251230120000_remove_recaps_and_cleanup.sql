-- ============================================================================
-- Migration: Remove Legacy Recaps System and Cleanup
-- Description: Drop the legacy recaps table and related objects, finalize check-in system
-- ============================================================================

-- ============================================================================
-- REMOVE LEGACY RECAPS SYSTEM
-- ============================================================================

-- Drop recaps-related policies
DROP POLICY IF EXISTS "Users can view own recaps" ON public.recaps;
DROP POLICY IF EXISTS "Users can view own deleted recaps" ON public.recaps;
DROP POLICY IF EXISTS "Users can insert own recaps" ON public.recaps;
DROP POLICY IF EXISTS "Users can update own recaps" ON public.recaps;
DROP POLICY IF EXISTS "Users can delete own recaps" ON public.recaps;

-- Drop recaps-related triggers
DROP TRIGGER IF EXISTS handle_recaps_updated_at ON public.recaps;

-- Drop recaps-related indexes
DROP INDEX IF EXISTS public.recaps_user_id_idx;
DROP INDEX IF EXISTS public.recaps_created_at_idx;
DROP INDEX IF EXISTS public.recaps_deleted_at_idx;

-- Drop the recaps table
DROP TABLE IF EXISTS public.recaps;

-- ============================================================================
-- CLEANUP STORAGE BUCKET (if used for recap photos only)
-- ============================================================================
-- Note: Keep the photos bucket in case it's used for other purposes
-- If you want to remove it, uncomment the following:
DELETE FROM storage.objects WHERE bucket_id = 'photos';
DELETE FROM storage.buckets WHERE id = 'photos';

-- ============================================================================
-- UPDATE STATES TABLE FOR NEUTRAL CATEGORY
-- ============================================================================

-- Ensure the category constraint includes 'neutral'
ALTER TABLE public.states
  DROP CONSTRAINT IF EXISTS states_category_check;

ALTER TABLE public.states
  ADD CONSTRAINT states_category_check
  CHECK (category IN ('energy', 'emotion', 'tension', 'neutral'));

-- ============================================================================
-- UPDATE PEOPLE TABLE FOR DEFAULT PEOPLE SUPPORT
-- ============================================================================

-- Make user_id nullable for default people
ALTER TABLE public.people
  ALTER COLUMN user_id DROP NOT NULL;

-- Add is_default column if it doesn't exist
ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- Update RLS policies for people to include default people visibility
DROP POLICY IF EXISTS "Users can view own people" ON public.people;
DROP POLICY IF EXISTS "Users can view own and default people" ON public.people;

CREATE POLICY "Users can view own and default people" ON public.people
  FOR SELECT USING (is_default = true OR auth.uid() = user_id);

-- Keep existing insert/update/delete policies for non-default people
DROP POLICY IF EXISTS "Users can insert own people" ON public.people;
CREATE POLICY "Users can insert own people" ON public.people
  FOR INSERT WITH CHECK (auth.uid() = user_id AND (is_default = false OR is_default IS NULL));

DROP POLICY IF EXISTS "Users can update own people" ON public.people;
CREATE POLICY "Users can update own people" ON public.people
  FOR UPDATE USING (auth.uid() = user_id AND (is_default = false OR is_default IS NULL));

DROP POLICY IF EXISTS "Users can delete own people" ON public.people;
CREATE POLICY "Users can delete own people" ON public.people
  FOR DELETE USING (auth.uid() = user_id AND (is_default = false OR is_default IS NULL));

-- ============================================================================
-- INSERT DEFAULT STATES (ensure neutral exists)
-- ============================================================================

INSERT INTO public.states (id, label, category, is_default) VALUES
  ('neutral', 'Neutral', 'neutral', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- INSERT DEFAULT PEOPLE
-- ============================================================================

INSERT INTO public.people (id, label, is_default) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Partner', true),
  ('00000000-0000-0000-0000-000000000002', 'Family', true),
  ('00000000-0000-0000-0000-000000000003', 'Friends', true),
  ('00000000-0000-0000-0000-000000000004', 'Colleagues', true)
ON CONFLICT (id) DO NOTHING;
