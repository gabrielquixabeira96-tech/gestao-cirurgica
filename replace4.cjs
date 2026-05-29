const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/rounded-lg/g, 'rounded-md');
content = content.replace(/shadow-sm/g, 'shadow-sm'); // keeping shadow-sm

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
