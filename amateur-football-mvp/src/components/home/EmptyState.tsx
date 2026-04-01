'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: React.ElementType;
  illustration?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export const EmptyState = ({ icon: Icon, illustration, title, description, actionText, actionHref }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="w-full py-16 px-8 rounded-[3rem] flex flex-col items-center justify-center text-center gap-8 glass-premium border-white/5 bg-foreground/[0.01] relative overflow-hidden group shadow-2xl"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    
    {illustration ? (
      <div className="w-full max-w-[200px] mb-2 relative z-10">
        {illustration}
      </div>
    ) : Icon ? (
      <div className="w-20 h-20 rounded-[2.5rem] bg-surface flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-10 h-10 text-foreground/20 group-hover:text-primary/40 transition-colors" />
      </div>
    ) : null}
    <div className="space-y-2 relative z-10">
      <h5 className="text-lg font-black italic uppercase tracking-tighter text-foreground font-kanit">{title}</h5>
      <p className="text-[11px] font-medium text-foreground/40 tracking-wide max-w-[280px] leading-relaxed">
        {description}
      </p>
    </div>
    {actionText && actionHref && (
      <Link href={actionHref}>
        <button className="px-8 h-10 rounded-xl bg-foreground/[0.03] hover:bg-primary hover:text-background border border-white/10 text-[9px] font-bold uppercase tracking-widest transition-all">
          {actionText}
        </button>
      </Link>
    )}
  </motion.div>
);
