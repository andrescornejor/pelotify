-- Create match_messages table if not exists
CREATE TABLE IF NOT EXISTS public.match_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for match_messages
ALTER TABLE public.match_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone in the match can see messages
-- Simplified: Everyone logged in can see (change if needed for privacy)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone logged in can see match messages') THEN
        CREATE POLICY "Anyone logged in can see match messages" ON public.match_messages
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can send match messages') THEN
        CREATE POLICY "Authenticated users can send match messages" ON public.match_messages
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for direct_messages
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see messages where they are the sender or recipient
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can see their own DMs') THEN
        CREATE POLICY "Users can see their own DMs" ON public.direct_messages
            FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can send their own DMs') THEN
        CREATE POLICY "Users can send their own DMs" ON public.direct_messages
            FOR INSERT WITH CHECK (auth.uid() = sender_id);
    END IF;
END $$;

-- Add realtime to these tables
ALTER PUBLICATION supabase_realtime ADD TABLE match_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
