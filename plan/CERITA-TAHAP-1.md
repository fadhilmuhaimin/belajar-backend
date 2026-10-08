# Cerita Rekeningo · Tahap 1 penuh dan garis besar eskalasi

Oct 8, 2026 · @Fadhil Muhaimin

## Kenapa dokumen ini ada

Fase 1 yang baru selesai memindahkan 60 halaman lama ke Astro tanpa mengubah isinya. Itu sesuai rencana migrasi di PROPOSAL, dan rencana itu keliru urutannya: pembaca tidak melihat konsep baru sama sekali. Mulai sekarang urutannya dibalik. **Konten dulu, satu tahap sampai tuntas**, dengan semua yang disepakati: cerita yang utuh, satu halaman per keputusan, tim, infra, keamanan, lima blok lipat, beranda satu layar. Tahap 2 baru dimulai setelah Tahap 1 selesai dan kamu lihat sendiri.

Dokumen ini adalah naskah Tahap 1 dan garis besar eskalasi sampai Tahap 6. Ia menggantikan `plan/STORY.md` untuk Tahap 1. Halaman situs ditulis dari naskah ini, bukan sebaliknya.

## Latar: perusahaan dan tugas awal

**Grup Lestari** (fiktif) adalah perusahaan dengan kantor pusat berupa kampus tiga gedung di pinggir kota: ±1.200 karyawan, satu kantin bersama, dan belasan warung tenant di lantai dasar. Karyawan menerima tunjangan makan Rp50.000 per hari kerja, dibayar tunai lewat kasir tiap Senin pagi. Divisi Keuangan merekonsiliasi kuitansi warung setiap akhir bulan dengan tangan.

**Raka** adalah mobile engineer di Divisi TI, tiga tahun membuat app internal (absensi, cuti) dengan Flutter di atas backend yang dibuat tim lain. **Sinta** adalah product manager di unit Inisiatif Digital. Awal tahun, Sinta mendapat mandat kecil dari direksi: hilangkan antrean kasir hari Senin dan rekonsiliasi manual. Ia menulis PRD, dan Raka ditugaskan sendirian karena tim backend sedang sibuk dengan sistem ERP.

Nama produknya **Rekeningo**: dompet internal untuk tunjangan makan. Tidak ada yang berencana membuatnya jadi produk publik. Itu terjadi belakangan, satu PRD demi satu PRD.

**Skala yang akan dilalui cerita.**

| Tahap | Lingkup | Siapa pemakainya | Siapa yang membuat |
| --- | --- | --- | --- |
| 1 | Uji coba internal, satu gedung | 100 karyawan Gedung A, 3 warung | Raka sendiri |
| 2 | Seluruh kampus pusat | 1.000 karyawan, 12 warung, Keuangan | Raka + 1 engineer |
| 3 | Semua kantor cabang Lestari dan tenant mitra | 10.000 karyawan di 6 kota | 4 orang: mobile, web, 2 backend |
| 4 | Dibuka ke publik sebagai uang elektronik (entitas baru, PT Rekeningo) | 100.000 user, merchant di luar kampus, gateway pembayaran | 3 tim |
| 5 | Nasional | 1 juta user, ratusan ribu merchant | 5–7 tim + platform, SRE, security |
| 6 (proyeksi) | Regional, beberapa negara | 10 juta user, multi-mata uang, aturan per negara | 10+ tim |

**Aturan dunia yang tidak pernah dilanggar.**

1. Semua nama, perusahaan, nomor, dan data fiktif. Tidak ada merek nyata, dan tidak ada klaim kepatuhan regulasi.
2. Setiap tahap dimulai dari PRD, bukan dari teknologi. Fitur dulu, lalu pekerjaan teknis, lalu masalah yang muncul dari pekerjaan itu, baru konsepnya.
3. Setiap masalah muncul sebagai sesuatu yang dilihat orang: layar HP, laporan Keuangan, buku warung. Bukan dari log server.
4. Keputusan diambil tokoh dengan alasan yang bisa salah. Cerita menunjukkan akibatnya, tidak menceramahi.
5. Angka beban kecil di awal dan dihitung terbuka. Puncak Tahap 1: 0,14 request per detik.
6. Penyerang tidak jahat secara kartun. Di Tahap 1 ia karyawan yang penasaran.

**Nada.** Seperti dokumen kerja yang dibaca engineer: PRD, catatan keputusan, dan potongan kejadian yang pendek dan konkret. Bukan novel.

