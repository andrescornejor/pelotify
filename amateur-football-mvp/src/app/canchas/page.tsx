"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Wallet, 
  Settings, 
  TrendingUp, 
  Users, 
  Clock, 
  ChevronRight,
  Bell,
  MapPin,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Plus
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CanchasDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Supabase Data State
  const [business, setBusiness] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{time: string, fieldId: string, date?: string} | null>(null);

  // Tab configurations
  const tabs = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'calendar', label: 'Horarios', icon: CalendarDays },
    { id: 'finances', label: 'Finanzas', icon: Wallet },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  useEffect(() => {
    // Only fetch if we have a user
    if (!user) return;

    const fetchBusinessData = async () => {
      try {
        setLoadingDb(true);

        // 1. Fetch Business
        const { data: bData, error: bError } = await supabase
          .from('canchas_businesses')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (bError && bError.code !== 'PGRST116') {
          console.error('Error fetching business:', bError);
        }

        if (bData) {
          setBusiness(bData);

          // 2. Fetch Fields
          const { data: fData, error: fError } = await supabase
            .from('canchas_fields')
            .select('*')
            .eq('business_id', bData.id)
            .order('name', { ascending: true });

          if (!fError && fData) setFields(fData);

          // 3. Fetch Bookings (for today or upcoming)
          const { data: bkData, error: bkError } = await supabase
            .from('canchas_bookings')
            .select('*, canchas_fields(name, type)')
            .in('field_id', fData?.map(f => f.id) || [])
            .gte('date', new Date().toISOString().split('T')[0]) // Upcoming
            .order('date', { ascending: true })
            .order('start_time', { ascending: true })
            .limit(20);

          if (!bkError && bkData) setBookings(bkData);
        }
      } catch (err) {
        console.error('Unexpected error fetching dashboard data:', err);
      } finally {
         setLoadingDb(false);
      }
    };

    fetchBusinessData();
  }, [user]);

  if (loadingDb) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no business found, show a placeholder asking to create one
  if (!business) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-outfit p-4">
        <div className="max-w-md w-full glass-card p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-Kanit font-bold">¡Bienvenido!</h2>
          <p className="text-muted-foreground text-sm font-medium">No tienes ningún establecimiento asociado a tu cuenta. Contacta a soporte para dar de alta tu primera sucursal de canchas.</p>
          <button onClick={() => router.push('/')} className="w-full bg-surface-elevated text-foreground hover:bg-surface-bright font-bold py-3 px-4 rounded-xl border border-border/50 transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0 font-outfit">
      
      {/* HEADER TRAY */}
      <header className="fixed top-0 w-full z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center glow-primary">
              <MapPin className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-kanit tracking-wide">
                <span className="text-foreground">{business?.name || "Complejo"}</span>
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                Operativo
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-foreground/5 transition-colors hidden sm:block delay-100" onClick={() => alert("Soporte Técnico pronto estará disponible por WhatsApp.")}>
               <span className="text-xs text-primary font-bold pr-4">Soporte técnico</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border/50">
              <div className="w-8 h-8 rounded-full bg-surface-elevated overflow-hidden border border-border">
                <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=random`} alt="Admin" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="pt-20 sm:pt-24 max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-6 md:gap-8 min-h-screen">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 gap-2 sticky top-28 h-[calc(100vh-8rem)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabSidebar"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'drop-shadow-[0_0_8px_rgba(44,252,125,0.5)]' : ''}`} />
                <span className="font-semibold relative z-10">{tab.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto relative z-10" />}
              </button>
            );
          })}
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 w-full pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab business={business} bookings={bookings} fields={fields} onNewBooking={() => setShowBookingModal(true)} />}
              {activeTab === 'calendar' && <CalendarTab bookings={bookings} fields={fields} onSlotClick={(time: string, fieldId: string, date: string) => { setSelectedSlot({time, fieldId, date}); setShowBookingModal(true); }} />}
              {activeTab === 'finances' && <FinancesTab business={business} bookings={bookings} />}
              {activeTab === 'settings' && <SettingsTab business={business} fields={fields} setFields={setFields} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showBookingModal && (
          <NewBookingModal 
            onClose={() => { setShowBookingModal(false); setSelectedSlot(null); }} 
            fields={fields} 
            selectedSlot={selectedSlot}
            onBooked={(newBooking: any) => setBookings((prev: any) => [...prev, newBooking])}
          />
        )}
      </AnimatePresence>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 w-full z-50 glass border-t border-border/40 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center w-16 h-full gap-1"
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabMobile"
                    className="absolute inset-0 bg-primary/10 rounded-xl my-1"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(44,252,125,0.5)]' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-medium relative z-10 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================
   OVERVIEW TAB
