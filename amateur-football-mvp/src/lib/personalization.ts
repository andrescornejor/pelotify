import type { Match } from '@/lib/matches';
import type { Sport } from '@/lib/sports';
import { getFormatMeta, getMatchSport, getSportMeta } from '@/lib/sports';
import { findVenueByLocation, normalizeVenueString } from '@/lib/venues';

export type PlayerGoal = 'competitive' | 'social' | 'fitness' | 'casual';

export interface NotificationPreferences {
  enabled: boolean;
  nearbyOnly: boolean;
  sports: Sport[];
  zone: string;
  reminders: boolean;
  community: boolean;
}

export interface UserPreferences {
  favoriteSports: Sport[];
  preferredZone: string;
  goal: PlayerGoal;
  notifications: NotificationPreferences;
}

export interface RecommendedMatch extends Match {
  recommendationScore: number;
  recommendationReasons: string[];
}

export interface UsageSnapshot {
  totalVisits: number;
  uniqueDays: number;
  streakDays: number;
  favoriteSection: string;
  recentSections: string[];
  lastVisitedAt?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteSports: ['football'],
  preferredZone: '',
  goal: 'competitive',
  notifications: {
    enabled: true,
    nearbyOnly: false,
    sports: ['football'],
    zone: '',
    reminders: true,
    community: true,
  },
};

const STORAGE_KEY = 'pelotify-usage-analytics-v1';

type UsageStorage = {
  visits: Array<{ path: string; at: string }>;
};

export function getUserPreferences(metadata: Record<string, unknown> | null | undefined): UserPreferences {
  const raw = (metadata?.preferences as any) || {};
  const favoriteSports = sanitizeSports(raw.favoriteSports || raw.notifications?.sports);
  const preferredZone = String(raw.preferredZone || '').trim();
  const notificationsZone = String(raw.notifications?.zone || preferredZone || '').trim();

  return {
    favoriteSports: favoriteSports.length > 0 ? favoriteSports : DEFAULT_PREFERENCES.favoriteSports,
    preferredZone,
    goal: sanitizeGoal(raw.goal),
    notifications: {
      enabled: raw.notifications?.enabled ?? DEFAULT_PREFERENCES.notifications.enabled,
      nearbyOnly: raw.notifications?.nearbyOnly ?? DEFAULT_PREFERENCES.notifications.nearbyOnly,
      sports:
        sanitizeSports(raw.notifications?.sports).length > 0
          ? sanitizeSports(raw.notifications?.sports)
          : favoriteSports.length > 0
            ? favoriteSports
            : DEFAULT_PREFERENCES.notifications.sports,
      zone: notificationsZone,
      reminders: raw.notifications?.reminders ?? DEFAULT_PREFERENCES.notifications.reminders,
      community: raw.notifications?.community ?? DEFAULT_PREFERENCES.notifications.community,
    },
  };
}

export function buildUpdatedPreferences(
  currentMetadata: Record<string, unknown> | null | undefined,
  updates: Partial<UserPreferences>
): UserPreferences {
  const current = getUserPreferences(currentMetadata);
  const next: UserPreferences = {
    ...current,
    ...updates,
    notifications: {
      ...current.notifications,
      ...(updates.notifications || {}),
    },
  };

  const favoriteSports = sanitizeSports(next.favoriteSports);
  next.favoriteSports = favoriteSports.length > 0 ? favoriteSports : DEFAULT_PREFERENCES.favoriteSports;
  next.goal = sanitizeGoal(next.goal);
  next.preferredZone = String(next.preferredZone || '').trim();
  next.notifications.sports =
    sanitizeSports(next.notifications.sports).length > 0
      ? sanitizeSports(next.notifications.sports)
      : next.favoriteSports;
  next.notifications.zone = String(next.notifications.zone || next.preferredZone || '').trim();

  return next;
}

