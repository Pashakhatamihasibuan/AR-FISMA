// Mode simulasi tambahan kelas X (satu mode per rumus). Toolkit & format angka dari sims.js.
import * as THREE from 'three';
import { sim, V, deg, g, clamp, fx } from './sims.js';

const watt = P => P >= 1e6 ? fx(P / 1e6, 2) + ' MW' : P >= 1e3 ? fx(P / 1e3, 2) + ' kW' : fx(P, 1) + ' W';

/* ---------- pengukuran: mikrometer sekrup ---------- */
sim('pengukuran', { mode: 'mikrometer', label: 'Mikrometer sekrup', desc: 'Satu putaran selubung = 0,5 mm; selubung dibagi 50 skala, jadi 1 skala = 0,01 mm.',
  params: [{ k: 'u', label: 'Tebal benda', min: 0.5, max: 12, step: 0.01, val: 5.78, unit: 'mm' }],
  fitW: 6, cam: [1.4, 0.8, 4.2], target: [1.4, 0, 0],
  build(T) {
    const sc = 0.3, x0 = -1.1;
    T.box(0.3, 0.7, 0.35, 0x64748b, { metal: 0.6 }).position.set(x0 - 0.15, 0, 0);
    T.box(1.3, 0.25, 0.35, 0x334155, { metal: 0.6 }).position.set(x0 + 0.35, -0.9, 0);
    T.box(0.25, 0.9, 0.35, 0x334155, { metal: 0.6 }).position.set(x0 - 0.17, -0.5, 0);
    T.box(0.3, 1.05, 0.35, 0x334155, { metal: 0.6 }).position.set(0.2, -0.45, 0);
    const sleeve = T.cyl(0.22, 0.22, 4, 0xe2e8f0, { metal: 0.5 }); sleeve.rotation.z = Math.PI / 2; sleeve.position.x = 2;
    T.box(4, 0.008, 0.01, 0x0f172a).position.set(2, 0.12, 0.2);
    for (let i = 0; i <= 25; i++) {
      const up = i % 2 === 0, h = up ? 0.12 : 0.08;
      T.box(0.01, h, 0.01, 0x0f172a).position.set(i * 0.5 * sc, up ? 0.12 + h / 2 : 0.12 - h / 2, 0.21);
      if (up && i % 10 === 0) T.label(String(i / 2), T.group, 'small').position.set(i * 0.5 * sc, 0.4, 0.22);
    }
    const spindle = T.rod(0.07, 0xcbd5e1, { metal: 0.7 });
    const obj = T.box(1, 0.5, 0.3, 0xf97316);
    const thimble = T.add(new THREE.Group());
    const tb = T.cyl(0.3, 0.3, 1.3, 0x94a3b8, { metal: 0.6 }, thimble); tb.rotation.z = Math.PI / 2; tb.position.x = 0.65;
    for (let i = 0; i < 50; i++) {
      const a = i / 50 * Math.PI * 2, t = T.box(i % 5 ? 0.06 : 0.12, 0.008, 0.008, 0x0f172a, {}, thimble);
      t.position.set(i % 5 ? 0.03 : 0.06, 0.305 * Math.sin(a), 0.305 * Math.cos(a)); t.rotation.x = -a;
    }
    const lp = T.label('', T.group, 'accent'); lp.position.set(0, 0.75, 0.3);
    return {
      update(dt, p) {
        const tip = x0 + p.u * sc, edge = p.u * sc;
        spindle.set(V(tip, 0, 0), V(edge, 0, 0));
        obj.scale.x = Math.max(p.u * sc, 0.01); obj.position.x = x0 + p.u * sc / 2;
        thimble.position.x = edge; thimble.rotation.x = -(p.u / 0.5) * Math.PI * 2;
        lp.position.x = edge + 0.3; lp.text(`skala putar ${Math.round((p.u * 100) % 50)}`);
      },
      readout(p) {
        const u = Math.round(p.u * 100), utama = Math.floor(u / 50) * 0.5, putar = u - utama * 100;
        return [['Skala utama', fx(utama, 1) + ' mm'], ['Skala putar', `${putar} × 0,01 = ${fx(putar / 100)} mm`], ['Hasil pengukuran', fx(u / 100) + ' mm'], ['Ketelitian', '0,01 mm']];
      },
    };
  },
});

/* ---------- vektor: komponen ---------- */
sim('vektor', { mode: 'komponen', label: 'Komponen vektor', desc: 'Vektor miring dipecah menjadi komponen mendatar (x) dan tegak (y).',
  params: [{ k: 'F', label: 'Besar vektor F', min: 1, max: 10, step: 0.5, val: 6, unit: 'N' }, { k: 'th', label: 'Arah θ terhadap sumbu x', min: 0, max: 360, step: 5, val: 35, unit: '°' }],
  cam: [0, 0, 9], target: [0, 0, 0],
  build(T) {
    T.grid(10, 20, 'xy');
    const aF = T.arrow(0xea580c, 0.06), ax = T.arrow(0x2563eb, 0.045), ay = T.arrow(0x16a34a, 0.045);
    const d1 = T.line(0x94a3b8, 2, { dashed: true }), d2 = T.line(0x94a3b8, 2, { dashed: true });
    const lF = T.label('F', T.group, 'accent'), lx = T.label('Fₓ'), ly = T.label('F_y');
    return {
      update(dt, p) {
        const s = 0.5, fx_ = p.F * Math.cos(p.th * deg) * s, fy = p.F * Math.sin(p.th * deg) * s, O = V();
        aF.set(O, V(fx_, fy, 0)); ax.set(O, V(fx_, 0, 0)); ay.set(V(fx_, 0, 0), V(0, fy, 0));
        d1.set([V(0, fy, 0), V(fx_, fy, 0)]); d2.set([V(fx_, 0, 0), V(fx_, fy, 0)]);
        lF.position.set(fx_ * 0.55 - 0.3, fy * 0.55 + 0.3, 0); lx.position.set(fx_ / 2, fy >= 0 ? -0.3 : 0.3, 0); ly.position.set(fx_ + (fx_ >= 0 ? 0.35 : -0.35), fy / 2, 0);
      },
      readout(p) {
        const x = p.F * Math.cos(p.th * deg), y = p.F * Math.sin(p.th * deg);
        return [['Fₓ = F cos θ', fx(x) + ' N'], ['F_y = F sin θ', fx(y) + ' N'], ['Cek √(Fₓ² + F_y²)', fx(Math.hypot(x, y)) + ' N'], ['Kuadran', y >= 0 ? (x >= 0 ? 'I' : 'II') : (x >= 0 ? 'IV' : 'III')]];
      },
    };
  },
});

