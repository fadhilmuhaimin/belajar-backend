// Aturan layar pertama untuk situs baru (padanan tools/cek_layar_pertama.mjs): visual pertama sesudah "## Inti"
// harus terlihat utuh tanpa scroll di 4 viewport, dan halaman tidak boleh punya scroll horizontal.
// Pakai: node tools/layar.mjs [--url http://127.0.0.1:4321] [--min-margin 20]
// Halaman yang diperiksa: semua halaman konten di dist/ (selain beranda dan 404). Exit 1 bila ada yang gagal.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg("--url", "http://127.0.0.1:4321");
const MIN = Number(arg("--min-margin", 20));
const VIEWPORTS = [
  { name: "1366x768", width: 1366, height: 768 }, { name: "1366x657", width: 1366, height: 657 },
  { name: "375x812", width: 375, height: 812, mobile: true }, { name: "375x667", width: 375, height: 667, mobile: true },
];
function halaman() {
  const out = [];
  (function walk(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) { if (!["_astro", "pagefind", "widgets", "vendor", "fonts"].includes(e.name)) walk(path.join(d, e.name), rel + e.name + "/"); }
      else if (e.name === "index.html" && rel !== "") out.push(rel);
    }
  })(path.resolve("dist"), "");
  return out.sort();
}
const UKUR = `(async () => {
  await document.fonts.ready;
  const h2 = document.getElementById("inti");
  if (!h2) return { tanpaInti: true };
  const isVisual = (el) => el.matches("figure, img, svg, .bb-fig") || el.querySelector("figure, img, svg, .bb-fig");
  // Starlight membungkus heading: <div class="sl-heading-wrapper"><h2/><a class="sl-anchor-link"><svg/></a></div>
  const awal = h2.closest(".sl-heading-wrapper") || h2;
  const adaH2 = (n) => n.tagName === "H2" || !!n.querySelector("h2");
  let el = awal.nextElementSibling, host = null;
  while (el && !adaH2(el)) { if (isVisual(el) || el.dataset.bb) { host = el; break; } el = el.nextElementSibling; }
  if (!host) return { error: "tidak ada visual di antara Inti dan H2 berikutnya" };
  for (let i = 0; i < 50 && !host.matches("figure, img, svg") && !host.querySelector("figure, img, svg"); i++) await new Promise((r) => setTimeout(r, 100));
  const vis = host.matches("figure, img, svg") ? host : host.querySelector("figure, img, svg");
  if (!vis) return { error: "visual tidak muncul (widget gagal?)" };
  window.scrollTo(0, 0);
  const b = vis.getBoundingClientRect();
  return { bottom: Math.round(b.bottom), tinggi: window.innerHeight, scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth };
})()`;
const browser = await chromium.launch();
let gagal = 0, tipis = 0;
for (const p of halaman()) {
  const baris = [];
  for (const v of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, isMobile: !!v.mobile, hasTouch: !!v.mobile, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(BASE + "/" + p, { waitUntil: "networkidle" });
    const r = await page.evaluate(UKUR);
    await ctx.close();
    if (r.tanpaInti) { baris.push(`  info  ${v.name} tanpa Inti`); continue; }
    if (r.error) { gagal++; baris.push(`  GAGAL ${v.name} ${r.error}`); continue; }
    const margin = r.tinggi - r.bottom;
    if (r.scrollX) { gagal++; baris.push(`  GAGAL ${v.name} scroll horizontal`); }
    if (margin < 0) { gagal++; baris.push(`  GAGAL ${v.name} visual terpotong ${-margin}px`); }
    else if (margin < MIN) { tipis++; baris.push(`  tipis ${v.name} margin ${margin}px`); }
    else baris.push(`  ok    ${v.name} margin ${margin}px`);
  }
  console.log("/" + p); console.log(baris.join("\n"));
}
await browser.close();
console.log(`\n${gagal ? "GAGAL" : "LOLOS"}: ${gagal} gagal, ${tipis} margin tipis.`);
process.exit(gagal ? 1 : 0);
