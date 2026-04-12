'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface StatCardProps {
  stat: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
    glow?: string;
    tooltip?: string;
  };
  i: number;
  performanceMode: boolean;
  fadeUp: any;
}

export const StatCard = ({ stat, i, performanceMode, fadeUp }: StatCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Parallax physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (performanceMode || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={i}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={performanceMode ? {} : { rotateX, rotateY, transformPerspective: 1000 }}
      whileHover={performanceMode ? {} : { scale: 1.02 }}
      className={cn(
        'group relative overflow-hidden p-6 rounded-[2.5rem] glass-premium transition-colors duration-500 border-foreground/15 shadow-xl',
        performanceMode && 'bg-surface shadow-none'
      )}
    >
      {/* Dynamic Background Glow */}
      {!performanceMode && (
        <div
          className="absolute -right-6 -top-6 w-32 h-32 blur-[50px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full pointer-events-none"
          style={{ backgroundColor: stat.color }}
        />
      )}

      <div className="relative z-10 space-y-4 pointer-events-none">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center glass border-foreground/20 shadow-inner group-hover:rotate-12 transition-transform duration-500"
          style={{ backgroundColor: `${stat.color}15` }}
        >
          <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-[0.2em] font-kanit">
            {stat.label}
          </p>
          <div className="flex items-end gap-1.5 mt-1">
            <h3 className="text-3xl font-black italic tracking-tighter text-foreground font-kanit leading-none">
              {stat.value}
            </h3>
            {!performanceMode && (
              <div className="mb-1 flex items-center gap-0.5 text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                 <TrendingUp className="w-3 h-3" />
                 <span className="text-[8px] font-bold">+4%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

