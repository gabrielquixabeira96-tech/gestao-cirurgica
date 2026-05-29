const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Colors
content = content.replace(/bg-\[#004b87\]/g, 'bg-black');
content = content.replace(/text-\[#004b87\]/g, 'text-black');
content = content.replace(/border-\[#004b87\]/g, 'border-black');
content = content.replace(/bg-\[#003a69\]/g, 'bg-neutral-800');
content = content.replace(/bg-\[#006b54\]/g, 'bg-black');
content = content.replace(/text-\[#006b54\]/g, 'text-black');
content = content.replace(/border-\[#006b54\]/g, 'border-black');
content = content.replace(/bg-\[#005442\]/g, 'bg-neutral-800');
content = content.replace(/bg-\[#f0f4f8\]/g, 'bg-white');
content = content.replace(/bg-\[#f0f7f5\]/g, 'bg-white');
content = content.replace(/bg-\[#e1f0ec\]/g, 'bg-neutral-100');
content = content.replace(/bg-\[#e1e8f0\]/g, 'bg-neutral-100');

// Slate to Neutral/Black
content = content.replace(/text-slate-900/g, 'text-black');
content = content.replace(/text-slate-800/g, 'text-black');
content = content.replace(/text-slate-700/g, 'text-black');
content = content.replace(/text-slate-600/g, 'text-neutral-600');
content = content.replace(/text-slate-500/g, 'text-neutral-500');
content = content.replace(/text-slate-400/g, 'text-neutral-400');
content = content.replace(/text-slate-300/g, 'text-neutral-300');
content = content.replace(/bg-slate-50/g, 'bg-neutral-50');
content = content.replace(/bg-slate-100/g, 'bg-neutral-100');
content = content.replace(/bg-slate-200/g, 'bg-neutral-200');
content = content.replace(/bg-slate-300/g, 'bg-neutral-300');
content = content.replace(/bg-slate-400/g, 'bg-neutral-400');
content = content.replace(/bg-slate-500/g, 'bg-neutral-500');
content = content.replace(/bg-slate-600/g, 'bg-neutral-600');
content = content.replace(/bg-slate-700/g, 'bg-neutral-700');
content = content.replace(/border-slate-100/g, 'border-black');
content = content.replace(/border-slate-200/g, 'border-black');
content = content.replace(/border-slate-300/g, 'border-black');
content = content.replace(/border-slate-400/g, 'border-black');

// Shapes
content = content.replace(/rounded-md/g, 'rounded-none');
content = content.replace(/rounded-lg/g, 'rounded-none');
content = content.replace(/rounded-xl/g, 'rounded-none');
content = content.replace(/rounded-2xl/g, 'rounded-none');
content = content.replace(/rounded-full/g, 'rounded-none');
content = content.replace(/rounded/g, 'rounded-none');
content = content.replace(/shadow-sm/g, '');

// Header Icon
content = content.replace(/<div className="bg-black p-2 rounded-none">\s*<ClipboardList className="text-white w-6 h-6" strokeWidth=\{1\.5\} \/>\s*<\/div>/g, '');
content = content.replace(/<ClipboardList className="w-5 h-5" strokeWidth=\{1\.5\} \/>/g, '');

// Stats Icons
content = content.replace(/<div className="p-3 bg-white rounded-none">\s*<Calendar className="text-black w-6 h-6" strokeWidth=\{1\.5\} \/>\s*<\/div>/g, '');
content = content.replace(/<div className="p-3 bg-white rounded-none">\s*<AlertCircle className="text-black w-6 h-6" strokeWidth=\{1\.5\} \/>\s*<\/div>/g, '');
content = content.replace(/<div className="p-3 bg-white rounded-none">\s*<CheckCircle2 className="text-black w-6 h-6" strokeWidth=\{1\.5\} \/>\s*<\/div>/g, '');

// Checklist Icons
content = content.replace(/\{patient\.([a-z_]+) \? \(\s*<CheckCircle2 className="w-4 h-4 text-black shrink-0" strokeWidth=\{1\.5\} \/>\s*\) : \(\s*<Circle className="w-4 h-4 text-neutral-300 shrink-0" strokeWidth=\{1\.5\} \/>\s*\)\}/g, '<span className="font-mono text-xs font-bold">{patient.$1 ? \'[X]\' : \'[ ]\'}</span>');

// User and Activity Icons
content = content.replace(/<User className="w-3 h-3" strokeWidth=\{1\.5\} \/>/g, '<span className="font-bold uppercase tracking-widest text-[10px]">Idade:</span>');
content = content.replace(/<Activity className="w-3 h-3" strokeWidth=\{1\.5\} \/>/g, '<span className="font-bold uppercase tracking-widest text-[10px]">Risco:</span>');

// Remove other allegorical icons
content = content.replace(/<CalendarPlus className="w-3\.5 h-3\.5" strokeWidth=\{1\.5\} \/>/g, '');
content = content.replace(/<FileSignature className="w-3\.5 h-3\.5" strokeWidth=\{1\.5\} \/>/g, '');
content = content.replace(/<FileText className="w-3\.5 h-3\.5" strokeWidth=\{1\.5\} \/>/g, '');
content = content.replace(/<MessageSquare className="w-3\.5 h-3\.5" strokeWidth=\{1\.5\} \/>/g, '');
content = content.replace(/<Activity className="w-3\.5 h-3\.5" strokeWidth=\{1\.5\} \/>/g, '');

// Make buttons text more sophisticated
content = content.replace(/text-xs font-bold transition-colors/g, 'text-[10px] font-bold uppercase tracking-widest transition-colors');

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
