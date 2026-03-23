const fs = require('fs');
const content = fs.readFileSync('src/app/page.tsx', 'utf8');

// The corruption is "group"primary/10 group" which should have have a newline
const corrected = content.replace(/group"primary\/10 group/g, 'group"\n            primary/10 group');

fs.writeFileSync('src/app/page.tsx', corrected);
console.log('Fixed page.tsx corruption');
