// Memeriksa fondasi diagram (I4, keputusan 232) di halaman uji /uji/diagram/:
// - tanpa JS: versi statis terlihat, role="img" dengan aria-label;
// - dengan JS: React Flow terpasang, tegak di 375 px dan mendatar di 1366 px, semua kotak di dalam wadah;
// - di 375×667 roda dan gestur sentuh di atas diagram tetap menggulir halaman (scroll tidak tertangkap);
// - kotak bisa dicapai dengan Tab dan dibuka dengan Enter; catatan muncul di bawah diagram;
// - dengan reduced motion: 0 animasi sesudah memilih kotak; fungsi tetap.
//   node tools/ukur-diagram.mjs --url http://127.0.0.1:4321
//   node tools/ukur-diagram.mjs --url ... --axe /path/axe.min.js   # + axe-core, gelap dan terang
import { chromium } from "@playwright/test";

const arg = (nama, bawaan) => {
  const i = process.argv.indexOf(nama);
  return i > -1 ? process.argv[i + 1] : bawaan;
};
const url = arg("--url", "http://127.0.0.1:4321") + "/uji/diagram/";
const AXE = arg("--axe", undefined);

const browser = await chromium.launch();
let gagal = 0;
const lapor = (ok, pesan) => {
  console.log(`${ok ? "ok" : "GAGAL"} ${pesan}`);
  if (!ok) gagal++;
};

// 1. Tanpa JS.
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto(url);
  const r = await page.evaluate(() =>
    [...document.querySelectorAll("figure.diagram")].map((f) => {
      const img = f.querySelector('[role="img"]');
      const b = img?.getBoundingClientRect();
      return { label: img?.getAttribute("aria-label") ?? "", tinggi: b?.height ?? 0, flow: !!f.querySelector(".react-flow") };
    }),
  );
  lapor(r.length === 2 && r.every((x) => x.label.length > 20 && x.tinggi > 20 && !x.flow), `tanpa JS: ${r.length} diagram statis, tinggi ${r.map((x) => Math.round(x.tinggi)).join("/")} px`);
  await ctx.close();
}

