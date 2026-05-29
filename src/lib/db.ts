import { openDB, IDBPDatabase } from 'idb';
import { Patient } from '../types';
import { findBestCID } from '../cid10';
import { findBestProcedure } from '../procedures';
import { cleanWords, cleanSusCard, cleanDate, cleanPhone } from '../dataCleaner';

const DB_NAME = 'cirurgia-notebook-db';
const STORE_NAME = 'patients';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase> | null = null;

const SEED_PATIENTS: Omit<Patient, 'id'>[] = [
  { name: 'Sandra Silva de Jesus', sus_card: '706306763443375', diagnosis: 'Lobectomia inferior esquerda', surgery_type: 'Lobectomia', risk_status: 'Risco ok', age: 54, phone: '66996813201', cid_code: 'C34', category: 'AGENDADA', whatsapp_sent: 0, aih_generated: 0, aih_nir: 0, uti_vacancy: 0, scheduled_cc: 0, doctor: 'Dr. Gilmar' },
  { name: 'Maria José da Silva Santos', sus_card: '705004242870650', diagnosis: 'Câncer de ovário', surgery_type: 'Cirurgia citoredutora', risk_status: 'Risco + Lab ok', age: 62, phone: '82999224210', cid_code: 'C56', category: 'PRIORITARIA', whatsapp_sent: 0, aih_generated: 0, aih_nir: 0, uti_vacancy: 0, scheduled_cc: 0, doctor: '' },
  { name: 'Rosely Chagas Daniel da Silva', sus_card: '700003983010509', diagnosis: 'Lesão anexial direita (CA125 elevado)', surgery_type: 'Ooforectomia com congelação', risk_status: 'Risco ok', age: 48, phone: '66984437128', cid_code: 'C56', category: 'PRIORITARIA', whatsapp_sent: 0, aih_generated: 0, aih_nir: 0, uti_vacancy: 0, scheduled_cc: 0, doctor: 'Dr. Gilmar' },
  { name: 'Ana Rosa de Faria', sus_card: '704102138932377', diagnosis: 'Cicatriz frontoparietal D', surgery_type: 'Ampliação de margens', risk_status: 'Aguarda procedimento', age: 59, phone: '65996987586', cid_code: 'C44.3', category: 'PENDENCIA', whatsapp_sent: 0, aih_generated: 0, aih_nir: 0, uti_vacancy: 0, scheduled_cc: 0, doctor: '' },
  { name: 'Maria Ercy de Souza e Silva', sus_card: '700509323718459', diagnosis: 'CEC de lesão em asa nasal direita', surgery_type: 'Exérese de lesão com retalho', risk_status: 'Aguarda Lab + risco', age: 65, phone: '65999545843', cid_code: 'C44.3', category: 'PENDENCIA', whatsapp_sent: 0, aih_generated: 0, aih_nir: 0, uti_vacancy: 0, scheduled_cc: 0, doctor: '' },
  { name: 'Tatiane Maria da Silva', sus_card: '705809445589538', diagnosis: 'CA de mama / espessamento endometrial', surgery_type: 'Histerectomia total', risk_status: 'Risco ok', age: 45, phone: '65992561653', cid_code: 'C50', category: 'PRONTO', whatsapp_sent: 0, aih_generated: 0, aih_nir: 0, uti_vacancy: 0, scheduled_cc: 0, doctor: '' },
];

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      },
      blocked() {
        console.warn('IDB blocked');
      },
      blocking() {
        console.warn('IDB blocking, closing connection to allow upgrade');
        if (dbPromise) {
          dbPromise.then(db => db.close());
          dbPromise = null;
        }
      },
      terminated() {
        console.warn('IDB terminated');
        dbPromise = null;
      }
    });
  }
  
  // Extra safety check in case the connection is in a closed state but dbPromise isn't null
  const db = await dbPromise;
  try {
    // A quick check to see if the connection is alive
    db.transaction(STORE_NAME, 'readonly').abort();
  } catch (err: any) {
    if (err.name === 'InvalidStateError' || err.message.includes('closing')) {
      console.warn('IDB connection closed, reopening...');
      dbPromise = null;
      return getDB();
    }
  }

  return db;
};

