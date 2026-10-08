// Singkatan/istilah dari includes/istilah.md (`*[istilah]: definisi`, dibuat tools/build_istilah.py) dibungkus
// <abbr title="definisi">, padanan ekstensi `abbr` Python-Markdown. Setiap kemunculan dibungkus; skrip lama
// javascripts/istilah.js lalu menandai kemunculan pertama per bagian sebagai tooltip. Kunci terpanjang dicocokkan
// lebih dulu (keputusan 84). Teks di heading, link, dan kode tidak disentuh.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../../tools/registri.mjs";

const LEWATI = new Set(["code", "inlineCode", "link", "linkReference", "heading", "mdxJsxTextElement"]);

function muatIstilah() {
  const teks = fs.readFileSync(path.join(ROOT, "includes/istilah.md"), "utf8");
  const def = {};
  for (const m of teks.matchAll(/^\*\[([^\]]+)\]:\s*(.+)$/gm)) def[m[1]] = m[2].trim();
  const kunci = Object.keys(def).sort((a, b) => b.length - a.length);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?<![\\p{L}\\p{N}_-])(${kunci.map(esc).join("|")})(?![\\p{L}\\p{N}_-])`, "gu");
  return { def, re };
}

export default function remarkAbbr() {
  return (tree) => {
    const { def, re } = muatIstilah();
    (function walk(node, dalamAbbr) {
      if (!node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        const c = node.children[i];
        if (LEWATI.has(c.type)) continue;
        if (c.type === "text") {
          if (dalamAbbr) continue;
          const out = [];
          let last = 0;
          for (const m of c.value.matchAll(re)) {
            if (m.index > last) out.push({ type: "text", value: c.value.slice(last, m.index) });
            out.push({ type: "abbr", data: { hName: "abbr", hProperties: { title: def[m[1]] } }, children: [{ type: "text", value: m[1] }] });
            last = m.index + m[0].length;
          }
          if (!out.length) continue;
          if (last < c.value.length) out.push({ type: "text", value: c.value.slice(last) });
          node.children.splice(i, 1, ...out);
          i += out.length - 1;
        } else walk(c, dalamAbbr || c.type === "abbr");
      }
    })(tree, false);
  };
}
