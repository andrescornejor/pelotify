'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export const EmptyState = ({ icon: Icon, title, description, actionText, actionHref }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    whileInView={{ opacity: 1, scale: 1 }}
    className="w-full py-12 px-6 rounded-2xl flex flex-col items-center justify-center text-center gap-5 card-stadium relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="w-14 h-14 rounded-xl bg-foreground/[0.03] flex items-center justify-center border border-foreground/[0.05] group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7 text-foreground/15 group-hover:text-primary/30 transition-colors" />
    </div>
    <div className="space-y-1.5 relative z-10">
      <h5 className="text-lg font-bold tracking-tight text-foreground">{title}</h5>
      <p className="text-[12px] font-medium text-foreground/35 max-w-[280px] leading-relaxed">
        {description}
      </p>
    </div>
    {actionText && actionHref && (
      <Link href={actionHref}>
        <button className="btn-glass text-[10px]">
          {actionText}
        </button>
      </Link>
    )}
  </motion.div>
);
