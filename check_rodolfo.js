import Database from 'better-sqlite3';

const db = new Database('./patients.db');
const patients = db.prepare(`SELECT * FROM patients WHERE doctor = 'Dr. Rodolfo'`).all();
console.log(`Found ${patients.length} patients for Dr. Rodolfo`);
