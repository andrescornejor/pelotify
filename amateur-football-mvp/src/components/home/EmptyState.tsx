'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const EmptyState = ({ icon: Icon, title, description, actionText, actionHref }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    className="w-full py-12 px-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-6 glass-premium border-white/5 bg-foreground/[0.01] relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="w-16 h-16 rounded-[2rem] bg-surface flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
      <Icon className="w-8 h-8 text-foreground/20 group-hover:text-primary/40 transition-colors" />
    </div>
    <div className="space-y-2 relative z-10">
      <h5 className="text-lg font-black italic uppercase tracking-tighter text-foreground font-kanit">{title}</h5>
      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] max-w-[240px] leading-relaxed">
        {description}
      </p>
    </div>
    {actionText && actionHref && (
      <Link href={actionHref}>
        <button className="px-8 h-10 rounded-xl bg-foreground/[0.03] hover:bg-primary hover:text-background border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95">
          {actionText}
        </button>
      </Link>
    )}
  </motion.div>
);
