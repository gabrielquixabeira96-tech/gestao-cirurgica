const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Main container padding
content = content.replace(/className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"/g, 'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"');

// Dashboard stats
content = content.replace(/className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"/g, 'className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"');

// Patient list spacing
content = content.replace(/className="space-y-8"/g, 'className="space-y-12"');

// Table cell padding
content = content.replace(/className="px-6 py-6 align-top"/g, 'className="px-8 py-8 align-top"');
content = content.replace(/className="px-6 py-6"/g, 'className="px-8 py-8"');

// Header height
content = content.replace(/className="flex justify-between items-center h-16"/g, 'className="flex justify-between items-center h-20"');

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
