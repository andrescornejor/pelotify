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
  Plus,
  Check
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
  const [selectedSlot, setSelectedSlot] = useState<{time: string, fieldId: string} | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  // Calendar Date
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasMP, setHasMP] = useState<boolean>(false);
  
  // Stats state
  const [stats, setStats] = useState({
    todayIncome: 0,
    monthIncome: 0,
    totalBookings: 0,
    activeFields: 0
  });

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

          // 3. Fetch Bookings (Range from 7 days ago to 30 days ahead)
          const start = new Date();
          start.setDate(start.getDate() - 7);
          const end = new Date();
          end.setDate(end.getDate() + 30);

          const { data: bkData, error: bkError } = await supabase
            .from('canchas_bookings')
            .select('*, canchas_fields(name, type)')
            .in('field_id', fData?.map(f => f.id) || [])
            .gte('date', start.toISOString().split('T')[0])
            .lte('date', end.toISOString().split('T')[0])
            .order('date', { ascending: true })
            .order('start_time', { ascending: true });

          if (!bkError && bkData) setBookings(bkData);

          // Calculate stats
          const today = new Date().toISOString().split('T')[0];
          const tIncome = bkData?.filter((b: any) => b.date === today && b.status !== 'cancelled')
            .reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0) || 0;
          
          setStats({
            todayIncome: tIncome,
            monthIncome: bkData?.filter((b: any) => b.status === 'full_paid' || b.status === 'partial_paid')
              .reduce((acc: number, curr: any) => acc + (curr.down_payment_paid || 0), 0) || 0,
            totalBookings: bkData?.length || 0,
            activeFields: fData?.filter(f => f.is_active).length || 0
          });
        }

        // 4. Determinar si se ha vinculado MP via negocio o dueño
        if (bData?.mp_access_token) {
          setHasMP(true);
        } else {
          const { data: profileObj } = await supabase.from('profiles').select('mp_access_token').eq('id', user.id).single();
          setHasMP(!!profileObj?.mp_access_token);
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
              {activeTab === 'overview' && <OverviewTab business={business} bookings={bookings} fields={fields} onNewBooking={() => setShowBookingModal(true)} onBookingClick={(booking: any) => { setSelectedBooking(booking); setShowEditBookingModal(true); }} onTabChange={setActiveTab} />}
              {activeTab === 'calendar' && <CalendarTab bookings={bookings} fields={fields} selectedDate={selectedDate} setSelectedDate={setSelectedDate} onSlotClick={(time: string, fieldId: string) => { setSelectedSlot({time, fieldId}); setShowBookingModal(true); }} onBookingClick={(booking: any) => { setSelectedBooking(booking); setShowEditBookingModal(true); }} />}
              {activeTab === 'finances' && <FinancesTab business={business} bookings={bookings} hasMP={hasMP} user={user} />}
              {activeTab === 'settings' && <SettingsTab business={business} fields={fields} setFields={setFields} hasMP={hasMP} />}
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
            onBooked={(newBooking: any) => setBookings(prev => [...prev, newBooking])}
            selectedDate={selectedDate}
          />
        )}
        {showEditBookingModal && selectedBooking && (
          <EditBookingModal 
             booking={selectedBooking}
             onClose={() => { setShowEditBookingModal(false); setSelectedBooking(null); }}
             onUpdate={(updated: any) => setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))}
             onDelete={(id: string) => setBookings(prev => prev.filter(b => b.id !== id))}
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
function OverviewTab({ business, bookings, fields, onNewBooking, onBookingClick, onTabChange }: any) {
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
          title="Reservas Totales" 
          value={bookings.length.toString()} 
          trend="Próximos 30 días" 
          trendUp={true} 
          color="accent"
        />
        <StatCard 
          icon={Activity} 
          title="Canchas Activas" 
          value={fields.filter((f: any) => f.is_active).length.toString()} 
          trend="Operativas" 
          trendUp={true} 
          color="success"
        />
        <StatCard 
          icon={Wallet} 
          title="Cobrado Online" 
          value={formatMoney(bookings.filter((b: any) => b.status === 'full_paid' || b.status === 'partial_paid').reduce((acc: number, curr: any) => acc + (curr.down_payment_paid || 0), 0))} 
          trend="Acumulado" 
          trendUp={true} 
          color="primary"
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
                  onClick={() => onBookingClick?.(booking)}
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
               <QuickAction icon={CalendarDays} label="Ver Agenda" onClick={() => onTabChange('calendar')} />
               <QuickAction icon={Wallet} label="Ver Finanzas" onClick={() => onTabChange('finances')} />
               <QuickAction icon={Users} label="Clientes" onClick={() => alert("Panel de CRM para clientes estará disponible en futuras actualizaciones.")} />
               <QuickAction icon={Settings} label="Editar Canchas" onClick={() => onTabChange('settings')} />
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

function UpcomingMatch({ time, field, team, status, price, isPending = false, onClick }: any) {
  return (
    <div onClick={onClick} className="cursor-pointer flex items-center justify-between p-3 sm:p-4 rounded-xl bg-surface-elevated/50 hover:bg-surface-elevated border border-border/50 transition-colors group">
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
function CalendarTab({ bookings, fields, selectedDate, setSelectedDate, onSlotClick, onBookingClick }: any) {
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  const displayFields = fields;

  const getDayName = (dateStr: string) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const d = new Date(dateStr + 'T00:00:00');
    return days[d.getDay()];
  };

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = -2; i < 5; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const handleDateChange = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
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
        <div className="flex flex-col gap-4">
          <div className="flex bg-surface-elevated p-1 rounded-xl border border-border gap-1 overflow-x-auto no-scrollbar">
             {getWeekDays().map(date => (
               <button 
                 key={date}
                 onClick={() => setSelectedDate(date)} 
                 className={`flex-1 min-w-[70px] py-2 px-1 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                   selectedDate === date 
                    ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20 scale-[1.02]' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-bright'
                 }`}
               >
                 <span className="text-[10px] uppercase opacity-70">{getDayName(date)}</span>
                 <span className="text-sm font-kanit">{date.split('-')[2]}</span>
               </button>
             ))}
             <div className="relative min-w-[50px] flex items-center justify-center border-l border-border/50 ml-1 pl-1">
               <input 
                 type="date" 
                 value={selectedDate} 
                 onChange={(e) => setSelectedDate(e.target.value)} 
                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
               />
               <CalendarDays className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors"/>
             </div>
          </div>
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
                          <div onClick={() => onBookingClick(booking)} className={`cursor-pointer h-full w-full rounded-lg p-2 text-xs flex flex-col justify-center border hover:brightness-110 transition-all ${
                            booking.status === 'pending' ? 'bg-danger/10 border-danger/30 text-danger' :
                            booking.status === 'partial_paid' ? 'bg-accent/10 border-accent/30 text-accent' :
                            'bg-primary/10 border-primary/30 text-primary'
                          }`}>
                            <span className="font-bold">{booking.status === 'pending' ? 'Impago' : booking.status === 'partial_paid' ? 'Señado' : 'Pagado'}</span>
                            <span className="text-muted-foreground truncate">{booking.title || 'Reserva'} - ${booking.total_price}</span>
                            {booking.match_id && <span className="text-primary text-[9px] uppercase font-bold mt-1 tracking-widest bg-primary/20 px-1 py-0.5 rounded w-max">App</span>}
                          </div>
                        ) : (
                          <button onClick={() => onSlotClick(time, f.id)} className="h-full w-full min-h-[60px] rounded-lg border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors text-xs opacity-0 hover:opacity-100">
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
function FinancesTab({ business, bookings, hasMP, user }: any) {
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
              <button disabled className="flex-1 bg-surface-bright/50 text-muted-foreground font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 cursor-not-allowed">
                Retirar (Próximamente) <ArrowUpRight className="w-5 h-5 opacity-50" />
              </button>
            </div>
          </div>

          <div className="md:col-span-1 flex flex-col gap-4">
             <div className="glass-card p-5 flex items-center justify-between group cursor-default">
                <div>
                   <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Canchas</p>
                   <h3 className="text-2xl font-black">{business.total_fields || 0}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border/50 flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                   <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>
             </div>
             <div className="glass-card p-5 flex items-center justify-between group cursor-default h-full">
                <div>
                   <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Mercado Pago</p>
                   {hasMP ? (
                      <h3 className="text-2xl font-black text-[#009EE3]">VINCULADA</h3>
                   ) : (
                      <button onClick={() => window.location.href = `/api/mercadopago/authorize?userId=${user?.id}`} className="mt-1 bg-[#009EE3]/10 text-[#009EE3] text-xs px-3 py-1.5 rounded-lg border border-[#009EE3]/20 hover:bg-[#009EE3]/20 font-bold transition-colors">
                        CONECTAR AHORA
                      </button>
                   )}
                </div>
                {hasMP && (
                  <div className="w-12 h-12 rounded-xl bg-[#009EE3]/10 border border-[#009EE3]/20 flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                     <DollarSign className="w-6 h-6 text-[#009EE3]" />
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold font-kanit text-lg">Últimos Cobros</h3>
            <button className="text-xs font-semibold text-primary px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">Todos (MVP)</button>
          </div>
          <div className="space-y-4">
            {bookings.filter((b:any) => b.status === 'full_paid' || b.status === 'partial_paid').slice(0, 5).map((booking: any, i: number) => (
              <div key={`tx-${i}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-elevated/50 transition-colors border border-border/10 hover:border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${booking.match_id ? 'bg-primary/20 text-primary' : 'bg-surface-bright text-foreground'}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">{booking.title || 'Reserva pagada'}</h4>
                    <p className="text-xs text-muted-foreground">{booking.date} • {booking.start_time.substring(0,5)} • {booking.status === 'partial_paid' ? 'Seña acreditada' : 'Pago Completado'}</p>
                  </div>
                </div>
                <span className="font-bold text-accent">+{new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(booking.down_payment_paid || booking.total_price)}</span>
              </div>
            ))}
            {bookings.filter((b:any) => b.status === 'full_paid' || b.status === 'partial_paid').length === 0 && (
               <div className="text-center py-10 bg-surface/50 rounded-xl border border-dashed border-border/50">
                 <Wallet className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                 <p className="text-muted-foreground text-sm font-semibold">No hay movimientos financieros acreditados.</p>
                 <p className="text-muted-foreground text-xs mt-1">Los pagos de las reservas aparecerán aquí.</p>
               </div>
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
function SettingsTab({ business, fields, setFields, hasMP }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deposit, setDeposit] = useState(fields?.[0]?.down_payment_percentage || 30);
  const [aliasCbu, setAliasCbu] = useState(business?.alias_cbu || '');
  const [description, setDescription] = useState(business?.description || '');
  const [address, setAddress] = useState(business?.address || '');
  const [city, setCity] = useState(business?.city || '');
  const [coords, setCoords] = useState({ 
    lat: business?.latitude || '', 
    lng: business?.longitude || '',
    link: business?.google_maps_link || ''
  });
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  // Estado local para precios de cada cancha
  const [fieldPrices, setFieldPrices] = useState<Record<string, number>>(() => {
    const prices: Record<string, number> = {};
    (fields || []).forEach((f: any) => { prices[f.id] = f.price_per_match || 0; });
    return prices;
  });

  const handleSavePrices = async () => {
    if (!business) return;
    setIsSavingPrices(true);
    try {
      // 1. Actualizar porcentaje de seña y precio de cada cancha
      for (const field of (fields || [])) {
        const price = fieldPrices[field.id] ?? field.price_per_match;
        const { error: fieldErr } = await supabase
          .from('canchas_fields')
          .update({ down_payment_percentage: deposit, price_per_match: price })
          .eq('id', field.id);
        if (fieldErr) {
          alert(`Error actualizando ${field.name}: ${fieldErr.message}`);
          setIsSavingPrices(false);
          return;
        }
      }

      // Guardar el alias_cbu en canchas_businesses
      const trimmedAlias = aliasCbu.trim();
      const { data: updatedBiz, error: aliasError } = await supabase
        .from('canchas_businesses')
        .update({ 
          alias_cbu: trimmedAlias, 
          description,
          address,
          city,
          latitude: coords.lat ? parseFloat(coords.lat.toString()) : null,
          longitude: coords.lng ? parseFloat(coords.lng.toString()) : null,
          google_maps_link: coords.link,
          updated_at: new Date().toISOString() 
        })
        .eq('id', business.id)
        .eq('owner_id', user?.id)
        .select();

      if (aliasError) {
        alert("Error al guardar configuración: " + aliasError.message);
        setIsSavingPrices(false);
        return;
      }

      if (!updatedBiz || updatedBiz.length === 0) {
        alert("⚠️ No se pudo guardar la configuración. Verificá que tu cuenta tenga permisos de administrador sobre este establecimiento.");
        setIsSavingPrices(false);
        return;
      }
        
      // Actualizamos estado local
      setFields((prev: any) => prev.map((f: any) => ({ 
        ...f, 
        down_payment_percentage: deposit,
        price_per_match: fieldPrices[f.id] ?? f.price_per_match 
      })));
      alert("✅ Configuración guardada correctamente.");
    } catch (err: any) {
      alert("Error inesperado: " + err.message);
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
        <p className="text-muted-foreground text-sm">Precios, ubicación y canchas del establecimiento</p>
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
            {(fields || []).length > 0 ? (
              (fields || []).map((field: any) => (
                <div key={field.id}>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">{field.name} ({field.type})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                    <input 
                      type="number" 
                      value={fieldPrices[field.id] ?? field.price_per_match ?? 0}
                      onChange={(e) => setFieldPrices(prev => ({ ...prev, [field.id]: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-surface-elevated border border-border/50 rounded-xl py-2 pl-8 pr-4 text-foreground font-bold outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-kanit"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">No tenés canchas registradas. Crealas abajo.</p>
            )}
            
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
            
            <div className="pt-4 border-t border-border/50">
              <label className="text-sm font-semibold text-muted-foreground mb-4 block">Información del Predio</label>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Descripción / Bio</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del complejo..."
                    className="w-full bg-surface-elevated border border-border/50 rounded-xl py-2 px-4 text-foreground outline-none focus:border-primary/50 transition-all text-sm min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Dirección</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-surface-elevated border border-border/50 rounded-xl py-2 px-4 text-sm outline-none" placeholder="Calle y nro" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Ciudad</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-surface-elevated border border-border/50 rounded-xl py-2 px-4 text-sm outline-none" placeholder="Rosario, etc" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Latitud</label>
                    <input type="text" value={coords.lat} onChange={(e) => setCoords({...coords, lat: e.target.value})} className="w-full bg-surface-elevated border border-border/50 rounded-xl py-2 px-4 text-sm outline-none" placeholder="-34.123" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Longitud</label>
                    <input type="text" value={coords.lng} onChange={(e) => setCoords({...coords, lng: e.target.value})} className="w-full bg-surface-elevated border border-border/50 rounded-xl py-2 px-4 text-sm outline-none" placeholder="-60.456" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Google Maps Link</label>
                  <input type="text" value={coords.link} onChange={(e) => setCoords({...coords, link: e.target.value})} className="w-full bg-surface-elevated border border-border/50 rounded-xl py-2 px-4 text-sm outline-none" placeholder="https://maps.app.goo.gl/..." />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">Alias / CBU para Transferencias</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground"><Wallet className="w-4 h-4"/></span>
                <input 
                  type="text" 
                  value={aliasCbu}
                  onChange={(e) => setAliasCbu(e.target.value)}
                  placeholder="ej. mi.cancha.mp"
                  className="w-full bg-surface-elevated border border-border/50 rounded-xl py-2 pl-10 pr-4 text-foreground font-bold outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-kanit"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Los jugadores verán esta cuenta para pagos manuales.</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border/50">
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">Mercado Pago Connect</label>
              <div className="flex flex-col gap-2">
                 {hasMP ? (
                   <div className="bg-[#009EE3]/10 text-[#009EE3] font-bold py-3 px-4 rounded-xl flex items-center justify-between border border-[#009EE3]/20">
                      <div className="flex items-center gap-2"><DollarSign className="w-5 h-5"/> Cuenta Vinculada Exitosamente</div>
                      <Check className="w-5 h-5" />
                   </div>
                 ) : (
                   <button onClick={() => window.location.href = `/api/mercadopago/authorize?userId=${user?.id}`} className="bg-[#009EE3]/10 text-[#009EE3] hover:bg-[#009EE3]/20 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <DollarSign className="w-5 h-5"/>
                      Vincular Mercado Pago
                   </button>
                 )}
                 <p className="text-xs text-muted-foreground mt-1">Recibe tus pagos online automáticamente. Esta cuenta servirá para todas tus reservas confirmadas con el botón de MP.</p>
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
                  <FieldItem 
                    key={f.id} 
                    id={f.id}
                    name={f.name} 
                    type={`${f.type} - $${f.price_per_match}`} 
                    isPremium={f.type === 'F11'} 
                    onDelete={async (id: string) => {
                      if(!window.confirm("¿Seguro que quieres borrar esta cancha?")) return;
                      const { error } = await supabase.from('canchas_fields').delete().eq('id', id);
                      if(!error) setFields((prev: any) => prev.filter((field: any) => field.id !== id));
                      else alert("Error borrando cancha");
                    }}
                  />
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

function FieldItem({ id, name, type, isPremium = false, onDelete }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border group hover:border-border/80 transition-colors">
      <div>
        <h4 className="font-bold text-sm flex items-center gap-2">
          {name}
          {isPremium && <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent/20 text-accent font-bold uppercase">Premium</span>}
        </h4>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
      <button 
        onClick={() => onDelete(id)}
        className="text-danger hover:bg-danger/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Plus className="w-4 h-4 rotate-45" />
      </button>
    </div>
  );
}

/* =========================================
   NEW BOOKING MODAL
========================================= */
function NewBookingModal({ onClose, fields, selectedSlot, onBooked, selectedDate }: any) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    fieldId: selectedSlot?.fieldId || (fields[0]?.id || ''),
    time: selectedSlot?.time || '18:00',
    date: selectedDate || new Date().toISOString().split('T')[0],
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
                 {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map(t => (
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

/* =========================================
   EDIT BOOKING MODAL
========================================= */
function EditBookingModal({ booking, onClose, onUpdate, onDelete }: any) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(booking.status);
  const [downPayment, setDownPayment] = useState(booking.down_payment_paid || 0);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Si viene desde la app (match_id) y se cancela, ideally cancelamos también en matches o se maneja asíncrono.
    // Para el MVP de canchas actualizamos este booking local:
    
    const { data, error } = await supabase.from('canchas_bookings')
      .update({ status, down_payment_paid: downPayment })
      .eq('id', booking.id)
      .select('*, canchas_fields(name, type)')
      .single();

    if (error) {
      alert("Error al actualizar la reserva: " + error.message);
    } else {
      onUpdate(data);
      onClose();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if(!window.confirm("¿Estás seguro de que quieres eliminar esta reserva permanentemente? Esta acción liberará la cancha para este horario.")) return;
    setLoading(true);
    const { error } = await supabase.from('canchas_bookings').delete().eq('id', booking.id);
    if(error){
       alert("Error al eliminar: " + error.message);
    } else {
       onDelete(booking.id);
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
        <div className="flex justify-between items-center mb-6 relative z-10">
           <div>
             <h3 className="text-2xl font-black font-kanit">Gestionar Reserva</h3>
             <p className="text-xs text-muted-foreground">{booking.title}</p>
           </div>
           <button onClick={onClose} className="text-muted-foreground hover:text-foreground">X</button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 relative z-10">
           <div className="grid grid-cols-2 gap-4 bg-surface-elevated/30 p-4 rounded-xl border border-border/50">
             <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase">Cancha</p>
               <p className="font-semibold text-sm">{booking.canchas_fields?.name}</p>
             </div>
             <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase">Horario</p>
               <p className="font-semibold text-sm">{booking.start_time.substring(0,5)} a {booking.end_time.substring(0,5)}</p>
             </div>
             <div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase">Monto Total</p>
               <p className="font-semibold text-sm text-foreground">${booking.total_price}</p>
             </div>
             <div>
               <p className="text-[10px] font-bold text-primary uppercase">Origen</p>
               <p className="font-semibold text-sm">{booking.match_id ? "App Pelotify 📱" : "Manual 📅"}</p>
             </div>
           </div>

           <div>
             <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Estado de Cobro</label>
             <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 outline-none appearance-none">
               <option value="pending">Impago (Pendiente)</option>
               <option value="partial_paid">Seña Abonada</option>
               <option value="full_paid">Completamente Pagado</option>
             </select>
           </div>

           <div>
             <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Monto Cobrado ($)</label>
             <input type="number" value={downPayment} onChange={e => setDownPayment(parseInt(e.target.value))} className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 outline-none" placeholder="0" />
           </div>

           <div className="flex gap-3 pt-4 border-t border-border/50">
             <button type="button" onClick={handleDelete} disabled={loading} className="px-4 h-12 bg-danger/10 text-danger border border-danger/30 font-bold text-sm rounded-xl hover:bg-danger/20 transition-all disabled:opacity-50">
               Liberar/Borrar
             </button>
             <button type="submit" disabled={loading} className="flex-1 h-12 bg-primary text-black font-black text-sm uppercase tracking-wider rounded-xl hover:bg-white transition-all disabled:opacity-50">
               {loading ? 'Guardando...' : 'Actualizar Reserva'}
             </button>
           </div>
        </form>
      </motion.div>
    </div>
  );
}
