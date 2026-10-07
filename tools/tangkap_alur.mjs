#!/usr/bin/env node
// Tangkap layar widget alur (A2) untuk membuktikan refaktor tidak mengubah tampilan.
//
// Per viewport (4 ukuran): layar pertama halaman, lalu widget alur dalam empat keadaan:
// awal, langkah 4, langkah 9 (akhir jalur normal), dan akhir jalur varian.
// Animasi dan transisi dimatikan supaya hasilnya deterministik.
//
// Pakai:
//   node tools/tangkap_alur.mjs <folder-keluaran>
//   node tools/tangkap_alur.mjs <folder-baru> --banding <folder-lama>   (exit 1 kalau ada yang beda)
//   node tools/tangkap_alur.mjs <folder> --url /b-fondasi/b10-2-webhook-outbox/   (halaman lain)

import fs from "node:fs";
import path from "node:path";
import { SITE, VIEWPORTS, serve, launchChrome } from "./lib/chrome.mjs";

const args = process.argv.slice(2);
const out = args[0];
const banding = args.includes("--banding") ? args[args.indexOf("--banding") + 1] : null;
const URL_A2 = args.includes("--url") ? args[args.indexOf("--url") + 1] : "/a-gambaran/a2-perjalanan-request/";
if (!out) { console.error("Pakai: node tools/tangkap_alur.mjs <folder> [--banding <folder-lama>]"); process.exit(2); }
if (!fs.existsSync(path.join(SITE, "index.html"))) { console.error("site/ belum ada. Jalankan mkdocs build."); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

const SIAP = `(async () => {
  await document.fonts.ready;
  const st = document.createElement("style");
  st.textContent = "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";
  document.head.appendChild(st);
  for (let i = 0; i < 50 && !document.querySelector(".bb-alur"); i++) await new Promise((r) => setTimeout(r, 100));
  return !!document.querySelector(".bb-alur");
})()`;

// Bawa widget ke keadaan tertentu, lalu kembalikan kotak widget (koordinat halaman).
const KE = (keadaan) => `(async () => {
  const w = document.querySelector(".bb-alur");
  const next = [...w.querySelectorAll("button")].find((b) => b.textContent.startsWith("Berikutnya"));
  const tebak = w.querySelector(".bb-predict button:not([disabled])");
  const keadaan = ${JSON.stringify(keadaan)};
  if (keadaan !== "awal" && tebak) tebak.click();
  const maju = (n) => { for (let k = 0; k < n && !next.disabled; k++) next.click(); };
  if (keadaan === "langkah4") maju(4);
  if (keadaan === "langkah9") maju(99);  // akhir jalur normal
  if (keadaan === "varian") { maju(99); w.querySelector(".bb-alur__varian input").click(); maju(99); }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const b = w.getBoundingClientRect();
  return { x: b.left + scrollX, y: b.top + scrollY, width: b.width, height: b.height };
})()`;

async function main() {
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}`;
  const c = await launchChrome();
  await c.send("Page.enable");
  const files = [];
  for (const vp of VIEWPORTS) {
    await c.send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
    await c.send("Emulation.setTouchEmulationEnabled", { enabled: vp.mobile });
    for (const keadaan of ["layar-pertama", "awal", "langkah4", "langkah9", "varian"]) {
      const loaded = c.once("Page.loadEventFired");
      await c.send("Page.navigate", { url: base + URL_A2 });
      await loaded;
      const ok = await c.send("Runtime.evaluate", { expression: SIAP, awaitPromise: true, returnByValue: true });
      if (!ok.result.value) throw new Error("widget alur tidak muncul di " + vp.name);
      let params = { format: "png" };
      if (keadaan !== "layar-pertama") {
        const r = await c.send("Runtime.evaluate", { expression: KE(keadaan), awaitPromise: true, returnByValue: true });
        const clip = r.result.value;
        params = { format: "png", captureBeyondViewport: true, clip: { ...clip, scale: 1 } };
      }
      const shot = await c.send("Page.captureScreenshot", params);
      const name = `${vp.name}-${keadaan}.png`;
      fs.writeFileSync(path.join(out, name), Buffer.from(shot.data, "base64"));
      files.push(name);
    }
  }
  await c.close();
  srv.close();
  console.log(`${files.length} tangkapan → ${out}`);
  if (banding) {
    let beda = 0;
    for (const f of files) {
      const a = fs.readFileSync(path.join(out, f)), b = fs.existsSync(path.join(banding, f)) ? fs.readFileSync(path.join(banding, f)) : null;
      const sama = b && a.equals(b);
      if (!sama) beda++;
      console.log(`  ${sama ? "identik" : "BEDA   "} ${f}`);
    }
    console.log(beda ? `\n${beda} tangkapan berbeda.` : "\nSemua tangkapan identik byte demi byte.");
    process.exit(beda ? 1 : 0);
  }
}

main().catch((e) => { console.error(e); process.exit(2); });
