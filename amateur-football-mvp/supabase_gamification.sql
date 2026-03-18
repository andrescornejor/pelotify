-- Tablas para el Sistema de Gamificación (MVP e Insignias)

-- 1. Tabla de Votos MVP
CREATE TABLE IF NOT EXISTS public.mvp_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    voted_player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(match_id, voter_id) -- Un voto por partido por persona
);

-- 2. Tabla de Insignias del Usuario
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL, -- 'goleador', 'arquero', 'fairplay', etc.
    awarded_at TIMESTAMPTZ DEFAULT now(),
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    UNIQUE(user_id, badge_type, match_id) -- No repetir la misma insignia por el mismo partido
);

-- 3. Habilitar RLS
ALTER TABLE public.mvp_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Políticas para mvp_votes
CREATE POLICY "Cualquiera puede ver votos de su partido" ON public.mvp_votes
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM match_participants WHERE match_id = mvp_votes.match_id AND user_id = auth.uid()));

CREATE POLICY "Solo se puede votar una vez" ON public.mvp_votes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = voter_id);

-- Políticas para user_badges
CREATE POLICY "Todo el mundo puede ver insignias" ON public.user_badges
    FOR SELECT TO authenticated
    USING (true);

-- 4. Función para otorgar insignias automáticas (Mock/Trigger Logic)
-- Esta función se llamaría desde el backend o al finalizar un partido
CREATE OR REPLACE FUNCTION award_match_badges(p_match_id UUID, p_user_id UUID, p_goals INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Insignia de Goleador (3+ goles)
    IF p_goals >= 3 THEN
        INSERT INTO public.user_badges (user_id, badge_type, match_id)
        VALUES (p_user_id, 'hat trick', p_match_id)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Podés agregar más lógica acá para otras insignias
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
