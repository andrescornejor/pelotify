-- Final Match Scoring and Stats Sync Fix
-- This script ensures that when a match is completed, all participants get their stats updated (not just the reporters)
-- and standardizes the columns once and for all.

-- 1. Ensure columns are consistent in match_reports
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_reports' AND column_name='score_a') THEN
        ALTER TABLE public.match_reports RENAME COLUMN score_a TO team_a_score;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_reports' AND column_name='score_b') THEN
        ALTER TABLE public.match_reports RENAME COLUMN score_b TO team_b_score;
    END IF;
END $$;

-- 2. Function to finalize match and update ALL participants
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
    -- A. Get consensus scores (most recent report from each team should match)
    -- For simplicity, we'll take the average or the most reported one. 
    -- Here we take the latest report's values (assuming consensus logic in app is solid)
    SELECT team_a_score, team_b_score INTO v_team_a_score, v_team_b_score
    FROM public.match_reports
    WHERE match_id = p_match_id
    ORDER BY created_at DESC
    LIMIT 1;

    -- B. Aggregate goal scorers
    SELECT jsonb_agg(goals_data) INTO v_goal_scorers
    FROM (
        SELECT 
            reporter_id as id,
            personal_goals as goals,
            team,
            (SELECT name FROM profiles WHERE id = reporter_id) as name
        FROM public.match_reports
        WHERE match_id = p_match_id AND personal_goals > 0
    ) goals_data;

    -- C. Determine MVP (player with most votes)
    SELECT voted_player_id INTO v_mvp_id
    FROM public.mvp_votes
    WHERE match_id = p_match_id
    GROUP BY voted_player_id
    ORDER BY COUNT(*) DESC
    LIMIT 1;

    -- D. Update Match status
    UPDATE public.matches
    SET 
        team_a_score = v_team_a_score,
        team_b_score = v_team_b_score,
        goal_scorers = COALESCE(v_goal_scorers, '[]'::jsonb),
        is_completed = true
    WHERE id = p_match_id;

    -- E. Update Stats for ALL participants
    FOR v_participant IN 
        SELECT mp.user_id, mp.team, p.elo, p.matches_won, p.matches
        FROM public.match_participants mp
        JOIN public.profiles p ON p.id = mp.user_id
        WHERE mp.match_id = p_match_id AND mp.status = 'confirmed'
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
        v_is_first_win := (v_is_win AND v_participant.matches_won = 0);

        -- Calculate Points (JS: calculateMatchPoints logic)
        v_points_gained := (v_goals * 100); -- POINTS_PER_GOAL
        IF v_is_mvp THEN v_points_gained := v_points_gained + 200; END IF; -- POINTS_PER_MVP
        IF v_is_first_win THEN v_points_gained := v_points_gained + 1000; END IF; -- FIRST_WIN_BONUS

        -- Apply updates to profile
        UPDATE public.profiles
        SET 
            elo = elo + v_points_gained,
            matches = matches + 1,
            matches_won = matches_won + CASE WHEN v_is_win THEN 1 ELSE 0 END,
            goals = goals + v_goals,
            mvp_count = mvp_count + CASE WHEN v_is_mvp THEN 1 ELSE 0 END,
            updated_at = now()
        WHERE id = v_participant.user_id;

        -- Optionally update Auth Metadata too? 
        -- In Supabase, if we want Auth metadata synchronized, we usually use a trigger or 
        -- update it from the frontend. Since we use profiles table for display, we prioritizing that.
    END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
