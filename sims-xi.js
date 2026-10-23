// Mode simulasi tambahan kelas XI (satu mode per rumus).
import * as THREE from 'three';
import { sim, V, deg, g, clamp, fx, wl2rgb } from './sims.js';

const pa = P => P >= 1e6 ? fx(P / 1e6, 2) + ' MPa' : P >= 1e3 ? fx(P / 1e3, 1) + ' kPa' : fx(P, 0) + ' Pa';

/* ---------- rotasi: torsi & jungkat-jungkit ---------- */
sim('rotasi', { mode: 'torsi', label: 'Torsi & kesetimbangan', desc: 'Jungkat-jungkit setimbang jika torsi kiri sama dengan torsi kanan: m₁·g·r₁ = m₂·g·r₂.',
  params: [{ k: 'm1', label: 'Massa anak kiri', min: 10, max: 60, step: 1, val: 30, unit: 'kg' }, { k: 'r1', label: 'Jarak anak kiri ke poros', min: 0.3, max: 2.8, step: 0.1, val: 2, unit: 'm' },
    { k: 'm2', label: 'Massa anak kanan', min: 10, max: 60, step: 1, val: 40, unit: 'kg' }, { k: 'r2', label: 'Jarak anak kanan ke poros', min: 0.3, max: 2.8, step: 0.1, val: 1.2, unit: 'm' }],
  cam: [0, 1.6, 8.5], target: [0, 1, 0],
  build(T) {
    T.box(8, 0.05, 2, 0xcbd5e1).position.y = -0.025;
    T.add(new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.8, 3), T.mat(0x475569))).position.y = 0.4;
    const papan = T.add(new THREE.Group()); papan.position.y = 0.85;
    T.box(6, 0.1, 0.5, 0xd6b38a, {}, papan);
    const anak = [0x2563eb, 0xea580c].map(c => { const a = T.add(new THREE.Group(), papan); T.cyl(0.15, 0.18, 0.6, c, {}, a).position.y = 0.35; T.sphere(0.14, 0xfcd34d, {}, a).position.y = 0.8; return a; });
    const tl = [T.label('', anak[0], 'small'), T.label('', anak[1], 'small')]; tl.forEach(l => { l.position.y = 1.1; });
    let sudut = 0; const st = {};
    return {
      update(dt, p) {
        const t1 = p.m1 * g * p.r1, t2 = p.m2 * g * p.r2, net = t2 - t1;
        Object.assign(st, { t1, t2, net });
        const target = clamp(-net * 0.0006, -0.22, 0.22); sudut += (target - sudut) * Math.min(1, dt * 3); papan.rotation.z = sudut;
        anak[0].position.x = -p.r1; anak[1].position.x = p.r2; anak[0].scale.setScalar(0.7 + p.m1 / 100); anak[1].scale.setScalar(0.7 + p.m2 / 100);
        tl[0].text(`${p.m1} kg`); tl[1].text(`${p.m2} kg`);
      },
      readout(p) {
        return [['Torsi kiri τ₁ = m₁·g·r₁', fx(st.t1, 0) + ' N·m'], ['Torsi kanan τ₂ = m₂·g·r₂', fx(st.t2, 0) + ' N·m'], ['Resultan torsi', fx(Math.abs(st.net), 0) + ' N·m'],
          ['Keadaan', Math.abs(st.net) < 5 ? 'Setimbang' : st.net > 0 ? 'Miring ke kanan' : 'Miring ke kiri'], ['Agar setimbang, r₂ =', fx(p.m1 * p.r1 / p.m2, 2) + ' m']];
      },
    };
  },
});

/* ---------- rotasi: momentum sudut ---------- */
sim('rotasi', { mode: 'momentum-sudut', label: 'Momentum sudut', desc: 'Penari menarik lengannya: I mengecil, ω membesar, karena L = I·ω tetap.',
  params: [{ k: 'rentang', label: 'Lengan direntangkan', min: 0, max: 1, step: 0.05, val: 1, unit: '(0 = dirapatkan)' }, { k: 'w0', label: 'Kecepatan sudut saat lengan terentang', min: 0.5, max: 4, step: 0.1, val: 2, unit: 'rad/s', rebuild: true }],
  cam: [0, 1.8, 6], target: [0, 1.3, 0],
  build(T, p) {
    T.add(new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.05, 48), T.mat(0xe0f2fe))).position.y = -0.025;
    const penari = T.add(new THREE.Group());
    T.cyl(0.18, 0.22, 1.3, 0x7c3aed, {}, penari).position.y = 0.9; T.sphere(0.17, 0xfcd34d, {}, penari).position.y = 1.75;
    const lengan = [1, -1].map(s => ({ s, rod: T.rod(0.05, 0xfcd34d, {}, penari), tangan: T.sphere(0.08, 0xfcd34d, {}, penari) }));
    const Ii = r => 1 + 8 * r * r, L = Ii(0.9) * p.w0;
    let ang = 0; const st = {};
    return {
      update(dt, q) {
        const r = 0.2 + 0.7 * q.rentang, I = Ii(r), w = L / I; Object.assign(st, { I, w });
        ang += w * dt; penari.rotation.y = ang;
        lengan.forEach(o => { const ujung = V(o.s * (0.2 + r), 1.35, 0); o.rod.set(V(o.s * 0.18, 1.35, 0), ujung); o.tangan.position.copy(ujung); });
      },
      readout() {
        return [['Momen inersia I', fx(st.I, 2) + ' kg·m²'], ['Kecepatan sudut ω', fx(st.w, 2) + ' rad/s'], ['Momentum sudut L = I·ω (tetap)', fx(L, 2) + ' kg·m²/s'],
          ['Energi kinetik rotasi ½Iω²', fx(0.5 * st.I * st.w * st.w, 1) + ' J'], ['Catatan', 'Energi bertambah dari usaha otot penari']];
      },
    };
  },
});

/* ---------- elastisitas: modulus Young ---------- */
const BAHAN = { baja: ['Baja', 2e11, 0x64748b], tembaga: ['Tembaga', 1.1e11, 0xb45309], aluminium: ['Aluminium', 7e10, 0xcbd5e1] };
sim('elastisitas', { mode: 'young', label: 'Modulus Young', desc: 'Kawat ditarik beban. Pertambahan panjang sangat kecil, jadi pada gambar diperbesar.',
  params: [{ k: 'bahan', label: 'Bahan kawat', opts: Object.entries(BAHAN).map(([k, v]) => [k, v[0]]), val: 'baja' },
    { k: 'F', label: 'Gaya tarik (berat beban)', min: 0, max: 2000, step: 50, val: 1000, unit: 'N' }, { k: 'L0', label: 'Panjang awal kawat', min: 0.5, max: 3, step: 0.1, val: 2, unit: 'm' },
    { k: 'A', label: 'Luas penampang', min: 0.5, max: 10, step: 0.5, val: 2, unit: 'mm²' }],
  cam: [0, 1.8, 6.5], target: [0, 1.8, 0],
  build(T) {
    const top = 3.8;
    T.box(2, 0.12, 0.6, 0x475569).position.y = top + 0.06;
    const kawat = T.rod(0.025, 0x64748b), beban = T.box(0.5, 0.5, 0.5, 0x334155), awal = T.line(0x16a34a, 2, { dashed: true }), lb = T.label('panjang awal', T.group, 'small');
    return {
      update(dt, p) {
        const [, E, c] = BAHAN[p.bahan], dL = p.F * p.L0 / (p.A * 1e-6 * E);
        kawat.material.color.setHex(c);
        const vis = p.L0 * 0.9, ujung = top - vis - Math.min(dL * 300, 1.2);
        kawat.set(V(0, ujung, 0), V(0, top, 0)); beban.position.y = ujung - 0.25;
        awal.set([V(-0.6, top - vis, 0), V(0.6, top - vis, 0)]); lb.position.set(1.4, top - vis, 0);
      },
      readout(p) {
        const E = BAHAN[p.bahan][1], s = p.F / (p.A * 1e-6), e = s / E;
        return [['Tegangan σ = F/A', fx(s) + ' N/m²'], ['Regangan e = σ/E', fx(e)], ['Pertambahan panjang ΔL = e·L₀', fx(e * p.L0 * 1000, 3) + ' mm'], ['Modulus Young bahan', fx(E) + ' N/m²'], ['Gambar', 'pertambahan diperbesar 300×']];
      },
    };
  },
});

