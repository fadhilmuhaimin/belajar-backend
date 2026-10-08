# Crosscheck akhir Tahap 1

Prompt ini dijalankan sekali oleh `tools/jalankan-tahap.sh` setelah plan/STATUS.md memuat "Tahap 1: selesai" (keputusan 140). Kamu memeriksa seluruh Tahap 1 dengan bukti, bukan ingatan.

Mulai seperti biasa: baca sumber kebenaran sesuai CLAUDE.md, tulis paragraf "Sedang dikerjakan" di plan/MEMORI.md (tanggal, "crosscheck Tahap 1", file yang disentuh). Pakai ketiga skill: gaya-bahasa, visualisasi, analisis-kritis. Hemat konteks: output panjang ke file di `tmp/crosscheck/`, baca seperlunya.

## 1. Peta halaman

Cocokkan 42 halaman dengan plan/CERITA-TAHAP-1.md bagian "Peta halaman Tahap 1 versi baru". Untuk tiap nomor 1.1–1.42 periksa:

- Halamannya ada di `situs/src/content/docs/` dan bisa dibuka di build.
- Jenisnya benar (PRD, Fitur → teknis, Masalah, Konsep, ADR, Tim dan infra) dan memakai template jenis itu.
- Widget dan lab sesuai kolom naskah; perbedaan yang disengaja punya nomor keputusan di plan/KEPUTUSAN.md.
- Terdaftar di registry `situs/data/cerita.json` dengan jenis, bagian, peran, dan ★ jalur inti yang sama dengan naskah.
- Jalur per peran sesuai naskah: Mobile 5, 7, 9, 15, 18, 27, 29, 33; Security 19, 20, 26, 29, 34, 35; DevOps 6, 25, 30, 31, 36.

## 2. Proposal

Cocokkan dengan plan/PROPOSAL.md bagian "Keputusan final" dan "Desain visual final":

- Beranda satu layar: judul, satu kalimat, tombol "Mulai dari PRD", tiga kartu (Cerita, Peran, Masalah), peta enam tahap.
- Halaman konsep memakai lima blok lipat (Mulai, Coba, Paham, Putuskan, Kunci), dua pertama terbuka, tombol Berikutnya di tiap blok.
- Pemilih peran, breadcrumb "Kamu di sini", indeks masalah, mode fokus.
- Mode gelap default dan mode terang satu klik; semua warna lewat token; `tools/contrast.py` lolos di kedua mode.
- Tidak ada animasi yang berjalan sendiri; `prefers-reduced-motion` dihormati.

## 3. Checklist tiga skill atas seluruh Tahap 1

- gaya-bahasa: `python3 tools/audit_bahasa.py` 0 error untuk semua halaman Tahap 1.
- visualisasi: setiap blok Coba punya "tebak dulu" sebelum hasil dan "ubah satu hal" sesudahnya, plus chip sumber (Rekaman lab, Ilustrasi, Asumsi).
- analisis-kritis: setiap klaim teknis, angka, versi, dan status code bersumber (rekaman lab, dokumentasi resmi, RFC) atau berlabel [perlu verifikasi]. Setiap ADR punya minimal tiga opsi dan bagian "kapan keputusan ini salah".
- Gerbang lengkap: `bash tools/cek_situs.sh --layar` hijau.

## 4. Tangkapan layar

Jalankan `cd situs && npm run build && npm run preview`, lalu tangkap semua 42 halaman di 375×667 dan 1366×657, gelap dan terang (`node tools/tangkap.mjs --path <path>` per halaman, atau semua sekaligus). Lihat sendiri setiap tangkapan. Untuk tiap halaman jawab tiga pertanyaan dalam 3 detik:

1. Di mana saya?
2. Dari mana saya datang?
3. Ke mana selanjutnya?

Halaman yang gagal salah satunya dicatat sebagai bug tampilan.

## 5. Laporan dan perbaikan

Tulis plan/LAPORAN-TAHAP-1.md:

1. Tabel per halaman: nomor, judul, keadaan (lolos / perlu dibenahi / hilang), alasan singkat, bukti (perintah atau tangkapan).
2. Daftar perbaikan yang bisa kamu lakukan sendiri. Kerjakan semuanya, satu PR per perbaikan, merge bila CI hijau, dan tandai di laporan.
3. Daftar yang butuh pemilik: secret Cloudflare, usulan perubahan cerita, semua hal berlabel [perlu verifikasi], dan keputusan yang menurut CLAUDE.md butuh persetujuan.

Catat keputusan baru di plan/KEPUTUSAN.md bila ada. Perbarui plan/MEMORI.md "Sedang dikerjakan" dengan keadaan akhir. Terakhir, tulis baris "Tahap 1: crosscheck selesai" di plan/STATUS.md, commit lewat PR, dan merge bila CI hijau.
