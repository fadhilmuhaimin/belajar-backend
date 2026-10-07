// Widget token bucket (ember.js): hasilnya harus sama dengan rekaman lab labs/c4-ratelimit.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const ROOT = path.resolve(__dirname, "../..");
const e = require(path.join(ROOT, "docs/widgets/ember.js"));
const d = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/widgets/data/c4-ember.json"), "utf8"));
const rekaman = fs.readFileSync(path.join(ROOT, "labs/c4-ratelimit/output/ratelimit.txt"), "utf8");
const bagian = (h) => rekaman.split("\n== ").find((b) => b.startsWith(h) || b.startsWith("== " + h));
const status = (teks) => [...teks.matchAll(/ (200|401|429)(?:  Retry-After: (\d+))?$/gm)].map((m) => m[1] + (m[2] ? "/" + m[2] : ""));

test("A: 8 tebakan dari satu IP = 5 × 401, 3 × 429 Retry-After 12; setelah 12 detik satu lolos lagi", () => {
  const s = e.baru();
  const r = e.jalankan(s, d.mode[0], d.aksi[0]).hasil.map((h) => h.status + (h.retryAfter ? "/" + h.retryAfter : ""));
  e.jalankan(s, d.mode[0], d.aksi[2]);
  const lagi = e.jalankan(s, d.mode[0], { kirim: { jumlah: 1, akun: "Budi", ip: "10.0.0.66" } }).hasil[0].status;
  assert.deepEqual([...r, String(lagi)], status(bagian("A.")));
});

test("B: per IP saja, 30 karyawan satu Wi-Fi = 5 × 200, 25 × 429 (sama dengan rekaman)", () => {
  const r = e.jalankan(e.baru(), d.mode[0], d.aksi[1]).hasil;
  assert.equal(r.filter((h) => h.status === 200).length, 5);
  assert.equal(r.filter((h) => h.status === 429).length, 25);
  assert.match(bagian("B."), /200: 5 · 429: 25/);
});

test("C: per akun + per IP longgar, 30 karyawan = 30 × 200; penyerang tetap berhenti di 5", () => {
  const s = e.baru();
  const serang = e.jalankan(s, d.mode[1], d.aksi[0]).hasil;
  assert.equal(serang.filter((h) => h.status === 401).length, 5);
  const r = e.jalankan(s, d.mode[1], d.aksi[1]).hasil;
  assert.equal(r.filter((h) => h.status === 200).length, 30);
  assert.match(bagian("C."), /200: 30/);
});
