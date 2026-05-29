const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/text-slate-500/g, 'text-slate-600');

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
