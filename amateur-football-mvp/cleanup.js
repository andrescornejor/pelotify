const fs = require('fs');
const content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Aggressive cleaning of common interleaved corruption patterns
let cleaned = content
  .replace(/group"primary\/10 group/g, 'group"\n            primary/10 group')
  .replace(/Rank Detail Banner \}.*pulse"/g, 'Rank Detail Banner */}')
  .replace(/pulse" \/>[^\n]*/g, 'pulse" />')
  .replace(/divon: Award/g, 'div')
  .replace(/key=\{i\}'#6366f1'/g, 'key={i}')
  .replace(/<\/motion\.div>\s*<motion\.section/g, '</motion.section>\n\n            <motion.section');

// Split and fix line 1100 specifically if needed
const lines = cleaned.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Road to Glory') && lines[i+1] && lines[i+1].includes('motion.section')) {
        // Find the closure for this section
        for (let j = i + 1; j < i + 200 && j < lines.length; j++) {
            if (lines[j].includes('</motion.div>') && !lines[j].includes('SectionDivider')) {
                lines[j] = '            </motion.section>';
                break;
            }
        }
    }
}

fs.writeFileSync('src/app/page.tsx', lines.join('\n'));
console.log('Aggressively cleaned page.tsx');
