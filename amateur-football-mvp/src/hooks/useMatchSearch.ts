'use client';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { findVenueByLocation, normalizeVenueString } from '@/lib/venues';
import { useMatches, useUserMatches } from '@/hooks/useMatchQueries';

// Helper for distance calculation (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function useMatchSearch() {
  const { user } = useAuth();
  
  // Use TanStack Query hooks
  const { data: allMatches = [], isLoading: isLoadingAll } = useMatches();
  const { data: userMatches = [], isLoading: isLoadingUser } = useUserMatches(user?.id);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'F5' | 'F7' | 'F11'>('All');
  const [maxPrice, setMaxPrice] = useState<number>(Infinity);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  
  // New Distance Filters
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null); // in km

  const isLoading = isLoadingAll || (!!user && isLoadingUser);

  const joinedIds = useMemo(() => 
    new Set(userMatches.filter(Boolean).map(m => m.id)),
    [userMatches]
  );
  
  const matches = useMemo(() => {
    // Merge all official matches with current user's joined/created matches
    // to ensure they see their "waiting_deposit" or private matches they belong to.
    const merged = [...allMatches];
    const matchIds = new Set(allMatches.map(m => m.id));
    
    userMatches.forEach(um => {
      if (!matchIds.has(um.id)) {
        merged.push(um);
        matchIds.add(um.id);
      }
    });

    return merged;
  }, [allMatches, userMatches]);

  const { filteredMatches, mapMatches } = useMemo(() => {
    const baseFiltered = matches.filter((match) => {
      if (match.is_completed) return false;
      if (match.is_private && !joinedIds.has(match.id)) return false;
      if (match.is_recruitment) return false; // Exclude emergency recruitment from the main radar

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

    const listMatches = baseFiltered.filter(match => {
      // Distance Filter for List only
      if (userLocation && radiusFilter && radiusFilter > 0) {
        let matchLat = match.lat;
        let matchLng = match.lng;

        if (!matchLat || !matchLng) {
          const venue = findVenueByLocation(match.location || '');
          if (venue) {
            matchLat = venue.lat;
            matchLng = venue.lng;
          }
        }

        if (matchLat && matchLng) {
          const dist = getDistance(userLocation.lat, userLocation.lng, matchLat, matchLng);
          if (dist > radiusFilter) return false;
        }
      }
      return true;
    });

    return { filteredMatches: listMatches, mapMatches: baseFiltered };
  }, [matches, searchQuery, typeFilter, maxPrice, onlyAvailable, userLocation, radiusFilter, joinedIds]);

  return {
    matches,
    filteredMatches,
    mapMatches,
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
    userLocation,
    setUserLocation,
    radiusFilter,
    setRadiusFilter,
  };
}