/* ---------- gerak lurus: vertikal & jatuh bebas ---------- */
sim('gerak-lurus', { mode: 'vertikal', label: 'Gerak vertikal', desc: 'v₀ = 0 berarti jatuh bebas. Percepatan selalu g = 10 m/s² ke bawah.',
  params: [{ k: 'v0', label: 'Kecepatan awal ke atas v₀', min: 0, max: 30, step: 1, val: 20, unit: 'm/s', rebuild: true }, { k: 'h0', label: 'Ketinggian awal', min: 0, max: 60, step: 5, val: 0, unit: 'm', rebuild: true }],
  cam: [1.4, 2.6, 9], target: [1.4, 2.6, 0],
  build(T, p) {
    const sc = 0.065;
    T.box(2, 0.05, 1, 0x86efac).position.set(-0.6, -0.025, 0);
    for (let m = 0; m <= 80; m += 10) { T.box(0.25, 0.01, 0.01, 0x334155).position.set(-1.4, m * sc, 0); T.label(m + ' m', T.group, 'small').position.set(-1.85, m * sc, 0); }
    const ball = T.sphere(0.13, 0xea580c), av = T.arrow(0x2563eb, 0.035);
    const pnl = T.panel({ x: 0.4, y: 0.3, w: 3.4, h: 4.6, xl: 't', yl: 'h (m)' }), path = T.line(0xea580c, 300), dot = T.sphere(0.06, 0xea580c);
    const tTot = Math.max((p.v0 + Math.sqrt(p.v0 * p.v0 + 2 * g * p.h0)) / g, 0.01), hMax = p.h0 + p.v0 * p.v0 / (2 * g), H = Math.max(hMax, 10);
    const pts = []; for (let i = 0; i <= 120; i++) { const t = tTot * i / 120; pts.push(pnl.map(t / tTot, (p.h0 + p.v0 * t - 5 * t * t) / H)); }
    path.set(pts);
    let t = 0; const st = {};
    return {
      update(dt) {
        t += dt; if (t > tTot + 1.2) t = 0;
        const s = Math.min(t, tTot), h = Math.max(p.h0 + p.v0 * s - 5 * s * s, 0), v = p.v0 - g * s;
        Object.assign(st, { s, h, v });
        ball.position.set(-0.6, h * sc + 0.13, 0); av.set(ball.position, V(0, v * 0.04, 0));
        dot.position.copy(pnl.map(s / tTot, h / H));
      },
      readout() {
        return [['Waktu t', fx(st.s, 2) + ' s'], ['Ketinggian h', fx(st.h, 1) + ' m'], ['Kecepatan v (+ ke atas)', fx(st.v, 1) + ' m/s'],
          ['Tinggi maksimum', fx(hMax, 1) + ' m'], ['Waktu ke puncak v₀/g', fx(p.v0 / g, 2) + ' s'], ['Waktu sampai tanah', fx(tTot, 2) + ' s']];
      },
    };
  },
});

/* ---------- parabola: dilempar mendatar ---------- */
sim('parabola', { mode: 'mendatar', label: 'Lemparan mendatar', desc: 'Benda dilempar mendatar dari ketinggian: maju dengan v₀ tetap sambil jatuh bebas.',
  params: [{ k: 'v0', label: 'Kecepatan mendatar v₀', min: 0, max: 30, step: 1, val: 10, unit: 'm/s' }, { k: 'h', label: 'Tinggi tebing h', min: 5, max: 80, step: 5, val: 45, unit: 'm' }],
  fitW: 11, cam: [1, 2.6, 10], target: [1, 2.2, 0],
  build(T) {
    const sc = 0.055, x0 = -4;
    T.box(12, 0.05, 2, 0x86efac).position.set(1.5, -0.025, 0);
    const cliff = T.box(1, 1, 1.5, 0xa16207); const path = T.line(0xea580c, 80, { dashed: true }), ball = T.sphere(0.12, 0xea580c), mark = T.cyl(0.2, 0.2, 0.02, 0xdc2626);
    const ax = T.arrow(0x2563eb, 0.03), ay = T.arrow(0x16a34a, 0.03);
    for (let m = 0; m <= 120; m += 20) T.label(m + ' m', T.group, 'small').position.set(x0 + m * sc, 0, 1.1);
    let t = 0; const st = {};
    return {
      update(dt, p) {
        const H = p.h * sc, tf = Math.sqrt(2 * p.h / g);
        cliff.scale.y = H; cliff.position.set(x0 - 0.5, H / 2, 0);
        const pts = []; for (let i = 0; i <= 79; i++) { const s = tf * i / 79; pts.push(V(x0 + p.v0 * s * sc, (p.h - 5 * s * s) * sc, 0)); }
        path.set(pts); mark.position.set(x0 + p.v0 * tf * sc, 0.01, 0);
        t += dt; if (t > tf + 1) t = 0;
        const s = Math.min(t, tf), y = p.h - 5 * s * s;
        Object.assign(st, { s, tf });
        ball.position.set(x0 + p.v0 * s * sc, y * sc + 0.12, 0);
        ax.set(ball.position, V(p.v0 * 0.04, 0, 0)); ay.set(ball.position, V(0, -g * s * 0.04, 0));
      },
      readout(p) {
        const tf = Math.sqrt(2 * p.h / g), vy = g * tf;
        return [['Waktu jatuh t = √(2h/g)', fx(tf, 2) + ' s'], ['Jarak mendarat x = v₀·t', fx(p.v0 * tf, 1) + ' m'], ['Kecepatan saat mendarat', fx(Math.hypot(p.v0, vy), 1) + ' m/s'],
          ['Sudut jatuh terhadap tanah', fx(Math.atan2(vy, p.v0) / deg, 1) + '°'], ['Catatan', 'Waktu jatuh tidak bergantung v₀']];
      },
    };
  },
});

