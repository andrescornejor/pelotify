'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';
import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobilePullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  disabled?: boolean;
}

export function MobilePullToRefresh({
  children,
  onRefresh,
  className,
  disabled = false,
}: MobilePullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const { hapticLight, hapticSuccess } = useHaptic();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  
  // Pull threshold in pixels
  const THRESHOLD = 100;
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    // Only allow pull if we are at the top of the window
    const scrollTop = typeof window !== 'undefined' ? window.scrollY : 0;
    if (scrollTop > 5) return;
    
    startY.current = e.touches[0].pageY;
    isDragging.current = true;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || isRefreshing) return;
    
    currentY.current = e.touches[0].pageY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      // Prevent browser default pull-to-refresh if possible
      // but only if we are actually pulling down
      if (e.cancelable) {
        // e.preventDefault();
      }
      
      const progress = Math.min(diff / THRESHOLD, 1.5);
      setPullProgress(progress);
      
      // Haptic feedback when reaching threshold
      if (progress >= 1 && pullProgress < 1) {
        hapticLight();
      }
    } else {
      setPullProgress(0);
    }
  };
  
  const handleTouchEnd = async () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    if (pullProgress >= 1) {
      setIsRefreshing(true);
      hapticSuccess();
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullProgress(0);
      }
    } else {
      setPullProgress(0);
    }
  };

  return (
    <div 
      className={cn("relative w-full min-h-[100dvh]", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-50 overflow-hidden"
        style={{ height: pullProgress > 0 || isRefreshing ? '80px' : '0' }}
      >
        <motion.div
          animate={{ 
            y: isRefreshing ? 25 : (pullProgress * 40 - 20),
            opacity: isRefreshing ? 1 : Math.max(0, pullProgress),
            scale: isRefreshing ? 1 : Math.min(pullProgress, 1.1)
          }}
          className="bg-background/95 backdrop-blur-[20px] rounded-full p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-foreground/5 flex items-center justify-center mt-2 z-50 ring-1 ring-black/5"
        >
          {isRefreshing ? (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-1"
            >
              <Loader2 className="w-5 h-5 text-primary animate-spin" strokeWidth={3} />
            </motion.div>
          ) : (
            <div className="relative flex items-center justify-center w-7 h-7">
              {/* Background Ring */}
              <svg className="absolute inset-0 w-full h-full text-foreground/10" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
              </svg>
              
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 text-primary" viewBox="0 0 24 24" fill="none">
                <motion.circle 
                  cx="12" cy="12" r="10" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 10}
                  strokeDashoffset={2 * Math.PI * 10 * (1 - Math.min(pullProgress, 1))}
                />
              </svg>
              
              {/* Inner Animated Arrow */}
              <motion.div
                animate={{ 
                  rotate: pullProgress >= 1 ? 180 : 0,
                  y: pullProgress >= 1 ? -1 : 0
                }}
                className={cn(
                  "z-10 transition-colors",
                  pullProgress >= 1 ? "text-primary" : "text-foreground/40"
                )}
              >
                <ArrowDown className="w-3.5 h-3.5 mt-[2px]" strokeWidth={3} />
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Main Content with subtle bounce back */}
      <motion.div
        animate={{ 
          y: isRefreshing ? 40 : (pullProgress * 30),
        }}
        transition={isRefreshing ? { type: "spring", stiffness: 200, damping: 20 } : { type: "tween", duration: 0.1 }}
        className="min-h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
