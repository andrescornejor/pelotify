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
  Check,
  Zap,
  Share2,
  Coffee,
  BarChart3,
  QrCode,
  Tag,
  Gamepad2
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
    { id: 'marketing', label: 'Marketing', icon: Zap },
    { id: 'inventory', label: 'Bar / Stock', icon: Coffee },
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
              {activeTab === 'marketing' && <MarketingTab business={business} />}
              {activeTab === 'inventory' && <InventoryTab />}
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
    <div className="space-y-8 animate-reveal-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black font-kanit italic uppercase tracking-tighter text-foreground">
            Sede <span className="text-primary">{business?.name || "Central"}</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Panel de Control & Analytics</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial p-3 rounded-2xl bg-surface-elevated border border-border/50 hover:bg-surface-bright transition-all">
            <Share2 className="w-5 h-5 mx-auto" />
          </button>
          <button onClick={onNewBooking} className="flex-[3] sm:flex-initial bg-primary text-black font-black uppercase text-[11px] tracking-widest py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-light transition-all shadow-[0_10px_30px_rgba(44,252,125,0.3)] press-effect">
            <Plus className="w-5 h-5" />
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          icon={DollarSign} 
          title="Ingresos Hoy" 
          value={formatMoney(todayIncome || 0)} 
          trend="+12%" 
          trendUp={true} 
          color="primary"
        />
        <StatCard 
          icon={CalendarDays} 
          title="Reservas Totales" 
          value={bookings.length.toString()} 
          trend="+5" 
          trendUp={true} 
          color="accent"
        />
        <StatCard 
          icon={Activity} 
          title="Canchas Activas" 
          value={`${fields.filter((f: any) => f.is_active).length}/${fields.length}`} 
          trend="Full" 
          trendUp={true} 
          color="success"
        />
        <StatCard 
          icon={TrendingUp} 
          title="Ocupación" 
          value="78%" 
          trend="+3%" 
          trendUp={true} 
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* REVENUE CHART PLACEHOLDER (CUSTOM SVG) */}
        <div className="lg:col-span-2 glass-premium rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 group-hover:bg-primary/10 transition-colors"></div>
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter">Actividad Semanal</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Comparativa de reservas x día</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground/5 border border-white/5">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
            </div>
          </div>

          {/* Mini Chart Mockup */}
          <div className="h-48 flex items-end justify-between gap-3 relative pb-8">
            <div className="absolute inset-x-0 bottom-8 h-px bg-white/5"></div>
            {[45, 78, 52, 91, 64, 85, 72].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.1, duration: 1, ease: 'circOut' }}
                  className={`w-full max-w-[40px] rounded-t-xl relative overflow-hidden transition-all group-hover/bar:scale-x-110 ${i === 3 ? 'bg-primary' : 'bg-surface-elevated border border-white/5 hover:border-primary/50'}`}
                >
                   {i === 3 && <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>}
                </motion.div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="glass-premium rounded-[2.5rem] p-8 border-white/5">
           <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter mb-6">Acceso Rápido</h3>
           <div className="grid grid-cols-2 gap-4">
             <QuickActionPremium icon={CalendarDays} label="Agenda" sub="Revisar Turnos" color="primary" onClick={() => onTabChange('calendar')} />
             <QuickActionPremium icon={Zap} label="Marketing" sub="Subir Promo" color="accent" onClick={() => onTabChange('marketing')} />
             <QuickActionPremium icon={Coffee} label="Bar" sub="Inventario" color="success" onClick={() => onTabChange('inventory')} />
             <QuickActionPremium icon={Settings} label="Ajustes" sub="Configuración" color="primary" onClick={() => onTabChange('settings')} />
           </div>
           
           <div className="mt-8 p-6 rounded-3xl bg-surface-elevated/50 border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                    < Bell className="w-4 h-4 text-accent" />
                 </div>
                 <h4 className="text-xs font-black uppercase tracking-widest">Aviso Importante</h4>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Tenés 2 reservas pendientes de confirmación para hoy a las 21:00hs. <span className="text-primary cursor-pointer font-black underline">Revisar ahora</span></p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* UPCOMING MATCHES */}
        <div className="lg:col-span-2 glass-premium rounded-[2.5rem] p-8 border-white/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter">Agenda Próxima</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Turnos de las próximas 24 horas</p>
            </div>
            <button onClick={() => onTabChange('calendar')} className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-[9px] font-black uppercase tracking-widest transition-all">
              Ver Agenda Completa
            </button>
          </div>
          
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-surface-elevated/30 rounded-[2rem] border border-dashed border-white/10 text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                No hay movimientos detectados
              </div>
            ) : (
              bookings.slice(0, 5).map((booking: any) => (
                <UpcomingMatch 
                  key={booking.id}
                  time={booking.start_time.substring(0, 5)} 
                  field={booking.canchas_fields?.name || 'Cancha'} 
                  team={booking.title || 'Turno Manual'} 
                  status={getStatusLabel(booking.status)} 
                  price={formatMoney(booking.total_price)} 
                  isPending={booking.status === 'pending'} 
                  isApp={!!booking.match_id}
                  onClick={() => onBookingClick?.(booking)}
                />
              ))
            )}
          </div>
        </div>

        {/* FEEDBACK & RECENT */}
        <div className="glass-premium rounded-[2.5rem] p-8 border-white/5">
           <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter mb-6">Top Clientes</h3>
           <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-elevated/30 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-background overflow-hidden border border-white/10 p-0.5">
                        <img src={`https://i.pravatar.cc/150?u=${i+10}`} className="w-full h-full object-cover rounded-lg" alt="" />
                     </div>
                     <div>
                        <p className="text-xs font-black uppercase tracking-tighter">Santi Pérez</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">8 Partidos • Lvl 42</p>
                     </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
              <button className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-all mt-4">
                Ver Ranking de Clientes
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionPremium({ icon: Icon, label, sub, color, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-start gap-4 p-5 rounded-[1.8rem] bg-surface-elevated/50 hover:bg-surface-elevated border border-white/5 hover:border-primary/20 transition-all press-effect relative overflow-hidden group">
      <div className={`p-2.5 rounded-xl bg-background border border-white/10 group-hover:bg-primary transition-colors`}>
        <Icon className={`w-5 h-5 group-hover:text-black transition-colors ${color === 'primary' ? 'text-primary' : color === 'accent' ? 'text-accent' : 'text-success'}`} />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-tighter">{label}</p>
        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{sub}</p>
      </div>
      <Plus className="absolute top-4 right-4 w-4 h-4 text-muted-foreground/20 group-hover:text-primary transition-colors" />
    </button>
  );
}

