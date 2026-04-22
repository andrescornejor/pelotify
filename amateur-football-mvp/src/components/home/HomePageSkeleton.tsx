'use client';

import { motion } from 'framer-motion';

const shimmer = {
  initial: { x: '-100%' },
  animate: { x: '100%' },
  transition: { repeat: Infinity, ease: 'linear', duration: 1.5 },
} as const;

const Bone = ({ className = '', style }: { className?: string, style?: React.CSSProperties }) => (
  <div className={`relative overflow-hidden bg-foreground/[0.03] ${className}`} style={style}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent w-[200%]"
      initial={shimmer.initial}
      animate={shimmer.animate}
      transition={shimmer.transition}
    />
  </div>
);

/**
 * HomePageSkeleton serves as the premium Splash Screen / Initial Loader
 * for the application when it boots up or fetches initial data.
 */
export const HomePageSkeleton = () => (
  <div className="relative min-h-screen bg-[#050505] font-sans flex flex-col overflow-hidden">
    
    {/* ─── MINIMAL LOADER ─── */}
    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
    </div>

    {/* ─── APP SKELETON (Dimmed out in background to simulate loading state) ─── */}
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 1.5 }}
      className="max-w-full mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-4 lg:py-8 space-y-8 lg:space-y-12 relative z-10 pointer-events-none filter blur-[2px]"
    >
      
      {/* ─── HERO SECTION ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[3rem] border border-white/[0.03]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 p-6 sm:p-12 lg:p-16 xl:p-20">
          <div className="flex-1 space-y-6 lg:space-y-8 max-w-2xl">
            <Bone className="w-32 h-7 rounded-full bg-white/[0.05]" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Bone className="w-[75%] h-12 lg:h-16 rounded-2xl bg-white/[0.05]" />
                <Bone className="w-[55%] h-12 lg:h-16 rounded-2xl bg-white/[0.05]" />
              </div>
              <div className="flex items-center gap-4 py-2">
                <Bone className="h-[2px] w-12 rounded-full bg-primary/20" />
                <Bone className="w-12 h-12 rounded-full border border-primary/20 bg-primary/10" />
                <Bone className="w-40 h-5 rounded-full bg-white/[0.05]" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6 pt-2">
              <div className="space-y-2">
                <Bone className="w-20 h-3 rounded-full bg-white/[0.05]" />
                <Bone className="w-24 h-7 rounded-lg bg-white/[0.05]" />
              </div>
              <div className="space-y-2">
                <Bone className="w-24 h-3 rounded-full bg-white/[0.05]" />
                <Bone className="w-16 h-7 rounded-lg bg-white/[0.05]" />
              </div>
            </div>
          </div>

          <div className="lg:shrink-0 w-full lg:w-[400px] space-y-4">
            <div className="rounded-[2.5rem] border border-primary/[0.1] p-6 space-y-6 bg-primary/[0.02]">
              <div className="flex items-center gap-6">
                <Bone className="w-24 h-24 rounded-2xl border border-primary/20 bg-primary/10" />
                <div className="flex-1 space-y-3">
                  <Bone className="w-28 h-3 rounded-full bg-white/[0.05]" />
                  <Bone className="w-20 h-6 rounded-lg bg-white/[0.05]" />
                  <Bone className="w-32 h-3 rounded-full bg-white/[0.05]" />
                </div>
              </div>
              <div className="space-y-3">
                <Bone className="w-full h-3 rounded-full bg-primary/20" />
                <div className="flex justify-between">
                  <Bone className="w-32 h-2 rounded-full bg-white/[0.05]" />
                  <Bone className="w-24 h-2 rounded-full bg-white/[0.05]" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Bone className="col-span-3 h-16 rounded-[2rem] bg-primary/20" />
              <Bone className="col-span-2 h-16 rounded-[2rem] bg-white/[0.05]" />
              <Bone className="col-span-1 h-16 rounded-[2rem] bg-orange-500/20" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-[2.5rem] border border-white/[0.03] p-6 space-y-4 bg-white/[0.02]">
                <Bone className={`w-12 h-12 rounded-2xl ${i === 0 ? 'bg-primary/20' : 'bg-white/[0.05]'}`} />
                <div className="space-y-2">
                  <Bone className="w-16 h-2 rounded-full bg-white/[0.05]" />
                  <Bone className="w-12 h-8 rounded-lg bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex items-end justify-between px-1">
              <div className="space-y-2">
                <Bone className="w-36 h-6 rounded-lg bg-white/[0.05]" />
                <Bone className="w-48 h-3 rounded-full bg-white/[0.05]" />
              </div>
            </div>
            <div className="rounded-[2.5rem] border border-white/[0.03] p-8 bg-white/[0.02] space-y-8">
              <div className="flex items-center justify-between px-4 sm:px-10">
                {[...Array(9)].map((_, i) => (
                  <Bone key={i} className="w-10 h-10 rounded-xl bg-white/[0.08]" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-4 space-y-6">
          <div className="rounded-[3rem] border border-white/[0.03] bg-white/[0.02] overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Bone className="w-32 h-3 rounded-full bg-primary/40" />
                  <Bone className="w-28 h-4 rounded-full bg-white/[0.05]" />
                </div>
                <Bone className="w-14 h-8 rounded-2xl bg-white/[0.05]" />
              </div>
              
              <div className="flex items-center justify-between px-4 gap-4">
                <div className="flex flex-col items-center gap-4 flex-1">
                  <Bone className="w-20 h-20 rounded-[2.5rem] bg-white/[0.05]" />
                </div>
                <Bone className="w-10 h-10 rounded-full border-2 border-primary/40 bg-transparent shrink-0" />
                <div className="flex flex-col items-center gap-4 flex-1">
                  <Bone className="w-20 h-20 rounded-[2.5rem] bg-white/[0.05]" />
                </div>
              </div>
              <Bone className="w-full h-14 rounded-2xl bg-primary/20" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);
