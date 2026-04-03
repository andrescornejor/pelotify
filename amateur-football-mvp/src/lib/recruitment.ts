import { supabase } from './supabase';
import { Match } from './matches';

export interface RecruitmentSlot {
  id: string;
  match_id: string;
  position: 'GK' | 'DEF' | 'MID' | 'FW' | 'ANY';
  status: 'open' | 'filled';
  user_id: string | null;
  profiles?: {
    name: string;
    avatar_url: string | null;
  };
}

export interface RecruitmentPosting {
  id: string;
  creator_id: string;
  date: string;
  time: string;
  description: string;
  required_skill_level: string; // Updated from skill_level to match matches table
  location: string;
  status: string;
  venue?: {
    name: string;
    address: string;
  };
  slots: RecruitmentSlot[];
}

export async function getRecruitmentMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      venue:business_id(name, address),
      slots:match_slots(
        *,
        profiles:user_id(name, avatar_url)
      )
    `)
    .eq('match_type', 'recruitment')
    .eq('status', 'published') // recruitment matches are 'published'
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching recruitment matches:', error);
    // Fallback to empty array if table doesn't exist yet or other error
    return [] as RecruitmentPosting[];
  }
  
  // Transform to the RecruitmentPosting interface if needed
  // the SQL uses required_skill_level now instead of skill_level
  return (data || []).map(m => ({
    ...m,
    skill_level: m.required_skill_level || 'pro-vibe', // for backward compatibility/typing
  })) as RecruitmentPosting[];
}

export async function createRecruitmentMatch(params: {
    p_creator_id: string;
    p_venue_id: string | null;
    p_date: string;
    p_start_time: string;
    p_end_time: string;
    p_description: string;
    p_skill_level: string;
    p_slots: string[];
}) {
  const { data, error } = await supabase.rpc('create_recruitment_match', params);
  if (error) {
    console.error('RPC Error creating match:', error);
    throw error;
  }
  return data as string; // returns match_id
}

export async function joinRecruitmentSlot(slotId: string, userId: string) {
  // Use the RPC defined in v3 for atomic join process
  const { data, error } = await supabase.rpc('join_recruitment_slot', {
    p_slot_id: slotId,
    p_user_id: userId
  });

  if (error) {
    console.error('RPC Error joining slot:', error);
    throw error;
  }
  return data as boolean;
}

export async function deleteRecruitmentPosting(postingId: string) {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', postingId)
    .eq('match_type', 'recruitment');

  if (error) throw error;
  return true;
}
