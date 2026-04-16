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

/**
 * ProfileSkeleton — mirrors the current profile layout:
 * - Full-width hero banner with gradients
 * - Overlapping FIFA Card + Name/Position/Stats block
 * - Sticky tab navigation
 * - Bento grid content area (overview tab)
 */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden">
      {/* Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[80dvh] opacity-30" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.2), transparent 75%)' }} />
      </div>

      {/* Hero Banner */}
      <div className="relative w-full h-[280px] sm:h-[450px] lg:h-[500px] overflow-hidden bg-background">
        <div className="absolute inset-x-0 bottom-0 h-full z-10 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 bg-gradient-to-t from-background to-transparent" />
        <SkeletonPremium className="absolute inset-0 rounded-none w-full h-full" />
      </div>

      {/* Main Content Container */}
      <div className="main-container -mt-14 sm:-mt-48 lg:-mt-64 relative z-20 pb-20">

        {/* Profile Header Block */}
        <div 
          className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 mb-12 relative z-20"
        >
            {/* FIFA Card Skeleton */}
            <div 
              className="relative shrink-0 mx-auto lg:mx-0"
              style={{ marginLeft: 'var(--header-logo-offset)' }}
            >
            <SkeletonPremium className="w-[240px] sm:w-[280px] lg:w-[300px] aspect-[2/3] rounded-[2rem] shadow-2xl" />
          </div>

          {/* Info & Stats */}
          <div className="flex-1 w-full space-y-6 lg:pt-8 text-center lg:text-left">
            {/* Name + Position */}
            <div className="space-y-4">
              <SkeletonPremium className="w-[60%] max-w-[400px] h-14 sm:h-20 rounded-2xl mx-auto lg:mx-0" />
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <SkeletonPremium className="w-16 h-7 rounded-full" />
                <SkeletonPremium className="w-24 h-7 rounded-full" />
              </div>
            </div>

            {/* Bio */}
            <SkeletonPremium className="w-[80%] max-w-[500px] h-12 rounded-xl mx-auto lg:mx-0" />

            {/* Social Stats Hub */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonPremium key={i} className="flex-1 min-w-[100px] max-w-[140px] h-20 rounded-[1.5rem]" />
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-background/80 border-y border-foreground/10 mb-10 -mx-3 px-3 sm:-mx-5 sm:px-5 lg:-mx-10 lg:px-10 xl:-mx-16 xl:px-16">
          <div className="flex items-center justify-center sm:justify-start gap-10 py-5 max-w-full mx-auto">
            {[...Array(5)].map((_, i) => (
              <SkeletonPremium key={i} className="w-24 h-8 rounded-full" />
            ))}
          </div>
        </div>

        {/* Overview Tab Content (Bento Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Biometrics Card */}
          <div className="lg:col-span-1 p-6 sm:p-8 rounded-[3rem] border border-foreground/10 space-y-8 bg-foreground/[0.02]">
            <div className="flex flex-col gap-1 border-b border-foreground/5 pb-4">
              <SkeletonPremium className="w-32 h-6 rounded-lg" />
              <SkeletonPremium className="w-20 h-3 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonPremium key={i} className="h-20 rounded-[1.5rem]" />
              ))}
            </div>
            {/* Stats bars */}
            <div className="pt-2 border-t border-foreground/5 space-y-4">
              <SkeletonPremium className="w-28 h-4 rounded-full" />
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <SkeletonPremium className="w-10 h-3 rounded-full" />
                    <SkeletonPremium className="w-full h-1.5 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance + Radar */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance */}
            <div className="p-6 sm:p-8 rounded-[3rem] border border-foreground/10 bg-foreground/[0.02] space-y-6">
              <div className="border-b border-foreground/5 pb-4 space-y-1">
                <SkeletonPremium className="w-36 h-6 rounded-lg" />
                <SkeletonPremium className="w-40 h-3 rounded-full" />
              </div>
              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <SkeletonPremium key={i} className="h-16 rounded-[1.5rem]" />
                ))}
              </div>
            </div>

            {/* Radar Chart */}
            <div className="p-8 rounded-[3rem] border border-foreground/5 bg-foreground/[0.02] flex flex-col items-center justify-center">
              <SkeletonPremium className="w-[200px] h-[200px] rounded-full" />
              <SkeletonPremium className="w-24 h-4 rounded-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MatchSkeleton — mirrors the match lobby layout:
 * - Full hero with background image + metadata
 * - Two team cards with player slots
 * - Sidebar with details
 */
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
            <div className="glass-premium rounded-[3rem] p-8 border-2 border-foreground/5 space-y-10">
              <SkeletonPremium className="w-full h-16 rounded-2xl" />
              <SkeletonPremium className="w-full h-16 rounded-2xl" />
              <div className="grid grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10 mt-8">
                {[...Array(5)].map((_, i) => (
                  <SkeletonPremium key={i} className="w-full aspect-square rounded-full" />
                ))}
              </div>
            </div>
            {/* Team B */}
            <div className="glass-premium rounded-[3rem] p-8 border-2 border-foreground/5 space-y-10">
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
          <SkeletonPremium className="w-full h-64 rounded-[3.5rem]" />
          <SkeletonPremium className="w-full h-40 rounded-[3rem]" />
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
          className="glass-premium p-6 rounded-[2.5rem] flex items-center justify-between gap-4 border border-foreground/5 bg-surface relative overflow-hidden"
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

/**
 * SocialHubSkeleton — mirrors the Friends page layout:
 * - Centered header with title + subtitle
 * - Quick stats grid (2x2 on mobile, 4 cols on desktop)
 * - 3-tab pill navigation
 * - Friend card grid
 */