/* ---------- melingkar: hubungan roda-roda ---------- */
sim('melingkar', { mode: 'roda', label: 'Hubungan roda', desc: 'Seporos: ω sama. Bersinggungan atau dihubungkan rantai: kecepatan linear v sama.',
  params: [{ k: 'susun', label: 'Susunan roda', opts: [['seporos', 'Seporos'], ['singgung', 'Bersinggungan'], ['rantai', 'Rantai/sabuk']], val: 'rantai' },
    { k: 'r1', label: 'Jari-jari roda 1', min: 5, max: 30, step: 1, val: 20, unit: 'cm' }, { k: 'r2', label: 'Jari-jari roda 2', min: 5, max: 30, step: 1, val: 10, unit: 'cm' },
    { k: 'f1', label: 'Putaran roda 1', min: 0.1, max: 1.5, step: 0.05, val: 0.4, unit: 'putaran/s' }],
  cam: [0, 0, 9], target: [0, 0, 0],
  build(T) {
    const sc = 0.08;
    const roda = c => { const gr = T.add(new THREE.Group()); const d = T.cyl(1, 1, 0.15, c, {}, gr); d.rotation.x = Math.PI / 2; for (let k = 0; k < 3; k++) { const s = T.box(2, 0.06, 0.17, 0xffffff, {}, gr); s.rotation.z = k * Math.PI / 3; } T.sphere(0.08, 0x111827, {}, gr); return gr; };
    const w1 = roda(0x2563eb), w2 = roda(0xea580c), sabuk = [T.line(0x334155, 2), T.line(0x334155, 2)];
    const l1 = T.label('roda 1'), l2 = T.label('roda 2', T.group, 'accent');
    let a1 = 0, a2 = 0; const st = {};
    return {
      update(dt, p) {
        const R1 = p.r1 * sc, R2 = p.r2 * sc, w = 2 * Math.PI * p.f1;
        let c1, c2, w2r;
        if (p.susun === 'seporos') { c1 = V(0, 0, 0); c2 = V(0, 0, 0.12); w2r = w; }
        else if (p.susun === 'singgung') { c1 = V(-R1, 0, 0); c2 = V(R2, 0, 0); w2r = -w * p.r1 / p.r2; }
        else { c1 = V(-2.4, 0, 0); c2 = V(2.4, 0, 0); w2r = w * p.r1 / p.r2; }
        Object.assign(st, { w, w2: Math.abs(w2r) });
        w1.position.copy(c1); w1.scale.set(R1, R1, 1); w2.position.copy(c2); w2.scale.set(R2, R2, 1);
        a1 -= w * dt; a2 -= w2r * dt; w1.rotation.z = a1; w2.rotation.z = a2;
        sabuk.forEach((s, i) => { s.visible = p.susun === 'rantai'; const k = i ? -1 : 1; s.set([V(c1.x, k * R1, 0.1), V(c2.x, k * R2, 0.1)]); });
        l1.position.set(c1.x, R1 + 0.35, 0); l2.position.set(c2.x + (p.susun === 'seporos' ? 0.9 : 0), (p.susun === 'seporos' ? -R2 - 0.35 : R2 + 0.35), 0);
      },
      readout(p) {
        const v1 = st.w * p.r1 / 100, v2 = st.w2 * p.r2 / 100;
        return [['ω₁ ; ω₂', `${fx(st.w)} ; ${fx(st.w2)} rad/s`], ['v₁ ; v₂ (tepi roda)', `${fx(v1)} ; ${fx(v2)} m/s`], ['Putaran roda 2', fx(st.w2 / (2 * Math.PI)) + ' putaran/s'],
          ['Yang sama', p.susun === 'seporos' ? 'kecepatan sudut ω' : 'kecepatan linear v'], ['Arah putar roda 2', p.susun === 'singgung' ? 'berlawanan roda 1' : 'searah roda 1']];
      },
    };
  },
});

