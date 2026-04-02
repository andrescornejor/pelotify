import { supabase } from './supabase';
import { Match, MatchParticipant } from './matches';

export async function getEmergencyMatch(id: string) {
  // Step 1: get match + participants + recruitment settings (try joined table first)
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

  // Defensive Sync: Use recruitment table data if available, otherwise fallback to matches table
  const recData = matchData.recruitment?.[0];
  if (recData) {
    matchData.is_recruitment = recData.is_active;
    matchData.missing_players = recData.missing_players;
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

  // 2. Update recruitment atomic state (Defensive with fallbacks)
  try {
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
        
      // Sync back to main table
      await supabase.from('matches').update({ 
        missing_players: nextMissing,
        is_recruitment: nextMissing > 0 
      }).eq('id', matchId);
    } else {
       // Fallback logic if no record in recruitment table
       throw new Error("No recruitment record found, falling back");
    }
  } catch (e) {
    // Fallback to update matches table directly
    const { data: match } = await supabase
      .from('matches')
      .select('missing_players, is_recruitment')
      .eq('id', matchId)
      .single();

    if (match && match.is_recruitment) {
      const nextMissing = Math.max(0, (match.missing_players || 0) - 1);
      await supabase
        .from('matches')
        .update({ 
          missing_players: nextMissing,
          is_recruitment: nextMissing > 0 
        })
        .eq('id', matchId);
    }
  }
}

export async function leaveEmergencyMatch(matchId: string, userId: string) {
  const { error: leaveError } = await supabase
    .from('match_participants')
    .delete()
    .eq('match_id', matchId)
    .eq('user_id', userId);

  if (leaveError) throw leaveError;

  // 2. Re-increment missing players in recruitment table (Defensive)
  try {
    const { data: rec } = await supabase
      .from('match_recruitment')
      .select('missing_players, is_active')
      .eq('match_id', matchId)
      .single();

    if (rec) {
      const nextMissing = (rec.missing_players || 0) + 1;
      try {
        await supabase
          .from('match_recruitment')
          .update({
            missing_players: nextMissing,
            is_active: true
          })
          .eq('match_id', matchId);
      } catch (e) {
        console.warn("Recruitment table update failed, relying on main table sync");
      }

      // Sync back to main table
      await supabase.from('matches').update({ 
        missing_players: nextMissing,
        is_recruitment: true 
      }).eq('id', matchId);
    } else {
      throw new Error("No recruitment record found");
    }
  } catch (e) {
    // Fallback to update matches table directly
    const { data: match } = await supabase
      .from('matches')
      .select('missing_players, is_recruitment, type')
      .eq('id', matchId)
      .single();

    if (match) {
      const nextMissing = (match.missing_players || 0) + 1;
      await supabase
        .from('matches')
        .update({
          missing_players: nextMissing,
          is_recruitment: true
        })
        .eq('id', matchId);
    }
  }
}
