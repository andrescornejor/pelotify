'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '#hero-avatar',
    title: 'Tu Identidad Digital',
    content: 'Este es tu avatar. El resplandor cambia según tu rango actual. ¡Mantenlo encendido ganando partidos!',
    position: 'bottom',
  },
  {
    target: '#stat-cards',
    title: 'Tus Métricas',
    content: 'Aquí ves tu ELO, partidos, MVPs y Win Rate. Pasa el cursor para ver detalles y micro-animaciones.',
    position: 'bottom',
  },
  {
    target: '#activity-feed',
    title: 'Feed de Actividad',
    content: 'Tus últimos resultados aparecen aquí en tiempo real. ¡Analizá tu progreso!',
    position: 'right',
  },
  {
    target: '#featured-match',
    title: 'Partido Destacado',
    content: 'El próximo gran desafío. No te pierdas el countdown para llegar a tiempo.',
    position: 'left',
  },
  {
    target: '#quick-messages',
    title: 'Comunicaciones Rápidas',
    content: 'Tus chats más recientes siempre a mano. ¡No dejes a nadie esperando!',
    position: 'left',
  },
];

export function OnboardingTour() {
  const { user, completeTour } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Check if tour should be shown
    if (user && !user.user_metadata?.tour_completed) {
      // Delay slightly for initial page load animations
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    if (!isVisible) return;

    const updateRect = () => {
      const step = TOUR_STEPS[currentStep];
      const el = document.querySelector(step.target);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        // Scroll to element
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    completeTour();
  };

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];

  // Helper to calculate smart position
  const getTooltipStyle = () => {
    if (!targetRect) return {};

    const padding = 20;
    const tooltipWidth = 320; // Matches w-80
    const tooltipHeight = 250; // Approximated

    let left = 0;
    let top = 0;

    // Mobile: Center at bottom
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return {
        left: '50%',
        bottom: '40px',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: '400px',
      };
    }

    // Desktop: Initial position based on step preference
    switch (step.position) {
      case 'left':
        left = targetRect.left - tooltipWidth - padding;
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        left = targetRect.right + padding;
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        break;
      case 'top':
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        top = targetRect.top - tooltipHeight - padding;
        break;
      case 'bottom':
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        top = targetRect.bottom + padding;
        break;
      default:
        left = window.innerWidth / 2 - tooltipWidth / 2;
        top = window.innerHeight / 2 - tooltipHeight / 2;
    }

    // Clamp to screen edges
    const maxLeft = window.innerWidth - tooltipWidth - padding;
    const maxTop = window.innerHeight - tooltipHeight - padding;

    left = Math.max(padding, Math.min(left, maxLeft));
    top = Math.max(padding, Math.min(top, maxTop));

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  };

  const tooltipStyle = getTooltipStyle();

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Backdrop with Spotlight Mask */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 pointer-events-auto backdrop-blur-sm"
          style={{
            maskImage: targetRect
              ? `radial-gradient(circle ${Math.max(targetRect.width, targetRect.height) / 1.5 + 40}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent 100%, black 100%)`
              : 'none',
            WebkitMaskImage: targetRect
              ? `radial-gradient(circle ${Math.max(targetRect.width, targetRect.height) / 1.5 + 40}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent 100%, black 100%)`
              : 'none',
          }}
        />

        {/* Highlight Ring */}
        {targetRect && (
          <motion.div
            key={`ring-${currentStep}`}
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute border-2 border-primary rounded-2xl shadow-[0_0_50px_rgba(44,252,125,0.5)] z-[101]"
            style={{
              left: targetRect.left - 10,
              top: targetRect.top - 10,
              width: targetRect.width + 20,
              height: targetRect.height + 20,
            }}
          />
        )}

        {/* Tooltip Card */}
        {targetRect && (
          <motion.div
            key={`tooltip-${currentStep}`}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: [0, -6, 0], 
              scale: 1 
            }}
            transition={{ 
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              default: { type: 'spring', stiffness: 260, damping: 20 }
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "absolute pointer-events-auto",
              "glass-premium-dark p-6 sm:p-10 rounded-[3rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]",
              "flex flex-col gap-4 sm:gap-8 z-[102] overflow-hidden"
            )}
            style={tooltipStyle}
          >
            {/* Inner Glow Decorative Element */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />

            {/* Progress Top Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                className="h-full bg-primary shadow-[0_0_10px_var(--primary)]"
              />
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-inner">
                  <Zap className="w-6 h-6 text-primary fill-primary/20 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] leading-none mb-1">
                    PELOTIFY GUIDE
                  </span>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-primary/40 leading-none py-1">
                    {step.title}
                  </h3>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="w-10 h-10 rounded-full glass border-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
              <p className="text-[14px] text-zinc-400 font-medium leading-[1.6] pl-2">
                {step.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl text-[10px] font-black text-white/40 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest border border-transparent hover:border-white/5"
              >
                Saltar Tour
              </button>

              <div className="flex items-center gap-6">
                <div className="flex gap-2">
                  {TOUR_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-500",
                        i === currentStep ? "w-8 bg-primary shadow-[0_0_10px_var(--primary)]" : "bg-white/10"
                      )}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="px-8 h-14 rounded-2xl bg-primary text-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 font-black uppercase text-[11px] tracking-widest transition-all group"
                >
                  <span>{currentStep === TOUR_STEPS.length - 1 ? 'FINALIZAR' : 'SIGUIENTE'}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
