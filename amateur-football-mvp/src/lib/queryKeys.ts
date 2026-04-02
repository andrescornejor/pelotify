/**
 * Centralized query key factory for TanStack Query.
 * Using a factory pattern ensures consistent keys across queries and mutations,
 * making cache invalidation predictable and easy to maintain.
 *
 * Pattern: entity → scope → identifier
 * Example: queryKeys.matches.byId('abc') => ['matches', 'detail', 'abc']
 */

export const queryKeys = {
  // ── Matches ──
  matches: {
    all: ['matches'] as const,
    lists: () => [...queryKeys.matches.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.matches.lists(), filters] as const,
    details: () => [...queryKeys.matches.all, 'detail'] as const,
    byId: (id: string) => [...queryKeys.matches.details(), id] as const,
    stats: (id: string) => [...queryKeys.matches.all, 'stats', id] as const,
    reports: (id: string) => [...queryKeys.matches.all, 'reports', id] as const,
    invitations: (userId: string) =>
      [...queryKeys.matches.all, 'invitations', userId] as const,
    invitationsCount: (userId: string) =>
      [...queryKeys.matches.all, 'invitations-count', userId] as const,
  },

  // ── User Matches ──
  userMatches: {
    all: ['userMatches'] as const,
    byUser: (userId: string) => [...queryKeys.userMatches.all, userId] as const,
  },

  // ── Teams ──
  teams: {
    all: ['teams'] as const,
    lists: () => [...queryKeys.teams.all, 'list'] as const,
    list: (userId?: string) =>
      [...queryKeys.teams.lists(), { userId }] as const,
    details: () => [...queryKeys.teams.all, 'detail'] as const,
    byId: (id: string) => [...queryKeys.teams.details(), id] as const,
    members: (teamId: string) =>
      [...queryKeys.teams.all, 'members', teamId] as const,
    requests: (teamId: string) =>
      [...queryKeys.teams.all, 'requests', teamId] as const,
    formations: (teamId: string) =>
      [...queryKeys.teams.all, 'formations', teamId] as const,
    trophies: (teamId: string) =>
      [...queryKeys.teams.all, 'trophies', teamId] as const,
    messages: (teamId: string) =>
      [...queryKeys.teams.all, 'messages', teamId] as const,
    invitations: (userId: string) =>
      [...queryKeys.teams.all, 'invitations', userId] as const,
    invitationsCount: (userId: string) =>
      [...queryKeys.teams.all, 'invitations-count', userId] as const,
    pendingJoinRequests: (captainId: string) =>
      [...queryKeys.teams.all, 'pending-join', captainId] as const,
    pendingJoinRequestsCount: (captainId: string) =>
      [...queryKeys.teams.all, 'pending-join-count', captainId] as const,
  },

  // ── User Teams ──
  userTeams: {
    all: ['userTeams'] as const,
    byUser: (userId: string) => [...queryKeys.userTeams.all, userId] as const,
  },

  // ── Friends ──
  friends: {
    all: ['friends'] as const,
    list: (userId: string) => [...queryKeys.friends.all, 'list', userId] as const,
    pendingRequests: (userId: string) =>
      [...queryKeys.friends.all, 'pending', userId] as const,
    pendingCount: (userId: string) =>
      [...queryKeys.friends.all, 'pending-count', userId] as const,
    recommended: (userId: string) =>
      [...queryKeys.friends.all, 'recommended', userId] as const,
    search: (userId: string, query: string) =>
      [...queryKeys.friends.all, 'search', userId, query] as const,
  },

  // ── Highlights ──
  highlights: {
    all: ['highlights'] as const,
    list: (limit?: number) =>
      [...queryKeys.highlights.all, 'list', { limit }] as const,
    byUser: (userId: string) =>
      [...queryKeys.highlights.all, 'user', userId] as const,
    friendsHighlights: (userId: string, limit?: number) =>
      [...queryKeys.highlights.all, 'friends', userId, { limit }] as const,
    comments: (highlightId: string) =>
      [...queryKeys.highlights.all, 'comments', highlightId] as const,
  },

  // ── Chat ──
  chat: {
    all: ['chat'] as const,
    matchMessages: (matchId: string) =>
      [...queryKeys.chat.all, 'match', matchId] as const,
    directMessages: (userId1: string, userId2: string) =>
      [...queryKeys.chat.all, 'direct', userId1, userId2] as const,
    recentChats: (userId: string) =>
      [...queryKeys.chat.all, 'recent', userId] as const,
    unreadCount: (userId: string) =>
      [...queryKeys.chat.all, 'unread-count', userId] as const,
  },

  // ── Profiles ──
  profiles: {
    all: ['profiles'] as const,
    byId: (id: string) => [...queryKeys.profiles.all, id] as const,
    totalCount: () => [...queryKeys.profiles.all, 'total-count'] as const,
    badges: (userId: string) =>
      [...queryKeys.profiles.all, 'badges', userId] as const,
  },

  // ── Team Challenges ──
  challenges: {
    all: ['challenges'] as const,
    byTeam: (teamId: string) =>
      [...queryKeys.challenges.all, 'team', teamId] as const,
    pendingForCaptain: (userId: string) =>
      [...queryKeys.challenges.all, 'pending-captain', userId] as const,
    pendingCountForCaptain: (userId: string) =>
      [...queryKeys.challenges.all, 'pending-captain-count', userId] as const,
    pendingForMember: (userId: string) =>
      [...queryKeys.challenges.all, 'pending-member', userId] as const,
  },

  // ── Home Page (aggregated) ──
  home: {
    all: ['home'] as const,
    data: (userId: string) => [...queryKeys.home.all, 'data', userId] as const,
  },

  // ── Recruitment ──
  recruitment: {
    all: ['recruitment'] as const,
    lists: () => [...queryKeys.recruitment.all, 'list'] as const,
    byId: (id: string) => [...queryKeys.recruitment.all, 'detail', id] as const,
  },
} as const;
