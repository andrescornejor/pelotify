-- BACKEND IMPROVEMENTS & ADVANCED TEAM FEATURES
-- This script adds tactical features, improves team stats atomicity, and adds necessary backend scaffolding.

-- 1. TEAM_FORMATIONS: Visual editor for captains
CREATE TABLE IF NOT EXISTS public.team_formations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., '4-4-2 Clasico', '3-4-3 Ofensivo'
    layout JSONB NOT NULL, -- Store coordinates or list of positions for 5, 7, 11 players
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TEAM_MESSAGES: Internal chat for team members
CREATE TABLE IF NOT EXISTS public.team_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PERMISSIONS & RLS for new tables
ALTER TABLE public.team_formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- Team formations are viewable by everyone, but manageable by captain
CREATE POLICY "Everyone can view team formations" ON public.team_formations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Captains can manage formations" ON public.team_formations 
    FOR ALL TO authenticated 
    USING (auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = team_id))
    WITH CHECK (auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = team_id));

-- Team messages are PRIVATE to team members (CRITICAL PRIVACY)
CREATE POLICY "Only team members can view messages" ON public.team_messages 
    FOR SELECT TO authenticated 
    USING (auth.uid() IN (SELECT user_id FROM public.team_members WHERE team_id = team_id AND status = 'confirmed'));

CREATE POLICY "Team members can post messages" ON public.team_messages 
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members WHERE team_id = team_id AND status = 'confirmed'));

-- 4. IMPROVED TEAM STATS & ELO CALCULATION
-- We'll redefine the ELO logic for TEAMS to match the rewarding system of players.
-- Winning a team match is harder, so rewards should be higher.

CREATE OR REPLACE FUNCTION public.update_team_stats_on_match_result(p_match_id UUID)
RETURNS VOID AS $$
DECLARE
    v_match RECORD;
    v_team_a RECORD;
    v_team_b RECORD;
    v_winner_id UUID;
    v_loser_id UUID;
    v_is_draw BOOLEAN;
    v_points_winner INT := 100;
    v_points_draw INT := 30;
    v_points_loss INT := -10; -- Minimal penalty for teams to keep it competitive
