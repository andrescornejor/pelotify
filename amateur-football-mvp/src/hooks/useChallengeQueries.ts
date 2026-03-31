'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  getTeamChallenges,
  getPendingChallengesForCaptain,
  getPendingChallengesCountForCaptain,
  getPendingChallengesForMember,
  createTeamChallenge,
  respondToChallenge,
  voteForVenue,
  cancelChallenge,
} from '@/lib/teamChallenges';

// ═══════════════════════════════════════════════════
//  QUERIES
// ═══════════════════════════════════════════════════

/**
 * Fetch team challenges.
 */
export function useTeamChallenges(
  teamId: string | undefined,
  role: 'challenger' | 'challenged' | 'both' = 'both'
) {
  return useQuery({
    queryKey: queryKeys.challenges.byTeam(teamId!),
    queryFn: () => getTeamChallenges(teamId!, role),
    enabled: !!teamId,
  });
}

/**
 * Fetch pending challenges for captain.
 */
export function usePendingChallengesForCaptain(
  userId: string | undefined
) {
  return useQuery({
    queryKey: queryKeys.challenges.pendingForCaptain(userId!),
    queryFn: () => getPendingChallengesForCaptain(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch pending challenges count for captain.
 */
export function usePendingChallengesCountForCaptain(
  userId: string | undefined
) {
  return useQuery({
    queryKey: queryKeys.challenges.pendingCountForCaptain(userId!),
    queryFn: () => getPendingChallengesCountForCaptain(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch pending challenges for member.
 */
export function usePendingChallengesForMember(
  userId: string | undefined
) {
  return useQuery({
    queryKey: queryKeys.challenges.pendingForMember(userId!),
    queryFn: () => getPendingChallengesForMember(userId!),
    enabled: !!userId,
  });
}

// ═══════════════════════════════════════════════════
//  MUTATIONS
// ═══════════════════════════════════════════════════

/**
 * Create a team challenge.
 */
export function useCreateTeamChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      challengerTeamId,
      challengedTeamId,
      date,
      time,
      location,
      message,
      price,
      venueCandidates,
    }: {
      challengerTeamId: string;
      challengedTeamId: string;
      date: string;
      time: string;
      location: string;
      message?: string;
      price?: number;
      venueCandidates?: string[];
    }) =>
      createTeamChallenge(
        challengerTeamId,
        challengedTeamId,
        date,
        time,
        location,
        message,
        price,
        venueCandidates
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.all });
    },
  });
}

/**
 * Respond to a challenge (accept/decline).
 */
export function useRespondToChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      challengeId,
      status,
    }: {
      challengeId: string;
      status: 'accepted' | 'declined';
    }) => respondToChallenge(challengeId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userMatches.all });
    },
  });
}

/**
 * Vote for a venue in a challenge.
 */
export function useVoteForVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      challengeId,
      userId,
      venueName,
    }: {
      challengeId: string;
      userId: string;
      venueName: string;
    }) => voteForVenue(challengeId, userId, venueName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.all });
    },
  });
}

/**
 * Cancel a challenge.
 */
export function useCancelChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (challengeId: string) => cancelChallenge(challengeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.all });
    },
  });
}
