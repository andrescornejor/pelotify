-- TOURNAMENTS & CUPS SCHEMA (IDEMPOTENT VERSION)
-- This script adds/updates the necessary tables for organizing and managing tournaments.

-- 1. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    banner_url TEXT,
    start_date DATE,
    end_date DATE,
    location TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    type TEXT CHECK (type IN ('F5', 'F7', 'F11')),
    max_teams INTEGER DEFAULT 8,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    prize_description TEXT,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    creator_id UUID REFERENCES public.profiles(id),
    is_private BOOLEAN DEFAULT false,
    is_official BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure is_official column exists if table was created previously
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tournaments' AND COLUMN_NAME = 'is_official') THEN
        ALTER TABLE public.tournaments ADD COLUMN is_official BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. TOURNAMENT_TEAMS (Junction Table)
CREATE TABLE IF NOT EXISTS public.tournament_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tournament_id, team_id)
);

-- 3. TOURNAMENT_MATCHES (Extends standard matches with tournament context)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'matches' AND COLUMN_NAME = 'tournament_id') THEN
        ALTER TABLE public.matches ADD COLUMN tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'matches' AND COLUMN_NAME = 'tournament_round') THEN
        ALTER TABLE public.matches ADD COLUMN tournament_round TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'matches' AND COLUMN_NAME = 'tournament_match_number') THEN
        ALTER TABLE public.matches ADD COLUMN tournament_match_number INTEGER;
    END IF;
END $$;

-- 4. RLS POLICIES
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies before recreating
DROP POLICY IF EXISTS "Anyone can view public tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Creators can manage tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Anyone can view tournament teams" ON public.tournament_teams;
DROP POLICY IF EXISTS "Team captains can register for tournaments" ON public.tournament_teams;

-- Create Policies
CREATE POLICY "Anyone can view public tournaments" 
    ON public.tournaments FOR SELECT 
    USING (is_private = false OR auth.uid() = creator_id);

CREATE POLICY "Creators can manage tournaments" 
    ON public.tournaments FOR ALL 
    TO authenticated 
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Anyone can view tournament teams" 
    ON public.tournament_teams FOR SELECT 
    USING (true);

CREATE POLICY "Team captains can register for tournaments" 
    ON public.tournament_teams FOR INSERT 
    TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_id AND captain_id = auth.uid()
        )
    );

-- 5. FUNCTION TO REGISTER A TEAM (with safety checks)
CREATE OR REPLACE FUNCTION public.register_team_for_tournament(p_tournament_id UUID, p_team_id UUID)
RETURNS VOID AS $$
DECLARE
    v_count INTEGER;
    v_max INTEGER;
BEGIN
    -- Check if tournament is full
    SELECT max_teams INTO v_max FROM public.tournaments WHERE id = p_tournament_id;
    SELECT COUNT(*) INTO v_count FROM public.tournament_teams WHERE tournament_id = p_tournament_id AND status = 'approved';
    
    IF v_count >= v_max THEN
        RAISE EXCEPTION 'Tournament is full';
    END IF;
    
    INSERT INTO public.tournament_teams (tournament_id, team_id, status)
    VALUES (
        p_tournament_id, 
        p_team_id, 
        CASE 
            WHEN EXISTS (SELECT 1 FROM public.tournaments WHERE id = p_tournament_id AND creator_id = auth.uid()) 
            THEN 'approved' 
            ELSE 'pending' 
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. SAMPLE SEED DATA
-- (No default seed data for production)
