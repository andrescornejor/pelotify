'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export const EmptyState = ({ icon: Icon, title, description, actionText, actionHref }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="w-full py-16 px-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-6 glass-premium border-primary/20 bg-surface/40 relative overflow-hidden group shadow-2xl"
  >
    {/* Base Grid & Shimmer */}
    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    
    {/* Animated Glow Behind Icon */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/20 blur-[50px] rounded-full opacity-50 group-hover:opacity-100 group-hover:scale-150 transition-all duration-1000" />

    <div className="relative group-hover:-translate-y-2 transition-transform duration-500 z-10">
      <div className="w-20 h-20 rounded-[2rem] bg-surface-elevated/80 backdrop-blur-md flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Icon className="w-10 h-10 text-foreground/40 group-hover:text-primary transition-colors duration-500" />
      </div>
    </div>

    <div className="space-y-3 relative z-10">
      <h5 className="text-2xl font-black italic uppercase tracking-tighter text-foreground/90 font-kanit">
        {title}
      </h5>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2 text-[8px] font-black text-foreground/30 uppercase tracking-[0.2em]">
          <Sparkles className="w-3 h-3 text-primary/50" />
          <span>Aviso del Sistema</span>
          <Sparkles className="w-3 h-3 text-primary/50" />
        </div>
        <p className="text-[12px] font-medium text-foreground/50 tracking-wide max-w-[300px] leading-relaxed mx-auto">
          {description}
        </p>
      </div>
    </div>
    
    {actionText && actionHref && (
      <Link href={actionHref} className="relative z-10 w-full max-w-[240px] mt-2">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-2 shadow-xl hover:bg-primary hover:text-black transition-colors duration-300 group/btn border border-transparent"
        >
          <span className="relative z-10">{actionText}</span>
        </motion.button>
      </Link>
    )}
  </motion.div>
);
