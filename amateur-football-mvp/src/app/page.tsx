'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Calendar,
  Zap,
  Star,
  Activity,
  TrendingUp,
  MapPin,
  Clock,
  Search,
  MessageSquare,
  User2,
  Shield,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { OnboardingTour } from '@/components/OnboardingTour';
import LandingPage from '@/components/LandingPage';
import { EmptyState, HomePageSkeleton, StoryCarousel } from '@/components/home';
import { CreatePostQuickInput } from '@/components/feed/CreatePostQuickInput';
import { useHomeData } from '@/hooks/useHomeData';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  if (user?.is_business) {
    return null; // Will be redirected by AuthContext
  }

  const { data: homeData, isLoading: isDataLoading } = useHomeData(user?.id);

  const nextMatch = homeData?.nextMatch || null;
  const activities = homeData?.activities || [];
  const highlights = homeData?.highlights || [];
  const recentPosts = homeData?.recentPosts || [];

  const [countdownText, setCountdownText] = useState<string | null>(null);
  const { performanceMode, setPerformanceMode } = useSettings();

  const isLoading = isDataLoading && !homeData;

  // Handle Countdown Update
  useEffect(() => {
    if (!nextMatch) {
      setCountdownText(null);
      return;
    }
    const updateCountdown = () => {
      const target = new Date(`${nextMatch.date}T${nextMatch.time}`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdownText('YA EMPIEZA! ');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (hours >= 24) {
        setCountdownText(null);
        return;
      }
      if (hours > 0) {
        setCountdownText(`FALTAN ${hours}H ${minutes}M`);
      } else {
        setCountdownText(`EN SOLO ${minutes} MINUTOS`);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [nextMatch]);

  if (isLoading) return <HomePageSkeleton />;
  if (!user) return <LandingPage />;

  return (
    <div className={cn('relative min-h-screen bg-background font-sans', performanceMode && 'perf-mode')}>
      <OnboardingTour />
      
      {/* MOBILE PERF TOGGLE */}
      <button
        onClick={() => setPerformanceMode(!performanceMode)}
        className={cn(
          'fixed bottom-24 right-6 z-[100] w-12 h-12 rounded-2xl md:hidden flex flex-col items-center justify-center transition-all active:scale-90 border',
          performanceMode
            ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(44,252,125,0.4)]'
            : 'glass border-foreground/20 text-primary shadow-lg shadow-primary/10'
        )}
      >
        <Zap className={cn('w-5 h-5', performanceMode && 'fill-current')} />
        <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">
          {performanceMode ? 'LITE ON' : 'FX ON'}
        </span>
      </button>

      <div className="max-w-full mx-auto px-2 sm:px-6 lg:px-10 xl:px-14 py-4 lg:py-6 relative z-10 w-full overflow-x-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT/MAIN COLUMN (Feed) */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">
            
            {/* Story/FutTok Carousel */}
            <div className="-mx-2 px-2 sm:mx-0 sm:px-0">
               <StoryCarousel highlights={highlights} />
            </div>

            {/* Quick Create Input */}
            <CreatePostQuickInput />

            {/* Title Feed */}
            <div className="flex flex-col gap-1 px-1 pt-2">
              <h2 className="text-xl lg:text-2xl font-black text-foreground italic uppercase tracking-tighter font-kanit">
                Pelotify Feed
              </h2>
              <span className="text-[9px] font-semibold text-foreground/40 tracking-wide font-kanit">
                Lo último en la comunidad
              </span>
            </div>

            {/* Unified Feed (Recent Posts) */}
            <div className="space-y-4">
              {recentPosts.length > 0 ? (
                recentPosts.map((post: any, idx: number) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-premium rounded-[2rem] border-foreground/10 overflow-hidden group hover:border-primary/20 transition-all duration-300 shadow-xl"
                  >
                    <div className="p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Link href={`/profile/${post.author.id}`} className="relative">
                            <div className={cn(
                              "w-10 h-10 rounded-full overflow-hidden border border-foreground/10 shadow-sm",
                              post.author.is_pro && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            )}>
                              {post.author.avatar_url ? (
                                <img src={post.author.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-surface-elevated flex items-center justify-center text-foreground/40 font-bold text-sm">
                                  {post.author.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            {post.author.is_pro && (
                              <div className="absolute -bottom-1 -right-1 bg-primary text-background p-0.5 rounded shadow-lg">
                                <Zap className="w-2.5 h-2.5 fill-black" />
                              </div>
                            )}
                          </Link>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-foreground leading-none">{post.author.name}</span>
                              {post.author.is_pro && <span className="text-[8px] font-black text-primary uppercase tracking-tighter bg-primary/10 px-1 rounded">PRO</span>}
                            </div>
                            <div className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-0.5">
                              @{post.author.handle || post.author.name.toLowerCase().replace(/\s+/g, '')}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-foreground/20 uppercase">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-[15px] text-foreground/80 leading-snug whitespace-pre-wrap font-medium">
                        {post.content}
                      </p>

                      {post.image_url && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-foreground/10 shadow-sm mt-2">
                          <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        </div>
                      )}

                      <div className="flex items-center gap-6 pt-3 mt-1 border-t border-foreground/5">
                        <div className="flex items-center gap-1.5 text-foreground/50 hover:text-pink-500 transition-colors cursor-pointer">
                          <Heart className={cn("w-4 h-4", post.user_has_liked && "fill-pink-500 text-pink-500")} />
                          <span className="text-xs font-bold">{post.likes_count || 0}</span>
                        </div>
                        <Link href={`/feed?post=${post.id}`} className="flex items-center gap-1.5 text-foreground/50 hover:text-primary transition-colors cursor-pointer">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs font-bold">{post.comments_count || 0}</span>
                        </Link>
                        <Link href={`/feed?post=${post.id}`} className="ml-auto text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline">
                          RESPONDER
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <EmptyState icon={MessageSquare} title="Sé el primero" description="Rompe el hielo y escribe algo en el muro." />
              )}
            </div>

             {/* Small System Activities at bottom of feed or mixed in */}
             {activities.length > 0 && (
                <div className="mt-8 pt-8 border-t border-foreground/5 space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em] px-2 mb-2">Comunidad Radar</h3>
                    {activities.slice(0,5).map((activity: any, idx: number) => (
                      <div key={idx} className="px-4 py-3 rounded-2xl bg-surface/30 flex items-center gap-3 border border-foreground/5">
                         <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                            {activity.type === 'RANK_UP' ? <TrendingUp className="w-4 h-4 text-primary" /> : <Star className="w-4 h-4 text-accent" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-foreground">
                              {activity.user} <span className="text-foreground/50 font-normal tracking-tight"> {activity.detail}</span>
                            </p>
                          </div>
                      </div>
                    ))}
                </div>
             )}
          </div>

          {/* RIGHT SIDEBAR (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-4 space-y-6 sticky top-24">
             {/* Next Match Widget */}
             <div id="featured-match" className="relative group/match overflow-hidden rounded-[2.5rem] glass-premium border-primary/20 shadow-xl">
               {!performanceMode && (
                 <>
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover/match:bg-primary/10 transition-all duration-700" />
                   <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                 </>
               )}

               <div className="relative z-10 p-6 space-y-6">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-foreground/30 shadow-[0_0_6px_rgba(var(--foreground-rgb),0.3)] animate-pulse" />
                     <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] font-kanit">AGENDA</span>
                   </div>
                 </div>

                 {nextMatch ? (
                   <div className="space-y-5">
                      <div className="flex flex-col items-center justify-center py-5 bg-surface/50 rounded-2xl border border-foreground/10 relative overflow-hidden group/m">
                         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                         
                         <div className="flex items-center gap-4 relative z-10">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 bg-background rounded-full border border-primary/30 shadow-lg flex items-center justify-center overflow-hidden">
                                 <Shield className="w-5 h-5 text-primary" />
                              </div>
                              <span className="text-[10px] font-black text-foreground w-16 text-center truncate italic font-kanit">{nextMatch.team_a_name || 'LOCAL'}</span>
                            </div>
                            <span className="text-[22px] md:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary-dark font-kanit">VS</span>
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 bg-background rounded-full border border-emerald-500/30 shadow-lg flex items-center justify-center overflow-hidden">
                                 <Zap className="w-5 h-5 text-emerald-500" />
                              </div>
                              <span className="text-[10px] font-black text-foreground w-16 text-center truncate italic font-kanit">{nextMatch.team_b_name || 'VISITA'}</span>
                            </div>
                         </div>
                         
                         {countdownText && (
                            <div className="mt-4 text-[9px] font-black uppercase text-primary tracking-[0.15em] bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shadow-lg">
                               {countdownText}
                            </div>
                         )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                         <div className="bg-surface/50 p-2.5 rounded-xl border border-foreground/5 shadow-inner">
                            <span className="text-[8px] font-black text-foreground/40 uppercase"><Calendar className="w-3 h-3 inline pb-0.5 mr-1"/> FECHA</span>
                            <div className="text-[11px] font-bold mt-1 truncate">{new Date(nextMatch.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div>
                         </div>
                         <div className="bg-surface/50 p-2.5 rounded-xl border border-foreground/5 shadow-inner">
                            <span className="text-[8px] font-black text-foreground/40 uppercase"><Clock className="w-3 h-3 inline pb-0.5 mr-1"/> HORA</span>
                            <div className="text-[11px] font-bold mt-1">{nextMatch.time?.slice(0, 5)} HS</div>
                         </div>
                      </div>

                      <Link href={`/match?id=${nextMatch.id}`} className="w-full flex">
                         <motion.button className="w-full h-11 bg-foreground text-background font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-black transition-colors shadow-lg">
                            ENTRAR A CANCHA
                         </motion.button>
                      </Link>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center text-center py-6 gap-3">
                      <div className="w-12 h-12 rounded-full border border-dashed border-foreground/20 flex items-center justify-center text-foreground/30 mb-2 bg-surface/30">
                         <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black italic text-foreground/80 uppercase font-kanit">Agenda Libre</span>
                      <p className="text-[11px] text-foreground/50">No tienes partidos programados.</p>
                      <Link href="/search" className="mt-2 text-[10px] font-black bg-primary/10 text-primary px-4 py-2 border border-primary/20 rounded-full uppercase tracking-widest hover:bg-primary hover:text-black transition-colors">
                        Buscar Rival
                      </Link>
                   </div>
                 )}
               </div>
             </div>
             
             {/* Quick Links */}
             <div className="glass-premium p-5 rounded-[2rem] border-foreground/15 shadow-md">
                <h3 className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-4">Descubrir</h3>
                <div className="space-y-1">
                   <Link href="/establecimientos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.03] transition-colors group">
                      <MapPin className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                      <span className="text-[11px] font-bold text-foreground/70 group-hover:text-foreground">Sedes Cercanas</span>
                   </Link>
                   <Link href="/teams" className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.03] transition-colors group">
                      <Shield className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                      <span className="text-[11px] font-bold text-foreground/70 group-hover:text-foreground">Ligas y Equipos</span>
                   </Link>
                   <Link href="/ranks" className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/[0.03] transition-colors group">
                      <Trophy className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                      <span className="text-[11px] font-bold text-foreground/70 group-hover:text-foreground">Ranking Top 100</span>
                   </Link>
                </div>
             </div>

             {/* Footer Links */}
             <div className="flex items-center gap-4 text-[9px] font-medium text-foreground/40 px-2 pt-2">
                <span>© 2026 Pelotify</span>
                <Link href="/settings" className="hover:underline hover:text-foreground/60 transition-colors">Privacidad</Link>
                <Link href="/settings" className="hover:underline hover:text-foreground/60 transition-colors">Términos</Link>
             </div>
             <br/><br/>
          </div>
        </div>
      </div>
    </div>
  );
}
