'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { 
  getRecruitmentMatches, 
  createRecruitmentMatch, 
  joinRecruitmentSlot,
  deleteRecruitmentPosting
} from '@/lib/recruitment';

export function useRecruitmentMatches() {
  return useQuery({
    queryKey: queryKeys.recruitment.lists(),
    queryFn: getRecruitmentMatches,
  });
}

export function useCreateRecruitmentMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Parameters<typeof createRecruitmentMatch>[0]) => createRecruitmentMatch(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });
}

export function useJoinRecruitmentSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slotId, userId }: { slotId: string; userId: string }) => 
      joinRecruitmentSlot(slotId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });
}

export function useDeleteRecruitmentPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postingId: string) => deleteRecruitmentPosting(postingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.all });
    },
  });
}
