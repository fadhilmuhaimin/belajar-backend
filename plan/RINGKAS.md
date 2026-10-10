# Ringkas: CERITA-TAHAP-1 dan PROPOSAL (keputusan 235)

Diimpor CLAUDE.md menggantikan kedua file penuh. Bagian lengkap dibaca hanya saat tugas membutuhkannya: `grep -n '^##' plan/CERITA-TAHAP-1.md` (atau PROPOSAL), lalu Read dengan offset/limit rentang itu, atau subagent yang mengembalikan ringkasan. Kalau ringkasan ini bertentangan dengan file penuh, file penuh yang benar.

## Keputusan final (PROPOSAL "Keputusan final")
- Situs Astro + Starlight; widget React 19 + TypeScript, logika murni di `.ts`, JSON divalidasi Zod; SQL di browser PGlite (race dua koneksi tetap replay rekaman).
- Hosting Cloudflare Pages lewat GitHub Actions; progres pembaca di localStorage + ekspor/impor, tanpa akun. Hands-on: jalur A (browser) + B (`make lab`, Dev Container); terminal di VPS ditunda. Stack pembanding keenam: Dart server (Serverpod). Flutter: feature-first + MVVM, Riverpod 3, go_router.
- Model uang: ledger double-entry append-only mulai Tahap 2; Tahap 1 kolom `saldo` di-UPDATE.
- Keamanan direkam sampai Tahap 4, Tahap 5–6 konseptual [perlu verifikasi]; penyerang "yang mencoba" (Dimas, penasaran, bukan jahat).
- Enam tahap (6 = proyeksi). Konten dulu, satu tahap sampai tuntas (keputusan 109). Aturan dunia: semua fiktif, tanpa merek nyata, tanpa klaim regulasi; tiap tahap mulai dari PRD; masalah terlihat orang, bukan log; puncak Tahap 1 = 0,14 RPS.
- Tokoh: Raka (mobile engineer, sendiri), Sinta (PM, PRD), Budi (karyawan), Ani (warung), Pak Hadi (Keuangan, "setiap rupiah tertelusur"), Dimas (TI junior, mencoba).

## Tampilan (CLAUDE.md `<tampilan>`, PROPOSAL "Desain visual final")
- Gelap default: latar #0B0B0C, teks #E6E6E6, judul #FFFFFF, sekunder #A3A3A8, aksen #7AB8FF; terang satu klik; semua warna lewat token.
- Teks 19–20 px desktop, 17 px HP, line-height 1,65, kolom 680–720 px; Satoshi 400/600 (fallback Inter), JetBrains Mono.
- Halaman konsep lima blok (Mulai, Coba, Paham, Putuskan, Kunci), dua pertama terbuka, Berikutnya di tiap blok; tanpa animasi otomatis; teks tidak di dalam SVG.

## Peta halaman Tahap 1 (nomor · judul · jenis · widget · lab)
1.1 PRD v1: Rekeningo untuk Gedung A · PRD · – · –
1.2 Dari fitur ke pekerjaan teknis · Fitur→teknis · pilah · –
1.3 Apa yang dikerjakan backend · Konsep · pilah, hp · –
1.4 ADR 1: Backend sendiri, bukan BaaS · ADR · banding · –
1.5 Perjalanan satu request · Konsep · alur · –
1.6 Struktur folder pertama: handler, service, repo · Konsep · – · api-t1
1.7 Fitur: login karyawan · Fitur→teknis · alur · api-t1
1.8 Fitur: top-up oleh admin · Fitur→teknis · runsql · b2-model
1.9 Fitur: bayar ke warung · Fitur→teknis · alur, hp · api-t1
1.10 Fitur: saldo, riwayat, laporan warung · Fitur→teknis · runsql · b2-query
1.11 Pertukaran saldo: tiga hal yang harus selalu benar · Konsep · runsql, jumlah-total · b3-stack
1.12 Data modeling dan relasi · Konsep · runsql · b2-model
1.13 SQL atau NoSQL (pertanyaan Sinta) · Konsep · banding · –
1.14 M1: Nominal minus lolos · Masalah · runsql · api-t1
1.15 Validation dua lapis + format error + ADR 2 · Konsep+ADR · alur, hp · api-t1
1.16 HTTP: method, status, header · Konsep · pilah, stackstep · api-t1
1.17 M2: amount vs nominal · Masalah · alur · b1-openapi
1.18 Kontrak OpenAPI + ADR 3 · Konsep+ADR · alur · b1-openapi
1.19 M3: Tanda kutip di pencarian · Masalah · hp rentan, cari-bug · api-t1
1.20 Keamanan 1: SQL injection + ADR 4 · Keamanan+ADR · cari-bug · api-t1
1.21 Lapisan dasar: handler tidak tahu SQL · Konsep · pilah · api-t1
1.22 M4: Rp70.000 yang hilang · Masalah · runsql · b3-stack
1.23 Transaction · Konsep · runsql, stackstep · b3-stack
1.24 ADR 5–6: Transaction di service; tabel koreksi · ADR · runsql · b3-stack
1.25 Migration: skema sebagai kode · Konsep · alur · b4-migration
1.26 M5: Angka di URL · Masalah · alur · api-t1
1.27 Authentication · Konsep · alur · api-t1
1.28 Authorization · Konsep · alur, pilah · api-t1, b5-rls
1.29 Keamanan 2: IDOR, enumerasi, token di app + ADR 7–8 · Keamanan+ADR · alur, banding · b5-rls
1.30 M6: Deploy hari Senin · Masalah · alur · api-t1
1.31 Deployment dan rollback + ADR 9 · Konsep+ADR · alur · api-t1
1.32 Testing: apa dites di level mana · Konsep · pilah, stackstep · api-t1
1.33 App versi lama + ADR 10 · Konsep+ADR · alur · api-t1
1.34 M7: `.env` di repo · Masalah · – · api-t1
1.35 Keamanan 3: secret + ADR 11 · Keamanan+ADR · – · api-t1
1.36 Tim dan infra Tahap 1: satu orang, satu VPS, CI pertama · Tim-infra · alur · api-t1
1.37 M8: Uji coba lolos, PRD v2 datang · Masalah · kalkulator · –
1.38 Kerangka berpikir dan estimasi · Konsep · kalkulator · –
1.39 Spesifikasi untuk AI dan review kode AI · Konsep · banding, pilah · f2-review
1.40 ADR 12: Sengaja belum dilakukan · ADR · – · –
1.41 Yang dibawa keluar dari Tahap 1 (10 kalimat + Cek diri) · Konsep · kartu · –
1.42 Jembatan: pratinjau PRD v2 · PRD · tebak · –
