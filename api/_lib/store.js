// Penyimpanan soal & hasil kuis. Produksi: Google Sheets lewat service account (env GOOGLE_*).
// Tanpa env (pengembangan lokal): file .data/db.json. Soal awal diisi otomatis bila tab Soal masih kosong.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { SOAL_AWAL } from './soal-awal.js';

const KOLOM_SOAL = ['id', 'bab', 'pertanyaan', 'a', 'b', 'c', 'd', 'jawaban', 'pembahasan', 'aktif', 'diubah'];
const HEADER_SOAL = ['ID', 'Bab', 'Pertanyaan', 'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Jawaban', 'Pembahasan', 'Aktif', 'Diubah'];
const HEADER_HASIL = ['Waktu', 'Nama', 'Kelas/Rombel', 'Bab', 'Judul Bab', 'Benar', 'Jumlah Soal', 'Nilai', 'Rincian'];

export const idBaru = () => 's' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
const keBaris = s => KOLOM_SOAL.map(k => k === 'aktif' ? (s.aktif === false ? 'TIDAK' : 'YA') : String(s[k] ?? ''));
const dariBaris = r => Object.fromEntries(KOLOM_SOAL.map((k, i) => [k, k === 'aktif' ? String(r[i] ?? 'YA').toUpperCase() !== 'TIDAK' : String(r[i] ?? '')]));
const benih = () => SOAL_AWAL.map((s, i) => ({ ...s, id: s.id || `awal-${s.bab}-${i}`, aktif: true, diubah: '' }));

/* ---------------- Google Sheets ---------------- */
const env = process.env;
const pakaiSheets = () => Boolean(env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY && env.SHEET_ID);
let token = { nilai: '', habis: 0 };

async function aksesToken() {
  if (token.nilai && Date.now() < token.habis - 60_000) return token.nilai;
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const isi = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  // kunci dari pengaturan Vercel biasanya menyimpan baris baru sebagai "\n" literal
  const ttd = crypto.createSign('RSA-SHA256').update(isi).sign(env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${isi}.${ttd}` }) });
  const j = await r.json();
  if (!r.ok) throw new Error('Gagal login service account Google: ' + (j.error_description || j.error));
  token = { nilai: j.access_token, habis: Date.now() + j.expires_in * 1000 };
  return token.nilai;
}

async function api(jalur, opsi = {}) {
  const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}${jalur}`, {
    ...opsi, headers: { Authorization: `Bearer ${await aksesToken()}`, 'Content-Type': 'application/json' } });
  const j = await r.json();
  if (!r.ok) throw new Error(`Google Sheets ${r.status}: ${j.error?.message || 'galat'}`);
  return j;
}
const nilai = (range, rows, cara = 'PUT') => cara === 'PUT'
  ? api(`/values/${encodeURIComponent(range)}?valueInputOption=RAW`, { method: 'PUT', body: JSON.stringify({ values: rows }) })
  : api(`/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: 'POST', body: JSON.stringify({ values: rows }) });

let tabSiap = false;
async function siapkanTab() {
  if (tabSiap) return;
  const meta = await api('?fields=sheets.properties');
  const ada = meta.sheets.map(s => s.properties.title);
  const baru = ['Soal', 'Hasil'].filter(t => !ada.includes(t));
  if (baru.length) await api(':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: baru.map(title => ({ addSheet: { properties: { title, gridProperties: { frozenRowCount: 1 } } } })) }) });
  if (baru.includes('Hasil')) await nilai('Hasil!A1:I1', [HEADER_HASIL]);
  if (baru.includes('Soal')) await nilai('Soal!A1:K1', [HEADER_SOAL]);
  tabSiap = true;
}

const sheets = {
  async semua() {
    await siapkanTab();
    const rows = (await api(`/values/${encodeURIComponent('Soal!A2:K')}`)).values || [];
    if (rows.length) return rows.filter(r => r[0]).map(dariBaris);
    const awal = benih();
    await nilai('Soal!A2:K', awal.map(keBaris), 'APPEND');
    return awal;
  },
  async simpan(s) {
    const daftar = await sheets.semua();
    const i = daftar.findIndex(x => x.id === s.id);
    if (i < 0) await nilai('Soal!A2:K', [keBaris(s)], 'APPEND');
    else await nilai(`Soal!A${i + 2}:K${i + 2}`, [keBaris(s)]);
  },
  async hapus(id) {
    const daftar = await sheets.semua();
    const i = daftar.findIndex(x => x.id === id);
    if (i < 0) return false;
    const meta = await api('?fields=sheets.properties');
    const sheetId = meta.sheets.find(x => x.properties.title === 'Soal').properties.sheetId;
    await api(':batchUpdate', { method: 'POST', body: JSON.stringify({ requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: i + 1, endIndex: i + 2 } } }] }) });
    return true;
  },
  async tambahHasil(h) { await siapkanTab(); await nilai('Hasil!A:I', [HEADER_HASIL.map((_, k) => String(h[k] ?? ''))], 'APPEND'); },
};

/* ---------------- File lokal (pengembangan) ---------------- */
const FILE = path.join(process.cwd(), '.data', 'db.json');
const baca = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return { soal: benih(), hasil: [] }; } };
const tulis = db => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(db, null, 1)); };
const lokal = {
  async semua() { return baca().soal; },
  async simpan(s) { const db = baca(); const i = db.soal.findIndex(x => x.id === s.id); if (i < 0) db.soal.push(s); else db.soal[i] = s; tulis(db); },
  async hapus(id) { const db = baca(); const n = db.soal.length; db.soal = db.soal.filter(x => x.id !== id); tulis(db); return db.soal.length < n; },
  async tambahHasil(h) { const db = baca(); db.hasil.push(h); tulis(db); },
};

export const store = () => (pakaiSheets() ? sheets : lokal);
export const modeStore = () => (pakaiSheets() ? 'google-sheets' : 'file-lokal');
