"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Star, 
  ChevronRight, 
  CalendarDays, 
  Clock, 
  DollarSign, 
  Zap, 
  Shield, 
  Info,
  ArrowLeft,
  Share2,
  ExternalLink,
  MessageSquare,
  Check,
  Instagram,
  Facebook
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

export default function EstablecimientoProfile() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [business, setBusiness] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isPostingReview, setIsPostingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const searchParams = useSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('is_pro').eq('id', user.id).single().then(({ data }) => {
        if (data) setIsPro(data.is_pro);
      });
    }
  }, [user]);

  const averageRating = React.useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setShowSuccessModal(true);
      // Invalidate home data since a new match/booking was created
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userMatches.all });
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2cfc7d', '#ffffff', '#000000']
      });
      // Clear URL params without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id, selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Business
      const { data: bData, error: bError } = await supabase
        .from('canchas_businesses')
        .select('*')
        .eq('id', params.id)
        .single();

      if (bError && bError.code !== 'PGRST116') throw bError;
      setBusiness(bData);

      if (bData) {
        // Fetch Fields
        const { data: fData, error: fError } = await supabase
          .from('canchas_fields')
          .select('*')
          .eq('business_id', params.id)
          .eq('is_active', true);

        if (fError) throw fError;
        setFields(fData);
        if (fData.length > 0 && !selectedField) setSelectedField(fData[0]);

        // Fetch Bookings for the selected date
        const { data: bkData, error: bkError } = await supabase
          .from('canchas_bookings')
          .select('*')
          .in('field_id', fData.map(f => f.id))
          .eq('date', selectedDate)
          .neq('status', 'cancelled');

        if (bkError) throw bkError;
        setBookings(bkData);
      }

      // Fetch Reviews
      const { data: revData } = await supabase
        .from('canchas_reviews')
        .select('*, profiles(name)')
        .eq('business_id', params.id)
        .order('created_at', { ascending: false });
      if (revData) setReviews(revData);

    } catch (err) {
      console.error('Error fetching establecimiento:', err);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];

  const isSlotAvailable = (time: string, fieldId: string) => {
    return !bookings.some(b => b.field_id === fieldId && b.start_time.startsWith(time));
  };

  
  const handlePostReview = async () => {
    if (!user) {
       alert("Debes iniciar sesión para dejar una reseña.");
       return;
    }
    if (!newReview.comment.trim()) return;

    try {
       setIsPostingReview(true);
       const { data, error } = await supabase.from('canchas_reviews').insert({
          business_id: business.id,
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment
       }).select('*, profiles(name)').single();

       if (error) throw error;
       setReviews([data, ...reviews]);
       setNewReview({ rating: 5, comment: '' });
       alert("¡Gracias por tu reseña!");
    } catch (err: any) {
       alert("Error al postear reseña: " + err.message);
    } finally {
       setIsPostingReview(false);
    }
  };
