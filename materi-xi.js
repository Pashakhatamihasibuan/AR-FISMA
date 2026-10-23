// Materi Fisika kelas XI.
import { coba, simbol, tips } from './materi-x.js';

export const MATERI_XI = [
  { id: 'rotasi', kelas: 'XI', judul: 'Dinamika Rotasi & Kesetimbangan', ikon: 'fa-rotate', sim: true, isi: `
    <p class="lead">Membuka pintu dari gagangnya terasa ringan, tetapi dari dekat engsel terasa berat. Pada gerak berputar, yang menentukan bukan hanya gaya, tetapi juga jarak gaya dari poros.</p>
    <h3>Torsi dan kesetimbangan benda tegar</h3>
    <div class="rumus">τ = F · r · sin θ &nbsp;&nbsp; Setimbang: ΣF = 0 dan Στ = 0</div>
    ${simbol([['τ', 'torsi (momen gaya)', 'N·m'], ['F', 'gaya', 'N'], ['r', 'lengan gaya (jarak ke poros)', 'm']])}
    <p>Jungkat-jungkit seimbang jika m₁·g·r₁ = m₂·g·r₂: anak yang lebih berat duduk lebih dekat ke poros.</p>
    ${coba('rotasi', 'torsi', 'Coba jungkat-jungkit')}
    <h3>Momen inersia dan benda menggelinding</h3>
    <div class="rumus">Στ = I·α &nbsp;&nbsp; I = k·m·r² &nbsp;&nbsp; menggelinding di bidang miring: a = g sin θ / (1 + k)</div>
    <table><thead><tr><th>Benda</th><th>k</th></tr></thead><tbody><tr><td>Cincin / silinder berongga tipis</td><td>1</td></tr><tr><td>Silinder pejal</td><td>½</td></tr><tr><td>Bola pejal</td><td>⅖</td></tr><tr><td>Bola berongga</td><td>⅔</td></tr></tbody></table>
    <p>Makin kecil k, makin cepat benda menggelinding: bola pejal &gt; silinder pejal &gt; cincin.</p>
    ${coba('rotasi', 'menggelinding', 'Coba balapan menggelinding')}
    <h3>Momentum sudut</h3>
    <div class="rumus">L = I·ω &nbsp;&nbsp; tanpa torsi luar: I₁ω₁ = I₂ω₂ &nbsp;&nbsp; E_k rotasi = ½·I·ω²</div>
    <p>Penari es menarik tangannya (I mengecil) sehingga putarannya makin cepat.</p>
    ${coba('rotasi', 'momentum-sudut', 'Coba penari berputar')}
    ${tips(['Lengan gaya diukur tegak lurus dari poros ke garis kerja gaya.', 'Benda menggelinding punya energi kinetik translasi dan rotasi sekaligus.', 'Pilih poros di titik yang banyak gaya tak diketahuinya agar perhitungan torsi lebih mudah.'])}`,
    contoh: [
      { soal: 'Anak 30 kg duduk 2 m dari poros. Di mana anak 40 kg harus duduk agar seimbang?', jawab: '30 × 2 = 40 × r → r = <b>1,5 m</b>.' },
      { soal: 'Bola pejal menggelinding di bidang miring 30°. Berapa percepatannya?', jawab: 'a = 10 × 0,5/(1 + 0,4) ≈ <b>3,57 m/s²</b>.' }] },

  { id: 'elastisitas', kelas: 'XI', judul: 'Elastisitas & Hukum Hooke', ikon: 'fa-arrows-up-down', sim: true, isi: `
    <p class="lead">Karet gelang kembali ke bentuknya setelah ditarik, tetapi plastisin tidak. Kemampuan kembali ke bentuk semula disebut elastisitas, dan ada batasnya.</p>
    <h3>Hukum Hooke dan susunan pegas</h3>
    <div class="rumus">F = k·Δx &nbsp;&nbsp; E_p = ½·k·Δx²<br>Seri: 1/k_s = 1/k₁ + 1/k₂ &nbsp;&nbsp; Paralel: k_p = k₁ + k₂</div>
    ${simbol([['k', 'konstanta pegas', 'N/m'], ['Δx', 'pertambahan panjang', 'm'], ['E_p', 'energi potensial pegas', 'J']])}
    <p>Susunan seri membuat pegas lebih "lembek" (k kecil), susunan paralel lebih "kaku" (k besar).</p>
    ${coba('elastisitas', 'pegas', 'Coba susunan pegas')}
    <h3>Tegangan, regangan, dan modulus Young</h3>
    <div class="rumus">σ = F/A &nbsp;&nbsp; e = ΔL/L₀ &nbsp;&nbsp; E = σ/e = (F·L₀)/(A·ΔL)</div>
    ${simbol([['σ', 'tegangan', 'N/m² (Pa)'], ['e', 'regangan', 'tanpa satuan'], ['E', 'modulus Young (kekakuan bahan)', 'N/m²'], ['A', 'luas penampang', 'm²']])}
    ${coba('elastisitas', 'young', 'Coba menarik kawat')}
    ${tips(['Hukum Hooke hanya berlaku sebelum batas elastis.', 'Ubah mm² ke m² (× 10⁻⁶) sebelum menghitung tegangan.', 'Modulus Young adalah sifat bahan, tidak bergantung ukuran kawat.'])}`,
    contoh: [
      { soal: 'Dua pegas 200 N/m disusun seri lalu diberi beban 2 kg. Berapa Δx?', jawab: 'k_s = 100 N/m; Δx = 20/100 = <b>0,2 m</b>.' },
      { soal: 'Kawat 2 m, A = 2 mm², ditarik 100 N, bertambah 1 mm. Berapa modulus Young?', jawab: 'E = (100 × 2)/(2 × 10⁻⁶ × 10⁻³) = <b>1 × 10¹¹ N/m²</b>.' }] },

  { id: 'fluida-statis', kelas: 'XI', judul: 'Fluida Statis', ikon: 'fa-water', sim: true, isi: `
    <p class="lead">Telinga terasa sakit saat menyelam dalam, kapal baja bisa terapung, dan dongkrak kecil bisa mengangkat mobil. Semuanya dijelaskan oleh sifat zat cair yang diam.</p>
    <h3>Tekanan hidrostatis</h3>
    <div class="rumus">P_h = ρ·g·h &nbsp;&nbsp; P_total = P₀ + ρ·g·h</div>
    ${simbol([['ρ', 'massa jenis fluida', 'kg/m³'], ['h', 'kedalaman dari permukaan', 'm'], ['P₀', 'tekanan udara (±1 × 10⁵)', 'Pa']])}
    <p>Tekanan hanya bergantung kedalaman, bukan bentuk wadah.</p>
    ${coba('fluida-statis', 'hidrostatis', 'Coba tekanan di kedalaman')}
    <h3>Hukum Pascal</h3>
    <p>Tekanan yang diberikan pada zat cair dalam ruang tertutup diteruskan sama besar ke segala arah. Prinsip ini dipakai dongkrak dan rem hidrolik.</p>
    <div class="rumus">F₁/A₁ = F₂/A₂ &nbsp;&nbsp; → F₂ = F₁ · A₂/A₁</div>
    ${coba('fluida-statis', 'pascal', 'Coba dongkrak hidrolik')}
    <h3>Hukum Archimedes</h3>
    <div class="rumus">F_A = ρ_fluida · g · V_tercelup</div>
    <ul><li><b>Terapung:</b> ρ_benda &lt; ρ_fluida, bagian tercelup = ρ_benda/ρ_fluida.</li><li><b>Melayang:</b> ρ_benda = ρ_fluida.</li><li><b>Tenggelam:</b> ρ_benda &gt; ρ_fluida.</li></ul>
    ${coba('fluida-statis', 'archimedes', 'Coba benda terapung')}
    <h3>Kapilaritas</h3>
    <div class="rumus">y = 2·γ·cos θ / (ρ·g·r)</div>
    ${simbol([['y', 'kenaikan zat cair dalam pipa', 'm'], ['γ', 'tegangan permukaan', 'N/m'], ['θ', 'sudut kontak', '°'], ['r', 'jari-jari pipa', 'm']])}
    <p>Pipa makin sempit, air naik makin tinggi. Contoh: minyak naik di sumbu kompor, air naik di batang tumbuhan.</p>
    ${coba('fluida-statis', 'kapilaritas', 'Coba pipa kapiler')}
    <h3>Viskositas (hukum Stokes)</h3>
    <div class="rumus">F_s = 6·π·η·r·v &nbsp;&nbsp; kecepatan terminal: v_T = 2·r²·g·(ρ_b − ρ_f) / (9·η)</div>
    ${coba('fluida-statis', 'stokes', 'Coba bola jatuh di oli')}
    ${tips(['Kedalaman h diukur dari permukaan zat cair, bukan dari dasar.', 'Volume tercelup belum tentu sama dengan volume benda.', 'Ubah cm² ke m² secara konsisten pada hukum Pascal (atau biarkan sama karena berupa perbandingan).'])}`,
    contoh: [
      { soal: 'Berapa tekanan hidrostatis pada kedalaman 10 m di air?', jawab: 'P = 1.000 × 10 × 10 = <b>10⁵ Pa</b>.' },
      { soal: 'Dongkrak: A₁ = 10 cm², A₂ = 1.000 cm². Gaya 200 N pada A₁ mengangkat beban berapa?', jawab: 'F₂ = 200 × 1.000/10 = <b>20.000 N</b>.' }] },

  { id: 'fluida-dinamis', kelas: 'XI', judul: 'Fluida Dinamis', ikon: 'fa-faucet-drip', sim: true, isi: `
    <p class="lead">Saat ujung selang dipencet, air menyemprot lebih jauh. Saat angin kencang, atap bisa terangkat. Keduanya dijelaskan oleh fluida yang mengalir.</p>
    <h3>Debit, kontinuitas, dan Bernoulli</h3>
    <div class="rumus">Q = A·v = V/t &nbsp;&nbsp; A₁·v₁ = A₂·v₂<br>P + ½·ρ·v² + ρ·g·h = konstan</div>
    ${simbol([['Q', 'debit', 'm³/s'], ['A', 'luas penampang', 'm²'], ['v', 'kecepatan aliran', 'm/s'], ['P', 'tekanan', 'Pa']])}
    <p>Pipa menyempit → kecepatan naik → tekanan turun. Prinsip ini membuat sayap pesawat terangkat dan venturimeter dapat mengukur kecepatan aliran.</p>
    ${coba('fluida-dinamis', 'bernoulli', 'Coba aliran dalam pipa')}
    <h3>Teorema Torricelli (tangki bocor)</h3>
    <div class="rumus">v = √(2·g·h) &nbsp;&nbsp; jarak pancaran dari tanah: x = 2√(h·H)</div>
    ${simbol([['h', 'kedalaman lubang dari permukaan air', 'm'], ['H', 'tinggi lubang dari tanah', 'm']])}
    ${coba('fluida-dinamis', 'torricelli', 'Coba tangki bocor')}
    ${tips(['Debit selalu sama di sepanjang pipa tertutup (fluida tak termampatkan).', 'Kecepatan besar berarti tekanan kecil, bukan sebaliknya.', 'Satuan debit: 1 L/s = 10⁻³ m³/s.'])}`,
    contoh: [
      { soal: 'A₁ = 4A₂, v₁ = 2 m/s. Berapa v₂?', jawab: 'v₂ = 4 × 2 = <b>8 m/s</b>.' },
      { soal: 'Lubang tangki berada 1,8 m di bawah permukaan air. Berapa kecepatan pancarannya?', jawab: 'v = √(2 × 10 × 1,8) = <b>6 m/s</b>.' }] },

  { id: 'suhu-kalor', kelas: 'XI', judul: 'Suhu dan Kalor', ikon: 'fa-temperature-half', sim: true, isi: `
    <p class="lead">Suhu menunjukkan seberapa panas benda; kalor adalah energi yang berpindah karena beda suhu. Es batu di dalam teh manis menyerap kalor dari teh, sehingga teh menjadi dingin.</p>
    <h3>Skala termometer</h3>
    <div class="rumus">C : R : (F − 32) = 5 : 4 : 9 &nbsp;&nbsp; K = C + 273</div>
    ${coba('suhu-kalor', 'skala', 'Coba konversi termometer')}
    <h3>Kalor jenis dan perubahan wujud</h3>
    <div class="rumus">Menaikkan suhu: Q = m·c·ΔT &nbsp;&nbsp; Mengubah wujud: Q = m·L</div>
    ${simbol([['Q', 'kalor', 'J'], ['c', 'kalor jenis', 'J/kg°C'], ['L', 'kalor lebur/uap', 'J/kg']])}
    <p>Air: c_es = 2.100, c_air = 4.200 J/kg°C, kalor lebur 336.000 J/kg, kalor uap 2.260.000 J/kg. Selama melebur atau mendidih, suhu tetap.</p>
    ${coba('suhu-kalor', 'wujud', 'Coba memanaskan es')}
    <h3>Asas Black</h3>
    <div class="rumus">Q_lepas = Q_terima &nbsp;&nbsp; m₁c₁(T₁ − T_c) = m₂c₂(T_c − T₂)</div>
    ${coba('suhu-kalor', 'black', 'Coba mencampur air')}
    <h3>Pemuaian</h3>
    <div class="rumus">Panjang: ΔL = L₀·α·ΔT &nbsp;&nbsp; Luas: β = 2α &nbsp;&nbsp; Volume: γ = 3α</div>
    <p>Karena itu rel kereta dan jembatan diberi celah sambungan.</p>
    ${coba('suhu-kalor', 'muai', 'Coba pemuaian batang')}
    <h3>Perpindahan kalor</h3>
    <ul><li><b>Konduksi:</b> lewat zat padat tanpa perpindahan partikel (sendok panas).</li><li><b>Konveksi:</b> disertai aliran zat (air mendidih, angin laut).</li><li><b>Radiasi:</b> tanpa medium (panas Matahari), <span class="rumus-inline">P = e·σ·A·T⁴</span>.</li></ul>
    ${tips(['Selalu periksa apakah ada perubahan wujud sebelum memakai Q = m·c·ΔT.', 'ΔT dalam °C sama dengan ΔT dalam K.', 'Pada asas Black, suhu akhir pasti di antara kedua suhu awal.'])}`,
    contoh: [
      { soal: 'Berapa kalor untuk memanaskan 0,5 kg air dari 20 °C ke 100 °C?', jawab: 'Q = 0,5 × 4.200 × 80 = <b>168.000 J</b>.' },
      { soal: '200 g air 80 °C dicampur 300 g air 20 °C. Berapa suhu akhirnya?', jawab: '200(80 − T) = 300(T − 20) → T = <b>44 °C</b>.' }] },

  { id: 'teori-kinetik', kelas: 'XI', judul: 'Teori Kinetik Gas', ikon: 'fa-circle-nodes', sim: true, isi: `
    <p class="lead">Gas terdiri atas partikel-partikel kecil yang bergerak acak sangat cepat. Tekanan gas di ban muncul karena miliaran partikel menumbuk dindingnya setiap detik.</p>
    <h3>Persamaan gas ideal</h3>
    <div class="rumus">P·V = n·R·T = N·k·T</div>
    ${simbol([['P', 'tekanan', 'Pa'], ['V', 'volume', 'm³'], ['n', 'jumlah mol', 'mol'], ['T', 'suhu mutlak', 'K'], ['R', 'tetapan gas 8,314', 'J/mol·K'], ['k', 'tetapan Boltzmann 1,38 × 10⁻²³', 'J/K']])}
    <p>Turunannya: Boyle (T tetap, PV konstan), Charles (P tetap, V ∝ T), Gay-Lussac (V tetap, P ∝ T).</p>
    <h3>Energi kinetik dan kecepatan partikel</h3>
    <div class="rumus">Ē_k = 3/2 · k·T &nbsp;&nbsp; v_rms = √(3kT/m) = √(3RT/M) &nbsp;&nbsp; P = (2N/3V)·Ē_k</div>
    <p>Suhu adalah ukuran energi kinetik rata-rata partikel. Suhu 4 kali → kecepatan 2 kali.</p>
    ${coba('teori-kinetik', 'gas', 'Coba partikel gas')}
    ${tips(['Suhu selalu dalam kelvin.', 'Gas ringan (H₂) lebih cepat daripada gas berat (O₂) pada suhu sama, tetapi energi kinetik rata-ratanya sama.', 'M dalam kg/mol (O₂ = 0,032 kg/mol).'])}`,
    contoh: [
      { soal: 'Ban 200 kPa pada 27 °C dipanaskan menjadi 57 °C (V tetap). Berapa tekanannya?', jawab: 'P₂ = 200 × 330/300 = <b>220 kPa</b>.' },
      { soal: 'Suhu mutlak gas dinaikkan 4 kali. Berapa kali v_rms?', jawab: 'v ∝ √T → <b>2 kali</b>.' }] },

  { id: 'termodinamika', kelas: 'XI', judul: 'Termodinamika', ikon: 'fa-fire', sim: true, isi: `
    <p class="lead">Mesin mobil mengubah panas menjadi gerak, kulkas memindahkan panas dari dalam ke luar. Termodinamika mempelajari hubungan kalor, usaha, dan energi dalam.</p>
    <h3>Hukum I dan proses termodinamika</h3>
    <div class="rumus">Q = ΔU + W &nbsp;&nbsp; W = P·ΔV &nbsp;&nbsp; ΔU = 3/2·n·R·ΔT (gas monoatomik)</div>
    <table><thead><tr><th>Proses</th><th>Yang tetap</th><th>Ciri</th></tr></thead><tbody>
    <tr><td>Isobarik</td><td>tekanan</td><td>W = P·ΔV</td></tr><tr><td>Isokhorik</td><td>volume</td><td>W = 0, Q = ΔU</td></tr>
    <tr><td>Isotermal</td><td>suhu</td><td>ΔU = 0, W = nRT ln(V₂/V₁)</td></tr><tr><td>Adiabatik</td><td>tanpa kalor</td><td>Q = 0, P·V^γ konstan</td></tr></tbody></table>
    <p>Tanda: Q positif jika gas menyerap kalor, W positif jika gas melakukan usaha (memuai).</p>
    ${coba('termodinamika', 'proses', 'Coba proses gas')}
    <h3>Hukum II dan mesin kalor</h3>
    <div class="rumus">η = W/Q₁ = 1 − Q₂/Q₁ &nbsp;&nbsp; Carnot: η = 1 − T₂/T₁ &nbsp;&nbsp; Kulkas: K = T₂/(T₁ − T₂)</div>
    <p>Kalor mengalir sendiri dari panas ke dingin. Tidak ada mesin yang efisiensinya 100%; efisiensi maksimum adalah efisiensi Carnot.</p>
    ${coba('termodinamika', 'carnot', 'Coba mesin Carnot')}
    ${tips(['Luas di bawah kurva P–V sama dengan usaha.', 'Gunakan suhu kelvin pada rumus Carnot.', 'Pada proses siklus, ΔU total = 0.'])}`,
    contoh: [
      { soal: 'Gas menyerap 500 J dan melakukan usaha 200 J. Berapa ΔU?', jawab: 'ΔU = 500 − 200 = <b>300 J</b>.' },
      { soal: 'Mesin Carnot bekerja antara 800 K dan 400 K. Berapa efisiensinya?', jawab: 'η = 1 − 400/800 = <b>50%</b>.' }] },

  { id: 'gelombang', kelas: 'XI', judul: 'Gelombang Mekanik', ikon: 'fa-chart-line', sim: true, isi: `
    <p class="lead">Lempar batu ke kolam: riaknya menyebar, tetapi daun di permukaan hanya naik-turun di tempat. Gelombang memindahkan energi, bukan medium.</p>
    <h3>Besaran gelombang</h3>
    <p><b>Transversal:</b> arah getar tegak lurus arah rambat (tali, permukaan air). <b>Longitudinal:</b> arah getar sejajar arah rambat (bunyi, slinki).</p>
    <div class="rumus">v = λ·f = λ/T &nbsp;&nbsp; k = 2π/λ &nbsp;&nbsp; ω = 2πf</div>
    ${simbol([['λ', 'panjang gelombang', 'm'], ['f', 'frekuensi', 'Hz'], ['v', 'cepat rambat', 'm/s'], ['k', 'bilangan gelombang', 'rad/m']])}
    <h3>Gelombang berjalan dan stasioner</h3>
    <div class="rumus">Berjalan: y = A sin(ωt − kx)<br>Stasioner ujung terikat: y = 2A sin(kx) cos(ωt), simpul tiap ½λ</div>
    <p>Gelombang stasioner muncul dari dua gelombang berlawanan arah yang berpadu, misalnya pada senar gitar. Ada <b>simpul</b> (diam) dan <b>perut</b> (simpangan terbesar).</p>
    ${coba('gelombang', 'tali', 'Coba gelombang pada tali')}
    ${tips(['Frekuensi tidak berubah saat gelombang pindah medium; yang berubah v dan λ.', 'Jarak dua puncak berdekatan = λ; jarak puncak ke lembah = ½λ.'])}`,
    contoh: [
      { soal: 'f = 5 Hz dan λ = 2 m. Berapa v?', jawab: 'v = 2 × 5 = <b>10 m/s</b>.' },
      { soal: 'y = 0,05 sin(10πt − 2πx). Tentukan f, λ, dan v.', jawab: 'f = 5 Hz, λ = 1 m, v = <b>5 m/s</b>.' }] },

  { id: 'bunyi', kelas: 'XI', judul: 'Gelombang Bunyi', ikon: 'fa-volume-high', sim: true, isi: `
    <p class="lead">Bunyi adalah gelombang longitudinal yang butuh medium. Di luar angkasa tidak ada bunyi. Di udara bunyi merambat sekitar 340 m/s.</p>
    <h3>Efek Doppler</h3>
    <div class="rumus">f_p = (v ± v_p)/(v ∓ v_s) · f_s</div>
    <p>Gunakan tanda atas jika pendengar dan sumber saling mendekat: bunyi terdengar lebih tinggi. Sirene ambulans yang menjauh terdengar lebih rendah.</p>
    ${coba('bunyi', 'doppler', 'Coba efek Doppler')}
    <h3>Pipa organa</h3>
    <div class="rumus">Terbuka: f_n = n·v/(2L) &nbsp;&nbsp; Tertutup: f_n = (2n − 1)·v/(4L)</div>
    ${coba('bunyi', 'pipa', 'Coba pipa organa')}
    <h3>Dawai (senar)</h3>
    <div class="rumus">f_n = (n/2L)·√(F/μ) &nbsp;&nbsp; μ = m/L</div>
    ${simbol([['F', 'tegangan senar', 'N'], ['μ', 'massa per panjang senar', 'kg/m'], ['n', 'nomor nada (1 = dasar)', '-']])}
    ${coba('bunyi', 'dawai', 'Coba senar gitar')}
    <h3>Intensitas dan taraf intensitas</h3>
    <div class="rumus">I = P/(4πr²) &nbsp;&nbsp; TI = 10 log(I/I₀), I₀ = 10⁻¹² W/m²<br>n sumber: TI_n = TI₁ + 10 log n &nbsp;&nbsp; jarak: TI₂ = TI₁ − 20 log(r₂/r₁)</div>
    ${coba('bunyi', 'intensitas', 'Coba kebisingan mesin')}
    ${tips(['Taraf intensitas tidak dijumlahkan biasa: 10 mesin 60 dB = 70 dB, bukan 600 dB.', 'Pipa tertutup hanya punya harmonik ganjil.'])}`,
    contoh: [
      { soal: 'Ambulans 20 m/s mendekat dengan sirene 680 Hz (v = 340). Berapa f_p?', jawab: 'f_p = 340/320 × 680 = <b>722,5 Hz</b>.' },
      { soal: 'Pipa organa terbuka 50 cm (v = 340 m/s). Berapa nada dasarnya?', jawab: 'f₁ = 340/(2 × 0,5) = <b>340 Hz</b>.' }] },

  { id: 'cahaya', kelas: 'XI', judul: 'Gelombang Cahaya', ikon: 'fa-lightbulb', sim: true, isi: `
    <p class="lead">Warna pelangi pada gelembung sabun dan CD membuktikan bahwa cahaya adalah gelombang: cahaya bisa saling menguatkan atau melemahkan (interferensi).</p>
    <h3>Interferensi celah ganda Young</h3>
    <div class="rumus">Terang ke-n: d·y/L = n·λ &nbsp;&nbsp; jarak antarterang Δy = λ·L/d</div>
    ${simbol([['d', 'jarak antarcelah', 'm'], ['L', 'jarak celah ke layar', 'm'], ['y', 'jarak garis dari terang pusat', 'm'], ['λ', 'panjang gelombang cahaya', 'm']])}
    ${coba('cahaya', 'celah-ganda', 'Coba celah ganda')}
    <h3>Kisi difraksi</h3>
    <div class="rumus">d·sin θ = n·λ &nbsp;&nbsp; d = 1/N</div>
    <p>N adalah jumlah garis per meter. Kisi memisahkan warna lebih tajam daripada celah ganda.</p>
    ${coba('cahaya', 'kisi', 'Coba kisi difraksi')}
    <h3>Polarisasi</h3>
    <div class="rumus">Hukum Malus: I = I₀ cos² θ &nbsp;&nbsp; Brewster: tan θ_B = n₂/n₁</div>
    <p>Cahaya tak terpolarisasi yang melewati polarisator tinggal ½ intensitasnya.</p>
    ${coba('cahaya', 'polarisasi', 'Coba dua polarisator')}
    ${tips(['Ubah nm ke m (× 10⁻⁹) dan mm ke m (× 10⁻³).', 'Δy bertambah jika λ atau L diperbesar, dan berkurang jika d diperbesar.'])}`,
    contoh: [
      { soal: 'λ = 600 nm, d = 0,3 mm, L = 1 m. Berapa Δy?', jawab: 'Δy = 600 × 10⁻⁹/0,3 × 10⁻³ = <b>2 mm</b>.' },
      { soal: 'Kisi 500 garis/mm disinari 500 nm. Berapa sin θ orde 1?', jawab: 'd = 2 × 10⁻⁶ m; sin θ = 500 × 10⁻⁹/2 × 10⁻⁶ = <b>0,25</b>.' }] },

  { id: 'optik', kelas: 'XI', judul: 'Alat Optik', ikon: 'fa-glasses', sim: true, isi: `
    <p class="lead">Kacamata, lup, mikroskop, dan teropong bekerja dengan lensa yang membelokkan cahaya untuk membentuk bayangan.</p>
    <h3>Pembentukan bayangan pada lensa</h3>
    <div class="rumus">1/f = 1/s + 1/s′ &nbsp;&nbsp; M = |s′/s| = h′/h &nbsp;&nbsp; P = 100/f (f dalam cm)</div>
    ${simbol([['f', 'jarak fokus (+ cembung, − cekung)', 'cm'], ['s, s′', 'jarak benda dan bayangan', 'cm'], ['M', 'perbesaran', 'kali'], ['P', 'kekuatan lensa', 'dioptri']])}
    <p>s′ positif = bayangan nyata dan terbalik; s′ negatif = bayangan maya dan tegak.</p>
    ${coba('optik', 'lensa', 'Coba diagram sinar lensa')}
    <h3>Mata dan kacamata</h3>
    <div class="rumus">Miopi (rabun jauh): P = −100/PR &nbsp;&nbsp; Hipermetropi (rabun dekat): P = 4 − 100/PP</div>
    ${coba('optik', 'kacamata', 'Coba memilih kacamata')}
    <h3>Lup, mikroskop, dan teropong</h3>
    <div class="rumus">Lup: M = 25/f (tak berakomodasi) atau 25/f + 1 (berakomodasi)<br>Mikroskop: M = (s′_ob/s_ob)·(25/f_ok) &nbsp;&nbsp; Teropong bintang: M = f_ob/f_ok, panjang d = f_ob + f_ok</div>
    ${coba('optik', 'lup', 'Coba lup')} ${coba('optik', 'mikroskop', 'Coba mikroskop')} ${coba('optik', 'teropong', 'Coba teropong')}
    ${tips(['Benda di titik fokus tidak membentuk bayangan (di tak hingga).', 'Lensa cekung selalu membentuk bayangan maya, tegak, diperkecil.', 'PR dan PP dalam cm.'])}`,
    contoh: [
      { soal: 'Benda 15 cm di depan lensa cembung f = 10 cm. Tentukan s′ dan sifatnya.', jawab: 's′ = <b>30 cm</b>, M = 2: nyata, terbalik, diperbesar.' },
      { soal: 'Titik jauh mata 2 m. Kacamata berapa dioptri?', jawab: 'P = −100/200 = <b>−0,5 D</b> (lensa cekung).' }] },
];
