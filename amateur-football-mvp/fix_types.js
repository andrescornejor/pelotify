const fs = require('fs');

const fixCanchas = () => {
    const filepath = 'c:\\Users\\andyc\\OneDrive\\Documentos\\GitHub\\pelotify\\amateur-football-mvp\\src\\app\\canchas\\page.tsx';
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Pattern to find the hardcoded list
    const target = `{["F5", "F7", "F11"].map(type => (`;
    const replacement = `{(Array.from(new Set(fields.map((f: any) => f.type))) as string[]).map(type => (`;
    
    if (content.includes(target)) {
        content = content.replace(target, replacement);
        // Also fix the flex-1 to px-3 to avoid weird widths
        content = content.replace('className="flex-1 h-12', 'className="px-4 h-12');
        fs.writeFileSync(filepath, content, 'utf-8');
        console.log("Fixed canchas/page.tsx");
    } else {
        console.error("Target not found in canchas/page.tsx");
    }
};

const fixEstablecimientos = () => {
    const filepath = 'c:\\Users\\andyc\\OneDrive\\Documentos\\GitHub\\pelotify\\amateur-football-mvp\\src\\app\\establecimientos\\[id]\\page.tsx';
    let content = fs.readFileSync(filepath, 'utf8');
    
    const target = `{["F5", "F7", "F11"].map(type => (`;
    // In establishments, we also want them to be filter buttons.
    // For now, let's just make the list dynamic as requested.
    const replacement = `{(Array.from(new Set(fields.map(f => f.type))) as string[]).map(type => (`;
    
    if (content.includes(target)) {
        content = content.replace(target, replacement);
        fs.writeFileSync(filepath, content, 'utf-8');
        console.log("Fixed establecimientos/page.tsx");
    } else {
        console.error("Target not found in establecimientos/page.tsx");
    }
};

fixCanchas();
fixEstablecimientos();
