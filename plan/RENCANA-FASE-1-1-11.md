# Rencana fase 1 · satu halaman: 1.11 Transaction di `situs/`

Status: **disetujui 2026-10-08, dikerjakan di branch `fase-1/situs-baru`**. Revisi dari persetujuan: tanpa React (React masuk fase 2 bersama widget React pertama), lima blok lipat ditunda ke fase 3. Hasil dan angka ukur ada di `plan/STATUS.md` bagian Fase 1.

## Tujuan

Mengukur biaya porting sebelum 59 halaman lain dipindah: satu halaman yang punya snippet lab, widget `stackstep`, dan widget `runsql`, dibangun dengan Astro + Starlight, mode gelap sesuai "Desain visual final" di PROPOSAL, dan widget lama dimuat apa adanya. MkDocs tidak disentuh; `tools/cek_batch.sh` tetap jadi gerbang untuk situs lama.

## Versi yang akan dipakai (dicek ke registry npm, 2026-10-08)

| Paket | Versi | Catatan |
|---|---|---|
| astro | 7.3.7 | Starlight 0.42 butuh astro ^7.2.10 |
| @astrojs/starlight | 0.42.5 | sidebar, Pagefind, mode gelap/terang bawaan |
| @astrojs/markdown-remark | 7.3.2 | pemroses `unified` supaya plugin remark jalan (Astro 7 memakai Sätteri sebagai bawaan) |
| shiki | 4.5.0 | dipin eksplisit, dipakai langsung komponen Snippet |
| typescript | 7.0.2 | |
| @playwright/test | 1.64.0 | tangkapan layar 1366×657 dan 375×667, gelap dan terang |

Setiap paket di atas butuh ADR singkat di KEPUTUSAN (aturan "menambah dependency") saat dipasang.

## Asumsi yang dipakai

1. Isi halaman tidak berubah (fase 1 = ganti wadah). Susunan 13 bagian tetap; lima blok lipat (Mulai, Coba, Paham, Putuskan, Kunci) dikerjakan di fase 3 sesuai tabel "Rencana migrasi" PROPOSAL. **Kalau pemilik ingin lima blok sudah ada di prototipe, tambah ±1 hari.**
2. Widget lama (`core.js`, `runsql-core.js`, `runsql.js`, `stackstep.js`, `cerita.js` untuk "Kamu di sini", `arsitektur`) dimuat lewat `<script is:inline>` dari `public/widgets/`, yang berisi salinan (symlink saat dev, copy saat build) dari `docs/widgets/`, `docs/vendor/sql.js-1.14.2/`, dan `docs/widgets/data/`. CSS widget (`widgets.css`) dimuat apa adanya; warnanya masih memakai token lama `--c-*`, jadi `tema.css` mendefinisikan token lama itu juga dengan nilai gelap supaya widget ikut gelap tanpa mengubah kodenya.
3. Sidebar dibuat dari `cerita.json` tapi hanya memuat halaman yang sudah ada di `situs/` (fase 1 = 1.11 saja); halaman lain tampil sebagai teks tanpa link supaya tidak ada 404.
4. Rujukan `[[A2]]`, `[[B3.2]]`, `[[berikutnya]]` dibuat oleh remark plugin yang membaca `cerita.json`, meniru `tools/registri.py`. Link ke halaman yang belum diporting mengarah ke situs lama (`/b-fondasi/...`) dengan tanda kecil "situs lama".
5. Font: Satoshi dan JetBrains Mono dari `docs/assets/fonts/` (hasil `get_fonts.sh`), disalin ke `public/fonts/` saat build; tidak masuk repo.

## File yang akan dibuat