## Tokoh

Lima tokoh. Tiga sudah ada, satu diperluas, satu baru. Setiap tokoh punya satu keinginan dan satu kelemahan, supaya keputusan mereka terasa manusiawi.

| Tokoh | Siapa | Ingin | Kelemahan | Yang dibawanya ke cerita |
| --- | --- | --- | --- | --- |
| **Raka** | Mobile engineer Divisi TI, tiga tahun Flutter, pertama kali memegang backend. Bekerja sendiri dengan bantuan AI. | Menyelesaikan tugas dengan benar dan tidak dipanggil Keuangan | Terlalu cepat percaya kode yang "kelihatannya jalan", termasuk dari AI | Sudut pandang pembaca. Setiap konsep masuk lewat pekerjaan dan kesalahannya. |
| **Sinta** | Product manager unit Inisiatif Digital. Penulis PRD. | Mandat kecilnya berhasil, lalu mandat yang lebih besar | Menambah fitur ke PRD lebih cepat daripada Raka sanggup, dan tidak tahu mana yang berbahaya | PRD tiap tahap, prioritas, dan tekanan skala. |
| **Budi** | Staf Gedung A, makan siang di warung Ani tiap hari. Penguji pertama. | Tidak antre di kasir hari Senin | Menekan tombol dua kali kalau lambat | Semua bug yang terlihat user. |
| **Ani** | Pemilik warung tenant di lantai dasar. Mencatat semua di buku tulis. | Dibayar tepat dan tahu persis uangnya hari ini | Sinyal di warungnya buruk; tidak percaya angka yang beda dengan bukunya | Sisi merchant dan pengecek kebenaran data paling teliti. |
| **Pak Hadi** | Kepala Divisi Keuangan. | Setiap rupiah tertelusur; tutup buku bulanan selesai sehari | Menolak apa pun yang tidak bisa diaudit | Syarat "setiap rupiah tertelusur" di PRD: benih ledger dan audit log. |
| **Dimas** ("yang mencoba") | Staf TI junior Gedung C. Penasaran, bukan jahat. Tahap 4 ke atas peran ini diambil pihak tak dikenal. | Tahu cara kerjanya | Tidak memikirkan akibat | Setiap adegan keamanan. |

Tokoh pendukung muncul sesuai tahap: engineer kedua (Tahap 2), tim web dan DevOps (Tahap 3), security reviewer (Tahap 4), platform team (Tahap 5–6). Mereka diberi nama saat muncul, tidak sebelumnya.

## Eskalasi: satu PRD demi satu PRD

Setiap tahap dibuka oleh PRD baru dari Sinta, bukan oleh teknologi. PRD menambah lingkup dan fitur; fitur menuntut pekerjaan teknis; pekerjaan itu memunculkan masalah yang pelan-pelan terlihat; masalah itulah yang melahirkan konsep. Di akhir tiap tahap ada bagian "Sengaja belum dilakukan", dan yang ditunda itulah yang pecah di PRD berikutnya.

&#91;embedded content: garis besar eskalasi · 6 tahap, pemicu dan konsep\]

