// Sidebar Starlight dari cerita.json: satu grup per tahap, sub-grup per kelompok, ★ untuk jalur inti.
// Halaman yang belum dipindah ke situs baru tetap tampil (urutan dan nomor tidak berubah) dengan kelas
// nav-menyusul; link-nya mengarah ke path yang akan dipakai setelah dipindah (keputusan 104).
import { muat, label, url } from "./registri.mjs";

function item(h) {
  const kelas = [h.inti ? "nav-inti" : "", h.diporting ? "" : "nav-menyusul"].filter(Boolean).join(" ");
  const attrs = {};
  if (kelas) attrs.class = kelas;
  if (!h.diporting) attrs.title = "Belum dipindah ke situs baru";
  if (h.inti) attrs["data-inti"] = "★ jalur inti";
  return { label: label(h), link: url(h), attrs };
}

function grupTahap(d, t) {
  const hs = d.halaman.filter((h) => h.tahap === t.no);
  const items = [];
  for (const h of hs) {
    if (/^T\d$/.test(h.id)) { items.push(item(h)); continue; }
    const kel = h.kelompok || "Lainnya";
    let g = items.find((x) => x.items && x.label === kel);
    if (!g) { g = { label: kel, collapsed: false, items: [] }; items.push(g); }
    g.items.push(item(h));
  }
  return { label: `Tahap ${t.no} · ${t.nama}`, collapsed: true, items };
}

export function sidebar() {
  const d = muat();
  const out = [];
  out.push({ label: "Pembuka", collapsed: false, items: d.halaman.filter((h) => h.tahap === "pembuka").map(item) });
  for (const t of d.tahap) out.push(grupTahap(d, t));
  const samping = d.halaman.filter((h) => h.tahap === "sampingan");
  if (samping.length) out.push({ label: "Studi sampingan", collapsed: true, items: samping.map(item) });
  const alat = d.halaman.filter((h) => h.tahap === "alat");
  if (alat.length) out.push({ label: "Alat", collapsed: true, items: alat.map(item) });
  return out;
}
