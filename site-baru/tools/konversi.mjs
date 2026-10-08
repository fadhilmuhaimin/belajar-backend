// Mengubah halaman MkDocs (docs/**/*.md) menjadi MDX Starlight di src/content/docs/.
// Pakai: node tools/konversi.mjs b-fondasi/b5-3-authorization.md [--tulis]
// Tanpa --tulis hasil dicetak ke stdout. Pola yang ditangani: frontmatter + H1, data-bb -> WidgetLama,
// kamu-di-sini -> KamuDiSini, {: .meta } / {: .bb-beda } -> <p class>, ??? -> <details>, === -> TabSet,
// --8<-- -> Snippet, fence di dalam tab -> Snippet code. Pola lain dilaporkan sebagai PERINGATAN supaya
// dicek tangan; hasil konversi selalu dibaca ulang sebelum di-commit.
import fs from "node:fs";
import path from "node:path";
import { DOCS, SITE_DOCS, muat, url } from "./registri.mjs";

const rel = process.argv[2];
if (!rel) { console.error("pakai: node tools/konversi.mjs <path relatif docs/> [--tulis]"); process.exit(2); }
const tulis = process.argv.includes("--tulis");
const src = fs.readFileSync(path.join(DOCS, rel), "utf8");
const d = muat();
const halaman = d.halaman.find((h) => h.path === rel);
if (!halaman) throw new Error(`${rel} tidak ada di cerita.json`);
const peringatan = [];

const SKRIP = { arsitektur: ["cerita"], "kamu-di-sini": ["cerita"], "peta-cerita": ["cerita"], "indeks-masalah": ["cerita"],
  runsql: ["runsql-core", "runsql"], stackstep: ["stackstep"], alur: ["hp", "alur-core", "alur"], hp: ["hp"],
  pilah: ["pilah"], banding: ["banding"], kartu: ["kartu"], ember: ["ember"], race: ["race"], selesai: [], "umpan-balik": [], "umpan-balik-data": [] };
const URUTAN = ["cerita", "hp", "alur-core", "alur", "runsql-core", "runsql", "stackstep", "pilah", "banding", "kartu", "ember", "race"];
const skrip = new Set();

