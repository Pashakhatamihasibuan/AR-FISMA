// Materi Fisika kelas XII.
import { coba, simbol, tips } from './materi-x.js';

export const MATERI_XII = [
  { id: 'listrik-statis', kelas: 'XII', judul: 'Listrik Statis', ikon: 'fa-bolt-lightning', sim: true, isi: `
    <p class="lead">Rambut yang berdiri setelah digosok balon dan sengatan kecil saat memegang gagang pintu adalah listrik statis: muatan yang diam dan berkumpul di suatu benda.</p>
    <h3>Hukum Coulomb, medan, dan potensial listrik</h3>
    <div class="rumus">F = k·q₁·q₂/r² &nbsp;&nbsp; E = k·q/r² &nbsp;&nbsp; V = k·q/r &nbsp;&nbsp; k = 9 × 10⁹ N·m²/C²</div>
    ${simbol([['q', 'muatan listrik', 'coulomb (C)'], ['r', 'jarak', 'm'], ['E', 'kuat medan listrik', 'N/C'], ['V', 'potensial listrik', 'volt (V)']])}
    <p>Muatan sejenis tolak-menolak, berlawanan tarik-menarik. Medan listrik adalah vektor (arah keluar dari +, masuk ke −), sedangkan potensial adalah skalar.</p>
    ${coba('listrik-statis', 'coulomb', 'Coba dua muatan')}
    <h3>Kapasitor</h3>
    <div class="rumus">C = ε₀·A/d &nbsp;&nbsp; Q = C·V &nbsp;&nbsp; W = ½·C·V²<br>Seri: 1/C_s = Σ 1/C &nbsp;&nbsp; Paralel: C_p = Σ C</div>
    ${simbol([['C', 'kapasitas', 'farad (F)'], ['A', 'luas keping', 'm²'], ['d', 'jarak antarkeping', 'm'], ['ε₀', '8,85 × 10⁻¹²', 'C²/N·m²']])}
    ${coba('listrik-statis', 'kapasitor', 'Coba kapasitor keping')}
    ${tips(['μC = 10⁻⁶ C, nC = 10⁻⁹ C.', 'Medan dari beberapa muatan dijumlahkan sebagai vektor; potensial dijumlahkan biasa (dengan tanda).'])}`,
    contoh: [
      { soal: 'q₁ = q₂ = 2 μC berjarak 0,3 m. Berapa F?', jawab: 'F = 9 × 10⁹ × 4 × 10⁻¹²/0,09 = <b>0,4 N</b>.' },
      { soal: 'Kapasitor 10 μF diisi 12 V. Berapa muatan dan energinya?', jawab: 'Q = 1,2 × 10⁻⁴ C; W = ½ × 10⁻⁵ × 144 = <b>7,2 × 10⁻⁴ J</b>.' }] },

  { id: 'listrik-dc', kelas: 'XII', judul: 'Listrik Arus Searah', ikon: 'fa-car-battery', sim: true, isi: `
    <p class="lead">Baterai mendorong muatan berkeliling rangkaian seperti pompa mendorong air di pipa. Hambatan berperan seperti pipa yang menyempit.</p>
    <h3>Hukum Ohm dan hambatan kawat</h3>
    <div class="rumus">I = Q/t &nbsp;&nbsp; V = I·R &nbsp;&nbsp; R = ρ·L/A</div>
    ${simbol([['I', 'kuat arus', 'ampere (A)'], ['V', 'tegangan', 'volt (V)'], ['R', 'hambatan', 'ohm (Ω)'], ['ρ', 'hambat jenis bahan', 'Ω·m'], ['L', 'panjang kawat', 'm'], ['A', 'luas penampang', 'm²']])}
    ${coba('listrik-dc', 'kawat', 'Coba hambatan kawat')}
    <h3>Rangkaian seri-paralel dan Kirchhoff</h3>
    <div class="rumus">Seri: R_s = R₁ + R₂ &nbsp;&nbsp; Paralel: 1/R_p = 1/R₁ + 1/R₂<br>I = ε/(R + r) &nbsp;&nbsp; tegangan jepit V = ε − I·r</div>
    <p><b>Hukum I Kirchhoff:</b> jumlah arus masuk titik cabang = jumlah arus keluar. <b>Hukum II:</b> dalam satu loop, Σε + ΣI·R = 0.</p>
    <div class="rumus">Daya: P = V·I = I²·R = V²/R &nbsp;&nbsp; Energi: W = P·t</div>
    ${coba('listrik-dc', 'rangkaian', 'Coba rangkaian seri dan paralel')}
    ${tips(['Pada seri, arus sama; pada paralel, tegangan sama.', 'R_p selalu lebih kecil dari hambatan terkecil.', 'Biaya listrik = kWh × tarif; 1 kWh = 1.000 W selama 1 jam.'])}`,
    contoh: [
      { soal: 'ε = 12 V, r = 1 Ω, R = 5 Ω. Tentukan I dan V jepit.', jawab: 'I = 12/6 = <b>2 A</b>; V = 12 − 2 = <b>10 V</b>.' },
      { soal: 'Kawat tembaga (ρ = 1,7 × 10⁻⁸ Ω·m) panjang 100 m, A = 1 mm². Berapa R?', jawab: 'R = 1,7 × 10⁻⁸ × 100/10⁻⁶ = <b>1,7 Ω</b>.' }] },

  { id: 'magnet', kelas: 'XII', judul: 'Medan Magnet', ikon: 'fa-magnet', sim: true, isi: `
    <p class="lead">Arus listrik selalu menimbulkan medan magnet. Inilah prinsip kerja bel listrik, motor, dan pengeras suara.</p>
    <h3>Kawat lurus panjang</h3>
    <div class="rumus">B = μ₀·I/(2π·a) &nbsp;&nbsp; μ₀ = 4π × 10⁻⁷ Wb/A·m</div>
    <p>Arah medan: <b>kaidah tangan kanan</b>, ibu jari menunjuk arah arus, lipatan jari menunjuk arah medan melingkar.</p>
    ${coba('magnet', 'kawat-lurus', 'Coba medan kawat lurus')}
    <h3>Kawat melingkar dan solenoida</h3>
    <div class="rumus">Pusat lingkaran: B = μ₀·I·N/(2a) &nbsp;&nbsp; Solenoida: B = μ₀·I·N/L &nbsp;&nbsp; Toroida: B = μ₀·I·N/(2πr)</div>
    ${simbol([['N', 'jumlah lilitan', '-'], ['L', 'panjang solenoida', 'm'], ['a', 'jari-jari lingkaran / jarak', 'm']])}
    ${coba('magnet', 'solenoida', 'Coba solenoida')}
    <h3>Gaya Lorentz</h3>
    <div class="rumus">Kawat: F = B·I·L sin θ &nbsp;&nbsp; Partikel: F = q·v·B sin θ &nbsp;&nbsp; jari-jari lintasan: R = m·v/(q·B)</div>
    <p>Partikel bermuatan yang masuk tegak lurus medan bergerak melingkar dengan kelajuan tetap. Dua kawat sejajar berarus searah saling tarik: <span class="rumus-inline">F/L = μ₀·I₁·I₂/(2π·a)</span>.</p>
    ${coba('magnet', 'lorentz', 'Coba partikel dalam medan')}
    ${tips(['Satuan medan magnet: tesla (T); 1 T = 1 Wb/m².', 'Gaya Lorentz tegak lurus kecepatan sehingga tidak mengubah kelajuan partikel.'])}`,
    contoh: [
      { soal: 'I = 10 A, a = 0,1 m. Berapa B di sekitar kawat lurus?', jawab: 'B = 2 × 10⁻⁷ × 10/0,1 = <b>2 × 10⁻⁵ T</b>.' },
      { soal: 'Solenoida 1.000 lilitan, panjang 0,5 m, arus 2 A. Berapa B di dalamnya?', jawab: 'B = 4π × 10⁻⁷ × 2 × 1.000/0,5 ≈ <b>5 × 10⁻³ T</b>.' }] },

  { id: 'induksi', kelas: 'XII', judul: 'Induksi Elektromagnetik', ikon: 'fa-plug-circle-bolt', sim: true, isi: `
    <p class="lead">Kalau arus menimbulkan magnet, bisakah magnet menimbulkan arus? Bisa, asalkan medan magnetnya berubah. Prinsip ini menghasilkan hampir semua listrik di dunia.</p>
    <h3>Hukum Faraday dan Lenz</h3>
    <div class="rumus">Φ = B·A cos θ &nbsp;&nbsp; ε = −N·ΔΦ/Δt</div>
    ${simbol([['Φ', 'fluks magnet', 'weber (Wb)'], ['N', 'jumlah lilitan', '-'], ['ε', 'GGL induksi', 'V']])}
    <p>Tanda minus adalah <b>hukum Lenz</b>: arus induksi melawan perubahan fluks penyebabnya.</p>
    ${coba('induksi', 'faraday', 'Coba magnet dan kumparan')}
    <h3>Batang konduktor bergerak</h3>
    <div class="rumus">ε = B·L·v</div>
    ${coba('induksi', 'batang', 'Coba batang di rel')}
    <h3>Transformator</h3>
    <div class="rumus">V_p/V_s = N_p/N_s = I_s/I_p (ideal) &nbsp;&nbsp; η = P_s/P_p × 100%</div>
    <p>Step-up menaikkan tegangan (N_s &gt; N_p), step-down menurunkan (charger HP). Transformator hanya bekerja pada arus bolak-balik.</p>
    ${coba('induksi', 'trafo', 'Coba transformator')}
    ${tips(['Tanpa gerak relatif atau perubahan arus, tidak ada GGL induksi.', 'Pada trafo, daya (bukan tegangan) yang kekal untuk trafo ideal.'])}`,
    contoh: [
      { soal: 'N = 100, ΔΦ = 0,02 Wb dalam 0,1 s. Berapa |ε|?', jawab: '|ε| = 100 × 0,02/0,1 = <b>20 V</b>.' },
      { soal: 'Trafo 220 V → 11 V, N_p = 1.000. Berapa N_s?', jawab: 'N_s = 1.000 × 11/220 = <b>50 lilitan</b>.' }] },

  { id: 'ac', kelas: 'XII', judul: 'Listrik Arus Bolak-balik', ikon: 'fa-plug', sim: true, isi: `
    <p class="lead">Listrik PLN berbalik arah 50 kali per detik. Arus ini dihasilkan generator: kumparan yang berputar di dalam medan magnet.</p>
    <h3>Generator dan nilai efektif</h3>
    <div class="rumus">ε = ε_maks sin ωt &nbsp;&nbsp; ε_maks = N·B·A·ω &nbsp;&nbsp; V_ef = V_maks/√2</div>
    ${coba('ac', 'generator', 'Coba generator AC')}
    <h3>Rangkaian RLC</h3>
    <div class="rumus">X_L = ω·L &nbsp;&nbsp; X_C = 1/(ω·C) &nbsp;&nbsp; Z = √(R² + (X_L − X_C)²)<br>Resonansi: f = 1/(2π√(LC)) &nbsp;&nbsp; P = V_ef·I_ef·cos φ, cos φ = R/Z</div>
    ${simbol([['X_L', 'reaktansi induktif', 'Ω'], ['X_C', 'reaktansi kapasitif', 'Ω'], ['Z', 'impedansi', 'Ω'], ['cos φ', 'faktor daya', '-']])}
    <p>Saat resonansi X_L = X_C, impedansi minimum dan arus maksimum. Prinsip ini dipakai pemilih gelombang radio.</p>
    ${coba('ac', 'rlc', 'Coba rangkaian RLC')}
    ${tips(['Tegangan 220 V pada stopkontak adalah nilai efektif; puncaknya ±311 V.', 'Induktor menghambat frekuensi tinggi, kapasitor menghambat frekuensi rendah.'])}`,
    contoh: [
      { soal: 'R = 60 Ω, X_L = 120 Ω, X_C = 40 Ω. Berapa Z?', jawab: 'Z = √(3.600 + 6.400) = <b>100 Ω</b>.' },
      { soal: 'L = 0,1 H, C = 10 μF. Berapa frekuensi resonansinya?', jawab: 'f = 1/(2π√(10⁻⁶)) ≈ <b>159 Hz</b>.' }] },

  { id: 'gem', kelas: 'XII', judul: 'Gelombang Elektromagnetik', ikon: 'fa-tower-broadcast', sim: true, isi: `
    <p class="lead">Radio, Wi-Fi, cahaya, dan sinar-X sebenarnya sejenis: gelombang elektromagnetik (GEM). Bedanya hanya panjang gelombang dan frekuensinya.</p>
    <h3>Sifat dan spektrum GEM</h3>
    <div class="rumus">c = λ·f = 3 × 10⁸ m/s &nbsp;&nbsp; E/B = c &nbsp;&nbsp; energi foton E = h·f</div>
    <p>GEM terdiri atas medan listrik dan medan magnet yang saling tegak lurus dan tegak lurus arah rambat, serta tidak memerlukan medium.</p>
    <table><thead><tr><th>Spektrum (frekuensi naik ↓)</th><th>Pemanfaatan</th></tr></thead><tbody>
    <tr><td>Gelombang radio</td><td>radio, televisi</td></tr><tr><td>Gelombang mikro</td><td>radar, oven microwave, Wi-Fi</td></tr><tr><td>Inframerah</td><td>remote TV, kamera termal</td></tr>
    <tr><td>Cahaya tampak</td><td>penglihatan, serat optik</td></tr><tr><td>Ultraviolet</td><td>sterilisasi, vitamin D</td></tr><tr><td>Sinar-X</td><td>rontgen</td></tr><tr><td>Sinar gamma</td><td>terapi kanker</td></tr></tbody></table>
    ${coba('gem', 'spektrum', 'Coba spektrum GEM')}
    ${tips(['Makin tinggi frekuensi, makin besar energi foton dan makin berbahaya bagi sel hidup.', 'Semua GEM merambat dengan kecepatan sama di ruang hampa.'])}`,
    contoh: [
      { soal: 'Radio 100 MHz. Berapa λ?', jawab: 'λ = 3 × 10⁸/10⁸ = <b>3 m</b>.' },
      { soal: 'Wi-Fi 2,4 GHz. Berapa λ?', jawab: 'λ = 3 × 10⁸/2,4 × 10⁹ = <b>0,125 m</b>.' }] },

  { id: 'kuantum', kelas: 'XII', judul: 'Radiasi Benda Hitam & Efek Fotolistrik', ikon: 'fa-sun', sim: true, isi: `
    <p class="lead">Besi yang dipanaskan berpijar merah lalu putih. Cahaya bisa melepaskan elektron dari logam, tetapi hanya warna tertentu yang mampu. Gejala ini melahirkan fisika kuantum.</p>
    <h3>Radiasi benda hitam</h3>
    <div class="rumus">Stefan–Boltzmann: P = e·σ·A·T⁴ &nbsp;&nbsp; σ = 5,67 × 10⁻⁸ W/m²K⁴<br>Wien: λ_maks·T = 2,898 × 10⁻³ m·K</div>
    <p>Suhu naik → daya pancar naik tajam (pangkat empat) dan puncak warna bergeser ke panjang gelombang lebih pendek.</p>
    ${coba('kuantum', 'benda-hitam', 'Coba benda hitam')}
    <h3>Foton dan efek fotolistrik</h3>
    <div class="rumus">E = h·f = h·c/λ &nbsp;&nbsp; praktis: E(eV) ≈ 1240/λ(nm)<br>E_k maks = h·f − W₀ &nbsp;&nbsp; W₀ = h·f₀</div>
    ${simbol([['h', 'tetapan Planck 6,63 × 10⁻³⁴', 'J·s'], ['W₀', 'fungsi kerja logam', 'eV'], ['f₀', 'frekuensi ambang', 'Hz']])}
    <p>Elektron lepas hanya jika energi satu foton ≥ W₀. Intensitas menambah <b>jumlah</b> elektron, bukan energinya.</p>
    ${coba('kuantum', 'fotolistrik', 'Coba efek fotolistrik')}
    ${tips(['1 eV = 1,6 × 10⁻¹⁹ J.', 'Panjang gelombang pendek = energi foton besar.'])}`,
    contoh: [
      { soal: 'Cahaya 400 nm menyinari natrium (W₀ = 2,28 eV). Berapa E_k maks?', jawab: 'E = 3,1 eV; E_k = 3,1 − 2,28 = <b>0,82 eV</b>.' },
      { soal: 'Puncak radiasi bintang 500 nm. Berapa suhunya?', jawab: 'T = 2,898 × 10⁻³/5 × 10⁻⁷ ≈ <b>5.800 K</b>.' }] },

  { id: 'relativitas', kelas: 'XII', judul: 'Relativitas Khusus', ikon: 'fa-rocket', sim: true, isi: `
    <p class="lead">Mendekati kecepatan cahaya, waktu melambat dan panjang memendek. Ini bukan fiksi: satelit GPS harus mengoreksi efek relativitas agar posisinya akurat.</p>
    <h3>Dilatasi waktu, kontraksi panjang, dan energi</h3>
    <div class="rumus">γ = 1/√(1 − v²/c²) &nbsp;&nbsp; Δt = γ·Δt₀ &nbsp;&nbsp; L = L₀/γ<br>m = γ·m₀ &nbsp;&nbsp; E₀ = m₀c² &nbsp;&nbsp; E_k = (γ − 1)·m₀c²</div>
    ${simbol([['γ', 'faktor Lorentz (≥ 1)', '-'], ['Δt₀', 'waktu menurut pengamat yang ikut bergerak', 's'], ['L₀', 'panjang diam', 'm']])}
    ${coba('relativitas', 'dilatasi', 'Coba pesawat cepat')}
    <h3>Penjumlahan kecepatan relativistik</h3>
    <div class="rumus">v = (v₁ + v₂)/(1 + v₁·v₂/c²)</div>
    <p>Hasilnya tidak pernah melebihi c.</p>
    ${coba('relativitas', 'kecepatan', 'Coba penjumlahan kecepatan')}
    ${tips(['Hafalkan pasangan: 0,6c → γ = 1,25; 0,8c → γ = 5/3.', 'Kontraksi hanya terjadi searah gerak.'])}`,
    contoh: [
      { soal: 'Pesawat 100 m bergerak 0,6c. Berapa panjangnya menurut pengamat diam?', jawab: 'γ = 1,25; L = 100/1,25 = <b>80 m</b>.' },
      { soal: 'Dua pesawat masing-masing 0,5c saling mendekat. Berapa kecepatan relatifnya?', jawab: 'v = c/(1 + 0,25) = <b>0,8c</b>.' }] },

  { id: 'atom', kelas: 'XII', judul: 'Teori Atom', ikon: 'fa-atom', sim: true, isi: `
    <p class="lead">Model atom terus diperbaiki seiring percobaan baru: bola pejal (Dalton), roti kismis (Thomson), inti kecil bermuatan positif (Rutherford), lintasan berenergi tertentu (Bohr), hingga orbital (mekanika kuantum).</p>
    <h3>Model atom Bohr</h3>
    <div class="rumus">E_n = −13,6/n² eV &nbsp;&nbsp; r_n = 0,53·n² Å<br>Transisi: ΔE = 13,6·|1/n_akhir² − 1/n_awal²| eV &nbsp;&nbsp; λ(nm) ≈ 1240/ΔE</div>
    <p>Elektron memancarkan foton saat turun ke kulit lebih dalam dan menyerap foton saat naik.</p>
    <table><thead><tr><th>Deret</th><th>Kulit akhir</th><th>Daerah</th></tr></thead><tbody><tr><td>Lyman</td><td>n = 1</td><td>ultraviolet</td></tr><tr><td>Balmer</td><td>n = 2</td><td>cahaya tampak</td></tr><tr><td>Paschen, Brackett, Pfund</td><td>n = 3, 4, 5</td><td>inframerah</td></tr></tbody></table>
    ${coba('atom', 'bohr', 'Coba transisi elektron')}
    ${tips(['Energi ionisasi hidrogen dari keadaan dasar = 13,6 eV.', 'Model Bohr hanya cocok untuk atom berelektron tunggal.'])}`,
    contoh: [
      { soal: 'Elektron pindah dari n = 3 ke n = 2. Berapa ΔE dan λ?', jawab: 'ΔE ≈ <b>1,89 eV</b>; λ ≈ <b>656 nm</b> (merah, Balmer).' },
      { soal: 'Berapa jari-jari orbit elektron pada n = 2?', jawab: 'r = 0,53 × 4 = <b>2,12 Å</b>.' }] },

  { id: 'inti', kelas: 'XII', judul: 'Fisika Inti & Radioaktivitas', ikon: 'fa-radiation', sim: true, isi: `
    <p class="lead">Inti atom yang tidak stabil meluruh sambil memancarkan radiasi. Sifat ini dipakai untuk menentukan umur fosil, mengobati kanker, dan membangkitkan listrik.</p>
    <h3>Energi ikat inti</h3>
    <div class="rumus">Δm = (Z·m_p + N·m_n) − m_inti &nbsp;&nbsp; E_ikat = Δm × 931,5 MeV/sma</div>
    <p>Makin besar energi ikat per nukleon, makin stabil inti (puncaknya sekitar besi-56).</p>
    ${coba('inti', 'energi-ikat', 'Coba energi ikat inti')}
    <h3>Peluruhan dan waktu paruh</h3>
    <div class="rumus">N = N₀·(½)^(t/T½) &nbsp;&nbsp; λ = 0,693/T½ &nbsp;&nbsp; A = λ·N</div>
    <p>Alfa (⁴₂He) daya tembus terkecil, beta (elektron) sedang, gamma (gelombang EM) terbesar.</p>
    ${coba('inti', 'peluruhan', 'Coba peluruhan radioaktif')}
    <h3>Fisi dan fusi</h3>
    <p><b>Fisi:</b> inti berat terbelah (PLTN). <b>Fusi:</b> inti ringan bergabung (energi Matahari). Keduanya melepas energi karena defek massa.</p>
    ${tips(['Setiap waktu paruh, jumlah inti tinggal setengahnya.', 'Pada peluruhan alfa: A berkurang 4, Z berkurang 2.'])}`,
    contoh: [
      { soal: 'T½ = 5 tahun. Berapa bagian tersisa setelah 20 tahun?', jawab: '(½)⁴ = <b>1/16</b>.' },
      { soal: 'Defek massa 0,03 sma. Berapa energi ikatnya?', jawab: 'E = 0,03 × 931,5 ≈ <b>27,9 MeV</b>.' }] },

  { id: 'digital', kelas: 'XII', judul: 'Teknologi Digital', ikon: 'fa-microchip', sim: true, isi: `
    <p class="lead">Suara, foto, dan video di HP disimpan sebagai deretan angka 0 dan 1. Proses mengubah sinyal analog menjadi digital disebut konversi analog ke digital (ADC).</p>
    <h3>Sinyal analog, digital, dan ADC</h3>
    <p><b>Analog</b> bernilai kontinu; <b>digital</b> bernilai diskrit. ADC bekerja dalam tiga langkah: pencuplikan (sampling), kuantisasi (pembulatan ke level terdekat), dan pengodean.</p>
    <div class="rumus">Jumlah level = 2ⁿ &nbsp;&nbsp; Nyquist: f_s ≥ 2·f_maks &nbsp;&nbsp; ukuran data = f_s × n × durasi × kanal (bit)</div>
    ${simbol([['n', 'jumlah bit per sampel', 'bit'], ['f_s', 'frekuensi sampling', 'Hz'], ['f_maks', 'frekuensi sinyal tertinggi', 'Hz']])}
    ${coba('digital', 'adc', 'Coba konversi analog ke digital')}
    <h3>Transmisi dan penyimpanan</h3>
    <p>Data dikirim lewat kabel tembaga, gelombang radio (Wi-Fi, seluler), dan <b>serat optik</b> yang memakai pemantulan sempurna cahaya. Sinyal digital tahan derau karena penerima cukup membedakan dua level.</p>
    <p><b>Peran fisika:</b> semikonduktor (transistor, chip), LED, sensor HP, dan panel surya.</p>
    ${tips(['8 bit = 1 byte.', 'Sampling di bawah 2 f_maks menyebabkan aliasing (sinyal tercatat salah).'])}`,
    contoh: [
      { soal: 'ADC 8 bit dapat membedakan berapa level?', jawab: '2⁸ = <b>256 level</b>.' },
      { soal: 'Audio stereo 44,1 kHz, 16 bit, 10 s. Berapa ukurannya?', jawab: '44.100 × 16 × 10 × 2 = 14.112.000 bit ≈ <b>1,76 MB</b>.' }] },
];
