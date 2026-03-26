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
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, title, price, userId: user?.id }),
      });

      const data = await response.json();

      if (data.init_point) {
        // Redirect to Mercado Pago Checkout
        window.location.href = data.init_point;
      } else {
        alert('Error al generar el pago. Verificá las credenciales.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ocurrió un error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || price <= 0}
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
          Pagar ${price} con Mercado Pago
        </>
      )}
      
      {/* Premium Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
    </button>
  );
}
