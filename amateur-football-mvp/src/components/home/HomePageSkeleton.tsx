'use client';

import { motion } from 'framer-motion';

const shimmer = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
  transition: { repeat: Infinity, ease: 'linear', duration: 1.5 },
} as const;

const Bone = ({ className = '' }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-foreground/[0.04] ${className}`}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.04] to-transparent w-[200%]"
      initial={shimmer.initial}
      animate={shimmer.animate}
      transition={shimmer.transition}
    />
  </div>
);

/**
 * HomePageSkeleton mirrors the exact layout of the authenticated home page:
 * - Hero banner with greeting, title, avatar, rank progress, and CTA buttons
 * - StatCards grid (2x2 on mobile, 4-col on desktop)
 * - Community bar
 * - Road to Glory section
 * - FutTok highlights carousel
 * - Teams list
 * - Sidebar with next-match card + quick links
 */
export const HomePageSkeleton = () => (
  <div className="relative min-h-screen bg-background font-sans">
    {/* Scroll progress bar placeholder */}
    <div className="fixed top-0 left-0 right-0 h-[2px] bg-foreground/[0.02] z-50" />

    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-4 lg:py-8 space-y-8 lg:space-y-12">
      
      {/* â”€â”€â”€ HERO SECTION â”€â”€â”€ */}
      <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[2rem] shadow-2xl border border-foreground/[0.06]">
        {/* Background placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 p-6 sm:p-12 lg:p-16 xl:p-20">
          {/* Left: Text area */}
          <div className="flex-1 space-y-6 lg:space-y-8 max-w-2xl">
            {/* Greeting pill */}
            <Bone className="w-32 h-7 rounded-full" />
            
            {/* Title block */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Bone className="w-[75%] h-12 lg:h-16 rounded-2xl" />
                <Bone className="w-[55%] h-12 lg:h-16 rounded-2xl" />
              </div>
              {/* Avatar + welcome */}
              <div className="flex items-center gap-4 py-2">
                <Bone className="h-[2px] w-12 rounded-full" />
                <Bone className="w-12 h-12 rounded-full" />
                <Bone className="w-40 h-5 rounded-full" />
              </div>
            </div>
            
            {/* Stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6 pt-2">
              <div className="space-y-2">
                <Bone className="w-20 h-3 rounded-full" />
                <Bone className="w-24 h-7 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Bone className="w-24 h-3 rounded-full" />
                <Bone className="w-16 h-7 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Right: Rank card + CTAs */}
          <div className="lg:shrink-0 w-full lg:w-[400px] space-y-4">
            {/* Rank progress card */}
            <div className="rounded-[2rem] border border-foreground/[0.04] p-6 space-y-6 bg-foreground/[0.01]">
              <div className="flex items-center gap-6">
                <Bone className="w-24 h-24 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <Bone className="w-28 h-3 rounded-full" />
                  <Bone className="w-20 h-6 rounded-lg" />
                  <Bone className="w-32 h-3 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Bone className="w-14 h-8 rounded-lg" />
                  <Bone className="w-12 h-3 rounded-full" />
                </div>
              </div>
              {/* Progress bar */}
              <div className="space-y-3">
                <Bone className="w-full h-3 rounded-full" />
                <div className="flex justify-between">
                  <Bone className="w-32 h-2 rounded-full" />
                  <Bone className="w-24 h-2 rounded-full" />
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Bone className="col-span-3 h-16 rounded-[2rem]" />
              <Bone className="col-span-2 h-16 rounded-[2rem]" />
              <Bone className="col-span-1 h-16 rounded-[2rem]" />
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€â”€ MAIN GRID â”€â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* â”€â”€â”€ LEFT COLUMN â”€â”€â”€ */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          
          {/* StatCards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-[2rem] border border-foreground/[0.04] p-6 space-y-4 bg-foreground/[0.01]">
                <Bone className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2">
                  <Bone className="w-16 h-2 rounded-full" />
                  <Bone className="w-12 h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="py-10 flex items-center gap-6 opacity-20">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            <Bone className="w-2 h-2 rounded-full" />
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          </div>

          {/* Community Banner */}
          <div className="rounded-[2rem] border border-foreground/[0.04] p-6 bg-foreground/[0.01] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Bone className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2">
                <Bone className="w-32 h-5 rounded-lg" />
                <Bone className="w-48 h-3 rounded-full" />
              </div>
            </div>
            <div className="flex gap-3">
              <Bone className="w-28 h-11 rounded-2xl" />
              <Bone className="w-28 h-11 rounded-2xl" />
            </div>
          </div>

          {/* Divider */}
          <div className="py-10 flex items-center gap-6 opacity-20">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            <Bone className="w-2 h-2 rounded-full" />
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          </div>

          {/* Road to Glory */}
          <div className="space-y-6">
            <div className="flex items-end justify-between px-1">
              <div className="space-y-2">
                <Bone className="w-36 h-6 rounded-lg" />
                <Bone className="w-48 h-3 rounded-full" />
              </div>
            </div>
            <div className="rounded-[2rem] border border-foreground/[0.04] p-8 bg-foreground/[0.01] space-y-8">
              {/* Rank progress line */}
              <div className="flex items-center justify-between px-4 sm:px-10">
                {[...Array(9)].map((_, i) => (
                  <Bone key={i} className="w-10 h-10 rounded-xl" />
                ))}
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-foreground/[0.03]">
                    <Bone className="w-10 h-10 rounded-xl" />
                    <div className="space-y-2">
                      <Bone className="w-16 h-2 rounded-full" />
                      <Bone className="w-10 h-6 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="py-10 flex items-center gap-6 opacity-20">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            <Bone className="w-2 h-2 rounded-full" />
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          </div>

          {/* FutTok Highlights */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="space-y-2">
                <Bone className="w-40 h-6 rounded-lg" />
                <Bone className="w-48 h-3 rounded-full" />
              </div>
              <Bone className="w-32 h-8 rounded-full" />
            </div>
            <div className="flex gap-4 overflow-hidden h-[280px] sm:h-[380px]">
              {[...Array(4)].map((_, i) => (
                <Bone key={i} className="shrink-0 w-32 sm:w-44 h-full rounded-[2rem]" />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="py-10 flex items-center gap-6 opacity-20">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            <Bone className="w-2 h-2 rounded-full" />
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          </div>

          {/* Teams */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <div className="space-y-2">
                <Bone className="w-28 h-6 rounded-lg" />
                <Bone className="w-40 h-3 rounded-full" />
              </div>
              <Bone className="w-24 h-8 rounded-2xl" />
            </div>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-[2rem] border border-foreground/[0.04] p-7 bg-foreground/[0.01] flex items-center gap-8">
                <Bone className="w-24 h-24 rounded-[2rem] shrink-0" />
                <div className="flex-1 space-y-3">
                  <Bone className="w-40 h-8 rounded-lg" />
                  <div className="flex gap-3">
                    {[...Array(4)].map((_, j) => (
                      <Bone key={j} className="w-9 h-9 rounded-full" />
                    ))}
                  </div>
                </div>
                <Bone className="w-16 h-16 rounded-[2rem] hidden sm:block" />
              </div>
            ))}
          </div>
        </div>

        {/* â”€â”€â”€ RIGHT COLUMN (SIDEBAR) â”€â”€â”€ */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-6">
          {/* Next Match Card */}
          <div className="rounded-[2rem] border border-foreground/[0.04] bg-foreground/[0.01] overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Bone className="w-32 h-3 rounded-full" />
                  <Bone className="w-28 h-4 rounded-full" />
                </div>
                <Bone className="w-14 h-8 rounded-2xl" />
              </div>
              
              {/* Matchup */}
              <div className="flex items-center justify-between px-4 gap-4">
                <div className="flex flex-col items-center gap-4 flex-1">
                  <Bone className="w-20 h-20 rounded-[2rem]" />
                  <div className="space-y-1 flex flex-col items-center">
                    <Bone className="w-16 h-4 rounded-lg" />
                    <Bone className="w-12 h-2 rounded-full" />
                  </div>
                </div>
                <Bone className="w-14 h-14 rounded-full shrink-0" />
                <div className="flex flex-col items-center gap-4 flex-1">
                  <Bone className="w-20 h-20 rounded-[2rem]" />
                  <div className="space-y-1 flex flex-col items-center">
                    <Bone className="w-16 h-4 rounded-lg" />
                    <Bone className="w-12 h-2 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 rounded-3xl border border-foreground/[0.03]">
                  <Bone className="w-10 h-10 rounded-2xl" />
                  <div className="space-y-2">
                    <Bone className="w-12 h-2 rounded-full" />
                    <Bone className="w-16 h-3 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-3xl border border-foreground/[0.03]">
                  <Bone className="w-10 h-10 rounded-2xl" />
                  <div className="space-y-2">
                    <Bone className="w-12 h-2 rounded-full" />
                    <Bone className="w-16 h-3 rounded-full" />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Bone className="w-full h-14 rounded-2xl" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-[2rem] border border-foreground/[0.04] bg-foreground/[0.01] p-6 space-y-4">
            <Bone className="w-24 h-3 rounded-full" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between h-12 px-4">
                  <div className="flex items-center gap-3">
                    <Bone className="w-4 h-4 rounded" />
                    <Bone className="w-20 h-3 rounded-full" />
                  </div>
                  <Bone className="w-4 h-4 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
