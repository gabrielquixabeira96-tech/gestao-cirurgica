# Código para Google Apps Script (GAS) — Sincronização com GQB OS

**GAS URL:** `https://script.google.com/macros/s/AKfycbxDwmfNbBHP0U1_Qrb_--qOJegUNoOmkvLi29Stbnl9GDcZyWwZu4h2k3YCIDy-jj6M/exec`
**Planilha:** `https://docs.google.com/spreadsheets/d/1kpSib49Fpm8wjkA5AXurdQE3Dp5aFrfyr86G3jVg5Y8/edit`

---

## Código.gs — Cole no Google Apps Script

```javascript
/**
 * GQB OS — Google Apps Script Backend
 * Sincronização bidirecional com Google Sheets
 *
 * IMPLANTAÇÃO:
 *   Implantar > Nova implantação > App da Web
 *   Executar como: Eu mesmo
 *   Quem tem acesso: Qualquer pessoa
 */

const SHEET_NAME = 'Pacientes';

// Ordem das colunas — DEVE ser igual à constante SHEET_HEADERS em sheetsSync.ts
const COLUMNS = [
  'id','name','sus_card','diagnosis','surgery_type','risk_status','age','birth_date',
  'phone','cid_code','procedure_code','category','doctor','evolution',
  'whatsapp_sent','aih_generated','aih_nir','uti_vacancy','scheduled_cc',
  'exam_pathology','exam_imaging','exam_others',
  'data_internacao','data_cirurgia','horario_cirurgia','updatedAt'
];

// ─── Response helper ─────────────────────────────────────────────────────────
function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── GET handler (usado para leitura - evita CORS preflight) ─────────────────
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) ? e.parameter.action : 'getPatients';
    if (action === 'getPatients') {
      return buildResponse(getPatients());
    }
    return buildResponse({ ok: false, error: 'Ação GET desconhecida: ' + action });
  } catch (err) {
    return buildResponse({ ok: false, error: String(err) });
  }
}

// ─── POST handler (usado para escrita) ───────────────────────────────────────
function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : '{}';
    var body = JSON.parse(raw);
    var action = body.action || 'unknown';

    if (action === 'getPatients')   return buildResponse(getPatients());
    if (action === 'syncPatients')  return buildResponse(syncPatients(body.rows, body.headers));

    return buildResponse({ ok: false, error: 'Ação desconhecida: ' + action });
  } catch (err) {
    return buildResponse({ ok: false, error: String(err) });
  }
}

// ─── Read all patients ────────────────────────────────────────────────────────
function getPatients() {
  try {
    var sheet = getOrCreateSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { ok: true, patients: [] };

    var numCols = COLUMNS.length;
    var data = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
    // Filter out completely empty rows (id must be non-empty)
    var patients = data.filter(function(row) {
      return row[0] !== '' && row[0] !== 0 && row[0] !== null;
    });
    return { ok: true, patients: patients };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ─── Full replace sync ────────────────────────────────────────────────────────
function syncPatients(rows, headers) {
  try {
    if (!rows || !Array.isArray(rows)) {
      return { ok: false, error: 'rows inválido' };
    }

    var sheet = getOrCreateSheet();

    // Clear existing data (keep header row)
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, COLUMNS.length).clearContent();
    }

    if (rows.length === 0) return { ok: true, synced: 0 };

    // Write all rows
    sheet.getRange(2, 1, rows.length, COLUMNS.length).setValues(rows);

    return { ok: true, synced: rows.length };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ─── Ensure sheet exists with header row ─────────────────────────────────────
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Ensure header row exists
  var firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell !== 'id' && firstCell !== 'ID') {
    var headers = COLUMNS.map(function(c) { return c.toUpperCase(); });
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#004b87');
    headerRange.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  return sheet;
}
```

---

## Tabela de Colunas

| Col | Campo | Tipo |
|-----|-------|------|
| A | id | Número |
| B | name | Texto |
| C | sus_card | Texto |
| D | diagnosis | Texto |
| E | surgery_type | Texto |
| F | risk_status | Texto |
| G | age | Número |
| H | birth_date | Texto |
| I | phone | Texto |
| J | cid_code | Texto |
| K | procedure_code | Texto |
| L | category | Texto |
| M | doctor | Texto |
| N | evolution | Texto |
| O | whatsapp_sent | 0/1 |
| P | aih_generated | 0/1 |
| Q | aih_nir | 0/1 |
| R | uti_vacancy | 0/1 |
| S | scheduled_cc | 0/1 |
| T | exam_pathology | Texto |
| U | exam_imaging | Texto |
| V | exam_others | Texto |
| W | data_internacao | Texto |
| X | data_cirurgia | Texto |
| Y | horario_cirurgia | Texto |
| Z | updatedAt | Timestamp |

---

## Instruções de Reimplantação

> ⚠️ Se você modificar o código GAS, é necessário criar uma **nova implantação** para as mudanças terem efeito.
> As implantações antigas continuam funcionando com o código anterior.

1. Apps Script → **Implantar → Gerenciar implantações**
2. Clique no ✏️ (editar) da implantação existente
3. Em "Versão", selecione **"Nova versão"**
4. Clique em **Implantar**
5. A URL permanece a mesma ✅
