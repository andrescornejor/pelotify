import { supabase } from './supabase';

export interface ChatMessage {
    id: string;
    match_id?: string;
    sender_id: string;
    recipient_id?: string;
    content: string;
    is_read?: boolean;
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

export async function getRecentChats(userId: string) {
    const { data, error } = await supabase
        .from('direct_messages')
        .select(`
            sender_id,
            recipient_id,
            content,
            created_at,
            is_read,
            sender:sender_id ( name, avatar_url ),
            recipient:recipient_id ( name, avatar_url )
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching recent chats:', error);
        return [];
    }

    const conversations = new Map<string, any>();
    data.forEach(msg => {
        const otherId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
        if (!conversations.has(otherId)) {
            const isSender = msg.sender_id === userId;
            const otherProfile = isSender ? msg.recipient : msg.sender;
            
            conversations.set(otherId, {
                userId: otherId,
                name: (otherProfile as any)?.name || 'Usuario',
                avatar_url: (otherProfile as any)?.avatar_url,
                lastMessage: msg.content,
                timestamp: msg.created_at,
                isUnread: msg.recipient_id === userId && !msg.is_read
            });
        }
    });

    return Array.from(conversations.values());
}

export async function getUnreadMessagesCount(userId: string) {
    const { count, error } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .neq('sender_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }

    return count || 0;
}

export async function markDirectMessagesAsRead(senderId: string, recipientId: string) {
    const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('recipient_id', recipientId)
        .eq('is_read', false);

    if (error) {
        console.error('Error marking as read:', error);
    }
}

export async function markAllDirectMessagesAsRead(userId: string) {
    const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Error marking all as read:', error);
    }
}
