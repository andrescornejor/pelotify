"use client";

import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckinScannerPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanType, setScanType] = useState<'booking' | 'participant' | null>(null);
  const [bookingDb, setBookingDb] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize Scanner when component mounts inside the specific div
  useEffect(() => {
    // We only want the scanner visible when we are actively scanning
    if (scanResult) return;
    
    // Config: we prefer the back camera
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        aspectRatio: 1.0, 
        showTorchButtonIfSupported: true
      },
      false
    );

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
      // Decode process
      // Expecting standard prefix: checkin:UUID
      if (decodedText.startsWith('checkin:')) {
        const id = decodedText.split(':')[1];
        setScanResult(id);
        setScanType('booking');
        scanner.clear(); // turn off camera
        fetchBooking(id);
      } else if (decodedText.startsWith('checkin-player:')) {
        const id = decodedText.split(':')[1];
        setScanResult(id);
        setScanType('participant');
        scanner.clear(); // turn off camera
        fetchParticipant(id);
      } else {
        // Not a pelotify checkin code
        setErrorMsg("Formato de código QR inválido o no reconocido.");
      }
    };

    const onScanFailure = (error: any) => {
      // Ignored, just implies no QR detected yet.
    };

    scanner.render(onScanSuccess, onScanFailure);

    // Cleanup scanner when component unmounts
    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [scanResult]);

  const fetchBooking = async (id: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { data, error } = await supabase
      .from('canchas_bookings')
      .select('*, canchas_fields(name, type, business_id)')
      .eq('id', id)
      .single();

    if (error || !data) {
      setErrorMsg("No se encontró la reserva o el código es antiguo.");
      setIsLoading(false);
      return;
    }

    // Optional Check: Is this booking belonging to the connected venue owner?
    // In strict production, we should assure data.canchas_fields.business_id matches business.
    // We'll trust the user has access to it for MVP, but will fetch.

    setBookingDb(data);
    setIsLoading(false);
  };

  const fetchParticipant = async (id: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { data, error } = await supabase
      .from('match_participants')
      .select('*, profiles(name, avatar_url), matches(location, date, time, type, status)')
      .eq('id', id)
      .single();

    if (error || !data) {
      setErrorMsg("No se encontró al jugador o el código es antiguo.");
      setIsLoading(false);
      return;
    }

    setBookingDb(data);
    setIsLoading(false);
  };

  const handleConfirmCheckin = async () => {
    if (!bookingDb) return;
    setIsLoading(true);

    if (scanType === 'booking') {
      const { error } = await supabase
        .from('canchas_bookings')
        .update({
          status: 'full_paid',
          down_payment_paid: bookingDb.total_price
        })
        .eq('id', bookingDb.id);

      if (error) {
        setErrorMsg("Error al acreditar el pago en BD: " + error.message);
        setIsLoading(false);
        return;
      }

      setSuccessMsg("¡Ingreso Autorizado y acreditado correctamente!");
    } else {
      // Participant checkin - usually just for validation
      // But we can update a metadata field if we want to track attendance
      setSuccessMsg(`¡Jugador ${bookingDb.profiles?.name || 'Invitado'} autorizado!`);
    }
    
    setIsLoading(false);
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanType(null);
    setBookingDb(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-kanit">
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between border-b border-border/40 bg-surface-elevated/50 sticky top-0 z-50">
        <button 
          onClick={() => router.push('/canchas')} 
          className="p-3 rounded-2xl bg-foreground/[0.05] hover:bg-primary/10 hover:text-primary transition-all border border-border/50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Terminal de <span className="text-primary">Check-In</span></h1>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Validación por QR</p>
        </div>
        <div className="w-12 h-12 flex items-center justify-center">
          <Zap className="w-6 h-6 text-primary" />
        </div>
      </header>

      {/* MAIN CONTENT PORTAL */}
      <main className="flex-1 flex flex-col relative px-4 w-full max-w-lg mx-auto pb-10">
        
        {/* SCANNER OVERLAY / VIEWFINDER */}
        {!scanResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center mt-8 gap-6 relative"
          >
            {/* Global Error Banner if not matched */}
            {errorMsg && (
              <div className="absolute top-0 w-full p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold leading-tight">{errorMsg}</p>
                <button onClick={() => setErrorMsg(null)} className="ml-auto p-1"><X className="w-4 h-4" /></button>
              </div>
            )}

            <div className="text-center space-y-2 mb-2">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Alineá el Código</h2>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest max-w-[250px] mx-auto">
                Dentro del recuadro para validar automáticamente la entrada.
              </p>
            </div>

            {/* Html5-qrcode container */}
            <div className="w-full max-w-sm mx-auto overflow-hidden rounded-[2rem] border-4 border-primary/20 shadow-[0_0_50px_rgba(44,252,125,0.15)] relative bg-black">
              {/* Note: reader div MUST be present for html5-qrcode to attach */}
              <div id="reader" className="w-full" />
              
              {/* Overlay Decor */}
              <div className="absolute inset-0 border-[4px] border-primary/40 rounded-[2rem] pointer-events-none z-10 m-4 clip-corners animate-pulse opacity-50"></div>
            </div>

            <p className="text-[9px] text-muted-foreground/60 tracking-widest uppercase mt-4 text-center">
              Requires Camera Permission (HTTPS).<br/>
              Asegurate de proveer acceso en el navegador.
            </p>
          </motion.div>
        )}

        {/* LOADING STATE FOR DB */}
        {isLoading && !bookingDb && scanResult && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 mt-20">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <p className="text-sm font-black uppercase tracking-widest animate-pulse">Obteniendo Reserva...</p>
          </div>
        )}

        {/* BOOKING DETAILS VALIDATION TICKET */}
        {bookingDb && !isLoading && !successMsg && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="flex-1 flex flex-col mt-10"
          >
            <div className="rounded-[2.5rem] bg-surface-elevated/40 border border-primary/30 p-8 shadow-2xl relative overflow-hidden">
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex justify-between items-start mb-6 border-b border-border/40 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/30">
                      {scanType === 'booking' ? 'RESERVA' : 'JUGADOR'}
                    </span>
                    <p className="text-xs font-bold text-muted-foreground">
                      {scanType === 'booking' ? bookingDb.date : bookingDb.matches?.date}
                    </p>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
                    {scanType === 'booking' ? (bookingDb.title || 'Reserva Directa') : (bookingDb.profiles?.name || 'Jugador Invitado')}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    {scanType === 'booking' ? 'Cancha' : 'Partido'}
                  </p>
                  <p className="text-base font-black italic">
                    {scanType === 'booking' ? bookingDb.canchas_fields?.name : bookingDb.matches?.type}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Horario</p>
                    <p className="text-lg font-black italic leading-none">
                      {scanType === 'booking' ? `${bookingDb.start_time?.substring(0,5)} a ${bookingDb.end_time?.substring(0,5)}` : (bookingDb.matches?.time)}
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Ubicación</p>
                    <p className="text-base font-black italic text-primary leading-none truncate max-w-[150px]">
                      {scanType === 'booking' ? 'Esta Sede' : bookingDb.matches?.location}
                    </p>
                 </div>
              </div>

              {scanType === 'booking' ? (
                <div className="p-4 rounded-xl bg-danger/5 border border-danger/20 mb-8 mt-2">
                   <p className="text-[10px] font-bold text-danger uppercase tracking-widest mb-1 leading-tight text-center">Falta cobrar en puerta:</p>
                   <p className="text-xl font-black italic text-danger text-center leading-none">
                     ${Math.max(0, bookingDb.total_price - (bookingDb.down_payment_paid || 0))}
                   </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-8 mt-2 flex items-center justify-center gap-3">
                   <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/30">
                      <img src={bookingDb.profiles?.avatar_url || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                   </div>
                   <div className="text-left">
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Jugador Confirmado</p>
                     <p className="text-xs font-bold text-foreground/60">{bookingDb.profiles?.position || 'Nivel General'}</p>
                   </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                 <button 
                   onClick={handleConfirmCheckin}
                   className="w-full py-5 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(44,252,125,0.3)]"
                 >
                   {scanType === 'booking' ? 'Confirmar Ingreso y Cobro' : `Autorizar Ingreso de ${bookingDb.profiles?.name?.split(' ')[0]}`}
                 </button>
                 <button 
                   onClick={resetScanner}
                   className="w-full py-4 rounded-2xl bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground font-bold uppercase tracking-widest text-[10px] transition-all"
                 >
                   Cancelar / Volver
                 </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUCCESS CONFIRMATION MODAL */}
        {successMsg && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="flex-1 flex flex-col items-center justify-center mt-20 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/40 mb-6 drop-shadow-[0_0_20px_rgba(44,252,125,0.4)]">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-foreground">Autorizado</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest max-w-[250px] leading-relaxed mb-10">
              {successMsg}
            </p>
            <button 
              onClick={resetScanner}
              className="px-8 py-4 rounded-2xl bg-surface-elevated border border-primary/40 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/10 transition-all active:scale-95"
            >
              Escanear Nuevo Cliente
            </button>
          </motion.div>
        )}

      </main>

      {/* Global styling for HTML5 QR Code library injecting its own annoying dom elements */}
      <style dangerouslySetInnerHTML={{__html: `
        #reader button {
          background-color: #2cfc7d !important;
          color: black !important;
          border-radius: 9999px !important;
          padding: 8px 16px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          font-size: 10px !important;
          border: none !important;
          margin-top: 10px !important;
          cursor: pointer !important;
          font-family: inherit !important;
        }
        #reader a { color: #2cfc7d !important; }
        #reader__dashboard_section_csr span {
           display: none !important; 
        }
        #reader select {
           background-color: #111 !important;
           color: white !important;
           border: 1px solid #333 !important;
           border-radius: 8px !important;
           padding: 4px !important;
           font-size: 12px !important;
           margin-bottom: 10px !important;
        }
      `}} />
    </div>
  );
}
