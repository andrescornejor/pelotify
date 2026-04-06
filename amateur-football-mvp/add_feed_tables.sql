-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete their own comments" ON public.post_comments FOR DELETE USING (auth.uid() = author_id);
