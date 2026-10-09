# Memori kerja

Catatan kerja lintas sesi dan lintas model. Maksimal 200 baris; baris yang tidak relevan lagi dihapus.

## Keputusan baru

- Nomor keputusan: sesi konten memakai 165–199; 163–164 dan 200–219 milik sesi layout/redesain (pesan sesi "Rekeningo Tech Journey planning", 2026-10-09).
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

## Untuk sesi redesain

- Sesi redesain mengubah `.mdx` konten di folder utama (mis. `m3-tanda-kutip.mdx`: prop `ilustrasi="m3"` di Blok); saat rebase setelah redesain merge, cek bentrok di halaman Tahap 1.
- Widget lama stackstep (1.23 `tahap-1/transaction`): tombol langkah pertama lebih tinggi/turun dari tombol lain di 375 px dan desktop terang; kemungkinan margin saudara Starlight (`* + *`) seperti keputusan 124/128. Kontainer tombol stackstep perlu masuk aturan margin di tema.css.

## Perlu dicek pemilik

- Cloudflare Pages (keputusan 115), belum ada; job deploy dilewati dan pekerjaan jalan terus. Yang dibutuhkan:
  1. Di dashboard Cloudflare: My Profile > API Tokens > Create Custom Token, izin **Account > Cloudflare Pages > Edit**, untuk akun yang memiliki project Pages.
  2. Account ID: dashboard Cloudflare, Workers & Pages, kolom kanan "Account ID".
  3. Jalankan di root repo: `gh secret set CLOUDFLARE_API_TOKEN` lalu `gh secret set CLOUDFLARE_ACCOUNT_ID` (keduanya meminta nilai lewat prompt, tidak masuk riwayat shell).

## Sedang dikerjakan

2026-10-09 · Halaman 1.23 selesai (PR menyusul merge); berikutnya **1.24 ADR 5–6** (lab dulu: service membuka transaction dan meneruskan Tx ke repo; lalu halaman). Branch 1.23: `tahap-1/transaction` dari `main` (cf229e9, berisi 1.20–1.22). Worktree konten: `/Users/fadhilmuhaimin/Project/Web/rekeningo-konten` (folder utama milik sesi redesain: jangan checkout/stash/reset/commit di sana). Gerbang: `PORT_PREVIEW=4323 bash tools/cek_situs.sh --layar`. Batas file selama redesain (#120) belum merge: hanya `situs/src/content/docs/**`, `labs/**`, `situs/data/cerita.json`, data widget, KEPUTUSAN 165–199, MEMORI/STATUS bagian konten; jangan CSS, komponen layout, CLAUDE.md, PROPOSAL.md. Konten tanpa class/style tambahan di MDX, paragraf pendek. Setelah redesain di-merge: rebase branch terbuka ke main, cek ulang tangkapan halaman yang ditulis paralel (1.22 dst.), hapus worktree.
Aturan PR (pemilik, 2026-10-09): merge sendiri setiap PR begitu CI hijau, sebelum memulai halaman berikutnya; paling banyak satu PR terbuka. #120 (redesain) tidak boleh di-merge sesi ini.
Rencana 1.23: lima blok dari isi lama `b-fondasi/b3-1-transaction.mdx`; buka dari M4 (`m4.txt`) tanpa mengulang ceritanya; Coba = stackstep + TabSet b3-stack; tab Spring diganti Dart (Serverpod, tidak dijalankan, docs data-and-the-database/database/transactions); runsql lama `b3-1-transfer.json` tidak dipakai (sudah ada di 1.22). Lalu 1.24: PR lab dulu (service membuka transaction, meneruskan Tx ke repo; ADR 5 sesuai naskah), baru halaman. Ilustrasi M3-M6 belum. 1.6 masih Snippet `api-t1-lama` (PR kecil terpisah).
Pola tulis ulang halaman lama: pindah ke `tahap-1/<slug>.mdx`, lima blok, contoh disesuaikan dengan PRD v1 (tanpa katalog/pesanan), hapus file lama + data widget lama yang tidak dipakai, perbarui `path`, `prasyarat`, hapus `lama` di registry, perbarui `alat/indeks-topik.mdx`, lalu `python3 tools/sinkron_cerita.py`.
Pola per halaman: branch `tahap-1/<slug>` dari `main`; lab dulu bila perlu (PR sendiri); halaman (PR sendiri); gerbang `bash tools/cek_situs.sh --layar > tmp/cek.txt; tail -30`; tangkapan `cd situs && npm run preview` lalu `node tools/tangkap.mjs --path /tahap-1/<slug>/` (dari `situs/`); lihat sendiri; KEPUTUSAN + STATUS + MEMORI; merge bila CI hijau; akhiri dengan "Siap dilanjutkan dari <halaman>". Setelah 1.42: jalankan isi `plan/PROMPT-CROSSCHECK.md`, tulis `plan/LAPORAN-TAHAP-1.md`.

## Pelajaran

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
