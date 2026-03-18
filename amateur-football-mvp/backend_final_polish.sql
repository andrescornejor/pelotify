-- FINAL BACKEND POLISH & GAMIFICATION
-- This script adds RLS for team challenges, auto-leveling for teams, and robust data integrity checks.

-- 1. RLS for team_challenges
ALTER TABLE IF EXISTS public.team_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view challenges" ON public.team_challenges;
CREATE POLICY "Anyone can view challenges" ON public.team_challenges FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Captains can create challenges" ON public.team_challenges;
CREATE POLICY "Captains can create challenges" ON public.team_challenges 
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = challenger_team_id));

DROP POLICY IF EXISTS "Involved captains can update challenges" ON public.team_challenges;
CREATE POLICY "Involved captains can update challenges" ON public.team_challenges 
    FOR UPDATE TO authenticated 
    USING (
        auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = challenger_team_id) OR
        auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = challenged_team_id)
    );

-- 2. Team Auto-Leveling Logic
CREATE OR REPLACE FUNCTION public.calculate_team_level()
RETURNS TRIGGER AS $$
DECLARE
    v_new_level INT;
BEGIN
    -- Level formula: Level = floor(sqrt(xp / 100)) + 1
    -- 0 XP = Level 1
    -- 100 XP = Level 2
    -- 400 XP = Level 3
    -- 900 XP = Level 4
    v_new_level := floor(sqrt(NEW.xp / 100)) + 1;
    
    IF v_new_level > NEW.level THEN
        NEW.level := v_new_level;
        -- Future: Trigger a notification or award a trophy for level up
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_team_leveling ON public.teams;
CREATE TRIGGER tr_team_leveling
    BEFORE UPDATE OF xp ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_team_level();

-- 3. Robust Profile Integrity
-- Ensure no negative ELO/XP
ALTER TABLE public.profiles ADD CONSTRAINT check_positive_elo CHECK (elo >= 0);
ALTER TABLE public.teams ADD CONSTRAINT check_positive_team_elo CHECK (elo >= 0);

-- 4. Match Post-Finalization Cleanup (Conceptual)
-- After a match is finalized, we could close the chat or archive it.
-- For now, let's just ensure we have an index on is_completed for dashboard performance.
CREATE INDEX IF NOT EXISTS idx_matches_completed ON public.matches(is_completed);

-- 5. Trophy Auto-Awarding (First Win)
CREATE OR REPLACE FUNCTION award_first_win_trophy()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.wins = 1 AND OLD.wins = 0 THEN
        INSERT INTO public.team_trophies (team_id, achievement_type, title, description)
        VALUES (NEW.id, 'primera_victoria', 'Bautismo de Gloria', 'Ganaron su primer partido oficial como equipo.');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_first_win_trophy ON public.teams;
CREATE TRIGGER tr_first_win_trophy
    AFTER UPDATE OF wins ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION award_first_win_trophy();
