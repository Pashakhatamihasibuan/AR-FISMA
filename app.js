import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { CONFIG, CP, TP, PANDUAN, KELAS, BAB } from './data.js';
import { SIMS, toolkit, fx } from './sims.js';
import './sims-x.js';
import './sims-xi.js';
import './sims-xii.js';

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
const S = { id: null, mode: null, p: {}, inst: null, group: null, paused: false, speed: 1, labels: true, lastRead: 0 };
const defMode = () => SIMS[S.id].modes.find(m => m.mode === S.mode) || SIMS[S.id].modes[0];
const nilaiAwal = d => Object.fromEntries(d.params.map(q => [q.k, q.val]));
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
  S.inst = defMode().build(toolkit(S.group), S.p);
  S.inst.update(0, S.p);
  renderReadout();
}
// Mundurkan kamera bila isi scene tidak muat (layar HP sempit), tanpa mengubah arah pandang bawaan.
function resetView() {
  const d = defMode(), cam = E.camera, target = new THREE.Vector3(...d.target), pos = new THREE.Vector3(...d.cam);
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
  const d = defMode();
  $('#sim-controls').innerHTML = d.params.map(q => q.opts
    ? `<div class="ctrl"><label>${q.label}</label><div class="seg" role="group" aria-label="${q.label}">${q.opts.map(([v, t]) => `<button data-k="${q.k}" data-v="${v}" aria-pressed="${S.p[q.k] === v}">${t}</button>`).join('')}</div></div>`
    : `<div class="ctrl"><label for="c-${q.k}">${q.label}<output id="o-${q.k}">${fx(S.p[q.k], 2)} ${q.unit}</output></label>
       <input type="range" id="c-${q.k}" data-k="${q.k}" min="${q.min}" max="${q.max}" step="${q.step}" value="${S.p[q.k]}"></div>`).join('');
}

$('#sim-controls').addEventListener('input', e => {
  const k = e.target.dataset.k; if (!k) return;
  const q = defMode().params.find(x => x.k === k);
  S.p[k] = +e.target.value; $(`#o-${k}`).textContent = `${fx(S.p[k], 2)} ${q.unit}`;
  if (q.rebuild) buildSim();
});
$('#sim-controls').addEventListener('click', e => {
  const b = e.target.closest('.seg button'); if (!b) return;
  const q = defMode().params.find(x => x.k === b.dataset.k);
  S.p[q.k] = b.dataset.v;
  b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  if (q.rebuild) buildSim();
});

function enterSim(id, modeId) {
  const d = SIMS[id]; if (!d) { location.hash = '#/simulasi'; return; }
  const b = BY_ID[id], m = d.modes.find(x => x.mode === modeId) || d.modes[0];
  $('#sim-title').textContent = b.judul;
  $('#sim-sub').textContent = `${KELAS[b.kelas]} · ${m.label}`;
  $('#sim-ar').href = `#/ar/${id}/${m.mode}`; $('#sim-materi').href = `#/bab/${id}`;
  if (S.id !== id || S.mode !== m.mode) { S.id = id; S.mode = m.mode; S.p = nilaiAwal(m); }
  $('#sim-modes-card').hidden = d.modes.length < 2;
  $('#sim-modes').innerHTML = d.modes.map(x => `<button data-mode="${x.mode}" aria-pressed="${x === m}">${x.label}</button>`).join('');
  $('#sim-mode-desc').textContent = m.desc || '';
  renderControls(); buildSim(); resetView();
}
$('#sim-modes').addEventListener('click', e => {
  const b = e.target.closest('[data-mode]'); if (b) location.replace(`#/sim/${S.id}/${b.dataset.mode}`);
});

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
async function enterAR(id, modeId) {
  if (!SIMS[id]) { location.hash = '#/simulasi'; return; }
  const m = SIMS[id].modes.find(x => x.mode === modeId) || SIMS[id].modes[0];
  $('#ar-sub').textContent = `${BY_ID[id].judul} · ${m.label}`;
  $('#ar-status').textContent = 'Menyiapkan model…';
  if (S.id !== id || S.mode !== m.mode) { S.id = id; S.mode = m.mode; S.p = nilaiAwal(m); }
  if (!S.group || S.group.userData.key !== id + m.mode) { buildSim(); S.group.userData.key = id + m.mode; for (let i = 0; i < 60; i++) S.inst.update(1 / 30, S.p); }
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
  $('#bab-actions').insertAdjacentHTML('beforeend', `<a class="btn ghost" href="#/kuis/${id}"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Kuis bab ini</a>`);
  $('#bab-body').innerHTML = b.isi.replace(/<table/g, '<div class="table-wrap"><table').replace(/<\/table>/g, '</table></div>');
  $('#bab-contoh').innerHTML = `<h2><i class="fa-solid fa-pencil" aria-hidden="true" style="color:var(--accent)"></i> Contoh soal</h2>` +
    b.contoh.map((c, i) => `<div class="review"><p><b>Contoh ${i + 1}.</b> ${c.soal}</p><details><summary>Lihat pembahasan</summary><p style="margin-top:6px">${c.jawab}</p></details></div>`).join('');
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
   KUIS PER BAB — kunci & pembahasan hanya dikirim server setelah jawaban dikumpulkan
   ===================================================================== */
const simpan = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage diblokir */ } },
};
const terbaik = bab => Number(simpan.get('arfisma-best-' + bab)) || 0;
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);
const quiz = { name: simpan.get('arfisma-nama') || '', rombel: simpan.get('arfisma-rombel') || '', bab: null, soal: [], jawab: {}, i: 0, hasil: null };

