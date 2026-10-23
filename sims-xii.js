// Mode simulasi tambahan kelas XII (satu mode per rumus).
import * as THREE from 'three';
import { sim, V, deg, clamp, fx, wl2rgb } from './sims.js';

const e0 = 8.85e-12, mu0 = 4 * Math.PI * 1e-7;
// Titik-titik heliks sepanjang sumbu x (kumparan).
const heliks = (x0, x1, R, lilit, n, y = 0) => Array.from({ length: n }, (_, i) => {
  const t = i / (n - 1), a = t * lilit * Math.PI * 2;
  return V(x0 + (x1 - x0) * t, y + R * Math.sin(a), R * Math.cos(a));
});

/* ---------- listrik statis: kapasitor keping sejajar ---------- */
const DIEL = { 1: 'Udara (εr = 1)', 3: 'Kertas (εr = 3)', 6: 'Kaca (εr = 6)' };
sim('listrik-statis', { mode: 'kapasitor', label: 'Kapasitor keping', desc: 'Dua keping sejajar menyimpan muatan. Kapasitas makin besar jika keping lebih luas, lebih rapat, atau diberi bahan dielektrik.',
  params: [{ k: 'A', label: 'Luas keping A', min: 10, max: 500, step: 10, val: 200, unit: 'cm²' }, { k: 'd', label: 'Jarak antarkeping d', min: 1, max: 10, step: 0.5, val: 4, unit: 'mm' },
    { k: 'er', label: 'Bahan di antara keping', opts: Object.entries(DIEL), val: '1' }, { k: 'V', label: 'Tegangan baterai V', min: 1, max: 24, step: 1, val: 12, unit: 'V' }],
  cam: [2.5, 1.8, 5.5], target: [0, 0.3, 0],
  build(T) {
    const kp = [T.box(0.06, 1, 1, 0xdc2626, { metal: 0.5 }), T.box(0.06, 1, 1, 0x2563eb, { metal: 0.5 })];
    const diel = T.box(1, 1, 1, 0xfde68a, { opacity: 0.45 });
    const plus = Array.from({ length: 30 }, () => T.sphere(0.04, 0xdc2626)), minus = Array.from({ length: 30 }, () => T.sphere(0.04, 0x2563eb));
    const medan = Array.from({ length: 9 }, () => T.arrow(0x7c3aed, 0.02, { opacity: 0.8 }));
    const kabel = T.line(0x334155, 6), bat = T.box(0.5, 0.25, 0.25, 0x111827), lb = T.label('', T.group, 'small');
    const Cmax = e0 * 6 * 0.05 / 0.001;
    return {
      update(dt, p) {
        const s = 0.6 + Math.sqrt(p.A) * 0.07, gap = 0.15 + p.d * 0.12, er = +p.er, C = e0 * er * p.A * 1e-4 / (p.d * 1e-3), Q = C * p.V;
        kp.forEach((k, i) => { k.scale.set(1, s, s); k.position.set((i ? 1 : -1) * gap / 2, 0.5, 0); });
        diel.visible = er > 1; diel.scale.set(gap - 0.08, s * 0.95, s * 0.95); diel.position.set(0, 0.5, 0);
        const n = Math.round(clamp(Q / (Cmax * 24) * 60, 1, 30));
        [plus, minus].forEach((arr, j) => arr.forEach((o, i) => {
          o.visible = i < n; o.position.set((j ? 1 : -1) * (gap / 2 + 0.06), 0.5 + ((i % 6) / 5 - 0.5) * s * 0.85, (Math.floor(i / 6) / 4 - 0.5) * s * 0.85);
        }));
        const E = p.V / (p.d * 1e-3);
        medan.forEach((a, i) => { a.set(V(-gap / 2 + 0.04, 0.5 + ((i % 3) - 1) * s * 0.3, (Math.floor(i / 3) - 1) * s * 0.3), V(gap - 0.08, 0, 0)); a.visible = E > 0; });
        const yb = 0.5 - s / 2 - 0.6;
        kabel.set([V(-gap / 2, 0.5 - s / 2, 0), V(-gap / 2, yb, 0), V(-0.25, yb, 0), V(0.25, yb, 0), V(gap / 2, yb, 0), V(gap / 2, 0.5 - s / 2, 0)]);
        bat.position.set(0, yb, 0); lb.position.set(0, yb - 0.3, 0); lb.text(`${p.V} V`);
      },
      readout(p) {
        const er = +p.er, C = e0 * er * p.A * 1e-4 / (p.d * 1e-3), Q = C * p.V;
        return [['Kapasitas C = εr·ε₀·A/d', fx(C * 1e12, 1) + ' pF'], ['Muatan Q = C·V', fx(Q * 1e9, 2) + ' nC'], ['Kuat medan E = V/d', fx(p.V / (p.d * 1e-3)) + ' V/m'], ['Energi W = ½CV²', fx(0.5 * C * p.V * p.V) + ' J']];
      },
    };
  },
});