/* ---------- newton: balok ditarik di lantai kasar ---------- */
sim('newton', { mode: 'tarik', label: 'Balok ditarik', desc: 'Balok bergerak jika komponen mendatar gaya tarik melebihi gaya gesek maksimum μN.',
  params: [{ k: 'F', label: 'Gaya tarik F', min: 0, max: 100, step: 1, val: 40, unit: 'N' }, { k: 'th', label: 'Sudut tali θ', min: 0, max: 60, step: 1, val: 0, unit: '°' },
    { k: 'm', label: 'Massa balok', min: 1, max: 20, step: 0.5, val: 5, unit: 'kg' }, { k: 'mu', label: 'Koefisien gesek μ', min: 0, max: 1, step: 0.05, val: 0.3, unit: '' }],
  fitW: 9, cam: [0, 1.6, 8], target: [0, 0.8, 0],
  build(T) {
    T.box(10, 0.1, 2, 0xcbd5e1).position.y = -0.05;
    const blok = T.box(0.8, 0.8, 0.8, 0x2563eb);
    const aF = T.arrow(0xea580c), aW = T.arrow(0xdc2626), aN = T.arrow(0x16a34a), af = T.arrow(0x7c3aed);
    const lF = T.label('F', T.group, 'accent'), lW = T.label('w'), lN = T.label('N'), lf = T.label('f');
    let x = -4, v = 0, hold = 0; const st = {};
    return {
      update(dt, p) {
        const W = p.m * g, Fx = p.F * Math.cos(p.th * deg), Fy = p.F * Math.sin(p.th * deg), N = Math.max(W - Fy, 0), fmax = p.mu * N;
        const gerak = Fx > fmax + 1e-9 || v > 0, f = gerak ? fmax : Fx, a = gerak ? (Fx - fmax) / p.m : 0; // a < 0: melambat sampai berhenti
        Object.assign(st, { W, N, f, a: Fx > fmax ? a : 0, gerak: Fx > fmax, angkat: Fy >= W });
        if (hold > 0) { hold -= dt; if (hold <= 0) { x = -4; v = 0; } } else { v = Math.max(v + a * dt, 0); x += v * dt; if (x > 4) hold = 1; }
        const c = V(x, 0.4, 0), k = 0.03;
        blok.position.copy(c);
        aF.set(V(x + 0.4, 0.4, 0), V(Fx * k, Fy * k, 0)); aW.set(c, V(0, -W * k, 0)); aN.set(c, V(0, N * k, 0)); af.set(V(x - 0.4, 0.05, 0), V(-f * k, 0, 0));
        lF.position.set(x + 0.4 + Fx * k + 0.2, 0.4 + Fy * k, 0); lW.position.set(x + 0.2, 0.4 - W * k - 0.15, 0); lN.position.set(x + 0.2, 0.4 + N * k + 0.15, 0); lf.position.set(x - 0.4 - f * k - 0.2, 0.05, 0);
      },
      readout() {
        return [['Berat w', fx(st.W, 1) + ' N'], ['Gaya normal N = w − F sin θ', fx(st.N, 1) + ' N'], ['Gaya gesek f', fx(st.f, 1) + ' N'],
          ['Percepatan a', fx(st.a) + ' m/s²'], ['Keadaan', st.angkat ? 'Balok terangkat (N = 0)' : st.gerak ? 'Bergerak' : 'Diam (gesek statis menahan)']];
      },
    };
  },
});

/* ---------- newton: timbangan di dalam lift ---------- */
sim('newton', { mode: 'lift', label: 'Timbangan di lift', desc: 'Timbangan menunjukkan gaya normal: lebih besar saat lift dipercepat naik, lebih kecil saat dipercepat turun.',
  params: [{ k: 'arah', label: 'Gerak lift', opts: [['naik', 'Dipercepat naik'], ['turun', 'Dipercepat turun'], ['tetap', 'Kecepatan tetap']], val: 'naik' },
    { k: 'a', label: 'Percepatan lift', min: 0, max: 8, step: 0.5, val: 2, unit: 'm/s²' }, { k: 'm', label: 'Massa orang', min: 30, max: 90, step: 1, val: 50, unit: 'kg' }],
  cam: [0, 2, 8], target: [0, 2, 0],
  build(T) {
    T.box(2.6, 4.6, 0.1, 0xe2e8f0).position.set(0, 2.3, -1.1);
    const cab = T.add(new THREE.Group());
    T.box(1.8, 2.2, 1.8, 0xbae6fd, { opacity: 0.25 }, cab).position.y = 1.1;
    T.box(0.9, 0.12, 0.6, 0x334155, {}, cab).position.y = 0.06;
    const orang = T.add(new THREE.Group(), cab); orang.position.y = 0.12;
    T.cyl(0.18, 0.2, 1, 0x2563eb, {}, orang).position.y = 0.5; T.sphere(0.18, 0xfcd34d, {}, orang).position.y = 1.2;
    const aN = T.arrow(0x16a34a), aW = T.arrow(0xdc2626), aA = T.arrow(0x7c3aed, 0.05);
    const lt = T.label('', cab, 'accent'); lt.position.set(0.95, 0.15, 0.3);
    let y = 0.3, v = 0; const st = {};
    return {
      update(dt, p) {
        const a = p.arah === 'tetap' ? 0 : p.arah === 'naik' ? p.a : -p.a, N = Math.max(p.m * (g + a), 0);
        Object.assign(st, { a, N });
        v += a * dt * 0.15; if (p.arah === 'tetap') v = 0.25; y += v * dt;
        if (y > 2.2 || y < 0.2) { y = p.arah === 'turun' ? 2.1 : 0.3; v = p.arah === 'tetap' ? 0.25 : 0; }
        cab.position.y = y;
        const c = V(0, y + 0.8, 0.95), k = 0.0018;
        aN.set(V(0.25, y + 0.15, 0.95), V(0, N * k, 0)); aW.set(V(-0.25, y + 1, 0.95), V(0, -p.m * g * k, 0)); aA.set(V(1.2, y + 1.1, 0), V(0, a * 0.12, 0));
        lt.text(`${fx(N / g, 1)} kg`);
      },
      readout(p) {
        return [['Berat sebenarnya w = mg', fx(p.m * g, 0) + ' N'], ['Gaya normal (timbangan) N', fx(st.N, 0) + ' N'], ['Angka timbangan', fx(st.N / g, 1) + ' kg'],
          ['Rumus dipakai', st.a > 0 ? 'N = m(g + a)' : st.a < 0 ? 'N = m(g − a)' : 'N = mg'], ['Catatan', st.N === 0 ? 'Jatuh bebas: orang terasa tanpa bobot' : 'Ungu = arah percepatan lift']];
      },
    };
  },
});

