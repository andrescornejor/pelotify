-- Migration to rename score columns in match_reports for consistency
ALTER TABLE public.match_reports RENAME COLUMN score_a TO team_a_score;
ALTER TABLE public.match_reports RENAME COLUMN score_b TO team_b_score;

-- Update RLS policies if they reference the old columns (optional but good practice)
-- In this case, the policies don't reference specific columns, so we are good.

-- Update comment
COMMENT ON TABLE public.match_reports IS 'Almacena los votos/reportes de los jugadores sobre el resultado de un partido (usando team_a_score y team_b_score).';
