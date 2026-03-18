-- GOOGLE ACCOUNTS STATS FIX
-- Ensuring all profile statistics columns exist and are initialized for ALL users (Google & Email)

DO $$ 
BEGIN
    -- 1. Ensure all stats columns exist in profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='elo') THEN
        ALTER TABLE public.profiles ADD COLUMN elo INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='matches') THEN
        ALTER TABLE public.profiles ADD COLUMN matches INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='matches_won') THEN
        ALTER TABLE public.profiles ADD COLUMN matches_won INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='goals') THEN
        ALTER TABLE public.profiles ADD COLUMN goals INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='mvp_count') THEN
        ALTER TABLE public.profiles ADD COLUMN mvp_count INTEGER DEFAULT 0;
    END IF;

    -- 2. Initialize NULL values to 0 for existing records
    -- This is crucial for Google accounts that might already exist but have NULLs
    UPDATE public.profiles SET elo = 0 WHERE elo IS NULL;
    UPDATE public.profiles SET matches = 0 WHERE matches IS NULL;
    UPDATE public.profiles SET matches_won = 0 WHERE matches_won IS NULL;
    UPDATE public.profiles SET goals = 0 WHERE goals IS NULL;
    UPDATE public.profiles SET mvp_count = 0 WHERE mvp_count IS NULL;

    -- 3. Ensure 'stats_applied' exists in match_participants
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='match_participants' AND column_name='stats_applied') THEN
        ALTER TABLE public.match_participants ADD COLUMN stats_applied BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 4. Improved Function to handle cases where profiles might be missing during sync
-- Using LEFT JOIN and handling missing profiles gracefully
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
    -- Get consensus scores
    SELECT team_a_score, team_b_score INTO v_team_a_score, v_team_b_score
    FROM (
        SELECT team_a_score, team_b_score, team, created_at,
               ROW_NUMBER() OVER(PARTITION BY team ORDER BY created_at DESC) as rn
        FROM public.match_reports
        WHERE match_id = p_match_id
    ) reports
    WHERE rn = 1 AND team IN ('A', 'B')
    ORDER BY created_at DESC 
    LIMIT 1;

    IF v_team_a_score IS NULL OR v_team_b_score IS NULL THEN
        RETURN;
    END IF;

    -- Determine MVP
    SELECT voted_player_id INTO v_mvp_id
    FROM public.mvp_votes
    WHERE match_id = p_match_id
    GROUP BY voted_player_id
    ORDER BY COUNT(*) DESC, MAX(created_at) ASC
    LIMIT 1;

    -- Update Match header
    UPDATE public.matches
    SET 
        team_a_score = v_team_a_score,
        team_b_score = v_team_b_score,
        is_completed = true,
        updated_at = now()
    WHERE id = p_match_id;

    -- Sync stats for confirmed participants
    FOR v_participant IN 
        SELECT mp.user_id, mp.team, mp.id as participant_id
        FROM public.match_participants mp
        WHERE mp.match_id = p_match_id 
          AND mp.status = 'confirmed' 
          AND (mp.stats_applied IS FALSE OR mp.stats_applied IS NULL)
    LOOP
        -- Safety check: Ensure profile exists before updating (for old Google users)
        INSERT INTO public.profiles (id, name, elo, matches, matches_won, goals, mvp_count)
        SELECT v_participant.user_id, 'Jugador', 0, 0, 0, 0, 0
        WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_participant.user_id);

        -- Determine result
        v_is_win := (v_participant.team = 'A' AND v_team_a_score > v_team_b_score) OR 
                    (v_participant.team = 'B' AND v_team_b_score > v_team_a_score);
        
        -- Get goals
        SELECT COALESCE(personal_goals, 0) INTO v_goals
        FROM public.match_reports
        WHERE match_id = p_match_id AND reporter_id = v_participant.user_id
        LIMIT 1;

        v_is_mvp := (v_participant.user_id = v_mvp_id);
        
        -- Points system
        v_points_gained := (COALESCE(v_goals, 0) * 100); 
        IF v_is_mvp THEN v_points_gained := v_points_gained + 200; END IF;
        
        -- Apply stats
        UPDATE public.profiles
        SET 
            elo = COALESCE(elo, 0) + v_points_gained,
            matches = COALESCE(matches, 0) + 1,
            matches_won = COALESCE(matches_won, 0) + CASE WHEN v_is_win THEN 1 ELSE 0 END,
            goals = COALESCE(goals, 0) + COALESCE(v_goals, 0),
            mvp_count = COALESCE(mvp_count, 0) + CASE WHEN v_is_mvp THEN 1 ELSE 0 END,
            updated_at = now()
        WHERE id = v_participant.user_id;

        UPDATE public.match_participants
        SET stats_applied = TRUE
        WHERE id = v_participant.participant_id;
    END LOOP;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
