const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/profile/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newWall = `{activeTab === 'wall' && (
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
                                <Link href={\`/profile?id=\${comment.author_id}\`} className="w-12 h-12 rounded-[1.2rem] overflow-hidden shrink-0 border border-foreground/10 hover:border-primary/50 transition-colors shadow-sm">
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
                                   <Link href={\`/profile?id=\${comment.author_id}\`} className="font-black text-[14px] uppercase italic tracking-tight text-foreground hover:text-blue-500 transition-colors">
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
`;

let startIndex = content.indexOf("{activeTab === 'wall' && (");
// The next tab is wallet
let endIndexInfo = content.indexOf("{activeTab === 'wallet' && isMe && (");

if (startIndex === -1) {
    console.error("Could not find start index");
    process.exit(1);
}
if (endIndexInfo === -1) {
    console.error("Could not find end index");
    process.exit(1);
}

// Find the line start of startIndex
while (startIndex > 0 && content[startIndex - 1] !== '\n') {
    startIndex--;
}

// Find the line start of endIndexInfo
while (endIndexInfo > 0 && content[endIndexInfo - 1] !== '\n') {
    endIndexInfo--;
}

const finalContent = content.slice(0, startIndex) + "              " + newWall + "\n" + content.slice(endIndexInfo);

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log("Successfully replaced based on indices!");
