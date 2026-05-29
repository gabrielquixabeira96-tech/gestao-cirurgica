const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace indigo with mayo blue
content = content.replace(/bg-indigo-50/g, 'bg-[#f0f4f8]');
content = content.replace(/text-indigo-500/g, 'text-[#004b87]');
content = content.replace(/border-indigo-100/g, 'border-[#004b87]/20');
content = content.replace(/border-indigo-200/g, 'border-[#004b87]/30');
content = content.replace(/hover:bg-indigo-100/g, 'hover:bg-[#e1e8f0]');

// Replace emerald with mayo green
content = content.replace(/bg-emerald-50/g, 'bg-[#f0f7f5]');
content = content.replace(/border-emerald-200/g, 'border-[#006b54]/30');
content = content.replace(/hover:bg-emerald-100/g, 'hover:bg-[#e1f0ec]');

// Replace teal with mayo green
content = content.replace(/bg-teal-50/g, 'bg-[#f0f7f5]');
content = content.replace(/border-teal-200/g, 'border-[#006b54]/30');
content = content.replace(/hover:bg-teal-100/g, 'hover:bg-[#e1f0ec]');
content = content.replace(/text-teal-500/g, 'text-[#006b54]');
content = content.replace(/disabled:bg-teal-400/g, 'disabled:bg-[#006b54]/50');

// Replace amber and rose with subtle colors or keep them for status?
// The prompt says: "Use tons de azul escuro profissional e verde floresta apenas para botões de ação (CTAs), links e destaques sutis."
// Status colors (red, amber, green) are usually kept for medical status, but let's make them more subtle or keep them as is.
// The prompt says: "Não utilize gradientes chamativos, cores neon ou animações agressivas."

// Let's also check rounded corners
content = content.replace(/rounded-full/g, 'rounded-md');

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