export function recommendMatches(matches: Match[], preferences: UserPreferences, limit = 3) {
  return matches
    .map((match) => {
      const sport = getMatchSport(match);
      const format = getFormatMeta(match.type, sport);
      const reasons: string[] = [];
      let score = 0;

      if (preferences.favoriteSports.includes(sport)) {
        score += 45;
        reasons.push(`${getSportMeta(sport).label} es uno de tus deportes favoritos`);
      }

      const zoneHit = matchesZone(preferences.preferredZone, match.location);
      if (zoneHit) {
        score += 30;
        reasons.push(`queda alineado con tu zona: ${preferences.preferredZone}`);
      }

      if (preferences.goal === 'competitive' && ['F7', 'F11', 'BASKET'].includes(format.key)) {
        score += 15;
        reasons.push('encaja con tu perfil competitivo');
      }

      if (preferences.goal === 'social' && format.totalPlayers >= 10) {
        score += 12;
        reasons.push('tiene buen potencial para conocer más jugadores');
      }

      if (preferences.goal === 'fitness' && ['F5', 'BASKET'].includes(format.key)) {
        score += 12;
        reasons.push('es ideal para mantener ritmo alto');
      }

      if (preferences.goal === 'casual' && ['F5', 'PADEL'].includes(format.key)) {
        score += 12;
        reasons.push('se siente rápido de organizar y jugar');
      }

      const venue = findVenueByLocation(match.location || '');
      if (venue) {
        score += 8;
        reasons.push('se juega en una sede destacada');
      }

      const hoursUntilMatch = getHoursUntilMatch(match.date, match.time);
      if (hoursUntilMatch >= 0 && hoursUntilMatch <= 72) {
        score += 10;
        reasons.push('arranca pronto, ideal para sumarte ahora');
      }

      return {
        ...match,
        recommendationScore: score,
        recommendationReasons: reasons.slice(0, 2),
      } as RecommendedMatch;
    })
    .filter((match) => match.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

export function trackUsage(path: string) {
  if (typeof window === 'undefined') return;

  const storage = readUsageStorage();
  const now = new Date().toISOString();
  storage.visits.push({ path, at: now });
  storage.visits = storage.visits.slice(-150);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

export function getUsageSnapshot(): UsageSnapshot {
  if (typeof window === 'undefined') {
    return {
      totalVisits: 0,
      uniqueDays: 0,
      streakDays: 0,
      favoriteSection: 'Inicio',
      recentSections: [],
    };
  }

  const storage = readUsageStorage();
  const visits = storage.visits;
  const byDay = new Set(visits.map((visit) => visit.at.slice(0, 10)));
  const sectionCounts = new Map<string, number>();

  visits.forEach((visit) => {
    const section = getSectionLabel(visit.path);
    sectionCounts.set(section, (sectionCounts.get(section) || 0) + 1);
  });

  const favoriteSection =
    [...sectionCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'Inicio';

  const recentSections = [...new Set(visits.slice(-5).reverse().map((visit) => getSectionLabel(visit.path)))];

  return {
    totalVisits: visits.length,
    uniqueDays: byDay.size,
    streakDays: calculateStreak([...byDay]),
    favoriteSection,
    recentSections,
    lastVisitedAt: visits.at(-1)?.at,
  };
}

export function getGoalLabel(goal: PlayerGoal) {
  switch (goal) {
    case 'social':
      return 'Conocer gente';
    case 'fitness':
      return 'Mantener ritmo';
    case 'casual':
      return 'Jugar sin vueltas';
    default:
      return 'Competir más';
  }
}

function sanitizeSports(value: unknown): Sport[] {
  const allowed: Sport[] = ['football', 'padel', 'basket'];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Sport => allowed.includes(item as Sport));
}

function sanitizeGoal(value: unknown): PlayerGoal {
  return ['competitive', 'social', 'fitness', 'casual'].includes(String(value))
    ? (value as PlayerGoal)
    : DEFAULT_PREFERENCES.goal;
}

function matchesZone(zone: string, location: string) {
  const normalizedZone = normalizeVenueString(zone || '');
  const normalizedLocation = normalizeVenueString(location || '');
  if (!normalizedZone) return false;
  return normalizedLocation.includes(normalizedZone);
}

function getHoursUntilMatch(date?: string, time?: string) {
  if (!date || !time) return Number.POSITIVE_INFINITY;
  const target = new Date(`${date}T${time}`);
  return (target.getTime() - Date.now()) / (1000 * 60 * 60);
}

function readUsageStorage(): UsageStorage {
  if (typeof window === 'undefined') return { visits: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { visits: [] };
    const parsed = JSON.parse(raw) as UsageStorage;
    return { visits: Array.isArray(parsed.visits) ? parsed.visits : [] };
  } catch {
    return { visits: [] };
  }
}

function calculateStreak(days: string[]) {
  if (days.length === 0) return 0;
  const sorted = [...days].sort().reverse();
  let streak = 0;
  const cursor = new Date();

  for (const day of sorted) {
    const current = day;
    const cursorDay = cursor.toISOString().slice(0, 10);

    if (current === cursorDay) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1);
      const yesterday = cursor.toISOString().slice(0, 10);
      if (current === yesterday) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
    }

    break;
  }

  return streak;
}

function getSectionLabel(path: string) {
  if (path.startsWith('/search')) return 'Radar';
  if (path.startsWith('/match')) return 'Partidos';
  if (path.startsWith('/teams')) return 'Equipos';
  if (path.startsWith('/messages')) return 'Mensajes';
  if (path.startsWith('/highlights')) return 'Highlights';
  if (path.startsWith('/profile')) return 'Perfil';
  return 'Inicio';
}