| Tahap | PRD | Fitur baru yang diminta | Pekerjaan teknis yang dituntut | Masalah yang muncul pelan-pelan | Yang ditunda, dan pecah di tahap berikutnya |
| --- | --- | --- | --- | --- | --- |
| 1 | v1 · Tunjangan makan tanpa tunai, Gedung A | Top-up oleh admin, bayar ke warung, saldo dan riwayat, laporan harian warung | Backend sendiri, model data uang, API, auth, deploy | Transfer setengah jadi, saldo orang lain terlihat, deploy mematikan app | Dua request bersamaan; retry dari app |
| 2 | v2 · Seluruh kampus, transfer antar karyawan, tutup buku otomatis untuk Keuangan | Transfer P2P, ekspor laporan bulanan, pencairan warung terjadwal | Ledger double-entry (syarat Pak Hadi), idempotency key, index, lock; engineer kedua masuk | Dobel tarik, dobel bayar, riwayat lambat, dua orang di satu repo | Pekerjaan lambat di dalam request; cache |
| 3 | v3 · Semua cabang Lestari dan tenant mitra, 6 kota | Notifikasi push, katalog warung, dashboard web merchant, promo dari HR, mode offline warung | Redis, worker, observability, staging, CI penuh; tim 4 orang | Pool habis jam makan siang, katalog dibaca ribuan kali, stok hilang saat offline, login dicoba ribuan kali | Batas antar modul; pihak ketiga |
| 4 | v4 · Spin-off jadi PT Rekeningo, uang elektronik publik | Top-up dari bank lewat gateway, verifikasi identitas, QR di merchant luar, kartu virtual, back office risk | Modular monolith, service pembayaran, gateway, object storage, secret manager, security review; 3 tim | Webhook ganda, gateway lambat, tim bentrok, data pribadi, serangan dari luar | Memecah service; satu database |
| 5 | v5 · Nasional, merchant massal, cicilan dan tabungan | Laporan merchant real-time, notifikasi massal, cicilan batch, API publik untuk POS | Service terpisah, read replica, event streaming, k8s, KMS, WAF; platform, SRE, security | Laporan mengganggu transaksi, fan-out 1 juta, biaya cloud, DDoS | Platform sebagai produk; multi-region |
| 6 | v6 (proyeksi) · Regional, 3 negara | Multi-mata uang, aturan per negara, mitra lokal | Multi-region, data residency, tim per negara, IDP | Koordinasi 10+ tim, biaya, kepatuhan per negara (disebut, tidak diklaim) | Dibiarkan terbuka |

Tahap 1 ditulis penuh di bawah dengan urutan PRD → fitur → teknis → masalah → konsep. Tahap 2–6 akan mengikuti pola yang sama, masing-masing setelah tahap sebelumnya selesai dibangun.

## Tahap 1 · Dari PRD ke konsep

Urutan baca Tahap 1 mengikuti cara produk sungguhan dibuat: **PRD → fitur → pekerjaan teknis → masalah → konsep**. Pembaca melihat dulu apa yang diminta dan kenapa, baru melihat teknologinya muncul sebagai jawaban.

### 1. PRD v1 · Rekeningo untuk Gedung A

Ini dokumen yang ditulis Sinta dan disetujui Pak Hadi. Di situs, PRD ini ditampilkan utuh sebagai halaman pertama Tahap 1, dengan bagian yang bisa dibuka satu per satu.

**Latar masalah.** Setiap Senin 1.200 karyawan mengantre di kasir untuk tunjangan makan Rp250.000 per minggu (Rp50.000 × 5 hari). Kasir butuh 3 jam. Warung tenant memberi kuitansi kertas; Keuangan butuh 4 hari kerja tiap bulan untuk mencocokkan kuitansi dengan tunjangan yang dibayar. Tahun lalu selisihnya Rp38 juta yang tidak bisa dijelaskan.

**Tujuan.** (1) Hilangkan antrean kasir. (2) Rekonsiliasi bulanan selesai dalam satu hari, tanpa kertas. (3) Setiap rupiah tunjangan bisa ditelusuri dari Keuangan sampai warung.

**Pengguna.**

| Pengguna | Kebutuhan | Yang membuatnya berhenti memakai |
| --- | --- | --- |
| Karyawan (Budi) | Bayar makan dalam 5 detik; tahu sisa saldo | Antre lebih lama dari tunai; saldo salah sekali saja |
| Warung tenant (Ani) | Terima bayaran tanpa uang receh; tahu total hari ini | Angka beda dengan bukunya; sinyal buruk membuat gagal |
| Admin tunjangan (staf Keuangan) | Isi saldo 100 orang sekali klik tiap Senin | Harus isi satu per satu |
| Keuangan (Pak Hadi) | Laporan bulanan yang cocok sampai rupiah terakhir | Ada angka yang tidak bisa dijelaskan |

**Ruang lingkup uji coba (Gedung A, 100 karyawan, 3 warung, 6 minggu).**

| Prioritas | Fitur | Keterangan |
| --- | --- | --- |
| P0 | Top-up tunjangan oleh admin | Admin mengunggah daftar nama dan nominal; saldo masuk ke 100 akun |
| P0 | Bayar ke warung | Karyawan memilih warung, memasukkan nominal, konfirmasi; warung melihat pembayaran masuk |
| P0 | Saldo dan riwayat | Saldo saat ini dan daftar transaksi per akun |
| P0 | Login karyawan | Memakai email kantor dan password sementara dari admin |
| P1 | Laporan harian warung | Total per hari dan daftar transaksi, di HP warung |
| P1 | Pencairan ke warung | Admin membayar warung dari rekap, di luar sistem, seminggu sekali |
| P2 | Transfer antar karyawan | Patungan makan siang. Diminta Budi, ditunda ke v2 |

