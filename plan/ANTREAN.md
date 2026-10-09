# Antrean tugas loop otomatis

Antrean kerja `tools/jalankan-otomatis.sh` (keputusan 216). Setiap iterasi mengambil satu tugas sesuai `plan/PROTOKOL-OTOMATIS.md`. Urutan bagian di file ini adalah urutan kerja.

Aturan file:

- Satu tugas = judul `### <id> · <judul>` dan enam butir: jenis, status, percobaan, bergantung, selesai bila, catatan. `python3 tools/antrean.py --check` memeriksa formatnya di gerbang.
- Jenis: konten, interaksi, perbaikan, crosscheck. Status: antre, dikerjakan, selesai, diparkir. Percobaan: 0–3 (berapa kali gerbang gagal di iterasi yang mengerjakannya).
- Tugas berikutnya: `python3 tools/antrean.py berikut`. Tugas yang bergantung pada tugas diparkir ikut diparkir.
- Pemilik boleh memindah bagian, menambah tugas, atau membuka tugas diparkir (status `antre`, percobaan `0`). Loop hanya menambah tugas baru tepat sesudah tugas yang memunculkannya.

## Definisi selesai bersama

Berlaku untuk setiap tugas, di samping "selesai bila" masing-masing:

1. Gerbang penuh `bash tools/cek_situs.sh --layar` hijau di branch, CI PR hijau, PR di-merge, gerbang hijau lagi di main sesudah merge.
2. Tangkapan layar yang disentuh dilihat sendiri (375×667 dan 1366×657, gelap dan terang); di PR tertulis jawaban: di mana saya, apa yang dibaca dulu, ke mana selanjutnya.
3. Keputusan bukan detail tercatat di `plan/KEPUTUSAN.md` dengan nomor baru (`tools/antrean.py` tidak memberi nomor; ambil nomor terbesar + 1).
4. Skill dipakai: gaya-bahasa untuk teks, visualisasi untuk visual dan interaksi, analisis-kritis untuk klaim, versi, ADR, dan review kode.

**Halaman konten** juga harus: memakai template jenisnya sesuai naskah ("Peta halaman Tahap 1 versi baru"); widget dan lab sesuai kolom naskah, atau beda dengan nomor keputusan; terdaftar di registry dengan jenis, bagian, peran, dan ★ sesuai naskah; angka, status code, dan output dari rekaman lab atau berlabel Ilustrasi/Asumsi; audit bahasa 0 error; Inti dibuka kalimat → visual → dua paragraf rinci (standar sesi redesain, keputusan 212–215), dan visual tampil di layar pertama; Cek diri minimal tiga kartu untuk halaman konsep. Halaman lama yang ditulis ulang mengikuti pola di MEMORI ("Pola tulis ulang halaman lama").

**Tugas interaksi (I6)** juga harus: ukuran JS per halaman sebelum/sesudah dicatat di `plan/AUDIT-TAMPILAN.md`, dan halaman tanpa diagram tidak memuat React Flow; dengan `prefers-reduced-motion` semua gerak hilang dan fungsi tetap; di 375×667 scroll halaman tidak tertangkap diagram; axe 0 pelanggaran di halaman yang disentuh. Tugas interaksi tidak mengubah isi halaman konten, hanya komponen yang dipakainya.

**Crosscheck kecil** artinya: tangkap semua halaman di rentangnya (dua ukuran, dua mode) dan lihat sendiri; cocokkan tiap halaman dengan naskah (jenis, widget, lab, ★, peran) dan registry; jawab tiga pertanyaan navigasi per halaman; tulis hasilnya di `plan/CROSSCHECK-KECIL.md` bagian `<id>` sebagai tabel (halaman, lolos atau perlu dibenahi, bukti). Setiap temuan yang perlu dibenahi menjadi tugas perbaikan baru tepat sesudah crosscheck itu. PR crosscheck tidak mengubah halaman.

## Tugas

### K0 · Crosscheck kecil 1.21–1.25 setelah redesain di-merge

