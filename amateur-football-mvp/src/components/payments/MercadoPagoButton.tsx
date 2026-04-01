'use client';

import { useState } from 'react';
import { CreditCard, Loader2, Wallet } from 'lucide-react';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { useAuth } from '@/contexts/AuthContext';

// Initialize with public key
if (typeof window !== 'undefined') {
  initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '');
}

interface MercadoPagoButtonProps {
  matchId: string;
  title: string;
  price: number;
}

export default function MercadoPagoButton({ matchId, title, price }: MercadoPagoButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      alert('Debes iniciar sesiÃ³n para realizar el pago.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, title, price, userId: user.id }),
      });

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        const errorMsg = data.error || 'Error desconocido';
        console.error('MP Backend Error:', errorMsg);
        alert(`Error al generar el pago: ${errorMsg}. Revisa tus credenciales en .env.local.`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error de red. Verifica que el servidor estÃ© corriendo.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular precios para mostrar en la interfaz (15% de cargo total por servicio)
  const basePrice = price;
  const serviceFee = Math.ceil(basePrice * 0.15);
  const finalPrice = basePrice + serviceFee;

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handlePayment}
        disabled={loading || basePrice <= 0}
        className={`
          relative w-full py-4 rounded-2xl font-black italic uppercase tracking-tighter text-lg
          flex items-center justify-center gap-3 transition-all active:scale-95
          ${loading 
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
            : 'bg-[#009EE3] hover:bg-[#0086c3] text-white shadow-lg shadow-[#009EE3]/20'
          }
        `}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            <Wallet className="w-6 h-6" />
            <div className="flex flex-col items-start leading-none gap-1">
               <span>Pagar ${finalPrice} con M.Pago</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Cupo: ${basePrice} + Cargo de Servicio: ${serviceFee}</span>
            </div>
          </>
        )}
        
        {/* Premium Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
      </button>
      
      <p className="text-center text-[10px] font-bold text-foreground/40 uppercase tracking-widest leading-relaxed px-4">
        Los cargos de servicio cubren el mantenimiento de la plataforma y comisiones bancarias, <span className="text-emerald-500">garantizando que el organizador no tenga pÃ©rdidas.</span>
      </p>
    </div>
  );
}



