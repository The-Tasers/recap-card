-- Migration: Remove profiles table and update recaps to reference auth.users directly
-- This migration removes the profiles table which is no longer used

-- Step 1: Drop the trigger that creates profiles on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop the function that handles new user creation
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Drop the updated_at trigger on profiles
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;

-- Step 4: Drop policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Step 5: Alter recaps table to reference auth.users directly instead of profiles
-- First, drop the existing foreign key constraint
ALTER TABLE public.recaps DROP CONSTRAINT IF EXISTS recaps_user_id_fkey;

-- Add new foreign key constraint to auth.users
ALTER TABLE public.recaps
  ADD CONSTRAINT recaps_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Step 6: Drop the profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Note: Existing RLS policies on recaps still work because they use auth.uid()
-- which checks against auth.users, not profiles
