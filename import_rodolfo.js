import fs from 'fs';
import Database from 'better-sqlite3';

const db = new Database('./patients.db');

async function importRodolfo() {
  const url = 'https://docs.google.com/spreadsheets/d/1kpSib49Fpm8wjkA5AXurdQE3Dp5aFrfyr86G3jVg5Y8/export?format=csv';
  const res = await fetch(url);
  const text = await res.text();
  
  const cleanWords = (str) => {
    if (!str || str.toUpperCase() === 'NÃO AVALIAD' || str.toUpperCase() === 'N\u00e3o' || str.toUpperCase() === 'NAO') return '';
    return str.trim()
      .split(' ')
      .map(word => {
        if (word.length <= 2 && !['A', 'E', 'O'].includes(word.toUpperCase())) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const cleanSusCard = (sus) => {
    if (typeof sus === 'number') sus = sus.toString();
    return sus?.replace(/[^0-9]/g, '');
  };
  
  const cleanPhone = (phone) => {
    if (typeof phone === 'number') phone = phone.toString();
    return phone?.trim();
  };

  const rows = text.split('\n');
  const insert = db.prepare(`
    INSERT INTO patients (name, sus_card, diagnosis, surgery_type, category, phone, data_cirurgia, doctor, risk_status, age)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const check = db.prepare(`SELECT id FROM patients WHERE name = ? AND sus_card = ?`);
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row.trim()) continue;
    
    // Simple CSV parser ignoring commas inside quotes
    let cols = [];
    let cur = '';
    let inQuote = false;
    for (let j = 0; j < row.length; j++) {
      if (row[j] === '"') {
        inQuote = !inQuote;
      } else if (row[j] === ',' && !inQuote) {
        cols.push(cur);
        cur = '';
      } else {
        cur += row[j];
      }
    }
    cols.push(cur);

    if (cols.length < 2) continue; // At least Data da consulta and Nome
    if (!cols[1] || !cols[1].trim() || cols[1] === 'PACIENTE' || cols[1].includes('Cirurgias agendadas') || cols[1].includes('Cirurgias prioritárias') || cols[1].includes('Pacientes com pendências') || cols[1].includes('Faltoso') || cols[1].includes('Data da')) continue;
    
    const patientName = cleanWords(cols[1]);
    if (!patientName) continue;
    
    const surgeryDate = cols[2]?.trim() || '';
    const procedure = cleanWords(cols[3]);
    let ageRaw = cols[4] ? cols[4].toString().replace(/[^0-9]/g, '') : '';
    const age = parseInt(ageRaw, 10) || null;
    const disease = cleanWords(cols[5]);
    const riskStatus = cleanWords(cols[6]) || 'Aguardando';
    const susCard = cleanSusCard(cols[7]) || '';
    const phone = cleanPhone(cols[8]) || '';
    const dob = cols[9]?.trim() || '';

    const existing = check.get(patientName, susCard);
    if (!existing) {
      let status = 'PENDENCIA';
      let data_cirurgia = null;
      if (surgeryDate) {
         data_cirurgia = surgeryDate;
         status = 'AGENDADA';
      }
      insert.run(
        patientName, 
        susCard, 
        disease, 
        procedure, 
        status, 
        phone, 
        data_cirurgia, 
        'Dr. Rodolfo', 
        riskStatus,
        age
      );
      console.log('Inserted', patientName);
    }
  }
}
importRodolfo();
