-- FIX TEAM MEMBERS & MATCH INVITATIONS POLICIES
-- Address the issue where accepting or denying invitations did nothing due to missing RLS policies.

-- 1. Ensure RLS is enabled for match_invitations
ALTER TABLE public.match_invitations ENABLE ROW LEVEL SECURITY;

-- 2. MATCH_INVITATIONS Policies
DROP POLICY IF EXISTS "Anyone can view their own match invitations" ON public.match_invitations;
CREATE POLICY "Anyone can view their own match invitations" ON public.match_invitations 
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Creators can send match invitations" ON public.match_invitations;
CREATE POLICY "Creators can send match invitations" ON public.match_invitations 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT creator_id FROM public.matches WHERE id = match_id));

DROP POLICY IF EXISTS "Users can respond to their match invitations" ON public.match_invitations;
CREATE POLICY "Users can respond to their match invitations" ON public.match_invitations 
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their match invitations" ON public.match_invitations;
CREATE POLICY "Users can delete their match invitations" ON public.match_invitations 
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. TEAM_MEMBERS Policies (Fixing missing DELETE)
DROP POLICY IF EXISTS "Users can leave or reject team membership" ON public.team_members;
CREATE POLICY "Users can leave or reject team membership" ON public.team_members 
    FOR DELETE TO authenticated 
    USING (
        auth.uid() = user_id -- The user themselves can leave/reject
        OR 
        auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = team_id) -- Or the captain can remove/reject
    );

-- Also ensure UPDATE is robust
DROP POLICY IF EXISTS "Users can update their team status" ON public.team_members;
CREATE POLICY "Users can update their team status" ON public.team_members 
    FOR UPDATE TO authenticated 
    USING (
        auth.uid() = user_id -- The user themselves can accept
        OR 
        auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = team_id) -- Or the captain can accept
    );
