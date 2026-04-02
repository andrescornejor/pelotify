-- MASTER FIX: Atomic Emergency Recruitment Logic
-- This provides RPCs that bypass RLS restrictions for joining/leaving,
-- ensuring the counters are ALWAYS updated even if the player joining isn't the creator.

-- 1. Table Setup (ensure it exists)
CREATE TABLE IF NOT EXISTS match_recruitment (
    match_id UUID PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
    missing_players INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure old columns exist and have data
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM match_recruitment) THEN
        INSERT INTO match_recruitment (match_id, missing_players, is_active)
        SELECT id, missing_players, is_recruitment
        FROM matches
        WHERE is_recruitment = TRUE
        ON CONFLICT (match_id) DO NOTHING;
    END IF;
END $$;

-- 2. ATOMIC JOIN RPC
CREATE OR REPLACE FUNCTION join_emergency_match_v1(
    p_match_id UUID,
    p_user_id UUID,
    p_team TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_missing_players INTEGER;
    v_is_recruitment BOOLEAN;
BEGIN
    -- 1. Insert participant
    INSERT INTO match_participants (match_id, user_id, status, team)
    VALUES (p_match_id, p_user_id, 'confirmed', p_team)
    ON CONFLICT (match_id, user_id) DO NOTHING;

    -- 2. Update recruitment data (Ensuring row exists)
    INSERT INTO match_recruitment (match_id, missing_players, is_active)
    VALUES (p_match_id, 0, false) -- Default if missing, but we'll update it
    ON CONFLICT (match_id) DO NOTHING;

    UPDATE match_recruitment
    SET missing_players = GREATEST(0, missing_players - 1),
        is_active = (GREATEST(0, missing_players - 1) > 0)
    WHERE match_id = p_match_id
    RETURNING missing_players, is_active INTO v_missing_players, v_is_recruitment;

    -- 3. Sync to legacy matches table for search/radar
    UPDATE matches
    SET missing_players = COALESCE(v_missing_players, 0),
        is_recruitment = COALESCE(v_is_recruitment, false)
    WHERE id = p_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ATOMIC LEAVE RPC
CREATE OR REPLACE FUNCTION leave_emergency_match_v1(
    p_match_id UUID,
    p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_missing_players INTEGER;
    v_is_recruitment BOOLEAN;
BEGIN
    -- 1. Remove participant
    DELETE FROM match_participants
    WHERE match_id = p_match_id AND user_id = p_user_id;

    -- 2. Update recruitment data (Increment)
    UPDATE match_recruitment
    SET missing_players = missing_players + 1,
        is_active = true
    WHERE match_id = p_match_id
    RETURNING missing_players, is_active INTO v_missing_players, v_is_recruitment;

    -- 3. Sync to legacy matches table
    UPDATE matches
    SET missing_players = COALESCE(v_missing_players, 1),
        is_recruitment = true
    WHERE id = p_match_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS but allow select
ALTER TABLE match_recruitment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view" ON match_recruitment;
CREATE POLICY "Public view" ON match_recruitment FOR SELECT USING (true);
