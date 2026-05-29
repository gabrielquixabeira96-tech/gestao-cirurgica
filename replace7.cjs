const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"/g, 'className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider"');

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
