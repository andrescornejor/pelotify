'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, User, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';



const NAV_ITEMS = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/search', icon: Search, label: 'Buscar' },
    { href: '/create', icon: PlusCircle, label: 'Crear', isPrimary: true },
    { href: '/messages', icon: MessageSquare, label: 'Mensajes' },
    { href: '/profile/me', icon: User, label: 'Perfil' },
];

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadMessagesCount } from '@/lib/chat';
import { supabase } from '@/lib/supabase';

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const updateUnreadCount = async () => {
        if (!user) return;
        try {
            const count = await getUnreadMessagesCount(user.id);
            setUnreadCount(count);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!user) return;
        
        updateUnreadCount();

        // Subscribe to NEW messages where I am the recipient
        const channel = supabase
            .channel('unread-messages')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'direct_messages'
                    // We check all events (INSERT/UPDATE/DELETE) to keep count in sync
                },
                () => {
                    updateUnreadCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, pathname]);

    if (['/login', '/register'].includes(pathname)) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-6 pointer-events-none lg:hidden">
            {/* Ambient Background Glow behind the bar */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none -z-10" />

            <nav
                className="relative mx-auto max-w-md pointer-events-auto rounded-[2.5rem] overflow-hidden"
                style={{
                    background: 'rgba(var(--foreground-rgb), 0.08)',
                    backdropFilter: 'blur(24px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: `
                        0 20px 50px rgba(0, 0, 0, 0.4), 
                        0 0 0 1px rgba(var(--foreground-rgb), 0.05),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `,
                }}
            >
                {/* Secondary inner border for extra depth */}
                <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 pointer-events-none" />

                <div className="flex items-center justify-around h-[72px] px-2 relative z-10">
                    {/* Active Background Indicator - Liquid Sliding effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <AnimatePresence>
                            {NAV_ITEMS.map((item, idx) => {
                                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                                return isActive && !item.isPrimary && (
                                    <motion.div
                                        key="active-indicator"
                                        layoutId="nav-bg-pill"
                                        className="absolute h-10 rounded-2xl bg-primary/10 border border-primary/20"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        style={{
                                            width: `${100 / (NAV_ITEMS.length)}%`,
                                            left: `${idx * (100 / NAV_ITEMS.length)}%`,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            margin: '0 auto',
                                            padding: '0 8px'
                                        }}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {NAV_ITEMS.map(({ href, icon: Icon, label, isPrimary }) => {
                        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                        const hasUnread = label === 'Mensajes' && unreadCount > 0;

                        if (isPrimary) {
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className="relative flex flex-col items-center justify-center -translate-y-4"
                                >
                                    <motion.div
                                        whileHover={{ y: -4, scale: 1.05 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={cn(
                                            "relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 overflow-hidden",
                                            isActive 
                                                ? "bg-primary text-black" 
                                                : "bg-surface border border-white/10 text-primary"
                                        )}
                                        style={{
                                            boxShadow: isActive 
                                                ? '0 12px 30px rgba(44, 252, 125, 0.4), inset 0 2px 4px rgba(255,255,255,0.4)'
                                                : '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        {!isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
                                        )}
                                        <Icon className={cn("w-6 h-6 z-10", isActive ? "fill-black" : "fill-none")} strokeWidth={2.5} />
                                        
                                        {/* Animated Shimmer on button */}
                                        <motion.div 
                                            animate={{ x: ['-200%', '200%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                                        />
                                    </motion.div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.2em] mt-2 transition-colors",
                                        isActive ? "text-primary" : "text-foreground/40"
                                    )}>
                                        {label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={href}
                                href={href}
                                className="relative flex flex-col items-center justify-center flex-1 h-full py-2 z-20"
                            >
                                <motion.div
                                    animate={{
                                        y: isActive ? -2 : 0,
                                        scale: isActive ? 1.15 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                    className={cn(
                                        "relative flex items-center justify-center transition-colors duration-300 mb-1.5",
                                        isActive ? "text-primary" : "text-foreground/40"
                                    )}
                                >
                                    <Icon
                                        className="w-5 h-5"
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    
                                    {/* Unread Indicator */}
                                    {hasUnread && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background shadow-[0_0_10px_rgba(44,252,125,0.6)]" />
                                    )}
                                    
                                    {/* Minimalist Under-Indicator Dot */}
                                    {isActive && (
                                        <motion.div 
                                            layoutId="dot-indicator"
                                            className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary"
                                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                        />
                                    )}
                                </motion.div>

                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                                    isActive ? "text-primary opacity-100" : "text-foreground/40"
                                )}>
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
