'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  getTeams,
  getTeamById,
  getUserTeams,
  getTeamMembers,
  getTeamRequests,
  getTeamFormations,
  getTeamTrophies,
  getTeamMessages,
  getTeamInvitations,
  getTeamInvitationsCount,
  getPendingJoinRequestsForCaptain,
  getPendingJoinRequestsCountForCaptain,
  getTotalPlayersCount,
  createTeam,
  joinTeam,
  leaveTeam,
  updateTeam,
  deleteTeam,
  inviteToTeam,
  respondToTeamInvitation,
  sendTeamMessage,
  upsertTeamFormation,
  type Team,
  type TeamFormation,
} from '@/lib/teams';

// ═══════════════════════════════════════════════════
//  QUERIES
// ═══════════════════════════════════════════════════

/**
 * Fetch all teams, optionally enriched with user membership status.
 */
export function useTeams(userId?: string) {
  return useQuery({
    queryKey: queryKeys.teams.list(userId),
    queryFn: () => getTeams(userId),
  });
}

/**
 * Fetch a single team by ID.
 */
export function useTeamById(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.byId(id!),
    queryFn: () => getTeamById(id!),
    enabled: !!id,
  });
}

/**
 * Fetch teams the user belongs to.
 */
export function useUserTeams(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.userTeams.byUser(userId!),
    queryFn: () => getUserTeams(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch team members.
 */
export function useTeamMembers(teamId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId!),
    queryFn: () => getTeamMembers(teamId!),
    enabled: !!teamId,
  });
}

/**
 * Fetch team join requests.
 */
export function useTeamRequests(teamId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.requests(teamId!),
    queryFn: () => getTeamRequests(teamId!),
    enabled: !!teamId,
  });
}

/**
 * Fetch team formations.
 */
export function useTeamFormations(teamId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.formations(teamId!),
    queryFn: () => getTeamFormations(teamId!),
    enabled: !!teamId,
  });
}

/**
 * Fetch team trophies.
 */
export function useTeamTrophies(teamId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.trophies(teamId!),
    queryFn: () => getTeamTrophies(teamId!),
    enabled: !!teamId,
  });
}

/**
 * Fetch team messages.
 */
export function useTeamMessages(teamId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.messages(teamId!),
    queryFn: () => getTeamMessages(teamId!),
    enabled: !!teamId,
    staleTime: 10 * 1000, // Refresh messages more often
  });
}

/**
 * Fetch team invitations for a user.
 */
export function useTeamInvitations(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.invitations(userId!),
    queryFn: () => getTeamInvitations(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch team invitations count.
 */
export function useTeamInvitationsCount(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.invitationsCount(userId!),
    queryFn: () => getTeamInvitationsCount(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch pending join requests for captain.
 */
export function usePendingJoinRequests(captainId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.pendingJoinRequests(captainId!),
    queryFn: () => getPendingJoinRequestsForCaptain(captainId!),
    enabled: !!captainId,
  });
}

/**
 * Fetch pending join requests count for captain.
 */
export function usePendingJoinRequestsCount(captainId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.pendingJoinRequestsCount(captainId!),
    queryFn: () => getPendingJoinRequestsCountForCaptain(captainId!),
    enabled: !!captainId,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch total players count.
 */
export function useTotalPlayersCount() {
  return useQuery({
    queryKey: queryKeys.profiles.totalCount(),
    queryFn: getTotalPlayersCount,
    staleTime: 5 * 60 * 1000, // This changes slowly
  });
}

// ═══════════════════════════════════════════════════
//  MUTATIONS
// ═══════════════════════════════════════════════════

/**
 * Create a new team.
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
      captainId,
      logoUrl,
      primaryColor,
      secondaryColor,
      jerseyPattern,
    }: {
      name: string;
      description: string;
      captainId: string;
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      jerseyPattern?: string;
    }) =>
      createTeam(
        name,
        description,
        captainId,
        logoUrl,
        primaryColor,
        secondaryColor,
        jerseyPattern
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userTeams.all });
    },
  });
}

/**
 * Join a team (request membership).
 */
export function useJoinTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      userId,
      role,
    }: {
      teamId: string;
      userId: string;
      role?: 'captain' | 'member';
    }) => joinTeam(teamId, userId, role),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userTeams.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(teamId),
      });
    },
  });
}

/**
 * Leave a team.
 */
export function useLeaveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      leaveTeam(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userTeams.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(teamId),
      });
    },
  });
}

/**
 * Update team details.
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      updates,
    }: {
      teamId: string;
      updates: Partial<Team>;
    }) => updateTeam(teamId, updates),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.byId(teamId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
    },
  });
}

/**
 * Delete a team.
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userTeams.all });
    },
  });
}

/**
 * Invite a player to a team.
 */
export function useInviteToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      inviteToTeam(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(teamId),
      });
    },
  });
}

/**
 * Respond to a team invitation.
 */
export function useRespondToTeamInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      userId,
      action,
    }: {
      teamId: string;
      userId: string;
      action: 'accept' | 'decline';
    }) => respondToTeamInvitation(teamId, userId, action),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userTeams.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(teamId),
      });
    },
  });
}

/**
 * Send a team message.
 */
export function useSendTeamMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      userId,
      content,
    }: {
      teamId: string;
      userId: string;
      content: string;
    }) => sendTeamMessage(teamId, userId, content),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.messages(teamId),
      });
    },
  });
}

/**
 * Upsert a team formation.
 */
export function useUpsertTeamFormation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formation: Partial<TeamFormation>) =>
      upsertTeamFormation(formation),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.formations(data.team_id),
      });
    },
  });
}
