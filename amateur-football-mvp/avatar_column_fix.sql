-- FIX FOR MISSING AVATAR_URL AND RLS POLICIES
-- This script ensures the avatar_url column exists and that users can manage their own profiles.

DO $$ 
BEGIN
    -- 1. Add avatar_url column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 2. Cleanup and Recalibrate RLS Policies for Profiles
-- We want a single, robust policy for profile management.

-- Drop existing overlapping policies to avoid conflicts
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;

-- Create the master management policy
-- FOR ALL covers SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "Users can manage their own profile" ON public.profiles 
    FOR ALL 
    TO authenticated 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

-- Ensure public read access for authenticated users (to see other players)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- 3. Grant permissions (just in case)
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;
