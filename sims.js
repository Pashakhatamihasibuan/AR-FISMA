// Simulasi 3D per bab. Setiap simulasi: params (slider/pilihan), cam/target kamera,
// build(T, p) → { update(dt, p), readout(p) → [[label, nilai], …] }. Satuan scene ≈ meter kecuali disebut lain.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const deg = Math.PI / 180;
const g = 10;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹';

// Format angka gaya Indonesia (koma desimal); notasi ilmiah untuk nilai sangat besar/kecil.
export function fx(x, d = 2) {
  if (!Number.isFinite(x)) return '∞';
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e6 || a < 1e-3)) {
    let e = Math.floor(Math.log10(a)), m = x / 10 ** e;
    if (Math.abs(m) >= 9.995) { m /= 10; e += 1; }
    return `${m.toFixed(2).replace('.', ',')} × 10${e < 0 ? '⁻' : ''}${String(Math.abs(e)).split('').map(c => SUPD[c]).join('')}`;
  }
  return x.toLocaleString('id-ID', { maximumFractionDigits: d });
}
const watt = P => P >= 1e6 ? fx(P / 1e6, 2) + ' MW' : P >= 1e3 ? fx(P / 1e3, 2) + ' kW' : fx(P, 1) + ' W';

export function wl2rgb(w) {
  let r = 0, gg = 0, b = 0;
  if (w < 380) { r = 0.55; gg = 0.3; b = 1; } else if (w < 440) { r = (440 - w) / 60; b = 1; } else if (w < 490) { gg = (w - 440) / 50; b = 1; }
  else if (w < 510) { gg = 1; b = (510 - w) / 20; } else if (w < 580) { r = (w - 510) / 70; gg = 1; } else if (w < 645) { r = 1; gg = (645 - w) / 65; }
  else if (w <= 750) { r = 1; } else { r = 0.6; gg = 0.05; b = 0.05; }
  return new THREE.Color(r, gg, b).getHex();
}

/* ---------------- Toolkit pembangun scene ---------------- */
export function toolkit(group) {
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial({
    color, roughness: o.rough ?? 0.45, metalness: o.metal ?? 0.05, emissive: o.emissive ?? 0, emissiveIntensity: o.ei ?? 1,
    transparent: o.opacity != null, opacity: o.opacity ?? 1, depthWrite: o.opacity == null || o.opacity > 0.6, side: o.side ?? THREE.FrontSide,
  });
  const add = (o, parent = group) => { parent.add(o); return o; };
  const mesh = (geo, c, o, parent) => add(new THREE.Mesh(geo, c?.isMaterial ? c : mat(c, o)), parent);
  const box = (w, h, d, c, o, parent) => mesh(new THREE.BoxGeometry(w, h, d), c, o, parent);
  const sphere = (r, c, o, parent) => mesh(new THREE.SphereGeometry(r, 24, 16), c, o, parent);
  const cyl = (rt, rb, h, c, o, parent) => mesh(new THREE.CylinderGeometry(rt, rb, h, 28), c, o, parent);

  function line(color, n = 2, o = {}, parent) {
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = o.dashed ? new THREE.LineDashedMaterial({ color, dashSize: o.dash ?? 0.15, gapSize: o.gap ?? 0.1, transparent: o.opacity != null, opacity: o.opacity ?? 1 })
      : new THREE.LineBasicMaterial({ color, transparent: o.opacity != null, opacity: o.opacity ?? 1 });
    const L = add(o.loop ? new THREE.LineLoop(geo, m) : new THREE.Line(geo, m), parent);
    L.frustumCulled = false;
    L.set = pts => {
      const k = Math.min(pts.length, n);
      for (let i = 0; i < k; i++) { const q = pts[i]; pos[i * 3] = q.x ?? q[0]; pos[i * 3 + 1] = q.y ?? q[1]; pos[i * 3 + 2] = q.z ?? q[2] ?? 0; }
      geo.setDrawRange(0, k); geo.attributes.position.needsUpdate = true;
      if (o.dashed) L.computeLineDistances();
      return L;
    };
    return L;
  }
  function segments(color, n, o = {}, parent) { // n pasang titik
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 6);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const S = add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: o.opacity != null, opacity: o.opacity ?? 1 })), parent);
    S.frustumCulled = false;
    S.set = pairs => { pairs.forEach(([a, b], i) => { pos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6); }); geo.setDrawRange(0, pairs.length * 2); geo.attributes.position.needsUpdate = true; };
    return S;
  }
  const circlePts = (r, n = 64, plane = 'xz') => Array.from({ length: n }, (_, i) => {
    const a = i / n * Math.PI * 2;
    return plane === 'xz' ? V(r * Math.cos(a), 0, r * Math.sin(a)) : V(r * Math.cos(a), r * Math.sin(a), 0);
  });
  function rod(r, c, o, parent) {
    const m = mesh(new THREE.CylinderGeometry(r, r, 1, 10).translate(0, 0.5, 0), c, o, parent);
    m.set = (a, b) => {
      const d = V().subVectors(b, a), L = d.length();
      m.visible = L > 1e-5; if (!m.visible) return m;
      m.position.copy(a); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(UP, d.divideScalar(L));
      return m;
    };
    return m;
  }
  function arrow(c, r = 0.04, o, parent) {
    const gr = add(new THREE.Group(), parent), material = mat(c, o), hh = r * 6;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 12).translate(0, 0.5, 0), material);
    const head = new THREE.Mesh(new THREE.ConeGeometry(r * 2.6, hh, 16).translate(0, hh / 2, 0), material);
    gr.add(shaft, head);
    gr.set = (from, vec) => {
      const L = vec.length(); gr.visible = L > 1e-4; if (!gr.visible) return gr;
      const h = Math.min(hh, L * 0.6);
      shaft.scale.y = Math.max(L - h, 1e-4); head.position.y = L - h; head.scale.set(1, h / hh, 1);
      gr.position.copy(from); gr.quaternion.setFromUnitVectors(UP, vec.clone().divideScalar(L));
      return gr;
    };
    gr.color = hex => material.color.setHex(hex);
    return gr;
  }
  function label(text, parent = group, cls = '') {
    const d = document.createElement('div'); d.className = 'sim-label ' + cls; d.textContent = text;
    const o = add(new CSS2DObject(d), parent);
    o.text = t => { if (d.textContent !== t) d.textContent = t; return o; };
    return o;
  }
  function spring(c, coils = 12, R = 0.16, parent) {
    const m = mesh(new THREE.BufferGeometry(), c, { metal: 0.5, rough: 0.3 }, parent);
    let key = '';
    m.set = (top, bottom) => {
      const k = `${top.x.toFixed(3)},${top.y.toFixed(3)},${bottom.x.toFixed(3)},${bottom.y.toFixed(3)}`;
      if (k === key) return m; key = k;
      const n = coils * 14 + 10, pts = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n, along = V().lerpVectors(top, bottom, t), w = t < 0.05 || t > 0.95 ? 0 : R;
        pts.push(along.add(V(w * Math.cos(t * coils * 2 * Math.PI), 0, w * Math.sin(t * coils * 2 * Math.PI))));
      }
      m.geometry.dispose();
      m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, 0.022, 6);
      return m;
    };
    return m;
  }
  // Panel grafik 2D di dalam scene: map(u, v) dengan u, v ∈ [0, 1].
  function panel({ x, y, w, h, xl = '', yl = '', z = 0 }) {
    box(w + 0.2, h + 0.2, 0.02, 0xffffff, { opacity: 0.85 }).position.set(x + w / 2, y + h / 2, z - 0.02);
    line(0x334155, 3).set([V(x, y + h, z), V(x, y, z), V(x + w, y, z)]);
    label(xl, group, 'small').position.set(x + w, y - 0.2, z);
    label(yl, group, 'small').position.set(x - 0.15, y + h + 0.15, z);
    return { map: (u, v) => V(x + clamp(u, 0, 1) * w, y + clamp(v, -0.05, 1.05) * h, z + 0.01) };
  }
  function trace(pnl, color, n = 160, vmin = -1, vmax = 1) {
    const L = line(color, n), data = new Array(n).fill(null);
    const mid = line(0x94a3b8, 2, { dashed: true }); mid.set([pnl.map(0, (0 - vmin) / (vmax - vmin)), pnl.map(1, (0 - vmin) / (vmax - vmin))]);
    return {
      push(v) {
        data.shift(); data.push(v);
        const pts = []; data.forEach((d, i) => { if (d != null) pts.push(pnl.map(i / (n - 1), (d - vmin) / (vmax - vmin))); });
        L.set(pts);
      },
      clear() { data.fill(null); L.set([]); },
    };
  }
  const grid = (size = 10, div = 10, plane = 'xz') => {
    const gh = add(new THREE.GridHelper(size, div, 0x94a3b8, 0xdbe3ee));
    if (plane === 'xy') gh.rotation.x = Math.PI / 2;
    return gh;
  };
  return { THREE, V, group, mat, add, box, sphere, cyl, line, segments, circlePts, rod, arrow, label, spring, panel, trace, grid };
}

export const SIMS = {};
const sim = (id, def) => { SIMS[id] = def; };

/* ======================= KELAS X ======================= */
sim('pengukuran', {
  params: [{ k: 'L', label: 'Panjang benda', min: 0.5, max: 5, step: 0.01, val: 2.37, unit: 'cm' }],
  fitW: 5.2, cam: [2.6, -0.1, 5.4], target: [2.6, -0.3, 0],
  build(T) {
    T.box(7, 0.6, 0.12, 0xe2e8f0, { metal: 0.5, rough: 0.3 }).position.set(2.9, 0.3, 0);
    for (let i = 0; i <= 60; i++) {
      const h = i % 10 === 0 ? 0.3 : i % 5 === 0 ? 0.2 : 0.12;
      T.box(0.012, h, 0.01, 0x0f172a).position.set(i / 10, h / 2, 0.065);
      if (i % 10 === 0) T.label(String(i / 10)).position.set(i / 10, 0.48, 0.07);
    }
    T.label('cm').position.set(6.3, 0.48, 0.07);
    T.box(0.25, 1.6, 0.12, 0x94a3b8, { metal: 0.5 }).position.set(-0.125, -0.5, 0);
    const obj = T.box(1, 0.5, 0.4, 0xf97316); obj.position.y = -0.95;
    const vg = T.add(new THREE.Group());
    T.box(1.6, 0.45, 0.14, 0xcbd5e1, { metal: 0.4 }, vg).position.set(0.55, -0.225, 0);
    T.box(0.25, 0.85, 0.12, 0x94a3b8, { metal: 0.5 }, vg).position.set(0.125, -0.875, 0);
    const ticks = [];
    for (let i = 0; i <= 10; i++) {
      const h = i % 5 === 0 ? 0.2 : 0.12, t = T.box(0.012, h, 0.01, 0x0f172a, {}, vg); t.position.set(i * 0.09, -h / 2, 0.075); ticks.push(t);
      if (i % 5 === 0) T.label(String(i), vg, 'small').position.set(i * 0.09, -0.33, 0.08);
    }
    return {
      update(dt, p) {
        vg.position.x = p.L; obj.scale.x = p.L; obj.position.x = p.L / 2;
        const k = Math.round(p.L * 100) % 10;
        ticks.forEach((t, i) => t.material.color.setHex(i === k ? 0xdc2626 : 0x0f172a));
      },
      readout(p) {
        const u = Math.round(p.L * 100), k = u % 10;
        return [['Skala utama', fx(Math.floor(u / 10) / 10, 1) + ' cm'], ['Nonius berimpit', `garis ke-${k} (${fx(k * 0.01)} cm)`], ['Hasil pengukuran', `${fx(u / 100)} cm = ${fx(u / 10, 1)} mm`], ['Ketelitian', '0,01 cm']];
      },
    };
  },
});

sim('vektor', {
  params: [
    { k: 'A', label: 'Besar vektor A', min: 1, max: 8, step: 0.5, val: 4, unit: 'N' }, { k: 'tA', label: 'Arah A', min: 0, max: 360, step: 5, val: 30, unit: '°' },
    { k: 'B', label: 'Besar vektor B', min: 1, max: 8, step: 0.5, val: 3, unit: 'N' }, { k: 'tB', label: 'Arah B', min: 0, max: 360, step: 5, val: 120, unit: '°' }],
  cam: [0, 0, 9], target: [0, 0, 0],
  build(T) {
    T.grid(10, 20, 'xy');
    const aA = T.arrow(0x2563eb, 0.05), aB = T.arrow(0x16a34a, 0.05), aR = T.arrow(0xea580c, 0.065);
    const dA = T.line(0x16a34a, 2, { dashed: true }), dB = T.line(0x2563eb, 2, { dashed: true });
    const lA = T.label('A'), lB = T.label('B'), lR = T.label('R', T.group, 'accent');
    const vec = (m, t) => V(m * Math.cos(t * deg), m * Math.sin(t * deg), 0).multiplyScalar(0.5);
    return {
      update(dt, p) {
        const a = vec(p.A, p.tA), b = vec(p.B, p.tB), r = a.clone().add(b), O = V();
        aA.set(O, a); aB.set(O, b); aR.set(O, r); dA.set([a, r]); dB.set([b, r]);
        lA.position.copy(a).multiplyScalar(1.12); lB.position.copy(b).multiplyScalar(1.12); lR.position.copy(r).multiplyScalar(1.1);
      },
      readout(p) {
        const ax = p.A * Math.cos(p.tA * deg), ay = p.A * Math.sin(p.tA * deg), bx = p.B * Math.cos(p.tB * deg), by = p.B * Math.sin(p.tB * deg);
        const R = Math.hypot(ax + bx, ay + by), th = (Math.atan2(ay + by, ax + bx) / deg + 360) % 360, al = Math.abs(p.tA - p.tB) % 360;
        return [['Aₓ ; A_y', `${fx(ax)} ; ${fx(ay)} N`], ['Bₓ ; B_y', `${fx(bx)} ; ${fx(by)} N`], ['Sudut antarvektor α', fx(Math.min(al, 360 - al), 0) + '°'], ['Resultan R', fx(R) + ' N'], ['Arah R', fx(th, 1) + '°']];
      },
    };
  },
});