export function SocialHubSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-4 pb-32 main-container relative space-y-8 overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/3 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4 relative z-10 px-4 mb-2">
        <div className="flex items-center gap-4 justify-center">
          <div className="h-[1px] w-12 bg-primary/40" />
          <SkeletonPremium className="w-40 h-4 rounded-full" />
          <div className="h-[1px] w-12 bg-primary/40" />
        </div>
        <SkeletonPremium className="w-[80%] max-w-[500px] h-16 md:h-20 lg:h-24 rounded-2xl" />
        <SkeletonPremium className="w-72 h-4 rounded-full" />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full relative z-20">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-premium p-4 md:p-6 rounded-[2rem] border border-foreground/5 flex flex-col items-center justify-center gap-2">
            <SkeletonPremium className="w-5 h-5 rounded-lg" />
            <SkeletonPremium className="w-10 h-8 rounded-lg" />
            <SkeletonPremium className="w-14 h-3 rounded-full" />
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="relative z-20 w-full">
        <div className="flex p-2 bg-foreground/[0.02] rounded-[2.5rem] border border-foreground/[0.05] shadow-2xl">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.8rem]">
              <SkeletonPremium className="w-4 h-4 rounded" />
              <SkeletonPremium className="w-16 h-4 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Friend Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass-premium p-8 rounded-[3rem] flex flex-col gap-6 border border-foreground/5 bg-surface">
            <div className="flex items-center gap-6">
              <SkeletonPremium className="w-20 h-20 rounded-[2rem] shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <SkeletonPremium className="w-3/4 h-6 rounded-lg" />
                <SkeletonPremium className="w-1/2 h-3 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-foreground/5">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1">
                  <SkeletonPremium className="w-16 h-3 rounded-full" />
                  <SkeletonPremium className="w-10 h-4 rounded-lg" />
                </div>
                <div className="flex flex-col gap-1">
                  <SkeletonPremium className="w-12 h-3 rounded-full" />
                  <SkeletonPremium className="w-16 h-4 rounded-lg" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SkeletonPremium className="w-12 h-12 rounded-2xl" />
                <SkeletonPremium className="w-12 h-12 rounded-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * TeamsSkeleton — mirrors the Teams page layout:
 * - Sticky header with title + search bar + action button
 * - My team quick-access banner (optional)
 * - Grid of team cards with banner header, logo, and action buttons
 */
export function TeamsSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-4 pb-32 main-container relative overflow-hidden flex flex-col gap-8">
      {/* Ambient Effects */}
      <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/3 blur-[120px] rounded-full pointer-events-none" />

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 pt-4 pb-6 -mx-3 px-3 sm:-mx-5 sm:px-5 lg:-mx-10 lg:px-10 xl:-mx-16 xl:px-16 border-b border-foreground/5 shadow-2xl shadow-black/5 bg-background/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 w-full py-2">
          {/* Title */}
          <div className="flex flex-col shrink-0">
            <SkeletonPremium className="w-[70%] max-w-[450px] h-14 md:h-16 lg:h-20 rounded-2xl" />
            <SkeletonPremium className="w-48 h-4 rounded-full mt-3" />
          </div>

          {/* Search */}
          <div className="flex-1 w-full lg:max-w-xl xl:max-w-2xl flex gap-3 relative z-10">
            <SkeletonPremium className="flex-1 h-12 md:h-14 rounded-2xl" />
            <SkeletonPremium className="w-12 h-12 md:w-14 md:h-14 rounded-2xl shrink-0" />
          </div>

          {/* Action */}
          <SkeletonPremium className="h-12 md:h-14 w-40 rounded-2xl shrink-0" />
        </div>
      </div>

      <div className="space-y-12">
        {/* My Team Quick Access */}
        <div className="relative flex flex-col md:flex-row items-center p-8 border border-foreground/10 rounded-[3rem] shadow-2xl overflow-hidden">
          <div className="w-full relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-6">
            <div className="flex items-center gap-6 md:gap-8">
              <SkeletonPremium className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] shrink-0" />
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <SkeletonPremium className="w-28 h-6 rounded-full" />
                  <SkeletonPremium className="w-20 h-6 rounded-full" />
                </div>
                <SkeletonPremium className="w-48 md:w-72 h-10 md:h-14 rounded-2xl" />
                <SkeletonPremium className="w-40 h-4 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-1">
                <SkeletonPremium className="w-16 h-3 rounded-full" />
                <SkeletonPremium className="w-14 h-10 rounded-lg" />
              </div>
              <SkeletonPremium className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem]" />
            </div>
          </div>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-premium border border-foreground/5 relative overflow-hidden rounded-[2.5rem] bg-surface flex flex-col h-full shadow-2xl">
              {/* Banner Header */}
              <div className="relative h-28 w-full bg-surface-elevated flex justify-between items-start p-6">
                <SkeletonPremium className="w-16 h-14 rounded-2xl" />
                <SkeletonPremium className="w-10 h-10 rounded-full" />
              </div>

              {/* Team Info */}
              <div className="relative px-6 pb-6 pt-0 flex-1 flex flex-col">
                {/* Logo overlapping */}
                <div className="absolute -top-12 left-6">
                  <SkeletonPremium className="w-24 h-24 rounded-[1.5rem]" />
                </div>

                <div className="mt-14 space-y-3 flex-1">
                  <SkeletonPremium className="w-3/4 h-7 rounded-lg" />
                  <div className="flex flex-wrap items-center gap-3">
                    <SkeletonPremium className="w-28 h-6 rounded-full" />
                    <SkeletonPremium className="w-24 h-6 rounded-full" />
                  </div>
                </div>

                <div className="flex gap-2.5 mt-6">
                  <SkeletonPremium className="flex-1 h-14 rounded-2xl" />
                  <SkeletonPremium className="flex-1 h-14 rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
