// Konten pembelajaran AR-FISMA (Fisika SMA kelas X–XII): identitas, materi per bab, contoh soal, kuis.

// Ganti isi CONFIG ini dengan identitas pengembang / dosen pembimbing Anda.
export const CONFIG = {
  appName: 'AR-FISMA',
  tagline: 'Augmented Reality Fisika SMA',
  versi: '1.0',
  // URL aplikasi web Google Apps Script (lihat google-sheets/Code.gs). Kosong = hasil kuis tidak dikirim.
  sheetUrl: 'https://script.google.com/macros/s/AKfycbxMuj22H2wEUAg4fBKhySrIQAX00gIDAOkV9KALGumkqLbJmuCU3LEmxakHxXfL-L1TJw/exec',
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
  ['Pilih Bab', 'Menu <b>Materi</b> berisi 33 bab Fisika SMA, dikelompokkan per kelas (X, XI, XII). Setiap bab memuat ringkasan konsep, rumus, dan contoh soal.'],
  ['Jalankan Simulasi 3D', 'Tekan <b>Simulasi 3D</b> pada bab. Geser slider untuk mengubah besaran (sudut, kecepatan, massa, dll.) dan perhatikan hasil perhitungannya.'],
  ['Lihat di Dunia Nyata', '<b>Mode Kamera</b> menampilkan simulasi di atas pandangan kamera. <b>Lihat di AR</b> menaruh model 3D di meja (butuh perangkat yang mendukung AR).'],
  ['Pindai Marker QR', 'Cetak kartu dari menu <b>Marker QR</b>, lalu pindai dengan menu <b>Scan</b> atau kamera HP biasa untuk membuka simulasi langsung.'],
  ['Uji Pemahaman', 'Kerjakan <b>Kuis</b> per kelas. Setiap soal dilengkapi pembahasan, dan hasilnya bisa diunduh.'],
];

export const KELAS = { X: 'Kelas X', XI: 'Kelas XI', XII: 'Kelas XII' };

