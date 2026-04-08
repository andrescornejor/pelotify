-- Migration: Add 'handle' column to profiles table for custom @ usernames
-- Run this in Supabase SQL Editor

-- 1. Add the handle column (nullable, unique)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS handle text UNIQUE;

-- 2. Create a partial unique index (only for non-null handles) for safety
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_handle_unique
ON public.profiles (handle)
WHERE handle IS NOT NULL;

-- 3. Allow reading handle for everyone (it's public info)
-- The existing RLS policies on profiles should already cover SELECT for all users.
-- No additional policy changes needed since handle is just another column on profiles.
