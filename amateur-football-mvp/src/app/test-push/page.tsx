'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { initializePushNotifications, sendNotificationToUser } from '@/lib/notifications';
import { Bell, ShieldCheck, Send, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PushTestPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<any>({
    permission: 'unknown',
    tokenExists: false,
    tokens: [],
    loading: true,
    error: null,
    debug: [],
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  const addDebug = (msg: string) => {
    setStatus((prev: any) => ({ ...prev, debug: [...prev.debug, `${new Date().toLocaleTimeString()}: ${msg}`] }));
  };

  const checkStatus = async () => {
    if (!user) return;
    setStatus((prev: any) => ({ ...prev, loading: true }));
    addDebug('Revisando estado en base de datos...');
    
    try {
      const permission = Notification.permission;
      const { data: tokens, error } = await supabase
        .from('fcm_tokens')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        addDebug(`Error de Supabase: ${error.message}`);
        throw error;
      }

      const exists = (tokens?.length || 0) > 0;
      addDebug(exists ? `Tokens encontrados: ${tokens?.length}` : 'No hay tokens para este usuario');

      setStatus((prev: any) => ({
        ...prev,
        permission,
        tokenExists: exists,
        tokens: tokens || [],
        loading: false,
        error: null,
      }));
    } catch (err: any) {
      setStatus((prev: any) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  useEffect(() => {
    if (user) checkStatus();
  }, [user]);

  const handleInit = async () => {
    if (!user) return;
    setStatus((prev: any) => ({ ...prev, loading: true, error: null }));
    addDebug('Iniciando registro completo...');
    
    try {
      addDebug('Llamando a initializePushNotifications...');
      const token = await initializePushNotifications(user.id);
      
      if (token) {
        addDebug('Token obtenido y guardado con éxito');
        await checkStatus();
      } else {
        const msg = 'No se pudo obtener el token. Revisa si aceptaste el permiso o si falta NEXT_PUBLIC_FIREBASE_VAPID_KEY.';
        addDebug(`FALLO: ${msg}`);
        setStatus((prev: any) => ({ ...prev, loading: false, error: msg }));
      }
    } catch (err: any) {
      addDebug(`ERROR FATAL: ${err.message}`);
      setStatus((prev: any) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const testSelfPush = async () => {
    if (!user) return;
    setSending(true);
    setResult(null);
    try {
      const success = await sendNotificationToUser(
        user.id,
        "⚽ Prueba de Pelotify",
        "Esta es una notificación de prueba. ¡Si ves esto, funciona!",
        { clickAction: '/test-push' }
      );
      setResult(success ? { success: true } : { success: false, error: 'Failed to send' });
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    } finally {
      setSending(false);
    }
  };

  if (!user) return <div className="p-8 text-center uppercase tracking-widest font-black">Inicia sesión primero</div>;

  return (
    <div className="min-h-screen bg-background p-6 pt-24 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground uppercase tracking-tight mb-2 flex items-center gap-3">
          <Bell className="text-primary w-8 h-8" />
          Test Push Notifications
        </h1>
        <p className="text-foreground/60 text-sm">
          Usa esta herramienta para diagnosticar por qué no te llegan las notificaciones.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Step 1: Permission */}
        <section className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              1. Permiso del Navegador
            </h2>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              status.permission === 'granted' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'
            }`}>
              {status.permission}
            </span>
          </div>
          <p className="text-xs text-foreground/50 mb-4">
            El navegador debe permitir notificaciones para este dominio.
          </p>
          {status.permission !== 'granted' && (
            <button 
              onClick={handleInit}
              className="w-full py-3 bg-primary text-background text-[10px] font-black uppercase tracking-widest rounded-xl"
            >
              Solicitar Permiso
            </button>
          )}
        </section>

        {/* Step 2: Database Token */}
        <section className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              2. Token en Base de Datos
            </h2>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              status.tokenExists ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'
            }`}>
              {status.tokenExists ? 'TOKEN REGISTRADO' : 'SIN TOKEN'}
            </span>
          </div>
          <div className="space-y-4">
            <p className="text-xs text-foreground/50">
              Necesitamos guardar un "FCM Token" en Supabase para saber a qué dispositivo enviar la notificación.
            </p>
            {status.tokens.length > 0 && (
              <div className="bg-background/50 p-3 rounded-xl overflow-hidden">
                {status.tokens.map((t: any, i: number) => (
                  <div key={i} className="text-[9px] font-mono text-primary truncate mb-1">
                    {t.token.slice(0, 50)}...
                  </div>
                ))}
              </div>
            )}
            <button 
              onClick={handleInit}
              disabled={status.loading}
              className="w-full py-3 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
            >
              {status.loading ? '...' : <><RefreshCw className="w-3 h-3" /> Registrar / Actualizar Token</>}
            </button>
          </div>
        </section>

        {/* Debug Log */}
        <section className="bg-black/20 border border-foreground/10 rounded-3xl p-6 font-mono">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4">
            Debug Log:
          </h2>
          <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
            {status.debug.map((log: string, i: number) => (
              <div key={i} className="text-[10px] text-primary/80">
                {log}
              </div>
            ))}
            {status.debug.length === 0 && <div className="text-[10px] text-foreground/20 italic">Esperando acciones...</div>}
          </div>
        </section>

        {/* Step 3: Test Sending */}
        <section className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              3. Prueba de Envío
            </h2>
          </div>
          <p className="text-xs text-foreground/50 mb-4">
            Envía una notificación a este dispositivo para ver si llega.
          </p>
          <button 
            onClick={testSelfPush}
            disabled={sending || !status.tokenExists}
            className="w-full py-3 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? 'Enviando...' : <><Bell className="w-3 h-3" /> Enviar Notificación de Prueba</>}
          </button>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
                  result.success ? 'bg-primary/10 border border-primary/20' : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                {result.success ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <div className="text-xs">
                      <p className="font-bold text-primary">¡ÉXITO!</p>
                      <p className="text-primary/60">Se envió el comando a Firebase. Si no la ves, revisa el Service Worker.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div className="text-xs text-red-500">
                      <p className="font-bold">ERROR</p>
                      <p className="">{result.error}</p>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <div className="mt-8 p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-3xl">
        <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2">💡 Tips de Debugging</h3>
        <ul className="text-[11px] text-foreground/60 space-y-2 list-disc pl-4">
          <li><strong>Consola del Navegador:</strong> ¿Ves errores relacionados con Firebase o Service Workers?</li>
          <li><strong>Network Tab:</strong> Filtra por <code className="text-primary">/api/notifications/send</code> para ver si la llamada al servidor falla.</li>
          <li><strong>Localhost vs Producción:</strong> FCM requiere HTTPS, pero funciona en <code className="text-primary">localhost</code>.</li>
          <li><strong>Brave/Adblock:</strong> Algunos navegadores bloquean Firebase Messaging por defecto.</li>
        </ul>
      </div>
    </div>
  );
}
