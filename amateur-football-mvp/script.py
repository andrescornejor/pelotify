import re

target_file = r'c:\Users\andyc\OneDrive\Documentos\GitHub\pelotify\amateur-football-mvp\src\app\profile\page.tsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

hero_regex = re.compile(r'\{\/\* Profile Header Block \*\/\}(.*?)<div className="sticky top-0', re.DOTALL)

new_header = """{/* Profile Header Block */}
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
                      "{displayPlayer.bio || getField('bio', '')}"
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
                        { label: 'ELO RATING', value: displayElo, color: getField('is_pro', false) ? 'text-yellow-400' : 'text-primary' },
                        { label: 'Goles', value: displayGoals, color: 'text-foreground' },
                        { label: 'Badges', value: displayMvpCount, color: 'text-accent' },
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
        <div className="sticky top-0"""

content = hero_regex.sub(new_header, content)


extra_regex = re.compile(r'\{\/\* Main Tab View \*\/\}(.*?)<div className="min-h-\[600px\]">', re.DOTALL)
new_extra = """{/* Edit Mode OR Tabs */}
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
            <div className="min-h-[600px]">"""

content = extra_regex.sub(new_extra, content)


overview_regex = re.compile(r'\{activeTab === \'overview\' && \((.*?)\)\}', re.DOTALL)
overview_new = """{activeTab === 'overview' && !isEditing && (
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
                    <div className="lg:col-span-1 p-8 rounded-[3rem] border border-foreground/10 space-y-8 bg-surface/50 dark:bg-foreground/[0.02] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:bg-foreground/[0.04] transition-all">
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
                           <div key={idx} className="flex flex-col gap-1 p-4 rounded-[1.5rem] bg-foreground/[0.03] border border-foreground/5 shadow-inner group/bio relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover/bio:opacity-100 transition-opacity blur-xl rounded-full" style={{ backgroundColor: item.dot.replace('bg-', '') }} />
                             <div className="flex items-center gap-2 relative z-10">
                               <div className={cn('w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]', item.dot.replace('bg-', 'text-'))} />
                               <span className="text-[8px] font-black uppercase text-foreground/40 tracking-[0.2em] truncate">{item.label}</span>
                             </div>
                             <div className="flex items-baseline gap-1 relative z-10">
                               <span className={cn("text-xl sm:text-2xl font-black italic uppercase tracking-tighter truncate leading-none", item.isTeam ? "text-primary" : "text-foreground")}>{item.value}</span>
                               {item.unit && <span className="text-[8px] font-black text-foreground/30 uppercase">{item.unit}</span>}
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
                       <div className="p-8 rounded-[3rem] border border-foreground/10 bg-gradient-to-br from-surface/50 to-foreground/[0.02] flex flex-col justify-between group/perf shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:bg-foreground/[0.04] transition-all relative overflow-hidden">
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
                               <div key={i} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-background/40 border border-foreground/[0.03] hover:border-foreground/10 transition-colors group/item">
                                 <div className="flex items-center gap-3">
                                    <div className="font-mono text-[9px] font-bold text-foreground/20 italic group-hover/item:text-foreground/40 transition-colors">0{i+1}</div>
                                    <span className="text-[9px] font-black uppercase text-foreground/50 tracking-[0.2em]">{stat.label}</span>
                                 </div>
                                 <span className={cn("font-black italic tracking-tighter leading-none group-hover/item:scale-105 transition-transform origin-right", stat.lg ? "text-4xl drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "text-3xl", stat.color)}>{stat.value}</span>
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
                    <div className="p-8 lg:p-12 rounded-[3.5rem] border border-foreground/10 bg-gradient-to-br from-surface to-background shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden group/team cursor-default transition-all duration-700 w-full">
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

                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-background/40 p-5 rounded-[2rem] border border-foreground/[0.03] shadow-inner">
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

                         <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                           <Link href={`/team?id=${userTeam.id}`} className="h-12 px-8 rounded-2xl bg-foreground hover:bg-white text-background font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 group/link">
                             Acceder Sede <ExternalLink className="w-4 h-4 group-hover/link:rotate-12 transition-transform" />
                           </Link>
                           {userTeam.captain_id === (id === 'me' || !id ? user?.id : id) && (
                             <div className="h-12 px-6 rounded-2xl border border-primary bg-primary/10 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                               <Star className="w-4 h-4 text-primary fill-primary animate-pulse" />
                               <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Capitán</span>
                             </div>
                           )}
                         </div>
                       </div>
                    </div>
                  )}
                </motion.div>
              )}"""

content = overview_regex.sub(overview_new, content)

# Check missing closing tags for the nested isEditing check
# I added `{isEditing ? (...) : ( <> ... Main Tab View <div className="min-h-[600px]">`
# This means I need to close `</> )}` after the tabs section!
# Where does AnimatePresence end?
# Let's find: `</AnimatePresence>\n          </div>\n        </div>`

close_regex = re.compile(r'<\/AnimatePresence>\n          <\/div>\n        <\/div>', re.DOTALL)
close_new = """</AnimatePresence>
          </div>
          </>
        )}
        </div>"""
content = close_regex.sub(close_new, content)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Python script executed successfully.")