**Bukan lingkup v1.** Integrasi bank, kartu, pemakai di luar Lestari, aplikasi web untuk warung, notifikasi push, promo.

**Metrik keberhasilan.** ≥ 80 dari 100 penguji membayar lewat Rekeningo ≥ 3 kali per minggu; rekonsiliasi uji coba selesai < 1 hari; 0 selisih yang tidak bisa dijelaskan.

**Batasan.** Satu engineer (Raka) selama 6 minggu; data karyawan dari sistem HR dalam bentuk CSV; server: satu VPS milik Divisi TI; aturan Pak Hadi: "tidak ada angka yang berubah tanpa catatan siapa, kapan, kenapa".

**Risiko yang ditulis Sinta.** Karyawan tetap memakai tunai; warung dengan sinyal buruk; Raka belum pernah membuat backend.

**Pertanyaan terbuka di PRD.** Apa yang terjadi kalau pembayaran gagal di tengah? Siapa yang memperbaiki saldo yang salah, dan bagaimana? Kedua pertanyaan ini tidak dijawab di PRD, dan keduanya jadi masalah terbesar Tahap 1.

### 2. Dari fitur ke pekerjaan teknis

Raka membaca PRD dan menurunkannya jadi pekerjaan. Tabel ini adalah halaman kedua Tahap 1 dan menjawab pertanyaan pembaca pemula: "dari fitur sebesar ini, apa saja yang harus saya buat?"

| Fitur | Yang harus ada di app | Yang harus ada di backend | Yang harus ada di database | Konsep yang akan dibutuhkan |
| --- | --- | --- | --- | --- |
| Login karyawan | Layar login, simpan sesi | Verifikasi password, buat sesi, cek sesi di tiap request | Tabel `akun` dengan hash password, tabel `sesi` | Authentication; cara menyimpan token di app |
| Top-up oleh admin | Tidak ada (admin memakai skrip/CSV di v1) | Endpoint unggah CSV, validasi nama dan nominal, isi saldo 100 akun dalam satu operasi | Tabel `akun.saldo`; catatan top-up | Transaction (100 baris sekaligus); validasi; catatan "siapa, kapan, kenapa" |
| Bayar ke warung | Pilih warung, nominal, konfirmasi, hasil | Endpoint bayar: cek saldo, kurangi, tambah ke warung, catat | Tabel `transaksi`; constraint saldo ≥ 0 | Transaction; validation; format error; **pertukaran saldo** sebagai dua perubahan yang harus terjadi bersama |
| Saldo dan riwayat | Dua layar | Endpoint baca saldo dan daftar transaksi milik akun yang login | Index pada `transaksi(akun, waktu)` | Authorization (hanya akun sendiri); pagination (nanti) |
| Laporan harian warung | Layar total dan daftar | Endpoint agregasi per warung per hari | Query `SUM` + `GROUP BY` | Query dan index; perbedaan baca vs tulis |
| Pencairan warung | Tidak ada | Rekap mingguan yang diekspor admin | Query agregasi | Rekonsiliasi (benih Tahap 2) |
| Semua fitur | Satu format error yang bisa ditampilkan | Satu format error; satu kontrak API | Skema yang sama di laptop dan server | Kontrak OpenAPI; migration; deployment |

Dari tabel ini lahir keputusan pertama, sebelum satu baris kode pun: **backend sendiri atau BaaS**. Raka membandingkan Supabase (RLS + fungsi SQL), Firebase (security rules), dan Go + PostgreSQL untuk satu fitur saja: bayar ke warung. Pertanyaan penentunya: *siapa yang boleh mengubah angka saldo?* Jawabannya harus "hanya backend", dan aturan Pak Hadi ("setiap perubahan ada catatannya") paling mudah dijamin di satu tempat yang Raka kendalikan. ADR 1 ditulis. Supabase tetap ditunjukkan di "Di stack lain" sebagai jalan yang sah.

Keputusan kedua: **struktur folder** `handler/` (HTTP), `service/` (aturan uang), `repo/` (SQL). Alasannya sederhana dan disebut jujur: supaya aturan uang tidak tercecer di mana-mana saat PRD v2 datang.

### 3. Pertukaran saldo: inti teknis Tahap 1