/* ---------- listrik DC: hambatan kawat ---------- */
const RHO = { tembaga: ['Tembaga', 1.7e-8, 0xb45309], aluminium: ['Aluminium', 2.8e-8, 0xcbd5e1], besi: ['Besi', 1e-7, 0x64748b], nikrom: ['Nikrom', 1.1e-6, 0x78716c] };
sim('listrik-dc', { mode: 'kawat', label: 'Hambatan kawat', desc: 'Hambatan kawat sebanding panjangnya dan berbanding terbalik dengan luas penampangnya. Titik kuning adalah elektron; makin cepat, makin besar arus.',
  params: [{ k: 'bahan', label: 'Bahan kawat', opts: Object.entries(RHO).map(([k, v]) => [k, v[0]]), val: 'nikrom' }, { k: 'L', label: 'Panjang kawat L', min: 0.5, max: 10, step: 0.5, val: 2, unit: 'm' },
    { k: 'A', label: 'Luas penampang A', min: 0.1, max: 4, step: 0.1, val: 0.5, unit: 'mm²' }, { k: 'V', label: 'Tegangan baterai', min: 1, max: 12, step: 0.5, val: 6, unit: 'V' }],
  fitW: 8, cam: [0, 1.2, 7], target: [0, 0.2, 0],
  build(T) {
    const kawat = T.cyl(1, 1, 1, 0x78716c, { metal: 0.5, opacity: 0.55 }); kawat.rotation.z = Math.PI / 2;
    const bat = T.box(0.7, 0.35, 0.35, 0x111827), kabel = T.line(0x334155, 6), lb = T.label('', T.group, 'small');
    const elek = Array.from({ length: 24 }, (_, i) => ({ m: T.sphere(0.035, 0xfacc15, { emissive: 0xfacc15, ei: 0.6 }), u: i / 24 }));
    return {
      update(dt, p) {
        const [, rho, c] = RHO[p.bahan], R = rho * p.L / (p.A * 1e-6), I = p.V / R;
        const Lv = 1.5 + p.L * 0.45, r = 0.03 + Math.sqrt(p.A) * 0.06, x0 = -Lv / 2;
        kawat.material.color.setHex(c); kawat.scale.set(r, Lv, r); kawat.position.set(0, 0.6, 0);
        kabel.set([V(x0, 0.6, 0), V(-Lv / 2 - 0.3, 0.6, 0), V(-Lv / 2 - 0.3, -0.5, 0), V(Lv / 2 + 0.3, -0.5, 0), V(Lv / 2 + 0.3, 0.6, 0), V(Lv / 2, 0.6, 0)]);
        bat.position.set(0, -0.5, 0); lb.position.set(0, -0.85, 0); lb.text(`${p.V} V`);
        const laju = clamp(0.05 + Math.log10(1 + I) * 0.25, 0.05, 1.2);
        elek.forEach((o, i) => { o.u = (o.u + dt * laju / Lv) % 1; o.m.position.set(Lv / 2 - o.u * Lv, 0.6 + ((i % 3) - 1) * r * 0.5, ((i * 7) % 3 - 1) * r * 0.5); });
      },
      readout(p) {
        const [, rho] = RHO[p.bahan], R = rho * p.L / (p.A * 1e-6), I = p.V / R;
        return [['Hambatan R = ρL/A', fx(R, 3) + ' Ω'], ['Kuat arus I = V/R', fx(I, 3) + ' A'], ['Daya P = V²/R', fx(p.V * p.V / R, 2) + ' W'], ['Hambat jenis ρ', fx(rho) + ' Ω·m'],
          ['Kawat 2× lebih panjang', 'R jadi 2×']];
      },
    };
  },
});

/* ---------- magnet: solenoida ---------- */
sim('magnet', { mode: 'solenoida', label: 'Solenoida', desc: 'Kumparan panjang berarus menghasilkan medan magnet seragam di dalamnya, seperti magnet batang.',
  params: [{ k: 'N', label: 'Jumlah lilitan N', min: 10, max: 1000, step: 10, val: 200, unit: '' }, { k: 'I', label: 'Kuat arus I', min: 0.5, max: 10, step: 0.5, val: 2, unit: 'A' },
    { k: 'L', label: 'Panjang solenoida L', min: 0.1, max: 1, step: 0.05, val: 0.4, unit: 'm' }],
  fitW: 7, cam: [1.5, 2, 6], target: [0, 0, 0],
  build(T) {
    const kumparan = T.line(0xb45309, 900), dalam = Array.from({ length: 3 }, () => T.arrow(0x16a34a, 0.04));
    const luar = [1, -1].map(() => T.line(0x16a34a, 80, { dashed: true, opacity: 0.7 })), lU = T.label('U', T.group, 'accent'), lS = T.label('S', T.group, 'accent');
    const muatan = Array.from({ length: 16 }, (_, i) => ({ m: T.sphere(0.04, 0xfacc15, { emissive: 0xfacc15, ei: 0.6 }), u: i / 16 }));
    let pts = [], key = '';
    return {
      update(dt, p) {
        const Lv = 1.5 + p.L * 3, lilit = Math.round(clamp(p.N / 20, 4, 40)), x0 = -Lv / 2, x1 = Lv / 2;
        if (key !== Lv + '|' + lilit) { key = Lv + '|' + lilit; pts = heliks(x0, x1, 0.55, lilit, 900); kumparan.set(pts); }
        const B = mu0 * p.N * p.I / p.L, Lb = clamp(0.4 + B * 25, 0.4, Lv * 0.8);
        dalam.forEach((a, i) => a.set(V(-Lb / 2, (i - 1) * 0.25, 0), V(Lb, 0, 0)));
        luar.forEach((l, j) => { const s = j ? 1 : -1, q = []; for (let i = 0; i < 80; i++) { const a = i / 79 * Math.PI; q.push(V(-(Lv / 2 + 0.4) * Math.cos(a), s * (0.75 + 0.9 * Math.sin(a)), 0)); } l.set(q); });
        lU.position.set(x1 + 0.35, 0, 0); lS.position.set(x0 - 0.35, 0, 0);
        muatan.forEach(o => { o.u = (o.u + dt * (0.02 + p.I * 0.01)) % 1; o.m.position.copy(pts[Math.floor(o.u * (pts.length - 1))]); });
      },
      readout(p) {
        const B = mu0 * p.N * p.I / p.L;
        return [['Medan di tengah B = μ₀·N·I/L', fx(B * 1000, 3) + ' mT'], ['Medan di ujung', fx(B * 500, 3) + ' mT (setengahnya)'], ['Lilitan per meter n = N/L', fx(p.N / p.L, 0) + ' /m'], ['Kutub utara', 'di ujung kanan (kaidah tangan kanan)']];
      },
    };
  },
});

