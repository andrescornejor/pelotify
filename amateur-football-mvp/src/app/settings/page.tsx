'use client';

import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Bell,
  LogOut,
  ChevronRight,
  User,
  Zap,
  ZapOff,
  Cpu,
  MapPin,
  Save,
  Loader2,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { initializePushNotifications } from '@/lib/notifications';
import {
  buildUpdatedPreferences,
  getGoalLabel,
  getUsageSnapshot,
  getUserPreferences,
  type UserPreferences,
} from '@/lib/personalization';
import { SPORT_META, type Sport } from '@/lib/sports';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { performanceMode, setPerformanceMode } = useSettings();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [usage, setUsage] = useState(getUsageSnapshot());

  useEffect(() => {
    if (!user) return;
    setPreferences(getUserPreferences(user.user_metadata));
    setUsage(getUsageSnapshot());
  }, [user]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
  };

  const toggleSport = (sport: Sport) => {
    if (!preferences) return;

    const exists = preferences.notifications.sports.includes(sport);
    const nextSports = exists
      ? preferences.notifications.sports.filter((item) => item !== sport)
      : [...preferences.notifications.sports, sport];

    setPreferences({
      ...preferences,
      favoriteSports: exists
        ? preferences.favoriteSports.filter((item) => item !== sport)
        : Array.from(new Set([...preferences.favoriteSports, sport])),
      notifications: {
        ...preferences.notifications,
        sports: nextSports.length > 0 ? nextSports : [sport],
      },
    });
  };

  const savePreferences = async () => {
    if (!user || !preferences) return;
    setIsSaving(true);
    setStatusMessage('');

    try {
      const nextPreferences = buildUpdatedPreferences(user.user_metadata, preferences);
      const { error } = await supabase.auth.updateUser({
        data: { preferences: nextPreferences },
      });

      if (error) throw error;
      setPreferences(nextPreferences);
      setStatusMessage('Preferencias guardadas.');
    } catch (error: unknown) {
      setStatusMessage(error instanceof Error ? error.message : 'No pudimos guardar tus preferencias.');
    } finally {
      setIsSaving(false);
    }
  };

  const enablePush = async () => {
    if (!user) return;
    setStatusMessage('');
    const token = await initializePushNotifications(user.id);
    setStatusMessage(token ? 'Push activadas para este dispositivo.' : 'No se pudo activar push.');
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      <div className="relative overflow-hidden bg-background p-8 lg:p-12 border-b border-foreground/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-2 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-foreground/5 rounded-2xl flex items-center justify-center border border-foreground/10 shadow-lg">
              <Settings className="w-6 h-6 text-foreground/40" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">
              Preferencias
            </span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-foreground italic uppercase tracking-tighter"
          >
            Configuración
          </motion.h1>
          <p className="text-foreground/50 font-medium text-sm mt-2 max-w-md">
            Ajustá apariencia, retención, notificaciones inteligentes y tu cuenta desde un solo lugar.
          </p>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto w-full px-6 py-8 space-y-10 relative z-10"
      >
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3 pl-2">
            <Sun className="w-4 h-4 text-foreground/50" />
            <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Apariencia</h2>
          </div>

          <div className="glass-premium p-2 rounded-[2rem] border border-foreground/5 flex gap-2">
            {[
              { key: 'light' as const, label: 'Día', icon: Sun },
              { key: 'dark' as const, label: 'Noche', icon: Moon },
              { key: 'system' as const, label: 'Sistema', icon: Monitor },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`flex-1 flex flex-col items-center gap-2 p-6 rounded-[1.5rem] transition-all duration-300 ${
                  theme === key
                    ? 'bg-primary border-primary shadow-[0_10px_30px_rgba(16,185,129,0.3)] text-black'
                    : 'bg-transparent text-foreground/50 hover:bg-foreground/5 border-transparent'
                } border`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3 pl-2">
            <Cpu className="w-4 h-4 text-foreground/50" />
            <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Rendimiento</h2>
          </div>

          <div className="glass-premium p-4 rounded-[2rem] border border-foreground/5 space-y-3">
            <button
              onClick={() => setPerformanceMode(!performanceMode)}
              className="w-full flex items-center justify-between p-4 rounded-[1.5rem] bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors group border border-transparent hover:border-foreground/5"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                    performanceMode
                      ? 'bg-primary/20 border-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'bg-foreground/5 border-foreground/10'
                  }`}
                >
                  {performanceMode ? (
                    <Zap className="w-5 h-5 text-primary" />
                  ) : (
                    <ZapOff className="w-5 h-5 text-foreground/30" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black text-foreground uppercase">Modo Rendimiento</span>
                  <span className="text-[10px] text-foreground/50 font-black uppercase tracking-widest mt-0.5">
                    {performanceMode ? 'Activado (Más fluido)' : 'Desactivado (Más efectos)'}
                  </span>
                </div>
              </div>
              <div
                className={`w-12 h-6 rounded-full relative transition-all duration-300 border ${
                  performanceMode ? 'bg-primary border-primary' : 'bg-foreground/10 border-foreground/5'
                }`}
              >
                <motion.div
                  animate={{ x: performanceMode ? 26 : 2 }}
                  className="absolute top-1 left-0 w-4 h-4 rounded-full bg-background shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </button>
            <p className="px-4 text-[9px] text-foreground/30 font-black uppercase tracking-widest leading-relaxed">
              Reduce desenfoques y animaciones pesadas en móviles con menos recursos.
            </p>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3 pl-2">
            <Bell className="w-4 h-4 text-foreground/50" />
            <h2 className="text-lg font-black text-foreground uppercase tracking-tight">
              Comunidad y retención
            </h2>
          </div>

          <div className="glass-premium p-5 rounded-[2rem] border border-foreground/5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <MetricCard label="Visitas" value={String(usage.totalVisits)} />
              <MetricCard label="Racha" value={`${usage.streakDays} días`} highlight />
              <MetricCard label="Sección top" value={usage.favoriteSection} />
            </div>

            {preferences && (
              <>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                    Notificaciones inteligentes
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <PreferenceChip
                      active={preferences.notifications.enabled}
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            enabled: !preferences.notifications.enabled,
                          },
                        })
                      }
                      label={preferences.notifications.enabled ? 'Push activas' : 'Push pausadas'}
                    />
                    <PreferenceChip
                      active={preferences.notifications.nearbyOnly}
                      inverted
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            nearbyOnly: !preferences.notifications.nearbyOnly,
                          },
                        })
                      }
                      label="Solo cerca de mí"
                    />
                    <PreferenceChip
                      active={preferences.notifications.reminders}
                      dark
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          notifications: {
                            ...preferences.notifications,
                            reminders: !preferences.notifications.reminders,
                          },
                        })
                      }
                      label="Recordatorios"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                    Deportes priorizados
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(SPORT_META) as Sport[]).map((sport) => {
                      const active = preferences.notifications.sports.includes(sport);
                      return (
                        <button
                          key={sport}
                          onClick={() => toggleSport(sport)}
                          className={`rounded-[1.4rem] border p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                            active
                              ? 'bg-primary text-black border-primary'
                              : 'bg-foreground/[0.03] text-foreground/50 border-foreground/10'
                          }`}
                        >
                          <span className="text-xl">{SPORT_META[sport].icon}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {SPORT_META[sport].shortLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                      Zona objetivo
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-primary absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        value={preferences.notifications.zone}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            preferredZone: e.target.value,
                            notifications: { ...preferences.notifications, zone: e.target.value },
                          })
                        }
                        className="w-full h-14 rounded-[1.2rem] border border-foreground/10 bg-foreground/[0.03] pl-11 pr-4 font-bold outline-none"
                        placeholder="Ej: Centro, Alberdi, Fisherton"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                      Objetivo principal
                    </label>
                    <div className="rounded-[1.2rem] border border-foreground/10 bg-foreground/[0.03] px-4 h-14 flex items-center text-sm font-black text-foreground">
                      <Trophy className="w-4 h-4 text-primary mr-3" />
                      {getGoalLabel(preferences.goal)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    onClick={enablePush}
                    className="flex-1 h-14 rounded-[1.2rem] border border-foreground/10 bg-foreground/[0.03] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-foreground/[0.06] transition-all"
                  >
                    Activar push en este equipo
                  </button>
                  <button
                    onClick={savePreferences}
                    disabled={isSaving}
                    className="flex-1 h-14 rounded-[1.2rem] bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar preferencias
                  </button>
                </div>
              </>
            )}

            {statusMessage && (
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                {statusMessage}
              </p>
            )}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3 pl-2">
            <User className="w-4 h-4 text-foreground/50" />
            <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Cuenta</h2>
          </div>

          <div className="glass-premium p-4 rounded-[2rem] border border-foreground/5 space-y-2">
            <Link href="/profile/me">
              <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors group border border-transparent hover:border-foreground/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-foreground uppercase">Editar Perfil</span>
                    <span className="text-[10px] text-foreground/50 font-black uppercase tracking-widest mt-0.5">
                      Avatar, nombre y posición
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="pt-8 border-t border-foreground/5 space-y-4">
          <div className="flex items-center gap-3 pl-2">
            <h2 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">
              Zona Restringida
            </h2>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-red-500/[0.02] hover:bg-red-500/10 transition-all border border-red-500/10 hover:border-red-500/30 group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-sm font-black text-red-500 uppercase tracking-widest">
                Cerrar Sesión
              </span>
            </div>
          </button>

          <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] italic font-kanit">
            <span className="text-foreground/30">PELOTI</span>
            <span className="text-primary/40">FY</span>
            <span className="text-foreground/20 ml-2">v1.0.0</span>
          </p>
        </motion.section>
      </motion.div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-[1.4rem] border border-foreground/10 p-4 bg-foreground/[0.02]">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{label}</p>
      <p className={`mt-2 font-black italic ${highlight ? 'text-2xl text-primary' : 'text-2xl text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}

function PreferenceChip({
  active,
  label,
  onClick,
  inverted = false,
  dark = false,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  inverted?: boolean;
  dark?: boolean;
}) {
  const className = active
    ? dark
      ? 'bg-foreground text-background border-foreground'
      : inverted
        ? 'bg-white text-black border-white'
        : 'bg-primary text-black border-primary'
    : 'bg-foreground/[0.03] text-foreground/50 border-foreground/10';

  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-[1rem] border text-[10px] font-black uppercase tracking-widest transition-all ${className}`}
    >
      {label}
    </button>
  );
}
