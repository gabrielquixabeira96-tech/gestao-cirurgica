const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace remaining hardcoded colors
content = content.replace(/text-black/g, 'text-[var(--color-mayo-blue)]');
content = content.replace(/bg-black/g, 'bg-[var(--color-mayo-blue)]');
content = content.replace(/border-black/g, 'border-[var(--color-mayo-blue)]');
content = content.replace(/focus:ring-\[#004b87\]/g, 'focus:ring-[var(--color-mayo-blue)]');

// Ensure some elements stay neutral
content = content.replace(/text-\[var\(--color-mayo-blue\)\]-neutral-600/g, 'text-neutral-600');

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
