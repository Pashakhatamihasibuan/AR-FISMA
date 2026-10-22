import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { CONFIG, CP, TP, PANDUAN, KELAS, BAB, KUIS } from './data.js';
import { SIMS, toolkit, fx } from './sims.js';

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const BY_ID = Object.fromEntries(BAB.map(b => [b.id, b]));
const SIM_IDS = BAB.filter(b => SIMS[b.id]).map(b => b.id);

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 3200);
}

/* =====================================================================
   MESIN SIMULASI 3D
   ===================================================================== */
const S = { id: null, p: {}, inst: null, group: null, paused: false, speed: 1, labels: true, lastRead: 0 };
let E = null, stream = null;

function engine() {
  if (E) return E;
  const stage = $('#stage');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  stage.prepend(renderer.domElement); stage.prepend($('#cam'));
  const labels = new CSS2DRenderer(); labels.domElement.className = 'labels'; stage.appendChild(labels.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x94a3b8, 1.3));
  const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(4, 8, 6); scene.add(dl);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
  new ResizeObserver(() => {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h); labels.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  }).observe(stage);
  const clock = new THREE.Clock();
  E = { renderer, labels, scene, camera, controls };
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    if ($('#s-sim').hidden || !S.inst) return;
    if (!S.paused) S.inst.update(dt * S.speed, S.p);
    controls.update(); renderer.render(scene, camera); labels.render(scene, camera);
    const now = performance.now(); if (now - S.lastRead > 200) { S.lastRead = now; renderReadout(); }
  });
  return E;
}

function disposeGroup(g) {
  g.traverse(o => {
    if (o.isCSS2DObject) o.element.remove();
    o.geometry?.dispose();
    [].concat(o.material || []).forEach(m => { m.map?.dispose(); m.dispose(); });
  });
}

function buildSim() {
  engine();
  if (S.group) { E.scene.remove(S.group); disposeGroup(S.group); }
  S.group = new THREE.Group(); E.scene.add(S.group);
  S.inst = SIMS[S.id].build(toolkit(S.group), S.p);
  S.inst.update(0, S.p);
  renderReadout();
}
// Mundurkan kamera bila isi scene tidak muat (layar HP sempit), tanpa mengubah arah pandang bawaan.
function resetView() {
  const d = SIMS[S.id], cam = E.camera, target = new THREE.Vector3(...d.target), pos = new THREE.Vector3(...d.cam);
  const dir = pos.clone().sub(target), dist0 = dir.length(); dir.normalize();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize(), up = new THREE.Vector3().crossVectors(dir, right);
  const box = new THREE.Box3();
  S.group.traverse(o => { if (o.isMesh || (o.isLine && !o.isLineSegments)) box.expandByObject(o); });
  let hw = 0, hh = 0;
  if (!box.isEmpty()) for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
    const c = new THREE.Vector3(x, y, z).sub(target); hw = Math.max(hw, Math.abs(c.dot(right))); hh = Math.max(hh, Math.abs(c.dot(up)));
  }
  if (d.fitW) hw = d.fitW / 2;
  const tv = Math.tan(cam.fov * Math.PI / 360), th = tv * cam.aspect;
  const dist = Math.max(dist0, Math.max(hh / tv, hw / th) * 1.1);
  cam.position.copy(target).addScaledVector(dir, dist); E.controls.target.copy(target); E.controls.update();
}

function renderReadout() {
  const rows = S.inst.readout(S.p);
  const html = rows.map(([k, v], i) => `<div class="fact${rows.length % 2 && i === rows.length - 1 ? ' wide' : ''}"><small>${k}</small><strong>${v}</strong></div>`).join('');
  const box = $('#sim-readout'); if (box.innerHTML !== html) box.innerHTML = html;
}

