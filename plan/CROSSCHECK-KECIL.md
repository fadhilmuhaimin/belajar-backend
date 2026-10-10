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

## K1 · 1.26–1.30 (2026-10-10)

Branch `crosscheck/k1` (main 1d60c9c). Build `bun run --cwd situs build`: 79 halaman, exit 0. Preview `http://localhost:4321` (preview Astro hanya mendengar `localhost`, bukan `127.0.0.1`). Alat: `situs/tangkapan/k1-nav.mjs` (Playwright), `tmp/k1_href.py` dan `tmp/k1_href2.py` (href di `situs/dist/`), semuanya di folder yang di-.gitignore dan tidak di-commit; `layar.mjs`. Isi diperiksa satu subagen baca saja terhadap rekaman lab, seed, naskah, dan PROPOSAL; temuannya dicek ulang ke baris yang dikutip sebelum ditulis di sini.

### Alur baca 1.25 → 1.31

`node situs/tangkapan/k1-nav.mjs http://localhost:4321` di 375×667 dan 1366×657: ketujuh halaman `200`, `scrollWidth` sama dengan lebar viewport, 0 error konsol. Di tiap halaman, tombol Berikutnya di blok 1–4 diklik berurutan: blok tujuan terbuka dan terlihat di viewport (4 dari 4 di keenam halaman baru); tautan Berikutnya di blok 5 dan `Lanjut` di kaki halaman menunjuk halaman berikutnya di registry.

| Halaman | Blok (dua pertama terbuka) | Blok 5 → | Breadcrumb HP | Sidebar aktif | Layar pertama 375×667 |
|---|---|---|---|---|---|
| 1.25 Migration | Mulai, Coba, Paham, Putuskan, Kunci | `/tahap-1/m5-angka-di-url/` | Tahap 1 › Masalah yang muncul | 1.25 | margin 85 px |
| 1.26 M5 | Gejala, Yang Raka kira, Yang sebenarnya, Coba sendiri, Konsep yang lahir | `/tahap-1/authentication/` | Tahap 1 › minggu 4 | 1.26 | tanpa Inti; dilihat: tangkapan `k1-m5-hp-dark.png` |
| 1.27 Authentication | lima blok konsep | `/tahap-1/authorization/` | Tahap 1 › Masalah yang muncul | 1.27 | margin 112 px |
| 1.28 Authorization | lima blok konsep | `/tahap-1/idor-token-app/` | sama | 1.28 | margin 58 px |
| 1.29 Keamanan 2 + ADR 7–8 | lima blok konsep | `/tahap-1/m6-deploy-hari-senin/` | sama, label "ADR 7 dan 8" | 1.29 | margin 57 px |
| 1.30 M6 | lima blok masalah | `/c-operasional/c3-deployment/` | Tahap 1 › minggu 5 | 1.30 | tanpa Inti; dilihat: tangkapan `k1-m6-hp-dark.png` |
| 1.31 Deployment (lama) | tanpa blok (belum ditulis ulang) | `Lanjut` → `/c-operasional/c1-testing/` (1.32) | sama | 1.31 | margin 114 px |

`layar.mjs` keseluruhan: `LOLOS: 0 gagal, 0 margin tipis.` Tiga pertanyaan di dua tangkapan HP gelap (1.26, 1.30): di mana saya (breadcrumb "Tahap 1 › minggu 4/5", judul dengan nomor), apa yang dibaca dulu (Gejala dengan ilustrasi M5/M6 di atas paragraf pertama, ilustrasi top 245 px tinggi 110 px), ke mana (meta "Blok 1 dari 5"); ketiganya terjawab. Judul 1.29 di H1 ("Keamanan 2: …, dan ADR 7–8") lebih panjang dari judul registry di sidebar dan breadcrumb ("IDOR, enumerasi, dan token di app"); pola sama dengan 1.20 ("Keamanan 1: SQL injection dan ADR 4" vs "SQL injection"), jadi bukan temuan.

### Tautan