/* ---------- magnet: gaya Lorentz pada partikel ---------- */
const PART = { proton: ['Proton', 1.67e-27, 1.6e-19, 0xdc2626], elektron: ['Elektron', 9.11e-31, -1.6e-19, 0x2563eb], alfa: ['Partikel alfa', 6.64e-27, 3.2e-19, 0xea580c] };
sim('magnet', { mode: 'lorentz', label: 'Partikel dalam medan', desc: 'Medan magnet keluar bidang layar (titik hijau). Gaya Lorentz selalu tegak lurus kecepatan sehingga partikel bergerak melingkar.',
  params: [{ k: 'jenis', label: 'Partikel', opts: Object.entries(PART).map(([k, v]) => [k, v[0]]), val: 'proton' }, { k: 'v', label: 'Kecepatan v', min: 0.1, max: 10, step: 0.1, val: 2, unit: '× 10⁶ m/s' },
    { k: 'B', label: 'Kuat medan B', min: 0.05, max: 1, step: 0.05, val: 0.3, unit: 'T' }],
  cam: [0, 0, 7.5], target: [0, 0, 0],
  build(T) {
    for (let i = -4; i <= 4; i++) for (let j = -3; j <= 3; j++) T.sphere(0.025, 0x16a34a, { opacity: 0.6 }).position.set(i * 0.7, j * 0.7, -0.1);
    const par = T.sphere(0.1, 0xdc2626), jejak = T.line(0xdc2626, 160, { opacity: 0.6 }), aV = T.arrow(0x2563eb, 0.03), aF = T.arrow(0xea580c, 0.03);
    const lv = T.label('v', T.group, 'small'), lf = T.label('F', T.group, 'small'), hist = [];
    let ang = 0, kunci = '';
    return {
      update(dt, p) {
        const [, , q, c] = PART[p.jenis], R = clamp(1.2 * (p.v / 2) / (p.B / 0.3), 0.25, 2.6), arah = Math.sign(q);
        if (kunci !== p.jenis + R) { kunci = p.jenis + R; hist.length = 0; }
        par.material.color.setHex(c); jejak.material.color.setHex(c);
        ang += dt * 1.5 * arah;
        const pos = V(R * Math.cos(ang), R * Math.sin(ang), 0), vel = V(-Math.sin(ang), Math.cos(ang), 0).multiplyScalar(arah);
        par.position.copy(pos); hist.push(pos.clone()); if (hist.length > 160) hist.shift(); jejak.set(hist);
        aV.set(pos, vel.clone().multiplyScalar(0.8)); aF.set(pos, pos.clone().normalize().multiplyScalar(-0.7));
        lv.position.copy(pos.clone().addScaledVector(vel, 0.95)); lf.position.copy(pos.clone().multiplyScalar(1 - 0.85 / R));
      },
      readout(p) {
        const [, m, q] = PART[p.jenis], v = p.v * 1e6, r = m * v / (Math.abs(q) * p.B);
        return [['Gaya Lorentz F = q·v·B', fx(Math.abs(q) * v * p.B) + ' N'], ['Jari-jari R = m·v/(q·B)', r >= 0.01 ? fx(r * 100, 2) + ' cm' : fx(r * 1000, 3) + ' mm'], ['Periode T = 2πm/(qB)', fx(2 * Math.PI * m / (Math.abs(q) * p.B)) + ' s'],
          ['Arah putar', q > 0 ? 'searah jarum jam' : 'berlawanan jarum jam'], ['Gambar', 'jari-jari diskalakan, nilai asli di atas']];
      },
    };
  },
});