function renderControls() {
  const d = SIMS[S.id];
  $('#sim-controls').innerHTML = d.params.map(q => q.opts
    ? `<div class="ctrl"><label>${q.label}</label><div class="seg" role="group" aria-label="${q.label}">${q.opts.map(([v, t]) => `<button data-k="${q.k}" data-v="${v}" aria-pressed="${S.p[q.k] === v}">${t}</button>`).join('')}</div></div>`
    : `<div class="ctrl"><label for="c-${q.k}">${q.label}<output id="o-${q.k}">${fx(S.p[q.k], 2)} ${q.unit}</output></label>
       <input type="range" id="c-${q.k}" data-k="${q.k}" min="${q.min}" max="${q.max}" step="${q.step}" value="${S.p[q.k]}"></div>`).join('');
}

$('#sim-controls').addEventListener('input', e => {
  const k = e.target.dataset.k; if (!k) return;
  const q = SIMS[S.id].params.find(x => x.k === k);
  S.p[k] = +e.target.value; $(`#o-${k}`).textContent = `${fx(S.p[k], 2)} ${q.unit}`;
  if (q.rebuild) buildSim();
});
$('#sim-controls').addEventListener('click', e => {
  const b = e.target.closest('.seg button'); if (!b) return;
  const q = SIMS[S.id].params.find(x => x.k === b.dataset.k);
  S.p[q.k] = b.dataset.v;
  b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  if (q.rebuild) buildSim();
});

function enterSim(id) {
  const d = SIMS[id]; if (!d) { location.hash = '#/simulasi'; return; }
  const b = BY_ID[id];
  $('#sim-title').textContent = b.judul;
  $('#sim-sub').textContent = `${KELAS[b.kelas]} · simulasi 3D interaktif`;
  $('#sim-ar').href = `#/ar/${id}`; $('#sim-materi').href = `#/bab/${id}`;
  if (S.id !== id) { S.id = id; S.p = Object.fromEntries(d.params.map(q => [q.k, q.val])); }
  renderControls(); buildSim(); resetView();
}

function bindSimTools() {
  $('#t-play').addEventListener('click', e => {
    S.paused = !S.paused; const b = e.currentTarget;
    b.setAttribute('aria-pressed', S.paused); b.setAttribute('aria-label', S.paused ? 'Lanjutkan simulasi' : 'Jeda simulasi');
    b.innerHTML = `<i class="fa-solid ${S.paused ? 'fa-play' : 'fa-pause'}" aria-hidden="true"></i>`;
  });
  $('#t-speed').addEventListener('click', e => {
    S.speed = S.speed === 1 ? 0.5 : S.speed === 0.5 ? 0.25 : 1;
    const t = S.speed === 1 ? '1×' : S.speed === 0.5 ? '½×' : '¼×';
    e.currentTarget.innerHTML = `<span class="speed">${t}</span>`; e.currentTarget.setAttribute('aria-label', `Kecepatan simulasi ${t}`);
    toast(S.speed === 1 ? 'Kecepatan normal' : `Gerak lambat ${t}`);
  });
  $('#t-reset').addEventListener('click', buildSim);
  $('#t-view').addEventListener('click', resetView);
  $('#t-labels').addEventListener('click', e => {
    S.labels = !S.labels; e.currentTarget.setAttribute('aria-pressed', S.labels);
    E.labels.domElement.style.display = S.labels ? '' : 'none';
  });
  $('#t-cam').addEventListener('click', async e => {
    const btn = e.currentTarget;
    if (stream) { stopCam(); return; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      const v = $('#cam'); v.srcObject = stream; v.hidden = false; await v.play();
      btn.setAttribute('aria-pressed', 'true'); btn.lastChild.textContent = ' Matikan Kamera';
      toast('Mode Kamera aktif: simulasi tampil di atas pandangan kamera.');
    } catch {
      stream = null;
      toast(window.isSecureContext ? 'Kamera tidak dapat diakses. Periksa izin kamera di browser.' : 'Kamera butuh koneksi HTTPS (mis. GitHub Pages).');
    }
  });
}
function stopCam() {
  stream?.getTracks().forEach(t => t.stop()); stream = null;
  const v = $('#cam'); v.hidden = true; v.srcObject = null;
  const btn = $('#t-cam'); btn.setAttribute('aria-pressed', 'false'); btn.lastChild.textContent = ' Mode Kamera';
}

