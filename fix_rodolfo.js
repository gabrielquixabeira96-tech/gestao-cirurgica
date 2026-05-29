import Database from 'better-sqlite3';

const db = new Database('./patients.db');
db.prepare(`DELETE FROM patients WHERE name IN ('Pele Não Melanoma', 'Negou Cirurgia / Não Atende Telefone', 'Pacientes Prontos')`).run();
console.log('Fixed');
