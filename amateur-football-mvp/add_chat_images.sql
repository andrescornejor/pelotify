-- Add image_url to match_messages and direct_messages
ALTER TABLE public.match_messages ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for chat images if it doesn't exist
-- Note: Supabase storage buckets are usually created via the dashboard or API,
-- but we can try to hint at it or use a default 'uploads' bucket.
