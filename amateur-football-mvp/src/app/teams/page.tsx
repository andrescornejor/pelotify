'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  Users,
  Search,
  PlusCircle,
  Trophy,
  ArrowRight,
  Camera,
  Loader2,
  Sparkles,
  Filter,
  Swords,
  Clock,
  MapPin,
  CalendarDays,
  X,
  DollarSign,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeams, createTeam, Team } from '@/lib/teams';
import { createTeamChallenge } from '@/lib/teamChallenges';
import { uploadTeamLogo } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { TeamsSkeleton } from '@/components/Skeletons';
import Link from 'next/link';
import { AVAILABLE_TIMES } from '@/lib/constants';
import { ROSARIO_VENUES } from '@/lib/venues';
import { useSettings } from '@/contexts/SettingsContext';
import { JerseyVisualizer } from '@/components/JerseyVisualizer';

export default function TeamsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { performanceMode: isPerfMode } = useSettings();
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Challenge Modal State
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [targetTeam, setTargetTeam] = useState<Team | null>(null);
  const [challengeDate, setChallengeDate] = useState('');
  const [challengeTime, setChallengeTime] = useState('');
  const [challengeLocation, setChallengeLocation] = useState('');
  const [challengePrice, setChallengePrice] = useState('0');
  const [challengeVenues, setChallengeVenues] = useState<string[]>([]);
  const [challengeMessage, setChallengeMessage] = useState('');
  const [isSendingChallenge, setIsSendingChallenge] = useState(false);

  const fetchTeams = async () => {
    try {
      const data = await getTeams(user?.id);
      const userTeam = data.find((t) => t.captain_id === user?.id || t.is_member);

      if (userTeam) {
        setMyTeam(userTeam);
      }

      // Filter out user's team for explore view
      setTeams(data.filter((t) => t.id !== userTeam?.id));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [user?.id]);

  if (authLoading || isLoading) {
    return <TeamsSkeleton />;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const isCaptain = myTeam?.captain_id === user.id;

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      let logoUrl = '';
      if (logoFile) {
        logoUrl = await uploadTeamLogo(logoFile, newTeamName);
      }
      const team = await createTeam(newTeamName, newTeamDesc, user.id, logoUrl);
      router.push(`/team?id=${team.id}`);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openChallengeModal = (team: Team) => {
    setTargetTeam(team);
    setChallengeModalOpen(true);
  };

  const handleSendChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam || !targetTeam) return;

    setIsSendingChallenge(true);
    try {
      await createTeamChallenge(
        myTeam.id,
        targetTeam.id,
        challengeDate,
        challengeTime,
        challengeLocation || (challengeVenues.length > 0 ? challengeVenues[0] : 'Por definir'),
        challengeMessage,
        parseInt(challengePrice),
        challengeVenues
      );
      alert('¡Desafío enviado con éxito!');
      setChallengeModalOpen(false);
      setTargetTeam(null);
    } catch (err: any) {
      console.error(err);
      alert('Error al enviar el desafío: ' + err.message);
    } finally {
      setIsSendingChallenge(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-8 p-4 sm:p-6 lg:px-10 lg:pt-4 xl:px-14 2xl:px-16 max-w-full mx-auto min-h-screen bg-background relative overflow-hidden',
        isPerfMode && 'perf-mode'
      )}
    >
      {/* Ambient Effects */}
      {!isPerfMode && (
        <>
          <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        </>
      )}

      {/* Header & Tabs */}
      <div
        className={cn(
          'sticky top-0 z-30 pt-4 pb-6 -mx-4 px-4 lg:-mx-16 lg:px-16 border-b border-foreground/5 shadow-2xl shadow-black/5',
          isPerfMode ? 'bg-background' : 'bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40'
        )}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 max-w-screen-2xl mx-auto">
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none flex flex-col md:flex-row md:items-center md:gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60 drop-shadow-sm">Asociación</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-primary-dark glow-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">de Clubes</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <span className="text-primary animate-pulse">●</span>
              <span className="text-foreground/60">Gestioná, Explorá, Desafiá</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!myTeam && (
              <Link
                href="/team-builder"
                className="h-14 px-8 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-all active:scale-95 shadow-lg shadow-primary/20 italic"
              >
                <PlusCircle className="w-4 h-4" /> FUNDAR CLUB
              </Link>
            )}
            {myTeam && (
              <div className="px-5 py-2.5 bg-foreground/[0.03] border border-foreground/5 rounded-2xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">
                  Club Oficial
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-12">
        {/* Mi Institución Quick Access */}
        <AnimatePresence>
          {myTeam && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <Link
                href={`/team?id=${myTeam.id}`}
                className="relative flex items-center justify-between p-6 bg-surface border border-primary/20 rounded-[2.5rem] hover:border-primary/50 transition-all shadow-xl shadow-primary/5 group/link overflow-hidden"
              >
                <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

                <div className="flex items-center gap-6 relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary blur-lg rounded-full opacity-20 group-hover/link:opacity-40 transition-opacity" />
                    <div className="w-16 h-16 rounded-2xl bg-surface-elevated border-2 border-primary/20 flex items-center justify-center overflow-hidden relative">
                      {myTeam.logo_url ? (
                        <div className="relative w-full h-full">
                          <img
                            src={myTeam.logo_url}
                            alt={myTeam.name}
                            className="w-full h-full object-cover relative z-10"
                          />
                          <div className="absolute inset-0 bg-surface-elevated flex items-center justify-center opacity-20">
                            <JerseyVisualizer 
                              primaryColor={myTeam.primary_color || '#18181b'} 
                              secondaryColor={myTeam.secondary_color || '#10b981'} 
                              pattern={(myTeam.jersey_pattern as any) || 'solid'}
                              className="w-8 h-8 opacity-40"
                            />
                          </div>
                        </div>
                      ) : (
                        <JerseyVisualizer 
                          primaryColor={myTeam.primary_color || '#18181b'} 
                          secondaryColor={myTeam.secondary_color || '#10b981'} 
                          pattern={(myTeam.jersey_pattern as any) || 'solid'}
                          className="w-10 h-10"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic leading-none mb-2">
                      Tu Sede Oficial
                    </span>
                    <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tighter leading-none group-hover/link:text-primary transition-colors text-surface-foreground">
                      {myTeam.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-none mb-1">
                      Puntos ELO
                    </span>
                    <span className="text-xl font-black text-foreground italic leading-none">
                      {myTeam.elo}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-primary text-background rounded-2xl flex items-center justify-center group-hover/link:scale-110 transition-transform shadow-lg shadow-primary/30">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filter Bar */}
        <div className="flex gap-4 relative z-10">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors duration-300" />
            <input
              type="text"
              placeholder="BUSCÁ TU PRÓXIMO RIVAL..."
              className="w-full h-16 glass-premium rounded-[2rem] pl-14 pr-6 text-[11px] font-black uppercase tracking-[0.3em] text-foreground outline-none focus:border-primary/50 focus:bg-surface-elevated/80 transition-all shadow-lg shadow-black/5 hover:border-primary/30"
            />
            <div className="absolute inset-0 rounded-[2rem] border border-primary/0 group-focus-within:border-primary/20 group-focus-within:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] pointer-events-none transition-all duration-500" />
          </div>
          <button className="w-16 h-16 glass-premium rounded-[2rem] flex items-center justify-center text-foreground/50 hover:text-primary hover:border-primary/50 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] group">
            <Filter className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
          </button>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map((team) => (
            <motion.div key={team.id} whileHover={{ y: -5 }} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] blur-xl" />

              <div className="glass-premium p-8 border border-foreground/5 space-y-8 relative overflow-hidden group-hover:border-primary/30 transition-all rounded-[3rem] bg-surface">
                <div className="flex justify-between items-start">
                  <div className="w-20 h-20 bg-surface-elevated rounded-[1.5rem] border border-foreground/5 flex items-center justify-center overflow-hidden group-hover:scale-110 shadow-2xl transition-transform duration-700 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-foreground/10 to-transparent z-10" />
                    {team.logo_url ? (
                      <div className="relative w-full h-full">
                        <img
                          src={team.logo_url}
                          alt={team.name}
                          className="w-full h-full object-cover relative z-10"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <JerseyVisualizer 
                            primaryColor={team.primary_color || '#18181b'} 
                            secondaryColor={team.secondary_color || '#10b981'} 
                            pattern={(team.jersey_pattern as any) || 'solid'}
                            className="w-12 h-12 opacity-20"
                          />
                        </div>
                      </div>
                    ) : (
                      <JerseyVisualizer 
                        primaryColor={team.primary_color || '#18181b'} 
                        secondaryColor={team.secondary_color || '#10b981'} 
                        pattern={(team.jersey_pattern as any) || 'solid'}
                        className="w-12 h-12"
                      />
                    )}
                  </div>
                  <div className="bg-surface-elevated border border-foreground/5 rounded-2xl px-4 py-2 flex flex-col items-center">
                    <span className="text-xl font-black text-primary italic uppercase tracking-tighter leading-none">
                      {team.elo}
                    </span>
                    <span className="text-[8px] font-black text-foreground/60 uppercase tracking-widest mt-0.5">
                      NIVEL
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tighter truncate leading-none">
                    {team.name}
                  </h3>
                  <div className="flex items-center gap-3 text-[9px] font-black text-foreground/50 uppercase tracking-widest py-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-foreground" /> {team.members_count}/
                    </span>
                    <div className="w-1 h-1 rounded-full bg-foreground/30" />
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-primary" /> CLUB PRO
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/team?id=${team.id}`}
                    className="flex-[2] h-12 bg-foreground/[0.03] border border-foreground/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-foreground/[0.06] transition-all flex items-center justify-center"
                  >
                    Ver Detalles
                  </Link>

                  {isCaptain && (
                    <button
                      onClick={() => openChallengeModal(team)}
                      className="flex-[3] h-12 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent/80 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                    >
                      <Swords className="w-4 h-4" /> Lanzar Reto
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-8 relative">
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none max-w-lg mx-auto" />
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute inset-2 border border-primary/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="relative w-24 h-24 glass-premium rounded-[2.5rem] flex items-center justify-center border border-primary/40 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)] animate-float ring-4 ring-primary/10">
                <Search className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] animate-pulse" />
              </div>
            </div>
            <div className="space-y-4 relative z-10 max-w-md mx-auto">
              <p className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/50 text-glow-primary">
                Sin Oponentes en la Mira
              </p>
              <p className="text-[11px] text-foreground/60 font-bold uppercase tracking-[0.3em] leading-relaxed">
                El ecosistema está vacío. Sé el pionero fundando tu club de élite.
              </p>
            </div>
            {!myTeam && (
              <Link
                href="/team-builder"
                className="relative mt-4 h-16 px-12 glass-premium border-primary/50 text-primary rounded-2xl flex items-center justify-center gap-3 text-[12px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:bg-primary hover:text-background transition-all duration-300 hover:scale-105 active:scale-95 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <Shield className="w-5 h-5 group-hover:animate-bounce relative z-10" /> 
                <span className="relative z-10">Fundar Club</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── CHALLENGE MODAL ── */}
      <AnimatePresence>
        {challengeModalOpen && targetTeam && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChallengeModalOpen(false)}
              className="absolute inset-0 bg-background/60 md:"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full max-w-xl glass-premium border border-foreground/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10 overflow-hidden bg-surface"
            >
              {/* Decorative Background Glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                    <Swords className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black italic text-foreground uppercase tracking-tighter leading-none">
                      Lanzar Reto
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mt-2">
                      Vs. {targetTeam.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setChallengeModalOpen(false)}
                  className="w-12 h-12 bg-foreground/[0.03] border border-foreground/5 rounded-2xl flex items-center justify-center text-foreground/50 hover:text-foreground transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendChallenge} className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                      <CalendarDays className="w-3 h-3 text-primary" /> Fecha
                    </label>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() + i);
                        const dateStr = d.toISOString().split('T')[0];
                        const dayName = d
                          .toLocaleDateString('es-ES', { weekday: 'short' })
                          .replace('.', '')
                          .toUpperCase();
                        const dayNumber = d.getDate();
                        const isSelected = challengeDate === dateStr;

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => setChallengeDate(dateStr)}
                            className={`flex-shrink-0 w-14 h-16 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-primary border-primary text-black'
                                : 'bg-foreground/[0.02] border-foreground/5 text-foreground/40 hover:border-foreground/20'
                            }`}
                          >
                            <span className="text-lg font-black italic leading-none">
                              {dayNumber}
                            </span>
                            <span className="text-[7px] font-black uppercase tracking-widest">
                              {dayName}
                            </span>
                          </button>
                        );
                      })}
                      <div className="relative flex-shrink-0 group">
                        <input
                          type="date"
                          value={challengeDate}
                          onChange={(e) => setChallengeDate(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                        />
                        <div
                          className={`w-14 h-16 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center ${
                            challengeDate &&
                            !Array.from({ length: 14 }).some((_, i) => {
                              const d = new Date();
                              d.setDate(d.getDate() + i);
                              return d.toISOString().split('T')[0] === challengeDate;
                            })
                              ? 'bg-primary border-primary text-black'
                              : 'bg-foreground/[0.02] border-foreground/5 text-foreground/40'
                          }`}
                        >
                          <CalendarDays className="w-4 h-4" />
                          <span className="text-[7px] font-black uppercase tracking-widest">
                            OTRO
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                      <Clock className="w-3 h-3 text-primary" /> Hora
                    </label>
                    <div className="relative group">
                      <select
                        required
                        value={challengeTime}
                        onChange={(e) => setChallengeTime(e.target.value)}
                        className="w-full h-14 bg-foreground/[0.02] border border-foreground/5 rounded-2xl px-4 text-xs font-bold uppercase text-foreground outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-background">
                          ¿A qué hora?
                        </option>
                        {AVAILABLE_TIMES.map((t) => {
                          const [h, m] = t.split(':');
                          const hour = parseInt(h);
                          const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          return (
                            <option key={t} value={t} className="bg-background text-foreground">
                              {displayHour}:{m} {ampm}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/20 group-focus-within:text-primary">
                        <svg
                          width="10"
                          height="6"
                          viewBox="0 0 12 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 1L6 6L11 1"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                      <DollarSign className="w-3 h-3 text-primary" /> Pesos (x Jugador)
                    </label>
                    <input
                      type="number"
                      value={challengePrice}
                      onChange={(e) => setChallengePrice(e.target.value)}
                      className="w-full h-14 bg-foreground/[0.02] border border-foreground/5 rounded-2xl px-5 text-xs font-bold text-foreground outline-none focus:border-primary/50 transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                      <MapPin className="w-3 h-3 text-primary" /> Predio específico
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Predio La Finta"
                      value={challengeLocation}
                      onChange={(e) => {
                        setChallengeLocation(e.target.value);
                        if (e.target.value) setChallengeVenues([]); // Clear candidates if specific is set
                      }}
                      className="w-full h-14 bg-foreground/[0.02] border border-foreground/5 rounded-2xl px-5 text-xs font-bold uppercase tracking-wide text-foreground outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                    <Swords className="w-3 h-3 text-primary" /> O proponer candidatos para votar
                    (máx 3)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto no-scrollbar p-1">
                    {ROSARIO_VENUES.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setChallengeLocation(''); // Clear specific if voting
                          if (challengeVenues.includes(v.displayName || v.name)) {
                            setChallengeVenues((prev) =>
                              prev.filter((cv) => cv !== (v.displayName || v.name))
                            );
                          } else if (challengeVenues.length < 3) {
                            setChallengeVenues((prev) => [...prev, v.displayName || v.name]);
                          }
                        }}
                        className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all text-left ${
                          challengeVenues.includes(v.displayName || v.name)
                            ? 'bg-primary border-primary text-black'
                            : 'bg-foreground/[0.02] border-foreground/5 text-foreground/40 hover:border-foreground/20'
                        }`}
                      >
                        {v.displayName || v.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-foreground/50 uppercase tracking-[0.2em] pl-2">
                    Mensajito para el rival (Opcional)
                  </label>
                  <textarea
                    placeholder="Preparen las canilleras..."
                    value={challengeMessage}
                    onChange={(e) => setChallengeMessage(e.target.value)}
                    className="w-full h-20 bg-foreground/[0.02] border border-foreground/5 rounded-2xl p-5 text-xs text-foreground/80 font-bold uppercase tracking-wide outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSendingChallenge}
                    className="w-full h-16 bg-accent text-foreground font-black italic text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-accent/20 hover:bg-foreground hover:text-background transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSendingChallenge ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> PROCESANDO RETO...
                      </>
                    ) : (
                      <>
                        <Swords className="w-5 h-5" /> ENVIAR DESAFÍO OFICIAL
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="pb-24 lg:pb-0" />
    </div>
  );
}
