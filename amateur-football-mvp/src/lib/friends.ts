import { supabase } from './supabase';

export interface Profile {
    id: string;
    name: string;
    avatar_url?: string;
    position?: string;
    elo?: number;
}

export interface SearchResult extends Profile {
    relationshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
    friendshipId?: string;
}

export interface FriendshipData {
    id: string;
    user_id: string;
    friend_id: string;
    status: 'pending' | 'accepted';
    created_at: string;
    profiles?: Profile; // Profile data of the *other* user in the relationship
}

// 1. Get current user's friends (accepted)
export async function getFriends(userId: string) {
    const { data, error } = await supabase
        .from('friendships')
        .select(`
            id, user_id, friend_id, status, created_at
        `)
        .eq('status', 'accepted')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Map through friendships and fetch the profile of the friend (the one who is NOT the current user)
    const result = await Promise.all(data.map(async (f) => {
        const otherUserId = f.user_id === userId ? f.friend_id : f.user_id;
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single();

        return { 
            ...f, 
            profiles: profile || { 
                id: otherUserId, 
                name: 'Jugador',
                avatar_url: null
            } 
        } as FriendshipData;
    }));

    return result;
}

// 2. Get pending requests directed TO the current user
export async function getPendingRequests(userId: string) {
    const { data, error } = await supabase
        .from('friendships')
        .select(`
            id, user_id, friend_id, status, created_at
        `)
        .eq('status', 'pending')
        .eq('friend_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) return [];

    const result = await Promise.all(data.map(async (f) => {
        // First try profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', f.user_id)
            .single();

        return { 
            ...f, 
            profiles: profile || { 
                id: f.user_id, 
                name: 'Jugador',
                avatar_url: null
            } 
        } as FriendshipData;
    }));

    return result;
}

// 2b. Get count of pending requests
export async function getPendingRequestsCount(userId: string) {
    const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('friend_id', userId);

    if (error) {
        console.error("Error fetching count:", error);
        return 0;
    }
    return count || 0;
}

// 3. Search users with relationship status
export async function searchUsers(userId: string, query: string) {
    if (!query || query.length < 2) return [];

    // 1. Find users matching the query
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, position')
        .ilike('name', `%${query}%`)
        .neq('id', userId)
        .limit(10);

    if (error) {
        console.error("Profiles search error:", error);
        throw error;
    }
    if (!users || users.length === 0) return [];

    const userIds = users.map(u => u.id);

    // 2. Find existing any relationships with these users
    const { data: friendships } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .in('user_id', [userId, ...userIds])
        .in('friend_id', [userId, ...userIds]);

    // 3. Map status
    return users.map(u => {
        const rel = friendships?.find(f => 
            (f.user_id === userId && f.friend_id === u.id) || 
            (f.user_id === u.id && f.friend_id === userId)
        );

        let status: SearchResult['relationshipStatus'] = 'none';
        if (rel) {
            if (rel.status === 'accepted') {
                status = 'accepted';
            } else if (rel.user_id === userId) {
                status = 'pending_sent';
            } else {
                status = 'pending_received';
            }
        }

        return {
            ...u,
            relationshipStatus: status,
            friendshipId: rel?.id
        } as SearchResult;
    });
}

// 4. Send a friend request
export async function sendFriendRequest(userId: string, friendId: string) {
    const { error } = await supabase
        .from('friendships')
        .insert([{
            user_id: userId,
            friend_id: friendId,
            status: 'pending'
        }]);

    if (error) throw error;
}

// 5. Accept a friend request
export async function acceptFriendRequest(friendshipId: string) {
    const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId);

    if (error) throw error;
}

// 6. Delete/Reject a friendship or request
export async function deleteFriendship(friendshipId: string) {
    const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

    if (error) throw error;
}