/* ---------- newton: katrol (pesawat Atwood) ---------- */
sim('newton', { mode: 'katrol', label: 'Katrol', desc: 'Dua beban digantung pada katrol licin: beban yang lebih berat turun dengan percepatan tetap.',
  params: [{ k: 'm1', label: 'Massa beban kiri m₁', min: 1, max: 10, step: 0.5, val: 2, unit: 'kg', rebuild: true }, { k: 'm2', label: 'Massa beban kanan m₂', min: 1, max: 10, step: 0.5, val: 3, unit: 'kg', rebuild: true }],
  cam: [0, 2, 7.5], target: [0, 2, 0],
  build(T, p) {
    const R = 0.5, top = 4;
    T.box(2.6, 0.12, 0.6, 0x475569).position.set(0, top + 0.75, 0); T.rod(0.04, 0x475569).set(V(0, top + 0.7, 0), V(0, top, 0));
    const roda = T.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.06, 12, 40), T.mat(0x334155, { metal: 0.5 }))); roda.position.y = top;
    const t1 = T.rod(0.015, 0x111827), t2 = T.rod(0.015, 0x111827);
    const b1 = T.box(0.5, 0.18 + 0.05 * p.m1, 0.5, 0x2563eb), b2 = T.box(0.5, 0.18 + 0.05 * p.m2, 0.5, 0xea580c);
    T.label(p.m1 + ' kg', b1, 'small').position.y = 0.45; T.label(p.m2 + ' kg', b2, 'small').position.y = 0.45;
    const a = (p.m2 - p.m1) * g / (p.m1 + p.m2), Tt = 2 * p.m1 * p.m2 * g / (p.m1 + p.m2);
    const aA = T.arrow(0x7c3aed, 0.04);
    let d = 0, v = 0, hold = 0;
    return {
      update(dt) {
        if (hold > 0) { hold -= dt; if (hold <= 0) { d = 0; v = 0; } } else { v += a * dt * 0.3; d += v * dt; if (Math.abs(d) > 1.4) hold = 1; }
        const y1 = 2 + d, y2 = 2 - d;
        b1.position.set(-R, y1, 0); b2.position.set(R, y2, 0);
        t1.set(V(-R, y1 + 0.2, 0), V(-R, top, 0)); t2.set(V(R, y2 + 0.2, 0), V(R, top, 0));
        roda.rotation.z = d / R;
        aA.set(V(a >= 0 ? R + 0.6 : -R - 0.6, 2.3, 0), V(0, -Math.sign(a) * Math.min(Math.abs(a) * 0.25, 1.5), 0));
      },
      readout() {
        return [['Percepatan a = (m₂ − m₁)g/(m₁ + m₂)', fx(Math.abs(a)) + ' m/s²'], ['Tegangan tali T', fx(Tt, 2) + ' N'], ['Beban yang turun', a > 0 ? 'kanan (m₂)' : a < 0 ? 'kiri (m₁)' : 'setimbang, diam'],
          ['Berat m₁ ; m₂', `${fx(p.m1 * g, 1)} ; ${fx(p.m2 * g, 1)} N`]];
      },
    };
  },
});

/* ---------- gravitasi: gaya antara dua benda ---------- */
sim('gravitasi', { mode: 'gaya', label: 'Gaya gravitasi', desc: 'Contoh awal mendekati Bumi dan Bulan. Gaya sebanding massa dan berbanding terbalik kuadrat jarak.',
  params: [{ k: 'm1', label: 'Massa benda 1', min: 1, max: 10, step: 0.1, val: 6, unit: '× 10²⁴ kg' }, { k: 'm2', label: 'Massa benda 2', min: 1, max: 10, step: 0.1, val: 7.3, unit: '× 10²² kg' },
    { k: 'r', label: 'Jarak antarpusat', min: 1, max: 8, step: 0.1, val: 3.8, unit: '× 10⁸ m' }],
  fitW: 10, cam: [0, 1.5, 9], target: [0, 0, 0],
  build(T) {
    const b1 = T.sphere(1, 0x2563eb), b2 = T.sphere(1, 0x94a3b8), f1 = T.arrow(0x7c3aed, 0.05), f2 = T.arrow(0x7c3aed, 0.05), lr = T.line(0x334155, 2, { dashed: true }), lab = T.label('r');
    let F0 = 0;
    return {
      update(dt, p) {
        const D = p.r * 1.0, x1 = -D / 2, x2 = D / 2, F = 6.67e-11 * p.m1 * 1e24 * p.m2 * 1e22 / (p.r * 1e8) ** 2;
        F0 ||= F;
        b1.scale.setScalar(0.25 + 0.12 * Math.cbrt(p.m1)); b1.position.x = x1; b2.scale.setScalar(0.12 + 0.06 * Math.cbrt(p.m2)); b2.position.x = x2;
        const L = clamp(0.8 * Math.sqrt(F / F0), 0.15, 3);
        f1.set(V(x1, 0, 0), V(L, 0, 0)); f2.set(V(x2, 0, 0), V(-L, 0, 0)); lr.set([V(x1, -1, 0), V(x2, -1, 0)]); lab.position.set(0, -1.25, 0);
      },
      readout(p) {
        const F = 6.67e-11 * p.m1 * 1e24 * p.m2 * 1e22 / (p.r * 1e8) ** 2;
        return [['Gaya gravitasi F = Gm₁m₂/r²', fx(F) + ' N'], ['Gaya pada benda 1 dan 2', 'sama besar, berlawanan arah'], ['Percepatan benda 2 (F/m₂)', fx(F / (p.m2 * 1e22)) + ' m/s²'],
          ['Jika r dijadikan 2×', 'F menjadi ¼ ×']];
      },
    };
  },
});

