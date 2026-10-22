# AR-FISMA — Augmented Reality Fisika SMA (v1.0)

Media pembelajaran web (mobile-first) untuk seluruh materi Fisika SMA kelas X–XII.
Satu keluarga dengan AR-IKIM (Ikatan Kimia): tanpa build step, dan semua model 3D dibuat langsung di browser.

## Isi
- **33 bab** (X: 11, XI: 11, XII: 11). Setiap bab berisi ringkasan konsep, rumus, dan contoh soal beserta pembahasan.
- **32 simulasi 3D interaktif** (semua bab kecuali Teknologi Digital). Besaran bisa diubah lewat slider, dan hasil perhitungannya ikut terbarui secara langsung. Simulasi bisa dijeda, dilambatkan (½×, ¼×), dan diulang.
- **AR**: potret simulasi diekspor ke GLB untuk WebXR (Chrome Android) / AR Quick Look (iOS). **Mode Kamera** menampilkan simulasi yang sedang berjalan di atas pandangan kamera.
- **Scan & Marker QR**: 32 kartu QR yang bisa dicetak. Setiap QR langsung membuka simulasinya.
- **Kuis per kelas**: 48 soal acak (15 + 17 + 16) dengan pembahasan, nilai terbaik, dan unduhan CSV.

Percepatan gravitasi memakai g = 10 m/s² (konvensi buku SMA).

## Menjalankan secara lokal
```
python -m http.server 8766
```
Lalu buka http://localhost:8766. Halaman ini tidak bisa dibuka lewat `file://` karena memakai ES module.

## Publikasi (GitHub Pages)
Unggah isi folder ini ke repo GitHub, lalu aktifkan *Settings → Pages → Deploy from branch (main, root)*.
Kamera, AR, dan QR hanya berfungsi lewat HTTPS. Cetak marker dari situs yang sudah online.

## Menyesuaikan
- Identitas pengembang/dosen: `CONFIG` di `data.js`.
- Materi, contoh soal, dan kuis: `BAB` dan `KUIS` di `data.js`.
- Simulasi: `sims.js`. Satu blok `sim('id', { params, cam, target, build })` per bab, dengan `id` yang sama seperti di `BAB`.

## Menyimpan hasil kuis ke Google Sheets (opsional)
Tanpa langkah ini, hasil kuis hanya tersimpan di HP siswa (nilai terbaik) dan bisa diunduh sebagai CSV.
1. Buat Google Spreadsheet baru (mis. "Hasil Kuis AR"). Satu spreadsheet bisa dipakai bersama oleh AR-IKIM dan AR-FISMA; masing-masing mendapat tab sendiri.
2. Di spreadsheet: **Ekstensi → Apps Script**. Hapus isi editor, tempel seluruh isi `google-sheets/Code.gs`, lalu simpan.
3. **Terapkan → Penerapan baru** → ikon roda gigi → **Aplikasi web**. Isi *Jalankan sebagai*: **Saya**, *Yang memiliki akses*: **Siapa saja**. Klik **Terapkan**, lalu izinkan akses.
4. Salin **URL aplikasi web** (berakhiran `/exec`), tempel ke `sheetUrl` di `CONFIG` (`data.js`), lalu unggah ulang ke GitHub.

Setiap siswa yang menyelesaikan kuis menambah satu baris: waktu, aplikasi, nama, kelas/rombel, kuis, jumlah benar, jumlah soal, nilai, dan rincian jawaban.
Catatan: URL aplikasi web bersifat publik, sehingga siapa pun yang mengetahuinya bisa mengirim baris palsu. Skrip menolak data yang tidak masuk akal, tetapi untuk ujian resmi tetap cocokkan dengan pengawasan di kelas. Jika `Code.gs` diubah, buat **versi penerapan baru** agar perubahannya aktif (URL tetap sama).