/* =====================================================================
   AR — potret simulasi diekspor ke GLB untuk model-viewer
   ===================================================================== */
let arUrl = null;
async function enterAR(id) {
  if (!SIMS[id]) { location.hash = '#/simulasi'; return; }
  $('#ar-sub').textContent = BY_ID[id].judul;
  $('#ar-status').textContent = 'Menyiapkan model…';
  if (S.id !== id) { S.id = id; S.p = Object.fromEntries(SIMS[id].params.map(q => [q.k, q.val])); }
  if (!S.group || S.group.userData.id !== id) { buildSim(); S.group.userData.id = id; for (let i = 0; i < 60; i++) S.inst.update(1 / 30, S.p); }
  const snap = S.group.clone(true);
  const css = []; snap.traverse(o => { if (o.isCSS2DObject) css.push(o); });
  css.forEach(o => o.removeFromParent());
  const box = new THREE.Box3().setFromObject(snap), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const k = 0.6 / Math.max(size.x, size.y, size.z, 1e-3), root = new THREE.Group();
  snap.position.set(-c.x, -box.min.y, -c.z); root.add(snap); root.scale.setScalar(k);
  try {
    const glb = await new GLTFExporter().parseAsync(root, { binary: true });
    if (arUrl) URL.revokeObjectURL(arUrl);
    arUrl = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
    const mv = $('#mv'); mv.src = arUrl;
    mv.addEventListener('load', () => {
      $('#ar-status').textContent = mv.canActivateAR ? 'Siap! Tekan "Tempatkan di ruangan", lalu arahkan kamera ke lantai atau meja.'
        : 'Perangkat/browser ini belum mendukung AR penuh. Model tetap bisa diputar di sini, atau gunakan Mode Kamera di halaman simulasi.';
    }, { once: true });
  } catch (err) { $('#ar-status').textContent = 'Gagal menyiapkan model AR: ' + err.message; }
}

/* =====================================================================
   MATERI
   ===================================================================== */