sim('gerak-lurus', {
  params: [{ k: 'v0', label: 'Kecepatan awal v₀', min: 0, max: 15, step: 0.5, val: 5, unit: 'm/s' }, { k: 'a', label: 'Percepatan a', min: -3, max: 4, step: 0.5, val: 2, unit: 'm/s²' }],
  cam: [0, 2.6, 8.5], target: [0, 0.3, 0],
  build(T) {
    const sc = 0.15, x0 = -4.5, Lm = 60;
    T.box(Lm * sc + 1, 0.05, 1.3, 0x475569).position.set(0, -0.025, 0);
    for (let m = 0; m <= Lm; m += 20) { T.box(0.03, 0.01, 1.3, 0xffffff).position.set(x0 + m * sc, 0.005, 0); T.label(m + ' m', T.group, 'small').position.set(x0 + m * sc, 0, 0.85); }
    const car = T.add(new THREE.Group());
    T.box(0.7, 0.25, 0.42, 0xdc2626, {}, car).position.y = 0.25;
    T.box(0.38, 0.18, 0.38, 0x93c5fd, {}, car).position.set(-0.05, 0.45, 0);
    const wheels = [[-0.22, -0.21], [0.22, -0.21], [-0.22, 0.21], [0.22, 0.21]].map(([x, z]) => { const w = T.cyl(0.1, 0.1, 0.06, 0x111827, {}, car); w.rotation.x = Math.PI / 2; w.position.set(x, 0.1, z); return w; });
    const dots = Array.from({ length: 20 }, () => { const s = T.sphere(0.05, 0x0ea5e9); s.visible = false; return s; });
    const va = T.arrow(0x2563eb, 0.035), vl = T.label('v');
    let t = 0, hold = 0, next = 0, di = 0;
    const cur = { t: 0, v: 0, x: 0 };
    const reset = () => { t = 0; hold = 0; next = 0; di = 0; dots.forEach(d => { d.visible = false; }); };
    return {
      update(dt, p) {
        if (hold > 0) { hold -= dt; if (hold <= 0) reset(); return; }
        t += dt;
        const tStop = p.a < 0 ? p.v0 / -p.a : Infinity, tt = Math.min(t, tStop);
        let x = p.v0 * tt + 0.5 * p.a * tt * tt;
        const v = p.v0 + p.a * tt;
        if (x >= Lm) x = Lm;
        Object.assign(cur, { t: tt, v, x });
        car.position.x = x0 + x * sc;
        wheels.forEach(w => { w.rotation.y = -x * sc / 0.1; });
        if (t >= next && di < dots.length) { dots[di].position.set(car.position.x, 0.04, 0.35); dots[di].visible = true; di++; next += 0.5; }
        va.set(V(car.position.x, 0.85, 0), V(v * 0.08, 0, 0)); vl.position.set(car.position.x + v * 0.08 + 0.15, 0.9, 0);
        if (t >= tStop || x >= Lm || t >= 9) hold = 1.5;
      },
      readout(p) {
        return [['Waktu t', fx(cur.t, 1) + ' s'], ['Kecepatan v', fx(cur.v, 1) + ' m/s'], ['Jarak s', fx(cur.x, 1) + ' m'],
          ['Jenis gerak', p.a === 0 ? 'GLB (v tetap)' : p.a > 0 ? 'GLBB dipercepat' : 'GLBB diperlambat'], ['Titik biru', 'jejak tiap 0,5 s']];
      },
    };
  },
});

sim('parabola', {
  params: [{ k: 'v0', label: 'Kecepatan awal v₀', min: 5, max: 25, step: 0.5, val: 20, unit: 'm/s' }, { k: 'th', label: 'Sudut elevasi θ', min: 10, max: 80, step: 1, val: 45, unit: '°' }],
  cam: [0, 3, 11.5], target: [0, 2.2, 0],
  build(T) {
    const sc = 0.12, x0 = -5.5;
    T.box(13, 0.05, 2.5, 0x86efac).position.set(1, -0.025, 0);
    for (let m = 0; m <= 80; m += 20) T.label(m + ' m', T.group, 'small').position.set(x0 + m * sc, 0, 1.3);
    const cannon = T.add(new THREE.Group()); cannon.position.set(x0, 0, 0);
    T.cyl(0.11, 0.15, 0.8, 0x334155, { metal: 0.6 }, cannon).geometry.translate(0, 0.4, 0);
    const path = T.line(0xea580c, 100, { dashed: true }), ball = T.sphere(0.12, 0xea580c);
    const peak = T.sphere(0.06, 0x7c3aed), pl = T.label('H maks', T.group, 'small');
    const ax = T.arrow(0x2563eb, 0.03), ay = T.arrow(0x16a34a, 0.03);
    let t = 0; const cur = { x: 0, y: 0, vy: 0 };
    return {
      update(dt, p) {
        const vx = p.v0 * Math.cos(p.th * deg), vy0 = p.v0 * Math.sin(p.th * deg), tf = 2 * vy0 / g;
        cannon.rotation.z = -(90 - p.th) * deg;
        const pts = []; for (let i = 0; i <= 99; i++) { const s = tf * i / 99; pts.push(V(x0 + vx * s * sc, (vy0 * s - 5 * s * s) * sc, 0)); }
        path.set(pts);
        peak.position.set(x0 + vx * tf / 2 * sc, vy0 * vy0 / (2 * g) * sc, 0); pl.position.copy(peak.position).add(V(0, 0.3, 0));
        t += dt; if (t > tf + 1) t = 0;
        const s = Math.min(t, tf), x = vx * s, y = vy0 * s - 5 * s * s, vy = vy0 - g * s;
        Object.assign(cur, { x, y, vy });
        ball.position.set(x0 + x * sc, y * sc, 0);
        ax.set(ball.position, V(vx * 0.05, 0, 0)); ay.set(ball.position, V(0, vy * 0.05, 0));
      },
      readout(p) {
        const v0 = p.v0, s = Math.sin(p.th * deg);
        return [['Waktu ke puncak', fx(v0 * s / g) + ' s'], ['Tinggi maksimum', fx(v0 * v0 * s * s / (2 * g)) + ' m'], ['Jangkauan R', fx(v0 * v0 * Math.sin(2 * p.th * deg) / g) + ' m'],
          ['Waktu terbang', fx(2 * v0 * s / g) + ' s'], ['vₓ (biru) ; v_y (hijau)', `${fx(v0 * Math.cos(p.th * deg), 1)} ; ${fx(cur.vy, 1)} m/s`]];
      },
    };
  },
});

sim('melingkar', {
  params: [{ k: 'r', label: 'Jari-jari r', min: 0.5, max: 3, step: 0.1, val: 2, unit: 'm' }, { k: 'v', label: 'Kelajuan v', min: 1, max: 10, step: 0.5, val: 4, unit: 'm/s' },
    { k: 'm', label: 'Massa m', min: 0.1, max: 2, step: 0.1, val: 0.5, unit: 'kg' }],
  cam: [0, 5, 5.5], target: [0, 0, 0],
  build(T) {
    T.cyl(0.05, 0.05, 0.5, 0x334155).position.y = -0.25;
    const ring = T.line(0x94a3b8, 64, { loop: true, dashed: true }), str = T.rod(0.012, 0x475569), ball = T.sphere(1, 0xdc2626);
    const av = T.arrow(0x2563eb, 0.035), af = T.arrow(0xea580c, 0.04), lv = T.label('v'), lf = T.label('F_s', T.group, 'accent');
    let phi = 0;
    return {
      update(dt, p) {
        ring.set(T.circlePts(p.r));
        phi += p.v / p.r * dt;
        const pos = V(p.r * Math.cos(phi), 0, -p.r * Math.sin(phi)), tan = V(-Math.sin(phi), 0, -Math.cos(phi));
        ball.position.copy(pos); ball.scale.setScalar(0.08 + 0.06 * Math.cbrt(p.m));
        str.set(V(), pos);
        av.set(pos, tan.clone().multiplyScalar(p.v * 0.12)); lv.position.copy(pos).addScaledVector(tan, p.v * 0.12 + 0.2);
        const F = p.m * p.v * p.v / p.r, Lf = Math.min(0.15 + F * 0.03, p.r * 0.85);
        af.set(pos, pos.clone().normalize().multiplyScalar(-Lf)); lf.position.copy(pos).multiplyScalar(1 - Lf / p.r * 0.6).add(V(0, 0.25, 0));
      },
      readout(p) {
        const w = p.v / p.r;
        return [['Kecepatan sudut ω', fx(w) + ' rad/s'], ['Periode T', fx(2 * Math.PI / w) + ' s'], ['Frekuensi f', fx(w / (2 * Math.PI)) + ' Hz'],
          ['Percepatan sentripetal', fx(p.v * p.v / p.r) + ' m/s²'], ['Gaya sentripetal F_s', fx(p.m * p.v * p.v / p.r) + ' N']];
      },
    };
  },
});

sim('newton', {
  params: [{ k: 'th', label: 'Sudut bidang miring θ', min: 0, max: 60, step: 1, val: 30, unit: '°' }, { k: 'm', label: 'Massa balok', min: 1, max: 10, step: 0.5, val: 2, unit: 'kg' },
    { k: 'mu', label: 'Koefisien gesek μ', min: 0, max: 1, step: 0.05, val: 0.2, unit: '' }],
  cam: [0, 2.4, 9], target: [0, 1.4, 0],
  build(T) {
    const L = 6, B = V(3, 0, 0);
    T.box(9, 0.05, 2, 0xcbd5e1).position.set(0, -0.025, 0);
    const ramp = T.box(L, 0.1, 1.4, 0xd6b38a), post = T.rod(0.05, 0x8b6b4a), block = T.box(0.6, 0.6, 0.6, 0x2563eb);
    const aw = T.arrow(0xdc2626), an = T.arrow(0x16a34a), af = T.arrow(0xea580c), ar = T.arrow(0x7c3aed, 0.05);
    const lw = T.label('w'), ln = T.label('N'), lf = T.label('f'), lr = T.label('ΣF', T.group, 'accent');
    let s = L - 0.4, vel = 0, hold = 0;
    const st = {};
    return {
      update(dt, p) {
        const th = p.th * deg, u = V(-Math.cos(th), Math.sin(th), 0), n = V(Math.sin(th), Math.cos(th), 0);
        ramp.rotation.z = -th; ramp.position.copy(B).addScaledVector(u, L / 2).addScaledVector(n, -0.05);
        const top = B.clone().addScaledVector(u, L); post.set(V(top.x, 0, 0), top);
        const W = p.m * g, N = W * Math.cos(th), down = W * Math.sin(th), slides = Math.tan(th) > p.mu + 1e-9;
        const f = slides ? p.mu * N : down, a = slides ? g * (Math.sin(th) - p.mu * Math.cos(th)) : 0;
        Object.assign(st, { W, N, f, a, slides });
        if (hold > 0) { hold -= dt; if (hold <= 0) { s = L - 0.4; vel = 0; } }
        else if (slides) { vel += a * dt; s -= vel * dt; if (s < 0.35) { s = 0.35; hold = 1.2; } }
        else { vel = 0; }
        const c = B.clone().addScaledVector(u, s).addScaledVector(n, 0.3);
        block.position.copy(c); block.rotation.z = -th;
        const k = 0.025;
        aw.set(c, V(0, -W * k, 0)); an.set(c, n.clone().multiplyScalar(N * k)); af.set(c, u.clone().multiplyScalar(f * k)); ar.set(c, u.clone().multiplyScalar(-p.m * a * k));
        lw.position.copy(c).add(V(0.15, -W * k - 0.15, 0)); ln.position.copy(c).addScaledVector(n, N * k + 0.2);
        lf.position.copy(c).addScaledVector(u, f * k + 0.25); lr.position.copy(c).addScaledVector(u, -p.m * a * k - 0.3).add(V(0, -0.2, 0));
      },
      readout(p) {
        return [['Berat w = mg', fx(st.W, 1) + ' N'], ['Gaya normal N', fx(st.N, 1) + ' N'], [st.slides ? 'Gesek kinetis f_k' : 'Gesek statis f_s', fx(st.f, 1) + ' N'],
          ['Percepatan a', fx(st.a) + ' m/s²'], ['Keadaan', st.slides ? 'Meluncur turun' : 'Diam (tan θ ≤ μ)']];
      },
    };
  },
});

sim('gravitasi', {
  params: [{ k: 'r0', label: 'Jarak awal planet', min: 1, max: 4, step: 0.1, val: 2, unit: 'SA', rebuild: true },
    { k: 'kv', label: 'Kecepatan awal (× v orbit lingkaran)', min: 0.5, max: 1.45, step: 0.05, val: 1, unit: '', rebuild: true },
    { k: 'M', label: 'Massa bintang', min: 0.5, max: 2, step: 0.1, val: 1, unit: 'M☉', rebuild: true }],
  fitW: 9, cam: [0, 7.5, 5.5], target: [0, 0, 0],
  build(T, p) {
    T.grid(16, 16);
    T.sphere(0.32, 0xfacc15, { emissive: 0xf59e0b, ei: 0.9 });
    const pl = T.sphere(0.13, 0x2563eb), trail = T.line(0x60a5fa, 600), af = T.arrow(0xea580c, 0.03);
    const GM = 4 * Math.PI * Math.PI * p.M;
    let pos = V(p.r0, 0, 0), vel = V(0, 0, -p.kv * Math.sqrt(GM / p.r0));
    const pts = [];
    const acc = q => q.clone().multiplyScalar(-GM / q.lengthSq() ** 1.5);
    return {
      update(dt) {
        const n = 40, h = dt / n; // 1 detik layar = 1 tahun
        for (let i = 0; i < n; i++) { const a1 = acc(pos); pos.addScaledVector(vel, h).addScaledVector(a1, h * h / 2); vel.addScaledVector(a1.add(acc(pos)), h / 2); }
        if (pos.length() > 14 || pos.length() < 0.15) { pos = V(p.r0, 0, 0); vel = V(0, 0, -p.kv * Math.sqrt(GM / p.r0)); pts.length = 0; }
        pts.push(pos.clone()); if (pts.length > 600) pts.shift();
        trail.set(pts); pl.position.copy(pos);
        af.set(pos, pos.clone().normalize().multiplyScalar(-Math.min(1.2, 0.5 / pos.lengthSq() * p.M + 0.15)));
      },
      readout() {
        const r = pos.length(), v = vel.length(), E = v * v / 2 - GM / r;
        const out = [['Jarak r', fx(r) + ' SA'], ['Kelajuan v', fx(v * 4.74, 1) + ' km/s'], ['Gaya relatif F/F₀ = (r₀/r)²', fx((p.r0 / r) ** 2) + ' ×']];
        if (E < 0) { const a = -GM / (2 * E); out.push(['Bentuk orbit', Math.abs(p.kv - 1) < 0.03 ? 'Lingkaran' : 'Elips'], ['Periode (Kepler III)', fx(Math.sqrt(a ** 3 / p.M)) + ' tahun']); }
        else out.push(['Bentuk orbit', 'Lepas (tidak terikat)']);
        return out;
      },
    };
  },
});

