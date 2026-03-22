'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMatchById, getUserMatches, MatchParticipant } from '@/lib/matches';
import PostMatchModal from './PostMatchModal';

export default function PostMatchManager() {
  const { user } = useAuth();
  const [pendingMatch, setPendingMatch] = useState<{
    id: string;
    participants: MatchParticipant[];
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const checkPendingMatches = async () => {
      try {
        // 1. Get user matches
        const matches = await getUserMatches(user.id);

        // 2. Filter for finished but uncompleted matches
        const now = new Date();

        for (const match of matches) {
          // Match date/time to Date object
          // Format: 2024-03-14 and 18:30
          const matchStart = new Date(`${match.date}T${match.time}`);
          const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000); // +1 hour

          // If match ended in the last 24 hours and is not completed
          // We also check localStorage to see if the user already dismissed it or submitted it in this session
          const storageKey = `post_match_rated_${match.id}_${user.id}`;
          const alreadyRated = localStorage.getItem(storageKey);

          if (now > matchEnd && !match.is_completed && !alreadyRated) {
            // Get full match details (including participants for the modal)
            const fullMatch = await getMatchById(match.id);
            setPendingMatch({
              id: match.id,
              participants: fullMatch.participants || [],
            });
            break; // Only one popup at a time
          }
        }
      } catch (err) {
        console.error('Error checking pending matches:', err);
      }
    };

    // Check initially and then every minute
    checkPendingMatches();
    const interval = setInterval(checkPendingMatches, 60000);
    return () => clearInterval(interval);
  }, [user]);

  if (!pendingMatch || !user) return null;

  const handleClose = () => {
    // Mark as "dealt with" in this session/device
    localStorage.setItem(`post_match_rated_${pendingMatch.id}_${user.id}`, 'true');
    setPendingMatch(null);
  };

  return (
    <PostMatchModal
      matchId={pendingMatch.id}
      participants={pendingMatch.participants}
      currentUserId={user.id}
      onClose={handleClose}
    />
  );
}