// sim: true = bab ini punya simulasi 3D di sims.js dengan id yang sama.
export const BAB = [
  // ======================= KELAS X =======================
  { id: 'pengukuran', kelas: 'X', judul: 'Besaran, Satuan & Pengukuran', ikon: 'fa-ruler', sim: true, isi: `
    <p><b>Besaran pokok</b> adalah besaran yang satuannya ditetapkan lebih dulu. Dalam SI ada 7 besaran pokok:</p>
    <table><thead><tr><th>Besaran</th><th>Satuan</th><th>Dimensi</th></tr></thead><tbody>
    <tr><td>Panjang</td><td>meter (m)</td><td>[L]</td></tr><tr><td>Massa</td><td>kilogram (kg)</td><td>[M]</td></tr>
    <tr><td>Waktu</td><td>sekon (s)</td><td>[T]</td></tr><tr><td>Kuat arus listrik</td><td>ampere (A)</td><td>[I]</td></tr>
    <tr><td>Suhu</td><td>kelvin (K)</td><td>[θ]</td></tr><tr><td>Jumlah zat</td><td>mol</td><td>[N]</td></tr>
    <tr><td>Intensitas cahaya</td><td>kandela (cd)</td><td>[J]</td></tr></tbody></table>
    <p><b>Besaran turunan</b> diturunkan dari besaran pokok, misalnya kecepatan (m/s), gaya (N = kg·m/s²), dan energi (J = kg·m²/s²).</p>
    <p><b>Alat ukur panjang dan ketelitiannya:</b> mistar 1 mm, jangka sorong 0,1 mm (0,01 cm), mikrometer sekrup 0,01 mm.</p>
    <div class="rumus">Hasil jangka sorong = skala utama + (garis nonius yang berimpit × 0,01 cm)</div>
    <p><b>Aturan angka penting:</b> semua angka bukan nol penting; nol di antara angka bukan nol penting; nol di depan desimal tidak penting. Hasil perkalian/pembagian mengikuti jumlah angka penting paling sedikit.</p>`,
    contoh: { soal: 'Pada jangka sorong, skala utama menunjukkan 2,3 cm dan garis nonius ke-7 berimpit dengan skala utama. Berapa hasil pengukurannya?', jawab: 'Hasil = 2,3 cm + 7 × 0,01 cm = 2,3 + 0,07 = <b>2,37 cm</b>.' } },
  { id: 'vektor', kelas: 'X', judul: 'Vektor', ikon: 'fa-up-right-and-down-left-from-center', sim: true, isi: `
    <p><b>Besaran vektor</b> memiliki nilai dan arah (perpindahan, kecepatan, gaya). <b>Besaran skalar</b> hanya memiliki nilai (massa, waktu, suhu).</p>
    <div class="rumus">R = √(A² + B² + 2AB cos α)</div>
    <p>α adalah sudut antara kedua vektor. Jika α = 0° maka R = A + B; jika α = 180° maka R = |A − B|; jika α = 90° maka R = √(A² + B²).</p>
    <p><b>Metode komponen (analitis):</b></p>
    <div class="rumus">Aₓ = A cos θ &nbsp;&nbsp; A_y = A sin θ<br>R = √(ΣFₓ² + ΣF_y²) &nbsp;&nbsp; tan θ_R = ΣF_y / ΣFₓ</div>
    <p>Penjumlahan vektor secara grafis dapat dilakukan dengan metode jajargenjang atau metode poligon (segitiga).</p>`,
    contoh: { soal: 'Dua gaya 3 N dan 4 N bekerja pada satu titik dan saling tegak lurus. Berapa resultannya?', jawab: 'R = √(3² + 4²) = √25 = <b>5 N</b>.' } },
  { id: 'gerak-lurus', kelas: 'X', judul: 'Gerak Lurus (GLB & GLBB)', ikon: 'fa-car-side', sim: true, isi: `
    <p><b>Gerak Lurus Beraturan (GLB):</b> kecepatan tetap, percepatan nol.</p>
    <div class="rumus">s = v · t</div>
    <p><b>Gerak Lurus Berubah Beraturan (GLBB):</b> percepatan tetap.</p>
    <div class="rumus">v_t = v₀ + a·t<br>s = v₀·t + ½·a·t²<br>v_t² = v₀² + 2·a·s</div>
    <p>Gerak jatuh bebas adalah GLBB dengan v₀ = 0 dan a = g (≈ 10 m/s²). Gerak vertikal ke atas mengalami perlambatan g hingga berhenti di titik tertinggi.</p>
    <p><b>Grafik:</b> pada GLB, grafik s–t berupa garis lurus miring; pada GLBB, grafik v–t berupa garis lurus miring dan luas di bawahnya sama dengan jarak.</p>`,
    contoh: { soal: 'Sebuah mobil bergerak dengan kecepatan awal 10 m/s dan percepatan 2 m/s² selama 5 s. Tentukan kecepatan akhir dan jarak tempuhnya.', jawab: 'v_t = 10 + 2·5 = <b>20 m/s</b>; s = 10·5 + ½·2·5² = 50 + 25 = <b>75 m</b>.' } },
  { id: 'parabola', kelas: 'X', judul: 'Gerak Parabola', ikon: 'fa-baseball', sim: true, isi: `
    <p>Gerak parabola adalah perpaduan <b>GLB pada sumbu horizontal</b> dan <b>GLBB pada sumbu vertikal</b>.</p>
    <div class="rumus">vₓ = v₀ cos θ &nbsp;&nbsp; v_y = v₀ sin θ − g·t<br>x = v₀ cos θ · t &nbsp;&nbsp; y = v₀ sin θ · t − ½·g·t²</div>
    <div class="rumus">t_puncak = v₀ sin θ / g<br>H_maks = v₀² sin² θ / (2g)<br>R = v₀² sin 2θ / g</div>
    <p>Jangkauan maksimum dicapai pada sudut elevasi <b>45°</b>. Dua sudut yang jumlahnya 90° (misalnya 30° dan 60°) menghasilkan jangkauan yang sama.</p>`,
    contoh: { soal: 'Bola ditendang dengan kecepatan 20 m/s dan sudut elevasi 30° (g = 10 m/s²). Tentukan tinggi maksimum dan jangkauannya.', jawab: 'H = 20²·(0,5)² / 20 = 400·0,25/20 = <b>5 m</b>; R = 20²·sin 60° / 10 = 400·0,866/10 ≈ <b>34,6 m</b>.' } },
  { id: 'melingkar', kelas: 'X', judul: 'Gerak Melingkar', ikon: 'fa-circle-notch', sim: true, isi: `
    <p>Pada <b>gerak melingkar beraturan (GMB)</b>, besar kecepatan tetap tetapi arahnya selalu berubah, sehingga ada percepatan menuju pusat (sentripetal).</p>
    <div class="rumus">f = 1/T &nbsp;&nbsp; ω = 2πf &nbsp;&nbsp; v = ω·r</div>
    <div class="rumus">a_s = v²/r = ω²·r &nbsp;&nbsp; F_s = m·v²/r</div>
    <p><b>Hubungan roda-roda:</b> roda <b>seporos</b> memiliki ω yang sama; roda yang <b>bersinggungan</b> atau <b>dihubungkan tali/rantai</b> memiliki v yang sama.</p>`,
    contoh: { soal: 'Benda 0,2 kg berputar pada lingkaran berjari-jari 0,5 m dengan kelajuan 2 m/s. Tentukan percepatan dan gaya sentripetalnya.', jawab: 'a_s = 2²/0,5 = <b>8 m/s²</b>; F_s = 0,2 · 8 = <b>1,6 N</b>.' } },
  { id: 'newton', kelas: 'X', judul: 'Hukum Newton tentang Gerak', ikon: 'fa-weight-hanging', sim: true, isi: `
    <p><b>Hukum I (inersia):</b> jika ΣF = 0, benda diam tetap diam atau bergerak lurus beraturan.</p>
    <p><b>Hukum II:</b> <span class="rumus-inline">ΣF = m·a</span></p>
    <p><b>Hukum III (aksi-reaksi):</b> F_aksi = −F_reaksi, bekerja pada dua benda yang berbeda.</p>
    <p><b>Jenis gaya:</b> berat w = m·g, gaya normal N (tegak lurus bidang), gaya gesek statis f_s ≤ μ_s·N, gaya gesek kinetis f_k = μ_k·N, tegangan tali T.</p>
    <div class="rumus">Bidang miring licin: a = g sin θ<br>Bidang miring kasar: a = g (sin θ − μ_k cos θ)</div>
    <p>Benda di bidang miring mulai bergerak jika tan θ &gt; μ_s.</p>`,
    contoh: { soal: 'Balok 2 kg berada pada bidang miring licin dengan sudut 30° (g = 10 m/s²). Berapa percepatannya?', jawab: 'a = g sin 30° = 10 · 0,5 = <b>5 m/s²</b> (massa tidak memengaruhi percepatan pada bidang licin).' } },
  { id: 'gravitasi', kelas: 'X', judul: 'Hukum Gravitasi Newton & Kepler', ikon: 'fa-earth-asia', sim: true, isi: `
    <div class="rumus">F = G · m₁·m₂ / r² &nbsp;&nbsp; G = 6,67 × 10⁻¹¹ N·m²/kg²</div>
    <p>Percepatan gravitasi di permukaan planet: <span class="rumus-inline">g = G·M / R²</span>. Semakin jauh dari pusat planet, g semakin kecil.</p>
    <p><b>Hukum Kepler:</b></p>
    <ol><li>Planet bergerak dalam orbit elips dengan Matahari di salah satu titik fokusnya.</li>
    <li>Garis penghubung planet–Matahari menyapu luas yang sama dalam selang waktu yang sama (planet lebih cepat saat dekat Matahari).</li>
    <li><span class="rumus-inline">T² / r³ = konstan</span></li></ol>
    <p>Kecepatan orbit satelit: <span class="rumus-inline">v = √(G·M / r)</span>.</p>`,
    contoh: { soal: 'Jarak dua benda dijadikan 2 kali semula. Berapa gaya gravitasinya sekarang?', jawab: 'F ∝ 1/r², sehingga F′ = F / 2² = <b>¼ F</b>.' } },
  { id: 'usaha-energi', kelas: 'X', judul: 'Usaha dan Energi', ikon: 'fa-bolt', sim: true, isi: `
    <div class="rumus">W = F · s · cos θ</div>
    <div class="rumus">E_k = ½·m·v² &nbsp;&nbsp; E_p = m·g·h &nbsp;&nbsp; E_m = E_k + E_p</div>
    <p><b>Teorema usaha–energi:</b> <span class="rumus-inline">W = ΔE_k</span>.</p>
    <p><b>Hukum kekekalan energi mekanik:</b> jika hanya gaya konservatif (gravitasi, pegas) yang bekerja, <span class="rumus-inline">E_k1 + E_p1 = E_k2 + E_p2</span>.</p>
    <p><b>Daya:</b> <span class="rumus-inline">P = W / t = F · v</span> (satuan watt).</p>`,
    contoh: { soal: 'Benda dijatuhkan dari ketinggian 5 m (g = 10 m/s²). Berapa kecepatannya saat menyentuh tanah?', jawab: 'm·g·h = ½·m·v² → v = √(2·g·h) = √100 = <b>10 m/s</b>.' } },
  { id: 'momentum', kelas: 'X', judul: 'Momentum dan Impuls', ikon: 'fa-car-burst', sim: true, isi: `
    <div class="rumus">p = m·v &nbsp;&nbsp; I = F·Δt = Δp</div>
    <p><b>Hukum kekekalan momentum:</b> <span class="rumus-inline">m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′</span></p>
    <div class="rumus">Koefisien restitusi: e = −(v₁′ − v₂′) / (v₁ − v₂)</div>
    <ul><li><b>Lenting sempurna</b> (e = 1): momentum dan energi kinetik kekal.</li>
    <li><b>Lenting sebagian</b> (0 &lt; e &lt; 1): sebagian energi kinetik hilang.</li>
    <li><b>Tidak lenting sama sekali</b> (e = 0): kedua benda menyatu setelah tumbukan.</li></ul>
    <p>Penerapan: airbag dan helm memperpanjang Δt sehingga gaya tumbukan mengecil; roket bergerak karena kekekalan momentum.</p>`,
    contoh: { soal: 'Troli 2 kg yang bergerak 3 m/s menumbuk troli 1 kg yang diam, lalu keduanya menyatu. Berapa kecepatan setelah tumbukan?', jawab: '2·3 + 1·0 = (2 + 1)·v′ → v′ = 6/3 = <b>2 m/s</b>.' } },
  { id: 'getaran', kelas: 'X', judul: 'Getaran Harmonis', ikon: 'fa-wave-square', sim: true, isi: `
    <div class="rumus">y = A sin ωt &nbsp;&nbsp; v = A·ω cos ωt &nbsp;&nbsp; a = −ω²·y</div>
    <div class="rumus">Pegas: T = 2π √(m/k) &nbsp;&nbsp; Bandul: T = 2π √(L/g)</div>
    <p>Energi getaran: <span class="rumus-inline">E = ½·k·A²</span>. Kecepatan maksimum <span class="rumus-inline">v_maks = A·ω</span> terjadi di titik setimbang; percepatan maksimum terjadi di simpangan terjauh.</p>
    <p>Periode bandul sederhana tidak bergantung pada massa beban (untuk simpangan kecil).</p>`,
    contoh: { soal: 'Beban 0,5 kg digantung pada pegas dengan k = 50 N/m. Berapa periodenya?', jawab: 'T = 2π √(0,5/50) = 2π · 0,1 = <b>0,2π ≈ 0,63 s</b>.' } },
  { id: 'energi-terbarukan', kelas: 'X', judul: 'Energi Terbarukan & Pemanasan Global', ikon: 'fa-wind', sim: true, isi: `
    <p><b>Energi terbarukan</b> berasal dari sumber yang dapat diperbarui secara alami: surya, angin, air, panas bumi, biomassa, gelombang laut. <b>Energi tak terbarukan</b>: minyak bumi, batu bara, gas alam.</p>
    <div class="rumus">Daya angin: P = ½·ρ·A·v³·η &nbsp;&nbsp; (A = πr², η maksimum teoretis 59%)</div>
    <div class="rumus">Daya air (PLTA): P = η·ρ·Q·g·h</div>
    <p><b>Pemanasan global</b> terjadi karena gas rumah kaca (CO₂, CH₄, N₂O) menahan radiasi inframerah dari Bumi. Dampaknya: kenaikan suhu, mencairnya es kutub, naiknya permukaan laut, dan cuaca ekstrem.</p>
    <p><b>Mitigasi:</b> beralih ke energi terbarukan, hemat energi, transportasi umum, dan reboisasi.</p>`,
    contoh: { soal: 'Turbin angin berjari-jari 10 m menerima angin 5 m/s (ρ = 1,2 kg/m³) dengan efisiensi 40%. Berapa daya listriknya?', jawab: 'A = π·10² ≈ 314 m². P = ½ · 1,2 · 314 · 5³ · 0,4 ≈ <b>9.420 W ≈ 9,4 kW</b>.' } },

  // ======================= KELAS XI =======================
  { id: 'rotasi', kelas: 'XI', judul: 'Dinamika Rotasi & Kesetimbangan', ikon: 'fa-rotate', sim: true, isi: `
    <div class="rumus">Torsi: τ = F·r·sin θ &nbsp;&nbsp; Στ = I·α</div>
    <p><b>Momen inersia</b> <span class="rumus-inline">I = k·m·r²</span>: cincin k = 1, silinder pejal k = ½, bola pejal k = ⅖, bola berongga k = ⅔, batang (poros di tengah) I = 1/12·m·L².</p>
    <div class="rumus">E_k rotasi = ½·I·ω² &nbsp;&nbsp; L = I·ω (kekal jika Στ = 0)</div>
    <div class="rumus">Menggelinding di bidang miring: a = g sin θ / (1 + k)</div>
    <p>Semakin kecil k, semakin cepat benda menggelinding: bola pejal &gt; silinder pejal &gt; cincin.</p>
    <p><b>Kesetimbangan benda tegar:</b> ΣF = 0 dan Στ = 0.</p>`,
    contoh: { soal: 'Bola pejal menggelinding tanpa slip pada bidang miring 30° (g = 10 m/s²). Berapa percepatannya?', jawab: 'a = 10 · 0,5 / (1 + 0,4) = 5/1,4 ≈ <b>3,57 m/s²</b>.' } },
  { id: 'elastisitas', kelas: 'XI', judul: 'Elastisitas & Hukum Hooke', ikon: 'fa-arrows-up-down', sim: true, isi: `
    <div class="rumus">Tegangan σ = F/A &nbsp;&nbsp; Regangan e = ΔL/L₀ &nbsp;&nbsp; Modulus Young E = σ/e</div>
    <div class="rumus">Hukum Hooke: F = k·Δx</div>
    <div class="rumus">Seri: 1/k_s = 1/k₁ + 1/k₂ + … &nbsp;&nbsp; Paralel: k_p = k₁ + k₂ + …</div>
    <p>Energi potensial pegas: <span class="rumus-inline">E_p = ½·k·Δx²</span>. Hukum Hooke berlaku selama benda belum melewati batas elastisnya.</p>`,
    contoh: { soal: 'Dua pegas masing-masing 200 N/m disusun seri lalu diberi beban 2 kg (g = 10 m/s²). Berapa pertambahan panjangnya?', jawab: 'k_s = 200/2 = 100 N/m. Δx = m·g / k_s = 20/100 = <b>0,2 m</b>.' } },
  { id: 'fluida-statis', kelas: 'XI', judul: 'Fluida Statis', ikon: 'fa-water', sim: true, isi: `
    <div class="rumus">Tekanan hidrostatis: P_h = ρ·g·h</div>
    <div class="rumus">Hukum Pascal: F₁/A₁ = F₂/A₂</div>
    <div class="rumus">Hukum Archimedes: F_A = ρ_fluida · g · V_tercelup</div>
    <ul><li><b>Terapung:</b> ρ_benda &lt; ρ_fluida (sebagian benda tercelup).</li>
    <li><b>Melayang:</b> ρ_benda = ρ_fluida.</li><li><b>Tenggelam:</b> ρ_benda &gt; ρ_fluida.</li></ul>
    <p>Fraksi volume yang tercelup pada benda terapung = ρ_benda / ρ_fluida.</p>
    <p><b>Kapilaritas:</b> <span class="rumus-inline">y = 2γ cos θ / (ρ·g·r)</span>. <b>Viskositas (Stokes):</b> <span class="rumus-inline">F = 6π·η·r·v</span>.</p>`,
    contoh: { soal: 'Berapa tekanan hidrostatis pada kedalaman 10 m di dalam air (ρ = 1000 kg/m³, g = 10 m/s²)?', jawab: 'P_h = 1000 · 10 · 10 = <b>100.000 Pa = 10⁵ Pa</b>.' } },
  { id: 'fluida-dinamis', kelas: 'XI', judul: 'Fluida Dinamis', ikon: 'fa-faucet-drip', sim: true, isi: `
    <div class="rumus">Debit: Q = A·v = V/t</div>
    <div class="rumus">Kontinuitas: A₁·v₁ = A₂·v₂</div>
    <div class="rumus">Bernoulli: P + ½·ρ·v² + ρ·g·h = konstan</div>
    <p>Pada pipa yang menyempit, kecepatan fluida bertambah dan <b>tekanannya berkurang</b>.</p>
    <p><b>Penerapan:</b> teorema Torricelli <span class="rumus-inline">v = √(2gh)</span>, venturimeter, tabung pitot, penyemprot nyamuk, dan gaya angkat sayap pesawat (udara di atas sayap lebih cepat sehingga tekanannya lebih kecil).</p>`,
    contoh: { soal: 'Luas penampang pipa besar 4 kali pipa kecil. Jika air di pipa besar mengalir 2 m/s, berapa kecepatannya di pipa kecil?', jawab: 'A₁·v₁ = A₂·v₂ → 4A · 2 = A · v₂ → v₂ = <b>8 m/s</b>.' } },
  { id: 'suhu-kalor', kelas: 'XI', judul: 'Suhu dan Kalor', ikon: 'fa-temperature-half', sim: true, isi: `
    <div class="rumus">C : R : F = 5 : 4 : 9 &nbsp;&nbsp; K = C + 273 &nbsp;&nbsp; F = 9/5·C + 32</div>
    <div class="rumus">Q = m·c·ΔT &nbsp;&nbsp; Q = m·L (perubahan wujud)</div>
    <p>Data air: c_es = 2100 J/kg°C, c_air = 4200 J/kg°C, kalor lebur 336.000 J/kg, kalor uap 2.260.000 J/kg. Selama perubahan wujud, <b>suhu tetap</b>.</p>
    <div class="rumus">Asas Black: Q_lepas = Q_terima</div>
    <p><b>Pemuaian panjang:</b> <span class="rumus-inline">ΔL = L₀·α·ΔT</span>. <b>Perpindahan kalor:</b> konduksi (zat padat), konveksi (aliran fluida), radiasi (tanpa medium, <span class="rumus-inline">P = e·σ·A·T⁴</span>).</p>`,
    contoh: { soal: 'Berapa kalor yang dibutuhkan untuk memanaskan 0,5 kg air dari 20 °C menjadi 100 °C?', jawab: 'Q = 0,5 · 4200 · 80 = <b>168.000 J</b>.' } },
  { id: 'teori-kinetik', kelas: 'XI', judul: 'Teori Kinetik Gas', ikon: 'fa-circle-nodes', sim: true, isi: `
    <div class="rumus">Gas ideal: P·V = n·R·T = N·k·T</div>
    <p>R = 8,314 J/mol·K, k (Boltzmann) = 1,38 × 10⁻²³ J/K, N_A = 6,02 × 10²³ partikel/mol.</p>
    <div class="rumus">Ē_k = 3/2 · k·T &nbsp;&nbsp; v_rms = √(3kT/m) = √(3RT/M)</div>
    <div class="rumus">P = (2N / 3V) · Ē_k</div>
    <p>Suhu adalah ukuran energi kinetik rata-rata partikel. Tekanan gas timbul karena tumbukan partikel dengan dinding wadah.</p>`,
    contoh: { soal: 'Suhu mutlak gas dinaikkan menjadi 4 kali semula. Berapa kali kecepatan efektif (v_rms) partikelnya?', jawab: 'v_rms ∝ √T, sehingga v′ = √4 · v = <b>2 kali</b>.' } },
  { id: 'termodinamika', kelas: 'XI', judul: 'Termodinamika', ikon: 'fa-fire', sim: true, isi: `
    <div class="rumus">Hukum I: Q = ΔU + W &nbsp;&nbsp; W = P·ΔV &nbsp;&nbsp; ΔU = 3/2·n·R·ΔT (monoatomik)</div>
    <table><thead><tr><th>Proses</th><th>Tetap</th><th>Ciri</th></tr></thead><tbody>
    <tr><td>Isobarik</td><td>P</td><td>W = P·ΔV</td></tr><tr><td>Isokhorik</td><td>V</td><td>W = 0, Q = ΔU</td></tr>
    <tr><td>Isotermal</td><td>T</td><td>ΔU = 0, W = nRT ln(V₂/V₁)</td></tr><tr><td>Adiabatik</td><td>Q = 0</td><td>P·V^γ = konstan</td></tr></tbody></table>
    <p><b>Hukum II:</b> kalor mengalir spontan dari benda panas ke benda dingin; tidak ada mesin dengan efisiensi 100%.</p>
    <div class="rumus">Mesin Carnot: η = 1 − T₂/T₁ &nbsp;&nbsp; Mesin pendingin: K = T₂/(T₁ − T₂)</div>`,
    contoh: { soal: 'Mesin Carnot bekerja antara reservoir 800 K dan 400 K. Berapa efisiensinya?', jawab: 'η = 1 − 400/800 = <b>0,5 = 50%</b>.' } },
  { id: 'gelombang', kelas: 'XI', judul: 'Gelombang Mekanik', ikon: 'fa-chart-line', sim: true, isi: `
    <p><b>Gelombang transversal:</b> arah getar tegak lurus arah rambat (tali, permukaan air). <b>Gelombang longitudinal:</b> arah getar sejajar arah rambat (bunyi, pegas slinki).</p>
    <div class="rumus">v = λ·f = λ/T &nbsp;&nbsp; k = 2π/λ &nbsp;&nbsp; ω = 2πf</div>
    <div class="rumus">Gelombang berjalan: y = A sin(ωt − kx)</div>
    <div class="rumus">Gelombang stasioner (ujung terikat): y = 2A sin(kx) cos(ωt)</div>
    <p>Pada gelombang stasioner terdapat <b>simpul</b> (amplitudo nol) dan <b>perut</b> (amplitudo maksimum 2A). Sifat gelombang: pemantulan, pembiasan, difraksi, interferensi, dan polarisasi (khusus transversal).</p>`,
    contoh: { soal: 'Gelombang memiliki frekuensi 5 Hz dan panjang gelombang 2 m. Berapa cepat rambatnya?', jawab: 'v = λ·f = 2 · 5 = <b>10 m/s</b>.' } },
  { id: 'bunyi', kelas: 'XI', judul: 'Gelombang Bunyi', ikon: 'fa-volume-high', sim: true, isi: `
    <p>Bunyi adalah gelombang <b>longitudinal</b> yang membutuhkan medium. Cepat rambat di udara ≈ 340 m/s.</p>
    <div class="rumus">Dawai: f_n = (n / 2L) · √(F/μ)</div>
    <div class="rumus">Pipa organa terbuka: f_n = n·v / 2L &nbsp;&nbsp; tertutup: f_n = (2n − 1)·v / 4L</div>
    <div class="rumus">Intensitas: I = P / (4π r²) &nbsp;&nbsp; Taraf intensitas: TI = 10 log (I/I₀), I₀ = 10⁻¹² W/m²</div>
    <div class="rumus">Efek Doppler: f_p = (v ± v_p) / (v ∓ v_s) · f_s</div>
    <p>Pada efek Doppler, tanda atas dipakai saat pendengar dan sumber saling mendekat: frekuensi yang terdengar lebih tinggi.</p>`,
    contoh: { soal: 'Ambulans bergerak 20 m/s mendekati pendengar diam sambil membunyikan sirene 680 Hz (v = 340 m/s). Berapa frekuensi yang terdengar?', jawab: 'f_p = 340 / (340 − 20) · 680 = 340/320 · 680 = <b>722,5 Hz</b>.' } },
  { id: 'cahaya', kelas: 'XI', judul: 'Gelombang Cahaya', ikon: 'fa-lightbulb', sim: true, isi: `
    <p>Cahaya adalah gelombang elektromagnetik transversal yang dapat mengalami interferensi, difraksi, dan polarisasi.</p>
    <div class="rumus">Celah ganda Young (terang ke-n): d·y / L = n·λ &nbsp;&nbsp; jarak antarterang Δy = λ·L / d</div>
    <div class="rumus">Kisi difraksi: d sin θ = n·λ, dengan d = 1/N</div>
    <div class="rumus">Celah tunggal (gelap ke-n): d sin θ = n·λ</div>
    <div class="rumus">Polarisasi: Malus I = I₀ cos² θ &nbsp;&nbsp; Brewster tan θ_B = n₂/n₁</div>`,
    contoh: { soal: 'Cahaya 600 nm melewati celah ganda berjarak 0,3 mm dan layar berjarak 1 m. Berapa jarak antara dua garis terang berdekatan?', jawab: 'Δy = λL/d = (600 × 10⁻⁹ · 1) / (0,3 × 10⁻³) = 2 × 10⁻³ m = <b>2 mm</b>.' } },
  { id: 'optik', kelas: 'XI', judul: 'Alat Optik', ikon: 'fa-glasses', sim: true, isi: `
    <div class="rumus">1/f = 1/s + 1/s′ &nbsp;&nbsp; M = |s′/s| = h′/h &nbsp;&nbsp; P = 100/f (f dalam cm, satuan dioptri)</div>
    <p>Lensa cembung (f positif), lensa cekung (f negatif). Bayangan nyata jika s′ positif (terbalik), maya jika s′ negatif (tegak).</p>
    <ul><li><b>Mata miopi</b> (rabun jauh): lensa cekung, P = −100/PR.</li>
    <li><b>Mata hipermetropi</b> (rabun dekat): lensa cembung, P = 4 − 100/PP.</li>
    <li><b>Lup:</b> M = 25/f (mata tak berakomodasi), M = 25/f + 1 (berakomodasi maksimum).</li>
    <li><b>Mikroskop:</b> M = (s′_ob / s_ob) · (25 / f_ok).</li><li><b>Teropong bintang:</b> M = f_ob / f_ok.</li></ul>`,
    contoh: { soal: 'Benda diletakkan 15 cm di depan lensa cembung berfokus 10 cm. Tentukan letak dan sifat bayangannya.', jawab: '1/s′ = 1/10 − 1/15 = 1/30 → s′ = <b>30 cm</b>. M = 30/15 = 2: bayangan <b>nyata, terbalik, diperbesar 2 kali</b>.' } },

  // ======================= KELAS XII =======================
  { id: 'listrik-statis', kelas: 'XII', judul: 'Listrik Statis', ikon: 'fa-bolt-lightning', sim: true, isi: `
    <div class="rumus">Hukum Coulomb: F = k·q₁·q₂ / r² &nbsp;&nbsp; k = 9 × 10⁹ N·m²/C²</div>
    <div class="rumus">Medan listrik: E = F/q = k·q/r² &nbsp;&nbsp; Potensial: V = k·q/r</div>
    <p>Muatan sejenis tolak-menolak, muatan berlainan tarik-menarik. Garis medan keluar dari muatan positif dan masuk ke muatan negatif.</p>
    <div class="rumus">Kapasitor: C = ε₀·A/d &nbsp;&nbsp; Q = C·V &nbsp;&nbsp; W = ½·C·V²</div>
    <p>Kapasitor seri: 1/C_s = Σ 1/C; paralel: C_p = Σ C. Hukum Gauss: Φ = E·A cos θ = q/ε₀.</p>`,
    contoh: { soal: 'Dua muatan masing-masing 2 μC berjarak 0,3 m. Berapa gaya Coulomb di antara keduanya?', jawab: 'F = 9 × 10⁹ · (2 × 10⁻⁶)² / 0,3² = 9 × 10⁹ · 4 × 10⁻¹² / 0,09 = <b>0,4 N</b> (tolak-menolak).' } },
  { id: 'listrik-dc', kelas: 'XII', judul: 'Listrik Arus Searah', ikon: 'fa-car-battery', sim: true, isi: `
    <div class="rumus">I = Q/t &nbsp;&nbsp; Hukum Ohm: V = I·R &nbsp;&nbsp; R = ρ·L/A</div>
    <div class="rumus">Seri: R_s = R₁ + R₂ + … &nbsp;&nbsp; Paralel: 1/R_p = 1/R₁ + 1/R₂ + …</div>
    <p><b>Hukum I Kirchhoff:</b> ΣI masuk = ΣI keluar. <b>Hukum II Kirchhoff:</b> Σε + ΣI·R = 0 dalam satu loop tertutup.</p>
    <div class="rumus">Dengan hambatan dalam: I = ε / (R + r) &nbsp;&nbsp; tegangan jepit V = ε − I·r</div>
    <div class="rumus">Daya: P = V·I = I²·R = V²/R &nbsp;&nbsp; Energi: W = P·t</div>`,
    contoh: { soal: 'Baterai 12 V dengan hambatan dalam 1 Ω dihubungkan ke hambatan 5 Ω. Tentukan arus dan tegangan jepitnya.', jawab: 'I = 12/(5 + 1) = <b>2 A</b>; V = 12 − 2·1 = <b>10 V</b>.' } },
  { id: 'magnet', kelas: 'XII', judul: 'Medan Magnet', ikon: 'fa-magnet', sim: true, isi: `
    <div class="rumus">Kawat lurus panjang: B = μ₀·I / (2π·a) &nbsp;&nbsp; μ₀ = 4π × 10⁻⁷ Wb/A·m</div>
    <div class="rumus">Kawat melingkar (pusat): B = μ₀·I·N / (2a) &nbsp;&nbsp; Solenoida: B = μ₀·I·N / L</div>
    <div class="rumus">Gaya Lorentz: F = B·I·L sin θ &nbsp;&nbsp; F = q·v·B sin θ</div>
    <p>Arah medan magnet di sekitar kawat ditentukan dengan <b>kaidah tangan kanan</b>: ibu jari menunjuk arah arus, lipatan jari menunjuk arah medan. Dua kawat sejajar berarus searah saling tarik: <span class="rumus-inline">F/L = μ₀·I₁·I₂ / (2π·a)</span>.</p>`,
    contoh: { soal: 'Kawat lurus panjang dialiri arus 10 A. Berapa induksi magnetik pada jarak 0,1 m?', jawab: 'B = 4π × 10⁻⁷ · 10 / (2π · 0,1) = <b>2 × 10⁻⁵ T</b>.' } },
  { id: 'induksi', kelas: 'XII', judul: 'Induksi Elektromagnetik', ikon: 'fa-plug-circle-bolt', sim: true, isi: `
    <div class="rumus">Fluks: Φ = B·A cos θ &nbsp;&nbsp; Hukum Faraday: ε = −N · ΔΦ/Δt</div>
    <p><b>Hukum Lenz:</b> arus induksi menimbulkan medan magnet yang melawan perubahan fluks penyebabnya (tanda negatif).</p>
    <div class="rumus">Batang konduktor bergerak: ε = B·L·v</div>
    <div class="rumus">Induktansi diri: ε = −L · ΔI/Δt &nbsp;&nbsp; energi W = ½·L·I²</div>
    <div class="rumus">Transformator: V_p/V_s = N_p/N_s = I_s/I_p &nbsp;&nbsp; η = P_s/P_p × 100%</div>
    <p>GGL induksi semakin besar jika magnet digerakkan lebih cepat, jumlah lilitan lebih banyak, atau magnet lebih kuat.</p>`,
    contoh: { soal: 'Kumparan 100 lilitan mengalami perubahan fluks 0,02 Wb dalam 0,1 s. Berapa GGL induksinya?', jawab: '|ε| = 100 · 0,02 / 0,1 = <b>20 V</b>.' } },
  { id: 'ac', kelas: 'XII', judul: 'Listrik Arus Bolak-balik', ikon: 'fa-plug', sim: true, isi: `
    <div class="rumus">Generator: ε = ε_maks sin ωt, dengan ε_maks = N·B·A·ω</div>
    <div class="rumus">Nilai efektif: V_ef = V_maks/√2 &nbsp;&nbsp; I_ef = I_maks/√2</div>
    <div class="rumus">X_L = ω·L &nbsp;&nbsp; X_C = 1/(ω·C) &nbsp;&nbsp; Z = √(R² + (X_L − X_C)²)</div>
    <div class="rumus">Resonansi: f = 1 / (2π√(LC)) &nbsp;&nbsp; Daya: P = V_ef·I_ef·cos φ, cos φ = R/Z</div>
    <p>Tegangan listrik PLN di Indonesia 220 V (nilai efektif) dengan frekuensi 50 Hz, sehingga tegangan maksimumnya ≈ 311 V.</p>`,
    contoh: { soal: 'Rangkaian RLC seri memiliki R = 60 Ω, X_L = 120 Ω, dan X_C = 40 Ω. Berapa impedansinya?', jawab: 'Z = √(60² + (120 − 40)²) = √(3600 + 6400) = <b>100 Ω</b>.' } },
  { id: 'gem', kelas: 'XII', judul: 'Gelombang Elektromagnetik', ikon: 'fa-tower-broadcast', sim: true, isi: `
    <p>Gelombang elektromagnetik (GEM) terdiri atas medan listrik E dan medan magnet B yang saling tegak lurus dan tegak lurus terhadap arah rambat. GEM <b>tidak membutuhkan medium</b>.</p>
    <div class="rumus">c = 1/√(μ₀ε₀) = 3 × 10⁸ m/s &nbsp;&nbsp; c = λ·f &nbsp;&nbsp; E/B = c</div>
    <table><thead><tr><th>Spektrum (frekuensi naik ↓)</th><th>Pemanfaatan</th></tr></thead><tbody>
    <tr><td>Gelombang radio</td><td>radio, televisi</td></tr><tr><td>Gelombang mikro</td><td>radar, oven microwave, Wi-Fi</td></tr>
    <tr><td>Inframerah</td><td>remote TV, kamera termal</td></tr><tr><td>Cahaya tampak</td><td>penglihatan, serat optik</td></tr>
    <tr><td>Ultraviolet</td><td>sterilisasi, pembentukan vitamin D</td></tr><tr><td>Sinar-X</td><td>rontgen</td></tr><tr><td>Sinar gamma</td><td>terapi kanker, sterilisasi alat medis</td></tr></tbody></table>
    <p>Semakin tinggi frekuensinya, semakin besar energi fotonnya dan semakin berbahaya bagi jaringan hidup.</p>`,
    contoh: { soal: 'Stasiun radio memancarkan gelombang berfrekuensi 100 MHz. Berapa panjang gelombangnya?', jawab: 'λ = c/f = 3 × 10⁸ / 10⁸ = <b>3 m</b>.' } },
  { id: 'kuantum', kelas: 'XII', judul: 'Radiasi Benda Hitam & Efek Fotolistrik', ikon: 'fa-sun', sim: true, isi: `
    <div class="rumus">Stefan–Boltzmann: P = e·σ·A·T⁴ &nbsp;&nbsp; σ = 5,67 × 10⁻⁸ W/m²K⁴</div>
    <div class="rumus">Pergeseran Wien: λ_maks · T = 2,898 × 10⁻³ m·K</div>
    <div class="rumus">Energi foton (Planck): E = h·f = h·c/λ &nbsp;&nbsp; h = 6,63 × 10⁻³⁴ J·s<br>Praktis: E (eV) ≈ 1240 / λ (nm)</div>
    <div class="rumus">Efek fotolistrik: E_k maks = h·f − W₀ &nbsp;&nbsp; W₀ = h·f₀</div>
    <p>Elektron hanya lepas jika frekuensi cahaya lebih besar dari frekuensi ambang f₀. Menambah intensitas hanya menambah <b>jumlah</b> elektron, bukan energinya. Gejala lain: efek Compton dan dualisme gelombang-partikel de Broglie (λ = h/mv).</p>`,
    contoh: { soal: 'Cahaya 400 nm menyinari logam natrium (W₀ = 2,28 eV). Berapa energi kinetik maksimum elektron?', jawab: 'E = 1240/400 = 3,1 eV. E_k = 3,1 − 2,28 = <b>0,82 eV</b>.' } },
  { id: 'relativitas', kelas: 'XII', judul: 'Relativitas Khusus', ikon: 'fa-rocket', sim: true, isi: `
    <p><b>Postulat Einstein:</b> (1) hukum fisika sama di semua kerangka acuan inersial; (2) cepat rambat cahaya di ruang hampa sama untuk semua pengamat.</p>
    <div class="rumus">γ = 1 / √(1 − v²/c²)</div>
    <div class="rumus">Dilatasi waktu: Δt = γ·Δt₀ &nbsp;&nbsp; Kontraksi panjang: L = L₀/γ</div>
    <div class="rumus">Massa relativistik: m = γ·m₀ &nbsp;&nbsp; E₀ = m₀c² &nbsp;&nbsp; E_k = (γ − 1)·m₀c²</div>
    <div class="rumus">Penjumlahan kecepatan: v = (v₁ + v₂) / (1 + v₁v₂/c²)</div>`,
    contoh: { soal: 'Pesawat bergerak dengan kecepatan 0,6c. Berapa faktor γ dan panjang pesawat 100 m menurut pengamat diam?', jawab: 'γ = 1/√(1 − 0,36) = 1/0,8 = <b>1,25</b>. L = 100/1,25 = <b>80 m</b>.' } },
  { id: 'atom', kelas: 'XII', judul: 'Teori Atom', ikon: 'fa-atom', sim: true, isi: `
    <p>Perkembangan model atom: <b>Dalton</b> (bola pejal) → <b>Thomson</b> (roti kismis) → <b>Rutherford</b> (inti bermuatan positif dikelilingi elektron) → <b>Bohr</b> (elektron pada lintasan stasioner berenergi tertentu) → <b>mekanika kuantum</b> (orbital).</p>
    <div class="rumus">Energi elektron atom H: E_n = −13,6 / n² eV &nbsp;&nbsp; jari-jari r_n = 0,53·n² Å</div>
    <div class="rumus">Transisi: ΔE = 13,6 (1/n_akhir² − 1/n_awal²) eV &nbsp;&nbsp; λ (nm) ≈ 1240/ΔE</div>
    <p>Elektron memancarkan foton saat pindah ke lintasan lebih dalam, dan menyerap foton saat naik. Deret spektrum: <b>Lyman</b> (ke n = 1, ultraviolet), <b>Balmer</b> (ke n = 2, cahaya tampak), <b>Paschen</b> (ke n = 3), <b>Brackett</b> (n = 4), <b>Pfund</b> (n = 5) — ketiganya inframerah.</p>`,
    contoh: { soal: 'Elektron atom hidrogen berpindah dari n = 3 ke n = 2. Berapa energi dan panjang gelombang foton yang dipancarkan?', jawab: 'ΔE = 13,6 (1/4 − 1/9) = 13,6 · 5/36 ≈ <b>1,89 eV</b>; λ ≈ 1240/1,89 ≈ <b>656 nm</b> (merah, deret Balmer).' } },
  { id: 'inti', kelas: 'XII', judul: 'Fisika Inti & Radioaktivitas', ikon: 'fa-radiation', sim: true, isi: `
    <p>Inti atom <sup>A</sup><sub>Z</sub>X terdiri atas Z proton dan (A − Z) neutron.</p>
    <div class="rumus">Defek massa: Δm = (Z·m_p + N·m_n) − m_inti &nbsp;&nbsp; Energi ikat: E = Δm × 931,5 MeV/sma</div>
    <p><b>Peluruhan radioaktif:</b> alfa α (<sup>4</sup><sub>2</sub>He, daya tembus paling kecil), beta β⁻ (elektron), gamma γ (gelombang EM, daya tembus paling besar).</p>
    <div class="rumus">N = N₀ · (½)^(t / T½) &nbsp;&nbsp; λ = 0,693 / T½ &nbsp;&nbsp; Aktivitas A = λ·N</div>
    <p><b>Fisi</b>: inti berat terbelah (PLTN). <b>Fusi</b>: inti ringan bergabung (energi Matahari). Manfaat radioisotop: penanggalan karbon-14, kedokteran nuklir, pengawetan makanan, dan perunut kebocoran pipa.</p>`,
    contoh: { soal: 'Suatu isotop memiliki waktu paruh 5 tahun. Berapa bagian yang tersisa setelah 20 tahun?', jawab: 't/T½ = 20/5 = 4, sehingga N = N₀ · (½)⁴ = <b>1/16 N₀</b>.' } },
  { id: 'digital', kelas: 'XII', judul: 'Teknologi Digital', ikon: 'fa-microchip', sim: false, isi: `
    <p><b>Sinyal analog</b> bernilai kontinu (misalnya gelombang suara). <b>Sinyal digital</b> bernilai diskrit, biasanya 0 dan 1 (bit). 8 bit = 1 byte.</p>
    <div class="rumus">Jumlah level kuantisasi = 2ⁿ (n = jumlah bit)</div>
    <p><b>Konversi analog ke digital (ADC)</b> dilakukan melalui pencuplikan (sampling), kuantisasi, dan pengodean. Menurut teorema Nyquist, frekuensi sampling minimal 2 kali frekuensi sinyal tertinggi (<span class="rumus-inline">f_s ≥ 2·f_maks</span>).</p>
    <p><b>Transmisi data:</b> kabel tembaga, gelombang radio (Wi-Fi, seluler), dan <b>serat optik</b>, yang memanfaatkan pemantulan sempurna cahaya sehingga cepat dan tahan gangguan.</p>
    <p><b>Peran fisika:</b> semikonduktor (dioda, transistor, chip), LED, sensor (cahaya, suhu, gerak pada HP), dan panel surya.</p>
    <p>Kelebihan sinyal digital: tahan derau, mudah disimpan dan dikompresi, serta dapat dienkripsi.</p>`,
    contoh: { soal: 'Sebuah ADC menggunakan 8 bit. Berapa banyak level tegangan yang dapat dibedakan?', jawab: '2⁸ = <b>256 level</b>.' } },
];