sim('usaha-energi', {
  params: [{ k: 'L', label: 'Panjang tali L', min: 0.5, max: 3, step: 0.1, val: 2, unit: 'm', rebuild: true }, { k: 'th0', label: 'Simpangan awal θ₀', min: 5, max: 80, step: 1, val: 45, unit: '°', rebuild: true },
    { k: 'm', label: 'Massa beban', min: 0.5, max: 5, step: 0.5, val: 1, unit: 'kg' }],
  cam: [1, 1.8, 7.5], target: [1, 1.6, 0],
  build(T, p) {
    const piv = V(0, 3.3, 0);
    T.box(1.2, 0.1, 0.5, 0x475569).position.copy(piv).add(V(0, 0.05, 0));
    T.line(0x94a3b8, 2, { dashed: true }).set([V(-2, piv.y - p.L, 0), V(2, piv.y - p.L, 0)]);
    const str = T.rod(0.012, 0x475569), bob = T.sphere(1, 0xdc2626);
    const bars = [[0x2563eb, 'E_p'], [0xea580c, 'E_k'], [0x16a34a, 'E_m']].map(([c, t], i) => {
      const b = T.box(0.35, 1, 0.35, c); b.position.x = 2.4 + i * 0.55; T.label(t, T.group, 'small').position.set(2.4 + i * 0.55, -0.2, 0); return b;
    });
    let th = p.th0 * deg, w = 0;
    const st = {};
    return {
      update(dt, q) {
        const n = 20, h = dt / n; for (let i = 0; i < n; i++) { w += -(g / p.L) * Math.sin(th) * h; th += w * h; }
        const pos = V(piv.x + p.L * Math.sin(th), piv.y - p.L * Math.cos(th), 0);
        str.set(piv, pos); bob.position.copy(pos); bob.scale.setScalar(0.1 + 0.05 * Math.cbrt(q.m));
        const Em = q.m * g * p.L * (1 - Math.cos(p.th0 * deg)), hgt = p.L * (1 - Math.cos(th)), Ep = q.m * g * hgt, Ek = Math.max(Em - Ep, 0);
        Object.assign(st, { hgt, Ep, Ek, Em, v: Math.sqrt(2 * Ek / q.m) });
        [Ep, Ek, Em].forEach((E, i) => { const hh = Math.max(2.4 * E / (Em || 1), 0.001); bars[i].scale.y = hh; bars[i].position.y = hh / 2; });
      },
      readout() {
        return [['Ketinggian h', fx(st.hgt) + ' m'], ['Kelajuan v', fx(st.v) + ' m/s'], ['E_p = mgh', fx(st.Ep, 1) + ' J'], ['E_k = ½mv²', fx(st.Ek, 1) + ' J'],
          ['E_m (kekal)', fx(st.Em, 1) + ' J'], ['Periode ≈ 2π√(L/g)', fx(2 * Math.PI * Math.sqrt(p.L / g)) + ' s']];
      },
    };
  },
});

sim('momentum', {
  params: [{ k: 'm1', label: 'Massa troli 1', min: 1, max: 5, step: 0.5, val: 2, unit: 'kg', rebuild: true }, { k: 'v1', label: 'Kecepatan troli 1', min: 0, max: 8, step: 0.5, val: 4, unit: 'm/s', rebuild: true },
    { k: 'm2', label: 'Massa troli 2', min: 1, max: 5, step: 0.5, val: 1, unit: 'kg', rebuild: true }, { k: 'v2', label: 'Kecepatan troli 2', min: -6, max: 4, step: 0.5, val: 0, unit: 'm/s', rebuild: true },
    { k: 'e', label: 'Koefisien restitusi e', min: 0, max: 1, step: 0.05, val: 1, unit: '', rebuild: true }],
  cam: [0, 3, 9], target: [0, 0.4, 0],
  build(T, p) {
    T.box(12, 0.05, 0.9, 0x94a3b8).position.y = -0.025;
    const mk = (m, c) => {
      const gr = T.add(new THREE.Group()), w = 0.5 + 0.15 * m;
      T.box(w, 0.4, 0.5, c, {}, gr).position.y = 0.3;
      [-w / 3, w / 3].forEach(x => { const wh = T.cyl(0.08, 0.08, 0.55, 0x111827, {}, gr); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.08, 0); });
      T.label(m + ' kg', gr, 'small').position.y = 0.75;
      return { gr, w, a: T.arrow(c, 0.035) };
    };
    const c1 = mk(p.m1, 0x2563eb), c2 = mk(p.m2, 0xdc2626);
    const P = p.m1 * p.v1 + p.m2 * p.v2, M = p.m1 + p.m2, will = p.v1 > p.v2;
    const v1f = will ? (P - p.m2 * p.e * (p.v1 - p.v2)) / M : p.v1, v2f = will ? (P + p.m1 * p.e * (p.v1 - p.v2)) / M : p.v2;
    let x1 = -4, x2 = 0.5, u1 = p.v1, u2 = p.v2, hit = false, t = 0;
    const ts = 0.6;
    return {
      update(dt) {
        t += dt; const h = dt * ts;
        x1 += u1 * h; x2 += u2 * h;
        if (!hit && x1 + c1.w / 2 >= x2 - c2.w / 2 && u1 > u2) { hit = true; u1 = v1f; u2 = v2f; x1 = x2 - c2.w / 2 - c1.w / 2; }
        if (t > 9 || Math.abs(x1) > 6 || Math.abs(x2) > 6) { x1 = -4; x2 = 0.5; u1 = p.v1; u2 = p.v2; hit = false; t = 0; }
        c1.gr.position.x = x1; c2.gr.position.x = x2;
        c1.a.set(V(x1, 1.0, 0), V(u1 * 0.15, 0, 0)); c2.a.set(V(x2, 1.0, 0), V(u2 * 0.15, 0, 0));
      },
      readout() {
        const Ek0 = 0.5 * p.m1 * p.v1 ** 2 + 0.5 * p.m2 * p.v2 ** 2, Ek1 = 0.5 * p.m1 * v1f ** 2 + 0.5 * p.m2 * v2f ** 2;
        const jenis = !will ? 'Tidak terjadi tumbukan (v₁ ≤ v₂)' : p.e === 1 ? 'Lenting sempurna' : p.e === 0 ? 'Tidak lenting sama sekali' : 'Lenting sebagian';
        return [['Momentum total', `${fx(P, 2)} kg·m/s (kekal)`], ['v₁′ ; v₂′', `${fx(v1f)} ; ${fx(v2f)} m/s`], ['E_k sebelum', fx(Ek0, 2) + ' J'], ['E_k sesudah', fx(Ek1, 2) + ' J'], ['Jenis tumbukan', jenis]];
      },
    };
  },
});

sim('getaran', {
  params: [{ k: 'k', label: 'Konstanta pegas k', min: 10, max: 200, step: 5, val: 50, unit: 'N/m' }, { k: 'm', label: 'Massa beban m', min: 0.1, max: 2, step: 0.1, val: 0.5, unit: 'kg' },
    { k: 'A', label: 'Amplitudo A', min: 0.05, max: 0.5, step: 0.05, val: 0.3, unit: 'm' }],
  cam: [1.6, 1.8, 7], target: [1.6, 1.8, 0],
  build(T) {
    const top = V(0, 3.4, 0), ye = 1.6, sc = 2;
    T.box(1, 0.1, 0.5, 0x475569).position.copy(top).add(V(0, 0.05, 0));
    T.line(0x94a3b8, 2, { dashed: true }).set([V(-0.6, ye, 0), V(0.6, ye, 0)]); T.label('setimbang', T.group, 'small').position.set(-0.95, ye, 0);
    const spr = T.spring(0x64748b, 12), mass = T.box(0.4, 0.4, 0.4, 0x2563eb);
    const pnl = T.panel({ x: 1.2, y: 0.4, w: 3.6, h: 2.6, xl: 't', yl: 'y (m)' }), tr = T.trace(pnl, 0xdc2626, 200, -0.55, 0.55);
    const pen = T.sphere(0.05, 0xdc2626);
    let t = 0; const st = {};
    return {
      update(dt, p) {
        t += dt; const w = Math.sqrt(p.k / p.m), y = p.A * Math.sin(w * t);
        Object.assign(st, { w, y, v: p.A * w * Math.cos(w * t) });
        mass.position.set(0, ye + y * sc - 0.2, 0); spr.set(top, V(0, ye + y * sc, 0));
        tr.push(y); pen.position.copy(pnl.map(1, (y + 0.55) / 1.1));
      },
      readout(p) {
        return [['Periode T = 2π√(m/k)', fx(2 * Math.PI / st.w) + ' s'], ['Frekuensi f', fx(st.w / (2 * Math.PI)) + ' Hz'], ['Simpangan y', fx(st.y) + ' m'],
          ['Kecepatan v', fx(st.v) + ' m/s'], ['v maks = Aω', fx(p.A * st.w) + ' m/s'], ['Energi E = ½kA²', fx(0.5 * p.k * p.A * p.A) + ' J']];
      },
    };
  },
});

sim('energi-terbarukan', {
  params: [{ k: 'v', label: 'Kecepatan angin', min: 0, max: 20, step: 0.5, val: 8, unit: 'm/s' }, { k: 'r', label: 'Panjang bilah (jari-jari)', min: 5, max: 50, step: 1, val: 20, unit: 'm' },
    { k: 'eta', label: 'Efisiensi turbin η', min: 10, max: 59, step: 1, val: 40, unit: '%' }],
  fitW: 6.5, cam: [5.5, 3.2, 6.5], target: [0, 2.6, 0],
  build(T) {
    T.box(12, 0.05, 12, 0x86efac).position.y = -0.025;
    T.cyl(0.08, 0.16, 3.2, 0xf1f5f9).position.y = 1.6;
    T.box(0.7, 0.3, 0.32, 0xe2e8f0).position.set(0.1, 3.3, 0);
    const rotor = T.add(new THREE.Group()); rotor.position.set(-0.32, 3.3, 0);
    T.sphere(0.13, 0xe2e8f0, {}, rotor);
    for (let i = 0; i < 3; i++) { const piv = T.add(new THREE.Group(), rotor); piv.rotation.x = i * 2 * Math.PI / 3; T.box(0.05, 1.5, 0.2, 0xf8fafc, {}, piv).position.y = 0.8; }
    const wind = Array.from({ length: 70 }, () => { const s = T.sphere(0.03, 0x38bdf8, { opacity: 0.7 }); s.scale.set(4, 1, 1); s.position.set(-6 + Math.random() * 12, 1.8 + Math.random() * 3, -2 + Math.random() * 4); return s; });
    return {
      update(dt, p) {
        rotor.rotation.x += 6 * p.v / p.r * dt; // rasio kecepatan ujung bilah ≈ 6
        wind.forEach(s => { s.visible = p.v > 0; s.position.x += p.v * 0.3 * dt; if (s.position.x > 6) s.position.x = -6; });
      },
      readout(p) {
        const A = Math.PI * p.r * p.r, Pw = 0.5 * 1.2 * A * p.v ** 3, Pe = Pw * p.eta / 100;
        return [['Luas sapuan A = πr²', fx(A, 0) + ' m²'], ['Daya angin ½ρAv³', watt(Pw)], ['Daya listrik', watt(Pe)], ['Setara rumah (1.300 VA)', fx(Pe / 1300, 0) + ' rumah'], ['Putaran rotor', fx(6 * p.v / p.r * 60 / (2 * Math.PI), 1) + ' rpm']];
      },
    };
  },
});

/* ======================= KELAS XI ======================= */
sim('rotasi', {
  params: [{ k: 'th', label: 'Sudut bidang miring θ', min: 5, max: 45, step: 1, val: 30, unit: '°', rebuild: true }],
  cam: [1.5, 6, 7], target: [0, 1.2, 0],
  build(T, p) {
    const L = 6, B = V(3, 0, 0), th = p.th * deg, u = V(-Math.cos(th), Math.sin(th), 0), n = V(Math.sin(th), Math.cos(th), 0), R = 0.3;
    T.box(9, 0.05, 3, 0xcbd5e1).position.y = -0.025;
    const ramp = T.box(L, 0.1, 2.8, 0xd6b38a); ramp.rotation.z = -th; ramp.position.copy(B).addScaledVector(u, L / 2).addScaledVector(n, -0.05);
    const top = B.clone().addScaledVector(u, L); T.rod(0.05, 0x8b6b4a).set(V(top.x, 0, 0), top);
    const defs = [['Cincin', 1, 0xdc2626, -0.85], ['Silinder pejal', 0.5, 0x16a34a, 0], ['Bola pejal', 0.4, 0x2563eb, 0.85]];
    const objs = defs.map(([nama, k, c, z]) => {
      const outer = T.add(new THREE.Group()), inner = T.add(new THREE.Group(), outer);
      if (k === 1) T.add(new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 12, 40), T.mat(c)), inner);
      else if (k === 0.5) { const cy = T.cyl(R, R, 0.45, c, {}, inner); cy.rotation.x = Math.PI / 2; T.box(0.05, 2 * R, 0.47, 0xffffff, {}, inner); }
      else { T.sphere(R, c, {}, inner); const band = T.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.03, 8, 32), T.mat(0xffffff)), inner); band.rotation.y = Math.PI / 2; }
      T.label(nama, outer, 'small').position.y = 0.55;
      return { k, z, outer, inner, a: g * Math.sin(th) / (1 + k) };
    });
    const s0 = L - 0.5, dist = s0 - 0.4;
    let t = 0;
    return {
      update(dt) {
        t += dt;
        let done = true;
        objs.forEach(o => {
          const d = Math.min(0.5 * o.a * t * t, dist); if (d < dist) done = false;
          o.outer.position.copy(B).addScaledVector(u, s0 - d).addScaledVector(n, R).add(V(0, 0, o.z));
          o.inner.rotation.z = -d / R;
        });
        if (done && t > Math.sqrt(2 * dist / objs[0].a) + 1.5) t = 0;
      },
      readout() {
        return objs.map(o => [`${defs[objs.indexOf(o)][0]} (k = ${fx(o.k, 1)})`, `a = ${fx(o.a)} m/s² · tiba ${fx(Math.sqrt(2 * dist / o.a))} s`])
          .concat([['Urutan tiba', 'Bola pejal → Silinder pejal → Cincin']]);
      },
    };
  },
});

