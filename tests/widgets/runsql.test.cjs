// Menjalankan skenario Before/After dengan sql.js versi vendor yang sama dengan situs.
// Jalankan: node --test tests/widgets/
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");
const VENDOR = path.join(ROOT, "situs/lama/vendor/sql.js-1.14.2");
const core = require(path.join(ROOT, "situs/lama/widgets/runsql-core.js"));
const initSqlJs = require(path.join(VENDOR, "sql-wasm.js"));
const load = (id) => require(path.join(ROOT, "situs/lama/widgets/data", id + ".json"));

let SQL;
test.before(async () => {
  SQL = await initSqlJs({ locateFile: (f) => path.join(VENDOR, f) });
});

const saldo = (out) => Object.fromEntries(out.table.values.map(([k, v]) => [k, v]));

test("fill: template variabel aplikasi", () => {
  assert.equal(core.fill("SET saldo = ${a - 70000}", { a: 100000 }), "SET saldo = 30000");
  assert.equal(core.fill("${b+5}", { b: 1 }), "6");
  assert.throws(() => core.fill("${x}", {}), /belum diisi/);
});

test("B3.1 Before: UPDATE pertama permanen, Rp70.000 hilang", () => {
  const s = load("b3-1-transfer");
  const out = core.runPanel(SQL, s, "before", []);
  assert.deepEqual(saldo(out), { budi: 30000, ani: 980000, TOTAL: 1010000 });
  assert.equal(out.log[1].ok, false);
  assert.match(out.log[1].result, /CHECK constraint failed/);
  assert.equal(s.predict.options[s.predict.answer], "Rp1.010.000");
});

test("B3.1 After: ROLLBACK membuat total utuh", () => {
  const out = core.runPanel(SQL, load("b3-1-transfer"), "after", []);
  assert.deepEqual(saldo(out), { budi: 100000, ani: 980000, TOTAL: 1080000 });
  assert.ok(out.log.some((l) => l.sql === "ROLLBACK" && l.auto));
  assert.equal(out.log.at(-1).skipped, true); // COMMIT tidak dijalankan
});

test("B3.1 toggle batas Rp2.000.000: jalur sukses sama di kedua panel", () => {
  const s = load("b3-1-transfer");
  for (const p of ["before", "after"]) {
    assert.deepEqual(saldo(core.runPanel(SQL, s, p, s.toggles)), { budi: 30000, ani: 1050000, TOTAL: 1080000 });
  }
});

test("B3.2 Before: lost update, saldo akhir Rp50.000", () => {
  const s = load("b3-2-lost-update");
  const out = core.runPanel(SQL, s, "before", []);
  assert.deepEqual(out.table.values, [[1, 50000]]);
  assert.equal(s.predict.options[s.predict.answer], "Rp50.000");
});

test("B3.2 After: B ditolak (0 baris berubah), saldo Rp30.000", () => {
  const out = core.runPanel(SQL, load("b3-2-lost-update"), "after", []);
  assert.deepEqual(out.table.values, [[1, 30000]]);
  assert.equal(out.log[0].result, "1 baris berubah = sukses");
  assert.equal(out.log[1].result, "0 baris berubah = ditolak");
});

test("B3.2 toggle tanpa syarat: saldo jadi -Rp20.000", () => {
  const s = load("b3-2-lost-update");
  const out = core.runPanel(SQL, s, "after", s.toggles);
  assert.deepEqual(out.table.values, [[1, -20000]]);
  assert.equal(out.log[1].result, "1 baris berubah = sukses"); // label ikut hasil, bukan teks statis
});
