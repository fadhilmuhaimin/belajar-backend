# Memori kerja

Catatan kerja lintas sesi dan lintas model. Maksimal 200 baris; baris yang tidak relevan lagi dihapus.

## Keputusan baru

## Sedang dikerjakan

2026-10-08 · Fase 1 · branch `fase-1/situs-baru`. Rencana (plan/RENCANA-FASE-1-1-11.md): Astro + Starlight di `site-baru/`, tema gelap bertoken, Snippet/TabSet/WidgetLama, remark rujukan, sidebar dari cerita.json, porting 1.11, tangkapan Playwright, pembanding lama vs baru. Selesai semua untuk 1.11 (angka di STATUS). PR #2 (kerangka + 1.11) sudah di-merge. PR #3 (1.12 + layar.mjs) di-merge. PR #25–#38 (alat pembuka + 13 halaman) di-merge. 24 halaman non-inti terakhir dikonversi (Snippet `files` dengan rentang per entri, CSS kartu, widget umpan-balik-data) dan diajukan sebagai PR per halaman di atas PR alat. Setelah semua merge: 60/60 halaman ada di situs baru. Tooltip istilah selesai (PR `fase-1/tooltip-istilah`, keputusan 107). Sisa fase 1: keputusan hapus MkDocs menunggu gerbang (kedua situs dibangun di CI, `cek_layar_pertama` lama + `layar.mjs` baru hijau).

## Pelajaran

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