let lines = src.split("\n");
// frontmatter
let fm = [];
if (lines[0] === "---") { const j = lines.indexOf("---", 1); fm = lines.slice(1, j); lines = lines.slice(j + 1); }
// Judul tampilan = H1 di badan halaman (bisa lebih pendek dari title frontmatter, keputusan 68/74);
// Starlight memakai satu `title` untuk H1 dan <title>.
const titleFm = (fm.find((l) => l.startsWith("title:")) || "").replace(/^title:\s*/, "").replace(/^"(.*)"$/, "$1");
const h1 = (lines.find((l) => /^# /.test(l)) || "").replace(/^# /, "").trim();
const title = JSON.stringify(h1 || titleFm);

function snippetDari(fence) {
  // fence: { lang, title, body[] }
  const m = fence.body.length === 1 && fence.body[0].trim().match(/^--8<-- "([^":]+)(?::([^"]+))?"$/);
  if (m) {
    const attrs = [`file="${m[1]}"`];
    if (m[2]) attrs.push(/^\d*:\d*$/.test(m[2]) ? `lines="${m[2]}"` : `region="${m[2]}"`);
    if (fence.lang && fence.lang !== "text") attrs.push(`lang="${fence.lang}"`);
    if (fence.title) attrs.push(`title="${fence.title}"`);
    return `<Snippet ${attrs.join(" ")} />`;
  }
  const baris = fence.body.map((l) => l.trim()).filter(Boolean);
  const semua = baris.map((l) => l.match(/^--8<-- "([^":]+(?::\d*:\d*)?)"$/));
  if (baris.length > 1 && semua.every(Boolean)) {
    const attrs = [`files={${JSON.stringify(semua.map((x) => x[1]))}}`];
    if (fence.lang && fence.lang !== "text") attrs.push(`lang="${fence.lang}"`);
    if (fence.title) attrs.push(`title="${fence.title}"`);
    return `<Snippet ${attrs.join(" ")} />`;
  }
  if (fence.body.some((l) => l.includes("--8<--"))) peringatan.push("fence dengan --8<-- bercampur teks lain: " + fence.body[0]);
  return null;
}
function fenceInline(fence) {
  const kode = fence.body.join("\n").replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  const attrs = [`lang="${fence.lang || "text"}"`];
  if (fence.title) attrs.push(`title="${fence.title}"`);
  return `<Snippet ${attrs.join(" ")} code={\`${kode}\`} />`;
}
function bacaFence(ls, i) {
  const m = ls[i].match(/^```(\w+)?(?:\s+title="([^"]*)")?\s*$/);
  if (!m) return null;
  const body = [];
  let j = i + 1;
  while (j < ls.length && !/^```\s*$/.test(ls[j])) body.push(ls[j++]);
  return { lang: m[1] || "", title: m[2] || "", body, akhir: j };
}
function dedent(ls) { return ls.map((l) => l.replace(/^ {4}/, "")); }

// Konversi blok (dipakai di tingkat atas dan di dalam tab/details)
function konversiBlok(ls, dalamTab) {
  const out = [];
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i];
    // atribut paragraf
    if (/^\{: \.(meta|bb-beda) \}$/.test(l.trim())) {
      const kelas = l.trim().match(/\.([\w-]+)/)[1];
      let k = out.length - 1;
      while (k >= 0 && out[k].trim() === "") k--;
      let awal = k;
      while (awal > 0 && out[awal - 1].trim() !== "") awal--;
      const para = out.splice(awal, k - awal + 1).join(" ");
      out.push(`<p class="${kelas}">${para}</p>`);
      continue;
    }
    if (/^\{: /.test(l.trim())) { peringatan.push("atribut tidak dikenal: " + l.trim()); out.push(l); continue; }
    // fence
    const f = bacaFence(ls, i);
    if (f) {
      const sn = snippetDari(f);
      if (sn) out.push(sn);
      else if (dalamTab) out.push(fenceInline(f));
      else { out.push(...ls.slice(i, f.akhir + 1)); }
      i = f.akhir; continue;
    }
    // admonition terbuka (!!!) -> aside Starlight :::jenis[Judul]
    const adm = l.match(/^!!!\s+(\w+)(?:\s+"([^"]*)")?\s*$/);
    if (adm) {
      const JENIS = { note: "note", info: "note", abstract: "note", tip: "tip", success: "tip", question: "note", example: "note",
        warning: "caution", caution: "caution", danger: "danger", failure: "danger", bug: "danger" };
      const jenis = JENIS[adm[1]] || "note";
      const isi = [];
      let j = i + 1;
      while (j < ls.length && (ls[j].startsWith("    ") || ls[j].trim() === "")) isi.push(ls[j++]);
      while (isi.length && isi[isi.length - 1].trim() === "") isi.pop();
      out.push(`:::${jenis}${adm[2] ? `[${adm[2]}]` : ""}`, ...konversiBlok(dedent(isi), dalamTab), ":::", "");
      i = j - 1; continue;
    }
    // details
    const q = l.match(/^\?\?\?\s+(\w+)\s+"([^"]+)"\s*$/);
    if (q) {
      const isi = [];
      let j = i + 1;
      while (j < ls.length && (ls[j].startsWith("    ") || ls[j].trim() === "")) isi.push(ls[j++]);
      while (isi.length && isi[isi.length - 1].trim() === "") isi.pop();
      out.push(`<details class="${q[1]}">`, `<summary>${q[2]}</summary>`, "", ...konversiBlok(dedent(isi), dalamTab), "", "</details>", "");
      i = j - 1; continue;
    }
    // tabs
    if (/^=== "/.test(l)) {
      const tabs = [];
      let j = i;
      while (j < ls.length && /^=== "/.test(ls[j])) {
        const label = ls[j].match(/^=== "([^"]+)"/)[1];
        const isi = [];
        j++;
        while (j < ls.length && (ls[j].startsWith("    ") || ls[j].trim() === "")) isi.push(ls[j++]);
        while (isi.length && isi[isi.length - 1].trim() === "") isi.pop();
        tabs.push({ label, isi: dedent(isi) });
      }
      const id = "stack" + (out.filter((x) => x.startsWith("<TabSet")).length || "");
      out.push(`<TabSet id="${id}" labels={${JSON.stringify(tabs.map((t) => t.label))}}>`);
      tabs.forEach((t, k) => { out.push(`<Fragment slot="t${k}">`, "", ...konversiBlok(t.isi, true), "", "</Fragment>"); });
      out.push("</TabSet>", "");
      i = j - 1; continue;
    }
    // widget
    const w = l.match(/^<div data-bb="([\w-]+)"([^>]*)><\/div>\s*$/);
    if (w) {
      const nama = w[1];
      (SKRIP[nama] || (peringatan.push("widget tidak dikenal: " + nama), [])).forEach((s) => skrip.add(s));
      if (nama === "kamu-di-sini") { out.push(`<KamuDiSini id="${halaman.id}" />`); continue; }
      const attrs = [`nama="${nama}"`];
      const srcM = w[2].match(/data-src="([^"]+)"/); if (srcM) attrs.push(`src="${srcM[1]}"`);
      const tM = w[2].match(/data-tahap="([^"]+)"/); if (tM) attrs.push(`tahap={${tM[1]}}`);
      const sisa = w[2].replace(/data-(src|tahap)="[^"]+"/g, "").trim();
      for (const a of sisa.matchAll(/([\w-]+)="([^"]*)"/g)) attrs.push(`${a[1]}="${a[2]}"`);
      if (sisa && !/^(\s*[\w-]+="[^"]*")+\s*$/.test(sisa)) peringatan.push(`atribut widget ${nama} tidak dikonversi: ${sisa}`);
      out.push(`<WidgetLama ${attrs.join(" ")} />`);
      continue;
    }
    if (/^# /.test(l)) continue; // H1 dari frontmatter
    // Link Markdown relatif ke file .md lain -> URL absolut situs (registry menentukan path-nya)
    const lnk = l.replace(/\]\(((?:\.\.?\/)[^)#\s]+\.md)(#[^)]*)?\)/g, (m, target, hash) => {
      const abs = path.posix.normalize(path.posix.join(path.posix.dirname(rel), target));
      const h = d.halaman.find((x) => x.path === abs);
      if (!h) { peringatan.push("link relatif ke halaman di luar registry: " + target); return m; }
      return `](${url(h)}${hash || ""})`;
    });
    if (lnk !== l) { out.push(lnk); continue; }
    let baris = l;
    // Tombol Material: [teks](url){ .md-button ... } atau [[ID|teks]]{ .md-button ... } -> <a class="tombol">
    baris = baris.replace(/\[\[([A-Za-z0-9.\-]+)\|([^\]]+)\]\]\{[^}]*\.md-button[^}]*\}/g, (m, id, teks) => {
      const h = d.halaman.find((x) => x.id === id);
      if (!h) { peringatan.push("tombol ke ID tak dikenal: " + id); return m; }
      return `<a class="tombol" href="${url(h)}">${teks}</a>`;
    });
    baris = baris.replace(/\[([^\]]+)\]\(([^)\s]+)\)\{[^}]*\.md-button[^}]*\}/g, (m, teks, target) => {
      let href = target;
      if (/\.md(#|$)/.test(target) && !/^https?:/.test(target)) {
        const abs = path.posix.normalize(path.posix.join(path.posix.dirname(rel), target.replace(/#.*$/, "")));
        const h = d.halaman.find((x) => x.path === abs);
        if (!h) { peringatan.push("tombol ke halaman di luar registry: " + target); return m; }
        href = url(h) + (target.match(/#.*$/) || [""])[0];
      }
      return `<a class="tombol" href="${href}">${teks}</a>`;
    });
    // Elemen void HTML harus menutup diri di MDX/JSX
    baris = baris.replace(/<(br|hr|img|input)(\s[^>]*?)?(?<!\/)>/g, (m, tag, attrs) => `<${tag}${attrs || ""} />`);
    // Komentar HTML -> komentar JSX
    baris = baris.replace(/<!--([\s\S]*?)-->/g, (m, isi) => `{/*${isi}*/}`);
    // Atribut `markdown` (md_in_html) tidak perlu di MDX: isi elemen HTML tetap diproses sebagai Markdown
    baris = baris.replace(/(<\w+[^>]*)\s+markdown(?:="[^"]*")?(\s*>)/g, "$1$2");
    // Gambar ilustrasi: ../assets/... -> /assets/... (disalin tools/siapkan-aset.mjs)
    baris = baris.replace(/\]\((?:\.\.\/)+assets\//g, "](/assets/");
    if (/!\[/.test(baris) && !/\]\(\/assets\//.test(baris)) peringatan.push("gambar dengan path tak dikenal: " + baris.trim());
    out.push(baris);
  }
  return out;
}

let body = konversiBlok(lines, false);
// {  } di prosa (di luar backtick) merusak MDX
let diFence = false;
for (const l of body) {
  if (/^```/.test(l)) { diFence = !diFence; continue; }
  if (diFence || l.startsWith("<") || l.startsWith("{/*")) continue;
  const tanpaKode = l.replace(/`[^`]*`/g, "");
  if (/[{}]/.test(tanpaKode)) peringatan.push("kurung kurawal di prosa: " + l.trim().slice(0, 80));
}
const impor = ["Snippet", "TabSet", "WidgetLama", "SkripLama", "KamuDiSini"].filter((c) => body.some((l) => l.includes(`<${c} `) || l.includes(`<${c}>`)) || c === "SkripLama");
const kedalaman = rel.split("/").length; // b-fondasi/x.md -> 2 -> ../../../components
const up = "../".repeat(kedalaman + 1);
const daftar = URUTAN.filter((s) => skrip.has(s));
const hasil = [
  "---", `title: ${title}`, "---",
  ...impor.map((c) => `import ${c} from "${up}components/${c}.astro";`),
  "",
  ...body.join("\n").replace(/\n{3,}/g, "\n\n").split("\n"),
  "",
  `<SkripLama daftar={${JSON.stringify(daftar)}} />`,
  "",
].join("\n");

if (peringatan.length) console.error("PERINGATAN:\n  " + peringatan.join("\n  "));
if (tulis) {
  const tujuan = path.join(SITE_DOCS, rel.replace(/\.md$/, ".mdx"));
  fs.mkdirSync(path.dirname(tujuan), { recursive: true });
  fs.writeFileSync(tujuan, hasil);
  console.error("ditulis: " + path.relative(process.cwd(), tujuan));
} else process.stdout.write(hasil);