// Gambar soal hanya dari Vercel Blob (https) atau data URL JPEG mode lokal; selain itu tidak dirender.
const gambarSoal = (url, alt, cls = '') => /^(https:\/\/|data:image\/jpeg;base64,)/.test(url || '') ? `<img class="soal-img ${cls}" src="${esc(url)}" alt="${esc(alt)}" loading="lazy">` : '';

async function api(url, { method = 'GET', body, token } = {}) {
  let r, j;
  try {
    r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body && JSON.stringify(body) });
    j = await r.json();
  } catch { throw Object.assign(new Error('Server tidak dapat dihubungi. Periksa internet, lalu coba lagi.'), { status: 0 }); }
  if (!r.ok || !j.ok) throw Object.assign(new Error(j.error || 'Terjadi kesalahan.'), { status: r.status });
  return j;
}

function enterKuis(babId) {
  if (!babId) return renderDaftarKuis();
  const b = BY_ID[babId]; if (!b) { location.hash = '#/kuis'; return; }
  $('#kuis-title').textContent = 'Kuis: ' + b.judul;
  if (quiz.bab === babId && quiz.soal.length && !quiz.hasil) return renderSoal(); // lanjutkan yang belum dikirim
  Object.assign(quiz, { bab: babId, soal: [], jawab: {}, i: 0, hasil: null });
  const t = terbaik(babId);
  $('#kuis-body').innerHTML = `<div class="card"><h2>${esc(b.judul)}</h2>
    <p>5 soal cerita yang menuntut analisis. Jawabanmu <b>tidak dinilai satu per satu</b>: benar-salah dan pembahasan baru muncul setelah semua jawaban dikirim.</p>
    <p class="muted" style="margin-top:6px;font-size:14px">${t ? `Nilai terbaikmu di bab ini: <b>${t}</b>` : 'Kamu belum pernah mengerjakan kuis bab ini.'}</p>
    <form id="q-form" novalidate>
      <label class="field" for="q-name" style="margin-top:12px">Nama lengkap</label><input class="input" id="q-name" autocomplete="name" required value="${esc(quiz.name)}" aria-describedby="q-err">
      <label class="field" for="q-rombel" style="margin-top:12px">Kelas/rombel</label><input class="input" id="q-rombel" placeholder="Contoh: X IPA 1" value="${esc(quiz.rombel)}">
      <p id="q-err" class="err-text" role="alert"></p>
      <p class="muted" style="font-size:13px"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Nama, kelas/rombel, dan nilaimu tercatat untuk guru.</p>
      <button class="btn accent" id="q-start" style="margin-top:14px"><i class="fa-solid fa-play" aria-hidden="true"></i> Mulai kuis</button>
    </form></div>`;
  $('#q-form').onsubmit = async e => {
    e.preventDefault();
    quiz.name = $('#q-name').value.trim(); quiz.rombel = $('#q-rombel').value.trim();
    if (!quiz.name) { $('#q-err').textContent = 'Isi nama lengkap dulu agar hasilmu tercatat.'; $('#q-name').focus(); return; }
    simpan.set('arfisma-nama', quiz.name); simpan.set('arfisma-rombel', quiz.rombel);
    const btn = $('#q-start'); btn.disabled = true; btn.textContent = 'Memuat soal…';
    try {
      quiz.soal = shuffle((await api(`/api/soal?bab=${encodeURIComponent(babId)}`)).soal);
      if (!quiz.soal.length) throw new Error('Belum ada soal untuk bab ini.');
      renderSoal();
    } catch (err) { $('#q-err').textContent = err.message; btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i> Coba lagi'; }
  };
}

function renderDaftarKuis() {
  $('#kuis-title').textContent = 'Kuis per Bab';
  $('#kuis-body').innerHTML = `<p class="muted" style="margin-bottom:12px">Setiap bab berisi 5 soal cerita HOTS. Hasil dan pembahasan ditampilkan setelah semua jawaban dikirim.</p>` +
    Object.entries(KELAS).map(([k, t]) => `<h2 class="group-title">${t}</h2><div class="list">${BAB.filter(b => b.kelas === k).map(b => {
      const n = terbaik(b.id);
      return `<a class="item" href="#/kuis/${b.id}"><span class="badge"><i class="fa-solid ${b.ikon}" aria-hidden="true"></i></span>
        <div><h3>${b.judul}</h3><div class="meta">${n ? `<span class="chip k-${k}">Nilai terbaik ${n}</span>` : 'Belum dikerjakan'}</div></div><i class="fa-solid fa-chevron-right chev" aria-hidden="true"></i></a>`;
    }).join('')}</div>`).join('');
}

function renderSoal() {
  const n = quiz.soal.length, s = quiz.soal[quiz.i], belum = quiz.soal.filter(x => !quiz.jawab[x.id]).length, akhir = quiz.i === n - 1;
  $('#kuis-body').innerHTML = `<div class="card">
    <div class="row" style="justify-content:space-between;font-weight:800"><span>Soal ${quiz.i + 1} dari ${n}</span><span style="flex:none" class="muted">${belum ? `${belum} belum dijawab` : 'Semua sudah dijawab'}</span></div>
    <nav class="qnav" aria-label="Pindah ke soal">${quiz.soal.map((x, k) => `<button data-ke="${k}" class="${quiz.jawab[x.id] ? 'isi' : ''}" ${k === quiz.i ? 'aria-current="step"' : ''} aria-label="Soal ${k + 1}${quiz.jawab[x.id] ? ', sudah dijawab' : ''}">${k + 1}</button>`).join('')}</nav>
    <h2 id="q-text" tabindex="-1" style="font-family:Nunito;font-size:17px;font-weight:700;line-height:1.55">${esc(s.pertanyaan)}</h2>
    ${gambarSoal(s.gambar, `Gambar pendukung soal ${quiz.i + 1}`)}
    <div class="opts" role="group" aria-label="Pilihan jawaban">${['A', 'B', 'C', 'D'].map(h => `<button class="opt" data-h="${h}" aria-pressed="${quiz.jawab[s.id] === h}"><span class="key">${h}</span>${esc(s[h.toLowerCase()])}</button>`).join('')}</div>
    <p id="q-err" class="err-text" role="alert"></p>
    <div class="row">
      <button class="btn ghost" id="q-prev" ${quiz.i === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Sebelumnya</button>
      ${akhir ? `<button class="btn accent" id="q-kirim"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Kirim jawaban</button>`
        : `<button class="btn" id="q-next">Berikutnya <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>`}
    </div>
    ${akhir ? '' : `<button class="btn ghost" id="q-kirim" style="margin-top:12px">Kirim jawaban sekarang</button>`}</div>`;
  $('#q-text').focus({ preventScroll: true });
  document.querySelectorAll('.opt').forEach(b => { b.onclick = () => { quiz.jawab[s.id] = b.dataset.h; renderSoal(); $(`.opt[data-h="${b.dataset.h}"]`).focus(); }; });
  document.querySelectorAll('.qnav button').forEach(b => { b.onclick = () => { quiz.i = +b.dataset.ke; renderSoal(); }; });
  $('#q-prev').onclick = () => { quiz.i--; renderSoal(); };
  if (!akhir) $('#q-next').onclick = () => { quiz.i++; renderSoal(); };
  $('#q-kirim').onclick = kirimJawaban;
}

async function kirimJawaban() {
  const belum = quiz.soal.filter(x => !quiz.jawab[x.id]).length;
  if (belum && !confirm(`Masih ada ${belum} soal yang belum dijawab dan akan dihitung salah. Tetap kirim?`)) return;
  const btn = $('#q-kirim'); btn.disabled = true; btn.textContent = 'Mengirim…';
  try {
    quiz.hasil = await api('/api/kuis', { method: 'POST', body: { bab: quiz.bab, judul: BY_ID[quiz.bab].judul, nama: quiz.name, rombel: quiz.rombel, jawaban: quiz.jawab } });
    if (quiz.hasil.nilai > terbaik(quiz.bab)) simpan.set('arfisma-best-' + quiz.bab, quiz.hasil.nilai);
    renderHasil();
  } catch (err) { $('#q-err').textContent = err.message + ' Jawabanmu masih tersimpan di layar ini.'; btn.disabled = false; btn.textContent = 'Kirim ulang'; }
}

function renderHasil() {
  const h = quiz.hasil, b = BY_ID[quiz.bab], C = 2 * Math.PI * 54;
  const msg = h.nilai >= 80 ? 'Luar biasa! Pemahamanmu sangat baik.' : h.nilai >= 60 ? 'Bagus! Pelajari pembahasan soal yang salah.' : 'Ayo pelajari lagi materi dan simulasinya, lalu coba lagi.';
  const opsi = (d, k) => k ? `${k}. ${esc(d.opsi[k])}` : 'Tidak dijawab';
  $('#kuis-body').innerHTML = `<div class="card" style="text-align:center"><h2 tabindex="-1" id="q-res">Hasil kuis ${esc(b.judul)}</h2>
    <p class="muted">${esc(quiz.name)}${quiz.rombel ? ' · ' + esc(quiz.rombel) : ''}</p>
    <svg class="score-ring" viewBox="0 0 140 140" role="img" aria-label="Nilai ${h.nilai} dari 100"><circle cx="70" cy="70" r="54" fill="none" stroke="var(--primary-100)" stroke-width="14"/>
      <circle cx="70" cy="70" r="54" fill="none" stroke="${h.nilai >= 60 ? 'var(--ok)' : 'var(--accent)'}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C * h.nilai / 100} ${C}" transform="rotate(-90 70 70)"/>
      <text x="70" y="80" text-anchor="middle" font-family="Baloo 2" font-weight="800" font-size="34" fill="var(--fg)">${h.nilai}</text></svg>
    <p><b>${h.benar}</b> dari ${h.jumlah} jawaban benar. ${msg}</p>
    <p class="muted" style="font-size:14px;margin-top:6px"><i class="fa-solid fa-circle-check" aria-hidden="true" style="color:var(--ok)"></i> Hasilmu sudah tercatat untuk guru.</p>
    <div class="row" style="margin-top:14px"><button class="btn ghost" id="q-again"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i> Ulangi</button><button class="btn ghost" id="q-csv"><i class="fa-solid fa-file-arrow-down" aria-hidden="true"></i> Unduh hasil</button></div>
    <div class="links" style="justify-content:center"><a class="btn small" href="#/bab/${b.id}">Baca materi</a>${SIMS[b.id] ? `<a class="btn small ghost" href="#/sim/${b.id}">Buka simulasi</a>` : ''}<a class="btn small ghost" href="#/kuis">Kuis bab lain</a></div></div>
    <div class="card"><h2>Pembahasan</h2>${h.detail.map((d, i) => `<div class="review">
      <p><b>Soal ${i + 1}.</b> ${esc(d.pertanyaan)}</p>
      ${gambarSoal(d.gambar, `Gambar pendukung soal ${i + 1}`)}
      <div class="feedback ${d.benar ? 'ok' : 'no'}" style="margin-top:8px"><i class="fa-solid ${d.benar ? 'fa-circle-check' : 'fa-circle-xmark'}" aria-hidden="true"></i> ${d.benar ? 'Benar' : 'Belum tepat'}. Jawabanmu: ${opsi(d, d.pilih)}${d.benar ? '' : `<br>Jawaban benar: ${opsi(d, d.kunci)}`}</div>
      <p class="muted" style="font-size:15px">${esc(d.pembahasan)}</p></div>`).join('')}</div>`;
  $('#q-res').focus();
  $('#q-again').onclick = () => { quiz.bab = null; enterKuis(b.id); };
  $('#q-csv').onclick = () => {
    const cell = v => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [['Nama', 'Rombel', 'Bab', 'Tanggal', 'Benar', 'Jumlah Soal', 'Nilai'].map(cell).join(','), [quiz.name, quiz.rombel, b.judul, new Date().toLocaleString('id-ID'), h.benar, h.jumlah, h.nilai].map(cell).join(','), '',
      ['No', 'Soal', 'Jawabanmu', 'Kunci', 'Status'].map(cell).join(','), ...h.detail.map((d, i) => [i + 1, d.pertanyaan, d.pilih || '-', d.kunci, d.benar ? 'Benar' : 'Salah'].map(cell).join(','))];
    const url = URL.createObjectURL(new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `hasil-kuis-${b.id}-${quiz.name.replace(/\W+/g, '_')}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}

/* =====================================================================
   MODE GURU — satu kata sandi (GURU_PASSWORD di Vercel), token disimpan per tab browser
   ===================================================================== */
const sesi = {
  get() { try { return sessionStorage.getItem('arfisma-guru') || ''; } catch { return ''; } },
  set(v) { try { v ? sessionStorage.setItem('arfisma-guru', v) : sessionStorage.removeItem('arfisma-guru'); } catch { /* storage diblokir */ } },
};
const guru = { token: sesi.get(), soal: [], bab: BAB[0].id, penyimpanan: '' };

function enterGuru() { guru.token ? muatBank() : renderLogin(); }

function renderLogin(pesan = '') {
  $('#guru-keluar').hidden = true;
  $('#guru-body').innerHTML = `<div class="card"><h2>Masuk sebagai guru</h2>
    <p class="muted" style="font-size:14px">Halaman ini untuk guru yang mengelola soal kuis. Siswa tidak memerlukan kata sandi.</p>
    <form id="g-login" novalidate>
      <label class="field" for="g-pass" style="margin-top:12px">Kata sandi guru</label>
      <input class="input" id="g-pass" type="password" autocomplete="current-password" required aria-describedby="g-err">
      <p id="g-err" class="err-text" role="alert">${esc(pesan)}</p>
      <button class="btn accent" id="g-masuk" style="margin-top:12px"><i class="fa-solid fa-right-to-bracket" aria-hidden="true"></i> Masuk</button>
    </form></div>`;
  $('#g-login').onsubmit = async e => {
    e.preventDefault();
    const btn = $('#g-masuk'); btn.disabled = true;
    try {
      guru.token = (await api('/api/guru', { method: 'POST', body: { aksi: 'login', password: $('#g-pass').value } })).token;
      sesi.set(guru.token); muatBank();
    } catch (err) { $('#g-err').textContent = err.message; btn.disabled = false; $('#g-pass').focus(); }
  };
}

async function muatBank() {
  $('#guru-keluar').hidden = false;
  $('#guru-body').innerHTML = '<p class="card muted" aria-live="polite">Memuat bank soal…</p>';
  try {
    const j = await api('/api/guru', { token: guru.token });
    guru.soal = j.soal; guru.penyimpanan = j.penyimpanan; renderBank();
  } catch (err) { gagalGuru(err); }
}
function gagalGuru(err) {
  if (err.status === 401) { guru.token = ''; sesi.set(''); return renderLogin(err.message); }
  $('#guru-body').innerHTML = `<div class="card"><p class="err-text" role="alert">${esc(err.message)}</p><button class="btn" id="g-ulang" style="margin-top:12px">Coba lagi</button></div>`;
  $('#g-ulang').onclick = muatBank;
}

function renderBank() {
  const daftar = guru.soal.filter(s => s.bab === guru.bab), aktif = daftar.filter(s => s.aktif).length;
  $('#guru-body').innerHTML = `
    ${guru.penyimpanan === 'file-lokal' ? '<p class="card err-text" role="status">Mode uji: perubahan disimpan di file lokal, belum ke Google Sheets.</p>' : ''}
    <div class="card"><h2>Bank soal</h2>
      <label class="field" for="g-bab">Bab</label>
      <select class="input" id="g-bab">${Object.entries(KELAS).map(([k, t]) => `<optgroup label="${t}">${BAB.filter(b => b.kelas === k).map(b => `<option value="${b.id}" ${b.id === guru.bab ? 'selected' : ''}>${esc(b.judul)} (${guru.soal.filter(s => s.bab === b.id && s.aktif).length})</option>`).join('')}</optgroup>`).join('')}</select>
      <p class="muted" style="font-size:14px;margin-top:8px">${aktif} soal aktif tampil di kuis siswa${daftar.length > aktif ? `, ${daftar.length - aktif} nonaktif` : ''}.</p>
      <button class="btn accent" id="g-tambah" style="margin-top:12px"><i class="fa-solid fa-plus" aria-hidden="true"></i> Tambah soal</button></div>
    <div class="list">${daftar.length ? daftar.map((s, i) => `<div class="card" style="margin:0">
      <p><b>${i + 1}.</b> ${esc(s.pertanyaan.length > 180 ? s.pertanyaan.slice(0, 180) + '…' : s.pertanyaan)}</p>
      ${gambarSoal(s.gambar, `Gambar soal ${i + 1}`, 'thumb')}
      <div class="meta" style="margin:8px 0;display:flex;gap:6px;flex-wrap:wrap"><span class="chip k-3d">Kunci ${esc(s.jawaban)}</span>${s.aktif ? '<span class="chip k-X">Aktif</span>' : '<span class="chip" style="background:var(--err-50);color:var(--err)">Nonaktif</span>'}${s.diubah ? `<span class="muted" style="font-size:12px">Diubah ${esc(s.diubah)}</span>` : ''}</div>
      <div class="row"><button class="btn small ghost" data-ubah="${esc(s.id)}"><i class="fa-solid fa-pen" aria-hidden="true"></i> Ubah</button><button class="btn small ghost" data-hapus="${esc(s.id)}"><i class="fa-solid fa-trash" aria-hidden="true"></i> Hapus</button></div></div>`).join('')
      : '<p class="card muted">Belum ada soal untuk bab ini. Tekan <b>Tambah soal</b> untuk membuat.</p>'}</div>`;
  $('#g-bab').onchange = e => { guru.bab = e.target.value; renderBank(); };
  $('#g-tambah').onclick = () => renderEditor(null);
  document.querySelectorAll('[data-ubah]').forEach(b => { b.onclick = () => renderEditor(guru.soal.find(s => s.id === b.dataset.ubah)); });
  document.querySelectorAll('[data-hapus]').forEach(b => { b.onclick = () => hapusSoal(b.dataset.hapus); });
}

function renderEditor(s) {
  const v = s || { bab: guru.bab, pertanyaan: '', a: '', b: '', c: '', d: '', jawaban: 'A', pembahasan: '', aktif: true, gambar: '' };
  let gambar = v.gambar || '', mengunggah = false;
  const f = (id, label, val, area) => `<label class="field" for="${id}" style="margin-top:12px">${label}</label>${area ? `<textarea class="input" id="${id}" required>${esc(val)}</textarea>` : `<input class="input" id="${id}" required value="${esc(val)}">`}`;
  $('#guru-body').innerHTML = `<form class="card" id="g-form" novalidate><h2>${s ? 'Ubah soal' : 'Tambah soal'}</h2>
    <label class="field" for="e-bab">Bab</label>
    <select class="input" id="e-bab">${BAB.map(b => `<option value="${b.id}" ${b.id === v.bab ? 'selected' : ''}>${KELAS[b.kelas]} · ${esc(b.judul)}</option>`).join('')}</select>
    ${f('e-tanya', 'Pertanyaan (soal cerita)', v.pertanyaan, true)}
    <label class="field" for="e-file" style="margin-top:12px">Gambar pendukung (opsional)</label>
    <div class="gbr-box"><div id="e-gbr"></div>
      <input type="file" id="e-file" accept="image/*" aria-describedby="e-gbr-info">
      <p id="e-gbr-info" class="muted" style="font-size:13px;margin-top:6px">JPG/PNG/WebP dari galeri atau kamera. Gambar diperkecil otomatis sebelum diunggah.</p></div>
    ${f('e-a', 'Opsi A', v.a)}${f('e-b', 'Opsi B', v.b)}${f('e-c', 'Opsi C', v.c)}${f('e-d', 'Opsi D', v.d)}
    <label class="field" for="e-kunci" style="margin-top:12px">Kunci jawaban</label>
    <select class="input" id="e-kunci">${['A', 'B', 'C', 'D'].map(h => `<option ${h === v.jawaban ? 'selected' : ''}>${h}</option>`).join('')}</select>
    ${f('e-bahas', 'Pembahasan (ditampilkan ke siswa setelah kuis dikirim)', v.pembahasan, true)}
    <label class="row" style="align-items:center;gap:10px;margin-top:14px;font-weight:700"><input type="checkbox" id="e-aktif" ${v.aktif ? 'checked' : ''} style="width:22px;height:22px;flex:none"> Aktif (tampil di kuis siswa)</label>
    <p id="e-err" class="err-text" role="alert"></p>
    <div class="row" style="margin-top:12px"><button type="button" class="btn ghost" id="e-batal">Batal</button><button class="btn accent" id="e-simpan"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Simpan soal</button></div></form>`;
  const tampilGambar = () => {
    $('#e-gbr').innerHTML = gambar ? `${gambarSoal(gambar, 'Pratinjau gambar soal')}<button type="button" class="btn small ghost" id="e-gbr-hapus"><i class="fa-solid fa-xmark" aria-hidden="true"></i> Hapus gambar</button>` : '';
    if (gambar) $('#e-gbr-hapus').onclick = () => { gambar = ''; tampilGambar(); $('#e-file').value = ''; };
  };
  tampilGambar();
  $('#e-file').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    mengunggah = true; $('#e-simpan').disabled = true; $('#e-err').textContent = ''; $('#e-gbr-info').textContent = 'Mengunggah gambar…';
    try {
      gambar = (await api('/api/guru', { method: 'POST', token: guru.token, body: { aksi: 'gambar', data: await kompresGambar(file) } })).url;
      tampilGambar(); $('#e-gbr-info').textContent = 'Gambar terunggah. Tekan Simpan soal untuk menyimpannya.';
    } catch (err) {
      if (err.status === 401) return gagalGuru(err);
      $('#e-err').textContent = err.message; $('#e-gbr-info').textContent = 'Gagal mengunggah. Pilih gambar lain atau coba lagi.'; e.target.value = '';
    } finally { mengunggah = false; $('#e-simpan').disabled = false; }
  };
  $('#e-tanya').focus();
  $('#e-batal').onclick = renderBank;
  $('#g-form').onsubmit = async e => {
    e.preventDefault();
    const soal = { id: s?.id || '', bab: $('#e-bab').value, pertanyaan: $('#e-tanya').value, a: $('#e-a').value, b: $('#e-b').value, c: $('#e-c').value, d: $('#e-d').value,
      jawaban: $('#e-kunci').value, pembahasan: $('#e-bahas').value, aktif: $('#e-aktif').checked, gambar };
    if (mengunggah) return;
    const btn = $('#e-simpan'); btn.disabled = true;
    try {
      const j = await api('/api/guru', { method: 'POST', token: guru.token, body: { aksi: 'simpan', soal } });
      const i = guru.soal.findIndex(x => x.id === j.soal.id);
      if (i < 0) guru.soal.push(j.soal); else guru.soal[i] = j.soal;
      guru.bab = j.soal.bab; renderBank(); toast('Soal tersimpan.');
    } catch (err) { if (err.status === 401) return gagalGuru(err); $('#e-err').textContent = err.message; btn.disabled = false; }
  };
}

// Perkecil ke sisi terpanjang 1280 px lalu ubah ke JPEG (latar putih untuk PNG transparan); hasil base64 tanpa prefiks.
async function kompresGambar(file) {
  if (!file.type.startsWith('image/')) throw new Error('File yang dipilih bukan gambar.');
  let bmp;
  try { bmp = await createImageBitmap(file); } catch { throw new Error('Format gambar tidak didukung browser ini. Pakai JPG atau PNG.'); }
  const k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height)), cv = document.createElement('canvas');
  cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
  const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(bmp, 0, 0, cv.width, cv.height);
  for (const q of [0.82, 0.65, 0.5]) {
    const url = cv.toDataURL('image/jpeg', q);
    if (url.length * 0.75 < 1_400_000) return url.slice(url.indexOf(',') + 1);
  }
  throw new Error('Gambar terlalu besar. Pilih gambar dengan ukuran lebih kecil.');
}

async function hapusSoal(id) {
  if (!confirm('Hapus soal ini? Tindakan ini tidak bisa dibatalkan.')) return;
  try {
    await api('/api/guru', { method: 'POST', token: guru.token, body: { aksi: 'hapus', id } });
    guru.soal = guru.soal.filter(s => s.id !== id); renderBank(); toast('Soal dihapus.');
  } catch (err) { gagalGuru(err); }
}

function renderTentang() {
  $('#tentang-body').innerHTML = `
    <div class="card"><h2><i class="fa-solid fa-bullseye" aria-hidden="true" style="color:var(--accent)"></i> Capaian Pembelajaran</h2><p>${CP}</p></div>
    <div class="card"><h2><i class="fa-solid fa-list-check" aria-hidden="true" style="color:var(--primary)"></i> Tujuan Pembelajaran</h2><ol class="prose" style="padding-left:20px">${TP.map(t => `<li>${t}</li>`).join('')}</ol></div>
    <div class="card"><h2><i class="fa-solid fa-book-bookmark" aria-hidden="true" style="color:var(--primary)"></i> Panduan Penggunaan</h2>
      <ol class="list" style="list-style:none">${PANDUAN.map(([t, d], i) => `<li class="row" style="align-items:flex-start;gap:12px"><span class="badge" style="width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:var(--primary);color:#fff;font-size:15px;font-weight:800">${i + 1}</span><p style="flex:1"><b>${t}.</b> ${d}</p></li>`).join('')}</ol></div>
    <div class="card"><h2><i class="fa-solid fa-user" aria-hidden="true" style="color:var(--primary)"></i> Pengembang</h2>
      ${CONFIG.pengembang.map(p => `<div class="item" style="box-shadow:none;border:2px solid var(--primary-100);margin-top:10px"><span class="badge"><i class="fa-solid fa-user" aria-hidden="true"></i></span><div><h3>${esc(p.nama)}</h3><div class="meta">${esc(p.peran)}${p.instansi ? ' · ' + esc(p.instansi) : ''}</div><div class="meta">${esc(p.email)}</div></div></div>`).join('')}
      <p class="muted" style="font-size:13px;margin-top:12px">${CONFIG.appName} v${CONFIG.versi} · ${BAB.length} bab, ${SIM_IDS.length} simulasi 3D (three.js), AR via WebXR / AR Quick Look. Percepatan gravitasi g = 10 m/s².</p></div>`;
}

/* =====================================================================
   ROUTER
   ===================================================================== */
const SCREENS = { '': 's-splash', home: 's-home', materi: 's-materi', simulasi: 's-materi', bab: 's-bab', sim: 's-sim', ar: 's-ar', scan: 's-scan', marker: 's-marker', kuis: 's-kuis', tentang: 's-tentang', guru: 's-guru' };
const TAB_OF = { bab: 'materi', sim: 'simulasi', ar: 'simulasi' };
const ENTER = {
  home: renderHome, materi: a => enterMateri(a ?? '', false), simulasi: () => enterMateri(undefined, true), bab: enterBab, sim: enterSim, ar: enterAR,
  scan: enterScan, marker: enterMarker, kuis: enterKuis, tentang: renderTentang, guru: enterGuru,
};
const stack = [];
function route() {
  const [name = '', arg, arg2] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  if (stack.at(-2) === location.hash) stack.pop(); else stack.push(location.hash);
  if (name !== 'sim') stopCam();
  if (name !== 'scan') stopScan();
  const id = SCREENS[name] ?? 's-home';
  document.querySelectorAll('.screen').forEach(s => { s.hidden = s.id !== id; });
  const nav = $('#nav'); nav.hidden = id === 's-splash';
  const tab = TAB_OF[name] || name;
  nav.querySelectorAll('a').forEach(a => a.dataset.tab === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  window.scrollTo(0, 0);
  ENTER[name]?.(arg, arg2);
  if (id !== 's-splash') $(`#${id} h1`)?.focus({ preventScroll: true });
}

document.addEventListener('click', e => {
  if (e.target.closest('[data-back]')) { if (stack.length > 1) history.back(); else location.hash = '#/home'; return; }
  const kb = e.target.closest('[data-kelas]');
  if (kb) { filt.kelas = kb.dataset.kelas; document.querySelectorAll('[data-kelas]').forEach(x => x.setAttribute('aria-pressed', x === kb)); renderBabList(); }
});
$('#bab-search').addEventListener('input', e => { filt.q = e.target.value.trim(); renderBabList(); });
$('#print-btn').addEventListener('click', () => window.print());
$('#guru-keluar').addEventListener('click', () => { guru.token = ''; sesi.set(''); renderLogin(); toast('Anda keluar dari mode guru.'); });

bindSimTools();
addEventListener('hashchange', route);
route();
$('#engine-status').textContent = `Versi ${CONFIG.versi} · ${BAB.length} bab · siap digunakan`;
