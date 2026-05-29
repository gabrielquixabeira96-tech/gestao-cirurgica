const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/bg-amber-50 text-amber-700 hover:bg-amber-100/g, 'bg-[#f0f4f8] text-[#004b87] hover:bg-[#e1e8f0]');
content = content.replace(/bg-rose-50 text-rose-700 hover:bg-rose-100/g, 'bg-[#f0f4f8] text-[#004b87] hover:bg-[#e1e8f0]');

content = content.replace(/bg-blue-50/g, 'bg-[#f0f4f8]');
content = content.replace(/text-blue-600/g, 'text-[#004b87]');

content = content.replace(/bg-amber-50/g, 'bg-[#f0f4f8]');
content = content.replace(/text-amber-600/g, 'text-[#004b87]');

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
