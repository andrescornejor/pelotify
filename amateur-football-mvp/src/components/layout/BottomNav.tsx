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
    <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden pb-6 px-6 pointer-events-none">
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
                   animate={{ opacity: 0.5, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className={cn(
                     "absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 blur-[60px] rounded-full pointer-events-none z-0",
                     item.href === '/' ? "bg-[#2cfc7d]" : 
                     item.href === '/search' ? "bg-blue-500" :
                     item.href === '/create' ? "bg-primary" :
                     item.href === '/feed' ? "bg-indigo-500" : "bg-purple-500"
                   )}
                 />
               );
             })}
           </AnimatePresence>
        )}

        <nav
          className={cn(
            'relative p-1 rounded-3xl border transition-all duration-700 flex items-center shadow-2xl',
            performanceMode 
              ? 'bg-surface border-border' 
              : 'bg-background/60 backdrop-blur-2xl border-white/5 dark:border-white/5'
          )}
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
                    className="relative flex items-center justify-center -mt-8"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 relative z-20 group overflow-hidden border border-white/20",
                        "bg-gradient-to-br from-primary to-primary-dark"
                      )}
                    >
                      <Icon className="w-8 h-8 text-black relative z-10" />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/10" />
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
                        "text-[9px] font-bold tracking-[0.2em] transition-all duration-300 uppercase font-space",
                        isActive ? "text-primary opacity-100" : "text-foreground/20 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
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
