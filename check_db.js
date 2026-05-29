import Database from 'better-sqlite3';

const db = new Database('./patients.db');
const row = db.prepare(`SELECT doctor, COUNT(*) as count FROM patients GROUP BY doctor`).all();
console.log(row);
