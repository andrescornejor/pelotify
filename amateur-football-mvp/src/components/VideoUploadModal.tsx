'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Film, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface VideoUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function VideoUploadModal({ onClose, onSuccess }: VideoUploadModalProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if it's a video
    if (!selectedFile.type.startsWith('video/')) {
      setError('Por favor, selecciona un archivo de video válido.');
      return;
    }

    // Check size (e.g., 50MB limit for MVP)
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
    if (videoRef.current && videoRef.current.duration > 16) { // Allowing +1s buffer
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
      
      // Start at 0.5s to avoid potential black frame at the very beginning
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
            video.currentTime = originalTime; // Restore time
            video.removeEventListener('seeked', handleSeeked);
            resolve(blob);
          }, 'image/jpeg', 0.7);
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
    setError(null);

    try {
      // 0. Capture Thumbnail
      const thumbnailBlob = await captureThumbnail();
      
      // 1. Upload Video to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(7);
      const videoFileName = `${user.id}/${randomId}.${fileExt}`;
      const videoPath = `highlights/${videoFileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('match-highlights')
        .upload(videoPath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // 2. Get Video Public URL
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('match-highlights')
        .getPublicUrl(videoPath);

      // 3. Upload Thumbnail if exists
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

      // 4. Insert into Database
      const { error: dbError } = await supabase
        .from('match_highlights')
        .insert({
          user_id: user.id,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          description: description,
          likes_count: 0,
          views_count: 0
        });

      if (dbError) throw dbError;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Error al subir el video. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 md:"
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white font-kanit">Subir Jugada</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!previewUrl ? (
            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-white/10 rounded-3xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-4 bg-emerald-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-white mb-1">Selecciona un clip</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black italic">Máximo 15 segundos</p>
              </div>
              <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-[9/16] max-h-[40vh] mx-auto rounded-3xl overflow-hidden bg-black border border-white/10 shadow-lg">
                <video 
                  ref={videoRef}
                  src={previewUrl} 
                  className="w-full h-full object-cover" 
                  onLoadedMetadata={validateDuration}
                  controls
                />
                <button 
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/60 md: rounded-full text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 text-white">Descripción</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="¿Qué pasó en esta jugada? #GOLAZO"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder:text-white/20 h-24 resize-none"
                />
              </div>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold italic"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <button 
            disabled={!file || isUploading}
            onClick={handleUpload}
            className="w-full h-14 rounded-2xl bg-emerald-500 disabled:bg-white/5 disabled:text-white/20 text-background font-black uppercase text-xs tracking-widest transition-all shadow-[0_15px_30px_rgba(44,252,125,0.2)] disabled:shadow-none flex items-center justify-center gap-2 group overflow-hidden relative"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>SUBIENDO...</span>
              </>
            ) : (
              <>
                <span>PUBLICAR JUGADA</span>
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </>
            )}
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
