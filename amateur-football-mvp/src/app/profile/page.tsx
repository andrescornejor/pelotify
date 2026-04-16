'use client';

import { Suspense } from 'react';
import { FifaCard } from '@/components/FifaCard';
import {
  Award,
  History,
  Info,
  Edit2,
  Save,
  X,
  Loader2,
  Trophy,
  Zap,
  MapPin,
  Target,
  Calendar,
  Plus,
  ChevronRight,
  Star,
  Shield,
  Users,
  Trash2,
  AlertTriangle,
  Lock,
  Camera,
  ExternalLink,
  MessageSquare,
  Send,
  Trash,
  Flame,
  Play,
  BadgeCheck,
  Wallet,
  Image as ImageIcon,
  Heart,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getUserMatches, Match } from '@/lib/matches';
import { findVenueByLocation } from '@/lib/venues';
import { ProfileSkeleton } from '@/components/Skeletons';
import { getDominantColor } from '@/lib/colorUtils';
import { uploadUserAvatar } from '@/lib/storage';
import { compressImage, blobToFile } from '@/lib/imageUtils';
import { RankBadge } from '@/components/RankBadge';
import { getRankByElo } from '@/lib/ranks';
import { ShareStory } from '@/components/ShareStory';
import { getUserHighlights, Highlight } from '@/lib/highlights';
import confetti from 'canvas-confetti';
import { SkillPointAllocator } from '@/components/SkillPointAllocator';
import { RadarChart } from '@/components/RadarChart';