/* ---------- gravitasi: percepatan gravitasi planet ---------- */
const PLANET = { bumi: ['Bumi', 5.97e24, 6.37e6, 0x2563eb], bulan: ['Bulan', 7.35e22, 1.74e6, 0x94a3b8], mars: ['Mars', 6.42e23, 3.39e6, 0xdc2626], jupiter: ['Jupiter', 1.9e27, 6.99e7, 0xd97706] };
sim('gravitasi', { mode: 'medan', label: 'Gravitasi planet', desc: 'g = GM/r². Makin tinggi dari permukaan, makin kecil percepatan gravitasinya.',
  params: [{ k: 'pl', label: 'Planet', opts: Object.entries(PLANET).map(([k, v]) => [k, v[0]]), val: 'bumi' },
    { k: 'h', label: 'Ketinggian dari permukaan (× jari-jari planet)', min: 0, max: 3, step: 0.1, val: 1, unit: 'R' }, { k: 'm', label: 'Massa benda', min: 1, max: 100, step: 1, val: 60, unit: 'kg' }],
  cam: [0, 0.8, 9], target: [0, 0, 0],
  build(T) {
    const pl = T.sphere(1.2, 0x2563eb), obj = T.sphere(0.12, 0xea580c), ag = T.arrow(0x16a34a, 0.04), lh = T.line(0x94a3b8, 2, { dashed: true });
    return {
      update(dt, p) {
        const [, , , c] = PLANET[p.pl]; pl.material.color.setHex(c);
        const y = 1.2 * (1 + p.h); obj.position.set(0, y, 0); lh.set([V(0.4, 1.2, 0), V(0.4, y, 0)]);
        ag.set(V(0, y, 0), V(0, -clamp(1.2 / (1 + p.h) ** 2, 0.08, 1.2), 0));
      },
      readout(p) {
        const [nama, M, R] = PLANET[p.pl], g0 = 6.67e-11 * M / R ** 2, gh = g0 / (1 + p.h) ** 2;
        return [[`g di permukaan ${nama}`, fx(g0, 2) + ' m/s²'], ['g di ketinggian itu', fx(gh, 2) + ' m/s²'], ['Berat benda di permukaan', fx(p.m * g0, 1) + ' N'], ['Berat benda di ketinggian', fx(p.m * gh, 1) + ' N'],
          ['Ketinggian', fx(p.h * R / 1000, 0) + ' km']];
      },
    };
  },
});

/* ---------- usaha-energi: usaha W = F s cos θ ---------- */
sim('usaha-energi', { mode: 'usaha', label: 'Usaha', desc: 'Hanya komponen gaya yang searah perpindahan yang melakukan usaha.',
  params: [{ k: 'F', label: 'Gaya tarik F', min: 10, max: 100, step: 5, val: 50, unit: 'N' }, { k: 'th', label: 'Sudut gaya θ', min: 0, max: 90, step: 5, val: 60, unit: '°' },
    { k: 's', label: 'Perpindahan s', min: 1, max: 10, step: 0.5, val: 10, unit: 'm', rebuild: true }],
  fitW: 10, cam: [0, 1.6, 9], target: [0, 0.8, 0],
  build(T, p) {
    const sc = 0.7, x0 = -4;
    T.box(11, 0.1, 2, 0xcbd5e1).position.y = -0.05;
    T.line(0x16a34a, 2, { dashed: true }).set([V(x0, 0.02, 0.8), V(x0 + p.s * sc, 0.02, 0.8)]); T.label(`s = ${p.s} m`, T.group, 'small').position.set(x0 + p.s * sc / 2, 0.05, 1);
    const koper = T.box(0.6, 0.7, 0.35, 0x7c3aed), aF = T.arrow(0xea580c), ax = T.arrow(0x2563eb, 0.035), ay = T.arrow(0x94a3b8, 0.03), lF = T.label('F', T.group, 'accent');
    let d = 0, hold = 0;
    return {
      update(dt, q) {
        if (hold > 0) { hold -= dt; if (hold <= 0) d = 0; } else { d += dt * 1.5; if (d >= p.s) { d = p.s; hold = 1; } }
        const x = x0 + d * sc; koper.position.set(x, 0.35, 0);
        const k = 0.025, Fx = q.F * Math.cos(q.th * deg), Fy = q.F * Math.sin(q.th * deg), o = V(x + 0.3, 0.6, 0);
        aF.set(o, V(Fx * k, Fy * k, 0)); ax.set(o, V(Fx * k, 0, 0)); ay.set(o.clone().add(V(Fx * k, 0, 0)), V(0, Fy * k, 0)); lF.position.set(o.x + Fx * k + 0.2, o.y + Fy * k + 0.1, 0);
      },
      readout(q) {
        const Fx = q.F * Math.cos(q.th * deg);
        return [['Komponen searah Fₓ = F cos θ', fx(Fx, 1) + ' N'], ['Usaha total W = F·s·cos θ', fx(Fx * p.s, 1) + ' J'], ['Usaha sejauh ini', fx(Fx * d, 1) + ' J'], ['Catatan', q.th === 90 ? 'θ = 90°: usaha nol' : 'Komponen tegak (abu-abu) tidak melakukan usaha']];
      },
    };
  },
});

/* ---------- usaha-energi: daya pompa ---------- */
sim('usaha-energi', { mode: 'daya', label: 'Daya pompa', desc: 'Daya = usaha per satuan waktu. Pompa mengangkat air ke tandon setinggi h.',
  params: [{ k: 'm', label: 'Massa air', min: 10, max: 300, step: 10, val: 120, unit: 'kg' }, { k: 'h', label: 'Tinggi tandon', min: 2, max: 20, step: 1, val: 10, unit: 'm' }, { k: 't', label: 'Waktu pemompaan', min: 10, max: 300, step: 10, val: 60, unit: 's' }],
  cam: [1, 2.4, 8.5], target: [0.5, 2.2, 0],
  build(T) {
    const sc = 0.22;
    T.box(6, 0.1, 3, 0x86efac).position.y = -0.05;
    const bak = T.box(1.2, 0.6, 1, 0x3b82f6, { opacity: 0.5 }); bak.position.set(-1.6, 0.3, 0);
    const tiang = T.rod(0.06, 0x64748b), pipa = T.rod(0.05, 0x0284c7);
    const tandon = T.cyl(0.55, 0.55, 0.9, 0xe2e8f0, { opacity: 0.3 }), isi = T.cyl(0.5, 0.5, 1, 0x3b82f6, { opacity: 0.7 });
    T.box(0.5, 0.4, 0.4, 0x334155).position.set(-0.6, 0.2, 0); T.label('pompa', T.group, 'small').position.set(-0.6, 0.6, 0);
    const lh = T.label('', T.group, 'small');
    let t = 0;
    return {
      update(dt, p) {
        const H = p.h * sc;
        tiang.set(V(1.2, 0, 0), V(1.2, H, 0)); tandon.position.set(1.2, H + 0.45, 0); pipa.set(V(-0.6, 0.2, 0), V(1.2, H + 0.45, 0));
        t += dt; if (t > 6) t = 0; const f = Math.min(t / 5, 1);
        isi.scale.y = Math.max(f * 0.85, 0.01); isi.position.set(1.2, H + isi.scale.y / 2, 0); bak.scale.y = 1 - f * 0.7; bak.position.y = bak.scale.y * 0.3;
        lh.position.set(1.95, H / 2, 0); lh.text(`h = ${p.h} m`);
      },
      readout(p) {
        const W = p.m * g * p.h, P = W / p.t;
        return [['Usaha W = m·g·h', fx(W, 0) + ' J'], ['Daya P = W/t', watt(P)], ['Dalam tenaga kuda (1 hp = 746 W)', fx(P / 746, 2) + ' hp'], ['Animasi', 'dipercepat, satu siklus = waktu pemompaan']];
      },
    };
  },
});