/* ---------- induksi: batang konduktor bergerak ---------- */
sim('induksi', { mode: 'batang', label: 'Batang di rel', desc: 'Batang digeser di atas rel dalam medan magnet (panah hijau ke bawah). Fluks berubah sehingga timbul GGL ε = B·L·v dan arus mengalir lewat hambatan.',
  params: [{ k: 'B', label: 'Kuat medan B', min: 0.1, max: 2, step: 0.1, val: 0.5, unit: 'T' }, { k: 'L', label: 'Panjang batang L', min: 0.2, max: 1.5, step: 0.1, val: 1, unit: 'm' },
    { k: 'v', label: 'Kecepatan v', min: 0.5, max: 10, step: 0.5, val: 4, unit: 'm/s' }, { k: 'R', label: 'Hambatan R', min: 0.5, max: 10, step: 0.5, val: 2, unit: 'Ω' }],
  fitW: 7, cam: [0, 4.5, 4.5], target: [0, 0, 0],
  build(T) {
    const rel = [T.cyl(0.03, 0.03, 6.4, 0x64748b, { metal: 0.6 }), T.cyl(0.03, 0.03, 6.4, 0x64748b, { metal: 0.6 })]; rel.forEach(r => { r.rotation.z = Math.PI / 2; });
    const hambat = T.box(0.15, 0.12, 1, 0x111827), batang = T.cyl(0.05, 0.05, 1, 0xb45309, { metal: 0.6 }); batang.rotation.x = Math.PI / 2;
    const medan = []; for (let i = -3; i <= 3; i++) for (let j = -1; j <= 1; j++) medan.push({ a: T.arrow(0x16a34a, 0.015, { opacity: 0.55 }), x: i * 0.9, z: j * 0.5 });
    const aI = T.arrow(0xea580c, 0.04), aF = T.arrow(0x7c3aed, 0.04), lI = T.label('I', T.group, 'small'), lF = T.label('F (melawan)', T.group, 'small');
    let x = -2;
    return {
      update(dt, p) {
        const Lv = 0.6 + p.L * 1.2;
        rel[0].position.set(0.2, 0, -Lv / 2); rel[1].position.set(0.2, 0, Lv / 2);
        hambat.scale.z = Lv; hambat.position.set(-3, 0, 0);
        x += dt * p.v * 0.25; if (x > 3.2) x = -2.4;
        batang.scale.y = Lv + 0.2; batang.position.set(x, 0.05, 0);
        medan.forEach(o => o.a.set(V(o.x, 1.2, o.z * Lv), V(0, -0.5, 0)));
        const I = p.B * p.L * p.v / p.R;
        aI.set(V(x, 0.2, -Lv / 2 + 0.1), V(0, 0, clamp(0.3 + I * 0.1, 0.3, Lv - 0.2))); lI.position.set(x + 0.2, 0.35, 0);
        aF.set(V(x, 0.2, 0), V(-clamp(0.3 + p.B * I * p.L * 0.15, 0.3, 1.5), 0, 0)); lF.position.set(x - 0.6, 0.45, 0);
      },
      readout(p) {
        const e = p.B * p.L * p.v, I = e / p.R, F = p.B * I * p.L;
        return [['GGL induksi ε = B·L·v', fx(e, 2) + ' V'], ['Arus I = ε/R', fx(I, 2) + ' A'], ['Gaya Lorentz F = B·I·L (melawan gerak)', fx(F, 2) + ' N'], ['Daya untuk menarik P = F·v', fx(F * p.v, 2) + ' W']];
      },
    };
  },
});