/* =========================================
   MARKETING TAB
 ========================================= */
function MarketingTab({ business }: any) {
  return (
    <div className="space-y-8 animate-reveal-up">
       <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black font-kanit italic uppercase tracking-tighter text-foreground">
            Promo <span className="text-primary">Radar</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Marketing & Fidelización</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
             {/* QR Section */}
             <div className="glass-premium rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                   <div className="w-48 h-48 bg-white rounded-[2rem] p-4 flex items-center justify-center shadow-2xl">
                      <QrCode className="w-full h-full text-black" />
                   </div>
                   <div className="flex-1 space-y-4 text-center lg:text-left">
                      <h3 className="text-2xl font-black font-kanit italic uppercase tracking-tighter">Tu Perfil Directo</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">Este QR lleva a los jugadores directamente a tu complejo en Pelotify. Imprimilo y pegalo en la administración para que todos se unan!</p>
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                         <button className="bg-primary text-black font-black uppercase text-[10px] tracking-widest py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-light transition-all">
                            <Share2 className="w-4 h-4" /> Copiar Link
                         </button>
                         <button className="bg-surface-elevated text-foreground font-black uppercase text-[10px] tracking-widest py-3 px-6 rounded-xl border border-white/10 hover:bg-surface-bright transition-all">
                            Descargar PNG
                         </button>
                      </div>
                   </div>
                </div>
             </div>

             {/* active Promotions */}
             <div className="glass-premium rounded-[2.5rem] p-8 border-white/5">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter">Promociones Activas</h3>
                   <button className="px-5 py-2.5 bg-primary/20 text-primary border border-primary/30 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all hover:text-black">
                      Nueva Campaña
                   </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <PromoCard 
                      title="Happy Hour F5" 
                      discount="20% OFF" 
                      period="14hs - 17hs" 
                      status="Activa"
                      icon={Clock}
                   />
                   <PromoCard 
                      title="Pelotify Exclusive" 
                      discount="Free Gatorade" 
                      period="Reservas via App" 
                      status="Pausada"
                      icon={Zap}
                      inactive
                   />
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="glass-premium rounded-[2.5rem] p-8 border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                <h3 className="text-lg font-black font-kanit italic uppercase tracking-tighter mb-4">Tips de Crecimiento</h3>
                <ul className="space-y-4">
                   <GrowthTip icon={Gamepad2} text="Ofrece un 10% de descuento a equipos que usen el uniforme oficial de su equipo en Pelotify." />
                   <GrowthTip icon={Users} text="Crea un partido 'Open Recruit' para completar tus horas muertas." />
                   <GrowthTip icon={Tag} text="Habilitá el pago por Mercado Pago para reducir ausencias (No-Shows) en un 40%." />
                </ul>
             </div>
          </div>
       </div>
    </div>
  );
}

