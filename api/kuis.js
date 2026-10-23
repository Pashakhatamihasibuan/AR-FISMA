// POST /api/kuis — menilai jawaban satu bab di server, mencatat hasil, lalu baru mengirim kunci & pembahasan.
import { store } from './_lib/store.js';
import { galat, jalankan } from './_lib/http.js';

export default (req, res) => jalankan(res, async () => {
  if (req.method !== 'POST') return galat(res, 405, 'Metode tidak didukung.');
  const { bab, judul, nama, rombel, jawaban } = req.body || {};
  const namaBersih = typeof nama === 'string' ? nama.trim().slice(0, 80) : '';
  if (!namaBersih) return galat(res, 400, 'Nama wajib diisi.');
  if (!jawaban || typeof jawaban !== 'object') return galat(res, 400, 'Jawaban tidak terbaca.');
  const soal = (await store().semua()).filter(s => s.aktif && s.bab === String(bab));
  if (!soal.length) return galat(res, 404, 'Soal untuk bab ini belum ada.');

  const detail = soal.map(s => {
    const pilih = typeof jawaban[s.id] === 'string' ? jawaban[s.id].toUpperCase() : '';
    return { id: s.id, pertanyaan: s.pertanyaan, gambar: s.gambar, opsi: { A: s.a, B: s.b, C: s.c, D: s.d }, pilih, kunci: s.jawaban, benar: pilih === s.jawaban, pembahasan: s.pembahasan };
  });
  const benar = detail.filter(d => d.benar).length, nilai = Math.round(benar / detail.length * 100);
  await store().tambahHasil([
    new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }), namaBersih, String(rombel || '').trim().slice(0, 40), String(bab),
    String(judul || '').slice(0, 80), benar, detail.length, nilai,
    detail.map((d, i) => `${i + 1}. ${d.benar ? '✓' : '✗'} ${d.pilih || '-'} (kunci ${d.kunci})`).join(' | '),
  ]);
  res.status(200).json({ ok: true, benar, jumlah: detail.length, nilai, detail });
});
