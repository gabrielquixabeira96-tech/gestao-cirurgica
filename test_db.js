import Database from "better-sqlite3";
const db = new Database("patients.db");
const count = db.prepare("SELECT count(*) as count FROM patients WHERE doctor = 'Dr. Gilmar'").get();
console.log(count);
