// Memeriksa rekaman Postgres (labs/b3-race) yang diputar ulang oleh race.js.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const dir = path.resolve(__dirname, "../../docs/widgets/data/b3-race");
const load = (id) => require(path.join(dir, id + ".json"));

const EXPECT = { "tx-tanpa-lock": 50000, "for-update": 30000, atomic: 30000, optimistic: 30000 };

for (const [id, final] of Object.entries(EXPECT)) {
  test(`${id}: saldo akhir ${final}, data lengkap`, () => {
    const d = load(id);
    assert.equal(d.final, final);
    assert.equal(d.start, 100000);
    assert.match(d.postgres, /^17\./);
    assert.equal(d.steps.at(-1).committed, final);
    for (const s of d.steps) {
      assert.ok(["A", "B"].includes(s.actor));
      assert.equal(typeof s.committed, "number");
      assert.ok(Array.isArray(s.waiting));
    }
  });
}

test("lock antar-koneksi benar-benar terjadi di tiga skenario", () => {
  for (const id of ["tx-tanpa-lock", "for-update", "atomic"]) {
    const waits = load(id).steps.filter((s) => s.result === "MENUNGGU lock");
    assert.equal(waits.length, 1, id);
    assert.deepEqual(waits[0].waiting, ["B"], id);
    assert.equal(waits[0].lock, "A", id);
  }
});

test("optimistic tidak memakai lock eksplisit, B harus membaca ulang", () => {
  const d = load("optimistic");
  assert.ok(d.steps.every((s) => s.result !== "MENUNGGU lock"));
  assert.ok(d.steps.some((s) => s.actor === "B" && s.result === "UPDATE 0"));
});
