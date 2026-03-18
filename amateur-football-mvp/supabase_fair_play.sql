-- Script para crear la tabla de reportes de partidos y el sistema de consenso
-- Ejecutar este script en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS public.match_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    team TEXT NOT NULL CHECK (team IN ('A', 'B')),
    team_a_score INTEGER NOT NULL DEFAULT 0,
    team_b_score INTEGER NOT NULL DEFAULT 0,
    personal_goals INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Un jugador solo puede reportar una vez por partido
    UNIQUE(match_id, reporter_id)
);

-- Habilitar RLS
ALTER TABLE public.match_reports ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Los jugadores pueden ver todos los reportes" ON public.match_reports
    FOR SELECT USING (true);

CREATE POLICY "Los jugadores pueden insertar sus propios reportes" ON public.match_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Comentario informativo
COMMENT ON TABLE public.match_reports IS 'Almacena los votos/reportes de los jugadores sobre el resultado de un partido.';
