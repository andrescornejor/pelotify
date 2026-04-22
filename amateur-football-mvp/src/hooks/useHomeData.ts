'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { supabase } from '@/lib/supabase';
import { getHighlights } from '@/lib/highlights';
import type { Match } from '@/lib/matches';

type HomeEntity = Record<string, unknown>;
type HomeMatch = Partial<Match> & HomeEntity;

interface HomeData {
  userTeams: HomeEntity[];
  nextMatch: HomeMatch | null;
  recommendedMatches: HomeMatch[];
  totalPlayers: number;
  activities: HomeEntity[];
  highlights: HomeEntity[];
  featuredVenues: HomeEntity[];
  recentPosts: HomeEntity[];
}

async function fetchHomeData(userId: string): Promise<HomeData> {
  const [teamsRes, matchesRes, recommendedMatchesRes, playersCountRes, recentProfilesRes, venuesRes, postsRes] =
    await Promise.all([
      supabase
        .from('team_members')
        .select('team_id, teams(*)')
        .eq('user_id', userId)
        .limit(3),
      supabase
        .from('match_participants')
        .select('matches:matches!inner(*)')
        .eq('user_id', userId)
        .eq('matches.is_completed', false)
        .gte('matches.date', (() => { 
            const d = new Date(); 
            return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        })())
        .order('date', { foreignTable: 'matches', ascending: true })
        .limit(1),
      supabase
        .from('matches')
        .select('*, participants:match_participants(count)')
        .eq('status', 'published')
        .eq('is_completed', false)
        .gte('date', (() => { 
            const d = new Date(); 
            return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        })())
        .order('date', { ascending: true })
        .limit(12),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('name, created_at, elo')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('canchas_businesses')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(6),
      supabase
        .from('posts')
        .select(`
          id, content, image_url, created_at, author_id,
          author:profiles(id, name, avatar_url, is_pro, handle),
          post_likes(id, user_id),
          post_comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(12),
    ]);

  const userTeams = teamsRes.data
    ? teamsRes.data.map((t) => t.teams).filter(Boolean)
    : [];

  let nextMatch = null;
  if (matchesRes.data?.[0]) {
    const m = (matchesRes.data[0] as { matches: HomeMatch | HomeMatch[] }).matches;
    nextMatch = (Array.isArray(m) ? m[0] : m) || null;
  }

  const recommendedMatches = (recommendedMatchesRes.data || []).filter(
    (match) => match.creator_id !== userId && match.id !== nextMatch?.id
  ) as HomeMatch[];
  const totalPlayers = playersCountRes.count || 0;

  const activities = recentProfilesRes.data
    ? recentProfilesRes.data.map((p) => ({
        type: 'RANK_UP',
        user: p.name || 'Nuevo Jugador',
        detail: `se ha unido a la liga`,
        time: 'Reciente',
      }))
    : [];

  const highlights = await getHighlights(6);
  const featuredVenues = venuesRes.data || [];
  
  const recentPosts = postsRes.data ? postsRes.data.map((p) => ({
    ...p,
    likes_count: p.post_likes.length,
    comments_count: p.post_comments[0].count,
    user_has_liked: p.post_likes.some((like: { user_id: string }) => like.user_id === userId)
  })) : [];

  return { userTeams, nextMatch, recommendedMatches, totalPlayers, activities, highlights, featuredVenues, recentPosts };
}

/**
 * Aggregated home page query — fetches all data the home page needs in one
 * shot while keeping it cached for instant back-navigation.
 */
export function useHomeData(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.home.data(userId!),
    queryFn: () => fetchHomeData(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