Satu halaman khusus sebelum masalah apa pun muncul, karena ini jantung seluruh cerita. "Bayar Rp25.000 ke warung Ani" berarti dua perubahan: saldo Budi berkurang Rp25.000, saldo Ani bertambah Rp25.000, plus satu baris catatan. Tiga hal yang harus selalu benar:

1. Ketiganya terjadi semua, atau tidak sama sekali.
2. Saldo Budi tidak boleh negatif setelahnya.
3. Jumlah total uang di sistem tidak berubah: yang berkurang di satu sisi sama persis dengan yang bertambah di sisi lain.

Di v1 Raka memodelkannya sebagai kolom `saldo` yang di-UPDATE dua kali plus satu `INSERT` ke `transaksi`. Ini cukup untuk Tahap 1, dan halaman ini sudah menanam pertanyaan Pak Hadi yang baru terjawab di Tahap 2: "kalau angka saldo salah, dari baris mana saya tahu kenapa?"

**Yang pembaca lakukan.** Widget runsql: jalankan tiga perintah satu per satu, lihat saldo berubah; lalu widget "jumlah total": hitung `SUM(saldo)` sebelum dan sesudah, dan lihat angkanya sama. Ini jadi ukuran yang dipakai di semua masalah berikutnya.

### 4. Masalah yang muncul, pelan-pelan

Delapan masalah, dalam urutan kemunculannya selama 6 minggu. Tiap masalah punya pola yang sama: **gejala** (apa yang dilihat orang) → **yang Raka kira** → **yang sebenarnya** → **konsep yang lahir** → **keputusan** → **yang pembaca lakukan**.

| # | Minggu | Gejala yang dilihat orang | Yang Raka kira | Yang sebenarnya | Konsep yang lahir | Keputusan (ADR) |
| --- | --- | --- | --- | --- | --- | --- |
| M1 | 1 | Raka menguji sendiri: bayar nominal minus Rp5.000 berhasil, saldonya bertambah | Lupa `if nominal <= 0` | Dua lapis aturan: bentuk (app + backend) dan uang (hanya backend + constraint DB) | Validation; format error; HTTP status | ADR 2: `problem+json`, 400 vs 422; constraint `saldo >= 0` di DB |
| M2 | 1 | Raka-mobile dan Raka-backend beda paham soal nama field; app mengirim `amount`, server membaca `nominal` | Salah ketik | Tidak ada kontrak tertulis | Kontrak OpenAPI; resource | ADR 3: OpenAPI sebelum kode, dengan catatan jujur "untuk satu orang ini terasa berlebihan sampai minggu 5" |
| M3 | 2 | Budi: "Error 500" saat mencari warung dengan tanda kutip. Dimas mencoba `' OR 1=1 --` dan melihat semua akun beserta saldo | Tanda kutip merusak pencarian | SQL dibangun dari string; dan response mengembalikan terlalu banyak field | **Keamanan 1: SQL injection**; lapisan dasar | ADR 4: parameterized query, linter; response hanya field yang dibutuhkan layar |
| M4 | 3 | Jumat siang, warung ramai. Budi bayar Rp70.000, layar "gagal", saldo Budi berkurang, saldo Ani tidak bertambah, Ani membuka bukunya: tidak ada. Pak Hadi: "Rp70.000 ini ke mana?" | Hapus batas saldo warung yang membuat `UPDATE` kedua gagal | Dua perubahan yang harus bersama tidak dibungkus satu unit; dan tidak ada catatan untuk menjawab Pak Hadi | **Transaction** (puncak Tahap 1); migration (constraint itu ditambah tangan di server) | ADR 5: semua yang menyentuh > 1 baris uang di satu transaction di `service/`; ADR 6: tabel `koreksi` dengan alasan, benih ledger |
| M5 | 4 | Dimas mengganti `417` jadi `418` di URL, melihat saldo Ani; menyimpan 100 saldo ke spreadsheet, mengirim ke Sinta: "ini bocor" | Pakai UUID supaya tidak bisa ditebak | Backend tidak pernah bertanya "apakah yang login ini pemilik akun 418?"; token tersimpan di tempat yang salah di app | Authentication; **Authorization**; Keamanan 2: IDOR, enumerasi, token di app | ADR 7: cek pemilik di `service/` + RLS sebagai pagar kedua; 404 bukan 403. ADR 8: sesi acak dengan masa berlaku, secure storage; JWT ditunda ke Tahap 4 dengan alasan |
| M6 | 5 | Raka mengganti nama kolom dan `scp` binary saat makan siang: app mati 5 menit; 11 HP yang belum update tetap error; tidak ada binary lama untuk kembali | Jangan deploy jam makan siang | Tanpa jalan kembali; perubahan API merusak app lama; tidak ada tes | Deployment dan rollback; testing; app versi lama; **Infra 1** (satu VPS, Compose, kenapa cukup) | ADR 9: image per commit, rollback = tag lama, CI pertama. ADR 10: field tidak pernah diganti nama, expand lalu contract |
| M7 | 5 | Raka menemukan `.env` berisi password database ikut ter-commit saat ia membuat repo | Hapus file, selesai | Riwayat git menyimpannya; password harus diganti; pre-commit hook | Keamanan 3: secret di repo | ADR 11: `.env.example`, pre-commit gitleaks, secret hanya di server |
| M8 | 6 | Uji coba lolos: 91/100 penguji aktif, rekonsiliasi 4 jam, selisih 0 (setelah koreksi Rp70.000 yang tercatat). Sinta datang dengan PRD v2: seluruh kampus, transfer antar karyawan, tutup buku otomatis | Perlu server lebih besar | Puncak beban hanya 0,14 RPS; yang belum pernah diuji: dua request bersamaan, dan apa yang terjadi saat Budi menekan Bayar dua kali | Kerangka berpikir dan estimasi; **Tim 1**: cara kerja satu orang; spesifikasi untuk AI dan review kode AI | ADR 12 "Sengaja belum dilakukan": tanpa cache, queue, service kedua, k8s |

