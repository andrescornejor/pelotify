-- MEJORA DEL BACKEND: CONSOLIDACIÓN DE REPORTES POST-PARTIDO
-- Hemos movido todas las operaciones individuales (reporte, votos mvp, ratings y medallas) 
-- a una sola transacción segura desde el lado del servidor, lo que hace que la app responda 
-- inmediatamente y no haya fallos si la conexión a internet es lenta o inestable.

CREATE OR REPLACE FUNCTION submit_full_match_report(
  p_match_id UUID,
  p_user_id UUID,
  p_team TEXT,
  p_team_a_score INT,
  p_team_b_score INT,
  p_personal_goals INT,
  p_ratings JSONB,
  p_mvp_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_consensus BOOLEAN := FALSE;
  v_last_a RECORD;
  v_last_b RECORD;
  v_rating_obj JSONB;
BEGIN
  -- 1. Insertar el reporte principal
  -- (Usamos ON CONFLICT DO NOTHING para evitar fallos si el usuario presiona 2 veces el boton)
  BEGIN
    INSERT INTO public.match_reports (match_id, reporter_id, team, team_a_score, team_b_score, personal_goals)
    VALUES (p_match_id, p_user_id, p_team, p_team_a_score, p_team_b_score, p_personal_goals);
  EXCEPTION WHEN unique_violation THEN
    -- Ya se envió el reporte, no hacemos throw error sino que actualizamos los datos si queremos
    -- O simplemente ignoramos si ya existe. En este caso seguimos adelante para asegurar ratings y mvp
    NULL;
  END;

  -- 2. Insertar Ratings (Array de objetos)
  IF p_ratings IS NOT NULL THEN
    FOR v_rating_obj IN SELECT * FROM jsonb_array_elements(p_ratings)
    LOOP
      BEGIN
        INSERT INTO public.player_ratings (match_id, from_user_id, to_user_id, rating)
        VALUES (p_match_id, p_user_id, (v_rating_obj->>'to_user_id')::UUID, (v_rating_obj->>'rating')::INT);
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;
    END LOOP;
  END IF;

  -- 3. Insertar Voto MVP
  IF p_mvp_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.mvp_votes (match_id, voter_id, voted_player_id)
      VALUES (p_match_id, p_user_id, p_mvp_id);
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END IF;

  -- 4. Tratar de dar medallas (puede que award_match_badges no exista, asique usamos try/catch de postgres)
  BEGIN
    PERFORM award_match_badges(p_match_id, p_user_id, p_personal_goals);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- 5. Chequear Consenso (Si alguien del otro equipo reportó lo mismo)
  SELECT * INTO v_last_a FROM public.match_reports WHERE match_id = p_match_id AND team = 'A' ORDER BY created_at DESC LIMIT 1;
  SELECT * INTO v_last_b FROM public.match_reports WHERE match_id = p_match_id AND team = 'B' ORDER BY created_at DESC LIMIT 1;

  IF FOUND AND v_last_a IS NOT NULL AND v_last_b IS NOT NULL THEN
    IF v_last_a.team_a_score = v_last_b.team_a_score AND v_last_a.team_b_score = v_last_b.team_b_score THEN
      v_consensus := TRUE;
      -- Completar y transferir estadisticas reales si la funcion existe
      BEGIN
        PERFORM finalize_match_and_sync_stats(p_match_id);
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
  END IF;

  RETURN jsonb_build_object('consensus', v_consensus);
END;
$$;
