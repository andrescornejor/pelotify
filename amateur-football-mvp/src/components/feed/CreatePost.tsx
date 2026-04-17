'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, Hash, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreatePostProps {
  user: any;
  onPost: (content: string, image: File | null) => Promise<void>;
}

export default function CreatePost({ user, onPost }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !selectedImage) || !user) return;
    setIsPosting(true);
    try {
      await onPost(content, selectedImage);
      setContent('');
      clearImage();
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="p-4 sm:px-5 sm:py-5 border-b border-foreground/[0.05] flex gap-3 sm:gap-4 bg-background">
      <div className="w-12 h-12 rounded-full bg-surface-elevated overflow-hidden shrink-0 transition-opacity hover:opacity-90 cursor-pointer">
        {user?.avatar_url ? (
          <img src={user.avatar_url} loading="lazy" decoding="async" className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary text-[17px]">
            {user?.name?.charAt(0) || '?'}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col relative min-h-[50px]">
        <div className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-lg font-medium leading-relaxed p-0 border-none select-none text-foreground z-0 overflow-hidden">
          {content.split(/(#[\w\u00C0-\u024FáéíóúñÁÉÍÓÚÑ]+)/g).map((part, i) => (
            part.startsWith('#') ? <span key={i} className="text-primary font-bold">{part}</span> : part
          ))}
          {content.endsWith('\n') ? '\n' : ''}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="¡Habla, crack! ¿Qué está pasando?"
          className="w-full bg-transparent border-none resize-none focus:outline-none text-transparent text-lg placeholder:text-foreground/35 min-h-[50px] font-medium leading-relaxed relative z-10 selection:bg-primary/20 caret-foreground p-0 m-0 overflow-hidden"
          maxLength={500}
        />

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageSelect}
        />

        {imagePreview && (
          <div className="relative mt-3 rounded-2xl overflow-hidden border border-foreground/10 shadow-lg">
            <img src={imagePreview} alt="Preview" className="w-full max-h-[300px] object-cover" />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-all backdrop-blur-sm hover:scale-110 active:scale-95 z-20"
            >
              <X className="w-4 h-4" />
            </button>
            {isPosting && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-foreground/[0.04]">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center group"
              title="Subir imagen"
            >
              <ImageIcon className="w-5 h-5 group-hover:scale-105 transition-transform" />
            </button>
            <button
              onClick={() => {
                setContent(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' #' : '#'));
              }}
              className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center justify-center group"
              title="Hashtag"
            >
              <Hash className="w-5 h-5 group-hover:scale-105 transition-transform" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            {content.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="relative w-6 h-6">
                  <svg className="w-6 h-6 -rotate-90" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" className="text-foreground/[0.06]" strokeWidth="2.5" />
                    <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" className={cn(content.length > 450 ? "text-amber-500" : content.length > 480 ? "text-red-500" : "text-primary")} strokeWidth="2.5" strokeDasharray={`${(content.length / 500) * 69.1} 69.1`} strokeLinecap="round" />
                  </svg>
                </div>
                <div className="h-6 w-px bg-foreground/10" />
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={isPosting || (!content.trim() && !selectedImage)}
              className="px-5 py-1.5 rounded-full bg-primary text-background font-bold text-[15px] tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.96] transition-all duration-200 mt-1"
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Postear'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
