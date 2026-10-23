// Konten pembelajaran AR-FISMA (Fisika SMA kelas X–XII): identitas, CP/TP, panduan. Materi per bab ada di materi-*.js;
// soal kuis ada di Google Sheets (bank soal awal: api/_lib/soal-*.js).
import { MATERI_X } from './materi-x.js';
import { MATERI_XI } from './materi-xi.js';
import { MATERI_XII } from './materi-xii.js';

// Ganti isi CONFIG ini dengan identitas pengembang / dosen pembimbing Anda.
export const CONFIG = {
  appName: 'AR-FISMA',
  tagline: 'Augmented Reality Fisika SMA',
  versi: '2.0',
  pengembang: [
    { nama: 'Nama Pengembang', peran: 'Pengembang Media', instansi: 'Program Studi / Universitas', email: 'email@kampus.ac.id' },
    { nama: 'Nama Dosen Pembimbing', peran: 'Dosen Pembimbing', instansi: 'Program Studi / Universitas', email: 'email@kampus.ac.id' },
  ],
};

export const CP = 'Peserta didik mampu memahami konsep, prinsip, dan hukum fisika (mekanika, fluida, termal, gelombang, optik, listrik-magnet, dan fisika modern), menerapkannya untuk memecahkan masalah sehari-hari, serta menganalisis fenomena fisika melalui pengamatan, simulasi, dan percobaan.';

export const TP = [
  'Melakukan pengukuran dengan alat ukur yang tepat dan menyajikan hasil sesuai aturan angka penting.',
  'Menganalisis gerak lurus, parabola, dan melingkar beserta penyebabnya menggunakan hukum Newton.',
  'Menerapkan konsep usaha, energi, momentum, dan getaran harmonis dalam pemecahan masalah.',
  'Menganalisis dinamika rotasi, elastisitas, fluida statis, dan fluida dinamis.',
  'Menjelaskan suhu, kalor, teori kinetik gas, dan hukum termodinamika.',
  'Menganalisis sifat gelombang mekanik, bunyi, cahaya, dan prinsip kerja alat optik.',
  'Menganalisis listrik statis, rangkaian arus searah dan bolak-balik, medan magnet, serta induksi elektromagnetik.',
  'Menjelaskan gelombang elektromagnetik, gejala kuantum, relativitas, struktur atom, inti atom, dan teknologi digital.',
];

export const PANDUAN = [
  ['Pilih Bab', 'Menu <b>Materi</b> berisi 33 bab Fisika SMA kelas X–XII. Setiap bab menjelaskan konsep dengan contoh sehari-hari, rumus beserta arti simbol dan satuannya, tips, serta contoh soal.'],
  ['Jalankan Simulasi 3D', 'Setiap rumus punya simulasi. Tekan <b>Coba di simulasi</b> pada materi, atau pilih rumus di bagian <b>Pilih rumus</b> pada halaman simulasi. Animasi tetap terlihat saat kamu menggeser slider.'],
  ['Lihat di Dunia Nyata', '<b>Mode Kamera</b> menampilkan simulasi di atas pandangan kamera. <b>Lihat di AR</b> menaruh model 3D di meja (butuh perangkat yang mendukung AR).'],
  ['Pindai Marker QR', 'Cetak kartu dari menu <b>Marker QR</b>, lalu pindai dengan menu <b>Scan</b> atau kamera HP biasa untuk membuka simulasi langsung.'],
  ['Kerjakan Kuis per Bab', 'Setiap bab berisi 5 soal cerita HOTS. Benar-salah dan pembahasan baru muncul setelah semua jawaban dikirim, dan nilaimu tercatat untuk guru.'],
  ['Mode Guru', 'Guru masuk lewat menu <b>Mode Guru</b> dengan kata sandi untuk menambah, mengubah, menonaktifkan, atau menghapus soal kuis.'],
];

export const KELAS = { X: 'Kelas X', XI: 'Kelas XI', XII: 'Kelas XII' };

export const BAB = [...MATERI_X, ...MATERI_XI, ...MATERI_XII];
