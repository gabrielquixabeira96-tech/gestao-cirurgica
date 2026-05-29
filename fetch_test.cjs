const https = require('https');

https.get('https://docs.google.com/spreadsheets/d/1pUOSrL4TrNU4SPXEK-FscXnyv81yTDLuvEmqtlgHom0/export?format=csv', (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    https.get(res.headers.location, (res2) => {
      let data = '';
      res2.on('data', chunk => data += chunk);
      res2.on('end', () => console.log(data));
    });
  } else {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(data));
  }
});
