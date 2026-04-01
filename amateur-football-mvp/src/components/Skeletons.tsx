'use client';

import { motion } from 'framer-motion';

const shimmer = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
  transition: { repeat: Infinity, ease: 'linear', duration: 1.2 },
} as const;

export function SkeletonPremium({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-foreground/5 rounded-2xl ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.05] to-transparent w-[200%]"
        initial={shimmer.initial}
        animate={shimmer.animate}
        transition={shimmer.transition}
      />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-10 xl:p-14 2xl:p-16 max-w-screen-2xl mx-auto min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[50dvh] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-30" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2 relative z-10">
        <SkeletonPremium className="w-32 h-4 rounded-full" />
        <SkeletonPremium className="w-64 h-16 md:h-20 lg:h-24 rounded-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* Left Col (Card) */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <SkeletonPremium className="w-full max-w-[340px] aspect-[2/3] rounded-[2rem] shadow-2xl" />
          <SkeletonPremium className="w-48 h-12 mt-8 rounded-full" />
        </div>

        {/* Right Col (Tabs & Stats) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <div className="flex gap-4">
            <SkeletonPremium className="w-32 h-12 rounded-full" />
            <SkeletonPremium className="w-32 h-12 rounded-full pb-2" />
            <SkeletonPremium className="w-32 h-12 rounded-full" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonPremium className="h-32 rounded-3xl" />
            <SkeletonPremium className="h-32 rounded-3xl" />
            <SkeletonPremium className="h-32 rounded-3xl" />
            <SkeletonPremium className="h-32 rounded-3xl" />
          </div>

          <div className="space-y-6 mt-8">
            <SkeletonPremium className="w-48 h-8 rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonPremium className="h-20 rounded-2xl" />
              <SkeletonPremium className="h-20 rounded-2xl" />
              <SkeletonPremium className="h-20 rounded-2xl" />
              <SkeletonPremium className="h-20 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatchSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 relative overflow-x-hidden">
      {/* Hero */}
      <div className="relative h-[45dvh] lg:h-[55dvh] w-full shrink-0 overflow-hidden">
        <SkeletonPremium className="absolute inset-0 rounded-none w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Header in Hero */}
        <div className="absolute bottom-20 left-8 right-8 lg:left-24 lg:right-24 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
          <div className="space-y-6 max-w-4xl w-full">
            <SkeletonPremium className="w-40 h-8 rounded-full" />
            <SkeletonPremium className="w-3/4 h-24 lg:h-32 rounded-3xl" />
            <div className="flex gap-8">
              <SkeletonPremium className="w-32 h-6 rounded-full" />
              <SkeletonPremium className="w-32 h-6 rounded-full" />
            </div>
          </div>
          <SkeletonPremium className="w-64 h-32 rounded-[2rem] hidden lg:block" />
        </div>
      </div>

      {/* Pitch Layout */}
      <div className="w-full px-4 lg:px-16 xl:px-24 -mt-8 mb-20 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Team A */}
            <div className="glass-premium rounded-[2rem] p-8 border-2 border-foreground/5 space-y-10">
              <SkeletonPremium className="w-full h-16 rounded-2xl" />
              <SkeletonPremium className="w-full h-16 rounded-2xl" />
              <div className="grid grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10 mt-8">
                {[...Array(5)].map((_, i) => (
                  <SkeletonPremium key={i} className="w-full aspect-square rounded-full" />
                ))}
              </div>
            </div>
            {/* Team B */}
            <div className="glass-premium rounded-[2rem] p-8 border-2 border-foreground/5 space-y-10">
              <SkeletonPremium className="w-full h-16 rounded-2xl" />
              <SkeletonPremium className="w-full h-16 rounded-2xl" />
              <div className="grid grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10 mt-8">
                {[...Array(5)].map((_, i) => (
                  <SkeletonPremium key={i} className="w-full aspect-square rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <SkeletonPremium className="w-full h-64 rounded-[2rem]" />
          <SkeletonPremium className="w-full h-40 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}

export function GridListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="glass-premium p-6 rounded-[2rem] flex items-center justify-between gap-4 border border-foreground/5 bg-surface relative overflow-hidden"
        >
          <div className="flex-1 flex items-center gap-4 w-full">
            <SkeletonPremium className="w-16 h-16 rounded-2xl shrink-0" />
            <div className="flex flex-col gap-2 w-full">
              <SkeletonPremium className="w-3/4 h-5 rounded-full" />
              <SkeletonPremium className="w-1/2 h-4 rounded-full" />
            </div>
          </div>
          <SkeletonPremium className="w-12 h-12 rounded-2xl shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function SocialHubSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6 lg:p-10 xl:p-14 2xl:p-16 max-w-screen-2xl mx-auto space-y-10 relative overflow-hidden">
      <div className="flex flex-col items-center text-center gap-4 relative z-10 px-4 mb-2">
        <SkeletonPremium className="w-48 h-4 rounded-full" />
        <SkeletonPremium className="w-96 h-20 rounded-2xl" />
        <SkeletonPremium className="w-72 h-4 rounded-full mt-4" />
      </div>
      <div className="relative z-20 px-4 w-full max-w-4xl mx-auto flex justify-center">
        <SkeletonPremium className="w-full h-16 rounded-[2rem]" />
      </div>
      <GridListSkeleton count={8} />
    </div>
  );
}

export function TeamsSkeleton() {
  return (
    <div className="flex flex-col gap-10 p-4 sm:p-6 lg:p-10 xl:p-14 2xl:p-16 max-w-screen-2xl mx-auto min-h-screen bg-background relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 border-b border-foreground/10 pb-8">
        <div className="flex flex-col gap-2">
          <SkeletonPremium className="w-96 h-16 md:h-20 rounded-2xl" />
          <SkeletonPremium className="w-64 h-4 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        <div className="lg:col-span-3 space-y-4">
          <SkeletonPremium className="w-full h-64 rounded-[2rem]" />
        </div>
        <div className="lg:col-span-9 space-y-12">
          <GridListSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
