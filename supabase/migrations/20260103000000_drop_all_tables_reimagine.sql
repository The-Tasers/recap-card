-- ============================================================================
-- Migration: Drop All Tables - Reimagine Project
-- Description: Clean slate for local-first usage, auth hidden in settings
-- ============================================================================

-- ============================================================================
-- DROP ALL RLS POLICIES
-- ============================================================================

-- Checkins policies
DROP POLICY IF EXISTS "Users can view own checkins" ON public.checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON public.checkins;
DROP POLICY IF EXISTS "Users can update own checkins" ON public.checkins;
DROP POLICY IF EXISTS "Users can delete own checkins" ON public.checkins;

-- Days policies
DROP POLICY IF EXISTS "Users can view own days" ON public.days;
DROP POLICY IF EXISTS "Users can insert own days" ON public.days;
DROP POLICY IF EXISTS "Users can update own days" ON public.days;
DROP POLICY IF EXISTS "Users can delete own days" ON public.days;

-- People policies
DROP POLICY IF EXISTS "Users can view own and default people" ON public.people;
DROP POLICY IF EXISTS "Users can view own people" ON public.people;
DROP POLICY IF EXISTS "Users can insert own people" ON public.people;
DROP POLICY IF EXISTS "Users can update own people" ON public.people;
DROP POLICY IF EXISTS "Users can delete own people" ON public.people;

-- Contexts policies
DROP POLICY IF EXISTS "Default contexts viewable by everyone" ON public.contexts;
DROP POLICY IF EXISTS "Users can insert own contexts" ON public.contexts;
DROP POLICY IF EXISTS "Users can update own contexts" ON public.contexts;
DROP POLICY IF EXISTS "Users can delete own contexts" ON public.contexts;

-- States policies
DROP POLICY IF EXISTS "States are viewable by everyone" ON public.states;

-- Feedback policies
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;

-- ============================================================================
-- DROP ALL INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_checkins_day_id;
DROP INDEX IF EXISTS public.idx_checkins_user_timestamp;

-- ============================================================================
-- DROP ALL TABLES (in dependency order)
-- ============================================================================

-- Drop checkins first (depends on days, states, contexts, people)
DROP TABLE IF EXISTS public.checkins CASCADE;

-- Drop days (depends on users)
DROP TABLE IF EXISTS public.days CASCADE;

-- Drop people (depends on users)
DROP TABLE IF EXISTS public.people CASCADE;

-- Drop contexts (depends on users)
DROP TABLE IF EXISTS public.contexts CASCADE;

-- Drop states (no dependencies)
DROP TABLE IF EXISTS public.states CASCADE;

-- Drop feedback (depends on users)
DROP TABLE IF EXISTS public.feedback CASCADE;

-- ============================================================================
-- CLEANUP STORAGE
-- ============================================================================

DELETE FROM storage.objects WHERE bucket_id = 'photos';
DELETE FROM storage.buckets WHERE id = 'photos';
