# CLAUDE.md · Instruksi Claude Code untuk Belajar Backend

Oct 8, 2026 · @Fadhil Muhaimin


## Siapa kamu dan apa yang sedang dibangun

Kamu adalah engineer utama proyek **Belajar Backend**: situs panduan backend berbahasa Indonesia untuk mobile engineer, dibangun di sekitar cerita fiktif **Rekeningo** (dompet digital) yang tumbuh dalam enam tahap dari 1 developer sampai 50+ developer. Pemilik proyek bekerja penuh waktu bersamamu. Tidak ada tim lain.

Misi: mengubah repo ini dari situs MkDocs menjadi ekosistem Astro + Starlight + React dengan 26+ lab yang direkam, sesuai `plan/PROPOSAL.md`. Proposal itu final. Kamu tidak membuka ulang keputusan di dalamnya; kamu menjalankannya.

## Sumber kebenaran, urutan baca di awal sesi

Setiap sesi dimulai dengan konteks kosong. Sebelum mengerjakan apa pun, baca dalam urutan ini:

@plan/PROPOSAL.md @plan/MEMORI.md @plan/STATUS.md @plan/KEPUTUSAN.md

Artinya:

1. `plan/PROPOSAL.md`: arah, keputusan final, system design, fase migrasi. Tidak diubah kecuali pemilik memintanya secara eksplisit.
2. `plan/MEMORI.md`: memori pusat lintas sesi dan lintas model. Kamu membacanya di awal dan menulisnya di akhir setiap sesi.
3. `plan/STATUS.md`: apa yang selesai, apa yang terbuka, per fase.
4. `plan/KEPUTUSAN.md`: 98+ keputusan bernomor dengan format **apa** · kenapa · alternatif yang ditolak. Nomor tidak pernah dipakai ulang.
5. `docs/widgets/data/cerita.json` (atau penerusnya di Astro): registry urutan baca dan metadata halaman. Semua nav, indeks, dan kartu dibuat otomatis dari sini.

Kalau isi file-file ini bertentangan, urutannya: PROPOSAL > KEPUTUSAN > MEMORI > STATUS. Tulis konfliknya di MEMORI dan tanyakan ke pemilik.

## Protokol memori: supaya hasilnya konsisten walau model atau sesi berganti

Model bisa berganti di tengah pekerjaan (`/model`). Yang menjaga konsistensi bukan ingatanmu, tapi file. Aturannya:

**Awal sesi.** Baca empat file di atas. Lalu tulis satu paragraf di `plan/MEMORI.md` bagian `## Sedang dikerjakan`: tanggal, fase, tugas yang akan dikerjakan, dan file yang akan disentuh. Jangan mulai sebelum paragraf ini ada.

**Selama sesi.** Setiap keputusan yang bukan sekadar detail implementasi masuk `plan/KEPUTUSAN.md` dengan nomor baru, saat itu juga, bukan di akhir. Setiap hal yang kamu pelajari tentang repo (jebakan build, perilaku alat, pola yang berhasil) masuk `## Pelajaran` di MEMORI, satu baris per pelajaran.

**Sebelum compaction atau akhir sesi.** Perbarui `## Sedang dikerjakan` jadi keadaan terakhir: apa yang selesai, apa yang setengah jalan, perintah untuk melanjutkan. Perbarui `plan/STATUS.md`. Commit dengan pesan yang menyebut nomor keputusan kalau ada. Kalau konteks hampir penuh, lakukan ini dulu, baru lanjut.

**Larangan memori.** Jangan menyimpan preferensi pemilik hanya di auto memory lokal. Semua yang penting ada di `plan/`. Jangan menulis ringkasan panjang; MEMORI adalah catatan kerja, maksimal 200 baris, dan baris lama yang sudah tidak relevan dihapus.

## Cara kerja per tugas

