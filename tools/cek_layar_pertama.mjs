#!/usr/bin/env node
// Pemeriksaan otomatis aturan layar pertama.
//
// Semua halaman di docs/. Halaman dengan "## Inti": visual pertama sesudah Inti harus
// terlihat UTUH tanpa scroll di empat viewport, dan halaman tidak boleh punya
// scroll horizontal. Halaman tanpa Inti: visual pertama sesudah H1 (kalau ada) harus utuh. Tanpa dependensi: Chrome headless lewat DevTools Protocol,
// WebSocket bawaan Node >= 22.
//
// Pakai:
//   .venv/bin/mkdocs build --strict && node tools/cek_layar_pertama.mjs
//   node tools/cek_layar_pertama.mjs --min-margin 20   (ambang peringatan, px)
//   node tools/cek_layar_pertama.mjs --hanya b2-5     (hanya halaman yang path-nya memuat teks ini)
//
// Keluar 1 kalau ada visual yang terpotong atau scroll horizontal.
// Margin < --min-margin hanya peringatan, supaya batas tipis terlihat sebelum pecah.

import fs from "node:fs";
import path from "node:path";
import { ROOT, SITE, CHROME, VIEWPORTS, serve, launchChrome } from "./lib/chrome.mjs";

const DOCS = path.join(ROOT, "docs");

const args = process.argv.slice(2);
const minMargin = Number(args[args.indexOf("--min-margin") + 1]) || 20;
const hanya = args.includes("--hanya") ? args[args.indexOf("--hanya") + 1] : "";

function halamanTarget() {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".md")) {
        const rel = path.relative(DOCS, p).replace(/\.md$/, "");
        const inti = /^## Inti\s*$/m.test(fs.readFileSync(p, "utf8"));
        out.push({ src: path.relative(ROOT, p), inti, url: "/" + (path.basename(rel) === "index" ? rel.slice(0, -5) : rel + "/") });
      }
    }
  })(DOCS);
  return out.sort((a, b) => a.src.localeCompare(b.src));
}

// Dijalankan di halaman. Mengembalikan posisi visual pertama sesudah h2#inti.
// Halaman tanpa Inti (halaman alat, peta, glosarium): visual pertama sesudah H1, kalau ada.
const UKUR = (inti) => `(async () => {
  await document.fonts.ready;
  const h2 = ${inti} ? document.getElementById("inti") : document.querySelector("article h1");
  if (!h2) return { error: ${inti} ? "h2#inti tidak ditemukan" : "h1 tidak ditemukan" };
  const isVisual = (el) => el.matches("figure, img, svg, .bb-fig") || el.querySelector("figure, img, svg, .bb-fig");
  let el = h2.nextElementSibling, host = null;
  while (el && el.tagName !== "H2") { if (isVisual(el) || el.dataset.bb) { host = el; break; } el = el.nextElementSibling; }
  if (!host) return ${inti} ? { error: "tidak ada visual di antara Inti dan H2 berikutnya" } : { tanpaVisual: true };
  // Widget dirender async (fetch JSON): tunggu sampai ada figure di dalamnya.
  for (let i = 0; i < 50 && !host.matches("figure, img, svg") && !host.querySelector("figure, img, svg"); i++)
    await new Promise((r) => setTimeout(r, 100));
  let vis = host.matches("figure, img, svg") ? host : host.querySelector("figure, img, svg");
  // Halaman alat: widget tanpa gambar (kartu, tabel umpan balik) cukup MULAI terlihat (>= 100 px).
  if (!vis && !${inti} && host.dataset.bb && host.textContent.trim()) {
    window.scrollTo(0, 0);
    const b = host.getBoundingClientRect();
    return { mulai: true, top: b.top, vh: innerHeight, vw: innerWidth, sw: document.documentElement.scrollWidth };
  }
  if (!vis) return { error: "visual tidak muncul (widget gagal render?): " + host.textContent.trim().slice(0, 80) };
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.scrollTo(0, 0);
  const b = vis.getBoundingClientRect();
  return { top: b.top, bottom: b.bottom, vh: innerHeight, vw: innerWidth,
           sw: document.documentElement.scrollWidth, scrollY: scrollY };
})()`;

async function main() {
  if (!CHROME) { console.error("Chrome tidak ditemukan. Set CHROME_PATH."); process.exit(2); }
  if (!fs.existsSync(path.join(SITE, "index.html"))) { console.error("site/ belum ada. Jalankan: .venv/bin/mkdocs build --strict"); process.exit(2); }
  const pages = halamanTarget().filter((p) => p.src.includes(hanya));
  if (!pages.length) { console.error("Tidak ada halaman dengan '## Inti'."); process.exit(2); }

  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}`;
  const c = await launchChrome();
  await c.send("Page.enable");
  await c.send("Runtime.enable");

  let gagal = 0, tipis = 0;
  console.log(`Aturan layar pertama · ${pages.length} halaman × ${VIEWPORTS.length} viewport · peringatan bila margin < ${minMargin}px\n`);
  for (const pg of pages) {
    console.log(pg.src);
    for (const vp of VIEWPORTS) {
      await c.send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height,
        deviceScaleFactor: vp.dpr, mobile: vp.mobile });
      await c.send("Emulation.setTouchEmulationEnabled", { enabled: vp.mobile });
      const loaded = c.once("Page.loadEventFired");
      await c.send("Page.navigate", { url: base + pg.url });
      await loaded;
      const { result, exceptionDetails } = await c.send("Runtime.evaluate",
        { expression: UKUR(pg.inti), awaitPromise: true, returnByValue: true });
      const r = exceptionDetails ? { error: exceptionDetails.text } : result.value;
      let status, detail;
      if (r.error) { status = "GAGAL"; detail = r.error; gagal++; }
      else if (r.mulai) {
        const sisa = Math.floor(r.vh - r.top), hscroll = r.sw > r.vw;
        detail = `widget mulai di ${Math.round(r.top)}px, terlihat ${sisa}px` + (hscroll ? `, SCROLL HORIZONTAL (${r.sw} > ${r.vw})` : "");
        if (sisa < 100 || hscroll) { status = "GAGAL"; gagal++; } else status = "ok";
      }
      else if (r.tanpaVisual) { status = "info"; detail = "tanpa visual sebelum H2 pertama (halaman alat)"; }
      else {
        const margin = Math.floor(r.vh - r.bottom);
        const hscroll = r.sw > r.vw;
        detail = `visual ${Math.round(r.top)}–${Math.round(r.bottom)}px dari ${r.vh}, margin ${margin}px` +
          (hscroll ? `, SCROLL HORIZONTAL (${r.sw} > ${r.vw})` : "");
        if (margin < 0 || hscroll) { status = "GAGAL"; gagal++; }
        else if (margin < minMargin) { status = "TIPIS"; tipis++; }
        else status = "ok";
      }
      console.log(`  ${status.padEnd(5)} ${vp.name.padEnd(8)} ${detail}`);
    }
  }
  await c.close();
  srv.close();
  console.log(`\n${gagal ? "GAGAL" : "LOLOS"}: ${gagal} gagal, ${tipis} margin tipis.`);
  process.exit(gagal ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
