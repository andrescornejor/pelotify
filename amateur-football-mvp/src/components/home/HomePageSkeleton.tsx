'use client';

import { motion } from 'framer-motion';

/**
 * Bone component uses the CSS-based skeleton-shimmer defined in globals.css
 * for maximum performance (GPU accelerated CSS instead of JS Framer Motion).
 */
const Bone = ({ className = '', style }: { className?: string, style?: React.CSSProperties }) => (
  <div 
    className={`skeleton-shimmer relative overflow-hidden bg-foreground/[0.04] ${className}`} 
    style={{ ...style, willChange: 'transform' }} 
  />
);

/**
 * HomePageSkeleton serves as the high-performance Splash Screen / Initial Loader.
 * Optimized for low-end devices while maintaining a premium aesthetic.
 */
export const HomePageSkeleton = () => (
  <div className="relative min-h-screen bg-background text-foreground font-sans flex flex-col overflow-hidden">

    {/* Simplified Ambient Background - Using simple radial gradients instead of heavy blurs */}
    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-50">
      <div 
        className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full" 
        style={{ background: 'radial-gradient(circle at center, rgba(var(--primary-rgb), 0.15), transparent 70%)' }}
      />
      <div 
        className="absolute -bottom-40 -left-40 w-[620px] h-[620px] rounded-full" 
        style={{ background: 'radial-gradient(circle at center, rgba(var(--primary-rgb), 0.1), transparent 70%)' }}
      />
    </div>
    
    {/* ─── CONSOLIDATED PREMIUM LOADER ─── */}
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative"
        >
          {/* Subtle Glow - Reduced complexity */}
          <div className="absolute -inset-8 rounded-full opacity-40 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.3),transparent_65%)]" />
          
          <div className="relative w-28 h-28 rounded-[2.5rem] border border-primary/25 bg-foreground/[0.03] backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
            
            {/* Logo with micro-pulse */}
            <motion.img 
              src="/logo_pelotify.png" 
              alt="Pelotify" 
              className="w-16 h-16 object-contain relative z-10"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          {/* Orbital Ring - High Visual, Low Cost */}
          <div className="absolute inset-[-12px] rounded-[3rem] border border-primary/10 animate-[spin_8s_linear_infinite]" />
        </motion.div>

        <div className="flex flex-col items-center gap-4">
          <div className="text-center space-y-1">
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-primary/80">
              Pelotify
            </h2>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/40 animate-pulse">
              Sincronizando experiencia...
            </p>
          </div>

          {/* Optimized Progress Bar - Using CSS animation for zero JS overhead */}
          <div className="w-[180px] h-1 rounded-full overflow-hidden border border-foreground/[0.06] bg-foreground/[0.02] relative">
            <div className="absolute inset-0 bg-primary/5" />
            <div 
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-[skeleton-sweep_1.5s_infinite_ease-in-out]"
              style={{ willChange: 'transform' }}
            />
          </div>
        </div>
      </div>
    </div>

    {/* ─── APP SKELETON (Subtle background context) ─── */}
    <div className="max-w-full mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-4 lg:py-8 space-y-8 lg:space-y-12 relative z-10 pointer-events-none opacity-[0.12]">
      
      {/* ─── HERO SECTION ─── */}
      <div className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[3rem] border border-foreground/[0.06] bg-foreground/[0.01]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 p-6 sm:p-12 lg:p-16 xl:p-20">
          <div className="flex-1 space-y-6 lg:space-y-8 max-w-2xl">
            <Bone className="w-32 h-7 rounded-full" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Bone className="w-[75%] h-12 lg:h-16 rounded-2xl" />
                <Bone className="w-[55%] h-12 lg:h-16 rounded-2xl" />
              </div>
              <div className="flex items-center gap-4 py-2">
                <Bone className="h-[2px] w-12 rounded-full" />
                <Bone className="w-12 h-12 rounded-full opacity-30" />
                <Bone className="w-40 h-5 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6 pt-2">
              <Bone className="w-full h-12 rounded-xl" />
              <Bone className="w-full h-12 rounded-xl" />
            </div>
          </div>

          <div className="lg:shrink-0 w-full lg:w-[400px] space-y-4">
            <div className="rounded-[2.5rem] border border-primary/[0.08] p-6 space-y-6 bg-primary/[0.01]">
              <div className="flex items-center gap-6">
                <Bone className="w-24 h-24 rounded-2xl opacity-40" />
                <div className="flex-1 space-y-3">
                  <Bone className="w-28 h-3 rounded-full" />
                  <Bone className="w-20 h-6 rounded-lg" />
                  <Bone className="w-32 h-3 rounded-full" />
                </div>
              </div>
              <Bone className="w-full h-3 rounded-full opacity-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-[2rem] border border-foreground/[0.06] p-6 space-y-4">
                <Bone className="w-10 h-10 rounded-xl" />
                <Bone className="w-16 h-3 rounded-full" />
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <Bone className="w-48 h-8 rounded-xl" />
            <div className="rounded-[2rem] border border-foreground/[0.06] p-8 h-32">
              <div className="flex justify-between">
                 {[...Array(5)].map((_, i) => (
                  <Bone key={i} className="w-12 h-12 rounded-xl opacity-20" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-[2.5rem] border border-foreground/[0.06] h-[300px] p-8 space-y-6">
             <Bone className="w-full h-6 rounded-full" />
             <div className="flex justify-between items-center py-4">
                <Bone className="w-20 h-20 rounded-[2rem]" />
                <Bone className="w-10 h-10 rounded-full opacity-30" />
                <Bone className="w-20 h-20 rounded-[2rem]" />
             </div>
             <Bone className="w-full h-14 rounded-2xl opacity-20" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
