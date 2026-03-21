-- RESTORE SKILL POINTS LOGIC
-- Este script actualiza la función de finalización de partidos para asegurarse 
-- de que los Jugadores ganen "Puntos de Habilidad" (skill_points) al jugar y ganar,
-- integrando todas las actualizaciones recientes de penalizaciones y ganancias de ELO.

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
    v_is_draw BOOLEAN;
    v_is_first_win BOOLEAN;
    v_is_mvp BOOLEAN;
    v_goals INT;
    
    -- ELO constants
    constant_points_per_goal INT := 100;
    constant_points_per_mvp INT := 200;
    constant_first_win_bonus INT := 1000;
    constant_win_bonus INT := 150;
    constant_draw_bonus INT := 50;
    constant_loss_penalty INT := -150;
BEGIN
    -- 1. Get consensus scores
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

    -- Fallback consensus logic
    IF v_team_a_score IS NULL THEN
         SELECT team_a_score, team_b_score INTO v_team_a_score, v_team_b_score
         FROM public.match_reports WHERE match_id = p_match_id ORDER BY created_at DESC LIMIT 1;
    END IF;

    IF v_team_a_score IS NULL OR v_team_b_score IS NULL THEN RETURN; END IF;

    -- 2. Determine MVP
    SELECT voted_player_id INTO v_mvp_id 
    FROM public.mvp_votes 
    WHERE match_id = p_match_id 
    GROUP BY 1 
    ORDER BY COUNT(*) DESC, MAX(created_at) ASC 
    LIMIT 1;
    
    -- 3. Update Match
    UPDATE public.matches 
    SET team_a_score = v_team_a_score, team_b_score = v_team_b_score, is_completed = true 
    WHERE id = p_match_id;

    -- 4. Update Players
    FOR v_participant IN 
        SELECT mp.user_id, mp.team, p.elo, p.matches_won, p.skill_points, mp.id as participant_id
        FROM public.match_participants mp
        JOIN public.profiles p ON p.id = mp.user_id
        WHERE mp.match_id = p_match_id AND mp.status = 'confirmed' AND (mp.stats_applied IS FALSE OR mp.stats_applied IS NULL)
    LOOP
        v_is_win := (v_participant.team = 'A' AND v_team_a_score > v_team_b_score) OR (v_participant.team = 'B' AND v_team_b_score > v_team_a_score);
        v_is_draw := (v_team_a_score = v_team_b_score);
        
        -- Get goals from report
        SELECT COALESCE(SUM(personal_goals), 0) INTO v_goals FROM public.match_reports WHERE match_id = p_match_id AND reporter_id = v_participant.user_id;
        
        v_is_mvp := (v_participant.user_id = v_mvp_id);
        
        -- Calculate Points
        v_points_gained := (v_goals * constant_points_per_goal);
        
        IF v_is_mvp THEN 
            v_points_gained := v_points_gained + constant_points_per_mvp; 
        END IF;

        -- Result based points
        IF v_is_win THEN
            IF COALESCE(v_participant.matches_won, 0) = 0 THEN
                v_points_gained := v_points_gained + constant_first_win_bonus;
            ELSE
                v_points_gained := v_points_gained + constant_win_bonus;
            END IF;
        ELSIF v_is_draw THEN
            v_points_gained := v_points_gained + constant_draw_bonus;
        ELSE
            -- Penalty for loss
            v_points_gained := v_points_gained + constant_loss_penalty;
        END IF;

        -- CALCULATE SKILL POINTS (PUNTOS DE HABILIDAD)
        v_skill_points_gained := 1; -- +1 point just for playing (experience)
        IF v_is_win THEN v_skill_points_gained := v_skill_points_gained + 1; END IF; -- +1 for winning
        IF v_is_mvp THEN v_skill_points_gained := v_skill_points_gained + 1; END IF; -- +1 for MVP
        IF v_goals > 0 THEN v_skill_points_gained := v_skill_points_gained + 1; END IF; -- +1 for scoring at least once

        -- Apply updates to profile (with floor logic to prevent negative total elo handled by GREATEST)
        UPDATE public.profiles SET 
            elo = GREATEST(0, COALESCE(elo, 0) + v_points_gained), 
            skill_points = COALESCE(skill_points, 0) + v_skill_points_gained, -- Añadimos el componente que faltaba
            matches = COALESCE(matches, 0) + 1, 
            matches_won = COALESCE(matches_won,0) + CASE WHEN v_is_win THEN 1 ELSE 0 END,
            goals = COALESCE(goals, 0) + v_goals,
            mvp_count = COALESCE(mvp_count,0) + CASE WHEN v_is_mvp THEN 1 ELSE 0 END,
            updated_at = now()
        WHERE id = v_participant.user_id;

        UPDATE public.match_participants SET stats_applied = TRUE WHERE id = v_participant.participant_id;
    END LOOP;

    -- 5. Update Team Stats
    PERFORM public.update_team_stats_on_match_result(p_match_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
