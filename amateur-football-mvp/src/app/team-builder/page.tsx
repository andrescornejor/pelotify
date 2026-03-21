'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, ChevronRight, ChevronLeft, Camera, CheckCircle2, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createTeam } from '@/lib/teams';
import { uploadTeamLogo } from '@/lib/storage';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const COLORS = [
    { id: 'zinc', value: '#18181b', label: 'Dark' },
    { id: 'white', value: '#ffffff', label: 'White' },
    { id: 'red', value: '#ef4444', label: 'Red' },
    { id: 'blue', value: '#3b82f6', label: 'Blue' },
    { id: 'emerald', value: '#10b981', label: 'Emerald' },
    { id: 'amber', value: '#f59e0b', label: 'Amber' },
    { id: 'purple', value: '#8b5cf6', label: 'Purple' },
    { id: 'pink', value: '#ec4899', label: 'Pink' },
];

export default function TeamBuilderPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        primaryColor: '#18181b', // Default dark
        secondaryColor: '#10b981' // Default emerald/primary
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const nextStep = () => {
        if (step < 3) setStep(s => s + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(s => s - 1);
    };

    const handleCreate = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            let logoUrl = '';
            if (logoFile) {
                // To keep it simple, we use the name to generate the storage path inside the function
                logoUrl = await uploadTeamLogo(logoFile, formData.name);
            }

            const team = await createTeam(formData.name, formData.description, user.id, logoUrl);
            
            // Celebration
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: [formData.primaryColor, formData.secondaryColor, '#ffffff']
            });

            setTimeout(() => {
                router.push(`/team?id=${team.id}`);
            }, 2000);

        } catch (error: any) {
            console.error(error);
            alert('Error al fundar el club: ' + error.message);
            setIsLoading(false);
        }
    };

    const JerseySVG = () => (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
            {/* Base Jersey (Primary Color) */}
            <path d="M50 40 C 80 20, 120 20, 150 40 L 190 80 L 170 100 L 150 80 L 150 180 L 50 180 L 50 80 L 30 100 L 10 80 Z" fill={formData.primaryColor} />
            {/* Sleeves Stripes (Secondary Color) */}
            <path d="M30 100 L 10 80 L 50 40 C 60 30, 70 25, 80 22 C 60 40, 50 60, 50 80 Z" fill={formData.secondaryColor} opacity="0.8" />
            <path d="M170 100 L 190 80 L 150 40 C 140 30, 130 25, 120 22 C 140 40, 150 60, 150 80 Z" fill={formData.secondaryColor} opacity="0.8" />
            {/* Collar */}
            <path d="M80 22 C 90 35, 110 35, 120 22 C 110 15, 90 15, 80 22 Z" fill={formData.secondaryColor} />
            {/* Center Chest (Logo Area) */}
            {logoPreview ? (
                <image href={logoPreview} x="75" y="60" width="50" height="50" preserveAspectRatio="xMidYMid slice" clipPath="url(#hex-clip)" />
            ) : (
                <path d="M100 60 L 115 70 L 115 90 L 100 100 L 85 90 L 85 70 Z" fill={formData.secondaryColor} className="animate-pulse" />
            )}
            <defs>
                <clipPath id="hex-clip">
                    <path d="M100 60 L 115 70 L 115 90 L 100 100 L 85 90 L 85 70 Z" />
                </clipPath>
            </defs>
        </svg>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 lg:p-8 relative overflow-hidden bg-background">
            
            {/* Ambient Colors based on selected colors */}
            <div className="absolute inset-0 z-0 transition-colors duration-1000" style={{ background: `radial-gradient(circle at 50% 50%, ${formData.secondaryColor}22 0%, ${formData.primaryColor}11 50%, transparent 100%)` }} />
            
            {/* Go Back Button */}
            <button
                onClick={() => router.back()}
                className="absolute top-8 left-8 z-50 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50 hover:text-foreground transition-colors group p-2"
            >
                <div className="w-8 h-8 rounded-full bg-foreground/[0.03] border border-foreground/5 flex items-center justify-center group-hover:bg-foreground/[0.1] transition-all">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
                <span>Volver Atrás</span>
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
            >
                {/* Left Side: Dynamic Visualizer */}
                <div className="hidden lg:flex flex-col items-center justify-center relative">
                    <motion.div 
                         className="w-[400px] h-[400px] relative z-10"
                         animate={{ y: [0, -10, 0] }}
                         transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    >
                        <JerseySVG />
                    </motion.div>
                    
                    {/* Shadow underneath jersey */}
                    <div className="w-[300px] h-8 bg-black/50 blur-xl rounded-[100%] absolute bottom-10" />
                    
                    <div className="absolute top-0 right-10">
                        {logoPreview && (
                            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="w-24 h-24 rounded-full border-4 border-background bg-surface shadow-2xl overflow-hidden">
                                <img src={logoPreview} className="w-full h-full object-cover" />
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Right Side: Form Controller */}
                <div className="glass-premium rounded-[3rem] p-8 lg:p-12 border border-foreground/5 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 transition-colors duration-700" style={{ backgroundColor: formData.secondaryColor }} />
                    
                    <div className="space-y-8 relative z-10">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none font-kanit">
                                Fundar <span style={{ color: formData.secondaryColor }} className="transition-colors duration-500">Club</span>
                            </h1>
                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em] italic font-kanit">
                                Paso 0{step} de 03
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Nombre de la Institución</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            placeholder="Ej: Manchester Azul"
                                            className="w-full h-16 px-6 rounded-2xl bg-foreground/[0.03] border border-foreground/10 focus:border-primary/50 text-xl font-black italic uppercase outline-none transition-all placeholder:text-foreground/20 placeholder:font-normal"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-4">Lema / Visión (Opcional)</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({...formData, description: e.target.value})}
                                            placeholder="Jugamos lindo y pegamos duro..."
                                            className="w-full h-32 p-6 rounded-2xl bg-foreground/[0.03] border border-foreground/10 focus:border-primary/50 text-sm font-bold uppercase tracking-widest outline-none transition-all resize-none placeholder:text-foreground/20 placeholder:font-normal"
                                        />
                                    </div>
                                    <button 
                                        disabled={!formData.name}
                                        onClick={nextStep}
                                        className="w-full h-16 bg-foreground text-background font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-30"
                                    >
                                        Elegir Colores <ChevronRight className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: formData.primaryColor }} />
                                            Color Titular
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => setFormData({...formData, primaryColor: c.value})}
                                                    className={cn(
                                                        "w-10 h-10 rounded-full border-2 transition-all",
                                                        formData.primaryColor === c.value ? "border-foreground scale-110" : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                                                    )}
                                                    style={{ backgroundColor: c.value }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: formData.secondaryColor }} />
                                            Color Detalles
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => setFormData({...formData, secondaryColor: c.value})}
                                                    className={cn(
                                                        "w-10 h-10 rounded-full border-2 transition-all",
                                                        formData.secondaryColor === c.value ? "border-foreground scale-110" : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                                                    )}
                                                    style={{ backgroundColor: c.value }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <button onClick={prevStep} className="w-16 h-16 bg-foreground/[0.03] border border-foreground/5 rounded-2xl flex justify-center items-center"><ChevronLeft /></button>
                                        <button 
                                            onClick={nextStep}
                                            className="flex-1 h-16 bg-foreground text-background font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                                        >
                                            El Escudo <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="flex flex-col items-center py-6 border-2 border-dashed border-foreground/10 rounded-3xl relative overflow-hidden group">
                                        
                                        {logoPreview && (
                                            <div className="absolute inset-0 z-0 opacity-20 blur-xl px-10"><img src={logoPreview} className="w-full h-full object-cover" /></div>
                                        )}

                                        <label className="relative z-10 cursor-pointer flex flex-col items-center gap-4">
                                            <div className="w-32 h-32 rounded-3xl bg-surface border-4 border-foreground/5 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-primary transition-all">
                                                {logoPreview ? (
                                                    <img src={logoPreview} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                ) : (
                                                    <Shield className="w-12 h-12 text-foreground/20 group-hover:text-primary transition-colors" />
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black uppercase tracking-widest text-foreground">Subir Archivo</p>
                                                <p className="text-[10px] uppercase font-bold text-foreground/40 mt-1">PNG o JPG cuadriculado</p>
                                            </div>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/5 space-y-2">
                                        <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest text-center leading-relaxed">
                                            Al fundar el club, serás el <span className="text-primary font-black">CAPITÁN ABSOLUTO</span>.<br/> Podrás invitar jugadores y aceptar retos.
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button onClick={prevStep} className="w-16 h-16 bg-foreground/[0.03] border border-foreground/5 rounded-2xl flex justify-center items-center"><ChevronLeft /></button>
                                        <button 
                                            onClick={handleCreate}
                                            disabled={isLoading}
                                            className="flex-1 h-16 text-background font-black text-[12px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl group overflow-hidden relative"
                                            style={{ backgroundColor: formData.secondaryColor }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                                            <span className="relative z-10 flex gap-2 items-center">
                                                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin"/> Firmando...</> : <><CheckCircle2 className="w-5 h-5"/> Establecer Club</>}
                                            </span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mobile visualizer preview */}
                <div className="lg:hidden flex justify-center pb-8">
                     <div className="w-48 h-48 opacity-50 relative pointer-events-none">
                          <JerseySVG />
                     </div>
                </div>
            </motion.div>
        </div>
    );
}

