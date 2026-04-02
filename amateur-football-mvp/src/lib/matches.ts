import { supabase } from './supabase';

export interface Match {
  id: string;
  location: string;
  date: string;
  time: string;
  type: 'F5' | 'F7' | 'F11';
  level: string;
  missing_players: number;
  status: 'published' | 'waiting_deposit';
  price: number;
  creator_id: string;
  created_at: string;
  lat?: number;
  lng?: number;
  team_a_score?: number;
  team_b_score?: number;
  is_completed?: boolean;
  sportsreel_url?: string;
  team_a_id?: string;
  team_b_id?: string;
  team_a_name?: string;
  team_b_name?: string;
  is_private?: boolean;
  is_recruitment?: boolean;
  payment_method?: 'mercado_pago' | 'cash';
  field_id?: string;
  business_id?: string;
  participants?: any[]; // Flexible for both full details and count-only queries
  user_team?: 'A' | 'B' | null;
}

export async function updateMatch(matchId: string, updates: Partial<Match>) {
  const { lat, lng, ...actualUpdates } = updates as any;
  const { data, error } = await supabase
    .from('matches')
    .update(actualUpdates)
    .eq('id', matchId)
    .select()
    .single();

  if (error) throw error;
  return data as Match;
}

export interface MatchParticipant {
  id: string;
  match_id: string;
  user_id: string;
  status: 'confirmed' | 'pending';
  team: 'A' | 'B' | null;
  paid?: boolean;
  created_at: string;
  profiles?: {
    name: string;
    avatar_url?: string;
    position?: string;
  };
}

export interface PlayerRating {
  id?: string;
  match_id: string;
  from_user_id: string;
  to_user_id: string;
  rating: number;
  created_at?: string;
}

export async function getMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(
      `
            *,
            participants:match_participants(count)
        `
    )
    .eq('status', 'published') // Only show active matches
    .order('date', { ascending: true });

  if (error) throw error;
  return data as Match[];
}

