'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'auto' | 'full' | 'half';
}

export function BottomSheet({ isOpen, onClose, title, children, height = 'auto' }: BottomSheetProps) {
  const { hapticLight, hapticMedium } = useHaptic();
  const dragControls = useDragControls();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      hapticMedium();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDragEnd = (_: any, info: any) => {
    // If dragged down far enough or fast enough, close it
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
      hapticLight();
    }
  };

  const heightClass = {
    auto: 'max-h-[90vh]',
    full: 'h-[95vh]',
    half: 'h-[50vh]',
  }[height];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              onClose();
              hapticLight();
            }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={handleDragEnd}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[101] bg-surface-elevated border-t border-white/10 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col",
              heightClass
            )}
          >
            {/* Safe Area Notch / Drag Handle */}
            <div 
              className="w-full flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-12 h-1.5 bg-foreground/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 pt-2 flex items-center justify-between border-b border-foreground/5 shrink-0">
              {title && (
                <h3 className="text-xl font-bold font-kanit tracking-tight text-foreground/90">
                  {title}
                </h3>
              )}
              <button
                onClick={() => {
                  onClose();
                  hapticLight();
                }}
                className="p-2 ml-auto rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain">
              {children}
            </div>
            
            {/* Bottom Safe Area spacing */}
            <div className="h-[env(safe-area-inset-bottom,20px)] w-full shrink-0" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