sim('elastisitas', {
  params: [{ k: 'k', label: 'Konstanta tiap pegas k', min: 50, max: 500, step: 10, val: 200, unit: 'N/m' }, { k: 'm', label: 'Massa beban', min: 0, max: 5, step: 0.1, val: 2, unit: 'kg' },
    { k: 'mode', label: 'Susunan pegas', opts: [['tunggal', 'Tunggal'], ['seri', 'Seri'], ['paralel', 'Paralel']], val: 'tunggal' }],
  cam: [0, 1.6, 6.5], target: [0, 1.6, 0],
  build(T) {
    const y0 = 3.55;
    T.box(2, 0.1, 0.6, 0x475569).position.y = y0 + 0.05;
    const s1 = T.spring(0x64748b, 10), s2 = T.spring(0x64748b, 10), mid = T.box(0.25, 0.06, 0.25, 0x334155), bar = T.box(1.1, 0.06, 0.3, 0x334155);
    const mass = T.box(0.45, 0.45, 0.45, 0x2563eb), ml = T.label('', mass, 'small');
    const nat = T.line(0x16a34a, 2, { dashed: true }), nl = T.label('panjang awal', T.group, 'small');
    let ext = 0; const st = {};
    return {
      update(dt, p) {
        const kef = p.mode === 'seri' ? p.k / 2 : p.mode === 'paralel' ? 2 * p.k : p.k, dx = p.m * g / kef;
        Object.assign(st, { kef, dx });
        ext += (Math.min(dx, 1.6) - ext) * Math.min(1, dt * 4);
        const nL = p.mode === 'seri' ? 2 : 1; let bottom;
        mid.visible = p.mode === 'seri'; bar.visible = p.mode === 'paralel'; s2.visible = p.mode !== 'tunggal';
        if (p.mode === 'seri') { const m1 = y0 - 1 - ext / 2; s1.set(V(0, y0), V(0, m1)); mid.position.set(0, m1, 0); s2.set(V(0, m1), V(0, y0 - 2 - ext)); bottom = y0 - 2 - ext; }
        else if (p.mode === 'paralel') { bottom = y0 - 1 - ext; s1.set(V(-0.4, y0), V(-0.4, bottom)); s2.set(V(0.4, y0), V(0.4, bottom)); bar.position.set(0, bottom, 0); bottom -= 0.03; }
        else { bottom = y0 - 1 - ext; s1.set(V(0, y0), V(0, bottom)); }
        mass.visible = p.m > 0; mass.position.set(0, bottom - 0.225, 0); ml.text(p.m + ' kg');
        nat.set([V(-0.9, y0 - nL), V(0.9, y0 - nL)]); nl.position.set(1.5, y0 - nL, 0);
      },
      readout(p) {
        return [['Konstanta pengganti', fx(st.kef, 1) + ' N/m'], ['Gaya F = mg', fx(p.m * g, 1) + ' N'], ['Pertambahan panjang Δx', fx(st.dx, 3) + ' m'], ['Energi pegas ½kΔx²', fx(0.5 * st.kef * st.dx * st.dx) + ' J']];
      },
    };
  },
});

sim('fluida-statis', {
  params: [{ k: 'rb', label: 'Massa jenis benda', min: 200, max: 2000, step: 50, val: 600, unit: 'kg/m³' },
    { k: 'rf', label: 'Jenis fluida', opts: [['1000', 'Air'], ['800', 'Minyak'], ['1030', 'Air laut'], ['1260', 'Gliserin']], val: '1000' }],
  cam: [0, 1.6, 6.5], target: [0, 1.2, 0],
  build(T) {
    const H = 2.4, s = 0.8, Vb = s ** 3;
    T.box(3.1, 2.9, 1.7, 0xbfdbfe, { opacity: 0.18 }).position.y = 1.45;
    T.box(3.1, 0.05, 1.7, 0x94a3b8).position.y = -0.025;
    const water = T.box(3, H, 1.6, 0x3b82f6, { opacity: 0.32 }); water.position.y = H / 2;
    const block = T.box(s, s, s, 0xd6b38a), aw = T.arrow(0xdc2626, 0.04), aa = T.arrow(0x16a34a, 0.04), lw = T.label('W'), la = T.label('F_A');
    let y = 2.6; const st = {};
    return {
      update(dt, p) {
        const rf = +p.rf, ratio = p.rb / rf;
        water.material.color.setHex({ 1000: 0x3b82f6, 800: 0xeab308, 1030: 0x0e7490, 1260: 0xa5b4fc }[p.rf]);
        block.material.color.setHex(p.rb < 1000 ? 0xd6b38a : 0x94a3b8);
        const target = ratio < 0.999 ? H + s / 2 - s * ratio : ratio <= 1.001 ? H / 2 : s / 2 + 0.01;
        y += (target - y) * Math.min(1, dt * 2.5);
        block.position.y = y;
        const sub = clamp(H - (y - s / 2), 0, s) / s, W = p.rb * g * Vb, FA = rf * g * Vb * sub;
        Object.assign(st, { W, FA, sub, ratio, rf });
        const k = 0.00018; aw.set(V(0, y, 0.45), V(0, -W * k, 0)); aa.set(V(0, y, 0.45), V(0, FA * k, 0));
        lw.position.set(0.2, y - W * k - 0.15, 0.45); la.position.set(0.25, y + FA * k + 0.15, 0.45);
      },
      readout() {
        const status = st.ratio < 0.999 ? 'Terapung' : st.ratio <= 1.001 ? 'Melayang' : 'Tenggelam';
        return [['Volume benda', fx(Vb, 3) + ' m³'], ['Berat W', fx(st.W, 0) + ' N'], ['Gaya apung F_A', fx(st.FA, 0) + ' N'], ['Bagian tercelup', fx(st.sub * 100, 0) + '%'],
          ['Keadaan', status], ['P hidrostatis di dasar', fx(st.rf * g * H, 0) + ' Pa']];
      },
    };
  },
});

sim('fluida-dinamis', {
  params: [{ k: 'v1', label: 'Kecepatan di pipa besar v₁', min: 0.5, max: 4, step: 0.1, val: 1.5, unit: 'm/s' },
    { k: 'ratio', label: 'Perbandingan luas A₁/A₂', min: 1, max: 4, step: 0.1, val: 2, unit: '', rebuild: true }],
  cam: [0, 1.6, 8.5], target: [0, 0.9, 0],
  build(T, p) {
    const r1 = 0.6, r2 = r1 / Math.sqrt(p.ratio), rad = x => x < -1 ? r1 : x > 1 ? r2 : r1 + (r2 - r1) * (x + 1) / 2;
    const prof = []; for (let i = 0; i <= 50; i++) { const x = -5 + i * 0.2; prof.push(new THREE.Vector2(rad(x), x)); }
    const pipe = T.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 40), T.mat(0x94a3b8, { opacity: 0.22, side: THREE.DoubleSide })));
    pipe.rotation.z = -Math.PI / 2;
    const parts = Array.from({ length: 150 }, () => ({ x: -5 + Math.random() * 10, a: Math.random() * Math.PI * 2, f: Math.sqrt(Math.random()) * 0.9, m: T.sphere(0.035, 0x0284c7) }));
    const tubes = [-3, 3].map(x => { T.cyl(0.09, 0.09, 3, 0xe2e8f0, { opacity: 0.3 }).position.set(x, rad(x) + 1.5, 0); const c = T.cyl(0.07, 0.07, 1, 0x0284c7); c.position.x = x; return c; });
    T.label('v₁', T.group).position.set(-3, -0.9, 0); T.label('v₂', T.group).position.set(3, -0.9, 0);
    const col = new THREE.Color();
    return {
      update(dt, q) {
        parts.forEach(o => {
          const r = rad(o.x), v = q.v1 * (r1 / r) ** 2;
          o.x += v * 0.8 * dt; if (o.x > 5) o.x = -5;
          o.m.position.set(o.x, rad(o.x) * o.f * Math.cos(o.a), rad(o.x) * o.f * Math.sin(o.a));
          o.m.material.color.copy(col.setHSL(0.58 - Math.min(v / 16, 1) * 0.58, 0.85, 0.5));
        });
        const v2 = q.v1 * p.ratio, h1 = 2.4, h2 = Math.max(0.08, h1 - (v2 * v2 - q.v1 * q.v1) / (2 * g));
        [h1, h2].forEach((h, i) => { const c = tubes[i], base = rad(c.position.x); c.scale.y = h; c.position.y = base + h / 2; });
      },
      readout(q) {
        const v2 = q.v1 * p.ratio, A1 = Math.PI * 0.05 ** 2, dP = 0.5 * 1000 * (v2 * v2 - q.v1 * q.v1);
        return [['Kecepatan v₂ = v₁·A₁/A₂', fx(v2) + ' m/s'], ['Debit Q (d₁ = 10 cm)', fx(A1 * q.v1 * 1000, 2) + ' L/s'], ['Beda tekanan P₁ − P₂', fx(dP, 0) + ' Pa'],
          ['Beda tinggi manometer', fx(dP / (1000 * g), 2) + ' m'], ['Kesimpulan', 'Pipa sempit: v besar, P kecil']];
      },
    };
  },
});

sim('suhu-kalor', {
  params: [{ k: 'm', label: 'Massa es', min: 0.1, max: 1, step: 0.05, val: 0.5, unit: 'kg', rebuild: true }, { k: 'P', label: 'Daya pemanas', min: 500, max: 3000, step: 100, val: 1500, unit: 'W' }],
  cam: [1.8, 1.6, 7], target: [1.8, 1.3, 0],
  build(T, p) {
    const m = p.m, seg = [m * 2100 * 10, m * 336000, m * 4200 * 100, m * 2260000], cum = [0]; seg.forEach(s => cum.push(cum.at(-1) + s));
    const Qt = cum[4], speed = Qt / (1500 * 24);
    const heater = T.box(1.9, 0.15, 1.9, 0x1f2937, { emissive: 0xdc2626, ei: 0.5 }); heater.position.y = 0.075;
    T.cyl(0.8, 0.72, 1.7, 0xe0f2fe, { opacity: 0.22 }).position.y = 1.0;
    const ice = T.box(0.85, 0.85, 0.85, 0xdbeafe, { opacity: 0.9, rough: 0.1 }), water = T.cyl(0.7, 0.66, 1, 0x3b82f6, { opacity: 0.55 });
    const bubbles = Array.from({ length: 30 }, () => T.sphere(0.04, 0xffffff, { opacity: 0.7 })), steam = Array.from({ length: 40 }, () => T.sphere(0.09, 0xf8fafc, { opacity: 0.45 }));
    const thermo = T.cyl(0.03, 0.03, 1, 0xdc2626); T.cyl(0.05, 0.05, 1.9, 0xffffff, { opacity: 0.4 }).position.set(-1.15, 1.1, 0);
    const pnl = T.panel({ x: 1.3, y: 0.3, w: 3.4, h: 2.4, xl: 'Q', yl: 'T (°C)' });
    const Tmap = x => (x + 10) / 120;
    T.line(0x94a3b8, 5).set([pnl.map(0, Tmap(-10)), pnl.map(cum[1] / Qt, Tmap(0)), pnl.map(cum[2] / Qt, Tmap(0)), pnl.map(cum[3] / Qt, Tmap(100)), pnl.map(1, Tmap(100))]);
    const dot = T.sphere(0.07, 0xea580c);
    let Q = 0, hold = 0; const st = {};
    const rnd = () => Math.random() - 0.5;
    [...bubbles, ...steam].forEach(b => { b.position.set(rnd(), Math.random() * 3, rnd()); b.visible = false; });
    return {
      update(dt, q) {
        heater.material.emissiveIntensity = q.P / 3000;
        if (hold > 0) { hold -= dt; if (hold <= 0) Q = 0; } else { Q = Math.min(Qt, Q + q.P * dt * speed); if (Q >= Qt) hold = 2; }
        let Tc, fase, melt = 0, vap = 0;
        if (Q < cum[1]) { Tc = -10 + 10 * Q / seg[0]; fase = 'Es dipanaskan'; }
        else if (Q < cum[2]) { Tc = 0; melt = (Q - cum[1]) / seg[1]; fase = 'Es melebur (suhu tetap)'; }
        else if (Q < cum[3]) { Tc = 100 * (Q - cum[2]) / seg[2]; melt = 1; fase = 'Air dipanaskan'; }
        else { Tc = 100; melt = 1; vap = (Q - cum[3]) / seg[3]; fase = vap >= 1 ? 'Semua menjadi uap' : 'Air mendidih (suhu tetap)'; }
        Object.assign(st, { Q, Tc, fase });
        const ci = Math.cbrt(Math.max(1 - melt, 0)); ice.visible = ci > 0.02; ice.scale.setScalar(ci); ice.position.y = 0.15 + 0.43 * ci + (melt > 0 ? melt * 0.3 : 0);
        const hw = 1.2 * melt * (1 - vap); water.visible = hw > 0.01; water.scale.y = Math.max(hw, 0.001); water.position.y = 0.15 + hw / 2;
        water.material.color.setHSL(0.6 - Tc / 100 * 0.08, 0.8, 0.55);
        bubbles.forEach(b => { b.visible = fase.startsWith('Air mendidih') && hw > 0.1; if (b.visible) { b.position.y += dt * 1.2; if (b.position.y > 0.15 + hw) b.position.set(rnd(), 0.2, rnd()); } });
        steam.forEach(s => { s.visible = vap > 0 && vap < 1; if (s.visible) { s.position.y += dt * 0.8; s.position.x += rnd() * dt; if (s.position.y > 3.4) s.position.set(rnd(), 1.4, rnd()); } });
        thermo.scale.y = Math.max(Tmap(Tc) * 1.8, 0.01); thermo.position.set(-1.15, 0.2 + thermo.scale.y / 2, 0);
        dot.position.copy(pnl.map(Q / Qt, Tmap(Tc)));
      },
      readout(q) {
        return [['Kalor diserap Q', fx(st.Q / 1000, 1) + ' kJ'], ['Waktu nyata t = Q/P', fx(st.Q / q.P, 0) + ' s'], ['Suhu', fx(st.Tc, 1) + ' °C'], ['Tahap', st.fase],
          ['Kalor total (−10 °C → uap)', fx(Qt / 1000, 0) + ' kJ']];
      },
    };
  },
});