Tiga masalah memakai mode rentan di lab `api-t1` yang direkam: M3 (injection), M5 (IDOR), M7 (gitleaks). M4 memakai `b3-stack` dan `b4-migration`. M6 memakai rekaman prober deploy.

### 5. Dari masalah ke konsep: apa yang dibawa pembaca keluar dari Tahap 1

Di akhir Tahap 1 pembaca punya satu kalimat untuk tiap konsep, dan setiap kalimat terikat ke satu kejadian:

| Konsep | Kalimat yang diingat | Kejadian |
| --- | --- | --- |
| Backend sendiri vs BaaS | Yang menentukan bukan kecepatan, tapi siapa yang boleh mengubah saldo | PRD, aturan Pak Hadi |
| Validation dua lapis | App boleh mengecek bentuk; hanya backend memutuskan uang; database menjaga pagar terakhir | M1 |
| Kontrak API | Satu orang pun butuh perjanjian dengan dirinya sendiri | M2, M6 |
| SQL injection | Jangan sambung string; parameter selalu | M3 |
| Transaction | Dua perubahan uang terjadi bersama, atau tidak sama sekali | M4 |
| Catatan perubahan | Setiap angka yang berubah punya alasan tertulis | M4, aturan Pak Hadi |
| Authentication vs authorization | Tahu siapa kamu belum berarti tahu kamu boleh apa | M5 |
| Deployment | Pipeline adalah ingatan yang tidak gemetar | M6 |
| Secret | Riwayat git tidak pernah lupa | M7 |
| Estimasi | Hitung dulu; masalah pertama hampir selalu kebenaran data, bukan kapasitas | M8 |

### 6. Jembatan ke Tahap 2

PRD v2 ditampilkan di halaman terakhir Tahap 1 sebagai pratinjau: lingkup seluruh kampus, fitur transfer antar karyawan, dan syarat baru Pak Hadi: "tutup buku bulanan harus bisa dibuktikan dari data, bukan dari rekap". Pembaca diminta menebak: dari 12 ADR Tahap 1, mana yang akan dibuka lagi? Jawabannya (ADR 6, tabel koreksi, jadi ledger double-entry; ADR 5, transaction saja tidak cukup saat dua request bersamaan) dibuka di halaman pertama Tahap 2.

## Peta halaman Tahap 1 versi baru

Urutan baca Tahap 1 mengikuti enam bagian di atas. Enam jenis halaman, masing-masing dengan template sendiri. Halaman konsep lama dipakai ulang isinya, ditulis ulang pembukanya supaya menyambung ke masalah yang melahirkannya, dan dilipat ke lima blok.

