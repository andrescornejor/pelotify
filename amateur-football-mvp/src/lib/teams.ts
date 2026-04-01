import { supabase } from './supabase';

export interface Team {
  id: string;
  name: string;
  description?: string;
  motto?: string;
  founded_date?: string;
  captain_id: string;
  members_count: number;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  goals_for: number;
  goals_against: number;
  level: number;
  xp: number;
  created_at: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  jersey_pattern?: string;
  has_requested?: boolean; // Any relation (pending, requested, confirmed)
  is_member?: boolean; // Only confirmed
  role?: 'captain' | 'member'; // Virtual field for UI state
}

export interface TeamFormation {
  id: string;
  team_id: string;
  name: string;
  layout: any;
  is_active: boolean;
  created_at: string;
}

export interface TeamMessage {
  id: string;
  team_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name: string;
    avatar_url?: string;
  };
}

export interface TeamTrophy {
  id: string;
  team_id: string;
  achievement_type: string;
  title: string;
  description?: string;
  awarded_at: string;
  match_id?: string;
}

export async function getTeams(userId?: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('elo', { ascending: false });

  if (error) throw error;

  const teams = data as Team[];

  if (userId) {
    const { data: memberships } = await supabase
      .from('team_members')
      .select('team_id, status')
      .eq('user_id', userId);

    if (memberships) {
      const requestedIds = new Set(memberships.map((m) => m.team_id));
      const confirmedIds = new Set(
        memberships.filter((m) => m.status === 'confirmed').map((m) => m.team_id)
      );
      return teams.map((t) => ({
        ...t,
        has_requested: requestedIds.has(t.id),
        is_member: confirmedIds.has(t.id),
      }));
    }
  }

  return teams;
}

export async function getTeamById(id: string) {
  const { data, error } = await supabase.from('teams').select('*').eq('id', id).single();

  if (error) throw error;
  return data as Team;
}