/* ---------- induksi: transformator ---------- */
sim('induksi', { mode: 'trafo', label: 'Transformator', desc: 'Arus bolak-balik di kumparan primer membuat fluks berubah di inti besi, yang menginduksi tegangan di kumparan sekunder.',
  params: [{ k: 'Np', label: 'Lilitan primer Np', min: 50, max: 2000, step: 50, val: 1000, unit: '' }, { k: 'Ns', label: 'Lilitan sekunder Ns', min: 10, max: 2000, step: 10, val: 50, unit: '' },
    { k: 'Vp', label: 'Tegangan primer Vp', min: 12, max: 240, step: 1, val: 220, unit: 'V' }, { k: 'eta', label: 'Efisiensi η', min: 50, max: 100, step: 1, val: 90, unit: '%' },
    { k: 'R', label: 'Hambatan beban', min: 5, max: 500, step: 5, val: 20, unit: 'Ω' }],
  cam: [0, 0.8, 6.5], target: [0, 0.6, 0],
  build(T) {
    const W = 2.4, H = 2, t = 0.3, cy = 0.6;
    [[0, cy + H / 2, W + t, t], [0, cy - H / 2, W + t, t]].forEach(([x, y, w, h]) => T.box(w, h, t, 0x6b7280, { metal: 0.4 }).position.set(x, y, 0));
    [-W / 2, W / 2].forEach(x => T.box(t, H, t, 0x6b7280, { metal: 0.4 }).position.set(x, cy, 0));
    const prim = T.line(0xb45309, 500), sek = T.line(0x2563eb, 500), lampu = T.sphere(0.25, 0xfef9c3, { emissive: 0xfacc15, ei: 0 });
    const kabel = [T.line(0x334155, 3), T.line(0x334155, 4)], lp = T.label('', T.group, 'small'), ls = T.label('', T.group, 'small');
    const fluks = Array.from({ length: 14 }, (_, i) => ({ m: T.sphere(0.04, 0x16a34a), u: i / 14 })), keliling = 2 * (W + H);
    const titikInti = u => { let s = u * keliling; if (s < W) return V(-W / 2 + s, cy + H / 2, 0.2); s -= W; if (s < H) return V(W / 2, cy + H / 2 - s, 0.2); s -= H; if (s < W) return V(W / 2 - s, cy - H / 2, 0.2); s -= W; return V(-W / 2, cy - H / 2 + s, 0.2); };
    let key = '', waktu = 0;
    return {
      update(dt, p) {
        waktu += dt;
        const k = Math.round(clamp(p.Np / 60, 3, 30)) + '|' + Math.round(clamp(p.Ns / 60, 3, 30));
        if (k !== key) { key = k; const [a, b] = k.split('|').map(Number); prim.set(heliks(cy - 0.7, cy + 0.7, 0.3, a, 500).map(q => V(-W / 2 + q.z, q.x, q.y))); sek.set(heliks(cy - 0.7, cy + 0.7, 0.3, b, 500).map(q => V(W / 2 + q.z, q.x, q.y))); }
        const Vs = p.Vp * p.Ns / p.Np, Ps = Vs * Vs / p.R;
        lampu.position.set(W / 2 + 1.3, cy, 0); lampu.material.emissiveIntensity = clamp(Ps / 200, 0.05, 1.5);
        kabel[0].set([V(-W / 2 - 0.3, cy + 0.7, 0), V(-W / 2 - 1.1, cy + 0.7, 0), V(-W / 2 - 1.1, cy - 0.7, 0)]);
        kabel[1].set([V(W / 2 + 0.3, cy + 0.7, 0), V(W / 2 + 1.3, cy + 0.7, 0), V(W / 2 + 1.3, cy - 0.7, 0), V(W / 2 + 0.3, cy - 0.7, 0)]);
        lp.position.set(-W / 2 - 1.1, cy - 0.95, 0); lp.text(`Vp = ${p.Vp} V`); ls.position.set(W / 2 + 1.3, cy - 0.95, 0); ls.text(`Vs = ${fx(Vs, 1)} V`);
        const ar = Math.cos(waktu * 3); fluks.forEach(o => { o.u = (o.u + dt * 0.15 * ar + 1) % 1; o.m.position.copy(titikInti(o.u)); });
      },
      readout(p) {
        const Vs = p.Vp * p.Ns / p.Np, Is = Vs / p.R, Ps = Vs * Is, Pp = Ps / (p.eta / 100);
        return [['Tegangan sekunder Vs = Vp·Ns/Np', fx(Vs, 1) + ' V'], ['Jenis', p.Ns > p.Np ? 'step-up' : p.Ns < p.Np ? 'step-down' : 'sama'], ['Arus sekunder Is = Vs/R', fx(Is, 2) + ' A'],
          ['Daya sekunder Ps', fx(Ps, 1) + ' W'], ['Arus primer Ip = Ps/(η·Vp)', fx(Pp / p.Vp, 3) + ' A'], ['Daya hilang (panas)', fx(Pp - Ps, 1) + ' W']];
      },
    };
  },
});

/* ---------- AC: rangkaian RLC (diagram fasor) ---------- */
sim('ac', { mode: 'rlc', label: 'Rangkaian RLC', desc: 'Diagram fasor berputar: V_R searah arus, V_L mendahului 90°, V_C tertinggal 90°. Resultannya tegangan sumber.',
  params: [{ k: 'R', label: 'Hambatan R', min: 10, max: 200, step: 5, val: 60, unit: 'Ω' }, { k: 'L', label: 'Induktansi L', min: 10, max: 1000, step: 10, val: 400, unit: 'mH' },
    { k: 'C', label: 'Kapasitas C', min: 1, max: 100, step: 1, val: 20, unit: 'μF' }, { k: 'f', label: 'Frekuensi sumber f', min: 10, max: 200, step: 1, val: 50, unit: 'Hz' },
    { k: 'Vm', label: 'Tegangan maksimum', min: 10, max: 311, step: 1, val: 100, unit: 'V' }],
  cam: [0, 0, 7.5], target: [0, 0, 0],
  build(T) {
    T.line(0x94a3b8, 2, { dashed: true }).set([V(-3, 0, 0), V(3, 0, 0)]); T.line(0x94a3b8, 2, { dashed: true }).set([V(0, -2.6, 0), V(0, 2.6, 0)]);
    const warna = [0xdc2626, 0x16a34a, 0x2563eb, 0x111827], nama = ['V_R', 'V_L', 'V_C', 'V'];
    const pan = warna.map(c => T.arrow(c, 0.04)), lbl = nama.map(n => T.label(n, T.group, 'small')), lingkar = T.line(0x111827, 64, { loop: true, opacity: 0.25 });
    let th = 0;
    return {
      update(dt, p) {
        th += dt * 0.8;
        const w = 2 * Math.PI * p.f, XL = w * p.L / 1000, XC = 1 / (w * p.C * 1e-6), Z = Math.hypot(p.R, XL - XC), phi = Math.atan2(XL - XC, p.R), k = 2 / Z;
        const dir = a => V(Math.cos(a), Math.sin(a), 0);
        const vek = [dir(th).multiplyScalar(k * p.R), dir(th + Math.PI / 2).multiplyScalar(Math.min(k * XL, 2.6)), dir(th - Math.PI / 2).multiplyScalar(Math.min(k * XC, 2.6)), dir(th + phi).multiplyScalar(2)];
        lingkar.set(Array.from({ length: 64 }, (_, i) => dir(i / 64 * Math.PI * 2).multiplyScalar(2)));
        pan.forEach((a, i) => { a.set(V(0, 0, i * 0.01), vek[i]); lbl[i].position.copy(vek[i].clone().multiplyScalar(1.12)); });
      },
      readout(p) {
        const w = 2 * Math.PI * p.f, XL = w * p.L / 1000, XC = 1 / (w * p.C * 1e-6), Z = Math.hypot(p.R, XL - XC), Im = p.Vm / Z, f0 = 1 / (2 * Math.PI * Math.sqrt(p.L / 1000 * p.C * 1e-6));
        return [['X_L = 2πfL ; X_C = 1/(2πfC)', `${fx(XL, 1)} Ω ; ${fx(XC, 1)} Ω`], ['Impedansi Z', fx(Z, 1) + ' Ω'], ['Arus maksimum I = V/Z', fx(Im, 3) + ' A'], ['Sudut fase φ ; faktor daya cos φ', `${fx(Math.atan2(XL - XC, p.R) / deg, 1)}° ; ${fx(p.R / Z, 3)}`],
          ['Sifat rangkaian', Math.abs(XL - XC) < 0.02 * Z ? 'resistif (resonansi)' : XL > XC ? 'induktif' : 'kapasitif'], ['Frekuensi resonansi f₀ = 1/(2π√LC)', fx(f0, 1) + ' Hz']];
      },
    };
  },
});

