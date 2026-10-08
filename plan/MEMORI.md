# Memori kerja

Catatan kerja lintas sesi dan lintas model. Maksimal 200 baris; baris yang tidak relevan lagi dihapus.

## Keputusan baru

- 109: konten dulu, satu tahap sampai tuntas; CERITA jadi sumber tertinggi; tiga skill wajib.
- 110: job CI `pesan_commit` menolak Co-Authored-By/Claude di pesan commit PR.
- 111: gerbang situs `tools/cek_situs.sh` (registry, istilah, audit, build, ID, kontras, tes; `--layar`).
- 112–114: MkDocs, halaman Markdown lama, dan `docs/` dihapus; registry di `situs/data/cerita.json`, widget lama di `situs/lama/`.
- 115: Cloudflare Pages Direct Upload dari CI; menunggu secret pemilik.
- 116: React 19.3, TS 6.0.3 (bukan 7: peer @astrojs/check), Zod 4.6, Vitest 5; `astro check` strict di gerbang.
- 120: breadcrumb otomatis di atas judul (jangan tulis `<KamuDiSini>` di halaman), pemilih peran, mode fokus.
- 119: tema hanya Gelap/Terang; kunjungan pertama selalu gelap.
- 118: `Blok.astro` + `data/templat.json`; kerangka di `situs/templat/`; daftar isi = blok (route middleware).
- 117: registry v2, Tahap 1 = 42 halaman 1.1–1.42; ID lama dipakai ulang; B1.2/F2 lebur, T1 lama diganti PRD.

## Usulan perubahan cerita

(kosong)

## Catatan untuk penulisan ulang Tahap 1

- 1.33 (E1, app versi lama): prasyarat B4.2 (Tahap 2) dibuang; isi lama memakai rekaman crash B4.2. Saat ditulis ulang, ADR 10 (expand lalu contract) harus berdiri sendiri.
- 1.15 (B6) menyerap B1.2; 1.39 (F1) menyerap F2. Hapus halaman B1.2/F2 di PR yang sama, catat di KEPUTUSAN.
- 1.1 PRD menggantikan T1 lama (`cerita/tahap-1`); pindahkan ilustrasi dan arsitektur tahap bila masih dipakai.
- Audit bahasa menolak kata "kantor"; naskah menulis "email kantor", di halaman pakai "email perusahaan".

## Perlu dicek pemilik

- Cloudflare Pages (keputusan 115): buat API token di dashboard Cloudflare (Custom Token, izin Account > Cloudflare Pages > Edit), lalu `gh secret set CLOUDFLARE_API_TOKEN` dan `gh secret set CLOUDFLARE_ACCOUNT_ID`. Sampai itu, job deploy lewat dan belum ada preview URL.

## Sedang dikerjakan

2026-10-08 · Tugas 0 dimulai (pemilik: "mulai"). PR 67 (arahan, keputusan 109–110) sudah di-merge. Rencana, satu PR per langkah:
1. `tahap-1/pemeriksaan-situs`: sinkron registry, istilah, audit bahasa, cek ID membaca `situs/` (MDX + `situs/dist`), bukan `docs/*.md` + `site/`; skrip gerbang `tools/cek_situs.sh` dipakai CI job situs. File: `tools/sinkron_cerita.py`, `build_istilah.py`, `audit_bahasa.py`, `cek_id_tampil.py`, `registri.py`, `cek_batch.sh`, `.github/workflows/cek.yml`.
2. Hapus build MkDocs: `mkdocs.yml`, `tools/mkdocs_hooks.py`, `cek_batch.sh`, job CI `cek_batch`, alat khusus situs lama, `requirements.txt` bila tinggal MkDocs.
3. Hapus halaman Markdown lama `docs/**/*.md` (sudah ada di `situs/`).
4. Pindahkan data hidup dari `docs/` ke `situs/` (registry, widget lama, vendor, ilustrasi, istilah); hapus `docs/`.
5. Cloudflare Pages + preview per PR (butuh akun/token pemilik: cek dulu `gh secret list`).
6. ADR dependency React/TypeScript/Zod/Vitest/PGlite (versi dari npm hari itu), lalu template halaman, beranda satu layar, peran, breadcrumb.
Lalu Tugas 1 halaman 1–42.

