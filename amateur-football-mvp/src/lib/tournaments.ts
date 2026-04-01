import { supabase } from './supabase';

export interface Tournament {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  banner_url?: string | null;
  start_date: string;
  end_date?: string | null;
  location: string;
  type: 'F5' | 'F7' | 'F11';
  max_teams: number;
  entry_fee: number;
  match_fee: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  creator_id?: string;
  prize_percentage?: number;
  prize_description?: string | null;
  field_id?: string | null;
  business_id?: string | null;
  is_private: boolean;
  is_official: boolean;
  created_at: string;
}

export async function createTournament(tournament: Partial<Tournament>) {
  const { data, error } = await supabase
    .from('tournaments')
    .insert([tournament])
    .select()
    .single();

  if (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
  return data;
}

export async function getTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('is_official', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
  return data as Tournament[];
}

export async function getTournamentById(id: string) {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*, tournament_teams(status, teams(id, name, logo_url, captain_id))')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching tournament by id:', error);
    return null;
  }
  return data;
}

export async function registerTeamForTournament(tournamentId: string, teamId: string) {
  const { data, error } = await supabase.rpc('register_team_for_tournament', {
    p_tournament_id: tournamentId,
    p_team_id: teamId,
  });

  if (error) {
    console.error('Error registering team for tournament:', error);
    throw error;
  }
  return data;
}

export async function deleteTournament(id: string) {
  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tournament:', error);
    throw error;
  }
  return true;
}

export async function createTournamentMatches(tournamentId: string, matches: { team_a_id: string, team_b_id: string, round: number, match_number: number }[]) {
  const { data: tournament, error: tErr } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single();
  if (tErr) throw tErr;

  const matchPromises = matches.map(m => {
    return supabase.from('matches').insert([{
      name: `COPA: ${tournament.name} - R${m.round} M${m.match_number}`,
      date: tournament.start_date,
      time: tournament.time || '18:00',
      location: tournament.location,
      type: tournament.type,
      price_per_player: tournament.match_fee,
      creator_id: tournament.creator_id,
      tournament_id: tournamentId,
      tournament_round: m.round,
      tournament_match_number: m.match_number,
      status: 'open',
      team_a_id: m.team_a_id,
      team_b_id: m.team_b_id
    }]).select().single();
  });

  const results = await Promise.all(matchPromises);
  return results.map(r => r.data);
}