/* ---------- kuantum: radiasi benda hitam ---------- */
const WARNA_T = [[1000, 0x7f1d1d], [3000, 0xff6a00], [5500, 0xfff4e0], [10000, 0x9bb8ff]];
const warnaSuhu = T => { for (let i = 1; i < WARNA_T.length; i++) if (T <= WARNA_T[i][0]) { const [t0, c0] = WARNA_T[i - 1], [t1, c1] = WARNA_T[i]; return new THREE.Color(c0).lerp(new THREE.Color(c1), (T - t0) / (t1 - t0)); } return new THREE.Color(WARNA_T.at(-1)[1]); };
sim('kuantum', { mode: 'benda-hitam', label: 'Benda hitam', desc: 'Grafik intensitas tiap panjang gelombang (dinormalkan ke puncak). Makin panas, puncak bergeser ke kiri (Wien) dan daya naik pangkat empat (Stefan–Boltzmann).',
  params: [{ k: 'T', label: 'Suhu benda T', min: 1000, max: 10000, step: 100, val: 3000, unit: 'K' }, { k: 'A', label: 'Luas permukaan A', min: 0.01, max: 1, step: 0.01, val: 0.1, unit: 'm²' },
    { k: 'e', label: 'Emisivitas e', min: 0.1, max: 1, step: 0.05, val: 1, unit: '' }],
  cam: [0.8, 1.4, 7], target: [0.8, 1.2, 0],
  build(T) {
    const bola = T.sphere(0.6, 0xff6a00, { emissive: 0xff6a00, ei: 1 }); bola.position.set(-2.2, 1.3, 0);
    const pnl = T.panel({ x: -1, y: 0.2, w: 4.2, h: 2.4, xl: 'λ (nm)', yl: 'intensitas' }), kurva = T.line(0xdc2626, 150), puncak = T.line(0x7c3aed, 2, { dashed: true }), lp = T.label('', T.group, 'small');
    const LMAX = 3000;
    for (let w = 380; w < 750; w += 20) { const b = T.box(4.2 * 20 / LMAX, 0.08, 0.02, wl2rgb(w + 10)); b.position.copy(pnl.map((w + 10) / LMAX, -0.04)); }
    T.label('3000', T.group, 'small').position.copy(pnl.map(1, -0.12)); T.label('cahaya tampak', T.group, 'small').position.copy(pnl.map(565 / LMAX + 0.08, -0.14));
    const planck = (lam, T) => 1 / (lam ** 5 * (Math.exp(1.4388e-2 / (lam * T)) - 1));
    return {
      update(dt, p) {
        const c = warnaSuhu(p.T); bola.material.color.copy(c); bola.material.emissive.copy(c); bola.material.emissiveIntensity = clamp(0.3 + p.e, 0.3, 1.3);
        const lm = 2.898e-3 / p.T, max = planck(lm, p.T), pts = [];
        for (let i = 1; i <= 150; i++) { const lam = i / 150 * LMAX * 1e-9; pts.push(pnl.map(i / 150, planck(lam, p.T) / max)); }
        kurva.set(pts); puncak.set([pnl.map(lm * 1e9 / LMAX, 0), pnl.map(lm * 1e9 / LMAX, 1)]); lp.position.copy(pnl.map(lm * 1e9 / LMAX, 1.12)); lp.text(`λ_maks = ${fx(lm * 1e9, 0)} nm`);
      },
      readout(p) {
        const lm = 2.898e-3 / p.T, P = p.e * 5.67e-8 * p.A * p.T ** 4;
        return [['Wien λ_maks = 2,898×10⁻³/T', fx(lm * 1e9, 0) + ' nm'], ['Daya pancar P = e·σ·A·T⁴', fx(P) + ' W'], ['Intensitas P/A', fx(P / p.A) + ' W/m²'], ['Puncak di daerah', lm < 380e-9 ? 'ultraungu' : lm <= 750e-9 ? 'cahaya tampak' : 'inframerah'],
          ['Suhu 2× lipat', 'daya 16× lipat']];
      },
    };
  },
});

