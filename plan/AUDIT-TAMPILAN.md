# Audit tampilan · redesain untuk pembaca ADHD

Dokumen kerja sesi redesain (branch `redesain/tampilan`, keputusan 164 dan 200–219). PR prototipe tidak di-merge sampai pemilik memutuskan.

Masalah dari pemilik: tampilan terlalu kaku dan padat, teks terlalu kecil dan kurang jelas, sebagian teks kurang kontras, beranda tidak memberi apa pun untuk dilakukan.

## 1. Ukuran sebelum redesain

Diukur 2026-10-09 dengan `situs/tools/audit-tampilan.mjs` (Playwright, Chromium headless) pada build produksi dari `main` (`a2084bd`), mode gelap, 1366×768 dan 375×667. Angka adalah `getComputedStyle` elemen pertama yang terlihat untuk tiap jenis teks; kontras dihitung dengan rumus luminans WCAG 2.x terhadap latar efektif. **Tebal** = di bawah 14 px.

| Jenis teks | Beranda desktop | 1.1 desktop | 1.19 desktop | 1.1 HP | 1.19 HP | Berat | Warna / latar | Kontras |
|---|---|---|---|---|---|---|---|---|
| isi (paragraf) | 17.6 | 16 | 14.7 | 16 | 14.7 | 400 | `#E6E6E6` / `#0B0B0C` | 15.76:1 |
| judul halaman (h1) | 44.8 | 35.2 | 35.2 | 24 | 24 | 600 | `#FFFFFF` / `#0B0B0C` | 19.67:1 |
| chip peran | **12.5** | **12.8** | **12.8** | – | – | 600 | `#0B0B0C` / `#7AB8FF` | 9.49:1 |
| tombol mode fokus | **13.6** | **13.6** | **13.6** | – | – | 400 | `#E6E6E6` / `#0B0B0C` | 15.76:1 |
| kotak pencarian | 14 | 14 | 14 | 20 | 20 | 400 | `#E6E6E6` / `#0B0B0C` | 15.76:1 |
| beranda: janji | 17.6 | – | – | – | – | 400 | `#E6E6E6` / `#0B0B0C` | 15.76:1 |
| beranda: kartu | 14.1 | – | – | – | – | 400 | `#A3A3A8` / `#141416` | 7.33:1 |
| beranda: peta tahap kecil | **11.8** | – | – | – | – | 400 | `#A3A3A8` / `#0B0B0C` | 7.83:1 |
| meta (baca · prasyarat) | – | **12.8** | **12.8** | **12** | **12** | 400 | `#A3A3A8` / `#0B0B0C` | 7.83:1 |
| kicker (jenis halaman) | – | **12.8** | **12.8** | **12.8** | **12.8** | 600 | `#7AB8FF` / `#0B0B0C` | 9.49:1 |
| breadcrumb | – | **13.1** | **13.1** | **13.1** | **13.1** | 400 | `#A3A3A8` / `#0B0B0C` | 7.83:1 |
| rekap fiktif | – | **13.1** | **13.1** | – | – | 400 | `#A3A3A8` / `#0B0B0C` | 7.83:1 |
| judul blok | – | 19.9 | 19.9 | 19.9 | 19.9 | 600 | `#FFFFFF` / `#0B0B0C` | 19.67:1 |
| label blok (Blok 1 dari 5) | – | **11.5** | **11.5** | **11.5** | **11.5** | 600 | `#A3A3A8` / `#0B0B0C` | 7.83:1 |
| tombol Berikutnya (blok) | – | 14.7 | 14.7 | 14.7 | 14.7 | 600 | `#0B0B0C` / `#7AB8FF` | 9.49:1 |
| navigasi bawah | – | 16 | 16 | 16 | 16 | 600 | `#FFFFFF` / `#0B0B0C` | 19.67:1 |
| sidebar: tautan | – | 14 | 14 | – | – | 400 | `#A3A3A8` / `#0B0B0C` | 7.83:1 |
| sidebar: grup | – | 16 | 16 | – | – | 400 | `#E6E6E6` / `#0B0B0C` | 15.76:1 |
| daftar isi kanan | – | **13** | **13** | 14 | 14 | 400 | `#A3A3A8` / `#0B0B0C` | 7.83:1 / 19.67:1 |

| axe-core 4.10.3 (WCAG 2.0/2.1/2.2 A dan AA) | Desktop 1366×768 | HP 375×667 |
|---|---|---|
| beranda | 0 pelanggaran | 0 pelanggaran |
| 1.1 | `color-contrast` (serious, 13 elemen) | 0 pelanggaran |
| 1.19 | `color-contrast` (serious, 13 elemen), `link-in-text-block` (serious, 1 elemen) | `link-in-text-block` (serious, 1 elemen) |

### Temuan akar masalah

1. **Teks isi tidak pernah 19 px.** Spesifikasi menulis 19–20 px desktop, tapi teks isi terukur 16 px di 1.1 dan 14,7 px di 1.19. Penyebab pertama: `tema.css` mengubah token `--sl-text-body`, padahal Starlight 0.42 menyetel ukuran artikel dari `--sl-text-base` (16 px); `--sl-text-body` tidak dipakai artikel. Penyebab kedua: aturan umum `.sl-markdown-content details { font-size: 0.92em }` (untuk kotak pertanyaan kecil) ikut mengenai setiap Blok, jadi semua isi blok mengecil ke 14,72 px.
2. **Sembilan jenis teks UI di bawah 14 px**: label blok 11,5 px, peta tahap beranda 11,8 px, meta HP 12 px, chip peran 12,5–12,8 px, kicker 12,8 px, meta desktop 12,8 px, daftar isi 13 px, breadcrumb dan rekap 13,1 px, tombol mode fokus 13,6 px.
3. **Teks sekunder `#A3A3A8` = 7,83:1** (lolos AA, tapi di bawah target baru 8:1). Kartu beranda di latar `#141416` turun ke 7,33:1.
4. **Tautan sidebar "menyusul" gagal AA**: `color: var(--teks-2)` ditambah `opacity: 0.7` membuat warna efektif `#757579` di `#0B0B0C` = 4,31:1 (dihitung dari campuran alfa). axe mencatat 13 elemen di 1.1 dan 1.19. Tautan "versi lama" juga miring (italic), yang dihindari panduan disleksia.
5. **Tautan prasyarat di meta hanya dibedakan warna** (`link-in-text-block`, WCAG 1.4.1).
6. **"Semuanya terlihat selesai" bukan dari status blok.** Logika status di `Blok.astro` benar: blok baru ditandai selesai setelah tombol Berikutnya diklik, dan pada kunjungan pertama tidak ada penanda selesai. Yang terlihat seperti progres adalah sorotan peran Generalis: setiap halaman jalur inti mendapat garis biru `box-shadow: inset 3px 0 0 var(--aksen)` di sidebar, sehingga hampir semua tautan Tahap 1 tampak "sudah". Garis hilang tepat di halaman tanpa ★ (1.8, 1.10, 1.13).
7. **Kolom kanan memakan ruang**: bawaan Starlight memberi daftar isi separuh ruang kosong; di 1920 px itu ±30% layar untuk 5–8 tautan.
8. **Beranda**: satu layar berisi teks dan tiga kartu kecil; tidak ada yang bisa dicoba, peta tahap memakai teks 11,8 px, setengah layar kosong di desktop.

Tangkapan sebelum disimpan untuk perbandingan di bagian 5.
