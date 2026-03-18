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
    message?: string
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
            }
        ])
        .select()
        .single();

    if (error) throw error;
    return data as TeamChallenge;
}

export async function getTeamChallenges(teamId: string, role: 'challenger' | 'challenged' | 'both' = 'both') {
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

export async function respondToChallenge(challengeId: string, status: 'accepted' | 'declined') {
    const { data, error } = await supabase
        .from('team_challenges')
        .update({ status })
        .eq('id', challengeId)
        .select()
        .single();

    if (error) throw error;
    return data as TeamChallenge;
}

export async function cancelChallenge(challengeId: string) {
    const { error } = await supabase
        .from('team_challenges')
        .delete()
        .eq('id', challengeId);

    if (error) throw error;
}