// ─── Seed if empty ────────────────────────────────────────────────────────────
export const seedIfEmpty = async (): Promise<void> => {
  const db = await getDB();
  const count = await db.count(STORE_NAME);
  if (count > 0) return;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const p of SEED_PATIENTS) {
    await tx.store.add(p);
  }
  await tx.done;
};

// ─── Basic CRUD ───────────────────────────────────────────────────────────────
export const getAllPatients = async (): Promise<Patient[]> => {
  const db = await getDB();
  return db.getAll(STORE_NAME);
};

export const addPatient = async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
  const db = await getDB();
  const withTs = { ...patient, updatedAt: Date.now() };
  const id = await db.add(STORE_NAME, withTs) as number;
  return { ...withTs, id };
};

export const updatePatient = async (id: number, updates: Partial<Patient>): Promise<Patient> => {
  const db = await getDB();
  const existing = await db.get(STORE_NAME, id) as Patient;
  if (!existing) throw new Error(`Patient ${id} not found`);
  const updated = { ...existing, ...updates, id, updatedAt: Date.now() };
  await db.put(STORE_NAME, updated);
  return updated;
};

export const deletePatient = async (id: number): Promise<void> => {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
};

export const getPatient = async (id: number): Promise<Patient | undefined> => {
  const db = await getDB();
  return db.get(STORE_NAME, id);
};

// ─── Status toggle ────────────────────────────────────────────────────────────
export const updatePatientStatus = async (id: number, field: string, value: number): Promise<void> => {
  const allowedFields = ['whatsapp_sent', 'aih_generated', 'aih_nir', 'uti_vacancy', 'scheduled_cc'];
  if (!allowedFields.includes(field)) throw new Error('Campo inválido');
  await updatePatient(id, { [field]: value } as Partial<Patient>);
};

// ─── Offline-first helpers (kept for compat) ──────────────────────────────────
export const savePatientsToLocal = async (patients: Patient[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.clear();
  for (const p of patients) await tx.store.put(p);
  await tx.done;
};

export const getPatientsFromLocal = getAllPatients;

export const savePatientToLocal = async (patient: Patient): Promise<void> => {
  const db = await getDB();
  await db.put(STORE_NAME, patient);
};

export const deletePatientFromLocal = deletePatient;

// ─── Import from pasted text (tab-separated) ─────────────────────────────────
export const importPatientsFromText = async (text: string, defaultDoctor?: string): Promise<number> => {
  const rows = text.split('\n');
  let added = 0;
  for (const row of rows) {
    if (!row.trim()) continue;
    const cols = row.split('\t');
    if (cols.length < 2) continue;
    const name = cleanWords(cols[0]);
    const sus_card = cleanSusCard(cols[1], cols);
    if (!name || !sus_card) continue;
    const diagnosis = cleanWords(cols[2] ?? '');
    const surgery_type = cleanWords(cols[3] ?? '');
    const birth_date = cleanDate(cols[4] ?? '', cols);
    const risk_status = cleanWords(cols[5] ?? '') || 'Aguardando';
    const phone = cleanPhone(cols[6] ?? '', cols);
    const combinedText = `${diagnosis} ${surgery_type}`.trim();
    const cid_code = findBestCID(combinedText);
    const procedure_code = findBestProcedure(surgery_type).code;
    await addPatient({
      name, sus_card, diagnosis, surgery_type, birth_date, risk_status, phone,
      cid_code, procedure_code, category: 'PENDENCIA', age: 0,
      doctor: defaultDoctor ?? '',
      whatsapp_sent: 0, aih_generated: 0, aih_nir: 0, uti_vacancy: 0, scheduled_cc: 0,
    });
    added++;
  }
  return added;
};
