'use client';

import { useState, useEffect, useMemo } from 'react';
import { getMatches, getUserMatches, Match } from '@/lib/matches';
import { useAuth } from '@/contexts/AuthContext';
import { findVenueByLocation, normalizeVenueString } from '@/lib/venues';

export function useMatchSearch() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const [allMatches, userMatches] = await Promise.all([
          getMatches(),
          user ? getUserMatches(user.id) : Promise.resolve([]),
        ]);
        setMatches(allMatches);
        setJoinedIds(new Set((userMatches as any[]).filter(Boolean).map((m: any) => m?.id)));
      } catch (err) {
        console.error('Error fetching matches:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, [user?.id]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      if (match.is_completed) return false;
      if (match.is_private) return false;

      // Hide past matches from radar
      const matchStart = new Date(`${match.date}T${match.time}`);
      const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
      if (new Date() > matchEnd) return false;

      const search = normalizeVenueString(searchQuery);
      if (!search) return true;

      const loc = normalizeVenueString(match.location || '');
      const type = normalizeVenueString(match.type);
      const level = normalizeVenueString(match.level);

      if (loc.includes(search) || type.includes(search) || level.includes(search)) return true;

      const venue = findVenueByLocation(match.location || '');
      if (venue) {
        const vName = normalizeVenueString(venue.name);
        if (vName.includes(search)) return true;
      }

      return false;
    });
  }, [matches, searchQuery]);

  return {
    matches,
    filteredMatches,
    joinedIds,
    isLoading,
    searchQuery,
    setSearchQuery,
  };
}
