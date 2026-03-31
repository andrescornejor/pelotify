'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  getHighlights,
  getUserHighlights,
  getFriendsHighlights,
  getComments,
  addComment,
  toggleLike,
  deleteHighlight,
  incrementView,
} from '@/lib/highlights';

// ═══════════════════════════════════════════════════
//  QUERIES
// ═══════════════════════════════════════════════════

/**
 * Fetch all highlights (global feed).
 */
export function useHighlights(limit = 10) {
  return useQuery({
    queryKey: queryKeys.highlights.list(limit),
    queryFn: () => getHighlights(limit),
  });
}

/**
 * Fetch highlights by user.
 */
export function useUserHighlights(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.highlights.byUser(userId!),
    queryFn: () => getUserHighlights(userId!),
    enabled: !!userId,
  });
}

/**
 * Fetch friends' highlights.
 */
export function useFriendsHighlights(
  userId: string | undefined,
  limit = 10
) {
  return useQuery({
    queryKey: queryKeys.highlights.friendsHighlights(userId!, limit),
    queryFn: () => getFriendsHighlights(userId!, limit),
    enabled: !!userId,
  });
}

/**
 * Fetch comments for a highlight.
 */
export function useHighlightComments(highlightId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.highlights.comments(highlightId!),
    queryFn: () => getComments(highlightId!),
    enabled: !!highlightId,
    staleTime: 15 * 1000,
  });
}

// ═══════════════════════════════════════════════════
//  MUTATIONS
// ═══════════════════════════════════════════════════

/**
 * Toggle like on a highlight.
 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      highlightId,
      userId,
      isLiked,
    }: {
      highlightId: string;
      userId: string;
      isLiked: boolean;
    }) => toggleLike(highlightId, userId, isLiked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.highlights.all });
    },
  });
}

/**
 * Add a comment to a highlight.
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      highlightId,
      userId,
      content,
    }: {
      highlightId: string;
      userId: string;
      content: string;
    }) => addComment(highlightId, userId, content),
    onSuccess: (_, { highlightId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.highlights.comments(highlightId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.highlights.all });
    },
  });
}

/**
 * Delete a highlight.
 */
export function useDeleteHighlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, videoUrl }: { id: string; videoUrl: string }) =>
      deleteHighlight(id, videoUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.highlights.all });
    },
  });
}

/**
 * Increment highlight view count (fire-and-forget, no cache invalidation needed).
 */
export function useIncrementView() {
  return useMutation({
    mutationFn: (highlightId: string) => incrementView(highlightId),
  });
}
