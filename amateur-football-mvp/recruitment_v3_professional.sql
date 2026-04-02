-- PLAYER MARKETPLACE PRO: ARCHITECTURE UPGRADE
-- This migration implements the "Slot-based" recruitment system.

-- 1. ADD RECRUITMENT COLUMNS TO MATCHES
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS is_recruitment BOOLEAN DEFAULT false;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS recruitment_title TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS recruitment_description TEXT;

-- 2. CREATE MATCH_SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.match_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    team TEXT NOT NULL CHECK (team IN ('A', 'B')),
    position TEXT NOT NULL CHECK (position IN ('GK', 'DF', 'MF', 'FW')), -- Portero, Defensa, Medio, Delantero
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Who is occupying it
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'filled')),
    price_to_pay NUMERIC DEFAULT 0, -- Specific price for this slot
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENABLE RLS
ALTER TABLE public.match_slots ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES for match_slots
CREATE POLICY "Everyone can view match slots" ON public.match_slots 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Match creators can manage slots" ON public.match_slots 
    FOR ALL TO authenticated 
    USING (auth.uid() IN (SELECT creator_id FROM public.matches WHERE id = match_id))
    WITH CHECK (auth.uid() IN (SELECT creator_id FROM public.matches WHERE id = match_id));

-- Allow users to update their own application (occupying a slot or changing status to pending)
CREATE POLICY "Users can apply to slots" ON public.match_slots 
    FOR UPDATE TO authenticated 
    USING (status = 'open' OR user_id = auth.uid())
    WITH CHECK (status = 'pending' AND user_id = auth.uid());

-- 5. FUNCTION TO AUTO-SYNC PARTICIPANTS
-- When a slot is filled, add the user to match_participants automatically
CREATE OR REPLACE FUNCTION public.sync_slot_to_participants()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'filled' AND NEW.user_id IS NOT NULL THEN
        INSERT INTO public.match_participants (match_id, user_id, team, status)
        VALUES (NEW.match_id, NEW.user_id, NEW.team, 'confirmed')
        ON CONFLICT (match_id, user_id) DO UPDATE SET team = EXCLUDED.team, status = 'confirmed';
    END IF;
    
    -- If a user is removed from a slot, we don't necessarily remove them from the match
    -- as they might have joined normally, but usually recruitment users are tied to the slot.
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_slot_to_participants
AFTER UPDATE OF status, user_id ON public.match_slots
FOR EACH ROW
WHEN (NEW.status = 'filled')
EXECUTE FUNCTION public.sync_slot_to_participants();

-- 6. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_match_slots_match ON public.match_slots(match_id);
CREATE INDEX IF NOT EXISTS idx_match_slots_user ON public.match_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_match_slots_status ON public.match_slots(status);
CREATE INDEX IF NOT EXISTS idx_match_slots_position ON public.match_slots(position);