const filt = { kelas: '', q: '', simOnly: false };
function enterMateri(kelas, simOnly) {
  filt.simOnly = simOnly; if (kelas !== undefined) filt.kelas = KELAS[kelas] ? kelas : '';
  $('#materi-title').textContent = simOnly ? 'Simulasi 3D' : 'Materi Fisika SMA';
  $('#kelas-filter').innerHTML = [['', 'Semua'], ...Object.entries(KELAS)].map(([k, t]) => `<button data-kelas="${k}" aria-pressed="${filt.kelas === k}">${t}</button>`).join('');
  renderBabList();
}
function renderBabList() {
  const q = filt.q.toLowerCase();
  const list = BAB.filter(b => (!filt.kelas || b.kelas === filt.kelas) && (!filt.simOnly || SIMS[b.id]) && (!q || b.judul.toLowerCase().includes(q) || b.isi.toLowerCase().includes(q)));
  const groups = Object.keys(KELAS).map(k => [k, list.filter(b => b.kelas === k)]).filter(([, l]) => l.length);
  $('#bab-list').innerHTML = groups.length ? groups.map(([k, l]) => `<h2 class="group-title">${KELAS[k]}</h2><div class="list">${l.map(b => {
    const no = BAB.indexOf(b) + 1, href = filt.simOnly ? `#/sim/${b.id}` : `#/bab/${b.id}`;
    return `<a class="item" href="${href}"><span class="badge"><i class="fa-solid ${b.ikon}" aria-hidden="true"></i></span>
      <div><h3>${no}. ${b.judul}</h3><div class="meta"><span class="chip k-${b.kelas}">${KELAS[b.kelas]}</span>${SIMS[b.id] ? '<span class="chip k-3d"><i class="fa-solid fa-cube" aria-hidden="true"></i> 3D</span>' : ''}</div></div>
      <i class="fa-solid fa-chevron-right chev" aria-hidden="true"></i></a>`;
  }).join('')}</div>`).join('') : '<p class="card">Tidak ada bab yang cocok. Coba kata kunci lain.</p>';
}

function enterBab(id) {
  const k = BAB.findIndex(b => b.id === id); if (k < 0) { location.hash = '#/materi'; return; }
  const b = BAB[k];
  $('#bab-title').textContent = b.judul;
  $('#bab-sub').textContent = `${KELAS[b.kelas]} · Bab ${k + 1} dari ${BAB.length}`;
  $('#bab-actions').innerHTML = SIMS[id]
    ? `<a class="btn accent" href="#/sim/${id}"><i class="fa-solid fa-cube" aria-hidden="true"></i> Simulasi 3D</a><a class="btn ghost" href="#/ar/${id}"><i class="fa-solid fa-vr-cardboard" aria-hidden="true"></i> Lihat di AR</a>`
    : '<p class="muted" style="font-size:14px">Bab ini berupa materi bacaan tanpa simulasi 3D.</p>';
  $('#bab-body').innerHTML = b.isi.replace(/<table/g, '<div class="table-wrap"><table').replace(/<\/table>/g, '</table></div>');
  $('#bab-contoh').innerHTML = `<h2><i class="fa-solid fa-pencil" aria-hidden="true" style="color:var(--accent)"></i> Contoh soal</h2><p>${b.contoh.soal}</p><details><summary>Lihat pembahasan</summary><p style="margin-top:6px">${b.contoh.jawab}</p></details>`;
  const prev = BAB[k - 1], next = BAB[k + 1];
  $('#bab-pager').innerHTML = `${prev ? `<a class="btn small ghost" href="#/bab/${prev.id}"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Sebelumnya</a>` : '<span></span>'}
    ${next ? `<a class="btn small" href="#/bab/${next.id}">Berikutnya <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a>` : '<a class="btn small accent" href="#/kuis">Kerjakan kuis</a>'}`;
}

function renderHome() {
  $('#kelas-row').innerHTML = Object.entries(KELAS).map(([k, t]) => {
    const n = BAB.filter(b => b.kelas === k).length;
    return `<a class="kelas k-${k}" href="#/materi/${k}"><b>${k}</b><span>${n} bab</span></a>`;
  }).join('');
}

/* =====================================================================
   SCAN & MARKER QR
   ===================================================================== */
let scanner = null;
function loadScript(src) {
  return new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => fail(new Error('gagal memuat ' + src)); document.head.appendChild(s); });
}
async function enterScan() {
  const status = $('#scan-status'); $('#scan-result').innerHTML = ''; status.textContent = 'Menyalakan kamera…';
  try {
    if (!window.Html5Qrcode) await loadScript('https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js');
    if ($('#s-scan').hidden) return;
    scanner = new Html5Qrcode('reader');
    await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 230, height: 230 } }, onScan, () => {});
    status.textContent = 'Arahkan kamera ke kode QR pada kartu marker.';
  } catch {
    status.textContent = window.isSecureContext ? 'Kamera tidak dapat diakses. Izinkan akses kamera lalu buka ulang menu ini.' : 'Kamera hanya bisa dipakai lewat HTTPS (misalnya GitHub Pages) atau localhost.';
  }
}
function onScan(text) {
  const m = text.match(/#\/(sim|ar|bab)\/([\w-]+)/);
  if (m && BY_ID[m[2]]) { navigator.vibrate?.(60); location.hash = `#/${m[1]}/${m[2]}`; return; }
  const box = $('#scan-result');
  if (/^https?:\/\//i.test(text)) box.innerHTML = `<p style="margin-top:8px">QR berisi tautan luar:</p><p style="word-break:break-all;font-weight:700">${esc(text)}</p><a class="btn small ghost" href="${esc(text)}" target="_blank" rel="noopener noreferrer">Buka tautan</a>`;
  else box.innerHTML = `<p style="margin-top:8px">QR tidak dikenali sebagai marker AR-FISMA: <b>${esc(text.slice(0, 80))}</b></p>`;
}
async function stopScan() {
  if (!scanner) return; const s = scanner; scanner = null;
  try { await s.stop(); s.clear(); } catch { /* sudah berhenti */ }
}
function enterMarker() {
  const base = location.href.split('#')[0];
  $('#marker-warn').textContent = location.protocol === 'file:' ? 'Perhatian: aplikasi dibuka dari file lokal. Unggah dulu ke hosting (misalnya GitHub Pages) agar QR bisa dibuka dari HP lain.' : '';
  if (typeof qrcode === 'undefined') { $('#marker-grid').innerHTML = '<p>Pustaka QR belum termuat. Periksa koneksi internet lalu muat ulang.</p>'; return; }
  $('#marker-grid').innerHTML = SIM_IDS.map(id => {
    const q = qrcode(0, 'M'); q.addData(`${base}#/sim/${id}`); q.make();
    return `<div class="marker">${q.createSvgTag({ cellSize: 4, margin: 2, scalable: true })}<h3>${BY_ID[id].judul}</h3><p>${KELAS[BY_ID[id].kelas]}</p></div>`;
  }).join('');
}

