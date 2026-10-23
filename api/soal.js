// GET /api/soal?bab=<id> — soal aktif satu bab TANPA kunci & pembahasan (dinilai di /api/kuis).
import { store } from './_lib/store.js';
import { galat, jalankan } from './_lib/http.js';

export default (req, res) => jalankan(res, async () => {
  if (req.method !== 'GET') return galat(res, 405, 'Metode tidak didukung.');
  const bab = String(req.query.bab || '');
  const soal = (await store().semua()).filter(s => s.aktif && s.bab === bab)
    .map(({ id, pertanyaan, a, b, c, d }) => ({ id, pertanyaan, a, b, c, d }));
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, soal });
});