export async function createTeam(
  name: string,
  description: string,
  captainId: string,
  logoUrl?: string,
  primaryColor?: string,
  secondaryColor?: string,
  jerseyPattern?: string
) {
  const { data, error } = await supabase
    .from('teams')
    .insert([
      {
        name,
        description,
        captain_id: captainId,
        logo_url: logoUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        jersey_pattern: jerseyPattern,
        members_count: 0, // Trigger will set it to 1 when adding captain
        elo: 0,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Team;
}

export async function joinTeam(
  teamId: string,
  userId: string,
  role: 'captain' | 'member' = 'member'
) {
  const { error } = await supabase.from('team_members').upsert(
    {
      team_id: teamId,
      user_id: userId,
      profile_id: userId,
      status: role === 'captain' ? 'confirmed' : 'requested', // Captain is auto-confirmed, member joins are requests
      role: role,
    },
    { onConflict: 'team_id,user_id' }
  );

  if (error) throw error;
}

export async function getUserTeams(userId: string) {
  // 1. Get teams where user is a member
  const { data: memberData, error: memberError } = await supabase
    .from('team_members')
    .select(`
            team_id,
            role,
            teams (*)
        `)
    .eq('user_id', userId)
    .eq('status', 'confirmed');

  if (memberError) throw memberError;

  // 2. Get teams where user is the captain directly (as a fallback)
  const { data: captainData, error: captainError } = await supabase
    .from('teams')
    .select('*')
    .eq('captain_id', userId);

  if (captainError) throw captainError;

  const memberTeams = (memberData || []).map((m: any) => ({
    ...(Array.isArray(m.teams) ? m.teams[0] : m.teams),
    role: m.role || (m.teams?.captain_id === userId ? 'captain' : 'member'),
  }));

  const captainTeams = (captainData || []).map((t: any) => ({
    ...t,
    role: 'captain' as const,
  }));

  // Merge and deduplicate by team ID
  const allTeamsMap = new Map();
  [...memberTeams, ...captainTeams].forEach(t => {
    if (t && t.id) {
       // If we already have it and it's a 'member' role, but this new one is 'captain', override
       if (!allTeamsMap.has(t.id) || t.role === 'captain') {
         allTeamsMap.set(t.id, t);
       }
    }
  });

  return Array.from(allTeamsMap.values());
}

export async function leaveTeam(teamId: string, userId: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateTeam(teamId: string, updates: Partial<Team>) {
  const { data, error } = await supabase.from('teams').update(updates).eq('id', teamId).select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(
      'No se pudo actualizar el equipo. Verifica que seas el capitán y tengas permisos.'
    );
  }
  return data[0] as Team;
}

export async function deleteTeam(teamId: string) {
  const { error } = await supabase.from('teams').delete().eq('id', teamId);

  if (error) throw error;
}

export async function getTeamMembers(teamId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select(
      `
            user_id,
            role,
            status,
            profiles:profile_id (
                name,
                avatar_url,
                position,
                elo
            )
        `
    )
    .eq('team_id', teamId);

  if (error) throw error;
  return data;
}

export async function getTeamRequests(teamId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select(
      `
            user_id,
            role,
            status,
            profiles:profile_id (
                name,
                avatar_url,
                position,
                elo
            )
        `
    )
    .eq('status', 'requested')
    .eq('role', 'member');

  if (error) throw error;
  return data;
}

export async function inviteToTeam(teamId: string, userId: string) {
  const { error } = await supabase.from('team_members').insert([
    {
      team_id: teamId,
      user_id: userId,
      profile_id: userId,
      status: 'pending',
      role: 'member',
    },
  ]);

  if (error) {
    if (error.code === '23505') {
      throw new Error('El jugador ya fue invitado o ya es parte del equipo.');
    }
    throw error;
  }
}

export async function respondToTeamInvitation(
  teamId: string,
  userId: string,
  action: 'accept' | 'decline'
) {
  if (action === 'decline') {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('team_members')
      .update({ status: 'confirmed' })
      .eq('team_id', teamId)
      .eq('user_id', userId);
    if (error) throw error;
  }
}
export async function getTotalPlayersCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching total players count:', error);
    return 0;
  }
  return count || 0;
}

export async function getTeamInvitations(userId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select(
      `
            team_id,
            teams:team_id (
                name,
                logo_url
            )
        `
    )
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return data;
}

export async function getTeamInvitationsCount(userId: string) {
  const { count, error } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return count || 0;
}

export async function getTeamTrophies(teamId: string) {
  const { data, error } = await supabase
    .from('team_trophies')
    .select('*')
    .eq('team_id', teamId)
    .order('awarded_at', { ascending: false });

  if (error) throw error;
  return data as TeamTrophy[];
}

export async function getTeamFormations(teamId: string): Promise<TeamFormation[]> {
  const { data, error } = await supabase
    .from('team_formations')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function upsertTeamFormation(formation: Partial<TeamFormation>) {
  const { data, error } = await supabase
    .from('team_formations')
    .upsert(formation)
    .select()
    .single();

  if (error) throw error;
  return data as TeamFormation;
}

export async function getTeamH2H(team1Id: string, team2Id: string) {
  const t1 = team1Id < team2Id ? team1Id : team2Id;
  const t2 = team1Id < team1Id ? team2Id : team1Id;

  const { data, error } = await supabase
    .from('team_h2h_view')
    .select('*')
    .eq('team_1_id', t1)
    .eq('team_2_id', t2)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
  return data;
}

export async function getTeamMessages(teamId: string): Promise<TeamMessage[]> {
  const { data, error } = await supabase
    .from('team_messages')
    .select(
      `
            *,
            profiles:user_id (name, avatar_url)
        `
    )
    .eq('team_id', teamId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendTeamMessage(teamId: string, userId: string, content: string) {
  const { error } = await supabase
    .from('team_messages')
    .insert({ team_id: teamId, user_id: userId, content });

  if (error) throw error;
}

export async function getPendingJoinRequestsForCaptain(captainId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select(
      `
            team_id,
            user_id,
            status,
            role,
            teams!inner (
                name,
                logo_url,
                captain_id
            ),
            profiles:profile_id (
                name,
                avatar_url,
                position
            )
        `
    )
    .eq('status', 'requested')
    .eq('role', 'member')
    .eq('teams.captain_id', captainId);

  if (error) throw error;
  return data;
}

export async function getPendingJoinRequestsCountForCaptain(captainId: string) {
  const { count, error } = await supabase
    .from('team_members')
    .select(
      `
            team_id,
            teams!inner (
                captain_id
            )
        `,
      { count: 'exact', head: true }
    )
    .eq('status', 'requested')
    .eq('role', 'member')
    .eq('teams.captain_id', captainId);

  if (error) throw error;
  return count || 0;
}
