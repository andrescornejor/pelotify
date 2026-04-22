'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Plus,
  UserPlus,
  MessageSquare,
  Search,
  Flame,
  LayoutGrid,
  Globe,
  Target,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useHaptic } from '@/hooks/useHaptic';

/**
 * PREMIUM REDESIGNED BOTTOM NAV
 * Aesthetics: Floating Cinematic Island with adaptive glow and haptic-feel animations.
 */

export function BottomNav() {
  const pathname = usePathname();
  const { performanceMode } = useSettings();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const { hapticLight, hapticMedium } = useHaptic();

  const navItems = useMemo(() => [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      color: 'from-[#2cfc7d] to-[#10b981]'
    },
    {
      label: 'Buscar',
      href: '/search',
      icon: Search,
      color: 'from-blue-400 to-blue-600'
    },
    {
      href: '#',
      icon: Plus,
      isPrimary: true,
      color: 'from-primary via-[#3dfc8d] to-primary-dark'
    },

    {
      label: 'Muro',
      href: '/feed',
      icon: Globe,
      color: 'from-blue-400 to-indigo-500'
    },
    {
      label: 'Chats',
      href: '/messages',
      icon: MessageSquare,
      color: 'from-purple-400 to-pink-500'
    }
  ], []);

  if (['/login', '/register', '/update-password', '/onboarding'].includes(pathname)) {
    return null;
  }

  return (
    <>
      {/* Create Menu Backdrop */}
      <AnimatePresence>
        {isCreateMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              hapticLight();
              setIsCreateMenuOpen(false);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl lg:hidden cursor-pointer"
            style={{ zIndex: -1 }} 
          />
        )}
      </AnimatePresence>

      {/* Main Bottom Nav Area - Pegged to Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden pointer-events-none">

        {/* Expanded Menu Actions */}
        <div className="relative pointer-events-auto w-full">
          <AnimatePresence>
            {isCreateMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute bottom-[calc(70px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 w-[280px] flex flex-col gap-3 py-4"
              >
                {[
                  { label: "Armar Partido", icon: Target, href: "/create", color: "text-[#2cfc7d]" },
                  { label: "Post en 3erTiempo", icon: MessageSquare, href: "/feed", color: "text-blue-400" },
                  { label: "Subir FutTok", icon: Flame, href: "/highlights/upload", color: "text-orange-500" }
                ].map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    onClick={() => {
                      hapticLight();
                      setIsCreateMenuOpen(false);
                    }}
                    className="block w-full"
                  >
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="glass-premium border border-white/20 rounded-[1.8rem] p-4 flex items-center gap-4 bg-black/40 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                        <action.icon className={cn("w-6 h-6", action.color)} />
                      </div>
                      <span className="text-[15px] font-black italic uppercase font-kanit text-white tracking-tighter">
                        {action.label}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>


          {/* Dynamic Background Glow based on active item */}
          {!performanceMode && (
            <AnimatePresence mode="wait">
              {navItems.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : (pathname + '/').startsWith(item.href + '/');
                if (!isActive && !isCreateMenuOpen) return null;
                // If menu is open, show primary color glow
                if (isCreateMenuOpen && !item.isPrimary) return null;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.5, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={cn(
                      "absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 blur-[60px] rounded-full pointer-events-none z-0",
                      (item.href === '/' && !isCreateMenuOpen) ? "bg-[#2cfc7d]" :
                        (item.href === '/search' && !isCreateMenuOpen) ? "bg-blue-500" :
                          (item.isPrimary || isCreateMenuOpen) ? "bg-primary" :
                            item.href === '/feed' ? "bg-indigo-500" : "bg-purple-500"
                    )}
                  />
                );
              })}
            </AnimatePresence>
          )}

          <nav
            className={cn(
              'relative transition-all duration-700 flex items-center w-full border-t',
              performanceMode
                ? 'bg-surface border-border'
                : 'bg-background/95 backdrop-blur-[20px] border-white/5 dark:border-white/5'
            )}
          >
            <div className="relative z-10 flex w-full h-[calc(58px+env(safe-area-inset-bottom,0px))] items-center justify-around pt-0 pb-[env(safe-area-inset-bottom,0px)]">
              {navItems.map((item) => {
                const isActive = item.href === '/'
                  ? pathname === '/'
                  : (item.href !== '#' && (pathname + '/').startsWith(item.href + '/'));

                const Icon = item.icon;

                if (item.isPrimary) {
                  return (
                    <div
                      key="primary-btn"
                      className="relative flex flex-col items-center justify-center h-full cursor-pointer pointer-events-auto"
                      onClick={() => {
                        hapticMedium();
                        setIsCreateMenuOpen(!isCreateMenuOpen);
                      }}
                    >
                      <motion.div
                        animate={{ rotate: isCreateMenuOpen ? 45 : 0 }}
                        whileHover={!isCreateMenuOpen ? { scale: 1.1, rotate: 90 } : undefined}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className={cn(
                          "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-[0_15px_30px_rgba(44,252,125,0.3)] relative z-20 group overflow-hidden border-2 border-white/20 -mt-8",
                          "bg-gradient-to-br", item.color
                        )}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />

                        <div className="relative z-10">
                          <Icon className="w-9 h-9 text-black stroke-[3]" />
                        </div>

                        {/* Inner Shine */}
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                      </motion.div>

                      <span
                        className={cn(
                          "text-[8px] font-black tracking-[0.1em] transition-all duration-300 uppercase italic mt-1",
                          isCreateMenuOpen ? "text-primary" : "text-foreground/40"
                        )}
                      >
                        {item.label}
                      </span>

                      {/* Pulsing Aura */}
                      {!performanceMode && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute inset-[0_-12px] bg-primary/20 blur-2xl rounded-full -z-10"
                        />
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      if (!isActive) hapticLight();
                      setIsCreateMenuOpen(false);
                    }}
                    className="relative flex flex-col items-center justify-center h-full px-4 group pointer-events-auto"
                  >
                    <motion.div
                      className="relative flex flex-col items-center gap-1"
                      whileTap={{ scale: 0.85 }}
                    >
                      <div className="relative block h-[26px]">
                        {isActive && (
                          <motion.div
                            layoutId="nav-bg"
                            className="absolute -inset-3 bg-foreground/[0.03] dark:bg-white/[0.04] rounded-2xl blur-sm"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                          />
                        )}

                        <Icon
                          className={cn(
                            "w-6 h-6 transition-all duration-300 relative z-10",
                            isActive
                              ? "text-primary drop-shadow-[0_0_12px_rgba(44,252,125,0.5)] scale-110"
                              : "text-foreground/40 group-hover:text-foreground/60"
                          )}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </div>

                      <span
                        className={cn(
                          "text-[8px] font-black tracking-[0.1em] transition-all duration-300 uppercase italic",
                          isActive ? "text-primary" : "text-foreground/40"
                        )}
                      >
                        {item.label}
                      </span>
                    </motion.div>

                    {/* Active Indicator Slide */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        style={{ boxShadow: '0 0 10px rgba(44,252,125,1)' }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Edge Reflection */}
            {!performanceMode && (
              <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
