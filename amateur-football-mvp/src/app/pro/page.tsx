'use client';

import { useAuth } from '@/contexts/AuthContext';
import { BadgeCheck, Star, Zap, TrendingUp, Calendar, ArrowLeft, Loader2, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PelotifyProPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'mensual' | 'anual'>('mensual');

  const priceMensual = 1500;
  const priceAnual = 15000;

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    // TODO: Initialize MercadoPago/Stripe checkout session here.
    // For MVP demonstration, we will just give them PRO right away.
    try {
      const { error } = await supabase.from('profiles').update({
        is_pro: true,
        pro_since: new Date().toISOString(),
      }).eq('id', user.id);

      if (error) throw error;
      
      // Update auth store (hack to force profile reload without hard refresh)
      await supabase.auth.refreshSession();
      
      alert('¡Bienvenido a Pelotify Pro! MVP hack: Activado sin pagar por ahora.');
      router.push('/profile?id=me');
    } catch (err: any) {
      alert('Error activando Pro: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-yellow-500/30 overflow-hidden pb-32">
      {/* Background abstract elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-black mb-12">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/5 border border-yellow-500/30 shadow-[0_0_50px_rgba(250,204,21,0.2)] mb-6">
             <Star className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]" fill="currentColor" />
          </div>
          <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-sm">
            Pelotify Pro
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-xl mx-auto font-medium">
            Destaca en la comunidad, mejora tus análisis de juego y accede a beneficios exclusivos dentro de la cancha.
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex items-center shadow-inner">
            <button 
              onClick={() => setSelectedPlan('mensual')}
              className={`px-8 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${selectedPlan === 'mensual' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/20' : 'text-white/50 hover:text-white'}`}
            >
              Mensual
            </button>
            <button 
              onClick={() => setSelectedPlan('anual')}
              className={`px-8 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 ${selectedPlan === 'anual' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/20' : 'text-white/50 hover:text-white'}`}
            >
              Anual
              <span className="bg-black/20 text-[9px] px-2 py-0.5 rounded-full">Ahorra 16%</span>
            </button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {[
            {
              icon: BadgeCheck,
              title: "Tick de Verificado",
              desc: "Destaca tu perfil con el badge exclusivo de usuario PRO en búsquedas, ránkings y listas de equipos.",
              color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
            },
            {
              icon: TrendingUp,
              title: "Estadísticas Avanzadas",
              desc: "Accede a radares de rendimiento, historial detallado de partidos y comparativas con otros jugadores en tu liga.",
              color: "text-green-400 bg-green-500/10 border-green-500/20"
            },
            {
              icon: Zap,
              title: "Radar de Jugadores Pro",
              desc: "Aparece primero en las sugerencias cuando los capitanes buscan reemplazos urgentes y fichajes.",
              color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
            },
            {
              icon: Calendar,
              title: "Prioridad en Partidos",
              desc: "Sé el primero en ver y anotarte en partidos públicos organizados por Pelotify antes que se llenen.",
              color: "text-purple-400 bg-purple-500/10 border-purple-500/20"
            },
          ].map((feature, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all group flex flex-col items-start gap-4 hover:bg-white/[0.07]">
              <div className={`p-4 rounded-2xl border ${feature.color} transition-transform group-hover:scale-110`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tight mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Card */}
        <div className="max-w-xl mx-auto rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent p-[1px] shadow-[0_0_80px_rgba(250,204,21,0.15)] relative">
          <div className="absolute -top-4 right-8 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-500/30 rotate-3 border border-yellow-200">
            Recomendado
          </div>
          <div className="bg-black/80 backdrop-blur-3xl p-10 rounded-[3rem] text-center flex flex-col items-center">
            <h2 className="text-sm font-black text-yellow-400 uppercase tracking-[0.3em] mb-4">Membresía {selectedPlan}</h2>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black tracking-tighter italic">
                ${selectedPlan === 'mensual' ? priceMensual : priceAnual}
              </span>
              <span className="text-white/40 font-medium uppercase tracking-widest text-sm">ARS / {selectedPlan === 'mensual' ? 'mes' : 'año'}</span>
            </div>
            
            <button 
              onClick={handleSubscribe} 
              disabled={isLoading}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black uppercase tracking-widest text-lg shadow-xl shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
              Convertirme en Pro
            </button>
            <p className="text-xs text-white/40 font-medium mt-6">
              Prueba MVP: Al hacer clic se activará temporalmente la insignia gratis. En producción se integrará con MercadoPago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