/* ---------- momentum: impuls ---------- */
sim('momentum', { mode: 'impuls', label: 'Impuls', desc: 'Impuls = gaya × lama kontak = perubahan momentum. Luas grafik F–t adalah impuls.',
  params: [{ k: 'm', label: 'Massa bola', min: 0.1, max: 1, step: 0.05, val: 0.5, unit: 'kg' }, { k: 'v1', label: 'Kecepatan datang', min: 2, max: 30, step: 1, val: 10, unit: 'm/s' },
    { k: 'v2', label: 'Kecepatan pantul', min: 0, max: 30, step: 1, val: 6, unit: 'm/s' }, { k: 'dt', label: 'Lama kontak Δt', min: 0.005, max: 0.1, step: 0.005, val: 0.02, unit: 's' }],
  cam: [0.6, 1.2, 8.5], target: [0.6, 0.8, 0],
  build(T) {
    const bat = T.box(0.2, 1.4, 0.5, 0xa16207); bat.position.set(-1, 0.7, 0);
    const bola = T.sphere(0.2, 0xdc2626), av = T.arrow(0x2563eb, 0.035);
    const pnl = T.panel({ x: 0.6, y: 0.2, w: 3.4, h: 2.4, xl: 't', yl: 'F' }), luas = T.box(1, 1, 0.01, 0x7c3aed, { opacity: 0.45 });
    let t = 0;
    return {
      update(dt, p) {
        t += dt; if (t > 3.4) t = 0;
        const sc = 0.1, xBat = -0.8;
        let x, v;
        if (t < 1.5) { v = p.v1; x = xBat - (1.5 - t) * p.v1 * sc - 0.2; bola.scale.set(1, 1, 1); }
        else if (t < 1.8) { v = 0; x = xBat - 0.2; bola.scale.set(0.7, 1.2, 1.2); }
        else { v = -p.v2; x = xBat - 0.2 - (t - 1.8) * p.v2 * sc; bola.scale.set(1, 1, 1); }
        bola.position.set(x, 0.7, 0); av.set(V(x, 1.05, 0), V(-v * 0.04 * (t < 1.5 ? -1 : 1), 0, 0));
        const F = p.m * (p.v1 + p.v2) / p.dt, Fmax = 1 * (30 + 30) / 0.005;
        const w = p.dt / 0.1, h = clamp(F / Fmax * 6, 0.02, 1);
        const a = pnl.map(0.1, 0), b = pnl.map(0.1 + w * 0.8, h);
        luas.scale.set(b.x - a.x, b.y - a.y, 1); luas.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, 0);
      },
      readout(p) {
        const dp = p.m * (p.v1 + p.v2);
        return [['Perubahan momentum Δp', fx(dp, 2) + ' kg·m/s'], ['Impuls I = Δp', fx(dp, 2) + ' N·s'], ['Gaya rata-rata F = Δp/Δt', fx(dp / p.dt, 0) + ' N'],
          ['Catatan', 'Δt diperpanjang → gaya mengecil (prinsip airbag)']];
      },
    };
  },
});

/* ---------- getaran: bandul sederhana ---------- */
sim('getaran', { mode: 'bandul', label: 'Bandul sederhana', desc: 'Periode bandul hanya bergantung panjang tali dan gravitasi, tidak pada massa beban.',
  params: [{ k: 'L', label: 'Panjang tali L', min: 0.2, max: 2.5, step: 0.1, val: 1, unit: 'm', rebuild: true }, { k: 'th0', label: 'Simpangan awal', min: 2, max: 20, step: 1, val: 10, unit: '°', rebuild: true },
    { k: 'pl', label: 'Lokasi', opts: [['10', 'Bumi (g = 10)'], ['1.62', 'Bulan (g = 1,62)'], ['3.7', 'Mars (g = 3,7)']], val: '10', rebuild: true }],
  cam: [1.4, 1.8, 7], target: [1.4, 1.8, 0],
  build(T, p) {
    const piv = V(0, 3.4, 0), gg = +p.pl;
    T.box(1, 0.1, 0.5, 0x475569).position.copy(piv).add(V(0, 0.05, 0));
    const str = T.rod(0.012, 0x475569), bob = T.sphere(0.12, 0x2563eb);
    const pnl = T.panel({ x: 1.2, y: 0.4, w: 3.4, h: 2.4, xl: 't', yl: 'θ' }), tr = T.trace(pnl, 0xdc2626, 220, -p.th0 * deg * 1.1, p.th0 * deg * 1.1);
    let th = p.th0 * deg, w = 0, t = 0, last = 0, sebelum = th, terukur = 0;
    return {
      update(dt) {
        const n = 20, h = dt / n;
        for (let i = 0; i < n; i++) { w += -(gg / p.L) * Math.sin(th) * h; th += w * h; t += h; if (sebelum < 0 && th >= 0) { if (last) terukur = t - last; last = t; } sebelum = th; }
        const sc = Math.min(1, 2.8 / p.L), pos = V(piv.x + p.L * sc * Math.sin(th), piv.y - p.L * sc * Math.cos(th), 0);
        str.set(piv, pos); bob.position.copy(pos); tr.push(th);
      },
      readout() {
        const Tr = 2 * Math.PI * Math.sqrt(p.L / gg);
        return [['Periode T = 2π√(L/g)', fx(Tr, 2) + ' s'], ['Periode terukur di simulasi', terukur ? fx(terukur, 2) + ' s' : 'mengukur…'], ['Frekuensi f', fx(1 / Tr, 2) + ' Hz'], ['Tali 4× lebih panjang', 'periode 2×']];
      },
    };
  },
});

