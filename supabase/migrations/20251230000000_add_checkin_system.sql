-- ============================================================================
-- Migration: Add Check-in Reflection System
-- Description: New tables for the check-in/reflection flow
-- ============================================================================

-- ============================================================================
-- States table (controlled vocabulary - system-wide)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.states (
  id text PRIMARY KEY,
  label text NOT NULL,
  category text NOT NULL CHECK (category IN ('energy', 'emotion', 'tension')),
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default states
INSERT INTO public.states (id, label, category, is_default) VALUES
  -- Energy states
  ('energized', 'Energized', 'energy', true),
  ('calm', 'Calm', 'energy', true),
  ('tired', 'Tired', 'energy', true),
  ('drained', 'Drained', 'energy', true),
  -- Emotion states
  ('content', 'Content', 'emotion', true),
  ('anxious', 'Anxious', 'emotion', true),
  ('frustrated', 'Frustrated', 'emotion', true),
  ('grateful', 'Grateful', 'emotion', true),
  ('uncertain', 'Uncertain', 'emotion', true),
  -- Tension/focus states
  ('focused', 'Focused', 'tension', true),
  ('scattered', 'Scattered', 'tension', true),
  ('present', 'Present', 'tension', true),
  ('distracted', 'Distracted', 'tension', true)
ON CONFLICT (id) DO NOTHING;

-- States RLS: readable by all (public vocabulary)
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "States are viewable by everyone" ON public.states
  FOR SELECT USING (true);

-- ============================================================================
-- Contexts table (defaults + user custom)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contexts (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default contexts (user_id NULL = system defaults)
INSERT INTO public.contexts (id, label, is_default) VALUES
  ('work', 'Work', true),
  ('home', 'Home', true),
  ('commute', 'Commute', true),
  ('social', 'Social', true),
  ('alone', 'Alone time', true),
  ('exercise', 'Exercise', true),
  ('errands', 'Errands', true),
  ('rest', 'Rest', true)
ON CONFLICT (id) DO NOTHING;

-- Contexts RLS
ALTER TABLE public.contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Default contexts viewable by everyone" ON public.contexts
  FOR SELECT USING (is_default = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own contexts" ON public.contexts
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_default = false);
CREATE POLICY "Users can update own contexts" ON public.contexts
  FOR UPDATE USING (auth.uid() = user_id AND is_default = false);
CREATE POLICY "Users can delete own contexts" ON public.contexts
  FOR DELETE USING (auth.uid() = user_id AND is_default = false);

-- ============================================================================
-- People table (user-specific)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- People RLS
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own people" ON public.people
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own people" ON public.people
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own people" ON public.people
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own people" ON public.people
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Days table (one per calendar day per user)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  morning_expectation_tone text CHECK (morning_expectation_tone IN
    ('calm', 'excited', 'anxious', 'uncertain', 'energized', 'heavy')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Days RLS
ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own days" ON public.days
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own days" ON public.days
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own days" ON public.days
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own days" ON public.days
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Check-ins table (multiple per day)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_id uuid NOT NULL REFERENCES public.days(id) ON DELETE CASCADE,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  state_id text NOT NULL REFERENCES public.states(id),
  context_id text NOT NULL,
  person_id uuid REFERENCES public.people(id) ON DELETE SET NULL,
  note text CHECK (char_length(note) <= 200),
  created_at timestamp with time zone DEFAULT now()
);

-- Check-ins RLS
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own checkins" ON public.checkins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkins" ON public.checkins
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checkins" ON public.checkins
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster day lookups
CREATE INDEX IF NOT EXISTS idx_checkins_day_id ON public.checkins(day_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user_timestamp ON public.checkins(user_id, timestamp DESC);

-- NOTE: No insights table - all summaries are computed dynamically from check-ins