/* ---------- fluida statis: tekanan hidrostatis ---------- */
const CAIR = { 1000: 'Air', 800: 'Minyak', 1030: 'Air laut', 13600: 'Raksa' };
sim('fluida-statis', { mode: 'hidrostatis', label: 'Tekanan hidrostatis', desc: 'Tekanan zat cair bertambah dengan kedalaman: P = ρ·g·h. Panah menunjukkan tekanan dari segala arah.',
  params: [{ k: 'rho', label: 'Jenis zat cair', opts: Object.entries(CAIR), val: '1000' }, { k: 'h', label: 'Kedalaman sensor h', min: 0, max: 10, step: 0.5, val: 5, unit: 'm' }],
  cam: [0, 2, 7], target: [0, 1.9, 0],
  build(T) {
    const D = 10, sc = 0.36;
    T.box(2.6, D * sc + 0.3, 1.6, 0xbfdbfe, { opacity: 0.15 }).position.y = (D * sc + 0.3) / 2;
    const cair = T.box(2.5, D * sc, 1.5, 0x3b82f6, { opacity: 0.35 }); cair.position.y = D * sc / 2;
    for (let m = 0; m <= D; m += 2) T.label(`${m} m`, T.group, 'small').position.set(-1.7, D * sc - m * sc, 0);
    const sensor = T.sphere(0.12, 0xea580c), panah = Array.from({ length: 8 }, () => T.arrow(0x7c3aed, 0.025));
    return {
      update(dt, p) {
        cair.material.color.setHex({ 1000: 0x3b82f6, 800: 0xeab308, 1030: 0x0e7490, 13600: 0x94a3b8 }[p.rho]);
        sensor.position.set(0, D * sc - p.h * sc, 0);
        const L = 0.15 + 0.6 * clamp(+p.rho * p.h / (13600 * D), 0, 1) ** 0.5;
        panah.forEach((a, i) => { const t = i / 8 * Math.PI * 2, d = V(Math.cos(t), Math.sin(t), 0); a.set(sensor.position.clone().addScaledVector(d, 0.16 + L), d.clone().multiplyScalar(-L)); });
      },
      readout(p) {
        const Ph = +p.rho * g * p.h;
        return [['Tekanan hidrostatis P = ρ·g·h', pa(Ph)], ['Tekanan total (+ udara 10⁵ Pa)', pa(Ph + 1e5)], ['Dalam atmosfer', fx((Ph + 1e5) / 1.013e5, 2) + ' atm'], ['Zat cair', CAIR[p.rho]]];
      },
    };
  },
});

/* ---------- fluida statis: hukum Pascal ---------- */
sim('fluida-statis', { mode: 'pascal', label: 'Hukum Pascal', desc: 'Dongkrak hidrolik: tekanan diteruskan sama besar, sehingga gaya kecil pada pengisap kecil mengangkat beban besar.',
  params: [{ k: 'F1', label: 'Gaya pada pengisap kecil F₁', min: 10, max: 500, step: 10, val: 100, unit: 'N' }, { k: 'A1', label: 'Luas pengisap kecil A₁', min: 1, max: 50, step: 1, val: 5, unit: 'cm²' },
    { k: 'A2', label: 'Luas pengisap besar A₂', min: 50, max: 1000, step: 10, val: 500, unit: 'cm²' }],
  cam: [0, 1.6, 7], target: [0, 1.2, 0],
  build(T) {
    const x1 = -1.6, x2 = 1, base = 0.3;
    const tab1 = T.cyl(1, 1, 2, 0xe0f2fe, { opacity: 0.25 }), tab2 = T.cyl(1, 1, 2, 0xe0f2fe, { opacity: 0.25 });
    T.box(3.4, 0.4, 0.6, 0x3b82f6, { opacity: 0.6 }).position.set(-0.3, base, 0);
    const cair1 = T.cyl(1, 1, 1, 0x3b82f6, { opacity: 0.6 }), cair2 = T.cyl(1, 1, 1, 0x3b82f6, { opacity: 0.6 });
    const p1 = T.cyl(1, 1, 0.12, 0x475569, { metal: 0.6 }), p2 = T.cyl(1, 1, 0.12, 0x475569, { metal: 0.6 });
    const mobil = T.add(new THREE.Group()); T.box(1.2, 0.35, 0.6, 0xdc2626, {}, mobil).position.y = 0.3; T.box(0.6, 0.25, 0.55, 0x93c5fd, {}, mobil).position.y = 0.6;
    const aF = T.arrow(0xea580c, 0.05), lF = T.label('F₁', T.group, 'accent'), lF2 = T.label('', T.group, 'small');
    let t = 0;
    return {
      update(dt, p) {
        const r1 = 0.08 + Math.sqrt(p.A1) * 0.06, r2 = 0.2 + Math.sqrt(p.A2) * 0.03;
        [[tab1, x1, r1], [tab2, x2, r2]].forEach(([tb, x, r]) => { tb.scale.set(r, 1, r); tb.position.set(x, base + 1, 0); });
        t += dt; const s = (1 - Math.cos(t * 1.5)) / 2, d1 = s * 0.8, d2 = d1 * p.A1 / p.A2;
        const h1 = 1.4 - d1, h2 = 1.0 + d2;
        cair1.scale.set(r1 * 0.98, h1, r1 * 0.98); cair1.position.set(x1, base + h1 / 2, 0); cair2.scale.set(r2 * 0.98, h2, r2 * 0.98); cair2.position.set(x2, base + h2 / 2, 0);
        p1.scale.set(r1, 1, r1); p1.position.set(x1, base + h1 + 0.06, 0); p2.scale.set(r2, 1, r2); p2.position.set(x2, base + h2 + 0.06, 0);
        mobil.position.set(x2, base + h2 + 0.12, 0);
        aF.set(V(x1, base + h1 + 0.9, 0), V(0, -0.7, 0)); lF.position.set(x1 + 0.35, base + h1 + 0.6, 0);
        lF2.position.set(x2, base + h2 + 1.1, 0); lF2.text(`F₂ = ${fx(p.F1 * p.A2 / p.A1, 0)} N`);
      },
      readout(p) {
        const P = p.F1 / (p.A1 * 1e-4);
        return [['Tekanan P = F₁/A₁ (diteruskan sama)', pa(P)], ['Gaya angkat F₂ = F₁·A₂/A₁', fx(p.F1 * p.A2 / p.A1, 0) + ' N'], ['Keuntungan mekanis A₂/A₁', fx(p.A2 / p.A1, 1) + ' ×'],
          ['Jika pengisap kecil turun 10 cm', `pengisap besar naik ${fx(10 * p.A1 / p.A2, 2)} cm`]];
      },
    };
  },
});

