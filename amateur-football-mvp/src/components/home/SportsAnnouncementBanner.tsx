'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';

const STORAGE_KEY = 'pelotify-sports-banner-dismissed-v1';

export function SportsAnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY);
      setIsVisible(dismissed !== 'true');
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
  };

  if (!isVisible) return null;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/12 via-background to-orange-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
      <div className="absolute -top-10 right-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-orange-500/15 blur-3xl" />

      <div className="relative p-5 sm:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
              <span className="text-[9px] font-black uppercase tracking-[0.28em] text-primary">
                Nuevo en Pelotify
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                Ya podés armar partidos de pádel y basket
              </h2>
              <p className="max-w-2xl text-sm sm:text-[15px] text-foreground/65 font-bold leading-relaxed">
                Seguimos siendo fútbol primero, pero ahora también podés crear y sumarte a partidos de pádel y basket desde la app.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/create"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-[0_10px_24px_rgba(44,252,125,0.25)] transition-all hover:scale-[1.02]"
              >
                Crear partido
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/search"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-foreground/10 bg-foreground/[0.04] px-5 text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80 transition-all hover:border-primary/30 hover:text-primary"
              >
                <Search className="h-4 w-4" />
                Buscar partidos
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/[0.04] text-foreground/40 transition-all hover:text-foreground"
            aria-label="Cerrar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