```text
situs/
├── package.json, package-lock.json, tsconfig.json
├── astro.config.mjs                 Starlight + React; sidebar dari tools/sidebar.mjs; remark rujukan
├── .gitignore                       node_modules/, dist/, public/widgets/, public/fonts/
├── src/
│   ├── content.config.ts            docsLoader Starlight
│   ├── content/docs/
│   │   ├── index.mdx                beranda sementara satu paragraf + link ke 1.11 (beranda final = fase 3)
│   │   └── b-fondasi/b3-1-transaction.mdx   porting 235 baris: tabs → <Tabs>/<TabItem>, ??? → <details>, {: .meta} → <p class="meta">
│   ├── components/
│   │   ├── Snippet.astro            <Snippet file="labs/b3-stack/go/main.go" region="transfer" lang="go" /> membaca penanda --8<-- [start:x]/[end:x]; tanpa region = seluruh file (output rekaman)
│   │   ├── WidgetLama.astro         <WidgetLama nama="runsql" src="data/b3-1-transfer.json" /> → <div data-bb=...> + memuat skrip lama sekali per halaman
│   │   └── KamuDiSini.astro         breadcrumb Tahap › Kelompok › Halaman dari cerita.json (versi statis; widget cerita.js tetap untuk rekap)
│   ├── plugins/remark-rujukan.mjs   [[ID]], [[ID|teks]], [[berikutnya]] → link berjudul + nomor, ID tidak tampil
│   └── styles/tema.css              token: --bg #0B0B0C, --bg-2 #141416, --bg-3 #1C1C1F, --teks #E6E6E6, --judul #FFFFFF, --teks-2 #A3A3A8, --aksen #7AB8FF; mode terang via [data-theme=light]; 19–20 px / 17 px, line-height 1,65, kolom 680–720 px; Satoshi 400/600; palet makna system/good/warn/old versi gelap + terang; pemetaan ke --sl-color-* Starlight dan ke --c-* lama
├── tools/
│   ├── sidebar.mjs                  cerita.json → konfigurasi sidebar Starlight (grup per tahap, ★ jalur inti)
│   ├── siapkan-aset.mjs             salin/symlink docs/widgets, docs/vendor, docs/widgets/data, font → public/
│   └── tangkap.mjs                  Playwright: 1366×657 dan 375×667 × gelap/terang → situs/tangkapan/*.png (di-.gitignore)
└── tests/tema.test.mjs              node:test: semua warna di tema.css lewat token; tidak ada heksadesimal di komponen; contrast.py dijalankan untuk palet gelap dan terang
```

Di luar `situs/`: `tools/contrast.py` dan `tools/palette.py` mendapat palet gelap (sekarang hanya terang); `.github/workflows/cek.yml` mendapat job `site_baru` (`npm ci`, `astro build`, `node tests`, Playwright) yang jalan saat `situs/` atau `docs/widgets/` berubah; KEPUTUSAN 102+ untuk dependency dan pola komponen; MEMORI "Pelajaran" untuk jebakan build.

## Urutan kerja dan perkiraan waktu

| # | Langkah | Bukti selesai | Perkiraan |
|---|---|---|---|
| 1 | `npm create astro` + Starlight + React, build kosong lolos, job CI `site_baru` hijau | `astro build` 0 warning | 2 jam |
| 2 | `tema.css`: token gelap/terang, tipografi, font; `contrast.py` lolos dua mode | output contrast.py | 4 jam |
| 3 | `Snippet.astro` + tes region yang hilang gagal build | build gagal saat region salah ketik | 2 jam |
| 4 | `remark-rujukan.mjs` + `sidebar.mjs` dari cerita.json | tes: 3 rujukan di 1.11 jadi link bernomor tanpa ID tampil | 3 jam |
| 5 | `WidgetLama.astro` + `siapkan-aset.mjs`; runsql menjalankan sql.js, stackstep menyorot baris | klik Jalankan di browser, hasil sama dengan situs lama | 3 jam |
| 6 | Porting isi 1.11 ke MDX | diff teks halaman lama vs baru (tools/teks_halaman.py) kosong | 3 jam |
| 7 | Tangkapan layar 4 kombinasi, lihat sendiri, perbaiki; uji tiga pertanyaan (di mana, dari mana, ke mana) | 4 PNG + catatan penilaian | 4 jam |
| 8 | KEPUTUSAN, MEMORI, STATUS, laporan | commit | 1 jam |
| | **Total** | | **±22 jam ≈ 3 hari kerja** |

Risiko yang sudah terlihat: (a) `widgets.css` dan `extra.css` lama memakai kelas Material (`.md-typeset`), jadi sebagian gaya widget harus ditulis ulang di `tema.css`; (b) `cerita.js` ("Kamu di sini", "arsitektur") membaca `cerita.json` relatif ke `BB.base`, jadi path `public/widgets/` harus mempertahankan struktur `widgets/data/`; (c) Starlight menyuntikkan sidebar dan daftar isi sendiri, pemangkasan daftar isi jadi lima blok ditunda ke fase 3.

## Yang tidak dikerjakan di langkah ini

Halaman lain, penulisan ulang widget ke React, PGlite, Pagefind untuk glosarium, beranda final, lima blok lipat, dan penghapusan MkDocs.
