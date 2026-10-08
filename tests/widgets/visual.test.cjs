// Data widget visual Tahap 1: alur request, pilah, banding, mockup HP.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");
const json = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const core = require(path.join(ROOT, "situs/lama/widgets/alur-core.js"));
const pilah = require(path.join(ROOT, "situs/lama/widgets/pilah.js"));
const banding = require(path.join(ROOT, "situs/lama/widgets/banding.js"));

test("a2-alur (v1 lewat adapter): valid, varian mengganti ekor, predict terjawab di varian", () => {
  const raw = json("situs/lama/widgets/data/a2-alur.json");
  const d = core.normalize(raw);
  assert.deepEqual(core.validate(d), []);
  assert.deepEqual(d.komponen.map((k) => k.label), raw.jalur);
  assert.deepEqual(d.komponen[1].lapisan, raw.lapisan);
  assert.equal(core.steps(d, false).length, raw.langkah.length);
  assert.equal(core.steps(d, true).length, raw.varian.mulai + raw.varian.langkah.length);
  assert.ok(d.predict.varian && d.predict.options[d.predict.answer].includes("gagal"));
  assert.ok(d.langkah.slice(0, d.varian.mulai).some((s) => /COMMIT/.test(s.kirim || "")));
});

test("a2-alur: layar HP terakhir berlaku sampai ada layar baru, paket di tengah komponen", () => {
  const d = core.normalize(json("situs/lama/widgets/data/a2-alur.json"));
  const list = core.steps(d, false);
  assert.equal(core.layarAt(d, list, -1, "hp"), d.layarAwal.hp);
  assert.equal(core.layarAt(d, list, 3, "hp"), list[0].layar.hp);
  assert.equal(core.layarAt(d, list, list.length - 1, "hp").saldo, 30000);
  assert.equal(core.packetPos(d, { dari: "k0", ke: "k1" }), (100 / 6 + 50) / 2);
  assert.equal(core.pemilikLapisan(d, list[4]), "k1"); // akses data milik API, walau paket menuju DB
});

test("alur v2: validasi menolak id tidak dikenal, narasi kosong, lapisan salah, jalur panjang", () => {
  const ok = { versi: 2, judul: "x", sumber: { jenis: "ilustrasi" }, komponen: [{ id: "app", label: "App" }, { id: "api", label: "API", lapisan: ["handler"] }],
    langkah: [{ dari: "app", ke: "api", lapisan: "handler", judul: "a", jelas: "b", kirim: "c" }] };
  assert.deepEqual(core.validate(core.normalize(ok)), []);
  const rusak = (ubah) => { const d = core.normalize(JSON.parse(JSON.stringify(ok))); ubah(d); return core.validate(d).join(" | "); };
  assert.match(rusak((d) => { d.langkah[0].ke = "proxy"; }), /ke tidak dikenal 'proxy'/);
  assert.match(rusak((d) => { d.langkah[0].jelas = " "; }), /jelas \(narasi\) kosong/);
  assert.match(rusak((d) => { d.langkah[0].kirim = ""; }), /kirim \(data langkah\) kosong/);
  assert.match(rusak((d) => { d.langkah[0].lapisan = "worker"; }), /lapisan 'worker'/);
  assert.match(rusak((d) => { d.langkah[0].layar = { tablet: {} }; }), /perangkat tidak dikenal 'tablet'/);
  assert.match(rusak((d) => { d.langkah = Array(11).fill(d.langkah[0]); }), /maks 10/);
  assert.match(rusak((d) => { d.sumber = { jenis: "rekaman" }; }), /rekaman tanpa file/);
  assert.match(rusak((d) => { delete d.sumber; }), /sumber wajib/);
  assert.match(rusak((d) => { d.komponen.push({ id: "app", label: "lagi" }); }), /id ganda app/);
  // v1: indeks jalur di luar jangkauan tidak boleh hilang diam-diam lewat adapter
  const v1 = json("situs/lama/widgets/data/a2-alur.json");
  v1.langkah[2].ke = 7;
  assert.match(core.validate(core.normalize(v1)).join(" | "), /langkah 3: ke tidak dikenal '#7'/);
});

