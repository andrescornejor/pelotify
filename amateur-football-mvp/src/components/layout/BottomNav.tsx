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
  Users
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
      label: 'Social', 
      href: '/friends', 
      icon: Users,
      color: 'from-amber-400 to-orange-500'
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
    <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden pb-6 px-6 pointer-events-none">
      <div className="max-w-[440px] mx-auto pointer-events-auto relative">
        {/* Dynamic Background Glow based on active item */}
        {!performanceMode && (
           <AnimatePresence mode="wait">
             {navItems.map((item) => {
               const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
               if (!isActive) return null;
               return (
                 <motion.div
                   key={item.href}
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 0.5, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className={cn(
                     "absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 blur-[60px] rounded-full pointer-events-none z-0",
                     item.href === '/' ? "bg-[#2cfc7d]" : 
                     item.href === '/search' ? "bg-blue-500" :
                     item.href === '/create' ? "bg-primary" :
                     item.href === '/friends' ? "bg-amber-500" : "bg-purple-500"
                   )}
                 />
               );
             })}
           </AnimatePresence>
        )}

        <nav
          className={cn(
            'relative p-1.5 rounded-[2.5rem] border transition-all duration-700 flex items-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]',
            performanceMode 
              ? 'bg-surface border-border' 
              : 'bg-background/40 backdrop-blur-[35px] border-white/10 dark:border-white/5'
          )}
        >
          <div className="relative z-10 flex w-full h-[70px] items-center justify-around">
            {navItems.map((item) => {
              const isActive = item.href === '/' 
                ? pathname === '/' 
                : pathname.startsWith(item.href);
              
              const Icon = item.icon;

              if (item.isPrimary) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex items-center justify-center -mt-8"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className={cn(
                        "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-[0_15px_30px_rgba(44,252,125,0.3)] relative z-20 group overflow-hidden border-2 border-white/20",
                        "bg-gradient-to-br", item.color
                      )}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <Icon className="w-9 h-9 text-black stroke-[3] relative z-10" />
                      
                      {/* Inner Shine */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                    </motion.div>
                    
                    {/* Pulsing Aura */}
                    {!performanceMode && (
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10"
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
                            : "text-foreground/30 group-hover:text-foreground/60"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>

                    <span
                      className={cn(
                        "text-[8px] font-black tracking-[0.1em] transition-all duration-300 uppercase italic",
                        isActive ? "text-primary opacity-100" : "text-foreground/20 opacity-0 group-hover:opacity-100 scale-90"
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
  );
}
