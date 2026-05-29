import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import Papa from "papaparse";
import mammoth from "mammoth";
import fs from "fs";
import { parseOffice } from "officeparser";
import { cleanSusCard, cleanPhone, cleanDate, cleanWords } from "./src/dataCleaner.ts";
import { findBestCID } from "./src/cid10.ts";
import { findBestProcedure } from "./src/procedures.ts";
import { GoogleGenAI, Type } from "@google/genai";

const db = new Database("patients.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sus_card TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    surgery_type TEXT NOT NULL,
    risk_status TEXT NOT NULL,
    age INTEGER DEFAULT 0,
    birth_date TEXT,
    phone TEXT NOT NULL,
    cid_code TEXT,
    category TEXT NOT NULL,
    whatsapp_sent INTEGER DEFAULT 0,
    aih_generated INTEGER DEFAULT 0,
    aih_nir INTEGER DEFAULT 0,
    uti_vacancy INTEGER DEFAULT 0,
    scheduled_cc INTEGER DEFAULT 0,
    doctor TEXT DEFAULT ''
  )
`);

// Migration to add doctor column if it doesn't exist
try {
  db.exec("ALTER TABLE patients ADD COLUMN doctor TEXT DEFAULT ''");
} catch (e) {
  // Column likely already exists
}

// Migration to add evolution column
try {
  db.exec("ALTER TABLE patients ADD COLUMN evolution TEXT DEFAULT ''");
} catch (e) {
  // Column likely already exists
}

// Migration to add exam columns
try {
  db.exec("ALTER TABLE patients ADD COLUMN exam_pathology TEXT DEFAULT ''");
} catch (e) {}
try {
  db.exec("ALTER TABLE patients ADD COLUMN exam_imaging TEXT DEFAULT ''");
} catch (e) {}
try {
  db.exec("ALTER TABLE patients ADD COLUMN exam_others TEXT DEFAULT ''");
} catch (e) {}

// Migration to add procedure_code column
try {
  db.exec("ALTER TABLE patients ADD COLUMN procedure_code TEXT DEFAULT ''");
} catch (e) {}

// Migration to add scheduling columns
try {
  db.exec("ALTER TABLE patients ADD COLUMN data_internacao TEXT DEFAULT ''");
} catch (e) {}
try {
  db.exec("ALTER TABLE patients ADD COLUMN data_cirurgia TEXT DEFAULT ''");
} catch (e) {}
try {
  db.exec("ALTER TABLE patients ADD COLUMN horario_cirurgia TEXT DEFAULT ''");
} catch (e) {}

// Migration to populate missing cid_codes
const patientsMissingCid = db.prepare("SELECT id, diagnosis, surgery_type FROM patients WHERE cid_code IS NULL OR cid_code = '' OR cid_code = 'N/A'").all() as { id: number, diagnosis: string, surgery_type: string }[];
if (patientsMissingCid.length > 0) {
  const updateCid = db.prepare("UPDATE patients SET cid_code = ? WHERE id = ?");
  db.transaction(() => {
    for (const p of patientsMissingCid) {
      let cid = findBestCID(p.diagnosis);
      if (cid === 'N/A') {
        cid = findBestCID(p.surgery_type);
      }
      updateCid.run(cid, p.id);
    }
  })();
  console.log(`Updated CID codes for ${patientsMissingCid.length} existing patients.`);
}

// Seed data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM patients").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO patients (name, sus_card, diagnosis, surgery_type, risk_status, age, phone, cid_code, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const seedPatients = [
    // Cirurgias agendadas
    ["Sandra Silva de Jesus", "706306763443375", "Lobectomia inferior esquerda", "Lobectomia", "Risco ok", 54, "66996813201", "N/A", "AGENDADA"],
    
    // Cirurgias prioritárias
    ["Maria José da Silva Santos", "705.004.242.870.650", "Câncer de ovário", "Cirurgia citoredutora", "Risco + Lab ok", 62, "82999224210", "C56", "PRIORITARIA"],
    ["Rosely Chagas Daniel da Silva", "700.003.983.010.509", "Lesão anexial direita (CA125 elevado)", "Ooforectomia com congelação", "Risco ok", 48, "66984437128", "C56", "PRIORITARIA"],
    
    // Pacientes com pendências
    ["Ana rosa de faria", "704.102.138.932.377", "Cicatriz frontoparietal D", "Ampliação de margens", "Aguarda procedimento", 59, "65996987586", "C44.3", "PENDENCIA"],
    ["Maria ercy de Souza e Silva", "700.509.323.718.459", "CEC de lesão em asa nasal direita", "Exérese de lesão com retalho", "Aguarda Lab + risco", 65, "65999545843", "C44.3", "PENDENCIA"],
    ["Elaine Cristina dos Santos", "898.000.957.922.401", "NIC III com microinvasao", "Histerectomia simples", "Solicitado Lab", 41, "65992935569", "D06", "PENDENCIA"],
    ["Maria Vera Lúcia Alves", "700.106.973.366.515", "Exérese de lesão de pele", "Cbc + local", "Laboratório", 71, "66992488244", "C44.3", "PENDENCIA"],
    ["Luiz da Silva lanes", "706505398277390", "Lesão de pele + retalho", "Lesão de pele + retalho", "Solicito risco", 68, "65999217388", "C44.3", "PENDENCIA"],
    
    // Pele Não Melanoma
    ["Antônio Chaikoski", "706.404.187.776.788", "Cbc em ponta nasal", "Exérese de lesão de pele com retalho", "Pronto", 74, "65992346620", "C44.3", "PELE_NAO_MELANOMA"],
    ["Silmara Simões Salzedas", "705002251083958", "CBC de pele em MSE", "Exérese de pele", "Pronto", 52, "65999813312", "C44.4", "PELE_NAO_MELANOMA"],
    ["Francisco Aparecido Ribeiro", "702604771220145", "Lesao verrucosa em III quirodact dir", "Exerese com fechamento primário", "Agendar data", 63, "66984140683", "C44.3", "PELE_NAO_MELANOMA"],
    
    // Faltoso
    ["Joaquim Martins de Lima", "702604704435747", "CBC ressecado com margens comprometidas", "Ampliação de margens", "Operou na origem", 69, "65999207565", "C44.3", "FALTOSO"],
    
    // Negou / Não atende
    ["Vergílio Rigui", "705000839578755", "Lesão 2 x 2 cm periorbital", "Exérese com margens + retalho", "Não atende", 77, "65999979038", "C44.3", "NEGOU_NAO_ATENDE"],
    ["Maria dos Anjos Alves", "707405058944373", "Cancer de endometrio", "Histerectomia total", "Negou cirurgia", 61, "66996537507", "C54.1", "NEGOU_NAO_ATENDE"],
    
    // Pacientes prontos
    ["Tatiane Maria da Silva", "705809445589538", "CA de mama / espessamento endometrial", "Histerectomia total", "Risco ok", 45, "65992561653", "C50", "PRONTO"],
    ["Ivonete Ferreira da Silva", "707.600.276.938.395", "NIC 3 com suspeita de invasão", "Conização", "Risco ok", 38, "65996264560", "D06", "PRONTO"],
    ["Benedito Rodrigues Leite", "7002077400106727", "Adeno de cólon", "Fechamento de colostomia", "Risco ok", 66, "65992170514", "N/A", "PRONTO"],
    ["Eleuza Rosa Dutra de Faria", "700.008.157.804.900", "Melanoma anterior", "Exérese de lesão", "Ok", 58, "999158813", "C43.4", "PRONTO"],
    ["Daiane Francisca da Silva Souza", "708207121266944", "NIC 3", "Conização", "Internar 1 dia antes", 34, "66984368851", "D06", "PRONTO"],
    ["Cristina Gonçalves da Silva", "700.005.597.393.302", "CBC em asa nasal e lábio", "Exérese + Ampliação", "Risco Ok", 67, "65981151117", "C44.3", "PRONTO"]
  ];

  seedPatients.forEach(p => insert.run(...p));
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  const PORT = 3000;

  // API Routes
  app.get("/api/patients", (req, res) => {
    try {
      const patients = db.prepare("SELECT * FROM patients").all();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar pacientes" });
    }
  });

  app.post("/api/patients/:id/status", (req, res) => {
    const { id } = req.params;
    const { field, value } = req.body;
    
    const allowedFields = ["whatsapp_sent", "aih_generated", "aih_nir", "uti_vacancy", "scheduled_cc"];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: "Campo inválido" });
    }

    try {
      const stmt = db.prepare(`UPDATE patients SET ${field} = ? WHERE id = ?`);
      stmt.run(value ? 1 : 0, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar status" });
    }
  });

  app.delete("/api/patients/:id", (req, res) => {
    const { id } = req.params;
    try {
      const stmt = db.prepare("DELETE FROM patients WHERE id = ?");
      stmt.run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir paciente" });
    }
  });

  app.put("/api/patients/:id", (req, res) => {
    const { id } = req.params;
    const {
      name,
      sus_card,
      diagnosis,
      surgery_type,
      risk_status,
      age,
      birth_date,
      phone,
      cid_code,
      procedure_code,
      category,
      doctor
    } = req.body;

    let finalAge = age || 0;
    if (birth_date) {
      // Calculate age from birth_date (DD/MM/YYYY)
      const parts = birth_date.split('/');
      if (parts.length === 3) {
        const birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        // Only override if the user didn't explicitly provide a different age
        if (!age || finalAge === 0) {
          finalAge = calculatedAge;
        }
      }
    }

    try {
      const stmt = db.prepare(`
        UPDATE patients 
        SET name = ?, sus_card = ?, diagnosis = ?, surgery_type = ?, 
            risk_status = ?, age = ?, birth_date = ?, phone = ?, 
            cid_code = ?, procedure_code = ?, category = ?, doctor = ?
        WHERE id = ?
      `);
      
      stmt.run(
        name?.trim() || '',
        sus_card?.trim() || '',
        diagnosis?.trim() || '',
        surgery_type?.trim() || '',
        risk_status?.trim() || '',
        finalAge,
        birth_date?.trim() || '',
        phone?.trim() || '',
        cid_code?.trim() || 'N/A',
        procedure_code?.trim() || '',
        category?.trim() || '',
        doctor?.trim() || '',
        id
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao atualizar paciente" });
    }
  });

  app.patch("/api/patients/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove id from updates if present
    delete updates.id;

    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return res.status(400).json({ error: "Nenhum dado para atualizar" });
    }

    // Filter allowed fields to prevent SQL injection or unwanted updates
    const allowedFields = [
      "name", "sus_card", "diagnosis", "surgery_type", "risk_status", 
      "age", "birth_date", "phone", "cid_code", "procedure_code", 
      "category", "doctor", "evolution", "exam_pathology", 
      "exam_imaging", "exam_others", "whatsapp_sent", "aih_generated", 
      "aih_nir", "uti_vacancy", "scheduled_cc",
      "data_internacao", "data_cirurgia", "horario_cirurgia"
    ];

    const filteredFields = fields.filter(f => allowedFields.includes(f));
    
    if (filteredFields.length === 0) {
      return res.status(400).json({ error: "Campos inválidos" });
    }

    const setClause = filteredFields.map(field => `${field} = ?`).join(", ");
    const values = filteredFields.map(field => updates[field]);
    values.push(id);

    try {
      const stmt = db.prepare(`UPDATE patients SET ${setClause} WHERE id = ?`);
      stmt.run(...values);
      
      const updatedPatient = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
      res.json(updatedPatient);
    } catch (error) {
      console.error("Erro no PATCH /api/patients/:id:", error);
      res.status(500).json({ error: "Erro ao atualizar paciente" });
    }
  });

  app.post("/api/sync-sheets", async (req, res) => {
    try {
      const sheets = [
        { 
          url: "https://docs.google.com/spreadsheets/d/1pUOSrL4TrNU4SPXEK-FscXnyv81yTDLuvEmqtlgHom0/export?format=csv&gid=0", 
          doctor: "Dra. Bianca",
          type: "bianca"
        },
        { 
          url: "https://docs.google.com/spreadsheets/d/1syiK9Q0lM-Y4NsLd51eX7gTeaiQXo_CTuNKekqP0YjA/export?format=csv&gid=0", 
          doctor: "Dr. Rafael",
          type: "rafael"
        },
        {
          url: "https://docs.google.com/spreadsheets/d/1DnnHiiuQRoYR-2qjqESJ93FPmdIR4AVwCIFzBOqWNKI/export?format=csv&gid=0",
          doctor: "Dr. Manoel",
          type: "rafael" // Reusing Rafael's parser since it looks for headers
        },
        {
          url: "https://docs.google.com/spreadsheets/d/15pieYLg5y6_AYHIKmrDobmH7oS18iRF7ydLy8RNkbuU/export?format=csv&gid=0",
          doctor: "Dra. Mara",
          type: "rafael" // Reusing Rafael's parser since it looks for headers
        },
        {
          url: "https://docs.google.com/spreadsheets/d/11cZSuPAM0THHI3NjDROVo_y_kr8WAUWVf-5JYShW0Rw/export?format=csv&gid=0",
          doctor: "Dr. Gilmar",
          type: "rafael" // Reusing Rafael's parser since it looks for headers
        }
      ];

      console.log("Starting sync...");
      let totalAdded = 0;
      let totalUpdated = 0;
      let syncLogs: string[] = [];

      for (const sheet of sheets) {
        syncLogs.push(`Fetching sheet for ${sheet.doctor}...`);
        const response = await fetch(sheet.url);
        if (!response.ok) {
          syncLogs.push(`Failed to fetch ${sheet.url}: ${response.statusText}`);
          continue;
        }
        
        syncLogs.push(`Fetched ${sheet.doctor}, parsing CSV...`);
        const csvText = await response.text();
        
        if (csvText.trim().startsWith("<!DOCTYPE html>") || csvText.includes("<html")) {
          return res.status(403).json({ 
            error: "Acesso negado às planilhas. Por favor, certifique-se de que as planilhas do Google estão configuradas como 'Qualquer pessoa com o link pode ver' (Público)." 
          });
        }

        const parsed = Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
        });

        const rows = parsed.data as string[][];

        if (sheet.type === "rafael") {
          // Find header row
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(20, rows.length); i++) {
            const rowStr = rows[i].join("").toLowerCase().replace(/\s+/g, '');
            if (rowStr.includes("paciente") && (rowStr.includes("sus") || rowStr.includes("cns"))) {
              headerRowIndex = i;
              break;
            }
          }

          if (headerRowIndex !== -1) {
            const headers = rows[headerRowIndex].map(h => h.toLowerCase().trim().replace(/\s+/g, ''));
            const nameIdx = headers.findIndex(h => h.includes('paciente') || h.includes('nome') || h.includes('operados'));
            const susIdx = headers.findIndex(h => h.includes('sus') || h.includes('cns'));
            const diagIdx = headers.findIndex(h => h.includes('patologia') || h.includes('diagn'));
            const surgIdx = headers.findIndex(h => h.includes('proposta') || h.includes('cirurgia'));
            const birthIdx = headers.findIndex(h => h.includes('nascimento') || h === 'dn');
            const riskIdx = headers.findIndex(h => h.includes('pendência') || h.includes('risco') || h.includes('lab/exam') || h.includes('conduta'));
            const phoneIdx = headers.findIndex(h => h.includes('contato') || h.includes('telefone'));

            syncLogs.push(`Found headers at row ${headerRowIndex}. nameIdx: ${nameIdx}, susIdx: ${susIdx}, diagIdx: ${diagIdx}, surgIdx: ${surgIdx}, birthIdx: ${birthIdx}, riskIdx: ${riskIdx}, phoneIdx: ${phoneIdx}`);
            for (let i = headerRowIndex + 1; i < rows.length; i++) {
              const row = rows[i];
              const rawName = nameIdx >= 0 ? row[nameIdx] : '';
              const rawSus = susIdx >= 0 ? row[susIdx] : '';
              
              const name = cleanWords(rawName);
              const sus_card = cleanSusCard(rawSus, row) || `SEM_SUS_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
              
              if (!name || name.toLowerCase() === 'paciente') continue;

              const diagnosis = cleanWords(diagIdx >= 0 ? row[diagIdx] : '');
              const surgery_type = cleanWords(surgIdx >= 0 ? row[surgIdx] : '');
              const birth_date = cleanDate(birthIdx >= 0 ? row[birthIdx] : '', row);
              const risk_status = cleanWords(riskIdx >= 0 ? row[riskIdx] : '') || 'Aguardando';
              const phone = cleanPhone(phoneIdx >= 0 ? row[phoneIdx] : '', row);
              
              // Skip rows that are likely section headers (only name is present, and it's often uppercase)
              if (!rawSus && !diagnosis && !surgery_type && !birth_date && !phone && (!risk_status || risk_status.toLowerCase() === 'aguardando')) {
                syncLogs.push(`Skipping likely section header: ${name}`);
                continue;
              }

              syncLogs.push(`Processing patient: ${name} for ${sheet.doctor}`);
              processPatient(name, sus_card, diagnosis, surgery_type, risk_status, birth_date, phone, sheet.doctor);
            }
          } else {
            syncLogs.push(`Could not find header row for ${sheet.doctor}`);
          }
        } else if (sheet.type === "bianca") {
          // Bianca's sheet has no headers, fixed columns
          for (const row of rows) {
            if (row.length < 9) continue;
            
            const rawName = row[3];
            const rawSus = row[8];
            
            const name = cleanWords(rawName);
            const sus_card = cleanSusCard(rawSus, row) || `SEM_SUS_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            
            if (!name || name.toLowerCase().includes('paciente')) continue;

            const birth_date = cleanDate(row[4], row);
            const diagnosis = cleanWords(row[5]);
            const surgery_type = cleanWords(row[6]) || cleanWords(row[5]);
            const phone = cleanPhone(row[9], row);
            const risk_status = cleanWords(row[0]) || 'Aguardando';

            processPatient(name, sus_card, diagnosis, surgery_type, risk_status, birth_date, phone, sheet.doctor);
          }
        }
      }

      function processPatient(name: string, sus_card: string, diagnosis: string, surgery_type: string, risk_status: string, birth_date: string, phone: string, doctor: string) {
        // Calculate age
        let finalAge = 0;
        if (birth_date) {
          const parts = birth_date.split('/');
          if (parts.length === 3) {
            const birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            if (!isNaN(birthDate.getTime())) {
              const today = new Date();
              let calculatedAge = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
              }
              finalAge = calculatedAge;
            }
          }
        }

        const category = 'PENDENCIA';
        const combinedText = `${diagnosis || ""} ${surgery_type || ""}`.trim();
        const cid_code = findBestCID(combinedText);
        const procedure_code = findBestProcedure(surgery_type || "").code;
        
        // Find existing by name or sus_card (only if sus_card is not a placeholder)
        let existing: { id: number, sus_card: string } | undefined;
        
        let finalSusCard = sus_card;
        
        if (finalSusCard.startsWith('SEM_SUS_')) {
          existing = db.prepare("SELECT id, sus_card FROM patients WHERE name = ?").get(name) as { id: number, sus_card: string } | undefined;
          if (existing) {
            // Reuse the existing placeholder or real sus_card so it doesn't keep changing
            finalSusCard = existing.sus_card;
          }
        } else {
          existing = db.prepare("SELECT id, sus_card FROM patients WHERE sus_card = ? OR name = ?").get(finalSusCard, name) as { id: number, sus_card: string } | undefined;
        }

        if (existing) {
          db.prepare(`
            UPDATE patients 
            SET name = ?, sus_card = ?, diagnosis = ?, surgery_type = ?, risk_status = ?, age = ?, birth_date = ?, phone = ?, doctor = ?, cid_code = ?, procedure_code = ?
            WHERE id = ?
          `).run(name, finalSusCard, diagnosis, surgery_type, risk_status, finalAge, birth_date, phone, doctor, cid_code, procedure_code, existing.id);
          totalUpdated++;
        } else {
          db.prepare(`
            INSERT INTO patients (name, sus_card, diagnosis, surgery_type, risk_status, age, birth_date, phone, cid_code, procedure_code, category, doctor)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(name, finalSusCard, diagnosis, surgery_type, risk_status, finalAge, birth_date, phone, cid_code, procedure_code, category, doctor);
          totalAdded++;
        }
      }

      console.log(`Sync complete. Added: ${totalAdded}, Updated: ${totalUpdated}`);
      res.json({ success: true, added: totalAdded, updated: totalUpdated, logs: syncLogs });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ error: "Erro ao sincronizar planilhas" });
    }
  });

  app.post("/api/patients", (req, res) => {
    const { name, sus_card, diagnosis, surgery_type, risk_status, age, birth_date, phone, cid_code, procedure_code, category, doctor } = req.body;
    
    if (!name || !sus_card) {
      return res.status(400).json({ error: "Nome e Cartão SUS são obrigatórios" });
    }

    let finalAge = age || 0;
    if (!finalAge && birth_date) {
      // Calculate age from birth_date (DD/MM/YYYY)
      const parts = birth_date.split('/');
      if (parts.length === 3) {
        const birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        finalAge = calculatedAge;
      }
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO patients (name, sus_card, diagnosis, surgery_type, risk_status, age, birth_date, phone, cid_code, procedure_code, category, doctor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(name, sus_card, diagnosis || "", surgery_type || "", risk_status || "Aguardando", finalAge, birth_date || null, phone || "", cid_code || "", procedure_code || "", category || "PENDENCIA", doctor || "");
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Erro ao adicionar paciente" });
    }
  });

  app.post("/api/whatsapp/send", (req, res) => {
    const { patientId, template } = req.body;
    // Simulate Meta API call
    console.log(`Enviando WhatsApp para paciente ${patientId} usando template ${template}`);
    
    // Update status
    const stmt = db.prepare(`UPDATE patients SET whatsapp_sent = 1 WHERE id = ?`);
    stmt.run(patientId);
    
    res.json({ success: true, message: "WhatsApp enviado com sucesso (Simulação)" });
  });

  app.post("/api/patients/:id/exams", (req, res) => {
    const { id } = req.params;
    const { exam_pathology, exam_imaging, exam_others } = req.body;
    try {
      const stmt = db.prepare(`
        UPDATE patients 
        SET exam_pathology = ?, exam_imaging = ?, exam_others = ?
        WHERE id = ?
      `);
      stmt.run(exam_pathology || '', exam_imaging || '', exam_others || '', id);
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao salvar exames:", error);
      res.status(500).json({ error: "Erro ao salvar exames" });
    }
  });

  app.post("/api/generate-surgery-notice", async (req, res) => {
    const { patient } = req.body;
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const filePath = path.join(publicDir, 'CIRMARC.docx');
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Modelo CIRMARC.docx não encontrado na pasta public." });
      }

      const parsed = await parseOffice(filePath);
      let text = parsed.toText();

      // Simple regex replacement for speed and reliability, discarding AI for this feature
      text = text.replace(/Nome[:\s]+_{3,}/i, `Nome: ${patient.name} `);
      text = text.replace(/Idade[:\s]+_{3,}/i, `Idade: ${patient.age} `);
      text = text.replace(/Cirurgia[:\s]+_{3,}/i, `Cirurgia: ${patient.surgery_type} `);
      text = text.replace(/Telefone[:\s]+_{3,}/i, `Telefone: ${patient.phone} `);
      text = text.replace(/Cartão SUS[:\s]+_{3,}/i, `Cartão SUS: ${patient.sus_card} `);
      text = text.replace(/Diagnóstico[:\s]+_{3,}/i, `Diagnóstico: ${patient.diagnosis} `);

      res.json({ text });
    } catch (error: any) {
      console.error("Erro ao gerar aviso de cirurgia:", error);
      res.status(500).json({ error: error.message || "Erro ao gerar aviso de cirurgia." });
    }
  });

  app.post("/api/scan-prontuario", async (req, res) => {
    const { parts } = req.body;
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "A chave da API do Gemini não está configurada." });
    }
    apiKey = apiKey.replace(/^["']|["']$/g, '').trim();

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              sus_card: { type: Type.STRING },
              diagnosis: { type: Type.STRING },
              surgery_type: { type: Type.STRING },
              age: { type: Type.INTEGER },
              birth_date: { type: Type.STRING },
              phone: { type: Type.STRING },
              doctor: { type: Type.STRING },
              risk_status: { type: Type.STRING },
              whatsapp_sent: { type: Type.INTEGER },
              aih_generated: { type: Type.INTEGER },
              aih_nir: { type: Type.INTEGER },
              uti_vacancy: { type: Type.INTEGER },
              scheduled_cc: { type: Type.INTEGER },
              exam_pathology: { type: Type.STRING },
              exam_imaging: { type: Type.STRING },
              exam_others: { type: Type.STRING },
            },
          },
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Erro ao escanear prontuário:", error);
      if (error.message?.includes("API key not valid")) {
        return res.status(500).json({ error: "A chave da API do Gemini é inválida. Por favor, verifique sua GEMINI_API_KEY nas configurações do projeto." });
      }
      res.status(500).json({ error: "Erro ao processar as imagens." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
