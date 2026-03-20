-- Fix to allow team name customization
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_a_name TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_b_name TEXT;

-- Update RLS if needed (assuming public or creator-based access exists)
-- This ensures column updates are propagated to the schema cache immediately.
NOTIFY pgrst, 'reload schema';