`python3 tmp/k1_href.py`: href internal di `<main>` 1.25 (19), 1.26 (9), 1.27 (19), 1.28 (23), 1.29 (27), 1.30 (11), 1.31 (15); 0 anchor salah. Satu-satunya href tanpa target di kelima halaman adalah `/tahap-1/tim-infra/` di 1.30, dengan kelas `rujukan-menyusul` (keputusan 104). Rujukan ke halaman lama: 1.25 → C3, E1; 1.28 → C1; 1.29 → C4; 1.30 → C1, C3, E1; semuanya ada di `dist/`.

Seluruh situs (`python3 tmp/k1_href2.py`): 622 href internal tanpa target dari 7.557. 539 tautan sidebar `nav-menyusul` dan 4 `rujukan-menyusul` disengaja (keputusan 104). 79 sisanya `<link rel="icon" href="/favicon.svg">` di semua halaman: `situs/public/` tidak punya `favicon.svg` dan konfigurasi Starlight tidak menyetel `favicon`, jadi setiap halaman memuat ikon yang 404. Catatan kecil: `title` untuk halaman yang belum ada berbeda antara sidebar ("Belum ditulis") dan rujukan di teks ("Halaman ini belum dipindah ke situs baru"), padahal 1.36 halaman baru, bukan halaman yang dipindah. Tautan sidebar `nav-menyusul` juga membawa atribut `class` dua kali (`class="nav-inti nav-menyusul astro-…" class="nav-inti nav-menyusul"`, dari `situs/tools/sidebar.mjs` baris 10–13); browser memakai yang pertama, jadi tidak terlihat, tetapi HTML-nya tidak sah.

### Cocok dengan naskah, lab, dan registry

