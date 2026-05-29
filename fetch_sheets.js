import fs from 'fs';

async function fetchSheet(url, name) {
  const res = await fetch(url);
  const text = await res.text();
  fs.writeFileSync(name + '.csv', text.split('\n').slice(0, 10).join('\n'));
}

fetchSheet('https://docs.google.com/spreadsheets/d/15pieYLg5y6_AYHIKmrDobmH7oS18iRF7ydLy8RNkbuU/export?format=csv&gid=0', 'mara');
fetchSheet('https://docs.google.com/spreadsheets/d/11cZSuPAM0THHI3NjDROVo_y_kr8WAUWVf-5JYShW0Rw/export?format=csv&gid=0', 'gilmar');
