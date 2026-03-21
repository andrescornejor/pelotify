'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileMeRedirect() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                router.replace(`/profile?id=${user.id}`);
            } else {
                router.replace('/login');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-background relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative flex flex-col items-center gap-8">
                {/* Logo with pulse */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <img 
                        src="/logo_pelotify.png" 
                        alt="Pelotify" 
                        className="w-24 h-24 relative z-10 drop-shadow-[0_0_20px_rgba(44,252,125,0.3)]"
                    />
                </motion.div>

                {/* Loading text and spinner */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-foreground/5 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-black italic text-foreground uppercase tracking-tighter"
                        >
                            Sincronizando Perfil
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mt-1 italic animate-pulse"
                        >
                            Preparando el terreno...
                        </motion.p>
                    </div>
                </div>
            </div>
        </div>
    );
}
