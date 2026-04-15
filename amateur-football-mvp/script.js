const fs = require('fs');
const targetFile = 'c:\\Users\\andyc\\OneDrive\\Documentos\\GitHub\\pelotify\\amateur-football-mvp\\src\\app\\profile\\page.tsx';

let content = fs.readFileSync(targetFile, 'utf8');

// Replace Hero Section
const heroRegex = /\{\/\* Profile Header Block \*\/\}([\s\S]*?)<div className="sticky top-0/g;
const snippet1 = fs.readFileSync('snippet1.txt', 'utf8');
content = content.replace(heroRegex, snippet1);

// Replace Tab wrapper logic
const extraRegex = /\{\/\* Main Tab View \*\/\}([\s\S]*?)<div className="min-h-\[600px\]">/g;
const snippet2 = fs.readFileSync('snippet2.txt', 'utf8');
content = content.replace(extraRegex, snippet2);

// Replace Overview Tab Content
const overviewRegex = /\{activeTab === 'overview' && \([\s\S]*?\}\)/g;
const snippet3 = fs.readFileSync('snippet3.txt', 'utf8');
content = content.replace(overviewRegex, snippet3);

// Fix curly braces for AnimatePresence closing
const closeRegex = /<\/AnimatePresence>([\s\S]*?)<\/div>([\s\S]*?)<\/div>/;
const closeNew = `</AnimatePresence>
          </div>
          </>
        )}
        </div>`;
content = content.replace(closeRegex, closeNew);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully completed profile modifications!');