sim('teori-kinetik', {
  params: [{ k: 'T', label: 'Suhu gas', min: 100, max: 1000, step: 10, val: 300, unit: 'K' }, { k: 'V', label: 'Volume wadah', min: 10, max: 40, step: 1, val: 22, unit: 'L' },
    { k: 'N', label: 'Jumlah partikel (tampilan)', min: 10, max: 150, step: 10, val: 60, unit: '', rebuild: true }],
  cam: [3.2, 2.4, 4.2], target: [0, 0, 0],
  build(T, p) {
    const edges = T.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({ color: 0x334155 })));
    const face = T.box(1, 1, 1, 0xbae6fd, { opacity: 0.12 });
    const vr = Tk => Math.sqrt(3 * 8.314 * Tk / 0.028);
    const rnd = () => Math.random() - 0.5;
    // kecepatan tampilan: 1 satuan/s ≈ 250 m/s
    const ps = Array.from({ length: p.N }, () => {
      const m = T.sphere(0.06, 0x2563eb); m.position.set(rnd() * 2, rnd() * 2, rnd() * 2);
      return { m, vel: V(rnd(), rnd(), rnd()).normalize().multiplyScalar(vr(p.T) / 250 * (0.6 + Math.random() * 0.8)) };
    });
    let Tp = p.T, hits = 0, rate = 0, acc = 0; const col = new THREE.Color();
    return {
      update(dt, q) {
        const L = 2.4 * Math.cbrt(q.V / 22), half = L / 2 - 0.06, f = Math.sqrt(q.T / Tp); Tp = q.T;
        edges.scale.setScalar(L); face.scale.setScalar(L);
        const vref = vr(q.T) / 250;
        ps.forEach(o => {
          o.vel.multiplyScalar(f);
          const pos = o.m.position.addScaledVector(o.vel, dt);
          ['x', 'y', 'z'].forEach(k => { if (Math.abs(pos[k]) > half) { pos[k] = Math.sign(pos[k]) * half; o.vel[k] = -Math.sign(pos[k]) * Math.abs(o.vel[k]); hits++; } });
          o.m.material.color.copy(col.setHSL(0.66 - clamp(o.vel.length() / (2 * vref) * (q.T / 1000) ** 0.5 * 1.4, 0, 1) * 0.66, 0.85, 0.5));
        });
        acc += dt; if (acc >= 1) { rate = hits / acc; hits = 0; acc = 0; }
      },
      readout(q) {
        return [['v_rms gas N₂ = √(3RT/M)', fx(vr(q.T), 0) + ' m/s'], ['Ē_k = 3/2·kT', fx(1.5 * 1.38e-23 * q.T) + ' J'], ['Tekanan (1 mol) P = nRT/V', fx(8.314 * q.T / (q.V / 1000) / 1000, 1) + ' kPa'],
          ['Tumbukan dinding (simulasi)', fx(rate, 0) + ' /s'], ['Warna partikel', 'biru lambat → merah cepat']];
      },
    };
  },
});

sim('termodinamika', {
  params: [{ k: 'proses', label: 'Jenis proses', opts: [['isobarik', 'Isobarik'], ['isokhorik', 'Isokhorik'], ['isotermal', 'Isotermal'], ['adiabatik', 'Adiabatik']], val: 'isobarik' },
    { k: 'f', label: 'Faktor perubahan (V atau T)', min: 0.5, max: 2.5, step: 0.1, val: 1.5, unit: '×' }],
  cam: [1.8, 1.8, 7.5], target: [1.8, 1.6, 0],
  build(T) {
    const T0 = 300, V0 = 0.0249, P0 = 1e5, R = 8.314;
    T.cyl(0.75, 0.75, 3, 0xe0f2fe, { opacity: 0.18 }).position.set(-1.2, 1.5, 0);
    const plate = T.box(1.8, 0.12, 1.8, 0x334155, { emissive: 0x000000 }); plate.position.set(-1.2, -0.06, 0);
    const gas = T.cyl(0.7, 0.7, 1, 0xfca5a5, { opacity: 0.35 }), piston = T.cyl(0.72, 0.72, 0.18, 0x64748b, { metal: 0.6 }), rodp = T.rod(0.05, 0x64748b);
    const parts = Array.from({ length: 40 }, () => ({ m: T.sphere(0.045, 0x1d4ed8), a: Math.random() * 6.28, r: Math.random() * 0.6, y: Math.random(), vy: Math.random() - 0.5, va: Math.random() - 0.5 }));
    const pnl = T.panel({ x: 0.6, y: 0.3, w: 3.6, h: 2.8, xl: 'V', yl: 'P' }), curve = T.line(0xea580c, 41), dot = T.sphere(0.07, 0xea580c);
    const state = (pr, f, l) => {
      const x = 1 + (f - 1) * l;
      if (pr === 'isobarik') return { V: V0 * x, T: T0 * x, P: P0 };
      if (pr === 'isokhorik') return { V: V0, T: T0 * x, P: P0 * x };
      if (pr === 'isotermal') return { V: V0 * x, T: T0, P: P0 / x };
      return { V: V0 * x, T: T0 * x ** (-2 / 3), P: P0 * x ** (-5 / 3) };
    };
    let t = 0; const st = {};
    return {
      update(dt, p) {
        t += dt; const l = (1 - Math.cos(t * 2 * Math.PI / 6)) / 2, s = state(p.proses, p.f, l);
        Object.assign(st, s);
        const h = 0.9 * s.V / V0; gas.scale.y = h; gas.position.set(-1.2, h / 2, 0); piston.position.set(-1.2, h + 0.09, 0); rodp.set(V(-1.2, h + 0.18, 0), V(-1.2, 3.2, 0));
        gas.material.color.setHSL(0.66 - clamp((s.T - 150) / 600, 0, 1) * 0.66, 0.8, 0.6);
        const sp = Math.sqrt(s.T / 300);
        parts.forEach(o => { o.a += o.va * 4 * sp * dt; o.y += o.vy * 1.5 * sp * dt; if (o.y < 0 || o.y > 1) { o.vy *= -1; o.y = clamp(o.y, 0, 1); } o.m.position.set(-1.2 + o.r * Math.cos(o.a), 0.05 + o.y * (h - 0.1), o.r * Math.sin(o.a)); });
        const pts = []; for (let i = 0; i <= 40; i++) { const c = state(p.proses, p.f, i / 40); pts.push(pnl.map(c.V / V0 / 2.6, c.P / P0 / 3.3)); }
        curve.set(pts); dot.position.copy(pnl.map(s.V / V0 / 2.6, s.P / P0 / 3.3));
        const end = state(p.proses, p.f, 1), dU = 1.5 * R * (end.T - T0);
        const W = p.proses === 'isobarik' ? P0 * (end.V - V0) : p.proses === 'isokhorik' ? 0 : p.proses === 'isotermal' ? R * T0 * Math.log(p.f) : -dU;
        Object.assign(st, { W, dU, Q: W + dU });
        plate.material.emissive.setHex(st.Q > 1 ? 0xdc2626 : st.Q < -1 ? 0x2563eb : 0); plate.material.emissiveIntensity = 0.6;
      },
      readout() {
        return [['P ; V ; T saat ini', `${fx(st.P / 1000, 1)} kPa ; ${fx(st.V * 1000, 1)} L ; ${fx(st.T, 0)} K`], ['Usaha W (total proses)', fx(st.W, 0) + ' J'],
          ['Perubahan energi dalam ΔU', fx(st.dU, 0) + ' J'], ['Kalor Q = ΔU + W', fx(st.Q, 0) + ' J'], ['Gas', '1 mol monoatomik, awal 300 K, 100 kPa']];
      },
    };
  },
});

sim('gelombang', {
  params: [{ k: 'A', label: 'Amplitudo A', min: 0.1, max: 1, step: 0.05, val: 0.5, unit: 'm' }, { k: 'f', label: 'Frekuensi f', min: 0.2, max: 2, step: 0.1, val: 0.5, unit: 'Hz' },
    { k: 'lam', label: 'Panjang gelombang λ', min: 1, max: 6, step: 0.5, val: 3, unit: 'm' }, { k: 'mode', label: 'Jenis', opts: [['berjalan', 'Berjalan'], ['stasioner', 'Stasioner']], val: 'berjalan' }],
  cam: [0, 0.5, 11], target: [0, 0, 0],
  build(T) {
    const n = 61, beads = Array.from({ length: n }, (_, i) => T.sphere(0.08, i === 30 ? 0xdc2626 : 0x2563eb)), str = T.line(0x334155, n);
    T.line(0x94a3b8, 2, { dashed: true }).set([V(-6, 0, 0), V(6, 0, 0)]);
    const walls = [-6.1, 6.1].map(x => { const w = T.box(0.1, 2.6, 0.6, 0x475569); w.position.x = x; return w; });
    const nodes = Array.from({ length: 13 }, () => T.sphere(0.06, 0xea580c));
    let t = 0;
    return {
      update(dt, p) {
        t += dt; const k = 2 * Math.PI / p.lam, w = 2 * Math.PI * p.f, pts = [];
        beads.forEach((b, i) => {
          const x = -6 + i * 0.2, xx = x + 6;
          const y = p.mode === 'berjalan' ? p.A * Math.sin(w * t - k * xx) : 2 * p.A * Math.sin(k * xx) * Math.cos(w * t);
          b.position.set(x, y, 0); pts.push(b.position);
        });
        str.set(pts); walls[1].visible = p.mode === 'stasioner';
        nodes.forEach((o, i) => { const x = i * p.lam / 2; o.visible = p.mode === 'stasioner' && x <= 12.01; o.position.set(-6 + x, 0, 0); });
      },
      readout(p) {
        const out = [['Cepat rambat v = λf', fx(p.lam * p.f) + ' m/s'], ['Periode T', fx(1 / p.f) + ' s'], ['Bilangan gelombang k', fx(2 * Math.PI / p.lam) + ' rad/m'], ['Frekuensi sudut ω', fx(2 * Math.PI * p.f) + ' rad/s']];
        if (p.mode === 'stasioner') out.push(['Jarak antarsimpul (oranye)', fx(p.lam / 2) + ' m'], ['Amplitudo perut', fx(2 * p.A) + ' m']);
        else out.push(['Titik merah', 'hanya bergetar naik-turun']);
        return out;
      },
    };
  },
});

sim('bunyi', {
  params: [{ k: 'vs', label: 'Kecepatan sumber bunyi', min: 0, max: 300, step: 10, val: 120, unit: 'm/s' }, { k: 'fs', label: 'Frekuensi sumber', min: 200, max: 1000, step: 10, val: 500, unit: 'Hz' }],
  cam: [0, 9, 7.5], target: [0, 0, 0],
  build(T) {
    const c = 1.6, unit = T.circlePts(1, 72);
    const rings = Array.from({ length: 45 }, () => { const L = T.line(0x2563eb, 72, { loop: true, opacity: 0.8 }); L.set(unit); L.visible = false; return { L, x: 0, t0: 0 }; });
    const src = T.sphere(0.18, 0xea580c);
    [[7.3, 'Pendengar depan'], [-7.3, 'Pendengar belakang']].forEach(([x, t]) => { T.cyl(0.15, 0.15, 0.6, 0x16a34a).position.set(x, 0.3, 0); T.sphere(0.15, 0x16a34a).position.set(x, 0.75, 0); T.label(t, T.group, 'small').position.set(x, 1.2, 0); });
    let t = 0, x = -6, next = 0, ri = 0;
    return {
      update(dt, p) {
        t += dt; x += p.vs / 340 * c * dt; if (x > 6) x = -6;
        src.position.set(x, 0.18, 0);
        if (t >= next) { const r = rings[ri++ % rings.length]; r.x = x; r.t0 = t; r.L.visible = true; next = t + 0.3; }
        rings.forEach(r => { if (!r.L.visible) return; const R = c * (t - r.t0); if (R > 14) r.L.visible = false; r.L.scale.set(R, 1, R); r.L.position.set(r.x, 0.05, 0); r.L.material.opacity = Math.max(0.15, 1 - R / 14); });
      },
      readout(p) {
        const v = 340;
        return [['Frekuensi didengar (depan)', fx(p.fs * v / (v - p.vs), 1) + ' Hz'], ['Frekuensi didengar (belakang)', fx(p.fs * v / (v + p.vs), 1) + ' Hz'],
          ['λ di depan sumber', fx((v - p.vs) / p.fs, 3) + ' m'], ['λ di belakang sumber', fx((v + p.vs) / p.fs, 3) + ' m'], ['Bilangan Mach v_s/v', fx(p.vs / v)]];
      },
    };
  },
});

