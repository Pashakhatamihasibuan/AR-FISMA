// Server pengembangan lokal: menyajikan file statis + menjalankan api/*.js seperti Vercel Functions.
// Jalankan: node dev-server.mjs  (opsional: GURU_PASSWORD=... dan kredensial Google di environment)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd(), PORT = Number(process.env.PORT || 8766);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname.startsWith('/api/')) {
    const nama = url.pathname.slice(5).replace(/[^a-z-]/g, '');
    const file = path.join(ROOT, 'api', `${nama}.js`);
    if (!nama || !fs.existsSync(file)) { res.writeHead(404); return res.end('{}'); }
    let raw = ''; for await (const c of req) raw += c;
    req.query = Object.fromEntries(url.searchParams);
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    res.status = k => { res.statusCode = k; return res; };
    res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
    const { default: handler } = await import(pathToFileURL(file).href);
    return handler(req, res);
  }
  const rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || rel.startsWith('/api') || rel.startsWith('/.data') || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Tidak ditemukan'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`AR-FISMA dev: http://localhost:${PORT}`));
