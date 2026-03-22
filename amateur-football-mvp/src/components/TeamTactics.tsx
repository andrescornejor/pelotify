'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout as LayoutIcon,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  User2,
  Users,
  MousePointer2,
  Settings2,
  ShieldCheck,
  X,
  Search,
  ChevronRight,
} from 'lucide-react';
import { TeamFormation, getTeamFormations, upsertTeamFormation } from '@/lib/teams';
import { cn } from '@/lib/utils';

interface TeamTacticsProps {
  teamId: string;
  isCaptain: boolean;
  members: any[];
}

type MatchType = 'F5' | 'F7' | 'F11';

interface PositionNode {
  id: string;
  role: 'GK' | 'DEF' | 'MED' | 'DEL';
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  playerId?: string; // assigned member user_id
}

const TEMPLATES: Record<MatchType, { name: string; nodes: PositionNode[] }[]> = {
  F5: [
    {
      name: '1-2-1 (Rombo)',
      nodes: [
        { id: 'gk-1', role: 'GK', x: 50, y: 90 },
        { id: 'def-1', role: 'DEF', x: 50, y: 70 },
        { id: 'med-1', role: 'MED', x: 20, y: 50 },
        { id: 'med-2', role: 'MED', x: 80, y: 50 },
        { id: 'atk-1', role: 'DEL', x: 50, y: 30 },
      ],
    },
    {
      name: '2-2 (Cuadrado)',
      nodes: [
        { id: 'gk-1', role: 'GK', x: 50, y: 90 },
        { id: 'def-1', role: 'DEF', x: 30, y: 70 },
        { id: 'def-2', role: 'DEF', x: 70, y: 70 },
        { id: 'atk-1', role: 'DEL', x: 30, y: 30 },
        { id: 'atk-2', role: 'DEL', x: 70, y: 30 },
      ],
    },
  ],
  F7: [
    {
      name: '2-3-1 (Clásico)',
      nodes: [
        { id: 'gk-1', role: 'GK', x: 50, y: 90 },
        { id: 'def-1', role: 'DEF', x: 30, y: 75 },
        { id: 'def-2', role: 'DEF', x: 70, y: 75 },
        { id: 'med-1', role: 'MED', x: 50, y: 50 },
        { id: 'med-2', role: 'MED', x: 20, y: 50 },
        { id: 'med-3', role: 'MED', x: 80, y: 50 },
        { id: 'atk-1', role: 'DEL', x: 50, y: 25 },
      ],
    },
  ],
  F11: [
    {
      name: '4-4-2 (Clásico)',
      nodes: [
        { id: 'gk-1', role: 'GK', x: 50, y: 90 },
        { id: 'def-1', role: 'DEF', x: 15, y: 75 },
        { id: 'def-2', role: 'DEF', x: 40, y: 75 },
        { id: 'def-3', role: 'DEF', x: 60, y: 75 },
        { id: 'def-4', role: 'DEF', x: 85, y: 75 },
        { id: 'med-1', role: 'MED', x: 15, y: 50 },
        { id: 'med-2', role: 'MED', x: 40, y: 50 },
        { id: 'med-3', role: 'MED', x: 60, y: 50 },
        { id: 'med-4', role: 'MED', x: 85, y: 50 },
        { id: 'atk-1', role: 'DEL', x: 35, y: 25 },
        { id: 'atk-2', role: 'DEL', x: 65, y: 25 },
      ],
    },
    {
      name: '4-3-3 (Ofensivo)',
      nodes: [
        { id: 'gk-1', role: 'GK', x: 50, y: 90 },
        { id: 'def-1', role: 'DEF', x: 15, y: 75 },
        { id: 'def-2', role: 'DEF', x: 40, y: 75 },
        { id: 'def-3', role: 'DEF', x: 60, y: 75 },
        { id: 'def-4', role: 'DEF', x: 85, y: 75 },
        { id: 'med-1', role: 'MED', x: 30, y: 55 },
        { id: 'med-2', role: 'MED', x: 50, y: 55 },
        { id: 'med-3', role: 'MED', x: 70, y: 55 },
        { id: 'atk-1', role: 'DEL', x: 20, y: 25 },
        { id: 'atk-2', role: 'DEL', x: 50, y: 20 },
        { id: 'atk-3', role: 'DEL', x: 80, y: 25 },
      ],
    },
  ],
};

