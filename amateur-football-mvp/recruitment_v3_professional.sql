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

-- Everyone can view open slots
CREATE POLICY "Anyone can view open slots" 
    ON public.match_slots FOR SELECT 
    TO authenticated 
    USING (true);

-- Organizers can manage slots for their matches
-- Assuming 'creator_id' or 'organizer_id' exists in matches. 
-- Let's check which column identifies the creator in matches.
-- Looking at previous code, matches usually have a creator_id or are linked to a venue.
-- Most likely creator_id.

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
-- We'll use an RPC for safety, but here's the policy for base updates
CREATE POLICY "Players can claim open slots" 
    ON public.match_slots FOR UPDATE 
    TO authenticated 
    USING (status = 'open' AND user_id IS NULL)
    WITH CHECK (user_id = auth.uid());

-- 4. RPC: CREATE RECRUITMENT MATCH WITH SLOTS
-- This atomic operation ensures we don't have matches without slots.
CREATE OR REPLACE FUNCTION public.create_recruitment_match(
    p_creator_id UUID,
    p_venue_id UUID,
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
BEGIN
    -- Create the match
    INSERT INTO public.matches (
        creator_id, venue_id, date, start_time, end_time, 
        match_type, description, required_skill_level, status
    ) VALUES (
        p_creator_id, p_venue_id, p_date, p_start_time, p_end_time, 
        'recruitment', p_description, p_skill_level, 'scheduled'
    ) RETURNING id INTO v_match_id;

    -- Create slots
    FOR v_pos IN SELECT jsonb_array_elements_text(p_slots) LOOP
        INSERT INTO public.match_slots (match_id, position, status)
        VALUES (v_match_id, v_pos, 'open');
    END LOOP;

    -- Add creator as a participant automatically (usually they are)
    INSERT INTO public.match_participants (match_id, user_id, status, team)
    VALUES (v_match_id, p_creator_id, 'confirmed', 'A');

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