/* ---------- fluida statis: kapilaritas ---------- */
const KAP = { air: ['Air', 0.072, 0, 1000, 0x3b82f6], raksa: ['Raksa', 0.47, 140, 13600, 0x94a3b8] };
sim('fluida-statis', { mode: 'kapilaritas', label: 'Kapilaritas', desc: 'Makin sempit pipa, makin tinggi zat cair naik (air) atau makin dalam turun (raksa).',
  params: [{ k: 'zat', label: 'Zat cair', opts: Object.entries(KAP).map(([k, v]) => [k, v[0]]), val: 'air' }, { k: 'r', label: 'Jari-jari pipa paling kiri', min: 0.2, max: 1, step: 0.05, val: 0.5, unit: 'mm' }],
  cam: [0, 1.4, 6], target: [0, 1.2, 0],
  build(T) {
    const bak = T.box(4, 0.8, 1.2, 0x3b82f6, { opacity: 0.4 }); bak.position.y = 0.4;
    const pipa = [1, 2, 4].map((k, i) => ({ k, x: -1.2 + i * 1.2, kaca: T.cyl(1, 1, 3, 0xe0f2fe, { opacity: 0.25 }), isi: T.cyl(1, 1, 1, 0x3b82f6, { opacity: 0.8 }), l: T.label('', T.group, 'small') }));
    return {
      update(dt, p) {
        const [, gam, th, rho, c] = KAP[p.zat]; bak.material.color.setHex(c);
        pipa.forEach(o => {
          const r = p.r * o.k, y = 2 * gam * Math.cos(th * deg) / (rho * g * r * 1e-3) * 1000, vis = clamp(y / 25, -0.7, 2.2), rv = 0.04 + r * 0.06;
          o.kaca.scale.set(rv + 0.02, 1, rv + 0.02); o.kaca.position.set(o.x, 1.6, 0);
          const atas = 0.8 + vis; o.isi.material.color.setHex(c); o.isi.scale.set(rv, Math.max(atas - 0.1, 0.01), rv); o.isi.position.set(o.x, 0.1 + (atas - 0.1) / 2, 0);
          o.l.position.set(o.x, 3.25, 0); o.l.text(`r = ${fx(r, 2)} mm: ${fx(y, 1)} mm`);
        });
      },
      readout(p) {
        const [nama, gam, th, rho] = KAP[p.zat], y = 2 * gam * Math.cos(th * deg) / (rho * g * p.r * 1e-3) * 1000;
        return [['Kenaikan y = 2γcos θ/(ρgr) (pipa kiri)', fx(y, 1) + ' mm'], ['Zat cair ; sudut kontak', `${nama} ; ${th}°`], ['Pipa 2× lebih lebar', 'kenaikan ½ kali'], ['Arti tanda negatif', 'permukaan turun (raksa)']];
      },
    };
  },
});

/* ---------- fluida statis: hukum Stokes ---------- */
const VISK = { oli: ['Oli', 0.25, 900], gliserin: ['Gliserin', 1.4, 1260], madu: ['Madu', 6, 1420] };
sim('fluida-statis', { mode: 'stokes', label: 'Viskositas (Stokes)', desc: 'Bola jatuh dalam zat cair kental mula-mula dipercepat lalu bergerak tetap pada kecepatan terminal.',
  params: [{ k: 'zat', label: 'Zat cair kental', opts: Object.entries(VISK).map(([k, v]) => [k, v[0]]), val: 'gliserin', rebuild: true }, { k: 'r', label: 'Jari-jari bola', min: 1, max: 5, step: 0.5, val: 2, unit: 'mm', rebuild: true },
    { k: 'rb', label: 'Massa jenis bola', min: 2500, max: 8000, step: 100, val: 7800, unit: 'kg/m³', rebuild: true }],
  cam: [1.2, 2, 7], target: [1.2, 1.9, 0],
  build(T, p) {
    const [, eta, rf] = VISK[p.zat], r = p.r * 1e-3, vT = 2 * r * r * g * (p.rb - rf) / (9 * eta), tau = vT / (g * (1 - rf / p.rb));
    T.cyl(0.6, 0.6, 3.8, 0xfef3c7, { opacity: 0.4 }).position.set(0, 1.9, 0);
    const bola = T.sphere(0.06 + p.r * 0.02, 0x475569, { metal: 0.6 });
    const pnl = T.panel({ x: 1, y: 0.4, w: 3.2, h: 2.8, xl: 't', yl: 'v' }), kurva = T.line(0xdc2626, 101), dot = T.sphere(0.05, 0xdc2626);
    const tMax = Math.max(5 * tau, 0.05), pts = [];
    for (let i = 0; i <= 100; i++) pts.push(pnl.map(i / 100, (1 - Math.exp(-tMax * i / 100 / tau)) * 0.85));
    kurva.set(pts); T.line(0x94a3b8, 2, { dashed: true }).set([pnl.map(0, 0.85), pnl.map(1, 0.85)]); T.label('v terminal', T.group, 'small').position.copy(pnl.map(0.85, 0.95));
    let t = 0, y = 3.6;
    return {
      update(dt) {
        t += dt; const u = Math.min(t / 2.5, 1), v = 1 - Math.exp(-u * tMax / tau);
        y -= v * dt * 0.9; if (y < 0.2) { y = 3.6; t = 0; }
        bola.position.set(0, y, 0); dot.position.copy(pnl.map(u, v * 0.85));
      },
      readout() {
        const V3 = 4 / 3 * Math.PI * r ** 3;
        return [['Kecepatan terminal v_T = 2r²g(ρ_b − ρ_f)/(9η)', fx(vT, 3) + ' m/s'], ['Gaya Stokes F = 6πηrv_T', fx(6 * Math.PI * eta * r * vT) + ' N'], ['Berat bola', fx(p.rb * V3 * g) + ' N'], ['Gaya apung', fx(rf * V3 * g) + ' N'],
          ['Saat terminal', 'berat = gaya apung + gaya Stokes']];
      },
    };
  },
});

/* ---------- fluida dinamis: Torricelli ---------- */
sim('fluida-dinamis', { mode: 'torricelli', label: 'Tangki bocor (Torricelli)', desc: 'Air keluar dari lubang dengan kecepatan v = √(2gh) lalu membentuk lintasan parabola.',
  params: [{ k: 'h', label: 'Kedalaman lubang dari permukaan h', min: 0.2, max: 2, step: 0.05, val: 1.25, unit: 'm' }, { k: 'H', label: 'Tinggi lubang dari tanah H', min: 0.2, max: 2, step: 0.05, val: 0.8, unit: 'm' }],
  cam: [1, 1.8, 7], target: [1, 1.5, 0],
  build(T) {
    const x0 = -1.2;
    T.box(7, 0.05, 2, 0xcbd5e1).position.set(1, -0.025, 0);
    const tangki = T.box(1.2, 1, 1, 0xe0f2fe, { opacity: 0.3 }), air = T.box(1.15, 1, 0.95, 0x3b82f6, { opacity: 0.5 }), kaki = T.rod(0.05, 0x64748b);
    const tetes = Array.from({ length: 30 }, (_, i) => ({ m: T.sphere(0.04, 0x0284c7), u: i / 30 })), titik = T.cyl(0.15, 0.15, 0.02, 0xdc2626);
    return {
      update(dt, p) {
        const atas = p.H + p.h; tangki.scale.y = atas + 0.15; tangki.position.set(x0, (atas + 0.15) / 2, 0);
        air.scale.y = p.h + 0.05; air.position.set(x0, p.H - 0.05 + (p.h + 0.05) / 2, 0); kaki.set(V(x0, 0, 0.6), V(x0, p.H, 0.6));
        const v = Math.sqrt(2 * g * p.h), tf = Math.sqrt(2 * p.H / g);
        titik.position.set(x0 + 0.6 + v * tf, 0.01, 0);
        tetes.forEach(o => { o.u = (o.u + dt * 0.8) % 1; const t = o.u * tf; o.m.position.set(x0 + 0.6 + v * t, p.H - g / 2 * t * t, 0); });
      },
      readout(p) {
        const v = Math.sqrt(2 * g * p.h), tf = Math.sqrt(2 * p.H / g);
        return [['Kecepatan pancaran v = √(2gh)', fx(v, 2) + ' m/s'], ['Waktu sampai tanah t = √(2H/g)', fx(tf, 2) + ' s'], ['Jarak pancaran x = 2√(hH)', fx(2 * Math.sqrt(p.h * p.H), 2) + ' m'], ['Jarak terjauh dicapai saat', 'h = H']];
      },
    };
  },
});

