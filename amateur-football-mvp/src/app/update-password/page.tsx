'use client';

import { motion } from 'framer-motion';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updatePassword(password);
      router.push('/login');
    } catch (error) {
      // Error managed in alert
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 lg:p-8 relative overflow-hidden bg-background">
      {/* â”€â”€ CINEMATIC BACKGROUND â”€â”€ */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] opacity-50" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] relative z-10"
      >
        <div className="glass-premium rounded-[2rem] p-8 lg:p-12 border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden relative">
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-black italic text-foreground uppercase tracking-tighter">
                Nueva <span className="text-primary">Clave</span>
              </h1>
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] italic">
                Seguridad de Jugador
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] ml-1">
                IngresÃ¡ tu nueva contraseÃ±a
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  className="w-full h-14 pl-14 pr-6 bg-background/40 border border-foreground/5 rounded-2xl text-foreground text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:foreground/10"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-primary text-zinc-950 font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 disabled:opacity-70 shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  ACTUALIZAR FICHA <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
