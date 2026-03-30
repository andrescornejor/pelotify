import React, { Suspense } from 'react';
import LandingPage from '@/components/LandingPage';
import { HomePageSkeleton } from '@/components/home/HomePageSkeleton';
import { PerfLayout, PerfStatCardsGrid } from '@/components/home/PerfLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { RoadToGlory } from '@/components/home/RoadToGlory';
import { CommunitySection } from '@/components/home/CommunitySection';
import { ActivityFeed } from '@/components/home/ActivityFeed';
import { MatchBanner } from '@/components/home/MatchBanner';
import { StatCard } from '@/components/home/StatCard';
import { TeamCard } from '@/components/home/TeamCard';
import { FuttokHighlightsList } from '@/components/home/FuttokHighlights';
import { SectionDivider } from '@/components/home/HomeSections';
import { 
  Trophy, 
  Target, 
  Award, 
  Star, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  MessageSquare, 
  ArrowRight, 
  Users, 
  Sparkles, 
  Activity 
} from 'lucide-react';
import Link from 'next/link';
import { getHighlights } from '@/lib/highlights';
import { createClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

async function HomeDataWrapper({ user }: { user: any }) {
  const supabase = await createClient();

  let teamsRes: any = { data: [] };
  let matchesRes: any = { data: [] };
  let playersCountRes: any = { count: 0 };
  let recentProfiles: any = { data: [] };
  let highlightsData: any = [];

  try {
    const results = await Promise.all([
      supabase.from('team_members').select('team_id, teams(*)').eq('user_id', user.id).limit(3),
      supabase
        .from('match_participants')
        .select('matches:matches!inner(*)')
        .eq('user_id', user.id)
        .gte('matches.date', new Date().toISOString().split('T')[0])
        .order('date', { foreignTable: 'matches', ascending: true })
        .limit(1),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('full_name, created_at, elo').order('created_at', { ascending: false }).limit(5),
      getHighlights(6, supabase)
    ]);
    
    teamsRes = results[0];
    matchesRes = results[1];
    playersCountRes = results[2];
    recentProfiles = results[3];
    highlightsData = results[4];
  } catch (err) {
    console.error('Error during RSC fetching:', err);
  }

  const userTeams = teamsRes?.data ? teamsRes.data.map((t: any) => t.teams).filter(Boolean) : [];
  
  let nextMatch = null;
  if (matchesRes?.data?.[0]) {
    const m = (matchesRes.data[0] as any).matches;
    nextMatch = Array.isArray(m) ? m[0] : m;
  }

  const totalPlayers = playersCountRes?.count || 0;

  let activities: any[] = [];
  if (recentProfiles?.data) {
    activities = recentProfiles.data.map((p: any) => ({
      type: 'RANK_UP',
      user: p.full_name || 'Nuevo Jugador',
      detail: `se ha unido a la liga`,
      time: 'Reciente'
    }));
  }

  const highlights = highlightsData || [];
  
  // Calculations
  const metadata = user?.user_metadata || {};
  const elo = metadata?.elo || 0;
  const totalMatches = metadata?.matches || 0;
  const matchesWon = metadata?.matches_won || 0;
  const winRate = totalMatches > 0 ? Math.min(100, Math.round((matchesWon / totalMatches) * 100)) : 0;
  const statsSummary = { elo, totalMatches, matchesWon, winRate };

  const hour = new Date().getHours();
  let greeting = 'Buenas noches';
  if (hour < 12) greeting = 'Buen dia';
  else if (hour < 20) greeting = 'Buenas tardes';

  const userName = user?.name || user?.user_metadata?.name || 'Jugador';

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 280, damping: 24, delay: i * 0.07 },
    }),
  };

  const statCardsData = [
    {
      icon: Trophy,
      label: 'Rango Actual',
      value: elo > 0 ? 'CALCULADO' : 'NVL 1',
      color: '#2cfc7d',
      tooltip: 'Tu rango competitivo',
    },
    {
      icon: Activity,
      label: 'Partidos',
      value: statsSummary.totalMatches.toString(),
      color: '#6366f1',
      tooltip: 'Partidos jugados',
    },
    {
      icon: Star,
      label: 'MVPs',
      value: (metadata?.mvp_count || 0).toString(),
      color: '#f59e0b',
      tooltip: 'Veces elegido MVP',
    },
    {
      icon: TrendingUp,
      label: 'Win Rate',
      value: `${winRate}%`,
      color: '#f43f5e',
      tooltip: 'Tu efectividad de victoria',
    },
  ];

  return (
    <PerfLayout>
      <HeroSection 
        user={user}
        userName={userName}
        metadata={metadata}
        greeting={greeting}
        statsSummary={statsSummary}
        highlights={highlights}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          <PerfStatCardsGrid>
            {statCardsData.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} i={i} fadeUp={fadeUp} />
            ))}
          </PerfStatCardsGrid>

          <SectionDivider />

          <CommunitySection totalPlayers={totalPlayers} fadeUp={fadeUp} />

          <SectionDivider />

          <RoadToGlory statsSummary={statsSummary} metadata={metadata} fadeUp={fadeUp} />

          <SectionDivider />

          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                Tendencias en FutTok
              </h2>
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                Lo mejor de la comunidad
              </span>
            </div>
            <Link
              href="/highlights"
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black text-white hover:text-emerald-400 transition-all tracking-[0.2em] uppercase glass-premium border-emerald-500/20 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/5"
            >
              Explorar FutTok <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <FuttokHighlightsList highlights={highlights} />

          <SectionDivider />

          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                Tus Equipos
              </h2>
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                Plantel Profesional
              </span>
            </div>
            <Link
              href="/teams"
              className="group flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[9px] font-black text-foreground/55 hover:text-foreground transition-all tracking-[0.2em] uppercase glass border-white/10"
            >
              Ver todos <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-col gap-5 pb-6 lg:pb-0">
            {userTeams.length > 0 ? (
              userTeams.map((team: any) => <TeamCard key={team.id} team={team} />)
            ) : null}
          </div>

          <SectionDivider />
          
          <section id="activity-feed" className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                  Feed de Actividad
                </h2>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                  Comunidad en tiempo real
                </span>
              </div>
              <Activity className="w-5 h-5 text-primary/30" />
            </div>

            <ActivityFeed activities={activities} />
          </section>
        </div>

        <div className="lg:col-span-4 xl:col-span-4 space-y-6">
          <div id="featured-match" className="relative group/match overflow-hidden rounded-[3rem] glass-premium border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
             <MatchBanner nextMatch={nextMatch} performanceMode={false} />
          </div>

          <div className="glass-premium p-6 rounded-[2.5rem] border-white/5 space-y-4">
             <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Accesos Rápidos</h3>
             <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Mercado', icon: Target, href: '/scouting' },
                  { label: 'Mis Amigos', icon: Users, href: '/friends' },
                  { label: 'Chat Global', icon: MessageSquare, href: '/messages' },
                  { label: 'Configuración', icon: Target, href: '/settings' }
                ].map((link, idx) => (
                  <Link key={idx} href={link.href}>
                    <button className="w-full h-12 px-4 rounded-xl flex items-center justify-between group hover:bg-foreground/[0.03] transition-all border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-3">
                        <link.icon className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 group-hover:text-foreground">{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/40 group-hover:translate-x-1 transition-all" />
                    </button>
                  </Link>
                ))}
             </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 pt-16 pb-24 lg:pb-12 border-t border-foreground/[0.05]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <img src="/logo_pelotify.png" alt="Pelotify Logo" className="w-12 h-12 object-contain" />
              <span className="text-xl font-black italic uppercase tracking-tighter text-foreground font-kanit">PELOTIFY</span>
            </div>
            <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em] leading-relaxed max-w-sm">
              La plataforma definitiva para el fútbol amateur competitivo. Domina la cancha.
            </p>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30">
          <span> 2026 Pelotify. Todos los derechos reservados.</span>
          <span className="flex items-center gap-2">Diseñado con <Sparkles className="w-3 h-3 text-primary" /> para campeones</span>
        </div>
      </footer>
    </PerfLayout>
  );
}

// Ensure the outer page stays dynamic because of cookies() and auth.
export default async function HomePage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return <LandingPage />;
    }

    return (
      <Suspense fallback={<HomePageSkeleton />}>
        <HomeDataWrapper user={user} />
      </Suspense>
    );
  } catch (err) {
    console.error('Fatal crash on HomePage RSC:', err);
    // Silent fail to LandingPage instead of showing 500 error on Vercel
    return <LandingPage />;
  }
}
