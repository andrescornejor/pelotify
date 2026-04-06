'use client';

import { useAuth } from '@/contexts/AuthContext';
import { BadgeCheck, Star, Zap, TrendingUp, Calendar, ArrowLeft, Loader2, CreditCard, Crown, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

export default function PelotifyProPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'mensual' | 'anual'>('mensual');

  const priceMensual = 1500;
  const priceAnual = 15000;
  const isDark = theme === 'dark';

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/pro/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          planType: selectedPlan,
          price: selectedPlan === 'mensual' ? priceMensual : priceAnual
        }),
      });

      const data = await response.json();
      
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || 'Error generando orden de pago');
      }
    } catch (err: any) {
      alert('Error activando Pro: ' + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative selection:bg-yellow-500/30 overflow-hidden pb-32 transition-colors duration-500 ${
      isDark 
        ? 'bg-black text-white' 
        : 'bg-[#FFFDF7] text-gray-900'
    }`}>
      {/* Background abstract elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {isDark ? (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/20 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 blur-[150px] rounded-full" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
          </>
        ) : (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-yellow-200/40 via-amber-100/30 to-transparent blur-[120px] rounded-full" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-orange-100/30 via-yellow-50/20 to-transparent blur-[120px] rounded-full" />
            <div className="absolute top-[30%] left-[50%] w-[30%] h-[30%] bg-gradient-to-br from-amber-200/15 to-transparent blur-[100px] rounded-full" />
            {/* Subtle warm pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, #b8860b 1px, transparent 1px), radial-gradient(circle at 75% 75%, #b8860b 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }} />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-12">
        <button onClick={() => router.back()} className={`flex items-center gap-2 transition-colors uppercase tracking-widest text-[10px] font-black mb-12 ${
          isDark ? 'text-white/50 hover:text-white' : 'text-gray-400 hover:text-gray-700'
        }`}>
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className={`inline-flex items-center justify-center p-4 rounded-full border mb-6 ${
            isDark 
              ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/5 border-yellow-500/30 shadow-[0_0_50px_rgba(250,204,21,0.2)]' 
              : 'bg-gradient-to-br from-yellow-100 to-amber-50 border-yellow-300/60 shadow-[0_8px_40px_rgba(245,158,11,0.15)]'
          }`}>
             <Star className={`w-12 h-12 drop-shadow-[0_0_15px_rgba(250,204,21,1)] ${
               isDark ? 'text-yellow-400' : 'text-amber-500'
             }`} fill="currentColor" />
          </div>
          <h1 className={`text-5xl sm:text-7xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent drop-shadow-sm ${
            isDark 
              ? 'bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600' 
              : 'bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-700'
          }`}>
            Pelotify Pro
          </h1>
          <p className={`text-lg sm:text-xl max-w-xl mx-auto font-medium ${
            isDark ? 'text-white/60' : 'text-gray-500'
          }`}>
            Destaca en la comunidad, mejora tus análisis de juego y accede a beneficios exclusivos dentro de la cancha.
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex justify-center mb-12">
          <div className={`p-1.5 rounded-2xl flex items-center shadow-inner ${
            isDark 
              ? 'bg-white/5 border border-white/10' 
              : 'bg-amber-50/80 border border-amber-200/60 shadow-[0_2px_12px_rgba(245,158,11,0.08)]'
          }`}>
            <button 
              onClick={() => setSelectedPlan('mensual')}
              className={`px-8 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                selectedPlan === 'mensual' 
                  ? isDark
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/20'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-400/30'
                  : isDark
                    ? 'text-white/50 hover:text-white'
                    : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Mensual
            </button>
            <button 
              onClick={() => setSelectedPlan('anual')}
              className={`px-8 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
                selectedPlan === 'anual' 
                  ? isDark
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/20'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-400/30'
                  : isDark
                    ? 'text-white/50 hover:text-white'
                    : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Anual
              <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                isDark ? 'bg-black/20' : selectedPlan === 'anual' ? 'bg-white/25' : 'bg-amber-100 text-amber-700'
              }`}>Ahorra 16%</span>
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
              darkColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
              lightColor: "text-blue-600 bg-blue-50 border-blue-200/60"
            },
            {
              icon: TrendingUp,
              title: "Estadísticas Avanzadas",
              desc: "Accede a radares de rendimiento, historial detallado de partidos y comparativas con otros jugadores en tu liga.",
              darkColor: "text-green-400 bg-green-500/10 border-green-500/20",
              lightColor: "text-emerald-600 bg-emerald-50 border-emerald-200/60"
            },
            {
              icon: Zap,
              title: "Radar de Jugadores Pro",
              desc: "Aparece primero en las sugerencias cuando los capitanes buscan reemplazos urgentes y fichajes.",
              darkColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
              lightColor: "text-amber-600 bg-amber-50 border-amber-200/60"
            },
            {
              icon: Calendar,
              title: "Prioridad en Partidos",
              desc: "Sé el primero en ver y anotarte en partidos públicos organizados por Pelotify antes que se llenen.",
              darkColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
              lightColor: "text-purple-600 bg-purple-50 border-purple-200/60"
            },
          ].map((feature, idx) => (
            <div key={idx} className={`p-6 rounded-3xl border transition-all group flex flex-col items-start gap-4 ${
              isDark 
                ? 'bg-white/5 border-white/10 hover:border-yellow-500/30 hover:bg-white/[0.07]' 
                : 'bg-white/80 border-amber-100/80 hover:border-amber-300/60 hover:bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.08)]'
            }`}>
              <div className={`p-4 rounded-2xl border transition-transform group-hover:scale-110 ${isDark ? feature.darkColor : feature.lightColor}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-lg font-black uppercase italic tracking-tight mb-2 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{feature.title}</h3>
                <p className={`text-sm leading-relaxed font-medium ${
                  isDark ? 'text-white/50' : 'text-gray-500'
                }`}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Card */}
        <div className={`max-w-xl mx-auto rounded-[3rem] p-[1px] relative ${
          isDark 
            ? 'bg-gradient-to-b from-white/10 to-transparent shadow-[0_0_80px_rgba(250,204,21,0.15)]' 
            : 'bg-gradient-to-b from-amber-200/60 via-yellow-100/40 to-transparent shadow-[0_20px_60px_rgba(245,158,11,0.12)]'
        }`}>
          <div className={`absolute -top-4 right-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest rotate-3 ${
            isDark 
              ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-500/30 border border-yellow-200' 
              : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-400/25 border border-amber-300'
          }`}>
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Recomendado
            </span>
          </div>
          <div className={`p-10 rounded-[3rem] text-center flex flex-col items-center ${
            isDark 
              ? 'bg-black/80 backdrop-blur-3xl' 
              : 'bg-white/90 backdrop-blur-xl border border-amber-100/50'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className={`w-4 h-4 ${isDark ? 'text-yellow-400/60' : 'text-amber-400'}`} />
              <h2 className={`text-sm font-black uppercase tracking-[0.3em] ${
                isDark ? 'text-yellow-400' : 'text-amber-600'
              }`}>Membresía {selectedPlan}</h2>
              <Sparkles className={`w-4 h-4 ${isDark ? 'text-yellow-400/60' : 'text-amber-400'}`} />
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className={`text-6xl font-black tracking-tighter italic ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                ${selectedPlan === 'mensual' ? priceMensual : priceAnual}
              </span>
              <span className={`font-medium uppercase tracking-widest text-sm ${
                isDark ? 'text-white/40' : 'text-gray-400'
              }`}>ARS / {selectedPlan === 'mensual' ? 'mes' : 'año'}</span>
            </div>
            
            <button 
              onClick={handleSubscribe} 
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${
                isDark 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-xl shadow-yellow-500/20' 
                  : 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-white shadow-xl shadow-amber-400/25'
              }`}
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
              Convertirme en Pro
            </button>
            <p className={`text-xs font-medium mt-6 ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`}>
              Serás redirigido a Mercado Pago de forma segura para completar tu suscripción. Cancela cuando quieras.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
