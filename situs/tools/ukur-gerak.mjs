// Memeriksa fondasi gerak (I3, keputusan 231) di halaman uji /uji/gerak/:
// - tanpa reduced motion, catatan muncul dengan gerak (frame pertama sesudah klik: opacity < 1 atau masih tergeser);
// - dengan prefers-reduced-motion: reduce, catatan langsung tampil penuh di frame pertama (tanpa gerak), fungsi tetap.
// Juga memeriksa bahwa halaman tanpa gerak memuat 0 animasi saat dibuka (aturan: tidak ada animasi yang berjalan sendiri).
//   node tools/ukur-gerak.mjs --url http://127.0.0.1:4321
//   node tools/ukur-gerak.mjs --url ... --axe /path/axe.min.js   # + axe-core di halaman uji, gelap dan terang
import { chromium } from "@playwright/test";

const arg = (nama, bawaan) => {
  const i = process.argv.indexOf(nama);
  return i > -1 ? process.argv[i + 1] : bawaan;
};
const url = arg("--url", "http://127.0.0.1:4321");
const AXE = arg("--axe", process.env.AXE); // opsional: path axe.min.js, seperti audit-tampilan.mjs

// Klik tombol lalu ambil keadaan catatan di dua frame berikutnya (requestAnimationFrame).
async function ukur(page) {
  await page.goto(url + "/uji/gerak/", { waitUntil: "networkidle" });
  const tombol = page.locator(".contoh-gerak__tombol");
  await tombol.waitFor();
  // Island di-hydrate saat terlihat; tunggu sampai React memasang handler (tombol bereaksi).
  await page.waitForFunction(() => {
    const b = document.querySelector(".contoh-gerak__tombol");
    return b && Object.keys(b).some((k) => k.startsWith("__reactProps"));
  });
  const animasiAwal = await page.evaluate(() => document.getAnimations().length);
  const sampel = await page.evaluate(
    () =>
      new Promise((selesai) => {
        document.querySelector(".contoh-gerak__tombol").click();
        const hasil = [];
        const ambil = () => {
          const el = document.querySelector('[data-gerak="catatan"]');
          if (el) {
            const s = getComputedStyle(el);
            hasil.push({ opacity: Number(s.opacity), transform: s.transform });
          }
          if (hasil.length < 2) requestAnimationFrame(ambil);
          else selesai(hasil);
        };
        requestAnimationFrame(ambil);
      }),
  );
  await page.waitForTimeout(600);
  const akhir = await page.evaluate(() => {
    const s = getComputedStyle(document.querySelector('[data-gerak="catatan"]'));
    return { opacity: Number(s.opacity), transform: s.transform };
  });
  return { animasiAwal, sampel, akhir };
}

const diam = (s) => s.opacity === 1 && (s.transform === "none" || s.transform === "matrix(1, 0, 0, 1, 0, 0)");

const browser = await chromium.launch();
let gagal = 0;
for (const reducedMotion of ["no-preference", "reduce"]) {
  const page = await browser.newPage({ viewport: { width: 375, height: 667 }, reducedMotion });
  const r = await ukur(page);
  const awal = r.sampel[0];
  const bergerak = !diam(awal);
  const ok = r.animasiAwal === 0 && diam(r.akhir) && (reducedMotion === "reduce" ? !bergerak : bergerak);
  console.log(
    `${ok ? "ok" : "GAGAL"} ${reducedMotion}: animasi saat dimuat ${r.animasiAwal}, frame pertama opacity ${awal.opacity.toFixed(2)} transform ${awal.transform}, akhir opacity ${r.akhir.opacity}`,
  );
  if (!ok) gagal++;
  if (AXE) {
    // axe sesudah catatan terbuka (tombol dan panel sama-sama ada), dua tema.
    for (const tema of ["dark", "light"]) {
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), tema);
      await page.addScriptTag({ path: AXE });
      const v = await page.evaluate(async () => {
        const x = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } });
        return x.violations.map((p) => `${p.id}(${p.nodes.length})`);
      });
      console.log(`${v.length ? "GAGAL" : "ok"} axe ${reducedMotion} ${tema}: ${v.length ? v.join(", ") : "0 pelanggaran"}`);
      if (v.length) gagal++;
    }
  }
  await page.close();
}
await browser.close();
console.log(gagal ? "Fondasi gerak GAGAL" : "Reduced motion mematikan gerak; tanpa itu gerak berjalan");
process.exit(gagal ? 1 : 0);
