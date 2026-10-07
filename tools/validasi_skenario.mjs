#!/usr/bin/env node
// Validasi semua skenario widget alur (Pola Skenario Bertahap). Dipanggil oleh hook build MkDocs.
// Sumber skenario: setiap <div data-bb="alur" data-src="..."> di docs/**/*.md, ditambah
// docs/widgets/data/skenario/*.json. Exit 1 (build gagal) kalau ada id tidak dikenal,
// langkah tanpa narasi atau data, jalur terlalu panjang, atau file rekaman yang hilang.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const core = createRequire(import.meta.url)(path.join(ROOT, "docs/widgets/alur-core.js"));

const files = new Map();  // file skenario -> halaman pemakai
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!["vendor", "assets"].includes(e.name)) walk(p); continue; }
    if (!e.name.endsWith(".md")) continue;
    for (const m of fs.readFileSync(p, "utf8").matchAll(/data-bb="alur"[^>]*data-src="([^"]+)"/g)) {
      const f = path.join(ROOT, "docs/widgets", m[1]);
      files.set(f, (files.get(f) || []).concat(path.relative(ROOT, p)));
    }
  }
})(path.join(ROOT, "docs"));
const dirSkenario = path.join(ROOT, "docs/widgets/data/skenario");
if (fs.existsSync(dirSkenario)) for (const f of fs.readdirSync(dirSkenario)) if (f.endsWith(".json")) {
  const p = path.join(dirSkenario, f);
  if (!files.has(p)) files.set(p, []);
}

let gagal = 0;
for (const [f, pages] of files) {
  const rel = path.relative(ROOT, f);
  let err;
  if (!fs.existsSync(f)) err = ["file tidak ada (dirujuk oleh " + pages.join(", ") + ")"];
  else {
    try {
      const d = core.normalize(JSON.parse(fs.readFileSync(f, "utf8")));
      err = core.validate(d, { exists: (p) => fs.existsSync(path.join(ROOT, p)) });
    } catch (e) { err = ["tidak bisa dibaca: " + e.message]; }
  }
  if (err.length) { gagal++; console.error(`SKENARIO TIDAK VALID: ${rel}\n  - ${err.join("\n  - ")}`); }
}
console.log(`Validasi skenario: ${files.size} file, ${gagal} tidak valid.`);
process.exit(gagal ? 1 : 0);