sim('cahaya', {
  params: [{ k: 'lam', label: 'Panjang gelombang λ', min: 380, max: 750, step: 5, val: 600, unit: 'nm' }, { k: 'd', label: 'Jarak antarcelah d', min: 0.1, max: 1, step: 0.05, val: 0.3, unit: 'mm' },
    { k: 'L', label: 'Jarak celah ke layar L', min: 0.5, max: 3, step: 0.1, val: 1, unit: 'm' }],
  cam: [-1.5, 2.2, 7], target: [0.2, 0, 0],
  build(T) {
    const src = T.box(0.5, 0.5, 0.5, 0xffffff, { emissive: 0xffffff, ei: 0.8 }); src.position.x = -4.6;
    const beam = T.box(2.4, 0.4, 0.4, 0xffffff, { opacity: 0.25, emissive: 0xffffff, ei: 0.6 }); beam.position.x = -3.2;
    const gap = 0.07; const barrier = [];
    for (let i = 0; i < 3; i++) barrier.push(T.box(0.08, 1, 2, 0x334155));
    const cv = document.createElement('canvas'); cv.width = 8; cv.height = 512;
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const screen = T.add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2), new THREE.MeshBasicMaterial({ map: tex })));
    screen.rotation.y = -Math.PI / 2;
    T.box(0.05, 3.3, 2.5, 0x1f2937).position.y = 0;
    const back = T.group.children.at(-1);
    const rays = Array.from({ length: 10 }, () => T.line(0xffffff, 2, { dashed: true, opacity: 0.7 }));
    let key = '';
    return {
      update(dt, p) {
        const col = wl2rgb(p.lam), sx = -2 + p.L * 2, sep = 0.15 + p.d * 0.5;
        src.material.color.setHex(col); src.material.emissive.setHex(col); beam.material.color.setHex(col); beam.material.emissive.setHex(col);
        const ys = [[-1.6, -sep / 2 - gap], [-sep / 2 + gap, sep / 2 - gap], [sep / 2 + gap, 1.6]];
        barrier.forEach((b, i) => { const [a, c] = ys[i]; b.scale.y = c - a; b.position.set(-2, (a + c) / 2, 0); });
        screen.position.x = sx - 0.03; back.position.x = sx;
        const k = `${p.lam}|${p.d}|${p.L}`;
        const dy = p.lam * 1e-6 * p.L / (p.d * 1e-3) * 1e3 / 1000; // mm
        if (k !== key) {
          key = k; const ctx = cv.getContext('2d'), c = new THREE.Color(col);
          for (let j = 0; j < 512; j++) {
            const y = (0.5 - j / 511) * 20, ph = Math.PI * y / dy, env = y === 0 ? 1 : (Math.sin(ph / 5) / (ph / 5)) ** 2;
            const I = Math.cos(ph) ** 2 * env;
            ctx.fillStyle = `rgb(${c.r * 255 * I | 0},${c.g * 255 * I | 0},${c.b * 255 * I | 0})`; ctx.fillRect(0, j, 8, 1);
          }
          tex.needsUpdate = true;
          rays.forEach((r, i) => { const n = (i >> 1) - 2, ym = n * dy / 20 * 3.2, slit = i % 2 ? sep / 2 : -sep / 2; r.visible = Math.abs(ym) < 1.6; r.set([V(-2, slit, 0), V(sx, ym, 0)]); r.material.color.setHex(col); });
        }
      },
      readout(p) {
        const dy = p.lam * 1e-9 * p.L / (p.d * 1e-3) * 1e3;
        return [['Jarak antarterang Δy = λL/d', fx(dy, 3) + ' mm'], ['Terang ke-1 dari pusat', fx(dy, 3) + ' mm'], ['Terang ke-2 dari pusat', fx(2 * dy, 3) + ' mm'],
          ['Garis terang di layar ±10 mm', fx(2 * Math.floor(10 / dy) + 1, 0) + ' garis'], ['Warna cahaya', p.lam < 450 ? 'ungu' : p.lam < 495 ? 'biru' : p.lam < 570 ? 'hijau' : p.lam < 590 ? 'kuning' : p.lam < 620 ? 'jingga' : 'merah']];
      },
    };
  },
});

sim('optik', {
  params: [{ k: 'jenis', label: 'Jenis lensa', opts: [['cembung', 'Cembung'], ['cekung', 'Cekung']], val: 'cembung' }, { k: 'f', label: 'Jarak fokus |f|', min: 5, max: 20, step: 1, val: 10, unit: 'cm' },
    { k: 's', label: 'Jarak benda s', min: 3, max: 40, step: 1, val: 15, unit: 'cm' }, { k: 'h', label: 'Tinggi benda h', min: 1, max: 4, step: 0.5, val: 2, unit: 'cm' }],
  cam: [0.6, 0.2, 10.5], target: [0.6, 0, 0],
  build(T) {
    const sx = 0.12, sy = 0.35, X = cm => cm * sx, Y = cm => cm * sy, xMax = 7 / sx;
    T.line(0x334155, 2).set([V(-6, 0, 0), V(7, 0, 0)]);
    const lens = T.sphere(1, 0x93c5fd, { opacity: 0.35 }); lens.scale.set(0.15, 1.6, 0.8);
    T.rod(0.015, 0x1d4ed8).set(V(0, -1.6, 0), V(0, 1.6, 0));
    const tips = [T.cyl(0, 0.09, 0.2, 0x1d4ed8), T.cyl(0, 0.09, 0.2, 0x1d4ed8)];
    const fm = [-1, 1, -2, 2].map(k => { const s = T.sphere(0.05, 0x7c3aed); const l = T.label(Math.abs(k) === 2 ? '2F' : 'F', T.group, 'small'); return { k, s, l }; });
    const obj = T.arrow(0x16a34a, 0.04), img = T.arrow(0xea580c, 0.04);
    const r1a = T.rod(0.012, 0xf59e0b), r1b = T.rod(0.012, 0xf59e0b), r2 = T.rod(0.012, 0xdc2626);
    const e1 = T.line(0xf59e0b, 2, { dashed: true }), e2 = T.line(0xdc2626, 2, { dashed: true });
    const li = T.label('bayangan', T.group, 'small'); let st = {};
    return {
      update(dt, p) {
        const fe = p.jenis === 'cembung' ? p.f : -p.f, inf = Math.abs(p.s - fe) < 1e-6, sp = inf ? Infinity : 1 / (1 / fe - 1 / p.s), hp = -p.h * sp / p.s;
        st = { sp, hp, fe, inf };
        lens.visible = p.jenis === 'cembung';
        tips.forEach((t, i) => { const up = i === 0; t.position.set(0, up ? 1.6 : -1.6, 0); t.rotation.z = (p.jenis === 'cembung') === up ? 0 : Math.PI; });
        fm.forEach(({ k, s, l }) => { s.position.set(X(k * p.f), 0, 0); l.position.set(X(k * p.f), -0.3, 0); });
        const O = V(X(-p.s), Y(p.h), 0), P1 = V(0, Y(p.h), 0);
        obj.set(V(X(-p.s), 0, 0), V(0, Y(p.h), 0));
        r1a.set(O, P1);
        const d1 = fe > 0 ? V(X(fe), -Y(p.h), 0) : V(X(-fe), Y(p.h), 0);
        r1b.set(P1, P1.clone().addScaledVector(d1, (7 - 0) / d1.x));
        const d2 = V(X(p.s), -Y(p.h), 0); r2.set(O, O.clone().addScaledVector(d2, (7 - O.x) / d2.x));
        const show = !inf && Math.abs(sp) < xMax * 1.2;
        img.visible = show; li.visible = show;
        if (show) { img.set(V(X(sp), 0, 0), V(0, Y(hp), 0)); img.color(sp > 0 ? 0xea580c : 0xfdba74); li.position.set(X(sp), Y(hp) + (hp > 0 ? 0.3 : -0.3), 0); }
        e1.visible = e2.visible = show && sp < 0;
        if (sp < 0) { const I = V(X(sp), Y(hp), 0); e1.set([P1, I]); e2.set([V(0, 0, 0), I]); }
      },
      readout(p) {
        if (st.inf) return [['Bayangan', 'Di tak hingga (benda tepat di titik fokus)']];
        const M = Math.abs(st.sp / p.s), nyata = st.sp > 0;
        return [['Jarak bayangan s′', fx(st.sp, 1) + ' cm'], ['Perbesaran M', fx(M) + ' ×'], ['Tinggi bayangan', fx(Math.abs(st.hp), 2) + ' cm'],
          ['Sifat', `${nyata ? 'Nyata, terbalik' : 'Maya, tegak'}, ${M > 1.001 ? 'diperbesar' : M < 0.999 ? 'diperkecil' : 'sama besar'}`], ['Kekuatan lensa P = 100/f', fx(100 / st.fe, 1) + ' dioptri']];
      },
    };
  },
});

/* ======================= KELAS XII ======================= */
sim('listrik-statis', {
  params: [{ k: 'q1', label: 'Muatan q₁', min: -5, max: 5, step: 0.5, val: 3, unit: 'μC' }, { k: 'q2', label: 'Muatan q₂', min: -5, max: 5, step: 0.5, val: -3, unit: 'μC' },
    { k: 'r', label: 'Jarak r', min: 0.1, max: 1, step: 0.05, val: 0.5, unit: 'm' }],
  cam: [0, 0, 9], target: [0, 0, 0],
  build(T) {
    const c1 = T.sphere(1, 0xef4444), c2 = T.sphere(1, 0x3b82f6), l1 = T.label('', c1), l2 = T.label('', c2);
    const f1 = T.arrow(0x7c3aed, 0.05), f2 = T.arrow(0x7c3aed, 0.05);
    const field = [];
    for (let x = -5.2; x <= 5.21; x += 0.8) for (let y = -2.4; y <= 2.41; y += 0.8) field.push({ p: V(x, y, 0), a: T.arrow(0x64748b, 0.014, { opacity: 0.8 }) });
    const col = q => q > 0 ? 0xef4444 : q < 0 ? 0x3b82f6 : 0x94a3b8;
    return {
      update(dt, p) {
        const D = p.r * 6, P1 = V(-D / 2, 0, 0), P2 = V(D / 2, 0, 0);
        [[c1, l1, p.q1, P1], [c2, l2, p.q2, P2]].forEach(([c, l, q, P]) => { c.position.copy(P); c.scale.setScalar(0.15 + 0.04 * Math.abs(q)); c.material.color.setHex(col(q)); l.text(`${q > 0 ? '+' : ''}${fx(q, 1)} μC`); l.position.y = 0.4 + 0.04 * Math.abs(q); });
        const F = 9e9 * Math.abs(p.q1 * p.q2) * 1e-12 / (p.r * p.r), len = F === 0 ? 0 : Math.min(2, 0.3 + 0.35 * Math.log10(1 + F * 10)), rep = p.q1 * p.q2 > 0;
        f1.set(P1, V(rep ? -len : len, 0, 0)); f2.set(P2, V(rep ? len : -len, 0, 0));
        field.forEach(({ p: q, a }) => {
          const E = V();
          [[P1, p.q1], [P2, p.q2]].forEach(([P, qq]) => { const d = q.clone().sub(P), r2 = Math.max(d.lengthSq(), 0.01); E.addScaledVector(d.normalize(), qq / r2); });
          const near = q.distanceTo(P1) < 0.45 || q.distanceTo(P2) < 0.45, m = E.length();
          a.visible = !near && m > 1e-4; if (a.visible) a.set(q.clone().addScaledVector(E, -0.17 / m), E.multiplyScalar(0.34 / m));
        });
      },
      readout(p) {
        const F = 9e9 * Math.abs(p.q1 * p.q2) * 1e-12 / (p.r * p.r), d = p.r / 2;
        const Em = 9e9 * (p.q1 - p.q2) * 1e-6 / (d * d), Vm = 9e9 * (p.q1 + p.q2) * 1e-6 / d;
        return [['Gaya Coulomb F', fx(F, 3) + ' N'], ['Jenis gaya', p.q1 * p.q2 > 0 ? 'Tolak-menolak' : p.q1 * p.q2 < 0 ? 'Tarik-menarik' : 'Tidak ada gaya'],
          ['Medan listrik di titik tengah', fx(Math.abs(Em), 2) + ' N/C'], ['Potensial di titik tengah', fx(Vm, 2) + ' V'], ['Panah abu-abu', 'arah medan listrik E']];
      },
    };
  },
});

sim('listrik-dc', {
  params: [{ k: 'eps', label: 'GGL baterai ε', min: 1, max: 24, step: 1, val: 12, unit: 'V' }, { k: 'R1', label: 'Hambatan R₁', min: 1, max: 50, step: 1, val: 10, unit: 'Ω' },
    { k: 'R2', label: 'Hambatan R₂', min: 1, max: 50, step: 1, val: 20, unit: 'Ω' }, { k: 'mode', label: 'Susunan', opts: [['seri', 'Seri'], ['paralel', 'Paralel']], val: 'seri' }],
  cam: [0, 0.3, 8], target: [0, 0, 0],
  build(T) {
    const r = 0.5, A = V(-3, -1.5), B = V(-3, 1.5), C = V(3, 1.5), D = V(3, -1.5), M1 = V(0, 1.5), M0 = V(0, -1.5);
    const wire = (a, b, gr) => T.rod(0.03, 0xb45309, { metal: 0.6 }, gr).set(a, b);
    const res = (pos, vert, gr, name) => { const b = T.box(0.9, 0.3, 0.3, 0xfbbf24, {}, gr); b.position.copy(pos); if (vert) b.rotation.z = Math.PI / 2; return T.label(name, gr, 'small'); };
    const G1 = T.add(new THREE.Group()), G2 = T.add(new THREE.Group());
    [[A, B], [B, C], [C, D], [D, A]].forEach(([a, b]) => wire(a, b, G1));
    [[A, B], [B, C], [C, D], [D, A], [M1, M0]].forEach(([a, b]) => wire(a, b, G2));
    const L1s = res(V(-1, 1.5), false, G1, ''), L2s = res(V(1, 1.5), false, G1, ''), L1p = res(V(0, 0), true, G2, ''), L2p = res(V(3, 0), true, G2, '');
    L1s.position.set(-1, 2.0, 0); L2s.position.set(1, 2.0, 0); L1p.position.set(0.85, 0, 0); L2p.position.set(3.85, 0, 0);
    T.box(0.5, 0.4, 0.3, 0xffffff).position.set(-3, 0, 0);
    T.box(0.7, 0.06, 0.32, 0xdc2626).position.set(-3, 0.1, 0); T.box(0.4, 0.06, 0.32, 0x1f2937).position.set(-3, -0.1, 0);
    const lb = T.label('', T.group, 'small'); lb.position.set(-3.9, 0, 0);
    const paths = { s: [A, D, C, B, A], p1: [A, M0, M1, B, A], p2: [A, D, C, B, A] };
    const plen = pts => pts.slice(1).reduce((s, q, i) => s + q.distanceTo(pts[i]), 0);
    const at = (pts, u) => { let d = u * plen(pts); for (let i = 1; i < pts.length; i++) { const L = pts[i].distanceTo(pts[i - 1]); if (d <= L) return V().lerpVectors(pts[i - 1], pts[i], d / L); d -= L; } return pts[0].clone(); };
    const els = Array.from({ length: 36 }, (_, i) => ({ m: T.sphere(0.06, 0x38bdf8, { emissive: 0x0ea5e9, ei: 0.5 }), u: (i % 18) / 18, k: i < 18 ? 0 : 1 }));
    const st = {};
    return {
      update(dt, p) {
        G1.visible = p.mode === 'seri'; G2.visible = !G1.visible;
        let I, I1, I2, Rt;
        if (p.mode === 'seri') { Rt = p.R1 + p.R2; I = p.eps / (Rt + r); I1 = I2 = I; }
        else { Rt = p.R1 * p.R2 / (p.R1 + p.R2); I = p.eps / (Rt + r); const Vp = I * Rt; I1 = Vp / p.R1; I2 = Vp / p.R2; }
        Object.assign(st, { I, I1, I2, Rt, V1: I1 * p.R1, V2: I2 * p.R2 });
        lb.text(`ε = ${p.eps} V`);
        const lbls = p.mode === 'seri' ? [L1s, L2s] : [L1p, L2p];
        lbls[0].text(`R₁ ${p.R1} Ω · ${fx(I1)} A`); lbls[1].text(`R₂ ${p.R2} Ω · ${fx(I2)} A`);
        els.forEach(e => {
          const path = p.mode === 'seri' ? paths.s : e.k ? paths.p2 : paths.p1, Ii = p.mode === 'seri' ? I : e.k ? I2 : I1;
          e.m.visible = p.mode === 'paralel' || e.k === 0;
          e.u = (e.u + Ii * 0.25 * dt / plen(path) * 6) % 1; e.m.position.copy(at(path, e.u)).add(V(0, 0, 0.12));
        });
      },
      readout(p) {
        return [['Hambatan pengganti', fx(st.Rt, 2) + ' Ω'], ['Arus total I = ε/(R + r)', fx(st.I, 3) + ' A'], ['Tegangan jepit', fx(p.eps - st.I * 0.5, 2) + ' V'],
          ['V₁ ; V₂', `${fx(st.V1, 2)} ; ${fx(st.V2, 2)} V`], ['Daya total pada R', fx(st.V1 * st.I1 + st.V2 * st.I2, 2) + ' W'], ['Hambatan dalam r', '0,5 Ω']];
      },
    };
  },
});

