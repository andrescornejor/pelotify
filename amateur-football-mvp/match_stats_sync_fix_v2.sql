-- Final Match Scoring and Stats Sync Fix (v2)
-- This script fixes the NULL issues, improves idempotency, and ensures all stats are synchronized.

-- 1. Ensure columns are consistent and not null where possible
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_reports' AND column_name='score_a') THEN
        ALTER TABLE public.match_reports RENAME COLUMN score_a TO team_a_score;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_reports' AND column_name='score_b') THEN
        ALTER TABLE public.match_reports RENAME COLUMN score_b TO team_b_score;
    END IF;
END $$;

-- Add a flag to track if stats have been applied to avoid double counting
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_participants' AND column_name='stats_applied') THEN
        ALTER TABLE public.match_participants ADD COLUMN stats_applied BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Enhanced function to finalize match and update stats
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
    -- A. Get consensus scores (latest report from Team A and Team B)
    SELECT team_a_score, team_b_score INTO v_team_a_score, v_team_b_score
    FROM (
        SELECT team_a_score, team_b_score, team, created_at,
               ROW_NUMBER() OVER(PARTITION BY team ORDER BY created_at DESC) as rn
        FROM public.match_reports
        WHERE match_id = p_match_id
    ) reports
    WHERE rn = 1 AND team IN ('A', 'B')
    ORDER BY created_at DESC -- Takes values from whoever resolved the consensus
    LIMIT 1;

    -- If scores are still missing, we can't finalize
    IF v_team_a_score IS NULL OR v_team_b_score IS NULL THEN
        RETURN;
    END IF;

    -- B. Determine MVP (player with most votes)
    SELECT voted_player_id INTO v_mvp_id
    FROM public.mvp_votes
    WHERE match_id = p_match_id
    GROUP BY voted_player_id
    ORDER BY COUNT(*) DESC, MAX(created_at) ASC -- Earliest if tied
    LIMIT 1;

    -- C. Aggregate goal scorers for the match display
    SELECT jsonb_agg(goals_data) INTO v_goal_scorers
    FROM (
        SELECT 
            reporter_id as id,
            personal_goals as goals,
            team,
            (SELECT COALESCE(name, 'Jugador') FROM profiles WHERE id = reporter_id) as name
        FROM public.match_reports
        WHERE match_id = p_match_id AND personal_goals > 0
    ) goals_data;

    -- D. Update Match status
    UPDATE public.matches
    SET 
        team_a_score = v_team_a_score,
        team_b_score = v_team_b_score,
        goal_scorers = COALESCE(v_goal_scorers, '[]'::jsonb),
        is_completed = true
    WHERE id = p_match_id;

    -- E. Update Stats for ALL participants who haven't been processed yet
    FOR v_participant IN 
        SELECT mp.user_id, mp.team, p.elo, p.matches_won, p.matches, mp.id as participant_id
        FROM public.match_participants mp
        JOIN public.profiles p ON p.id = mp.user_id
        WHERE mp.match_id = p_match_id 
          AND mp.status = 'confirmed' 
          AND (mp.stats_applied IS FALSE OR mp.stats_applied IS NULL)
    LOOP
        -- Determine result for this player
        v_is_win := (v_participant.team = 'A' AND v_team_a_score > v_team_b_score) OR 
                    (v_participant.team = 'B' AND v_team_b_score > v_team_a_score);
        
        -- Get goals reported by THIS specific player
        SELECT COALESCE(personal_goals, 0) INTO v_goals
        FROM public.match_reports
        WHERE match_id = p_match_id AND reporter_id = v_participant.user_id
        LIMIT 1;

        v_is_mvp := (v_participant.user_id = v_mvp_id);
        
        -- Safe check for first win
        v_is_first_win := (v_is_win AND COALESCE(v_participant.matches_won, 0) = 0);

        -- Calculate Points (ELO)
        v_points_gained := (COALESCE(v_goals, 0) * 100); -- POINTS_PER_GOAL
        IF v_is_mvp THEN v_points_gained := v_points_gained + 200; END IF; -- POINTS_PER_MVP
        IF v_is_first_win THEN v_points_gained := v_points_gained + 1000; END IF; -- FIRST_WIN_BONUS

        -- Apply updates to profile with NULL safety (COALESCE)
        UPDATE public.profiles
        SET 
            elo = COALESCE(elo, 0) + v_points_gained,
            matches = COALESCE(matches, 0) + 1,
            matches_won = COALESCE(matches_won, 0) + CASE WHEN v_is_win THEN 1 ELSE 0 END,
            goals = COALESCE(goals, 0) + v_goals,
            mvp_count = COALESCE(mvp_count, 0) + CASE WHEN v_is_mvp THEN 1 ELSE 0 END,
            updated_at = now()
        WHERE id = v_participant.user_id;

        -- Mark as processed to prevent double registration if function is called again
        UPDATE public.match_participants
        SET stats_applied = TRUE
        WHERE id = v_participant.participant_id;
    END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
