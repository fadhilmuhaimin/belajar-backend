// Sidebar Starlight dari cerita.json: satu grup per tahap, ★ untuk jalur inti (keputusan 117).
// Redesain (keputusan 202): semua grup terlipat; Starlight membuka grup yang memuat halaman aktif, jadi
// yang terlihat hanya jalur ke halaman ini.
// Tahap 1 dikelompokkan per bagian naskah (PRD, fitur ke teknis, ...); tahap lain per kelompok lama dan ditandai
// "versi lama". Halaman yang belum ditulis tetap tampil (urutan dan nomor tidak berubah) dengan kelas nav-menyusul
// (keputusan 104). Peran yang ditonjolkan dibawa sebagai data-peran untuk pemilih peran.
import { muat, label, url, byId } from "./registri.mjs";

function item(h, by) {
  const kelas = [h.inti ? "nav-inti" : "", h.ada ? "" : "nav-menyusul", h.lama || h.lebur_ke || h.diganti_oleh ? "nav-lama" : ""]
    .filter(Boolean).join(" ");
  const attrs = {};
  if (kelas) attrs.class = kelas;
  if (!h.ada) attrs.title = "Belum ditulis";
  if (h.lama) attrs.title = "Versi lama; akan ditulis ulang mengikuti naskah";
  if (h.lebur_ke) attrs.title = `Versi lama; isinya digabung ke ${label(by[h.lebur_ke])}`;
  if (h.diganti_oleh) attrs.title = `Versi lama; digantikan ${label(by[h.diganti_oleh])}`;
  if (h.inti) attrs["data-inti"] = "★ jalur inti";
  if (h.peran?.length) attrs["data-peran"] = h.peran.join(" ");
  return { label: label(h), link: url(h), attrs };
}

function grupTahap(d, t, by) {
  const hs = d.halaman.filter((h) => h.tahap === t.no);
  const items = [];
  for (const h of hs) {
    const kel = t.bagian ? t.bagian.find((b) => b.no === h.bagian)?.nama : h.kelompok;
    if (/^T\d$/.test(h.id) || !kel) { items.push(item(h, by)); continue; }
    let g = items.find((x) => x.items && x.label === kel);
    if (!g) { g = { label: kel, collapsed: true, items: [] }; items.push(g); }
    g.items.push(item(h, by));
  }
  const versi = t.versi === "lama" ? " · versi lama" : "";
  return { label: `Tahap ${t.no} · ${t.nama}${versi}`, collapsed: true, items };
}

export function sidebar() {
  const d = muat();
  const by = byId(d);
  const out = [];
  // Beranda sudah ditautkan judul situs; tidak diulang di sidebar.
  out.push({ label: "Pembuka", collapsed: true, items: d.halaman.filter((h) => h.tahap === "pembuka" && h.id !== "Beranda").map((h) => item(h, by)) });
  for (const t of d.tahap) out.push(grupTahap(d, t, by));
  const samping = d.halaman.filter((h) => h.tahap === "sampingan");
  if (samping.length) out.push({ label: "Studi sampingan", collapsed: true, items: samping.map((h) => item(h, by)) });
  const alat = d.halaman.filter((h) => h.tahap === "alat");
  if (alat.length) out.push({ label: "Alat", collapsed: true, items: alat.map((h) => item(h, by)) });
  return out;
}
