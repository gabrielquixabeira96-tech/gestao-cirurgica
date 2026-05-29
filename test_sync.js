async function sync() {
  const res = await fetch('http://localhost:3000/api/sync-sheets', { method: 'POST' });
  const text = await res.text();
  console.log(text);
}
sync();
