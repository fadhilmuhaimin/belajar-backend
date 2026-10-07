// Jadwal kartu ulang (kartu.js): kotak Leitner sederhana.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const ROOT = path.resolve(__dirname, "../..");
const k = require(path.join(ROOT, "docs/widgets/kartu.js"));

test("ingat menaikkan kotak dan menjauhkan jadwal; belum ingat kembali ke kotak 1", () => {
  assert.deepEqual(k.jawab(null, true, "2026-10-06"), { k: 2, due: "2026-10-08" });
  assert.deepEqual(k.jawab({ k: 5, due: "x" }, true, "2026-10-06"), { k: 5, due: "2026-10-22" });
  assert.deepEqual(k.jawab({ k: 4, due: "x" }, false, "2026-10-06"), { k: 1, due: "2026-10-07" });
});

test("antrean: jatuh tempo paling lama dulu, lalu kartu baru, dibatasi", () => {
  const kartu = ["a", "b", "c", "d"].map((id) => ({ id }));
  const st = { a: { k: 2, due: "2026-10-05" }, b: { k: 3, due: "2026-10-01" }, c: { k: 1, due: "2026-10-09" } };
  assert.deepEqual(k.antre(kartu, st, "2026-10-06", 10).map((c) => c.id), ["b", "a", "d"]);
  assert.equal(k.antre(kartu, st, "2026-10-06", 2).length, 2);
});

test("kartu.json: setiap kartu punya soal dan jawaban, id unik", () => {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/widgets/data/kartu.json"), "utf8"));
  assert.ok(d.length > 0);
  assert.equal(new Set(d.map((c) => c.id)).size, d.length);
  for (const c of d) assert.ok(c.tanya.length > 10 && c.jawab.length > 10, c.id);
});
