# Memori kerja

Catatan kerja lintas sesi dan lintas model. Maksimal 200 baris; baris yang tidak relevan lagi dihapus.

## Keputusan baru

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

## Perlu dicek pemilik

- Cloudflare Pages (keputusan 115), belum ada; job deploy dilewati dan pekerjaan jalan terus. Yang dibutuhkan:
  1. Di dashboard Cloudflare: My Profile > API Tokens > Create Custom Token, izin **Account > Cloudflare Pages > Edit**, untuk akun yang memiliki project Pages.
  2. Account ID: dashboard Cloudflare, Workers & Pages, kolom kanan "Account ID".
  3. Jalankan di root repo: `gh secret set CLOUDFLARE_API_TOKEN` lalu `gh secret set CLOUDFLARE_ACCOUNT_ID` (keduanya meminta nilai lewat prompt, tidak masuk riwayat shell).

## Sedang dikerjakan

2026-10-09 · SESI REDESAIN TAMPILAN, BERHENTI atas permintaan pemilik (tidak ada pekerjaan baru di sesi ini). PR TIDAK di-merge; pemilik yang memutuskan.
- Branch `redesain/tampilan` (dari `main` a2084bd), PR draft #120 terbuka (https://github.com/fadhilmuhaimin/rekeningo-tech-journey/pull/120), JANGAN merge. Commit lolos gerbang: e3d3f6a audit (keputusan 200), 227014f satu kolom baca (202). Gerbang terakhir di 227014f: `tools/cek_situs.sh` lolos; `layar.mjs` 0 gagal 0 tipis; `tangkap.mjs` 9 ok (layar dan tangkapan dijalankan manual terhadap preview 127.0.0.1:4322 karena port 4321 dipakai dev server pemilik, lihat Pelajaran).
- SETENGAH JALAN, belum di-commit: tipografi (keputusan 201) ada di `git stash` bernama `redesain-tipografi` (dibuat di atas e3d3f6a, sebelum 202): `--teks #EDEDED`, `--teks-2 #B4B4B9` gelap / `#40454C` terang (≥ 8:1 di semua latar, `contrast.py` dapat ambang `SEKUNDER = 8.0`), `palette.py` ikut, `tema.test.mjs` nilai baru, `--sl-content-width 42.5rem` (680 px), isi 20/18 px lh 1,7 berat 400 lewat `.sl-markdown-content { font-size: var(--rk-isi) }` (bukan `--sl-text-body`), `details.blok {font-size:1em}`, UI ≥ 14 px dan meta/label 15 px lewat token `--rk-ui` (rem), garis bawah tautan di teks, sidebar tanpa opacity/italic, label tanpa kapital, pemindai teks < 14 px di `audit-tampilan.mjs`. Hasil uji stash: axe 0 pelanggaran di beranda/1.1/1.19 kedua ukuran; teks < 14 px tinggal `dt` kotak meta PRD (HP); kontras lolos. PENYEBAB GAGAL: `layar.mjs` gagal di halaman LAMA karena teks lebih besar mendorong visual pertama keluar layar: b2-4-n-plus-1 (1366, 22 px), b3-1-transaction (1366 24 px, 375 37 px), b3-3-isolation-level (375, 15), cerita/peta (1366, 5), d1-kerangka-berpikir (375, 43), e1-app-versi-lama (1366 50, 375 70), e3-retry-idempotency (375, 14), f1 (375, 4), f2 (375, 43). Diukur SEBELUM 202, yang membebaskan ±48 px di HP (bilah TOC); belum diukur ulang.
- Langkah berikutnya: (1) `git stash pop` di `redesain/tampilan` (konflik kemungkinan di akhir `tema.css` karena 202 juga menambah bagian di sana: pertahankan keduanya); build; `node tools/layar.mjs --url <preview>`; bila masih gagal, padatkan bagian atas halaman lama (rekap fiktif breadcrumb, meta 1 baris) sebelum commit 201. (2) Sisa aturan pemilik: blok tanpa kotak + transisi buka (reduced-motion) + status selesai hanya setelah blok dibuka/digulir (203); Berikutnya rata kanan tidak penuh lebar, satu aksen per layar (204); kotak meta PRD 2–3 baris (205); progres baca tipis di atas (206); ilustrasi kecil di awal blok cerita (207); beranda baru: teka-teki HP Budi Rp70.000 (M4) + tebak 3 pilihan → transaction, peta 6 tahap interaktif (diagram arsitektur, user, tim dari registry; tahap 2–6 "segera"/"versi lama"), kartu Lanjutkan dari localStorage, peran sebagai pertanyaan → 5 halaman disarankan, pencarian masalah dengan saran (208+); tangkapan sebelum/sesudah berdampingan di AUDIT-TAMPILAN.md (tangkapan "sebelum" dibuat ulang dari build `main`: `AXE=<axe.min.js> node tools/audit-tampilan.mjs --url <preview main> --foto <dir>`; axe-core 4.10.3 dipasang di luar proyek), ukur ulang, PROPOSAL "Desain visual final" diperbarui sesuai keputusan 201–208. (3) Riset bersumber sudah ada (laporan subagen): Material 2022 tidak mendukung huruf lebih tebal di mode gelap → berat 400; BDA: hindari italic/kapital; COGA: paragraf ≤ 50 kata, ruang putih, tanpa gerak sendiri; gerak 100–250 ms; Josh Comeau 18 px/704 px, Stripe 16 px/678 px, Nicky Case 20 px/700 px. Masukkan ke AUDIT-TAMPILAN.md bagian 2 (belum ditulis).
- Nomor keputusan: redesain memakai 164 dan 200–219 (dipakai: 200, 202; 201 menunggu stash). Sesi konten paralel (worktree ../rekeningo-wt-1-20) memakai 165–199. PR #117 (konten 1024 px, keputusan 163) bertentangan dengan aturan baru (kolom 680 px); jangan di-merge, pemilik memutuskan.