| Yang diperiksa | Hasil | Bukti |
|---|---|---|
| Sesi acak, bukan JWT | Cocok. JWT hanya muncul sebagai pembanding atau "ditunda ke Tahap 4" (1.27 sebelas kali, 1.29 lima kali, banding `t1-idor-banding.json` opsi B); tabelnya `sesi` | `grep -n JWT` di kelima MDX |
| Field `jumlah` | Cocok. `amount` dan `nominal` tidak muncul di 1.26–1.29; di 1.30 `nominal` adalah nama field v2 yang diganti (keputusan 241) | `labs/api-t1/rekaman/m6.txt` baris 3–12 |
| 103 akun, 401–503 | Cocok untuk enumerasi: seed admin 400, 401–501 tanpa 418 = 100 karyawan, 418/502/503 warung; m5 `200 x 103` lalu versi benar `200 x 1, 404 x 102`. Tidak cocok di 1.29: "Satu backend melayani 103 akun" dan tabel "103 akun", padahal seed membuat 104 baris dengan admin; diperbaiki di PR ini jadi "100 karyawan dan 3 warung" | `labs/api-t1/cmd/api/main.go` baris 68–93; `m5.txt` baris 28, 68 |
| Dimas 417, Ani 418, Budi 419, admin 400 | Cocok di kelima halaman dan widget | seed di atas |
| Sesi 8 jam | Cocok (28.800 detik) | `main.go` baris 26; `login.txt` baris 8 |
| 404 / 403 / 401 | Cocok: 404 seragam untuk data orang lain, 403 untuk peran, 401 sebelum 403 | `m5.txt` 53–62; `authz.txt` 27, 52, 62–65 |
| `WWW-Authenticate` (keputusan 243) | Cocok: tanpa token `Bearer`, token sesudah logout `Bearer error="invalid_token"`; 1.27 baris 76, `t1-authn.json` 127 dan `t1-login.json` 66 adalah kasus logout | `login.txt` 39, 50; `authz.txt` 54 |
| Tokoh | Cocok dengan naskah; "untuk kedua kalinya" di 1.26 benar (spreadsheet pertama di 1.19, minggu 2) | `plan/CERITA-TAHAP-1.md` baris 47–52 |
| ADR 8 | Cocok: shared_preferences 2.5.6 dan flutter_secure_storage 11.2.0 ada | `idor-token-app.mdx` baris 85, 87 |
| ADR 7 | Tidak cocok di dalam ADR: butir 4 melarang RLS di tabel yang dibaca atau ditulis atas nama pihak lain, padahal Inti merencanakan RLS untuk ledger Tahap 2 dan "Yang merevisinya nanti" menulis ledger di-`INSERT` untuk Warung Ani dari pembayaran Dimas | `idor-token-app.mdx` baris 22, 126, 137 |
| Migration 000006/000007 | Cocok: lab berhenti di 000005; 000006 dan 000007 hanya muncul sebagai komentar "di cerita" di rekaman M6, dan 1.30 menulis "migration baru" tanpa nomor | `labs/b4-migration/baru/`; `m6.txt` 33, 95; `t1-m6.json` 148 |
| bcrypt cost 10 | Tidak cocok di 1.27: baris 60 "sama dengan batas minimum OWASP", baris 193 "masih di atas batas minimum". OWASP: bcrypt dengan work factor 10 atau lebih, jadi 10 tepat di batas; baris 193 diperbaiki di PR ini jadi "memenuhi batas minimum" | [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) |
| Batas percobaan login | Tidak cocok: 1.7 baris 83 dan 1.27 baris 62, 192 menulis "Tahap 2, bersama brute force"; 1.29 baris 67, 176, 184 menulis "[[C4]], Tahap 3". PROPOSAL tabel keamanan baris 686 menaruh brute force dan rate limit per akun di Tahap 2 | `plan/PROPOSAL.md` baris 686 |
| Rujukan `[[…]]` | Semua terdaftar dan nomornya cocok (B1.4 = 1.18, C4 = 3.7). 1.30 baris 87, 90 menyebut C3 dan E1 "memuat ADR 9/10", padahal halaman lamanya belum memuat ADR; rujukan maju yang sudah terjadwal di tugas 1.31 dan 1.33 | `grep -c ADR` di C3 dan E1 = 0 |
| Sambungan 1.25 → 1.26 | Cocok: minggu 3 lalu minggu 4; 1.25 baris 183 menunjuk 1.30 dan E1 | `migration.mdx` |
| Sambungan 1.30 → 1.31 | Tidak cocok (C3 lama belum ditulis ulang): C3 bercerita deploy lewat `ssh` + `git pull` + build di server, "suatu malam", mati 40 menit, lalu pulih dengan build ulang dari Git; 1.30 build di laptop lalu `scp`, Senin 12.10, mati 5 menit, dan v1 yang dibangun ulang menjawab 500. C3 juga memakai prasyarat kosong, kolom `telp` yang tidak ada di skema v1, dan `TOKEN_SECRET` (ikut di `kartu.json`) | `c3-deployment` baris 8, 37, 39, 92–106; `m6.txt` baris 87 |
| Registry | Prasyarat 1.30 = B4.1 cocok; jenis 1.29 `konsep` sama dengan 1.15, 1.18, 1.20 (konsep + ADR) | `situs/data/cerita.json` |

Di luar kelima halaman: `alat/kamus-lintas-stack.mdx` baris 35 memetakan "Login dan token" di Go ke `golang-jwt`. Itu pemetaan antar-stack, bukan klaim tentang lab, jadi dibiarkan.

### Diperbaiki langsung di PR ini

- 1.27 `authentication.mdx`: "bcrypt cost 10 masih di atas batas minimum OWASP" jadi "memenuhi batas minimum OWASP", sama dengan blok Paham.
- 1.29 `idor-token-app.mdx`: "103 akun" (Kebutuhan ADR dan tabel Sengaja belum) jadi "100 karyawan dan 3 warung".

### Tugas perbaikan yang lahir

- K1a: favicon 404 di semua halaman, `title` rujukan menyusul, dan atribut `class` ganda di sidebar.
- K1b: satu tahap untuk batas percobaan login (Tahap 2 menurut PROPOSAL) di 1.7, 1.27, dan 1.29.
- K1c: ADR 7 butir 4 tidak bertentangan dengan rencana RLS di ledger Tahap 2.
- Pertentangan C3 lama dengan 1.30 masuk catatan tugas 1.31 yang sudah ada, bukan tugas baru.
