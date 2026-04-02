'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { 
  getEmergencyMatch, 
  joinEmergencyMatch, 
  leaveEmergencyMatch 
} from '@/lib/emergency';

export function useEmergencyMatch(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.matches.byId(id!),
    queryFn: () => getEmergencyMatch(id!),
    enabled: !!id,
    refetchInterval: 2000, // Frequent polling for "Live" status during emergency
  });
}

export function useJoinEmergencyMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, userId }: { matchId: string, userId: string }) => 
      joinEmergencyMatch(matchId, userId),
    onMutate: async ({ matchId, userId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.matches.byId(matchId) });
      const previousMatch = queryClient.getQueryData<any>(queryKeys.matches.byId(matchId));

      if (previousMatch) {
        // Optimistic update of ALL fields for emergency feel
        const oldMissing = previousMatch.missing_players || 0;
        const newMissing = Math.max(0, oldMissing - 1);
        
        queryClient.setQueryData(queryKeys.matches.byId(matchId), {
          ...previousMatch,
          missing_players: newMissing,
          is_recruitment: newMissing > 0,
          participants: [
            ...(previousMatch.participants || []),
            { 
              user_id: userId, 
              team: null, 
              status: 'confirmed', 
              profiles: { id: userId, name: 'Uniendo...', avatar_url: null }
            },
          ],
        });
      }

      return { previousMatch };
    },
    onError: (err, { matchId }, context) => {
      if (context?.previousMatch) {
         queryClient.setQueryData(queryKeys.matches.byId(matchId), context.previousMatch);
      }
    },
    onSettled: (data, error, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.byId(matchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.lists() });
    },
  });
}

export function useLeaveEmergencyMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, userId }: { matchId: string, userId: string }) => 
      leaveEmergencyMatch(matchId, userId),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.byId(matchId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.lists() });
    },
  });
}
