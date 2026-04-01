'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Clock,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  DollarSign,
  Users,
  Lock,
  Unlock,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createMatch } from '@/lib/matches';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { WeatherWidget } from '@/components/home';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { ROSARIO_VENUES, findVenueByLocation } from '@/lib/venues';
import LocationSearch from '@/components/LocationSearch';
import { cn } from '@/lib/utils';
import { AVAILABLE_TIMES } from '@/lib/constants';

const STEPS = ['Cancha', 'Cuándo', 'Detalles', 'Cobro', 'Confirmar'];

const FORMAT_DATA = {
  F5: {
    label: 'Fútbol 5',
    players: '5 vs 5',
    emoji: '⚽',
    desc: 'Velocidad y precisión',
    color: 'from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-500/30',
  },
  F7: {
    label: 'Fútbol 7',
    players: '7 vs 7',
    emoji: '🏟️',
    desc: 'Equilibrio y táctica',
    color: 'from-violet-500 to-purple-400',
    glow: 'shadow-violet-500/30',
  },
  F11: {
    label: 'Fútbol 11',
    players: '11 vs 11',
    emoji: '🏆',
    desc: 'El clásico completo',
    color: 'from-amber-500 to-orange-400',
    glow: 'shadow-amber-500/30',
  },
} as const;