function PromoCard({ title, discount, period, status, icon: Icon, inactive = false }: any) {
  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${inactive ? 'bg-surface-elevated/50 border-white/5 opacity-60' : 'bg-surface-elevated border-primary/20 shadow-lg shadow-primary/5'}`}>
       <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${inactive ? 'bg-background' : 'bg-primary/20 text-primary'}`}>
             <Icon className="w-5 h-5" />
          </div>
          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${inactive ? 'bg-background text-muted-foreground' : 'bg-primary text-black'}`}>
             {status}
          </span>
       </div>
       <h4 className="text-sm font-black uppercase tracking-tighter">{title}</h4>
       <div className="mt-4 flex items-end justify-between">
          <div>
             <p className="text-xl font-black italic font-kanit text-primary">{discount}</p>
             <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{period}</p>
          </div>
          <button className="p-2 rounded-lg bg-background border border-white/5 hover:border-primary/50 transition-colors">
             <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
       </div>
    </div>
  );
}

function GrowthTip({ icon: Icon, text }: any) {
  return (
    <li className="flex gap-4">
       <div className="w-8 h-8 shrink-0 rounded-lg bg-background flex items-center justify-center border border-white/10">
          <Icon className="w-4 h-4 text-primary" />
       </div>
       <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">{text}</p>
    </li>
  );
}

/* =========================================
   INVENTORY TAB
 ========================================= */
function InventoryTab() {
  const items = [
    { name: 'Gatorade Blue 500ml', stock: 24, price: 1200, category: 'Bebidas' },
    { name: 'Agua Villavicencio 500ml', stock: 48, price: 800, category: 'Bebidas' },
    { name: 'Barrita de Cereal', stock: 12, price: 500, category: 'Snacks' },
    { name: 'Alquiler de Chalecos', stock: 10, price: 1000, category: 'Servicios' },
  ];

  return (
    <div className="space-y-8 animate-reveal-up">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex flex-col gap-1">
             <h2 className="text-3xl font-black font-kanit italic uppercase tracking-tighter text-foreground">
               Control <span className="text-primary">Stock</span>
             </h2>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Inventario & Ventas del Bar</p>
          </div>
          <button className="w-full sm:w-auto bg-primary text-black font-black uppercase text-[11px] tracking-widest py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-light transition-all shadow-lg press-effect">
            <Plus className="w-5 h-5" />
            Cargar Compra
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
             <div className="glass-premium rounded-[2.5rem] border-white/5 overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-surface-elevated/50 border-b border-white/5">
                      <tr>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Producto</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Precio</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acción</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {items.map((item, i) => (
                        <tr key={i} className="hover:bg-foreground/[0.02] transition-colors group">
                           <td className="px-8 py-6">
                              <p className="text-sm font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{item.name}</p>
                              <p className="text-[8px] font-black text-muted-foreground uppercase mt-1 tracking-widest">{item.category}</p>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <span className={`text-sm font-black italic font-kanit ${item.stock < 15 ? 'text-accent' : 'text-foreground'}`}>{item.stock}</span>
                                 {item.stock < 15 && <span className="text-[8px] font-black text-accent uppercase tracking-widest">Bajo</span>}
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className="text-sm font-black text-foreground">${item.price}</span>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <button className="p-2 rounded-lg bg-foreground/5 hover:bg-primary hover:text-black transition-all">
                                    <Plus className="w-4 h-4" />
                                 </button>
                                 <button className="p-2 rounded-lg bg-foreground/5 hover:bg-danger hover:text-white transition-all">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

          <div className="space-y-6">
             <div className="glass-premium rounded-[2.5rem] p-8 border-white/5">
                <h3 className="text-lg font-black font-kanit italic uppercase tracking-tighter mb-6">Resumen del Turno</h3>
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase">Ventas Hoy</p>
                      <p className="text-xl font-black italic font-kanit text-primary">$12.400</p>
                   </div>
                   <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase">Rentabilidad</p>
                      <p className="text-xl font-black italic font-kanit text-accent">35%</p>
                   </div>
                   <button className="w-full py-4 bg-foreground/5 hover:bg-foreground/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                      Ver Reporte Detallado
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function Trash2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
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

function UpcomingMatch({ time, field, team, status, price, isPending = false, isApp = false, onClick }: any) {
  return (
    <div onClick={onClick} className="cursor-pointer flex items-center justify-between p-5 rounded-[2rem] bg-surface-elevated/40 hover:bg-surface-elevated border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
      {isApp && (
        <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(44,252,125,0.8)]"></div>
      )}
      <div className="flex items-center gap-6">
        <div className="text-center w-14 shrink-0">
          <span className="block text-xl font-black font-kanit italic text-foreground tracking-tighter group-hover:text-primary transition-colors">{time}</span>
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">HS</span>
        </div>
        <div className="w-px h-12 bg-white/5 hidden sm:block"></div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm uppercase tracking-tighter text-foreground">{field}</h4>
            {isApp && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                <Zap className="w-2.5 h-2.5 text-primary" />
                <span className="text-[7px] font-black text-primary uppercase tracking-widest">APP</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{team}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-black text-base italic font-kanit text-foreground">{price}</p>
        <p className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg mt-1 inline-block ${
          isPending ? 'bg-danger/10 text-danger border border-danger/20' : 
          status.includes('Seña') ? 'bg-accent/10 text-accent border border-accent/20 text-glow-accent' : 
          'bg-primary/10 text-primary border border-primary/20 text-glow-primary'
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
    <div className="space-y-8 animate-reveal-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black font-kanit italic uppercase tracking-tighter text-foreground">
            Gestión <span className="text-primary">Turnos</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Calendario de Ocupación</p>
        </div>
        <div className="flex items-center gap-4 bg-surface-elevated p-2 rounded-[2rem] border border-white/5 shadow-inner">
           {getWeekDays().map(date => {
             const isSelected = selectedDate === date;
             const isToday = date === getTodayStr();
             return (
               <button 
                 key={date}
                 onClick={() => setSelectedDate(date)} 
                 className={`relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl transition-all flex flex-col items-center justify-center gap-0.5 ${
                   isSelected 
                    ? 'bg-primary text-black font-black shadow-lg shadow-primary/20 scale-110 z-10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-bright'
                 }`}
               >
                 <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-black/60' : 'opacity-70'}`}>{getDayName(date)}</span>
                 <span className="text-lg font-black font-kanit italic leading-none">{date.split('-')[2]}</span>
                 {isToday && !isSelected && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(44,252,125,0.8)]"></div>}
               </button>
             );
           })}
           <div className="h-10 w-px bg-white/5 mx-2 hidden sm:block"></div>
           <div className="relative h-14 w-14 flex items-center justify-center rounded-2xl bg-surface-bright/50 border border-white/5">
               <input 
                 type="date" 
                 value={selectedDate} 
                 onChange={(e) => setSelectedDate(e.target.value)} 
                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20" 
               />
               <CalendarDays className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"/>
           </div>
        </div>
      </div>

      <div className="glass-premium rounded-[3rem] border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[800px]">
            {/* Grid Header */}
            <div className="grid border-b border-white/5 bg-foreground/[0.02]" style={{ gridTemplateColumns: `100px repeat(${Math.max(displayFields.length, 1)}, 1fr)` }}>
              <div className="p-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Reloj</div>
              {displayFields.map((f: any) => (
                <div key={f.id} className="p-6 text-center font-black text-xs uppercase tracking-widest border-l border-white/5 italic text-foreground/80">{f.name}</div>
              ))}
            </div>
            
            {/* Grid Body */}
            <div className="divide-y divide-white/5">
              {timeSlots.map(time => (
                <div key={time} className="grid hover:bg-primary/[0.02] transition-colors group/row" style={{ gridTemplateColumns: `100px repeat(${Math.max(displayFields.length, 1)}, 1fr)` }}>
                  <div className="p-6 text-center text-lg font-black font-kanit italic text-muted-foreground/40 group-hover/row:text-primary transition-colors flex items-center justify-center">
                    {time}
                  </div>
                  
                  {displayFields.map((f: any) => {
                    const booking = bookings.find((b: any) => 
                      b.field_id === f.id && 
                      b.date === selectedDate && 
                      b.start_time.startsWith(time)
                    );

                    return (
                      <div key={f.id} className="p-3 border-l border-white/5 relative min-h-[100px]">
                        {booking ? (
                          <div onClick={() => onBookingClick(booking)} className={`cursor-pointer h-full w-full rounded-2xl p-4 text-[10px] flex flex-col justify-center border-l-4 transition-all hover:scale-[1.02] hover:shadow-xl ${
                            booking.status === 'pending' ? 'bg-danger/5 border-l-danger text-danger border-white/5' :
                            booking.status === 'partial_paid' ? 'bg-accent/5 border-l-accent text-accent border-white/5 shadow-accent/5' :
                            'bg-primary/5 border-l-primary text-primary border-white/5 shadow-primary/5'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                               <span className="font-black uppercase tracking-widest">{booking.status === 'pending' ? 'Impago' : booking.status === 'partial_paid' ? 'Señado' : 'Pagado'}</span>
                               {booking.match_id && <Zap className="w-3 h-3 text-primary animate-pulse" />}
                            </div>
                            <span className="font-black uppercase tracking-tighter text-sm text-foreground truncate">{booking.title || 'Reserva Directa'}</span>
                            <span className="text-[9px] font-bold text-muted-foreground mt-1">${new Intl.NumberFormat('es-AR').format(booking.total_price)}</span>
                          </div>
                        ) : (
                          <button onClick={() => onSlotClick(time, f.id)} className="h-full w-full rounded-2xl border-2 border-dashed border-white/5 hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary flex items-center justify-center gap-2 transition-all opacity-0 hover:opacity-100 group/btn">
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Crear Turno</span>
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
function SettingsTab({ business, fields, setFields, hasMP }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deposit, setDeposit] = useState(fields?.[0]?.down_payment_percentage || 30);
  const [aliasCbu, setAliasCbu] = useState(business?.alias_cbu || '');
  const [description, setDescription] = useState(business?.description || '');
  const [address, setAddress] = useState(business?.address || '');
  const [city, setCity] = useState(business?.city || '');
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
          alias_cbu: trimmedAlias, 
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

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Info */}
          <div className="glass-premium rounded-[2.5rem] p-10 border-white/5 space-y-8">
             <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                   <Settings className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter">Perfil del Complejo</h3>
             </div>

             <div className="space-y-6">
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Ciudad</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-foreground/[0.03] border border-white/5 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all"
                    />
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
                <div className="p-6 rounded-3xl bg-surface-elevated/50 border border-white/5">
                   <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Porcentaje de Seña</label>
                      <span className="text-2xl font-black italic font-kanit text-primary">{deposit}%</span>
                   </div>
                   <input 
                     type="range" min="0" max="100" step="10"
                     value={deposit}
                     onChange={(e) => setDeposit(Number(e.target.value))}
                     className="w-full accent-primary h-2 bg-foreground/10 rounded-full"
                   />
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
