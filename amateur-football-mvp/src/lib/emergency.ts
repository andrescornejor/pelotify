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

  // 2. Update recruitment table atomic state
  const { data: rec } = await supabase
    .from('match_recruitment')
    .select('missing_players, is_active')
    .eq('match_id', matchId)
    .single();

  if (rec && rec.is_active) {
    const nextMissing = Math.max(0, (rec.missing_players || 0) - 1);
    await supabase
      .from('match_recruitment')
      .update({
        missing_players: nextMissing,
        is_active: nextMissing > 0
      })
      .eq('match_id', matchId);
      
    // Sync back to main table for fallback
    await supabase.from('matches').update({ 
      missing_players: nextMissing,
      is_recruitment: nextMissing > 0 
    }).eq('id', matchId);
  }
}

export async function leaveEmergencyMatch(matchId: string, userId: string) {
  const { error: leaveError } = await supabase
    .from('match_participants')
    .delete()
    .eq('match_id', matchId)
    .eq('user_id', userId);

  if (leaveError) throw leaveError;

  // 2. Re-increment missing players in recruitment table
  const { data: rec } = await supabase
    .from('match_recruitment')
    .select('missing_players, is_active')
    .eq('match_id', matchId)
    .single();

  if (rec) {
    // We assume re-opening recruitment if someone leaves
    const nextMissing = (rec.missing_players || 0) + 1;
    await supabase
      .from('match_recruitment')
      .update({
        missing_players: nextMissing,
        is_active: true
      })
      .eq('match_id', matchId);

    // Sync back to main table
    await supabase.from('matches').update({ 
      missing_players: nextMissing,
      is_recruitment: true 
    }).eq('id', matchId);
  }
}
