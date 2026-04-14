'use client';

import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import FeedClient from '@/app/feed/FeedClient';
import { Suspense } from 'react';
import { OnboardingTour } from '@/components/OnboardingTour';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-primary animate-spin rounded-full" />
      </div>
    );
  }

  if (user?.is_business) {
    return null; // Will be redirected by AuthContext
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <>
      <OnboardingTour />
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-t-2 border-primary animate-spin rounded-full" />
        </div>
      }>
        <FeedClient />
      </Suspense>
    </>
  );
}