/* ---------- energi terbarukan: PLTA ---------- */
sim('energi-terbarukan', { mode: 'air', label: 'PLTA', desc: 'Air jatuh dari bendungan memutar turbin: P = η·ρ·Q·g·h.',
  params: [{ k: 'Q', label: 'Debit air Q', min: 1, max: 50, step: 1, val: 10, unit: 'm³/s' }, { k: 'h', label: 'Tinggi jatuh h', min: 5, max: 100, step: 5, val: 20, unit: 'm' }, { k: 'eta', label: 'Efisiensi η', min: 30, max: 95, step: 1, val: 50, unit: '%' }],
  cam: [0.5, 2.2, 8.5], target: [0.5, 1.6, 0],
  build(T) {
    T.box(9, 0.1, 3, 0x86efac).position.y = -0.05;
    const dam = T.box(0.6, 1, 2.4, 0x94a3b8), res = T.box(2.5, 1, 2.4, 0x3b82f6, { opacity: 0.5 }), pipa = T.rod(0.12, 0x475569);
    const rumah = T.box(1, 0.8, 1, 0xe2e8f0); rumah.position.set(2.4, 0.4, 0);
    const rotor = T.add(new THREE.Group()); rotor.position.set(2.4, 0.4, 0.55); for (let i = 0; i < 4; i++) { const b = T.box(0.6, 0.08, 0.04, 0x0284c7, {}, rotor); b.rotation.z = i * Math.PI / 4; }
    const tetes = Array.from({ length: 24 }, (_, i) => ({ m: T.sphere(0.06, 0x38bdf8), u: i / 24 }));
    const lh = T.label('', T.group, 'small');
    return {
      update(dt, p) {
        const H = 0.4 + p.h * 0.035;
        dam.scale.y = H; dam.position.set(-1.2, H / 2, 0); res.scale.y = H * 0.95; res.position.set(-2.8, H * 0.95 / 2, 0);
        const a = V(-0.9, H * 0.85, 0), b = V(2, 0.4, 0); pipa.set(a, b);
        const v = Math.sqrt(2 * g * p.h);
        tetes.forEach(o => { o.u = (o.u + dt * v * 0.02) % 1; o.m.position.lerpVectors(a, b, o.u).add(V(0, 0.15, 0)); });
        rotor.rotation.z -= dt * v * 0.3 * (p.Q / 10) ** 0.3;
        lh.position.set(-0.4, H / 2, 1.3); lh.text(`h = ${p.h} m`);
      },
      readout(p) {
        const P = p.eta / 100 * 1000 * p.Q * g * p.h;
        return [['Daya listrik P = η·ρ·Q·g·h', watt(P)], ['Kecepatan air di bawah √(2gh)', fx(Math.sqrt(2 * g * p.h), 1) + ' m/s'], ['Setara rumah (1.300 VA)', fx(P / 1300, 0) + ' rumah'], ['Energi per hari', fx(P * 24 / 1e6, 1) + ' MWh']];
      },
    };
  },
});

/* ---------- energi terbarukan: panel surya ---------- */
sim('energi-terbarukan', { mode: 'surya', label: 'Panel surya', desc: 'Daya panel = efisiensi × intensitas cahaya × luas panel.',
  params: [{ k: 'I', label: 'Intensitas cahaya Matahari', min: 0, max: 1000, step: 50, val: 1000, unit: 'W/m²' }, { k: 'A', label: 'Luas panel', min: 0.5, max: 10, step: 0.5, val: 2, unit: 'm²' }, { k: 'eta', label: 'Efisiensi panel', min: 5, max: 25, step: 1, val: 20, unit: '%' }],
  cam: [1, 2.2, 8], target: [0.5, 1.4, 0],
  build(T) {
    T.box(8, 0.1, 3, 0x86efac).position.y = -0.05;
    const mt = T.sphere(0.5, 0xfacc15, { emissive: 0xf59e0b, ei: 1 }); mt.position.set(-3, 3.6, -0.5);
    const panel = T.box(1, 0.05, 1, 0x1e3a8a, { metal: 0.6, rough: 0.2 }); panel.position.set(0.8, 0.9, 0); panel.rotation.z = 0.35;
    T.rod(0.04, 0x64748b).set(V(0.8, 0, 0), V(0.8, 0.85, 0));
    const sinar = Array.from({ length: 10 }, () => T.line(0xfacc15, 2, { opacity: 0.8 }));
    const lampu = T.sphere(0.2, 0xfef9c3, { emissive: 0xfacc15, ei: 0 }); lampu.position.set(2.6, 0.5, 0); T.label('beban', T.group, 'small').position.set(2.6, 0.95, 0);
    return {
      update(dt, p) {
        const s = Math.sqrt(p.A) * 0.7; panel.scale.set(s, 1, s);
        sinar.forEach((l, i) => { l.visible = i < Math.round(p.I / 100); const z = (i / 9 - 0.5) * 1.6; l.set([V(-2.6, 3.3, z), V(0.8 + (i % 3 - 1) * 0.3, 1.05, z * 0.5)]); });
        const P = p.eta / 100 * p.I * p.A; lampu.material.emissiveIntensity = clamp(P / 600, 0, 1.5); mt.material.emissiveIntensity = 0.3 + p.I / 1000;
      },
      readout(p) {
        const P = p.eta / 100 * p.I * p.A;
        return [['Daya panel P = η·I·A', watt(P)], ['Energi 5 jam terik', fx(P * 5 / 1000, 2) + ' kWh'], ['Lampu LED 10 W menyala', fx(P / 10, 0) + ' buah'], ['Daya cahaya yang diterima', watt(p.I * p.A)]];
      },
    };
  },
});