test("alur v2: banyak perangkat, masing-masing dengan layar terakhirnya sendiri", () => {
  const d = core.normalize({ versi: 2, judul: "x", sumber: { jenis: "ilustrasi" }, komponen: [{ id: "hp", label: "HP" }, { id: "db", label: "DB" }],
    perangkat: [{ id: "hp", label: "HP Budi" }, { id: "tablet", label: "Tablet Budi" }],
    layarAwal: { hp: { saldo: 1 }, tablet: { saldo: 1 } },
    langkah: [{ dari: "hp", ke: "db", judul: "a", jelas: "b", kirim: "c", layar: { hp: { saldo: 2 } } },
              { dari: "db", judul: "a", jelas: "b", kirim: "c", layar: { tablet: { saldo: 3 } } }] });
  assert.deepEqual(core.validate(d), []);
  const list = core.steps(d, false);
  assert.equal(core.layarAt(d, list, 1, "hp").saldo, 2);
  assert.equal(core.layarAt(d, list, 1, "tablet").saldo, 3);
  assert.equal(core.layarAt(d, list, 0, "tablet").saldo, 1);
});

test("a2-alur: saldo konsisten (Rp100.000 - Rp70.000 = Rp30.000)", () => {
  const d = json("situs/lama/widgets/data/a2-alur.json");
  assert.equal(d.hpAwal.saldo - 70000, d.langkah[d.langkah.length - 1].hp.saldo);
});

test("a1-pilah: jawaban menunjuk kelompok yang ada, alasan terisi", () => {
  const d = json("situs/lama/widgets/data/a1-pilah.json");
  for (const it of d.item) {
    assert.ok(it.jawab >= 0 && it.jawab < d.kelompok.length, it.teks);
    assert.ok(it.kenapa.length > 20, it.teks);
  }
  assert.deepEqual(pilah.nilai(d, d.item.map((it) => it.jawab)).salah, []);
});

test("a4-banding: semua simpul yang disorot ada, catatan lengkap", () => {
  assert.deepEqual(banding.cekData(json("situs/lama/widgets/data/a4-banding.json")), []);
});

test("a1-hp: layar valid", () => {
  const d = json("situs/lama/widgets/data/a1-hp.json");
  const jenis = ["baris", "input", "tombol", "toast", "proses", "teks"];
  for (const l of d.layar) for (const it of l.isi) assert.ok(jenis.includes(it.jenis), it.jenis);
});

test("A2 'Kenapa ini ada': rujukan (langkah N) menunjuk langkah yang benar", () => {
  const md = fs.readFileSync(path.join(ROOT, "situs/src/content/docs/a-gambaran/a2-perjalanan-request.mdx"), "utf8");
  const d = json("situs/lama/widgets/data/a2-alur.json");
  const teks = (n) => { const s = d.langkah[n - 1]; return [s.judul, s.kirim || "", s.jelas].join(" "); };
  const refs = [...md.matchAll(/\(langkah (\d+)\)/g)].map((m) => Number(m[1]));
  assert.ok(refs.length >= 6, "rujukan langkah ada");
  for (const n of refs) assert.ok(n >= 1 && n <= d.langkah.length, "langkah " + n);
  // Isi yang dirujuk memang ada di langkah itu
  assert.match(teks(1), /nominal/);
  assert.match(teks(3), /401/);
  assert.match(teks(4), /saldo/i);
  assert.match(teks(4), /422/);
  assert.match(teks(5), /500/);
  assert.match(teks(8), /"saldo"/);
  assert.match(teks(9), /saldo/);
});

test("a2-alur: setiap langkah punya data atau sengaja tanpa data (tidak ada bar kosong)", () => {
  const d = json("situs/lama/widgets/data/a2-alur.json");
  for (const st of d.langkah.concat(d.varian.langkah)) assert.ok(st.kirim && st.kirim.trim(), st.judul);
});
