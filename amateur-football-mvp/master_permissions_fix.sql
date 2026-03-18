-- MASTER RLS & PERMISSIONS FIX
-- Ensure Google and Email users have full access to all features

-- 1. Enable RLS on all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvp_votes ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile" ON public.profiles 
    FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. MATCHES Policies
DROP POLICY IF EXISTS "Anyone can view matches" ON public.matches;
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.matches;
CREATE POLICY "Authenticated users can create matches" ON public.matches 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators can update their matches" ON public.matches;
CREATE POLICY "Creators can update their matches" ON public.matches 
    FOR UPDATE TO authenticated USING (auth.uid() = creator_id);

-- 4. MATCH_PARTICIPANTS Policies
DROP POLICY IF EXISTS "Anyone can view participants" ON public.match_participants;
CREATE POLICY "Anyone can view participants" ON public.match_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join matches" ON public.match_participants;
CREATE POLICY "Users can join matches" ON public.match_participants 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their participation" ON public.match_participants;
CREATE POLICY "Users can update their participation" ON public.match_participants 
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave matches" ON public.match_participants;
CREATE POLICY "Users can leave matches" ON public.match_participants 
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. TEAMS Policies
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams" ON public.teams 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = captain_id);

DROP POLICY IF EXISTS "Captains can update their teams" ON public.teams;
CREATE POLICY "Captains can update their teams" ON public.teams 
    FOR UPDATE TO authenticated USING (auth.uid() = captain_id);

-- 6. TEAM_MEMBERS Policies
DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join/be invited to teams" ON public.team_members;
CREATE POLICY "Users can join/be invited to teams" ON public.team_members 
    FOR INSERT TO authenticated WITH CHECK (true); -- Flexible for invites

DROP POLICY IF EXISTS "Users can update their team status" ON public.team_members;
CREATE POLICY "Users can update their team status" ON public.team_members 
    FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = team_id));

-- 7. FRIENDSHIPS Policies
DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
CREATE POLICY "Users can view their friendships" ON public.friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can send friend requests" ON public.friendships;
CREATE POLICY "Users can send friend requests" ON public.friendships 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can accept/delete friendships" ON public.friendships;
CREATE POLICY "Users can accept/delete friendships" ON public.friendships 
    FOR ALL TO authenticated USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 8. Ensure all tables are public to authenticated users for SELECT (if needed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
