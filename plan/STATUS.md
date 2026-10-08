# Status

Diperbarui: 2026-10-08 (setelah fase 1; arahan baru keputusan 109 terpasang, menunggu "mulai"). Catatan singkat tentang keadaan panduan dan pekerjaan yang masih terbuka. Keputusan dan alasannya ada di [KEPUTUSAN.md](KEPUTUSAN.md).

## Keadaan sekarang

- 60 halaman ada (pembuka, Tahap 1–5, satu studi desain sampingan, enam halaman alat). `tools/cek_batch.sh` lolos: build strict, ID internal, audit bahasa (0 error), 103 tes widget, layar pertama 60 halaman × 4 ukuran.
- 26 lab. Semua lab di database bersama memakai schema sendiri, dan lab gagal keras bila skema, hasil, atau port-nya salah (keputusan 79–81, 95). Log beberapa proses diurutkan menurut waktu tulis (keputusan 96).
- Glosarium punya 98 istilah di bagian "Semua istilah". Rujukan halaman MVCC dan monolith sudah cocok dengan isi halamannya (keputusan 94).
- Istilah teknis ditulis dalam bahasa Inggris, idiom terjemahan literal sudah diganti, dan fragmen kalimat di prosa diberi predikat (keputusan 86, 87, 93). Tabel angka di kelima halaman tahap berlabel asumsi per baris (keputusan 88).
- Halaman Tahap 1 yang memakai materi Tahap 2 punya penjelasan singkat di tempat (keputusan 92).
- Link yang menolak bot sudah diverifikasi lewat API metadata (keputusan 98).

## Arahan baru (keputusan 109)

Urutan kerja dibalik: konten dulu, Tahap 1 sampai tuntas sesuai `plan/CERITA-TAHAP-1.md`.

### Tugas 0 · Siapkan repo (selesai 2026-10-08, kecuali secret Cloudflare)

| Langkah | Keadaan |
|---|---|
| Pemeriksaan di `situs/` | `tools/cek_situs.sh --layar`: registry, istilah, audit bahasa, build strict, ID internal, kontras, tipe strict, Vitest, tes widget lama, layar pertama 4 ukuran (termasuk beranda satu layar), tangkapan dan tema awal (111, 119, 121) |
| MkDocs dan `docs/` | Dihapus; registry di `situs/data/cerita.json`, widget lama di `situs/lama/` (112–114) |
| Cloudflare Pages + preview per PR | Job `deploy` siap; menunggu secret `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` dari pemilik (115) |
| Dependency | React 19.3, TypeScript 6.0.3, Zod 4.6, Vitest 5 dengan ADR; PGlite menunggu widget SQL pertama (116) |
| Registry v2 | 42 halaman Tahap 1 bernomor 1.1–1.42 sesuai naskah; 18 halaman memakai isi lama (`lama`), 24 menyusul (117) |
| Template | `Blok.astro` + `data/templat.json` untuk enam jenis; kerangka di `situs/templat/` (118) |
| Navigasi | Breadcrumb otomatis, pemilih peran, mode fokus (120); tema gelap default benar-benar berlaku (119) |
| Beranda | Satu layar: Mulai, tiga pintu, peta enam tahap (121) |

### Tugas 1 · Tahap 1 (42 halaman)

| Halaman | Keadaan |
|---|---|
| 1.1 PRD v1 | Ditulis (keputusan 122); T1 lama dihapus |
| 1.2 Dari fitur ke pekerjaan teknis | Ditulis (keputusan 125) |
| 1.3 Apa yang dikerjakan backend | Ditulis ulang dari A1 (keputusan 126, 127) |
| 1.4 ADR 1: Backend sendiri, bukan BaaS | Ditulis ulang dari A4 (keputusan 129) |
| 1.5 Perjalanan satu request | Ditulis ulang dari A2 (keputusan 130) |
| 1.6 Struktur folder pertama | Halaman baru (keputusan 131) |
| 1.7 Fitur: login karyawan | Halaman baru, lab `api-t1` versi naskah (keputusan 132–134) |
| 1.8 Fitur: top-up oleh admin | Halaman baru (keputusan 135, 136) |
| 1.9 Fitur: bayar ke warung | Halaman baru (keputusan 137, 138) |
| 1.10 Fitur: saldo, riwayat, laporan warung | Halaman baru (keputusan 139, 141) |
| 1.11 Pertukaran saldo | Halaman baru, lab `pertukaran.txt`, widget React pertama `jumlah-total` (keputusan 143, 144) |
| 1.12 Data modeling dan relasi | Ditulis ulang dari B2.1 ke tabel v1, lab `relasi.txt` (keputusan 145, 146) |
| 1.13 SQL atau NoSQL | Ditulis ulang dari B2.2, pertanyaan Sinta, banding fitur v1 (keputusan 147) |
| 1.14 M1: Nominal minus lolos | Halaman masalah pertama, mode rentan `-rentan m1` (keputusan 148, 149) |
| 1.15 Validation dua lapis + ADR 2 | Ditulis ulang dari B6, menyerap B1.2 (dihapus) (keputusan 150) |

Diperbarui 2026-10-08. 15 dari 42 halaman selesai; berikutnya 1.16. Loop headless siap: `bash tools/jalankan-tahap.sh` (keputusan 140); loop berhenti saat penanda selesai Tahap 1 (keputusan 140) ditulis di file ini, lalu menjalankan `plan/PROMPT-CROSSCHECK.md` sekali.

## Fase 0 · Fondasi (plan/PROPOSAL.md "Rencana migrasi")

