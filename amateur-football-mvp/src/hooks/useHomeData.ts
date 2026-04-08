'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { supabase } from '@/lib/supabase';
import { getHighlights } from '@/lib/highlights';

interface HomeData {
  userTeams: any[];
  nextMatch: any | null;
  totalPlayers: number;
  activities: any[];
  highlights: any[];
  featuredVenues: any[];
  recentPosts: any[];
}

async function fetchHomeData(userId: string): Promise<HomeData> {
  const [teamsRes, matchesRes, playersCountRes, recentProfilesRes, venuesRes, postsRes] =
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
        .gte('matches.date', (() => { 
            const d = new Date(); 
            return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        })())
        .order('date', { foreignTable: 'matches', ascending: true })
        .limit(1),
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
    const m = (matchesRes.data[0] as any).matches;
    nextMatch = Array.isArray(m) ? m[0] : m;
  }

  const totalPlayers = playersCountRes.count || 0;

  const activities = recentProfilesRes.data
    ? recentProfilesRes.data.map((p: any) => ({
        type: 'RANK_UP',
        user: p.name || 'Nuevo Jugador',
        detail: `se ha unido a la liga`,
        time: 'Reciente',
      }))
    : [];

  const highlights = await getHighlights(6);
  const featuredVenues = venuesRes.data || [];
  
  const recentPosts = postsRes.data ? postsRes.data.map((p: any) => ({
    ...p,
    likes_count: p.post_likes.length,
    comments_count: p.post_comments[0].count,
    user_has_liked: p.post_likes.some((like: any) => like.user_id === userId)
  })) : [];

  return { userTeams, nextMatch, totalPlayers, activities, highlights, featuredVenues, recentPosts };
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
