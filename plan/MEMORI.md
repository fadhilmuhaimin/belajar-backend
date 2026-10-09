# Memori kerja

Catatan kerja lintas sesi dan lintas model. Maksimal 200 baris; baris yang tidak relevan lagi dihapus.

## Keputusan baru

- Nomor keputusan baru = nomor terbesar di KEPUTUSAN + 1 (keputusan 220); sisa 174–199 dibiarkan kosong.
- 220: K0a, Rantai prop `ringkas` untuk Inti (HP mendatar tanpa sub); Inti 1.21, 1.23, 1.25.
- 218: crosscheck K0 di `plan/CROSSCHECK-KECIL.md`; temuan K0a–K0c.
- 219: hasil uji kering, tabel perintah yang ditolak di protokol, tugas K0d. 218: crosscheck K0 (dari loop).
- 217: satu pekerja; #120 di-merge, worktree konten ditutup, lab m5 di branch `tahap-1/lab-m5`.
- 216: sistem otomatis (ANTREAN, PROTOKOL-OTOMATIS, `tools/antrean.py`, `tools/jalankan-otomatis.sh`, deny loop di `tools/otomatis.settings.json`).
- 211–215: visual redesain (PetaFitur, Rantai, diagram ADR 1 dan halaman masalah, ilustrasi M4); 200–210: redesain tampilan (#120).
- 173: 1.25 migration; 172: lab b4-migration v1 (drift laptop/server, dirty).
- 171: 1.24 ADR 5–6; 170: lab DalamTx + koreksi.
- 169: 1.23 transaction.
- 168: 1.22 M4; 167: mode rentan m4 + `m4.txt`, PORT_PREVIEW di cek_situs.sh.
- 166: 1.21 lapisan dasar; 165: `cek_arah.py` + rekaman `lapisan.txt`.
- 162: 1.20 SQL injection + ADR 4; 161: cari-bug field `aman` + CSS baris; 160: rekaman injection (log PG, gosec, latihan/).
- 159: 1.19 M3 (injection); 158: widget React cari-bug; 157: lab pencarian + mode rentan m3.
- 156: 1.18 + ADR 3; 155: kontrak b1-openapi v1, bacaJSON/wajibAda, -rentan m2.
- 154: 1.17 M2; 153: lab m2 (field asing diabaikan, judul 400 menyesatkan).
- 152: 1.16 HTTP dari http.txt; 151: GET /transfers/{id} supaya Location jujur.
- 150: 1.15 + ADR 2; B1.2 dihapus, rujukan ke B6; penamaan resource pindah ke 1.18.
- 149: 1.14 M1 (masalah pertama); 148: mode rentan -rentan m1, runsql setup per panel.
- 147: 1.13 ditulis ulang (Sinta bertanya, banding fitur v1).
- 146: 1.12 ditulis ulang ke tabel v1; lab relasi (145).
- 144: halaman 1.11 + widget React pertama jumlah-total (src/widgets/, data/widget/).
- 143: lab api-t1 bagian pertukaran (SUM saldo = SUM top-up).
- 142: pengaman loop (tree bersih + main), log stream-json.
- 141: halaman 1.10 (laporan per tanggal WIB vs UTC).
- 140: hooks PreCompact/SessionStart, `tools/jalankan-tahap.sh` (loop headless + crosscheck akhir), CLAUDE.md butir 7.
- 109: konten dulu, satu tahap sampai tuntas; CERITA jadi sumber tertinggi; tiga skill wajib.
- 110: job CI `pesan_commit` menolak Co-Authored-By/Claude di pesan commit PR.
- 111: gerbang situs `tools/cek_situs.sh` (registry, istilah, audit, build, ID, kontras, tes; `--layar`).
- 112–114: MkDocs, halaman Markdown lama, dan `docs/` dihapus; registry di `situs/data/cerita.json`, widget lama di `situs/lama/`.
- 115: Cloudflare Pages Direct Upload dari CI; menunggu secret pemilik.
- 116: React 19.3, TS 6.0.3 (bukan 7: peer @astrojs/check), Zod 4.6, Vitest 5; `astro check` strict di gerbang.
- 121: beranda satu layar (splash); A0 pindah ke /cara-pakai/ (lama); layar.mjs memeriksa beranda.
- 120: breadcrumb otomatis di atas judul (jangan tulis `<KamuDiSini>` di halaman), pemilih peran, mode fokus.
- 119: tema hanya Gelap/Terang; kunjungan pertama selalu gelap.
- 118: `Blok.astro` + `data/templat.json`; kerangka di `situs/templat/`; daftar isi = blok (route middleware).
- 117: registry v2, Tahap 1 = 42 halaman 1.1–1.42; ID lama dipakai ulang; B1.2/F2 lebur, T1 lama diganti PRD.

## Usulan perubahan cerita

- M4 (naskah bagian 4): naskah belum menyebut asal batas saldo warung. Halaman 1.22 memakai: minggu 2, Raka menambah batas Rp1.500.000 untuk saldo akun warung langsung di server lewat psql, untuk membatasi kerugian kalau ada salah top-up ke akun warung; Jumat minggu 3 saldo Ani Rp1.450.000 setelah 29 pembayaran Rp50.000. Disetujui pemilik 2026-10-09; mohon naskah M4 diperbarui.
- M2 (naskah bagian 4): naskah menulis server membaca `nominal`; lab dan halaman sejak 1.9 memakai field `jumlah` (label layar tetap "Nominal"). Halaman 1.17 menulis tiga nama: Nominal di layar, `amount` di Dart, `jumlah` di server. Usul: naskah menyebut `jumlah`, atau dibiarkan (konsepnya sama).

## Catatan untuk penulisan ulang Tahap 1

- Lab baru `labs/api-t1` (keputusan 132) dibangun per halaman; halaman lama memakai `labs/api-t1-lama`. Saat 1.6 sudah punya lab berfolder, ganti tiga Snippet komentar file di 1.6 dengan folder nyata. Pemilik menyetujui (2026-10-08) menghapus `labs/api-t1-lama`, tapi hanya setelah `grep -rn api-t1-lama situs/ labs/ tools/` kosong (tidak ada halaman atau Snippet yang merujuknya); bukti grep ditulis di PR hapus.
- Kolom "Halaman" di tabel lab README memakai nomor lama sebelum registry v2; perbarui saat lab dipakai halaman baru.
- 1.33 (E1, app versi lama): prasyarat B4.2 (Tahap 2) dibuang; isi lama memakai rekaman crash B4.2. Saat ditulis ulang, ADR 10 (expand lalu contract) harus berdiri sendiri.
- 1.39 (F1) menyerap F2: hapus halaman F2 dan entrinya di PR yang sama (pola keputusan 150), tes registri lalu butuh contoh entri lebur lain atau dihapus.
- Ilustrasi `situs/lama/assets/cerita/tahap-1.svg` (adegan cerita lama) tidak dipakai lagi sejak T1 dihapus; ganti dengan ilustrasi latar perusahaan Grup Lestari (naskah: 1 latar + M3–M6).
- Tabel "Angka di tahap ini" Tahap 1 ikut hilang bersama T1; tulis ulang di 1.37/1.38 (estimasi), angka dari `tahap[0].asumsi`.
- `/cara-pakai/` (A0) masih menjelaskan susunan 5 bagian lama; tulis ulang untuk lima blok dan tiga pintu setelah halaman Tahap 1 pertama jadi.
- Tombol beranda otomatis berubah ke "Mulai dari PRD" begitu `t1-prd` ada.
- Audit bahasa menolak kata "kantor"; naskah menulis "email kantor", di halaman pakai "email perusahaan".

## Catatan tampilan

- Widget lama stackstep (1.23 `tahap-1/transaction`): tombol langkah pertama lebih tinggi/turun dari tombol lain di 375 px dan desktop terang; kemungkinan margin saudara Starlight (`* + *`) seperti keputusan 124/128. Kontainer tombol stackstep perlu masuk aturan margin di tema.css.

## Perlu dicek pemilik

- Redesain (PR #120, sudah di-merge 2026-10-09): usulan perubahan PROPOSAL "Desain visual final" dan CLAUDE.md `<tampilan>` (beranda bukan lagi satu layar penuh; warna, ukuran, navigasi) ada di `plan/AUDIT-TAMPILAN.md` bagian 6. Belum diubah karena butuh persetujuan pemilik; loop tidak menyentuhnya.

- Cloudflare Pages (keputusan 115), belum ada; job deploy dilewati dan pekerjaan jalan terus. Yang dibutuhkan:
  1. Di dashboard Cloudflare: My Profile > API Tokens > Create Custom Token, izin **Account > Cloudflare Pages > Edit**, untuk akun yang memiliki project Pages.
  2. Account ID: dashboard Cloudflare, Workers & Pages, kolom kanan "Account ID".
  3. Jalankan di root repo: `gh secret set CLOUDFLARE_API_TOKEN` lalu `gh secret set CLOUDFLARE_ACCOUNT_ID` (keduanya meminta nilai lewat prompt, tidak masuk riwayat shell).

## Sedang dikerjakan

2026-10-10 · K0a selesai (keputusan 220), branch `perbaikan/k0a`: Inti 1.21, 1.23, 1.25 = kalimat → `<Rantai ringkas />` → dua paragraf; file: `Rantai.astro`, `tema.css`, tiga `situs/data/diagram/t1-*.json`, tiga mdx. Berikutnya K0b (`python3 tools/antrean.py berikut`). Rantai di Inti selalu pakai `ringkas` dan maksimal dua baris pendek; ukur dengan `npm --prefix situs run layar -- --url http://127.0.0.1:4321` (perlu build + preview ulang). Tangkapan dari root: `npm --prefix situs run tangkap -- --url http://127.0.0.1:4321 --path /<path>/` (menulis ke `situs/tangkapan/`); `cd` dan perintah majemuk ditolak mode dontAsk, jadi satu perintah per panggilan dengan path relatif.
2026-10-09 · Sistem kerja otomatis siap (keputusan 216, 217). Satu-satunya pekerja: `tools/jalankan-otomatis.sh`; setiap iterasi membaca `plan/PROTOKOL-OTOMATIS.md` dan mengerjakan satu tugas dari `plan/ANTREAN.md` (berikutnya: `python3 tools/antrean.py berikut`). Tidak ada worktree lagi; kerja di folder utama, branch dari main, paling banyak satu PR terbuka, merge sendiri bila CI hijau. Lanjutkan: `caffeinate -dims bash tools/jalankan-otomatis.sh` di main bersih.
Pola tulis ulang halaman lama: pindah ke `tahap-1/<slug>.mdx`, lima blok, contoh disesuaikan dengan PRD v1 (tanpa katalog/pesanan), hapus file lama + data widget lama yang tidak dipakai, perbarui `path`, `prasyarat`, hapus `lama` di registry, perbarui `alat/indeks-topik.mdx`, lalu `python3 tools/sinkron_cerita.py`.
Pola per halaman: branch `tahap-1/<slug>` dari `main`; lab dulu bila perlu (PR sendiri); halaman (PR sendiri); gerbang `bash tools/cek_situs.sh --layar > tmp/cek.txt; tail -30`; tangkapan `cd situs && npm run preview` lalu `node tools/tangkap.mjs --path /tahap-1/<slug>/` (dari `situs/`); lihat sendiri; KEPUTUSAN + STATUS + MEMORI; merge bila CI hijau; akhiri dengan "Siap dilanjutkan dari <halaman>". Setelah 1.42: jalankan isi `plan/PROMPT-CROSSCHECK.md`, tulis `plan/LAPORAN-TAHAP-1.md`.

## Pelajaran

- Di halaman konsep, visual pertama sesudah Inti mulai di y≈420 px pada 375×667; tersisa ±245 px. `node situs/tools/layar.mjs` dari root gagal (mencari `dist/` relatif cwd); pakai `npm --prefix situs run layar`.

- macOS di mesin ini tidak punya `timeout`/`gtimeout`; batasi lama perintah dengan timeout alat Bash atau `gh ... --watch`.
- Mode auto menolak sesi mengubah izinnya sendiri (`.claude/settings.json`, label Self-Modification), lewat Bash maupun Edit; pemilik yang memasang perubahan izin.
- `claude -p --output-format stream-json` selalu memancarkan `rate_limit_event` berstatus `allowed`; batas pemakaian dibaca dari field status, bukan dari teks "rate limit".
- Token di `:root[data-theme="light"]` (mis. `--sl-content-width`) mengalahkan override splash Starlight; beranda harus menyetel lebarnya sendiri di `.content-panel:has(.beranda)`.
- Build `main` di worktree: symlink `node_modules` membuat Vite gagal (path ganda); pakai `cp -cR` (clone APFS) dan salin `public/fonts` (di-.gitignore).
- Audit bahasa menolak kata "pemakai" (juga di kunci JSON registry); pakai "user".
- `tools/cek_situs.sh --layar` menyalakan preview di 127.0.0.1:4321; bila port itu dipakai dev server (yang mendengar di `localhost`), langkah layar gagal ECONNREFUSED. Jalankan `node tools/layar.mjs --url <preview lain>` dan `tangkap.mjs --url` manual; jangan mematikan dev server pemilik.
- Starlight 0.42 menyetel ukuran artikel dari `--sl-text-base`, bukan `--sl-text-body`; aturan `details {font-size:0.92em}` mengenai `details.blok` (keputusan 200).
- Merge berhenti sejak #115 (2026-10-09): `gh pr merge` ditolak pengaman mode otomatis satu kali, lalu sesi terus menumpuk PR (#116–#122) dan melapor "menunggu merge pemilik"; pemilik mengira sudah merge. Sekarang pemilik mengizinkan merge sendiri. Kalau merge ditolak lagi: berhenti, laporkan di baris pertama laporan, dan jangan memulai halaman berikutnya di atas PR yang belum di-merge.
- Setelah gerbang lolos, perubahan teks apa pun (termasuk perbaikan audit di Cek diri) wajib diikuti `python3 tools/sinkron_cerita.py` dan gerbang ulang; CI #119 gagal karena `kartu.json` tertinggal.
- gosec v2.29.0 G201/G202 hanya memeriksa query di assignment dan expression statement; query yang langsung di `return` tidak diperiksa (rekaman injection.txt E).
- Aturan Starlight `:is(ol,ul):has(> li > :not(...)) > li > :last-child` memberi margin-bottom 1.25rem; list berisi tombol (cari-bug) perlu override.
- Astro 7 `astro preview` berjalan di latar dan singleton; setelah build ulang, `astro preview stop` lalu jalankan lagi, kalau tidak halaman lama tersaji. Port bisa pindah ke 4322 (cek `astro preview status`).
- Beberapa sesi Claude bisa memakai working tree yang sama; cek `git branch --show-current` sebelum commit, dan pakai `git worktree add` untuk pekerjaan panjang. Worktree butuh `situs/node_modules`, `labs/.venv` (symlink) dan `situs/public/fonts` (salin, diabaikan git).
- `node tools/tangkap.mjs` menulis ke `tangkapan/` relatif cwd; jalankan dari `situs/` (di-.gitignore di sana), bukan dari root.
- Hook PreCompact: stdout dan stderr dengan exit 0 hanya masuk debug log, tidak terlihat model; exit 2 memblokir compaction. Stdout SessionStart masuk konteks (docs hooks resmi).
- Di dalam blok, Cek diri ditulis `### Cek diri`; sinkron membacanya sejak keputusan 127 dan menolak halaman konsep baru dengan kurang dari 3 kartu.
- Widget lama dengan baris horizontal (flex) kena margin saudara Starlight; tambahkan kontainernya ke aturan `:is(...) > * + *` di tema.css (keputusan 124, 128).
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
