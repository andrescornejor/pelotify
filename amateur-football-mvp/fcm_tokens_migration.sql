-- FCM Push Notification Tokens Table
-- Run this in Supabase SQL Editor

-- Create table to store FCM tokens per user/device
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on token (one token = one device)
ALTER TABLE fcm_tokens ADD CONSTRAINT fcm_tokens_token_unique UNIQUE (token);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);

-- RLS Policies
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Users can insert their own tokens
CREATE POLICY "Users can insert own tokens"
  ON fcm_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update own tokens"
  ON fcm_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete own tokens"
  ON fcm_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can read their own tokens
CREATE POLICY "Users can read own tokens"
  ON fcm_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can do everything (used by API route with service role key)
-- This is automatic with service role key, no policy needed

-- Auto-cleanup: remove tokens older than 60 days (optional, via cron)
-- You can set up a Supabase cron job to run:
-- DELETE FROM fcm_tokens WHERE updated_at < NOW() - INTERVAL '60 days';

SELECT 'FCM tokens table created successfully!' AS result;