export default function TeamTactics({ teamId, isCaptain, members }: TeamTacticsProps) {
  const [matchType, setMatchType] = useState<MatchType>('F11');
  const [activeFormation, setActiveFormation] = useState<TeamFormation | null>(null);
  const [nodes, setNodes] = useState<PositionNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Interaction State
  const [selectingNodeId, setSelectingNodeId] = useState<string | null>(null);

  const pitchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFormations();
  }, [teamId]);

  async function fetchFormations() {
    try {
      const data = await getTeamFormations(teamId);
      const active = data.find((f) => f.is_active) || data[0] || null;
      if (active) {
        setActiveFormation(active);
        setNodes(active.layout.nodes || []);
        setMatchType(active.layout.matchType || 'F11');
      } else {
        applyTemplate(TEMPLATES.F11[0]);
      }
    } catch (err) {
      console.error('Error fetching formations:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function applyTemplate(template: (typeof TEMPLATES)['F11'][0]) {
    setNodes(template.nodes.map((n) => ({ ...n })));
  }

  async function handleSave() {
    if (!isCaptain) return;
    setIsSaving(true);
    try {
      const name = activeFormation?.name || `${matchType} Custom`;
      const resp = await upsertTeamFormation({
        id: activeFormation?.id,
        team_id: teamId,
        name: name,
        layout: {
          matchType,
          nodes,
        },
        is_active: true,
      });
      setActiveFormation(resp);
      alert('¡Pizarra guardada con éxito!');
    } catch (err) {
      alert('Error al guardar táctica');
    } finally {
      setIsSaving(false);
    }
  }

  function handleNodeDragEnd(id: string, event: any, info: any) {
    if (!isCaptain || !pitchRef.current) return;

    const pitch = pitchRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    // Calculate the new position in percentage relative to the pitch container
    // We use the previous position plus the total offset moved during this drag
    const currentPX = (node.x / 100) * pitch.width;
    const currentPY = (node.y / 100) * pitch.height;

    let newX = ((currentPX + info.offset.x) / pitch.width) * 100;
    let newY = ((currentPY + info.offset.y) / pitch.height) * 100;

    // STRICT BOUNDARIES ("The Impassable Walls")
    // We keep them within 5% and 95% to ensure they are always reachable and inside the lines
    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(5, Math.min(95, newY));

    // Batch update nodes state
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x: newX, y: newY } : n)));
    setSelectingNodeId(null);
  }

  function assignPlayer(nodeId: string, playerId: string | undefined) {
    if (!isCaptain) return;
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, playerId } : n)));
    setSelectingNodeId(null);
  }

  const assignedPlayerIds = new Set(nodes.map((n) => n.playerId).filter(Boolean));
  const bench = members.filter(
    (m) => m.status === 'confirmed' && !assignedPlayerIds.has(m.user_id)
  );

  if (isLoading)
    return (
      <div className="p-12 text-center text-foreground/40 animate-pulse uppercase font-black text-[10px] tracking-widest italic">
        Escaneando Pizarras...
      </div>
    );

  return (
    <div className="space-y-12 pb-12">
      {/* ── HEADER & TOOLS ── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <LayoutIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-foreground italic uppercase tracking-tighter leading-none">
                Pizarra del Capitán
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 mt-1">
                Definí el ADN táctico del equipo
              </p>
            </div>
          </div>
        </div>

        {isCaptain && (
          <div className="flex flex-wrap items-center gap-4 bg-foreground/[0.03] p-2 rounded-[2.5rem] border border-foreground/5 backdrop-blur-3xl shadow-2xl">
            {/* Match Type Select */}
            <div className="flex p-1 bg-background/50 rounded-2xl border border-foreground/5 gap-1 shadow-inner">
              {(['F5', 'F7', 'F11'] as MatchType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setMatchType(type);
                    applyTemplate(TEMPLATES[type][0]);
                  }}
                  className={cn(
                    'px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300',
                    matchType === type
                      ? 'bg-primary text-background shadow-lg shadow-primary/30'
                      : 'text-foreground/40 hover:text-foreground/70'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-foreground/10 mx-2 hidden sm:block" />

            {/* Templates */}
            <div className="flex gap-2">
              {TEMPLATES[matchType].map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t)}
                  className="px-5 py-3 bg-foreground/5 border border-foreground/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all active:scale-95"
                >
                  {t.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="ml-auto h-12 px-8 bg-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all flex items-center gap-3 shadow-xl shadow-primary/20 active:scale-95"
            >
              {isSaving ? (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              GUARDAR ADN
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── CENTRAL COLUMN: THE PITCH ── */}
        <div className="lg:col-span-8 order-2 lg:order-1 relative">
          <div
            ref={pitchRef}
            className="relative aspect-[3/4] md:aspect-[4/5] bg-emerald-950/80 rounded-[4rem] border-[16px] border-foreground/10 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] group/pitch"
          >
            {/* Real Grass Texture Layer */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] pointer-events-none" />

            {/* Pitch Markings */}
            <div className="absolute inset-x-12 top-0 h-[12%] border-x-4 border-b-4 border-white/20 rounded-b-[3rem]" />
            <div className="absolute inset-x-12 bottom-0 h-[12%] border-x-4 border-t-4 border-white/20 rounded-t-[3rem]" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-white/30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-4 border-white/20 rounded-full" />

            {/* The Nodes (Draggable Chips) */}
            <div className="absolute inset-0 p-8 z-20">
              <AnimatePresence>
                {nodes.map((node) => {
                  const player = members.find((m) => m.user_id === node.playerId)?.profiles;
                  const isSelected = selectingNodeId === node.id;

                  return (
                    <motion.div
                      key={`${node.id}-${node.x}-${node.y}`}
                      drag={isCaptain}
                      dragMomentum={false}
                      dragElastic={0}
                      dragConstraints={pitchRef}
                      onDragEnd={(e, info) => handleNodeDragEnd(node.id, e, info)}
                      onClick={() => isCaptain && setSelectingNodeId(isSelected ? null : node.id)}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        position: 'absolute',
                        zIndex: isSelected ? 100 : 30,
                      }}
                      className="cursor-grab active:cursor-grabbing w-1 h-1"
                    >
                      <div className="flex flex-col items-center gap-3 -translate-x-1/2 -translate-y-1/2 group/node w-max">
                        <div
                          className={cn(
                            'w-16 h-16 md:w-24 md:h-24 rounded-full border-4 shadow-2xl flex items-center justify-center transition-all group-hover/node:scale-110 relative',
                            isSelected ? 'ring-8 ring-primary/40 scale-110' : 'ring-0',
                            node.role === 'DEL'
                              ? 'bg-red-600 border-red-400'
                              : node.role === 'MED'
                                ? 'bg-blue-600 border-blue-400'
                                : node.role === 'DEF'
                                  ? 'bg-zinc-800 border-zinc-500'
                                  : 'bg-yellow-500 border-yellow-300'
                          )}
                        >
                          {player?.avatar_url ? (
                            <img
                              src={player.avatar_url}
                              className="w-full h-full object-cover rounded-full"
                              alt=""
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl font-black italic">
                              {player?.name?.charAt(0) || <User2 className="w-10 h-10" />}
                            </div>
                          )}

                          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg">
                            <span className="text-[9px] font-black text-primary">{node.role}</span>
                          </div>

                          {isCaptain && node.playerId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                assignPlayer(node.id, undefined);
                              }}
                              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-600 border-2 border-red-200 opacity-0 group-hover/node:opacity-100 transition-opacity flex items-center justify-center hover:scale-110 shadow-lg"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>

                        <div
                          className={cn(
                            'flex flex-col items-center px-4 py-1.5 backdrop-blur-2xl border rounded-[1rem] shadow-2xl transition-all',
                            player
                              ? 'bg-background/90 border-white/10'
                              : 'bg-black/60 border-white/5 animate-pulse'
                          )}
                        >
                          <span
                            className={cn(
                              'text-[10px] md:text-[11px] font-black italic uppercase tracking-tighter truncate max-w-[120px] leading-tight',
                              player ? 'text-foreground' : 'text-white/30'
                            )}
                          >
                            {player?.name || 'VACIÓ'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Ambient Lighting & Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          </div>

          {/* ── SELECTION POPUP ── */}
          <AnimatePresence>
            {selectingNodeId && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute inset-x-12 bottom-12 z-[100] glass-premium p-8 rounded-[3rem] border border-primary/30 shadow-[0_50px_100px_rgba(0,0,0,0.8)] bg-surface"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-2xl font-black italic text-foreground uppercase tracking-tighter">
                      Asignar al {nodes.find((n) => n.id === selectingNodeId)?.role}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectingNodeId(null)}
                    className="w-12 h-12 bg-foreground/5 rounded-2xl flex items-center justify-center text-foreground/40 hover:text-foreground transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 max-h-[250px] overflow-y-auto pr-4 custom-scrollbar">
                  {bench.length === 0 ? (
                    <div className="w-full py-12 text-center text-foreground/20 font-black uppercase tracking-widest text-[10px] italic bg-foreground/[0.02] border border-dashed border-foreground/10 rounded-3xl">
                      Todos los pibes están ocupados
                    </div>
                  ) : (
                    bench.map((member) => (
                      <button
                        key={member.user_id}
                        onClick={() => assignPlayer(selectingNodeId!, member.user_id)}
                        className="flex items-center gap-4 p-4 bg-foreground/[0.03] border border-foreground/5 rounded-[1.5rem] hover:border-primary/50 hover:bg-primary/5 transition-all group active:scale-95"
                      >
                        <div className="w-12 h-12 rounded-xl border border-foreground/10 bg-surface-elevated overflow-hidden relative">
                          {member.profiles?.avatar_url ? (
                            <img
                              src={member.profiles.avatar_url}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-primary/20 bg-primary/5 italic">
                              {member.profiles?.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black italic uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">
                            {member.profiles?.name}
                          </p>
                          <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                            {member.profiles?.position || 'SIN POSICION'}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT COLUMN: INFO & BENCH ── */}
        <div className="lg:col-span-4 space-y-8 order-1 lg:order-2">
          {/* Quick Stats / Info */}
          <div className="glass-premium p-8 rounded-[3rem] border border-foreground/5 bg-surface-elevated space-y-6">
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div>
                <h5 className="text-lg font-black text-foreground italic uppercase tracking-tighter">
                  Estado del Plantel
                </h5>
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                  Resumen táctico actual
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5 text-center">
                <span className="block text-2xl font-black text-primary italic leading-none">
                  {nodes.filter((n) => n.playerId).length}/{nodes.length}
                </span>
                <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest mt-1">
                  TITULARES
                </span>
              </div>
              <div className="p-4 bg-foreground/[0.02] rounded-2xl border border-foreground/5 text-center">
                <span className="block text-2xl font-black text-foreground italic leading-none">
                  {bench.length}
                </span>
                <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest mt-1">
                  EN EL BANCO
                </span>
              </div>
            </div>

            <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl">
              <p className="text-[9px] text-primary font-black uppercase tracking-widest leading-relaxed text-center italic">
                "Elegí un rol en el campo (círculo parpadeante) y asignale un pibe del club para que
                aparezca su nombre."
              </p>
            </div>
          </div>

          {/* Bench Visual List (Read Only / Drag Source potential) */}
          <div className="glass-premium p-8 rounded-[3rem] border border-foreground/5 bg-surface space-y-6">
            <div className="flex items-center justify-between">
              <h5 className="text-xl font-black text-foreground italic uppercase tracking-tighter">
                Entrenando Afuera
              </h5>
              <Users className="w-5 h-5 text-foreground/20" />
            </div>

            <div className="space-y-3">
              {bench.length === 0 ? (
                <div className="py-12 text-center text-foreground/20 uppercase font-black text-[9px] tracking-widest">
                  No quedan suplentes
                </div>
              ) : (
                bench.slice(0, 5).map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center gap-4 p-3 bg-foreground/[0.02] rounded-2xl border border-foreground/5"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center overflow-hidden">
                      {member.profiles?.avatar_url ? (
                        <img
                          src={member.profiles.avatar_url}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <span className="font-black text-primary/30 italic">
                          {member.profiles?.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-black text-foreground/60 uppercase tracking-tighter italic">
                      {member.profiles?.name}
                    </span>
                    {isCaptain && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
                    )}
                  </div>
                ))
              )}
              {bench.length > 5 && (
                <p className="text-[9px] text-center text-foreground/30 font-black uppercase tracking-widest">
                  + {bench.length - 5} MÁS EN EL BANCO
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Settings2 className={className} />
    </motion.div>
  );
}
