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
    comments_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Storage Bucket for Videos
-- Note: You'll need to create a bucket named 'match-highlights' in the Supabase Dashboard
-- with 'Public' access enabled for optimized delivery.

-- 3. RLS Policies for Highlights Table
ALTER TABLE public.match_highlights ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies
DROP POLICY IF EXISTS "Allow public select" ON public.match_highlights;
DROP POLICY IF EXISTS "Allow auth insert" ON public.match_highlights;
DROP POLICY IF EXISTS "Allow owner delete" ON public.match_highlights;

-- Allow public view
CREATE POLICY "Allow public select" ON public.match_highlights FOR SELECT USING (true);

-- Allow authenticated users to insert their own clips
CREATE POLICY "Allow auth insert" ON public.match_highlights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow owners to delete
CREATE POLICY "Allow owner delete" ON public.match_highlights FOR DELETE USING (auth.uid() = user_id);

-- 4. Storage Policies (Supabase Bucket)
-- NOTE: The bucket 'match-highlights' MUST exist first.
-- Cleanup
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete Access" ON storage.objects;

-- Public Read
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'match-highlights');

-- Authenticated Upload
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'match-highlights' AND auth.role() = 'authenticated');

-- Delete Support (Only owner)
CREATE POLICY "Owner Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'match-highlights' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. RPC to Increment Views
CREATE OR REPLACE FUNCTION public.increment_highlight_views(h_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.match_highlights SET views_count = views_count + 1 WHERE id = h_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Likes System (Table + Trigger)
CREATE TABLE IF NOT EXISTS public.match_highlight_likes (
    highlight_id UUID REFERENCES public.match_highlights(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (highlight_id, user_id)
);

ALTER TABLE public.match_highlight_likes ENABLE ROW LEVEL SECURITY;

-- Cleanup
DROP POLICY IF EXISTS "Allow public select likes" ON public.match_highlight_likes;
DROP POLICY IF EXISTS "Allow authenticated insert likes" ON public.match_highlight_likes;
DROP POLICY IF EXISTS "Allow owner delete likes" ON public.match_highlight_likes;

CREATE POLICY "Allow public select likes" ON public.match_highlight_likes FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert likes" ON public.match_highlight_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow owner delete likes" ON public.match_highlight_likes FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION public.update_highlight_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.match_highlights SET likes_count = likes_count + 1 WHERE id = NEW.highlight_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.match_highlights SET likes_count = likes_count - 1 WHERE id = OLD.highlight_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup trigger
DROP TRIGGER IF EXISTS on_highlight_like_change ON public.match_highlight_likes;

CREATE TRIGGER on_highlight_like_change
AFTER INSERT OR DELETE ON public.match_highlight_likes
FOR EACH ROW EXECUTE FUNCTION public.update_highlight_likes_count();

-- 7. Comments System (Table)
CREATE TABLE IF NOT EXISTS public.match_highlight_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    highlight_id UUID REFERENCES public.match_highlights(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.match_highlight_comments ENABLE ROW LEVEL SECURITY;

-- Cleanup
DROP POLICY IF EXISTS "Allow public select comments" ON public.match_highlight_comments;
DROP POLICY IF EXISTS "Allow authenticated insert comments" ON public.match_highlight_comments;
DROP POLICY IF EXISTS "Allow owner delete comments" ON public.match_highlight_comments;

CREATE POLICY "Allow public select comments" ON public.match_highlight_comments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert comments" ON public.match_highlight_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow owner delete comments" ON public.match_highlight_comments FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update comments_count
CREATE OR REPLACE FUNCTION public.update_highlight_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.match_highlights SET comments_count = comments_count + 1 WHERE id = NEW.highlight_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.match_highlights SET comments_count = comments_count - 1 WHERE id = OLD.highlight_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup trigger
DROP TRIGGER IF EXISTS on_highlight_comment_change ON public.match_highlight_comments;

CREATE TRIGGER on_highlight_comment_change
AFTER INSERT OR DELETE ON public.match_highlight_comments
FOR EACH ROW EXECUTE FUNCTION public.update_highlight_comments_count();

-- 8. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_highlights_match ON public.match_highlights(match_id);
CREATE INDEX IF NOT EXISTS idx_highlights_user ON public.match_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_highlights_created ON public.match_highlights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_highlight_comments_id ON public.match_highlight_comments(highlight_id);
