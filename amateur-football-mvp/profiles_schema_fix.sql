-- Migration to add missing Biometric columns to profiles table
-- Safe script to ensure columns exist before using them in the app

DO $$ 
BEGIN
    -- Add age column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='age') THEN
        ALTER TABLE public.profiles ADD COLUMN age INTEGER DEFAULT 18;
    END IF;

    -- Add height column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='height') THEN
        ALTER TABLE public.profiles ADD COLUMN height INTEGER DEFAULT 170;
    END IF;

    -- Add preferred_foot column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='preferred_foot') THEN
        ALTER TABLE public.profiles ADD COLUMN preferred_foot TEXT DEFAULT 'Derecha';
    END IF;

    -- Ensure updated_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- Ensure name exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='name') THEN
        ALTER TABLE public.profiles ADD COLUMN name TEXT;
    END IF;

    -- Ensure position exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='position') THEN
        ALTER TABLE public.profiles ADD COLUMN position TEXT DEFAULT 'DC';
    END IF;
END $$;

-- Update RLS to ensure users can manage their own profiles
-- This is crucial for the 'upsert' to work
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Ensure public read access (necessary for other players to see stats)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);
