import { supabase } from './supabase';
import { Match } from './matches';

export interface RecruitmentSlot {
  id: string;
  recruitment_id: string;
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
  skill_level: string;
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
    .from('player_recruitments')
    .select(`
      *,
      venue:business_id(name, address),
      slots:player_recruitment_slots(
        *,
        profiles:user_id(name, avatar_url)
      )
    `)
    .eq('status', 'active')
    .order('date', { ascending: true });

  if (error) throw error;
  
  return data as RecruitmentPosting[];
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
  if (error) throw error;
  return data as string; // returns recruitment_id
}

export async function joinRecruitmentSlot(slotId: string, userId: string) {
  const { data, error } = await supabase
    .from('player_recruitment_slots')
    .update({ user_id: userId, status: 'filled' })
    .eq('id', slotId)
    .eq('status', 'open')
    .select()
    .single();

  if (error) throw error;
  return !!data;
}

export async function deleteRecruitmentPosting(postingId: string) {
  const { error } = await supabase
    .from('player_recruitments')
    .delete()
    .eq('id', postingId);

  if (error) throw error;
  return true;
}
