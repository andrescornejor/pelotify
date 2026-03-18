-- Comprehensive Column Renaming Fix
-- Standardizing score columns to 'team_a_score' and 'team_b_score' across all tables
-- This script is robust against collisions (both columns existing)

DO $$ 
BEGIN
    -- 1. Fix MATCHES table
    -- Rename score_a if it exists and team_a_score does NOT exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='matches' AND column_name='score_a') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='matches' AND column_name='team_a_score') THEN
            ALTER TABLE public.matches RENAME COLUMN score_a TO team_a_score;
        ELSE
            -- Both exist! If team_a_score is here, score_a is redundant.
            -- We assume team_a_score is the new standard we want to keep.
            ALTER TABLE public.matches DROP COLUMN score_a;
        END IF;
    END IF;
    
    -- Same for score_b
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='matches' AND column_name='score_b') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='matches' AND column_name='team_b_score') THEN
            ALTER TABLE public.matches RENAME COLUMN score_b TO team_b_score;
        ELSE
            ALTER TABLE public.matches DROP COLUMN score_b;
        END IF;
    END IF;

    -- 2. Fix MATCH_REPORTS table
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

-- 3. Update the trigger function for team stats to reflect new names
CREATE OR REPLACE FUNCTION update_team_stats_on_match_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_completed = true AND OLD.is_completed = false THEN
        -- Check if it's a team match
        IF NEW.team_a_id IS NOT NULL AND NEW.team_b_id IS NOT NULL THEN
            
            -- Update Team A
            UPDATE public.teams SET
                wins = wins + CASE WHEN NEW.team_a_score > NEW.team_b_score THEN 1 ELSE 0 END,
                losses = losses + CASE WHEN NEW.team_a_score < NEW.team_b_score THEN 1 ELSE 0 END,
                draws = draws + CASE WHEN NEW.team_a_score = NEW.team_b_score THEN 1 ELSE 0 END,
                goals_for = goals_for + NEW.team_a_score,
                goals_against = goals_against + NEW.team_b_score,
                xp = xp + 10 -- Base XP for completing match
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
