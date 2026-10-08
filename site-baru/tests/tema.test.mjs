// Tema: semua warna lewat token. Nilai heksadesimal hanya boleh ada di bagian token tema.css dan harus sama
// dengan tools/palette.py (GELAP/TERANG). Komponen, plugin, dan konten tidak boleh memuat heksadesimal.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../tools/registri.mjs";

const S = path.join(ROOT, "site-baru");
const css = fs.readFileSync(path.join(S, "src/styles/tema.css"), "utf8");
const HEX = /#[0-9A-Fa-f]{6}\b/g;

function blokToken(css, awal, akhir) {
  const i = css.indexOf(awal), j = css.indexOf(akhir, i + 1);
  assert.ok(i >= 0 && j > i, `blok ${awal} tidak ditemukan`);
  return css.slice(i, j);
}
const gelap = blokToken(css, "/* ── Token: gelap", "/* ── Token: terang");
const terang = blokToken(css, "/* ── Token: terang", "/* ── Pemetaan");
const sesudah = css.slice(css.indexOf("/* ── Pemetaan"));

test("heksadesimal hanya di blok token", () => {
  const sisa = sesudah.match(HEX) || [];
  assert.deepEqual(sisa, [], `heksadesimal di luar blok token: ${sisa.join(", ")}`);
});

function paletPy(nama) {
  const py = fs.readFileSync(path.join(ROOT, "tools/palette.py"), "utf8");
  const i = py.indexOf(`${nama} = {`);
  assert.ok(i >= 0, `${nama} tidak ada di palette.py`);
  let blok = py.slice(i, py.indexOf("\n}\n", i) + 3);
  if (nama === "TERANG") blok += py.slice(py.indexOf("KINDS = {"), py.indexOf("\n}\n", py.indexOf("KINDS = {")) + 3);
  return new Set((blok.match(HEX) || []).map((h) => h.toUpperCase()));
}
test("token gelap = palette.py GELAP", () => {
  const css = new Set((gelap.match(HEX) || []).map((h) => h.toUpperCase()));
  assert.deepEqual([...css].sort(), [...paletPy("GELAP")].sort());
});
test("token terang = palette.py TERANG + KINDS", () => {
  const css = new Set((terang.match(HEX) || []).map((h) => h.toUpperCase()));
  assert.deepEqual([...css].sort(), [...paletPy("TERANG")].sort());
});
test("komponen, plugin, dan konten tanpa heksadesimal", () => {
  const dirs = ["src/components", "src/plugins", "src/content", "src/lib", "tools"];
  const salah = [];
  for (const d of dirs) for (const f of fs.readdirSync(path.join(S, d), { recursive: true })) {
    const p = path.join(S, d, String(f));
    if (fs.statSync(p).isFile() && HEX.test(fs.readFileSync(p, "utf8"))) salah.push(path.relative(S, p));
  }
  assert.deepEqual(salah, []);
});
test("nilai wajib spesifikasi ada di token gelap", () => {
  for (const v of ["#0B0B0C", "#E6E6E6", "#FFFFFF", "#A3A3A8", "#7AB8FF"]) assert.ok(gelap.includes(v), `${v} hilang`);
});
