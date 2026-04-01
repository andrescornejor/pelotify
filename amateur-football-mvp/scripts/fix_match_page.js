const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\andyc\\OneDrive\\Documentos\\GitHub\\pelotify\\amateur-football-mvp\\src\\app\\match\\page.tsx';

try {
    let content = fs.readFileSync(filePath, 'utf8');

    const startMarker = '<MercadoPagoButton';
    const endMarker = 'group/venue">';

    const matchStart = content.indexOf(startMarker);
    const matchEnd = content.indexOf(endMarker) + endMarker.length;

    if (matchStart !== -1 && matchEnd !== -1) {
        // Find the beginning of the line with startMarker
        const lineStart = content.lastIndexOf('\n', matchStart) + 1;

        const replacement = `                  <MercadoPagoButton 
                     matchId={match.id} 
                     title={\`Partido en \${match.location}\`}
                     price={match.price} 
                   />
                 </div>
                 <p className="text-[9px] font-medium text-foreground/20 text-center uppercase tracking-widest relative z-10">
                   Tu pago está protegido por Pelotify SafePlay
                 </p>
               </motion.div>
             )}

             {/* Location / Venue */}
             <div className="rounded-[3rem] glass-premium border-white/5 overflow-hidden group/venue">`;

        const newContent = content.slice(0, lineStart) + replacement + content.slice(matchEnd);
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log("File fixed successfully via Node.");
    } else {
        console.log(`Markers not found: start=${matchStart}, end=${matchEnd}`);
    }
} catch (err) {
    console.error("Error fixing file:", err);
}
