import React from 'react';
import { Target, Trophy, Award, Activity, Calendar, MapPin, Clock } from 'lucide-react';

export const HomePageSkeleton = () => {
  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-4 lg:py-8 space-y-8 lg:space-y-12 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-[400px] w-full rounded-[3rem] bg-surface border border-white/5 relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent opacity-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          {/* StatCards Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-[2.5rem] bg-surface border border-white/5" />
            ))}
          </div>

          <div className="h-24 rounded-[2.5rem] bg-surface border border-white/5" />

          {/* Road to Glory Skeleton */}
          <div className="h-64 rounded-[2.5rem] bg-surface border border-white/5" />

          {/* Highlights Skeleton */}
          <div className="h-[280px] sm:h-[380px] rounded-[2.5rem] bg-surface border border-white/5" />

          {/* Teams Skeleton */}
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-[3rem] bg-surface border border-white/5" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-4 space-y-6">
          {/* Match Banner Skeleton */}
          <div className="h-[450px] rounded-[3rem] bg-surface border border-white/5 relative overflow-hidden flex flex-col p-8 gap-8">
             <div className="h-4 w-32 bg-white/10 rounded-full" />
             <div className="flex items-center justify-between px-4">
                <div className="w-20 h-20 rounded-[2.5rem] bg-white/5" />
                <div className="w-14 h-14 rounded-full bg-white/5" />
                <div className="w-20 h-20 rounded-[2.5rem] bg-white/5" />
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div className="h-16 rounded-3xl bg-white/5" />
               <div className="h-16 rounded-3xl bg-white/5" />
             </div>
             <div className="h-16 rounded-3xl bg-white/5" />
             <div className="h-14 rounded-2xl bg-white/5 mt-auto" />
          </div>

          {/* Quick Links Skeleton */}
          <div className="h-64 rounded-[2.5rem] bg-surface border border-white/5" />
        </div>
      </div>
    </div>
  );
};
