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

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'futtok' | 'wall' | 'wallet'>('overview');

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
              : 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.2), transparent 75%)',
          }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stadium.png')] opacity-[0.03] dark:opacity-[0.05] invert dark:invert-0 pointer-events-none" />
      </div>

      {/* Hero Banner Section */}
      <div className="relative w-full h-[280px] sm:h-[450px] lg:h-[500px] overflow-hidden group/banner bg-zinc-950">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent opacity-100" />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-black/60 opacity-100" />
        
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
        
        {/* Verification Banner */}
        {isMe && !getField('instagram', '') && (
          <div className="mb-8 w-full w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="relative p-6 sm:p-8 rounded-[2rem] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-[2rem]" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:justify-between">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/40">
                    <BadgeCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter italic text-white leading-none">Consigue el verificado</h3>
                    <p className="text-xs text-foreground/60 font-medium mt-1">Conecta tu cuenta de Instagram oficial para obtener la insignia de jugador verificado.</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '/api/auth/instagram'}
                  className="px-6 h-12 shrink-0 rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Vincular Cuenta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Header Block */}
        <div className="flex flex-col lg:flex-row items-center gap-8 mb-12">
            {/* The FIFA Card (Avatar Replacement) */}
            <div className={cn(
              "relative transition-all duration-700 perspective-1000 group/card",
              isEditing && "z-50 scale-105"
            )}>
               <div className="absolute -inset-10 bg-primary/20 blur-[80px] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity" />
               <FifaCard
                  player={{
                    ...displayPlayer,
                    name: (isEditing ? editedData.name : displayPlayer.name) as string,
                    position: (isEditing ? editedData.position : displayPlayer.position) as string,
                    image: avatarPreview || (getField('avatar_url', undefined) as string | undefined),
                    mvpTrophies: displayMvpCount,
                    badges: userBadges.map((b) => b.badge_type as string),
                  }}
                />
                {isEditing && (
                  <label className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 md: cursor-pointer rounded-[2rem] border-2 border-dashed border-primary/40 m-2 transition-all hover:bg-black/40">
                    <Camera className="w-10 h-10 text-primary mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cambiar Foto</span>
                    <input type="file" className="hidden" onChange={handleAvatarChange} />
                  </label>
                )}
            </div>

            {/* Basic Info & Social Stats */}
            <div className="flex-1 w-full space-y-6 lg:pb-8 text-center lg:text-left">
               <div className="flex flex-col sm:flex-row items-center lg:items-center gap-4 sm:gap-8">
                  <div className="space-y-1">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-center lg:justify-start gap-4"
                    >
                      <h1 className="text-4xl sm:text-6xl font-black italic text-white uppercase tracking-tighter leading-none text-shadow-md">
                        {isEditing ? (
                          <input 
                            value={editedData.name} 
                            onChange={e => setEditedData({...editedData, name: e.target.value})}
                            className="bg-transparent border-b-2 border-foreground/20 outline-none focus:border-primary transition-all w-full max-w-[400px] py-1"
                            placeholder="Tu Nombre"
                          />
                        ) : (displayPlayer.name)}
                      </h1>
                      {!isEditing && getField('instagram', '') && (
                        <a href={`https://instagram.com/${getField('instagram', '').replace('@', '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 hover:scale-110 transition-transform">
                           <BadgeCheck className="w-4 h-4 text-primary" />
                        </a>
                      )}
                    </motion.div>
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                       <span className="text-xs font-black text-primary uppercase tracking-[0.4em] italic drop-shadow-md">{displayPlayer.position}</span>
                       <div className="w-1 h-1 rounded-full bg-white/40" />
                       <span className="text-xs font-black text-white/70 uppercase tracking-[0.4em] drop-shadow-md">{teamName}</span>
                    </div>
                  </div>

                  {/* Desktop Action Buttons */}
                  <div className="flex items-center gap-3 mt-4 sm:mt-0 sm:ml-auto">
                    {isMe ? (
                       isEditing && (
                        <div className="flex gap-3">
                           <button onClick={() => setIsEditing(false)} className="h-14 px-8 rounded-2xl bg-foreground/5 border border-foreground/10 text-[11px] font-black uppercase tracking-widest hover:bg-foreground/10 transition-all">Cancelar</button>
                           <button onClick={handleSaveProfile} disabled={isSaving} className="h-14 px-10 rounded-2xl bg-primary text-black text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95 disabled:opacity-50 transition-all">
                             {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                             Guardar Cambios
                           </button>
                        </div>
                       )
                    ) : (
                      <div className="flex gap-3">
                         <button 
                           onClick={() => router.push(`/messages?user=${id}`)}
                           className="h-14 px-10 rounded-2xl bg-primary text-black text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                         >
                            <MessageSquare className="w-5 h-5" />
                            <span>Enviar Mensaje</span>
                         </button>
                      </div>
                    )}
                  </div>
               </div>

               {/* Bio Section */}
               <div className="max-w-xl">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Biografía</label>
                        <textarea 
                          value={editedData.bio}
                          onChange={e => setEditedData({...editedData, bio: e.target.value})}
                          placeholder="Escribe algo sobre ti..."
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl p-5 text-sm text-foreground/70 outline-none focus:border-primary/50 h-28 resize-none shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">URL de Portada</label>
                        <input 
                          value={editedData.cover_url}
                          onChange={e => setEditedData({...editedData, cover_url: e.target.value})}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-5 h-12 text-xs text-foreground/70 outline-none focus:border-primary/50 shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest flex items-center gap-2">
                          Usuario de Instagram
                          <BadgeCheck className="w-3 h-3 text-primary" />
                        </label>
                        <div className="flex items-center gap-3">
                          <input 
                            readOnly
                            disabled
                            value={editedData.instagram ? `@${editedData.instagram}` : 'No vinculado'}
                            className="flex-1 bg-foreground/5 border border-foreground/10 rounded-2xl px-5 h-12 text-xs text-foreground/50 outline-none shadow-inner opacity-70 cursor-not-allowed font-medium"
                          />
                          {!editedData.instagram && (
                             <button type="button" onClick={() => window.location.href = '/api/auth/instagram'} className="h-12 px-6 shrink-0 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                Vincular
                             </button>
                          )}
                        </div>
                        <p className="text-[10px] text-foreground/40 italic">La vinculación con Instagram es automática para garantizar autenticidad.</p>
                      </div>
                    </div>
                  ) : (
                    getField('bio', '') && (
                      <p className="text-sm sm:text-base text-foreground/80 dark:text-white/60 font-medium leading-relaxed italic max-w-2xl">
                        {getField('bio', '')}
                      </p>
                    )
                  )}
               </div>

               {/* Modern Social Stats Hub */}
               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-12 gap-y-6 pt-6 border-t border-foreground/10">
                  {[
                    { label: 'Partidos', value: displayMatches, color: 'text-foreground' },
                    { label: 'ELO RATING', value: displayElo, color: 'text-primary' },
                    { label: 'Goles', value: displayGoals, color: 'text-foreground' },
                    { label: 'Badges', value: displayMvpCount, color: 'text-accent' },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col group/stat cursor-default">
                       <span className={cn("text-3xl font-black italic tracking-tighter leading-none group-hover/stat:scale-110 transition-transform origin-left", stat.color)}>{stat.value}</span>
                       <span className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.3em] mt-1.5">{stat.label}</span>
                    </div>
                  ))}
               </div>
            </div>
        </div>

        {/* Navigation Tabs (Social Style) */}
        <div className="sticky top-0 z-40 bg-background/80 md: border-y border-foreground/10 mb-10 -mx-4 px-4 sm:mx-0">
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

        {/* Main Tab View */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  {/* Personal Data Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div
                      className={cn(
                        'p-10 lg:p-12 rounded-[3.5rem] border border-foreground/10 space-y-10 relative overflow-hidden group transition-all duration-700',
                        'bg-surface/50 dark:bg-foreground/5 md:',
                        'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.4)]',
                        isEditing
                          ? 'z-50 ring-4 ring-primary/30 shadow-[0_0_100px_rgba(16,185,129,0.2)] bg-background/80 scale-[1.02]'
                          : ''
                      )}
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <div className="flex items-center justify-between relative z-10 border-b border-foreground/5 pb-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-[1.5rem] bg-background/50 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform">
                            <Info className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-foreground italic leading-none">
                              Biometría
                            </h3>
                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] mt-1">
                              Identidad Core
                            </span>
                          </div>
                        </div>
                        {getField('instagram', '') && (
                          <div className="hidden sm:flex px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                              VERIFICADO
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6 relative z-10">
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-6 bg-background/40 p-6 rounded-[2rem] border border-foreground/5 md:">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 ml-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <label className="text-[10px] font-black uppercase text-foreground/70 tracking-[0.2em] leading-none">
                                  Edad (Años)
                                </label>
                              </div>
                              <input
                                type="number"
                                className="w-full h-14 bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-5 text-foreground text-lg font-black outline-none focus:border-primary focus:bg-primary/5 transition-all shadow-inner"
                                value={editedData.age}
                                onChange={(e) =>
                                  setEditedData({ ...editedData, age: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 ml-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <label className="text-[10px] font-black uppercase text-foreground/70 tracking-[0.2em] leading-none">
                                  Altura (cm)
                                </label>
                              </div>
                              <input
                                type="number"
                                className="w-full h-14 bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-5 text-foreground text-lg font-black outline-none focus:border-primary focus:bg-primary/5 transition-all shadow-inner"
                                value={editedData.height}
                                onChange={(e) =>
                                  setEditedData({ ...editedData, height: e.target.value })
                                }
                              />
                            </div>
                            <div className="col-span-full space-y-3 mt-2">
                              <div className="flex items-center gap-2 ml-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <label className="text-[10px] font-black uppercase text-foreground/70 tracking-[0.2em] leading-none">
                                  Pie Dominante
                                </label>
                              </div>
                              <div className="relative">
                                <select
                                  className="w-full h-14 bg-foreground/[0.03] border border-foreground/10 rounded-2xl px-5 text-foreground text-sm font-black outline-none focus:border-primary focus:bg-primary/5 appearance-none cursor-pointer transition-all uppercase shadow-inner"
                                  value={editedData.preferredFoot}
                                  onChange={(e) =>
                                    setEditedData({ ...editedData, preferredFoot: e.target.value })
                                  }
                                >
                                  <option value="Derecha">Diestro</option>
                                  <option value="Zurda">Zurdo</option>
                                  <option value="Ambidiestro">Ambidiestro</option>
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 rotate-90 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-y-10 gap-x-6">
                            {[
                              {
                                label: 'Ciclos',
                                value: displayAge,
                                unit: 'Años',
                                dot: 'bg-primary',
                              },
                              {
                                label: 'Estatura',
                                value: displayHeight,
                                unit: 'cm',
                                dot: 'bg-blue-400',
                              },
                              {
                                label: 'Eje Hábil',
                                value: displayFoot,
                                unit: '',
                                dot: 'bg-accent',
                              },
                              {
                                label: 'Alineación',
                                value: teamName,
                                unit: '',
                                dot: 'bg-purple-400',
                                isTeam: true,
                              },
                            ].map((item, idx) => (
                              <div
                                key={idx}
                                className="space-y-3 bg-background/30 p-5 rounded-[2rem] border border-foreground/[0.03] hover:border-foreground/10 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={cn('w-1.5 h-1.5 rounded-full', item.dot)} />
                                  <span className="text-[10px] font-black uppercase text-foreground/50 tracking-[0.3em] leading-none">
                                    {item.label}
                                  </span>
                                </div>
                                <p
                                  className={cn(
                                    'text-2xl lg:text-3xl font-black italic uppercase tracking-tighter truncate',
                                    item.isTeam
                                      ? 'text-primary hover:text-white transition-colors cursor-pointer'
                                      : 'text-foreground'
                                  )}
                                >
                                  {item.value}{' '}
                                  <span className="text-foreground/40 text-sm not-italic ml-1 tracking-normal font-bold">
                                    {item.unit}
                                  </span>
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                        className={cn(
                          'p-10 lg:p-12 rounded-[3.5rem] border border-foreground/10 space-y-10 relative overflow-hidden group transition-all duration-700 h-full',
                          'bg-surface/50 dark:bg-foreground/5 md:',
                          'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.4)]',
                          isEditing
                            ? 'z-50 ring-4 ring-primary/30 shadow-[0_0_100px_rgba(16,185,129,0.2)] bg-background/80 scale-[1.02]'
                            : ''
                        )}
                      >
                        <div className="absolute top-0 left-0 w-64 h-64 bg-accent/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        {isEditing ? (
                          <>
                            <div className="flex items-center justify-between relative z-10 border-b border-foreground/5 pb-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-[1.5rem] bg-background/50 flex items-center justify-center border border-accent/20 shadow-[0_0_20px_rgba(245,158,11,0.1)] group-hover:scale-110 transition-transform">
                                        <Zap className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground italic leading-none">
                                            Atributos
                                        </h3>
                                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] mt-1">
                                            Skill Points: <span className="text-primary">{skillPoints}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10 pb-4">
                                {(Object.keys(editedStats) as Array<keyof PlayerStats>).map((stat) => (
                                    <div key={stat} className="bg-background/40 p-5 rounded-[2rem] border border-foreground/5 space-y-3 group/skill relative overflow-hidden">
                                         <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black uppercase text-foreground/50 tracking-[0.2em] group-hover/skill:text-primary transition-colors italic">{stat}</span>
                                            <span className="text-xl font-black italic text-foreground tracking-tighter">{editedStats[stat]}</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                            <button 
                                              onClick={() => {
                                                if (editedStats[stat] > 0) {
                                                  setEditedStats({ ...editedStats, [stat]: editedStats[stat] - 1 });
                                                  setSkillPoints(skillPoints + 1);
                                                }
                                              }}
                                              className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all text-foreground/30"
                                            >-</button>
                                            <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    className="h-full bg-primary shadow-[0_0_10px_rgba(44,252,125,0.4)]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(editedStats[stat] / 99) * 100}%` }}
                                                />
                                            </div>
                                            <button 
                                              onClick={() => {
                                                if (skillPoints > 0 && editedStats[stat] < 99) {
                                                  setEditedStats({ ...editedStats, [stat]: editedStats[stat] + 1 });
                                                  setSkillPoints(skillPoints - 1);
                                                }
                                              }}
                                              className="w-10 h-10 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-foreground/30"
                                            >+</button>
                                         </div>
                                    </div>
                                ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between relative z-10 border-b border-foreground/5 pb-6">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[1.5rem] bg-background/50 flex items-center justify-center border border-accent/20 shadow-[0_0_20px_rgba(245,158,11,0.1)] group-hover:scale-110 transition-transform">
                                  <Zap className="w-6 h-6 text-accent" />
                                </div>
                                <div className="flex flex-col">
                                  <h3 className="text-xl font-black uppercase tracking-tighter text-foreground italic leading-none">
                                    Rendimiento
                                  </h3>
                                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] mt-1">
                                    Métricas de Juego
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-8 relative z-10 w-full">
                              {[
                                {
                                  label: 'Victorias Totales',
                                  value: displayMatchesWon,
                                  color: 'text-foreground',
                                },
                                {
                                  label: 'Win Rate',
                                  value: `${displayMatches > 0 ? Math.min(100, Math.round((displayMatchesWon / displayMatches) * 100)) : 0}%`,
                                  color: 'text-foreground',
                                },
                                {
                                  label: 'MVP Frecuencia',
                                  value: `${displayMatches > 0 ? Math.min(100, (displayMvpCount / displayMatches) * 100).toFixed(1) : '0.0'}%`,
                                  color: 'text-accent',
                                  isLarge: true,
                                },
                              ].map((stat, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center group/item p-4 rounded-2xl hover:bg-foreground/[0.02] transition-colors border border-transparent hover:border-foreground/5"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="font-mono text-[9px] text-foreground/20 italic font-bold">
                                      0{idx + 1}
                                    </div>
                                    <span className="text-[11px] font-black uppercase text-foreground/50 tracking-[0.3em] group-hover/item:text-foreground transition-colors">
                                      {stat.label}
                                    </span>
                                  </div>
                                  <span
                                    className={cn(
                                      'font-black italic tracking-tighter leading-none text-right',
                                      stat.isLarge
                                        ? 'text-4xl lg:text-5xl drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                                        : 'text-3xl lg:text-4xl',
                                      stat.color
                                    )}
                                  >
                                    {stat.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                  </div>

                  {/* Team Section */}
                  {userTeam && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        'glass-premium p-10 lg:p-12 rounded-[3.5rem] border border-foreground/10 relative overflow-hidden group/team cursor-default transition-all duration-700 z-10',
                        isEditing
                          ? 'opacity-30 blur-sm pointer-events-none grayscale'
                          : 'hover:border-primary/40 hover:shadow-[0_0_50px_rgba(16,185,129,0.1)] focus-within:border-primary/40'
                      )}
                    >
                      <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-gradient-radial from-primary/10 via-transparent to-transparent -translate-y-1/2 translate-x-1/4 opacity-0 group-hover/team:opacity-100 transition-opacity duration-1000 blur-3xl" />
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover/team:opacity-100 transition-opacity duration-1000" />

                      <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                        {/* Team Crest/Logo */}
                        <div className="relative shrink-0 perspective-1000">
                          <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full scale-110 group-hover/team:scale-150 transition-transform duration-1000" />
                          <div className="w-36 h-36 md:w-48 md:h-48 rounded-[3rem] bg-background/80 border border-foreground/10 flex items-center justify-center overflow-hidden relative shadow-2xl group-hover/team:border-primary/50 transition-all duration-700 md: group-hover/team:-translate-y-2 group-hover/team:rotate-y-12">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/team:opacity-100 transition-opacity" />
                            {userTeam.logo_url ? (
                              <img
                                src={userTeam.logo_url}
                                alt={userTeam.name}
                                className="w-full h-full object-cover group-hover/team:scale-110 group-hover/team:rotate-3 transition-all duration-1000"
                              />
                            ) : (
                              <Shield className="w-20 h-20 md:w-28 md:h-28 text-foreground/20 group-hover/team:text-primary transition-colors duration-700 drop-shadow-md" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 space-y-8 text-center lg:text-left w-full">
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                              <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2 group-hover/team:bg-primary/20 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
                                  AFILIACIÓN ACTIVA
                                </span>
                              </div>
                              <span className="text-[10px] font-black text-foreground/30 italic tracking-widest uppercase">
                                NODE #{userTeam.id.slice(0, 8)}
                              </span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black italic text-foreground uppercase tracking-tighter leading-none group-hover/team:text-transparent group-hover/team:bg-clip-text group-hover/team:bg-gradient-to-r group-hover/team:from-foreground group-hover/team:to-primary transition-all duration-700">
                              {userTeam.name}
                            </h2>
                            {userTeam.motto && (
                              <p className="text-base md:text-xl font-bold text-foreground/40 italic uppercase tracking-tight max-w-2xl mx-auto lg:mx-0">
                                "{userTeam.motto}"
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-background/30 p-6 rounded-[2.5rem] border border-foreground/[0.03]">
                            {[
                              {
                                icon: Trophy,
                                label: 'ELO Rango',
                                value: userTeam.elo,
                                color: 'text-primary',
                              },
                              {
                                icon: Users,
                                label: 'Squad',
                                value: userTeam.members_count,
                                color: 'text-blue-500',
                              },
                              {
                                icon: Shield,
                                label: 'Tier',
                                value: userTeam.level || 1,
                                color: 'text-accent',
                              },
                              {
                                icon: Zap,
                                label: 'Win Rate',
                                value:
                                  userTeam.wins + userTeam.losses > 0
                                    ? (
                                        (userTeam.wins /
                                          (userTeam.wins + userTeam.losses + userTeam.draws)) *
                                        100
                                      ).toFixed(0) + '%'
                                    : '--',
                                color: 'text-purple-500',
                              },
                            ].map((stat, i) => (
                              <div
                                key={i}
                                className="flex flex-col items-center lg:items-start gap-2 group/stat"
                              >
                                <div className="flex items-center gap-2">
                                  <stat.icon
                                    className={cn(
                                      'w-4 h-4 opacity-50 group-hover/stat:opacity-100 transition-opacity',
                                      stat.color
                                    )}
                                  />
                                  <span className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em]">
                                    {stat.label}
                                  </span>
                                </div>
                                <p className="text-3xl font-black text-foreground italic tracking-tighter uppercase group-hover/stat:scale-105 transition-transform origin-left">
                                  {stat.value}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <Link
                              href={`/team?id=${userTeam.id}`}
                              className="h-14 px-10 rounded-[1.5rem] bg-foreground hover:bg-white text-background font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 group/link"
                            >
                              Acceder Sede
                              <ExternalLink className="w-5 h-5 group-hover/link:rotate-12 transition-transform" />
                            </Link>
                            {userTeam.captain_id === (id === 'me' || !id ? user?.id : id) && (
                              <div className="h-14 px-8 rounded-[1.5rem] border-2 border-primary bg-primary/10 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                <Star className="w-5 h-5 text-primary fill-primary animate-pulse" />
                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">
                                  Capitán
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  {userMatches.filter((m) => {
                    if (m.is_completed) return true;
                    const matchStart = new Date(`${m.date}T${m.time}`);
                    const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
                    return new Date() > matchEnd;
                  }).length > 0 ? (
                    <div className="flex flex-col gap-6 w-full">
                      {userMatches
                        .filter((m) => {
                          if (m.is_completed) return true;
                          const matchStart = new Date(`${m.date}T${m.time}`);
                          const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
                          return new Date() > matchEnd;
                        })
                        .map((m, i) => {
                          const isCompleted = m.is_completed;
                          const scoreA = m.team_a_score ?? 0;
                          const scoreB = m.team_b_score ?? 0;
                          const userTeam = m.user_team;

                          let result: 'win' | 'loss' | 'draw' | null = null;
                          if (isCompleted && userTeam) {
                            if (scoreA === scoreB) result = 'draw';
                            else if (userTeam === 'A' && scoreA > scoreB) result = 'win';
                            else if (userTeam === 'B' && scoreB > scoreA) result = 'win';
                            else result = 'loss';
                          }

                          const resultConfig =
                            result === 'win'
                              ? { label: 'VICTORIA' }
                              : result === 'loss'
                                ? { label: 'DERROTA' }
                                : result === 'draw'
                                  ? { label: 'EMPATE' }
                                  : { label: '' };

                          return (
                            <Link
                              key={m.id}
                              href={`/match?id=${m.id}`}
                              className="block group relative"
                            >
                              <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent group-hover:animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[2.5rem] p-[1px]" />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-premium p-6 sm:p-8 md:p-10 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-br from-surface/40 via-background/40 to-surface/40 group-hover:bg-foreground/[0.04] group-hover:border-primary/20 transition-all duration-700 shadow-2xl overflow-hidden relative z-10 gap-6 sm:gap-10 min-h-[160px] transform-gpu group-hover:-translate-y-1"
                              >
                                {/* Subtle Noise Layer */}
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] group-hover:opacity-[0.04] mix-blend-overlay pointer-events-none transition-opacity duration-700" />

                                {/* Left Edge Neon Bar */}
                                <div
                                  className={cn(
                                    'absolute top-0 left-0 w-1.5 h-full transition-all duration-500',
                                    result === 'win'
                                      ? 'bg-gradient-to-b from-primary via-primary/40 to-transparent opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(44,252,125,0.5)]'
                                      : result === 'loss'
                                        ? 'bg-gradient-to-b from-red-500 via-red-500/40 to-transparent opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                        : result === 'draw'
                                          ? 'bg-gradient-to-b from-amber-500 via-amber-500/40 to-transparent opacity-30 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                                          : 'bg-gradient-to-b from-primary via-primary/40 to-transparent opacity-30 group-hover:opacity-100'
                                  )}
                                />

                                {/* Animated Hover Background FX */}
                                <div className="absolute -top-10 -right-20 w-64 h-64 bg-primary/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-full" />
                                <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-full" />

                                <div className="flex items-center gap-6 sm:gap-8 w-full md:w-auto relative z-10 pl-2">
                                  {/* Date Ticket Block */}
                                  <div className="w-20 h-20 rounded-[1.8rem] bg-background/80 border border-white/10 flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:scale-105 transition-all duration-500 overflow-hidden relative">
                                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                                    <span className="text-3xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors leading-none drop-shadow-md z-10 mt-1">
                                      {m.date.split('-')[2]}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic mt-1 group-hover:text-primary/70 transition-colors z-10">
                                      {
                                        [
                                          'ENE',
                                          'FEB',
                                          'MAR',
                                          'ABR',
                                          'MAY',
                                          'JUN',
                                          'JUL',
                                          'AGO',
                                          'SEP',
                                          'OCT',
                                          'NOV',
                                          'DIC',
                                        ][parseInt(m.date.split('-')[1]) - 1]
                                      }
                                    </span>
                                  </div>

                                  {/* Location & Title */}
                                  <div className="space-y-2 flex-1 min-w-0">
                                    <h4 className="text-2xl sm:text-3xl font-black text-foreground italic uppercase tracking-tighter truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-foreground group-hover:to-primary transition-all duration-500 leading-none">
                                      {(() => {
                                        const venue = findVenueByLocation(m.location);
                                        return venue?.displayName || venue?.name || m.location;
                                      })()}
                                    </h4>
                                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] italic -mt-1 group-hover:text-foreground/50 transition-colors">
                                      {m.time.slice(0, 5)} HS · {m.level || 'Nivel General'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(44,252,125,0.1)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/70 group-hover:bg-primary transition-colors animate-pulse shadow-[0_0_8px_rgba(44,252,125,1)]" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
                                          REPORTE OFICIAL
                                        </span>
                                      </div>
                                      {result && (
                                        <div
                                          className={cn(
                                            'px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.3em] shadow-sm transition-all duration-500',
                                            result === 'win'
                                              ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(44,252,125,0.1)]'
                                              : result === 'loss'
                                                ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                                : 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                                          )}
                                        >
                                          {resultConfig.label}
                                        </div>
                                      )}
                                      <span className="px-3 py-1 rounded-full bg-background border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/50 shadow-inner">
                                        {m.type}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Score Block */}
                                <div className="flex items-center gap-6 w-full md:w-auto justify-end relative z-10 mt-4 md:mt-0">
                                  <div
                                    className={cn(
                                      'flex items-center justify-center gap-4 w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 rounded-[2rem] border overflow-hidden transition-all duration-700 relative shadow-2xl',
                                      result === 'win'
                                        ? 'bg-primary/10 border-primary/20 shadow-[0_0_40px_rgba(44,252,125,0.1)]'
                                        : result === 'loss'
                                          ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]'
                                          : result === 'draw'
                                            ? 'bg-amber-500/10 border-amber-500/20 shadow-[0_0_40px_rgba(251,191,36,0.1)]'
                                            : 'bg-black/40 border-white/5'
                                    )}
                                  >
                                    {/* Shine effect inside score box */}
                                    <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer pointer-events-none" />

                                    <span
                                      className={cn(
                                        'text-5xl sm:text-6xl font-black italic tracking-tighter leading-none transition-all duration-300 drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)]',
                                        result === 'win' && userTeam === 'A'
                                          ? 'text-primary'
                                          : result === 'loss' && userTeam === 'A'
                                            ? 'text-red-500'
                                            : 'text-foreground'
                                      )}
                                    >
                                      {scoreA}
                                    </span>
                                    <div className="flex flex-col gap-1.5 items-center mx-3 md:mx-5 opacity-20">
                                      <span className="w-5 h-[3px] rounded-full bg-foreground" />
                                      <span className="w-5 h-[3px] rounded-full bg-foreground" />
                                    </div>
                                    <span
                                      className={cn(
                                        'text-5xl sm:text-6xl font-black italic tracking-tighter leading-none transition-all duration-300 drop-shadow-[0_4px_15px_rgba(0,0,0,0.5)]',
                                        result === 'win' && userTeam === 'B'
                                          ? 'text-primary'
                                          : result === 'loss' && userTeam === 'B'
                                            ? 'text-red-500'
                                            : 'text-foreground'
                                      )}
                                    >
                                      {scoreB}
                                    </span>
                                  </div>

                                  <div className="hidden md:flex flex-col items-center justify-center group/btn pl-3">
                                    <div className="w-14 h-14 rounded-full bg-foreground/[0.02] border border-white/5 group-hover:border-primary/30 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-500 shadow-inner overflow-hidden relative">
                                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                      <ChevronRight className="w-6 h-6 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-500 relative z-10" />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </Link>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="glass-premium p-20 rounded-[4rem] flex flex-col items-center justify-center text-center gap-10 border-dashed border-2 border-foreground/10 bg-foreground/[0.01]">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center shadow-2xl">
                        <History className="w-10 h-10 text-foreground/10" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-2xl font-black text-foreground italic uppercase tracking-tighter">
                          Sin Despliegues Registrados
                        </p>
                        <p className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.3em]">
                          {isMe
                            ? 'Tu historial de partidos está listo para ser escrito.'
                            : 'Este jugador aún no tiene partidos registrados.'}
                        </p>
                      </div>
                      <Link href="/search">
                        <button className="h-14 px-10 bg-primary/5 hover:bg-primary text-primary hover:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-xl border border-primary/20 transition-all active:scale-95">
                          INICIAR CONVOCATORIA
                        </button>
                      </Link>
                    </div>
                  )}
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
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="max-w-full w-full mx-auto pb-20"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Main Content: Comments List */}
                    <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1 space-y-8 relative">
                      
                      <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(44,252,125,0.6)] animate-pulse" />
                          <h3 className="text-3xl font-black italic text-foreground uppercase tracking-tighter drop-shadow-md">
                            Cronología <span className="text-foreground/40">Social</span>
                          </h3>
                        </div>
                        <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2 shadow-[0_0_10px_rgba(44,252,125,0.1)]">
                          <MessageSquare className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
                            {comments.length} Mensajes
                          </span>
                        </div>
                      </div>

                      <div className="relative">
                        {/* Vertical Timeline Line */}
                        {comments.length > 0 && !isLoadingComments && (
                          <div className="absolute left-8 top-4 bottom-10 w-0.5 bg-gradient-to-b from-primary/50 via-primary/10 to-transparent hidden sm:block z-0" />
                        )}

                        <div className="space-y-8 relative z-10">
                          {isLoadingComments ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-60">
                              <div className="relative w-16 h-16 flex items-center justify-center">
                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
                                <Loader2 className="w-8 h-8 animate-spin text-primary relative z-10" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary drop-shadow-[0_0_10px_rgba(44,252,125,0.5)]">
                                Sincronizando Muro...
                              </span>
                            </div>
                          ) : comments.length > 0 ? (
                            comments.map((comment, i) => (
                              <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative flex gap-6 sm:gap-8 items-start"
                              >
                                {/* Timeline Node */}
                                <div className="hidden sm:flex shrink-0 w-16 h-16 rounded-[1.5rem] bg-background border border-primary/20 items-center justify-center shadow-[0_0_20px_rgba(44,252,125,0.1)] relative z-10 group-hover:bg-primary/10 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-500 overflow-hidden">
                                  {comment.author?.avatar_url ? (
                                    <img
                                      src={comment.author.avatar_url}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                  ) : (
                                    <MessageSquare className="w-6 h-6 text-primary/50 group-hover:text-primary transition-colors" />
                                  )}
                                  <div className="absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-white/10 pointer-events-none" />
                                </div>

                                {/* Comment Card */}
                                <div className="glass-premium flex-1 p-6 sm:p-8 rounded-[2.5rem] border border-foreground/10 flex flex-col gap-4 relative overflow-hidden transition-all duration-500 group-hover:bg-foreground/[0.03] group-hover:border-primary/30 group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] group-hover:-translate-y-1">
                                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full" />
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  
                                  {/* Mobile Avatar (Hidden on Desktop where Node is used) */}
                                  <div className="flex items-center gap-4 sm:hidden mb-2">
                                     <div className="w-12 h-12 rounded-xl bg-background border border-foreground/10 overflow-hidden">
                                        {comment.author?.avatar_url ? (
                                          <img
                                            src={comment.author.avatar_url}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-foreground/40 bg-foreground/5">
                                            {comment.author?.name?.slice(0, 2).toUpperCase() || 'P'}
                                          </div>
                                        )}
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-sm font-black italic uppercase tracking-tighter text-foreground">
                                          {comment.author?.name || 'Veterano'}
                                        </span>
                                        <span className="text-[9px] font-black text-foreground/40 italic uppercase tracking-widest">
                                          {new Date(comment.created_at).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                          })}
                                        </span>
                                     </div>
                                  </div>

                                  <div className="flex-1 space-y-3">
                                    <div className="hidden sm:flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="text-lg font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                          {comment.author?.name || 'Veterano'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-foreground/5 border border-foreground/10 text-[9px] font-black text-foreground/50 italic uppercase tracking-widest">
                                          {new Date(comment.created_at).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short',
                                          })}
                                        </span>
                                      </div>
                                      {(isMe || user?.id === comment.author_id) && (
                                        <button
                                          onClick={() => handleDeleteComment(comment.id)}
                                          className="p-2.5 rounded-xl text-foreground/20 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                          <Trash className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-[15px] text-foreground/80 leading-relaxed font-medium">
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="glass-premium p-20 rounded-[4rem] flex flex-col items-center justify-center text-center gap-10 border-dashed border-2 border-foreground/10 bg-foreground/[0.01] overflow-hidden relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-30" />
                              <div className="w-24 h-24 rounded-[3rem] bg-background border border-foreground/10 flex items-center justify-center shadow-2xl relative z-10 group-hover:border-primary/30 transition-all">
                                <MessageSquare className="w-10 h-10 text-foreground/20" />
                              </div>
                              <div className="space-y-3 relative z-10">
                                <p className="text-3xl font-black text-foreground italic uppercase tracking-tighter">
                                  Silencio <span className="text-foreground/40">en el Campo</span>
                                </p>
                                <p className="text-[10px] font-black uppercase text-foreground/30 tracking-[0.3em] max-w-sm">
                                  El muro está vacío. Sé el primero en dejar tu marca y comenzar la conversación.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar: Header + Submit Form */}
                    <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
                      <div className="lg:sticky lg:top-24 space-y-8">
                        {/* Wall Header Card */}
                        <div className="glass-premium p-10 rounded-[3.5rem] border border-primary/20 space-y-8 relative overflow-hidden group/header text-center lg:text-left bg-gradient-to-br from-surface/40 via-background/40 to-surface/40 hover:border-primary/40 transition-all duration-700 hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)]">
                          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
                          <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/20 blur-[60px] opacity-50 group-hover/header:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full" />
                          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-accent/10 blur-[60px] opacity-0 group-hover/header:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full" />
                          
                          <div className="w-20 h-20 rounded-[2rem] bg-background border border-primary/30 flex items-center justify-center mx-auto lg:mx-0 shadow-[0_0_30px_rgba(44,252,125,0.2)] group-hover/header:scale-110 transition-transform duration-500 relative z-10">
                            <Star className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(44,252,125,0.8)] fill-primary/20" />
                          </div>
                          
                          <div className="space-y-4 relative z-10">
                            <h3 className="text-5xl font-black italic text-foreground uppercase tracking-tighter leading-none group-hover/header:text-transparent group-hover/header:bg-clip-text group-hover/header:bg-gradient-to-r group-hover/header:from-foreground group-hover/header:to-primary transition-all duration-700">
                              Muro de <br className="hidden lg:block"/> Honor
                            </h3>
                            <p className="text-[11px] font-black uppercase text-foreground/50 tracking-[0.3em] leading-relaxed">
                              Deja un mensaje para la posteridad en el perfil de este jugador. Comparte anécdotas, elogios o desafíos.
                            </p>
                          </div>
                        </div>

                        {/* Submit Comment Card */}
                        {user && (
                          <form
                            onSubmit={handlePostComment}
                            className="glass-premium p-8 rounded-[3.5rem] border border-foreground/10 space-y-6 relative overflow-hidden group/form transition-all duration-500 focus-within:border-primary/40 focus-within:shadow-[0_20px_60px_rgba(16,185,129,0.1)]"
                          >
                            <div className="flex items-center gap-4 mb-4 relative z-10">
                              <div className="w-12 h-12 rounded-[1.2rem] bg-background border border-foreground/10 overflow-hidden shrink-0 shadow-inner group-focus-within/form:border-primary/30 transition-colors">
                                {user.user_metadata?.avatar_url ? (
                                  <img
                                    src={user.user_metadata.avatar_url}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-black text-foreground/40 bg-foreground/5">
                                    {user.name?.slice(0, 2).toUpperCase() || 'P'}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 italic leading-none">
                                  Publicar como
                                </span>
                                <span className="text-[13px] font-black text-foreground italic uppercase tracking-tight group-focus-within/form:text-primary transition-colors">
                                  {user.name}
                                </span>
                              </div>
                            </div>
                            <div className="relative space-y-4 z-10 block">
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escribe un mensaje épico..."
                                className="w-full min-h-[160px] bg-background/40 border border-foreground/5 rounded-[2rem] p-6 text-foreground text-[15px] font-medium outline-none focus:border-primary/40 focus:bg-primary/[0.02] transition-all resize-none placeholder:text-foreground/20 shadow-inner"
                                disabled={isPostingComment}
                              />
                              <button
                                type="submit"
                                disabled={isPostingComment || !newComment.trim()}
                                className="w-full h-16 rounded-[2rem] bg-foreground text-background text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-primary hover:text-black hover:shadow-[0_0_30px_rgba(44,252,125,0.4)] transition-all duration-300 disabled:opacity-50 disabled:grayscale disabled:hover:bg-foreground disabled:hover:text-background flex items-center justify-center gap-3 active:scale-95 group/btn"
                              >
                                {isPostingComment ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Send className="w-5 h-5 group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform" />
                                )}
                                Enviar Mensaje
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
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
