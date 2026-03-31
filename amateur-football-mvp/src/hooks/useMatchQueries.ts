'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  getMatches,
  getMatchById,
  getUserMatches,
  getMatchStats,
  getMatchReports,
  getMatchInvitations,
  getMatchInvitationsCount,
  createMatch,
  joinMatch,
  leaveMatch,
  deleteMatch,
  switchTeam,
  updateMatch,
  submitMatchResult,
  submitPlayerRatings,
  reportMatchScore,
  submitMvpVote,
  invitePlayer,
  respondToInvitation,
  getUserBadges,
  type Match,
  type PlayerRating,
} from '@/lib/matches';

// ═══════════════════════════════════════════════════
//  QUERIES — Read operations with automatic caching
// ═══════════════════════════════════════════════════

/**
 * Fetch all published matches.
 * staleTime from defaults (2min) — navigating away and back is instant.
 */
export function useMatches() {
  return useQuery({
    queryKey: queryKeys.matches.lists(),
    queryFn: getMatches,
  });
}

/**
 * Fetch a single match by ID with enriched participants.
 */
export function useMatchById(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.matches.byId(id!),
    queryFn: () => getMatchById(id!),
    enabled: !!id,
  });
}

/**
 * Fetch matches for a specific user (my matches).
 */
export function useUserMatches(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.userMatches.byUser(userId!),
    queryFn: () => getUserMatches(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch match stats (goal scorers, MVP).
 */
export function useMatchStats(matchId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.matches.stats(matchId!),
    queryFn: () => getMatchStats(matchId!),
    enabled: !!matchId,
  });
}

/**
 * Fetch match reports.
 */
export function useMatchReports(matchId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.matches.reports(matchId!),
    queryFn: () => getMatchReports(matchId!),
    enabled: !!matchId,
  });
}

/**
 * Fetch pending match invitations for a user.
 */
export function useMatchInvitations(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.matches.invitations(userId!),
    queryFn: () => getMatchInvitations(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch the count of pending match invitations.
 */
export function useMatchInvitationsCount(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.matches.invitationsCount(userId!),
    queryFn: () => getMatchInvitationsCount(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // Refresh more often for notifications
  });
}

/**
 * Fetch user badges.
 */
export function useUserBadges(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profiles.badges(userId!),
    queryFn: () => getUserBadges(userId!),
    enabled: !!userId,
  });
}

// ═══════════════════════════════════════════════════
//  MUTATIONS — Write operations with cache invalidation
// ═══════════════════════════════════════════════════

/**
 * Create a new match and invalidate match lists.
 */
export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchData: Parameters<typeof createMatch>[0]) =>
      createMatch(matchData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userMatches.all });
    },
  });
}

/**
 * Join a match. Invalidates both the specific match and user matches.
 */
export function useJoinMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      userId,
      team,
    }: {
      matchId: string;
      userId: string;
      team?: 'A' | 'B' | null;
    }) => joinMatch(matchId, userId, team ?? null),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.byId(matchId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.userMatches.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.lists() });
    },
  });
}

/**
 * Leave a match.
 */
export function useLeaveMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, userId }: { matchId: string; userId: string }) =>
      leaveMatch(matchId, userId),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.byId(matchId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.userMatches.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.lists() });
    },
  });
}

/**
 * Delete a match.
 */
export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => deleteMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userMatches.all });
    },
  });
}

/**
 * Switch team within a match.
 */
export function useSwitchTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      userId,
      team,
    }: {
      matchId: string;
      userId: string;
      team: 'A' | 'B' | null;
    }) => switchTeam(matchId, userId, team),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.byId(matchId),
      });
    },
  });
}

/**
 * Update match details.
 */
export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      updates,
    }: {
      matchId: string;
      updates: Partial<Match>;
    }) => updateMatch(matchId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.byId(data.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.lists() });
    },
  });
}

/**
 * Submit match result (score and goal scorers).
 */
export function useSubmitMatchResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      scoreA,
      scoreB,
      goalScorers,
      sportsreelUrl,
    }: {
      matchId: string;
      scoreA: number;
      scoreB: number;
      goalScorers?: any[];
      sportsreelUrl?: string;
    }) => submitMatchResult(matchId, scoreA, scoreB, goalScorers, sportsreelUrl),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.byId(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.stats(matchId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.userMatches.all });
    },
  });
}

/**
 * Submit player ratings after a match.
 */
export function useSubmitPlayerRatings() {
  return useMutation({
    mutationFn: ({
      matchId,
      ratings,
      personalGoals,
    }: {
      matchId: string;
      ratings: PlayerRating[];
      personalGoals: number;
    }) => submitPlayerRatings(matchId, ratings, personalGoals),
  });
}

/**
 * Report match score (consensus system).
 */
export function useReportMatchScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (report: Parameters<typeof reportMatchScore>[0]) =>
      reportMatchScore(report),
    onSuccess: (result, report) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.byId(report.match_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.reports(report.match_id),
      });
      if (result?.consensus) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.matches.stats(report.match_id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.userMatches.all });
      }
    },
  });
}

/**
 * Submit MVP vote.
 */
export function useSubmitMvpVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      voterId,
      votedPlayerId,
    }: {
      matchId: string;
      voterId: string;
      votedPlayerId: string;
    }) => submitMvpVote(matchId, voterId, votedPlayerId),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.stats(matchId),
      });
    },
  });
}

/**
 * Invite a player to a match.
 */
export function useInvitePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, userId }: { matchId: string; userId: string }) =>
      invitePlayer(matchId, userId),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.byId(matchId),
      });
    },
  });
}

/**
 * Respond to a match invitation (confirm/reject).
 */
export function useRespondToInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participantId,
      status,
    }: {
      participantId: string;
      status: 'confirmed' | 'rejected';
    }) => respondToInvitation(participantId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userMatches.all });
    },
  });
}