interface PlayerStats {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

const DEFAULT_PLAYER = {
  name: 'Jugador',
  overall: 0,
  position: 'DC',
  stats: {
    pac: 0,
    sho: 0,
    pas: 0,
    dri: 0,
    def: 0,
    phy: 0,
  },
};

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading, deleteAccount } = useAuth();

  // Get ID from query param ?id=...
  const id = searchParams.get('id');
  const isMe = id === 'me' || id === user?.id || (!id && user?.id);

  const initialTab = (searchParams.get('tab') as any) || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'futtok' | 'wall' | 'wallet'>(
    ['overview', 'history', 'futtok', 'wall', 'wallet'].includes(initialTab) ? initialTab : 'overview'
  );

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    age: '',
    height: '',
    preferredFoot: 'Derecha',
    position: 'DC',
    bio: '',
    cover_url: '',
    instagram: '',
  });
  const [skillPoints, setSkillPoints] = useState(0);
  const [editedStats, setEditedStats] = useState<PlayerStats>(DEFAULT_PLAYER.stats);

  const [isSaving, setIsSaving] = useState(false);
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [userTeam, setUserTeam] = useState<any>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [mvpCount, setMvpCount] = useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [ambientColor, setAmbientColor] = useState<string | null>(null);

  // FutTok State
  const [userHighlights, setUserHighlights] = useState<Highlight[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false);

  // Comments State
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const { updatePassword } = useAuth();

  // Avatar Upload State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'history', 'futtok', 'wall', 'wallet'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isMe && user) {
      const metadata = user.user_metadata || {};
      // Ensure we have defaults if Google didn't provide them
      setEditedData({
        name: user.name || DEFAULT_PLAYER.name,
        age: (metadata.age || '').toString() || '23',
        height: (metadata.height || '').toString() || '175',
        preferredFoot: metadata.preferredFoot || metadata.preferred_foot || 'Derecha',
        position: (metadata.position || user.user_metadata?.position || 'DC').toUpperCase(),
        bio: metadata.bio || '',
        cover_url: metadata.cover_url || '',
        instagram: metadata.instagram || '',
      });
    }
  }, [isMe, user]);

  useEffect(() => {
    if (searchParams.get('pro_success') === 'true') {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FBBF24', '#F59E0B', '#D97706', '#000000', '#ffffff'],
      });
      // Optionally remove it from URL
      window.history.replaceState({}, '', '/profile?id=me');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const targetId = id === 'me' || !id ? user?.id : id;
      if (!targetId) return;

      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setTargetProfile(data);
          setSkillPoints(data.skill_points || 0);
          if (data.stats) setEditedStats(data.stats as PlayerStats);
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      } finally {
        setIsLoadingProfile(false);
      }

      // Fetch Gamification Data
      try {
        const [badgesRes, teamRes] = await Promise.all([
          supabase.from('user_badges').select('*').eq('user_id', targetId),
          supabase
            .from('team_members')
            .select('teams(*)')
            .eq('user_id', targetId)
            .eq('status', 'confirmed')
            .maybeSingle(),
        ]);

        if (badgesRes.data) setUserBadges(badgesRes.data);
        if (teamRes.data?.teams) setUserTeam(teamRes.data.teams);

        // IMPORTANT: Calculate MVP using the aggregated count from the profile table, not counting individual votes
        // targetProfile is our DB record fetched above
        const actualMvpCount = targetProfile?.mvp_count || 0;
        setMvpCount(actualMvpCount);

        // Fetch real matches
        const matches = await getUserMatches(targetId);
        setUserMatches(matches);
      } catch (err) {
        console.warn('Error cargando data extra:', err);
      }

      // Fetch Highlights
      setIsLoadingHighlights(true);
      try {
        const highlights = await getUserHighlights(targetId);
        setUserHighlights(highlights);
      } catch (err) {
         console.warn('Error cargando highlights:', err);
      } finally {
        setIsLoadingHighlights(false);
      }
    };

    if (user || !isMe) {
      fetchProfileData();
    }
  }, [user, id, isMe]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      const targetId = id === 'me' || !id ? user?.id : id;
      if (!targetId || activeTab !== 'wall') return;

      setIsLoadingComments(true);
      try {
        const { data, error } = await supabase
          .from('profile_comments')
          .select(
            `
                        *,
                        author:author_id (
                            name,
                            avatar_url
                        )
                    `
          )
          .eq('profile_id', targetId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setComments(data || []);
      } catch (err) {
        console.error('Error cargando comentarios:', err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [user, id, activeTab]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = id === 'me' || !id ? user?.id : id;
    if (!user || !targetId || !newComment.trim()) return;

    setIsPostingComment(true);
    try {
      const { data, error } = await supabase
        .from('profile_comments')
        .insert([
          {
            profile_id: targetId,
            author_id: user.id,
            content: newComment.trim(),
          },
        ])
        .select(
          `
                    *,
                    author:author_id (
                        name,
                        avatar_url
                    )
                `
        )
        .single();

      if (error) throw error;
      setComments([data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error publicando comentario:', err);
      alert('No se pudo publicar el comentario.');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Seguro que quieres borrar este comentario?')) return;

    try {
      const { error } = await supabase.from('profile_comments').delete().eq('id', commentId);

      if (error) throw error;
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Error borrando comentario:', err);
      alert('No se pudo borrar el comentario.');
    }
  };

  const authMetadata = user?.user_metadata || {};
  const dbProfile = targetProfile || {};
  const dbMetadata = dbProfile.user_metadata || {};

  const getField = (field: string, defaultValue: any, snakeCaseField?: string) => {
    if (isMe) {
      return (
        authMetadata[field] ||
        dbProfile[field] ||
        (snakeCaseField ? dbProfile[snakeCaseField] : null) ||
        defaultValue
      );
    }
    return (
      dbProfile[field] ||
      (snakeCaseField ? dbProfile[snakeCaseField] : null) ||
      dbMetadata[field] ||
      defaultValue
    );
  };

  useEffect(() => {
    const currentAvatar = avatarPreview || getField('avatar_url', null);
    if (currentAvatar) {
      getDominantColor(currentAvatar).then((color) => {
        if (color) setAmbientColor(color);
      });
    }
  }, [dbProfile, authMetadata, avatarPreview]);

  const playerStats = useMemo((): PlayerStats => {
    if (isEditing) return editedStats;
    const statsSource = isMe ? authMetadata.stats : dbProfile.stats || dbMetadata.stats;
    if (statsSource && typeof statsSource === 'object') return statsSource as PlayerStats;

    return {
      pac: getField('pac', DEFAULT_PLAYER.stats.pac),
      sho: getField('sho', DEFAULT_PLAYER.stats.sho),
      pas: getField('pas', DEFAULT_PLAYER.stats.pas),
      dri: getField('dri', DEFAULT_PLAYER.stats.dri),
      def: getField('def', DEFAULT_PLAYER.stats.def),
      phy: getField('phy', DEFAULT_PLAYER.stats.phy),
    };
  }, [isMe, authMetadata.stats, dbProfile.stats, dbMetadata.stats, editedStats, isEditing]);
  
  const playerOverall = useMemo(() => {
    return getField(
      'overall',
      Math.round(Object.values(playerStats).reduce((a: number, b: number) => a + b, 0) / 6)
    );
  }, [playerStats, dbProfile, authMetadata]);

  const displayPlayer = useMemo(() => ({
    ...DEFAULT_PLAYER,
    name: (isMe ? user?.name || editedData.name : dbProfile.name) || DEFAULT_PLAYER.name,
    position: getField('position', DEFAULT_PLAYER.position) as string,
    overall: playerOverall as number,
    stats: playerStats,
  }), [isMe, user?.name, editedData.name, dbProfile.name, playerOverall, playerStats]);

  const displayAge = useMemo(() => getField('age', '18'), [dbProfile, authMetadata]);
  const displayHeight = useMemo(() => getField('height', '170'), [dbProfile, authMetadata]);
  const displayFoot = useMemo(() => getField('preferredFoot', 'Derecha', 'preferred_foot'), [dbProfile, authMetadata]);

  const displayMatches = parseInt(`${getField('matches', 0)}`) || 0;
  const displayElo = parseInt(`${getField('elo', 0)}`) || 0;
  const displayGoals = parseInt(`${getField('goals', 0)}`) || 0;
  const displayMatchesWon = parseInt(`${getField('matches_won', 0)}`) || 0;
  const displayMvpCount = parseInt(`${getField('mvp_count', 0)}`) || 0;
  const teamName = userTeam?.name || 'Sin equipo';

  const handleSaveProfile = async () => {
    if (!user?.id) {
      alert('Error: No se encontró ID de usuario.');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Iniciando guardado de perfil para:', user.id);

      let newAvatarUrl = getField('avatar_url', null);
      if (avatarFile) {
        console.log('Subiendo nuevo avatar...');

        // Compress the image before uploading
        try {
          console.log('Comprimiendo imagen...');
          const compressedBlob = await compressImage(avatarFile, 800, 0.8);
          const compressedFile = blobToFile(compressedBlob, avatarFile.name);
          console.log(
            `Imagen comprimida: de ${Math.round(avatarFile.size / 1024)}KB a ${Math.round(compressedFile.size / 1024)}KB`
          );
          newAvatarUrl = await uploadUserAvatar(compressedFile, user.id);
        } catch (compressionError) {
          console.error('Error comprimiendo imagen, intentando subir original:', compressionError);
          newAvatarUrl = await uploadUserAvatar(avatarFile, user.id);
        }

        console.log('Avatar subido:', newAvatarUrl);
      }

      // 1. Update Public Profile (Source of Truth) FIRST
      console.log('Actualizando tabla de perfiles...');
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        name: editedData.name,
        position: editedData.position,
        preferred_foot: editedData.preferredFoot,
        age: parseInt(editedData.age) || 18,
        height: parseInt(editedData.height) || 170,
        avatar_url: newAvatarUrl,
        cover_url: editedData.cover_url,
        bio: editedData.bio,
        instagram: editedData.instagram,
        stats: editedStats,
        skill_points: skillPoints,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error('Error en tabla de perfiles:', profileError);
        throw new Error(`Error en el perfil público: ${profileError.message}`);
      }

      // SUCCESS!
      // We stop the spinner and close the editor immediately after DB success
      setIsSaving(false);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      router.refresh();

      // 2. Update Auth Metadata (for the current session)
      console.log('Actualizando metadata de auth...');
      await supabase.auth.updateUser({
        data: {
          name: editedData.name,
          full_name: editedData.name,
          age: editedData.age,
          height: editedData.height,
          preferredFoot: editedData.preferredFoot,
          position: editedData.position,
          avatar_url: newAvatarUrl,
          cover_url: editedData.cover_url,
          bio: editedData.bio,
          instagram: editedData.instagram,
          stats: editedStats,
          skill_points: skillPoints,
        },
      });

      // 3. Final Sync
      router.refresh();
      // Optional: If we want absolute certainty, we'd trigger the fetchProfileData again
      // fetchProfileData is already in useEffect [user], and updateUser SHOULD trigger it.

    } catch (error: any) {
      console.error('Error crítico en handleSaveProfile:', error);
      alert(`Error guardando perfil: ${error.message || 'Error desconocido'}`);
      setIsSaving(false);
    } finally {
      // Safe fallback
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await updatePassword(newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (error) {
      // Error managed in alert
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      // Extract color from preview immediately
      getDominantColor(previewUrl).then((color) => {
        if (color) setAmbientColor(color);
      });
    }
  };

  if (isLoading || isLoadingProfile) {
    return <ProfileSkeleton />;
  }

  if (isMe && !user && !isLoading) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      {/* Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-[80dvh] opacity-30 dark:opacity-40 transition-colors duration-1000"
          style={{
            backgroundImage: ambientColor
              ? `radial-gradient(ellipse at 50% 0%, ${ambientColor}50, transparent 75%)`
              : getField('is_pro', false) 
                ? 'radial-gradient(ellipse at 50% 0%, rgba(234,179,8,0.15), transparent 75%)'
                : 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.2), transparent 75%)',
          }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stadium.png')] opacity-[0.03] dark:opacity-[0.05] invert dark:invert-0 pointer-events-none" />
      </div>

      {/* Hero Banner Section */}
      <div className="relative w-full h-[280px] sm:h-[450px] lg:h-[500px] overflow-hidden group/banner bg-background">
        {/* Layered gradients for deep cinematic transition */}
        <div className="absolute inset-x-0 bottom-0 h-full z-10 bg-gradient-to-t from-background via-background/70 to-transparent opacity-100" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 bg-gradient-to-t from-background to-transparent opacity-100" />
        <div className="absolute inset-x-0 top-0 h-[60%] z-10 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-100" />
        <div className="absolute inset-0 z-10 backdrop-blur-[1px] opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
        
        {/* Placeholder or User Cover */}
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src={isEditing ? editedData.cover_url : getField('cover_url', "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000")} 
          alt="Cover" 
          className="w-full h-full object-cover grayscale-[0.2] brightness-[0.7] group-hover/banner:scale-105 transition-transform duration-[4s]"
        />

        {isMe && (
          <div className="absolute top-34 sm:top-32 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-12 z-30 flex gap-3 w-fit">
             <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 h-12 rounded-2xl glass-premium border-white/10 hover:border-primary/40 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/btn md:"
             >
                <Edit2 className="w-4 h-4 text-primary group-hover/btn:rotate-12 transition-transform" />
                <span>{isEditing ? 'Cerrar Editor' : 'Personalizar'}</span>
             </button>
             {!isEditing && (
              <ShareStory
                type="profile"
                data={{
                  ...displayPlayer,
                  image: getField('avatar_url', undefined) as string | undefined,
                }}
              />
             )}
          </div>
        )}

        {/* Floating Rank Badge */}
        {!isEditing && (
          <div className="absolute top-28 right-6 sm:top-auto sm:bottom-10 sm:right-12 lg:right-20 z-20 flex flex-col items-end gap-1">
             <RankBadge rankName={getRankByElo(displayElo).name} size="lg" className="drop-shadow-[0_0_30px_rgba(44,252,125,0.4)]" />
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] drop-shadow-lg italic">
               RANGO {getRankByElo(displayElo).name}
             </span>
          </div>
        )}
      </div>

      {/* Main Content Container */}
      <div className="max-w-full mx-auto w-full px-3 sm:px-5 lg:px-10 xl:px-16 -mt-14 sm:-mt-48 lg:-mt-64 relative z-20 pb-20">
        
        {/* Pelotify Pro Banner */}
        {isMe && !getField('is_pro', false) && (
          <div className="mb-8 w-full w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="relative p-6 sm:p-8 rounded-[2rem] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-transparent border border-yellow-500/30 rounded-[2rem]" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:justify-between">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 border border-yellow-500/40">
                    <Star className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter italic text-yellow-400 leading-none drop-shadow-md">Únete a Pelotify Pro</h3>
                    <p className="text-xs text-foreground/80 font-medium mt-1">Verificado ✓ • Radares Avanzados • Descuentos en Canchas • Prioridad en Partidos.</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/pro')}
                  className="px-6 h-12 shrink-0 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[10px] font-black uppercase tracking-widest shadow-xl shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" fill="currentColor" />
                  Suscribirme
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Header Block */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 mb-12 relative z-20">
            {/* The FIFA Card (Avatar Replacement) */}
            <div className={cn(
              "relative transition-all duration-700 perspective-1000 group/card shrink-0 mx-auto lg:mx-0",
              isEditing && "z-50 scale-105"
            )}>
               <div className={cn("absolute -inset-10 blur-[80px] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity", getField('is_pro', false) ? "bg-yellow-500/20" : "bg-primary/20")} />
               <FifaCard
                  player={{
                    ...displayPlayer,
                    name: (isEditing ? editedData.name : displayPlayer.name) as string,
                    position: (isEditing ? editedData.position : displayPlayer.position) as string,
                    image: avatarPreview || (getField('avatar_url', undefined) as string | undefined),
                    mvpTrophies: displayMvpCount,
                    badges: userBadges.map((b) => b.badge_type as string),
                    pendingPoints: skillPoints,
                  }}
                />
                {isEditing && (
                  <label className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 cursor-pointer rounded-[2rem] border-2 border-dashed border-primary/40 m-2 transition-all hover:bg-black/40">
                    <Camera className="w-10 h-10 text-primary mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Cambiar<br/>Foto</span>
                    <input type="file" className="hidden" onChange={handleAvatarChange} />
                  </label>
                )}
            </div>

            {/* Basic Info & Social Stats */}
            <div className="flex-1 w-full space-y-6 lg:pt-8 text-center lg:text-left">
               <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 sm:gap-8 justify-between">
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
                    >
                      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black italic text-white uppercase tracking-tighter leading-none text-shadow-md">
                        {isEditing ? (editedData.name || 'JUGADOR') : displayPlayer.name}
                      </h1>
                      {!isEditing && getField('is_pro', false) && (
                        <div className="group/badge relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center border border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)] cursor-default">
                             <BadgeCheck className="w-5 h-5 text-black" />
                          </div>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/badge:opacity-100 transition-opacity bg-black text-yellow-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap pointer-events-none">
                            Pelotify PRO
                          </div>
                        </div>
                      )}
                    </motion.div>
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                       <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-black text-primary uppercase tracking-[0.4em] italic drop-shadow-md">{displayPlayer.position}</span>
                       <span className="px-3 py-1 rounded-full bg-foreground/10 border border-foreground/20 text-xs font-black text-white/70 uppercase tracking-[0.4em] drop-shadow-md">{teamName}</span>
                    </div>
                  </div>

                  {/* Desktop Action Buttons */}
                  <div className="flex items-center gap-3 mt-4 sm:mt-0 shrink-0">
                    {isMe ? (
                       isEditing && (
                        <div className="flex flex-col sm:flex-row gap-3">
                           <button onClick={() => setIsEditing(false)} className="h-12 px-6 rounded-[1.25rem] bg-foreground/5 border border-foreground/10 text-[10px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all">Cancelar</button>
                           <button onClick={handleSaveProfile} disabled={isSaving} className="h-12 px-8 rounded-[1.25rem] bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all">
                             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                             Guardar Perfil
                           </button>
                        </div>
                       )
                    ) : (
                      <div className="flex gap-3">
                         <button 
                           onClick={() => router.push(`/messages?user=${id}`)}
                           className="h-12 px-8 rounded-[1.25rem] bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                         >
                            <MessageSquare className="w-4 h-4" /> Enviar Mensaje
                         </button>
                      </div>
                    )}
                  </div>
               </div>

               {/* Bio Section */}
               <div className="max-w-2xl mx-auto lg:mx-0">
                  {getField('bio', '') && !isEditing && (
                    <p className="text-sm border-l-4 border-primary/40 pl-4 py-1 text-foreground/80 dark:text-white/60 font-medium leading-relaxed italic">
                      "{getField('bio', '')}"
                    </p>
                  )}
                  {isEditing && (
                    <p className="text-sm text-primary/60 italic font-black uppercase tracking-widest">
                      Completando información de perfil...
                    </p>
                  )}
               </div>

               {/* Modern Social Stats Hub */}
               {!isEditing && (
                   <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                      {[
                        { label: 'Partidos', value: displayMatches, color: 'text-foreground' },
                        { label: 'E.L.O.', value: displayElo, color: getField('is_pro', false) ? 'text-yellow-400' : 'text-primary' },
                        { label: 'Goles', value: displayGoals, color: 'text-foreground' },
                        { label: 'M.V.P.', value: displayMvpCount, color: 'text-accent' },
                      ].map((stat, i) => (
                        <div key={i} className="flex-1 min-w-[100px] max-w-[140px] bg-foreground/[0.02] border border-foreground/10 p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 group/stat cursor-default hover:bg-foreground/[0.05] hover:border-primary/20 transition-all text-center">
                           <span className={cn("text-3xl font-black italic tracking-tighter leading-none group-hover/stat:scale-110 transition-transform origin-center", stat.color)}>{stat.value}</span>
                           <span className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] overflow-hidden whitespace-nowrap text-ellipsis max-w-full">{stat.label}</span>
                        </div>
                      ))}
                   </div>
               )}
            </div>
        </div>

        {/* Navigation Tabs (Social Style) */}
        {!isEditing && (
          <div className="sticky top-0 z-40 bg-background/80 md:border-y border-foreground/10 mb-10 -mx-4 px-4 sm:mx-0">
           <div className="flex items-center justify-center sm:justify-start gap-10 py-5 overflow-x-auto no-scrollbar max-w-full mx-auto px-3 sm:px-5 lg:px-10 xl:px-16">
              {[
                { id: 'overview', icon: Info, label: 'Bio & Stats' },
                { id: 'history', icon: History, label: 'Historial' },
                { id: 'futtok', icon: Play, label: 'FutTok' },
                { id: 'wall', icon: MessageSquare, label: 'Muro Social' },
                ...(isMe ? [{ id: 'wallet', icon: Wallet, label: 'Finanzas' }] : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.3em] h-10 px-1 transition-all relative group/tab",
                    activeTab === tab.id ? "text-primary" : "text-foreground/40 hover:text-foreground/80"
                  )}
                >
                  <tab.icon className={cn("w-4 h-4 transition-transform group-hover/tab:scale-110", activeTab === tab.id ? "text-primary" : "text-foreground/40")} />
                  <span className="italic">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="social-tab" className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-primary shadow-[0_0_15px_rgba(44,252,125,0.6)] rounded-full" />
                  )}
                </button>
              ))}
           </div>
        </div>
        )}

        {/* Edit Mode OR Tabs */}
        {isEditing ? (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 mt-8 pb-20">
    <div className="flex items-center justify-between border-b border-foreground/10 pb-6 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Edit2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl lg:text-3xl font-black italic uppercase text-foreground tracking-tighter leading-none">Modo <span className="text-primary">Edición</span></h2>
          <p className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.3em] mt-1">Modifica tu identidad en la red táctica</p>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Col 1 - Personal Data */}
      <div className="lg:col-span-5 space-y-8">
        <div className="glass-premium p-8 rounded-[2.5rem] border border-foreground/10 space-y-6 shadow-xl">
           <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
             <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center">
               <Info className="w-4 h-4 text-foreground/40" />
             </div>
             <h3 className="text-[11px] font-black uppercase text-foreground/50 tracking-[0.3em]">Datos Generales</h3>
           </div>
           
           <div className="space-y-5">
             <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] ml-2">Nombre en Cancha</label>
               <input 
                 value={editedData.name} 
                 onChange={e => setEditedData({...editedData, name: e.target.value})}
                 className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:border-primary/50 transition-all shadow-inner"
                 placeholder="Ej. El 10"
               />
             </div>
             <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] ml-2">Biografía</label>
               <textarea 
                 value={editedData.bio}
                 onChange={e => setEditedData({...editedData, bio: e.target.value})}
                 placeholder="¿Cómo juegas? ¿De qué club eres?"
                 className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-4 text-sm font-medium text-foreground/80 outline-none focus:border-primary/50 h-32 resize-none shadow-inner"
               />
             </div>
             <div className="space-y-2">
               <div className="flex justify-between items-center ml-2">
                 <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em]">URL Portada (Banner)</label>
               </div>
               <div className="relative group/cover-input">
                 <input 
                   value={editedData.cover_url}
                   onChange={e => setEditedData({...editedData, cover_url: e.target.value})}
                   placeholder="https://..."
                   disabled={!getField('is_pro', false)}
                   className={cn(
                     "w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-4 text-xs font-medium text-foreground/70 outline-none focus:border-primary/50 shadow-inner",
                     !getField('is_pro', false) && "opacity-50 cursor-not-allowed group-hover/cover-input:border-yellow-500/30 transition-colors"
                   )}
                 />
                 {!getField('is_pro', false) && (
                   <div className="absolute inset-0 z-10 cursor-pointer flex items-center justify-end pr-4" onClick={() => router.push('/pro')} title="Hazte PRO">
                      <span className="text-[8px] font-black uppercase text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <Star className="w-2 h-2" fill="currentColor" /> Pro Only
                      </span>
                   </div>
                 )}
               </div>
             </div>
           </div>
        </div>

        <div className="glass-premium p-8 rounded-[2.5rem] border border-foreground/10 space-y-6 shadow-xl">
           <div className="flex items-center gap-3 border-b border-foreground/10 pb-4">
             <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center">
               <Target className="w-4 h-4 text-foreground/40" />
             </div>
             <h3 className="text-[11px] font-black uppercase text-foreground/50 tracking-[0.3em]">Físico & Táctica</h3>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] ml-2">Posición</label>
               <input 
                 value={editedData.position}
                 onChange={e => setEditedData({...editedData, position: e.target.value.toUpperCase()})}
                 maxLength={3}
                 className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-4 text-lg font-black italic uppercase text-primary outline-none focus:border-primary/50 shadow-inner"
                 placeholder="DC"
               />
             </div>
             <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] ml-2">Pie Hábil</label>
               <select
                 value={editedData.preferredFoot}
                 onChange={e => setEditedData({...editedData, preferredFoot: e.target.value})}
                 className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-4 text-sm font-bold text-foreground outline-none focus:border-primary/50 shadow-inner appearance-none cursor-pointer"
               >
                 <option value="Derecha">Derecha</option>
                 <option value="Zurda">Zurda</option>
                 <option value="Ambidiestro">Ambos</option>
               </select>
             </div>
             <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] ml-2">Edad</label>
               <input 
                 type="number"
                 value={editedData.age}
                 onChange={e => setEditedData({...editedData, age: e.target.value})}
                 className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-4 text-lg font-bold text-foreground outline-none focus:border-primary/50 shadow-inner"
               />
             </div>
             <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] ml-2">Altura (cm)</label>
               <input 
                 type="number"
                 value={editedData.height}
                 onChange={e => setEditedData({...editedData, height: e.target.value})}
                 className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-4 text-lg font-bold text-foreground outline-none focus:border-primary/50 shadow-inner"
               />
             </div>
           </div>
        </div>
      </div>

      {/* Col 2 - Stats Allocation */}
      <div className="lg:col-span-7">
        <div className="glass-premium p-8 rounded-[2.5rem] border-2 border-primary/20 space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.05)] h-full">
           <div className="flex flex-col gap-1 border-b border-foreground/10 pb-6">
             <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" /> Atributos FIFA
             </h3>
             <p className="text-[9px] font-black uppercase text-foreground/50 tracking-[0.3em]">Distribuye tus puntos de habilidad ganados en la cancha</p>
           </div>
           
           <div className="pt-2">
             <SkillPointAllocator
                stats={editedStats}
                skillPoints={skillPoints}
                onStatsChange={setEditedStats}
                onSkillPointsChange={setSkillPoints}
             />
           </div>
        </div>
      </div>
    </div>
  </motion.div>
        ) : (
          <>
            {/* Main Tab View */}
            <div className="min-h-[600px]">

          <AnimatePresence mode="wait">
              {activeTab === 'overview' && !isEditing && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 mt-2"
                >
                  {/* Personal Data Bento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Biometrics */}
                    <div className="lg:col-span-1 p-6 sm:p-8 rounded-[3rem] border border-foreground/10 space-y-8 bg-surface/50 dark:bg-foreground/[0.02] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:bg-foreground/[0.04] transition-all">
                       <div className="flex flex-col gap-1 border-b border-foreground/5 pb-4">
                          <h3 className="text-xl font-black uppercase tracking-tighter text-foreground italic leading-none flex items-center gap-3">
                             <Target className="w-5 h-5 text-primary" /> Biometría
                          </h3>
                          <span className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.3em]">Ficha Técnica</span>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                         {[
                            { label: 'Estatura', value: displayHeight, unit: 'cm', dot: 'bg-primary' },
                            { label: 'Ciclos', value: displayAge, unit: 'Años', dot: 'bg-blue-400' },
                            { label: 'Pie Hábil', value: displayFoot, unit: '', dot: 'bg-emerald-400' },
                            { label: 'Alianza', value: teamName, unit: '', dot: 'bg-purple-400', isTeam: true },
                         ].map((item, idx) => (
                           <div key={idx} className="flex flex-col gap-1 p-3 sm:p-4 rounded-[1.5rem] bg-foreground/[0.03] border border-foreground/5 shadow-inner group/bio relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover/bio:opacity-100 transition-opacity blur-xl rounded-full" style={{ backgroundColor: item.dot.replace('bg-', '') }} />
                             <div className="flex items-center gap-2 relative z-10 w-full min-w-0">
                               <div className={cn('w-2 h-2 shrink-0 rounded-full shadow-[0_0_8px_currentColor]', item.dot.replace('bg-', 'text-'))} />
                               <span className="text-[8px] font-black uppercase text-foreground/40 tracking-[0.2em] truncate relative top-px">{item.label}</span>
                             </div>
                             <div className="flex items-baseline gap-1 relative z-10 min-w-0 w-full mt-1">
                               <span className={cn("text-[17px] sm:text-2xl font-black italic uppercase tracking-tighter truncate leading-none relative z-10", item.isTeam ? "text-primary" : "text-foreground")}>{item.value}</span>
                               {item.unit && <span className="text-[8px] font-black text-foreground/30 uppercase shrink-0">{item.unit}</span>}
                             </div>
                           </div>
                         ))}
                       </div>

                       <div className="pt-2 border-t border-foreground/5">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/50 italic flex items-center gap-2">
                               <Zap className="w-3 h-3 text-primary" /> Atributos Base
                            </span>
                            {skillPoints > 0 && isMe && (
                              <span className="text-[8px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full ring-1 ring-primary/40 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse">{skillPoints} Pts Disp.</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
                             {[
                               { label: 'PAC', val: playerStats.pac, color: '#3b82f6' },
                               { label: 'SHO', val: playerStats.sho, color: '#ef4444' },
                               { label: 'PAS', val: playerStats.pas, color: '#8b5cf6' },
                               { label: 'DRI', val: playerStats.dri, color: '#f59e0b' },
                               { label: 'DEF', val: playerStats.def, color: '#10b981' },
                               { label: 'PHY', val: playerStats.phy, color: '#f97316' },
                             ].map((stat) => (
                               <div key={stat.label} className="flex flex-col gap-1.5 group/stat">
                                 <div className="flex justify-between items-end">
                                   <span className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em] leading-none group-hover/stat:text-foreground/60 transition-colors">{stat.label}</span>
                                   <span className="text-[11px] font-black italic text-foreground leading-none">{stat.val}</span>
                                 </div>
                                 <div className="h-1.5 bg-foreground/[0.04] rounded-full overflow-hidden shadow-inner">
                                   <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(stat.val/99)*100}%`, backgroundColor: stat.color, boxShadow: `0 0 10px ${stat.color}` }} />
                                 </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Rendimiento & Radar (merge into 1 block across 2 columns) */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Performance Stats */}
                       <div className="p-6 sm:p-8 rounded-[3rem] border border-foreground/10 bg-gradient-to-br from-surface/50 to-foreground/[0.02] flex flex-col justify-between group/perf shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:bg-foreground/[0.04] transition-all relative overflow-hidden">
                         <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-accent/5 blur-[80px] pointer-events-none rounded-full" />
                         <div className="flex flex-col gap-1 border-b border-foreground/5 pb-4 mb-8 relative z-10">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground italic leading-none flex items-center gap-3">
                               <Trophy className="w-5 h-5 text-accent" /> Rendimiento
                            </h3>
                            <span className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.3em]">Métricas de Juego Oficial</span>
                         </div>
                         
                         <div className="flex flex-col justify-center h-full gap-5 relative z-10">
                            {[
                                { label: 'Victorias Netas', value: displayMatchesWon, color: 'text-foreground' },
                                { label: 'Win Rate Global', value: `${displayMatches > 0 ? Math.min(100, Math.round((displayMatchesWon / displayMatches) * 100)) : 0}%`, color: 'text-emerald-500' },
                                { label: 'MVP Frecuencia', value: `${displayMatches > 0 ? Math.min(100, (displayMvpCount / displayMatches) * 100).toFixed(1) : '0.0'}%`, color: 'text-accent', lg: true },
                            ].map((stat, i) => (
                               <div key={i} className="flex items-center justify-between p-4 sm:p-5 rounded-[1.5rem] bg-background/40 border border-foreground/[0.03] hover:border-foreground/10 transition-colors group/item">
                                 <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="font-mono text-[9px] font-bold text-foreground/20 italic group-hover/item:text-foreground/40 transition-colors">0{i+1}</div>
                                    <span className="text-[8px] sm:text-[9px] font-black uppercase text-foreground/50 tracking-[0.2em]">{stat.label}</span>
                                 </div>
                                 <span className={cn("font-black italic tracking-tighter leading-none group-hover/item:scale-105 transition-transform origin-right text-right shrink-0", stat.lg ? "text-3xl sm:text-4xl drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "text-2xl sm:text-3xl", stat.color)}>{stat.value}</span>
                               </div>
                            ))}
                         </div>
                       </div>

                       {/* Pro Radar Chart */}
                       <div className={cn(
                          "relative p-8 rounded-[3rem] border flex flex-col items-center justify-center overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]",
                          getField('is_pro', false) ? 'border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent' : 'border-foreground/5 bg-foreground/[0.02]'
                       )}>
                          {getField('is_pro', false) && <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 blur-3xl rounded-full" />}
                          <div className={cn("absolute top-6 left-6 z-20 flex gap-2 items-center", !getField('is_pro', false) && "opacity-50")}>
                            <Star className={cn("w-4 h-4", getField('is_pro', false) ? "text-yellow-400" : "text-foreground/30")} fill="currentColor" />
                            <h3 className="text-[10px] font-black italic uppercase tracking-[0.3em] text-foreground/70">Radiografía</h3>
                          </div>
                          
                          <div className={cn("relative z-10 w-full flex items-center justify-center pt-8", !getField('is_pro', false) && "grayscale opacity-30 select-none")}>
                            <RadarChart stats={playerStats} size={240} color={getField('is_pro', false) ? "#facc15" : "#64748b"} />
                          </div>
                          
                          {!getField('is_pro', false) && (
                            <div className="absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 gap-3 z-30">
                               <Lock className="w-8 h-8 text-foreground/30" />
                               <span className="text-[9px] font-black uppercase tracking-widest text-foreground/50 max-w-[150px] leading-relaxed">Radar Analítico Exclusivo para PROs</span>
                               <button onClick={() => router.push('/pro')} className="mt-2 text-[8px] font-black uppercase tracking-[0.2em] text-yellow-500 bg-yellow-500/10 px-5 py-2.5 rounded-full hover:bg-yellow-500/20 active:scale-95 transition-all ring-1 ring-yellow-500/30">
                                  Obtener PRO
                               </button>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* Team Section Banner */}
                  {userTeam && (
                    <div className="p-6 sm:p-8 lg:p-12 rounded-[3.5rem] border border-foreground/10 bg-gradient-to-br from-surface to-background shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden group/team cursor-default transition-all duration-700 w-full">
                       <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-radial from-primary/10 via-transparent to-transparent -translate-y-1/2 translate-x-1/4 opacity-0 group-hover/team:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none" />
                       <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover/team:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                       <div className="relative shrink-0 perspective-1000">
                         <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full scale-110 group-hover/team:scale-150 transition-transform duration-1000 pointer-events-none" />
                         <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-background/80 border border-foreground/10 flex items-center justify-center overflow-hidden relative shadow-2xl group-hover/team:border-primary/50 transition-all duration-700 md: group-hover/team:-translate-y-2 group-hover/team:rotate-y-12">
                           <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/team:opacity-100 transition-opacity pointer-events-none" />
                           {userTeam.logo_url ? (
                             <img src={userTeam.logo_url} alt={userTeam.name} className="w-full h-full object-cover group-hover/team:scale-110 group-hover/team:rotate-3 transition-all duration-1000" />
                           ) : (
                             <Shield className="w-20 h-20 md:w-28 md:h-28 text-foreground/20 group-hover/team:text-primary transition-colors duration-700 drop-shadow-md" />
                           )}
                         </div>
                       </div>

                       <div className="flex-1 space-y-6 text-center lg:text-left w-full relative z-10">
                         <div className="space-y-2">
                           <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                             <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                               <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">Afiliación Confirmada</span>
                             </div>
                             <span className="text-[9px] font-black text-foreground/30 italic tracking-[0.2em] uppercase">NODE #{userTeam.id.slice(0, 8)}</span>
                           </div>
                           <h2 className="text-4xl md:text-6xl font-black italic text-foreground uppercase tracking-tighter leading-none group-hover/team:text-transparent group-hover/team:bg-clip-text group-hover/team:bg-gradient-to-r group-hover/team:from-foreground group-hover/team:to-primary transition-all duration-700 py-1">
                             {userTeam.name}
                           </h2>
                         </div>

                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-background/40 p-5 rounded-[2rem] border border-foreground/[0.03] shadow-inner w-full">
                           {[
                             { icon: Trophy, label: 'ELO', value: userTeam.elo, color: 'text-primary' },
                             { icon: Users, label: 'Squad', value: userTeam.members_count, color: 'text-blue-500' },
                             { icon: Shield, label: 'Tier', value: userTeam.level || 1, color: 'text-accent' },
                             { icon: Zap, label: 'Win %', value: userTeam.wins + userTeam.losses > 0 ? ((userTeam.wins / (userTeam.wins + userTeam.losses + userTeam.draws)) * 100).toFixed(0) + '%' : '--', color: 'text-purple-500' },
                           ].map((stat, i) => (
                             <div key={i} className="flex flex-col items-center lg:items-start gap-1 group/stat2">
                               <div className="flex items-center gap-1.5">
                                 <stat.icon className={cn('w-3 h-3 opacity-50 group-hover/stat2:opacity-100 transition-opacity', stat.color)} />
                                 <span className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.2em]">{stat.label}</span>
                               </div>
                               <p className="text-2xl font-black text-foreground italic tracking-tighter uppercase group-hover/stat2:scale-105 transition-transform origin-left">{stat.value}</p>
                             </div>
                           ))}
                         </div>

                         <div className="flex flex-wrap justify-center lg:justify-start gap-3 w-full">
                           <Link href={`/team?id=${userTeam.id}`} className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-foreground hover:bg-white text-background font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 group/link">
                             Acceder Sede <ExternalLink className="w-4 h-4 group-hover/link:rotate-12 transition-transform" />
                           </Link>
                           {userTeam.captain_id === (id === 'me' || !id ? user?.id : id) && (
                             <div className="w-full sm:w-auto h-12 px-6 rounded-2xl border border-primary bg-primary/10 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                               <Star className="w-4 h-4 text-primary fill-primary animate-pulse" />
                               <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Capitán</span>
                             </div>
                           )}
                         </div>
                       </div>
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === 'history' && !isEditing && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  {(() => {
                    const completedMatches = userMatches.filter((m) => {
                      if (m.is_completed) return true;
                      const matchStart = new Date(`${m.date}T${m.time}`);
                      const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
                      return new Date() > matchEnd;
                    });

                    if (completedMatches.length === 0) {
                      return (
                        <div className="glass-premium p-20 rounded-[4rem] flex flex-col items-center justify-center text-center gap-10 border-dashed border-2 border-foreground/10 bg-foreground/[0.01]">
                          <div className="w-24 h-24 rounded-[2.5rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center shadow-2xl">
                            <History className="w-10 h-10 text-foreground/10" />
                          </div>
                          <div className="space-y-3">
                            <p className="text-2xl font-black text-foreground italic uppercase tracking-tighter">
                              Sin Partidos Finalizados
                            </p>
                            <p className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.3em]">
                              {isMe
                                ? 'Tu historial de partidos está listo para ser escrito.'
                                : 'Este jugador aún no tiene partidos registrados.'}
                            </p>
                          </div>
                          <Link href="/search">
                            <button className="h-14 px-10 bg-primary/5 hover:bg-primary text-primary hover:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-xl border border-primary/20 transition-all active:scale-95">
                              BUSCAR PARTIDOS
                            </button>
                          </Link>
                        </div>
                      );
                    }

                    const recentForm = completedMatches.slice(0, 5).map(m => {
                      const scoreA = m.team_a_score ?? 0;
                      const scoreB = m.team_b_score ?? 0;
                      if (!m.user_team) return 'D';
                      if (scoreA === scoreB) return 'D';
                      if (m.user_team === 'A' && scoreA > scoreB) return 'W';
                      if (m.user_team === 'B' && scoreB > scoreA) return 'W';
                      return 'L';
                    });

                    return (
                      <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Form Guide Header */}
                        <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 rounded-[2.5rem] bg-background/40 border border-white/5 backdrop-blur-md shadow-2xl gap-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none rounded-full" />
                          <div className="flex flex-col relative z-10 text-center sm:text-left">
                            <h3 className="text-2xl sm:text-3xl font-black text-foreground italic uppercase tracking-tighter flex items-center justify-center sm:justify-start gap-3">
                              Registro Oficial <BadgeCheck className="w-6 h-6 text-primary" />
                            </h3>
                            <p className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest mt-1">
                              Análisis de rendimiento reciente
                            </p>
                          </div>

                          <div className="flex flex-col items-center sm:items-end gap-3 relative z-10">
                            <span className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.3em]">
                              Forma Reciente
                            </span>
                            <div className="flex items-center gap-2">
                              {[...recentForm].reverse().map((result, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-black uppercase ring-1 ring-inset shadow-xl cursor-default transition-transform hover:scale-110",
                                    result === 'W' 
                                      ? 'bg-primary text-black ring-primary/40 shadow-primary/20' 
                                      : result === 'L' 
                                        ? 'bg-red-500 text-white ring-red-500/40 shadow-red-500/20' 
                                        : 'bg-amber-500 text-white ring-amber-500/40 shadow-amber-500/20'
                                  )}
                                >
                                  {result}
                                </motion.div>
                              ))}
                              {recentForm.length < 5 && (
                                Array.from({ length: 5 - recentForm.length }).map((_, i) => (
                                  <div key={`empty-${i}`} className="w-10 h-10 rounded-xl bg-foreground/5 border border-white/5 flex items-center justify-center text-[13px] font-black uppercase text-foreground/20">
                                    -
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Match Grid */}
                        <div className="grid grid-cols-1 gap-6 w-full">
                          {completedMatches.map((m, i) => {
                            const scoreA = m.team_a_score ?? 0;
                            const scoreB = m.team_b_score ?? 0;
                            const userTeam = m.user_team;

                            let result: 'win' | 'loss' | 'draw' | null = null;
                            if (userTeam) {
                              if (scoreA === scoreB) result = 'draw';
                              else if (userTeam === 'A' && scoreA > scoreB) result = 'win';
                              else if (userTeam === 'B' && scoreB > scoreA) result = 'win';
                              else result = 'loss';
                            }

                            const venue = findVenueByLocation(m.location);
                            const locationName = venue?.displayName || venue?.name || m.location;

                            const dateParts = m.date.split('-');
                            const dayNum = dateParts[2];
                            const monthIndex = parseInt(dateParts[1], 10) - 1;
                            const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
                            const monthName = monthNames[monthIndex] || '---';

                            return (
                              <Link
                                key={m.id}
                                href={`/match?id=${m.id}`}
                                className="block group relative"
                              >
                                <div className={cn(
                                  "absolute inset-0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem]",
                                  result === 'win' ? 'bg-primary/20' : result === 'loss' ? 'bg-red-500/20' : result === 'draw' ? 'bg-amber-500/20' : 'bg-foreground/10'
                                )} />
                                
                                <div className={cn(
                                  "relative z-10 glass-premium p-6 sm:p-8 rounded-[2.5rem] border flex flex-col gap-6 overflow-hidden transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl h-full",
                                  result === 'win' 
                                    ? 'border-primary/20 hover:border-primary/50' 
                                    : result === 'loss' 
                                      ? 'border-red-500/20 hover:border-red-500/50' 
                                      : result === 'draw'
                                        ? 'border-amber-500/20 hover:border-amber-500/50'
                                        : 'border-white/5 hover:border-white/20'
                                )}>
                                  {/* Background Decor */}
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                    <Trophy className="w-48 h-48 sm:w-64 sm:h-64" />
                                  </div>

                                  {/* Date & Mode Header */}
                                  <div className="flex items-center justify-between pb-4 border-b border-foreground/5 relative z-10 w-full">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-background/80 px-3 py-1.5 rounded-xl border border-white/5 flex items-center justify-center shadow-inner">
                                        <span className="text-lg font-black text-foreground uppercase italic leading-none">{dayNum}</span>
                                        <span className="text-[10px] font-black text-primary ml-1 uppercase">{monthName}</span>
                                      </div>
                                      <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] max-w-[100px] sm:max-w-none truncate">{m.type} • {m.level || 'General'}</p>
                                    </div>
                                    {result && (
                                      <div className={cn(
                                        "px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.3em] shadow-sm shrink-0",
                                        result === 'win' ? 'bg-primary/10 border-primary/30 text-primary' : result === 'loss' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                      )}>
                                        {result === 'win' ? 'VICTORIA' : result === 'loss' ? 'DERROTA' : 'EMPATE'}
                                      </div>
                                    )}
                                  </div>

                                  {/* Score and Teams Center */}
                                  <div className="flex items-center justify-center w-full relative z-10 py-2 sm:py-6 flex-1">
                                    <div className="flex items-center gap-3 sm:gap-6 bg-background/50 rounded-[2rem] p-4 sm:p-6 border border-white/5 shadow-inner backdrop-blur-md w-full justify-between">
                                      
                                      {/* Team A */}
                                      <div className="flex flex-col items-center gap-2 w-16 sm:w-20">
                                        <div className={cn(
                                          "w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center text-[10px] sm:text-xs font-black uppercase shadow-lg transition-transform group-hover:scale-105 shrink-0",
                                          userTeam === 'A' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-foreground/5 border-white/10 text-foreground/50'
                                        )}>
                                          {userTeam === 'A' ? (displayPlayer.name ? displayPlayer.name.charAt(0) : 'U') : 'A'}
                                        </div>
                                        <span className={cn(
                                          "text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center truncate w-full", 
                                          userTeam === 'A' ? 'text-primary' : 'text-foreground/40'
                                        )}>
                                          {userTeam === 'A' ? 'Mi Equipo' : 'Equipo A'}
                                        </span>
                                      </div>

                                      {/* Score */}
                                      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                        <span className={cn(
                                          "text-4xl sm:text-6xl font-black italic tracking-tighter drop-shadow-md", 
                                          userTeam === 'A' && result === 'win' ? 'text-primary' : userTeam === 'A' && result === 'loss' ? 'text-red-500' : 'text-foreground'
                                        )}>{scoreA}</span>
                                        
                                        <div className="flex flex-col gap-1.5 opacity-30 mt-1">
                                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-foreground" />
                                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-foreground" />
                                        </div>
                                        
                                        <span className={cn(
                                          "text-4xl sm:text-6xl font-black italic tracking-tighter drop-shadow-md",
                                          userTeam === 'B' && result === 'win' ? 'text-primary' : userTeam === 'B' && result === 'loss' ? 'text-red-500' : 'text-foreground'
                                        )}>{scoreB}</span>
                                      </div>

                                      {/* Team B */}
                                      <div className="flex flex-col items-center gap-2 w-16 sm:w-20">
                                        <div className={cn(
                                          "w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center text-[10px] sm:text-xs font-black uppercase shadow-lg transition-transform group-hover:scale-105 shrink-0",
                                          userTeam === 'B' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-foreground/5 border-white/10 text-foreground/50'
                                        )}>
                                          {userTeam === 'B' ? (displayPlayer.name ? displayPlayer.name.charAt(0) : 'U') : 'B'}
                                        </div>
                                        <span className={cn(
                                          "text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center truncate w-full", 
                                          userTeam === 'B' ? 'text-primary' : 'text-foreground/40'
                                        )}>
                                          {userTeam === 'B' ? 'Mi Equipo' : 'Equipo B'}
                                        </span>
                                      </div>

                                    </div>
                                  </div>

                                  {/* Footer / Location */}
                                  <div className="pt-4 border-t border-foreground/5 flex items-center justify-between relative z-10 mt-auto">
                                    <div className="flex items-center gap-2 text-foreground/60 group-hover:text-foreground transition-colors min-w-0 pr-4">
                                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                                      <span className="text-xs sm:text-sm font-bold truncate">{locationName}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors shrink-0">
                                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                  </div>

                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
              {activeTab === 'futtok' && (
                <motion.div
                  key="futtok"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between px-1 mb-6">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl lg:text-2xl font-black italic text-foreground uppercase tracking-tighter font-kanit">
                        Highlights
                      </h3>
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                        GALERÍA FutTok
                      </span>
                    </div>
                    <Flame className="w-6 h-6 text-emerald-500 animate-pulse" />
                  </div>

                  {isLoadingHighlights ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-[9/16] rounded-2xl bg-foreground/[0.03] animate-pulse border border-white/5" />
                      ))}
                    </div>
                  ) : userHighlights.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                      {userHighlights.map((h, i) => (
                        <Link 
                          key={h.id} 
                          href={`/highlights?v=${h.id}`}
                          className="group relative aspect-[9/16] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/5 bg-surface transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-emerald-500/50"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                          <video 
                            src={h.video_url} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                            muted
                            playsInline
                            loop
                            // onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                            // onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                          />
                          
                          <div className="absolute top-3 left-3 z-20 flex gap-2">
                            <div className="px-2 py-0.5 rounded-full bg-black/50 md: border border-white/10 flex items-center gap-1.5">
                              <Play className="w-2.5 h-2.5 text-white" />
                              <span className="text-[8px] font-black italic text-white">{h.views_count || 0}</span>
                            </div>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 z-20">
                            <h4 className="text-[10px] font-black italic text-white uppercase tracking-wider line-clamp-1 drop-shadow-md">
                              {h.description || 'HIGHLIGHT'}
                            </h4>
                            <div className="flex items-center gap-1 mt-1 opacity-70">
                              <Flame className="w-2.5 h-2.5 text-emerald-400" />
                              <span className="text-[8px] font-black text-white">{h.likes_count || 0} likes</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                      
                      {isMe && (
                        <Link href="/highlights" className="aspect-[9/16] rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors group">
                           <div className="w-12 h-12 rounded-full bg-surface border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Plus className="w-6 h-6 text-emerald-500" />
                           </div>
                           <span className="text-[9px] font-black uppercase text-foreground/40 group-hover:text-emerald-500 tracking-widest px-4 text-center">SUBIR JUGADA</span>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="glass-premium p-16 sm:p-20 rounded-[4rem] flex flex-col items-center justify-center text-center gap-8 border-dashed border-2 border-foreground/10 bg-foreground/[0.01]">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center shadow-xl">
                        <Flame className="w-10 h-10 text-foreground/10" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-2xl font-black text-foreground italic uppercase tracking-tighter">
                          Sin Highlights
                        </p>
                        <p className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.3em] max-w-sm">
                          {isMe
                            ? 'Aún no subiste tus mejores jugadas. Mostrá lo que sabes hacer en la cancha.'
                            : 'Este jugador no ha subido videos todavía.'}
                        </p>
                      </div>
                      {isMe && (
                        <Link href="/highlights">
                          <button className="h-14 px-10 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl border border-emerald-500/20 transition-all active:scale-95 flex items-center gap-3">
                            <Plus className="w-4 h-4" />
                            SUBIR VIDEO
                          </button>
                        </Link>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === 'wall' && (
                <motion.div
                  key="wall"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full space-y-10 pb-20"
                >
                  {/* Title & Description */}
                  <div className="glass-premium p-10 lg:p-12 rounded-[3.5rem] border border-foreground/10 bg-gradient-to-br from-surface to-background relative overflow-hidden group/wall-header mt-8">
                    <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-radial from-blue-500/10 via-transparent to-transparent -translate-y-1/2 translate-x-1/4 opacity-0 group-hover/wall-header:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none" />
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 text-center md:text-left">
                       <div className="w-20 h-20 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(59,130,246,0.15)] group-hover/wall-header:scale-110 transition-transform duration-500">
                          <svg className="w-10 h-10 text-blue-500 filter drop-shadow-[0_0_10px_currentColor]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                       </div>
                       <div className="space-y-4 max-w-2xl">
                          <h2 className="text-4xl md:text-5xl font-black italic uppercase text-foreground tracking-tighter leading-none">
                            Muro <span className="text-blue-500">Social</span>
                          </h2>
                          <p className="text-sm md:text-base font-medium text-foreground/50 leading-relaxed">
                            El vestuario digital de jugador. Dejá tu firma, escribile un elogio por su último MVP, recordale un golazo o tirále una cargada con respeto. Este espacio es para la comunidad.
                          </p>
                       </div>
                    </div>
                  </div>

                  {user && (
                    <form
                      onSubmit={handlePostComment}
                      className="glass-premium p-6 md:p-8 rounded-[2.5rem] border border-blue-500/10 shadow-xl space-y-4 relative bg-surface/50 hover:bg-surface transition-colors focus-within:border-blue-500/30 focus-within:ring-4 focus-within:ring-blue-500/10"
                    >
                      <div className="flex gap-4 sm:gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shrink-0 border border-foreground/10 bg-foreground/5 shadow-inner">
                          {user.user_metadata?.avatar_url ? (
                            <img
                              src={user.user_metadata.avatar_url}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-primary text-xl">
                              {user.name?.slice(0, 1).toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder='"¡Estás intratable!"'
                            className="w-full bg-foreground/[0.02] hover:bg-foreground/[0.04] border border-foreground/10 rounded-2xl md:rounded-[1.5rem] p-4 text-foreground text-base md:text-lg resize-none focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all min-h-[100px] shadow-inner font-medium placeholder:text-foreground/30 italic"
                            maxLength={500}
                            disabled={isPostingComment}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-4 pt-2">
                         <span className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.2em]">{newComment.length}/500</span>
                         <button
                           type="submit"
                           disabled={isPostingComment || !newComment.trim()}
                           className="h-12 px-8 rounded-[1.5rem] bg-blue-500 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-95 flex items-center gap-2 relative overflow-hidden group/btn"
                         >
                           {isPostingComment ? (
                             <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           ) : (
                             <>
                               <span className="relative z-10">Firmar Muro</span>
                               <svg className="w-4 h-4 relative z-10 group-hover/btn:-rotate-12 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                             </>
                           )}
                         </button>
                      </div>
                    </form>
                  )}

                  {/* Comments List */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between pb-4 border-b border-foreground/5">
                       <h3 className="text-[11px] font-black uppercase text-foreground/60 tracking-[0.3em] flex items-center gap-2">
                         <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> 
                         Firmas Recientes
                       </h3>
                       <span className="px-3 py-1 bg-foreground/5 rounded-full text-[10px] font-black text-foreground/50 tracking-widest border border-foreground/10">{comments.length} Mensajes</span>
                    </div>

                    {isLoadingComments ? (
                      <div className="flex justify-center py-20">
                         <svg className="w-8 h-8 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      </div>
                    ) : comments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {comments.map((comment, i) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-premium p-6 rounded-[2.5rem] border border-foreground/5 relative group/comment hover:border-blue-500/30 transition-all hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] flex flex-col gap-4 bg-gradient-to-br from-surface to-background/50 hover:bg-gradient-to-br hover:from-surface hover:to-blue-500/5 hover:-translate-y-1"
                          >
                             {/* Decorative Quote Icon */}
                             <div className="absolute top-6 right-6 text-foreground/5 group-hover/comment:text-blue-500/10 transition-colors pointer-events-none group-hover/comment:scale-110">
                                <svg className="w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                             </div>

                             {/* Comment Header */}
                             <div className="flex items-center gap-4 relative z-10">
                                <Link href={`/profile?id=${comment.author_id}`} className="w-12 h-12 rounded-[1.2rem] overflow-hidden shrink-0 border border-foreground/10 hover:border-primary/50 transition-colors shadow-sm">
                                  {comment.author?.avatar_url ? (
                                    <img
                                      src={comment.author.avatar_url}
                                      className="w-full h-full object-cover group-hover/comment:scale-110 transition-transform duration-500"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-primary text-sm bg-foreground/5">
                                      {comment.author?.name?.slice(0, 1).toUpperCase() || 'P'}
                                    </div>
                                  )}
                                </Link>
                                <div className="flex flex-col mt-1">
                                   <Link href={`/profile?id=${comment.author_id}`} className="font-black text-[14px] uppercase italic tracking-tight text-foreground hover:text-blue-500 transition-colors">
                                     {comment.author?.name || 'Veterano'}
                                   </Link>
                                   <span className="text-[9px] font-bold uppercase text-foreground/40 tracking-[0.2em] mt-0.5">
                                     {new Date(comment.created_at).toLocaleDateString('es-ES', {
                                       day: 'numeric',
                                       month: 'short',
                                       year: 'numeric'
                                     })}
                                   </span>
                                </div>
                                
                                {/* Delete Button */}
                                {(isMe || user?.id === comment.author_id) && (
                                  <button 
                                     onClick={() => handleDeleteComment(comment.id)}
                                     className="ml-auto p-2 bg-red-500/5 hover:bg-red-500 border border-red-500/10 hover:border-red-500 text-red-500 hover:text-white rounded-[1rem] transition-all opacity-0 group-hover/comment:opacity-100 shadow-sm"
                                     title="Eliminar Firma"
                                  >
                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                  </button>
                                )}
                             </div>

                             {/* Comment Body */}
                             <div className="relative z-10 pl-3 border-l-[3px] border-blue-500/20 group-hover/comment:border-blue-500 transition-colors mt-2">
                                <p className="text-[15px] md:text-base text-foreground/80 font-medium leading-relaxed italic whitespace-pre-wrap">
                                  "{comment.content}"
                                </p>
                             </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="glass-premium p-16 rounded-[3rem] border border-dashed border-foreground/10 flex flex-col items-center justify-center text-center gap-6 bg-foreground/[0.02]">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-foreground/5 flex items-center justify-center shadow-inner border border-foreground/10">
                           <svg className="w-10 h-10 text-foreground/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <div className="space-y-2">
                           <p className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-foreground">El vestuario está en silencio</p>
                           <p className="text-[10px] md:text-xs font-black text-foreground/40 uppercase tracking-[0.3em] max-w-sm mx-auto">Sé el primero en dejar tu firma en el muro y sorprende al jugador.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'wallet' && isMe && (
                <motion.div
                  key="wallet"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="max-w-full w-full mx-auto pb-20 mt-10"
                >
                  <div className="glass-premium p-8 sm:p-12 rounded-[3.5rem] border border-[#009EE3]/30 bg-gradient-to-br from-[#009EE3]/5 to-transparent relative overflow-hidden shadow-[0_20px_60px_rgba(0,158,227,0.1)] group/wallet">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#009EE3]/10 blur-[80px] pointer-events-none group-hover/wallet:opacity-100 opacity-50 transition-opacity duration-1000" />
                    
                    <div className="flex flex-col md:flex-row gap-10 items-center justify-between relative z-10">
                      <div className="space-y-6 flex-1 text-center md:text-left">
                        <div className="w-16 h-16 rounded-2xl bg-[#009EE3]/10 border border-[#009EE3]/20 flex items-center justify-center mx-auto md:mx-0 shadow-lg top-1">
                          <Wallet className="w-8 h-8 text-[#009EE3]" />
                        </div>
                        
                        <div className="space-y-2">
                          <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                            Mercado <span className="text-[#009EE3]">Pago</span>
                          </h2>
                          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/60 leading-relaxed max-w-sm mt-2">
                            Organiza partidos y recibe el dinero de los cupos directo a tu cuenta bancaria al instante.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto md:mx-0">
                          <div className="p-4 rounded-2xl bg-background/50 border border-foreground/5 flex items-center gap-3 shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase text-foreground/50 tracking-widest">Sin Retenciones</span>
                          </div>
                          <div className="p-4 rounded-2xl bg-background/50 border border-foreground/5 flex items-center gap-3 shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-[#009EE3] animate-pulse" />
                            <span className="text-[9px] font-black uppercase text-foreground/50 tracking-widest">Split Automático</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 w-full md:w-auto">
                        {dbProfile?.mp_user_id ? (
                          <div className="flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 text-center shadow-lg">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                              <BadgeCheck className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-lg font-black uppercase tracking-tighter text-emerald-500 italic">Cuenta Vinculada</p>
                              <p className="text-[10px] font-black text-foreground/40 tracking-widest uppercase mt-1">ID: {dbProfile.mp_user_id.slice(0, 8)}...</p>
                            </div>
                            <div className="mt-2 text-[9px] text-emerald-500/80 font-bold uppercase tracking-widest">
                              Recibiendo pagos activos
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                                window.location.href = `/api/mercadopago/authorize?userId=${user?.id}`;
                            }}
                            className="w-full md:w-auto px-10 py-6 rounded-3xl bg-[#009EE3] text-white hover:bg-[#0086c3] shadow-[0_15px_40px_rgba(0,158,227,0.3)] hover:shadow-[0_20px_50px_rgba(0,158,227,0.5)] transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-3 group/connect border border-white/10"
                          >
                            <span className="text-xl font-black italic tracking-tighter uppercase leading-none text-white">Vincular Cuenta</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80 group-hover/connect:opacity-100 flex items-center gap-2 text-white/90">
                              Conectar con Mercado Pago <ChevronRight className="w-3 h-3 group-hover/connect:translate-x-1 transition-transform" />
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </>
        )}
        </div>


      <div className="pb-32 lg:pb-12" />

      {/* FOOTER ACTIONS SECTION */}
      {isMe && (
        <div className="relative z-10 border-t border-foreground/10 pt-8 pb-8 flex flex-wrap gap-8 items-center">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-3 text-foreground/30 hover:text-primary transition-colors text-[11px] font-black uppercase tracking-widest group"
          >
            <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Cambiar Contraseña
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-3 text-foreground/30 hover:text-red-500 transition-colors text-[11px] font-black uppercase tracking-widest group"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Eliminar Cuenta
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-4 max-w-md w-full"
            >
              <div className="flex items-center gap-3 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-widest">¿Estás seguro?</h3>
              </div>
              <p className="text-xs text-foreground/40 leading-relaxed">
                Esta acción es irreversible. Se van a borrar todos tus datos: partidos, equipos,
                amigos y estadísticas.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-10 px-6 rounded-xl bg-foreground/5 border border-foreground/10 text-xs font-bold text-foreground/40 hover:text-foreground transition-all"
                >
                  No, cancelar
                </button>
                <button
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await deleteAccount();
                    } catch (e) {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="h-10 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Sí, eliminar todo
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* PASSWORD MODAL */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 md:">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-premium rounded-[2.5rem] p-8 lg:p-10 border border-foreground/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden bg-surface"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 rounded-full" />

              <form onSubmit={handleUpdatePassword} className="space-y-8 relative z-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter">
                    Nueva <span className="text-primary">Clave</span>
                  </h2>
                  <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] italic">
                    Seguridad de Jugador
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] ml-1">
                    Escribí tu nueva contraseña
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                    </div>
                    <input
                      type="password"
                      className="w-full h-14 pl-14 pr-6 bg-foreground/[0.02] border border-foreground/5 rounded-2xl text-foreground text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest ml-1">
                    Mínimo 6 caracteres
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 h-14 rounded-2xl bg-foreground/5 border border-foreground/5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all active:scale-95 flex items-center justify-center"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex-[2] h-14 bg-primary text-background font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-primary/20"
                  >
                    {isUpdatingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'ACTUALIZAR'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
