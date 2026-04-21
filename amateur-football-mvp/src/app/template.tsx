'use client';

import { motion } from 'framer-motion';
import { useSwipeDirection } from '@/contexts/SwipeNavigationContext';
import { useEffect } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  const { direction, clearDirection } = useSwipeDirection();

  // Clear the swipe direction after the entry animation plays
  useEffect(() => {
    if (direction) {
      const timer = setTimeout(clearDirection, 400);
      return () => clearTimeout(timer);
    }
  }, [direction, clearDirection]);

  // Swipe navigation: slide in from the correct side
  if (direction) {
    const enterX = direction === 'left' ? '40%' : '-40%';
    return (
      <motion.div
        initial={{ opacity: 0, x: enterX }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
          opacity: { duration: 0.2 },
        }}
        className="flex flex-col flex-1 origin-top"
      >
        {children}
      </motion.div>
    );
  }

  // Default transition for non-swipe navigations (tapping nav items, links, etc.)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: 0.3 },
        filter: { duration: 0.3 }
      }}
      className="flex flex-col flex-1 origin-top"
    >
      {children}
    </motion.div>
  );
}