/* ---------- suhu-kalor: skala termometer ---------- */
sim('suhu-kalor', { mode: 'skala', label: 'Skala termometer', desc: 'Satu suhu yang sama dibaca pada empat skala termometer.',
  params: [{ k: 'C', label: 'Suhu', min: -40, max: 120, step: 1, val: 25, unit: '°C' }],
  cam: [0, 1.8, 6.5], target: [0, 1.8, 0],
  build(T) {
    const skala = [['Celsius', c => c, '°C'], ['Reamur', c => 0.8 * c, '°R'], ['Fahrenheit', c => 1.8 * c + 32, '°F'], ['Kelvin', c => c + 273, 'K']];
    const items = skala.map(([nama, f, u], i) => {
      const x = -2.1 + i * 1.4;
      T.cyl(0.12, 0.12, 3.2, 0xffffff, { opacity: 0.4 }).position.set(x, 1.9, 0); T.sphere(0.2, 0xdc2626).position.set(x, 0.25, 0);
      T.label(nama, T.group, 'small').position.set(x, 3.75, 0);
      return { f, u, x, kolom: T.cyl(0.07, 0.07, 1, 0xdc2626), l: T.label('', T.group, 'accent') };
    });
    return {
      update(dt, p) {
        const tinggi = 0.3 + (p.C + 40) / 160 * 3;
        items.forEach(o => { o.kolom.scale.y = tinggi; o.kolom.position.set(o.x, 0.3 + tinggi / 2, 0); o.l.position.set(o.x, 0.4 + tinggi, 0.2); o.l.text(`${fx(o.f(p.C), 1)} ${o.u}`); });
      },
      readout(p) {
        return [['Celsius', fx(p.C, 1) + ' °C'], ['Reamur = 4/5 C', fx(0.8 * p.C, 1) + ' °R'], ['Fahrenheit = 9/5 C + 32', fx(1.8 * p.C + 32, 1) + ' °F'], ['Kelvin = C + 273', fx(p.C + 273, 0) + ' K']];
      },
    };
  },
});

/* ---------- suhu-kalor: asas Black ---------- */
sim('suhu-kalor', { mode: 'black', label: 'Asas Black', desc: 'Air panas dan air dingin dicampur: kalor yang dilepas air panas = kalor yang diterima air dingin.',
  params: [{ k: 'm1', label: 'Massa air panas', min: 50, max: 500, step: 10, val: 200, unit: 'g', rebuild: true }, { k: 'T1', label: 'Suhu air panas', min: 40, max: 100, step: 1, val: 80, unit: '°C', rebuild: true },
    { k: 'm2', label: 'Massa air dingin', min: 50, max: 500, step: 10, val: 300, unit: 'g', rebuild: true }, { k: 'T2', label: 'Suhu air dingin', min: 0, max: 39, step: 1, val: 20, unit: '°C', rebuild: true }],
  cam: [0.8, 1.6, 7], target: [0.8, 1.3, 0],
  build(T, p) {
    const Tc = (p.m1 * p.T1 + p.m2 * p.T2) / (p.m1 + p.m2);
    const gelas = x => { T.cyl(0.5, 0.45, 1.2, 0xe0f2fe, { opacity: 0.25 }).position.set(x, 0.6, 0); return T.cyl(0.46, 0.42, 1, 0xdc2626, { opacity: 0.75 }); };
    const a = gelas(-2), b = gelas(-0.6), la = T.label('', T.group, 'accent'), lb = T.label('');
    const pnl = T.panel({ x: 0.6, y: 0.2, w: 3.6, h: 2.6, xl: 't', yl: 'T (°C)' });
    const k1 = T.line(0xdc2626, 120), k2 = T.line(0x2563eb, 120), p1 = [], p2 = [];
    const warna = t => new THREE.Color().setHSL(0.62 - clamp(t / 100, 0, 1) * 0.62, 0.8, 0.5);
    let t = 0;
    return {
      update(dt) {
        t += dt; if (t > 8) { t = 0; p1.length = 0; p2.length = 0; }
        const f = 1 - Math.exp(-t * 0.7), ta = p.T1 + (Tc - p.T1) * f, tb = p.T2 + (Tc - p.T2) * f;
        a.scale.y = Math.max(p.m1 / 500, 0.05); a.position.set(-2, 0.1 + a.scale.y / 2, 0); a.material.color.copy(warna(ta));
        b.scale.y = Math.max(p.m2 / 500, 0.05); b.position.set(-0.6, 0.1 + b.scale.y / 2, 0); b.material.color.copy(warna(tb));
        la.position.set(-2, 1.5, 0); la.text(`${fx(ta, 1)} °C`); lb.position.set(-0.6, 1.5, 0); lb.text(`${fx(tb, 1)} °C`);
        if (p1.length < 120) { p1.push(pnl.map(t / 8, ta / 100)); p2.push(pnl.map(t / 8, tb / 100)); k1.set(p1); k2.set(p2); }
      },
      readout() {
        return [['Suhu akhir campuran T_c', fx(Tc, 1) + ' °C'], ['Kalor dilepas air panas', fx(p.m1 / 1000 * 4200 * (p.T1 - Tc), 0) + ' J'], ['Kalor diterima air dingin', fx(p.m2 / 1000 * 4200 * (Tc - p.T2), 0) + ' J'],
          ['Rumus', 'm₁c(T₁ − T_c) = m₂c(T_c − T₂)']];
      },
    };
  },
});

