// Utilitas kecil untuk fungsi API: token guru (HMAC), validasi soal, balasan galat.
import crypto from 'node:crypto';

const rahasia = () => process.env.TOKEN_SECRET || process.env.GURU_PASSWORD || '';
const tanda = s => crypto.createHmac('sha256', rahasia()).update(s).digest('base64url');
const sama = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

export function buatToken(jam = 12) {
  const exp = String(Date.now() + jam * 3600_000);
  return `${exp}.${tanda(exp)}`;
}
export function cekToken(req) {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '');
  const [exp, ttd] = t.split('.');
  return Boolean(rahasia() && exp && ttd && Number(exp) > Date.now() && sama(ttd, tanda(exp)));
}
export function cekPassword(p) {
  const asli = process.env.GURU_PASSWORD || '';
  return Boolean(asli) && typeof p === 'string' && sama(tanda(p), tanda(asli));
}

const teks = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
// Mengembalikan soal yang sudah dibersihkan, atau melempar galat berbahasa Indonesia.
const GAMBAR_BLOB = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[\w./-]+$/i;
const GAMBAR_DATA = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;
export function validasiSoal(s, babValid, { dataUrl = false } = {}) {
  const out = {
    id: teks(s?.id, 40), bab: teks(s?.bab, 40), pertanyaan: teks(s?.pertanyaan, 3000),
    a: teks(s?.a, 600), b: teks(s?.b, 600), c: teks(s?.c, 600), d: teks(s?.d, 600),
    jawaban: teks(s?.jawaban, 1).toUpperCase(), pembahasan: teks(s?.pembahasan, 3000), aktif: s?.aktif !== false,
    gambar: typeof s?.gambar === 'string' ? s.gambar.trim() : '',
  };
  if (!babValid.includes(out.bab)) throw new Error('Bab tidak dikenal.');
  if (out.pertanyaan.length < 10) throw new Error('Pertanyaan minimal 10 karakter.');
  if (!out.a || !out.b || !out.c || !out.d) throw new Error('Keempat opsi jawaban wajib diisi.');
  if (!'ABCD'.includes(out.jawaban) || !out.jawaban) throw new Error('Kunci jawaban harus A, B, C, atau D.');
  if (!out.pembahasan) throw new Error('Pembahasan wajib diisi agar siswa belajar dari kesalahannya.');
  if (out.gambar && !GAMBAR_BLOB.test(out.gambar) && !(dataUrl && GAMBAR_DATA.test(out.gambar))) throw new Error('Gambar tidak valid. Unggah ulang gambarnya.');
  return out;
}

export const galat = (res, kode, pesan) => res.status(kode).json({ ok: false, error: pesan });
export async function jalankan(res, fn) {
  // Detail galat (mis. dari Google API) hanya ke log server, bukan ke browser.
  try { await fn(); } catch (e) { console.error(e); galat(res, 500, 'Terjadi kesalahan server. Coba lagi sebentar.'); }
}
