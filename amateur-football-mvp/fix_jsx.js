const fs = require('fs');
const path = require('path');

const filepath = 'c:\\Users\\andyc\\OneDrive\\Documentos\\GitHub\\pelotify\\amateur-football-mvp\\src\\app\\canchas\\page.tsx';

try {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split(/\r?\n/);

    const targetPattern = "{isSavingPrices ? 'Guardando...' : 'Guardar Todo'}";

    let inserted = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(targetPattern)) {
            // Check following lines for button and div closing
            if (lines[i+1]?.includes('</button>') && lines[i+2]?.trim() === '</div>') {
                // This is where Pricing Card ends. Add Left Column closing after.
                lines.splice(i+3, 0, '           </div>');
                inserted = true;
                console.log(`Successfully added closing div after line ${i+3}`);
                break;
            }
        }
    }

    if (inserted) {
        fs.writeFileSync(filepath, lines.join('\n'), 'utf8');
    } else {
        console.error("Pattern not found to fix JSX.");
        process.exit(1);
    }
} catch (err) {
    console.error("Error fixing JSX: ", err);
    process.exit(1);
}
