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
}

async function fetchHomeData(userId: string): Promise<HomeData> {
  const [teamsRes, matchesRes, playersCountRes, recentProfilesRes, venuesRes] =
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
        .gte('matches.date', new Date().toISOString().split('T')[0])
        .order('date', { foreignTable: 'matches', ascending: true })
        .limit(1),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('full_name, created_at, elo')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('canchas_businesses')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(6),
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
        user: p.full_name || 'Nuevo Jugador',
        detail: `se ha unido a la liga`,
        time: 'Reciente',
      }))
    : [];

  const highlights = await getHighlights(6);
  const featuredVenues = venuesRes.data || [];

  return { userTeams, nextMatch, totalPlayers, activities, highlights, featuredVenues };
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
