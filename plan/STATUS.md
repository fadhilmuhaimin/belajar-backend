# Status

Diperbarui: 2026-10-08. Catatan singkat tentang keadaan panduan dan pekerjaan yang masih terbuka. Keputusan dan alasannya ada di [KEPUTUSAN.md](KEPUTUSAN.md).

## Keadaan sekarang

- 60 halaman ada (pembuka, Tahap 1–5, satu studi desain sampingan, enam halaman alat). `tools/cek_batch.sh` lolos: build strict, ID internal, audit bahasa (0 error), 103 tes widget, layar pertama 60 halaman × 4 ukuran.
- 26 lab. Semua lab di database bersama memakai schema sendiri, dan lab gagal keras bila skema, hasil, atau port-nya salah (keputusan 79–81, 95). Log beberapa proses diurutkan menurut waktu tulis (keputusan 96).
- Glosarium punya 98 istilah di bagian "Semua istilah". Rujukan halaman MVCC dan monolith sudah cocok dengan isi halamannya (keputusan 94).
- Istilah teknis ditulis dalam bahasa Inggris, idiom terjemahan literal sudah diganti, dan fragmen kalimat di prosa diberi predikat (keputusan 86, 87, 93). Tabel angka di kelima halaman tahap berlabel asumsi per baris (keputusan 88).
- Halaman Tahap 1 yang memakai materi Tahap 2 punya penjelasan singkat di tempat (keputusan 92).
- Link yang menolak bot sudah diverifikasi lewat API metadata (keputusan 98).

## Fase 0 · Fondasi (plan/PROPOSAL.md "Rencana migrasi")

| Langkah | Keadaan |
|---|---|
| `tools/cek_batch.sh` dijalankan apa adanya | Lolos lokal 2026-10-08 (catatan di MEMORI) |
| GitHub Actions `.github/workflows/cek.yml` di tiap PR | Dibuat; hijau di branch `percobaan/ci-fase-0` (keputusan 99) |
| `make lab` + `.devcontainer/` | Dibuat; `make -C labs/b3-race run` terbukti jalan dari nol (keputusan 100, 101) |
| Deploy Cloudflare Pages, Playwright menggantikan CDP, link checker | Belum |
| Rencana fase 1 untuk 1.11 Transaction | Disetujui, dikerjakan (lihat Fase 1) |

## Fase 1 · Situs baru (`site-baru/`, Astro 7.3.7 + Starlight 0.42.5, tanpa React)

| Ukuran | Nilai |
|---|---|
| Halaman dipindah | 1 dari 60: 1.11 Transaction (plus beranda sementara dan 404) |
| Build | 0 warning, 0 error; `npm test` 5/5; `contrast.py` 125/125 (gelap + terang) |
| Teks artikel lama vs baru (`tools/banding.mjs`) | 1185 kata vs 1185 kata, 0 kata berbeda; 10 heading urutan sama; 26 link vs 26 link (18 eksternal identik, 8 internal) |
| CSS widget ditulis ulang | 89 aturan di `tema.css` menggantikan 121 aturan `widgets.css` yang dipakai 1.11 (dari 302 aturan total); 64 aturan lain untuk Starlight, tab, breadcrumb, navigasi |
| Widget lama | `runsql`, `stackstep`, `arsitektur`, `selesai`, `umpan-balik` jalan tanpa perubahan kode (keputusan 103); diuji Playwright: runsql menghasilkan tabel Before/After, stackstep menyorot 1 baris di tiap tab |
| Tangkapan layar | 1366×657 dan 375×667 × gelap/terang: tanpa scroll horizontal, tanpa error konsol |
| Belum | Tooltip istilah (abbr) belum diporting; sidebar menampilkan 59 halaman yang belum dipindah dengan kelas `nav-menyusul` (keputusan 104); beranda final, lima blok, Pagefind untuk glosarium = fase 3 |

## Terbuka

| Topik | Catatan |
|---|---|
| Halaman dengan perkiraan waktu baca > 7 menit | Terutama 2.1 dan 1.11, juga 1.7, 1.12, 1.15, 2.3, 2.8, 3.7, 4.1. Menunggu catatan review; jangan dipecah atau diringkas sebelum itu. |
| Istilah lain tanpa entri glosarium | Belum dipindai ulang setelah penambahan 2026-10-07. Kandidat dari pemindaian sebelumnya: DTO, dependency injection, PL/pgSQL, Kubernetes, bottleneck, service mesh, event bus, authorization code, Read Committed. |
| Label pendek di widget pilah | Field "kenapa" di beberapa widget pilah dibuka dengan label tanpa predikat ("Faktor puncak."). Dibiarkan sebagai gaya kartu (keputusan 93). |
| Mode lab berbahasa Indonesia | Nama mode dan file `e3-idempotency` (`kunci-sama`, `kunci-baru`) dan identifier widget `ember` tetap (keputusan 86). |
