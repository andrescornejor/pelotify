"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Wallet, 
  Settings, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Bell,
  MapPin,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Plus,
  Check,
  Zap,
  Trash2,
  ChevronLeft,
  Shield,
  ExternalLink,
  Info,
  LogOut
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CanchasDashboard() {
  const { user, logout } = useAuth();
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
  
  const onNewBooking = () => setShowBookingModal(true);

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
    { id: 'settings', label: 'Ajustes', icon: Settings },
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
      <header className="fixed top-0 w-full z-40 glass border-b border-border/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark flex items-center justify-center glow-primary rotate-3 transition-transform hover:rotate-0 cursor-pointer">
              <MapPin className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-kanit tracking-tighter italic uppercase text-foreground">
                  {business?.name || "Pelotify Business"}
                </h1>
                <div className="px-2 py-0.5 rounded-md bg-primary/20 border border-primary/30 hidden sm:block">
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest">PRO PLAN</span>
                </div>
                {business?.id && (
                  <button 
                    onClick={() => window.open(`/establecimientos/${business.id}`, '_blank')}
                    className="p-1.5 rounded-lg bg-foreground/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all flex items-center gap-1.5 px-2"
                  >
                     <ExternalLink className="w-3 h-3" />
                     <span className="text-[8px] font-black uppercase tracking-widest">Perfil Público</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-black uppercase tracking-widest mt-0.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(44,252,125,0.6)]"></span>
                Establecimiento Verificado
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-foreground/[0.03] border border-white/5 relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
               <div className="text-right relative z-10">
                  <div className="flex items-center gap-1 justify-end">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(44,252,125,0.8)]"></span>
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Tu Balance</p>
                  </div>
                  <p className="text-sm font-black text-foreground italic font-kanit leading-none mt-1">${new Intl.NumberFormat('es-AR').format(stats.monthIncome)}</p>
               </div>
               <div className="w-px h-6 bg-white/10 mx-2 relative z-10"></div>
               <button onClick={onNewBooking} className="p-2 rounded-xl bg-primary text-black hover:scale-110 transition-transform shadow-lg shadow-primary/20 relative z-10">
                  <Plus className="w-4 h-4" />
               </button>
            </div>

            <button className="relative p-3 rounded-xl bg-surface-elevated border border-white/5 hover:bg-surface-bright transition-all group" onClick={() => alert("Soporte Técnico pronto estará disponible por WhatsApp.")}>
               <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
               <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent border-2 border-background animate-bounce shadow-[0_0_8px_rgba(255,107,107,0.5)]"></div>
            </button>

            <button onClick={async () => { await logout(); router.push('/canchas/login'); }} className="relative p-3 rounded-xl bg-surface-elevated border border-white/5 hover:bg-danger/10 hover:border-danger/30 transition-all group" title="Cerrar Sesión">
               <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-danger transition-colors" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-border/50">
              <div className="hidden sm:block text-right">
                 <p className="text-[10px] font-black text-foreground uppercase tracking-tighter leading-none">{user?.user_metadata?.full_name || 'Administrador'}</p>
                 <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">Owner</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-surface-elevated overflow-hidden border-2 border-primary/20 shadow-xl p-0.5">
                <img src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=2cfc7d&color=000`} alt="Admin" className="w-full h-full object-cover rounded-xl" />
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
              {activeTab === 'settings' && <SettingsTab business={business} fields={fields} setFields={setFields} hasMP={hasMP} setBusiness={setBusiness} />}
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
   OVERVIEW TAB — Simplified
========================================= */
function OverviewTab({ business, bookings, fields, onNewBooking, onBookingClick, onTabChange }: any) {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b: any) => b.date === today && b.status !== 'cancelled');
  const todayIncome = todayBookings.reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0);
  const pendingCount = todayBookings.filter((b: any) => b.status === 'pending').length;
  const occupancy = fields.length > 0 ? Math.round((todayBookings.length / (16 * fields.length)) * 100) : 0;

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Impago';
      case 'partial_paid': return 'Señado';
      case 'full_paid': return 'Pagado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-reveal-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-kanit italic uppercase tracking-tighter">
            Hoy en <span className="text-primary">{business?.name || "tu sede"}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={onNewBooking} className="bg-primary text-black font-bold text-sm py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-primary-light transition-all shadow-lg shadow-primary/20 press-effect">
          <Plus className="w-4 h-4" /> Nueva Reserva
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10"><DollarSign className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Ingresos Hoy</p>
            <p className="text-lg font-black font-kanit tracking-tight">{formatMoney(todayIncome)}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10"><CalendarDays className="w-5 h-5 text-accent" /></div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Turnos Hoy</p>
            <p className="text-lg font-black font-kanit tracking-tight">{todayBookings.length}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-danger/10"><Clock className="w-5 h-5 text-danger" /></div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Impagos</p>
            <p className="text-lg font-black font-kanit tracking-tight">{pendingCount}</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10"><TrendingUp className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Ocupación</p>
            <p className="text-lg font-black font-kanit tracking-tight">{occupancy}%</p>
          </div>
        </div>
      </div>

      {/* Today's Bookings List */}
      <div className="glass-premium rounded-2xl p-6 border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-black font-kanit uppercase tracking-tight">Turnos del día</h3>
          <button onClick={() => onTabChange('calendar')} className="text-xs text-primary font-bold hover:underline">
            Ver semana →
          </button>
        </div>

        {todayBookings.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No hay turnos para hoy
          </div>
        ) : (
          <div className="space-y-2">
            {todayBookings.map((booking: any) => (
              <UpcomingMatch
                key={booking.id}
                time={booking.start_time.substring(0, 5)}
                field={booking.canchas_fields?.name || 'Cancha'}
                team={booking.title || 'Reserva'}
                status={getStatusLabel(booking.status)}
                price={formatMoney(booking.total_price)}
                isPending={booking.status === 'pending'}
                isApp={!!booking.match_id}
                onClick={() => onBookingClick?.(booking)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => onTabChange('calendar')} className="glass-card p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-all press-effect">
          <CalendarDays className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Agenda</span>
        </button>
        <button onClick={() => onTabChange('finances')} className="glass-card p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-all press-effect">
          <Wallet className="w-5 h-5 text-accent" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Finanzas</span>
        </button>
        <button onClick={() => onTabChange('settings')} className="glass-card p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-all press-effect">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Ajustes</span>
        </button>
      </div>
    </div>
  );
}


function UpcomingMatch({ time, field, team, status, price, isPending = false, isApp = false, onClick }: any) {
  return (
    <div onClick={onClick} className="cursor-pointer flex items-center justify-between p-4 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
      {isApp && (
        <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_10px_rgba(44,252,125,0.6)]"></div>
      )}
      <div className="flex items-center gap-4">
        <div className="text-center w-12 shrink-0">
          <span className="block text-lg font-black font-kanit italic tracking-tighter group-hover:text-primary transition-colors">{time}</span>
        </div>
        <div className="w-px h-10 bg-white/5 hidden sm:block"></div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground">{field}</h4>
            {isApp && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                <Zap className="w-2.5 h-2.5 text-primary" />
                <span className="text-[7px] font-bold text-primary uppercase">APP</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{team}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-sm font-kanit">{price}</p>
        <p className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${
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


/* =========================================
   CALENDAR TAB
========================================= */
function CalendarTab({ bookings, fields, selectedDate, setSelectedDate, onSlotClick, onBookingClick }: any) {
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  const [activeFieldId, setActiveFieldId] = useState<string>(fields[0]?.id || '');
  const [weekOffset, setWeekOffset] = useState(0);

  const getDayNameShort = (dateStr: string) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const d = new Date(dateStr + 'T00:00:00');
    return days[d.getDay()];
  };

  const getMonthShort = (dateStr: string) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const d = new Date(dateStr + 'T00:00:00');
    return months[d.getMonth()];
  };

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i + (weekOffset * 7));
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const currentHour = new Date().getHours();
  const todayStr = getTodayStr();

  // Active field object
  const activeField = fields.find((f: any) => f.id === activeFieldId) || fields[0];

  // Week stats for the active field
  const weekBookings = bookings.filter((b: any) =>
    b.field_id === activeFieldId &&
    weekDays.includes(b.date) &&
    b.status !== 'cancelled'
  );
  const weekIncome = weekBookings.reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0);
  const weekPending = weekBookings.filter((b: any) => b.status === 'pending').length;
  const totalWeekSlots = timeSlots.length * 7;
  const weekOccupancy = totalWeekSlots > 0 ? Math.round((weekBookings.length / totalWeekSlots) * 100) : 0;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-danger shadow-[0_0_6px_rgba(244,63,94,0.6)]';
      case 'partial_paid': return 'bg-accent shadow-[0_0_6px_rgba(245,158,11,0.6)]';
      case 'full_paid': return 'bg-primary shadow-[0_0_6px_rgba(44,252,125,0.6)]';
      default: return 'bg-muted-foreground';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-danger/10 border-danger/25 hover:bg-danger/20';
      case 'partial_paid': return 'bg-accent/10 border-accent/25 hover:bg-accent/20';
      case 'full_paid': return 'bg-primary/10 border-primary/25 hover:bg-primary/20';
      default: return 'bg-foreground/5 border-white/10';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Impago';
      case 'partial_paid': return 'Seña';
      case 'full_paid': return 'Pagado';
      default: return status;
    }
  };

  if (fields.length === 0) {
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
    <div className="space-y-5 animate-reveal-up">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black font-kanit italic uppercase tracking-tighter text-foreground">
            Gestión <span className="text-primary">Turnos</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Vista Semanal</p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-2.5 rounded-xl bg-surface-elevated border border-white/5 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all press-effect"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all press-effect ${
              weekOffset === 0
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-surface-elevated border border-white/5 text-muted-foreground hover:text-foreground hover:border-primary/30'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-2.5 rounded-xl bg-surface-elevated border border-white/5 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all press-effect"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">
            {weekDays[0].split('-')[2]} {getMonthShort(weekDays[0])} — {weekDays[6].split('-')[2]} {getMonthShort(weekDays[6])}
          </span>
        </div>
      </div>

      {/* ── FIELD TABS ── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {fields.map((f: any) => (
          <button
            key={f.id}
            onClick={() => setActiveFieldId(f.id)}
            className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all press-effect ${
              activeFieldId === f.id
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-surface-elevated border border-white/5 text-muted-foreground hover:text-foreground hover:border-primary/20'
            }`}
          >
            {f.name}
            <span className="ml-1.5 opacity-60">{f.type}</span>
          </button>
        ))}
      </div>

      {/* ── WEEK STATS ── */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/5">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Turnos</span>
          <span className="text-sm font-black font-kanit italic text-foreground">{weekBookings.length}</span>
        </div>
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/5">
          <DollarSign className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ingresos</span>
          <span className="text-sm font-black font-kanit italic text-foreground">{formatMoney(weekIncome)}</span>
        </div>
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/5">
          <Clock className="w-4 h-4 text-danger" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Impagos</span>
          <span className="text-sm font-black font-kanit italic text-foreground">{weekPending}</span>
        </div>
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/5">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ocupación</span>
          <span className="text-sm font-black font-kanit italic text-foreground">{weekOccupancy}%</span>
        </div>
      </div>

      {/* ── LEGEND ── */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_rgba(44,252,125,0.5)]"></div>
          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Pagado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Señado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-danger shadow-[0_0_5px_rgba(244,63,94,0.5)]"></div>
          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Impago</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-foreground/10 border border-white/20"></div>
          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Libre</span>
        </div>
      </div>

      {/* ── WEEKLY GRID ── */}
      <div className="rounded-[2rem] border border-white/10 overflow-hidden shadow-xl bg-surface-elevated/50">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[700px]">
            {/* Column headers: days */}
            <div className="grid border-b border-white/15 bg-foreground/[0.05]" style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}>
              <div className="p-3 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
              </div>
              {weekDays.map(date => {
                const isToday = date === todayStr;
                return (
                  <div
                    key={date}
                    className={`p-3 text-center border-l border-white/10 transition-colors ${isToday ? 'bg-primary/[0.08]' : ''}`}
                  >
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      {getDayNameShort(date)}
                    </p>
                    <p className={`text-base font-black font-kanit italic leading-none mt-0.5 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {date.split('-')[2]}
                    </p>
                    {isToday && (
                      <div className="w-1 h-1 rounded-full bg-primary mx-auto mt-1 animate-pulse shadow-[0_0_6px_rgba(44,252,125,0.8)]"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Rows: time slots */}
            <div className="divide-y divide-white/10">
              {timeSlots.map(time => {
                const hour = parseInt(time.split(':')[0]);
                const isCurrentHour = weekOffset === 0 && hour === currentHour;
                const isPastHour = weekOffset === 0 && weekDays[0] === todayStr && hour < currentHour;

                return (
                  <div
                    key={time}
                    className={`grid transition-colors ${isCurrentHour ? 'bg-primary/[0.06]' : hour % 2 === 0 ? 'bg-foreground/[0.02]' : ''} hover:bg-foreground/[0.04]`}
                    style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}
                  >
                    {/* Hour label */}
                    <div className={`p-2 flex items-center justify-center border-r border-white/10 relative ${
                      isCurrentHour ? 'bg-primary/[0.05]' : ''
                    }`}>
                      {isCurrentHour && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r shadow-[0_0_8px_rgba(44,252,125,0.6)]"></div>
                      )}
                      <span className={`text-xs font-black font-kanit italic ${isCurrentHour ? 'text-primary' : 'text-muted-foreground'}`}>
                        {time}
                      </span>
                    </div>

                    {/* Day cells */}
                    {weekDays.map(date => {
                      const isToday = date === todayStr;
                      const isCellPast = isToday && hour < currentHour && weekOffset === 0;

                      const booking = bookings.find((b: any) =>
                        b.field_id === activeFieldId &&
                        b.date === date &&
                        b.start_time.startsWith(time) &&
                        b.status !== 'cancelled'
                      );

                      return (
                        <div
                          key={date}
                          className={`border-l border-white/10 p-1.5 min-h-[56px] flex items-center justify-center ${
                            isToday && weekOffset === 0 ? 'bg-primary/[0.04]' : ''
                          } ${isCellPast ? 'opacity-30' : ''}`}
                        >
                          {booking ? (
                            <button
                              onClick={() => onBookingClick(booking)}
                              className={`w-full h-full min-h-[42px] rounded-lg border ${getStatusBg(booking.status)} transition-all press-effect flex flex-col items-center justify-center gap-0.5 relative group`}
                            >
                              <div className={`w-2 h-2 rounded-full ${getStatusDot(booking.status)} shrink-0`}></div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-foreground/70 truncate max-w-full px-1 leading-tight">
                                {booking.title ? (booking.title.length > 8 ? booking.title.substring(0, 8) + '..' : booking.title) : 'Reserva'}
                              </span>
                              {booking.match_id && <Zap className="w-2.5 h-2.5 text-primary absolute top-1 right-1" />}

                              {/* Tooltip on hover */}
                              <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block pointer-events-none">
                                <div className="bg-background border border-white/10 rounded-xl p-3 shadow-2xl min-w-[160px] text-left">
                                  <p className="text-[10px] font-black uppercase tracking-tighter text-foreground truncate">{booking.title || 'Reserva Directa'}</p>
                                  <p className="text-[9px] text-muted-foreground mt-0.5">{booking.start_time.substring(0,5)} — {booking.end_time.substring(0,5)}</p>
                                  <div className="flex items-center justify-between mt-1.5">
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${
                                      booking.status === 'pending' ? 'text-danger' : booking.status === 'partial_paid' ? 'text-accent' : 'text-primary'
                                    }`}>{getStatusLabel(booking.status)}</span>
                                    <span className="text-[9px] font-black font-kanit italic text-foreground">{formatMoney(booking.total_price)}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedDate(date);
                                onSlotClick(time, activeFieldId);
                              }}
                              className="w-full h-full min-h-[44px] rounded-lg border border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/[0.06] transition-all group flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3 text-transparent group-hover:text-primary transition-colors" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
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
    <div className="space-y-8 animate-reveal-up">
       <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black font-kanit italic uppercase tracking-tighter text-foreground">
            Bóveda <span className="text-primary">Financiera</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Flujo de Caja & Liquidaciones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Balance */}
          <div className="lg:col-span-2 glass-premium rounded-[3rem] p-10 border-white/5 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-10 group-hover:bg-primary/20 transition-colors"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4">Balance Proyectado (30d)</p>
                <div className="flex items-baseline gap-2">
                   <h1 className="text-6xl sm:text-7xl font-kanit font-black italic tracking-tighter text-foreground leading-none">
                     <span className="text-primary">$</span>{new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(totalIncome)}
                   </h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-12">
                <button disabled className="flex-1 bg-surface-elevated text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4 px-6 rounded-2xl flex justify-center items-center gap-2 border border-white/5 opacity-50 cursor-not-allowed">
                  Retirar Fondos <ArrowUpRight className="w-5 h-5" />
                </button>
                <button className="flex-1 bg-primary text-black font-black uppercase text-[10px] tracking-widest py-4 px-6 rounded-2xl flex justify-center items-center gap-2 hover:bg-primary-light transition-all shadow-lg shadow-primary/20">
                  Descargar Reporte <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
             <div className="glass-premium rounded-[2.5rem] p-8 border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Comisión Plataforma</p>
                   <h3 className="text-3xl font-black italic font-kanit">5.0<span className="text-primary">%</span></h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl">
                   <Shield className="w-7 h-7 text-primary" />
                </div>
             </div>
             
             <div className="glass-premium rounded-[2.5rem] p-8 border-white/5 group hover:border-[#009EE3]/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pasarela de Pago</p>
                      <h3 className={`text-2xl font-black italic font-kanit ${hasMP ? 'text-[#009EE3]' : 'text-danger'}`}>
                        {hasMP ? 'MERCADO PAGO' : 'SIN VINCULAR'}
                      </h3>
                   </div>
                   <div className="w-12 h-12 rounded-xl bg-[#009EE3]/10 border border-[#009EE3]/20 flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                      <DollarSign className="w-6 h-6 text-[#009EE3]" />
                   </div>
                </div>
                
                {hasMP ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#009EE3]/10 border border-[#009EE3]/20 w-fit">
                     <Check className="w-3.5 h-3.5 text-[#009EE3]" />
                     <span className="text-[9px] font-black text-[#009EE3] uppercase tracking-widest">Cuenta Vinculada</span>
                  </div>
                ) : (
                  <button onClick={() => window.location.href = `/api/mercadopago/authorize?userId=${user?.id}`} className="w-full bg-[#009EE3] text-white font-black uppercase text-[10px] tracking-widest py-3.5 rounded-xl hover:bg-[#009EE3]/80 transition-all shadow-lg shadow-[#009EE3]/20">
                    CONECTAR CUENTA
                  </button>
                )}
             </div>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="glass-premium rounded-[2.5rem] p-10 border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black font-kanit italic uppercase tracking-tighter">Historial de Cobros</h3>
            <div className="p-1 px-2 bg-foreground/5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest">Últimos 30 días</div>
          </div>
          <div className="space-y-2">
            {bookings.filter((b:any) => b.status === 'full_paid' || b.status === 'partial_paid').slice(0, 8).map((booking: any, i: number) => (
              <div key={`tx-${i}`} className="flex items-center justify-between p-5 rounded-2xl hover:bg-foreground/[0.03] transition-all border border-transparent hover:border-white/5 group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${booking.match_id ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-surface-elevated text-muted-foreground border border-white/10'}`}>
                    {booking.match_id ? <Zap className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tighter group-hover:text-primary transition-colors">{booking.title || 'Reserva Acreditada'}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic mt-1">{booking.date} • {booking.status === 'partial_paid' ? 'Seña acreditada' : 'Pago Total'}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black italic font-kanit text-primary">+{new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(booking.down_payment_paid || booking.total_price)}</p>
                   <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Neto Acreditado</p>
                </div>
              </div>
            ))}
            {bookings.filter((b:any) => b.status === 'full_paid' || b.status === 'partial_paid').length === 0 && (
               <div className="flex flex-col items-center justify-center py-20 bg-surface-elevated/30 rounded-[2rem] border border-dashed border-white/10">
                 <Wallet className="w-12 h-12 text-muted-foreground/30 mb-4" />
                 <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Esperando primer cobro...</p>
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
const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529900948638-19f94ff446a1?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop"
];


function SettingsTab({ business, fields, setFields, hasMP, setBusiness }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deposit, setDeposit] = useState(fields?.[0]?.down_payment_percentage || 30);
  const [depositMode, setDepositMode] = useState<'percentage' | 'share'>(() => {
    // Detect if it matches any standard share percentage roughly
    const d = fields?.[0]?.down_payment_percentage;
    if (d === 10 || d === 7 || d === 5 || d === 15) return 'share';
    return 'percentage';
  });
  const [aliasCbu, setAliasCbu] = useState(business?.alias_cbu || '');
  const [description, setDescription] = useState(business?.description || '');
  const [address, setAddress] = useState(business?.address || '');
  const [city, setCity] = useState(business?.city || '');
  const [businessName, setBusinessName] = useState(business?.name || '');
  const [phone, setPhone] = useState(business?.phone || '');
  const [profileImageUrl, setProfileImageUrl] = useState(business?.profile_image_url || '');
  const [amenities, setAmenities] = useState<string[]>(business?.amenities || []);
  const [coords, setCoords] = useState({ 
    link: business?.google_maps_link || ''
  });
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
          name: businessName.trim(),
          phone: phone.trim(),
          profile_image_url: profileImageUrl.trim(),
          alias_cbu: trimmedAlias, 
          amenities,
          description,
          address,
          city,
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

      // Actualizamos estado local del negocio en el padre
      if (setBusiness) {
        setBusiness(updatedBiz[0]);
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
    <div className="space-y-8 animate-reveal-up pb-20">
       <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black font-kanit italic uppercase tracking-tighter text-foreground">
            Configuración <span className="text-primary">Maestra</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Personalización del Establecimiento</p>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* General Info & Pricing */}
          <div className="xl:col-span-2 space-y-8">
             {/* General Info Card */}
           <div className="glass-premium rounded-[2.5rem] p-10 border-white/5 space-y-8">
              <div className="flex items-center gap-4 mb-2">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Settings className="w-5 h-5 text-primary" />
                 </div>
                 <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter">Perfil del Complejo</h3>
              </div>
 
              <div className="space-y-6">
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nombre del Establecimiento</label>
                   <input 
                     type="text" 
                     value={businessName}
                     onChange={(e) => setBusinessName(e.target.value)}
                     className="w-full bg-foreground/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all font-black"
                   />
                 </div>
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Descripción Pública</label>
                   <textarea 
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     className="w-full bg-foreground/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all min-h-[100px]"
                     placeholder="Contanos sobre tu complejo, servicios, etc..."
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Dirección</label>
                     <input 
                       type="text" 
                       value={address}
                       onChange={(e) => setAddress(e.target.value)}
                       className="w-full bg-foreground/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all"
                     />
                    </div>
                    <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Teléfono de Contacto</label>
                     <input 
                       type="text" 
                       value={phone}
                       onChange={(e) => setPhone(e.target.value)}
                       className="w-full bg-foreground/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all"
                     />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Ciudad</label>
                       <input 
                         type="text" 
                         value={city}
                         onChange={(e) => setCity(e.target.value)}
                         className="w-full bg-foreground/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">Imagen del Complejo</label>
                       <div className="grid grid-cols-4 gap-2 mb-4">
                          {PRESET_IMAGES.map((img, i) => (
                             <button 
                                key={i}
                                onClick={() => setProfileImageUrl(img)}
                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${profileImageUrl === img ? 'border-primary scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                             >
                                <img src={img} className="w-full h-full object-cover" />
                             </button>
                          ))}
                       </div>
                       <input 
                         type="text" 
                         value={profileImageUrl}
                         onChange={(e) => setProfileImageUrl(e.target.value)}
                         placeholder="O pega una URL custom..."
                         className="w-full bg-foreground/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all font-mono text-[10px]"
                       />
                    </div>
                 </div>
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">Servicios y Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                       {['Luces LED', 'Seguridad 24hs', 'Vestuarios', 'Estacionamiento', 'Bar / Buffet', 'WiFi', 'Techada', 'Parrillas'].map(item => {
                          const isSelected = amenities.includes(item);
                          return (
                             <button 
                                key={item}
                                onClick={() => {
                                   if(isSelected) setAmenities(amenities.filter(a => a !== item));
                                   else setAmenities([...amenities, item]);
                                }}
                                className={`p-4 rounded-2xl border transition-all text-left group ${isSelected ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'bg-foreground/[0.03] border-white/5 hover:border-white/20'}`}
                             >
                                <div className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{item}</div>
                             </button>
                          );
                       })}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Google Maps Link</label>
                   <input 
                     type="text" 
                     value={coords.link}
                     onChange={(e) => setCoords({...coords, link: e.target.value})}
                     placeholder="https://goo.gl/maps/..."
                     className="w-full bg-foreground/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all"
                   />
                 </div>
              </div>
           </div>

          {/* Pricing & Payments */}
          <div className="glass-premium rounded-[2.5rem] p-10 border-white/5 space-y-8">
             <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                   <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter">Pagos y Señas</h3>
             </div>

             <div className="space-y-6">
                 <div className="p-8 rounded-[2.5rem] bg-surface-elevated/50 border border-white/5 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lógica de la Seña</label>
                       <div className="flex gap-2 bg-background/50 p-1 rounded-xl border border-white/5">
                          <button 
                            onClick={() => setDepositMode('share')}
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${depositMode === 'share' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                             Una Parte (1/N)
                          </button>
                          <button 
                            onClick={() => setDepositMode('percentage')}
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${depositMode === 'percentage' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                             Porcentaje Fijo
                          </button>
                       </div>
                    </div>

                    {depositMode === 'share' ? (
                       <div className="grid grid-cols-3 gap-3">
                          {[
                             { label: 'Fútbol 5', value: 10, desc: '10% del total' },
                             { label: 'Fútbol 7', value: 7, desc: '7% aprox.' },
                             { label: 'Fútbol 11', value: 5, desc: '5% aprox.' }
                          ].map(opt => (
                             <button 
                                key={opt.value}
                                onClick={() => setDeposit(opt.value)}
                                className={`p-4 rounded-2xl border transition-all text-center ${deposit === opt.value ? 'bg-primary/10 border-primary' : 'bg-background/40 border-white/5 hover:border-white/10'}`}
                             >
                                <p className={`text-[10px] font-black uppercase tracking-tighter ${deposit === opt.value ? 'text-primary' : 'text-foreground'}`}>{opt.label}</p>
                                <p className="text-[10px] font-bold text-muted-foreground mt-1">{opt.desc}</p>
                             </button>
                          ))}
                       </div>
                    ) : (
                       <div className="space-y-4">
                          <div className="flex justify-between items-center px-1">
                             <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Monto Personalizado</label>
                             </div>
                             <span className="text-2xl font-black italic font-kanit text-primary">{deposit}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" step="5"
                            value={deposit}
                            onChange={(e) => setDeposit(Number(e.target.value))}
                            className="w-full accent-primary h-2 bg-foreground/10 rounded-full"
                          />
                       </div>
                    )}

                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                       <p className="text-[9px] font-bold text-primary/80 uppercase tracking-widest leading-relaxed italic">
                          💡 REGLA DE NEGOCIO: El creador del partido pagará este monto para reservar. 
                          {depositMode === 'share' ? ' Al elegir una parte, el creador paga exactamente lo mismo que el resto de los jugadores.' : ' Al elegir porcentaje, el creador puede pagar más o menos que su cuota individual.'}
                       </p>
                    </div>
                 </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">Precios por Cancha (1 Hora)</label>
                   <div className="space-y-3">
                      {fields.map((f: any) => (
                        <div key={f.id} className="flex items-center justify-between p-4 rounded-2xl bg-foreground/[0.03] border border-white/5">
                           <span className="text-xs font-black uppercase tracking-tighter">{f.name}</span>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-muted-foreground">$</span>
                              <input 
                                type="number" 
                                value={fieldPrices[f.id] || 0}
                                onChange={(e) => setFieldPrices({...fieldPrices, [f.id]: Number(e.target.value)})}
                                className="w-24 bg-transparent text-right font-black italic font-kanit text-lg outline-none"
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Alias / CBU para Transferencia</label>
                   <input 
                     type="text" 
                     value={aliasCbu}
                     onChange={(e) => setAliasCbu(e.target.value)}
                     placeholder="complejo.ejemplo.mp"
                     className="w-full bg-foreground/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all font-mono"
                   />
                </div>
             </div>

             <button 
                onClick={handleSavePrices} 
                className="w-full bg-primary text-black font-black uppercase text-xs tracking-widest py-5 rounded-2xl hover:bg-primary-light transition-all shadow-[0_10px_30_rgba(44,252,125,0.3)] press-effect mt-4"
                disabled={isSavingPrices}
             >
                {isSavingPrices ? 'Guardando...' : 'Guardar Todo'}
             </button>
          </div>
           </div>

          {/* Preview Card */}
          <div className="hidden xl:block space-y-6">
             <div className="sticky top-10">
                <div className="flex flex-col gap-1 mb-6">
                   <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter">Vista <span className="text-primary">Previa</span></h3>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Así te ven los pibes</p>
                </div>
                
                <div className="glass-premium rounded-[3rem] overflow-hidden border-white/5 shadow-2xl group">
                   <div className="h-48 relative">
                      <img src={profileImageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop"} className="w-full h-full object-cover brightness-[0.4] contrast-125" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                      <div className="absolute bottom-4 left-6">
                         <h4 className="text-2xl font-black italic uppercase text-white tracking-tighter">{businessName || "Tu Complejo"}</h4>
                         <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 text-primary" />
                            <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">{address || "Rosario, Argentina"}</span>
                         </div>
                      </div>
                   </div>
                   <div className="p-8 space-y-6 bg-surface-elevated/30">
                      <div className="space-y-2">
                         <p className="text-[9px] font-black uppercase tracking-widest text-primary">Sobre nosotros</p>
                         <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3 italic">
                            {description || "Contanos un poco sobre tu sede para atraer a más jugadores..."}
                         </p>
                      </div>
                      <div className="flex gap-2">
                         {(Array.from(new Set(fields.map((f: any) => f.type))) as string[]).map(type => (
                            <div key={type} className="px-4 h-12 rounded-xl bg-foreground/5 border border-white/5 flex items-center justify-center font-black italic font-kanit text-[10px] text-primary/40">
                               {type}
                            </div>
                         ))}
                      </div>
                      <div className="h-0.5 w-full bg-white/5" />
                      <button className="w-full py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95">
                         RESERVAR AHORA
                      </button>
                   </div>
                </div>
                
                <div className="mt-8 p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                   <Info className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                   <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest leading-relaxed">
                      Recordá usar imágenes de alta calidad para destacar entre los complejos.
                   </p>
                </div>
             </div>
          </div>
       </div>

       {/* Managed Fields List */}
       <div className="glass-premium rounded-[2.5rem] p-10 border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black font-kanit italic uppercase tracking-tighter">Inventario de Canchas</h3>
            <button onClick={handleCreateField} className="p-3 rounded-2xl bg-primary text-black hover:bg-primary-light transition-all shadow-lg shadow-primary/20">
               <Plus className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {fields.map((f: any) => (
               <div key={f.id} className="p-6 rounded-3xl bg-surface-elevated/30 border border-white/5 hover:border-primary/30 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 rounded-xl bg-background border border-white/10 group-hover:bg-primary/10 transition-colors">
                        <MapPin className="w-6 h-6 text-primary" />
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1 rounded bg-foreground/5">{f.type}</span>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tighter mb-1">{f.name}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Activa • {f.is_active ? 'Visible' : 'Oculta'}</p>
                  
                  <div className="mt-8 flex gap-3">
                     <button className="flex-1 py-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-[9px] font-black uppercase tracking-widest transition-all">Editar Horarios</button>
                     <button className="p-3 rounded-xl bg-danger/10 text-danger hover:bg-danger transition-all hover:text-white">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
             ))}
          </div>
       </div>
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