// ans = indeks jawaban benar; ex = pembahasan.
export const KUIS = {
  X: [
    { q: 'Satuan SI untuk kuat arus listrik adalah…', o: ['volt', 'ampere', 'ohm', 'coulomb'], ans: 1, ex: 'Kuat arus listrik adalah besaran pokok dengan satuan ampere (A).' },
    { q: 'Ketelitian jangka sorong adalah…', o: ['1 mm', '0,5 mm', '0,1 mm', '0,01 mm'], ans: 2, ex: 'Skala nonius jangka sorong membagi 1 mm menjadi 10 bagian, sehingga ketelitiannya 0,1 mm.' },
    { q: 'Dua vektor 6 N dan 8 N saling tegak lurus. Resultannya adalah…', o: ['2 N', '10 N', '12 N', '14 N'], ans: 1, ex: 'R = √(6² + 8²) = √100 = 10 N.' },
    { q: 'Mobil bergerak dari diam dengan percepatan 2 m/s² selama 5 s. Jarak yang ditempuh adalah…', o: ['10 m', '20 m', '25 m', '50 m'], ans: 2, ex: 's = ½·a·t² = ½ · 2 · 25 = 25 m.' },
    { q: 'Benda jatuh bebas dari ketinggian 20 m (g = 10 m/s²). Waktu untuk sampai di tanah adalah…', o: ['1 s', '√2 s', '2 s', '4 s'], ans: 2, ex: 'h = ½·g·t² → 20 = 5t² → t = 2 s.' },
    { q: 'Sudut elevasi yang menghasilkan jangkauan maksimum pada gerak parabola adalah…', o: ['30°', '45°', '60°', '90°'], ans: 1, ex: 'R = v₀² sin 2θ / g bernilai maksimum saat sin 2θ = 1, yaitu θ = 45°.' },
    { q: 'Benda bergerak melingkar dengan r = 2 m dan v = 4 m/s. Percepatan sentripetalnya adalah…', o: ['2 m/s²', '4 m/s²', '8 m/s²', '16 m/s²'], ans: 2, ex: 'a_s = v²/r = 16/2 = 8 m/s².' },
    { q: 'Penumpang terdorong ke depan saat bus direm mendadak. Peristiwa ini dijelaskan oleh…', o: ['Hukum I Newton', 'Hukum II Newton', 'Hukum III Newton', 'Hukum Kepler'], ans: 0, ex: 'Hukum I (inersia): benda cenderung mempertahankan keadaan geraknya.' },
    { q: 'Gaya 10 N bekerja pada benda 2 kg di bidang licin. Percepatannya adalah…', o: ['0,2 m/s²', '5 m/s²', '12 m/s²', '20 m/s²'], ans: 1, ex: 'a = F/m = 10/2 = 5 m/s².' },
    { q: 'Jika jarak dua benda dijadikan 2 kali semula, gaya gravitasinya menjadi…', o: ['¼ kali', '½ kali', '2 kali', '4 kali'], ans: 0, ex: 'F ∝ 1/r², sehingga F′ = F/4.' },
    { q: 'Benda 2 kg bergerak dengan kecepatan 3 m/s. Energi kinetiknya adalah…', o: ['3 J', '6 J', '9 J', '18 J'], ans: 2, ex: 'E_k = ½·m·v² = ½ · 2 · 9 = 9 J.' },
    { q: 'Satuan impuls setara dengan satuan…', o: ['N/s', 'N·s', 'J', 'W'], ans: 1, ex: 'I = F·Δt sehingga satuannya N·s, setara dengan kg·m/s (satuan momentum).' },
    { q: 'Pada tumbukan tidak lenting sama sekali, koefisien restitusinya adalah…', o: ['0', '0,5', '1', 'tak hingga'], ans: 0, ex: 'Kedua benda menyatu sehingga kecepatan relatif setelah tumbukan nol: e = 0.' },
    { q: 'Beban 1 kg digantung pada pegas dengan k = 100 N/m. Periode getarannya adalah…', o: ['0,1π s', '0,2π s', '2π s', '10π s'], ans: 1, ex: 'T = 2π √(m/k) = 2π √0,01 = 0,2π s.' },
    { q: 'Berikut yang termasuk sumber energi terbarukan adalah…', o: ['Minyak bumi', 'Batu bara', 'Angin', 'Gas alam'], ans: 2, ex: 'Angin tersedia terus-menerus secara alami; tiga lainnya adalah bahan bakar fosil.' },
  ],
  XI: [
    { q: 'Momen inersia bola pejal terhadap porosnya adalah…', o: ['m·r²', '½·m·r²', '⅖·m·r²', '1/12·m·r²'], ans: 2, ex: 'Untuk bola pejal, k = ⅖.' },
    { q: 'Cincin, silinder pejal, dan bola pejal dilepas bersamaan menggelinding di bidang miring. Yang tiba paling dulu adalah…', o: ['Cincin', 'Silinder pejal', 'Bola pejal', 'Tiba bersamaan'], ans: 2, ex: 'a = g sin θ/(1 + k); bola pejal memiliki k terkecil (⅖) sehingga percepatannya terbesar.' },
    { q: 'Syarat kesetimbangan benda tegar adalah…', o: ['ΣF = 0 saja', 'Στ = 0 saja', 'ΣF = 0 dan Στ = 0', 'ΣF = m·a'], ans: 2, ex: 'Benda tegar setimbang jika tidak bertranslasi (ΣF = 0) dan tidak berotasi (Στ = 0).' },
    { q: 'Dua pegas identik dengan konstanta k disusun paralel. Konstanta penggantinya adalah…', o: ['k/2', 'k', '2k', '4k'], ans: 2, ex: 'Paralel: k_p = k + k = 2k.' },
    { q: 'Tekanan hidrostatis di kedalaman 5 m dalam air (ρ = 1000 kg/m³, g = 10 m/s²) adalah…', o: ['500 Pa', '5.000 Pa', '50.000 Pa', '500.000 Pa'], ans: 2, ex: 'P_h = ρ·g·h = 1000 · 10 · 5 = 50.000 Pa.' },
    { q: 'Benda akan terapung di dalam zat cair jika…', o: ['ρ_benda > ρ_fluida', 'ρ_benda = ρ_fluida', 'ρ_benda < ρ_fluida', 'massanya kecil'], ans: 2, ex: 'Jika massa jenis benda lebih kecil dari fluida, gaya apung maksimum melebihi beratnya.' },
    { q: 'Pada pipa, A₁ = 3A₂ dan v₁ = 2 m/s. Kecepatan v₂ adalah…', o: ['⅔ m/s', '1,5 m/s', '3 m/s', '6 m/s'], ans: 3, ex: 'A₁·v₁ = A₂·v₂ → 3A · 2 = A · v₂ → v₂ = 6 m/s.' },
    { q: 'Gaya angkat pada sayap pesawat dijelaskan oleh…', o: ['Hukum Pascal', 'Hukum Archimedes', 'Asas Bernoulli', 'Hukum Hooke'], ans: 2, ex: 'Udara di atas sayap lebih cepat sehingga tekanannya lebih kecil daripada di bawah sayap.' },
    { q: 'Kalor untuk menaikkan suhu 2 kg air (c = 4200 J/kg°C) sebesar 10 °C adalah…', o: ['840 J', '8.400 J', '42.000 J', '84.000 J'], ans: 3, ex: 'Q = m·c·ΔT = 2 · 4200 · 10 = 84.000 J.' },
    { q: 'Perpindahan kalor yang tidak memerlukan medium adalah…', o: ['Konduksi', 'Konveksi', 'Radiasi', 'Isolasi'], ans: 2, ex: 'Radiasi merambat sebagai gelombang elektromagnetik, contohnya panas Matahari sampai ke Bumi.' },
    { q: 'Jika suhu mutlak gas dinaikkan 4 kali, kecepatan efektif partikelnya menjadi…', o: ['½ kali', '2 kali', '4 kali', '16 kali'], ans: 1, ex: 'v_rms ∝ √T = √4 = 2 kali.' },
    { q: 'Proses termodinamika yang tidak menghasilkan usaha (W = 0) adalah…', o: ['Isobarik', 'Isokhorik', 'Isotermal', 'Adiabatik'], ans: 1, ex: 'Pada isokhorik volume tetap, sehingga ΔV = 0 dan W = 0.' },
    { q: 'Efisiensi mesin Carnot yang bekerja antara 600 K dan 300 K adalah…', o: ['25%', '50%', '75%', '100%'], ans: 1, ex: 'η = 1 − 300/600 = 50%.' },
    { q: 'Gelombang dengan frekuensi 4 Hz dan panjang gelombang 0,5 m memiliki cepat rambat…', o: ['0,125 m/s', '2 m/s', '4,5 m/s', '8 m/s'], ans: 1, ex: 'v = λ·f = 0,5 · 4 = 2 m/s.' },
    { q: 'Sirene ambulans terdengar lebih tinggi saat mendekat. Peristiwa ini disebut…', o: ['Resonansi', 'Efek Doppler', 'Interferensi', 'Polarisasi'], ans: 1, ex: 'Efek Doppler: frekuensi yang terdengar berubah karena gerak relatif sumber dan pendengar.' },
    { q: 'Benda diletakkan 15 cm di depan lensa cembung (f = 10 cm). Bayangannya terletak pada…', o: ['6 cm', '15 cm', '25 cm', '30 cm'], ans: 3, ex: '1/s′ = 1/10 − 1/15 = 1/30, sehingga s′ = 30 cm.' },
    { q: 'Penderita rabun jauh (miopi) dibantu dengan kacamata berlensa…', o: ['Cembung', 'Cekung', 'Silinder', 'Bifokal'], ans: 1, ex: 'Lensa cekung menyebarkan cahaya sehingga bayangan benda jauh jatuh tepat di retina.' },
  ],
  XII: [
    { q: 'Jarak dua muatan dijadikan ½ kali semula. Gaya Coulombnya menjadi…', o: ['¼ kali', '½ kali', '2 kali', '4 kali'], ans: 3, ex: 'F ∝ 1/r², sehingga F′ = F/(½)² = 4F.' },
    { q: 'Satuan kapasitas kapasitor adalah…', o: ['farad', 'henry', 'tesla', 'weber'], ans: 0, ex: 'Kapasitas diukur dalam farad (F) = coulomb/volt.' },
    { q: 'Tiga hambatan 6 Ω disusun paralel. Hambatan penggantinya adalah…', o: ['2 Ω', '3 Ω', '6 Ω', '18 Ω'], ans: 0, ex: '1/R_p = 3 × 1/6 = ½, sehingga R_p = 2 Ω.' },
    { q: 'Baterai 12 V (r = 1 Ω) dihubungkan ke hambatan 5 Ω. Arus yang mengalir adalah…', o: ['1 A', '2 A', '2,4 A', '12 A'], ans: 1, ex: 'I = ε/(R + r) = 12/6 = 2 A.' },
    { q: 'Induksi magnetik di sekitar kawat lurus berarus…', o: ['sebanding dengan jarak', 'sebanding dengan arus dan berbanding terbalik dengan jarak', 'tidak bergantung pada arus', 'sebanding dengan kuadrat jarak'], ans: 1, ex: 'B = μ₀·I/(2π·a).' },
    { q: 'Arah gaya Lorentz dapat ditentukan dengan…', o: ['Hukum Lenz', 'Kaidah tangan kanan', 'Hukum Ohm', 'Hukum Coulomb'], ans: 1, ex: 'Kaidah tangan kanan menghubungkan arah arus, medan magnet, dan gaya.' },
    { q: 'GGL induksi pada kumparan akan bertambah besar jika…', o: ['magnet digerakkan lebih cepat', 'magnet digerakkan lebih lambat', 'magnet didiamkan', 'jumlah lilitan dikurangi'], ans: 0, ex: 'ε = −N·ΔΦ/Δt; gerak lebih cepat memperkecil Δt sehingga ε membesar.' },
    { q: 'Transformator memiliki N_p = 1000, N_s = 200, dan V_p = 220 V. Tegangan sekundernya adalah…', o: ['22 V', '44 V', '440 V', '1100 V'], ans: 1, ex: 'V_s = V_p · N_s/N_p = 220 · 200/1000 = 44 V.' },
    { q: 'Rangkaian RLC dengan R = 60 Ω, X_L = 120 Ω, dan X_C = 40 Ω memiliki impedansi…', o: ['80 Ω', '100 Ω', '140 Ω', '220 Ω'], ans: 1, ex: 'Z = √(60² + 80²) = 100 Ω.' },
    { q: 'Gelombang elektromagnetik yang memiliki frekuensi paling tinggi adalah…', o: ['Gelombang radio', 'Inframerah', 'Ultraviolet', 'Sinar gamma'], ans: 3, ex: 'Urutan frekuensi naik: radio, mikro, inframerah, tampak, UV, sinar-X, gamma.' },
    { q: 'Pada efek fotolistrik, menambah intensitas cahaya akan…', o: ['menambah energi kinetik elektron', 'menambah jumlah elektron yang lepas', 'menurunkan frekuensi ambang', 'tidak berpengaruh sama sekali'], ans: 1, ex: 'Intensitas menentukan jumlah foton, sedangkan energi tiap foton ditentukan frekuensi.' },
    { q: 'Energi foton dengan panjang gelombang 620 nm kira-kira…', o: ['1 eV', '2 eV', '3,1 eV', '6,2 eV'], ans: 1, ex: 'E ≈ 1240/λ(nm) = 1240/620 = 2 eV.' },
    { q: 'Pesawat bergerak dengan kecepatan 0,6c. Nilai γ-nya adalah…', o: ['0,8', '1,25', '1,6', '1,67'], ans: 1, ex: 'γ = 1/√(1 − 0,36) = 1/0,8 = 1,25.' },
    { q: 'Deret Balmer terjadi ketika elektron berpindah ke lintasan…', o: ['n = 1', 'n = 2', 'n = 3', 'n = 4'], ans: 1, ex: 'Balmer: transisi ke n = 2, menghasilkan cahaya tampak.' },
    { q: 'Waktu paruh suatu isotop 2 hari. Setelah 6 hari, bagian yang tersisa adalah…', o: ['⅓', '¼', '⅙', '⅛'], ans: 3, ex: 't/T½ = 3, sehingga N = (½)³ N₀ = ⅛ N₀.' },
    { q: 'Partikel alfa identik dengan inti atom…', o: ['Hidrogen', 'Helium', 'Litium', 'Karbon'], ans: 1, ex: 'Partikel α = ⁴₂He (2 proton dan 2 neutron).' },
  ],
};
