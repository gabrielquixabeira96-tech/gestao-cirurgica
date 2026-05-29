/**
 * sheetsSync.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Bidirectional sync between IndexedDB (local) and a Google Apps Script Web
 * App that acts as a proxy to Google Sheets.
 *
 * GAS URL: https://script.google.com/macros/s/AKfycbxDwmfNbBHP0U1_Qrb_--qOJegUNoOmkvLi29Stbnl9GDcZyWwZu4h2k3YCIDy-jj6M/exec
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1kpSib49Fpm8wjkA5AXurdQE3Dp5aFrfyr86G3jVg5Y8/edit
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Patient } from '../types';
import { getAllPatients, savePatientsToLocal } from './db';

const GAS_URL_KEY = 'gqb_gas_url';
const LAST_SYNC_KEY = 'gqb_last_sync';

// Use env var as built-in default (set via VITE_GAS_URL in .env.local)
const DEFAULT_GAS_URL: string = (import.meta as any).env?.VITE_GAS_URL ?? '';

export const getGasUrl = (): string =>
  localStorage.getItem(GAS_URL_KEY) || DEFAULT_GAS_URL;

export const setGasUrl = (url: string): void =>
  localStorage.setItem(GAS_URL_KEY, url.trim());

export const getLastSync = (): string => {
  const ts = localStorage.getItem(LAST_SYNC_KEY);
  if (!ts) return 'Nunca';
  return new Date(Number(ts)).toLocaleString('pt-BR');
};

/** Column order in the Google Sheet */
export const SHEET_HEADERS = [
  'id','name','sus_card','diagnosis','surgery_type','risk_status','age','birth_date',
  'phone','cid_code','procedure_code','category','doctor','evolution',
  'whatsapp_sent','aih_generated','aih_nir','uti_vacancy','scheduled_cc',
  'exam_pathology','exam_imaging','exam_others',
  'data_internacao','data_cirurgia','horario_cirurgia','updatedAt',
];

/** Serialize a Patient to a flat row array */
const toRow = (p: Patient): (string | number)[] =>
  SHEET_HEADERS.map(k => {
    const val = (p as any)[k];
    return val !== undefined && val !== null ? val : '';
  });

/** Deserialize a flat row array back to Patient */
const fromRow = (row: (string | number)[]): Patient => {
  const obj: any = {};
  SHEET_HEADERS.forEach((k, i) => {
    const val = row[i];
    if (
      k === 'id' || k === 'age' || k === 'updatedAt' ||
      ['whatsapp_sent','aih_generated','aih_nir','uti_vacancy','scheduled_cc'].includes(k)
    ) {
      obj[k] = val === '' || val === undefined ? 0 : Number(val);
    } else {
      obj[k] = val ?? '';
    }
  });
  return obj as Patient;
};

interface GasResponse {
  ok: boolean;
  patients?: (string | number)[][];
  error?: string;
  synced?: number;
}

/**
 * Call the Google Apps Script Web App.
 *
 * GAS CORS notes:
 * - GAS supports CORS on GET requests automatically.
 * - For POST, using Content-Type: text/plain avoids the CORS preflight.
 * - redirect: 'follow' is required because GAS redirects to the actual executor URL.
 */
const callGas = async (action: string, payload?: object): Promise<GasResponse> => {
  const url = getGasUrl();
  if (!url) {
    throw new Error('URL do Google Apps Script não configurada. Clique em ⚙ para configurar.');
  }

  // For read-only actions use GET (simpler CORS), for writes use POST
  if (action === 'getPatients') {
    const res = await fetch(`${url}?action=getPatients`, {
      method: 'GET',
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json() as Promise<GasResponse>;
  }

  // POST with text/plain to bypass CORS preflight
  const res = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  });

  const text = await res.text();
  
  if (text.trim().toLowerCase().startsWith('<!doctype html>')) {
    throw new Error('Erro de Permissão: A URL configurada exige login. Reimplante o Apps Script com "Quem tem acesso: Qualquer pessoa".');
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  
  try {
    return JSON.parse(text) as GasResponse;
  } catch (err) {
    throw new Error('Erro ao processar resposta do servidor. Verifique a URL do Apps Script.');
  }
};

/** Generate a stable numeric ID from a string (for patients without ID) */
const generateHashId = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) + 1000000; // Offset to avoid colliding with small IDs
};

/** Pull all patients from Google Sheets */
export const pullFromSheets = async (): Promise<Patient[]> => {
  const result = await callGas('getPatients');
  if (!result.ok) throw new Error(result.error ?? 'Erro ao buscar dados da planilha');
  
  const rawRows = result.patients ?? [];
  const parsedPatients: Patient[] = [];
  
  let isAlternateFormat = false;

  for (const row of rawRows) {
    const col0Str = String(row[0] || '').trim().toUpperCase();
    const col1Str = String(row[1] || '').trim().toUpperCase();
    
    // Detect alternate header row
    if (col0Str.includes('DATA DA CONSULTA') && col1Str.includes('PACIENTE')) {
      isAlternateFormat = true;
      continue;
    }

    if (isAlternateFormat) {
      const name = String(row[1] || '').trim();
      if (!name) continue;
      
      const p: any = {
        id: generateHashId(name),
        name,
        sus_card: String(row[7] || '').trim(),
        diagnosis: String(row[5] || '').trim(),
        surgery_type: String(row[3] || '').trim(),
        age: Number(row[4]) || 0,
        phone: String(row[10] || '').trim(),
        birth_date: String(row[9] || '').trim(),
        risk_status: String(row[2] || '').trim() || 'Aguardando',
        category: 'PENDENCIA',
        doctor: '',
        whatsapp_sent: 0, aih_generated: 0, aih_nir: 0, uti_vacancy: 0, scheduled_cc: 0,
        updatedAt: Date.now()
      };
      parsedPatients.push(p as Patient);
    } else {
      const p = fromRow(row);
      // Valid rows must have an ID
      if (p.id > 0) {
        parsedPatients.push(p);
      }
    }
  }

  return parsedPatients;
};

/** Push all patients to Google Sheets (full replace) */
export const pushToSheets = async (patients: Patient[]): Promise<void> => {
  const rows = patients.map(toRow);
  const result = await callGas('syncPatients', { headers: SHEET_HEADERS, rows });
  if (!result.ok) throw new Error(result.error ?? 'Erro ao gravar dados na planilha');
};

/**
 * One-way import:
 * 1. Pull remote records
 * 2. If a remote record doesn't exist locally, add it
 * 3. Save merged set locally (does NOT push to Sheets)
 */
export const syncAll = async (): Promise<{ added: number; updated: number; total: number }> => {
  const [local, remote] = await Promise.all([getAllPatients(), pullFromSheets()]);

  const mergedMap = new Map<number, Patient>();
  for (const p of local) mergedMap.set(p.id, p);

  let added = 0;
  let updated = 0; // Keeping for return type compatibility

  for (const rp of remote) {
    const lp = mergedMap.get(rp.id);
    if (!lp) {
      mergedMap.set(rp.id, rp);
      added++;
    }
    // We intentionally DO NOT update existing patients or push changes back
  }

  const merged = Array.from(mergedMap.values())
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

  await savePatientsToLocal(merged);
  
  // pushToSheets(merged) was removed per user request to not alter spreadsheets

  localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
  return { added, updated, total: merged.length };
};
