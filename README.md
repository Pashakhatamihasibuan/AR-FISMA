# AR-FISMA — Augmented Reality Fisika SMA (v2.0)

Media pembelajaran web (mobile-first) untuk seluruh materi Fisika SMA kelas X–XII.
Frontend tanpa build step (HTML + ES module + three.js); backend berupa Vercel Functions di folder `api/` dengan Google Sheets sebagai basis data.

## Isi
- **33 bab** (X: 11, XI: 11, XII: 11). Setiap bab berisi analogi sehari-hari, rumus beserta arti simbol dan satuannya, tips, dan dua contoh soal dengan pembahasan.
- **80 simulasi 3D**, satu per rumus (mis. Fluida Statis: Archimedes, hidrostatis, Pascal, kapilaritas, Stokes). Tombol *Coba di simulasi* di materi langsung membuka rumus yang sesuai. Di HP, animasi tetap terlihat di atas saat slider digeser.
- **AR**: potret simulasi diekspor ke GLB untuk WebXR (Chrome Android) / AR Quick Look (iOS). **Mode Kamera** menampilkan simulasi di atas pandangan kamera.
- **Scan & Marker QR**: kartu QR yang bisa dicetak untuk membuka simulasi.
- **Kuis per bab**: 5 soal cerita HOTS per bab (165 soal). Benar-salah dan pembahasan baru muncul setelah semua jawaban dikirim; penilaian dilakukan di server dan hasil tercatat di tab **Hasil**.
- **Mode Guru**: guru masuk dengan kata sandi untuk menambah, mengubah, menonaktifkan, dan menghapus soal (tab **Soal**).

Percepatan gravitasi memakai g = 10 m/s² (konvensi buku SMA).

## Menjalankan secara lokal
```
GURU_PASSWORD=rahasia node dev-server.mjs
```
Buka http://localhost:8766. Tanpa variabel Google, data disimpan di `.data/db.json` (otomatis dibuat, sudah di-`.gitignore`). Test API: `npm test`.

## Deploy ke Vercel
1. **Google Cloud**: buat project → aktifkan **Google Sheets API** → *IAM & Admin → Service Accounts* → buat service account → tab *Keys* → *Add key → JSON*. Simpan file JSON-nya, jangan diunggah ke GitHub.
2. **Spreadsheet**: buat Google Spreadsheet baru, lalu **Bagikan** ke email service account (`...@...iam.gserviceaccount.com`) sebagai **Editor**. ID spreadsheet adalah bagian URL di antara `/d/` dan `/edit`. Tab **Soal** dan **Hasil** dibuat otomatis, dan bank soal awal (165 soal) diisi saat pertama kali dipakai.
3. **Vercel**: *Add New → Project* → impor repo GitHub ini (tanpa framework, tanpa build command). Di *Settings → Environment Variables* isi:

   | Nama | Isi |
   |---|---|
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` dari file JSON |
   | `GOOGLE_PRIVATE_KEY` | `private_key` dari file JSON (tempel apa adanya, termasuk `\n`) |
   | `SHEET_ID` | ID spreadsheet |
   | `GURU_PASSWORD` | kata sandi Mode Guru |
   | `TOKEN_SECRET` | teks acak panjang untuk menandatangani sesi guru (opsional; tanpa ini dipakai `GURU_PASSWORD`) |

4. Deploy ulang setelah variabel diisi. Kamera, AR, dan QR hanya berfungsi lewat HTTPS (domain Vercel sudah HTTPS).

Catatan keamanan: kunci jawaban tidak pernah dikirim ke browser sebelum kuis dikumpulkan. Siapa pun tetap bisa mengirim jawaban dengan nama apa saja, jadi untuk ujian resmi cocokkan dengan pengawasan di kelas. Ganti `GURU_PASSWORD` jika bocor; sesi guru berlaku 12 jam.

## Menyesuaikan
- Identitas pengembang, CP/TP, panduan: `data.js`.
- Materi: `materi-x.js`, `materi-xi.js`, `materi-xii.js`.
- Bank soal awal: `api/_lib/soal-*.js` (hanya dipakai untuk mengisi tab **Soal** yang masih kosong; setelah itu soal diubah lewat Mode Guru atau langsung di spreadsheet).
- Simulasi: `sims.js` (perangkat dasar + mode pertama tiap bab), `sims-x.js`, `sims-xi.js`, `sims-xii.js`. Satu blok `sim('id-bab', { mode, label, desc, params, cam, target, build })` per rumus.
