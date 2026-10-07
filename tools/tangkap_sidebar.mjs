// Tangkapan sidebar (nav kiri) dengan grup Tahap 1–3 terbuka, untuk bukti perubahan navigasi.
//   .venv/bin/mkdocs build --strict && node tools/tangkap_sidebar.mjs sidebar.png
import fs from "node:fs";
import { serve, launchChrome } from "./lib/chrome.mjs";
const out = process.argv[2] || "sidebar.png";
const url = process.argv[3] || "/cerita/peta/";
const srv = await serve();
const c = await launchChrome();
await c.send("Page.enable"); await c.send("Runtime.enable");
await c.send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 3000, deviceScaleFactor: 1, mobile: false });
const loaded = c.once("Page.loadEventFired");
await c.send("Page.navigate", { url: `http://127.0.0.1:${srv.address().port}${url}` });
await loaded;
const { result } = await c.send("Runtime.evaluate", { awaitPromise: true, returnByValue: true, expression: `(async () => {
  for (const lab of document.querySelectorAll(".md-sidebar--primary .md-nav__item--nested > .md-nav__link, .md-sidebar--primary label.md-nav__link")) {
    if (/^\\s*Tahap [123]\\b/.test(lab.textContent)) {
      const t = document.getElementById(lab.getAttribute("for")) || lab.parentElement.querySelector(":scope > input.md-nav__toggle");
      if (t && !t.checked) t.click();
    }
  }
  await new Promise((r) => setTimeout(r, 1200));
  const s = document.querySelector(".md-sidebar--primary .md-sidebar__scrollwrap");
  s.style.maxHeight = "none"; s.style.height = "auto"; s.style.overflow = "visible";
  document.querySelector(".md-sidebar--primary").style.height = "auto";
  await new Promise((r) => setTimeout(r, 300));
  const b = document.querySelector(".md-sidebar--primary .md-nav--primary").getBoundingClientRect();
  return { x: b.left, y: b.top + scrollY, w: b.width, h: b.height };
})()` });
const r = result.value;
const shot = await c.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true,
  clip: { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: r.w + 16, height: Math.min(r.h + 16, 2900), scale: 1 } });
fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log(out, Math.round(r.w), "x", Math.round(r.h));
await c.close(); srv.close();
