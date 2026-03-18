import { supabase } from './supabase';

export interface ChatMessage {
    id: string;
    match_id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: {
        name: string;
        avatar_url?: string;
    };
}

export async function getMessages(matchId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('match_messages')
        .select(`
            id,
            match_id,
            user_id,
            content,
            created_at,
            profiles:user_id (
                name,
                avatar_url
            )
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as any[]) || [];
}

export async function sendMessage(matchId: string, userId: string, content: string): Promise<void> {
    const { error } = await supabase
        .from('match_messages')
        .insert({ match_id: matchId, user_id: userId, content: content.trim() });

    if (error) throw error;
}

export function subscribeToMessages(
    matchId: string,
    onMessage: (msg: ChatMessage) => void
) {
    return supabase
        .channel(`match-chat-${matchId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'match_messages',
                filter: `match_id=eq.${matchId}`,
            },
            async (payload) => {
                // Fetch the new message with profile data
                const { data } = await supabase
                    .from('match_messages')
                    .select(`
                        id, match_id, user_id, content, created_at,
                        profiles:user_id ( name, avatar_url )
                    `)
                    .eq('id', payload.new.id)
                    .single();

                if (data) onMessage(data as any);
            }
        )
        .subscribe();
}
