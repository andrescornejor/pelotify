import { supabase } from './supabase';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  banner_url?: string;
  start_date: string;
  end_date: string;
  location: string;
  type: 'F5' | 'F7' | 'F11';
  max_teams: number;
  entry_fee: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  creator_id?: string;
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
    .select('*, tournament_teams(team_id, status)')
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
