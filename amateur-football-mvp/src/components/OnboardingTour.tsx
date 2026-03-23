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

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <AnimatePresence>
        {/* Backdrop with Spotlight Mask */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 pointer-events-auto"
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
            className="absolute border-2 border-primary rounded-2xl shadow-[0_0_50px_rgba(44,252,125,0.5)]"
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "absolute pointer-events-auto w-80",
              "glass-premium-dark p-8 rounded-[2rem] border border-primary/30 shadow-[0_30px_60px_rgba(0,0,0,0.5)]",
              "flex flex-col gap-6"
            )}
            style={{
              // Intelligent positioning based on step.position and screen bounds
              left: step.position === 'left' ? targetRect.left - 340 : step.position === 'right' ? targetRect.right + 20 : targetRect.left + targetRect.width / 2 - 160,
              top: step.position === 'top' ? targetRect.top - 200 : step.position === 'bottom' ? targetRect.bottom + 20 : targetRect.top + targetRect.height / 2 - 100,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                  Tutorial Paso {currentStep + 1}
                </span>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                  {step.title}
                </h3>
              </div>
            </div>

            <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">
              {step.content}
            </p>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleClose}
                className="text-[10px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                Saltar
              </button>

              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                        i === currentStep ? "w-6 bg-primary" : "bg-white/10"
                      )}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="w-14 h-14 rounded-2xl bg-primary text-black flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all group"
                >
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
