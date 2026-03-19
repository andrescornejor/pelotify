'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';



const NAV_ITEMS = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/search', icon: Search, label: 'Buscar' },
    { href: '/create', icon: PlusCircle, label: 'Crear', isPrimary: true },
    { href: '/friends', icon: Users, label: 'Social' },
    { href: '/profile/me', icon: User, label: 'Perfil' },
];

export function BottomNav() {
    const pathname = usePathname();

    if (['/login', '/register'].includes(pathname)) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none lg:hidden">
            {/* Safe area blur backdrop */}
            <div className="absolute inset-x-0 bottom-0 h-[calc(100%+env(safe-area-inset-bottom,0px))] bg-gradient-to-t from-background/95 via-background/80 to-transparent pointer-events-none" />

            <nav
                className="relative mx-4 mb-4 pointer-events-auto rounded-[1.75rem] overflow-hidden"
                style={{
                    background: 'rgba(var(--foreground-rgb), 0.04)',
                    backdropFilter: 'blur(32px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                    border: '1px solid rgba(var(--foreground-rgb), 0.08)',
                    boxShadow: '0 -1px 0 rgba(var(--foreground-rgb), 0.05), 0 20px 60px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)',
                }}
            >
                {/* Top highlight line */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />

                <div className="flex items-stretch h-[62px]">
                    {NAV_ITEMS.map(({ href, icon: Icon, label, isPrimary }) => {
                        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

                        if (isPrimary) {
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className="relative flex flex-col items-center justify-center flex-1 h-full"
                                >
                                    <motion.div
                                        whileTap={{ scale: 0.88 }}
                                        whileHover={{ scale: 1.08 }}
                                        className={cn(
                                            "relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300",
                                            isActive
                                                ? "shadow-[0_0_20px_rgba(44,252,125,0.5),0_8px_24px_rgba(44,252,125,0.3)]"
                                                : "shadow-[0_4px_16px_rgba(44,252,125,0.25)]"
                                        )}
                                        style={{
                                            background: isActive
                                                ? 'linear-gradient(135deg, #5dfd9d, #2cfc7d, #1db95a)'
                                                : 'linear-gradient(135deg, #2cfc7d, #1db95a)',
                                        }}
                                    >
                                        <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                                        {/* Shimmer */}
                                        <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-50">
                                            <div className="absolute inset-[-100%] bg-gradient-to-tr from-transparent via-white/30 to-transparent -rotate-45 translate-x-[-100%] hover:translate-x-[200%] transition-transform duration-700 ease-out" />
                                        </div>
                                    </motion.div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.15em] mt-0.5 text-primary/80">
                                        {label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={href}
                                href={href}
                                className="relative flex flex-col items-center justify-center flex-1 h-full group"
                            >
                                {/* Active glow bg */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            layoutId="bottom-nav-active-pill"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                            className="absolute inset-x-2 top-1 bottom-1 rounded-2xl"
                                            style={{
                                                background: 'radial-gradient(ellipse at 50% 60%, rgba(44,252,125,0.14) 0%, rgba(44,252,125,0.04) 70%, transparent 100%)',
                                                border: '1px solid rgba(44,252,125,0.12)',
                                            }}
                                        />
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    animate={{
                                        y: isActive ? -1 : 0,
                                        scale: isActive ? 1.1 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className={cn(
                                        "relative z-10 transition-colors duration-300",
                                        isActive ? "text-primary" : "text-foreground/35 group-hover:text-foreground/55"
                                    )}
                                >
                                    <Icon
                                        className="w-[1.1rem] h-[1.1rem]"
                                        strokeWidth={isActive ? 2.5 : 1.8}
                                    />
                                    {/* Active dot */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-primary shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-[0.12em] mt-1.5 z-10 transition-all duration-300",
                                    isActive
                                        ? "text-primary opacity-100"
                                        : "text-foreground/65 opacity-90 group-hover:opacity-100"
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
