// Tangkapan layar satu halaman situs hasil build (layar pertama atau bagian bawah).
//   node tools/tangkap_halaman.mjs /b-fondasi/b2-5-connection-pool/ 1366x657 out.png [bawah]
import fs from "node:fs";
import { VIEWPORTS, serve, launchChrome } from "./lib/chrome.mjs";
const [url, vpn = "1366x657", out = "halaman.png", posisi = "atas"] = process.argv.slice(2);
const vp = VIEWPORTS.find((v) => v.name === vpn);
const srv = await serve();
const c = await launchChrome();
await c.send("Page.enable"); await c.send("Runtime.enable");
await c.send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile });
const loaded = c.once("Page.loadEventFired");
await c.send("Page.navigate", { url: `http://127.0.0.1:${srv.address().port}${url}` });
await loaded;
await new Promise((r) => setTimeout(r, 800));
if (posisi === "bawah") await c.send("Runtime.evaluate", { expression: "scrollTo(0, document.body.scrollHeight)" });
await new Promise((r) => setTimeout(r, 300));
const shot = await c.send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
await c.close(); srv.close();