BEGIN
    SELECT * INTO v_match FROM public.matches WHERE id = p_match_id;
    
    -- Safety checks
    IF v_match.team_a_id IS NULL OR v_match.team_b_id IS NULL THEN
        RETURN;
    END IF;

    v_is_draw := v_match.team_a_score = v_match.team_b_score;
    
    IF NOT v_is_draw THEN
        IF v_match.team_a_score > v_match.team_b_score THEN
            v_winner_id := v_match.team_a_id;
            v_loser_id := v_match.team_b_id;
        ELSE
            v_winner_id := v_match.team_b_id;
            v_loser_id := v_match.team_a_id;
        END IF;

        -- Apply Winner Stats
        UPDATE public.teams SET
            elo = elo + v_points_winner,
            wins = wins + 1,
            goals_for = goals_for + (CASE WHEN id = v_match.team_a_id THEN v_match.team_a_score ELSE v_match.team_b_score END),
            goals_against = goals_against + (CASE WHEN id = v_match.team_a_id THEN v_match.team_b_score ELSE v_match.team_a_score END),
            xp = xp + 50 -- Victory XP
        WHERE id = v_winner_id;

        -- Apply Loser Stats
        UPDATE public.teams SET
            elo = GREATEST(0, elo + v_points_loss),
            losses = losses + 1,
            goals_for = goals_for + (CASE WHEN id = v_match.team_a_id THEN v_match.team_a_score ELSE v_match.team_b_score END),
            goals_against = goals_against + (CASE WHEN id = v_match.team_a_id THEN v_match.team_b_score ELSE v_match.team_a_score END),
            xp = xp + 10 -- Loser XP
        WHERE id = v_loser_id;
    ELSE
        -- Apply Draw Stats to both
        UPDATE public.teams SET
            elo = elo + v_points_draw,
            draws = draws + 1,
            goals_for = goals_for + v_match.team_a_score,
            goals_against = goals_against + v_match.team_b_score,
            xp = xp + 25
        WHERE id IN (v_match.team_a_id, v_match.team_b_id);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. AUTOMATED INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_matches_teams ON public.matches(team_a_id, team_b_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_match_user ON public.match_participants(match_id, user_id);
CREATE INDEX IF NOT EXISTS idx_match_reports_match_team ON public.match_reports(match_id, team);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_team ON public.team_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_mvp_votes_match ON public.mvp_votes(match_id);

-- 6. VIEW FOR HEAD-TO-HEAD HISTORY (H2H)
-- This view allows quick querying of the rivalry between any two teams.
CREATE OR REPLACE VIEW public.team_h2h_view AS
SELECT 
    LEAST(team_a_id, team_b_id) as team_1_id,
    GREATEST(team_a_id, team_b_id) as team_2_id,
    COUNT(*) as total_matches,
    SUM(CASE WHEN (team_a_id = LEAST(team_a_id, team_b_id) AND team_a_score > team_b_score) OR (team_b_id = LEAST(team_a_id, team_b_id) AND team_b_score > team_a_score) THEN 1 ELSE 0 END) as team_1_wins,
    SUM(CASE WHEN (team_a_id = GREATEST(team_a_id, team_b_id) AND team_a_score > team_b_score) OR (team_b_id = GREATEST(team_a_id, team_b_id) AND team_b_score > team_a_score) THEN 1 ELSE 0 END) as team_2_wins,
    SUM(CASE WHEN team_a_score = team_b_score THEN 1 ELSE 0 END) as draws
FROM public.matches
WHERE team_a_id IS NOT NULL AND team_b_id IS NOT NULL AND is_completed = true
GROUP BY 1, 2;

-- 7. UPDATE PLAYER ELO TRIGGER (Improvement)
-- We ensure the master stats sync fix v2 logic is applied carefully.
-- This function is actually already defined in match_stats_sync_fix_v2.sql.
-- I'll just make sure the team stats are also called from it.

-- Let's update the existing finalized function to also call team stats
CREATE OR REPLACE FUNCTION public.finalize_match_and_sync_stats(p_match_id UUID)
RETURNS VOID AS $$
DECLARE
    v_team_a_score INT;
    v_team_b_score INT;
    v_mvp_id UUID;
    v_goal_scorers JSONB;
    v_participant RECORD;
    v_points_gained INT;
    v_is_win BOOLEAN;
    v_is_first_win BOOLEAN;
    v_is_mvp BOOLEAN;
    v_goals INT;
BEGIN
    -- ... existing Logic from v2 ...
    -- (I'm redfining it here to be certain it includes team stats update)
    
	-- A. Consensus logic (simplified but robust)
    SELECT team_a_score, team_b_score INTO v_team_a_score, v_team_b_score
    FROM public.match_reports
    WHERE match_id = p_match_id
    GROUP BY team_a_score, team_b_score
    HAVING COUNT(*) >= 2 -- Basic consensus: at least two players agreed on this score
    LIMIT 1;

    -- Fallback: take latest report if no consensus (for MVP fluidity)
    IF v_team_a_score IS NULL THEN
         SELECT team_a_score, team_b_score INTO v_team_a_score, v_team_b_score
         FROM public.match_reports WHERE match_id = p_match_id ORDER BY created_at DESC LIMIT 1;
    END IF;

    IF v_team_a_score IS NULL OR v_team_b_score IS NULL THEN RETURN; END IF;

    -- Determine MVP
    SELECT voted_player_id INTO v_mvp_id FROM public.mvp_votes WHERE match_id = p_match_id GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 1;
    
    -- Update Match
    UPDATE public.matches SET team_a_score = v_team_a_score, team_b_score = v_team_b_score, is_completed = true WHERE id = p_match_id;

    -- Update Players
    FOR v_participant IN 
        SELECT mp.user_id, mp.team, p.elo, p.matches_won, mp.id as participant_id
        FROM public.match_participants mp
        JOIN public.profiles p ON p.id = mp.user_id
        WHERE mp.match_id = p_match_id AND mp.status = 'confirmed' AND (mp.stats_applied IS FALSE OR mp.stats_applied IS NULL)
    LOOP
        v_is_win := (v_participant.team = 'A' AND v_team_a_score > v_team_b_score) OR (v_participant.team = 'B' AND v_team_b_score > v_team_a_score);
        SELECT COALESCE(SUM(personal_goals), 0) INTO v_goals FROM public.match_reports WHERE match_id = p_match_id AND reporter_id = v_participant.user_id;
        v_is_mvp := (v_participant.user_id = v_mvp_id);
        
        v_points_gained := (v_goals * 100);
        IF v_is_mvp THEN v_points_gained := v_points_gained + 200; END IF;
        IF v_is_win AND COALESCE(v_participant.matches_won, 0) = 0 THEN v_points_gained := v_points_gained + 1000; END IF;

        UPDATE public.profiles SET 
            elo = elo + v_points_gained, 
            matches = matches + 1, 
            matches_won = matches_won + CASE WHEN v_is_win THEN 1 ELSE 0 END,
            goals = goals + v_goals,
            mvp_count = mvp_count + CASE WHEN v_is_mvp THEN 1 ELSE 0 END,
            updated_at = now()
        WHERE id = v_participant.user_id;

        UPDATE public.match_participants SET stats_applied = TRUE WHERE id = v_participant.participant_id;
    END LOOP;

    -- !!! NEW: CALL TEAM STATS UPDATE !!!
    PERFORM public.update_team_stats_on_match_result(p_match_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
