'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  getFriends,
  getPendingRequests,
  getPendingRequestsCount,
  getRecommendedPlayers,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriendship,
} from '@/lib/friends';

// ═══════════════════════════════════════════════════
//  QUERIES
// ═══════════════════════════════════════════════════

/**
 * Fetch accepted friends.
 */
export function useFriends(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.friends.list(userId!),
    queryFn: () => getFriends(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch pending incoming friend requests.
 */
export function usePendingFriendRequests(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.friends.pendingRequests(userId!),
    queryFn: () => getPendingRequests(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch pending friend requests count.
 */
export function usePendingFriendRequestsCount(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.friends.pendingCount(userId!),
    queryFn: () => getPendingRequestsCount(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch recommended players.
 */
export function useRecommendedPlayers(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.friends.recommended(userId!),
    queryFn: () => getRecommendedPlayers(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Recommendations are stable
  });
}

/**
 * Search users with relationship status.
 */
export function useSearchUsers(userId: string | undefined, query: string) {
  return useQuery({
    queryKey: queryKeys.friends.search(userId!, query),
    queryFn: () => searchUsers(userId!, query),
    enabled: !!userId && query.length >= 2,
    staleTime: 30 * 1000,
  });
}

// ═══════════════════════════════════════════════════
//  MUTATIONS
// ═══════════════════════════════════════════════════

/**
 * Send a friend request.
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, friendId }: { userId: string; friendId: string }) =>
      sendFriendRequest(userId, friendId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
}

/**
 * Accept a friend request.
 */
export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: string) => acceptFriendRequest(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
}

/**
 * Delete or reject a friendship.
 */
export function useDeleteFriendship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: string) => deleteFriendship(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.friends.all });
    },
  });
}
