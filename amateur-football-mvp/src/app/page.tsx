'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Target,
  Users,
  Calendar,
  Zap,
  Star,
  Activity,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  PlusCircle,
  Search,
  MessageSquare,
  Flame,
  User2,
  Sparkles,
  Award,
  Shield,
  Crown,
  Play,
  Instagram,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { OnboardingTour } from '@/components/OnboardingTour';
import { JerseyVisualizer } from '@/components/JerseyVisualizer';
import { getHighlights, Highlight } from '@/lib/highlights';
import { RankUpAnimation } from '@/components/RankUpAnimation';

// --- TYPES & CONSTANTS ---

interface Rank {
  name: string;
  minElo: number;
  color: string;
  icon: any;
}

const RANKS: Rank[] = [
  { name: 'HIERRO', minElo: 0, color: '#94a3b8', icon: Shield },
  { name: 'BRONCE', minElo: 500, color: '#d97706', icon: Activity },
  { name: 'PLATA', minElo: 1000, color: '#94a3b8', icon: Target },
  { name: 'ORO', minElo: 1500, color: '#fbbf24', icon: Trophy },
  { name: 'PLATINO', minElo: 2000, color: '#2dd4bf', icon: Award },
  { name: 'DIAMANTE', minElo: 2500, color: '#3b82f6', icon: Sparkles },
  { name: 'ELITE', minElo: 3000, color: '#8b5cf6', icon: Star },
  { name: 'MAESTRO', minElo: 3500, color: '#f43f5e', icon: Crown },
  { name: 'PELOTIFY', minElo: 4000, color: '#2cfc7d', icon: Zap },
];

const getRankByElo = (elo: number) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (elo >= RANKS[i].minElo) return RANKS[i];
  }
  return RANKS[0];
};

// --- COMPONENTS ---

const SectionDivider = () => (
  <div className="flex items-center gap-6 py-10 opacity-30 select-none">
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    <div className="flex items-center gap-1.5">
      <div className="w-1 h-1 rounded-full bg-primary/40" />
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(44,252,125,0.5)]" />
      <div className="w-1 h-1 rounded-full bg-primary/40" />
    </div>
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
  </div>
);

const FloatingParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -100, 0],
          x: [0, Math.random() * 50 - 25, 0],
          opacity: [0, 0.4, 0],
          scale: [0.5, 1.5, 0.5],
        }}
        transition={{
          duration: 10 + Math.random() * 20,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 10,
        }}
        className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </div>
);

const RankBadge = ({ rankName, size = 'md', className }: { rankName: string; size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const rank = RANKS.find(r => r.name === rankName) || RANKS[0];
  const Icon = rank.icon;

  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeMap[size], className)}>
      <div 
        className="absolute inset-0 blur-xl rounded-full opacity-40" 
        style={{ backgroundColor: rank.color }}
      />
      <div className="relative z-10 flex items-center justify-center">
        <Icon 
          className={cn(iconSizeMap[size], "drop-shadow-lg")} 
          style={{ color: rank.color }} 
        />
      </div>
    </div>
  );
};