sim('magnet', {
  params: [{ k: 'I', label: 'Kuat arus I', min: 1, max: 20, step: 1, val: 10, unit: 'A' }, { k: 'arah', label: 'Arah arus', opts: [['atas', 'Ke atas'], ['bawah', 'Ke bawah']], val: 'atas' },
    { k: 'a', label: 'Jarak kompas a', min: 0.02, max: 0.2, step: 0.01, val: 0.05, unit: 'm' }],
  cam: [3.5, 3.5, 5.5], target: [0, 0, 0],
  build(T) {
    T.cyl(0.05, 0.05, 5, 0xb45309, { metal: 0.6 });
    const flow = Array.from({ length: 6 }, (_, i) => ({ m: T.cyl(0, 0.1, 0.25, 0xfacc15), y: -2.4 + i * 0.8 }));
    const arrows = [];
    [-1.4, 0, 1.4].forEach(y => [0.6, 1.2, 1.8].forEach(r => {
      const L = T.line(0x2563eb, 64, { loop: true, opacity: 0.6 }); L.set(T.circlePts(r)); L.position.y = y;
      for (let k = 0; k < 4; k++) arrows.push({ m: T.cyl(0, 0.07, 0.18, 0x2563eb), r, y, a: k * Math.PI / 2 });
    }));
    const comp = T.add(new THREE.Group());
    T.cyl(0.32, 0.32, 0.05, 0xf8fafc, {}, comp);
    const needle = T.add(new THREE.Group(), comp); needle.position.y = 0.05;
    const nN = T.cyl(0, 0.06, 0.28, 0xdc2626, {}, needle); nN.rotation.z = -Math.PI / 2; nN.position.x = 0.14;
    const nS = T.cyl(0, 0.06, 0.28, 0xe2e8f0, {}, needle); nS.rotation.z = Math.PI / 2; nS.position.x = -0.14;
    const lc = T.label('kompas', comp, 'small'); lc.position.y = 0.35;
    return {
      update(dt, p) {
        const s = p.arah === 'atas' ? 1 : -1, sp = 0.15 * p.I;
        flow.forEach(f => { f.y += s * sp * dt * 2; if (f.y > 2.4) f.y = -2.4; if (f.y < -2.4) f.y = 2.4; f.m.position.y = f.y; f.m.rotation.z = s > 0 ? 0 : Math.PI; });
        arrows.forEach(o => {
          o.a += s * sp / o.r * dt; const pos = V(o.r * Math.cos(o.a), o.y, -o.r * Math.sin(o.a)), tan = V(-Math.sin(o.a), 0, -Math.cos(o.a)).multiplyScalar(s);
          o.m.position.copy(pos); o.m.quaternion.setFromUnitVectors(UP, tan);
        });
        const x = clamp(p.a * 15, 0.35, 3); comp.position.set(x, -2.3, 0);
        needle.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2;
      },
      readout(p) {
        const B = 2e-7 * p.I / p.a;
        return [['Induksi magnetik B = μ₀I/(2πa)', fx(B) + ' T'], ['B pada jarak 2a', fx(B / 2) + ' T'], ['Arah medan (dilihat dari atas)', p.arah === 'atas' ? 'Berlawanan arah jarum jam' : 'Searah jarum jam'],
          ['Kaidah tangan kanan', 'ibu jari = arus, jari = medan']];
      },
    };
  },
});

sim('induksi', {
  params: [{ k: 'v', label: 'Kecepatan maksimum magnet', min: 0.5, max: 4, step: 0.1, val: 2, unit: 'm/s' }, { k: 'N', label: 'Jumlah lilitan N', min: 50, max: 500, step: 10, val: 200, unit: '' },
    { k: 'B', label: 'Kuat magnet B', min: 0.1, max: 1, step: 0.05, val: 0.5, unit: 'T' }],
  cam: [0.8, 0.8, 7.5], target: [0.8, 0.2, 0],
  build(T) {
    const pts = []; for (let i = 0; i <= 400; i++) { const t = i / 400; pts.push(V(-0.8 + 1.6 * t, 0.6 * Math.cos(t * 16 * Math.PI), 0.6 * Math.sin(t * 16 * Math.PI))); }
    T.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 800, 0.03, 6), T.mat(0xb45309, { metal: 0.6 })));
    const mag = T.add(new THREE.Group());
    T.box(0.6, 0.32, 0.32, 0xdc2626, {}, mag).position.x = 0.3; T.box(0.6, 0.32, 0.32, 0x2563eb, {}, mag).position.x = -0.3;
    T.label('U', mag, 'small').position.set(0.45, 0.3, 0); T.label('S', mag, 'small').position.set(-0.45, 0.3, 0);
    T.box(1.2, 0.8, 0.15, 0xf8fafc).position.set(-1.2, -1.9, 0);
    const needle = T.rod(0.02, 0xdc2626); const piv = V(-1.2, -2.2, 0.1);
    T.label('galvanometer', T.group, 'small').position.set(-1.2, -2.45, 0);
    T.rod(0.02, 0xb45309).set(V(-0.8, -0.6, 0), V(-1.2, -1.5, 0)); T.rod(0.02, 0xb45309).set(V(0.8, -0.6, 0), V(0.6, -1.9, 0));
    const lamp = T.sphere(0.25, 0xfef9c3, { emissive: 0xfacc15, ei: 0 }); lamp.position.set(0.6, -2.1, 0);
    const pnl = T.panel({ x: 1.6, y: -0.2, w: 3.2, h: 2, xl: 't', yl: 'ε' }), tr = T.trace(pnl, 0x7c3aed, 180, -1, 1);
    const A = Math.PI * 0.05 ** 2;
    let t = 0; const st = {};
    return {
      update(dt, p) {
        t += dt; const amp = 3, w = p.v / amp, x = amp * Math.sin(w * t), vx = p.v * Math.cos(w * t);
        mag.position.x = x;
        const phi = p.B * A * Math.exp(-x * x), eps = p.N * p.B * A * 2 * x * Math.exp(-x * x) * vx;
        const emax = p.N * p.B * A * 0.858 * 4;
        Object.assign(st, { phi, eps });
        const ang = clamp(eps / emax, -1, 1) * 1.1;
        needle.set(piv, piv.clone().add(V(Math.sin(ang) * 0.5, Math.cos(ang) * 0.5, 0)));
        lamp.material.emissiveIntensity = clamp(Math.abs(eps) / emax * 3, 0, 1.5);
        tr.push(clamp(eps / emax, -1, 1));
      },
      readout(p) {
        return [['GGL induksi ε saat ini', fx(st.eps, 3) + ' V'], ['Fluks Φ di kumparan', fx(st.phi) + ' Wb'], ['ε maksimum (perkiraan model)', fx(p.N * p.B * Math.PI * 0.05 ** 2 * 0.858 * p.v, 3) + ' V'],
          ['Arah arus', st.eps > 0 ? 'positif (jarum ke kanan)' : st.eps < 0 ? 'negatif (jarum ke kiri)' : 'nol'], ['Ingat', 'tanpa gerak relatif, ε = 0']];
      },
    };
  },
});

sim('ac', {
  params: [{ k: 'f', label: 'Frekuensi putaran f', min: 0.2, max: 2, step: 0.1, val: 0.5, unit: 'Hz' }, { k: 'N', label: 'Jumlah lilitan N', min: 10, max: 200, step: 10, val: 100, unit: '' },
    { k: 'B', label: 'Medan magnet B', min: 0.1, max: 1, step: 0.05, val: 0.5, unit: 'T' }],
  cam: [0, 1.4, 8], target: [0, 1, 0],
  build(T) {
    const A = 0.04;
    T.box(0.8, 2, 1.4, 0xdc2626).position.set(-2.3, 0, 0); T.box(0.8, 2, 1.4, 0x2563eb).position.set(2.3, 0, 0);
    T.label('U', T.group).position.set(-2.3, 1.2, 0); T.label('S', T.group).position.set(2.3, 1.2, 0);
    [-0.6, 0, 0.6].forEach(y => T.line(0x94a3b8, 2, { dashed: true }).set([V(-1.9, y, 0.5), V(1.9, y, 0.5)]));
    const coil = T.add(new THREE.Group());
    const c = [V(0, 0.75, 1), V(0, 0.75, -1), V(0, -0.75, -1), V(0, -0.75, 1)];
    c.forEach((a, i) => T.rod(0.04, 0xb45309, { metal: 0.6 }, coil).set(a, c[(i + 1) % 4]));
    T.rod(0.025, 0x64748b).set(V(0, -1.4, 0), V(0, 1.4, 0));
    const lamp = T.sphere(0.2, 0xfef9c3, { emissive: 0xfacc15, ei: 0 }); lamp.position.set(0, -1.7, 0);
    const pnl = T.panel({ x: -2.2, y: 1.9, w: 4.4, h: 1.4, xl: 't', yl: 'ε' }), tr = T.trace(pnl, 0x7c3aed, 220, -1, 1);
    let t = 0; const st = {};
    return {
      update(dt, p) {
        t += dt; const w = 2 * Math.PI * p.f, emax = p.N * p.B * A * w, e = emax * Math.sin(w * t);
        coil.rotation.y = w * t; Object.assign(st, { w, emax, e });
        lamp.material.emissiveIntensity = Math.abs(Math.sin(w * t)) * clamp(emax / 5, 0.2, 1.5);
        tr.push(Math.sin(w * t));
      },
      readout() {
        return [['Kecepatan sudut ω = 2πf', fx(st.w) + ' rad/s'], ['ε maks = NBAω (A = 0,04 m²)', fx(st.emax, 2) + ' V'], ['ε efektif = ε_maks/√2', fx(st.emax / Math.SQRT2, 2) + ' V'],
          ['ε saat ini', fx(st.e, 2) + ' V'], ['Catatan', 'PLN: 220 V efektif, 50 Hz']];
      },
    };
  },
});

const GEM = {
  radio: ['Gelombang radio', 3, 3.2, 0x64748b, 'radio, televisi, komunikasi'], mikro: ['Gelombang mikro', 0.12, 2.6, 0x0ea5e9, 'radar, oven microwave, Wi-Fi'],
  inframerah: ['Inframerah', 10e-6, 2, 0xb91c1c, 'remote TV, kamera termal'], tampak: ['Cahaya tampak', 550e-9, 1.5, 0x22c55e, 'penglihatan, serat optik'],
  ultraviolet: ['Ultraviolet', 250e-9, 1.1, 0x7c3aed, 'sterilisasi, pembentukan vitamin D'], sinarx: ['Sinar-X', 0.1e-9, 0.75, 0x0284c7, 'foto rontgen, pemeriksaan bagasi'],
  gamma: ['Sinar gamma', 1e-12, 0.5, 0x16a34a, 'terapi kanker, sterilisasi alat medis'],
};
sim('gem', {
  params: [{ k: 'jenis', label: 'Spektrum', opts: Object.entries(GEM).map(([k, v]) => [k, v[0]]), val: 'tampak' }],
  cam: [4.5, 2.6, 7.5], target: [0, 0, 0],
  build(T) {
    const n = 240, E = T.line(0xdc2626, n), B = T.line(0x2563eb, n), sE = T.segments(0xdc2626, 60, { opacity: 0.5 }), sB = T.segments(0x2563eb, 60, { opacity: 0.5 });
    const axis = T.arrow(0x334155, 0.03); axis.set(V(-6, 0, 0), V(12.5, 0, 0));
    T.label('E', T.group, 'accent').position.set(-6, 1.3, 0); T.label('B', T.group).position.set(-6, 0, 1.3); T.label('c', T.group).position.set(6.8, 0.3, 0);
    let t = 0;
    return {
      update(dt, p) {
        t += dt; const lam = GEM[p.jenis][2], k = 2 * Math.PI / lam, ph = t * 2 * Math.PI * 0.6;
        const pe = [], pb = [], se = [], sb = [];
        for (let i = 0; i < n; i++) { const x = -6 + 12 * i / (n - 1), s = Math.sin(k * (x + 6) - ph); pe.push(V(x, s, 0)); pb.push(V(x, 0, s)); }
        for (let i = 0; i < 60; i++) { const x = -6 + 12 * i / 59, s = Math.sin(k * (x + 6) - ph); se.push([V(x, 0, 0), V(x, s, 0)]); sb.push([V(x, 0, 0), V(x, 0, s)]); }
        E.set(pe); B.set(pb); sE.set(se); sB.set(sb);
      },
      readout(p) {
        const [nama, lam, , , guna] = GEM[p.jenis], f = 3e8 / lam;
        return [['Jenis', nama], ['Contoh panjang gelombang', fx(lam) + ' m'], ['Frekuensi f = c/λ', fx(f) + ' Hz'], ['Energi foton E = hf', fx(6.63e-34 * f / 1.6e-19) + ' eV'], ['Pemanfaatan', guna]];
      },
    };
  },
});

