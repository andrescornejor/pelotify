-- HIGHLIGHTS (TIKTOK-STYLE VIDEO FEED)
-- This script adds support for ultra-optimized short football clips.

-- 1. Create Highlights Table
CREATE TABLE IF NOT EXISTS public.match_highlights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    description TEXT,
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Storage Bucket for Videos
-- Note: You'll need to create a bucket named 'match-highlights' in the Supabase Dashboard
-- with 'Public' access enabled for optimized delivery.

-- 3. RLS Policies for Highlights Table
ALTER TABLE public.match_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view highlights" ON public.match_highlights
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can upload their own highlights" ON public.match_highlights
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights" ON public.match_highlights
    FOR DELETE TO authenticated 
    USING (auth.uid() = user_id);

-- 4. Storage Policies (Supabase Bucket)
-- These must be applied to the 'storage.objects' table for the 'match-highlights' bucket.
-- Assuming the bucket is called 'match-highlights'

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_highlights_match ON public.match_highlights(match_id);
CREATE INDEX IF NOT EXISTS idx_highlights_user ON public.match_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_highlights_created ON public.match_highlights(created_at DESC);