const TeamCard = ({ team, performanceMode }: any) => {
  const teamColor = team.primary_color || '#2cfc7d';
  
  return (
    <Link href={`/team?id=${team.id}`} className="block">
      <motion.div
        whileHover={performanceMode ? {} : { scale: 1.01, y: -6 }}
        className="group flex flex-col sm:flex-row items-center justify-between gap-6 p-7 rounded-[3rem] glass-premium border-white/5 hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden shadow-2xl"
      >
        {/* Dynamic Ray Background */}
        {!performanceMode && (
          <>
            <div 
              className="absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-1000"
              style={{ backgroundColor: teamColor }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </>
        )}
        
        <div className="flex items-center gap-8 relative z-10 w-full sm:w-auto">
          <div className="flex flex-col items-center min-w-[100px]">
             <div className="w-24 h-24 rounded-[3rem] bg-surface flex items-center justify-center overflow-hidden border-2 border-white/5 group-hover:border-primary transition-all p-1">
                {team.logo_url ? (
                  <img src={team.logo_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <JerseyVisualizer primaryColor={teamColor} secondaryColor={team.secondary_color || '#fff'} pattern={team.jersey_pattern || 'solid'} className="w-full h-full" />
                )}
             </div>
          </div>
  
          <div className="flex-1 space-y-2">
            <h4 className="text-2xl font-black italic uppercase tracking-tighter text-foreground font-kanit leading-none group-hover:text-primary transition-colors">
              {team.name}
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/[0.03] border border-white/5">
                <Users className="w-3 h-3 text-primary" />
                <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{team.members_count || 0} Miembros</span>
              </div>
            </div>
          </div>
        </div>
 
        <div className="w-14 h-14 rounded-2xl bg-foreground/[0.04] border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all">
          <ArrowRight className="w-6 h-6" />
        </div>
      </motion.div>
    </Link>
  );
};

export default function HomePage() {
  const { user } = useAuth();
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [greeting, setGreeting] = useState('');
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const { performanceMode, setPerformanceMode } = useSettings();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isRankUpOpen, setIsRankUpOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const [teamsRes, matchesRes, playersCountRes] = await Promise.all([
          supabase.from('teams').select('*').limit(3), // Mocking teams for demo if none
          supabase.from('match_participants')
            .select('matches:matches!inner(*)')
            .eq('user_id', user.id)
            .gte('matches.date', new Date().toISOString().split('T')[0])
            .order('date', { foreignTable: 'matches', ascending: true })
            .limit(1),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
        ]);

        if (teamsRes.data) setUserTeams(teamsRes.data);
        if (matchesRes.data?.[0]) {
          const m = (matchesRes.data[0] as any).matches;
          setNextMatch(Array.isArray(m) ? m[0] : m);
        }
        if (playersCountRes.count) setTotalPlayers(playersCountRes.count);

        const { data: recentProfiles } = await supabase
          .from('profiles')
          .select('full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentProfiles) {
          setActivities(recentProfiles.map(p => ({
            user: p.full_name || 'Nuevo Jugador',
            detail: `se ha unido a la liga`,
            time: 'Reciente'
          })));
        }
        const highlightsData = await getHighlights(6);
        if (highlightsData) setHighlights(highlightsData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buen dia');
    else if (hour < 20) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    fetchData();
  }, [user?.id]);

  const statsSummary = useMemo(() => {
    const meta = user?.user_metadata || {};
    return {
      elo: meta.elo || 0,
      totalMatches: meta.matches || 0,
      matchesWon: meta.matches_won || 0,
      winRate: meta.matches > 0 ? Math.round((meta.matches_won / meta.matches) * 100) : 0
    };
  }, [user]);

  const rankCalculation = useMemo(() => {
    const info = getRankByElo(statsSummary.elo);
    const nextR = RANKS[RANKS.findIndex((rank) => rank.name === info.name) + 1] || info;
    const progress = nextR.minElo > 0 ? Math.min(100, (statsSummary.elo / nextR.minElo) * 100) : 100;
    return { info, nextRank: nextR, progress, rank: { ...info, hex: info.color } };
  }, [statsSummary.elo]);

  return (
    <div className={cn("min-h-screen bg-background text-foreground pb-20", performanceMode && "perf-mode")}>
      <OnboardingTour />
      
      <div className="max-w-full mx-auto px-4 sm:px-10 lg:px-16 py-6 lg:py-12 space-y-12">
        {/* Cinematic Hero */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[3rem] shadow-2xl group/hero border border-white/5"
        >
          <div className="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=60&w=1200" className="w-full h-full object-cover opacity-10 grayscale scale-110" alt="" />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
             <FloatingParticles />
          </div>

          <div className="relative z-10 p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12">
             <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border-primary/20">
                   <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{greeting}</span>
                </div>
                
                <h1 className="text-6xl lg:text-8xl font-black italic uppercase italic leading-none font-kanit tracking-tighter">
                   ELITE<br/><span className="text-primary text-glow-primary">PELOTIFY.</span>
                </h1>

                <div className="flex flex-wrap gap-4 pt-4">
                   <Link href="/scouting">
                      <button className="px-10 h-16 rounded-2xl bg-white text-black font-black uppercase text-xs hover:scale-105 transition-all shadow-2xl flex items-center gap-3">
                         MERCADO <TrendingUp className="w-5 h-5" />
                      </button>
                   </Link>
                   <button onClick={() => setIsRankUpOpen(true)} className="px-8 h-16 rounded-2xl glass-premium text-white border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> TEST RANKUP
                   </button>
                </div>
             </div>

             <motion.div 
               whileHover={{ scale: 1.05 }}
               className="relative w-64 h-64 lg:w-80 lg:h-80 cursor-pointer"
               onClick={() => setIsRankUpOpen(true)}
             >
                <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow opacity-20" />
                <div className="absolute inset-8 border border-primary/20 rounded-full animate-spin-slow-reverse opacity-40 shadow-[0_0_50px_rgba(44,252,125,0.1)]" />
                <div className="relative w-full h-full rounded-[4rem] border-4 overflow-hidden flex items-center justify-center bg-surface shadow-2xl transition-all group/avatar" style={{ borderColor: rankCalculation.info.color }}>
                   {user?.user_metadata?.avatar_url ? (
                     <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" alt="" />
                   ) : (
                     <User2 className="w-24 h-24 text-foreground/10" />
                   )}
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                      <rankCalculation.rank.icon className="w-12 h-12" style={{ color: rankCalculation.rank.hex }} />
                      <span className="text-[10px] font-black uppercase tracking-widest">VER PERFIL</span>
                   </div>
                </div>
             </motion.div>
          </div>
        </motion.section>

        {/* Bento Grid Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
           
           {/* Progress Bento */}
           <div className="lg:col-span-7 space-y-8">
              <div className="glass-premium p-10 rounded-[3rem] border-white/5 space-y-10 relative overflow-hidden group">
                  <div className="absolute -top-20 -right-20 w-64 h-64 blur-[100px] opacity-10 bg-primary rounded-full" />
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <RankBadge rankName={rankCalculation.info.name} size="lg" />
                        <div>
                           <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">RANGO ACTUAL</p>
                           <h3 className="text-4xl font-black italic font-kanit uppercase tracking-tighter text-foreground">{rankCalculation.info.name}</h3>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-4xl font-black italic font-kanit text-foreground">{Math.round(rankCalculation.progress)}%</span>
                        <p className="text-[9px] font-black text-foreground/20 uppercase">OBJETIVO: {rankCalculation.nextRank.name}</p>
                     </div>
                  </div>
                  <div className="relative h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${rankCalculation.progress}%` }} className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400" />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 {[
                   { icon: Target, label: 'Win Rate', value: `${statsSummary.winRate}%`, color: '#f43f5e' },
                   { icon: Activity, label: 'Total Matches', value: statsSummary.totalMatches, color: '#3b82f6' }
                 ].map((stat, i) => (
                   <div key={i} className="glass-premium p-8 rounded-[2.5rem] border-white/5 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                         <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{stat.label}</p>
                        <h4 className="text-3xl font-black italic font-kanit text-foreground">{stat.value}</h4>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Next Match Bento */}
           <div className="lg:col-span-5">
              <div className="h-full glass-premium p-10 rounded-[3rem] border-white/5 relative overflow-hidden flex flex-col justify-between group">
                  <div className="absolute inset-0 z-0 opacity-10 grayscale group-hover:grayscale-0 transition-all duration-1000">
                     <img src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=60&w=800" className="w-full h-full object-cover" alt="" />
                     <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  </div>
                  
                  <div className="relative z-10 space-y-10">
                     <div className="flex justify-between items-center">
                        <div className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/20 text-primary font-black text-[10px] tracking-widest">PRÓXIMO RETO</div>
                        <Calendar className="w-5 h-5 text-foreground/40" />
                     </div>

                     {nextMatch ? (
                       <div className="grid grid-cols-5 items-center gap-4">
                          <div className="col-span-2 text-center space-y-4">
                             <div className="w-20 h-20 mx-auto rounded-[2rem] bg-surface flex items-center justify-center p-2 border-2 border-white/10 group-hover:scale-110 transition-transform">
                                <JerseyVisualizer pattern="vertical" primaryColor="#1e40af" secondaryColor="#60a5fa" className="w-full h-full" />
                             </div>
                             <span className="text-sm font-black italic text-white font-kanit uppercase block truncate">{nextMatch.team_a_name}</span>
                          </div>
                          <span className="text-2xl font-black italic text-foreground/20 font-kanit text-center">VS</span>
                          <div className="col-span-2 text-center space-y-4">
                             <div className="w-20 h-20 mx-auto rounded-[2rem] bg-surface flex items-center justify-center p-2 border-2 border-white/10 group-hover:scale-110 transition-transform">
                                <JerseyVisualizer pattern="solid" primaryColor="#991b1b" secondaryColor="#ef4444" className="w-full h-full" />
                             </div>
                             <span className="text-sm font-black italic text-white font-kanit uppercase block truncate">{nextMatch.team_b_name}</span>
                          </div>
                       </div>
                     ) : (
                       <div className="py-20 text-center opacity-30">
                          <Target className="w-12 h-12 mx-auto mb-4" />
                          <p className="text-[10px] font-black uppercase">Sin Retos Pendientes</p>
                       </div>
                     )}
                  </div>

                  <Link href="/match/create" className="relative z-10 pt-10">
                     <button className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">PROGRAMAR PARTIDO</button>
                  </Link>
              </div>
           </div>

           {/* Teams Bento */}
           <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-black italic uppercase font-kanit text-foreground">Mis Clubes</h3>
                 <Link href="/team-builder" className="text-[10px] font-black text-primary uppercase tracking-widest">Nuevo Club +</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 {userTeams.length > 0 ? (
                    userTeams.map((team, idx) => (
                      <TeamCard key={idx} team={team} performanceMode={performanceMode} />
                    ))
                 ) : (
                    <div className="col-span-2 p-12 text-center glass-premium rounded-[2rem] border-white/5 opacity-40 italic uppercase text-[10px] tracking-widest">Aún no perteneces a ningún club</div>
                 )}
              </div>
           </div>

           {/* Activity Bento */}
           <div className="lg:col-span-4 h-full">
              <div className="glass-premium rounded-[3rem] border-white/5 h-full overflow-hidden flex flex-col">
                 <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">ACTIVIDAD</span>
                    <div className="flex gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                       <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                    </div>
                 </div>
                 <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[400px]">
                    {activities.map((act, i) => (
                       <div key={i} className="flex gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center shrink-0 group-hover:border-primary transition-colors">
                             <User2 className="w-5 h-5 text-foreground/20" />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-white uppercase">{act.user} <span className="font-medium text-foreground/40">{act.detail}</span></p>
                             <p className="text-[8px] font-black text-primary/60 uppercase tracking-tighter">{act.time}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

        </div>

        {/* Highlights Section */}
        <SectionDivider />
        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black italic uppercase italic italic font-kanit">FutTok Highlights</h3>
              <Link href="/highlights" className="text-[10px] font-black text-primary uppercase tracking-widest">Ver Todos</Link>
           </div>
           <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
              {highlights.slice(0, 6).map((h, i) => (
                 <div key={i} className="aspect-[9/16] rounded-3xl bg-surface relative overflow-hidden group border border-white/5 shadow-2xl">
                    <img src={h.thumbnail_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=60&w=400'} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4">
                       <p className="text-[8px] font-black text-white uppercase">{h.profiles?.name || 'Jugador'}</p>
                       <div className="flex items-center gap-1 mt-1 text-primary">
                          <Flame className="w-3 h-3 fill-current" />
                          <span className="text-[7px] font-black uppercase">{h.likes_count || 0} Hype</span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Footer */}
        <footer className="pt-20 pb-10 border-t border-white/5 flex flex-col items-center gap-8">
           <h2 className="text-4xl font-black italic uppercase font-kanit text-foreground/20">PELOTIFY</h2>
           <div className="flex gap-8 text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">
              <Link href="/terms" className="hover:text-primary transition-colors">Términos</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
              <Link href="/support" className="hover:text-primary transition-colors">Soporte</Link>
           </div>
           <div className="flex gap-6 pt-4">
              {[Instagram, MessageSquare, Shield].map((Icon, i) => (
                <Icon key={i} className="w-5 h-5 text-foreground/20 cursor-pointer hover:text-primary transition-colors" />
              ))}
           </div>
           <p className="text-[8px] font-black text-foreground/10 uppercase tracking-[0.5em] pt-8">© 2026 Pelotify Global League</p>
        </footer>
      </div>

      <AnimatePresence>
        {isRankUpOpen && (
          <RankUpAnimation 
            newRankName={rankCalculation.info.name} 
            onClose={() => setIsRankUpOpen(false)} 
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-slow-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        .animate-spin-slow-reverse { animation: spin-slow-reverse 8s linear infinite; }
        .perf-mode * { animation-duration: 0.1s !important; transition-duration: 0.1s !important; }
      `}</style>
    </div>
  );
}
