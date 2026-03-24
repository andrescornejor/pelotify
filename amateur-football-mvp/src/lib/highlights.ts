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
  // Extract path from URL (e.g., highlights/USER_ID/FILE.mp4)
  const path = videoUrl.split('/public/match-highlights/')[1];
  if (path) {
    const { error: storageError } = await supabase.storage
      .from('match-highlights')
      .remove([path]);
    
    if (storageError) console.error('Error deleting from storage:', storageError);
  }
}
