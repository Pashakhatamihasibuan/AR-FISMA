// Tes API dengan penyimpanan file lokal (tanpa Google). Jalankan: npm test
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'arfisma-'));
const ROOT = process.cwd();
process.chdir(tmp); // store.js menyimpan ke <cwd>/.data/db.json
process.env.GURU_PASSWORD = 'rahasia-uji';
for (const k of ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'SHEET_ID']) delete process.env[k];

let soal, kuis, guru;
before(async () => {
  const imp = f => import(pathToFileURL(path.join(ROOT, 'api', f)).href).then(m => m.default);
  [soal, kuis, guru] = await Promise.all([imp('soal.js'), imp('kuis.js'), imp('guru.js')]);
});

// Meniru req/res Vercel secukupnya.
async function panggil(handler, { method = 'GET', query = {}, body = {}, token } = {}) {
  const res = { code: 0, data: null, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(k) { this.code = k; return this; }, json(o) { this.data = o; } };
  await handler({ method, query, body, headers: token ? { authorization: `Bearer ${token}` } : {} }, res);
  return res;
}

test('soal publik tidak membocorkan kunci dan pembahasan', async () => {
  const r = await panggil(soal, { query: { bab: 'parabola' } });
  assert.equal(r.code, 200);
  assert.equal(r.data.soal.length, 5);
  for (const s of r.data.soal) { assert.equal(s.jawaban, undefined); assert.equal(s.pembahasan, undefined); }
});

test('kuis dinilai di server dan hasil tercatat', async () => {
  const daftar = (await panggil(guru, { method: 'GET', token: (await panggil(guru, { method: 'POST', body: { aksi: 'login', password: 'rahasia-uji' } })).data.token })).data.soal;
  const parabola = daftar.filter(s => s.bab === 'parabola');
  const jawaban = Object.fromEntries(parabola.map((s, i) => [s.id, i < 3 ? s.jawaban : (s.jawaban === 'A' ? 'B' : 'A')]));
  const r = await panggil(kuis, { method: 'POST', body: { bab: 'parabola', nama: 'Uji', rombel: 'X-1', jawaban } });
  assert.equal(r.code, 200);
  assert.deepEqual([r.data.benar, r.data.jumlah, r.data.nilai], [3, 5, 60]);
  assert.ok(r.data.detail.every(d => d.kunci && d.pembahasan));
  const db = JSON.parse(fs.readFileSync(path.join(tmp, '.data', 'db.json'), 'utf8'));
  assert.equal(db.hasil.length, 1);
  assert.equal(db.hasil[0][1], 'Uji');
});

test('kuis menolak tanpa nama', async () => {
  const r = await panggil(kuis, { method: 'POST', body: { bab: 'parabola', nama: '  ', jawaban: {} } });
  assert.equal(r.code, 400);
});

test('guru: tanpa token ditolak, kata sandi salah ditolak', async () => {
  assert.equal((await panggil(guru, { method: 'GET' })).code, 401);
  assert.equal((await panggil(guru, { method: 'GET', token: '9999999999999.palsu' })).code, 401);
  assert.equal((await panggil(guru, { method: 'POST', body: { aksi: 'login', password: 'salah' } })).code, 401);
});

test('guru: tambah, ubah, validasi, dan hapus soal', async () => {
  const token = (await panggil(guru, { method: 'POST', body: { aksi: 'login', password: 'rahasia-uji' } })).data.token;
  const baru = { bab: 'vektor', pertanyaan: 'Soal uji buatan guru tentang vektor?', a: '1', b: '2', c: '3', d: '4', jawaban: 'c', pembahasan: 'Karena 3.' };
  const r1 = await panggil(guru, { method: 'POST', token, body: { aksi: 'simpan', soal: baru } });
  assert.equal(r1.code, 200);
  const id = r1.data.soal.id;
  assert.equal(r1.data.soal.jawaban, 'C');
  assert.equal((await panggil(soal, { query: { bab: 'vektor' } })).data.soal.length, 6);

  const r2 = await panggil(guru, { method: 'POST', token, body: { aksi: 'simpan', soal: { ...r1.data.soal, aktif: false } } });
  assert.equal(r2.code, 200);
  assert.equal((await panggil(soal, { query: { bab: 'vektor' } })).data.soal.length, 5, 'soal nonaktif tidak tampil');

  assert.equal((await panggil(guru, { method: 'POST', token, body: { aksi: 'simpan', soal: { ...baru, jawaban: 'E' } } })).code, 400);
  assert.equal((await panggil(guru, { method: 'POST', token, body: { aksi: 'simpan', soal: { ...baru, bab: 'tidak-ada' } } })).code, 400);

  assert.equal((await panggil(guru, { method: 'POST', token, body: { aksi: 'hapus', id } })).code, 200);
  assert.equal((await panggil(guru, { method: 'POST', token, body: { aksi: 'hapus', id } })).code, 404);
});

test('guru: unggah gambar soal (mode lokal) dan validasinya', async () => {
  const token = (await panggil(guru, { method: 'POST', body: { aksi: 'login', password: 'rahasia-uji' } })).data.token;
  const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 1)]).toString('base64');
  assert.equal((await panggil(guru, { method: 'POST', body: { aksi: 'gambar', data: jpeg } })).code, 401, 'unggah wajib login');
  assert.equal((await panggil(guru, { method: 'POST', token, body: { aksi: 'gambar', data: Buffer.from('<svg onload=alert(1)>'.repeat(10)).toString('base64') } })).code, 400, 'bukan JPEG ditolak');
  const up = await panggil(guru, { method: 'POST', token, body: { aksi: 'gambar', data: jpeg } });
  assert.equal(up.code, 200);
  assert.match(up.data.url, /^data:image\/jpeg;base64,/);

  const baru = { bab: 'gelombang', pertanyaan: 'Perhatikan grafik gelombang pada gambar berikut?', a: '1', b: '2', c: '3', d: '4', jawaban: 'A', pembahasan: 'Lihat gambar.' };
  assert.equal((await panggil(guru, { method: 'POST', token, body: { aksi: 'simpan', soal: { ...baru, gambar: 'javascript:alert(1)' } } })).code, 400);
  assert.equal((await panggil(guru, { method: 'POST', token, body: { aksi: 'simpan', soal: { ...baru, gambar: 'https://contoh.com/a.jpg' } } })).code, 400, 'hanya URL Vercel Blob');
  const r = await panggil(guru, { method: 'POST', token, body: { aksi: 'simpan', soal: { ...baru, gambar: up.data.url } } });
  assert.equal(r.code, 200);
  const publik = (await panggil(soal, { query: { bab: 'gelombang' } })).data.soal.find(s => s.id === r.data.soal.id);
  assert.equal(publik.gambar, up.data.url);
});