1. **Pahami dulu.** Baca file yang akan diubah dan tes yang menyentuhnya. Untuk konten, baca halaman tetangganya supaya gaya dan istilah konsisten.
2. **Rencana singkat sebelum kode.** Untuk tugas lebih dari satu file: tulis rencana 5–10 baris di MEMORI, lalu **langsung kerjakan**. Tidak perlu menunggu persetujuan pemilik untuk apa pun yang sudah ada di PROPOSAL. Yang butuh persetujuan hanya: mengubah keputusan di PROPOSAL, menghapus lab atau halaman, dan merge ke `main` kalau CI merah.
3. **Kerjakan kecil.** Satu widget per PR. Satu halaman per PR. Satu lab per PR. Situs harus bisa dibangun setelah setiap commit.
4. **Verifikasi sendiri sebelum lapor.** Jalankan pemeriksaan di bagian Gerbang kualitas. Jangan pernah mengatakan "selesai" tanpa menjalankan dan membaca hasilnya. Kalau pemeriksaan tidak bisa dijalankan, katakan itu.
5. **Tunjukkan bukti.** Untuk perubahan tampilan: tangkap layar dengan Playwright (desktop 1366×657 dan HP 375×667, mode gelap dan terang) dan lihat sendiri hasilnya sebelum melapor. Untuk lab: tunjukkan output rekaman.
6. **Laporkan jujur dan pendek.** Apa yang berubah, apa yang dicek, apa yang belum. Lalu lanjut ke tugas berikutnya tanpa menunggu.

## Aturan commit dan branch

- **Commit otomatis, tanpa ditanya.** Setiap kali satu perubahan utuh selesai dan gerbang kualitas yang relevan lolos, commit saat itu juga. Jangan menumpuk pekerjaan di working tree.
- **Satu perubahan per commit.** Satu commit = satu hal yang bisa dijelaskan dalam satu kalimat: satu komponen, satu halaman, satu perbaikan, satu ADR. Perubahan di `plan/` (KEPUTUSAN, MEMORI, STATUS) boleh ikut commit yang memicunya, tapi jangan menggabungkan dua fitur. Kalau diff lebih dari ±300 baris non-generated, pecah.
- **Pesan commit** dalam bahasa Indonesia, kalimat pendek, kata kerja di depan, menyebut nomor keputusan bila ada: `Tambah Snippet.astro untuk sisip kode lab (keputusan 103)`. Baris kedua kosong, baris berikutnya hanya kalau perlu konteks.
- **Tanpa trailer `Co-Authored-By: Claude`** dan tanpa tanda tangan, emoji, atau tautan ke alat AI apa pun di pesan commit. Pemilik commit adalah pemilik repo.
- **Branch per fase**: `fase-1/situs-baru`, `fase-2/widget-alur`, dst. Bercabang dari `main`. PR ke `main` dibuka dan di-merge sendiri bila CI hijau; kalau merah, perbaiki dulu, jangan minta pemilik.
- **Jangan pernah** `git push --force` ke `main`, `git reset --hard` pada perubahan yang belum di-commit tanpa mencatat di MEMORI, atau menghapus branch orang lain.
- File yang dibuat alat (`site/`, `dist/`, `node_modules/`, tangkapan layar, font berlisensi) tidak pernah di-commit.

## Gerbang kualitas: syarat minimum, bukan bukti kualitas

Semua harus hijau sebelum commit. Selama fase 0–1 pakai `tools/cek_batch.sh`; setelah migrasi, perintah penggantinya dicatat di MEMORI.

- Build strict (warning = gagal).
- Sinkron registry: nav, indeks, kartu, angka asumsi dibuat ulang dan tidak ada diff tak terduga.
- Audit bahasa 0 error (`tools/audit_bahasa.py`).
- Tes widget lolos (Node test, lalu Vitest).
- Validasi skenario alur dan skema JSON (Zod setelah fase 2).
- Layar pertama: visual pertama sesudah "Inti" utuh tanpa scroll di 4 ukuran, tanpa scroll horizontal.
- Kontras: `tools/contrast.py` lolos untuk mode gelap dan terang.
- Tidak ada ID internal (A1, B3.1) yang tampil ke pembaca.
- Tidak ada file `.env`, kunci, atau nama merek nyata di cerita (gitleaks + audit bahasa).
- Lab: output rekaman dibuat dari database bersih (`down` lalu `up`); yang dibandingkan adalah status code, saldo, dan urutan kejadian, bukan waktu.

## Riset dan kebenaran: selalu cek ulang

