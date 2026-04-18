'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

export function MobileScrollToTop() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);
  const { hapticLight } = useHaptic();

  useEffect(() => {
    const handleScroll = () => {
      // Show button after 400px scroll
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      setProgress(scrolled);
      setShow(winScroll > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    hapticLight();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-[calc(96px+env(safe-area-inset-bottom,0px))] right-6 z-[95] w-12 h-12 flex items-center justify-center lg:hidden"
        >
          {/* Progress Circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-foreground/10"
            />
            <motion.circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="140"
              strokeDashoffset={140 - (progress / 100) * 140}
              className="text-primary"
              style={{ strokeLinecap: 'round' }}
            />
          </svg>
          
          <div className="w-10 h-10 bg-surface/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/10 group active:scale-90 transition-transform">
            <ArrowUp className="w-5 h-5 text-foreground/80 group-hover:text-primary transition-colors" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