/* ---------- suhu-kalor: pemuaian panjang ---------- */
const MUAI = { baja: ['Baja', 1.2e-5, 0x64748b], aluminium: ['Aluminium', 2.4e-5, 0xcbd5e1], tembaga: ['Tembaga', 1.7e-5, 0xb45309], kaca: ['Kaca', 0.9e-5, 0x93c5fd] };
sim('suhu-kalor', { mode: 'muai', label: 'Pemuaian panjang', desc: 'Batang yang dipanaskan bertambah panjang: ΔL = L₀·α·ΔT. Pertambahan pada gambar diperbesar.',
  params: [{ k: 'bahan', label: 'Bahan batang', opts: Object.entries(MUAI).map(([k, v]) => [k, v[0]]), val: 'baja' }, { k: 'L0', label: 'Panjang awal', min: 1, max: 100, step: 1, val: 10, unit: 'm' },
    { k: 'dT', label: 'Kenaikan suhu ΔT', min: 0, max: 100, step: 5, val: 30, unit: '°C' }],
  fitW: 8, cam: [0, 1.4, 7.5], target: [0, 0.8, 0],
  build(T) {
    T.box(0.3, 1.4, 1, 0x475569).position.set(-3.3, 0.7, 0); T.box(0.3, 1.4, 1, 0x475569).position.set(3.3, 0.7, 0);
    const batang = T.box(1, 0.25, 0.3, 0x64748b, { metal: 0.6 }), api = Array.from({ length: 5 }, () => T.cyl(0, 0.12, 0.35, 0xf97316, { emissive: 0xf97316, ei: 0.8 }));
    const awal = T.line(0x16a34a, 2, { dashed: true }), lb = T.label('', T.group, 'small');
    let t = 0;
    return {
      update(dt, p) {
        t += dt;
        const [, a, c] = MUAI[p.bahan], dL = p.L0 * a * p.dT, Lv = 5, ext = Math.min(dL * 1000 * 0.012, 1.3);
        batang.material.color.setHex(c); batang.scale.x = Lv + ext; batang.position.set(-3.15 + (Lv + ext) / 2, 1, 0);
        api.forEach((f, i) => { f.visible = p.dT > 0; f.position.set(-2.5 + i * 1.1, 0.55 + Math.sin(t * 8 + i) * 0.03, 0); f.scale.setScalar(0.5 + p.dT / 100); });
        awal.set([V(-3.15 + Lv, 0.6, 0), V(-3.15 + Lv, 1.4, 0)]); lb.position.set(-3.15 + Lv + ext / 2, 1.55, 0); lb.text(`+${fx(dL * 1000, 2)} mm`);
      },
      readout(p) {
        const [nama, a] = MUAI[p.bahan], dL = p.L0 * a * p.dT;
        return [['Pertambahan panjang ΔL = L₀αΔT', fx(dL * 1000, 2) + ' mm'], ['Panjang akhir', fx(p.L0 + dL, 4) + ' m'], ['Koefisien muai α', fx(a) + ' /°C'], ['Celah sambungan minimum', fx(dL * 1000, 1) + ' mm'], ['Bahan', nama]];
      },
    };
  },
});

/* ---------- termodinamika: mesin Carnot ---------- */
sim('termodinamika', { mode: 'carnot', label: 'Mesin Carnot', desc: 'Mesin menyerap kalor Q₁ dari reservoir panas, melakukan usaha W, dan membuang Q₂ ke reservoir dingin. Tebal panah sebanding besar energi.',
  params: [{ k: 'T1', label: 'Suhu reservoir panas T₁', min: 400, max: 1200, step: 10, val: 800, unit: 'K' }, { k: 'T2', label: 'Suhu reservoir dingin T₂', min: 250, max: 390, step: 5, val: 300, unit: 'K' },
    { k: 'Q1', label: 'Kalor diserap Q₁', min: 500, max: 5000, step: 100, val: 2000, unit: 'J' }],
  cam: [0.6, 1.6, 7], target: [0.6, 1.6, 0],
  build(T) {
    T.box(3, 0.6, 1, 0xdc2626).position.y = 3.3; T.label('Reservoir panas T₁', T.group, 'small').position.set(0, 3.75, 0.6);
    T.box(3, 0.6, 1, 0x2563eb).position.y = 0; T.label('Reservoir dingin T₂', T.group, 'small').position.set(0, -0.45, 0.6);
    const mesin = T.add(new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.12, 12, 40), T.mat(0x334155, { metal: 0.6 }))); mesin.position.y = 1.65;
    const a1 = T.arrow(0xdc2626, 0.1), a2 = T.arrow(0x2563eb, 0.1), aW = T.arrow(0x16a34a, 0.1);
    const l1 = T.label('', T.group, 'accent'), l2 = T.label(''), lW = T.label('');
    const tebal = (a, E) => { const s = 0.4 + E / 2500; a.scale.set(s, 1, s); };
    return {
      update(dt, p) {
        const eta = 1 - p.T2 / p.T1, W = eta * p.Q1, Q2 = p.Q1 - W;
        mesin.rotation.z -= dt * (1 + eta * 4);
        a1.set(V(0, 3.0, 0), V(0, -0.85, 0)); tebal(a1, p.Q1);
        a2.set(V(0, 1.15, 0), V(0, -0.8, 0)); tebal(a2, Q2);
        aW.set(V(0.6, 1.65, 0), V(1.6, 0, 0)); tebal(aW, W);
        l1.position.set(0.9, 2.6, 0); l1.text(`Q₁ = ${fx(p.Q1, 0)} J`); l2.position.set(0.9, 0.75, 0); l2.text(`Q₂ = ${fx(Q2, 0)} J`); lW.position.set(2.3, 2, 0); lW.text(`W = ${fx(W, 0)} J`);
      },
      readout(p) {
        const eta = 1 - p.T2 / p.T1, W = eta * p.Q1;
        return [['Efisiensi η = 1 − T₂/T₁', fx(eta * 100, 1) + '%'], ['Usaha W = η·Q₁', fx(W, 0) + ' J'], ['Kalor dibuang Q₂ = Q₁ − W', fx(p.Q1 - W, 0) + ' J'], ['Koefisien kulkas K = T₂/(T₁ − T₂)', fx(p.T2 / (p.T1 - p.T2), 2)]];
      },
    };
  },
});

/* ---------- bunyi: pipa organa ---------- */
sim('bunyi', { mode: 'pipa', label: 'Pipa organa', desc: 'Garis biru menunjukkan simpangan udara: perut (bergetar kuat) di ujung terbuka, simpul (diam) di ujung tertutup.',
  params: [{ k: 'jenis', label: 'Jenis pipa', opts: [['terbuka', 'Terbuka'], ['tertutup', 'Tertutup (ujung kanan)']], val: 'terbuka' }, { k: 'L', label: 'Panjang pipa', min: 0.2, max: 1.5, step: 0.05, val: 0.5, unit: 'm' },
    { k: 'n', label: 'Nada ke-n (1 = nada dasar)', min: 1, max: 5, step: 1, val: 1, unit: '' }],
  fitW: 8, cam: [0, 0.5, 7], target: [0, 0, 0],
  build(T) {
    const W = 6, x0 = -W / 2;
    const pipa = T.cyl(0.55, 0.55, W, 0xe0f2fe, { opacity: 0.25, side: THREE.DoubleSide }); pipa.rotation.z = Math.PI / 2;
    const tutup = T.cyl(0.58, 0.58, 0.08, 0x334155); tutup.rotation.z = Math.PI / 2; tutup.position.x = W / 2;
    const atas = T.line(0x2563eb, 120), bawah = T.line(0x2563eb, 120), partikel = Array.from({ length: 40 }, () => T.sphere(0.04, 0x0284c7));
    let t = 0;
    return {
      update(dt, p) {
        t += dt; const k = p.jenis === 'terbuka' ? p.n * Math.PI / W : (2 * p.n - 1) * Math.PI / (2 * W);
        tutup.visible = p.jenis === 'tertutup';
        const amp = Math.cos(t * 6), at = [], bw = [];
        for (let i = 0; i < 120; i++) { const x = W * i / 119, y = 0.45 * Math.cos(k * x) * amp; at.push(V(x0 + x, y, 0.1)); bw.push(V(x0 + x, -y, 0.1)); }
        atas.set(at); bawah.set(bw);
        partikel.forEach((o, i) => { const x = W * (i + 0.5) / 40; o.position.set(x0 + x + 0.12 * Math.cos(k * x) * Math.sin(t * 6), ((i * 37) % 7 - 3) * 0.1, 0); });
      },
      readout(p) {
        const v = 340, f = p.jenis === 'terbuka' ? p.n * v / (2 * p.L) : (2 * p.n - 1) * v / (4 * p.L);
        return [['Frekuensi f (v udara = 340 m/s)', fx(f, 1) + ' Hz'], ['Panjang gelombang λ = v/f', fx(v / f, 3) + ' m'], ['Rumus', p.jenis === 'terbuka' ? 'f_n = n·v/(2L)' : 'f_n = (2n − 1)·v/(4L)'],
          ['Harmonik yang muncul', p.jenis === 'terbuka' ? 'semua (1, 2, 3, …)' : 'hanya ganjil (1, 3, 5, …)']];
      },
    };
  },
});