| Jenis | Template | Jumlah di Tahap 1 |
| --- | --- | --- |
| **PRD** | Dokumen produk utuh, bagian bisa dibuka satu per satu; di akhir "pertanyaan terbuka" yang jadi masalah nanti | 1 (+1 pratinjau v2) |
| **Fitur → teknis** | Tabel fitur ke pekerjaan, lalu halaman per fitur: layar app, endpoint, tabel, dan konsep yang akan dibutuhkan | 1 + 5 |
| **Masalah** | Gejala → yang Raka kira → yang sebenarnya → coba sendiri (mode rentan/benar) → konsep → ADR | 8 |
| **Konsep** | Lima blok: Mulai, Coba, Paham (Di stack lain), Putuskan, Kunci | 14 |
| **ADR** | Kebutuhan → opsi ≥ 3 → dipilih dan kenapa → wujud di kode → coba keduanya → kapan keputusan ini salah → yang merevisinya nanti | 12, digabung jadi 6 halaman |
| **Tim dan infra** | Cara kerja dan infra tahap ini dengan file nyata dari repo lab | 1 |

| # | Bagian | Halaman | Jenis | ★ | Widget | Lab |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | PRD v1: Rekeningo untuk Gedung A | PRD | ★ | – | – |
| 2 | 2 | Dari fitur ke pekerjaan teknis | Fitur → teknis | ★ | pilah (App/Backend/DB) | – |
| 3 | 2 | Apa yang dikerjakan backend | Konsep | ★ | pilah, hp | – |
| 4 | 2 | ADR 1: Backend sendiri, bukan BaaS | ADR | ★ | banding | – |
| 5 | 2 | Perjalanan satu request | Konsep | ★ | alur | – |
| 6 | 2 | Struktur folder pertama: handler, service, repo | Konsep | ★ | – | api-t1 |
| 7 | 2 | Fitur: login karyawan | Fitur → teknis | ★ | alur | api-t1 |
| 8 | 2 | Fitur: top-up oleh admin | Fitur → teknis |  | runsql | b2-model |
| 9 | 2 | Fitur: bayar ke warung | Fitur → teknis | ★ | alur, hp | api-t1 |
| 10 | 2 | Fitur: saldo, riwayat, laporan warung | Fitur → teknis |  | runsql | b2-query |
| 11 | 3 | Pertukaran saldo: tiga hal yang harus selalu benar | Konsep | ★ | runsql, jumlah-total | b3-stack |
| 12 | 3 | Data modeling dan relasi | Konsep | ★ | runsql | b2-model |
| 13 | 3 | SQL atau NoSQL (pertanyaan Sinta) | Konsep |  | banding | – |
| 14 | 4 | M1: Nominal minus lolos | Masalah | ★ | runsql | api-t1 |
| 15 | 4 | Validation dua lapis + format error + ADR 2 | Konsep + ADR | ★ | alur, hp | api-t1 |
| 16 | 4 | HTTP: method, status, header | Konsep | ★ | pilah, stackstep | api-t1 |
| 17 | 4 | M2: amount vs nominal | Masalah |  | alur | b1-openapi |
| 18 | 4 | Kontrak OpenAPI + ADR 3 | Konsep + ADR | ★ | alur | b1-openapi |
| 19 | 4 | M3: Tanda kutip di pencarian | Masalah | ★ | hp mode rentan, cari-bug | api-t1 |
| 20 | 4 | Keamanan 1: SQL injection + ADR 4 | Keamanan + ADR | ★ | cari-bug | api-t1 |
| 21 | 4 | Lapisan dasar: handler tidak tahu SQL | Konsep | ★ | pilah | api-t1 |
| 22 | 4 | M4: Rp70.000 yang hilang | Masalah | ★ | runsql | b3-stack |
| 23 | 4 | Transaction | Konsep | ★ | runsql, stackstep | b3-stack |
| 24 | 4 | ADR 5–6: Transaction di service; tabel koreksi | ADR | ★ | runsql | b3-stack |
| 25 | 4 | Migration: skema sebagai kode | Konsep | ★ | alur | b4-migration |
| 26 | 4 | M5: Angka di URL | Masalah | ★ | alur | api-t1 |
| 27 | 4 | Authentication | Konsep | ★ | alur | api-t1 |
| 28 | 4 | Authorization | Konsep | ★ | alur, pilah | api-t1, b5-rls |
| 29 | 4 | Keamanan 2: IDOR, enumerasi, token di app + ADR 7–8 | Keamanan + ADR | ★ | alur, banding | b5-rls |
| 30 | 4 | M6: Deploy hari Senin | Masalah | ★ | alur | api-t1 |
| 31 | 4 | Deployment dan rollback + ADR 9 | Konsep + ADR | ★ | alur | api-t1 |
| 32 | 4 | Testing: apa dites di level mana | Konsep | ★ | pilah, stackstep | api-t1 |
| 33 | 4 | App versi lama + ADR 10 | Konsep + ADR | ★ | alur | api-t1 |
| 34 | 4 | M7: `.env` di repo | Masalah |  | – | api-t1 |
| 35 | 4 | Keamanan 3: secret + ADR 11 | Keamanan + ADR | ★ | – | api-t1 |
| 36 | 4 | Tim dan infra Tahap 1: satu orang, satu VPS, CI pertama | Tim dan infra | ★ | alur | api-t1 |
| 37 | 4 | M8: Uji coba lolos, PRD v2 datang | Masalah | ★ | kalkulator | – |
| 38 | 4 | Kerangka berpikir dan estimasi | Konsep | ★ | kalkulator | – |
| 39 | 4 | Spesifikasi untuk AI dan review kode AI | Konsep | ★ | banding, pilah | f2-review |
| 40 | 4 | ADR 12: Sengaja belum dilakukan | ADR | ★ | – | – |
| 41 | 5 | Yang dibawa keluar dari Tahap 1 (10 kalimat + Cek diri gabungan) | Konsep | ★ | kartu | – |
| 42 | 6 | Jembatan: pratinjau PRD v2 | PRD | ★ | tebak | – |

