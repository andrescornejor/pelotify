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
    
    {/* ─── PREMIUM SPLASH SCREEN OVERLAY ELEMENTS ─── */}
    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
      {/* Center glowing orb */}
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0.15 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute w-[600px] h-[600px] bg-primary blur-[120px] rounded-full mix-blend-screen"
      />
      {/* Aesthetic grid overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
    </div>

    {/* SPLASH LOGO (Centered) */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-[2.5rem] border-[2px] border-dashed border-primary/40 opacity-70"
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2rem] border border-primary/30 shadow-[0_0_40px_rgba(44,252,125,0.4)] flex items-center justify-center backdrop-blur-xl"
          >
            <img src="/logo_pelotify.png" className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_0_15px_rgba(44,252,125,0.8)]" alt="Pelotify" />
          </motion.div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          PELOTI<span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#5dfd9d]">FY</span>
        </h1>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
          className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent mt-3 opacity-50"
        />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-primary/80 animate-pulse">
          Sincronizando la gloria...
        </p>
      </motion.div>
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
