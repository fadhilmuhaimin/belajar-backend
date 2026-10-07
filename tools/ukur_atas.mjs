// Bantu diagnosis layar pertama: posisi setiap elemen di atas visual pertama sesudah Inti.
//   node tools/ukur_atas.mjs /b-fondasi/b2-5-connection-pool/ 1366x657
import { SITE, VIEWPORTS, serve, launchChrome } from "./lib/chrome.mjs";
const [url, vpn = "1366x657"] = process.argv.slice(2);
const vp = VIEWPORTS.find((v) => v.name === vpn);
const srv = await serve();
const c = await launchChrome();
await c.send("Page.enable"); await c.send("Runtime.enable");
await c.send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
const loaded = c.once("Page.loadEventFired");
await c.send("Page.navigate", { url: `http://127.0.0.1:${srv.address().port}${url}` });
await loaded;
await new Promise((r) => setTimeout(r, 800));
const { result } = await c.send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  const out = [];
  const h = document.querySelector(".md-header"); out.push(["header", 0, Math.round(h.getBoundingClientRect().bottom)]);
  for (const el of document.querySelector("article").children) {
    const b = el.getBoundingClientRect(); if (b.top > innerHeight + 200) break;
    out.push([el.tagName + (el.dataset.bb ? "[" + el.dataset.bb + "]" : "") + (el.className ? "." + String(el.className).split(" ")[0] : ""), Math.round(b.top), Math.round(b.bottom)]);
    if (el.dataset.bb === "arsitektur") for (const x of el.querySelectorAll("figure > *, figcaption")) { const q = x.getBoundingClientRect(); out.push(["   " + x.tagName + "." + String(x.className).split(" ")[0], Math.round(q.top), Math.round(q.bottom)]); }
  }
  return out; })()` });
for (const [n, t, b] of result.value) console.log(String(t).padStart(5), String(b).padStart(5), String(b - t).padStart(4), n);
await c.close(); srv.close();
