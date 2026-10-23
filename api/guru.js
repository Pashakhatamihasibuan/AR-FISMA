// /api/guru — POST {aksi:'login'} → token; GET → semua soal + kunci; POST {aksi:'simpan'|'hapus'} → ubah bank soal.
import { store, idBaru, modeStore } from './_lib/store.js';
import { BAB_IDS } from './_lib/soal-awal.js';
import { buatToken, cekToken, cekPassword, validasiSoal, galat, jalankan } from './_lib/http.js';

export default (req, res) => jalankan(res, async () => {
  res.setHeader('Cache-Control', 'no-store');
  const body = req.body || {};
  if (req.method === 'POST' && body.aksi === 'login') {
    if (!process.env.GURU_PASSWORD) return galat(res, 503, 'Kata sandi guru belum diatur (GURU_PASSWORD).');
    if (!cekPassword(body.password)) { await new Promise(r => setTimeout(r, 600)); return galat(res, 401, 'Kata sandi salah.'); }
    return res.status(200).json({ ok: true, token: buatToken() });
  }
  if (!cekToken(req)) return galat(res, 401, 'Sesi guru berakhir. Silakan masuk lagi.');

  if (req.method === 'GET') return res.status(200).json({ ok: true, soal: await store().semua(), penyimpanan: modeStore() });
  if (req.method !== 'POST') return galat(res, 405, 'Metode tidak didukung.');
  if (body.aksi === 'simpan') {
    let s;
    try { s = validasiSoal(body.soal, BAB_IDS); } catch (e) { return galat(res, 400, e.message); }
    s.id ||= idBaru();
    s.diubah = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    await store().simpan(s);
    return res.status(200).json({ ok: true, soal: s });
  }
  if (body.aksi === 'hapus') {
    const ok = await store().hapus(String(body.id || ''));
    return ok ? res.status(200).json({ ok: true }) : galat(res, 404, 'Soal tidak ditemukan.');
  }
  return galat(res, 400, 'Aksi tidak dikenal.');
});
