const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const icons = [
  'ClipboardList', 'MessageSquare', 'FileText', 'CheckCircle2', 'Circle', 'Search',
  'Plus', 'Calendar', 'Phone', 'User', 'Activity', 'ChevronRight', 'Loader2',
  'AlertCircle', 'X', 'RefreshCw', 'CalendarPlus', 'FileSignature'
];

icons.forEach(icon => {
  const regex = new RegExp(`<${icon} className="([^"]*)" />`, 'g');
  content = content.replace(regex, `<${icon} className="$1" strokeWidth={1.5} />`);
  
  // also handle cases where there might be other props
  const regex2 = new RegExp(`<${icon} className={cn\\("([^"]*)", ([^\\)]*)\\)} />`, 'g');
  content = content.replace(regex2, `<${icon} className={cn("$1", $2)} strokeWidth={1.5} />`);
});

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
