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
  skill_level: string;
  required_skill_level?: string;
  location: string;
  status: string;
  venue?: {
    name: string;
    address: string;
  };
  slots: RecruitmentSlot[];
}

export async function getRecruitmentMatches() {
  console.log('Fetching recruitment matches...');
  
  // Step 1: Try the NEW schema (matches table with match_type='recruitment')
  // We remove the status filter to see if they are being created with a different status
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
    .order('date', { ascending: true });

  if (!error && data && data.length > 0) {
    console.log('Found matches in NEW schema:', data.length);
    return data.map(m => ({
      ...m,
      skill_level: m.required_skill_level || m.level || 'pro-vibe',
    })) as RecruitmentPosting[];
  }

  // Step 2: Fallback to OLD schema
  console.log('No matches in NEW schema or error, trying OLD schema...');
  const { data: oldData, error: oldError } = await supabase
    .from('player_recruitments')
    .select(`
      *,
      venue:business_id(name, address),
      slots:player_recruitment_slots(
        *,
        profiles:user_id(name, avatar_url)
      )
    `)
    .order('date', { ascending: true });

  if (oldError) {
    console.error('Recruitment fetch error (Old Schema):', oldError.message);
    // If BOTH failed, it's a real error
    if (error) console.error('Recruitment fetch error (New Schema):', error.message);
    return [] as RecruitmentPosting[];
  }
  
  console.log('Found matches in OLD schema:', oldData?.length || 0);
  return (oldData || []) as RecruitmentPosting[];
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
  return data as string;
}

export async function joinRecruitmentSlot(slotId: string, userId: string) {
  const { data: newResult, error: newError } = await supabase.rpc('join_recruitment_slot', {
    p_slot_id: slotId,
    p_user_id: userId
  });

  if (!newError) return !!newResult;

  const { data, error } = await supabase
    .from('player_recruitment_slots')
    .update({ user_id: userId, status: 'filled' })
    .eq('id', slotId)
    .eq('status', 'open')
    .select()
    .single();

  if (error) {
     const { data: lastTry, error: lastError } = await supabase
      .from('match_slots')
      .update({ user_id: userId, status: 'filled' })
      .eq('id', slotId)
      .eq('status', 'open')
      .select()
      .single();
      
     if (lastError) throw lastError;
     return !!lastTry;
  }
  return !!data;
}

export async function deleteRecruitmentPosting(postingId: string) {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', postingId)
    .eq('match_type', 'recruitment');

  if (error) {
    const { error: oldError } = await supabase
      .from('player_recruitments')
      .delete()
      .eq('id', postingId);
    if (oldError) throw oldError;
  }
  return true;
}
