import { supabase } from './supabase';

export interface TeamChallenge {
  id: string;
  challenger_team_id: string;
  challenged_team_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  match_date: string;
  match_time: string;
  location: string;
  message?: string;
  price?: number;
  venue_candidates?: string[];
  votes?: Record<string, string>;
  created_at: string;
  challenger_team?: any;
  challenged_team?: any;
}

export async function createTeamChallenge(
  challengerTeamId: string,
  challengedTeamId: string,
  date: string,
  time: string,
  location: string,
  message?: string,
  price?: number,
  venueCandidates?: string[]
) {
  const { data, error } = await supabase
    .from('team_challenges')
    .insert([
      {
        challenger_team_id: challengerTeamId,
        challenged_team_id: challengedTeamId,
        match_date: date,
        match_time: time,
        location: location,
        message: message,
        price: price,
        venue_candidates: venueCandidates,
        votes: {},
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as TeamChallenge;
}

export async function getTeamChallenges(
  teamId: string,
  role: 'challenger' | 'challenged' | 'both' = 'both'
) {
  let query = supabase.from('team_challenges').select(`
        *,
        challenger_team:teams!challenger_team_id(*),
        challenged_team:teams!challenged_team_id(*)
    `);

  if (role === 'challenger') {
    query = query.eq('challenger_team_id', teamId);
  } else if (role === 'challenged') {
    query = query.eq('challenged_team_id', teamId);
  } else {
    query = query.or(`challenger_team_id.eq.${teamId},challenged_team_id.eq.${teamId}`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as TeamChallenge[];
}

export async function getPendingChallengesForCaptain(userId: string) {
  const { data, error } = await supabase
    .from('team_challenges')
    .select(
      `
            *,
            challenger_team:teams!challenger_team_id(*),
            challenged_team:teams!challenged_team_id!inner(*)
        `
    )
    .eq('status', 'pending')
    .eq('challenged_team.captain_id', userId);

  if (error) throw error;
  return data as TeamChallenge[];
}

export async function getPendingChallengesCountForCaptain(userId: string) {
  const { count, error } = await supabase
    .from('team_challenges')
    .select(
      `
            id,
            challenged_team:teams!challenged_team_id!inner(captain_id)
        `,
      { count: 'exact', head: true }
    )
    .eq('status', 'pending')
    .eq('challenged_team.captain_id', userId);

  if (error) throw error;
  return count || 0;
}

export async function getPendingChallengesForMember(userId: string) {
  // 1. Get teams where user is a confirmed member
  const { data: memberships, error: memError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId)
    .eq('status', 'confirmed');

  if (memError) throw memError;
  if (!memberships || memberships.length === 0) return [];

  const teamIds = Array.from(new Set(memberships.map((m) => m.team_id)));

  // 2. Get pending challenges for those teams
  const { data, error } = await supabase
    .from('team_challenges')
    .select(
      `
            *,
            challenger_team:teams!challenger_team_id(id, name, logo_url, captain_id),
            challenged_team:teams!challenged_team_id(id, name, logo_url, captain_id)
        `
    )
    .eq('status', 'pending')
    .or(
      `challenger_team_id.in.(${teamIds.join(',')}),challenged_team_id.in.(${teamIds.join(',')})`
    );

  if (error) throw error;
  return data as TeamChallenge[];
}

export async function respondToChallenge(challengeId: string, status: 'accepted' | 'declined') {
  if (status === 'accepted') {
    // 1. Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('team_challenges')
      .select(
        `
                *,
                challenger_team:teams!challenger_team_id(*),
                challenged_team:teams!challenged_team_id(*)
            `
      )
      .eq('id', challengeId)
      .single();

    if (challengeError) throw challengeError;

    // 2. Create the match
    const { createMatch } = await import('./matches');
    // Determine location based on votes if candidates exist
    let finalLocation = challenge.location;
    if (challenge.venue_candidates && challenge.venue_candidates.length > 0 && challenge.votes) {
      const voteCounts: Record<string, number> = {};
      Object.values(challenge.votes).forEach((venue: any) => {
        voteCounts[venue] = (voteCounts[venue] || 0) + 1;
      });

      let maxVotes = -1;
      let winner = challenge.location;

      challenge.venue_candidates.forEach((venue: string) => {
        const count = voteCounts[venue] || 0;
        if (count > maxVotes) {
          maxVotes = count;
          winner = venue;
        }
      });
      finalLocation = winner;
    }

    const matchData = {
      location: finalLocation,
      date: challenge.match_date,
      time: challenge.match_time,
      type: 'F5' as any, // Default to F5, or we could add type to challenge
      level: 'Amateur',
      missing_players: 0,
      price: challenge.price || 0,
      creator_id: challenge.challenged_team.captain_id,
      team_a_id: challenge.challenger_team_id,
      team_b_id: challenge.challenged_team_id,
      team_a_name: challenge.challenger_team.name,
      team_b_name: challenge.challenged_team.name,
      is_private: true,
    };

    const newMatch = await createMatch(matchData);

    // 3. Add members of both teams as participants
    const { getTeamMembers } = await import('./teams');
    const [challengerMembers, challengedMembers] = await Promise.all([
      getTeamMembers(challenge.challenger_team_id),
      getTeamMembers(challenge.challenged_team_id),
    ]);

    const participantsToAdd = [
      ...challengerMembers
        .filter((m) => m.status === 'confirmed')
        .map((m) => ({
          match_id: newMatch.id,
          user_id: m.user_id,
          status: 'confirmed',
          team: 'A',
        })),
      ...challengedMembers
        .filter((m) => m.status === 'confirmed')
        .map((m) => ({
          match_id: newMatch.id,
          user_id: m.user_id,
          status: 'confirmed',
          team: 'B',
        })),
    ];

    // Bulk insert participants (ignoring duplicates if any)
    if (participantsToAdd.length > 0) {
      const { error: partError } = await supabase
        .from('match_participants')
        .upsert(participantsToAdd, { onConflict: 'match_id,user_id' });

      if (partError) console.error('Error adding team members to match:', partError);
    }
  }

  const { data, error } = await supabase
    .from('team_challenges')
    .update({ status })
    .eq('id', challengeId)
    .select()
    .single();

  if (error) throw error;
  return data as TeamChallenge;
}

export async function voteForVenue(challengeId: string, userId: string, venueName: string) {
  // 1. Get current votes
  const { data: challenge, error: getError } = await supabase
    .from('team_challenges')
    .select('votes')
    .eq('id', challengeId)
    .single();

  if (getError) throw getError;

  const currentVotes = (challenge.votes || {}) as Record<string, string>;
  const newVotes = { ...currentVotes, [userId]: venueName };

  const { error: updateError } = await supabase
    .from('team_challenges')
    .update({ votes: newVotes })
    .eq('id', challengeId);

  if (updateError) throw updateError;
}

export async function cancelChallenge(challengeId: string) {
  const { error } = await supabase.from('team_challenges').delete().eq('id', challengeId);

  if (error) throw error;
}
