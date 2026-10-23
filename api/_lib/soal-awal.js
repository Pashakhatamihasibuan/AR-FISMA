// Bank soal awal (diisi ke Sheet saat tab Soal masih kosong). Urutan opsi diacak secara tetap
// per soal agar kunci tidak menumpuk di satu huruf; kunci ikut disesuaikan.
import { SOAL_X } from './soal-x.js';
import { SOAL_XI } from './soal-xi.js';
import { SOAL_XII } from './soal-xii.js';

const HURUF = ['A', 'B', 'C', 'D'];
function acak(s) {
  let h = 2166136261; for (const ch of s.pertanyaan) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; // FNV-1a
  const opsi = [s.a, s.b, s.c, s.d], benar = opsi[HURUF.indexOf(s.jawaban)];
  const lain = opsi.filter(o => o !== benar), pos = h % 4;
  lain.splice(pos, 0, benar);
  return { ...s, a: lain[0], b: lain[1], c: lain[2], d: lain[3], jawaban: HURUF[pos] };
}

export const SOAL_AWAL = [...SOAL_X, ...SOAL_XI, ...SOAL_XII].map(acak);
export const BAB_IDS = [...new Set(SOAL_AWAL.map(s => s.bab))];
