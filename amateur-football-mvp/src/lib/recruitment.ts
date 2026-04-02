import { supabase } from './supabase';
import { Match } from './matches';

export interface MatchSlot {
  id: string;
  match_id: string;
  position: 'GK' | 'DEF' | 'MID' | 'FW' | 'ANY';
  status: 'open' | 'filled' | 'pending';
  user_id: string | null;
  profiles?: {
    name: string;
    avatar_url: string | null;
  };
}

export interface RecruitmentMatch extends Match {
  description: string;
  required_skill_level: string;
  venue?: {
    name: string;
    address: string;
  };
  slots: MatchSlot[];
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
    .eq('is_completed', false)
    .order('date', { ascending: true });

  if (error) throw error;
  
  // Mapping business_id relation if manual select didn't work as expected
  return data as RecruitmentMatch[];
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
  return data as string; // returns match_id
}

export async function joinRecruitmentSlot(slotId: string, userId: string) {
  const { data, error } = await supabase.rpc('join_recruitment_slot', {
    p_slot_id: slotId,
    p_user_id: userId
  });
  if (error) throw error;
  return data as boolean;
}
