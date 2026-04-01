'use client';
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { findVenueByLocation, normalizeVenueString } from '@/lib/venues';
import { useMatches, useUserMatches } from '@/hooks/useMatchQueries';

export function useMatchSearch() {
  const { user } = useAuth();
  
  // Use TanStack Query hooks
  const { data: allMatches = [], isLoading: isLoadingAll } = useMatches();
  const { data: userMatches = [], isLoading: isLoadingUser } = useUserMatches(user?.id);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'F5' | 'F7' | 'F11'>('All');
  const [maxPrice, setMaxPrice] = useState<number>(Infinity);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const isLoading = isLoadingAll || (!!user && isLoadingUser);

  const joinedIds = useMemo(() => 
    new Set(userMatches.filter(Boolean).map(m => m.id)),
    [userMatches]
  );
  
  const matches = allMatches;

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      if (match.is_completed) return false;
      if (match.is_private) return false;

      // Type Filter
      if (typeFilter !== 'All' && match.type !== typeFilter) return false;

      // Price Filter
      if (match.price > maxPrice) return false;

      // Availability Filter
      if (onlyAvailable) {
        const maxPlayers = match.type === 'F5' ? 10 : match.type === 'F7' ? 14 : 22;
        const countObj = match.participants?.[0];
        const currentPlayers =
          typeof countObj === 'number'
            ? countObj
            : countObj?.count !== undefined
              ? countObj.count
              : match.participants?.length || 0;
        if (currentPlayers >= maxPlayers) return false;
      }

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
  }, [matches, searchQuery, typeFilter, maxPrice, onlyAvailable]);

  return {
    matches,
    filteredMatches,
    joinedIds,
    isLoading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    maxPrice,
    setMaxPrice,
    onlyAvailable,
    setOnlyAvailable,
  };
}
