import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Rank calculation (mirrored from client-side)
const RANKS = [
  { name: 'HIERRO', minElo: 0, emoji: '🪨' },
  { name: 'BRONCE', minElo: 800, emoji: '🥉' },
  { name: 'PLATA', minElo: 1000, emoji: '🥈' },
  { name: 'ORO', minElo: 1200, emoji: '🥇' },
  { name: 'PLATINO', minElo: 1400, emoji: '💎' },
  { name: 'DIAMANTE', minElo: 1600, emoji: '💠' },
  { name: 'ELITE', minElo: 1800, emoji: '⚡' },
  { name: 'MAESTRO', minElo: 2000, emoji: '👑' },
];

function getRankByElo(elo: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (elo >= RANKS[i].minElo) return RANKS[i];
  }
  return RANKS[0];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const widgetType = searchParams.get('type') || 'all';
  const userId = searchParams.get('userId');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pelotify.vercel.app';

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    let profile: any = null;

    if (userId) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      profile = data;
    }

    const result: any = {
      iconUrl: `${baseUrl}/icon-192.png`,
      timestamp: new Date().toISOString(),
    };

    // --- Next Match Widget Data ---
    if (widgetType === 'next-match' || widgetType === 'all') {
      let nextMatch = null;

      if (userId) {
        const { data: matches } = await supabase
          .from('matches')
          .select('*')
          .or(`created_by.eq.${userId},team_a_players.cs.{${userId}},team_b_players.cs.{${userId}}`)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .order('time', { ascending: true })
          .limit(1);

        if (matches && matches.length > 0) {
          nextMatch = matches[0];
        }
      }

      if (!nextMatch) {
        // Fallback: get any upcoming public match
        const { data: publicMatches } = await supabase
          .from('matches')
          .select('*')
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .limit(1);

        if (publicMatches && publicMatches.length > 0) {
          nextMatch = publicMatches[0];
        }
      }

      if (nextMatch) {
        const matchDate = new Date(`${nextMatch.date}T${nextMatch.time || '00:00'}`);
        const now = new Date();
        const diff = matchDate.getTime() - now.getTime();
        let countdown = '';

        if (diff <= 0) {
          countdown = '⚽ ¡YA EMPIEZA!';
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          if (hours >= 24) {
            const days = Math.floor(hours / 24);
            countdown = `📅 En ${days} día${days > 1 ? 's' : ''}`;
          } else if (hours > 0) {
            countdown = `⏰ Faltan ${hours}h ${mins}m`;
          } else {
            countdown = `🔥 ¡En ${mins} minutos!`;
          }
        }

        result.nextMatch = {
          matchId: nextMatch.id,
          teamA: nextMatch.team_a_name || 'Local',
          teamB: nextMatch.team_b_name || 'Visitante',
          date: new Date(nextMatch.date).toLocaleDateString('es-AR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }),
          time: nextMatch.time ? nextMatch.time.slice(0, 5) + ' hs' : 'A confirmar',
          venue: nextMatch.venue_name || nextMatch.location || 'A confirmar',
          countdown,
          iconUrl: result.iconUrl,
        };
      } else {
        result.nextMatch = {
          matchId: null,
          teamA: '—',
          teamB: '—',
          date: 'Sin partidos',
          time: '—',
          venue: '—',
          countdown: '🔍 ¡Buscá tu partido!',
          iconUrl: result.iconUrl,
        };
      }
    }

    // --- Stats Widget Data ---
    if (widgetType === 'stats' || widgetType === 'all') {
      const meta = profile || {};
      result.stats = {
        playerName: meta.name || meta.full_name || 'Jugador',
        overall: meta.elo || 0,
        rank: getRankByElo(meta.elo || 0).name,
        matches: meta.matches || 0,
        winRate: meta.matches > 0 ? Math.round(((meta.matches_won || 0) / meta.matches) * 100) : 0,
        pac: meta.pac || 50,
        sho: meta.sho || 50,
        pas: meta.pas || 50,
        dri: meta.dri || 50,
        def: meta.def || 50,
        phy: meta.phy || 50,
        iconUrl: meta.avatar_url || result.iconUrl,
      };
    }

    // --- Ranking Widget Data ---
    if (widgetType === 'ranking' || widgetType === 'all') {
      const elo = profile?.elo || 0;
      const rank = getRankByElo(elo);
      const rankIdx = RANKS.findIndex((r) => r.name === rank.name);
      const nextRank = RANKS[rankIdx + 1] || rank;
      const progress = nextRank.minElo > 0 ? Math.min(100, Math.round((elo / nextRank.minElo) * 100)) : 100;

      result.ranking = {
        rank: rank.name,
        rankEmoji: rank.emoji,
        elo,
        progress,
        nextRank: nextRank.name,
        mvps: profile?.mvp_count || 0,
        wins: profile?.matches_won || 0,
        streak: profile?.win_streak || 0,
        iconUrl: result.iconUrl,
      };
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Widget data error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch widget data',
        nextMatch: {
          matchId: null,
          teamA: '—',
          teamB: '—',
          date: 'Error',
          time: '—',
          venue: '—',
          countdown: 'Intenta de nuevo',
          iconUrl: `${baseUrl}/icon-192.png`,
        },
      },
      { status: 500 }
    );
  }
}
