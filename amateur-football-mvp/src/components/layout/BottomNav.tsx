'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Plus, 
  MessageSquare,
  Search,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * STADIUM EXPERIENCE — BOTTOM CONTROL DOCK
 * Compact, refined floating dock with diamond-shaped create button
 */

export function BottomNav() {
  const pathname = usePathname();
  const { performanceMode } = useSettings();

  const navItems = useMemo(() => [
    { 
      label: 'Home', 
      href: '/', 
      icon: Home,
    },
    { 
      label: 'Buscar', 
      href: '/search', 
      icon: Search,
    },
    { 
      label: 'Crear', 
      href: '/create', 
      icon: Plus, 
      isPrimary: true,
    },
    { 
      label: 'Muro', 
      href: '/feed', 
      icon: Globe,
    },
    { 
      label: 'Chats', 
      href: '/messages', 
      icon: MessageSquare,
    }
  ], []);

  if (['/login', '/register', '/update-password', '/onboarding'].includes(pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden pb-4 px-4 pointer-events-none">
      <div className="max-w-[420px] mx-auto pointer-events-auto relative">
        
        <nav
          className={cn(
            'relative p-1 rounded-2xl border transition-all duration-500 flex items-center noise-texture',
            performanceMode 
              ? 'bg-surface border-border shadow-lg' 
              : 'bg-background/50 backdrop-blur-[30px] border-foreground/[0.06] shadow-[0_8px_40px_-10px_rgba(0,0,0,0.35)]'
          )}
          style={{
            boxShadow: performanceMode ? undefined : '0 -1px 0 0 rgba(var(--foreground-rgb), 0.03) inset, 0 8px 40px -10px rgba(0,0,0,0.35)',
          }}
        >
          {/* Top shine line */}
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent pointer-events-none z-30" />
          
          <div className="relative z-20 flex w-full h-[58px] items-center justify-around">
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
                    className="relative flex items-center justify-center -mt-7"
                  >
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.9, rotate: 90 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="w-[52px] h-[52px] rounded-[1.125rem] rotate-0 flex items-center justify-center relative z-20 group overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        boxShadow: '0 4px 0 0 var(--primary-dark), 0 8px 24px -4px rgba(var(--primary-rgb), 0.35), inset 0 1px 0 0 rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      {/* Inner shine */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[1.125rem]" />
                      <Icon className="w-7 h-7 text-black stroke-[2.5] relative z-10" />
                    </motion.div>
                    
                    {/* Shadow beneath */}
                    <div className="absolute -bottom-1 w-8 h-2 bg-primary/20 blur-md rounded-full" />
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center h-full px-3 group"
                >
                  <motion.div
                    className="relative flex flex-col items-center gap-1"
                    whileTap={{ scale: 0.85 }}
                  >
                    <div className="relative">
                       <Icon 
                        className={cn(
                          "w-[22px] h-[22px] transition-all duration-300 relative z-10",
                          isActive 
                            ? "text-primary scale-105" 
                            : "text-foreground/25 group-hover:text-foreground/50"
                        )}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                    </div>

                    <span
                      className={cn(
                        "text-[7px] font-bold tracking-[0.08em] transition-all duration-300 uppercase",
                        isActive ? "text-primary opacity-100" : "text-foreground/20 opacity-0 group-hover:opacity-80"
                      )}
                    >
                      {item.label}
                    </span>
                  </motion.div>

                  {/* Active Indicator — top line */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator-line"
                      className="absolute top-0 w-6 h-[2px] rounded-full bg-primary"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                      style={{ boxShadow: '0 0 8px rgba(44,252,125,0.5)' }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
