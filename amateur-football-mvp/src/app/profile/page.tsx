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
    ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getUserMatches, Match } from '@/lib/matches';
import { ProfileSkeleton } from '@/components/Skeletons';
import { getDominantColor } from '@/lib/colorUtils';
import { uploadUserAvatar } from '@/lib/storage';
import { compressImage, blobToFile } from '@/lib/imageUtils';

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
    }
};

function ProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading, deleteAccount } = useAuth();
    
    // Get ID from query param ?id=...
    const id = searchParams.get('id');
    const isMe = id === 'me' || id === user?.id || (!id && user?.id);

    const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        name: '',
        age: '',
        height: '',
        preferredFoot: 'Derecha',
        position: 'DC'
    });

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
                position: (metadata.position || user.user_metadata?.position || 'DC').toUpperCase()
            });
        }
    }, [isMe, user]);

    useEffect(() => {
        const fetchProfileData = async () => {
            const targetId = (id === 'me' || !id) ? user?.id : id;
            if (!targetId) return;

            setIsLoadingProfile(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', targetId)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                if (data) setTargetProfile(data);
            } catch (err) {
                console.error('Error cargando perfil:', err);
            } finally {
                setIsLoadingProfile(false);
            }

            // Fetch Gamification Data
            try {
                const [badgesRes, teamRes] = await Promise.all([
                    supabase.from('user_badges').select('*').eq('user_id', targetId),
                    supabase.from('team_members').select('teams(*)').eq('user_id', targetId).single()
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
        };

        if (user || !isMe) {
            fetchProfileData();
        }
    }, [user, id, isMe]);

    const authMetadata = user?.user_metadata || {};
    const dbProfile = targetProfile || {};
    const dbMetadata = dbProfile.user_metadata || {};

    const getField = (field: string, defaultValue: any, snakeCaseField?: string) => {
        if (isMe) {
            return authMetadata[field] || dbProfile[field] || (snakeCaseField ? dbProfile[snakeCaseField] : null) || defaultValue;
        }
        return dbProfile[field] || (snakeCaseField ? dbProfile[snakeCaseField] : null) || dbMetadata[field] || defaultValue;
    };

    useEffect(() => {
        const currentAvatar = avatarPreview || getField('avatar_url', null);
        if (currentAvatar) {
            getDominantColor(currentAvatar).then(color => {
                if (color) setAmbientColor(color);
            });
        }
    }, [dbProfile, authMetadata, avatarPreview]);

    const resolveStats = (): PlayerStats => {
        const statsSource = isMe ? authMetadata.stats : (dbProfile.stats || dbMetadata.stats);
        if (statsSource && typeof statsSource === 'object') return statsSource as PlayerStats;
        
        return {
            pac: getField('pac', DEFAULT_PLAYER.stats.pac),
            sho: getField('sho', DEFAULT_PLAYER.stats.sho),
            pas: getField('pas', DEFAULT_PLAYER.stats.pas),
            dri: getField('dri', DEFAULT_PLAYER.stats.dri),
            def: getField('def', DEFAULT_PLAYER.stats.def),
            phy: getField('phy', DEFAULT_PLAYER.stats.phy),
        };
    };

    const playerStats = resolveStats();
    const playerOverall = getField('overall', Math.round(Object.values(playerStats).reduce((a: number, b: number) => a + b, 0) / 6));

    const displayPlayer = {
        ...DEFAULT_PLAYER,
        name: (isMe ? (user?.name || editedData.name) : dbProfile.name) || DEFAULT_PLAYER.name,
        position: getField('position', DEFAULT_PLAYER.position) as string,
        overall: playerOverall as number,
        stats: playerStats
    };

    const displayAge = getField('age', '18');
    const displayHeight = getField('height', '170');
    const displayFoot = getField('preferredFoot', 'Derecha', 'preferred_foot');

    const displayMatches = getField('matches', 0);
    const displayElo = getField('elo', 0);
    const displayGoals = getField('goals', 0);
    const teamName = userTeam?.name || 'Sin equipo';

    const handleSaveProfile = async () => {
        if (!user?.id) {
            alert("Error: No se encontró ID de usuario.");
            return;
        }

        setIsSaving(true);
        try {
            console.log("Iniciando guardado de perfil para:", user.id);

            let newAvatarUrl = getField('avatar_url', null);
            if (avatarFile) {
                console.log("Subiendo nuevo avatar...");
                
                // Compress the image before uploading
                try {
                    console.log("Comprimiendo imagen...");
                    const compressedBlob = await compressImage(avatarFile, 800, 0.8);
                    const compressedFile = blobToFile(compressedBlob, avatarFile.name);
                    console.log(`Imagen comprimida: de ${Math.round(avatarFile.size / 1024)}KB a ${Math.round(compressedFile.size / 1024)}KB`);
                    newAvatarUrl = await uploadUserAvatar(compressedFile, user.id);
                } catch (compressionError) {
                    console.error("Error comprimiendo imagen, intentando subir original:", compressionError);
                    newAvatarUrl = await uploadUserAvatar(avatarFile, user.id);
                }
                
                console.log("Avatar subido:", newAvatarUrl);
            }

            // 1. Update Public Profile (Source of Truth) FIRST
            // This ensures onAuthStateChange fetches the NEW data
            console.log("Actualizando tabla de perfiles...");
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    name: editedData.name,
                    position: editedData.position,
                    preferred_foot: editedData.preferredFoot,
                    age: parseInt(editedData.age) || 18,
                    height: parseInt(editedData.height) || 170,
                    avatar_url: newAvatarUrl,
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                console.error("Error en tabla de perfiles:", profileError);
                throw new Error(`Error en el perfil público: ${profileError.message}`);
            }

            // SUCCESS! 
            // We stop the spinner and close the editor immediately after DB success
            setIsSaving(false);
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
            router.refresh();

            // 2. Update Auth Metadata (for the current session) - Background Fire
            // This triggers onAuthStateChange to refresh headers, but we don't 'await' it
            // to avoid hanging if the Auth server is slow.
            console.log("Actualizando metadata en segundo plano...");
            supabase.auth.updateUser({
                data: {
                    name: editedData.name,
                    full_name: editedData.name,
                    age: editedData.age,
                    height: editedData.height,
                    preferredFoot: editedData.preferredFoot,
                    position: editedData.position,
                    avatar_url: newAvatarUrl
                }
            }).catch(e => console.warn("Error secundario en metadata de auth:", e));

        } catch (error: any) {
            console.error("Error crítico en handleSaveProfile:", error);
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
            alert("La contraseña debe tener al menos 6 caracteres");
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
            getDominantColor(previewUrl).then(color => {
                if (color) setAmbientColor(color);
            });
        }
    };

    if (isLoading || (isLoadingProfile && !isMe)) {
        return <ProfileSkeleton />;
    }

    if (isMe && !user && !isLoading) {
        router.push('/login');
        return null;
    }

    return (
        <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-10 xl:p-14 2xl:p-16 max-w-screen-2xl mx-auto min-h-screen bg-background relative overflow-hidden snap-y snap-proximity overflow-y-auto">
            {/* Ambient Effects */}
            <div className="absolute top-0 left-0 w-full h-[50dvh] pointer-events-none">
                <div 
                    className="absolute inset-0 bg-gradient-to-b via-transparent to-transparent opacity-30" 
                    style={{ backgroundImage: ambientColor ? `linear-gradient(to bottom, ${ambientColor}, transparent)` : undefined }}
                />
                <div 
                    className={cn("absolute top-[-10%] right-[-10%] w-[60%] h-[100%] blur-[120px] rounded-full animate-pulse", !ambientColor && "bg-primary/5")} 
                    style={{ backgroundColor: ambientColor || undefined }}
                />
            </div>

            {/* Header / Actions */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 italic">Central de Jugador</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic text-foreground uppercase tracking-tighter leading-none group">
                        {isMe ? 'Mi ' : ''}
                        <span className="text-foreground/40 group-hover:text-primary transition-colors duration-500">Perfil</span>
                        {!isMe && <span className="text-foreground/20 ml-4 group-hover:text-primary/40 transition-colors">Público</span>}
                    </h1>
                </div>

                {isMe && (
                    <div className="flex items-center gap-4">
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex gap-4"
                                >
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="h-11 px-6 rounded-xl bg-foreground/5 border border-foreground/10 text-[10px] font-black uppercase tracking-widest text-foreground/50 hover:text-foreground transition-all disabled:opacity-50 active:scale-95"
                                        disabled={isSaving}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="h-11 px-6 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-white transition-all disabled:opacity-50 flex items-center gap-3 active:scale-95"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Guardar
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setIsEditing(true)}
                                    className="h-11 px-8 rounded-xl bg-foreground/5 border border-foreground/10 text-[11px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-foreground/10 transition-all flex items-center gap-3 group active:scale-95"
                                >
                                    <Edit2 className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform duration-500" />
                                    Editar Perfil
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Profile Hero Section */}
            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center lg:items-start pt-4">
                {/* Left: FIFA Card */}
                <div className="relative shrink-0 group">
                    <div 
                        className={cn("absolute -inset-20 blur-[120px] rounded-full pointer-events-none animate-pulse", !ambientColor && "bg-primary/10")} 
                        style={{ backgroundColor: ambientColor || undefined }}
                    />
                    <div className="relative">
                        <FifaCard player={{ 
                            ...displayPlayer, 
                            name: (isEditing ? editedData.name : displayPlayer.name) as string, 
                            position: (isEditing ? editedData.position : displayPlayer.position) as string,
                            image: avatarPreview || getField('avatar_url', undefined) as string | undefined,
                            mvpTrophies: mvpCount,
                            badges: userBadges.map(b => b.badge_type as string)
                        }} />
                        
                        {isEditing && (
                            <label className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-all text-foreground border-4 border-dashed border-primary/20 rounded-[2rem] m-2">
                                <Camera className="w-8 h-8 mb-2 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Cambiar Foto</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </label>
                        )}
                    </div>
                    
                    {isEditing && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 glass-premium p-6 space-y-4 border border-primary/20 rounded-[2rem] shadow-xl"
                        >
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] ml-1">Nombre en Carta</label>
                                <input
                                    type="text"
                                    className="w-full h-14 bg-background/40 border border-foreground/5 rounded-2xl px-6 text-foreground text-sm font-black outline-none focus:border-primary/50 transition-all uppercase placeholder:foreground/20"
                                    value={editedData.name}
                                    onChange={e => setEditedData({ ...editedData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] ml-1">Posición Principal</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-14 bg-background/40 border border-foreground/5 rounded-2xl px-6 text-foreground text-sm font-black outline-none focus:border-primary/50 appearance-none cursor-pointer uppercase transition-all"
                                        value={editedData.position}
                                        onChange={e => setEditedData({ ...editedData, position: e.target.value })}
                                    >
                                        <option value="POR">PORTERO (POR)</option>
                                        <option value="DFC">DEFENSA (DFC)</option>
                                        <option value="MC">MEDIOCAMPISTA (MC)</option>
                                        <option value="DC">DELANTERO (DC)</option>
                                        <option value="ED">EXTREMO DERECHO (ED)</option>
                                        <option value="EI">EXTREMO IZQUIERDO (EI)</option>
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 rotate-90 pointer-events-none" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right: Stats & Info */}
                <div className="flex-1 w-full space-y-12">
                    {/* Stats Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { icon: Trophy, label: 'Estatus Card', value: displayElo, color: 'text-primary', unit: 'ELO' },
                            { icon: History, label: 'Despliegues', value: displayMatches, color: 'text-blue-500', unit: 'EXP' },
                            { icon: Target, label: 'Objetivos', value: displayGoals, color: 'text-accent', unit: 'GOL' }
                        ].map((node, i) => (
                            <div key={i} className="glass-premium p-8 rounded-[3rem] border border-foreground/10 relative overflow-hidden group transition-all duration-500 hover:y-[-8px]">
                                <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r via-transparent opacity-50", 
                                    i === 0 ? "from-primary" : i === 1 ? "from-blue-500" : "from-accent"
                                )} />
                                <div className="flex items-center justify-between mb-4">
                                    <node.icon className={cn("w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity", node.color)} />
                                    <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest italic">Node 0{i+1}</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-foreground italic tracking-tighter leading-none">{node.value}</span>
                                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">{node.unit}</span>
                                </div>
                                <p className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.3em] mt-3 ml-0.5">{node.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="sticky top-0 z-30 py-4 bg-background/80 backdrop-blur-xl -mx-4 px-4 lg:-mx-0 lg:px-0">
                        <div className="flex p-1.5 bg-foreground/5 rounded-[2rem] border border-foreground/10 relative shadow-2xl backdrop-blur-3xl">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={cn(
                                    "flex-1 py-4 text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all relative z-10 italic",
                                    activeTab === 'overview' ? 'text-black' : 'text-foreground/40 hover:text-foreground'
                                )}
                            >
                                Resumen
                            </button>

                            <button
                                onClick={() => setActiveTab('history')}
                                className={cn(
                                    "flex-1 py-4 text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all relative z-10 italic",
                                    activeTab === 'history' ? 'text-black' : 'text-foreground/40 hover:text-foreground'
                                )}
                            >
                                Cronología
                            </button>
                            <motion.div 
                                layoutId="profile-tab-pill-premium"
                                className="absolute inset-y-1.5 bg-primary rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                                initial={false}
                                animate={{
                                    left: activeTab === 'overview' ? '6px' : '50%',
                                    right: activeTab === 'overview' ? '50%' : '6px',
                                }}
                                transition={{ type: 'spring' as const, stiffness: 400, damping: 35 }}
                            />
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
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
                                        <div className="glass-premium p-10 rounded-[3rem] border border-foreground/10 space-y-8 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                    <Info className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground italic">Biometría</h3>
                                                    <span className="text-[9px] font-black text-foreground/70 uppercase tracking-widest leading-none">Identidad de Jugador</span>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                {isEditing ? (
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase text-foreground/70 tracking-[0.2em] ml-1">Edad</label>
                                                            <input
                                                                type="number"
                                                                className="w-full h-12 bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 text-foreground text-sm font-black outline-none focus:border-primary/40 transition-all"
                                                                value={editedData.age}
                                                                onChange={e => setEditedData({ ...editedData, age: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase text-foreground/70 tracking-[0.2em] ml-1">Altura (cm)</label>
                                                            <input
                                                                type="number"
                                                                className="w-full h-12 bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 text-foreground text-sm font-black outline-none focus:border-primary/40 transition-all"
                                                                value={editedData.height}
                                                                onChange={e => setEditedData({ ...editedData, height: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="col-span-full space-y-2">
                                                            <label className="text-[10px] font-black uppercase text-foreground/70 tracking-[0.2em] ml-1">Perfil de Pierna</label>
                                                            <select
                                                                className="w-full h-12 bg-foreground/[0.02] border border-foreground/10 rounded-xl px-4 text-foreground text-sm font-black outline-none focus:border-primary/40 appearance-none transition-all uppercase"
                                                                value={editedData.preferredFoot}
                                                                onChange={e => setEditedData({ ...editedData, preferredFoot: e.target.value })}
                                                            >
                                                                <option value="Derecha">Derecha</option>
                                                                <option value="Zurda">Zurda</option>
                                                                <option value="Ambidiestro">Ambidiestro</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-y-10">
                                                        <div className="space-y-2">
                                                            <span className="text-[10px] font-black uppercase text-foreground/60 tracking-[0.3em]">Edad Real</span>
                                                            <p className="text-xl font-black text-foreground italic uppercase tracking-tighter">{displayAge} <span className="text-foreground/65 text-[11px] not-italic ml-1">Años</span></p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <span className="text-[10px] font-black uppercase text-foreground/60 tracking-[0.3em]">Envergadura</span>
                                                            <p className="text-xl font-black text-foreground italic uppercase tracking-tighter">{displayHeight} <span className="text-foreground/65 text-[11px] not-italic ml-1">cm</span></p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <span className="text-[10px] font-black uppercase text-foreground/60 tracking-[0.3em]">Perfil Hábil</span>
                                                            <p className="text-xl font-black text-foreground italic uppercase tracking-tighter">{displayFoot}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <span className="text-[10px] font-black uppercase text-foreground/60 tracking-[0.3em]">Afiliación</span>
                                                            <p className="text-xl font-black text-primary italic uppercase tracking-tighter group-hover:scale-110 transition-transform origin-left">{teamName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="glass-premium p-10 rounded-[3rem] border border-foreground/10 space-y-8 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                                                    <Zap className="w-5 h-5 text-accent" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground italic">Performance</h3>
                                                    <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest leading-none">Análisis de Despliegue</span>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-end border-b border-foreground/5 pb-4 group/item">
                                                    <span className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] group-hover/item:text-foreground transition-colors">Victorias Totales</span>
                                                    <span className="text-2xl font-black text-foreground italic leading-none">--</span>
                                                </div>
                                                <div className="flex justify-between items-end border-b border-foreground/5 pb-4 group/item">
                                                    <span className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] group-hover/item:text-foreground transition-colors">Goles Promedio</span>
                                                    <span className="text-2xl font-black text-foreground italic leading-none">{displayMatches > 0 ? (displayGoals / displayMatches).toFixed(1) : '--'}</span>
                                                </div>
                                                <div className="flex justify-between items-end border-b border-foreground/5 pb-4 group/item">
                                                    <span className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] group-hover/item:text-foreground transition-colors">MVP Ratio</span>
                                                    <span className="text-3xl font-black text-accent italic leading-none drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                                        {displayMatches > 0 ? ((mvpCount / displayMatches) * 100).toFixed(1) : '0.0'}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Team Section */}
                                    {userTeam && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="glass-premium p-10 rounded-[3rem] border border-foreground/10 relative overflow-hidden group/team cursor-default"
                                        >
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] opacity-0 group-hover/team:opacity-100 transition-opacity duration-700" />
                                            
                                            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                                                {/* Team Crest/Logo */}
                                                <div className="relative shrink-0">
                                                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 group-hover/team:scale-150 transition-transform duration-700" />
                                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center overflow-hidden relative shadow-2xl group-hover/team:border-primary/40 transition-colors">
                                                        {userTeam.logo_url ? (
                                                            <img 
                                                                src={userTeam.logo_url} 
                                                                alt={userTeam.name} 
                                                                className="w-full h-full object-cover group-hover/team:scale-110 transition-transform duration-700"
                                                            />
                                                        ) : (
                                                            <Shield className="w-16 h-16 md:w-24 md:h-24 text-primary/40 group-hover/team:text-primary transition-colors" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-6 text-center md:text-left">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-center md:justify-start gap-4">
                                                            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                                                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] italic">EQUIPO ACTUAL</span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-foreground/20 italic tracking-widest uppercase">ID #{userTeam.id.slice(0, 8)}</span>
                                                        </div>
                                                        <h2 className="text-4xl md:text-6xl font-black italic text-foreground uppercase tracking-tighter leading-none group-hover/team:text-primary transition-colors duration-500">
                                                            {userTeam.name}
                                                        </h2>
                                                        {userTeam.motto && (
                                                            <p className="text-sm md:text-lg font-bold text-foreground/40 italic uppercase tracking-tight">
                                                                "{userTeam.motto}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                        {[
                                                            { icon: Trophy, label: 'ELO Equipo', value: userTeam.elo, color: 'text-primary' },
                                                            { icon: Users, label: 'Miembros', value: userTeam.members_count, color: 'text-blue-500' },
                                                            { icon: Shield, label: 'Nivel', value: userTeam.level || 1, color: 'text-accent' },
                                                            { icon: Zap, label: 'Victoria %', value: userTeam.wins + userTeam.losses > 0 ? ((userTeam.wins / (userTeam.wins + userTeam.losses + userTeam.draws)) * 100).toFixed(0) + '%' : '--', color: 'text-purple-500' }
                                                        ].map((stat, i) => (
                                                            <div key={i} className="space-y-1">
                                                                <div className="flex items-center justify-center md:justify-start gap-2">
                                                                    <stat.icon className={cn("w-4 h-4 opacity-40", stat.color)} />
                                                                    <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">{stat.label}</span>
                                                                </div>
                                                                <p className="text-2xl font-black text-foreground italic tracking-tighter uppercase">{stat.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                                                        <Link 
                                                            href={`/teams?id=${userTeam.id}`}
                                                            className="h-11 px-8 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-white transition-all shadow-xl shadow-primary/20 hover:shadow-white/20 active:scale-95"
                                                        >
                                                            Visitar Sede
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Link>
                                                        {userTeam.captain_id === (id === 'me' || !id ? user?.id : id) && (
                                                            <div className="h-11 px-6 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
                                                                <Star className="w-4 h-4 text-primary fill-primary" />
                                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Capitán</span>
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
                                    {userMatches.filter(m => {
                                        if (m.is_completed) return true;
                                        const matchStart = new Date(`${m.date}T${m.time}`);
                                        const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
                                        return new Date() > matchEnd;
                                    }).length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {userMatches.filter(m => {
                                                if (m.is_completed) return true;
                                                const matchStart = new Date(`${m.date}T${m.time}`);
                                                const matchEnd = new Date(matchStart.getTime() + 60 * 60 * 1000);
                                                return new Date() > matchEnd;
                                            }).map((m, i) => (
                                                <Link
                                                    key={m.id}
                                                    href={`/match?id=${m.id}`}
                                                    className="block group"
                                                >
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="glass-premium p-8 rounded-[2.5rem] border border-foreground/10 flex items-center justify-between group-hover:bg-foreground/[0.03] group-hover:border-primary/20 group-hover:scale-[1.02] transition-all duration-300 shadow-xl"
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 rounded-2xl bg-foreground/5 flex flex-col items-center justify-center border border-foreground/10 group-hover:border-primary/40 transition-colors">
                                                                <span className="text-xl font-black italic tracking-tighter text-foreground">{m.date.split('-')[2]}</span>
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 italic">
                                                                    {['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][parseInt(m.date.split('-')[1]) - 1]}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="text-xl font-black text-foreground italic uppercase tracking-tighter truncate w-32 group-hover:text-primary transition-colors">{m.location}</h4>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{m.type} · FINALIZADO</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 bg-foreground/5 px-6 py-3 rounded-2xl border border-foreground/5 group-hover:border-primary/20 transition-all">
                                                            <span className="text-3xl font-black text-foreground italic tracking-tighter group-hover:text-primary transition-colors">{m.team_a_score ?? 0}</span>
                                                            <span className="text-sm font-black text-foreground/20 italic">-</span>
                                                            <span className="text-3xl font-black text-foreground italic tracking-tighter group-hover:text-primary transition-colors">{m.team_b_score ?? 0}</span>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="glass-premium p-20 rounded-[4rem] flex flex-col items-center justify-center text-center gap-10 border-dashed border-2 border-foreground/10 bg-foreground/[0.01]">
                                            <div className="w-24 h-24 rounded-[2.5rem] bg-foreground/5 border border-foreground/10 flex items-center justify-center shadow-2xl">
                                                <History className="w-10 h-10 text-foreground/10" />
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Sin Despliegues Registrados</p>
                                                <p className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.3em]">{isMe ? 'Tu historial de partidos está listo para ser escrito.' : 'Este jugador aún no tiene partidos registrados.'}</p>
                                            </div>
                                            <Link href="/search">
                                                 <button className="h-14 px-10 bg-primary/5 hover:bg-primary text-primary hover:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-xl border border-primary/20 transition-all active:scale-95">INICIAR CONVOCATORIA</button>
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
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
                                Esta acción es irreversible. Se van a borrar todos tus datos: partidos, equipos, amigos y estadísticas.
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
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md glass-premium rounded-[2.5rem] p-8 lg:p-10 border border-foreground/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden bg-surface"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 rounded-full" />
                            
                            <form onSubmit={handleUpdatePassword} className="space-y-8 relative z-10">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black italic text-foreground uppercase tracking-tighter">Nueva <span className="text-primary">Clave</span></h2>
                                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] italic">Seguridad de Jugador</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-foreground/40 tracking-[0.3em] ml-1">Escribí tu nueva contraseña</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-foreground/20 group-focus-within/input:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            className="w-full h-14 pl-14 pr-6 bg-foreground/[0.02] border border-foreground/5 rounded-2xl text-foreground text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest ml-1">Mínimo 6 caracteres</p>
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
                                        {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "ACTUALIZAR"}
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