function PitchSVG({ type }: { type: 'F5' | 'F7' | 'F11' }) {
  const isF5 = type === 'F5';
  const isF11 = type === 'F11';
  return (
    <svg
      viewBox="0 0 200 130"
      className="w-full h-full opacity-20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="196" height="126" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="100" y1="2" x2="100" y2="128" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="65" r="18" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="65" r="2" fill="currentColor" />
      {/* Goals */}
      <rect
        x="2"
        y="47"
        width={isF5 ? 8 : isF11 ? 12 : 10}
        height="36"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x={isF5 ? 190 : isF11 ? 186 : 188}
        y="47"
        width={isF5 ? 8 : isF11 ? 12 : 10}
        height="36"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Penalty areas */}
      {!isF5 && (
        <>
          <rect
            x="2"
            y="32"
            width={isF11 ? 35 : 28}
            height="66"
            stroke="currentColor"
            strokeWidth="1"
          />
          <rect
            x={isF11 ? 163 : 170}
            y="32"
            width={isF11 ? 35 : 28}
            height="66"
            stroke="currentColor"
            strokeWidth="1"
          />
        </>
      )}
      {isF11 && (
        <>
          <rect x="2" y="48" width="14" height="34" stroke="currentColor" strokeWidth="1" />
          <rect x="184" y="48" width="14" height="34" stroke="currentColor" strokeWidth="1" />
          <circle cx="27" cy="65" r="1.5" fill="currentColor" />
          <circle cx="173" cy="65" r="1.5" fill="currentColor" />
          {/* Corner arcs */}
          <path d="M2 2 Q8 2 8 8" stroke="currentColor" strokeWidth="1" />
          <path d="M198 2 Q192 2 192 8" stroke="currentColor" strokeWidth="1" />
          <path d="M2 128 Q8 128 8 122" stroke="currentColor" strokeWidth="1" />
          <path d="M198 128 Q192 128 192 122" stroke="currentColor" strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-row lg:flex-col items-center lg:items-start gap-2 lg:gap-0 lg:mt-10 lg:w-full">
      {STEPS.map((label, i) => (
        <div key={i} className="flex flex-row lg:flex-col items-center lg:items-start lg:w-full">
          <div className="flex flex-col lg:flex-row items-center lg:gap-4 lg:w-full">
            <motion.div
              animate={{
                scale: i === current ? 1.1 : 1,
                backgroundColor:
                  i < current
                    ? 'rgb(16 185 129)'
                    : i === current
                      ? 'rgb(16 185 129)'
                      : 'rgba(255,255,255,0.05)',
                borderColor: i <= current ? 'rgb(16 185 129)' : 'rgba(255,255,255,0.1)',
              }}
              transition={{ duration: 0.2 }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center relative z-10"
            >
              {i < current ? (
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
              ) : (
                <span
                  className={`text-[9px] sm:text-[10px] font-black ${i === current ? 'text-black' : 'text-foreground/20'}`}
                >
                  {i + 1}
                </span>
              )}
            </motion.div>
            <div className="flex flex-col items-center lg:items-start">
              <span
                className={`text-[7px] sm:text-[8px] lg:text-[11px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] transition-colors ${i === current ? 'text-primary' : i < current ? 'text-primary/60' : 'text-foreground/20'}`}
              >
                {label}
              </span>
              <span className="hidden lg:block text-[9px] font-bold text-foreground/20 uppercase tracking-widest mt-0.5">
                {i === 0 ? "Selección de sede" : i === 1 ? "Fecha y hora" : i === 2 ? "Formato y modo" : i === 3 ? "Precio y privacidad" : "Revisión final"}
              </span>
            </div>
          </div>
          {i < total - 1 && (
            <motion.div
              animate={{ opacity: i < current ? 1 : 0.15 }}
              transition={{ duration: 0.2 }}
              className="w-4 sm:w-8 lg:w-[1.5px] h-[1px] lg:h-12 bg-primary mb-5 lg:mb-0 lg:ml-[15px] lg:my-2"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CreateMatchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [dbVenues, setDbVenues] = useState<any[]>([]);
  const [dbFields, setDbFields] = useState<any[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    // Fetch real venues from database
    const fetchVenues = async () => {
      const { data: businesses } = await supabase.from('canchas_businesses').select('*').eq('is_active', true);
      if (businesses) {
         setDbVenues(businesses);
         // Also prefetch fields for these venues to know their formats/prices
         const { data: fields } = await supabase.from('canchas_fields').select('*').eq('is_active', true);
         if (fields) setDbFields(fields);
      }
    };
    fetchVenues();
  }, []);
  const [priceManuallyEdited, setPriceManuallyEdited] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    date: '',
    time: '',
    type: 'F5' as 'F5' | 'F7' | 'F11',
    price: 0,
    level: 'Amateur',
    is_private: false,
    is_recruitment: false,
    missing_players: 0,
    field_id: '', // To link with canchas schema
    business_id: '',
    payment_method: 'mercado_pago' as 'mercado_pago' | 'cash',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  });

  useEffect(() => {
    // Escuchar cambios de cancha y fecha para obtener horarios ocupados
    const fetchBookings = async () => {
      if (formData.field_id && formData.date) {
        // Query both bookings and matches mapped to this field
        const [bookingsRes, matchesRes] = await Promise.all([
          supabase
            .from('canchas_bookings')
            .select('start_time, end_time')
            .eq('field_id', formData.field_id)
            .eq('date', formData.date)
            .neq('status', 'cancelled'),
          supabase
            .from('matches')
            .select('time')
            .eq('field_id', formData.field_id)
            .eq('date', formData.date)
        ]);

        const bookedSet = new Set<string>();

        if (bookingsRes.data) {
          bookingsRes.data.forEach(b => bookedSet.add(b.start_time.substring(0, 5)));
        }

        if (matchesRes.data) {
          matchesRes.data.forEach((m: any) => {
             if (m.time) bookedSet.add(m.time.substring(0, 5));
          });
        }

        const booked = Array.from(bookedSet);
        setBookedTimes(booked);
        
        // Si el horario actual está ocupado, deseleccionarlo
        if (booked.includes(formData.time)) {
           setFormData(prev => ({ ...prev, time: '' }));
        }
      } else {
        setBookedTimes([]);
      }
    };
    fetchBookings();
  }, [formData.field_id, formData.date]);

  const handleLocationSelect = (address: string, isRealDb = false, businessId?: string) => {
    let newType = formData.type;
    let newPrice = formData.price;
    let fieldId = '';

    // Selecting a new venue resets the manual price flag since it's a new pricing context
    const isNewVenue = address !== formData.location;
    if (isNewVenue) setPriceManuallyEdited(false);

    if (isRealDb && businessId) {
       // Search first available field matching format, or any format
       let validField = dbFields.find(f => f.business_id === businessId && f.type === formData.type);
       if (!validField) validField = dbFields.find(f => f.business_id === businessId);
       
       if (validField) {
         newType = validField.type as any;
         // Calcular por jugador dividiendo el total por el formato
         const divider = validField.type === 'F5' ? 10 : validField.type === 'F7' ? 14 : validField.type === 'F11' ? 22 : 10;
         newPrice = Math.round((validField.price_per_match || 0) / divider);
         fieldId = validField.id;
       }
    } else {
       const venue = findVenueByLocation(address);
       if (venue?.formats && venue.formats.length > 0) {
         const currentFormatValid = venue.formats.find((f: any) => f.type === newType);
         
         if (!currentFormatValid) {
           newType = venue.formats[0].type;
           newPrice = venue.formats[0].pricePerPlayer;
         } else {
           newPrice = currentFormatValid.pricePerPlayer;
         }
       }
    }

    setFormData({ 
      ...formData, 
      location: address,
      type: newType,
      price: newPrice,
      business_id: businessId || '',
      field_id: fieldId,
      lat: isRealDb && businessId ? dbVenues.find(v => v.id === businessId)?.lat : undefined,
      lng: isRealDb && businessId ? dbVenues.find(v => v.id === businessId)?.lng : undefined,
    });
  };

  const handleTypeSelect = (type: 'F5' | 'F7' | 'F11') => {
    // If it's a real business, use business_id. Otherwise look it up in hardcoded venues.
    const venue = formData.business_id 
      ? dbVenues.find(v => v.id === formData.business_id) 
      : findVenueByLocation(formData.location);
      
    let newPrice = formData.price;
    let fieldId = formData.field_id;

    if (formData.business_id && venue) { // Real DB venue (canchas_businesses)
      const formatData = dbFields.find(f => f.business_id === venue.id && f.type === type);
      if (formatData) {
        const divider = type === 'F5' ? 10 : type === 'F7' ? 14 : type === 'F11' ? 22 : 10;
        newPrice = Math.round((formatData.price_per_match || 0) / divider);
        fieldId = formatData.id;
      }
    } else if (venue && 'formats' in venue && venue.formats) { // Hardcoded venue (lib/venues)
      const formatData = (venue as any).formats.find((f: any) => f.type === type);
      if (formatData) {
        newPrice = formatData.pricePerPlayer;
      }
    }

    // Reset manual edit flag if changing format, to allow venue price to take over
    setPriceManuallyEdited(false);

    // Update missing players if they exceed the new format's limit
    let newMissingPlayers = formData.missing_players;
    if (formData.is_recruitment) {
      const maxPlayersMap = { F5: 9, F7: 13, F11: 21 };
      if (newMissingPlayers > maxPlayersMap[type]) {
        newMissingPlayers = maxPlayersMap[type];
      }
    }

    setFormData({ 
      ...formData, 
      type, 
      price: newPrice, 
      field_id: fieldId,
      missing_players: newMissingPlayers 
    });
  };

  const handleCreate = async () => {
    if (!user) return;
    setIsCreating(true);
    try {
      const match = await createMatch({
        ...formData,
        creator_id: user.id,
      });

      // Invalidate cache immediately so the match shows on Home
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userMatches.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.lists() });

      // Si es un establecimiento registrado y elige Mercado Pago, redirigir a pagar la seña
      if (formData.business_id && formData.field_id && formData.payment_method === 'mercado_pago') {
         const { data: booking } = await supabase
           .from('canchas_bookings')
           .select('id, total_price')
           .eq('match_id', match.id)
           .single();

         if (booking) {
            const field = dbFields.find(f => f.id === formData.field_id);
            const dpPercent = field?.down_payment_percentage || 30;
            const downPayment = Math.round(booking.total_price * dpPercent / 100);

            const response = await fetch('/api/bookings/checkout', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  businessId: formData.business_id,
                  fieldId: formData.field_id,
                  date: formData.date,
                  time: formData.time,
                  userId: user.id,
                  totalPrice: booking.total_price,
                  downPayment: downPayment,
                  bookingId: booking.id
               }),
            });
            const data = await response.json();
            if (data.init_point) {
               window.location.href = data.init_point;
               return;
            }
         }
      }

      router.push(`/match?id=${match.id}`);
    } catch (error: any) {
      console.error('Error creating match:', error);
      alert(`Error al crear el partido: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!formData.location;
    if (step === 1) return !!formData.date && !!formData.time;
    if (step === 2) return !!formData.type;
    return true;
  };

  const getSelectedDateLabel = () => {
    if (!formData.date) return null;
    const d = new Date(formData.date + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getTimeLabel = () => {
    if (!formData.time) return null;
    const [h, m] = formData.time.split(':');
    const hour = parseInt(h);
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${m} ${ampm}`;
  };

  const getValidTimes = () => {
    const today = new Date();
    const todayLocal = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const isToday = formData.date === todayLocal;
    const currentHour = today.getHours();

    return AVAILABLE_TIMES.filter((t) => {
      if (!isToday) return true;
      const h = parseInt(t.split(':')[0]);
      if (h === 0) return true; // Midnight is end of day
      return h > currentHour;
    });
  };
  
  const validTimes = getValidTimes();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* ── AMBIENT LAYERS (Optimized for Mobile) ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1], 
            opacity: [0.04, 0.07, 0.04] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: 'easeInOut',
            // Disable on mobile to save GPU/Battery
            repeatDelay: 0,
            type: "tween"
          }}
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary blur-[80px] sm:blur-[120px] hidden sm:block"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.08, 1], 
            opacity: [0.03, 0.06, 0.03] 
          }}
          transition={{ 
            duration: 11, 
            repeat: Infinity, 
            ease: 'easeInOut', 
            delay: 2,
            type: "tween"
          }}
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-500 blur-[80px] sm:blur-[120px] hidden sm:block"
        />
        
        {/* Simple static background for mobile */}
        <div className="sm:hidden absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-violet-500/5" />

        {/* Scanlines - simplified for mobile */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.01)_2px,rgba(255,255,255,0.01)_4px)] opacity-50 sm:opacity-100" />
      </div>

      <div className="relative z-10 max-w-4xl lg:max-w-7xl mx-auto p-4 pt-6 pb-28 min-h-screen">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
          {/* ── HEADER COLUMN ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 mb-8 lg:mb-0 lg:w-1/3 lg:sticky lg:top-12"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary hidden sm:block animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary sm:hidden" />
                <span className="text-[9px] font-black uppercase tracking-[0.6em] text-primary">
                  Crear Partido
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-[clamp(2.5rem,8vw,5rem)] lg:text-7xl font-black italic uppercase leading-none tracking-tighter text-foreground">
                Armá el
              </h1>
              <h1 className="text-[clamp(2.5rem,8vw,5rem)] lg:text-7xl font-black italic uppercase leading-none tracking-tighter">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-300">
                  Partido
                </span>
              </h1>
            </div>

            <div className="hidden lg:block">
              <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest leading-relaxed">
                Seguí los pasos para configurar tu próximo encuentro y empezá a convocar.
              </p>
            </div>

            <StepIndicator current={step} total={STEPS.length} />
          </motion.div>

          {/* ── CONTENT COLUMN ── */}
          <div className="flex-1 w-full lg:max-w-3xl">
          <AnimatePresence mode="wait">
            {/* ── STEP 0: CANCHA ── */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
                    ¿Dónde se juega?
                  </h2>
                  <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
                    Elegí la cancha o escribí una dirección
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Real DB Venues go first */}
                  {dbVenues.map((v) => {
                    const isSelected = formData.location === (v.address || v.name);
                    return (
                      <motion.button
                        key={v.id}
                        layout={false}
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        type="button"
                        onClick={() => handleLocationSelect((v.address || v.name), true, v.id)}
                        className={`group relative p-4 sm:p-5 rounded-3xl border text-left transition-all duration-300 overflow-hidden ${
                          isSelected
                            ? 'border-primary bg-primary/[0.08]'
                            : 'border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/20'
                        }`}
                      >
                        {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent hidden sm:block" />}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 hidden sm:block" />

                        <div className="relative flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-primary text-black' : 'bg-foreground/[0.04] text-foreground/20'}`}>
                              <MapPin className="w-5 h-5" />
                            </div>
                            <span className="bg-primary/20 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Socio</span>
                          </div>
                          <div>
                            <span className={`text-base font-black italic uppercase tracking-tight block transition-colors ${isSelected ? 'text-foreground' : 'text-foreground/40'}`}>
                              {v.name}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/25 block mt-0.5 truncate">
                              {v.address || "Complejo Pelotify"}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                  
                  {/* Hardcoded mock venues for fallback demonstration */}
                  {ROSARIO_VENUES.map((venue, i) => {
                    const isSelected = formData.location === venue.address;
                    return (
                      <motion.button
                        key={venue.id}
                        layout={false}
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        type="button"
                        onClick={() => handleLocationSelect(venue.address)}
                        className={`group relative p-4 sm:p-5 rounded-3xl border text-left transition-all duration-300 overflow-hidden ${
                          isSelected
                            ? 'border-primary bg-primary/[0.08]'
                            : 'border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/20'
                        }`}
                      >
                        <div className="relative flex flex-col gap-3">
                          <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-primary text-black' : 'bg-foreground/[0.04] text-foreground/20'}`}>
                              <MapPin className="w-5 h-5" />
                            </div>
                          </div>
                          <div>
                            <span className={`text-base font-black italic uppercase tracking-tight block transition-colors ${isSelected ? 'text-foreground' : 'text-foreground/40'}`}>
                              {venue.displayName || venue.name}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/25 block mt-0.5 truncate">
                              {venue.address}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Custom location search */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="relative"
                >
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <div className="h-px flex-1 bg-foreground/5" />
                    <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.5em]">
                      O buscá otra
                    </span>
                    <div className="h-px flex-1 bg-foreground/5" />
                  </div>
                  <LocationSearch
                    value={formData.location}
                    onChange={handleLocationSelect}
                    placeholder="Buscá otra cancha o dirección..."
                  />
                </motion.div>
              </motion.div>
            )}

            {/* ── STEP 1: CUÁNDO ── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
                    ¿Cuándo se juega?
                  </h2>
                  <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
                    Elegí fecha y horario
                  </p>
                </div>

                {/* Selection Header - Prominent Summary */}
                <AnimatePresence>
                  {(formData.date || formData.time) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <div className="mb-6 p-4 rounded-[2rem] bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                          <Calendar className="w-6 h-6 text-black" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Tu Próximo Turno</span>
                          <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground leading-none mt-1">
                            {getSelectedDateLabel() || 'Seleccioná una fecha'} 
                            {formData.time && <span className="text-primary ml-2">@ {formData.time}</span>}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Date picker */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
                    Seleccioná el día
                  </span>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() + i);
                      const dateStr = d.toISOString().split('T')[0];
                      const dayName = d
                        .toLocaleDateString('es-ES', { weekday: 'short' })
                        .replace('.', '')
                        .toUpperCase();
                      const dayNumber = d.getDate();
                      const monthName = d
                        .toLocaleDateString('es-ES', { month: 'short' })
                        .replace('.', '')
                        .toUpperCase();
                      const isSelected = formData.date === dateStr;
                      const isToday = i === 0;

                      return (
                        <motion.button
                          key={dateStr}
                          initial={false}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setFormData({ ...formData, date: dateStr })}
                          className={`flex-shrink-0 w-[72px] h-24 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-0.5 relative overflow-hidden ${
                            isSelected
                              ? 'border-primary bg-gradient-to-b from-primary to-emerald-400 shadow-xl shadow-primary/30 scale-105 z-10'
                              : 'border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/20 hover:bg-foreground/[0.04]'
                          }`}
                        >
                          {isToday && !isSelected && (
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary/60 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          )}
                          <span
                            className={`text-[8px] font-black tracking-widest ${isSelected ? 'text-black/60' : 'text-foreground/25'}`}
                          >
                            {monthName}
                          </span>
                          <span
                            className={`text-3xl font-black italic tracking-tighter leading-none ${isSelected ? 'text-black' : 'text-foreground/70'}`}
                          >
                            {dayNumber}
                          </span>
                          <span
                            className={`text-[8px] font-black tracking-widest ${isSelected ? 'text-black/60' : 'text-foreground/25'}`}
                          >
                            {dayName}
                          </span>
                        </motion.button>
                      );
                    })}
                    <div className="relative flex-shrink-0">
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                      />
                      <div
                        className={`w-[72px] h-24 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                          formData.date &&
                          !Array.from({ length: 14 }).some((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() + i);
                            return d.toISOString().split('T')[0] === formData.date;
                          })
                            ? 'border-primary bg-gradient-to-b from-primary to-emerald-400 text-black scale-105'
                            : 'border-foreground/[0.06] bg-foreground/[0.02] text-foreground/20 hover:border-foreground/20'
                        }`}
                      >
                        <Calendar className="w-5 h-5" />
                        <span className="text-[8px] font-black tracking-widest uppercase">
                          Otro
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time picker Grid View */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">
                        Horarios Disponibles
                      </span>
                    </div>
                    {formData.time && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
                      >
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                          Seleccionado: {formData.time}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="relative group">
                    {/* Background Glow for the grid area */}
                    <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 relative z-0">
                      {validTimes.length === 0 ? (
                        <div className="col-span-full p-8 text-center bg-foreground/[0.02] rounded-3xl border border-foreground/[0.05]">
                          <span className="text-[12px] font-bold uppercase tracking-widest text-foreground/40 block">Ya no quedan</span>
                          <span className="text-xl font-black italic tracking-tighter text-foreground/60 block mt-1 uppercase">horarios para hoy</span>
                        </div>
                      ) : (
                        validTimes.map((t, idx) => {
                          const isBooked = bookedTimes.includes(t);
                          const isSelected = formData.time === t;
                          const [h, m] = t.split(':');
                          
                          return (
                            <motion.button
                              key={t}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setFormData({ ...formData, time: t })}
                              className={`
                                relative group/btn flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl sm:rounded-3xl transition-all duration-300
                                ${isSelected 
                                  ? 'bg-primary text-black shadow-xl shadow-primary/20 scale-[1.05] z-10 border-transparent' 
                                  : isBooked 
                                    ? 'bg-foreground/[0.02] opacity-30 cursor-not-allowed border-transparent grayscale'
                                    : 'bg-foreground/[0.03] border border-foreground/[0.06] hover:border-primary/40 hover:bg-foreground/[0.06] active:scale-95'
                                }
                              `}
                            >
                              <span className={`text-lg sm:text-xl font-black italic tracking-tighter leading-none ${isSelected ? 'text-black' : 'text-foreground/80'}`}>
                                {h}:{m}
                              </span>
                              
                              <div className="mt-1 flex items-center justify-center">
                                {isBooked ? (
                                  <span className="text-[7px] font-black uppercase tracking-widest text-foreground/40">Ocupado</span>
                                ) : isSelected ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-black animate-pulse" />
                                    <span className="text-[7px] font-black uppercase tracking-widest text-black">Elegido</span>
                                  </div>
                                ) : (
                                  <span className="text-[7px] font-bold uppercase tracking-widest text-foreground/30 group-hover/btn:text-primary transition-colors">Libre</span>
                                )}
                              </div>

                              {isSelected && (
                                <motion.div
                                  layoutId="active-time-glow"
                                  className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-white/20 pointer-events-none"
                                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                            </motion.button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Weather Preview */}
                <AnimatePresence>
                  {formData.date && formData.time && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="group relative"
                    >
                      {/* Decorative background glow */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-emerald-400/20 to-teal-300/20 rounded-[2.5rem] blur opacity-50 transition duration-1000 group-hover:opacity-100" />
                      
                      <div className="relative p-6 sm:p-8 rounded-[2.5rem] bg-background/80 backdrop-blur-xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden">
                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary animate-pulse" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Condiciones Óptimas</span>
                          </div>
                          <div>
                            <h4 className="text-xl font-black italic uppercase text-foreground leading-tight">Clima para tu partido</h4>
                            <p className="text-sm font-bold text-foreground/40 mt-1 uppercase tracking-wider">Pronóstico en tiempo real para {formData.location || "la cancha"}</p>
                          </div>
                        </div>
                        
                        <div className="w-full sm:w-auto min-w-[140px] bg-foreground/[0.03] p-4 rounded-3xl border border-foreground/[0.05] relative z-10">
                          <WeatherWidget 
                            date={formData.date} 
                            time={formData.time} 
                            lat={formData.lat} 
                            lng={formData.lng} 
                            location={formData.location}
                          />
                        </div>

                        {/* Ambient decorative elements */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

                {/* ── STEP 2: DETALLES ── */}
                {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
                    Detalles del Partido
                  </h2>
                  <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
                    Formato y modo de convocatoria
                  </p>
                </div>

                {/* Format selector */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
                    Formato
                  </span>
                  <div className="grid grid-cols-3 gap-4">
                    {(
                      Object.entries(FORMAT_DATA) as [
                        keyof typeof FORMAT_DATA,
                        (typeof FORMAT_DATA)[keyof typeof FORMAT_DATA],
                      ][]
                    ).map(([key, data], i) => {
                      let isAvailable = true;
                      if (formData.business_id) {
                        isAvailable = dbFields.some(f => f.business_id === formData.business_id && f.type === key);
                      } else {
                        const venue = findVenueByLocation(formData.location);
                        isAvailable = !venue?.formats || venue.formats.some((f: any) => f.type === key);
                      }
                      
                      if (!isAvailable) return null;

                      const isSelected = formData.type === key;
                      return (
                        <motion.button
                          key={key}
                          initial={false}
                          animate={{ opacity: 1, y: 0 }}
                          type="button"
                          onClick={() => handleTypeSelect(key)}
                          className={`group relative p-4 sm:p-5 rounded-3xl border text-left transition-all duration-300 overflow-hidden flex flex-col gap-3 ${
                            isSelected
                              ? `border-primary bg-primary/[0.08] sm:shadow-2xl ${data.glow}`
                              : 'border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/15'
                          }`}
                        >
                          {isSelected && (
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${data.color} opacity-5`}
                            />
                          )}
                          {/* Pitch diagram */}
                          <div
                            className={`w-full aspect-video rounded-xl overflow-hidden flex items-center justify-center transition-colors ${
                              isSelected ? 'text-primary' : 'text-foreground/10'
                            }`}
                          >
                            <PitchSVG type={key} />
                          </div>
                          <div className="relative space-y-0.5">
                            <span
                              className={`block text-sm font-black italic uppercase tracking-tight transition-colors ${
                                isSelected ? 'text-foreground' : 'text-foreground/30'
                              }`}
                            >
                              {data.label}
                            </span>
                            <span
                              className={`block text-[9px] font-bold uppercase tracking-widest transition-colors ${
                                isSelected ? 'text-primary' : 'text-foreground/20'
                              }`}
                            >
                              {data.players}
                            </span>
                            <span
                              className={`block text-[9px] tracking-wide transition-colors ${
                                isSelected ? 'text-foreground/50' : 'text-foreground/15'
                              }`}
                            >
                              {data.desc}
                            </span>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                            >
                              <CheckCircle2 className="w-3 h-3 text-black" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Match Mode Selection */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
                    Tipo de Convocatoria
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_recruitment: false, missing_players: 0 })}
                      className={cn(
                        "p-5 rounded-3xl border text-left transition-all duration-300 flex flex-col gap-3 relative overflow-hidden",
                        !formData.is_recruitment 
                          ? "border-primary bg-primary/[0.08]" 
                          : "border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/15"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                        !formData.is_recruitment ? "bg-primary text-black" : "bg-foreground/[0.04] text-foreground/20"
                      )}>
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={cn("block text-sm font-black italic uppercase tracking-tight", !formData.is_recruitment ? "text-foreground" : "text-foreground/30")}>Partido Completo</span>
                        <span className={cn("block text-[10px] font-bold tracking-wide mt-0.5", !formData.is_recruitment ? "text-foreground/50" : "text-foreground/15")}>Todos se unen por la App</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_recruitment: true, missing_players: 1 })}
                      className={cn(
                        "p-5 rounded-3xl border text-left transition-all duration-300 flex flex-col gap-3 relative overflow-hidden",
                        formData.is_recruitment 
                          ? "border-amber-500 bg-amber-500/[0.08]" 
                          : "border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/15"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                        formData.is_recruitment ? "bg-amber-500 text-black" : "bg-foreground/[0.04] text-foreground/20"
                      )}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={cn("block text-sm font-black italic uppercase tracking-tight", formData.is_recruitment ? "text-foreground" : "text-foreground/30")}>Búsqueda de Emergencia</span>
                        <span className={cn("block text-[10px] font-bold tracking-wide mt-0.5", formData.is_recruitment ? "text-foreground/50" : "text-foreground/15")}>Solo busco algunos jugadores</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recruiting Count Slider (Only if is_recruitment is true) */}
                <AnimatePresence>
                  {formData.is_recruitment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">
                          ¿Cuántos te faltan?
                        </span>
                        <span className="text-2xl font-black italic text-amber-500 font-kanit">
                          {formData.missing_players} {formData.missing_players === 1 ? 'JUGADOR' : 'JUGADORES'}
                        </span>
                      </div>
                      <input 
                        type="range"
                        min="1"
                        max={formData.type === 'F5' ? 9 : formData.type === 'F7' ? 13 : 21}
                        value={formData.missing_players}
                        onChange={(e) => setFormData({ ...formData, missing_players: parseInt(e.target.value) })}
                        className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <p className="text-[9px] font-medium text-foreground/30 italic">
                        * Los otros {formData.type === 'F5' ? 10 - formData.missing_players : formData.type === 'F7' ? 14 - formData.missing_players : 22 - formData.missing_players} jugadores se consideran ya confirmados fuera de la plataforma.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── STEP 3: COBRO ── */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
                    Configuración de Cobro
                  </h2>
                  <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
                    Precio, privacidad y método de pago
                  </p>
                </div>

                {/* Price */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
                    Cuota por jugador
                  </span>
                  <div className="relative group">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
                    <input
                      type="number"
                      min="0"
                      placeholder="0 · Partido libre"
                      value={formData.price || ''}
                      onChange={(e) => {
                        setPriceManuallyEdited(true);
                        setFormData({ ...formData, price: parseInt(e.target.value) || 0 });
                      }}
                      className="w-full h-16 pl-14 pr-4 rounded-2xl bg-foreground/[0.03] border border-foreground/10 focus:bg-foreground/[0.05] focus:border-primary/40 outline-none text-2xl font-black italic text-foreground tracking-tighter transition-all"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/20 uppercase tracking-widest">
                      ARS
                    </span>
                  </div>

                  {/* Fee Breakdown */}
                  <AnimatePresence>
                    {formData.price > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="px-4 py-3 rounded-2xl bg-foreground/[0.02] border border-foreground/5 flex flex-col gap-2 overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                            Vos recibís
                          </span>
                          <span className="text-xs font-black text-emerald-500">
                            ${formData.price.toLocaleString('es-AR')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                              Cargo por servicio
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-foreground/40">
                            + ${Math.ceil(formData.price * 0.15).toLocaleString('es-AR')}
                          </span>
                        </div>
                        <div className="h-px w-full bg-foreground/5 my-0.5" />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                            El jugador paga
                          </span>
                          <span className="text-sm font-black italic text-foreground tracking-tighter">
                            ${(formData.price + Math.ceil(formData.price * 0.15)).toLocaleString('es-AR')}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Privacy */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
                    Privacidad
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        value: false,
                        label: 'Público',
                        desc: 'Cualquiera puede unirse',
                        icon: <Globe className="w-5 h-5" />,
                        color: 'primary',
                      },
                      {
                        value: true,
                        label: 'Privado',
                        desc: 'Solo con invitación',
                        icon: <Lock className="w-5 h-5" />,
                        color: 'accent',
                      },
                    ].map(({ value, label, desc, icon, color }) => {
                      const isSelected = formData.is_private === value;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setFormData({ ...formData, is_private: value })}
                          className={`p-5 rounded-3xl border text-left transition-all duration-300 flex flex-col gap-3 relative overflow-hidden ${
                            isSelected
                              ? color === 'primary'
                                ? 'border-primary bg-primary/[0.08]'
                                : 'border-violet-500 bg-violet-500/[0.08]'
                              : 'border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/15'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                              isSelected
                                ? color === 'primary'
                                  ? 'bg-primary text-black'
                                  : 'bg-violet-500 text-white'
                                : 'bg-foreground/[0.04] text-foreground/20'
                            }`}
                          >
                            {icon}
                          </div>
                          <div>
                            <span
                              className={`block text-sm font-black italic uppercase tracking-tight ${isSelected ? 'text-foreground' : 'text-foreground/30'}`}
                            >
                              {label}
                            </span>
                            <span
                              className={`block text-[10px] font-bold tracking-wide mt-0.5 ${isSelected ? 'text-foreground/50' : 'text-foreground/15'}`}
                            >
                              {desc}
                            </span>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${color === 'primary' ? 'bg-primary' : 'bg-violet-500'}`}
                            >
                              <CheckCircle2 className="w-3 h-3 text-black" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em] px-1">
                    Método de Pago para Reserva
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, payment_method: 'mercado_pago' })}
                      className={cn(
                        "p-5 rounded-3xl border text-left transition-all duration-300 flex flex-col gap-3 relative overflow-hidden",
                        formData.payment_method === 'mercado_pago'
                          ? "border-primary bg-primary/[0.08]"
                          : "border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/15"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                        formData.payment_method === 'mercado_pago' ? "bg-primary text-black" : "bg-foreground/[0.04] text-foreground/20"
                      )}>
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={cn("block text-sm font-black italic uppercase tracking-tight", formData.payment_method === 'mercado_pago' ? "text-foreground" : "text-foreground/30")}>Mercado Pago</span>
                        <span className={cn("block text-[10px] font-bold tracking-wide mt-0.5", formData.payment_method === 'mercado_pago' ? "text-foreground/50" : "text-foreground/15")}>Asegura la cancha ahora</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, payment_method: 'cash' })}
                      className={cn(
                        "p-5 rounded-3xl border text-left transition-all duration-300 flex flex-col gap-3 relative overflow-hidden",
                        formData.payment_method === 'cash'
                          ? "border-amber-500 bg-amber-500/[0.08]"
                          : "border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/15"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                        formData.payment_method === 'cash' ? "bg-amber-500 text-black" : "bg-foreground/[0.04] text-foreground/20"
                      )}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={cn("block text-sm font-black italic uppercase tracking-tight", formData.payment_method === 'cash' ? "text-foreground" : "text-foreground/30")}>En Efectivo</span>
                        <span className={cn("block text-[10px] font-bold tracking-wide mt-0.5", formData.payment_method === 'cash' ? "text-foreground/50" : "text-foreground/15")}>Pagás en el complejo</span>
                      </div>
                    </button>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest px-1 bg-primary/5 py-2 rounded-lg border border-primary/10 mt-2">
                  💡 En Pelotify, el organizador NO paga el total. Cada jugador abona SU PARTE individualmente al sumarse al partido.
                </p>
                <p className="text-[9px] font-medium text-foreground/30 px-1 mt-2">
                  * Si seleccionas pago online, recuerda que Pelotify no se hace responsable por reembolsos fuera de los términos del complejo.
                </p>
              </motion.div>
            )}

            {/* ── STEP 4: CONFIRMAR ── */}
            {step === 4 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">
                    Resumen del Partido
                  </h2>
                  <p className="text-[11px] text-foreground/40 font-bold uppercase tracking-widest">
                    Revisá los detalles antes de confirmar
                  </p>
                </div>

                {/* Big match card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative rounded-[2rem] overflow-hidden border border-foreground/10 bg-foreground/[0.02]"
                >
                  {/* Pitch hero */}
                  <div className="relative h-40 bg-gradient-to-br from-primary/10 via-emerald-900/20 to-teal-900/10 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 text-primary/30">
                      <PitchSVG type={formData.type} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
                    {/* Format badge */}
                    <div className="relative z-10 px-6 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
                      <span className="text-primary font-black text-sm uppercase tracking-widest italic">
                        {FORMAT_DATA[formData.type].label}
                      </span>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="p-6 grid grid-cols-2 gap-4">
                    {[
                      {
                        icon: <MapPin className="w-4 h-4" />,
                        label: 'Cancha',
                        value: formData.location || '—',
                      },
                      {
                        icon: <Calendar className="w-4 h-4" />,
                        label: 'Fecha',
                        value: getSelectedDateLabel() || '—',
                      },
                      {
                        icon: <Clock className="w-4 h-4" />,
                        label: 'Horario',
                        value: getTimeLabel() || '—',
                      },
                      {
                        icon: <Users className="w-4 h-4" />,
                        label: 'Formato',
                        value: `${FORMAT_DATA[formData.type].players}`,
                      },
                      {
                        icon: <DollarSign className="w-4 h-4" />,
                        label: 'Cuota',
                        value:
                          formData.price > 0
                            ? `$${formData.price.toLocaleString('es-AR')} ARS`
                            : 'Libre',
                      },
                      {
                        icon: formData.is_private ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Globe className="w-4 h-4" />
                        ),
                        label: 'Privacidad',
                        value: formData.is_private ? 'Solo invitados' : 'Público',
                      },
                      {
                        icon: <DollarSign className="w-4 h-4" />,
                        label: 'Pago',
                        value: formData.payment_method === 'mercado_pago' ? 'Online (Reserva)' : 'Efectivo (Predio)',
                      },
                      ...(formData.business_id && formData.payment_method === 'mercado_pago' ? [{
                        icon: <Zap className="w-4 h-4 text-primary" />,
                        label: 'Seña a pagar ahora',
                        value: `$${Math.round((formData.price * (formData.type === 'F5' ? 10 : formData.type === 'F7' ? 14 : 22)) * (dbFields.find(f => f.id === formData.field_id)?.down_payment_percentage || 30) / 100).toLocaleString('es-AR')} ARS`
                      }] : []),
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                          {icon}
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-foreground/25 uppercase tracking-widest block">
                            {label}
                          </span>
                          <span className="text-sm font-black italic text-foreground tracking-tight leading-tight line-clamp-2">
                            {value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom decoration */}
                  <div className="mx-6 mb-6 p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-foreground/20" />
                    </div>
                    <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-wider leading-relaxed flex-1">
                      Serás el organizador con control total sobre los jugadores
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        {/* ── NAVIGATION ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex gap-3"
        >
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="h-14 px-6 rounded-2xl border border-foreground/10 bg-foreground/[0.03] text-foreground/40 font-black text-xs uppercase tracking-widest hover:border-foreground/20 hover:text-foreground/60 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <motion.button
              type="button"
              onClick={() => canProceed() && setStep((s) => s + 1)}
              disabled={!canProceed()}
              whileHover={canProceed() ? { scale: 1.01 } : {}}
              whileTap={canProceed() ? { scale: 0.98 } : {}}
              className={`flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all relative overflow-hidden ${
                canProceed()
                  ? 'bg-primary text-black shadow-[0_8px_32px_rgba(16,185,129,0.25)]'
                  : 'bg-foreground/[0.04] text-foreground/20 cursor-not-allowed'
              }`}
            >
              {canProceed() && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              )}
              Continuar
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-14 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando partido...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  ¡Crear Partido!
                </>
              )}
            </motion.button>
          )}
        </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
