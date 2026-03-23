'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft,
  X, 
  Zap, 
  Trophy, 
  User2, 
  Activity, 
  Calendar, 
  Star,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: any;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '#hero-avatar',
    title: 'Tu Legado Digital',
    content: 'Este es tu perfil. El brillo de tu avatar evoluciona con tu rango. ¡Ganar partidos lo hace brillar con más fuerza!',
    position: 'bottom',
    icon: User2
  },
  {
    target: '#stat-cards',
    title: 'Poder Competitivo',
    content: 'Tu ELO, MVPs y Win Rate definen tu estatus en la liga. Analizá cada métrica para mejorar tu juego.',
    position: 'bottom',
    icon: Trophy
  },
  {
    target: '#activity-feed',
    title: 'Pulso de la Liga',
    content: 'Mantenete al tanto de los ascensos y victorias de la comunidad en tiempo real. ¡La competencia no descansa!',
    position: 'right',
    icon: Activity
  },
  {
    target: '#featured-match',
    title: 'Cita con la Gloria',
    content: 'Tu próximo gran desafío. El cronómetro no miente: preparate para dar lo mejor en la cancha.',
    position: 'left',
    icon: Calendar
  },
  {
    target: '#stat-cards', // Using same for final step as it's a good overview area
    title: '¡Todo Listo!',
    content: 'Ya conocés los fundamentos. Ahora es momento de entrar a la cancha y empezar a escribir tu historia.',
    position: 'center',
    icon: Star
  }
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

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "absolute pointer-events-auto",
              "glass-premium-dark p-6 sm:p-8 rounded-[2.5rem] border border-primary/30 shadow-[0_40px_80px_rgba(0,0,0,0.6)]",
              "flex flex-col gap-5 sm:gap-6 z-[102]"
            )}
            style={tooltipStyle}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none">
                    PASO {currentStep + 1} DE {TOUR_STEPS.length}
                  </span>
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mt-1">
                    {step.title}
                  </h3>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[14px] text-zinc-300 font-medium leading-relaxed max-w-sm">
              {step.content}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleClose}
                  className="text-[10px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em]"
                >
                  Saltar
                </button>
                <div className="hidden sm:flex gap-1.5">
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
              </div>

              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="h-14 px-6 rounded-2xl glass border-white/10 text-white flex items-center justify-center hover:bg-white/5 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  className={cn(
                    "h-14 px-8 rounded-2xl bg-primary text-black font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all group",
                    currentStep === TOUR_STEPS.length - 1 && "px-10 bg-white"
                  )}
                >
                  <span>
                    {currentStep === TOUR_STEPS.length - 1 ? 'COMENZAR LEGADO' : 'SIGUIENTE'}
                  </span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
