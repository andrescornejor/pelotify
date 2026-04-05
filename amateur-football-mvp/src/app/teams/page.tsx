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
          <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/3 blur-[120px] rounded-full pointer-events-none" />
        </>
      )}

      {/* Header & Tabs */}
      <div
        className={cn(
          'sticky top-0 z-30 pt-4 pb-6 -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-14 2xl:-mx-16 px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 border-b border-foreground/5 shadow-2xl shadow-black/5',
          isPerfMode ? 'bg-background' : 'bg-background/80 md:backdrop-blur-xl'
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 w-full py-2">
          {/* Title Area */}
          <div className="flex flex-col shrink-0">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black italic text-foreground uppercase tracking-tighter leading-none drop-shadow-md">
              Asociación <span className="text-foreground/40">de Clubes</span>
            </h1>
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-primary mt-3 drop-shadow-sm">
              Gestioná, Explorá, Desafiá
            </p>
          </div>

          {/* Search Area */}
          <div className="flex-1 w-full lg:max-w-xl xl:max-w-2xl flex gap-3 relative z-10">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="BUSCÁ TU PRÓXIMO RIVAL..."
                className="w-full h-12 md:h-14 bg-foreground/[0.02] border border-foreground/5 rounded-2xl pl-12 pr-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-foreground outline-none focus:border-primary/30 focus:bg-foreground/[0.04] transition-all shadow-inner"
              />
            </div>
            <button className="w-12 h-12 md:w-14 md:h-14 bg-foreground/[0.02] border border-foreground/5 rounded-2xl flex shrink-0 items-center justify-center text-foreground/50 hover:text-foreground transition-all shadow-inner hover:bg-foreground/[0.04]">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
            {!myTeam && (
              <Link
                href="/team-builder"
                className="h-12 md:h-14 px-8 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-all active:scale-95 shadow-lg shadow-primary/20 italic"
              >
                <PlusCircle className="w-4 h-4" /> FUNDAR CLUB
              </Link>
            )}
            {myTeam && (
              <div className="h-12 md:h-14 px-6 bg-foreground/[0.03] border border-foreground/5 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50 italic">
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
              initial={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="group overflow-hidden"
            >
              <Link
                href={`/team?id=${myTeam.id}`}
                className="relative flex flex-col md:flex-row items-center p-8 bg-surface-elevated border border-primary/20 rounded-[3rem] hover:border-primary/50 transition-all shadow-2xl shadow-primary/10 overflow-hidden"
              >
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />

                <div className="w-full relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-6">
                  {/* Left Side: Logo + Info */}
                  <div className="flex items-center gap-6 md:gap-8">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-primary blur-2xl rounded-full opacity-20 group-hover:opacity-50 transition-opacity duration-500" />
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-background border-4 border-primary/20 flex items-center justify-center overflow-hidden relative shadow-xl transform group-hover:scale-105 transition-transform duration-500">
                        {myTeam.logo_url ? (
                          <img
                            src={myTeam.logo_url}
                            alt={myTeam.name}
                            className="w-full h-full object-cover relative z-10"
                          />
                        ) : (
                          <JerseyVisualizer 
                            primaryColor={myTeam.primary_color || '#18181b'} 
                            secondaryColor={myTeam.secondary_color || '#10b981'} 
                            pattern={(myTeam.jersey_pattern as any) || 'solid'}
                            className="w-16 h-16"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">
                           <Shield className="w-3 h-3" /> TU SEDE OFICIAL
                        </span>
                        {isCaptain && (
                          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[9px] font-black uppercase tracking-widest border border-accent/20">
                            CAPITÁN
                          </span>
                        )}
                      </div>
                      <h3 className="text-3xl md:text-5xl font-black italic text-foreground uppercase tracking-tighter leading-none group-hover:text-primary transition-colors text-surface-foreground drop-shadow-md">
                        {myTeam.name}
                      </h3>
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40 mt-3 md:mt-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary opacity-70" /> {myTeam.members_count} JUGADORES EN PLANTEL
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Stats + Action */}
                  <div className="flex items-center gap-8 bg-background/40 backdrop-blur-sm p-4 md:p-6 rounded-[2rem] border border-foreground/5 w-full md:w-auto">
                    <div className="flex flex-col items-center justify-center md:items-end flex-1 md:flex-none py-2 md:py-0 border-r md:border-r-0 border-foreground/10 md:pr-0">
                      <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-none mb-2 md:mb-1">
                        Puntos ELO
                      </span>
                      <span className="text-3xl md:text-4xl font-black text-foreground italic leading-none drop-shadow-lg">
                        {myTeam.elo}
                      </span>
                    </div>
                    
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-primary text-background rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-primary/30 shrink-0">
                      <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Se movió la barra de búsqueda al header alineada con el título */}

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {teams.map((team, index) => (
            <motion.div 
              key={team.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] blur-md" />

              <div className="glass-premium border border-foreground/5 relative overflow-hidden group-hover:border-primary/30 transition-all rounded-[2.5rem] bg-surface flex flex-col h-full shadow-2xl">
                {/* Banner Header */}
                <div className="relative h-28 w-full bg-surface-elevated flex justify-between items-start p-6">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity z-0" />
                   {/* Badge ELO */}
                   <div className="relative z-10 bg-background/80 backdrop-blur-md border border-foreground/10 rounded-2xl px-4 py-2 flex flex-col items-center shadow-lg">
                      <span className="text-xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        {team.elo}
                      </span>
                      <span className="text-[8px] font-black text-foreground/60 uppercase tracking-widest mt-0.5">
                        PUNTOS
                      </span>
                   </div>
                   
                   {/* Decorative Badge */}
                   <div className="relative z-10 w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center border border-foreground/10">
                      <Trophy className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                   </div>
                </div>

                {/* Team Info */}
                <div className="relative px-6 pb-6 pt-0 flex-1 flex flex-col">
                  {/* Logo overlapping the banner */}
                  <div className="absolute -top-12 left-6 w-24 h-24 bg-surface rounded-[1.5rem] border-4 border-surface shadow-xl flex items-center justify-center overflow-hidden group-hover:-translate-y-2 group-hover:scale-105 transition-transform duration-500 z-20">
                    {team.logo_url ? (
                      <div className="relative w-full h-full">
                         <div className="absolute inset-0 bg-gradient-to-tr from-foreground/10 to-transparent z-10" />
                         <img
                           src={team.logo_url}
                           alt={team.name}
                           className="w-full h-full object-cover relative z-0"
                         />
                      </div>
                    ) : (
                      <JerseyVisualizer 
                        primaryColor={team.primary_color || '#18181b'} 
                        secondaryColor={team.secondary_color || '#10b981'} 
                        pattern={(team.jersey_pattern as any) || 'solid'}
                        className="w-14 h-14"
                      />
                    )}
                  </div>

                  <div className="mt-14 space-y-2 flex-1">
                    <h3 className="text-2xl font-black italic text-foreground uppercase tracking-tighter truncate leading-none">
                      {team.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-[9px] font-black text-foreground/50 uppercase tracking-widest py-1">
                      <span className="flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1 rounded-full">
                        <Users className="w-3 h-3 text-foreground/70" /> {team.members_count} Jugadores
                      </span>
                      {team.members_count > 4 && (
                        <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                          <Shield className="w-3 h-3" /> CLUB ACTIVO
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-6 relative z-10">
                    <Link
                      href={`/team?id=${team.id}`}
                      className="flex-1 h-14 bg-foreground/[0.03] border border-foreground/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-foreground/[0.06] transition-all flex items-center justify-center"
                    >
                      Ver Club
                    </Link>

                    {isCaptain && (
                      <button
                        onClick={() => openChallengeModal(team)}
                        className="flex-1 h-14 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent/80 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                      >
                        <Swords className="w-4 h-4" /> RETAR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
            <div className="w-24 h-24 bg-foreground/[0.02] rounded-[3rem] flex items-center justify-center border border-dashed border-foreground/10">
              <Search className="w-8 h-8 text-foreground/50" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-black text-foreground italic uppercase tracking-tighter">
                Sin Oponentes en la Mira
              </p>
              <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">
                El ecosistema está vacío. Sé el pionero fundando tu club.
              </p>
            </div>
            {!myTeam && (
              <Link
                href="/team-builder"
                className="h-14 px-10 bg-primary text-background rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20 hover:bg-foreground hover:text-background transition-all active:scale-95"
              >
                <Shield className="w-4 h-4" /> Fundar Club
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── CHALLENGE MODAL ── */}
      <AnimatePresence>
        {challengeModalOpen && targetTeam && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChallengeModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full max-w-2xl bg-background border-2 border-foreground/10 rounded-[2.5rem] md:rounded-[3.5rem] p-6 sm:p-8 md:p-12 relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
              <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/4" />

              <div className="flex items-start justify-between mb-8 relative z-10 shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent/20 to-accent/5 flex items-center justify-center border border-accent/30 shadow-inner">
                    <Swords className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-black italic text-foreground uppercase tracking-tighter leading-none drop-shadow-md">
                      Lanzar Reto
                    </h3>
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-accent mt-2 flex items-center gap-2">
                       Vs. <span className="text-foreground">{targetTeam.name}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setChallengeModalOpen(false)}
                  className="w-12 h-12 bg-foreground/5 border border-foreground/10 rounded-2xl flex items-center justify-center text-foreground/50 hover:bg-foreground/10 hover:text-foreground transition-all active:scale-90 shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSendChallenge} className="space-y-6 relative z-10 overflow-y-auto no-scrollbar pr-2 flex-col flex h-full pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4 shrink-0">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                      <CalendarDays className="w-4 h-4 text-primary" /> Fecha del Partido
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
                            className={`flex-shrink-0 w-16 h-20 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-primary border-primary text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] scale-105'
                                : 'bg-surface border-foreground/10 text-foreground/50 hover:border-foreground/30 hover:bg-surface-elevated'
                            }`}
                          >
                            <span className="text-2xl font-black italic leading-none mb-1">
                              {dayNumber}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none">
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
                          className={`w-16 h-20 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center ${
                            challengeDate &&
                            !Array.from({ length: 14 }).some((_, i) => {
                              const d = new Date();
                              d.setDate(d.getDate() + i);
                              return d.toISOString().split('T')[0] === challengeDate;
                            })
                              ? 'bg-primary border-primary text-black shadow-lg scale-105'
                              : 'bg-surface border-foreground/10 text-foreground/50 hover:bg-surface-elevated'
                          }`}
                        >
                          <CalendarDays className="w-5 h-5 mb-1" />
                          <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                            OTRO
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                      <Clock className="w-4 h-4 text-primary" /> Hora Estimada
                    </label>
                    <div className="relative group">
                      <select
                        required
                        value={challengeTime}
                        onChange={(e) => setChallengeTime(e.target.value)}
                        className="w-full h-[80px] md:h-[88px] bg-surface border border-foreground/10 rounded-2xl px-6 text-sm md:text-base font-bold uppercase text-foreground outline-none focus:border-primary/50 focus:bg-surface-elevated transition-all appearance-none cursor-pointer shadow-inner"
                      >
                        <option value="" disabled className="bg-background">
                          Selecciona una hora
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
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4 shrink-0">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                      <DollarSign className="w-4 h-4 text-primary" /> Pesos (x Jugador)
                    </label>
                    <input
                      type="number"
                      value={challengePrice}
                      onChange={(e) => setChallengePrice(e.target.value)}
                      className="w-full h-16 bg-surface border border-foreground/10 rounded-2xl px-6 text-sm font-bold text-foreground outline-none focus:border-primary/50 focus:bg-surface-elevated transition-all shadow-inner"
                      placeholder="Ej: 5000"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                      <MapPin className="w-4 h-4 text-primary" /> Predio o Locación
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Predio La Finta"
                      value={challengeLocation}
                      onChange={(e) => {
                        setChallengeLocation(e.target.value);
                        if (e.target.value) setChallengeVenues([]); 
                      }}
                      className="w-full h-16 bg-surface border border-foreground/10 rounded-2xl px-6 text-[11px] font-black uppercase tracking-wide text-foreground outline-none focus:border-primary/50 focus:bg-surface-elevated transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-3 shrink-0 pt-2">
                  <label className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                    <Swords className="w-4 h-4 text-primary" /> O propón canchas para votar (máx 3)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-surface border border-foreground/5 p-3 rounded-[2rem] shadow-inner max-h-[160px] overflow-y-auto no-scrollbar">
                    {ROSARIO_VENUES.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setChallengeLocation(''); 
                          if (challengeVenues.includes(v.displayName || v.name)) {
                            setChallengeVenues((prev) =>
                              prev.filter((cv) => cv !== (v.displayName || v.name))
                            );
                          } else if (challengeVenues.length < 3) {
                            setChallengeVenues((prev) => [...prev, v.displayName || v.name]);
                          }
                        }}
                        className={`px-4 py-3.5 rounded-[1rem] border-2 transition-all flex items-center justify-center text-center ${
                          challengeVenues.includes(v.displayName || v.name)
                            ? 'bg-primary/10 border-primary text-primary font-black scale-[0.98]'
                            : 'bg-background border-foreground/5 text-foreground/60 hover:bg-foreground/5 hover:border-foreground/10 font-bold'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider leading-tight">
                            {v.displayName || v.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 shrink-0 pt-2">
                  <label className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /> Mensaje Incendiario (Opcional)
                  </label>
                  <textarea
                    placeholder="Escribí acá un mensajito picante para el rival..."
                    value={challengeMessage}
                    onChange={(e) => setChallengeMessage(e.target.value)}
                    className="w-full h-24 bg-surface border border-foreground/10 rounded-[1.5rem] p-5 text-xs text-foreground/90 font-black uppercase tracking-wide outline-none focus:border-accent/50 focus:bg-surface-elevated transition-all resize-none shadow-inner"
                  />
                </div>

                <div className="pt-6 shrink-0 mt-auto">
                  <button
                    type="submit"
                    disabled={isSendingChallenge}
                    className="w-full h-16 md:h-20 bg-accent text-white font-black italic text-sm uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-accent/20 hover:bg-foreground hover:text-background hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden relative group/btn"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    {isSendingChallenge ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin relative z-10" /> <span className="relative z-10">PROCESANDO...</span>
                      </>
                    ) : (
                      <>
                        <Swords className="w-7 h-7 relative z-10" /> <span className="relative z-10">CONFIRMAR RETO OFICIAL</span>
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
