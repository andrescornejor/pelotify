'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  getMatchMessages,
  sendMatchMessage,
  getDirectMessages,
  sendDirectMessage,
  getRecentChats,
  getUnreadMessagesCount,
  markDirectMessagesAsRead,
  markAllDirectMessagesAsRead,
} from '@/lib/chat';

// ═══════════════════════════════════════════════════
//  QUERIES
// ═══════════════════════════════════════════════════

/**
 * Fetch match lobby messages.
 */
export function useMatchMessages(matchId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chat.matchMessages(matchId!),
    queryFn: () => getMatchMessages(matchId!),
    enabled: !!matchId,
    staleTime: 5 * 1000, // Chat messages should refresh frequently
    refetchInterval: 10 * 1000, // Poll every 10s for new messages
  });
}

/**
 * Fetch direct messages between two users.
 */
export function useDirectMessages(
  userId1: string | undefined,
  userId2: string | undefined
) {
  return useQuery({
    queryKey: queryKeys.chat.directMessages(userId1!, userId2!),
    queryFn: () => getDirectMessages(userId1!, userId2!),
    enabled: !!userId1 && !!userId2,
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
  });
}

/**
 * Fetch recent chats.
 */
export function useRecentChats(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chat.recentChats(userId!),
    queryFn: () => getRecentChats(userId!),
    enabled: !!userId,
    staleTime: 15 * 1000,
  });
}

/**
 * Fetch unread messages count.
 */
export function useUnreadMessagesCount(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chat.unreadCount(userId!),
    queryFn: () => getUnreadMessagesCount(userId!),
    enabled: !!userId,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

// ═══════════════════════════════════════════════════
//  MUTATIONS
// ═══════════════════════════════════════════════════

/**
 * Send a match message.
 */
export function useSendMatchMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      userId,
      content,
    }: {
      matchId: string;
      userId: string;
      content: string;
    }) => sendMatchMessage(matchId, userId, content),
    onSuccess: (_, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.matchMessages(matchId),
      });
    },
  });
}

/**
 * Send a direct message.
 */
export function useSendDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      senderId,
      recipientId,
      content,
    }: {
      senderId: string;
      recipientId: string;
      content: string;
    }) => sendDirectMessage(senderId, recipientId, content),
    onSuccess: (_, { senderId, recipientId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.directMessages(senderId, recipientId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.recentChats(senderId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.unreadCount(recipientId),
      });
    },
  });
}

/**
 * Mark DMs as read.
 */
export function useMarkDirectMessagesAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      senderId,
      recipientId,
    }: {
      senderId: string;
      recipientId: string;
    }) => markDirectMessagesAsRead(senderId, recipientId),
    onSuccess: (_, { recipientId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.unreadCount(recipientId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.recentChats(recipientId),
      });
    },
  });
}

/**
 * Mark all DMs as read.
 */
export function useMarkAllDirectMessagesAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => markAllDirectMessagesAsRead(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.unreadCount(userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.recentChats(userId),
      });
    },
  });
}