2026-10-08 · Fase 1 selesai secara isi: 60/60 halaman ada di `situs/` (Astro 7.3.7 + Starlight 0.42.5, tanpa React), semua widget lama jalan apa adanya, tooltip istilah jalan, CI job `situs` (build strict, tes token, kontras 2 mode, tangkapan 2 ukuran × 2 mode, layar pertama 4 ukuran) hijau di `main` (PR #2–#64). Belum: hapus MkDocs (gerbang PROPOSAL: kedua situs dibangun di CI sampai fase 1 dinyatakan lolos; keputusan pemilik), beranda satu layar dan lima blok (fase 3), hosting Cloudflare Pages dan link checker (fase 0 tersisa). Berikutnya menurut PROPOSAL: fase 2, satu widget per PR ditulis ulang ke TypeScript (mulai `alur` dan `pilah`, yang paling banyak dipakai: 22 dan 13 halaman), Zod untuk JSON, PGlite menggantikan sql.js di `runsql`; React masuk bersama widget React pertama (ADR dependency wajib). Perintah kerja: `cd situs && npm run build && npm test && node tools/layar.mjs && node tools/tangkap.mjs` dengan `npm run preview` di 127.0.0.1:4321.

## Pelajaran

- ThemeSelect bawaan Starlight memilih "auto" bila belum ada pilihan dan menimpa default gelap; diganti `PilihTema.astro` (keputusan 119). `tangkap.mjs` kini memeriksa kunjungan pertama dengan sistem terang.
- Komponen di dalam MDX bisa membaca `Astro.locals.starlightRoute.entry.body` (teks MDX halaman) untuk tahu posisinya.
- File `.js` di bawah `situs/` dibaca sebagai ES module (`situs/package.json` type module); widget UMD lama butuh `situs/lama/package.json` type commonjs.
- Di zsh, `for f in $VAR` tidak memecah kata; pakai `xargs` atau `${=VAR}`.
- Gerbang situs sekarang: `bash tools/cek_situs.sh --layar` (±3 menit lokal). Python di alat cukup `python3` sistem (pustaka standar).
- Di zsh, `grep -c` tanpa hasil keluar 1 dan memutus rantai `&&`; `PIPESTATUS` tidak ada (pakai `pipestatus`).
- `tools/cek_batch.sh` lokal (2026-10-08, sebelum perubahan apa pun): lolos; 60/60 halaman, 103 tes widget, layar pertama 0 gagal; 52 peringatan audit bahasa (bukan error) dan 19 peringatan "Inti > 175 karakter" adalah keadaan normal, bukan regresi. Lama ±3 menit.
- `make -C labs/b3-race run` dari nol (venv dihapus, container `down -v`): `make lab` 13 detik, `run` 3 detik. Satu-satunya diff adalah baris tanggal `direkam`/`recorded`; dikembalikan sesuai keputusan 82.
- Workflow `on: pull_request` + `push: [main]` tidak jalan saat branch percobaan didorong; branch `percobaan/**` ditambahkan ke pemicu push supaya pembuktian CI tidak butuh PR.
- `act` tidak terpasang di mesin ini; pembuktian CI memakai branch percobaan di GitHub.
- Foreground `sleep` diblokir di lingkungan Claude Code; pakai `gh run watch` di background.
- Di runner `ubuntu-latest` (24.04) Chrome headless mati dengan `ENOENT DevToolsActivePort`: penyebabnya AppArmor membatasi user namespace. Perbaikan lingkungan: `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0` sebelum `cek_batch.sh`; kode `tools/lib/chrome.mjs` tidak diubah.
- Astro 7 memakai pemroses Markdown "Sätteri"; `markdown.remarkPlugins` hanya jalan dengan `processor: unified({...})` dari `@astrojs/markdown-remark` (harus dipasang eksplisit). `smartypants: false` supaya tanda kutip sama dengan situs lama.
- Starlight 0.42 + Astro 7: route 404 bawaan memanggil `getEntry("docs","404")` dan Astro mencetak WARN bila tidak ada; dengan `404.md` route `[...slug]` bentrok. Solusi: `disable404Route: true` + `src/content/docs/404.md`.
- Modul yang diimpor komponen Astro dipindah ke `dist/.prerender/chunks/` saat build, jadi `import.meta.url` tidak bisa dipakai untuk mencari root repo; `tools/registri.mjs` mencari `mkdocs.yml` dari `process.cwd()` ke atas.
- Starlight memerlukan koleksi `i18n` (bisa berisi `{}`) bila `locales` diisi; tanpa itu ada WARN "collection i18n does not exist".
- Blok kode Shiki tanpa `overflow-x: auto` membuat scroll horizontal di 375 px; `tools/tangkap.mjs` memeriksa `scrollWidth` di tiap tangkapan.
- Widget `stackstep.js` bergantung pada DOM Material (`.tabbed-set`, `span[id^=__span]`); kontrak itu dibuat ulang oleh `Snippet.astro` + `TabSet.astro` (keputusan 103), bukan dengan mengubah widget.
- Starlight membungkus heading jadi `div.sl-heading-wrapper > h2 + a.sl-anchor-link`; pemeriksa yang berjalan dari `h2.nextElementSibling` harus mulai dari pembungkusnya (bug pertama `tools/layar.mjs` melaporkan lolos palsu).
- Tipe 19 px + header Starlight + bar "Di halaman ini" di HP membuat layar pertama sempit: `.content-panel` padding 0.75rem (0.6rem di HP), H1 2.2rem/1.6rem, pretest rapat ke Inti. Margin 1.11 di 375×667 tinggal 9 px; halaman dengan judul dua baris perlu dicek dulu dengan `npm run layar`.
- Konverter: link Markdown relatif ke `.md` lain (`../cerita/tahap-1.md`) harus diubah ke URL absolut lewat registry; `</details>` dan `</TabSet>` butuh baris kosong sesudahnya supaya heading berikutnya tidak tertelan MDX.
- Chromium di runner Linux merender ±25 px lebih tinggi daripada di Mac untuk bagian atas halaman HP; margin layar pertama lokal harus ≥ 20 px (ambang `tipis`), bukan sekadar > 0.
- Panggilan Bash paralel berbagi direktori kerja; selalu pakai path absolut untuk `node tools/...`.
- Halaman lama dengan judul pendek di H1 (keputusan 68/74) berbeda dari `title` frontmatter; Starlight memakai satu `title`, jadi konverter mengambil H1 badan. `banding.mjs` menangkapnya sebagai "urutan heading BERBEDA".
- pymdownx.snippets punya dua pola selain region: beberapa baris `--8<--` dalam satu fence (digabung) dan rentang baris `file:1:13`; Snippet mendukung `files={[...]}` dan `lines="1:13"`.