/* ---------- relativitas: penjumlahan kecepatan ---------- */
sim('relativitas', { mode: 'kecepatan', label: 'Penjumlahan kecepatan', desc: 'Pesawat bergerak v₁ terhadap Bumi dan menembakkan peluru v₂ terhadap pesawat. Kecepatan peluru terhadap Bumi tidak pernah melebihi c.',
  params: [{ k: 'v1', label: 'Kecepatan pesawat v₁', min: 0, max: 0.99, step: 0.01, val: 0.6, unit: 'c' }, { k: 'v2', label: 'Kecepatan peluru terhadap pesawat v₂', min: 0, max: 0.99, step: 0.01, val: 0.6, unit: 'c' }],
  fitW: 9, cam: [0, 1.2, 8], target: [0, 0.3, 0],
  build(T) {
    T.box(10, 0.05, 1.5, 0xcbd5e1).position.set(0, -0.6, 0); T.label('Bumi (pengamat diam)', T.group, 'small').position.set(-3.6, -0.95, 0);
    const pes = T.add(new THREE.Group()); T.box(1, 0.3, 0.35, 0x334155, { metal: 0.4 }, pes); T.add(new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.4, 16), T.mat(0x334155)), pes).rotation.z = -Math.PI / 2; pes.children[1].position.x = 0.7;
    const peluru = T.sphere(0.08, 0xea580c, { emissive: 0xea580c, ei: 0.5 }), aV1 = T.arrow(0x2563eb, 0.03), aU = T.arrow(0xea580c, 0.03), cahaya = T.arrow(0xfacc15, 0.03);
    const l1 = T.label('v₁', T.group, 'small'), lu = T.label('v', T.group, 'small'), lc = T.label('c', T.group, 'small');
    let t = 0;
    return {
      update(dt, p) {
        const u = (p.v1 + p.v2) / (1 + p.v1 * p.v2); t = (t + dt) % 3;
        const xp = -4 + p.v1 * t * 2.5; pes.position.set(xp, 0, 0);
        peluru.position.set(-4 + 0.9 + u * t * 2.5, 0.05, 0);
        const s = 2.6;
        aV1.set(V(-4.5, 0.6, 0), V(p.v1 * s + 1e-3, 0, 0)); l1.position.set(-4.5 + p.v1 * s / 2, 0.8, 0);
        aU.set(V(-4.5, 1.1, 0), V(u * s + 1e-3, 0, 0)); lu.position.set(-4.5 + u * s / 2, 1.3, 0);
        cahaya.set(V(-4.5, 1.6, 0), V(s, 0, 0)); lc.position.set(-4.5 + s / 2, 1.8, 0);
      },
      readout(p) {
        const u = (p.v1 + p.v2) / (1 + p.v1 * p.v2);
        return [['Klasik (salah) v₁ + v₂', fx(p.v1 + p.v2, 3) + ' c'], ['Relativistik v = (v₁+v₂)/(1+v₁v₂/c²)', fx(u, 3) + ' c'], ['Dalam m/s', fx(u * 3e8) + ' m/s'], ['Kesimpulan', 'tidak pernah melebihi c']];
      },
    };
  },
});

/* ---------- inti: energi ikat ---------- */
// Massa atom (sma); karena massa atom memuat elektron, proton dihitung sebagai atom H (1,007825 sma).
const NUKLIDA = { 'H-2': ['Deuterium ²H', 1, 1, 2.014102], 'He-4': ['Helium ⁴He', 2, 2, 4.002603], 'Li-7': ['Litium ⁷Li', 3, 4, 7.016004], 'C-12': ['Karbon ¹²C', 6, 6, 12],
  'O-16': ['Oksigen ¹⁶O', 8, 8, 15.994915], 'Fe-56': ['Besi ⁵⁶Fe', 26, 30, 55.934936], 'U-235': ['Uranium ²³⁵U', 92, 143, 235.04393] };
