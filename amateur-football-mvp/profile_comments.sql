-- Create the profile_comments table
CREATE TABLE IF NOT EXISTS profile_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profile_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read comments
CREATE POLICY "Comments are viewable by everyone" 
ON profile_comments
FOR SELECT USING (true);

-- Policy: Authenticated users can insert their own comments
CREATE POLICY "Authenticated users can insert their own comments" 
ON profile_comments
FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Policy: Authors can delete their own comments OR Profile owners can delete any comment on their profile
CREATE POLICY "Authors and profile owners can delete comments" 
ON profile_comments
FOR DELETE USING (
    auth.uid() = author_id OR 
    auth.uid() = profile_id
);

-- Index for performance
CREATE INDEX IF NOT EXISTS profile_comments_profile_id_idx ON profile_comments(profile_id);
CREATE INDEX IF NOT EXISTS profile_comments_author_id_idx ON profile_comments(author_id);