Jalur per peran memangkasnya: Mobile menonjolkan 5, 7, 9, 15, 18, 27, 29, 33; Security 19, 20, 26, 29, 34, 35; DevOps 6, 25, 30, 31, 36; Backend hampir semua.

Widget baru yang dibutuhkan: **cari-bug** (menandai baris di kode), **jumlah-total** (SUM sebelum/sesudah), **kalkulator** estimasi, dan **tebak** (pilih jawaban, lihat alasan). Semuanya kecil dan jadi widget React pertama. Ilustrasi: 1 untuk latar perusahaan, 1 per masalah M3–M6 (empat adegan yang dilihat orang).

## Instruksi untuk Claude Code

Tempel ke Claude Code setelah naskah ini disimpan sebagai `plan/CERITA-TAHAP-1.md`:

```text
Urutan kerja berubah. Baca plan/CERITA-TAHAP-1.md. Mulai sekarang: konten dulu, satu tahap sampai tuntas. Urutan isi mengikuti naskah: PRD → fitur ke teknis → pertukaran saldo → masalah → konsep → ADR. Catat sebagai keputusan baru di KEPUTUSAN dan tambahkan satu paragraf di PROPOSAL bagian "Rencana migrasi" (jangan hapus yang lama). Ganti "Belajar Backend" di PROPOSAL tidak perlu.

Sebelum konten: hapus MkDocs (satu PR per penghapusan), pindahkan audit bahasa, sinkron registry, cek ID ke situs/. Lalu Cloudflare Pages dengan preview per PR.

Lalu bangun Tahap 1 versi baru di situs/ sesuai "Peta halaman Tahap 1 versi baru", dari halaman 1:
1. Enam template halaman (PRD, Fitur→teknis, Masalah, Konsep lima blok, ADR, Tim-infra) sebagai layout Astro; lima blok lipat dan tombol Berikutnya di tiap blok; registry mendapat field jenis, bagian, peran.
2. Beranda satu layar sesuai PROPOSAL "Desain visual final"; kartu pintu pertama adalah "Mulai dari PRD".
3. Pemilih peran dan breadcrumb versi baru.
4. Halaman 1 sampai 42, satu PR per halaman, mengikuti naskah. Halaman lama dipakai ulang isinya. Ilustrasi dengan token gelap/terang.
5. Widget React pertama: cari-bug, jumlah-total, kalkulator, tebak. ADR dependency React/TypeScript/Zod/Vitest sebelum baris pertama.
6. Lab api-t1 mendapat mode rentan untuk M3, M5, M7 yang direkam.
Halaman Tahap 2 ke atas tetap ada sampai gilirannya; sidebar menandainya "versi lama".
Setelah halaman 42 selesai dan tangkapan layar dilihat sendiri, berhenti dan laporkan. Tahap 2 menunggu naskahnya.
```
