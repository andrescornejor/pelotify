import { supabase } from './supabase';
import { Match, MatchParticipant } from './matches';

export async function getEmergencyMatch(id: string) {
  // Step 1: get match + participants + recruitment settings
  const { data: matchData, error: matchError } = await supabase
    .from('matches')
    .select(`
      *,
      recruitment:match_recruitment(*),
      participants:match_participants(*)
    `)
    .eq('id', id)
    .single();

  if (matchError) throw matchError;

  // Step 2: enrich participants with profiles
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

  // Synchronize recruitment fields for UI (backward compatibility)
  if (matchData.recruitment?.[0]) {
    matchData.is_recruitment = matchData.recruitment[0].is_active;
    matchData.missing_players = matchData.recruitment[0].missing_players;
  }

  return matchData as Match & { participants: MatchParticipant[] };
}

export async function joinEmergencyMatch(matchId: string, userId: string): Promise<void> {
  const { error: rpcError } = await supabase.rpc('join_emergency_match_v1', {
    p_match_id: matchId,
    p_user_id: userId
  });

  if (rpcError) throw rpcError;
}

export async function leaveEmergencyMatch(matchId: string, userId: string): Promise<void> {
  const { error: rpcError } = await supabase.rpc('leave_emergency_match_v1', {
    p_match_id: matchId,
    p_user_id: userId
  });

  if (rpcError) throw rpcError;
}
