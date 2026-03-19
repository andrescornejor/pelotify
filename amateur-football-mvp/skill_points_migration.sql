-- SKILL POINTS UPGRADE SYSTEM (PUNTOS DE HABILIDAD)
-- This migration adds a reward for performance that allows upgrading FIFA card stats.

-- 1. Add skill_points column to profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='skill_points') THEN
        ALTER TABLE public.profiles ADD COLUMN skill_points INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Update the Finalize Match function to award Skill Points
CREATE OR REPLACE FUNCTION public.finalize_match_and_sync_stats(p_match_id UUID)
RETURNS VOID AS $$
DECLARE
    v_team_a_score INT;
    v_team_b_score INT;
    v_mvp_id UUID;
    v_goal_scorers JSONB;
    v_participant RECORD;
    v_points_gained INT;
    v_skill_points_gained INT;
    v_is_win BOOLEAN;
    v_is_mvp BOOLEAN;
    v_goals INT;
BEGIN
	-- A. Consensus logic (Basic)
    SELECT team_a_score, team_b_score INTO v_team_a_score, v_team_b_score
    FROM public.match_reports
    WHERE match_id = p_match_id
    GROUP BY team_a_score, team_b_score
    HAVING COUNT(*) >= 2
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
        SELECT mp.user_id, mp.team, p.elo, p.matches_won, p.skill_points, mp.id as participant_id
        FROM public.match_participants mp
        JOIN public.profiles p ON p.id = mp.user_id
        WHERE mp.match_id = p_match_id AND mp.status = 'confirmed' AND (mp.stats_applied IS FALSE OR mp.stats_applied IS NULL)
    LOOP
        -- Determine base performance
        v_is_win := (v_participant.team = 'A' AND v_team_a_score > v_team_b_score) OR (v_participant.team = 'B' AND v_team_b_score > v_team_a_score);
        SELECT COALESCE(SUM(personal_goals), 0) INTO v_goals FROM public.match_reports WHERE match_id = p_match_id AND reporter_id = v_participant.user_id;
        v_is_mvp := (v_participant.user_id = v_mvp_id);
        
        -- Calculate ELO (Standard status)
        v_points_gained := (v_goals * 100);
        IF v_is_mvp THEN v_points_gained := v_points_gained + 200; END IF;
        IF v_is_win AND COALESCE(v_participant.matches_won, 0) = 0 THEN v_points_gained := v_points_gained + 1000; END IF;

        -- !!! NEW: CALCULATE SKILL POINTS (Limited for difficulty) !!!
        v_skill_points_gained := 1; -- +1 point just for playing (experience)
        IF v_is_win THEN v_skill_points_gained := v_skill_points_gained + 1; END IF; -- +1 for winning
        IF v_is_mvp THEN v_skill_points_gained := v_skill_points_gained + 1; END IF; -- +1 for MVP
        IF v_goals > 0 THEN v_skill_points_gained := v_skill_points_gained + 1; END IF; -- +1 for scoring at least once

        -- Update Profile
        UPDATE public.profiles SET 
            elo = COALESCE(elo, 0) + v_points_gained, 
            skill_points = COALESCE(skill_points, 0) + v_skill_points_gained, -- Add our new skill points
            matches = COALESCE(matches, 0) + 1, 
            matches_won = COALESCE(matches_won, 0) + CASE WHEN v_is_win THEN 1 ELSE 0 END,
            goals = COALESCE(goals, 0) + v_goals,
            mvp_count = COALESCE(mvp_count, 0) + CASE WHEN v_is_mvp THEN 1 ELSE 0 END,
            updated_at = now()
        WHERE id = v_participant.user_id;

        -- Prevent double processing
        UPDATE public.match_participants SET stats_applied = TRUE WHERE id = v_participant.participant_id;
    END LOOP;

    -- Call team stats update
    PERFORM public.update_team_stats_on_match_result(p_match_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