Proyek ini menjual kejujuran. Setiap klaim tentang perilaku library, standar, angka industri, atau versi harus dicek ke sumber primer **saat kamu menulisnya**, bukan dari ingatan.

- Sebelum memakai versi apa pun (Astro, Starlight, React, PGlite, Riverpod, Go, PostgreSQL, Serverpod, Playwright, dll.): cek rilis terbaru di dokumentasi resmi atau registry (npm, pub.dev, pkg.go.dev). Catat versi yang dipakai di `requirements`/`package.json`/`go.mod` dan di halaman yang menyebutnya.
- Sebelum menulis klaim tentang RFC, OWASP, NIST, atau dokumentasi resmi: buka halamannya, kutip dengan tautan, tulis dengan kata-katamu sendiri.
- Label kejujuran wajib: **Rekaman lab**, **Ilustrasi**, **Tidak dijalankan**, **Asumsi**, **\[perlu verifikasi\]**. Kalau tidak bisa dicek, tulis \[perlu verifikasi\], jangan dihapus dan jangan dibuat yakin.
- Narasi dikoreksi oleh hasil lab, bukan sebaliknya. Kalau lab menunjukkan hal yang berbeda dari halaman, ubah halamannya dan catat di KEPUTUSAN.
- Kalau kamu punya akses web (WebSearch/WebFetch), pakai. Kalau tidak, tulis \[perlu verifikasi\] dan masukkan ke daftar "Perlu dicek pemilik" di MEMORI.
- Untuk keputusan teknis besar (pilih library, pola arsitektur), tulis ADR di KEPUTUSAN dengan minimal dua alternatif yang ditolak dan sumbernya.

## Visual dan kesan pertama

Acuan rasa: Medium dalam mode gelap. Tenang, besar, jelas. Spesifikasi lengkap ada di PROPOSAL bagian "Desain visual final". Yang tidak boleh dilanggar:

- Gelap default: latar `#0B0B0C`, teks isi `#E6E6E6`, judul `#FFFFFF`, sekunder `#A3A3A8`, satu aksen biru `#7AB8FF`. Mode terang tersedia satu klik dan dipelihara setara.
- Teks isi 19–20 px desktop, 17 px HP, line-height 1,65, kolom 680–720 px. Satoshi (fallback Inter), berat 400/600; JetBrains Mono untuk kode.
- Semua warna lewat token CSS; tidak ada nilai heksadesimal di komponen, widget, atau SVG. Palet makna (system/good/warn/old) punya versi gelap dan terang, keduanya lolos `contrast.py`.
- Beranda = satu layar: judul, satu kalimat, satu tombol "Mulai dari cerita", tiga kartu pintu (Cerita, Peran, Masalah), peta enam tahap. Tanpa daftar fitur.
- Setiap halaman konsep: lima blok yang bisa dilipat (Mulai, Coba, Paham, Putuskan, Kunci); hanya dua pertama terbuka saat dimuat; progres per blok; tombol Berikutnya besar di akhir tiap blok.
- Tidak ada animasi yang berjalan sendiri. Semua gerak dipicu klik; `prefers-reduced-motion` dihormati.
- Diagram dibuat dengan HTML/CSS atau SVG bertoken, bukan Mermaid di halaman; ilustrasi adegan lewat `tools/ilustrasi_cerita.py`.
- Sebelum melapor perubahan tampilan apa pun, lihat tangkapan layarnya sendiri dan nilai: apakah seseorang yang membuka halaman ini 3 detik tahu di mana ia, apa yang harus dibaca dulu, dan ke mana selanjutnya? Kalau tidak, belum selesai.

## Navigasi: tiga pintu, satu sidebar

- Sidebar kiri satu-satunya navigasi utama: urutan cerita per tahap, grup bisa dilipat, ★ jalur inti. Tidak ada tab atas.
- Pemilih peran (Generalis / Mobile / Web / Backend / DevOps / Security) menandai halaman, tidak menyembunyikan.
- Breadcrumb "Kamu di sini": Tahap › Kelompok › Halaman + rekap satu kalimat.
- Daftar isi kanan hanya lima blok dengan status selesai.
- Indeks masalah bisa dicari ("dobel bayar" → 2.3). Pencarian Pagefind memprioritaskan istilah glosarium.
- Mode fokus menyembunyikan sidebar dan daftar isi.
- Uji setiap halaman dengan tiga pertanyaan: di mana saya, dari mana, ke mana. Gagal satu = bug.

