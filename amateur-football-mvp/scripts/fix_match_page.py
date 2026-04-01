
import os

file_path = r'c:\Users\andyc\OneDrive\Documentos\GitHub\pelotify\amateur-football-mvp\src\app\match\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Broken section:
#                   <MercadoPagoButton 
#                     matchId={match.id} 
#                     title={`Partido en ${match.location}`}
#                     price={match.price} 
#                   />
#              {/* Location / Venue */}
#             <div className="rounded-[3rem] glass-premium border-white/5 overflow-hidden group/venue">

target = '                  <MercadoPagoButton \n                    matchId={match.id} \n                    title={`Partido en ${match.location}`} \n                    price={match.price} \n                  />'

# Since we don't know the exact line endings or indentation, let's look for a substring and replace the whole block.
start_marker = '<MercadoPagoButton'
end_marker = 'group/venue">'

import re
# Find the start and end of the problematic block.
match_start = content.find(start_marker)
match_end = content.find(end_marker) + len(end_marker)

if match_start != -1 and match_end != -1:
    # Look for the beginning of the line with start_marker.
    line_start = content.rfind('\n', 0, match_start) + 1
    
    replacement = """                  <MercadoPagoButton 
                     matchId={match.id} 
                     title={`Partido en ${match.location}`}
                     price={match.price} 
                   />
                 </div>
                 <p className="text-[9px] font-medium text-foreground/20 text-center uppercase tracking-widest relative z-10">
                   Tu pago está protegido por Pelotify SafePlay
                 </p>
               </motion.div>
             )}

             {/* Location / Venue */}
             <div className="rounded-[3rem] glass-premium border-white/5 overflow-hidden group/venue">"""
    
    new_content = content[:line_start] + replacement + content[match_end:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("File repaired successfully.")
else:
    print(f"Start: {match_start}, End: {match_end}")
