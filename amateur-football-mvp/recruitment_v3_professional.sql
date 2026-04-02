-- Professional Recruitment Migration (Player Marketplace Pro)
-- This script implements a slot-based recruitment system for Pelotify.

-- 1. ADAPT MATCHES TABLE
DO $$ 
BEGIN
    -- Add match_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='match_type') THEN
        ALTER TABLE public.matches ADD COLUMN match_type TEXT DEFAULT 'normal';
    END IF;

    -- Add description for recruitment details
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='description') THEN
        ALTER TABLE public.matches ADD COLUMN description TEXT;
    END IF;

    -- Add required_skill_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='required_skill_level') THEN
        ALTER TABLE public.matches ADD COLUMN required_skill_level TEXT DEFAULT 'pro-vibe'; -- casual, competitive, pro-vibe
    END IF;
END $$;

-- 2. CREATE MATCH_SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.match_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    position TEXT NOT NULL, -- 'GK', 'DEF', 'MID', 'FW', 'ANY'
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'filled', 'pending'
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Player who takes the slot
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_match_slots_match ON public.match_slots(match_id);
CREATE INDEX IF NOT EXISTS idx_match_slots_user ON public.match_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_match_slots_status ON public.match_slots(status);

-- 3. RLS POLICIES FOR MATCH_SLOTS
ALTER TABLE public.match_slots ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies to avoid "already exists" error
DROP POLICY IF EXISTS "Anyone can view open slots" ON public.match_slots;
DROP POLICY IF EXISTS "Organizers can manage slots" ON public.match_slots;
DROP POLICY IF EXISTS "Players can claim open slots" ON public.match_slots;

-- Everyone can view open slots
CREATE POLICY "Anyone can view open slots" 
    ON public.match_slots FOR SELECT 
    TO authenticated 
    USING (true);

-- Organizers can manage slots for their matches
CREATE POLICY "Organizers can manage slots" 
    ON public.match_slots FOR ALL 
    TO authenticated 
    USING (
        auth.uid() IN (SELECT creator_id FROM public.matches WHERE id = match_id)
    )
    WITH CHECK (
        auth.uid() IN (SELECT creator_id FROM public.matches WHERE id = match_id)
    );

-- Players can "Apply" for a slot (Update the user_id if status is open)
CREATE POLICY "Players can claim open slots" 
    ON public.match_slots FOR UPDATE 
    TO authenticated 
    USING (status = 'open' AND user_id IS NULL)
    WITH CHECK (user_id = auth.uid());

-- 4. RPC: CREATE RECRUITMENT MATCH WITH SLOTS
-- This atomic operation ensures we don't have matches without slots.
CREATE OR REPLACE FUNCTION public.create_recruitment_match(
    p_creator_id UUID,
    p_venue_id UUID, -- This maps to business_id in the table
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_description TEXT,
    p_skill_level TEXT,
    p_slots JSONB -- Array of positions: ["GK", "DEF", "DEF", "FW"]
) RETURNS UUID AS $$
DECLARE
    v_match_id UUID;
    v_pos TEXT;
    v_location TEXT;
    v_missing_players INT;
BEGIN
    -- Calculate missing players based on slots provided
    v_missing_players := jsonb_array_length(p_slots);

    -- Get venue name if provided
    IF p_venue_id IS NOT NULL THEN
        SELECT name INTO v_location FROM public.canchas_businesses WHERE id = p_venue_id;
    END IF;

    -- Fallback location
    IF v_location IS NULL THEN
        v_location := 'Sede a coordinar';
    END IF;

    -- Create the match with all likely required columns
    INSERT INTO public.matches (
        creator_id, business_id, date, time, 
        match_type, description, required_skill_level, status, is_completed,
        location, type, price, is_private, level,
        missing_players, payment_method
    ) VALUES (
        p_creator_id, p_venue_id, p_date, p_start_time, 
        'recruitment', p_description, p_skill_level, 'published', false,
        v_location, 'F5', 0, false, p_skill_level,
        v_missing_players, 'mercado_pago'
    ) RETURNING id INTO v_match_id;

    -- Create slots
    FOR v_pos IN SELECT jsonb_array_elements_text(p_slots) LOOP
        INSERT INTO public.match_slots (match_id, position, status)
        VALUES (v_match_id, v_pos, 'open');
    END LOOP;

    -- Add creator as a participant automatically
    INSERT INTO public.match_participants (match_id, user_id, status, team)
    VALUES (v_match_id, p_creator_id, 'confirmed', 'A')
    ON CONFLICT (match_id, user_id) DO NOTHING;

    RETURN v_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: JOIN RECRUITMENT SLOT
CREATE OR REPLACE FUNCTION public.join_recruitment_slot(
    p_slot_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_match_id UUID;
BEGIN
    -- Check if slot is open
    IF NOT EXISTS (SELECT 1 FROM public.match_slots WHERE id = p_slot_id AND status = 'open') THEN
        RETURN FALSE;
    END IF;

    -- Update slot
    UPDATE public.match_slots 
    SET user_id = p_user_id, status = 'filled', updated_at = now()
    WHERE id = p_slot_id;

    -- Get match_id
    SELECT match_id INTO v_match_id FROM public.match_slots WHERE id = p_slot_id;

    -- Add to participants
    INSERT INTO public.match_participants (match_id, user_id, status)
    VALUES (v_match_id, p_user_id, 'confirmed')
    ON CONFLICT (match_id, user_id) DO UPDATE SET status = 'confirmed';

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
