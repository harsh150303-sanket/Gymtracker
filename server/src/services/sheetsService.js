import { google } from 'googleapis';
import { config, SHEET_HEADERS, SHEET_NAME } from '../config.js';

function parseServiceAccount() {
  if (!config.googleServiceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is required.');
  }

  try {
    return JSON.parse(config.googleServiceAccountJson);
  } catch {
    // Support base64-encoded JSON secrets for deployment platforms.
    const decoded = Buffer.from(config.googleServiceAccountJson, 'base64').toString('utf8');
    return JSON.parse(decoded);
  }
}

function getSheetsApi() {
  const credentials = parseServiceAccount();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return google.sheets({ version: 'v4', auth });
}

export async function ensureSheetHeaders() {
  const sheets = getSheetsApi();
  const spreadsheetId = config.googleSheetId;

  const read = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A1:I1`
  }).catch(() => ({ data: { values: [] } }));

  const row = read?.data?.values?.[0] || [];
  const needsUpdate = SHEET_HEADERS.some((header, idx) => row[idx] !== header);

  if (needsUpdate) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_NAME}!A1:I1`,
      valueInputOption: 'RAW',
      requestBody: { values: [SHEET_HEADERS] }
    });
  }
}

export async function appendLog(entry) {
  const sheets = getSheetsApi();
  const spreadsheetId = config.googleSheetId;

  await ensureSheetHeaders();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:I`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        entry.date,
        entry.workout,
        JSON.stringify(entry.exercises),
        entry.protein,
        entry.whey ? 'Yes' : 'No',
        entry.diet ? 'Yes' : 'No',
        entry.pushupsDone ? `Yes (${entry.pushupsReps})` : 'No',
        entry.cardioDone ? `Yes (${entry.cardioMinutes} min)` : 'No',
        entry.notes || ''
      ]]
    }
  });
}

function parseBoolOrValue(text) {
  const normalized = String(text || '').toLowerCase();
  if (normalized.startsWith('yes')) return true;
  return false;
}

function parseNumberInParens(text) {
  const match = String(text || '').match(/\((\d+)/);
  return match ? Number(match[1]) : 0;
}

export async function getLogs() {
  const sheets = getSheetsApi();
  const spreadsheetId = config.googleSheetId;
  await ensureSheetHeaders();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A2:I`
  });

  const rows = response?.data?.values || [];

  return rows.map((row, index) => ({
    rowNumber: index + 2,
    date: row[0] || '',
    workout: row[1] || '',
    exercises: row[2] ? JSON.parse(row[2]) : [],
    protein: Number(row[3] || 0),
    whey: parseBoolOrValue(row[4]),
    diet: parseBoolOrValue(row[5]),
    pushupsDone: parseBoolOrValue(row[6]),
    pushupsReps: parseNumberInParens(row[6]),
    cardioDone: parseBoolOrValue(row[7]),
    cardioMinutes: parseNumberInParens(row[7]),
    notes: row[8] || ''
  }));
}

export async function updateLog(rowNumber, entry) {
  const sheets = getSheetsApi();
  const spreadsheetId = config.googleSheetId;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAME}!A${rowNumber}:I${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        entry.date,
        entry.workout,
        JSON.stringify(entry.exercises),
        entry.protein,
        entry.whey ? 'Yes' : 'No',
        entry.diet ? 'Yes' : 'No',
        entry.pushupsDone ? `Yes (${entry.pushupsReps})` : 'No',
        entry.cardioDone ? `Yes (${entry.cardioMinutes} min)` : 'No',
        entry.notes || ''
      ]]
    }
  });
}

export async function deleteLog(rowNumber) {
  const sheets = getSheetsApi();
  const spreadsheetId = config.googleSheetId;

  // Clear row values instead of deleting the row index to keep API simpler.
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${SHEET_NAME}!A${rowNumber}:I${rowNumber}`
  });
}