async function siap(page) {
  await page.goto(url, { waitUntil: "networkidle" });
  for (const f of await page.locator("figure.diagram").all()) await f.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll("figure.diagram")].every((f) => f.querySelector(".react-flow__node .diagram__kotak")));
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const [lebar, tinggi, arahHarus] of [
  [375, 667, "tegak"],
  [1366, 657, "mendatar"],
]) {
  for (const reducedMotion of ["no-preference", "reduce"]) {
    const ctx = await browser.newContext({ viewport: { width: lebar, height: tinggi }, reducedMotion, hasTouch: lebar < 500 });
    const page = await ctx.newPage();
    await siap(page);
    const tag = `${lebar}×${tinggi} ${reducedMotion}`;

    // 2. Bentuk dan isi wadah.
    const bentuk = await page.evaluate(() =>
      [...document.querySelectorAll("figure.diagram")].map((f) => {
        const w = f.querySelector(".diagram__wadah").getBoundingClientRect();
        const luar = [...f.querySelectorAll(".react-flow__node")].filter((n) => {
          const b = n.getBoundingClientRect();
          return b.left < w.left - 1 || b.right > w.right + 1 || b.top < w.top - 1 || b.bottom > w.bottom + 1;
        }).length;
        return { arah: f.dataset.arah, kotak: f.querySelectorAll(".diagram__kotak").length, luar, statisSr: f.querySelector('[role="img"]').classList.contains("sr-only") };
      }),
    );
    lapor(
      bentuk.every((b) => b.arah === arahHarus && b.kotak === 3 && b.luar === 0 && b.statisSr),
      `${tag}: ${bentuk.map((b) => `${b.arah}, ${b.kotak} kotak, ${b.luar} di luar wadah`).join(" | ")}`,
    );

    // 3. Scroll tidak tertangkap (hanya layar sempit, tempat jari paling sering mendarat di diagram).
    if (lebar < 500) {
      const kotak = page.locator("figure.diagram .react-flow__pane").first();
      await kotak.scrollIntoViewIfNeeded();
      const b = await kotak.boundingBox();
      const cx = b.x + b.width / 2;
      const cy = b.y + Math.min(b.height / 2, 200);
      const y0 = await page.evaluate(() => window.scrollY);
      await page.mouse.move(cx, cy);
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(300);
      const y1 = await page.evaluate(() => window.scrollY);
      lapor(y1 > y0, `${tag}: roda di atas diagram ${y0}→${y1}`);
      // Gestur sentuh: sekali di atas paragraf (kontrol), sekali di atas diagram. Posisi diukur ulang sesudah tiap gulir.
      // Chromium headless di runner Linux tidak menjalankan gestur sentuh sintetis sama sekali (CI #145 percobaan 1);
      // bila kontrol tidak bergerak, gestur dilaporkan "info" dan touch-action yang jadi buktinya.
      const cdp = await ctx.newCDPSession(page);
      const geser = async (sel) => {
        await page.locator(sel).first().scrollIntoViewIfNeeded();
        await page.evaluate(() => window.scrollBy(0, -80));
        const b = await page.locator(sel).first().boundingBox();
        const a = await page.evaluate(() => window.scrollY);
        await cdp.send("Input.synthesizeScrollGesture", { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + Math.min(b.height / 2, 150)), yDistance: -200, gestureSourceType: "touch", speed: 1200 });
        await page.waitForTimeout(300);
        return [a, await page.evaluate(() => window.scrollY)];
      };
      const [k0, k1] = await geser("main p");
      const [d0, d1] = await geser("figure.diagram .react-flow__pane");
      const ta = await page.evaluate(() => getComputedStyle(document.querySelector("figure.diagram .react-flow__pane")).touchAction);
      const taOk = ta.includes("pan-y") || ta === "auto" || ta === "manipulation";
      if (k1 > k0) lapor(d1 > d0 && taOk, `${tag}: sentuh di paragraf ${k0}→${k1}, di atas diagram ${d0}→${d1}, touch-action ${ta}`);
      else {
        console.log(`info ${tag}: gestur sentuh sintetis tidak berjalan di lingkungan ini (paragraf ${k0}→${k1})`);
        lapor(taOk, `${tag}: touch-action panel ${ta}`);
      }
    }

    // 4. Keyboard: Tab dari tombol sebelum diagram mendarat di kotak pertama, Enter membuka catatan.
    await page.evaluate(() => {
      const f = document.querySelector("figure.diagram");
      const p = document.createElement("button");
      p.id = "uji-sebelum";
      p.textContent = "sebelum";
      f.before(p);
    });
    await page.focus("#uji-sebelum");
    await page.keyboard.press("Tab");
    const fokus = await page.evaluate(() => document.activeElement?.className ?? "");
    const awalAnim = await page.evaluate(() => document.getAnimations().length);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(50);
    const r = await page.evaluate(() => {
      const f = document.querySelector("figure.diagram");
      const cat = f.querySelector(".diagram__catatan");
      const w = f.querySelector(".diagram__wadah").getBoundingClientRect();
      return {
        catatan: cat.textContent,
        diBawah: cat.getBoundingClientRect().top >= w.bottom - 1,
        ditekan: document.activeElement?.getAttribute("aria-pressed"),
        anim: document.getAnimations().length,
      };
    });
    lapor(
      fokus.includes("diagram__kotak") && r.catatan.startsWith("App Flutter.") && r.diBawah && r.ditekan === "true",
      `${tag}: Tab ke "${fokus}", Enter → "${r.catatan}"`,
    );
    if (reducedMotion === "reduce") lapor(awalAnim === 0 && r.anim === 0, `${tag}: animasi ${awalAnim} sebelum, ${r.anim} sesudah memilih`);

    if (AXE) {
      for (const tema of ["dark", "light"]) {
        await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), tema);
        await page.addScriptTag({ path: AXE });
        const v = await page.evaluate(async () => {
          document.getElementById("uji-sebelum")?.remove();
          const x = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } });
          return x.violations.map((p) => `${p.id}(${p.nodes.length})`);
        });
        lapor(v.length === 0, `axe ${tag} ${tema}: ${v.length ? v.join(", ") : "0 pelanggaran"}`);
      }
    }
    await ctx.close();
  }
}
await browser.close();
console.log(gagal ? `Fondasi diagram GAGAL (${gagal})` : "Diagram: statis tanpa JS, scroll tidak tertangkap, keyboard jalan, tanpa animasi saat reduced");
process.exit(gagal ? 1 : 0);
