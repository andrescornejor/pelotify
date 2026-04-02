import { supabase } from './supabase';
import { Match, MatchParticipant } from './matches';

export async function getEmergencyMatch(id: string) {
  // Step 1: get match + participants (without profile join to avoid issues)
  const { data: matchData, error: matchError } = await supabase
    .from('matches')
    .select(`
      *,
      participants:match_participants(
        *
      )
    `)
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

  return matchData as Match & { participants: MatchParticipant[] };
}

export async function joinEmergencyMatch(matchId: string, userId: string) {
  // Use a transaction-like approach or just direct sequence for now
  // 1. Join the match
  const { error: joinError } = await supabase.from('match_participants').insert([
    {
      match_id: matchId,
      user_id: userId,
      status: 'confirmed',
      team: null,
    },
  ]);

  if (joinError) throw joinError;

  // 2. Fetch current state to decrement properly
  const { data: match } = await supabase
    .from('matches')
    .select('missing_players, is_recruitment')
    .eq('id', matchId)
    .single();

  if (match && match.is_recruitment) {
    const nextMissing = Math.max(0, (match.missing_players || 0) - 1);
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        missing_players: nextMissing,
        is_recruitment: nextMissing > 0
      })
      .eq('id', matchId);
    
    if (updateError) throw updateError;
  }
}

export async function leaveEmergencyMatch(matchId: string, userId: string) {
  const { error: leaveError } = await supabase
    .from('match_participants')
    .delete()
    .eq('match_id', matchId)
    .eq('user_id', userId);

  if (leaveError) throw leaveError;

  // Re-increment missing players if it was recruitment
  const { data: match } = await supabase
    .from('matches')
    .select('missing_players, is_recruitment, type')
    .eq('id', matchId)
    .single();

  if (match && match.is_recruitment) {
    const formatNum = parseInt(match.type?.replace('F', '') || '5');
    const totalSlots = formatNum * 2;
    const nextMissing = Math.min(totalSlots, (match.missing_players || 0) + 1);
    
    await supabase
      .from('matches')
      .update({
        missing_players: nextMissing,
        is_recruitment: true
      })
      .eq('id', matchId);
  }
}
