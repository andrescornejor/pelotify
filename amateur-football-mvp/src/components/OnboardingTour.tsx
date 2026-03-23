'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Trophy, Users, Calendar, MessageSquare, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOUR_STORAGE_KEY = 'pelotify_tour_completed';

interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  position: 'top' | 'bottom' | 'left' | 'right';
  color: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="hero"]',
    title: '¡Bienvenido a Pelotify!',
    description: 'Este es tu centro de comando. Desde acá podés ver tu ELO, rango y toda la info de tu carrera futbolera.',
    icon: Sparkles,
    position: 'bottom',
    color: '#10b981',
  },
  {
    targetSelector: '[data-tour="stats"]',
    title: 'Tus Estadísticas',
    description: 'Acá están tus stats en tiempo real: ELO, partidos, MVPs y win rate. ¡Cada partido suma!',
    icon: Trophy,
    position: 'bottom',
    color: '#f59e0b',
  },
  {
    targetSelector: '[data-tour="teams"]',
    title: 'Tus Equipos',
    description: 'Gestioná tus clubes, creá uno nuevo o unite a uno existente. Los equipos también tienen ELO propio.',
    icon: Users,
    position: 'top',
    color: '#6366f1',
  },
  {
    targetSelector: '[data-tour="agenda"]',
    title: 'Tu Agenda',
    description: 'Todos tus próximos partidos aparecen acá. Podés ver la ubicación, hora y cuántos jugadores faltan.',
    icon: Calendar,
    position: 'left',
    color: '#f59e0b',
  },
  {
    targetSelector: '[data-tour="messages"]',
    title: 'Mensajes Rápidos',
    description: 'Chateá con tus amigos directamente desde el home. También podés ir a la sección completa de mensajes.',
    icon: MessageSquare,
    position: 'left',
    color: '#6366f1',
  },
];

interface OnboardingTourProps {
  userId?: string;
}

export function OnboardingTour({ userId }: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if tour was completed
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      // Delay to let the page render first
      const timer = setTimeout(() => setIsActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  const updatePosition = useCallback(() => {
    if (!isActive) return;

    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      // If element not found, try next step
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep((s) => s + 1);
      }
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 12;

    setHighlightRect({
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Scroll element into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Position tooltip
    setTimeout(() => {
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'bottom':
          top = rect.bottom + window.scrollY + 20;
          left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));
          break;
        case 'top':
          top = rect.top + window.scrollY - tooltipHeight - 20;
          left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));
          break;
        case 'left':
          top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
          left = Math.max(16, rect.left - tooltipWidth - 20);
          if (left < 16) {
            // Fallback to bottom
            top = rect.bottom + window.scrollY + 20;
            left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));
          }
          break;
        case 'right':
          top = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + 20;
          if (left + tooltipWidth > window.innerWidth) {
            top = rect.bottom + window.scrollY + 20;
            left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));
          }
          break;
      }

      setTooltipPos({ top, left });
    }, 400);
  }, [currentStep, isActive]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [updatePosition]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-auto"
            onClick={handleSkip}
            style={{
              background: `radial-gradient(circle at ${highlightRect.left + highlightRect.width / 2}px ${highlightRect.top - window.scrollY + highlightRect.height / 2}px, transparent ${Math.max(highlightRect.width, highlightRect.height) / 2 + 30}px, rgba(0,0,0,0.75) ${Math.max(highlightRect.width, highlightRect.height) / 2 + 80}px)`,
            }}
          />

          {/* Highlight border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute rounded-2xl pointer-events-none"
            style={{
              top: highlightRect.top - window.scrollY,
              left: highlightRect.left,
              width: highlightRect.width,
              height: highlightRect.height,
              boxShadow: `0 0 0 3px ${step.color}40, 0 0 30px ${step.color}20`,
              border: `2px solid ${step.color}60`,
            }}
          />

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            key={currentStep}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute w-[320px] pointer-events-auto z-10"
            style={{
              top: tooltipPos.top - window.scrollY,
              left: tooltipPos.left,
            }}
          >
            <div className="bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 shadow-2xl shadow-black/40 relative overflow-hidden">
              {/* Color accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-[1.5rem]"
                style={{ background: `linear-gradient(90deg, ${step.color}, transparent)` }}
              />

              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Content */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${step.color}15`,
                    borderColor: `${step.color}30`,
                  }}
                >
                  <StepIcon className="w-5 h-5" style={{ color: step.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-white uppercase tracking-tight italic leading-tight">
                    {step.title}
                  </h3>
                </div>
              </div>

              <p className="text-[12px] text-white/60 font-medium leading-relaxed mb-5">
                {step.description}
              </p>

              {/* Progress and navigation */}
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: step.color }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                    {currentStep + 1}/{TOUR_STEPS.length}
                  </span>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSkip}
                    className="text-[9px] font-black text-white/30 uppercase tracking-widest hover:text-white/60 transition-colors"
                  >
                    Saltar tour
                  </button>

                  <div className="flex items-center gap-2">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrev}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg"
                      style={{
                        backgroundColor: step.color,
                        boxShadow: `0 8px 20px ${step.color}30`,
                      }}
                    >
                      {currentStep === TOUR_STEPS.length - 1 ? (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          ¡A jugar!
                        </>
                      ) : (
                        <>
                          Siguiente
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
