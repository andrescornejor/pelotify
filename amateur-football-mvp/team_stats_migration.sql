-- Migration: Enhance Team Features

-- 1. Update teams table with new fields
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS motto TEXT,
ADD COLUMN IF NOT EXISTS founded_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS draws INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goals_for INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goals_against INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

-- 2. Create team_trophies table
CREATE TABLE IF NOT EXISTS public.team_trophies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL, -- 'primera_victoria', 'invicto_10', 'campeon_torneo', etc.
    title TEXT NOT NULL,
    description TEXT,
    awarded_at TIMESTAMPTZ DEFAULT now(),
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL
);

-- 3. Update matches table to include team links
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS team_a_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS team_b_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- 4. Set RLS for team_trophies
ALTER TABLE public.team_trophies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede ver trofeos de equipos" ON public.team_trophies
    FOR SELECT TO authenticated
    USING (true);

-- 5. Trigger/Function to update team stats on match completion (Conceptual)
-- This would be called when a match is marked as completed
CREATE OR REPLACE FUNCTION update_team_stats_on_match_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_completed = true AND OLD.is_completed = false THEN
        -- Check if it's a team match
        IF NEW.team_a_id IS NOT NULL AND NEW.team_b_id IS NOT NULL THEN
            
            -- Update Team A
            UPDATE public.teams SET
                wins = wins + CASE WHEN NEW.team_a_score > NEW.team_b_score THEN 1 ELSE 0 END,
                losses = losses + CASE WHEN NEW.team_a_score < NEW.team_b_score THEN 1 ELSE 0 END,
                draws = draws + CASE WHEN NEW.team_a_score = NEW.team_b_score THEN 1 ELSE 0 END,
                goals_for = goals_for + NEW.team_a_score,
                goals_against = goals_against + NEW.team_b_score,
                xp = xp + 10 -- Base XP for completing match
            WHERE id = NEW.team_a_id;

            -- Update Team B
            UPDATE public.teams SET
                wins = wins + CASE WHEN NEW.team_b_score > NEW.team_a_score THEN 1 ELSE 0 END,
                losses = losses + CASE WHEN NEW.team_b_score < NEW.team_a_score THEN 1 ELSE 0 END,
                draws = draws + CASE WHEN NEW.team_b_score = NEW.team_a_score THEN 1 ELSE 0 END,
                goals_for = goals_for + NEW.team_b_score,
                goals_against = goals_against + NEW.team_a_score,
                xp = xp + 10
            WHERE id = NEW.team_b_id;

            -- XP Bonus for winner
            IF NEW.team_a_score > NEW.team_b_score THEN
                UPDATE public.teams SET xp = xp + 20 WHERE id = NEW.team_a_id;
            ELSIF NEW.team_b_score > NEW.team_a_score THEN
                UPDATE public.teams SET xp = xp + 20 WHERE id = NEW.team_b_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_update_team_stats
    AFTER UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION update_team_stats_on_match_completion();
