// Skenario Before/After SQL halaman baru: hasilnya sesuai teks di halaman dan di tebakan.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "../..");
const VENDOR = path.join(ROOT, "situs/lama/vendor/sql.js-1.14.2");
const core = require(path.join(ROOT, "situs/lama/widgets/runsql-core.js"));
const initSqlJs = require(path.join(VENDOR, "sql-wasm.js"));
const load = (id) => require(path.join(ROOT, "situs/lama/widgets/data", id + ".json"));
let SQL;
test.before(async () => { SQL = await initSqlJs({ locateFile: (f) => path.join(VENDOR, f) }); });
const baris = (out) => out.table.values.map((r) => r.join("|"));

test("B2.1: tanpa FK pesanan yatim, dengan FK DELETE ditolak, CASCADE menghapus riwayat", () => {
  const s = load("b2-1-relasi");
  const before = core.runPanel(SQL, s, "before", []);
  assert.deepEqual(baris(before), ["1|budi|35000|(toko hilang)", "2|budi|18000|Apotek Sehat"]);
  const after = core.runPanel(SQL, s, "after", []);
  assert.equal(after.log[1].ok, false);
  assert.match(after.log[1].result, /FOREIGN KEY/);
  assert.deepEqual(baris(after), ["1|budi|35000|Warung Ani", "2|budi|18000|Apotek Sehat"]);
  const cascade = core.runPanel(SQL, s, "after", s.toggles);
  assert.deepEqual(baris(cascade), ["2|budi|18000|Apotek Sehat"]);
});

test("B2.3: tanpa index SCAN + TEMP B-TREE, index komposit SEARCH, index dibuat saja SCAN USING INDEX", () => {
  const s = load("b2-3-index");
  const plan = (out) => out.log[out.log.length - 1].result;
  assert.match(plan(core.runPanel(SQL, s, "before", [])), /SCAN pesanan.*USE TEMP B-TREE/);
  assert.match(plan(core.runPanel(SQL, s, "after", [])), /SEARCH pesanan USING INDEX idx_riwayat \(toko_id=\?\)/);
  assert.match(plan(core.runPanel(SQL, s, "after", s.toggles)), /SCAN pesanan USING INDEX idx_riwayat/);
});

test("B2.4: Before 6 query, After 1 query, hasil item sama", () => {
  const s = load("b2-4-n1");
  const before = core.runPanel(SQL, s, "before", []);
  const after = core.runPanel(SQL, s, "after", []);
  assert.equal(before.log.filter((e) => e.ok).length, 6);
  assert.equal(after.log.filter((e) => e.ok).length, 1);
  assert.equal(after.log[0].result.split("; ").length, 9);
});

test("B1.3: OFFSET menampilkan 108 dua kali, cursor tidak", () => {
  const s = load("b1-3-pagination");
  const b = core.runPanel(SQL, s, "before", []);
  assert.equal(b.log[0].result, "110; 109; 108");
  assert.equal(b.log[2].result, "108; 107; 106");
  const a = core.runPanel(SQL, s, "after", []);
  assert.equal(a.log[3].result, "107; 106; 105");
});

test("1.8 top-up: tanpa transaction 2 dari 4 terisi; dengan transaction 0; CSV dibetulkan 4", () => {
  const s = load("t1-topup");
  const before = core.runPanel(SQL, s, "before", []);
  assert.match(before.log.find((x) => !x.ok).result, /CHECK constraint failed/);
  assert.deepEqual(baris(before).slice(-2), ["TOTAL|500000", "CATATAN TOP-UP|2"]);
  assert.equal(s.predict.options[s.predict.answer], "2 karyawan");
  assert.deepEqual(baris(core.runPanel(SQL, s, "after", [])).slice(-2), ["TOTAL|0", "CATATAN TOP-UP|0"]);
  for (const p of ["before", "after"]) assert.deepEqual(baris(core.runPanel(SQL, s, p, s.toggles)).slice(-2), ["TOTAL|1000000", "CATATAN TOP-UP|4"]);
});

test("1.10 laporan: tanggal UTC memindahkan sarapan ke hari lain; WIB sama dengan buku Ani", () => {
  const s = load("t1-laporan");
  assert.deepEqual(baris(core.runPanel(SQL, s, "before", [])), ["2026-10-06|1|15000", "2026-10-07|3|67000", "2026-10-08|2|65000"]);
  const wib = ["2026-10-07|3|70000", "2026-10-08|3|77000"];
  assert.deepEqual(baris(core.runPanel(SQL, s, "after", [])), wib);
  assert.equal(s.predict.options[s.predict.answer], "Rp67.000");
  for (const p of ["before", "after"]) assert.deepEqual(baris(core.runPanel(SQL, s, p, s.toggles)), wib);
});