const handleBooking = async () => {
    if (!user) {
      alert("Debes iniciar sesión para reservar.");
      return;
    }
    if (!selectedField || !selectedSlot) return;

    try {
      setIsBooking(true);
      const response = await fetch('/api/bookings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          fieldId: selectedField.id,
          date: selectedDate,
          time: selectedSlot,
          userId: user.id,
          totalPrice: isPro ? selectedField.price_per_match * 0.9 : selectedField.price_per_match,
          downPayment: Math.round((isPro ? selectedField.price_per_match * 0.9 : selectedField.price_per_match) * (selectedField.down_payment_percentage || 30) / 100)
        }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || 'Error al generar la preferencia de pago');
      }
    } catch (err: any) {
      console.error(err);
      alert("Hubo un error al procesar la reserva: " + err.message);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading && !business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="font-black text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Cargando Establecimiento...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-[2.5rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-6">
           <MapPin className="w-10 h-10 text-primary opacity-50" />
        </div>
        <h2 className="text-3xl font-black font-kanit italic uppercase mb-2">Establecimiento no encontrado</h2>
        <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest max-w-xs mx-auto mb-8">Parece que el ID del local no es válido o ha sido dado de baja.</p>
        <button onClick={() => router.back()} className="px-8 py-3 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-2xl">Volver Atrás</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-outfit pb-20 overflow-x-hidden">
      
      {/* HERO SECTION */}
      <div className="relative h-[50dvh] lg:h-[65dvh] overflow-hidden">
         <motion.div 
           initial={{ scale: 1.15, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.8, ease: "easeOut" }}
           className="absolute inset-0"
         >
            <img 
              src={business.profile_image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"} 
              className="w-full h-full object-cover brightness-[0.4] contrast-125"
              alt={business.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent" />
         </motion.div>

         <div className="absolute top-0 left-0 right-0 z-20 px-6 pt-12 flex justify-between items-center sm:px-12">
            <button 
              onClick={() => router.back()}
              className="w-12 h-12 rounded-2xl glass-premium border-white/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-white"
            >
               <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-3">
               <button className="w-12 h-12 rounded-2xl glass-premium border-white/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-white">
                  <Share2 className="w-5 h-5" />
               </button>
            </div>
         </div>

         <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-20 pb-16 z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-6"
            >
               <div className="flex items-center gap-4">
                  <div className="px-5 py-2 glass-premium rounded-2xl border border-primary/30 shadow-[0_10px_30px_rgba(44,252,125,0.2)]">
                     <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">VETERANO PRO</span>
                  </div>
                   {averageRating && (
                     <div className="flex items-center gap-1.5 px-4 py-2 glass rounded-2xl border border-white/5">
                        {[1, 2, 3, 4, 5].map((i) => (
                           <Star 
                              key={i} 
                              className={cn(
                                 "w-3.5 h-3.5",
                                 Number(averageRating) >= i ? "fill-accent text-accent" : "text-white/20"
                              )} 
                           />
                        ))}
                        <span className="text-[11px] font-black text-white ml-2">{averageRating}</span>
                     </div>
                  )}
               </div>
               
               <h1 className="text-6xl sm:text-8xl lg:text-[10rem] font-black italic uppercase leading-[0.8] tracking-[-0.08em] text-white drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] font-kanit">
                 {business.name}
               </h1>
               
               <div className="flex flex-wrap items-center gap-x-12 gap-y-4 pt-4">
                  <div className="flex items-center gap-3 text-white">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <MapPin className="w-5 h-5 text-primary" />
                     </div>
                     <span className="text-sm font-black italic uppercase tracking-tighter">{business.address || "Rosario, Argentina"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                     <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-white/5">
                        <Phone className="w-5 h-5 text-white/60" />
                     </div>
                     <span className="text-sm font-black italic">{business.phone || "+54 341 000 0000"}</span>
                  </div>
               </div>
            </motion.div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-20 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
         
         {/* LEFT COL: INFO & FIELDS */}
         <div className="lg:col-span-8 space-y-16">
            
            {/* SEARCH/FILTER BOOKING */}
            <section className="space-y-10">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black font-kanit italic uppercase tracking-tighter text-foreground">Reservar <span className="text-primary">Horario</span></h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Elegí tu cancha y horario ideal</p>
                  </div>
                  
                  <div className="flex gap-2 bg-surface-elevated/50 p-2 rounded-2xl border border-white/5 shadow-inner">
                     {(Array.from(new Set(fields.map(f => f.type))) as string[]).map(type => (
                        <button key={type} className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-bright transition-all border border-transparent hover:border-white/5">
                           {type}
                        </button>
                     ))}
                  </div>
               </div>

               {/* FIELD SELECTOR */}
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
                  {fields.map(field => (
                     <button 
                       key={field.id}
                       onClick={() => setSelectedField(field)}
                       className={`shrink-0 flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden group ${
                         selectedField?.id === field.id 
                           ? 'bg-primary border-primary shadow-[0_20px_40px_rgba(44,252,125,0.2)] scale-[1.05] z-10' 
                           : 'bg-surface-elevated/30 border-white/5 hover:border-primary/40'
                       }`}
                     >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black italic font-kanit text-lg transition-colors ${selectedField?.id === field.id ? 'bg-black text-primary' : 'bg-surface-bright text-primary group-hover:bg-primary/20'}`}>
                           {field.type}
                        </div>
                        <div className="text-left pr-8">
                           <p className={`text-base font-black uppercase tracking-tighter transition-colors ${selectedField?.id === field.id ? 'text-black' : 'text-foreground'}`}>{field.name}</p>
                           <p className={`text-xs font-bold transition-colors ${selectedField?.id === field.id ? 'text-black/60' : 'text-muted-foreground'}`}>
                             {isPro && <span className="line-through opacity-50 mr-2">${new Intl.NumberFormat('es-AR').format(field.price_per_match)}</span>}
                             ${new Intl.NumberFormat('es-AR').format(isPro ? field.price_per_match * 0.9 : field.price_per_match)} <span className="text-[10px] opacity-70"> /HS</span>
                             {isPro && <span className="ml-2 text-[8px] font-black uppercase tracking-widest text-[#d97706] bg-yellow-500/20 px-1.5 py-0.5 rounded-full inline-flex border border-yellow-500/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]">PRO</span>}
                           </p>
                        </div>
                        {selectedField?.id === field.id && (
                           <div className="absolute top-2 right-2">
                              <Check className="w-5 h-5 text-black" />
                           </div>
                        )}
                     </button>
                  ))}
               </div>

               {/* DATE PICKER */}
               <div className="flex gap-4 overflow-x-auto no-scrollbar py-6 -mx-2 px-2">
                  {[...Array(14)].map((_, i) => {
                     const d = new Date();
                     d.setDate(d.getDate() + i);
                     const dateStr = d.toISOString().split('T')[0];
                     const isSelected = selectedDate === dateStr;
                     const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
                     const dayNum = d.getDate();
                     return (
                        <button 
                          key={i}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`shrink-0 w-20 h-24 rounded-3xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 border ${
                            isSelected 
                              ? 'bg-foreground text-background font-black border-foreground shadow-2xl scale-110 z-10' 
                              : 'bg-surface-elevated/30 text-muted-foreground border-white/5 hover:border-white/20'
                          }`}
                        >
                           <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isSelected ? 'opacity-40' : 'opacity-60'}`}>{dayName}</span>
                           <span className="text-2xl font-black font-kanit italic leading-none">{dayNum}</span>
                        </button>
                     );
                  })}
               </div>

               {/* SLOTS GRID */}
               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {timeSlots.map(time => {
                     const available = isSlotAvailable(time, selectedField?.id);
                     const isSelected = selectedSlot === time;
                     return (
                        <button 
                          key={time}
                          disabled={!available}
                          onClick={() => setSelectedSlot(time)}
                          className={`h-16 rounded-[1.5rem] flex items-center justify-center relative overflow-hidden transition-all duration-300 border ${
                            !available 
                              ? 'bg-surface-elevated/10 border-white/5 opacity-20 cursor-not-allowed filter grayscale' 
                              : isSelected
                                ? 'bg-primary text-black border-primary shadow-[0_15px_30px_rgba(44,252,125,0.3)] scale-[1.08] z-20'
                                : 'bg-surface-elevated/40 border-white/5 hover:border-primary/50 hover:bg-primary/5 group'
                          }`}
                        >
                           <span className={`text-base font-black font-kanit italic tracking-tighter transition-colors ${available && !isSelected ? 'text-foreground/70 group-hover:text-primary' : ''}`}>{time}</span>
                           {!available && <div className="absolute inset-0 bg-danger/5 flex items-center justify-center rotate-[15deg]"><span className="text-[8px] font-black uppercase text-danger/30">OCUPADO</span></div>}
                        </button>
                     );
                  })}
               </div>
            </section>

            {/* DESCRIPTION & SERVICES */}
            <section className="glass-premium rounded-[3.5rem] p-12 border-white/5 space-y-12 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10 group-hover:bg-primary/10 transition-colors"></div>
               
               <div className="space-y-6">
                  <h3 className="text-3xl font-black font-kanit italic uppercase tracking-tighter">Detalles de la <span className="text-primary">Sede</span></h3>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-2xl font-medium">
                     {business.description || "Este establecimiento cuenta con las mejores instalaciones de la zona. Canchas de césped sintético autorizadas por FIFA, iluminación de alta potencia para turnos nocturnos, y un ambiente 100% futbolero. Disponemos de vestuarios climatizados, bar con vista a las canchas y estacionamiento privado."}
                  </p>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-4">
                  {[
                    { icon: Zap, label: "Luces LED PRO", color: "text-primary bg-primary/10" },
                    { icon: Shield, label: "Seguridad 24hs", color: "text-blue-400 bg-blue-400/10" },
                    { icon: Star, label: "Césped FIFA", color: "text-accent bg-accent/10" },
                    { icon: MapPin, label: "Parking Privado", color: "text-amber-400 bg-amber-400/10" },
                    { icon: Info, label: "Vestuarios XL", color: "text-violet-400 bg-violet-400/10" },
                    { icon: Clock, label: "Confirmación Instantánea", color: "text-success bg-success/10" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/5 ${item.color}`}>
                          <item.icon className="w-5 h-5" />
                       </div>
                       <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">{item.label}</span>
                          <div className="h-0.5 w-4 bg-primary/50" />
                       </div>
                    </div>
                  ))}
               </div>
            </section>
         </div>

         {/* RIGHT COL: STICKY BOOKING CARD */}
         <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
               <div className="glass-premium rounded-[3rem] p-10 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -z-10 group-hover:bg-primary/30 transition-colors"></div>
                  
                  <div className="space-y-2 mb-10">
                     <h3 className="text-2xl font-black font-kanit italic uppercase tracking-tighter">Tu Turno</h3>
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Resumen de la selección</p>
                  </div>
                  
                  <div className="space-y-8">
                     <div className="flex justify-between items-center group/row">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Cancha</p>
                           <p className="text-lg font-black italic uppercase text-foreground leading-none">{selectedField?.name || "Pendiente..."}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-white/5 group-hover/row:border-primary transition-colors">
                           <Zap className="w-5 h-5 text-muted-foreground group-hover/row:text-primary" />
                        </div>
                     </div>
                     
                     <div className="flex justify-between items-center group/row">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Día y Hora</p>
                           <p className="text-lg font-black italic uppercase text-foreground leading-none">
                              {selectedSlot ? `${selectedSlot} HS • ${new Date(selectedDate).getDate()} / ${new Date(selectedDate).getMonth() + 1}` : "Seleccionar..."}
                           </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-white/5 group-hover/row:border-primary transition-colors">
                           <CalendarDays className="w-5 h-5 text-muted-foreground group-hover/row:text-primary" />
                        </div>
                     </div>

                     <div className="pt-8 border-t border-white/10 space-y-4">
                        <div className="flex justify-between items-end">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Monto de la Seña</p>
                              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">({selectedField?.down_payment_percentage || 30}% del valor total)</p>
                           </div>
                           <p className="text-4xl font-black font-kanit italic tracking-tighter text-white">
                              ${selectedField ? new Intl.NumberFormat('es-AR').format(Math.round((isPro ? selectedField.price_per_match * 0.9 : selectedField.price_per_match) * (selectedField.down_payment_percentage || 30) / 100)) : "0"}
                           </p>
                        </div>
                     </div>
                  </div>

                  <button 
                    disabled={!selectedSlot || !selectedField}
                    onClick={() => setShowBookingConfirm(true)}
                    className="w-full mt-10 h-16 bg-primary text-black font-black uppercase text-[12px] tracking-widest rounded-2xl hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 shadow-[0_20px_40px_rgba(44,252,125,0.3)] hover:shadow-[0_25px_50px_rgba(44,252,125,0.4)]"
                  >
                     CONFIRMAR Y PAGAR
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 mt-6">
                     <Shield className="w-3.5 h-3.5 text-primary/60" />
                     <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                        Pago 100% Protegido por Pelotify
                     </p>
                  </div>
               </div>

               {/* REVIEWS CARD */}
               <div className="glass-premium rounded-[2.5rem] p-10 border-white/5 space-y-8">
                  <div className="flex items-center justify-between">
                     <h4 className="text-lg font-black font-kanit italic uppercase tracking-tighter">Últimas Reseñas</h4>
                     <button className="text-[9px] font-black text-primary uppercase tracking-widest border-b border-primary/30">Ver Todas</button>
                  </div>
                  
                  <div className="space-y-8">
                     {/* ADD REVIEW FORM */}
                     {user ? (
                        <div className="p-6 rounded-3xl bg-surface-elevated/50 border border-white/5 space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase tracking-widest">Deja tu reseña</span>
                              <div className="flex gap-1">
                                 {[1,2,3,4,5].map(s => (
                                    <button key={s} onClick={() => setNewReview({...newReview, rating: s})}>
                                       <Star className={`w-4 h-4 ${newReview.rating >= s ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                                    </button>
                                 ))}
                              </div>
                           </div>
                           <textarea 
                              value={newReview.comment}
                              onChange={e => setNewReview({...newReview, comment: e.target.value})}
                              placeholder="¿Qué tal estuvo la cancha?"
                              className="w-full bg-background/50 border border-white/10 rounded-2xl p-4 text-[11px] h-20 outline-none focus:border-primary/50 transition-all font-medium"
                           />
                           <button 
                              onClick={handlePostReview}
                              disabled={isPostingReview || !newReview.comment.trim()}
                              className="w-full py-3 bg-primary text-black font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-30"
                           >
                              {isPostingReview ? 'ENVIANDO...' : 'POSTEAR RESEÑA'}
                           </button>
                        </div>
                     ) : (
                        <div className="p-6 rounded-3xl bg-surface-elevated/30 border border-white/5 text-center">
                           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Inicia sesión para compartir tu experiencia</p>
                        </div>
                     )}

                     {/* REVIEWS LIST */}
                     {reviews.length > 0 ? reviews.map((rev, i) => (
                        <div key={rev.id} className="space-y-2 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center gap-1">
                                 {[...Array(5)].map((_, s) => <Star key={s} className={`w-2.5 h-2.5 ${rev.rating > s ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />)}
                              </div>
                              <span className="text-[7px] text-muted-foreground uppercase font-black">{new Date(rev.created_at).toLocaleDateString()}</span>
                           </div>
                           <p className="text-[11px] text-foreground font-medium italic">"{rev.comment}"</p>
                           <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">— {rev.profiles?.name || 'Jugador Pelotify'}</p>
                        </div>
                     )) : (
                        <div className="text-center py-4">
                           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Sin reseñas todavía</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
      
      {/* CONFIRMATION OVERLAY */}
      <AnimatePresence>
         {showBookingConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-background/95 md:"
                 onClick={() => setShowBookingConfirm(false)}
               />
               <motion.div
                 initial={{ scale: 0.9, opacity: 0, y: 30 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: 30 }}
                 className="relative w-full max-w-lg glass-premium rounded-[4rem] p-12 border-white/10 shadow-[0_50px_150px_rgba(0,0,0,0.8)] text-center overflow-hidden"
               >
                  <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="relative z-10">
                     <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-inner">
                        <Zap className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.8)]" />
                     </div>
                     <h3 className="text-4xl font-black font-kanit italic uppercase tracking-tighter mb-4">Confirmar <span className="text-primary text-glow">Reserva</span></h3>
                     <p className="text-sm text-muted-foreground leading-relaxed mb-10 px-8">
                        Estás a un paso de confirmar tu turno en <strong>{business.name}</strong> para la cancha <strong>{selectedField.name}</strong>. Serás redirigido a Mercado Pago para abonar la seña.
                     </p>
                     
                     <div className="grid grid-cols-2 gap-4 mb-10 bg-surface-elevated/50 p-6 rounded-[2.5rem] border border-white/5 mx-4">
                        <div className="text-left">
                           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Día Elegido</p>
                           <p className="text-sm font-black text-foreground">{new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(selectedDate))}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Hora inicio</p>
                           <p className="text-sm font-black text-foreground">{selectedSlot} HS</p>
                        </div>
                     </div>
                     
                     <div className="space-y-4 px-4">
                        <button 
                           onClick={handleBooking} 
                           disabled={isBooking}
                           className="w-full h-16 bg-primary text-black font-black uppercase text-[12px] tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(44,252,125,0.3)] flex items-center justify-center gap-3"
                        >
                           {isBooking ? (
                              <>
                                 <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                 PROCESANDO...
                              </>
                           ) : (
                              "CONTINUAR AL PAGO"
                           )}
                        </button>
                        <button onClick={() => setShowBookingConfirm(false)} className="w-full h-14 bg-surface-elevated text-foreground/60 font-black uppercase text-[10px] tracking-widest rounded-2xl border border-white/10 hover:text-foreground transition-all">
                           VOLVER Y EDITAR
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
         {showSuccessModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-background/90 md:">
               <motion.div
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.8, opacity: 0 }}
                 className="relative w-full max-w-sm glass-premium rounded-[3rem] p-10 border-primary/20 text-center shadow-[0_0_100px_rgba(44,252,125,0.15)]"
               >
                  <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-12 shadow-[0_15px_30px_rgba(44,252,125,0.4)]">
                     <Check className="w-10 h-10 text-black stroke-[3]" />
                  </div>
                  <h3 className="text-3xl font-black font-kanit italic uppercase tracking-tighter mb-4">¡Reserva <span className="text-primary">Confirmada!</span></h3>
                  <p className="text-sm text-balance text-muted-foreground mb-10 px-4">
                     Tu turno ha sido señado con éxito. Ya puedes verlo en tu sección de próximos partidos. ¡A romperla!
                  </p>
                  <button 
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full py-5 bg-foreground text-background font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                     EXCELENTE
                  </button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