export async function getMatchById(id: string) {
  // Step 1: get match + participants (without profile join to avoid FK issues)
  const { data: matchData, error: matchError } = await supabase
    .from('matches')
    .select(
      `
            *,
            participants:match_participants(
                id,
                user_id,
                status,
                team,
                paid,
                created_at
            ),
            recruitment:match_recruitment(*)
        `
    )
    .eq('id', id)
    .single();

  if (matchError) throw matchError;

  // Step 2: enrich participants with profiles (best-effort)
  const participants: any[] = matchData.participants || [];
  if (participants.length > 0) {
    const userIds = participants.map((p: any) => p.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, position')
      .in('id', userIds);

    if (profiles) {
      const profileMap = Object.fromEntries(profiles.map((pr: any) => [pr.id, pr]));
      matchData.participants = participants.map((p: any) => ({
        ...p,
        profiles: profileMap[p.user_id] || null,
      }));
    }
  }

  // Step 3: Defensive score mapping
  if (matchData) {
    matchData.team_a_score = matchData.team_a_score ?? (matchData as any).score_a ?? 0;
    matchData.team_b_score = matchData.team_b_score ?? (matchData as any).score_b ?? 0;
  }

  // Step 4: Sync recruitment fields (robust check)
  const recruitmentData = Array.isArray((matchData as any).recruitment) 
    ? (matchData as any).recruitment[0] 
    : (matchData as any).recruitment;

  if (recruitmentData) {
    matchData.is_recruitment = recruitmentData.is_active;
    (matchData as any).missing_players = recruitmentData.missing_players;
  }

  return matchData;
}

export async function createMatch(matchData: Partial<Match> & { field_id?: string, business_id?: string }) {
  // First, create the match
  const { field_id, business_id, lat, lng, ...insertData } = matchData as any;
  
  // Limpiamos los IDs si vienen como strings vacíos para evitar error de sintaxis UUID en Postgres
  const finalFieldId = field_id === "" ? undefined : field_id;
  const finalBusinessId = business_id === "" ? undefined : business_id;

  const { data, error } = await supabase
    .from('matches')
    .insert([{ 
      ...insertData, 
      is_completed: false, 
      is_private: insertData.is_private ?? false,
      payment_method: insertData.payment_method || 'mercado_pago',
      field_id: finalFieldId,
      business_id: finalBusinessId,
      status: (finalBusinessId && insertData.payment_method === 'mercado_pago') ? 'waiting_deposit' : 'published'
    }])
    .select()
    .single();

  if (error) throw error;
  const match = data as Match;

  // Add recruitment specific entry if needed
  if (match.is_recruitment) {
    await supabase.from('match_recruitment').insert([{
      match_id: match.id,
      missing_players: insertData.missing_players || 1,
      is_active: true
    }]);
  }

  // If this match happens in a registered venue field, automatically book it
  if (finalFieldId && match.date && match.time && match.price !== undefined) {
    try {
       // Convert match time (HH:MM or HH:MM AM/PM) roughly to a proper DB start_time and end_time.
       // E.g. 20:00 to start_time: "20:00:00", end_time: "21:00:00"
       let parsedHour = 20;
       let parsedMin = 0;
       try {
         const timeParts = match.time.split(':');
         parsedHour = parseInt(timeParts[0]);
         parsedMin = parseInt(timeParts[1]);
       } catch(e) {}

       const endHour = (parsedHour + 1) >= 24 ? 0 : parsedHour + 1;
       const startTime = `${parsedHour.toString().padStart(2, '0')}:${parsedMin.toString().padStart(2, '0')}:00`;
       const endTime = `${endHour.toString().padStart(2, '0')}:${parsedMin.toString().padStart(2, '0')}:00`;

       const { error: bookingError } = await supabase.from('canchas_bookings').insert([{
         field_id: finalFieldId,
         booker_id: match.creator_id,
         match_id: match.id,
         date: match.date,
         start_time: startTime,
         end_time: endTime,
         title: `[Pelotify] Partido ${match.type}`,
         total_price: match.price * (match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22), // Total price calculation based on format
         down_payment_paid: 0,
         status: match.payment_method === 'cash' ? 'pending' : 'pending' // Still pending until paid on MP
       }]);

       if (bookingError) console.error("Could not create linked booking:", bookingError);
    } catch(err) {
       console.error("Match to Booking linking failed:", err);
    }
  }

  // Auto-confirm creator in team A
  try {
    await supabase.from('match_participants').insert([
      {
        match_id: match.id,
        user_id: match.creator_id,
        status: 'confirmed',
        team: 'A',
      },
    ]);
  } catch (err) {
    console.error('Error confirming creator:', err);
  }

  return match;
}

export async function joinMatch(matchId: string, userId: string, team: 'A' | 'B' | null = null) {
  // Primero insertamos al participante
  const { error: joinError } = await supabase.from('match_participants').insert([
    {
      match_id: matchId,
      user_id: userId,
      status: 'confirmed',
      team,
    },
  ]);

  if (joinError) throw joinError;

  // Si el partido está en modo reclutamiento, actualizamos el contador y el estado si corresponde
  const { data: match } = await supabase
    .from('matches')
    .select('is_recruitment, missing_players')
    .eq('id', matchId)
    .single();

  if (match?.is_recruitment && (match.missing_players || 0) > 0) {
    const newMissing = Math.max(0, match.missing_players - 1);
    await supabase
      .from('matches')
      .update({ 
        missing_players: newMissing,
        is_recruitment: newMissing > 0 
      })
      .eq('id', matchId);
  }
}

export async function switchTeam(matchId: string, userId: string, team: 'A' | 'B' | null) {
  const { data, error } = await supabase
    .from('match_participants')
    .update({ team })
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(
      'Permiso denegado. Agrega una política UPDATE en match_participants en Supabase.'
    );
  }
}

export async function bulkUpdateParticipants(matchId: string, updates: { user_id: string, team: 'A' | 'B' | null }[]) {
  // We'll do this in a loop or a single call if possible. 
  // Supabase/Postgres doesn't have a built-in multiple row distinct update easily via JS client, 
  // so we'll use a loop or upsert if schema allows. 
  // For now, a Promise.all is fine as we usually have < 22 players.
  const promises = updates.map(u => 
    supabase
      .from('match_participants')
      .update({ team: u.team })
      .eq('match_id', matchId)
      .eq('user_id', u.user_id)
  );
  
  const results = await Promise.all(promises);
  const firstError = results.find(r => r.error)?.error;
  if (firstError) throw firstError;
}

