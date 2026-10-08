// Membandingkan halaman situs lama (../site, hasil mkdocs build) dengan situs baru (dist):
// teks artikel, urutan heading, dan jumlah link. Dipakai untuk membuktikan porting tidak mengubah isi.
// Pakai: node tools/banding.mjs b-fondasi/b3-1-transaction
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./registri.mjs";

const slug = process.argv[2] || "b-fondasi/b3-1-transaction";
const lama = fs.readFileSync(path.join(ROOT, "site", slug, "index.html"), "utf8");
const baru = fs.readFileSync(path.join(ROOT, "site-baru/dist", slug, "index.html"), "utf8");

function artikel(html) {
  // Situs lama: <article class="md-content__inner ...">; situs baru: <main ...> ... <article>? Starlight: <main> dengan .sl-markdown-content
  const m = html.match(/<article[\s\S]*?<\/article>/) || html.match(/<main[\s\S]*?<\/main>/);
  return m ? m[0] : html;
}
function bersih(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<svg[\s\S]*?<\/svg>/g, "")
    .replace(/<pre[\s\S]*?<\/pre>/g, " [kode] ").replace(/<nav[^>]*bb-lanjut[\s\S]*?<\/nav>/g, "")
    .replace(/<nav class="kamu"[\s\S]*?<\/nav>/g, "").replace(/<div data-bb="kamu-di-sini"[^>]*><\/div>/g, "")
    .replace(/<a[^>]*class="[^"]*headerlink[^"]*"[^>]*>[^<]*<\/a>/g, "").replace(/<a[^>]*anchor-link[^>]*>[\s\S]*?<\/a>/g, "");
}
function teks(html) {
  return bersih(html).replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+([.,:;!?)])/g, "$1").replace(/\(\s+/g, "(")
    .replace(/\s+/g, " ").trim();
}
function heading(html) { return [...bersih(html).matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => `h${m[1]} ${m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()}`); }
function links(html) { return [...bersih(html).matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]).filter((h) => !h.startsWith("#")); }

const A = artikel(lama), B = artikel(baru);
const ta = teks(A), tb = teks(B);
const ha = heading(A), hb = heading(B);
const la = links(A), lb = links(B);
const kataA = ta.split(" "), kataB = tb.split(" ");

// Diff kata sederhana (LCS) untuk menunjukkan kalimat yang berbeda.
function diffKata(a, b) {
  const n = a.length, m = b.length, dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) { if (a[i] === b[j]) { i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) out.push("-" + a[i++]); else out.push("+" + b[j++]); }
  while (i < n) out.push("-" + a[i++]); while (j < m) out.push("+" + b[j++]);
  return out;
}
const d = diffKata(kataA, kataB);
console.log(`Teks artikel: lama ${kataA.length} kata · baru ${kataB.length} kata · kata berbeda ${d.length}`);
if (d.length) console.log("  " + d.slice(0, 80).join(" ") + (d.length > 80 ? " …" : ""));
console.log(`Heading: lama ${ha.length} · baru ${hb.length} · urutan ${JSON.stringify(ha) === JSON.stringify(hb) ? "sama" : "BERBEDA"}`);
if (JSON.stringify(ha) !== JSON.stringify(hb)) { console.log("  lama:", ha.join(" | ")); console.log("  baru:", hb.join(" | ")); }
console.log(`Link di artikel: lama ${la.length} · baru ${lb.length}`);
const ekst = (l) => l.filter((h) => /^https?:/.test(h));
console.log(`  eksternal: lama ${ekst(la).length} · baru ${ekst(lb).length} · ${JSON.stringify(ekst(la)) === JSON.stringify(ekst(lb)) ? "daftar sama" : "daftar BERBEDA"}`);
const internal = (l) => l.filter((h) => !/^https?:/.test(h));
console.log(`  internal: lama ${internal(la).length} (relatif ../) · baru ${internal(lb).length} (absolut /)`);
console.log("  internal lama:", internal(la).join(" "));
console.log("  internal baru:", internal(lb).join(" "));