| Langkah | Keadaan |
|---|---|
| `tools/cek_batch.sh` dijalankan apa adanya | Lolos lokal 2026-10-08 (catatan di MEMORI) |
| GitHub Actions `.github/workflows/cek.yml` di tiap PR | Dibuat; hijau di branch `percobaan/ci-fase-0` (keputusan 99) |
| `make lab` + `.devcontainer/` | Dibuat; `make -C labs/b3-race run` terbukti jalan dari nol (keputusan 100, 101) |
| Deploy Cloudflare Pages, Playwright menggantikan CDP, link checker | Belum |
| Rencana fase 1 untuk 1.11 Transaction | Disetujui, dikerjakan (lihat Fase 1) |

## Fase 1 · Situs baru (`situs/`, Astro 7.3.7 + Starlight 0.42.5, tanpa React)

| Ukuran | Nilai |
|---|---|
| Halaman dipindah | 60 dari 60 (plus 404). Semua halaman dikonversi `situs/tools/konversi.mjs`, dibandingkan `tools/banding.mjs` (teks, heading, link), lolos `tools/layar.mjs` 4 ukuran, dan setiap widget terpasang tanpa error konsol. Beranda `/` masih isi A0 "Cara pakai panduan ini"; beranda satu layar = fase 3 |
| Build | 0 warning, 0 error; `npm test` 5/5; `contrast.py` 125/125 (gelap + terang) |
| Teks artikel lama vs baru (`tools/banding.mjs`) | 1.11: 1185 vs 1185 kata, 0 berbeda; 10 heading sama; 26 vs 26 link. 1.12: 993 vs 992 kata, 1 beda pemenggalan ("token-nya"); 10 heading sama; 22 vs 22 link (16 eksternal identik). 1.13: 958 vs 957 kata, 1 beda pemenggalan; 10 heading sama; 13 vs 13 link. 1.14: 794 vs 794 kata, 0 beda; 7 vs 7 link. 1.15: 985 vs 985 kata, 0 beda; 18 vs 18 link. 1.17: 851 vs 850 kata, beda pemenggalan dan `&`; 10 heading sama. 1.18: 719 vs 717 kata, beda pemenggalan tanda kutip; 10 heading sama. 1.19: 871 vs 871 kata, 0 beda; 24 vs 24 link. Tahap 2 · Ceritanya: 375 vs 375 kata, 0 beda; 9 vs 9 link; ilustrasi SVG tampil dari /assets/cerita. 2.1: 1448 vs 1446 kata, beda pemenggalan; 12 heading sama; 18 vs 18 link. 2.3: 1074 vs 1071 (pemenggalan). 2.4: 739 = 739. 2.6: 838 = 838. 2.8: 1048 = 1048. 2.9: 824 = 824; semua heading dan jumlah link sama. Judul H1 pendek (2.3, 2.9) dipertahankan: konverter memakai H1 badan sebagai title. Tahap 3–4: T3 461/459, 3.1 752/750, 3.2 830/829, 3.3 825=825, 3.6 751/749, 3.7 1028=1028, T4 358=358, 4.1 816/814; semua beda hanya pemenggalan, heading dan link sama |
| CSS widget ditulis ulang | 1.11: 89 aturan menggantikan 121 aturan `widgets.css`. 1.12 menambah widget `alur` + mockup HP: 70 aturan menggantikan 76 aturan lama (hp, alur, rel vertikal). Total 159 aturan widget di `tema.css` dari 302 aturan `widgets.css`; sisanya (race, pilah, banding, kartu, peta, ember, map, ilustrasi) menyusul bersama halamannya |
| Widget lama | tooltip istilah jalan (keputusan 107: remark-abbr + istilah.js lama). Semua 15 jenis widget: `runsql`, `stackstep`, `alur` (+`hp`), `pilah`, `banding`, `race`, `ember`, `kartu`, `peta-cerita`, `indeks-masalah`, `umpan-balik-data`, `arsitektur`, `selesai`, `umpan-balik` jalan tanpa perubahan kode (keputusan 103); diuji Playwright: runsql menghasilkan tabel Before/After, stackstep menyorot 1 baris di tiap tab, alur berjalan 7 langkah dengan mockup HP |
| Tangkapan layar | 1366×657 dan 375×667 × gelap/terang: tanpa scroll horizontal, tanpa error konsol. `tools/layar.mjs` (layar pertama 4 ukuran) lolos dengan margin ≥ 21 px di semua halaman setelah breadcrumb HP dipendekkan |
| Belum | Gerbang fase 1 (PROPOSAL): MkDocs belum dihapus, `cek_batch.sh` tetap gerbang situs lama; ilustrasi SVG cerita masih berlatar terang di mode gelap (token ilustrasi = fase 3); sidebar menampilkan 59 halaman yang belum dipindah dengan kelas `nav-menyusul` (keputusan 104); beranda final, lima blok, Pagefind untuk glosarium = fase 3 |

## Terbuka

| Topik | Catatan |
|---|---|
| Halaman dengan perkiraan waktu baca > 7 menit | Terutama 2.1 dan 1.11, juga 1.7, 1.12, 1.15, 2.3, 2.8, 3.7, 4.1. Menunggu catatan review; jangan dipecah atau diringkas sebelum itu. |
| Istilah lain tanpa entri glosarium | Belum dipindai ulang setelah penambahan 2026-10-07. Kandidat dari pemindaian sebelumnya: DTO, dependency injection, PL/pgSQL, Kubernetes, bottleneck, service mesh, event bus, authorization code, Read Committed. |
| Label pendek di widget pilah | Field "kenapa" di beberapa widget pilah dibuka dengan label tanpa predikat ("Faktor puncak."). Dibiarkan sebagai gaya kartu (keputusan 93). |
| Mode lab berbahasa Indonesia | Nama mode dan file `e3-idempotency` (`kunci-sama`, `kunci-baru`) dan identifier widget `ember` tetap (keputusan 86). |