2026-10-08 · Pemilik tidur; sesi ini satu-satunya pekerja (loop headless tidak dijalankan malam ini). Halaman 1.1–1.19 selesai (1.19 keputusan 157-159). Pengaman loop: keputusan 142. Catatan: ilustrasi M3-M6 belum dibuat.
Halaman berikutnya: **1.20 "Keamanan 1: SQL injection + ADR 4"** (`t1-sql-injection`, konsep + ADR, ★, peran security+backend, widget cari-bug, lab api-t1). Isi: lanjutan 1.19 — kenapa jangan sambung string, parameter query menutup seluruh kelas serangan, linter, dan response hanya field yang dibutuhkan. ADR 4 (parameterized query, linter, field minimal). Pakai widget cari-bug (sudah ada) dengan data kedua bila perlu, atau data m3 yang sama. Rekaman `m3.txt` sudah cukup; bisa tambah snippet region rentan di repo/handler. Cek apakah ada linter Go yang mendeteksi string-concat SQL (mis. `go vet`? sebenarnya `gosec` G201) — kalau mau tunjukkan linter, perlu lab kecil; kalau tidak, sebut gosec G201 sebagai [perlu verifikasi] atau rekam. Ilustrasi M3 (adegan Dimas) bisa dibuat di sini via `tools/ilustrasi_cerita.py` (naskah: M3-M6 satu ilustrasi masing-masing), token gelap/terang.
Pola tulis ulang halaman lama: pindah ke `tahap-1/<slug>.mdx`, lima blok, contoh disesuaikan dengan PRD v1 (tanpa katalog/pesanan), hapus file lama + data widget lama yang tidak dipakai, perbarui `path`, `prasyarat`, hapus `lama` di registry, perbarui `alat/indeks-topik.mdx`, lalu `python3 tools/sinkron_cerita.py`.
Pola per halaman: branch `tahap-1/<slug>` dari `main`; lab dulu bila perlu (PR sendiri); halaman (PR sendiri); gerbang `bash tools/cek_situs.sh --layar > tmp/cek.txt; tail -30`; tangkapan `cd situs && npm run preview` lalu `node tools/tangkap.mjs --path /tahap-1/<slug>/` (dari `situs/`); lihat sendiri; KEPUTUSAN + STATUS + MEMORI; merge bila CI hijau; akhiri dengan "Siap dilanjutkan dari <halaman>". Setelah 1.42: jalankan isi `plan/PROMPT-CROSSCHECK.md`, tulis `plan/LAPORAN-TAHAP-1.md`.

## Pelajaran

- `tools/cek_situs.sh --layar` menyalakan preview di 127.0.0.1:4321; bila port itu dipakai dev server (yang mendengar di `localhost`), langkah layar gagal ECONNREFUSED. Jalankan `node tools/layar.mjs --url <preview lain>` dan `tangkap.mjs --url` manual; jangan mematikan dev server pemilik.
- Starlight 0.42 menyetel ukuran artikel dari `--sl-text-base`, bukan `--sl-text-body`; aturan `details {font-size:0.92em}` mengenai `details.blok` (keputusan 200).
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
