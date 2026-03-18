-- MVP Tiebreaker Fix
-- Redefine the finalization function to prioritize goals when MVP votes are tied.

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
    v_is_mvp BOOLEAN;
    v_goals INT;
BEGIN
    -- 1. Get consensus scores
    SELECT team_a_score, team_b_score INTO v_team_a_score, v_team_b_score
    FROM public.match_reports
    WHERE match_id = p_match_id
    GROUP BY team_a_score, team_b_score
    HAVING COUNT(*) >= 2
    LIMIT 1;

    -- Fallback for small matches
    IF v_team_a_score IS NULL THEN
         SELECT team_a_score, team_b_score INTO v_team_a_score, v_team_b_score
         FROM public.match_reports WHERE match_id = p_match_id ORDER BY created_at DESC LIMIT 1;
    END IF;

    IF v_team_a_score IS NULL OR v_team_b_score IS NULL THEN RETURN; END IF;

    -- 2. DETERMINE MVP WITH TIEBREAKER (GOALS)
    WITH vote_tallies AS (
        SELECT voted_player_id, COUNT(*) as vote_count
        FROM public.mvp_votes
        WHERE match_id = p_match_id
        GROUP BY voted_player_id
    ),
    top_voted AS (
        SELECT voted_player_id, vote_count
        FROM vote_tallies
        WHERE vote_count = (SELECT MAX(vote_count) FROM vote_tallies)
    ),
    player_goals AS (
        SELECT reporter_id as player_id, COALESCE(SUM(personal_goals), 0) as goals
        FROM public.match_reports
        WHERE match_id = p_match_id
        GROUP BY reporter_id
    )
    SELECT tv.voted_player_id INTO v_mvp_id
    FROM top_voted tv
    LEFT JOIN player_goals pg ON pg.player_id = tv.voted_player_id
    ORDER BY tv.vote_count DESC, pg.goals DESC, tv.voted_player_id ASC
    LIMIT 1;
    
    -- 3. Update Match
    UPDATE public.matches SET 
        team_a_score = v_team_a_score, 
        team_b_score = v_team_b_score, 
        is_completed = true 
    WHERE id = p_match_id;

    -- 4. Update Players Stats
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

    -- 5. Team Stats
    PERFORM public.update_team_stats_on_match_result(p_match_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
