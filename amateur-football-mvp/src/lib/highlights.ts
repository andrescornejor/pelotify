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
    username: string;
    avatar_url: string;
  };
}

export async function getHighlights(limit = 10) {
  const { data, error } = await supabase
    .from('match_highlights')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching highlights:', error);
    return [];
  }

  return data as unknown as Highlight[];
}

export async function incrementView(highlightId: string) {
  const { error } = await supabase.rpc('increment_highlight_views', { h_id: highlightId });
  if (error) console.error('Error incrementing views:', error);
}
