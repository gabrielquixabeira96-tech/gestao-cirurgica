import fs from 'fs';

async function fetchSheet(url, name) {
  const res = await fetch(url);
  const text = await res.text();
  fs.writeFileSync(name + '.csv', text);
}

fetchSheet('https://docs.google.com/spreadsheets/d/11cZSuPAM0THHI3NjDROVo_y_kr8WAUWVf-5JYShW0Rw/export?format=csv&gid=0', 'gilmar_full');
