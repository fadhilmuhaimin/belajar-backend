// Registry halaman dari docs/widgets/data/cerita.json, padanan tools/registri.py untuk situs Astro.
// ID halaman (A1, B3.1) hanya kunci internal; yang tampil: nomor "T.N" (urutan baca di tahap T, dihitung dari
// semua halaman di registry supaya nomor tidak bergeser) dan judul.
import fs from "node:fs";
import path from "node:path";

// Root repo dicari dari direktori kerja ke atas (penanda: mkdocs.yml), bukan dari import.meta.url,
// karena saat build Astro memindahkan modul ini ke dist/.prerender/chunks/.
function cariRoot() {
  let d = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(d, "mkdocs.yml")) && fs.existsSync(path.join(d, "docs/widgets/data/cerita.json"))) return d + path.sep;
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  throw new Error("root repo (mkdocs.yml + docs/widgets/data/cerita.json) tidak ditemukan dari " + process.cwd());
}
export const ROOT = cariRoot();
export const DOCS = path.join(ROOT, "docs");
export const SITE_DOCS = path.join(ROOT, "situs/src/content/docs");
const URUT_BACA = ["pembuka", 1, 2, 3, 4, 5, "sampingan"]; // "alat" di luar urutan baca

export function muat() {
  const d = JSON.parse(fs.readFileSync(path.join(DOCS, "widgets/data/cerita.json"), "utf8"));
  const hitung = {};
  for (const h of d.halaman) {
    h.ada = fs.existsSync(path.join(DOCS, h.path)); // ada di situs lama (dasar urutan baca dan nomor)
    const mdx = path.join(SITE_DOCS, h.path.replace(/\.md$/, ".mdx"));
    h.diporting = fs.existsSync(mdx) || fs.existsSync(path.join(SITE_DOCS, h.path)); // sudah ada di situs baru
    delete h.nomor;
    const t = h.tahap;
    if (Number.isInteger(t) && !/^T\d$/.test(h.id)) {
      hitung[t] = (hitung[t] || 0) + 1;
      h.nomor = `${t}.${hitung[t]}`;
    }
  }
  return d;
}

export const pendek = (h) => h.pendek || h.judul.split(":")[0];
export const label = (h, singkat = false) => {
  const j = singkat ? pendek(h) : h.judul;
  return h.nomor ? `${h.nomor} ${j}` : j;
};

// docs path -> URL: a/b.md -> /a/b/, a/index.md -> /a/, index.md -> /
export function url(h) {
  const p = h.path;
  if (p === "index.md") return "/";
  if (p.endsWith("/index.md")) return "/" + p.slice(0, -"index.md".length);
  return "/" + p.slice(0, -3) + "/";
}

// id entri Starlight ("b-fondasi/b3-1-transaction", "cerita/index", "index") -> URL yang sama dengan url(h)
export function urlDariId(id) {
  const s = id.replace(/(^|\/)index$/, "");
  return s ? `/${s}/` : "/";
}

export const urutanBaca = (d) => URUT_BACA.flatMap((k) => d.halaman.filter((h) => h.tahap === k && h.ada));
export const byId = (d) => Object.fromEntries(d.halaman.map((h) => [h.id, h]));
export const dariUrl = (d, u) => d.halaman.find((h) => url(h) === u);

const TOKEN = /\[\[([A-Za-z0-9.\-]+)(?:\|([^\]]+))?\]\]/g;
// [[ID]] di teks data widget -> teks polos (padanan on_post_build di mkdocs_hooks.py)
export function tokenKeTeks(teks, d) {
  const by = byId(d);
  return teks.replace(TOKEN, (m, id, t) => {
    const h = by[id];
    if (!h) throw new Error(`rujukan [[${id}]] tidak ada di cerita.json`);
    return t || label(h, true);
  });
}
