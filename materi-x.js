// Materi Fisika kelas X. Setiap rumus punya tombol "Coba di simulasi" ke mode simulasinya.
export const coba = (bab, mode, teks = 'Coba di simulasi') => `<p><a class="btn small ghost" href="#/sim/${bab}/${mode}"><i class="fa-solid fa-cube" aria-hidden="true"></i> ${teks}</a></p>`;
export const simbol = rows => `<table><thead><tr><th>Simbol</th><th>Arti</th><th>Satuan</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table>`;
export const tips = items => `<h3>Tips &amp; kesalahan umum</h3><ul>${items.map(t => `<li>${t}</li>`).join('')}</ul>`;

export const MATERI_X = [
  { id: 'pengukuran', kelas: 'X', judul: 'Besaran, Satuan & Pengukuran', ikon: 'fa-ruler', sim: true, isi: `
    <p class="lead">Mengukur berarti membandingkan sesuatu dengan satuan yang sudah disepakati. Kalau setiap orang memakai "jengkal" masing-masing, hasilnya tidak bisa dibandingkan. Karena itu dunia memakai Sistem Internasional (SI).</p>
    <h3>Besaran pokok dan besaran turunan</h3>
    <p><b>Besaran pokok</b> satuannya ditetapkan lebih dulu. <b>Besaran turunan</b> disusun dari besaran pokok, misalnya kecepatan = panjang ÷ waktu.</p>
    <table><thead><tr><th>Besaran pokok</th><th>Satuan SI</th><th>Dimensi</th></tr></thead><tbody>
    <tr><td>Panjang</td><td>meter (m)</td><td>[L]</td></tr><tr><td>Massa</td><td>kilogram (kg)</td><td>[M]</td></tr><tr><td>Waktu</td><td>sekon (s)</td><td>[T]</td></tr>
    <tr><td>Kuat arus listrik</td><td>ampere (A)</td><td>[I]</td></tr><tr><td>Suhu</td><td>kelvin (K)</td><td>[θ]</td></tr><tr><td>Jumlah zat</td><td>mol</td><td>[N]</td></tr><tr><td>Intensitas cahaya</td><td>kandela (cd)</td><td>[J]</td></tr></tbody></table>
    <p><b>Dimensi</b> dipakai untuk memeriksa rumus: kedua ruas persamaan harus berdimensi sama. Contoh, gaya F = m·a berdimensi [M][L][T]⁻².</p>
    <h3>Jangka sorong (ketelitian 0,1 mm)</h3>
    <p>Jangka sorong punya dua skala: <b>skala utama</b> (mm) dan <b>skala nonius</b> (10 bagian sepanjang 9 mm). Cari garis nonius yang <b>tepat segaris</b> dengan garis skala utama.</p>
    <div class="rumus">Hasil = skala utama + (nomor garis nonius yang segaris × 0,01 cm)</div>
    ${coba('pengukuran', 'jangka-sorong', 'Coba membaca jangka sorong')}
    <h3>Mikrometer sekrup (ketelitian 0,01 mm)</h3>
    <p>Satu putaran selubung memajukan poros 0,5 mm, dan selubung dibagi 50 skala, sehingga satu skala = 0,01 mm. Cocok untuk benda sangat tipis seperti kertas atau kawat.</p>
    <div class="rumus">Hasil = skala utama (mm, kelipatan 0,5) + (skala putar × 0,01 mm)</div>
    ${coba('pengukuran', 'mikrometer', 'Coba membaca mikrometer')}
    <h3>Angka penting</h3>
    <ul><li>Semua angka bukan nol adalah angka penting (AP): 2,37 → 3 AP.</li><li>Nol di antara angka bukan nol penting: 1,05 → 3 AP.</li><li>Nol di depan tidak penting: 0,0042 → 2 AP.</li>
    <li><b>Perkalian/pembagian:</b> hasil mengikuti AP paling sedikit. <b>Penjumlahan/pengurangan:</b> hasil mengikuti angka di belakang koma paling sedikit.</li></ul>
    ${tips(['Baca skala sejajar mata agar tidak terjadi kesalahan paralaks.', 'Periksa dulu apakah jangka sorong menunjukkan nol saat rahang dirapatkan (kesalahan titik nol).', 'Jangan menulis hasil lebih teliti dari alatnya: mistar tidak bisa menghasilkan 2,37 cm.'])}`,
    contoh: [
      { soal: 'Pada jangka sorong, skala utama menunjukkan 2,3 cm dan garis nonius ke-7 segaris. Berapa hasilnya?', jawab: 'Hasil = 2,3 + 7 × 0,01 = <b>2,37 cm</b>.' },
      { soal: 'Mikrometer menunjukkan skala utama 4,5 mm dan skala putar 32. Berapa tebal benda?', jawab: 'Tebal = 4,5 + 32 × 0,01 = <b>4,82 mm</b>.' }] },

  { id: 'vektor', kelas: 'X', judul: 'Vektor', ikon: 'fa-up-right-and-down-left-from-center', sim: true, isi: `
    <p class="lead">Mengatakan "jalan 5 meter" belum cukup; kita perlu tahu ke mana. Besaran yang memiliki <b>nilai dan arah</b> disebut vektor (perpindahan, kecepatan, gaya). Yang hanya punya nilai disebut skalar (massa, waktu, suhu).</p>
    <h3>Menjumlahkan dua vektor (resultan)</h3>
    <p>Dua vektor dijumlahkan dengan metode jajargenjang: letakkan pangkalnya di satu titik, lengkapi jajargenjangnya, dan diagonalnya adalah resultan.</p>
    <div class="rumus">R = √(A² + B² + 2AB cos α)</div>
    ${simbol([['R', 'resultan vektor', 'sesuai besaran (mis. N)'], ['A, B', 'besar kedua vektor', 'sesuai besaran'], ['α', 'sudut antara kedua vektor', 'derajat (°)']])}
    <p>Kasus khusus: α = 0° → R = A + B (searah); α = 180° → R = |A − B| (berlawanan); α = 90° → R = √(A² + B²).</p>
    ${coba('vektor', 'resultan', 'Coba menjumlahkan vektor')}
    <h3>Menguraikan vektor menjadi komponen</h3>
    <p>Setiap vektor miring bisa dipecah menjadi bagian mendatar (x) dan tegak (y). Cara ini memudahkan menjumlahkan banyak vektor.</p>
    <div class="rumus">Aₓ = A cos θ &nbsp;&nbsp; A_y = A sin θ<br>R = √(ΣAₓ² + ΣA_y²) &nbsp;&nbsp; tan θ_R = ΣA_y / ΣAₓ</div>
    ${simbol([['θ', 'sudut vektor terhadap sumbu x positif', '°'], ['Aₓ, A_y', 'komponen mendatar dan tegak', 'sesuai besaran']])}
    ${coba('vektor', 'komponen', 'Coba menguraikan vektor')}
    ${tips(['Resultan dua vektor tidak pernah lebih besar dari A + B dan tidak lebih kecil dari |A − B|.', 'Perhatikan kuadran: komponen bisa bernilai negatif.', 'Jarak (skalar) berbeda dengan perpindahan (vektor).'])}`,
    contoh: [
      { soal: 'Dua gaya 3 N dan 4 N bekerja pada satu titik dan saling tegak lurus. Berapa resultannya?', jawab: 'R = √(3² + 4²) = √25 = <b>5 N</b>.' },
      { soal: 'Gaya 10 N membentuk sudut 30° terhadap horizontal. Tentukan komponennya.', jawab: 'Fₓ = 10 cos 30° ≈ <b>8,66 N</b>; F_y = 10 sin 30° = <b>5 N</b>.' }] },

  { id: 'gerak-lurus', kelas: 'X', judul: 'Gerak Lurus (GLB & GLBB)', ikon: 'fa-car-side', sim: true, isi: `
    <p class="lead">Mobil di jalan tol yang speedometernya tidak berubah sedang melakukan GLB. Mobil yang mulai melaju dari lampu merah sedang melakukan GLBB, karena kecepatannya berubah secara teratur.</p>
    <h3>Gerak Lurus Beraturan (GLB) dan Berubah Beraturan (GLBB)</h3>
    <p><b>GLB:</b> kecepatan tetap, percepatan nol. <b>GLBB:</b> percepatan tetap, kecepatan bertambah (dipercepat) atau berkurang (diperlambat) sama besar setiap detik.</p>
    <div class="rumus">GLB: s = v·t<br>GLBB: v_t = v₀ + a·t &nbsp;&nbsp; s = v₀·t + ½·a·t² &nbsp;&nbsp; v_t² = v₀² + 2·a·s</div>
    ${simbol([['s', 'jarak tempuh', 'm'], ['v₀, v_t', 'kecepatan awal dan akhir', 'm/s'], ['a', 'percepatan (negatif = perlambatan)', 'm/s²'], ['t', 'waktu', 's']])}
    ${coba('gerak-lurus', 'glbb', 'Coba simulasi GLB/GLBB')}
    <h3>Gerak vertikal dan jatuh bebas</h3>
    <p>Benda yang dilempar ke atas atau dijatuhkan hanya dipengaruhi gravitasi, sehingga percepatannya selalu g = 10 m/s² ke bawah. <b>Jatuh bebas</b> adalah GLBB dengan v₀ = 0.</p>
    <div class="rumus">Ke atas: v_t = v₀ − g·t &nbsp;&nbsp; h = v₀·t − ½·g·t²<br>Puncak: t_naik = v₀/g &nbsp;&nbsp; h_maks = v₀²/(2g)<br>Jatuh bebas: h = ½·g·t² &nbsp;&nbsp; v = √(2·g·h)</div>
    ${coba('gerak-lurus', 'vertikal', 'Coba gerak vertikal')}
    <h3>Membaca grafik</h3>
    <ul><li>Grafik s–t: kemiringannya = kecepatan.</li><li>Grafik v–t: kemiringannya = percepatan, luas di bawahnya = jarak.</li></ul>
    ${tips(['Samakan satuan dulu: 72 km/jam = 20 m/s (bagi 3,6).', 'Di titik tertinggi gerak vertikal, kecepatan nol tetapi percepatan tetap g.', 'Massa tidak memengaruhi gerak jatuh bebas (tanpa hambatan udara).'])}`,
    contoh: [
      { soal: 'Mobil dengan v₀ = 10 m/s dipercepat 2 m/s² selama 5 s. Tentukan v_t dan s.', jawab: 'v_t = 10 + 2·5 = <b>20 m/s</b>; s = 10·5 + ½·2·25 = <b>75 m</b>.' },
      { soal: 'Bola dilempar ke atas 20 m/s. Berapa tinggi maksimumnya?', jawab: 'h_maks = 20²/(2·10) = <b>20 m</b>, dicapai setelah 2 s.' }] },

  { id: 'parabola', kelas: 'X', judul: 'Gerak Parabola', ikon: 'fa-baseball', sim: true, isi: `
    <p class="lead">Bola yang ditendang miring membentuk lengkungan parabola. Rahasianya: gerak mendatar dan gerak tegaknya berjalan sendiri-sendiri. Mendatar bola meluncur tetap (GLB), tegak bola naik-turun dipengaruhi gravitasi (GLBB).</p>
    <h3>Gerak parabola dengan sudut elevasi</h3>
    <div class="rumus">vₓ = v₀ cos θ (tetap) &nbsp;&nbsp; v_y = v₀ sin θ − g·t<br>t_puncak = v₀ sin θ / g &nbsp;&nbsp; H_maks = v₀² sin² θ / (2g) &nbsp;&nbsp; R = v₀² sin 2θ / g</div>
    ${simbol([['v₀', 'kecepatan awal', 'm/s'], ['θ', 'sudut elevasi', '°'], ['H_maks', 'tinggi maksimum', 'm'], ['R', 'jangkauan mendatar', 'm']])}
    <p>Jangkauan terjauh dicapai pada θ = 45°. Pasangan sudut yang jumlahnya 90° (misalnya 30° dan 60°) menghasilkan jangkauan sama.</p>
    ${coba('parabola', 'miring', 'Coba menendang bola')}
    <h3>Benda dilempar mendatar dari ketinggian</h3>
    <p>Paket yang dijatuhkan dari pesawat yang terbang mendatar tetap bergerak maju dengan kecepatan pesawat, sambil jatuh bebas.</p>
    <div class="rumus">t = √(2h/g) &nbsp;&nbsp; x = v₀ · t</div>
    ${coba('parabola', 'mendatar', 'Coba lemparan mendatar')}
    ${tips(['Di titik tertinggi, kecepatan tidak nol: masih ada vₓ.', 'Waktu terbang hanya ditentukan gerak vertikal.', 'Gunakan sin 2θ, bukan 2 sin θ.'])}`,
    contoh: [
      { soal: 'Bola ditendang 20 m/s dengan sudut 30°. Tentukan H_maks dan R.', jawab: 'H = 400 × 0,25/20 = <b>5 m</b>; R = 400 × sin 60°/10 ≈ <b>34,6 m</b>.' },
      { soal: 'Batu dilempar mendatar 10 m/s dari tebing setinggi 45 m. Seberapa jauh batu mendarat?', jawab: 't = √(90/10) = 3 s; x = 10 × 3 = <b>30 m</b>.' }] },

  { id: 'melingkar', kelas: 'X', judul: 'Gerak Melingkar', ikon: 'fa-circle-notch', sim: true, isi: `
    <p class="lead">Kipas angin, roda sepeda, dan komidi putar bergerak melingkar. Meski kelajuannya tetap, arahnya terus berubah, sehingga selalu ada percepatan yang mengarah ke pusat lingkaran.</p>
    <h3>Gerak melingkar beraturan (GMB)</h3>
    <div class="rumus">f = 1/T &nbsp;&nbsp; ω = 2πf &nbsp;&nbsp; v = ω·r<br>a_s = v²/r = ω²·r &nbsp;&nbsp; F_s = m·v²/r</div>
    ${simbol([['T', 'periode (waktu satu putaran)', 's'], ['f', 'frekuensi', 'Hz'], ['ω', 'kecepatan sudut', 'rad/s'], ['v', 'kecepatan linear', 'm/s'], ['a_s', 'percepatan sentripetal (ke pusat)', 'm/s²'], ['F_s', 'gaya sentripetal', 'N']])}
    <p>Gaya sentripetal bukan gaya baru: ia diberikan oleh tali, gesekan ban, atau gravitasi.</p>
    ${coba('melingkar', 'gmb', 'Coba memutar bola')}
    <h3>Hubungan roda-roda</h3>
    <ul><li><b>Seporos</b> (satu as): kecepatan sudut sama, ω₁ = ω₂.</li><li><b>Bersinggungan atau dihubungkan rantai/sabuk:</b> kecepatan linear sama, v₁ = v₂, sehingga ω₁r₁ = ω₂r₂.</li></ul>
    ${coba('melingkar', 'roda', 'Coba hubungan roda-roda')}
    ${tips(['Arah kecepatan selalu menyinggung lingkaran; arah percepatan selalu ke pusat.', 'Jika gaya sentripetal hilang, benda bergerak lurus menyinggung lintasan, bukan terlempar menjauhi pusat.', 'Ubah rpm ke rad/s: ω = rpm × 2π/60.'])}`,
    contoh: [
      { soal: 'Benda 0,2 kg berputar dengan r = 0,5 m dan v = 2 m/s. Tentukan a_s dan F_s.', jawab: 'a_s = 4/0,5 = <b>8 m/s²</b>; F_s = 0,2 × 8 = <b>1,6 N</b>.' },
      { soal: 'Gir depan (r = 10 cm) dan gir belakang (r = 5 cm) dihubungkan rantai. Gir depan 2 putaran/s. Berapa putaran gir belakang?', jawab: 'ω₁r₁ = ω₂r₂ → 2 × 10 = ω₂ × 5 → <b>4 putaran/s</b>.' }] },

  { id: 'newton', kelas: 'X', judul: 'Hukum Newton tentang Gerak', ikon: 'fa-weight-hanging', sim: true, isi: `
    <p class="lead">Mengapa penumpang terdorong ke depan saat bus mengerem? Mengapa mendorong troli kosong lebih mudah daripada troli penuh? Ketiga hukum Newton menjawabnya.</p>
    <h3>Tiga hukum Newton</h3>
    <ul><li><b>Hukum I (inersia):</b> jika resultan gaya nol, benda diam tetap diam atau bergerak lurus beraturan.</li>
    <li><b>Hukum II:</b> <span class="rumus-inline">ΣF = m·a</span>. Gaya lebih besar → percepatan lebih besar; massa lebih besar → percepatan lebih kecil.</li>
    <li><b>Hukum III (aksi-reaksi):</b> gaya selalu berpasangan, sama besar, berlawanan arah, bekerja pada dua benda <b>berbeda</b>.</li></ul>
    ${simbol([['ΣF', 'resultan gaya', 'N'], ['m', 'massa', 'kg'], ['a', 'percepatan', 'm/s²'], ['w = m·g', 'gaya berat', 'N'], ['N', 'gaya normal (tegak lurus bidang)', 'N'], ['f = μ·N', 'gaya gesek', 'N']])}
    <h3>Benda ditarik di lantai kasar</h3>
    <div class="rumus">a = (F cos θ − f_k) / m &nbsp;&nbsp; f_k = μ_k·N &nbsp;&nbsp; N = m·g − F sin θ</div>
    <p>Benda baru bergerak jika gaya tarik mendatar melebihi gaya gesek statis maksimum μ_s·N.</p>
    ${coba('newton', 'tarik', 'Coba menarik balok')}
    <h3>Bidang miring</h3>
    <div class="rumus">Licin: a = g sin θ &nbsp;&nbsp; Kasar: a = g (sin θ − μ_k cos θ) &nbsp;&nbsp; N = m g cos θ</div>
    ${coba('newton', 'bidang-miring', 'Coba bidang miring')}
    <h3>Gaya normal di dalam lift</h3>
    <div class="rumus">Naik dipercepat: N = m(g + a) &nbsp;&nbsp; Turun dipercepat: N = m(g − a)</div>
    ${coba('newton', 'lift', 'Coba timbangan di lift')}
    <h3>Katrol (pesawat Atwood)</h3>
    <div class="rumus">a = (m₂ − m₁)·g / (m₁ + m₂) &nbsp;&nbsp; T = 2·m₁·m₂·g / (m₁ + m₂)</div>
    ${coba('newton', 'katrol', 'Coba sistem katrol')}
    ${tips(['Gambar diagram gaya dulu sebelum menghitung.', 'Gaya normal tidak selalu sama dengan berat (lihat bidang miring dan lift).', 'Aksi-reaksi tidak saling meniadakan karena bekerja pada benda berbeda.'])}`,
    contoh: [
      { soal: 'Balok 2 kg di bidang miring licin 30°. Berapa percepatannya?', jawab: 'a = 10 × sin 30° = <b>5 m/s²</b>.' },
      { soal: 'Dua beban 3 kg dan 2 kg digantung pada katrol licin. Berapa percepatan sistem?', jawab: 'a = (3 − 2) × 10 / 5 = <b>2 m/s²</b>.' }] },

  { id: 'gravitasi', kelas: 'X', judul: 'Hukum Gravitasi Newton & Kepler', ikon: 'fa-earth-asia', sim: true, isi: `
    <p class="lead">Gaya yang membuat apel jatuh ternyata sama dengan gaya yang menahan Bulan tetap mengorbit Bumi. Newton menyebutnya gravitasi, dan gaya ini bekerja antara semua benda bermassa.</p>
    <h3>Gaya gravitasi antara dua benda</h3>
    <div class="rumus">F = G·m₁·m₂ / r² &nbsp;&nbsp; G = 6,67 × 10⁻¹¹ N·m²/kg²</div>
    ${simbol([['F', 'gaya gravitasi', 'N'], ['m₁, m₂', 'massa kedua benda', 'kg'], ['r', 'jarak antarpusat benda', 'm']])}
    <p>Jarak 2 kali → gaya ¼ kali. Gaya ini sangat kecil untuk benda sehari-hari, tetapi sangat besar untuk planet.</p>
    ${coba('gravitasi', 'gaya', 'Coba gaya gravitasi')}
    <h3>Percepatan gravitasi (kuat medan)</h3>
    <div class="rumus">g = G·M / r² &nbsp;&nbsp; di ketinggian h: g_h = g · (R / (R + h))²</div>
    ${coba('gravitasi', 'medan', 'Coba gravitasi di berbagai planet')}
    <h3>Hukum Kepler dan orbit</h3>
    <ol><li>Orbit planet berbentuk elips, Matahari di salah satu titik fokus.</li><li>Garis planet–Matahari menyapu luas yang sama dalam waktu yang sama (dekat Matahari → lebih cepat).</li><li><span class="rumus-inline">T² / r³ = konstan</span></li></ol>
    <div class="rumus">Kecepatan orbit lingkaran: v = √(G·M / r)</div>
    ${coba('gravitasi', 'orbit', 'Coba orbit planet')}
    ${tips(['r diukur dari pusat benda, bukan dari permukaannya.', 'Astronot melayang bukan karena tanpa gravitasi, tetapi karena jatuh bebas bersama stasiunnya.', 'Pada Hukum III Kepler, gunakan satuan yang sama untuk semua planet.'])}`,
    contoh: [
      { soal: 'Jarak dua benda dijadikan 3 kali. Gaya gravitasinya menjadi berapa kali?', jawab: 'F ∝ 1/r² → <b>1/9 kali</b>.' },
      { soal: 'Planet berjarak 9 SA dari Matahari. Berapa periodenya?', jawab: 'T = 9^(3/2) = <b>27 tahun</b>.' }] },

  { id: 'usaha-energi', kelas: 'X', judul: 'Usaha dan Energi', ikon: 'fa-bolt', sim: true, isi: `
    <p class="lead">Dalam fisika, "usaha" hanya terjadi jika gaya membuat benda berpindah. Mendorong tembok sampai lelah tanpa tembok bergeser: usahanya nol.</p>
    <h3>Usaha</h3>
    <div class="rumus">W = F · s · cos θ</div>
    ${simbol([['W', 'usaha', 'joule (J)'], ['F', 'gaya', 'N'], ['s', 'perpindahan', 'm'], ['θ', 'sudut antara gaya dan perpindahan', '°']])}
    ${coba('usaha-energi', 'usaha', 'Coba menarik koper')}
    <h3>Energi kinetik, energi potensial, dan kekekalan energi mekanik</h3>
    <div class="rumus">E_k = ½·m·v² &nbsp;&nbsp; E_p = m·g·h &nbsp;&nbsp; E_m = E_k + E_p<br>Teorema usaha-energi: W = ΔE_k<br>Kekekalan (tanpa gesekan): E_k1 + E_p1 = E_k2 + E_p2</div>
    <p>Pada ayunan bandul, energi terus berubah bentuk dari potensial (di titik tertinggi) ke kinetik (di titik terendah), tetapi jumlahnya tetap.</p>
    ${coba('usaha-energi', 'energi-mekanik', 'Coba ayunan bandul')}
    <h3>Daya</h3>
    <div class="rumus">P = W / t = F · v &nbsp;&nbsp; (satuan watt, 1 W = 1 J/s)</div>
    ${coba('usaha-energi', 'daya', 'Coba daya pompa')}
    ${tips(['Usaha gaya gravitasi tidak bergantung lintasan, hanya beda ketinggian.', 'Jika gaya tegak lurus perpindahan (θ = 90°), usahanya nol.', '1 kWh = 3,6 × 10⁶ J.'])}`,
    contoh: [
      { soal: 'Benda dijatuhkan dari 5 m. Berapa kecepatannya saat menyentuh tanah?', jawab: 'v = √(2 × 10 × 5) = <b>10 m/s</b>.' },
      { soal: 'Pompa mengangkat 60 kg air setinggi 10 m dalam 30 s. Berapa dayanya?', jawab: 'W = 60 × 10 × 10 = 6.000 J; P = 6.000/30 = <b>200 W</b>.' }] },

  { id: 'momentum', kelas: 'X', judul: 'Momentum dan Impuls', ikon: 'fa-car-burst', sim: true, isi: `
    <p class="lead">Truk dan sepeda yang melaju sama cepat sama-sama sulit dihentikan? Tidak. Truk jauh lebih sulit karena momentumnya lebih besar. Momentum adalah "kesulitan menghentikan" benda bergerak.</p>
    <h3>Momentum dan impuls</h3>
    <div class="rumus">p = m·v &nbsp;&nbsp; I = F·Δt = Δp = m(v₂ − v₁)</div>
    ${simbol([['p', 'momentum', 'kg·m/s'], ['I', 'impuls', 'N·s'], ['F', 'gaya rata-rata', 'N'], ['Δt', 'lama gaya bekerja', 's']])}
    <p>Airbag, helm, dan matras memperpanjang Δt, sehingga gaya yang dirasakan menjadi kecil untuk perubahan momentum yang sama.</p>
    ${coba('momentum', 'impuls', 'Coba memukul bola')}
    <h3>Hukum kekekalan momentum dan tumbukan</h3>
    <div class="rumus">m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′ &nbsp;&nbsp; e = −(v₁′ − v₂′) / (v₁ − v₂)</div>
    <ul><li><b>Lenting sempurna</b> (e = 1): energi kinetik kekal.</li><li><b>Lenting sebagian</b> (0 &lt; e &lt; 1), misalnya bola memantul: <span class="rumus-inline">e = √(h₂/h₁)</span>.</li><li><b>Tidak lenting sama sekali</b> (e = 0): benda menyatu.</li></ul>
    ${coba('momentum', 'tumbukan', 'Coba tumbukan troli (searah &amp; berlawanan arah)')}
    ${tips(['Momentum adalah vektor: beri tanda negatif untuk arah berlawanan.', 'Momentum selalu kekal pada tumbukan, energi kinetik belum tentu.', 'Gunakan Δp = m(v₂ − v₁) dengan tanda arah yang benar saat bola dipantulkan.'])}`,
    contoh: [
      { soal: 'Troli 2 kg (3 m/s) menumbuk troli 1 kg yang diam lalu menyatu. Berapa kecepatan setelah tumbukan?', jawab: 'v′ = (2 × 3)/(2 + 1) = <b>2 m/s</b>.' },
      { soal: 'Bola 0,2 kg datang 10 m/s lalu dipukul balik 15 m/s dalam 0,01 s. Berapa gaya rata-ratanya?', jawab: 'Δp = 0,2 × (15 − (−10)) = 5 N·s; F = 5/0,01 = <b>500 N</b>.' }] },

  { id: 'getaran', kelas: 'X', judul: 'Getaran Harmonis', ikon: 'fa-wave-square', sim: true, isi: `
    <p class="lead">Ayunan, pegas mobil, dan senar gitar bergetar bolak-balik melewati titik setimbangnya. Jika gaya pemulihnya sebanding dengan simpangan, getarannya disebut getaran harmonis sederhana.</p>
    <h3>Besaran getaran</h3>
    <div class="rumus">y = A sin ωt &nbsp;&nbsp; v = A·ω cos ωt &nbsp;&nbsp; a = −ω²·y &nbsp;&nbsp; ω = 2π/T</div>
    ${simbol([['y', 'simpangan', 'm'], ['A', 'amplitudo (simpangan terbesar)', 'm'], ['T', 'periode', 's'], ['f', 'frekuensi', 'Hz']])}
    <h3>Pegas</h3>
    <div class="rumus">T = 2π √(m/k) &nbsp;&nbsp; E = ½·k·A² &nbsp;&nbsp; v_maks = A·ω</div>
    ${coba('getaran', 'pegas', 'Coba getaran pegas')}
    <h3>Bandul sederhana</h3>
    <div class="rumus">T = 2π √(L/g)</div>
    <p>Periode bandul tidak bergantung massa beban (untuk simpangan kecil), hanya pada panjang tali dan gravitasi.</p>
    ${coba('getaran', 'bandul', 'Coba bandul sederhana')}
    ${tips(['Di titik setimbang: kecepatan maksimum, percepatan nol. Di simpangan terjauh: kecepatan nol, percepatan maksimum.', 'Massa 4 kali → periode pegas 2 kali.', 'Jangan tertukar: pegas bergantung m dan k, bandul bergantung L dan g.'])}`,
    contoh: [
      { soal: 'Beban 0,5 kg pada pegas k = 50 N/m. Berapa periodenya?', jawab: 'T = 2π√(0,01) = <b>0,2π ≈ 0,63 s</b>.' },
      { soal: 'Bandul dengan tali 2,5 m di Bumi (g = 10). Berapa periodenya?', jawab: 'T = 2π√(0,25) = <b>π ≈ 3,14 s</b>.' }] },

  { id: 'energi-terbarukan', kelas: 'X', judul: 'Energi Terbarukan & Pemanasan Global', ikon: 'fa-wind', sim: true, isi: `
    <p class="lead">Batu bara dan minyak bumi butuh jutaan tahun untuk terbentuk dan menghasilkan CO₂ saat dibakar. Energi terbarukan (angin, air, Matahari) tersedia terus-menerus dan lebih bersih.</p>
    <h3>Energi angin</h3>
    <div class="rumus">P = ½·ρ·A·v³·η &nbsp;&nbsp; A = π·r²</div>
    ${simbol([['ρ', 'massa jenis udara (±1,2)', 'kg/m³'], ['A', 'luas sapuan baling-baling', 'm²'], ['v', 'kecepatan angin', 'm/s'], ['η', 'efisiensi (maks teoretis 59%)', '%']])}
    ${coba('energi-terbarukan', 'angin', 'Coba turbin angin')}
    <h3>Energi air (PLTA)</h3>
    <div class="rumus">P = η·ρ·Q·g·h</div>
    ${simbol([['Q', 'debit air', 'm³/s'], ['h', 'tinggi jatuh air', 'm']])}
    ${coba('energi-terbarukan', 'air', 'Coba PLTA')}
    <h3>Energi surya</h3>
    <div class="rumus">P = η · I · A</div>
    ${simbol([['I', 'intensitas cahaya Matahari (±1.000)', 'W/m²'], ['A', 'luas panel', 'm²']])}
    ${coba('energi-terbarukan', 'surya', 'Coba panel surya')}
    <h3>Pemanasan global</h3>
    <p>Gas rumah kaca (CO₂, CH₄, N₂O) menyerap dan memancarkan kembali radiasi inframerah dari Bumi, sehingga suhu rata-rata naik. Dampaknya: es kutub mencair, permukaan laut naik, cuaca ekstrem. Mitigasi: beralih ke energi terbarukan, hemat energi, transportasi umum, reboisasi.</p>
    ${tips(['Daya angin sebanding v³: angin 2 kali lebih kencang → daya 8 kali.', 'Efisiensi selalu kurang dari 100% karena sebagian energi menjadi panas.'])}`,
    contoh: [
      { soal: 'Turbin r = 10 m, angin 5 m/s, η = 40%. Berapa dayanya?', jawab: 'P = ½ × 1,2 × 314 × 125 × 0,4 ≈ <b>9,4 kW</b>.' },
      { soal: 'Panel surya 2 m², efisiensi 20%, intensitas 1.000 W/m². Berapa dayanya?', jawab: 'P = 0,2 × 1.000 × 2 = <b>400 W</b>.' }] },
];
