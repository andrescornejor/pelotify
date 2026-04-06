'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  position?: string;
  age?: number;
  height?: number;
  preferred_foot?: string;
  elo?: number;
  matches?: number;
  matches_won?: number;
  mvp_count?: number;
  instagram?: string;
  is_pro?: boolean;
  pro_since?: string;
  updated_at?: string;
}

/**
 * Fetch a profile by ID.
 */
export function useProfile(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profiles.byId(id!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id!)
        .maybeSingle();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!id,
  });
}

/**
 * Update current user profile.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Profile> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.byId(data.id) });
    },
  });
}