/* =====================================================================
   KUIS
   ===================================================================== */
const quiz = { name: '', kelas: 'X', qs: [], i: 0, score: 0, log: [], answered: false };
const best = {
  get(k) { try { return +localStorage.getItem('arfisma-best-' + k) || 0; } catch { return 0; } },
  set(k, v) { try { localStorage.setItem('arfisma-best-' + k, v); } catch { /* storage diblokir */ } },
};
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);

function enterKuis() {
  $('#kuis-body').innerHTML = `<div class="card"><h2>Pilih kelas</h2>
    <div class="seg" role="group" aria-label="Kelas kuis" id="q-kelas">${Object.entries(KELAS).map(([k, t]) => `<button data-q="${k}" aria-pressed="${quiz.kelas === k}">${t} · ${KUIS[k].length} soal</button>`).join('')}</div>
    <p class="muted" id="q-best" style="margin-top:10px;font-size:14px"></p>
    <label class="field" for="q-name" style="margin-top:12px">Nama (untuk hasil yang diunduh)</label><input class="input" id="q-name" autocomplete="name" placeholder="Nama lengkap" value="${esc(quiz.name)}">
    <button class="btn accent" id="q-start" style="margin-top:14px"><i class="fa-solid fa-play" aria-hidden="true"></i> Mulai kuis</button></div>`;
  const showBest = () => { const b = best.get(quiz.kelas); $('#q-best').textContent = b ? `Nilai terbaikmu di ${KELAS[quiz.kelas]}: ${b}` : 'Soal diacak dan setiap jawaban dilengkapi pembahasan.'; };
  showBest();
  $('#q-kelas').onclick = e => { const b = e.target.closest('button'); if (!b) return; quiz.kelas = b.dataset.q; document.querySelectorAll('#q-kelas button').forEach(x => x.setAttribute('aria-pressed', x === b)); showBest(); };
  $('#q-start').onclick = () => { quiz.name = $('#q-name').value.trim() || 'Siswa'; quiz.qs = shuffle(KUIS[quiz.kelas]); quiz.i = 0; quiz.score = 0; quiz.log = []; renderQ(); };
}
function renderQ() {
  const q = quiz.qs[quiz.i], n = quiz.qs.length; quiz.answered = false;
  $('#kuis-body').innerHTML = `<div class="card"><div class="row" style="justify-content:space-between;font-weight:800"><span>${KELAS[quiz.kelas]} · Soal ${quiz.i + 1}/${n}</span><span style="flex:none">Benar: ${quiz.score}</span></div>
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${quiz.i}"><div style="width:${quiz.i / n * 100}%"></div></div>
    <h2 id="q-text" tabindex="-1">${q.q}</h2>
    <div class="opts">${q.o.map((o, k) => `<button class="opt" data-k="${k}"><span class="key">${'ABCD'[k]}</span>${o}</button>`).join('')}</div>
    <div id="q-fb" aria-live="polite"></div></div>`;
  $('#q-text').focus();
  document.querySelectorAll('.opt').forEach(btn => { btn.onclick = () => answer(+btn.dataset.k); });
}
function answer(k) {
  if (quiz.answered) return; quiz.answered = true;
  const q = quiz.qs[quiz.i], ok = k === q.ans; if (ok) quiz.score++;
  quiz.log.push({ q: q.q, jawab: q.o[k], benar: q.o[q.ans], ok });
  document.querySelectorAll('.opt').forEach((b, i) => { b.disabled = true; if (i === q.ans) b.classList.add('right'); else if (i === k) b.classList.add('wrong'); });
  const last = quiz.i === quiz.qs.length - 1;
  $('#q-fb').innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}"><i class="fa-solid ${ok ? 'fa-circle-check' : 'fa-circle-xmark'}" aria-hidden="true"></i> ${ok ? 'Benar!' : 'Belum tepat.'} ${q.ex}</div>
    <button class="btn" id="q-next">${last ? 'Lihat hasil' : 'Soal berikutnya'} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>`;
  $('#q-next').onclick = () => { if (last) result(); else { quiz.i++; renderQ(); } };
  $('#q-next').focus();
}
function result() {
  const n = quiz.qs.length, nilai = Math.round(quiz.score / n * 100);
  if (nilai > best.get(quiz.kelas)) best.set(quiz.kelas, nilai);
  const C = 2 * Math.PI * 54, msg = nilai >= 80 ? 'Luar biasa! Pemahamanmu sangat baik.' : nilai >= 60 ? 'Bagus! Pelajari lagi pembahasan soal yang salah.' : 'Ayo ulangi materi dan simulasinya, lalu coba lagi.';
  $('#kuis-body').innerHTML = `<div class="card" style="text-align:center"><h2 tabindex="-1" id="q-res">Hasil kuis ${KELAS[quiz.kelas]}, ${esc(quiz.name)}</h2>
    <svg class="score-ring" viewBox="0 0 140 140" role="img" aria-label="Nilai ${nilai} dari 100"><circle cx="70" cy="70" r="54" fill="none" stroke="var(--primary-100)" stroke-width="14"/>
      <circle cx="70" cy="70" r="54" fill="none" stroke="${nilai >= 60 ? 'var(--ok)' : 'var(--accent)'}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C * nilai / 100} ${C}" transform="rotate(-90 70 70)"/>
      <text x="70" y="80" text-anchor="middle" font-family="Baloo 2" font-weight="800" font-size="34" fill="var(--fg)">${nilai}</text></svg>
    <p><b>${quiz.score}</b> dari ${n} jawaban benar. ${msg}</p>
    <div class="row" style="margin-top:14px"><button class="btn accent" id="q-csv"><i class="fa-solid fa-file-arrow-down" aria-hidden="true"></i> Unduh hasil</button><button class="btn ghost" id="q-again"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i> Ulangi</button></div></div>
    <div class="card"><h2>Pembahasan</h2><ol class="prose" style="padding-left:20px">${quiz.log.map(l => `<li style="margin-bottom:8px">${l.q}<br><span style="color:${l.ok ? 'var(--ok)' : 'var(--err)'};font-weight:700">${l.ok ? '✓' : '✗'} ${l.jawab}</span>${l.ok ? '' : `<br><span class="muted">Jawaban benar: <b>${l.benar}</b></span>`}</li>`).join('')}</ol></div>`;
  $('#q-res').focus();
  $('#q-again').onclick = enterKuis;
  $('#q-csv').onclick = () => {
    const cell = v => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [['Nama', 'Kelas', 'Tanggal', 'Benar', 'Jumlah Soal', 'Nilai'].map(cell).join(','), [quiz.name, KELAS[quiz.kelas], new Date().toLocaleString('id-ID'), quiz.score, n, nilai].map(cell).join(','), '',
      ['No', 'Soal', 'Jawaban', 'Kunci', 'Status'].map(cell).join(','), ...quiz.log.map((l, i) => [i + 1, l.q, l.jawab, l.benar, l.ok ? 'Benar' : 'Salah'].map(cell).join(','))];
    const url = URL.createObjectURL(new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `hasil-kuis-fisika-${quiz.kelas}-${quiz.name.replace(/\W+/g, '_')}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}

