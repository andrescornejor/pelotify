'use client';

import { motion } from 'framer-motion';
import { MailCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function EmailConfirmedPage() {
  return (
    <div className="flex min-h-[100dvh] bg-background selection:bg-primary selection:text-background overflow-hidden relative">
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md flex flex-col items-center justify-center text-center space-y-8 glass-premium p-10 rounded-[2rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* Background Highlight */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-[50px] -ml-16 -mb-16 rounded-full pointer-events-none" />

          {/* Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="w-24 h-24 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center relative z-10">
              <MailCheck className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.5)]" />
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <h1 className="text-4xl lg:text-5xl font-black italic text-foreground tracking-tighter uppercase leading-[0.85] font-kanit">
              EMAIL <br /> <span className="text-primary">CONFIRMADO</span>
            </h1>
            <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
              Ya estÃ¡s listo para salir a la cancha.
            </p>
          </div>

          <div className="w-full relative z-10 pt-4">
            <Link href="/" className="w-full inline-block">
              <button className="w-full h-14 bg-primary text-zinc-950 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] transition-all active:scale-95 shadow-2xl shadow-primary/20 group/btn relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                ENTRAR A LA CANCHA
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* â”€â”€ BACKGROUND â”€â”€ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
      </div>
    </div>
  );
}
