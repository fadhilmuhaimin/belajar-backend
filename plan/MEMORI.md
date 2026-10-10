# Memori kerja

Catatan kerja lintas sesi dan lintas model. Maksimal 80 baris (gerbang menolak lebih, keputusan 235). Pelajaran dan catatan lama di `plan/PELAJARAN-ARSIP.md` (tidak diimpor; cari dengan grep).

## Keputusan baru

- Nomor baru = terbesar di KEPUTUSAN + 1: `grep -o '^| [0-9]*' plan/KEPUTUSAN.md | tail -1`. Daftar per nomor ada di KEPUTUSAN, tidak diulang di sini.
- 235: hemat konteks (RINGKAS menggantikan impor CERITA/PROPOSAL, MEMORI ≤ 80 baris, PROTOKOL bagian k, `tools/ukur_konteks.py`); loop CLI diganti sesi pengatur + satu subagent per tugas.

## Usulan perubahan cerita

- M4: naskah belum menyebut asal batas saldo warung. 1.22 memakai: minggu 2 Raka menambah batas Rp1.500.000 lewat psql; Jumat minggu 3 saldo Ani Rp1.450.000. Disetujui pemilik 2026-10-09; mohon naskah M4 diperbarui.
- M2: naskah menulis server membaca `nominal`; lab dan halaman sejak 1.9 memakai `jumlah` (label layar "Nominal"). Usul: naskah menyebut `jumlah`, atau dibiarkan.
- M5: naskah menulis "100 saldo"; lab membaca 103 akun (100 karyawan + 3 warung), 1.26 menulis 103. Usul: naskah menyebut 103.

## Catatan untuk halaman Tahap 1 berikutnya

- 1.30 memakai `labs/api-t1/output/m6.txt` (keputusan 241): 8 putaran prober per detik; Budi (app 1.0) 2 berhasil, 3 tidak ada jawaban, 3 field `jumlah` tidak ada; Dimas update ke app 1.1 sesudah v2 menyala; bayar app 1.0 400 `nominal` wajib, app 1.1 201; VPS hanya punya v2; v1 dibangun ulang di skema baru 500; G: kolom kembali ke `jumlah`, v1 melayani app 1.0, app 1.1 200 tanpa field `nominal` (jembatan ke ADR 10, yang tetap berdiri sendiri). Lock ACCESS EXCLUSIVE dipegang saat v1 sudah mati: jeda 3 putaran berasal dari jumlah perintah, bukan dari lock; halaman 1.30 jangan mengaitkan jeda dengan lock. Ganti nama kolom di cerita lewat `migrate up` file 000006 (komentar di rekaman). Angka cerita (5 menit, 11 HP) bukan dari lab. Kode lab utama tetap `jumlah`.
- 1.33 (E1): prasyarat B4.2 dibuang; ADR 10 (expand lalu contract) harus berdiri sendiri, tanpa rekaman crash B4.2.
- 1.39 (F1) menyerap F2: hapus halaman F2 dan entrinya di PR yang sama (pola keputusan 150).
- Ilustrasi latar Grup Lestari dan M6 belum ada; ilustrasi baru wajib lolos `ukur-ilustrasi.mjs` (tambahkan path halamannya ke alat itu). `situs/lama/assets/cerita/tahap-1.svg` tidak dipakai lagi.
- Tabel "Angka di tahap ini" ditulis ulang di 1.37/1.38, angka dari `tahap[0].asumsi`.
- `/cara-pakai/` (A0) masih menjelaskan susunan lama; tulis ulang untuk lima blok dan tiga pintu.
- `labs/api-t1-lama` boleh dihapus (disetujui pemilik 2026-10-08) hanya setelah `grep -rn api-t1-lama situs/ labs/ tools/` kosong; bukti grep di PR hapus. Kolom "Halaman" di README lab memakai nomor lama.
- Audit bahasa menolak "kantor" (pakai "perusahaan") dan "pemakai" (pakai "user").
- Pola tulis ulang halaman lama: pindah ke `tahap-1/<slug>.mdx`, lima blok, contoh PRD v1; hapus file lama dan data widget lama; perbarui `path`, `prasyarat`, hapus `lama` di registry, perbarui `alat/indeks-topik.mdx`, lalu `python3 tools/sinkron_cerita.py`.

