import { supabase } from './supabase';

export interface ChatMessage {
    id: string;
    match_id?: string;
    sender_id: string;
    recipient_id?: string;
    content: string;
    created_at: string;
    profiles?: {
        name: string;
        avatar_url?: string;
    };
}

// For Match Lobby Chat
export async function getMatchMessages(matchId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('match_messages')
        .select(`
            id,
            match_id,
            sender_id:user_id,
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
    // Map sender_id correctly
    return (data as any[]).map(m => ({ ...m, sender_id: m.sender_id })) || [];
}

export async function sendMatchMessage(matchId: string, userId: string, content: string): Promise<void> {
    const { error } = await supabase
        .from('match_messages')
        .insert({ match_id: matchId, user_id: userId, content: content.trim() });

    if (error) throw error;
}

// For Direct Messages (To be implemented in DB if not exists)
export async function getDirectMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('direct_messages')
        .select(`
            id,
            sender_id,
            recipient_id,
            content,
            created_at,
            profiles:sender_id (
                name,
                avatar_url
            )
        `)
        .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as any[]) || [];
}

export async function sendDirectMessage(senderId: string, recipientId: string, content: string): Promise<void> {
    const { error } = await supabase
        .from('direct_messages')
        .insert({ sender_id: senderId, recipient_id: recipientId, content: content.trim() });

    if (error) throw error;
}

export function subscribeToMatchMessages(
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
                const { data } = await supabase
                    .from('match_messages')
                    .select(`
                        id, match_id, sender_id:user_id, content, created_at,
                        profiles:user_id ( name, avatar_url )
                    `)
                    .eq('id', payload.new.id)
                    .single();

                if (data) onMessage(data as any);
            }
        )
        .subscribe();
}

export function subscribeToDirectMessages(
    userId: string,
    onMessage: (msg: ChatMessage) => void
) {
    return supabase
        .channel(`direct-chat-${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'direct_messages',
                filter: `recipient_id=eq.${userId}`,
            },
            async (payload) => {
                const { data } = await supabase
                    .from('direct_messages')
                    .select(`
                        id, sender_id, recipient_id, content, created_at,
                        profiles:sender_id ( name, avatar_url )
                    `)
                    .eq('id', payload.new.id)
                    .single();

                if (data) onMessage(data as any);
            }
        )
        .subscribe();
}