========================================= */
function OverviewTab({ business, bookings, fields, onNewBooking }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-danger/10 text-danger border-danger/20';
      case 'partial_paid': return 'bg-accent/10 text-accent border-accent/20';
      case 'full_paid': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-foreground/10 text-foreground border-foreground/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Impago';
      case 'partial_paid': return 'Señado';
      case 'full_paid': return 'Pagado';
      default: return status;
    }
  };

  const todayIncome = bookings
    .filter((b: any) => b.date === new Date().toISOString().split('T')[0])
    .reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0);
    
  // Format numbers to ARS
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-kanit font-bold text-gradient">Panel de Control</h2>
          <p className="text-muted-foreground text-sm">Resumen de actividad de hoy</p>
        </div>
        <button onClick={onNewBooking} className="bg-primary text-black font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-primary-light transition-colors press-effect">
          <Plus className="w-5 h-5" />
          Nueva Reserva
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={DollarSign} 
          title="Ingresos Hoy (Proyección)" 
          value={formatMoney(todayIncome || 0)} 
          trend="Calculado..." 
          trendUp={true} 
          color="primary"
        />
        <StatCard 
          icon={CalendarDays} 
          title="Reservas" 
          value={bookings.filter((b: any) => b.date === new Date().toISOString().split('T')[0]).length.toString()} 
          trend="Hoy" 
          trendUp={true} 
          color="accent"
        />
        <StatCard 
          icon={Activity} 
          title="Canchas" 
          value={fields.length > 0 ? fields.length.toString() : "0"} 
          trend="Activas" 
          trendUp={true} 
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* UPCOMING MATCHES */}
        <div className="lg:col-span-2 glass-card p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-lg font-bold font-kanit">Próximos Partidos</h3>
            <button onClick={() => alert("Usa la pestaña de Horarios para ver todas tus reservas")} className="text-primary text-sm font-semibold hover:text-primary-light transition-colors flex items-center">
              Ver todos <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4 relative z-10">
            {bookings.length === 0 ? (
              <div className="text-center p-8 bg-surface-elevated/30 rounded-2xl border border-border/50 text-muted-foreground font-semibold">
                No hay reservas próximas registradas.
              </div>
            ) : (
              bookings.slice(0, 4).map((booking: any) => (
                <UpcomingMatch 
                  key={booking.id}
                  time={booking.start_time.substring(0, 5)} 
                  field={booking.canchas_fields?.name || 'Cancha'} 
                  team={booking.title || 'Reserva anónima'} 
                  status={getStatusLabel(booking.status)} 
                  price={formatMoney(booking.total_price)} 
                  isPending={booking.status === 'pending'} 
                />
              ))
            )}
          </div>
        </div>

        {/* QUICK ACTIONS & NOTICES */}
        <div className="space-y-6">
          <div className="glass-card p-5 sm:p-6">
             <h3 className="text-lg font-bold font-kanit mb-4">Acciones Rápidas</h3>
             <div className="grid grid-cols-2 gap-3">
               <QuickAction icon={Clock} label="Bloquear Horario" onClick={() => alert("Próximamente: Bloqueos de mantenimiento en el Calendario.")} />
               <QuickAction icon={Wallet} label="Retirar Fondos" onClick={() => alert("Próximamente: Retiros automáticos de seña a tu cuenta bancaria.")} />
               <QuickAction icon={Users} label="Clientes Frecuentes" onClick={() => alert("Próximamente: Panel de clientes frecuentes.")} />
               <QuickAction icon={Settings} label="Editar Canchas" onClick={() => alert("Usa la pestaña de Configuración para agregar canchas.")} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, trend, trendUp, color }: any) {
  const getGlow = () => {
    if(color === 'primary') return 'group-hover:shadow-[0_0_30px_rgba(44,252,125,0.2)]';
    if(color === 'accent') return 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]';
    if(color === 'danger') return 'group-hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]';
    return '';
  };

  const getTextColor = () => {
    if(color === 'primary') return 'text-primary';
    if(color === 'accent') return 'text-accent';
    if(color === 'success') return 'text-success';
    return 'text-danger';
  };

  return (
    <div className={`glass-card p-5 flex flex-col gap-3 group transition-all duration-300 ${getGlow()}`}>
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl bg-surface-elevated border border-border/50`}>
          <Icon className={`w-5 h-5 ${getTextColor()}`} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-1">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold font-kanit tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function UpcomingMatch({ time, field, team, status, price, isPending = false }: any) {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-surface-elevated/50 hover:bg-surface-elevated border border-border/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="text-center w-14 shrink-0">
          <span className="block text-lg font-bold font-kanit">{time}</span>
        </div>
        <div className="w-px h-10 bg-border hidden sm:block"></div>
        <div>
          <h4 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors">{field}</h4>
          <p className="text-xs text-muted-foreground">{team}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-sm sm:text-base text-foreground">{price}</p>
        <p className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
          isPending ? 'bg-danger/10 text-danger border border-danger/20' : 
          status.includes('Seña') ? 'bg-accent/10 text-accent border border-accent/20' : 
          'bg-primary/10 text-primary border border-primary/20'
        }`}>
          {status}
        </p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-elevated/50 hover:bg-surface-elevated border border-border/50 transition-all press-effect text-center group">
      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border group-hover:border-primary/50 group-hover:text-primary transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">{label}</span>
    </button>
  );
}

