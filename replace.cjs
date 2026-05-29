const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/bg-indigo-600/g, 'bg-[#004b87]');
content = content.replace(/hover:bg-indigo-700/g, 'hover:bg-[#003a69]');
content = content.replace(/text-indigo-600/g, 'text-[#004b87]');
content = content.replace(/text-indigo-700/g, 'text-[#004b87]');

content = content.replace(/bg-emerald-600/g, 'bg-[#006b54]');
content = content.replace(/text-emerald-600/g, 'text-[#006b54]');
content = content.replace(/text-emerald-700/g, 'text-[#006b54]');

content = content.replace(/bg-teal-600/g, 'bg-[#006b54]');
content = content.replace(/hover:bg-teal-700/g, 'hover:bg-[#005442]');
content = content.replace(/text-teal-700/g, 'text-[#006b54]');

content = content.replace(/bg-slate-900 text-white/g, 'bg-[#004b87] text-white');
content = content.replace(/rounded-2xl/g, 'rounded-lg');
content = content.replace(/rounded-xl/g, 'rounded-md');
content = content.replace(/shadow-xl/g, 'shadow-lg');
content = content.replace(/border-indigo-500/g, 'border-[#004b87]');
content = content.replace(/ring-indigo-500/g, 'ring-[#004b87]');

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
