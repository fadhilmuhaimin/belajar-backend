// Bersama untuk alat yang memeriksa situs hasil build di Chrome headless (tanpa dependensi).
// serve(): server statis untuk site/. launchChrome(): DevTools Protocol lewat WebSocket bawaan Node >= 22.
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const SITE = path.join(ROOT, "site");

export const CHROME = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && fs.existsSync(p));

export const VIEWPORTS = [
  { name: "1366x768", width: 1366, height: 768, mobile: false, dpr: 1 },
  { name: "1366x657", width: 1366, height: 657, mobile: false, dpr: 1 },
  { name: "375x812", width: 375, height: 812, mobile: true, dpr: 3 },
  { name: "375x667", width: 375, height: 667, mobile: true, dpr: 2 },
];

const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2",
  ".wasm": "application/wasm", ".webp": "image/webp" };

export function serve() {
  const srv = http.createServer((req, res) => {
    let p = path.join(SITE, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!p.startsWith(SITE)) return res.writeHead(403).end();
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
    fs.readFile(p, (err, buf) => {
      if (err) return res.writeHead(404).end();
      res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }).end(buf);
    });
  });
  return new Promise((r) => srv.listen(0, "127.0.0.1", () => r(srv)));
}

export async function launchChrome() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cek-layar-"));
  const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${dir}`,
    "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
  const portFile = path.join(dir, "DevToolsActivePort");
  for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await new Promise((r) => setTimeout(r, 100));
  const [port] = fs.readFileSync(portFile, "utf8").split("\n");
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const { r, j } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? j(new Error(msg.error.message)) : r(msg.result);
    } else if (msg.method) listeners.forEach((f) => f(msg));
  };
  const send = (method, params = {}) => new Promise((r, j) => {
    pending.set(++id, { r, j });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const once = (method) => new Promise((r) => {
    const f = (m) => { if (m.method === method) { listeners.splice(listeners.indexOf(f), 1); r(m); } };
    listeners.push(f);
  });
  const close = async () => {
    ws.close();
    const exited = new Promise((r) => proc.once("exit", r));
    proc.kill();
    await exited;
    // Profil sementara. Proses anak Chrome kadang masih menulis sesaat setelah proses utama keluar
    // (ENOTEMPTY di runner Linux), jadi dicoba lagi, dan kegagalan membersihkan tidak menggagalkan pemeriksaan.
    for (let i = 0; i < 10; i++) {
      try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5 }); break; }
      catch (e) { if (i === 9) console.warn(`peringatan: profil Chrome sementara tidak terhapus: ${dir} (${e.code})`); else await new Promise((r) => setTimeout(r, 300)); }
    }
  };
  return { send, once, close };
}

