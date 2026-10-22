// Penerima hasil kuis AR-IKIM & AR-FISMA → Google Sheets.
// Pasang di spreadsheet guru: Ekstensi → Apps Script, tempel kode ini, lalu Terapkan → Penerapan baru → Aplikasi web
// (Jalankan sebagai: Saya, Yang memiliki akses: Siapa saja). Setiap aplikasi otomatis mendapat tab sendiri.

const APPS = ['AR-IKIM', 'AR-FISMA'];
const HEADER = ['Waktu', 'Aplikasi', 'Nama', 'Kelas/Rombel', 'Kuis', 'Benar', 'Jumlah Soal', 'Nilai', 'Rincian Jawaban'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const d = JSON.parse(e.postData.contents);
    if (!APPS.includes(d.app)) throw new Error('aplikasi tidak dikenal');
    const n = Number(d.jumlah), b = Number(d.benar);
    if (!(Number.isInteger(n) && n > 0 && n <= 100 && Number.isInteger(b) && b >= 0 && b <= n)) throw new Error('nilai tidak valid');
    lock.waitLock(10000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(d.app) || ss.insertSheet(d.app);
    if (sh.getLastRow() === 0) { sh.appendRow(HEADER); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEADER.length).setFontWeight('bold'); }
    sh.appendRow([new Date(), d.app, teks(d.nama, 80), teks(d.rombel, 40), teks(d.kuis, 40), b, n, Math.round(b / n * 100), teks(d.rincian, 3000)]);
    return balas({ ok: true });
  } catch (err) {
    return balas({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

// Batasi panjang dan cegah teks dibaca sebagai rumus spreadsheet (=, +, -, @).
function teks(v, max) {
  const s = String(v == null ? '' : v).slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function balas(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