const mH = 1.007825, mN = 1.008665;
sim('inti', { mode: 'energi-ikat', label: 'Energi ikat inti', desc: 'Massa inti lebih kecil daripada jumlah massa proton dan neutron penyusunnya. Selisihnya (defek massa) setara energi ikat. Geser untuk memisahkan nukleon.',
  params: [{ k: 'nuk', label: 'Inti atom', opts: Object.entries(NUKLIDA).map(([k, v]) => [k, v[0]]), val: 'He-4', rebuild: true }, { k: 'pisah', label: 'Pisahkan nukleon', min: 0, max: 1, step: 0.05, val: 0, unit: '' }],
  cam: [0, 0.5, 6.5], target: [0, 0.3, 0],
  build(T, p) {
    const [, Z, N] = NUKLIDA[p.nuk], A = Z + N, R = 0.18 * Math.cbrt(A) + 0.1, rn = clamp(0.5 / Math.cbrt(A), 0.07, 0.2);
    const ga = Math.PI * (3 - Math.sqrt(5)), nuk = Array.from({ length: A }, (_, i) => {
      const y = A === 1 ? 0 : 1 - 2 * i / (A - 1), r = Math.sqrt(1 - y * y), d = V(Math.cos(ga * i) * r, y, Math.sin(ga * i) * r), rad = Math.cbrt((i + 1) / A);
      return { m: T.sphere(rn, (i * 7919) % A < Z ? 0xdc2626 : 0x94a3b8), d, rad };
    });
    T.label('merah = proton, abu-abu = neutron', T.group, 'small').position.set(0, -1.9, 0);
    let t = 0;
    return {
      update(dt, q) {
        t += dt; const s = R * (1 + 6 * q.pisah);
        nuk.forEach((o, i) => o.m.position.copy(o.d).multiplyScalar(s * o.rad).add(V(0, 0.3 + Math.sin(t * 3 + i) * 0.01 * (1 - q.pisah), 0)));
      },
      readout() {
        const [, , , m] = NUKLIDA[p.nuk], dm = Z * mH + N * mN - m, E = dm * 931.5;
        return [['Defek massa Δm = Z·m_H + N·m_n − m', fx(dm, 6) + ' sma'], ['Energi ikat E = Δm × 931,5', fx(E, 2) + ' MeV'], ['Energi ikat per nukleon', fx(E / A, 2) + ' MeV'], ['Jumlah nukleon', `${Z} proton + ${N} neutron`],
          ['Paling stabil', 'sekitar Fe-56 (≈ 8,8 MeV/nukleon)']];
      },
    };
  },
});

/* ---------- digital: konversi analog ke digital ---------- */
sim('digital', { mode: 'adc', label: 'ADC (sampling & kuantisasi)', desc: 'Garis biru adalah sinyal analog 0–5 V. Titik merah adalah sampel, garis merah adalah hasil digital setelah dibulatkan ke level terdekat.',
  params: [{ k: 'n', label: 'Jumlah bit per sampel n', min: 1, max: 6, step: 1, val: 3, unit: 'bit' }, { k: 'fs', label: 'Sampel per periode sinyal', min: 1, max: 32, step: 1, val: 12, unit: '' }],
  fitW: 7, cam: [0, 1.5, 6.5], target: [0, 1.4, 0],
  build(T) {
    const pnl = T.panel({ x: -3, y: 0.1, w: 6, h: 2.6, xl: 't', yl: 'V' }), analog = T.line(0x2563eb, 200), digi = T.line(0xdc2626, 70);
    const level = T.segments(0xe2e8f0, 64), sampel = Array.from({ length: 33 }, () => T.sphere(0.05, 0xdc2626)), kursor = T.line(0x7c3aed, 2, { dashed: true }), kode = T.label('', T.group, 'accent');
    const sinyal = u => 0.5 + 0.45 * Math.sin(u * Math.PI * 2);
    analog.set(Array.from({ length: 200 }, (_, i) => pnl.map(i / 199, sinyal(i / 199))));
    let t = 0, key = '', q = [];
    return {
      update(dt, p) {
        const L = 2 ** p.n;
        if (key !== p.n + '|' + p.fs) {
          key = p.n + '|' + p.fs;
          level.set(Array.from({ length: L }, (_, i) => [pnl.map(0, i / (L - 1)), pnl.map(1, i / (L - 1))]));
          q = Array.from({ length: p.fs + 1 }, (_, i) => Math.round(sinyal(i / p.fs) * (L - 1)));
          const pts = []; q.forEach((v, i) => { pts.push(pnl.map(i / p.fs, v / (L - 1))); if (i < p.fs) pts.push(pnl.map((i + 1) / p.fs, v / (L - 1))); }); digi.set(pts);
          sampel.forEach((o, i) => { o.visible = i <= p.fs; if (o.visible) o.position.copy(pnl.map(i / p.fs, q[i] / (L - 1))); });
        }
        t = (t + dt * 0.15) % 1; const i = Math.min(Math.floor(t * p.fs), p.fs);
        kursor.set([pnl.map(i / p.fs, 0), pnl.map(i / p.fs, 1)]); kode.position.copy(pnl.map(0.5, 1.15));
        kode.text(`sampel ${i}: ${q[i].toString(2).padStart(p.n, '0')} (${fx(q[i] / (L - 1) * 5, 2)} V)`);
      },
      readout(p) {
        return [['Jumlah level 2ⁿ', fx(2 ** p.n, 0)], ['Resolusi 5 V/(2ⁿ − 1)', fx(5 / (2 ** p.n - 1), 3) + ' V'], ['Nyquist f_s ≥ 2f', p.fs >= 2 ? 'terpenuhi' : 'tidak terpenuhi (sinyal rusak)'],
          ['Ukuran data jika sinyal 1 kHz, 1 detik', fx(p.fs * 1000 * p.n / 8, 0) + ' byte']];
      },
    };
  },
});
