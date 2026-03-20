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
import { useSettings } from '@/contexts/SettingsContext';

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const { performanceMode } = useSettings();
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

        const channel = supabase
            .channel('unread-messages')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'direct_messages' },
                () => updateUnreadCount()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, pathname]);

    if (['/login', '/register', '/update-password'].includes(pathname)) {
        return null;
    }

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[420px] lg:hidden">
            <nav
                className={cn(
                    "relative overflow-hidden rounded-[2.5rem] border transition-all duration-500",
                    performanceMode 
                        ? "bg-surface border-border shadow-lg" 
                        : "glass-premium bg-background/60 backdrop-blur-2xl saturate-[1.8] border-foreground/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                )}
            >
                <div className="flex justify-around items-center h-[72px] px-2">
                    {NAV_ITEMS.map(({ href, icon: Icon, label, isPrimary }) => {
                        // Enhanced detection for Perfil to ensure it stays active
                        const isActive = href === '/' 
                            ? pathname === '/' 
                            : pathname.startsWith(href.split('/me')[0]); // Detects /profile for /profile/me
                        
                        const hasUnread = label === 'Mensajes' && unreadCount > 0;

                        if (isPrimary) {
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className="relative flex flex-col items-center justify-center py-2 px-1"
                                >
                                    <motion.div
                                        whileTap={performanceMode ? {} : { scale: 0.9, y: -4 }}
                                        whileHover={performanceMode ? {} : { scale: 1.05 }}
                                        className={cn(
                                            "w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-300",
                                            isActive 
                                                ? "bg-primary text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]" 
                                                : "bg-primary text-black shadow-md"
                                        )}
                                    >
                                        <Icon className="w-6 h-6" strokeWidth={2.5} />
                                    </motion.div>
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] mt-1.5 text-primary">
                                        {label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={href}
                                href={href}
                                className="relative flex flex-col items-center justify-center flex-1 h-full py-2 group"
                            >
                                <div className="relative">
                                    <Icon
                                        className={cn(
                                            "w-5 h-5 transition-all duration-300",
                                            isActive 
                                                ? "text-primary scale-110 drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]" 
                                                : "text-foreground/30 group-hover:text-foreground/50"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    
                                    {/* Unread indicator */}
                                    {hasUnread && !isActive && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                                    )}

                                    {/* Active indicator dot */}
                                    {isActive && !performanceMode && (
                                        <motion.div 
                                            layoutId="nav-dot"
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"
                                        />
                                    )}
                                </div>
                                
                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-[0.15em] mt-2 transition-colors duration-300",
                                    isActive ? "text-primary" : "text-foreground/35"
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