function renderTentang() {
  $('#tentang-body').innerHTML = `
    <div class="card"><h2><i class="fa-solid fa-bullseye" aria-hidden="true" style="color:var(--accent)"></i> Capaian Pembelajaran</h2><p>${CP}</p></div>
    <div class="card"><h2><i class="fa-solid fa-list-check" aria-hidden="true" style="color:var(--primary)"></i> Tujuan Pembelajaran</h2><ol class="prose" style="padding-left:20px">${TP.map(t => `<li>${t}</li>`).join('')}</ol></div>
    <div class="card"><h2><i class="fa-solid fa-book-bookmark" aria-hidden="true" style="color:var(--primary)"></i> Panduan Penggunaan</h2>
      <ol class="list" style="list-style:none">${PANDUAN.map(([t, d], i) => `<li class="row" style="align-items:flex-start;gap:12px"><span class="badge" style="width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:var(--primary);color:#fff;font-size:15px;font-weight:800">${i + 1}</span><p style="flex:1"><b>${t}.</b> ${d}</p></li>`).join('')}</ol></div>
    <div class="card"><h2><i class="fa-solid fa-users" aria-hidden="true" style="color:var(--primary)"></i> Tim Pengembang</h2>
      ${CONFIG.pengembang.map(p => `<div class="item" style="box-shadow:none;border:2px solid var(--primary-100);margin-top:10px"><span class="badge"><i class="fa-solid fa-user" aria-hidden="true"></i></span><div><h3>${esc(p.nama)}</h3><div class="meta">${esc(p.peran)} · ${esc(p.instansi)}</div><div class="meta">${esc(p.email)}</div></div></div>`).join('')}
      <p class="muted" style="font-size:13px;margin-top:12px">${CONFIG.appName} v${CONFIG.versi} · ${BAB.length} bab, ${SIM_IDS.length} simulasi 3D (three.js), AR via WebXR / AR Quick Look. Percepatan gravitasi g = 10 m/s².</p></div>`;
}

