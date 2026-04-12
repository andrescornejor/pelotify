import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Star, Award, Zap } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { getRankByElo } from '@/lib/ranks';
import { RankBadge } from './RankBadge';
import { useTheme } from '@/contexts/ThemeContext';

interface FifaCardProps {
  player: {
    name: string;
    overall: number;
    position: string;
    image?: string;
    stats: {
      pac: number;
      sho: number;
      pas: number;
      dri: number;
      def: number;
      phy: number;
    };
    countryUrl?: string;
    clubUrl?: string;
    mvpTrophies?: number;
    badges?: string[];
    pendingPoints?: number;
  };
}

export function FifaCard({ player }: FifaCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const rank = getRankByElo(player.overall);
  
  // Determine if we should use light mode styles
  // We check for 'light' theme explicitly
  const isLight = theme === 'light';

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), {
    stiffness: 200,
    damping: 25,
  });
  const glareX = useTransform(x, [-0.5, 0.5], ['20%', '80%']);
  const glareY = useTransform(y, [-0.5, 0.5], ['20%', '80%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const statBoost = (val: number) => Math.min(99, val);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: '1000px' }}
      className="relative w-72 h-[430px] mx-auto cursor-default select-none group"
    >
      {/* Card shadow */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-52 h-6 rounded-full transition-all duration-500"
        style={{ 
          background: isLight ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.3)', 
          filter: 'blur(16px)',
          opacity: isLight ? 0.4 : 1
        }}
      />

      <div
        className={cn(
          "w-full h-full rounded-[2.5rem] overflow-hidden relative transition-all duration-700",
          isLight ? "border-zinc-200/80 shadow-2xl" : "border-[#2cfc7d]/30 shadow-2xl"
        )}
        style={{
          background: isLight 
            ? 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)'
            : 'linear-gradient(165deg, #111115 0%, #050505 50%, #000000 100%)',
          borderWidth: '2px',
          borderStyle: 'solid',
          boxShadow: isLight
            ? '0 30px 60px -12px rgba(0,0,0,0.12), inset 0 2px 0 rgba(255,255,255,1), 0 0 0 1px rgba(0,0,0,0.02)'
            : '0 40px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(44,252,125,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Texture overlay */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500 mix-blend-overlay",
            isLight ? "opacity-[0.03]" : "opacity-15"
          )}
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
          }}
        />

        {/* Top radial glow */}
        <motion.div
          animate={{ opacity: isLight ? [0.05, 0.1, 0.05] : [0.12, 0.22, 0.12] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{
            background: isLight
              ? 'radial-gradient(ellipse at 60% 30%, rgba(16,185,129,0.1) 0%, transparent 65%)'
              : 'radial-gradient(ellipse at 60% 30%, rgba(16,185,129,0.2) 0%, transparent 65%)',
          }}
        />

        {/* Holographic glare */}
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-0 hover:opacity-100 transition-opacity duration-300 z-40"
          style={
            {
              background: `radial-gradient(ellipse at ${glareX} ${glareY}, rgba(255,255,255,0.12) 0%, transparent 60%)`,
              opacity: isLight ? 0.3 : 0.6,
            } as any
          }
        />

        {/* Dynamic Foil Shader for Premium Ranks */}
        {(rank.name === 'DIAMANTE' || rank.name === 'ELITE' || rank.name === 'LEYENDA') && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none mix-blend-color-dodge opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: 'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.3) 30%, rgba(255,20,147,0.4) 40%, rgba(0,255,255,0.4) 50%, rgba(255,255,255,0.3) 60%, transparent 80%)',
              backgroundSize: '300% 300%',
              backgroundPosition: useTransform(x, [-0.5, 0.5], ['0% 0%', '100% 100%']),
            } as any}
          />
        )}

        {/* Shimmer scan */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <motion.div
            animate={{ translateX: ['-150%', '150%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            className="absolute inset-y-0 w-1/3"
            style={{
              background: isLight
                ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.1), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              transform: 'skewX(-20deg)',
            }}
          />
        </div>

        {/* Skill Points Glowing Notification */}
        {player.pendingPoints && player.pendingPoints > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 z-40"
          >
             <div className="relative group">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary rounded-full blur-md" 
                />
                <div className="relative bg-black border border-primary/50 text-primary px-2 py-1 rounded-full flex items-center gap-1.5 shadow-2xl">
                   <Zap className="w-2.5 h-2.5 fill-primary" />
                   <span className="text-[8px] font-black uppercase tracking-wider">{player.pendingPoints} Puntos</span>
                </div>
             </div>
          </motion.div>
        )}

        {/* Top decoration bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: isLight
              ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)',
          }}
        />

        {/* Contrast Helper for Top Info (Rating/Position) */}
        {!isLight && (
          <div
            className="absolute inset-y-0 left-0 w-1/3 z-10 pointer-events-none"
            style={{
              background:
                'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
            }}
          />
        )}

        {/* Top-left: Rating & Position */}
        <div className="absolute top-5 left-5 flex flex-col items-center z-30 gap-1 drop-shadow-2xl">
          <div className="relative group filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
            <span
              className="text-[2.8rem] font-black italic leading-none inline-block"
              style={{
                backgroundImage: isLight
                  ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #2cfc7d 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {player.overall}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "text-[9px] font-black uppercase tracking-[0.3em] border-t pt-1 w-full text-center transition-all duration-500",
                isLight ? "text-slate-900 border-zinc-200" : "text-primary border-primary/50"
              )}
              style={isLight ? {} : { textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
            >
              {player.position}
            </span>
            <RankBadge rankName={rank.name} size="sm" className={cn("scale-75 -mt-1", isLight && "grayscale-[0.2]")} />
          </div>

          {/* MVP trophies */}
          {player.mvpTrophies && player.mvpTrophies > 0 && (
            <div className="mt-2 flex flex-col items-center gap-1 drop-shadow-lg">
              <div className="flex -space-x-1">
                {[...Array(Math.min(player.mvpTrophies, 3))].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3"
                    style={{
                      color: '#f59e0b',
                      fill: '#f59e0b',
                      filter: isLight ? 'none' : 'drop-shadow(0 0 4px rgba(0,0,0,0.8))',
                    }}
                  />
                ))}
              </div>
              <span
                className="text-[6px] font-black uppercase tracking-widest text-[#f59e0b]"
                style={isLight ? {} : { textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
              >
                MVP
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="mt-2 flex flex-col gap-1.5">
            {player.badges?.map((badge, i) => (
              <div
                key={i}
                className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center relative transition-all duration-300 group/badge cursor-help shadow-sm",
                  isLight 
                    ? "bg-white border-zinc-200 hover:bg-slate-50" 
                    : "bg-black/50 border-white/10 hover:bg-black/40"
                )}
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Award className={cn("w-3.5 h-3.5", isLight ? "text-primary" : "text-primary-light")} />
                <div
                  className="absolute left-full ml-1.5 px-2 py-1 rounded text-[7px] font-black text-white uppercase tracking-wider opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-2xl"
                  style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)' }}
                >
                  {badge}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player Image - Now capturing the whole top half */}
        <div
          className="absolute top-0 left-0 right-0 h-[300px] z-10 pointer-events-none overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          }}
        >
          <div className="relative w-full h-full">
            <img
              src={
                player.image ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${player.name}&backgroundColor=transparent`
              }
              alt={player.name}
              crossOrigin="anonymous"
              className={cn(
                'w-full h-full object-bottom transition-all duration-700',
                player.image ? 'object-cover scale-100' : 'object-contain scale-110 translate-y-4',
                isLight && !player.image && 'filter saturate-150 brightness-95'
              )}
              style={{
                filter: isLight ? 'brightness(1) contrast(1.05)' : 'brightness(1.1) contrast(1.05)',
              }}
            />
            {/* Soft glow behind player to separate stats */}
            <div
              className="absolute inset-0 z-[-1]"
              style={{
                background: isLight
                  ? 'radial-gradient(circle at 60% 40%, rgba(16,185,129,0.05) 0%, transparent 70%)'
                  : 'radial-gradient(circle at 60% 40%, rgba(0,0,0,0.4) 0%, transparent 70%)',
              }}
            />
          </div>
        </div>

        {/* Name bar */}
        <div className="absolute z-20" style={{ bottom: '108px', left: 0, right: 0 }}>
          <div
            className={cn(
               "mx-5 py-2 text-center transition-all duration-500",
               isLight ? "bg-white/40 border-slate-200" : "bg-[#2cfc7d]/10 border-[#2cfc7d]/30 shadow-[0_0_15px_rgba(44,252,125,0.1)]"
            )}
            style={{
              background: isLight 
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(44,252,125,0.15), transparent)',
              borderTopWidth: '1px',
              borderBottomWidth: '1px',
              borderStyle: 'solid',
              backdropFilter: 'blur(8px)',
            }}
          >
            <h3
              className={cn(
                "text-base font-black italic uppercase tracking-[0.1em] truncate px-2 transition-colors duration-500",
                isLight ? "text-slate-900" : "text-white"
              )}
              style={isLight ? {} : { textShadow: '0 2px 10px rgba(0,0,0,1)' }}
            >
              {player.name}
            </h3>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-5 left-0 right-0 px-6 z-20">
          <div className="grid grid-cols-2 gap-x-5 gap-y-1">
            {[
              { val: player.stats.pac, label: 'PAC' },
              { val: player.stats.dri, label: 'DRI' },
              { val: player.stats.sho, label: 'SHO' },
              { val: player.stats.def, label: 'DEF' },
              { val: player.stats.pas, label: 'PAS' },
              { val: player.stats.phy, label: 'PHY' },
            ].map((stat, i) => (
              <div
                key={i}
                className={cn(
                  "flex justify-between items-end pb-0.5 group/stat transition-all duration-500 border-b",
                  isLight ? "border-slate-200" : "border-primary/10"
                )}
              >
                <span className={cn(
                  "text-sm font-black italic transition-colors duration-500",
                  isLight ? "text-slate-900 group-hover/stat:text-primary" : "text-white group-hover/stat:text-primary"
                )}>
                  {statBoost(stat.val)}
                </span>
                <span
                  className="text-[7px] font-black uppercase tracking-widest mb-0.5 transition-colors duration-500"
                  style={{ color: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(16,185,129,0.5)' }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom graded overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none transition-all duration-500"
          style={{ 
            background: isLight
              ? 'linear-gradient(to top, rgba(255,255,255,0.7) 0%, transparent 100%)'
              : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' 
          }}
        />
      </div>
    </motion.div>
  );
}