/* ---------- bunyi: dawai ---------- */
sim('bunyi', { mode: 'dawai', label: 'Dawai (senar)', desc: 'Senar yang terikat kedua ujungnya bergetar membentuk gelombang stasioner. Titik oranye adalah simpul.',
  params: [{ k: 'F', label: 'Tegangan senar F', min: 10, max: 200, step: 5, val: 100, unit: 'N' }, { k: 'L', label: 'Panjang senar L', min: 0.3, max: 1.2, step: 0.05, val: 0.65, unit: 'm' },
    { k: 'mu', label: 'Massa per panjang μ', min: 0.5, max: 10, step: 0.5, val: 2, unit: 'g/m' }, { k: 'n', label: 'Nada ke-n', min: 1, max: 5, step: 1, val: 1, unit: '' }],
  fitW: 8, cam: [0, 0.6, 7], target: [0, 0, 0],
  build(T) {
    T.box(7, 0.3, 0.8, 0xa16207).position.set(0, -0.6, -0.3);
    const senar = T.line(0x334155, 160), kait = [T.box(0.15, 0.5, 0.3, 0x475569), T.box(0.15, 0.5, 0.3, 0x475569)];
    const simpul = Array.from({ length: 6 }, () => T.sphere(0.05, 0xea580c));
    let t = 0;
    return {
      update(dt, p) {
        t += dt; const W = 3 + p.L * 2.5, x0 = -W / 2, A = 0.5 / Math.sqrt(p.n), pts = [];
        for (let i = 0; i < 160; i++) { const x = W * i / 159; pts.push(V(x0 + x, A * Math.sin(p.n * Math.PI * x / W) * Math.cos(t * 8), 0)); }
        senar.set(pts); kait[0].position.set(x0, -0.2, 0); kait[1].position.set(x0 + W, -0.2, 0);
        simpul.forEach((o, i) => { o.visible = i <= p.n; o.position.set(x0 + W * i / p.n, 0, 0); });
      },
      readout(p) {
        const v = Math.sqrt(p.F / (p.mu / 1000)), f = p.n * v / (2 * p.L);
        return [['Cepat rambat v = √(F/μ)', fx(v, 1) + ' m/s'], ['Frekuensi f_n = n·v/(2L)', fx(f, 1) + ' Hz'], ['Panjang gelombang λ = 2L/n', fx(2 * p.L / p.n, 3) + ' m'], ['Jumlah simpul', `${p.n + 1} titik`]];
      },
    };
  },
});

/* ---------- bunyi: taraf intensitas ---------- */
sim('bunyi', { mode: 'intensitas', label: 'Taraf intensitas', desc: 'Menambah jumlah sumber menaikkan TI sebesar 10 log n; menjauh menurunkan TI sebesar 20 log(r₂/r₁).',
  params: [{ k: 'TI1', label: 'TI satu mesin pada jarak 1 m', min: 40, max: 100, step: 1, val: 60, unit: 'dB' }, { k: 'n', label: 'Jumlah mesin', min: 1, max: 100, step: 1, val: 10, unit: '' },
    { k: 'r', label: 'Jarak pendengar', min: 1, max: 100, step: 1, val: 1, unit: 'm' }],
  fitW: 9, cam: [0, 2.2, 8], target: [0, 0.8, 0],
  build(T) {
    T.box(10, 0.05, 3, 0xcbd5e1).position.set(0, -0.025, 0);
    const mesin = Array.from({ length: 25 }, (_, i) => { const m = T.box(0.25, 0.25, 0.25, 0x475569); m.position.set(-4 + (i % 5) * 0.32, 0.13, -0.6 + Math.floor(i / 5) * 0.32); return m; });
    const orang = T.add(new THREE.Group()); T.cyl(0.12, 0.14, 0.6, 0x16a34a, {}, orang).position.y = 0.3; T.sphere(0.12, 0xfcd34d, {}, orang).position.y = 0.75;
    const meter = T.box(0.3, 1, 0.1, 0x16a34a), lm = T.label('', T.group, 'accent');
    const cincin = Array.from({ length: 6 }, () => T.line(0x2563eb, 64, { loop: true, opacity: 0.6 }).set(T.circlePts(1)));
    let t = 0;
    return {
      update(dt, p) {
        t += dt; mesin.forEach((m, i) => { m.visible = i < Math.min(p.n, 25); });
        orang.position.set(-3.4 + Math.log10(p.r) * 3.6, 0, 0.4);
        const TI = p.TI1 + 10 * Math.log10(p.n) - 20 * Math.log10(p.r), h = clamp(TI / 120, 0.02, 1) * 2.4;
        meter.scale.y = h; meter.position.set(4, h / 2, 0); meter.material.color.setHex(TI >= 85 ? 0xdc2626 : TI >= 70 ? 0xf59e0b : 0x16a34a);
        lm.position.set(4, h + 0.25, 0); lm.text(`${fx(TI, 1)} dB`);
        cincin.forEach((c, i) => { const R = ((t * 1.2 + i) % 6) + 0.1; c.scale.set(R, 1, R); c.position.set(-3.4, 0.05, 0); c.material.opacity = Math.max(0, 0.6 - R / 10); });
      },
      readout(p) {
        const TI = p.TI1 + 10 * Math.log10(p.n) - 20 * Math.log10(p.r), I = 1e-12 * 10 ** (TI / 10);
        return [['Taraf intensitas TI', fx(TI, 1) + ' dB'], ['Intensitas I = I₀·10^(TI/10)', fx(I) + ' W/m²'], ['Tambahan dari n mesin (10 log n)', '+' + fx(10 * Math.log10(p.n), 1) + ' dB'],
          ['Penurunan karena jarak (20 log r)', '−' + fx(20 * Math.log10(p.r), 1) + ' dB'], ['Kategori', TI >= 85 ? 'Berbahaya bila lama (≥ 85 dB)' : TI >= 70 ? 'Bising' : 'Aman']];
      },
    };
  },
});