/* =====================================================================
   ROUTER
   ===================================================================== */
const SCREENS = { '': 's-splash', home: 's-home', materi: 's-materi', simulasi: 's-materi', bab: 's-bab', sim: 's-sim', ar: 's-ar', scan: 's-scan', marker: 's-marker', kuis: 's-kuis', tentang: 's-tentang' };
const TAB_OF = { bab: 'materi', sim: 'simulasi', ar: 'simulasi' };
const ENTER = {
  home: renderHome, materi: a => enterMateri(a ?? '', false), simulasi: () => enterMateri(undefined, true), bab: enterBab, sim: enterSim, ar: enterAR,
  scan: enterScan, marker: enterMarker, kuis: () => { if (!quiz.qs.length || quiz.log.length === quiz.qs.length) enterKuis(); }, tentang: renderTentang,
};
const stack = [];
function route() {
  const [name = '', arg] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  if (stack.at(-2) === location.hash) stack.pop(); else stack.push(location.hash);
  if (name !== 'sim') stopCam();
  if (name !== 'scan') stopScan();
  const id = SCREENS[name] ?? 's-home';
  document.querySelectorAll('.screen').forEach(s => { s.hidden = s.id !== id; });
  const nav = $('#nav'); nav.hidden = id === 's-splash';
  const tab = TAB_OF[name] || name;
  nav.querySelectorAll('a').forEach(a => a.dataset.tab === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  window.scrollTo(0, 0);
  ENTER[name]?.(arg);
  if (id !== 's-splash') $(`#${id} h1`)?.focus({ preventScroll: true });
}

document.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) { if (stack.length > 1) history.back(); else location.hash = '#/home'; return; }
  const kb = e.target.closest('[data-kelas]');
  if (kb) { filt.kelas = kb.dataset.kelas; document.querySelectorAll('[data-kelas]').forEach(x => x.setAttribute('aria-pressed', x === kb)); renderBabList(); }
});
$('#bab-search').addEventListener('input', e => { filt.q = e.target.value.trim(); renderBabList(); });
$('#print-btn').addEventListener('click', () => window.print());

bindSimTools();
addEventListener('hashchange', route);
route();
$('#engine-status').textContent = `Versi ${CONFIG.versi} · ${BAB.length} bab · siap digunakan`;