## Perintah dan pola kerja

- Situs (bun 1.4.2): `bun run --cwd situs build|preview|test|cek-tipe|tangkap|layar` (urutan ini; `bun --cwd situs run x` hanya mencetak bantuan dengan exit 0). bun lokal 1.2.19; versi CI lewat `npx --yes bun@1.4.2 ...`.
- Gerbang: `bash tools/cek_situs.sh --layar > tmp/cek.txt 2>&1 && echo LOLOS || echo GAGAL`, lalu `tail -30 tmp/cek.txt`. Preview tertinggal: `npm --prefix situs run preview -- stop`.
- Tangkapan dari root: `npm --prefix situs run tangkap -- --url http://127.0.0.1:4321 --path /<path>/` (ke `situs/tangkapan/`). Layar pertama: `npm --prefix situs run layar -- --url http://127.0.0.1:4321`; `layar.mjs` tidak mengukur halaman ADR.
- Layar pertama HP sempit: 1.23 hanya punya 28 px di 375×667; jangan tambah tinggi di atas Inti. Rantai di Inti selalu `ringkas`, maksimal dua baris pendek.
- Gerak: bungkus island dengan `MotionProvider` (`situs/src/gerak/`), `import * as m from "motion/react-m"`, `transition` dari `useGerak(...)`, `initial` dari `useAwal(...)`; jangan tulis `duration: <angka>`. Contoh `/uji/gerak/`; diperiksa `ukur-gerak.mjs`.
- Diagram arsitektur: `<DiagramArsitektur client:visible id="..." judul="Arsitektur Tahap N" data={Arsitektur.parse(t.arsitektur)} />` dari `situs/src/diagram/`; data di registry `tahap[].arsitektur`; wajib lolos `ukur-diagram.mjs`. Contoh `/uji/diagram/`.
- Per halaman: branch `tahap-1/<slug>` dari main; lab dulu bila perlu (PR sendiri); halaman (PR sendiri); KEPUTUSAN + STATUS + MEMORI + ANTREAN; merge bila CI hijau; akhiri "Siap dilanjutkan dari <halaman>". Setelah 1.42: `plan/PROMPT-CROSSCHECK.md`, lalu `plan/LAPORAN-TAHAP-1.md`.

## Perlu dicek pemilik

- Redesain #120: usulan perubahan PROPOSAL "Desain visual final" dan CLAUDE.md `<tampilan>` di `plan/AUDIT-TAMPILAN.md` bagian 6, belum diubah.
- ADR 7 (keputusan 240): RLS sebagai pagar kedua dipasang di tabel ledger Tahap 2, tidak di tabel v1 `api-t1` (rekaman `b5-rls` bagian 5: policy pemilik membuat bayar ke warung `UPDATE 0`). Kalau RLS harus sudah berjalan di Tahap 1, perlu tugas lab `api-t1` sendiri.
- Cloudflare Pages (keputusan 115): butuh API token (Account > Cloudflare Pages > Edit) dan Account ID, lalu `gh secret set CLOUDFLARE_API_TOKEN` dan `gh secret set CLOUDFLARE_ACCOUNT_ID`.

## Sedang dikerjakan

2026-10-10 · 1.30-lab selesai di PR (keputusan 241), branch `tahap-1/m6-lab`, belum di-merge: bagian `m6` di `labs/api-t1/run.py` (`V2_UBAH`, `Prober`, `rekam_m6`), rekaman `labs/api-t1/output/m6.txt`, README "Rekaman deploy M6"; perbaikan review: bagian G (jalan kembali), komentar migrate 000006, README tanpa `scp`. Rekam ulang: `make -C labs/api-t1 run BAGIAN=m6`. Berikutnya: `python3 tools/antrean.py berikut` (1.30).