/* ---------- cahaya: kisi difraksi ---------- */
sim('cahaya', { mode: 'kisi', label: 'Kisi difraksi', desc: 'Kisi berisi ratusan celah per milimeter. Terang ke-n muncul pada d·sin θ = n·λ.',
  params: [{ k: 'N', label: 'Jumlah garis kisi', min: 100, max: 1000, step: 50, val: 500, unit: 'garis/mm' }, { k: 'lam', label: 'Panjang gelombang λ', min: 380, max: 750, step: 5, val: 600, unit: 'nm' },
    { k: 'L', label: 'Jarak kisi ke layar', min: 0.3, max: 1.5, step: 0.05, val: 1, unit: 'm' }],
  cam: [-1.5, 2, 6.5], target: [0.3, 0, 0],
  build(T) {
    const sumber = T.box(0.4, 0.4, 0.4, 0xffffff, { emissive: 0xffffff, ei: 0.8 }); sumber.position.x = -3.6;
    T.box(0.05, 1.6, 1.2, 0x334155, { opacity: 0.7 }).position.x = -1.6;
    const layar = T.box(0.05, 4, 1.6, 0x0f172a), titik = Array.from({ length: 9 }, () => T.sphere(0.08, 0xffffff, { emissive: 0xffffff, ei: 1 }));
    const sinar = Array.from({ length: 9 }, () => T.line(0xffffff, 2, { opacity: 0.6 })), berkas = T.line(0xffffff, 2);
    return {
      update(dt, p) {
        const col = wl2rgb(p.lam), d = 1e-3 / p.N, xs = -1.6 + p.L * 3;
        sumber.material.color.setHex(col); sumber.material.emissive.setHex(col); berkas.set([V(-3.4, 0, 0), V(-1.6, 0, 0)]); berkas.material.color.setHex(col);
        layar.position.x = xs;
        titik.forEach((o, i) => {
          const s = (i - 4) * p.lam * 1e-9 / d, ok = Math.abs(s) < 1, y = ok ? p.L * Math.tan(Math.asin(s)) * 3 : 0;
          o.visible = ok && Math.abs(y) < 2; o.position.set(xs - 0.05, y, 0); o.material.color.setHex(col); o.material.emissive.setHex(col);
          sinar[i].visible = o.visible; sinar[i].set([V(-1.6, 0, 0), V(xs - 0.05, y, 0)]); sinar[i].material.color.setHex(col);
        });
      },
      readout(p) {
        const d = 1e-3 / p.N, s = p.lam * 1e-9 / d;
        return [['Konstanta kisi d = 1/N', fx(d) + ' m'], ['sin θ₁ = λ/d', s < 1 ? fx(s, 3) : 'tidak ada'], ['Sudut terang ke-1', s < 1 ? fx(Math.asin(s) / deg, 1) + '°' : '-'],
          ['Jarak terang ke-1 di layar', s < 1 ? fx(p.L * Math.tan(Math.asin(s)) * 100, 1) + ' cm' : '-'], ['Orde maksimum n ≤ d/λ', fx(Math.floor(d / (p.lam * 1e-9)), 0)]];
      },
    };
  },
});

/* ---------- cahaya: polarisasi ---------- */
sim('cahaya', { mode: 'polarisasi', label: 'Polarisasi', desc: 'Polarisator meloloskan getaran searah sumbunya. Intensitas setelah analisator mengikuti hukum Malus.',
  params: [{ k: 'th', label: 'Sudut sumbu analisator θ', min: 0, max: 90, step: 1, val: 60, unit: '°' }],
  cam: [-1, 2, 7], target: [0, 0, 0],
  build(T) {
    const pol = (x, c) => {
      const gr = T.add(new THREE.Group()); gr.position.x = x; T.add(new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 8, 40), T.mat(0x334155)), gr).rotation.y = Math.PI / 2;
      const kisi = T.add(new THREE.Group(), gr); for (let i = -3; i <= 3; i++) T.box(0.02, 1.5, 0.02, c, {}, kisi).position.z = i * 0.2;
      return { gr, kisi };
    };
    const P1 = pol(-1, 0x2563eb), P2 = pol(1.2, 0xea580c);
    const seg = [-2.2, 0.1, 2.4].map(x => { const b = T.box(2.2, 0.3, 0.3, 0xfacc15, { opacity: 0.8, emissive: 0xfacc15, ei: 0.6 }); b.position.x = x; return b; });
    const getar = [T.arrow(0x7c3aed, 0.03), T.arrow(0x7c3aed, 0.03)];
    T.label('polarisator', P1.gr, 'small').position.y = 1.1; T.label('analisator', P2.gr, 'small').position.y = 1.1;
    return {
      update(dt, p) {
        const a = p.th * deg, L = Math.cos(a), I2 = 0.5 * L * L;
        P2.kisi.rotation.x = a;
        seg[1].material.opacity = 0.6; seg[2].material.opacity = 0.1 + I2 * 1.4; seg[2].scale.set(1, 0.2 + I2 * 1.6, 0.2 + I2 * 1.6);
        getar[0].set(V(0.1, -0.5, 0), V(0, 1, 0));
        getar[1].set(V(2.4, -0.5 * L * Math.cos(a), -0.5 * L * Math.sin(a)), V(0, L * Math.cos(a), L * Math.sin(a)));
      },
      readout(p) {
        const I2 = 0.5 * Math.cos(p.th * deg) ** 2;
        return [['Setelah polarisator', '50% I₀'], ['Setelah analisator I = ½I₀cos²θ', fx(I2 * 100, 1) + '% I₀'], ['θ = 90°', 'cahaya padam total'], ['Panah ungu', 'arah getar medan listrik']];
      },
    };
  },
});

/* ---------- optik: kacamata ---------- */
sim('optik', { mode: 'kacamata', label: 'Kacamata', desc: 'Miopi: bayangan jatuh di depan retina. Hipermetropi: di belakang retina. Lensa kacamata menggesernya tepat ke retina.',
  params: [{ k: 'jenis', label: 'Kelainan mata', opts: [['miopi', 'Miopi (rabun jauh)'], ['hiper', 'Hipermetropi (rabun dekat)']], val: 'miopi' },
    { k: 'titik', label: 'Titik jauh (miopi) / titik dekat (hipermetropi)', min: 30, max: 500, step: 10, val: 200, unit: 'cm' }, { k: 'pakai', label: 'Kacamata', opts: [['tidak', 'Tanpa kacamata'], ['ya', 'Pakai kacamata']], val: 'tidak' }],
  cam: [0, 0.3, 7.5], target: [0.2, 0, 0],
  build(T) {
    T.sphere(1.1, 0xffffff, { opacity: 0.25 }).position.x = 1.5;
    T.add(new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 16, Math.PI * 1.5, Math.PI, 0.6, 1.9), T.mat(0xdc2626, { opacity: 0.6, side: THREE.DoubleSide }))).position.x = 1.5;
    T.label('retina', T.group, 'small').position.set(2.9, 0.9, 0);
    const lensaMata = T.sphere(1, 0x93c5fd, { opacity: 0.6 }); lensaMata.scale.set(0.12, 0.5, 0.5); lensaMata.position.x = 0.55;
    const kaca = T.sphere(1, 0xfacc15, { opacity: 0.45 }); kaca.position.x = -0.6; kaca.scale.set(0.08, 0.55, 0.55);
    const sinar = Array.from({ length: 3 }, () => [T.line(0xf59e0b, 3), T.line(0xf59e0b, 2), T.line(0xf59e0b, 2)]);
    const fokus = T.sphere(0.07, 0xea580c);
    return {
      update(dt, p) {
        const pakai = p.pakai === 'ya', xR = 2.6, xF = pakai ? xR : p.jenis === 'miopi' ? xR - clamp(60 / p.titik, 0.15, 0.8) : xR + clamp(p.titik / 100, 0.25, 1.2);
        const tekuk = pakai ? (p.jenis === 'miopi' ? 1.15 : 0.85) : 1;
        kaca.visible = pakai; kaca.material.color.setHex(p.jenis === 'miopi' ? 0x60a5fa : 0xfacc15);
        fokus.position.set(xF, 0, 0);
        sinar.forEach(([a, b, c], i) => {
          const y = (i - 1) * 0.35, yl = y * tekuk, xe = Math.min(xF, xR);
          a.set([V(-3, y, 0), V(-0.6, y, 0), V(0.55, yl, 0)]);
          b.set([V(0.55, yl, 0), V(xe, yl * (1 - (xe - 0.55) / (xF - 0.55)), 0)]);
          c.visible = xF < xR; c.set([V(xF, 0, 0), V(xR, -yl * (xR - xF) / (xF - 0.55), 0)]);
        });
      },
      readout(p) {
        const P = p.jenis === 'miopi' ? -100 / p.titik : 4 - 100 / p.titik;
        return [['Kekuatan kacamata', fx(P, 2) + ' dioptri'], ['Jenis lensa', P < 0 ? 'cekung (negatif)' : 'cembung (positif)'], ['Rumus', p.jenis === 'miopi' ? 'P = −100/PR' : 'P = 4 − 100/PP'],
          ['Bayangan tanpa kacamata', p.jenis === 'miopi' ? 'di depan retina' : 'di belakang retina']];
      },
    };
  },
});