- jenis: crosscheck
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: bagian K0 di `plan/CROSSCHECK-KECIL.md` memuat 1.21–1.25 dengan bukti tangkapan; temuan menjadi tugas perbaikan di bawah K0.
- catatan: Tugas uji kering sistem otomatis. 1.22–1.25 ditulis paralel dengan redesain (#120) dan baru tampil dengan tata letak baru sejak #120 di-merge; 1.24 dan 1.25 belum punya visual di layar pertama.

### I1 · Pindah ke bun

- jenis: interaksi
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: ADR baru di KEPUTUSAN dengan versi bun stabil terbaru dicek ke sumber resmi hari itu; `bun install` di `situs/` menghasilkan `bun.lock`, `package-lock.json` dihapus, `bun.lock` tidak lagi di `.gitignore`; CI memakai `oven-sh/setup-bun` dengan versi dipin dan `bun install --frozen-lockfile`; build, Vitest, Playwright, dan `tools/cek_situs.sh` tetap jalan; build lokal dan CI menghasilkan halaman yang sama; README menyebut perintah bun; butir I6.
- catatan: Kalau gagal tiga kali: parkir, tetap npm. I2–I5 tidak bergantung pada I1 dan tetap jalan.

### I2 · Pasang motion dan @xyflow/react

- jenis: interaksi
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: `bun add motion @xyflow/react` (atau npm bila I1 diparkir), versi dicek ke npm hari itu dan dipin persis; ADR per paket menyebut untuk apa, ukuran gzip, lisensi (keduanya MIT), dan alternatif yang ditolak (mis. GSAP, CSS saja; Mermaid, SVG tangan); build hijau; belum ada halaman yang berubah; butir I6.
- catatan: -

### I3 · Fondasi gerak

- jenis: interaksi
- status: antre
- percobaan: 0
- bergantung: I2
- selesai bila: komponen MotionProvider dengan `MotionConfig reducedMotion="user"`, memakai `LazyMotion` + `m`; token durasi dan easing di satu file (mis. cepat 150 ms, sedang 250 ms) dan tidak ada angka durasi di komponen lain; aturan tertulis di file token: semua gerak dipicu klik, scroll, atau pilihan, tidak ada animasi yang berjalan sendiri, tidak ada gerak dekoratif; tes Vitest untuk token dan satu tes Playwright bahwa reduced-motion mematikan gerak; belum ada komponen yang memakainya kecuali satu contoh di halaman uji; butir I6.
- catatan: -

### I4 · Fondasi diagram

- jenis: interaksi
- status: antre
- percobaan: 0
- bergantung: I2
- selesai bila: komponen DiagramArsitektur di atas React Flow, data dari registry tahap (kotak, zona, catatan, baru/lama), skema Zod, warna dari token; pengaturan `nodesDraggable` false, `zoomOnScroll` false, `panOnDrag` false di layar sempit, `preventScrolling` false, `fitView`; klik kotak membuka catatannya di bawah diagram (bukan tooltip) dan bisa dioperasikan dengan keyboard; dimuat hanya di halaman yang memakainya (`client:visible`); selalu ada versi statis untuk pembaca layar (`role="img"` + `aria-label`) dan sebelum JS dimuat; CSS React Flow hanya base, gaya dari token, `contrast.py` lolos gelap dan terang; dipakai di satu halaman uji; halaman lain tidak memuat React Flow; butir I6.
- catatan: -

### 1.26-lab · Lab M5: rekaman mode rentan m5

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: mode `-rentan m5` di `labs/api-t1` (GET akun tanpa cek pemilik, `service.LihatAkunM5`) dan rekaman `labs/api-t1/output/m5.txt` dari database bersih: Dimas membaca akun 417 miliknya, lalu 418 Warung Ani, lalu enumerasi 401–503; versi benar menjawab 404 untuk akun orang lain; output dibandingkan (status, saldo, urutan; bukan waktu); keputusan baru.
- catatan: Setengah jalan dari worktree konten yang ditutup: lanjutkan dari branch `tahap-1/lab-m5` (commit 860e6b9, kode mode m5 tanpa rekaman dan tanpa `run.py`). Rebase ke main dulu.

### 1.26 · M5: Angka di URL

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: 1.26-lab
- selesai bila: halaman `t1-m5` (masalah, ★, peran security) dengan template masalah: gejala (Dimas mengganti 417 jadi 418, menyimpan 100 saldo ke spreadsheet, mengirimnya ke Sinta) → yang Raka kira (UUID) → yang sebenarnya (backend tidak pernah bertanya pemilik; token di tempat yang salah di app) → coba sendiri dari `m5.txt` → konsep → ADR 7–8 dirujuk; widget alur; ilustrasi adegan M5 baru di `Ilustrasi.astro` (token gelap/terang, tanpa teks di SVG) lewat `<Blok ilustrasi="m5">`; token di app berlabel Ilustrasi bila tidak direkam.
- catatan: -

### 1.27 · Authentication

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: B5.1 ditulis ulang dari `b-fondasi/b5-1-authentication.mdx` ke `tahap-1/` dengan lima blok, contoh dari login PRD v1 (`login.txt` lab api-t1), widget alur; tanpa Snippet `api-t1-lama`; registry tanpa `lama`.
- catatan: Jalur Mobile menonjolkan halaman ini.

### 1.28 · Authorization

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: B5.3 ditulis ulang ke `tahap-1/` dengan lima blok, widget alur dan pilah, lab api-t1 (cek pemilik di service) dan b5-rls; tanpa Snippet `api-t1-lama`; registry tanpa `lama`.
- catatan: -

### I5a · Blok: buka/tutup dengan layout animation

- jenis: interaksi
- status: antre
- percobaan: 0
- bergantung: I3
- selesai bila: buka/tutup blok memakai layout animation dari fondasi gerak, menggantikan transisi CSS; tangkapan sebelum/sesudah; butir I6.
- catatan: -

### 1.29 · Keamanan 2: IDOR, enumerasi, token di app + ADR 7–8

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: 1.26
- selesai bila: halaman `t1-idor` dengan ADR 7 (cek pemilik di `service/` + RLS sebagai pagar kedua; 404 bukan 403) dan ADR 8 (sesi acak dengan masa berlaku, secure storage; JWT ditunda ke Tahap 4 dengan alasan), masing-masing minimal tiga opsi dan "kapan keputusan ini salah"; widget alur dan banding; lab b5-rls.
- catatan: Jalur Mobile dan Security.

### 1.30-lab · Lab M6: rekaman prober deploy

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: rekaman prober deploy dari database bersih: prober memanggil API tiap detik saat binary diganti dan kolom diganti nama; terekam jeda layanan, error untuk client versi lama sesudah ganti nama kolom, dan tidak ada binary lama untuk kembali; output dibandingkan tanpa waktu; keputusan baru.
- catatan: Naskah M6 menyebut "app mati 5 menit" dan "11 HP"; angka itu cerita, angka lab yang tampil di halaman harus dari rekaman.

### 1.30 · M6: Deploy hari Senin

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: 1.30-lab
- selesai bila: halaman `t1-m6` (masalah, ★, peran devops) dengan template masalah dari rekaman prober; widget alur; ilustrasi adegan M6 baru lewat `<Blok ilustrasi="m6">`.
- catatan: -

### K1 · Crosscheck kecil 1.26–1.30

- jenis: crosscheck
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: bagian K1 di `plan/CROSSCHECK-KECIL.md` memuat 1.26–1.30 dengan bukti; temuan menjadi tugas perbaikan di bawah K1.
- catatan: -

### 1.31 · Deployment dan rollback + ADR 9

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: 1.30
- selesai bila: C3 ditulis ulang ke `tahap-1/` dengan ADR 9 (image per commit, rollback = tag lama, CI pertama); Infra 1 (satu VPS, Compose, kenapa cukup); widget alur; tanpa Snippet `api-t1-lama`.
- catatan: Jalur DevOps.

### I5b · Beranda: peta tahap memakai DiagramArsitektur

- jenis: interaksi
- status: antre
- percobaan: 0
- bergantung: I3, I4
- selesai bila: peta tahap di beranda memakai DiagramArsitektur; memilih tahap mengubah diagram dengan transisi; jawaban teka-teki muncul dengan gerak singkat; tangkapan sebelum/sesudah; butir I6.
- catatan: -

### 1.32 · Testing: apa dites di level mana

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: C1 ditulis ulang ke `tahap-1/` dengan lima blok, widget pilah dan stackstep, lab api-t1; tanpa Snippet `api-t1-lama`.
- catatan: -

### 1.33 · App versi lama + ADR 10

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: E1 ditulis ulang ke `tahap-1/` dengan ADR 10 (field tidak pernah diganti nama, expand lalu contract) yang berdiri sendiri tanpa rekaman B4.2; widget alur; tanpa Snippet `api-t1-lama`.
- catatan: Prasyarat B4.2 (Tahap 2) dibuang (MEMORI). Jalur Mobile.

### P1 · 1.4 dan 1.6 lepas dari api-t1-lama

- jenis: perbaikan
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: `adr-1-backend-sendiri.mdx` dan `struktur-folder.mdx` memakai Snippet dari `labs/api-t1` (folder nyata), bukan `api-t1-lama`; `grep -rn api-t1-lama situs/src/content/docs/tahap-1/` kosong.
- catatan: -

### P2 · Hapus labs/api-t1-lama

- jenis: perbaikan
- status: antre
- percobaan: 0
- bergantung: 1.27, 1.28, 1.31, 1.32, 1.33, P1
- selesai bila: `grep -rn api-t1-lama situs/ labs/ tools/` kosong kecuali folder itu sendiri, bukti grep tertulis di PR; folder `labs/api-t1-lama` dihapus; tabel lab di README diperbarui.
- catatan: Disetujui pemilik 2026-10-08 dengan syarat grep kosong (MEMORI "Catatan untuk penulisan ulang Tahap 1"). Kalau grep tidak kosong, jangan hapus: parkir dengan daftar rujukannya.

### 1.34-lab · Lab M7: .env di riwayat git

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: mode rentan M7 yang direkam di dalam container atau folder sementara lab: repo contoh meng-commit `.env` berisi nilai palsu, file dihapus, gitleaks tetap menemukannya di riwayat, pre-commit hook menolak commit berikutnya; rekaman dibandingkan tanpa waktu; tidak ada secret nyata; keputusan baru.
- catatan: Lab serangan hanya di dalam container atau folder sementara lab.

### 1.34 · M7: .env di repo

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: 1.34-lab
- selesai bila: halaman `t1-m7` (masalah, peran security) dengan template masalah dari rekaman M7.
- catatan: -

### I5c · Widget alur

- jenis: interaksi
- status: antre
- percobaan: 0
- bergantung: I3
- selesai bila: widget alur (pindah ke React bila belum): paket data bergerak dari komponen ke komponen saat Berikutnya ditekan; lapisan yang aktif tersorot; semua halaman yang memakai alur tetap jalan; tangkapan sebelum/sesudah; butir I6.
- catatan: -

### 1.35 · Keamanan 3: secret + ADR 11

- jenis: konten
- status: antre
- percobaan: 0
- bergantung: 1.34
- selesai bila: halaman `t1-secret` dengan ADR 11 (`.env.example`, pre-commit gitleaks, secret hanya di server), minimal tiga opsi dan "kapan keputusan ini salah"; lab api-t1.
- catatan: Jalur Security.

### K2 · Crosscheck kecil 1.31–1.35

- jenis: crosscheck
- status: antre
- percobaan: 0
- bergantung: -
- selesai bila: bagian K2 di `plan/CROSSCHECK-KECIL.md` memuat 1.31–1.35 dengan bukti; temuan menjadi tugas perbaikan di bawah K2.
- catatan: -

