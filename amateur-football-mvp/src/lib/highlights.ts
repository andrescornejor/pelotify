import { supabase } from './supabase';

export interface Highlight {
  id: string;
  match_id?: string;
  user_id: string;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
  views_count: number;
  likes_count: number;
  profiles: {
    name: string;
    avatar_url: string;
  };
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  highlight_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string;
  };
}

export async function getHighlights(limit = 10) {
  const { data, error } = await supabase
    .from('match_highlights')
    .select(`
      *,
      profiles (
        name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching highlights:', error);
    return [];
  }

  console.log('Highlights fetched:', data);

  return data as unknown as Highlight[];
}

export async function incrementView(highlightId: string) {
  const { error } = await supabase.rpc('increment_highlight_views', { h_id: highlightId });
  if (error) console.error('Error incrementing views:', error);
}

export async function deleteHighlight(id: string, videoUrl: string) {
  // 1. Delete from Database
  const { error: dbError } = await supabase
    .from('match_highlights')
    .delete()
    .eq('id', id);
  
  if (dbError) throw dbError;

  // 2. Delete from Storage
  const path = videoUrl.split('/public/match-highlights/')[1];
  if (path) {
    const { error: storageError } = await supabase.storage
      .from('match-highlights')
      .remove([path]);
    
    if (storageError) console.error('Error deleting from storage:', storageError);
  }
}

export async function toggleLike(highlightId: string, userId: string, isLiked: boolean) {
  if (isLiked) {
    // Unlike
    const { error } = await supabase
      .from('match_highlight_likes')
      .delete()
      .eq('highlight_id', highlightId)
      .eq('user_id', userId);
    if (error) throw error;
  } else {
    // Like
    const { error } = await supabase
      .from('match_highlight_likes')
      .insert({ highlight_id: highlightId, user_id: userId });
    if (error) throw error;
  }
}

export async function checkIfLiked(highlightId: string, userId: string) {
  const { data, error } = await supabase
    .from('match_highlight_likes')
    .select('*')
    .eq('highlight_id', highlightId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) return false;
  return !!data;
}

export async function getComments(highlightId: string) {
  const { data, error } = await supabase
    .from('match_highlight_comments')
    .select(`
      *,
      profiles (
        name,
        avatar_url
      )
    `)
    .eq('highlight_id', highlightId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data as unknown as Comment[];
}

export async function addComment(highlightId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from('match_highlight_comments')
    .insert({
      highlight_id: highlightId,
      user_id: userId,
      content
    })
    .select(`
      *,
      profiles (
        name,
        avatar_url
      )
    `)
    .single();
  
  if (error) throw error;
  return data as unknown as Comment;
}