/* ---------- optik: lup, mikroskop, teropong ---------- */
const lensa = (T, h, c) => { const l = T.sphere(1, c, { opacity: 0.4 }); l.scale.set(0.08, h, h * 0.6); return l; };
sim('optik', { mode: 'lup', label: 'Lup', desc: 'Benda diletakkan di dalam jarak fokus lup sehingga terbentuk bayangan maya, tegak, dan diperbesar.',
  params: [{ k: 'f', label: 'Jarak fokus lup', min: 2, max: 20, step: 0.5, val: 5, unit: 'cm' }, { k: 'mata', label: 'Mata', opts: [['tidak', 'Tidak berakomodasi'], ['maks', 'Berakomodasi maksimum']], val: 'tidak' }],
  cam: [0, 0.4, 8], target: [0, 0.4, 0],
  build(T) {
    lensa(T, 1.4, 0x93c5fd); T.line(0x334155, 2).set([V(-4, 0, 0), V(4, 0, 0)]);
    const benda = T.arrow(0x16a34a, 0.04), bay = T.arrow(0xea580c, 0.04, { opacity: 0.5 }), garis = [T.line(0xf59e0b, 2, { dashed: true }), T.line(0xf59e0b, 2, { dashed: true })];
    const F = T.sphere(0.05, 0x7c3aed), lF = T.label('F', T.group, 'small');
    return {
      update(dt, p) {
        const sc = 3.2 / 25, s = p.mata === 'tidak' ? p.f * 0.92 : 25 * p.f / (25 + p.f), sp = 1 / (1 / p.f - 1 / s), M = Math.abs(sp / s), h = 0.4;
        F.position.set(-p.f * sc, 0, 0); lF.position.set(-p.f * sc, -0.25, 0);
        benda.set(V(-s * sc, 0, 0), V(0, h, 0));
        const xb = Math.max(sp * sc, -4), hb = Math.min(h * M, 2.2); bay.set(V(xb, 0, 0), V(0, hb, 0));
        garis[0].set([V(0, h, 0), V(xb, hb, 0)]); garis[1].set([V(0, 0, 0), V(xb, hb, 0)]);
      },
      readout(p) {
        return [['Perbesaran lup', fx(p.mata === 'tidak' ? 25 / p.f : 25 / p.f + 1, 2) + ' ×'], ['Rumus', p.mata === 'tidak' ? 'M = 25/f' : 'M = 25/f + 1'],
          ['Letak benda', p.mata === 'tidak' ? 'di titik fokus' : fx(25 * p.f / (25 + p.f), 2) + ' cm dari lup'], ['Sifat bayangan', 'maya, tegak, diperbesar']];
      },
    };
  },
});
sim('optik', { mode: 'mikroskop', label: 'Mikroskop', desc: 'Objektif membentuk bayangan nyata yang diperbesar; okuler bekerja seperti lup untuk memperbesarnya lagi.',
  params: [{ k: 'fob', label: 'Fokus objektif f_ob', min: 0.5, max: 2, step: 0.1, val: 1, unit: 'cm' }, { k: 'kali', label: 'Jarak benda (× f_ob)', min: 1.05, max: 2, step: 0.05, val: 1.2, unit: '×' },
    { k: 'fok', label: 'Fokus okuler f_ok', min: 2, max: 10, step: 0.5, val: 5, unit: 'cm' }],
  fitW: 10, cam: [0, 0.4, 9], target: [0, 0, 0],
  build(T) {
    T.line(0x334155, 2).set([V(-5, 0, 0), V(5, 0, 0)]);
    const ob = lensa(T, 0.6, 0x93c5fd), ok = lensa(T, 0.9, 0xfde68a), tabung = T.cyl(0.75, 0.75, 1, 0x334155, { opacity: 0.15 }); tabung.rotation.z = Math.PI / 2;
    const benda = T.arrow(0x16a34a, 0.03), bay1 = T.arrow(0xea580c, 0.03), l = [T.label('objektif', T.group, 'small'), T.label('okuler', T.group, 'small')];
    return {
      update(dt, p) {
        const s = p.kali * p.fob, sp = 1 / (1 / p.fob - 1 / s), d = sp + p.fok, sc = 7 / (s + d + 1);
        const xob = -3 + s * sc, xok = xob + d * sc;
        ob.position.x = xob; ok.position.x = xok; tabung.scale.set(1, d * sc, 1); tabung.position.x = (xob + xok) / 2;
        benda.set(V(-3, 0, 0), V(0, 0.25, 0)); bay1.set(V(xob + sp * sc, 0, 0), V(0, -Math.min(0.25 * sp / s, 1.4), 0));
        l[0].position.set(xob, 0.9, 0); l[1].position.set(xok, 1.2, 0);
      },
      readout(p) {
        const s = p.kali * p.fob, sp = 1 / (1 / p.fob - 1 / s), Mob = sp / s, Mok = 25 / p.fok;
        return [['Bayangan objektif s′_ob', fx(sp, 2) + ' cm'], ['Perbesaran objektif s′_ob/s_ob', fx(Mob, 2) + ' ×'], ['Perbesaran okuler 25/f_ok', fx(Mok, 2) + ' ×'], ['Perbesaran total', fx(Mob * Mok, 1) + ' ×'], ['Panjang tabung d = s′_ob + f_ok', fx(sp + p.fok, 2) + ' cm']];
      },
    };
  },
});
sim('optik', { mode: 'teropong', label: 'Teropong bintang', desc: 'Sinar sejajar dari bintang difokuskan objektif di titik fokus bersama, lalu okuler membuatnya sejajar lagi.',
  params: [{ k: 'fob', label: 'Fokus objektif f_ob', min: 50, max: 200, step: 5, val: 100, unit: 'cm' }, { k: 'fok', label: 'Fokus okuler f_ok', min: 2, max: 20, step: 1, val: 5, unit: 'cm' }],
  fitW: 10, cam: [0, 0.4, 9], target: [0, 0, 0],
  build(T) {
    T.line(0x334155, 2).set([V(-5, 0, 0), V(5, 0, 0)]);
    const ob = lensa(T, 1, 0x93c5fd), ok = lensa(T, 0.5, 0xfde68a), tabung = T.cyl(1, 1, 1, 0x334155, { opacity: 0.12 }); tabung.rotation.z = Math.PI / 2;
    const sinar = Array.from({ length: 3 }, () => T.line(0xfacc15, 4));
    return {
      update(dt, p) {
        const tot = p.fob + p.fok, sc = 8 / tot, xob = -4, xok = xob + tot * sc;
        ob.position.x = xob; ok.position.x = xok; tabung.scale.set(1, tot * sc, 1); tabung.position.x = (xob + xok) / 2;
        sinar.forEach((m, i) => { const y = (i - 1) * 0.6, yk = -y * p.fok / p.fob; m.set([V(-5, y, 0), V(xob, y, 0), V(xok, yk, 0), V(5, yk, 0)]); });
      },
      readout(p) {
        return [['Perbesaran M = f_ob/f_ok', fx(p.fob / p.fok, 1) + ' ×'], ['Panjang teropong d = f_ob + f_ok', fx(p.fob + p.fok, 0) + ' cm'], ['Bayangan akhir', 'terbalik (tidak masalah untuk bintang)']];
      },
    };
  },
});