export async function getUserMatches(userId: string) {
  const { data, error } = await supabase
    .from('match_participants')
    .select(
      `
            match_id,
            team,
            matches:matches (*)
        `
    )
    .eq('user_id', userId);

  if (error) throw error;

  return (data || [])
    .map((m) => {
      const match = Array.isArray(m.matches) ? m.matches[0] : m.matches;
      if (!match) return null;

      // Defensive mapping for score fields to handle potential schema cache lag
      return {
        ...match,
        user_team: (m as any).team,
        team_a_score: match.team_a_score ?? (match as any).score_a ?? 0,
        team_b_score: match.team_b_score ?? (match as any).score_b ?? 0,
      } as Match & { user_team?: 'A' | 'B' | null };
    })
    .filter(Boolean) as Match[];
}

export async function leaveMatch(matchId: string, userId: string) {
  const { error } = await supabase
    .from('match_participants')
    .delete()
    .eq('match_id', matchId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function deleteMatch(matchId: string) {
  const { error } = await supabase.from('matches').delete().eq('id', matchId);

  if (error) throw error;
}

export async function submitMatchResult(
  matchId: string,
  scoreA: number,
  scoreB: number,
  goalScorers: any[] = [],
  sportsreelUrl?: string
) {
  const { error } = await supabase
    .from('matches')
    .update({
      team_a_score: scoreA,
      team_b_score: scoreB,
      goal_scorers: goalScorers,
      is_completed: true,
      sportsreel_url: sportsreelUrl || 'https://sportsreel.com/demo-match',
    })
    .eq('id', matchId);

  if (error) throw error;
}

export async function submitPlayerRatings(
  matchId: string,
  ratings: PlayerRating[],
  personalGoals: number
) {
  // 1. Save ratings to a new table (best-effort, might not exist yet)
  try {
    await supabase.from('player_ratings').insert(ratings);
  } catch (err) {
    console.warn('Could not save to player_ratings table. Ensure it exists in Supabase.', err);
  }

  // 2. We'll update stats locally or via profile metadata based on ratings later in the UI logic
  // but we can expose here a way to increment goals.
}

export async function invitePlayer(matchId: string, userId: string) {
  const { error } = await supabase.from('match_participants').insert([
    {
      match_id: matchId,
      user_id: userId,
      status: 'pending',
      team: null,
    },
  ]);

  if (error) {
    if (error.code === '23505') {
      // Unique violation, already invited/joined
      throw new Error('El jugador ya fue invitado o ya está unido al partido.');
    }
    throw error;
  }
}

export async function getMatchInvitations(userId: string) {
  const { data, error } = await supabase
    .from('match_participants')
    .select(
      `
            id,
            match_id,
            status,
            matches (*)
        `
    )
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return data.map((inv) => ({
    ...inv,
    matches: Array.isArray(inv.matches) ? inv.matches[0] : inv.matches,
  }));
}

export async function getMatchInvitationsCount(userId: string) {
  const { count, error } = await supabase
    .from('match_participants')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) {
    console.error('Error fetching match invite count:', error);
    return 0;
  }
  return count || 0;
}

export async function respondToInvitation(participantId: string, status: 'confirmed' | 'rejected') {
  if (status === 'rejected') {
    const { error } = await supabase.from('match_participants').delete().eq('id', participantId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('match_participants')
      .update({ status: 'confirmed' })
      .eq('id', participantId);
    if (error) throw error;
  }
}
export async function reportMatchScore(report: {
  match_id: string;
  reporter_id: string;
  team: 'A' | 'B';
  team_a_score: number;
  team_b_score: number;
  personal_goals: number;
}) {
  // 1. Save the report
  const { error: reportError } = await supabase.from('match_reports').insert([report]);

  if (reportError) {
    if (reportError.code === '23505') {
      throw new Error('Ya enviaste tu reporte para este partido.');
    }
    throw reportError;
  }

  // 2. Check for consensus
  const { data: reports, error: fetchError } = await supabase
    .from('match_reports')
    .select('*')
    .eq('match_id', report.match_id);

  if (fetchError) throw fetchError;

  // Filter reports to get one from each team
  const teamAReports = reports.filter((r) => r.team === 'A');
  const teamBReports = reports.filter((r) => r.team === 'B');

  if (teamAReports.length > 0 && teamBReports.length > 0) {
    const lastA = teamAReports[teamAReports.length - 1];
    const lastB = teamBReports[teamBReports.length - 1];

    if (lastA && lastB) {
      const lastAScoreA = lastA.team_a_score ?? 0;
      const lastAScoreB = lastA.team_b_score ?? 0;
      const lastBScoreA = lastB.team_a_score ?? 0;
      const lastBScoreB = lastB.team_b_score ?? 0;

      if (lastAScoreA === lastBScoreA && lastAScoreB === lastBScoreB) {
        // CONSENSUS REACHED!
        // Call the database function to finalize everything for ALL players
        const { error: finalizeError } = await supabase.rpc('finalize_match_and_sync_stats', {
          p_match_id: report.match_id,
        });

        if (finalizeError) {
          console.error('Error finalizing match stats:', finalizeError);
          // Fallback to basic update if RPC fails
          await submitMatchResult(report.match_id, lastAScoreA, lastAScoreB);
        }

        return { consensus: true, teamAScore: lastAScoreA, teamBScore: lastAScoreB };
      }
    }
  }

  return { consensus: false };
}

export async function getMatchReports(matchId: string) {
  const { data, error } = await supabase
    .from('match_reports')
    .select(
      `
            *,
            profiles:reporter_id(name, avatar_url)
        `
    )
    .eq('match_id', matchId);

  if (error) throw error;
  return data;
}
export async function submitMvpVote(matchId: string, voterId: string, votedPlayerId: string) {
  const { error } = await supabase.from('mvp_votes').insert({
    match_id: matchId,
    voter_id: voterId,
    voted_player_id: votedPlayerId,
  });

  if (error) {
    if (error.code === '23505') return; // Already voted
    throw error;
  }
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase.from('user_badges').select('*').eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function getMatchStats(matchId: string) {
  // 1. Get match to check for persisted goal_scorers
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('goal_scorers, is_completed')
    .eq('id', matchId)
    .single();

  if (matchError) throw matchError;

  // 2. Get MVP votes
  const { data: mvpVotes, error: mvpError } = await supabase
    .from('mvp_votes')
    .select('voted_player_id')
    .eq('match_id', matchId);

  if (mvpError) throw mvpError;

  // Use persisted goal_scorers if match is completed and they exist
  let goalScorers = [];
  if (
    match.is_completed &&
    match.goal_scorers &&
    Array.isArray(match.goal_scorers) &&
    match.goal_scorers.length > 0
  ) {
    goalScorers = match.goal_scorers;
  } else {
    // Fallback to reports if not yet persisted
    const { data: reports, error: reportsError } = await supabase
      .from('match_reports')
      .select('reporter_id, personal_goals, team, profiles:reporter_id(name)')
      .eq('match_id', matchId);

    if (reportsError) throw reportsError;

    goalScorers = reports
      .filter((r) => r.personal_goals > 0)
      .map((r) => ({
        id: r.reporter_id as string,
        name: ((r.profiles as any)?.name || 'Jugador') as string,
        goals: (r.personal_goals || 0) as number,
        team: (r.team || 'A') as 'A' | 'B',
      }));
  }

  // Calculate MVP (Candidate logic with tiebreaker)
  const voteCounts: Record<string, number> = {};
  mvpVotes?.forEach((v) => {
    voteCounts[v.voted_player_id] = (voteCounts[v.voted_player_id] || 0) + 1;
  });

  let maxVotes = 0;
  Object.values(voteCounts).forEach((v) => {
    if (v > maxVotes) maxVotes = v;
  });

  let mvpId = null;
  if (maxVotes > 0) {
    const candidates = Object.entries(voteCounts)
      .filter(([_, count]) => count === maxVotes)
      .map(([id]) => id);

    if (candidates.length > 1) {
      // Tiebreaker: Goles (as defined by user)
      let topScorerId = candidates[0];
      let maxGoals = -1;

      candidates.forEach((id) => {
        const goals = goalScorers.find((gs) => gs.id === id)?.goals || 0;
        if (goals > maxGoals) {
          maxGoals = goals;
          topScorerId = id;
        }
      });
      mvpId = topScorerId;
    } else {
      mvpId = candidates[0];
    }
  }

  let mvpProfile = null;
  if (mvpId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', mvpId)
      .single();
    if (profile) {
      mvpProfile = {
        name: profile.name as string,
        avatar_url: profile.avatar_url as string | undefined,
      };
    }
  }

  return {
    goalScorers: goalScorers || [],
    mvp: mvpProfile ? { id: mvpId as string, ...mvpProfile, votes: maxVotes } : null,
  };
}
