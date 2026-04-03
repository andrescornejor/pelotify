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
  LogOut,
  Sun,
  Moon,
  Users,
  PieChart,
  Activity,
  Star,
  Search,
  Filter,
  AlertTriangle,
  XCircle
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CanchasDashboard() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Supabase Data State
  const [business, setBusiness] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ time: string, fieldId: string } | null>(null);
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
    { id: 'calendar', label: 'Agenda', icon: CalendarDays },
    { id: 'finances', label: 'Finanzas', icon: Wallet },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'analytics', label: 'Métricas', icon: PieChart },
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-kanit p-6 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-surface-elevated/80 backdrop-blur-3xl rounded-[2.5rem] p-10 text-center space-y-8 relative z-10 border border-border/50 shadow-2xl"
        >
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-primary to-primary-dark text-black rounded-[2rem] flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
              <MapPin className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none">
              ¡HOLA, <span className="text-primary italic">SOCIO!</span>
            </h2>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
              Aún no tienes un complejo asociado a tu cuenta. <br />
              <span className="text-muted-foreground">Contáctanos para activar tu panel profesional y empezar a recibir reservas.</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.open('https://wa.me/your-number', '_blank')}
              className="w-full bg-primary text-zinc-950 font-black text-sm uppercase tracking-widest py-4 px-6 rounded-2xl hover:bg-white hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-primary/10"
            >
              Hablar con Soporte
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-foreground/5 text-muted-foreground hover:text-foreground hover:bg-foreground/10 font-bold text-xs uppercase tracking-widest py-4 px-6 rounded-2xl border border-border/50 transition-all"
            >
              Volver al Inicio
            </button>
          </div>

          <div className="pt-4 border-t border-border/50 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
            Pelotify Business Elite
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-0 font-kanit relative selection:bg-primary/30 selection:text-foreground">
      {/* Professional Background Texture */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.07] flex items-center justify-center">
        <img src="/main_bg.png" alt="Background Texture" className="w-full h-full object-cover scale-110" />
      </div>

      {/* Decorative Vivid Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px] pointer-events-none z-0 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* HEADER TRAY */}
      <header className="fixed top-0 w-full z-40 bg-gradient-to-b from-surface-elevated/95 to-surface-elevated/80 border-b border-border/40 backdrop-blur-[30px] shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="max-w-[1600px] mx-auto px-4 h-16 sm:h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 relative flex items-center justify-center drop-shadow-[0_0_15px_rgba(44,252,125,0.3)] transition-transform hover:scale-105">
              <img src="/logo_pelotify.png" alt="Pelotify Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black font-kanit tracking-tighter italic uppercase text-foreground leading-none drop-shadow-sm">
                  {business?.name || "Pelotify Business"}
                </h1>
                <div className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 hidden sm:flex items-center gap-1">
                  <Star className="w-2 h-2 text-primary fill-primary" />
                  <span className="text-[7px] font-black text-primary uppercase tracking-widest leading-none">PRO</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                <div className="px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 flex items-center gap-1.5 group/status cursor-default">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(44,252,125,0.8)]"></span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary/80 group-hover:text-primary transition-colors">Verificada</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border/40 group/time cursor-default">
                  <div className="p-1 rounded-md bg-foreground/[0.03] border border-border/30 group-hover/time:bg-primary/10 group-hover/time:border-primary/20 transition-all">
                    <Clock className="w-2.5 h-2.5 text-muted-foreground group-hover/time:text-primary transition-colors" />
                  </div>
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest group-hover/time:text-foreground transition-colors">
                    {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-[1.25rem] bg-foreground/[0.02] border border-white/5 shadow-inner hover:bg-foreground/[0.04] transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-500"></div>
              <div className="text-right relative z-10 pr-1">
                <p className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] leading-none mb-1.5">Capital Estimado</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm sm:text-base font-black text-foreground italic font-kanit tracking-tighter">${new Intl.NumberFormat('es-AR').format(stats.monthIncome)}</span>
                  <div className="p-1 rounded-md bg-primary/10 border border-primary/20">
                    <TrendingUp className="w-3 h-3 text-primary" />
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-border/40 mx-2 relative z-10"></div>
              <button 
                onClick={() => router.push('/canchas/scanner')} 
                className="w-10 h-10 mr-2 rounded-xl bg-foreground/[0.03] text-primary border border-primary/30 flex items-center justify-center hover:bg-primary/10 hover:scale-105 active:scale-95 transition-all shadow-lg relative z-10"
                title="Escanear QR de Check-In"
              >
                <Zap className="w-5 h-5 font-black" />
              </button>
              <button 
                onClick={onNewBooking} 
                className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 relative z-10 glow-primary"
                title="Acceso Rápido"
              >
                <Plus className="w-5 h-5 font-black" />
              </button>
            </div>

            {/* Notifications button removed */}

            <button 
              onClick={async () => { await logout(); router.push('/canchas/login'); }} 
              className="relative p-3.5 rounded-2xl bg-foreground/[0.02] border border-white/5 hover:bg-danger/10 hover:border-danger/30 transition-all group shadow-sm active:scale-95" 
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-danger transition-colors drop-shadow-sm" />
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative p-3.5 rounded-2xl bg-foreground/[0.02] border border-white/5 hover:bg-primary/10 hover:border-primary/30 transition-all group shadow-sm active:scale-95"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
              )}
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-black text-foreground uppercase tracking-wider leading-none drop-shadow-sm">{user?.user_metadata?.full_name || 'Administrador'}</p>
                <div className="flex items-center gap-1 justify-end mt-1.5">
                  <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_5px_rgba(44,252,125,0.6)]"></div>
                  <p className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">ADMINISTRADOR</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-1 rounded-[1.25rem] bg-gradient-to-tr from-border/50 to-transparent border border-white/10 hover:border-primary/50 shadow-2xl transition-all group press-effect relative overflow-hidden"
                title="Ajustes de Cuenta"
              >
                <div className="w-12 h-12 rounded-[1rem] overflow-hidden relative z-10 border border-white/5">
                  <img 
                    src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=2cfc7d&color=000`} 
                    alt="Admin" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="pt-24 max-w-[1600px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row gap-8 min-h-screen relative z-10">

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 gap-3 sticky top-28 h-[calc(100vh-8rem)] bg-surface-elevated/40 backdrop-blur-3xl rounded-[2.5rem] p-5 border border-white/10 dark:border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <div className="px-4 pb-4 border-b border-border/40 mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/70">Control Tower</p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden group w-full ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5 border border-transparent hover:border-border/50'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabSidebar"
                      className="absolute inset-0 bg-primary/15 border border-primary/30 rounded-2xl"
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
          </div>

          <div className="p-4 border-t border-border/40 space-y-2">
            {business?.id && (
              <button
                onClick={() => window.open(`/establecimientos/${business.id}`, '_blank')}
                className="w-full p-4 rounded-2xl bg-foreground/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all flex items-center gap-4 group"
              >
                <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="font-bold text-sm">Ver Perfil Público</span>
              </button>
            )}
            <button
              onClick={logout}
              className="w-full p-4 rounded-2xl bg-danger/5 hover:bg-danger text-danger hover:text-white transition-all flex items-center gap-4 group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 w-full pb-32 md:pb-8 max-w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab business={business} bookings={bookings} fields={fields} onNewBooking={() => setShowBookingModal(true)} onBookingClick={(booking: any) => { setSelectedBooking(booking); setShowEditBookingModal(true); }} onTabChange={setActiveTab} />}
              {activeTab === 'calendar' && <CalendarTab bookings={bookings} fields={fields} selectedDate={selectedDate} setSelectedDate={setSelectedDate} onSlotClick={(time: string, fieldId: string) => { setSelectedSlot({ time, fieldId }); setShowBookingModal(true); }} onBookingClick={(booking: any) => { setSelectedBooking(booking); setShowEditBookingModal(true); }} />}

              {activeTab === 'finances' && <FinancesTab business={business} bookings={bookings} hasMP={hasMP} user={user} />}
              {activeTab === 'customers' && <CustomersTab bookings={bookings} />}
              {activeTab === 'analytics' && <AnalyticsTab bookings={bookings} stats={stats} />}
              {activeTab === 'settings' && <SettingsTab business={business} fields={fields} setFields={setFields} hasMP={hasMP} setBusiness={setBusiness} logout={logout} router={router} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MOBILE FLOATING ACTION BUTTON */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onNewBooking}
        className="md:hidden fixed bottom-28 right-6 w-16 h-16 bg-primary text-black rounded-[1.5rem] shadow-[0_15px_40px_rgba(44,252,125,0.4)] flex items-center justify-center z-40 glow-primary animate-reveal-up"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

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
  const [todaySearch, setTodaySearch] = useState('');
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
    <div className="space-y-6 animate-reveal-up pt-6 px-1 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-black font-kanit italic uppercase tracking-tighter leading-none">
            Hoy en <span className="text-primary">{business?.name || "tu sede"}</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={onNewBooking} className="hidden sm:flex bg-primary text-black font-black uppercase text-[10px] tracking-widest py-4 px-8 rounded-2xl items-center gap-3 hover:bg-primary-light transition-all shadow-xl shadow-primary/20 press-effect active:scale-95">
          <Plus className="w-4 h-4" /> Nueva Reserva
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-premium p-5 sm:p-7 flex flex-col justify-center gap-2 group hover:border-primary/40 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all"></div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(44,252,125,0.15)]"><DollarSign className="w-7 h-7" /></div>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">Caja Hoy</p>
          </div>
          <p className="text-4xl font-black font-kanit italic tracking-tighter ml-1 text-foreground">{formatMoney(todayIncome)}</p>
        </div>
        <div className="glass-premium p-7 flex flex-col justify-center gap-3 group hover:border-accent/40 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-all"></div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-3 rounded-2xl bg-accent/10 text-accent border border-accent/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]"><CalendarDays className="w-7 h-7" /></div>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">Turnos Hoy</p>
          </div>
          <p className="text-4xl font-black font-kanit italic tracking-tighter ml-1 text-foreground">{todayBookings.length}</p>
        </div>
        <div className="glass-premium p-7 flex flex-col justify-center gap-3 group hover:border-danger/40 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-danger/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-danger/10 transition-all"></div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-3 rounded-2xl bg-danger/10 text-danger border border-danger/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]"><Clock className="w-7 h-7" /></div>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">Impagos</p>
          </div>
          <p className="text-4xl font-black font-kanit italic tracking-tighter ml-1 text-foreground">{pendingCount}</p>
        </div>
        <div className="glass-premium p-7 flex flex-col justify-center gap-3 group hover:border-primary/40 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all"></div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(44,252,125,0.15)]"><TrendingUp className="w-7 h-7" /></div>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em]">Ocupación</p>
          </div>
          <p className="text-4xl font-black font-kanit italic tracking-tighter ml-1 text-foreground">{occupancy}%</p>
        </div>
      </div>

      {/* Main Grid: Upcoming Matches & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-foreground/5 rounded-xl border border-border/40">
                <CalendarDays className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter">Turnos <span className="text-primary">de Hoy</span></h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Próximos encuentros</p>
              </div>
            </div>
            
            {/* Quick Filter */}
            <div className="relative group/search w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within/search:text-primary" />
              <input 
                type="text" 
                placeholder="Buscar turno o equipo..." 
                className="w-full bg-surface-elevated/50 border border-border/40 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-primary/50 transition-all text-foreground"
                value={todaySearch}
                onChange={(e) => setTodaySearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {todayBookings
              .filter((m: any) => 
                (m.title?.toLowerCase().includes(todaySearch.toLowerCase())) || 
                (m.canchas_fields?.name?.toLowerCase().includes(todaySearch.toLowerCase()))
              )
              .map((m: any) => (
                <UpcomingMatch
                  key={m.id}
                  time={m.start_time.substring(0, 5)}
                  field={m.canchas_fields?.name}
                  team={m.title}
                  status={getStatusLabel(m.status)}
                  price={formatMoney(m.total_price)}
                  isPending={m.status === 'pending'}
                  isApp={!!m.match_id}
                  onClick={() => onBookingClick?.(m)}
                />
              ))}
            {todayBookings.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-border/40 rounded-[2.5rem] bg-foreground/[0.02]">
                <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/40">
                  <CalendarDays className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">No hay turnos para hoy</h4>
                <p className="text-xs text-muted-foreground/60 mt-2">Relajate, tomate un café ☕</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
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
      </div>
    </div>
  );
}


function UpcomingMatch({ time, field, team, status, price, isPending = false, isApp = false, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className="cursor-pointer flex items-center justify-between p-5 rounded-[1.5rem] bg-surface-elevated/30 hover:bg-surface-elevated/60 border border-white/5 hover:border-primary/30 transition-all duration-300 group relative overflow-hidden shadow-sm hover:shadow-primary/5"
    >
      {isApp && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[0_0_15px_rgba(44,252,125,0.4)]"></div>
      )}
      <div className="flex items-center gap-5">
        <div className="text-center w-14 shrink-0 flex flex-col">
          <span className="text-lg font-black font-kanit italic tracking-tighter group-hover:text-primary transition-colors leading-none">{time}</span>
          <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mt-1">Check-in</span>
        </div>
        <div className="w-px h-10 bg-border/40 hidden sm:block"></div>
        <div>
          <div className="flex items-center gap-3">
            <h4 className="font-black text-sm uppercase tracking-tight text-foreground/90">{field}</h4>
            {isApp && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="w-2.5 h-2.5 text-primary" />
                <span className="text-[7px] font-black text-primary uppercase tracking-tighter">APP RESERVA</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground/80 font-medium mt-1">{team}</p>
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-1">
        <p className="font-black text-base font-kanit text-foreground italic">{price}</p>
        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
          isPending ? 'bg-danger/10 text-danger border-danger/30' :
          status.includes('Seña') ? 'bg-accent/10 text-accent border-accent/30' :
          'bg-primary/10 text-primary border-primary/30'
        }`}>
          {status}
        </span>
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
      default: return 'bg-foreground/5 border-border/50';
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
            className="p-2.5 rounded-xl bg-surface-elevated border border-border/40 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all press-effect"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all press-effect ${weekOffset === 0
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-surface-elevated border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30'
              }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-2.5 rounded-xl bg-surface-elevated border border-border/40 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all press-effect"
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
            className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all press-effect ${activeFieldId === f.id
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-surface-elevated border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/20'
              }`}
          >
            {f.name}
            <span className="ml-1.5 opacity-60">{f.type}</span>
          </button>
        ))}
      </div>

      {/* ── WEEK STATS ── */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border/40">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Turnos</span>
          <span className="text-sm font-black font-kanit italic text-foreground">{weekBookings.length}</span>
        </div>
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border/40">
          <DollarSign className="w-4 h-4 text-accent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ingresos</span>
          <span className="text-sm font-black font-kanit italic text-foreground">{formatMoney(weekIncome)}</span>
        </div>
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border/40">
          <Clock className="w-4 h-4 text-danger" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Impagos</span>
          <span className="text-sm font-black font-kanit italic text-foreground">{weekPending}</span>
        </div>
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border/40">
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
          <div className="w-2 h-2 rounded-full bg-foreground/10 border border-border"></div>
          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Libre</span>
        </div>
      </div>

      {/* ── WEEKLY GRID ── */}
      <div className="rounded-[2.5rem] border border-white/10 dark:border-white/5 overflow-hidden shadow-2xl bg-surface-elevated/30 backdrop-blur-3xl">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[800px]">
            {/* Column headers: days */}
            <div className="grid border-b border-border/60 bg-foreground/[0.05]" style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}>
              <div className="p-3 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
              </div>
              {weekDays.map(date => {
                const isToday = date === todayStr;
                return (
                  <div
                    key={date}
                    className={`p-3 text-center border-l border-border/50 transition-colors ${isToday ? 'bg-primary/[0.08]' : ''}`}
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
                    <div className={`p-2 flex items-center justify-center border-r border-border/50 relative ${isCurrentHour ? 'bg-primary/[0.05]' : ''
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
                          className={`border-l border-border/50 p-1.5 min-h-[56px] flex items-center justify-center ${isToday && weekOffset === 0 ? 'bg-primary/[0.04]' : ''
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
                                <div className="bg-background border border-border/50 rounded-xl p-3 shadow-2xl min-w-[160px] text-left">
                                  <p className="text-[10px] font-black uppercase tracking-tighter text-foreground truncate">{booking.title || 'Reserva Directa'}</p>
                                  <p className="text-[9px] text-muted-foreground mt-0.5">{booking.start_time.substring(0, 5)} — {booking.end_time.substring(0, 5)}</p>
                                  <div className="flex items-center justify-between mt-1.5">
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${booking.status === 'pending' ? 'text-danger' : booking.status === 'partial_paid' ? 'text-accent' : 'text-primary'
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
                              className="w-full h-full min-h-[44px] rounded-lg border border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/[0.06] transition-all group flex items-center justify-center"
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
        <div className="lg:col-span-2 bg-slate-950/40 backdrop-blur-3xl rounded-[3.5rem] p-12 border border-white/10 relative overflow-hidden group shadow-[0_48px_80px_-16px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 group-hover:bg-primary/20 transition-all duration-700 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -z-10"></div>

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
              <button disabled className="flex-1 bg-surface-elevated text-muted-foreground font-black uppercase text-[10px] tracking-widest py-4 px-6 rounded-2xl flex justify-center items-center gap-2 border border-border/40 opacity-50 cursor-not-allowed">
                Retirar Fondos <ArrowUpRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  const rows = [["Fecha", "Hora", "Cancha", "Cliente", "Estado", "Total ($)", "Sena ($)"]];
                  bookings.forEach((b: any) => {
                    rows.push([b.date, b.start_time, b.canchas_fields?.name || 'N/A', b.title || 'Reserva', b.status, (b.total_price || 0).toString(), (b.down_payment_paid || 0).toString()]);
                  });
                  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
                  const link = document.createElement("a");
                  link.href = encodeURI(csvContent);
                  link.download = `reporte_financiero_${new Date().toISOString().split('T')[0]}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex-1 bg-primary text-black font-black uppercase text-[10px] tracking-widest py-4 px-6 rounded-2xl flex justify-center items-center gap-2 hover:bg-primary-light transition-all shadow-lg shadow-primary/20"
              >
                Descargar Reporte <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-premium rounded-[2.5rem] p-8 border-border/40 flex items-center justify-between group hover:border-primary/30 transition-all">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Comisión Plataforma</p>
              <h3 className="text-3xl font-black italic font-kanit">5.0<span className="text-primary">%</span></h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border/50 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-xl">
              <Shield className="w-7 h-7 text-primary" />
            </div>
          </div>

          <div className="glass-premium rounded-[2.5rem] p-8 border-border/40 group hover:border-[#009EE3]/30 transition-all">
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
      <div className="glass-premium rounded-[2.5rem] p-10 border-border/40">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black font-kanit italic uppercase tracking-tighter">Historial de Cobros</h3>
          <div className="p-1 px-2 bg-foreground/5 rounded-xl border border-border/40 text-[9px] font-black uppercase tracking-widest">Últimos 30 días</div>
        </div>
        <div className="space-y-2">
          {bookings.filter((b: any) => b.status === 'full_paid' || b.status === 'partial_paid').slice(0, 8).map((booking: any, i: number) => (
            <div key={`tx-${i}`} className="flex items-center justify-between p-5 rounded-2xl hover:bg-foreground/[0.03] transition-all border border-transparent hover:border-border/40 group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${booking.match_id ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-surface-elevated text-muted-foreground border border-border/50'}`}>
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
          {bookings.filter((b: any) => b.status === 'full_paid' || b.status === 'partial_paid').length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-surface-elevated/30 rounded-[2rem] border border-dashed border-border/50">
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


function SettingsTab({ business, fields, setFields, hasMP, setBusiness, logout, router }: any) {
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
  const [customerSearch, setCustomerSearch] = useState('');

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ ATENCIÓN: ¿Estás TOTALMENTE seguro? Esta acción borrará tu complejo, todas tus canchas y reservas para siempre. No se puede deshacer.")) return;
    
    // Prompt for confirmation text
    const confirmText = prompt("Escribe 'ELIMINAR' para confirmar la eliminación de tu cuenta:");
    if (confirmText !== 'ELIMINAR') return;

    setLoading(true);
    try {
      // In a real app, we would have a trigger or RPC specifically for this to handle cascading deletes safely.
      // For now, we delete the business which should cascade if DB is set up correctly, or handle it manually.
      const { error } = await supabase.from('canchas_businesses').delete().eq('id', business.id);
      
      if (error) throw error;

      alert("Cuenta eliminada correctamente. Te extrañaremos.");
      await logout();
      router.push('/canchas/login');
    } catch (err: any) {
      alert("Error al eliminar cuenta: " + err.message);
    }
    setLoading(false);
  };
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
          <div className="glass-premium rounded-[2.5rem] p-10 border-border/40 space-y-8">
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
                  className="w-full bg-foreground/[0.03] border border-border/40 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all font-black"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Descripción Pública</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-foreground/[0.03] border border-border/40 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all min-h-[100px]"
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
                    className="w-full bg-foreground/[0.03] border border-border/40 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-foreground/[0.03] border border-border/40 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all"
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
                    className="w-full bg-foreground/[0.03] border border-border/40 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all"
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
                    className="w-full bg-foreground/[0.03] border border-border/40 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all font-mono text-[10px]"
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
                          if (isSelected) setAmenities(amenities.filter(a => a !== item));
                          else setAmenities([...amenities, item]);
                        }}
                        className={`p-4 rounded-2xl border transition-all text-left group ${isSelected ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'bg-foreground/[0.03] border-border/40 hover:border-border'}`}
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
                  onChange={(e) => setCoords({ ...coords, link: e.target.value })}
                  placeholder="https://goo.gl/maps/..."
                  className="w-full bg-foreground/[0.03] border border-border/40 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Payments */}
          <div className="glass-premium rounded-[2.5rem] p-10 border-border/40 space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter">Pagos y Señas</h3>
            </div>

            <div className="space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-surface-elevated/50 border border-border/40 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lógica de la Seña</label>
                  <div className="flex gap-2 bg-background/50 p-1 rounded-xl border border-border/40">
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
                        className={`p-4 rounded-2xl border transition-all text-center ${deposit === opt.value ? 'bg-primary/10 border-primary' : 'bg-background/40 border-border/40 hover:border-border/50'}`}
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
                    <div key={f.id} className="flex items-center justify-between p-4 rounded-2xl bg-foreground/[0.03] border border-border/40">
                      <span className="text-xs font-black uppercase tracking-tighter">{f.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-muted-foreground">$</span>
                        <input
                          type="number"
                          value={fieldPrices[f.id] || 0}
                          onChange={(e) => setFieldPrices({ ...fieldPrices, [f.id]: Number(e.target.value) })}
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
                  className="w-full bg-foreground/[0.03] border border-border/40 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all font-mono"
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

            <div className="glass-premium rounded-[3rem] overflow-hidden border-border/40 shadow-2xl group">
              <div className="h-48 relative">
                <img src={profileImageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop"} className="w-full h-full object-cover brightness-[0.4] contrast-125" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <h4 className="text-2xl font-black italic uppercase text-white tracking-tighter">{businessName || "Tu Complejo"}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{address || "Rosario, Argentina"}</span>
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
                    <div key={type} className="px-4 h-12 rounded-xl bg-foreground/5 border border-border/40 flex items-center justify-center font-black italic font-kanit text-[10px] text-primary/40">
                      {type}
                    </div>
                  ))}
                </div>
                <div className="h-0.5 w-full bg-foreground/5" />
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
      <div className="glass-premium rounded-[2.5rem] p-10 border-border/40">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black font-kanit italic uppercase tracking-tighter">Inventario de Canchas</h3>
          <button onClick={handleCreateField} className="p-3 rounded-2xl bg-primary text-black hover:bg-primary-light transition-all shadow-lg shadow-primary/20">
            <Plus className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((f: any) => (
            <div key={f.id} className="p-6 rounded-3xl bg-surface-elevated/30 border border-border/40 hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-xl bg-background border border-border/50 group-hover:bg-primary/10 transition-colors">
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

      {/* Danger Zone */}
      <div className="glass-premium rounded-[2.5rem] p-10 border-danger/20 bg-danger/[0.03] mt-12 animate-reveal-up group">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center border border-danger/20 group-hover:rotate-12 transition-transform">
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <div>
            <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter text-danger">Zona de Peligro</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-danger/60">Acciones Irreversibles</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-8 leading-relaxed max-w-2xl italic">
          Al eliminar tu cuenta, se borrarán todos los datos de tu establecimiento (<span className="text-foreground font-black">{business?.name}</span>), 
          incluyendo canchas, historial de reservas y base de datos de clientes de forma permanente.
        </p>
        <button 
          onClick={handleDeleteAccount}
          disabled={loading}
          className="px-10 py-5 bg-danger text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-danger-dark transition-all shadow-xl shadow-danger/20 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Borrar Establecimiento Permanentemente'}
        </button>
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
    paid: false,
    isRecurring: false,
    weeks: 4
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

    const newBookings = [];
    let currentDate = new Date(formData.date + 'T00:00:00');

    for (let i = 0; i < (formData.isRecurring ? formData.weeks : 1); i++) {
       const dateStr = currentDate.toISOString().split('T')[0];
       newBookings.push({
         field_id: formData.fieldId,
         booker_id: user?.id,
         title: formData.title || 'Reserva Presencial',
         date: dateStr,
         start_time: startTimeFull,
         end_time: endTime,
         total_price: price,
         down_payment_paid: formData.paid && i === 0 ? price : 0,
         status: formData.paid ? 'full_paid' : 'pending'
       });
       currentDate.setDate(currentDate.getDate() + 7);
    }

    const { data, error } = await supabase.from('canchas_bookings').insert(newBookings).select('*, canchas_fields(name, type)');

    if (error) {
      alert("Error al guardar reserva: " + error.message);
    } else {
      if (data && data.length > 0) {
        data.forEach(b => onBooked(b));
      }
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
            <input type="text" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 outline-none" placeholder="Nombre completo o equipo..." required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Cancha</label>
              <select value={formData.fieldId} onChange={e => setFormData(prev => ({ ...prev, fieldId: e.target.value }))} className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 outline-none appearance-none">
                {fields.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Hora Inicio</label>
              <select value={formData.time} onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))} className="w-full bg-surface-elevated border border-border/50 rounded-xl px-4 py-3 outline-none appearance-none">
                {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="paid" checked={formData.paid} onChange={e => setFormData(prev => ({ ...prev, paid: e.target.checked }))} className="w-5 h-5 accent-primary rounded bg-surface border-border cursor-pointer" />
              <label htmlFor="paid" className="text-sm font-semibold select-none cursor-pointer">Marcar como cobrado en efectivo</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="recurring" checked={formData.isRecurring} onChange={e => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))} className="w-5 h-5 accent-primary rounded bg-surface border-border cursor-pointer" />
              <label htmlFor="recurring" className="text-sm font-semibold select-none cursor-pointer">Turno Fijo (Recurrente)</label>
            </div>
            {formData.isRecurring && (
              <div className="flex items-center gap-2 mt-1">
                 <label className="text-xs text-muted-foreground uppercase">Duración:</label>
                 <select value={formData.weeks} onChange={e => setFormData(prev => ({ ...prev, weeks: parseInt(e.target.value) }))} className="bg-surface-elevated border border-border/50 rounded-lg px-2 py-1 outline-none text-xs flex-1">
                    <option value="4">1 Mes (4 Semanas)</option>
                    <option value="8">2 Meses (8 Semanas)</option>
                    <option value="12">3 Meses (12 Semanas)</option>
                 </select>
              </div>
            )}
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
  const [showQR, setShowQR] = useState(false);

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
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta reserva permanentemente? Esta acción liberará la cancha para este horario.")) return;
    setLoading(true);
    const { error } = await supabase.from('canchas_bookings').delete().eq('id', booking.id);
    if (error) {
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
              <p className="font-semibold text-sm">{booking.start_time.substring(0, 5)} a {booking.end_time.substring(0, 5)}</p>
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

          <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-3 rounded-xl mt-4 cursor-pointer hover:bg-primary/20 transition-all select-none" onClick={() => setShowQR(!showQR)}>
            <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
              <Zap className="w-4 h-4" /> Mostrar Código de Ingreso (QR)
            </div>
          </div>
          {showQR && (
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl mt-2 animate-reveal-up shadow-xl shadow-primary/10">
              <QRCodeSVG value={`checkin:${booking.id}`} size={160} level="H" fgColor="#000000" bgColor="#FFFFFF" />
              <p className="text-black font-black uppercase tracking-widest text-[11px] mt-4">Escanea en Recepción</p>
              <p className="text-black/60 font-medium text-[9px] mt-1 text-center max-w-[150px]">Validá tu reserva directamente en puerta con este código.</p>
            </div>
          )}

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

/* =========================================
   CUSTOMERS TAB (CLIENTES)
========================================= */
function CustomersTab({ bookings }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Aggregate bookings by user or name to simulate a customer list
  const customersMap = new Map();
  bookings.forEach((b: any) => {
    if (!b.title) return;
    const name = b.title.toUpperCase();
    if (!customersMap.has(name)) {
      customersMap.set(name, {
        name: b.title,
        totalBookings: 0,
        totalSpent: 0,
        lastBooking: b.date,
        isAppUser: !!b.match_id
      });
    }
    const customer = customersMap.get(name);
    customer.totalBookings++;
    customer.totalSpent += (b.total_price || 0);
    if (new Date(b.date) > new Date(customer.lastBooking)) {
      customer.lastBooking = b.date;
    }
  });

  const filteredCustomers = Array.from(customersMap.values())
    .filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.totalBookings - a.totalBookings);

  return (
    <div className="space-y-8 animate-reveal-up pb-20 px-1 sm:px-0">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black font-kanit italic uppercase tracking-tighter text-foreground">
          Gestión de <span className="text-primary">Clientes</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Fidelización y Base de Datos</p>
      </div>

      <div className="glass-premium rounded-[2.5rem] p-8 border-border/50 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter">Mejores Jugadores</h3>
              <p className="text-xs text-muted-foreground">{customersMap.size} clientes únicos registrados</p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-elevated border border-border/50 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors shadow-inner" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                <th className="pb-5 pl-6">Cliente / Equipo</th>
                <th className="pb-5 text-center">Turnos Realizados</th>
                <th className="pb-5 text-center">Gasto Total</th>
                <th className="pb-5 text-right pr-6">Última Actividad</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c: any, index: number) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="py-5 pl-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface-elevated/50 border border-white/10 flex items-center justify-center font-black italic text-lg shadow-inner group-hover:border-primary/40 transition-colors">
                        {c.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm uppercase tracking-tight text-foreground/90 group-hover:text-primary transition-colors">{c.name}</span>
                          {c.isAppUser && <Zap className="w-3.5 h-3.5 text-primary drop-shadow-[0_0_8px_rgba(44,252,125,0.4)]" />}
                        </div>
                        {index < 3 && <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#F59E0B] flex items-center gap-1.5 mt-1"><Star className="w-3 h-3 fill-[#F59E0B]" /> Jugador Elite</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 text-center font-black font-kanit text-2xl italic text-foreground/80">{c.totalBookings}</td>
                  <td className="py-5 text-center font-black text-primary font-kanit text-lg italic">${new Intl.NumberFormat('es-AR').format(c.totalSpent)}</td>
                  <td className="py-5 text-right pr-6 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">{c.lastBooking}</td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground text-sm uppercase tracking-widest font-black">
                    No hay información de clientes aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   ANALYTICS TAB (MÉTRICAS)
========================================= */
function AnalyticsTab({ bookings, stats }: any) {
  // Mock data calculations for analytics
  const completedBookings = bookings.filter((b:any) => b.status === "full_paid" || b.status === "partial_paid").length;
  const pendingBookings = bookings.filter((b:any) => b.status === "pending").length;
  const cancelledBookings = bookings.filter((b:any) => b.status === "cancelled").length;

  return (
    <div className="space-y-8 animate-reveal-up pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black font-kanit italic uppercase tracking-tighter text-foreground">
          Panel de <span className="text-primary">Métricas</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Analíticas y Performance (BETA)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-premium rounded-[2.5rem] p-8 border-white/10 relative overflow-hidden group hover:border-primary/40 transition-all duration-500">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 mb-3">Efectividad Global</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black italic font-kanit text-foreground tracking-tighter">
                {bookings.length > 0 ? Math.round((completedBookings / bookings.length) * 100) : 0}<span className="text-primary">%</span>
              </h3>
              <TrendingUp className="w-7 h-7 text-primary mb-2 animate-bounce shadow-primary/20" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/60 mt-4 uppercase tracking-widest">{completedBookings} de {bookings.length} Pagados</p>
          </div>

          <div className="glass-premium rounded-[2.5rem] p-8 border-white/10 relative overflow-hidden group hover:border-danger/40 transition-all duration-500">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-danger/10 rounded-full blur-3xl group-hover:bg-danger/20 transition-all"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 mb-3">Fuga de Capital</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black italic font-kanit text-danger tracking-tighter">{pendingBookings}</h3>
              <Activity className="w-7 h-7 text-danger mb-2 opacity-80" />
            </div>
            <p className="text-[10px] font-black text-danger/80 mt-4 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse"></span>
              Requiere Gestión
            </p>
          </div>

          <div className="glass-premium rounded-[2.5rem] p-8 border-white/10 relative overflow-hidden group hover:border-accent/40 transition-all duration-500">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/70 mb-3">Cancelaciones</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black italic font-kanit text-foreground/90 tracking-tighter">{cancelledBookings}</h3>
              <XCircle className="w-7 h-7 text-muted-foreground/50 mb-2" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/60 mt-4 uppercase tracking-widest leading-none">Ratio 30 días</p>
          </div>
        </div>

        {/* Placeholder Chart Area */}
        <div className="lg:col-span-2 glass-premium rounded-[2.5rem] p-8 border-border/50 shadow-2xl flex flex-col justify-between min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter">Evolución de Reservas</h3>
              <p className="text-xs text-muted-foreground">Últimos 7 días</p>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-1"></div>
              <span className="text-[10px] font-black uppercase text-muted-foreground">Ingresos</span>
            </div>
          </div>
          
          <div className="flex-1 w-full relative mt-4 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[
                 { day: 'LUN', val: 40 },
                 { day: 'MAR', val: 65 },
                 { day: 'MIE', val: 35 },
                 { day: 'JUE', val: 85 },
                 { day: 'VIE', val: 55 },
                 { day: 'SAB', val: 95 },
                 { day: 'DOM', val: 100 },
               ]}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} />
                 <YAxis hide />
                 <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }} itemStyle={{ color: '#2cfc7d', fontWeight: 'bold' }} />
                 <Bar dataKey="val" name="Ocupación %" fill="#2cfc7d" radius={[6, 6, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 glass-premium rounded-[2.5rem] p-8 border-border/50 shadow-2xl flex flex-col items-center justify-center text-center">
            <PieChart className="w-16 h-16 text-primary mb-6 opacity-80" />
            <h3 className="text-xl font-black font-kanit italic uppercase tracking-tighter mb-2">Reportes Detallados</h3>
            <p className="text-sm text-muted-foreground mb-6">La sección de analíticas avanzadas estará disponible próximamente con gráficos interactivos y exportación PDF/Excel.</p>
            <button className="px-6 py-3 rounded-xl bg-surface-elevated border border-border/50 text-xs font-black uppercase tracking-widest text-muted-foreground">Próximamente</button>
        </div>
      </div>
    </div>
  );
}
