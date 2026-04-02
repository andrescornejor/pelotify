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
    queryKey: ['emergencyMatch', id],
    queryFn: () => getEmergencyMatch(id!),
    enabled: !!id,
    refetchInterval: 3000, 
    retry: 3,
    staleTime: 5000,
  });
}

export function useJoinEmergencyMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, userId }: { matchId: string, userId: string }) => 
      joinEmergencyMatch(matchId, userId),
    onMutate: async ({ matchId, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['emergencyMatch', matchId] });
      const previousMatch = queryClient.getQueryData<any>(['emergencyMatch', matchId]);

      if (previousMatch) {
        // Optimistic update
        const oldMissing = previousMatch.missing_players || 0;
        const newMissing = Math.max(0, oldMissing - 1);
        
        queryClient.setQueryData(['emergencyMatch', matchId], {
          ...previousMatch,
          missing_players: newMissing,
          is_recruitment: newMissing > 0,
          participants: [
            ...(previousMatch.participants || []),
            { 
              user_id: userId, 
              team: null, 
              status: 'confirmed', 
              profiles: { id: userId, name: 'Tú (Uniendo...)', avatar_url: null }
            },
          ],
        });
      }

      return { previousMatch };
    },
    onError: (err, { matchId }, context) => {
      if (context?.previousMatch) {
         queryClient.setQueryData(['emergencyMatch', matchId], context.previousMatch);
      }
    },
    onSettled: (data, error, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyMatch', matchId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });
}

export function useLeaveEmergencyMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, userId }: { matchId: string, userId: string }) => 
      leaveEmergencyMatch(matchId, userId),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyMatch', matchId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });
}
