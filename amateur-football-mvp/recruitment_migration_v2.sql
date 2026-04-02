-- Migration to separate recruitment logic into its own table
-- This allows for better separation of concerns and future scalability (e.g. per-position recruitment)

CREATE TABLE IF NOT EXISTS match_recruitment (
    match_id UUID PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
    missing_players INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE match_recruitment ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Recruitment is viewable by everyone" ON match_recruitment
    FOR SELECT USING (true);

CREATE POLICY "Creators can manage recruitment" ON match_recruitment
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = match_recruitment.match_id 
            AND matches.creator_id = auth.uid()
        )
    );

-- Migrate existing data from matches table
INSERT INTO match_recruitment (match_id, missing_players, is_active)
SELECT id, missing_players, is_recruitment
FROM matches
WHERE is_recruitment = TRUE
ON CONFLICT (match_id) DO UPDATE SET
    missing_players = EXCLUDED.missing_players,
    is_active = EXCLUDED.is_active;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_match_recruitment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_match_recruitment_updated_at
    BEFORE UPDATE ON match_recruitment
    FOR EACH ROW
    EXECUTE FUNCTION update_match_recruitment_updated_at();

-- Note: We keep matches.is_recruitment and matches.missing_players for backward compatibility 
-- in the short term, but logic should shift to this table.
