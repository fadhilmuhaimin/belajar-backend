# Crosscheck kecil

Hasil crosscheck kecil dari loop otomatis (`plan/ANTREAN.md`, "Definisi selesai bersama"). Satu bagian per tugas crosscheck. Tangkapan ada di `situs/tangkapan/` (tidak di-commit) dan bisa dibuat ulang dengan `npm --prefix situs run tangkap -- --url http://127.0.0.1:4321 --path /<path>/`.

## K0 · 1.21–1.25 setelah redesain (2026-10-10)

Gerbang penuh di branch `crosscheck/k0` (main df74599): `semua pemeriksaan lolos`; layar pertama `LOLOS: 0 gagal, 0 margin tipis`. Tangkapan 375×667 dan 1366×657, gelap dan terang, untuk kelima halaman: semua `scrollWidth` sama dengan viewport, tanpa error konsol.

### Cocok dengan naskah dan registry

| Halaman | Naskah (jenis · ★ · widget · lab) | Di situs dan registry | Hasil |
|---|---|---|---|
| 1.21 Lapisan dasar | Konsep · ★ · pilah · api-t1 | `B7.1` konsep, inti, bagian 4, backend; pilah `t1-lapisan-pilah.json`; snippet dan rekaman `api-t1` | Cocok |
| 1.22 M4 | Masalah · ★ · runsql · b3-stack | `t1-m4` masalah, inti, backend; runsql `t1-m4.json`; lab `api-t1` mode `m4` | Cocok; lab beda dari naskah, alasan di keputusan 167–168 |
| 1.23 Transaction | Konsep · ★ · runsql, stackstep · b3-stack | `B3.1` konsep, inti, backend; stackstep + TabSet `b3-stack` | Cocok; runsql sengaja tidak dipakai (duplikat 1.22), keputusan 169 |
| 1.24 ADR 5–6 | ADR · ★ · runsql · b3-stack | `t1-adr-transaction` adr [5, 6], inti, backend; runsql `t1-adr6.json`; lab `api-t1` | Cocok; lab beda dari naskah, alasan di keputusan 171 |
| 1.25 Migration | Konsep · ★ · alur · b4-migration | `B4.1` konsep, inti, backend + devops; alur `t1-migration.json`; lab `b4-migration` | Cocok (naskah: DevOps menonjolkan 25) |

Blok tiap halaman sama dengan `situs/data/templat.json` untuk jenisnya (konsep lima blok, masalah lima blok, ADR enam blok dengan "Yang merevisinya nanti" di blok terakhir). Konsep punya Cek diri ≥ 3 kartu (gerbang sinkron lolos).

### Tampilan dan tiga pertanyaan navigasi

| Halaman | Di mana saya | Apa yang dibaca dulu | Ke mana selanjutnya | Hasil | Bukti |
|---|---|---|---|---|---|
| 1.21 | Breadcrumb "Tahap 1 › Masalah yang muncul", sidebar menyorot 1.21 | Inti satu kalimat, lalu diagram | "Berikutnya: Coba" di akhir blok Mulai | Perlu dibenahi: diagram masih `bb-flow` lama (ditolak keputusan 212); Inti tanpa dua paragraf rinci | `tahap-1_lapisan-dasar-{hp-dark,desktop-light}.png` |
| 1.22 | Breadcrumb "Tahap 1 › minggu 3" | Ilustrasi M4 lalu Gejala | Blok Yang Raka kira terbuka di bawahnya | Perlu dibenahi: teks "bukan 250.000" di ilustrasi meluber keluar bingkai layar HP, di 375 dan 1366 | `tahap-1_m4-rp70000-hilang-{hp-dark,desktop-light}.png` |
| 1.23 | Breadcrumb dan sidebar jelas | Inti satu kalimat, lalu rekaman `m4.txt` | Berikutnya di akhir blok | Perlu dibenahi: visual Inti hanya potongan kode, terpotong di 375 px ("…$1 WH"); Inti tanpa dua paragraf rinci | `tahap-1_transaction-{hp-light,desktop-dark}.png` |
| 1.24 | Breadcrumb "Tahap 1 › ADR 5 dan 6" | Blok Kebutuhan, empat paragraf teks | Blok Opsi terbuka di bawahnya | Perlu dibenahi: tidak ada visual di layar pertama (ADR 1 sudah punya rantai, keputusan 214) | `tahap-1_adr-transaction-koreksi-{hp-dark,desktop-light}.png` |
| 1.25 | Breadcrumb dan sidebar jelas | Inti satu kalimat, lalu rekaman `migrate up` | Berikutnya di akhir blok | Perlu dibenahi: visual Inti hanya rekaman terminal, bukan diagram drift laptop/server; Inti satu paragraf | `tahap-1_migration-{hp-light,desktop-dark}.png` |

### Tugas perbaikan yang lahir

- K0a: Inti 1.21, 1.23, 1.25 mengikuti standar keputusan 212–215 (kalimat → Rantai → dua paragraf).
- K0b: visual di blok Kebutuhan 1.24.
- K0c: teks ilustrasi M4 tidak keluar bingkai.