## Pelajaran

- ADR 7: policy RLS yang menyaring `UPDATE` membuat kredit ke baris orang lain jadi `UPDATE 0` tanpa error (`b5-rls` bagian 5); RLS di Rekeningo hanya untuk baca, di tabel ledger Tahap 2.
- Konteks awal tiap iterasi loop 94–103k token, puncak 127–209k; 46% token yang diproses berasal dari panggilan dengan konteks > 150k. Penyumbang hasil alat terbesar: gambar (22%), grep (17%), PROTOKOL dibaca ulang (10%), `tail` KEPUTUSAN (baris ribuan karakter).
- Retrospektif I4–1.28: halaman lama yang ditulis ulang membawa data lab lama yang bertentangan dengan naskah (JWT 15 menit di B5.1, ID teks `budi`/`ani` di b5-rls); cocokkan rekaman lama dengan skema v1 dan ADR naskah sebelum dipakai ulang. Satu rekaman khusus per halaman (`authz.txt`) lebih jelas daripada potongan dari lima file rekaman.
- Lab SQL yang di-pipe ke `grep` kehilangan exit status psql; tambahkan pemeriksaan hasil di Makefile (pola `labs/b5-rls/Makefile`).
- OWASP API Security pindah ke `api-security.owasp.org` (308 dari `owasp.org/API-Security/...`); link baru memakai alamat baru.
- Retrospektif K0e–I3: alat ukur kecil (ukur-gerak, ukur-ilustrasi, ukur-judul) menangkap yang tidak terlihat di tangkapan. Pola: ukur dulu, perbaiki, ukur ulang, masukkan alat ke gerbang.
- Motion `reducedMotion="user"` hanya mematikan transform dan layout; ukur frame pertama sesudah klik.
- Route baru di `src/pages/` atau `import()` lazy mengubah chunk bersama Vite: semua halaman berganti hash; bandingkan sidik `tmp/sidik_dist.py`.
- Perubahan CSS global di atas Inti menggeser layar pertama semua halaman; simpan keluaran `layar.mjs` sebelum dan bandingkan sesudahnya (`tmp/banding_layar.py`).
- Setelah gerbang lolos, perubahan teks apa pun wajib diikuti `python3 tools/sinkron_cerita.py` dan gerbang ulang (CI #119 gagal karena `kartu.json` tertinggal).
- `git rm` langsung men-stage penghapusan; `git add <file baru> && git commit` ikut membawanya. Hapus file lama di commit yang sama dengan perubahan registry, supaya setiap commit tetap bisa dibangun.
- Widget lama alur diuji tanpa melihat gambar: `node situs/tangkapan/uji-alur.mjs <url>` (tangkapan/ di-.gitignore, jadi skrip ditulis ulang bila hilang) menekan tebakan, Berikutnya, dan varian, lalu menghitung error konsol.
- Merge ditolak pengaman: berhenti, laporkan di baris pertama, jangan memulai halaman berikutnya di atas PR yang belum di-merge.
- Mode dontAsk/auto menolak: perintah majemuk dengan `cd`, heredoc, loop shell, awalan env (`AXE=...`), diff `<(...)`, pipa ke `gzip`/`wc`, mengubah `.claude/settings.json`; pakai skrip di `tmp/` dan path relatif.
- Ukur konteks sesi pengatur 1.28 (tools/ukur_konteks.py pada transcript subagen): awal 65–66k (loop lama 94–101k), puncak pelaksana 279k, 24,9 juta token diproses, 86% di atas 150k; peninjau 98–176k. Pelaksana wajib serah-terima di ±120k (PROTOKOL k.4).
- Animasi CSS yang dipicu event `toggle` (async) mulai satu sampai dua frame sesudah `<details>` terbuka: isi penuh sempat berkedip. Ukur frame per rAF sesudah klik sungguhan (`page.click`, bukan `el.click()`, yang tidak mengirim pointerdown).