/* =========================================
   CALENDAR TAB
========================================= */
function CalendarTab({ bookings, fields, onSlotClick }: any) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const timeSlots = ["17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  const displayFields = fields;

  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  if (displayFields.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-kanit font-bold text-gradient">Agenda</h2>
          <p className="text-muted-foreground text-sm">Organización de turnos</p>
        </div>
        <div className="glass-card p-10 text-center flex flex-col items-center justify-center border-dashed border-2 border-border/50">
          <CalendarDays className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-kanit font-bold mb-2">Sin canchas configuradas</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">No has dado de alta ninguna cancha en tu establecimiento. Ve a la sección de Configuración para crear tu primera cancha.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-kanit font-bold text-gradient">Agenda</h2>
          <p className="text-muted-foreground text-sm">Organización de turnos</p>
        </div>
        <div className="flex bg-surface-elevated p-1 rounded-lg border border-border">
           <button 
             onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
             className={`px-4 py-1.5 text-sm font-semibold rounded-md ${selectedDate === new Date().toISOString().split('T')[0] ? 'bg-surface border border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
           >
             Hoy
           </button>
           <button 
             onClick={() => setSelectedDate(getTomorrowString())}
             className={`px-4 py-1.5 text-sm font-semibold rounded-md ${selectedDate === getTomorrowString() ? 'bg-surface border border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
           >
             Mañana
           </button>
           <label className="relative px-4 py-1.5 text-sm font-semibold rounded-md text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer">
             <CalendarDays className="w-4 h-4"/> Fecha
             <input 
               type="date" 
               className="absolute inset-0 opacity-0 cursor-pointer" 
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
             />
           </label>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[700px]">
            {/* Grid Header */}
            <div className="grid border-b border-border/50 bg-surface-elevated/30" style={{ gridTemplateColumns: `80px repeat(${Math.min(displayFields.length, 4)}, 1fr)` }}>
              <div className="p-4 text-center text-xs font-bold text-muted-foreground">Hora</div>
              {displayFields.slice(0, 4).map((f: any) => (
                <div key={f.name || f.id} className="p-4 text-center font-bold text-sm border-l border-border/50">{f.name}</div>
              ))}
            </div>
            
            {/* Grid Body */}
            <div className="divide-y divide-border/50">
              {timeSlots.map(time => (
                <div key={time} className="grid hover:bg-surface-bright/20 transition-colors" style={{ gridTemplateColumns: `80px repeat(${Math.min(displayFields.length, 4)}, 1fr)` }}>
                  <div className="p-4 text-center text-sm font-kanit font-bold text-muted-foreground flex items-center justify-center">
                    {time}
                  </div>
                  
                  {displayFields.slice(0, 4).map((f: any) => {
                    const booking = bookings.find((b: any) => 
                      b.field_id === f.id && 
                      b.date === selectedDate && 
                      b.start_time.startsWith(time)
                    );

                    return (
                      <div key={f.id} className="p-2 border-l border-border/50">
                        {booking ? (
                          <div className={`h-full w-full rounded-lg p-2 text-xs flex flex-col justify-center border ${
                            booking.status === 'pending' ? 'bg-danger/10 border-danger/30 text-danger' :
                            booking.status === 'partial_paid' ? 'bg-accent/10 border-accent/30 text-accent' :
                            'bg-primary/10 border-primary/30 text-primary'
                          }`}>
                            <span className="font-bold">{booking.status === 'pending' ? 'Impago' : booking.status === 'partial_paid' ? 'Señado' : 'Pagado'}</span>
                            <span className="text-muted-foreground truncate">{booking.title || 'Reserva'} - ${booking.total_price}</span>
                          </div>
                        ) : (
                          <button onClick={() => onSlotClick(time, f.id, selectedDate)} className="h-full w-full min-h-[60px] rounded-lg border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors text-xs opacity-0 hover:opacity-100">
                            <Plus className="w-3 h-3" /> Turno
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   FINANCES TAB
========================================= */
function FinancesTab({ business, bookings }: any) {
  const totalIncome = bookings
    .filter((b: any) => b.status === 'full_paid' || b.status === 'partial_paid')
    .reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0);

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-2xl font-kanit font-bold text-gradient">Finanzas</h2>
          <p className="text-muted-foreground text-sm">Gestión de ingresos y saldo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Balance */}
          <div className="md:col-span-2 premium-card p-6 sm:p-8 bg-gradient-to-br from-surface to-surface-elevated relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <p className="text-sm font-semibold text-muted-foreground mb-2 relative z-10">Total Recaudado (Proyección)</p>
            <h1 className="text-4xl sm:text-5xl font-kanit font-bold text-foreground mb-6 overflow-hidden relative z-10">
              <span className="text-primary">$</span>{new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(totalIncome)}
            </h1>

            <div className="flex gap-4 relative z-10">
              <button onClick={() => alert("Retiro de fondos estará habilitado próximamente.")} className="flex-1 bg-primary text-black font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 hover:bg-primary-light transition-colors press-effect">
                <Wallet className="w-5 h-5" /> Retirar Fondos
              </button>
              <button onClick={() => alert("Visualización extendida del historial próximamente.")} className="flex-1 bg-surface border border-border font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 hover:bg-surface-bright transition-colors press-effect">
                <Activity className="w-5 h-5" /> Historial
              </button>
            </div>
          </div>

          {/* Connected Account */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Cuenta Conectada</h3>
                <div className="w-8 h-8 rounded-full bg-[#009EE3]/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#009EE3]" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Integración con Mercado Pago activa. Tus cobros entran directamente a tu cuenta configurada.</p>
              
              <div className="bg-surface-elevated rounded-lg p-3 text-sm font-semibold border border-border">
                 CVU: <span className="text-muted-foreground font-normal overflow-hidden truncate">*****************123</span>
              </div>
            </div>
            
            <button onClick={() => alert("Cambiar código de cobro próximamente en configuración.")} className="text-sm text-primary font-semibold hover:underline mt-4 text-left">
              Configurar cuenta de cobro
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold font-kanit mb-4">Últimos Movimientos</h3>
          <div className="space-y-4">
             {bookings.length === 0 ? (
               <p className="text-sm text-muted-foreground text-center py-4 bg-surface rounded-xl border border-dashed border-border">Aún no hay movimientos registrados.</p>
             ) : (
               bookings.map((b: any) => (
                 <TransactionRow key={b.id} date={`Hoy, ${b.start_time.substring(0,5)}`} concept={`Reserva - ${b.canchas_fields?.name} (${b.canchas_fields?.type})`} amount={`+$${b.total_price}`} type="income" status={b.status === 'pending' ? 'Impago' : 'Acreditado'} />
               ))
             )}
          </div>
        </div>
    </div>
  );
}

function TransactionRow({ date, concept, amount, type, status }: any) {
  const isIncome = type === 'income';
  return (
    <div className="flex justify-between items-center py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isIncome ? 'bg-success/10 border-success/20 text-success' : 'bg-foreground/5 border-border/50 text-foreground'}`}>
           {isIncome ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="font-semibold text-sm">{concept}</h4>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold font-kanit ${isIncome ? 'text-success' : 'text-foreground'}`}>{amount}</p>
        <p className="text-[10px] text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}

/* =========================================
   SETTINGS TAB
========================================= */
function SettingsTab({ business, fields, setFields }: any) {
  const [loading, setLoading] = useState(false);
  // Inicializar seña con la primera cancha o 30 por defecto
  const [deposit, setDeposit] = useState(fields?.[0]?.down_payment_percentage || 30);
  const [isSavingPrices, setIsSavingPrices] = useState(false);

  const handleSavePrices = async () => {
    if (!business) return;
    setIsSavingPrices(true);
    // Actualizar porcentaje de seña en todas las canchas para este negocio
    const { error } = await supabase
      .from('canchas_fields')
      .update({ down_payment_percentage: deposit })
      .eq('business_id', business.id);

    if (error) {
      alert("Error al actualizar la seña requerida: " + error.message);
    } else {
      // Actualizamos estado local
      setFields((prev: any) => prev.map((f: any) => ({ ...f, down_payment_percentage: deposit })));
      alert("Seña requerida actualizada correctamente para todas tus canchas.");
    }
    setIsSavingPrices(false);
  };

  const handleCreateField = async () => {
    // Quick prompt for MVP
    const fieldName = prompt("Nombre de la nueva cancha (ej. Cancha 4):");
    if (!fieldName) return;
    const type = prompt("Tipo (F5, F7, F11):") || 'F5';
    const priceStr = prompt("Precio por partido:");
    
    if (fieldName && priceStr && business) {
      setLoading(true);
      const { data, error } = await supabase.from('canchas_fields').insert([
        { 
          business_id: business.id, 
          name: fieldName, 
          type: type, 
          price_per_match: parseInt(priceStr) || 15000 
        }
      ]).select();
      
      if (!error && data) {
        setFields((prev: any) => [...prev, ...data]);
      } else {
        alert("Error creando cancha.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-kanit font-bold text-gradient">Configuración</h2>
        <p className="text-muted-foreground text-sm">Precios, canchas y reglas del establecimiento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pricing Configuration */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold font-kanit text-lg">Precios Base</h3>
          </div>
          
          <div className="space-y-4">
            <PriceInput label="Fútbol 5 (F5)" defaultValue="15000" />
            <PriceInput label="Fútbol 7 (F7)" defaultValue="25000" />
            <PriceInput label="Fútbol 11 (F11)" defaultValue="40000" />
            
            <div className="pt-4 border-t border-border/50">
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">Seña Requerida (%)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="10" 
                  value={deposit} 
                  onChange={(e) => setDeposit(parseInt(e.target.value))} 
                  className="flex-1 accent-primary" 
                />
                <span className="font-bold text-lg w-12 text-right">{deposit}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Porcentaje mínimo del valor de la cancha para confirmar la reserva.</p>
            </div>
          </div>
          
          <button 
            onClick={handleSavePrices} 
            disabled={isSavingPrices}
            className="w-full py-2.5 bg-primary/10 text-primary hover:bg-primary/20 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isSavingPrices ? 'Guardando...' : 'Guardar Precios y Seña'}
          </button>
        </div>

        {/* Fields and Schedule config */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold font-kanit text-lg">Canchas de {business?.name || "Establecimiento"}</h3>
              </div>
              <button 
                onClick={handleCreateField}
                disabled={loading}
                className="text-primary hover:text-primary-light bg-primary/10 p-1.5 rounded-lg transition-colors group">
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform"/>
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar pr-2">
              {fields.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4 bg-surface rounded-xl border border-dashed border-border">No hay canchas configuradas, agrega la primera presionando el botón '+'.</div>
              ) : (
                fields.map((f: any) => (
                  <FieldItem key={f.id} name={f.name} type={`${f.type} - $${f.price_per_match}`} isPremium={f.type === 'F11'} />
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-4">
              <div className="p-2 rounded-lg bg-foreground/10 text-foreground">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold font-kanit text-lg">Horario de Atención</h3>
            </div>
            
            <div className="flex items-center justify-between text-sm py-2">
              <span className="font-semibold text-muted-foreground">Lunes a Viernes</span>
              <span className="font-bold border border-border bg-surface px-3 py-1 rounded-md">17:00 a 00:00</span>
            </div>
            <div className="flex items-center justify-between text-sm py-2">
              <span className="font-semibold text-muted-foreground">Sábados y Domingos</span>
              <span className="font-bold border border-border bg-surface px-3 py-1 rounded-md">10:00 a 23:00</span>
            </div>
            <button onClick={() => alert("Control manual de horarios activo. Contáctese con soporte para limitarlo.")} className="mt-4 text-sm text-primary font-semibold hover:underline">Modificar horarios</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceInput({ label, defaultValue }: any) {
  return (
    <div>
      <label className="text-sm font-semibold text-muted-foreground mb-1 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
        <input 
          type="number" 
          defaultValue={defaultValue}
          className="w-full bg-surface-elevated border border-border/50 rounded-xl py-2 pl-8 pr-4 text-foreground font-bold outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-kanit"
        />
      </div>
    </div>
  );
}

function FieldItem({ name, type, isPremium = false }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border group hover:border-border/80 transition-colors">
      <div>
        <h4 className="font-bold text-sm flex items-center gap-2">
          {name}
          {isPremium && <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent/20 text-accent font-bold uppercase">Premium</span>}
        </h4>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
      <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}

/* =========================================
   NEW BOOKING MODAL
========================================= */
function NewBookingModal({ onClose, fields, selectedSlot, onBooked }: any) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    fieldId: selectedSlot?.fieldId || (fields[0]?.id || ''),
    time: selectedSlot?.time || '18:00',
    date: selectedSlot?.date || new Date().toISOString().split('T')[0],
    paid: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fieldId) {
       alert("No tienes canchas disponibles o no seleccionaste una.");
       return;
    }

    setLoading(true);
    const selectedFieldObj = fields.find((f: any) => f.id === formData.fieldId);
    if (!selectedFieldObj) {
        setLoading(false);
        return;
    }
    const price = selectedFieldObj.price_per_match || 15000;
    
    // Calculate end time (assuming 1 hour matches)
    const [hours, minutes] = formData.time.split(':');
    const endHours = parseInt(hours) + 1;
    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes}:00`;
    const startTimeFull = `${formData.time}:00`;

    const { data, error } = await supabase.from('canchas_bookings').insert([{
      field_id: formData.fieldId,
      booker_id: user?.id,
      title: formData.title || 'Reserva Presencial',
      date: formData.date,
      start_time: startTimeFull,
      end_time: endTime,
      total_price: price,
      down_payment_paid: formData.paid ? price : 0,
      status: formData.paid ? 'full_paid' : 'pending' 
    }]).select('*, canchas_fields(name, type)').single();

    if (error) {
      alert("Error al guardar reserva: " + error.message);
    } else {
      onBooked(data);
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card w-full max-w-md p-6 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
           <h3 className="text-2xl font-black font-kanit">Nueva Reserva</h3>
           <button onClick={onClose} className="text-muted-foreground hover:text-foreground">X</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
           <div>
             <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">A Nombre De</label>
             <input type="text" value={formData.title} onChange={e => setFormData(prev => ({...prev, title: e.target.value}))} className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 outline-none" placeholder="Nombre completo o equipo..." required />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Cancha</label>
               <select value={formData.fieldId} onChange={e => setFormData(prev => ({...prev, fieldId: e.target.value}))} className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 outline-none appearance-none">
                 {fields.map((f: any) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.type})</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Hora Inicio</label>
               <select value={formData.time} onChange={e => setFormData(prev => ({...prev, time: e.target.value}))} className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 outline-none appearance-none">
                 {["17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map(t => (
                    <option key={t} value={t}>{t}</option>
                 ))}
               </select>
             </div>
           </div>

           <div className="flex items-center gap-3 pt-2">
             <input type="checkbox" id="paid" checked={formData.paid} onChange={e => setFormData(prev => ({...prev, paid: e.target.checked}))} className="w-5 h-5 accent-primary rounded bg-surface border-border" />
             <label htmlFor="paid" className="text-sm font-semibold select-none">Marcar como cobrado en efectivo</label>
           </div>

           <button type="submit" disabled={loading} className="w-full mt-4 h-12 bg-primary text-black font-black text-sm uppercase tracking-wider rounded-xl hover:bg-white transition-all disabled:opacity-50">
             {loading ? 'Guardando...' : 'Confirmar Turno'}
           </button>
        </form>
      </motion.div>
    </div>
  );
}