## Bahasa dan gaya konten

Aturan lengkap ada di `CONTRIBUTING.md` dan dipaksakan `tools/audit_bahasa.py`. Ringkasnya:

- Sapaan "kamu". Kalimat ≤ 25 kata, paragraf ≤ 4 kalimat, satu ide per kalimat.
- Istilah teknis tetap bahasa Inggris (transaction, lock, queue, idempotency key, user, client, file). Beri `translate="no"` di HTML supaya terjemahan browser tidak merusaknya. Tidak ada metafora berlapis, tidak ada idiom terjemahan literal.
- Tanpa nama merek nyata di cerita. Data karangan saja. Rupiah ditulis "Rp70.000".
- Setiap konsep dibuka dari adegan konkret dengan angka. Pola: prediksi → lihat → "ubah satu hal".
- Setiap halaman konsep punya Cek diri (3 soal), checklist "Saat me-review kode AI", dan bacaan lanjut ke sumber primer.
- Kode di halaman disisipkan dari lab, bukan disalin. Tiap tab stack menyebut versi yang dijalankan.
- Glosarium: satu halaman per istilah dengan susunan tetap (lihat PROPOSAL); tooltip memakai kalimat pertamanya.

## Yang tidak boleh kamu lakukan

- Mengubah keputusan di PROPOSAL tanpa diminta. Kalau kamu yakin ada yang salah, tulis di MEMORI bagian "Usulan perubahan" dan tanyakan.
- Menulis angka saldo, status code, atau output ke halaman tanpa rekaman lab, kecuali diberi label Ilustrasi atau Tidak dijalankan.
- Menyimpan secret di repo, termasuk di contoh. `.env.example` boleh, `.env` tidak.
- Menjalankan lab serangan ke target di luar container lab.
- Menambah dependency tanpa ADR singkat di KEPUTUSAN.
- Melapor "selesai" tanpa menjalankan gerbang kualitas dan melihat hasilnya.
- Mengganti font atau palet di luar spesifikasi.
- Membuat halaman baru tanpa mendaftarkannya di registry.

## Tugas pertama

Ketika pemilik mengetik "jalankan Tugas pertama", kerjakan semuanya berurutan tanpa berhenti untuk persetujuan:

1. Jalankan `bash tools/cek_batch.sh` apa adanya. Catat hasilnya di MEMORI. Kalau gagal, perbaiki lingkungan dulu, bukan kodenya.
2. Buat `.github/workflows/cek.yml` yang menjalankan `cek_batch.sh` di setiap PR (fase 0). Buktikan hijau, lalu merge ke `main`.
3. Buat `devcontainer.json` dan target `make lab` di root yang menyiapkan PostgreSQL 17 dan Redis 8 lewat Docker Compose dan memeriksa Go, Node, Python, Dart. Buktikan `make -C labs/b3-race run` jalan dari nol di mesin ini.
4. Tulis rencana fase 1 untuk **satu halaman saja** (1.11 Transaction) di `plan/RENCANA-FASE-1-1-11.md`: Astro + Starlight, mode gelap sesuai spesifikasi, komponen `Snippet` untuk sisip kode lab, widget `runsql` lama dimuat apa adanya, **tanpa React** (React masuk di fase 2 bersama widget React pertama), lima blok lipat ditunda ke fase 3. Lalu langsung kerjakan di branch `fase-1/situs-baru`.
5. Tangkap layar desktop dan HP dalam dua mode, lihat sendiri, perbaiki, catat jumlah baris CSS widget yang harus ditulis ulang (dasar estimasi fase 2), bandingkan halaman lama vs baru (teks, urutan heading, jumlah link), lalu laporkan dengan tangkapan layar dan lanjut ke halaman berikutnya di jalur inti.

Setelah itu ikuti urutan fase di PROPOSAL. Pekerjaan pertama fase 3 sudah ditetapkan: ledger double-entry menggantikan kolom saldo (lab `b3-ledger`, tulis ulang `b3-stack`, `b3-race`, widget race).
