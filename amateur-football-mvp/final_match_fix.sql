-- ==========================================================
-- SCRIPT DEFINITIVO DE MIGRACIÓN: PARTIDOS Y ESTADÍSTICAS
-- ==========================================================
-- Este script es IDEMPOTENTE: podés ejecutarlo varias veces sin errores.

DO $$ 
BEGIN
    -- 1. LIMPIEZA Y RENOMBRAMIENTO EN TABLA 'matches'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='matches' AND column_name='score_a') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='matches' AND column_name='team_a_score') THEN
            ALTER TABLE public.matches RENAME COLUMN score_a TO team_a_score;
        ELSE
            ALTER TABLE public.matches DROP COLUMN score_a;
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='matches' AND column_name='score_b') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='matches' AND column_name='team_b_score') THEN
            ALTER TABLE public.matches RENAME COLUMN score_b TO team_b_score;
        ELSE
            ALTER TABLE public.matches DROP COLUMN score_b;
        END IF;
    END IF;

    -- Add goal_scorers column to matches
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='matches' AND column_name='goal_scorers') THEN
        ALTER TABLE public.matches ADD COLUMN goal_scorers JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- 2. LIMPIEZA Y RENOMBRAMIENTO EN TABLA 'match_reports'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='match_reports' AND column_name='score_a') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='match_reports' AND column_name='team_a_score') THEN
            ALTER TABLE public.match_reports RENAME COLUMN score_a TO team_a_score;
        ELSE
            ALTER TABLE public.match_reports DROP COLUMN score_a;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='match_reports' AND column_name='score_b') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='match_reports' AND column_name='team_b_score') THEN
            ALTER TABLE public.match_reports RENAME COLUMN score_b TO team_b_score;
        ELSE
            ALTER TABLE public.match_reports DROP COLUMN score_b;
        END IF;
    END IF;
END $$;

-- 3. ASEGURAR TABLAS DE GAMIFICACIÓN (MVP y Goleadores)
CREATE TABLE IF NOT EXISTS public.mvp_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    voted_player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(match_id, voter_id)
);

-- 4. ACTUALIZAR TRIGGER DE ESTADÍSTICAS DE EQUIPO
CREATE OR REPLACE FUNCTION update_team_stats_on_match_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_completed = true AND OLD.is_completed = false THEN
        IF NEW.team_a_id IS NOT NULL AND NEW.team_b_id IS NOT NULL THEN
            -- Update Team A
            UPDATE public.teams SET
                wins = wins + CASE WHEN NEW.team_a_score > NEW.team_b_score THEN 1 ELSE 0 END,
                losses = losses + CASE WHEN NEW.team_a_score < NEW.team_b_score THEN 1 ELSE 0 END,
                draws = draws + CASE WHEN NEW.team_a_score = NEW.team_b_score THEN 1 ELSE 0 END,
                goals_for = goals_for + NEW.team_a_score,
                goals_against = goals_against + NEW.team_b_score,
                xp = xp + 10
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
