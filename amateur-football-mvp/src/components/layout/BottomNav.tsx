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
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * PREMIUM REDESIGNED BOTTOM NAV
 * Aesthetics: Floating Cinematic Island with adaptive glow and haptic-feel animations.
 */

export function BottomNav() {
  const pathname = usePathname();
  const { performanceMode } = useSettings();

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
      label: 'Crear', 
      href: '/create', 
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
    <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden pb-8 px-6 pointer-events-none">
      <div className="max-w-[440px] mx-auto pointer-events-auto relative">
        {/* Dynamic Background Glow based on active item */}
        {!performanceMode && (
           <AnimatePresence mode="wait">
             {navItems.map((item) => {
               const isActive = item.href === '/' ? pathname === '/' : (pathname + '/').startsWith(item.href + '/');
               if (!isActive) return null;
               return (
                 <motion.div
                   key={item.href}
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 0.4, scale: 1.2 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className={cn(
                     "absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 blur-[60px] rounded-full pointer-events-none z-0",
                     item.href === '/' ? "bg-primary" : 
                     item.href === '/search' ? "bg-blue-400" :
                     item.href === '/create' ? "bg-primary" :
                     item.href === '/feed' ? "bg-indigo-400" : "bg-purple-400"
                   )}
                 />
               );
             })}
           </AnimatePresence>
        )}

        <nav
          className={cn(
            'relative p-1.5 rounded-[2.5rem] border transition-all duration-700 flex items-center shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)]',
            performanceMode 
              ? 'bg-surface border-border' 
              : 'glass border-white/10'
          )}
          style={{
            background: 'rgba(var(--background-rgb), 0.6)',
          }}
        >
          <div className="relative z-10 flex w-full h-[70px] items-center justify-around">
            {navItems.map((item) => {
              const isActive = item.href === '/' 
                ? pathname === '/' 
                : (pathname + '/').startsWith(item.href + '/');
              
              const Icon = item.icon;

              if (item.isPrimary) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex items-center justify-center -mt-10"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className={cn(
                        "w-16 h-16 rounded-[1.75rem] flex items-center justify-center relative z-20 group overflow-hidden border border-white/20 shadow-2xl transition-all duration-300",
                        "bg-gradient-to-br", item.color
                      )}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Icon className="w-8 h-8 text-black stroke-[2.5] relative z-10" />
                      
                      {/* Inner Shine */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                    </motion.div>
                    
                    {/* Pulsing Aura */}
                    {!performanceMode && (
                      <motion.div 
                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.1, 0.4] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/30 blur-2xl rounded-full -z-10"
                      />
                    )}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center h-full px-4 group"
                >
                  <motion.div
                    className="relative flex flex-col items-center gap-1"
                    whileTap={{ scale: 0.85 }}
                  >
                    <div className="relative">
                       <Icon 
                        className={cn(
                          "w-6 h-6 transition-all duration-300 relative z-10",
                          isActive 
                            ? "text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.6)] scale-110" 
                            : "text-foreground/30 group-hover:text-foreground/60"
                        )}
                        strokeWidth={isActive ? 3 : 2}
                      />
                    </div>

                    <span
                      className={cn(
                        "text-[9px] font-black tracking-wider transition-all duration-300 uppercase italic font-display",
                        isActive ? "text-primary opacity-100" : "text-foreground/20 opacity-0 scale-90"
                      )}
                    >
                      {item.label}
                    </span>
                  </motion.div>

                  {/* Active Indicator Slide */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      style={{ boxShadow: '0 0 12px rgba(var(--primary-rgb),1)' }}
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
  );
}
