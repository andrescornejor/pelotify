'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Film, AlertCircle, CheckCircle2, Loader2, ArrowLeft, Flame, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadFuttokPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      setError('Por favor, selecciona un archivo de video válido.');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('El video es demasiado grande (máximo 50MB).');
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setError(null);
  };

  const validateDuration = () => {
    if (videoRef.current && videoRef.current.duration > 16) {
      setError('El video debe durar máximo 15 segundos.');
      setFile(null);
      setPreviewUrl(null);
      return false;
    }
    return true;
  };

  const captureThumbnail = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current) return resolve(null);
      const video = videoRef.current;
      
      const originalTime = video.currentTime;
      video.currentTime = 0.5;
      
      const handleSeeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            video.currentTime = originalTime;
            video.removeEventListener('seeked', handleSeeked);
            resolve(blob);
          }, 'image/jpeg', 0.8);
        } else {
          video.removeEventListener('seeked', handleSeeked);
          resolve(null);
        }
      };
      
      video.addEventListener('seeked', handleSeeked);
    });
  };

  const handleUpload = async () => {
    if (!file || !user || !validateDuration()) return;

    setIsUploading(true);
    setUploadState('uploading');
    setError(null);

    try {
      const thumbnailBlob = await captureThumbnail();
      
      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(7);
      const videoFileName = `${user.id}/${randomId}.${fileExt}`;
      const videoPath = `highlights/${videoFileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('match-highlights')
        .upload(videoPath, file, { cacheControl: '3600', upsert: false });

      if (storageError) throw storageError;

      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('match-highlights')
        .getPublicUrl(videoPath);

      let thumbnailUrl = null;
      if (thumbnailBlob) {
        const thumbnailPath = `highlights/${user.id}/${randomId}_thumb.jpg`;
        const { error: thumbError } = await supabase.storage
          .from('match-highlights')
          .upload(thumbnailPath, thumbnailBlob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg'
          });
        
        if (!thumbError) {
          const { data: { publicUrl: tUrl } } = supabase.storage
            .from('match-highlights')
            .getPublicUrl(thumbnailPath);
          thumbnailUrl = tUrl;
        }
      }

      const { error: dbError } = await supabase
        .from('match_highlights')
        .insert({
          user_id: user.id,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          description: description,
          likes_count: 0,
          views_count: 0,
          comments_count: 0
        });

      if (dbError) throw dbError;

      setUploadState('success');
      setTimeout(() => {
        router.push('/highlights');
      }, 1500);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Error al subir el video. Inténtalo de nuevo.');
      setUploadState('idle');
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-black overflow-y-auto pb-24 lg:pb-8 selection:bg-emerald-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4 mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <Link href="/highlights" className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-xl group">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>

          <div className="flex flex-col items-end sm:items-center">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 fill-emerald-500/20 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white font-kanit drop-shadow-lg leading-none">
                SUBIR FUTTOK
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs text-white/40 uppercase tracking-widest font-black mt-1">
              Inmortaliza tu jugada
            </p>
          </div>
          
          <div className="w-12 h-12" /> {/* Spacer for centering */}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-4xl mx-auto">
          
          {/* File Upload / Preview Area (Bento Left) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-5 w-full flex flex-col gap-4"
          >
            <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 shadow-2xl relative overflow-hidden group/upload">
              
              {!previewUrl ? (
                <label className="flex flex-col items-center justify-center w-full aspect-[9/16] max-h-[60vh] border-2 border-dashed border-white/10 rounded-[2rem] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                  <div className="flex flex-col items-center justify-center pt-8 pb-8 z-10 text-center px-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-5 bg-gradient-to-tr from-emerald-600/20 to-emerald-400/10 rounded-[1.5rem] mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)] border border-emerald-500/20"
                    >
                      <Upload className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <h3 className="text-lg font-black text-white mb-2 font-kanit italic tracking-wide">SELECCIONA UN VIDEO</h3>
                    <p className="text-white/50 text-sm mb-6 max-w-[200px] font-medium leading-relaxed">
                      Arrastra y suelta tu jugada aquí o haz clic para buscar.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <Film className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] text-white/50 uppercase tracking-widest font-black">Max 15 Segundos</span>
                    </div>
                  </div>
                  <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative aspect-[9/16] w-full max-h-[60vh] rounded-[2rem] overflow-hidden bg-black shadow-inner">
                  <video 
                    ref={videoRef}
                    src={previewUrl} 
                    className="w-full h-full object-cover" 
                    onLoadedMetadata={validateDuration}
                    controls
                    autoPlay
                    loop
                    muted
                  />
                  <button 
                    onClick={(e) => { e.preventDefault(); setFile(null); setPreviewUrl(null); }}
                    className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-rose-500/80 hover:text-white transition-all shadow-xl z-20 group"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Form Details Area (Bento Right) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            {/* Description Card */}
            <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
              
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white font-kanit italic uppercase tracking-wider flex items-center gap-2">
                    Detalles del Clip
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </h2>
                  <p className="text-white/40 text-sm mt-1">Dale contexto a tu jugada épica.</p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="relative group">
                  <label className="absolute -top-2.5 left-4 px-2 bg-zinc-950 text-[10px] font-black text-emerald-400 uppercase tracking-widest z-10 rounded-full">
                    Descripción
                  </label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Escribe aquí... (Ej: ¡Golazo de tiro libre en el último minuto! 🚀⚽️)"
                    className="w-full bg-black/20 border border-white/10 rounded-3xl p-5 pt-6 text-white sm:text-lg focus:outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all placeholder:text-white/20 h-40 resize-none font-kanit relative z-0 shadow-inner group-hover:border-white/20"
                  />
                  <div className="absolute bottom-4 right-4 text-xs font-bold text-white/20">
                    {description.length}/100
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                  >
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold italic shadow-inner">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Submit Action Card */}
            <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
              <button 
                disabled={!file || isUploading || uploadState === 'success'}
                onClick={handleUpload}
                className="w-full h-16 sm:h-20 rounded-2xl sm:rounded-[1.5rem] bg-emerald-500 disabled:bg-white/5 disabled:text-white/20 text-background font-black uppercase tracking-[0.2em] transition-all shadow-[0_15px_40px_rgba(16,185,129,0.3)] disabled:shadow-none flex items-center justify-center gap-3 group overflow-hidden relative"
              >
                {/* Button Inner Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] opacity-0 group-hover:opacity-100" />
                
                <AnimatePresence mode="wait">
                  {uploadState === 'uploading' ? (
                    <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-sm sm:text-lg">SUBIENDO JUGADA...</span>
                    </motion.div>
                  ) : uploadState === 'success' ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 text-background">
                      <CheckCircle2 className="w-7 h-7" />
                      <span className="text-sm sm:text-lg">¡FUTTOK PUBLICADO!</span>
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                      <span className="text-sm sm:text-lg">PUBLICAR FUTTOK</span>
                      <Upload className="w-6 h-6 group-hover:translate-y-[-2px] transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}