sim('kuantum', {
  params: [{ k: 'lam', label: 'Panjang gelombang cahaya', min: 100, max: 700, step: 10, val: 400, unit: 'nm' }, { k: 'I', label: 'Intensitas cahaya', min: 1, max: 10, step: 1, val: 5, unit: '' },
    { k: 'W', label: 'Logam katode', opts: [['2.14', 'Sesium (2,14 eV)'], ['2.28', 'Natrium (2,28 eV)'], ['4.3', 'Seng (4,3 eV)'], ['4.7', 'Tembaga (4,7 eV)']], val: '2.28' }],
  cam: [0, 1.4, 7.5], target: [0, 0.6, 0],
  build(T) {
    const tube = T.cyl(1.3, 1.3, 6.2, 0xe0f2fe, { opacity: 0.15 }); tube.rotation.z = Math.PI / 2;
    T.box(0.12, 1.9, 1.4, 0x94a3b8, { metal: 0.8, rough: 0.3 }).position.x = -2.6; T.box(0.12, 1.9, 1.4, 0x475569, { metal: 0.6 }).position.x = 2.6;
    T.label('katode', T.group, 'small').position.set(-2.6, -1.2, 0); T.label('anode', T.group, 'small').position.set(2.6, -1.2, 0);
    const lamp = T.sphere(0.28, 0xffffff, { emissive: 0xffffff, ei: 1 }); lamp.position.set(-0.6, 2.7, 0);
    const ph = Array.from({ length: 90 }, () => ({ m: T.sphere(0.06, 0xffffff, { emissive: 0xffffff, ei: 1 }), on: false, from: V(), to: V(), t: 0 }));
    const el = Array.from({ length: 90 }, () => ({ m: T.sphere(0.05, 0x1d4ed8), on: false, v: 0 }));
    ph.forEach(o => { o.m.visible = false; }); el.forEach(o => { o.m.visible = false; });
    let acc = 0, emitted = 0, rate = 0, timer = 0;
    return {
      update(dt, p) {
        const col = wl2rgb(p.lam), E = 1240 / p.lam, W = +p.W;
        lamp.material.color.setHex(col); lamp.material.emissive.setHex(col);
        acc += p.I * 5 * dt;
        while (acc >= 1) { acc--; const o = ph.find(q => !q.on); if (!o) break; o.on = true; o.t = 0; o.from.copy(lamp.position); o.to.set(-2.53, -0.8 + Math.random() * 1.6, -0.6 + Math.random() * 1.2); o.m.material.color.setHex(col); o.m.material.emissive.setHex(col); o.m.visible = true; }
        ph.forEach(o => {
          if (!o.on) return; o.t += dt * 1.6; o.m.position.lerpVectors(o.from, o.to, Math.min(o.t, 1));
          if (o.t >= 1) {
            o.on = false; o.m.visible = false;
            if (E > W) { const e = el.find(q => !q.on); if (e) { e.on = true; e.v = 0.6 + 2.2 * Math.sqrt((E - W) / 3); e.m.position.copy(o.to).add(V(0.1, 0, 0)); e.m.visible = true; emitted++; } }
          }
        });
        el.forEach(e => { if (!e.on) return; e.m.position.x += e.v * dt; if (e.m.position.x > 2.5) { e.on = false; e.m.visible = false; } });
        timer += dt; if (timer >= 1) { rate = emitted / timer; emitted = 0; timer = 0; }
      },
      readout(p) {
        const E = 1240 / p.lam, W = +p.W, ok = E > W;
        return [['Energi foton E = hc/λ', fx(E) + ' eV'], ['Fungsi kerja W₀', fx(W) + ' eV'], ['E_k maks = E − W₀', ok ? fx(E - W) + ' eV' : 'Elektron tidak lepas'],
          ['λ ambang = hc/W₀', fx(1240 / W, 0) + ' nm'], ['Elektron lepas (simulasi)', fx(rate, 0) + ' /s']];
      },
    };
  },
});

sim('relativitas', {
  params: [{ k: 'v', label: 'Kecepatan pesawat', min: 0, max: 0.99, step: 0.01, val: 0.6, unit: 'c' }],
  cam: [0, 0.6, 9.5], target: [0, 0.4, 0],
  build(T) {
    const ship = (c) => {
      const gr = T.add(new THREE.Group());
      const b = T.cyl(0.28, 0.28, 2.4, c, {}, gr); b.rotation.z = Math.PI / 2;
      const n = T.cyl(0, 0.28, 0.6, c, {}, gr); n.rotation.z = -Math.PI / 2; n.position.x = 1.5;
      [0.35, -0.35].forEach(y => T.box(0.5, 0.25, 0.05, 0x334155, {}, gr).position.set(-1, y, 0));
      return gr;
    };
    const clock = () => { const gr = T.add(new THREE.Group()); const f = T.cyl(0.38, 0.38, 0.05, 0xffffff, {}, gr); f.rotation.x = Math.PI / 2; const hand = T.rod(0.025, 0xdc2626, {}, gr); hand.set(V(0, 0, 0.04), V(0, 0.32, 0.04)); return { gr, hand, l: T.label('', gr, 'small') }; };
    const s0 = ship(0x94a3b8), s1 = ship(0x2563eb), k0 = clock(), k1 = clock();
    s0.position.set(0, 1.6, 0); k0.gr.position.set(-2.6, 1.6, 0); k0.l.position.y = 0.6;
    const l0 = T.label('Diam (L₀ = 100 m)', s0, 'small'); l0.position.y = 0.55;
    const l1 = T.label('', s1, 'small'); l1.position.y = 0.55; k1.l.position.y = 0.6;
    let x = -6, t0 = 0, t1 = 0;
    return {
      update(dt, p) {
        const ga = 1 / Math.sqrt(1 - p.v * p.v);
        x += p.v * 4 * dt; if (x > 7) x = -7;
        s1.position.set(x, -0.8, 0); s1.scale.x = 1 / ga; k1.gr.position.set(x - 2, -0.8, 0);
        t0 += dt; t1 += dt / ga;
        k0.hand.rotation.z = -t0 * Math.PI / 2; k1.hand.rotation.z = -t1 * Math.PI / 2;
        k0.l.text(`t₀ = ${fx(t0, 1)} s`); k1.l.text(`t = ${fx(t1, 1)} s`); l1.text(`Bergerak ${fx(p.v, 2)}c (L = ${fx(100 / ga, 1)} m)`);
        if (t0 > 60) { t0 = 0; t1 = 0; }
      },
      readout(p) {
        const ga = 1 / Math.sqrt(1 - p.v * p.v);
        return [['Faktor Lorentz γ', fx(ga, 3)], ['Panjang L = L₀/γ', fx(100 / ga, 1) + ' m'], ['1 s di pesawat = … s di Bumi', fx(ga, 3) + ' s'],
          ['Massa relativistik (m₀ = 1 kg)', fx(ga, 3) + ' kg'], ['E_k = (γ − 1)m₀c²', fx((ga - 1) * 9e16) + ' J']];
      },
    };
  },
});

sim('atom', {
  params: [{ k: 'na', label: 'Kulit awal n', min: 1, max: 6, step: 1, val: 3, unit: '', rebuild: true }, { k: 'nb', label: 'Kulit akhir n', min: 1, max: 6, step: 1, val: 2, unit: '', rebuild: true }],
  fitW: 14, cam: [1.6, 0, 10], target: [1.6, 0, 0],
  build(T, p) {
    const rr = n => 0.55 * n;
    T.sphere(0.2, 0xdc2626, { emissive: 0x7f1d1d, ei: 0.6 });
    for (let n = 1; n <= 6; n++) { const L = T.line(n === p.na || n === p.nb ? 0x2563eb : 0xcbd5e1, 80, { loop: true, dashed: true }); L.set(T.circlePts(rr(n), 80, 'xy')); T.label('n=' + n, T.group, 'small').position.set(rr(n) * 0.71, rr(n) * 0.71 + 0.1, 0); }
    const e = T.sphere(0.11, 0x2563eb, { emissive: 0x1d4ed8, ei: 0.4 });
    const dE = 13.6 * Math.abs(1 / (p.nb * p.nb) - 1 / (p.na * p.na)), lam = dE ? 1240 / dE : 0, col = lam < 380 ? 0x8b5cf6 : lam > 750 ? 0x991b1b : wl2rgb(lam);
    const photon = T.sphere(0.12, col, { emissive: col, ei: 1 });
    const lx = 4, ly = n => 2.6 - 13.6 / (n * n) / 13.6 * 5;
    for (let n = 1; n <= 6; n++) { T.rod(0.012, n === p.na || n === p.nb ? 0x2563eb : 0x94a3b8).set(V(lx, ly(n), 0), V(lx + 1.4, ly(n), 0)); T.label(`n=${n}: ${fx(-13.6 / (n * n), 2)} eV`, T.group, 'small').position.set(lx + 2.4, ly(n), 0); }
    if (p.na !== p.nb) T.arrow(col, 0.03).set(V(lx + 0.7, ly(p.na), 0), V(0, ly(p.nb) - ly(p.na), 0));
    const emit = p.nb < p.na;
    let t = 0, ang = 0;
    return {
      update(dt) {
        t += dt; if (t > 5) t = 0;
        const r = t < 1.6 ? rr(p.na) : t < 2.4 ? rr(p.na) + (rr(p.nb) - rr(p.na)) * (t - 1.6) / 0.8 : rr(p.nb), n = r / 0.55;
        ang += 2.5 / Math.pow(Math.max(n, 1), 1.5) * dt;
        e.position.set(r * Math.cos(ang), r * Math.sin(ang), 0);
        photon.visible = p.na !== p.nb && (emit ? t > 2.4 && t < 4.6 : t < 1.6);
        if (photon.visible) {
          const s = emit ? (t - 2.4) * 2.5 : (1.6 - t) * 2.5, dir = V(Math.cos(ang), Math.sin(ang), 0), base = emit ? rr(p.nb) : rr(p.na);
          photon.position.copy(dir.clone().multiplyScalar(base + s)).add(V(-dir.y, dir.x, 0).multiplyScalar(0.15 * Math.sin(s * 8)));
        }
      },
      readout() {
        if (p.na === p.nb) return [['Transisi', 'Pilih kulit awal dan akhir yang berbeda']];
        const deret = ['Lyman', 'Balmer', 'Paschen', 'Brackett', 'Pfund'][Math.min(p.na, p.nb) - 1];
        return [['Proses', emit ? 'Emisi (memancarkan foton)' : 'Absorpsi (menyerap foton)'], ['ΔE = 13,6 |1/n₂² − 1/n₁²|', fx(dE, 3) + ' eV'], ['Panjang gelombang foton', fx(lam, 1) + ' nm'],
          ['Deret spektrum', deret], ['Daerah', lam < 380 ? 'Ultraviolet' : lam > 750 ? 'Inframerah' : 'Cahaya tampak']];
      },
    };
  },
});

sim('inti', {
  params: [{ k: 'T', label: 'Waktu paruh T½', min: 1, max: 10, step: 0.5, val: 3, unit: 's', rebuild: true }, { k: 'N0', label: 'Jumlah inti awal N₀', min: 100, max: 400, step: 50, val: 200, unit: '', rebuild: true }],
  cam: [1.6, 1.2, 8], target: [1.6, 0.6, 0],
  build(T, p) {
    const side = Math.ceil(Math.cbrt(p.N0)), sp = 0.28, nuc = [];
    for (let i = 0; i < p.N0; i++) {
      const x = i % side, y = Math.floor(i / side) % side, z = Math.floor(i / side / side);
      const m = T.sphere(0.1, 0xf59e0b, { emissive: 0xb45309, ei: 0.3 }); m.position.set(-1.6 + (x - (side - 1) / 2) * sp, 0.8 + (y - (side - 1) / 2) * sp, (z - (side - 1) / 2) * sp);
      nuc.push({ m, alive: true });
    }
    const alphas = Array.from({ length: 60 }, () => ({ m: T.sphere(0.05, 0xdc2626, { emissive: 0xdc2626, ei: 0.8 }), v: V(), life: 0 }));
    alphas.forEach(a => { a.m.visible = false; });
    const pnl = T.panel({ x: 0.6, y: -0.6, w: 3.8, h: 2.8, xl: 't', yl: 'N/N₀' }), tmax = 6 * p.T;
    const theo = []; for (let i = 0; i <= 60; i++) theo.push(pnl.map(i / 60, 0.5 ** (i / 60 * 6)));
    T.line(0x94a3b8, 61).set(theo);
    const real = T.line(0xea580c, 400), pts = [];
    const lam = Math.LN2 / p.T;
    let t = 0, N = p.N0, hold = 0, rec = 0;
    const reset = () => { t = 0; N = p.N0; pts.length = 0; real.set([]); nuc.forEach(n => { n.alive = true; n.m.material.color.setHex(0xf59e0b); n.m.material.emissiveIntensity = 0.3; }); };
    return {
      update(dt) {
        alphas.forEach(a => { if (a.life <= 0) return; a.life -= dt; a.m.position.addScaledVector(a.v, dt); a.m.visible = a.life > 0; });
        if (hold > 0) { hold -= dt; if (hold <= 0) reset(); return; }
        t += dt; const pr = 1 - Math.exp(-lam * dt);
        nuc.forEach(n => {
          if (!n.alive || Math.random() > pr) return;
          n.alive = false; N--; n.m.material.color.setHex(0x64748b); n.m.material.emissiveIntensity = 0;
          const a = alphas.find(q => q.life <= 0); if (a) { a.life = 0.8; a.m.visible = true; a.m.position.copy(n.m.position); a.v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(3); }
        });
        rec += dt; if (rec > 0.1) { rec = 0; pts.push(pnl.map(t / tmax, N / p.N0)); real.set(pts); }
        if (t > tmax || N === 0) hold = 2;
      },
      readout() {
        return [['Waktu t', fx(t, 1) + ' s'], ['Inti tersisa N (simulasi)', fx(N, 0)], ['N teori = N₀(½)^(t/T½)', fx(p.N0 * 0.5 ** (t / p.T), 1)],
          ['Konstanta peluruhan λ = 0,693/T½', fx(lam, 3) + ' /s'], ['Aktivitas A = λN', fx(lam * N, 1) + ' Bq']];
      },
    };
  },
});
