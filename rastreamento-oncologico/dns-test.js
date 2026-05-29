const dns = require('dns');

dns.resolve4('db.ejhjigkjboiadjjiuaik.supabase.co', (err, addresses) => {
  if (err) {
    console.error('IPv4 resolution failed:', err.message);
  } else {
    console.log('IPv4 addresses:', addresses);
  }
});

dns.resolve6('db.ejhjigkjboiadjjiuaik.supabase.co', (err, addresses) => {
  if (err) {
    console.error('IPv6 resolution failed:', err.message);
  } else {
    console.log('IPv6 addresses:', addresses);
  }
});

// Try pooler
dns.resolve4('aws-0-sa-east-1.pooler.supabase.com', (err, addresses) => {
  console.log('sa-east-1 pooler IPv4:', addresses ? 'OK' : 'FAIL');
});
