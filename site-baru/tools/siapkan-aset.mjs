// Menyalin aset situs lama ke public/ supaya widget lama jalan apa adanya:
//   docs/widgets/*.js            -> public/widgets/
//   docs/widgets/data/**         -> public/widgets/data/   ([[ID]] di nilai string diganti teks polos, seperti on_post_build)
//   docs/vendor/**               -> public/vendor/         (sql.js untuk runsql)
//   docs/assets/fonts/*.woff2    -> public/fonts/          (hasil tools/get_fonts.sh; tidak di-commit)
import fs from "node:fs";
import path from "node:path";
import { DOCS, ROOT, muat, tokenKeTeks } from "./registri.mjs";

const PUB = path.join(ROOT, "site-baru/public");
const d = muat();

function salinDir(dari, ke, filter = () => true, ubah = null) {
  fs.mkdirSync(ke, { recursive: true });
  for (const e of fs.readdirSync(dari, { withFileTypes: true })) {
    const a = path.join(dari, e.name), b = path.join(ke, e.name);
    if (e.isDirectory()) salinDir(a, b, filter, ubah);
    else if (filter(e.name)) {
      if (ubah && e.name.endsWith(".json")) fs.writeFileSync(b, ubah(fs.readFileSync(a, "utf8")));
      else fs.copyFileSync(a, b);
    }
  }
}

function gantiToken(teks) {
  if (!teks.includes("[[")) return teks;
  const ganti = (o) => typeof o === "string" ? tokenKeTeks(o, d) : Array.isArray(o) ? o.map(ganti)
    : o && typeof o === "object" ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, ganti(v)])) : o;
  return JSON.stringify(ganti(JSON.parse(teks)));
}

fs.rmSync(path.join(PUB, "widgets"), { recursive: true, force: true });
salinDir(path.join(DOCS, "widgets"), path.join(PUB, "widgets"), (n) => n.endsWith(".js") || n.endsWith(".json"), gantiToken);
fs.rmSync(path.join(PUB, "vendor"), { recursive: true, force: true });
salinDir(path.join(DOCS, "vendor"), path.join(PUB, "vendor"));

const fonts = path.join(DOCS, "assets/fonts");
const ada = fs.existsSync(fonts) && fs.readdirSync(fonts).some((n) => n.endsWith(".woff2"));
if (ada) salinDir(fonts, path.join(PUB, "fonts"), (n) => n.endsWith(".woff2"));
else console.warn("PERINGATAN: docs/assets/fonts kosong; jalankan `bash tools/get_fonts.sh` di root repo. Situs memakai font fallback.");
console.log("aset siap: public/widgets, public/vendor" + (ada ? ", public/fonts" : ""));
