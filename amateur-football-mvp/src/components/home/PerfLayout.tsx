'use client';

import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { OnboardingTour } from '@/components/OnboardingTour';
import { ScrollProgress, PerfBackground, PerformanceToggle } from './HomeSections';

export const PerfLayout = ({ children }: { children: React.ReactNode }) => {
  const { performanceMode } = useSettings();
  
  return (
    <div
      className={cn(
        'relative min-h-screen bg-background font-sans selection:bg-primary selection:text-background',
        performanceMode && 'perf-mode'
      )}
    >
      <OnboardingTour />
      <ScrollProgress />
      <PerfBackground />
      <PerformanceToggle />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-4 lg:py-8 space-y-8 lg:space-y-12">
        {children}
      </div>
    </div>
  );
};

export const PerfStatCardsGrid = ({ children }: { children: React.ReactNode }) => {
  // We can just render the grid. The motion layout is handled.
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 snap-start scroll-mt-26">
      {children}
    </div>
  );
};
