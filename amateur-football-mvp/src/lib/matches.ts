import { supabase } from './supabase';

export interface Match {
    id: string;
    location: string;
    date: string;
    time: string;
    type: 'F5' | 'F7' | 'F11';
    level: string;
    missing_players: number;
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
    is_private?: boolean;
    participants?: { count: number }[];
}

export interface MatchParticipant {
    id: string;
    match_id: string;
    user_id: string;
    status: 'confirmed' | 'pending';
    team: 'A' | 'B' | null;
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
        .select(`
            *,
            participants:match_participants(count)
        `)
        .order('date', { ascending: true });

    if (error) throw error;
    return data as Match[];
}

export async function getMatchById(id: string) {
    // Step 1: get match + participants (without profile join to avoid FK issues)
    const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
            *,
            participants:match_participants(
                id,
                user_id,
                status,
                team,
                created_at
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

    // Step 3: Defensive score mapping
    if (matchData) {
        matchData.team_a_score = matchData.team_a_score ?? (matchData as any).score_a ?? 0;
        matchData.team_b_score = matchData.team_b_score ?? (matchData as any).score_b ?? 0;
    }

    return matchData;
}

export async function createMatch(matchData: Partial<Match>) {
    const { data, error } = await supabase
        .from('matches')
        .insert([{ ...matchData, is_completed: false, is_private: matchData.is_private ?? false }])
        .select()
        .single();

    if (error) throw error;
    const match = data as Match;

    // Auto-confirm creator in team A
    try {
        await supabase.from('match_participants').insert([
            {
                match_id: match.id,
                user_id: match.creator_id,
                status: 'confirmed',
                team: 'A'
            }
        ]);
    } catch (err) {
        console.error('Error confirming creator:', err);
    }

    return match;
}

export async function joinMatch(matchId: string, userId: string, team: 'A' | 'B' | null = null) {
    const { error } = await supabase
        .from('match_participants')
        .insert([
            {
                match_id: matchId,
                user_id: userId,
                status: 'confirmed',
                team
            }
        ]);

    if (error) throw error;
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
        throw new Error('Permiso denegado. Agrega una política UPDATE en match_participants en Supabase.');
    }
}

export async function getUserMatches(userId: string) {
    const { data, error } = await supabase
        .from('match_participants')
        .select(`
            match_id,
            matches:matches (*)
        `)
        .eq('user_id', userId);

    if (error) throw error;
    
    return (data || []).map(m => {
        const match = Array.isArray(m.matches) ? m.matches[0] : m.matches;
        if (!match) return null;
        
        // Defensive mapping for score fields to handle potential schema cache lag
        return {
            ...match,
            team_a_score: match.team_a_score ?? (match as any).score_a ?? 0,
            team_b_score: match.team_b_score ?? (match as any).score_b ?? 0
        } as Match;
    }).filter(Boolean) as Match[];
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
    const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

    if (error) throw error;
}

export async function submitMatchResult(matchId: string, scoreA: number, scoreB: number, goalScorers: any[] = [], sportsreelUrl?: string) {
    const { error } = await supabase
        .from('matches')
        .update({
            team_a_score: scoreA,
            team_b_score: scoreB,
            goal_scorers: goalScorers,
            is_completed: true,
            sportsreel_url: sportsreelUrl || 'https://sportsreel.com/demo-match'
        })
        .eq('id', matchId);

    if (error) throw error;
}

export async function submitPlayerRatings(matchId: string, ratings: PlayerRating[], personalGoals: number) {
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
    const { error } = await supabase
        .from('match_participants')
        .insert([
            {
                match_id: matchId,
                user_id: userId,
                status: 'pending',
                team: null
            }
        ]);

    if (error) {
        if (error.code === '23505') { // Unique violation, already invited/joined
            throw new Error('El jugador ya fue invitado o ya está unido al partido.');
        }
        throw error;
    }
}

export async function getMatchInvitations(userId: string) {
    const { data, error } = await supabase
        .from('match_participants')
        .select(`
            id,
            match_id,
            status,
            matches (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'pending');

    if (error) throw error;
    return data.map(inv => ({
        ...inv,
        matches: Array.isArray(inv.matches) ? inv.matches[0] : inv.matches
    }));
}

export async function getMatchInvitationsCount(userId: string) {
    const { count, error } = await supabase
        .from('match_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending');

    if (error) {
        console.error("Error fetching match invite count:", error);
        return 0;
    }
    return count || 0;
}

export async function respondToInvitation(participantId: string, status: 'confirmed' | 'rejected') {
    if (status === 'rejected') {
        const { error } = await supabase
            .from('match_participants')
            .delete()
            .eq('id', participantId);
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
    const { error: reportError } = await supabase
        .from('match_reports')
        .insert([report]);

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
    const teamAReports = reports.filter(r => r.team === 'A');
    const teamBReports = reports.filter(r => r.team === 'B');

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
                    p_match_id: report.match_id
                });

                if (finalizeError) {
                    console.error("Error finalizing match stats:", finalizeError);
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
        .select(`
            *,
            profiles:reporter_id(name, avatar_url)
        `)
        .eq('match_id', matchId);

    if (error) throw error;
    return data;
}
export async function submitMvpVote(matchId: string, voterId: string, votedPlayerId: string) {
    const { error } = await supabase
        .from('mvp_votes')
        .insert({
            match_id: matchId,
            voter_id: voterId,
            voted_player_id: votedPlayerId
        });

    if (error) {
        if (error.code === '23505') return; // Already voted
        throw error;
    }
}

export async function getUserBadges(userId: string) {
    const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

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
    if (match.is_completed && match.goal_scorers && Array.isArray(match.goal_scorers) && match.goal_scorers.length > 0) {
        goalScorers = match.goal_scorers;
    } else {
        // Fallback to reports if not yet persisted
        const { data: reports, error: reportsError } = await supabase
            .from('match_reports')
            .select('reporter_id, personal_goals, team, profiles:reporter_id(name)')
            .eq('match_id', matchId);

        if (reportsError) throw reportsError;

        goalScorers = reports
            .filter(r => r.personal_goals > 0)
            .map(r => ({
                id: r.reporter_id,
                name: (r.profiles as any)?.name || 'Jugador',
                goals: r.personal_goals,
                team: r.team
            }));
    }

    // Calculate MVP
    const voteCounts: Record<string, number> = {};
    mvpVotes?.forEach(v => {
        voteCounts[v.voted_player_id] = (voteCounts[v.voted_player_id] || 0) + 1;
    });

    let mvpId = null;
    let maxVotes = 0;
    for (const [id, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) {
            maxVotes = count;
            mvpId = id;
        }
    }

    let mvpProfile = null;
    if (mvpId) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', mvpId)
            .single();
        mvpProfile = profile;
    }

    return {
        goalScorers,
        mvp: mvpProfile ? { id: mvpId, ...mvpProfile, votes: maxVotes } : null
    };
}
