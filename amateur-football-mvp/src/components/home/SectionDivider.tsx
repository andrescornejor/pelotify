'use client';

import { motion } from 'framer-motion';

export const SectionDivider = () => (
  <motion.div 
    initial={{ opacity: 0, scaleX: 0.8 }}
    whileInView={{ opacity: 1, scaleX: 1 }}
    viewport={{ once: true }}
    className="flex items-center gap-8 py-16 px-4 select-none group"
  >
    {/* Left Line Group */}
    <div className="relative flex-1 h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-sm" />
    </div>

    {/* Central Core */}
    <div className="relative flex items-center justify-center">
        {/* Outer Glow Ring */}
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-8 h-8 rounded-full bg-primary/10 blur-xl"
        />
        
        {/* Geometric Centerpiece */}
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20 transition-all duration-500 group-hover:bg-primary/40" />
            
            <div className="relative group-hover:rotate-45 transition-transform duration-700">
                <div className="w-3 h-3 rotate-45 border-2 border-primary/40 bg-background shadow-[0_0_15px_rgba(44,252,125,0.2)]" />
                <div className="absolute inset-0 w-3 h-3 rotate-45 bg-primary animate-pulse blur-[1px]" />
            </div>
            
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20 transition-all duration-500 group-hover:bg-primary/40" />
        </div>
    </div>

    {/* Right Line Group */}
    <div className="relative flex-1 h-px">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-primary/30 to-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-primary/5 to-transparent blur-sm" />
    </div>
  </motion.div>
);
