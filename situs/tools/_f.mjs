import { chromium } from "@playwright/test";
const [,, url, out, w, h, sel, buka] = process.argv;
const b = await chromium.launch(); const m = +w < 500; const c = await b.newContext({ viewport: { width: +w, height: +h }, isMobile: m });
const p = await c.newPage(); await p.goto(url, { waitUntil: "networkidle" });
if (buka) await p.evaluate(() => document.querySelectorAll("details.blok").forEach((d) => (d.open = true)));
await (await p.$(sel)).screenshot({ path: out }); await b.close();
