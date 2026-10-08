# Proposal revisi total · Belajar Backend → Ekosistem Rekeningo

Oct 8, 2026 · @Fadhil Muhaimin

## Ringkasan

Usulan utamanya: ubah Belajar Backend dari *panduan konsep* menjadi *ekosistem Rekeningo*, yaitu satu perusahaan fiktif yang tumbuh dari 1 developer sampai banyak tim, dan setiap keputusan teknisnya dicatat lengkap: kebutuhan fitur yang memicunya, alternatif yang ditolak, kode yang dijalankan, dan latihan hands-on yang bisa dicoba di browser.

Tulang punggung lama tetap dipakai: cerita lima tahap, label kejujuran, kode dari lab, dan pola prediksi → lihat → ubah satu hal. Yang ditambah ada lima dimensi: **tim dan peran** (mobile, web dashboard, backend, DevOps, security), **infrastruktur** (dari hosting statis ke VPS, cloud, on-prem, Kubernetes), **struktur kode** (clean architecture per stack), **keamanan bertingkat** (dari SQL injection sampai enkripsi untuk transaksi ratusan miliar rupiah), dan **AI/MCP** yang gratis.

Secara teknis: pindah ke Astro + Starlight dengan widget React + TypeScript, PGlite untuk PostgreSQL di browser, lab yang jalan dengan satu perintah di mesin siapa pun yang clone repo, dan MCP server kecil sebagai produk AI pertama. Tanpa akun, tanpa server wajib. Migrasi dilakukan dalam lima fase, dan situs harus tetap bisa dibangun di setiap fase. Dua fakta dari riset mempertegas urgensinya: Material for MkDocs masuk maintenance mode sejak November 2025 dengan dukungan 12 bulan, dan Oracle memangkas free tier ARM jadi separuh sejak Juni 2026.

Dokumen ini direvisi setelah jawabanmu dan riset web (Oktober 2026). Klaim yang bersumber diberi tautan; yang belum bisa dicek ke sumber primer diberi label \[perlu verifikasi\]. Bagian terakhir berisi sisa pertanyaan yang belum kamu jawab.

## Keputusan final

Ini yang saya putuskan untuk kamu. Setiap baris adalah pilihan tunggal, bukan daftar opsi; alasannya ada di bagian yang dirujuk. Kalau kamu tidak setuju pada satu baris, ganti baris itu saja; sisanya tetap berlaku.

| Area | Keputusan | Alasan singkat | Bagian |
| --- | --- | --- | --- |
| Generator situs | **Astro + Starlight** | Material for MkDocs berakhir dukungannya ±Nov 2026; Astro memberi island React tanpa mengunci seluruh situs | Tech stack |
| Widget | **React 19 + TypeScript**, logika murni di `.ts`, data JSON divalidasi Zod | Kamu sudah nyaman React | Tech stack |
| SQL di browser | **PGlite** menggantikan sql.js; demo race dua koneksi tetap replay rekaman | PGlite 0.4 belum multi-connection sungguhan | Tren |
| Hosting situs | **Cloudflare Pages** lewat GitHub Actions; tidak ada server wajib | Gratis, statis, cukup | Tech stack |
| Progres pembaca | **localStorage** + ekspor/impor JSON; tanpa akun | Keputusan kamu | Tech stack |
| Hands-on | **Jalur A (browser) + Jalur B (`make lab` dan Dev Container)**; terminal di VPS ditunda | Belum ada server; Oracle free tier dipangkas | Hands-on |
| Stack pembanding keenam | **Dart server (Serverpod)** menggantikan Spring; Spring tetap disebut di kamus lintas stack tanpa kolom kode | Audiens Flutter; roadmap Dart 2026 mendorong full-stack Dart; menghapus kolom "tidak dijalankan" | Tren |
| Web dashboard | **Dibuat sebagai lab** (HTML + HTMX atau React kecil + Go) supaya XSS/CSRF/RBAC bisa direkam | Tanpa ini separuh peta ancaman tidak punya rekaman | Ancaman |
| Tokoh penyerang | **Satu tokoh tanpa nama**, "Pihak yang mencoba" | Adegan tetap konkret, tanpa menuduh | Keamanan |
| Ilustrasi | **Satu ilustrasi adegan per tahap** (Tahap 3–6), dibuat di fase 3 dengan skrip Python yang sudah ada | Tahap 1–2 sudah membuktikan manfaatnya | Pengalaman belajar |
| AI | **MCP server Belajar Backend** di fase 4, dijalankan pembaca di mesin sendiri; tutor di situs tidak dibuat | Nol biaya, selaras dengan "konten adalah sumber kebenaran" | Lima dimensi |
| Model uang | **Ledger double-entry append-only** mulai Tahap 2, menggantikan kolom saldo yang di-UPDATE | Ini teknik standar fintech yang sekarang belum ada di panduan; lihat Teknik terbaru | Teknik terbaru |
| Cerita | **Enam tahap**: Tahap 6 ditambah sebagai proyeksi 50+ developer, ditulis konseptual tanpa lab penuh | Permintaan kamu | System design |
| Kasus Amazon Prime Video | **Jadi studi kasus resmi** di Tahap 5, dengan sumber arsip blog Prime Video | Permintaan kamu | System design |
| Arsitektur Flutter | **Feature-first + MVVM sesuai panduan resmi Flutter**, Riverpod 3, go\_router; tumbuh dari 1 paket ke multi-package di Tahap 4 | Sumber primer flutter.dev | Clean architecture |
| CI/CD | **GitHub Actions** untuk situs, backend, dan Flutter (fastlane + Firebase App Distribution); GitOps (Argo CD) baru di Tahap 5; Jenkins hanya disebut | Standar yang paling mungkin ditemui audiens | CI/CD |
| Keamanan | **Bertingkat sampai Tahap 4 direkam**; Tahap 5–6 konseptual dengan label \[perlu verifikasi\] sampai ada reviewer | Keputusan kamu | Keamanan |
| Bahasa | **Terjemahan browser** + `translate="no"` pada istilah; glosarium jadi halaman per istilah | Keputusan kamu | Pengalaman belajar |
| Urutan kerja | **Fase 0 → 1 → 2 → 3 (per tahap cerita, Tahap 1 sampai 6) → 4** | Situs tetap bisa dibangun di tiap gerbang | Rencana migrasi |

Tiga keputusan tambahan setelah persetujuanmu:

| Area | Keputusan | Alasan singkat | Bagian |
| --- | --- | --- | --- |
| Model uang (disetujui) | **Ledger double-entry sejak Tahap 2**; lab `b3-stack`, `b3-race`, dan widget race ditulis ulang sebagai pekerjaan pertama fase 3 | Fondasi diganti sekarang lebih murah daripada nanti | Teknik terbaru |
| Tampilan | **Gelap sebagai default, gaya Medium**: latar hampir hitam, teks off-white, judul putih, tipografi besar dan jelas; mode terang tetap ada satu klik | Seleramu; riset NN/g menyarankan mode terang tetap tersedia untuk bacaan panjang | Desain visual final |
| Navigasi | **Tiga cara masuk yang selalu terlihat**: cerita (urut), peran (jalur), masalah (indeks); satu sidebar, breadcrumb "Kamu di sini", tombol Berikutnya yang besar | UX belajar: pembaca selalu tahu di mana, dari mana, ke mana | Desain visual final |

## Cara membaca dokumen ini

Setiap pernyataan di sini masuk salah satu dari tiga jenis, mengikuti aturan brief kamu.

| Jenis | Artinya | Tanda |
| --- | --- | --- |
| Fakta | Diambil dari brief, screenshot, atau pengetahuan umum yang stabil | Tanpa tanda |
| Asumsi | Tebakan saya tentang audiens, kapasitas kerja, atau prioritas kamu | Diawali "Asumsi:" |
| Rekomendasi | Pilihan yang saya usulkan, selalu dengan alternatif | Diawali "Rekomendasi:" |
| Belum dicek | Klaim tentang versi, harga, atau status tools yang perlu kamu cek ke dokumentasi resmi | \[perlu verifikasi\] |

Tiga asumsi dasar yang dipakai di seluruh dokumen:

1. Fakta (jawabanmu): pengerjaan langsung penuh waktu, satu orang dibantu AI. Fase 3 dikerjakan per tahap cerita, bukan per dimensi.
2. Fakta: belum ada server. Semua harus jalan di Mac kamu dulu, dan siapa pun yang clone repo bisa menjalankannya. Hosting diputuskan belakangan.
3. Fakta: tanpa registrasi dan tanpa akun. Progres tetap di `localStorage`.
4. Fakta: widget memakai React karena kamu sudah nyaman.
5. Fakta: keamanan dibahas bertingkat sampai Tahap 4 dulu; Tahap 5 ditulis dengan label \[perlu verifikasi\] sampai ada reviewer.
6. Fakta: bahasa lain memakai terjemahan bawaan browser; situs cukup ramah untuk itu (HTML bersih, tanpa teks di dalam gambar). Glosarium jadi halaman mendalam per istilah.
7. Asumsi: audiens tetap mobile engineer Indonesia, tapi materi diperluas sampai cukup dalam untuk backend, web, DevOps, dan security.

## Visi: Rekeningo sebagai organisasi yang tumbuh

Rekomendasi: cerita tidak lagi hanya "aplikasi yang tumbuh", tapi "perusahaan yang tumbuh". Yang berubah bukan cuma arsitektur, tapi juga jumlah orang, cara kerja, dan siapa memutuskan apa.

| Tahap | User | Tim Rekeningo | Yang baru di tahap ini | Keputusan besar yang dicatat |
| --- | --- | --- | --- | --- |
| 1 | 1–100 | Raka sendirian | Monolith, PostgreSQL, hosting statis + satu VPS | BaaS atau backend sendiri; struktur folder pertama |
| 2 | 100–1.000 | Raka + 1 backend | Dashboard web untuk Ani (admin merchant), CI pertama | Siapa pegang API contract; branch dan review |
| 3 | 1.000–10.000 | 4 orang: mobile, web, 2 backend | Redis, worker, observability, staging | Pisah deploy app dan backend; on-call pertama |
| 4 | 10rb–100rb | 3 tim: Pembayaran, Merchant, Platform | DevOps masuk, security review, modular monolith | Pecah service pembayaran; IP statis; audit log |
| 5 | 100rb–1jt+ | 5+ tim + security + SRE | Kubernetes, read replica, event streaming, HSM/KMS | Microservices atau tetap modular; on-prem vs cloud untuk data sensitif |

### Satu keputusan = satu halaman ADR yang hidup

Saat ini "Di stack lain" hanya daftar. Usulannya: setiap keputusan punya halaman dengan susunan tetap, dan susunan ini jadi unit utama situs.

1. **Kebutuhan fitur** yang memicu (adegan cerita + angka).
2. **Opsi yang dipertimbangkan**, minimal tiga, masing-masing dengan kelebihan, kekurangan, dan kapan cocok.
3. **Yang dipilih dan kenapa**, termasuk apa yang sengaja ditunda.
4. **Wujudnya di kode**: snippet dari lab di tiap stack, bukan salinan.
5. **Coba sendiri**: widget atau terminal untuk menjalankan opsi yang dipilih *dan* satu opsi yang ditolak, supaya pembaca merasakan bedanya.
6. **Yang berubah di tahap berikutnya**: link ke keputusan yang merevisinya.

Contoh: keputusan "outbox sebagai queue, bukan Redis" di Tahap 3 akan punya link ke keputusan Tahap 5 "outbox dipindah ke event streaming" dengan alasan beban. Pembaca melihat keputusan bukan sebagai benar/salah, tapi sebagai *benar untuk saat itu*.

### Jalur baca bercabang per peran

Satu cerita, beberapa jalur. Pembaca memilih peran di awal, dan setiap halaman punya bagian "Dari sisi kamu" sesuai peran itu.

| Jalur | Fokus | Contoh halaman yang ditonjolkan |
| --- | --- | --- |
| Mobile (Flutter) | Retry, offline, versi lama, kontrak API, security di app | 2.3, 2.9, 3.8, certificate pinning |
| Web dashboard | Auth untuk admin, RBAC, CORS, CSRF, BFF | 1.13, 4.2, XSS/CSRF |
| Backend | Transaction, queue, cache, modular monolith, service | 1.11, 2.1, 3.3, 4.5 |
| DevOps / SRE | CI/CD, container, k8s, observability, rollback | 1.16, 3.1, 5.1, pipeline |
| Security | Threat model per tahap, enkripsi, audit, incident | Bagian keamanan baru |

Jalur "Generalis" adalah gabungan jalur inti dari semua peran. Ini yang kamu sebut "generalis tapi tetap deep down": lebar lewat jalur generalis, dalam lewat halaman ADR dan lab.

## Yang wajib dipertahankan dan yang sebaiknya dibuang

Sepuluh prinsip di bagian 16 brief kamu semuanya layak dipertahankan. Yang sebaiknya berubah adalah *wadahnya*, bukan prinsipnya.

| Pertahankan (prinsip) | Buang atau ganti (wadah) | Alasan |
| --- | --- | --- |
| Satu cerita lima tahap | Cerita hanya dari sisi arsitektur | Tambah sisi tim, infra, dan keamanan supaya jadi ekosistem |
| Label kejujuran + sumber primer | Label hanya teks | Jadikan metadata terstruktur (frontmatter) supaya bisa difilter dan dicek otomatis |
| Kode di halaman = kode lab | `pymdownx.snippets` | Ganti mekanisme sisip yang setara di generator baru, kontrak `main.go:transfer` dipertahankan |
| Registry `cerita.json` satu sumber | Format bebas, validasi kode sendiri | Validasi dengan JSON Schema atau Zod, dipakai juga oleh widget |
| Prediksi → lihat → ubah satu hal | 15 widget ES5 IIFE tanpa tipe | Tulis ulang sebagai komponen TypeScript, logika murni tetap terpisah dan dites |
| Susunan halaman tetap | 13 bagian selalu terbuka | Kelompokkan jadi 5 blok yang bisa dilipat (lihat bagian ADHD-friendly) |
| Gaya bahasa "kamu", istilah Inggris | Audit bahasa regex Python | Pertahankan, tambah glosarium inline yang lebih ramah untuk pembaca yang Inggrisnya terbatas |
| Pemeriksaan otomatis sebagai syarat minimum | Hanya jalan di laptop | Pindah ke CI, tambah Playwright dan link checker |
| Pihak ketiga tiruan, data karangan | – | Tetap, dan diperluas untuk skenario keamanan |
| sql.js di browser | – | Ganti PGlite supaya lock dan isolation PostgreSQL bisa live |

Yang sebaiknya **tidak** ditambah walau menggoda: gamifikasi dengan poin dan badge, akun wajib untuk membaca, dan komentar publik. Ketiganya menambah beban pemeliharaan dan moderasi tanpa menambah pemahaman.

## Lima dimensi baru

### 1. Tim dan peran: bagaimana orang bekerja sama

Setiap tahap mendapat halaman "Cara kerja tim" yang menjawab: siapa memegang apa, bagaimana app dan backend menyepakati kontrak, dan apa yang pecah saat orang bertambah.

| Tahap | Topik tim yang muncul alami dari cerita |
| --- | --- |
| 1 | Satu repo, satu orang. Commit kecil, README, `.env.example`. |
| 2 | Backend kedua masuk. API contract (OpenAPI) jadi perjanjian. Pull request dan review. Branch strategy sederhana (trunk + feature branch pendek). |
| 3 | Mobile, web, backend terpisah. Mock server dari OpenAPI supaya app tidak menunggu backend. Staging. Siapa yang dibangunkan saat error jam 2 pagi. |
| 4 | Tiga tim bentrok di satu codebase. Modular monolith dengan pemilik per modul. CODEOWNERS. ADR wajib untuk perubahan lintas modul. |
| 5 | Platform team menyediakan "jalan beraspal": template service, pipeline, dashboard. Tim produk tinggal memakai. SRE dan security sebagai fungsi terpisah. |

### 2. Infrastruktur: dari hosting statis sampai Kubernetes

Rekomendasi: infra ikut tumbuh di cerita, dan setiap pindahan dipicu masalah nyata, bukan karena "sudah waktunya".

| Tahap | Infra | Pemicu pindah ke tahap berikutnya |
| --- | --- | --- |
| 1 | Backend di satu VPS (Docker Compose), app dirilis manual. Situs statis di Cloudflare Pages atau Netlify. | Deploy manual bikin app mati 5 menit |
| 2 | GitHub Actions: test → build image → deploy ke VPS lewat SSH. Rollback = image sebelumnya. | Dua orang deploy bersamaan |
| 3 | Dua instance API di belakang reverse proxy (Caddy atau Nginx). Staging terpisah. Backup DB terjadwal. | VPS tunggal jadi single point of failure |
| 4 | Pindah ke cloud managed: managed PostgreSQL, object storage, secret manager. Infrastructure as code (Terraform atau OpenTofu). | Biaya naik, tim ingin self-service |
| 5 | Kubernetes (dimulai dari k3s di VPS supaya bisa dicoba gratis), GitOps (Argo CD atau Flux), autoscaling, multi-zone. Diskusi on-prem untuk data sensitif. | – |

Jenkins sengaja tidak jadi jalur utama. Asumsi: audiens kamu lebih sering bertemu GitHub Actions atau GitLab CI. Jenkins cukup disebut di "Di tools lain" dengan satu Jenkinsfile dari lab. \[perlu verifikasi: tren adopsi CI di Indonesia\]

**On-prem vs cloud** jadi satu halaman ADR di Tahap 5: regulasi data (disebut umum, tanpa klaim kepatuhan), latensi, biaya 3 tahun, kemampuan tim. Lab-nya: dua Compose yang sama, satu diberi label "on-prem" dengan batas sumber daya tetap, satu "cloud" dengan autoscale tiruan.

### 3. Struktur kode: clean architecture yang bisa dilihat tumbuh

Rekomendasi: tampilkan struktur folder sebagai *keputusan bertahap*, bukan template final. Pembaca melihat folder yang sama di Tahap 1 dan Tahap 4, lalu melihat apa yang berubah dan kenapa.

Tahap 1 (Go, tiga lapisan, cukup untuk satu orang):

```text
rekeningo/
├── cmd/api/main.go          titik masuk
├── internal/
│   ├── handler/             HTTP: parsing, status code
│   ├── service/             aturan bisnis: transfer, saldo
│   └── repo/                akses data: SQL
├── migrations/
└── go.mod
```

Tahap 4 (modular monolith, tiga tim):

```text
rekeningo/
├── cmd/api/main.go
├── internal/
│   ├── pembayaran/          modul milik tim Pembayaran
│   │   ├── handler/  service/  repo/  domain/
│   │   └── api.go           satu-satunya pintu keluar modul
│   ├── merchant/
│   ├── platform/            auth, notifikasi, outbox
│   └── shared/              hanya tipe primitif, tanpa logika
├── migrations/<modul>/
└── tools/cek_batas_modul    gagal kalau modul saling import
```

Aturan yang sama ditunjukkan di Node (NestJS modules), Laravel (modules + service classes), Django (apps), dan Spring (packages + ArchUnit). Lab `b7-2-modul` kamu sudah jadi dasarnya.

### 4. Keamanan bertingkat

Dibahas sendiri di bagian "Keamanan" di bawah, karena paling banyak skenario baru.

### 5. AI dan MCP, pakai yang gratis

Tiga peran AI di ekosistem ini, diurutkan dari yang paling murah dipelihara:

| Peran | Wujud | Biaya | Catatan |
| --- | --- | --- | --- |
| **Konten tentang AI** (sudah ada) | Spesifikasi untuk AI, review kode AI, checklist per halaman | 0 | Diperluas: prompt yang menghasilkan bug tersembunyi untuk latihan review |
| **MCP server Belajar Backend** | MCP server kecil (Node atau Go) yang memberi akses ke glosarium, ADR, dan output lab | 0, pembaca jalankan sendiri | Pembaca memakai Claude Desktop, Cursor, atau editor lain dan bisa bertanya "kenapa Rekeningo pilih outbox?" dengan jawaban bersumber dari repo |
| **Tutor di situs** | Chat di halaman yang menjawab dari konten situs | Bergantung API | Hanya kalau ada kunci API gratis atau model lokal; jangan jadi ketergantungan \[perlu verifikasi: kuota gratis penyedia saat ini\] |

Rekomendasi: mulai dari MCP server. Ia paling selaras dengan prinsip "konten adalah sumber kebenaran", biayanya nol untuk kamu, dan sekaligus jadi contoh hidup untuk halaman "integrasi AI di backend" di Tahap 4.

## Fitur Rekeningo: apa yang memaksa arsitektur berubah

Prinsip yang dipakai: arsitektur tidak pernah berubah "karena sudah waktunya". Ia berubah karena satu fitur atau satu kejadian membuat bentuk lama gagal. Bagian ini mendaftar fitur per produk, lalu menunjuk fitur mana yang memicu tiap perubahan besar.

### Empat produk dalam satu ekosistem

| Produk | Pengguna | Dibangun oleh | Fitur inti |
| --- | --- | --- | --- |
| **App Rekeningo** (Flutter) | Budi | Tim mobile | Top-up, transfer, bayar QR, riwayat, notifikasi, kartu virtual (T4), cicilan dan tabungan berjangka (T5) |
| **App Merchant** (Flutter, mode kedua dari app yang sama) | Ani | Tim mobile | Terima pembayaran, kelola stok, pesanan masuk, laporan harian, pencairan dana |
| **Dashboard Merchant** (web) | Ani di laptop, kasir | Tim web | Laporan penjualan, ekspor, kelola produk dan promo, multi-cabang (T4), API untuk POS pihak ketiga (T4) |
| **Back office / CMS** (web internal) | Tim Sinta, ops, CS, risk | Tim web + platform | Verifikasi merchant, kelola konten promo dan banner, pengaturan limit, tiket CS, pembekuan akun, dashboard fraud (T4), audit log, laporan keuangan (T5) |

CMS di sini bukan CMS blog. Ia adalah panel internal yang mengatur *konfigurasi bisnis*: limit transaksi, biaya admin, jadwal promo, feature flag per segmen user. Tiap pengaturan ini punya konsekuensi keamanan, jadi back office adalah tempat RBAC, approval dua orang (four-eyes), dan audit log diperkenalkan.

### Fitur yang memicu tiap perubahan arsitektur

| Perubahan | Fitur atau kejadian pemicu | Kenapa bentuk lama gagal | Alternatif yang ditolak (dan kapan ia justru benar) |
| --- | --- | --- | --- |
| T1 → T2: monolith tetap, isi berubah (index, lock, idempotency) | Transfer antar user + retry dari app | Dua request bersamaan mengubah saldo yang sama; tabel riwayat tumbuh | Pindah ke NoSQL "karena cepat": salah di sini, karena masalahnya kebenaran data, bukan kapasitas |
| T2 → T3: tambah Redis dan worker | Notifikasi push + email setelah bayar; katalog dibaca ribuan kali | Panggilan ke layanan luar di dalam transaction menahan koneksi pool; query katalog yang sama diulang | Tambah instance API saja: tidak menolong, karena pool habis karena *lama*, bukan *banyak* (Little's Law) |
| T3 → T4: modular monolith + satu service pembayaran terpisah | Payment gateway, kartu virtual, dan dashboard merchant dikerjakan tiga tim; audit butuh batas data pembayaran yang jelas | Tiga tim bentrok di satu codebase dan satu skema DB; data kartu butuh isolasi | Microservices penuh: terlalu mahal untuk 10–15 engineer; modular monolith memberi batas tim tanpa biaya jaringan |
| T4 → T5: beberapa service + read replica + event streaming + k8s | Laporan merchant real-time, notifikasi massal, cicilan (proses batch harian), API publik untuk POS | Query laporan mengganggu transaksi; notifikasi 500 ribu user tidak muat di satu worker; tim 5+ butuh deploy independen | Tetap satu DB besar: masih mungkin untuk sebagian beban (partisi, replica), dan panduan menunjukkan sampai mana ini cukup |

### Bukti dari industri yang dipakai panduan

Panduan tidak menganjurkan microservices sebagai tujuan. Beberapa rujukan yang akan dikutip di halaman ADR Tahap 4 dan 5:

- Heuristik ukuran tim yang banyak dipakai praktisi: di bawah ±10 developer monolith menang, 10–50 modular monolith, dan microservices baru masuk akal di atas ±50 atau saat ada bagian sistem dengan profil scaling yang benar-benar berbeda ([easy.bi](https://www.easy.bi/blog/microservices-vs-monolith-decision/), [RaftLabs](https://www.raftlabs.com/blog/microservices-vs-monolith-when-to-migrate)). Angka ini heuristik, bukan hasil penelitian terkontrol, dan panduan akan menyebutnya begitu. Tahap 6 (50+ developer) ditulis untuk menunjukkan apa yang berubah di ambang itu.
- Pengalaman ThoughtWorks di perusahaan besar: alasan awal memecah monolith adalah menambah jumlah tim (Conway's Law), dan efek sampingnya adalah stabilitas turun dan beban monitoring berlipat ([ThoughtWorks](https://thoughtworks.com/en-de/insights/blog/microservices-how-large-enterprise-grew-doing-it)).
- Tanda bahwa monolith benar-benar jadi masalah, bukan sekadar tidak keren: deploy saling bentrok antar tim, satu modul gagal menjatuhkan semua, satu fitur tidak bisa di-scale sendiri, dan tuntutan isolasi data ([RaftLabs](https://www.raftlabs.com/blog/microservices-vs-monolith-when-to-migrate)). Keempat tanda ini persis yang dimunculkan cerita di Tahap 4 dan 5.
- Kasus Amazon Prime Video (satu service monitoring kembali ke satu proses, biaya turun >90%) jadi studi kasus resmi Tahap 5; sumber primer dan cara memakainya ada di bagian "System design final".

Setiap halaman ADR memuat bagian "Kapan keputusan ini salah", supaya pembaca tidak membawa pulang resep, tapi cara menilai.

## Ancaman pada sistem pembayaran: peta lengkap

Bagian "Keamanan bertingkat" di bawah menjelaskan *urutan* belajarnya per tahap. Bagian ini adalah *petanya*: semua kelas ancaman yang relevan untuk dompet digital, dikelompokkan per lapisan, dengan data terbaru yang bisa dikutip di halaman.

### Angka yang menunjukkan di mana serangan sebenarnya terjadi

- Account takeover (ATO) dan transaction fraud memimpin ancaman fintech; SIM swap dan phishing membuat SMS 2FA tidak lagi bisa diandalkan ([Protectt.ai, 2026](https://protectt.ai/feeds/blog/secure-app-shielding-fintech)).
- Imperva melaporkan 53% lalu lintas web 2025 adalah otomatis, 27% serangan bot menyasar API, dan sektor keuangan menyumbang 46% insiden ATO; Akamai menemukan 96% organisasi jasa keuangan mengalami minimal satu insiden keamanan API ([rangkuman DeepStrike, Juni 2026](https://deepstrike.io/blog/account-takeover-fraud-statistics)). Pelajaran untuk Rekeningo: pertahanan ATO harus menutup API pembayaran dan akun, bukan hanya layar login.
- SIM swap: FBI IC3 mencatat kerugian US$26 juta dari 982 laporan pada 2024, turun dari puncak 2022, tapi studi Princeton menunjukkan 39 dari 50 percobaan SIM swap berhasil di lima operator prabayar AS ([Stingrai, 2026](https://www.stingrai.io/blog/sim-swap-statistics-2026)). Ini alasan OTP SMS tidak boleh jadi satu-satunya faktor di Tahap 3.
- Authorized push payment (APP) fraud, di mana korban sendiri yang mengirim uang ke penipu, termasuk yang tumbuh paling cepat dan diproyeksikan mencapai US$15 miliar pada 2028 ([DISB, Maret 2026](https://disb.dc.gov/node/1820586)). Ini ancaman yang *tidak bisa* diselesaikan dengan enkripsi; ia butuh deteksi anomali, jeda transaksi, dan konfirmasi.
- OWASP Top 10:2025 (rilis November 2025) menempatkan Broken Access Control tetap di #1, Security Misconfiguration naik ke #2, dan menambah dua kategori baru: Software Supply Chain Failures (#3) dan Mishandling of Exceptional Conditions (#10) ([Semgrep](https://semgrep.dev/blog/2026/owasp-top-10-2025-whats-new), [Orca](https://orca.security/resources/blog/owasp-top-10-2025-key-changes/)). Dua kategori baru ini cocok sekali dengan materi kamu: supply chain = gitleaks + image yang ditandatangani, exceptional conditions = "Mishandling" adalah bab validation dan error handling yang sudah ada.

### Peta ancaman per lapisan

| Lapisan | Kelas ancaman | Contoh di cerita Rekeningo | Pertahanan utama | Tahap |
| --- | --- | --- | --- | --- |
| **Manusia** | Social engineering, APP fraud, phishing, pretexting ke CS | "Pihak yang mencoba" menelepon Budi mengaku CS, minta OTP; Budi sendiri mentransfer ke "investasi" | Edukasi di app, jeda dan konfirmasi untuk transfer besar atau penerima baru, CS tidak pernah minta OTP, skor risiko | 3–5 |
| **Identitas** | ATO, credential stuffing, SIM swap, OTP bypass, MFA fatigue, account recovery abuse | Akun Ani diambil alih lewat SIM swap; reset password lewat email lama | Argon2id, rate limit per akun, passkey atau TOTP sebagai faktor kedua, cek SIM swap sebelum transaksi besar, recovery yang tidak lebih lemah dari login | 2–4 |
| **App mobile** | Rooted/jailbroken device, overlay attack, hooking (Frida), repackaging, token di storage tidak aman, reverse engineering | App palsu Rekeningo di luar store; overlay menutup layar transfer | Secure storage, certificate pinning dengan rencana rotasi, deteksi root sebagai sinyal (bukan tembok), obfuscation, app attestation | 3–4 |
| **Jaringan** | MITM, downgrade TLS, DNS spoofing, Wi-Fi palsu | Wi-Fi warung Ani diproksi | TLS 1.3, HSTS, pinning, token pendek | 3 |
| **API** | Broken object-level authorization (BOLA), mass assignment, bot abuse, enumerasi akun, replay, rate limit bypass, injection | Budi mengubah `id` lalu melihat saldo Ani (sudah ada); bot mencoba 100 ribu nomor HP untuk cari akun | Authorization per baris, skema input ketat, idempotency key, rate limit per IP dan per akun, respons 404 yang seragam | 1–3 |
| **Web dashboard** | XSS, CSRF, clickjacking, session fixation, misconfigurasi CORS | Kasir Ani membuka tautan, pesanan palsu dibuat dari tab lain | CSP, SameSite, CSRF token, escape output, header keamanan | 3 |
| **Logika bisnis** | Race condition pada saldo, negative amount, rounding abuse, refund ganda, promo abuse, limit bypass lewat split transaksi | Dua penarikan bersamaan lolos (sudah ada); 100 akun palsu memakai promo cashback | Lock dan constraint, invariant di DB, velocity check, graph akun-perangkat | 2–4 |
| **Integrasi** | Webhook palsu/ganda, SSRF, kunci API gateway bocor, dependency berbahaya (supply chain) | Webhook top-up dikirim dua kali; paket npm palsu di dashboard | Signature + idempotency webhook, allowlist URL keluar, secret manager, lockfile + audit dependency, SBOM | 4 |
| **Data dan kunci** | Backup bocor, kunci di repo, akses DB langsung oleh insider, log berisi PII | Engineer baru mengekspor tabel transaksi; log menyimpan nomor HP | Envelope encryption, KMS/HSM, role DB per modul, audit log append-only, redaksi log, least privilege | 4–5 |
| **Infrastruktur** | DDoS L7, misconfigurasi cloud (bucket publik, port terbuka), container escape, pipeline CI disusupi | Bucket foto KTP terbuka; runner CI memuat skrip dari luar | WAF/CDN, IaC yang direview, image ditandatangani, CI tanpa secret jangka panjang, bastion | 4–5 |
| **Operasional** | Tanpa deteksi, tanpa respons insiden, tanpa rotasi kunci | Serangan berjalan 3 minggu sebelum terlihat | Alert pada anomali, runbook insiden, latihan tabletop, rotasi terjadwal | 3–5 |

### Yang sengaja tidak diklaim

Panduan menjelaskan *mekanisme* dan *pola*, tanpa mengklaim kepatuhan terhadap regulasi pembayaran, perlindungan data, atau AML. Deteksi pencucian uang (money mule, structuring) disebut sebagai kelas masalah dengan rujukan ke sumber publik, bukan sebagai lab, karena di luar jangkauan yang bisa direkam dengan jujur.

## Riset tren 2026: yang baru di tiap bidang dan dampaknya ke materi

Sumber di bawah dibuka saat menulis proposal ini (Oktober 2026). Yang bersifat opini praktisi diberi catatan; yang dari dokumen resmi ditandai.

| Bidang | Yang berubah | Sumber | Dampak ke Belajar Backend |
| --- | --- | --- | --- |
| **Mobile (Flutter)** | Flutter 3.44 + Dart 3.12 (Google I/O, Mei 2026): Impeller jadi renderer default Android, Material dan Cupertino mulai dikeluarkan dari core jadi package terpisah, tooling AI naik ke produksi; jadwal rilis 2026 kini terjadwal, minimal 4 stable per tahun ([cmarix](https://www.cmarix.com/blog/latest-flutter-version/), [roadmap resmi](https://flutter.dev/blog/flutter-darts-2026-roadmap)) | Roadmap resmi Flutter + blog pihak ketiga | Client Dart di lab dipakukan ke versi stable terbaru saat fase 3; halaman 2.9 (app versi lama) mendapat contoh nyata: perubahan Material ke package |
| **Dart di backend** | Roadmap 2026 menyebut "Full-stack Dart" dan rencana Primary Constructors serta Augmentations; macros dibatalkan Januari 2025 karena merusak hot reload ([roadmap resmi](https://flutter.dev/blog/flutter-darts-2026-roadmap), [State of Flutter 2026](https://devnewsletter.com/p/state-of-flutter-2026/)) | Resmi + newsletter | Menjawab pertanyaan stack pembanding: **Dart server** (mis. Serverpod atau Dart Frog) layak dipertimbangkan menggantikan Spring sebagai kolom keenam, karena audiensnya Flutter \[perlu verifikasi: kematangan framework\] |
| **DevOps** | Platform engineering jadi disiplin resmi (CNCF punya sertifikasi Platform Engineering Associate); GitOps (Argo CD, Flux) dan OpenTelemetry jadi standar de facto; perhatian bergeser ke desain repo, promosi antar lingkungan, dan penanganan secret ([hipo.is-a.dev](https://hipo.is-a.dev/blog/posts/devops-in-2026/), [Refonte](https://www.refontelearning.com/blog/devops-2026-trends-tools-career-guide)) | Opini praktisi, konsisten antar sumber | Tahap 5 "jalan beraspal" platform team sesuai tren; tracing di lab 3.1 sebaiknya dinaikkan dari field slog ke OpenTelemetry sungguhan dengan collector lokal |
| **DevOps** | Gartner memproyeksikan 80% organisasi rekayasa besar punya platform team pada 2026 (angka dikutip ulang di banyak artikel) ([dev.to](https://dev.to/meena_nukala_1154d49b984d/platform-engineering-in-2026-the-numbers-behind-the-boom-and-why-its-transforming-devops-381l)) | Kutipan sekunder | Dipakai sebagai konteks, bukan klaim utama |
| **Backend** | "Postgres untuk semuanya" makin kuat: durable execution dan queue di atas PostgreSQL (DBOS, dan pustaka serupa di banyak bahasa), MCP server sebagai antarmuka operasi ([DBOS blog 2026](https://www.plushcap.com/companies/dbos/blog/2026)) | Blog vendor | Memperkuat keputusan kamu "outbox di PostgreSQL, bukan Redis" di Tahap 3; Tahap 5 bisa menunjukkan batasnya ("Making Postgres Queues Scale") |
| **Backend** | Tuntutan backend engineer melebar: RAG, MCP server, event-driven jadi bagian pekerjaan biasa ([Substack praktisi](https://codingwithroby.substack.com/p/why-backend-engineering-is-harder)) | Opini | Membenarkan bab "Bekerja dengan AI" diperluas: membangun MCP server kecil untuk Rekeningo jadi halaman Tahap 4 |
| **Arsitektur** | Survei CNCF 2025 yang dikutip beberapa artikel: 42% organisasi yang mengadopsi microservices sedang menggabungkan kembali service ([easy.bi](https://www.easy.bi/blog/microservices-vs-monolith-decision/)) | Kutipan sekunder; angka asli belum saya buka \[perlu verifikasi\] | Mendukung posisi "modular monolith dulu" di Tahap 4 |
| **Security** | OWASP Top 10:2025 rilis November 2025 (lihat bagian ancaman); SIM swap turun volumenya tapi makin tertarget; API jasa keuangan jadi permukaan serangan utama | Resmi + laporan vendor | Peta ancaman dipetakan ke kategori OWASP 2025; lab supply chain (image ditandatangani) masuk Tahap 4 |
| **Database di browser** | PGlite 0.4 (Maret 2026): PostGIS, connection multiplexing (banyak client lewat satu koneksi), dan arsitektur baru yang menyiapkan multi-connection sungguhan; ukuran < 3 MB gzip ([ElectricSQL](https://electric-sql.com/blog/2026/03/25/announcing-pglite-v04)) | Resmi | Demo race dua koneksi di browser **belum** bisa; multiplexing bukan concurrency. Widget replay tetap jadi jalur utama untuk 2.1 |
| **Generator situs** | Material for MkDocs masuk maintenance mode sejak 5 November 2025 dengan dukungan 12 bulan; penerusnya Zensical masih alpha; MkDocs 2.0 tidak bisa membangun proyek 1.x ([Zensical Monthly, Feb 2026](https://mail.zensical.org/monthly/2026/02/), [blog praktisi](https://scour.ing/p/https://duerrenberger.dev/blog/2025/11/06/material-for-mkdocs-is-no-more-long-live-zensical)) | Resmi (newsletter Zensical) | Pengamatan #1 di brief kamu terkonfirmasi lebih buruk dari dugaan: dukungan Material berakhir sekitar November 2026. Migrasi bukan lagi pilihan, tapi keharusan dalam ±12 bulan |
| **Hosting gratis** | Oracle memangkas Always Free Ampere A1 dari 4 OCPU/24 GB jadi 2 OCPU/12 GB sejak pertengahan Juni 2026; instance yang melebihi batas dimatikan sampai diperkecil ([InfoQ, Juli 2026](https://infoq.com/news/2026/07/oracle-cloud-free-tier-limits/)) | Berita teknis + dokumen Oracle | Jalur terminal di VPS diturunkan jadi opsi belakangan; kapasitas 2 OCPU hanya cukup untuk ±5–8 sesi lab bersamaan |

### Pola yang terlihat lintas bidang

1. **Konsolidasi, bukan ekspansi.** Microservices dikonsolidasi, Postgres mengambil alih queue dan workflow, Flutter merampingkan core. Pesan panduan "menambah komponen selalu punya biaya" sejalan dengan arah industri.
2. **Platform sebagai produk.** Baik DevOps (IDP) maupun Flutter (jadwal rilis yang bisa diprediksi) bergerak ke janji yang stabil untuk pemakainya. Tahap 5 cerita Rekeningo bisa menutup dengan tema ini.
3. **AI masuk ke alur kerja biasa.** MCP, agent, dan tooling AI bukan topik terpisah lagi. Bab "Bekerja dengan AI" sebaiknya dipindah dari akhir Tahap 1 ke benang yang muncul di tiap tahap.
4. **Keamanan bergeser ke identitas dan supply chain.** Enkripsi tetap perlu, tapi kerugian terbesar datang dari ATO dan penipuan yang korbannya sendiri menekan tombol kirim.

## System design final: enam tahap sampai 50+ developer

Cerita diperpanjang jadi enam tahap. Tahap 1–4 direkam penuh di lab; Tahap 5 direkam sebagian (replica, partisi, satu service terpisah); Tahap 6 adalah proyeksi konseptual untuk organisasi 50+ developer, ditulis dengan label "Ilustrasi" dan sumber industri, tanpa klaim rekaman.

&#91;embedded content: arsitektur target Tahap 5–6 · 5 lapisan, batas tim\]

Gambar di atas adalah bentuk akhir yang dituju Tahap 5 dan dilengkapi di Tahap 6. Yang tidak berubah dari Tahap 2 sampai 6: ledger adalah satu-satunya tempat uang bergerak, dan setiap service lain hanya membaca atau meminta posting ke ledger.

### Enam tahap dalam satu tabel

| Tahap | User | Developer | Bentuk | Yang baru | Yang sengaja belum |
| --- | --- | --- | --- | --- | --- |
| 1 | 1–100 | 1 | App → monolith Go → PostgreSQL | Tiga lapisan, migration, auth, authorization | Cache, queue, CI |
| 2 | 100–1rb | 2 | Sama, isi berubah | **Ledger double-entry**, idempotency key, index, lock, CI pertama | Cache (masalahnya N+1), service terpisah |
| 3 | 1rb–10rb | 4 | Monolith ×2 → PostgreSQL + Redis → worker | Outbox, cache, rate limit, observability, staging, dashboard merchant | Microservices, k8s |
| 4 | 10rb–100rb | 10–15 (3 tim) | Modular monolith + 1 service pembayaran + BFF | Batas modul, CODEOWNERS, ADR wajib, gateway, object storage, secret manager, IaC, security review | Memecah semua modul jadi service |
| 5 | 100rb–1jt | 20–40 (5–7 tim + platform + SRE + security) | 4–6 service + ledger + replica + event streaming, k8s (k3s di lab) | GitOps, progressive delivery, OpenTelemetry penuh, KMS/HSM tiruan, DDoS/WAF, on-prem vs cloud | Service mesh penuh, multi-region |
| 6 (proyeksi) | 1jt–10jt | 50+ (10+ tim, platform sebagai produk) | Platform internal (IDP) + domain terpisah + data mesh sederhana | Golden path, service catalog, SLO per tim, multi-region aktif-pasif, tim fraud dan compliance engineering, chaos testing | Dibiarkan terbuka sebagai bahan diskusi |

### Tahap 6: apa yang berbeda saat 50+ developer

Di tahap ini masalahnya bukan lagi teknis, tapi koordinasi. Panduan menjelaskan lima konsep, masing-masing satu halaman konseptual:

1. **Platform sebagai produk**: tim platform punya "pelanggan" (tim produk), roadmap, dan ukuran keberhasilan (lead time, adopsi golden path). Ini pola yang diproyeksikan Gartner dipakai 80% organisasi besar pada 2026 (lihat bagian Tren).
2. **Kepemilikan domain**: tiap tim memiliki service, datanya, on-call-nya, dan SLO-nya. Tidak ada tim yang boleh membaca tabel tim lain; hanya lewat API atau event.
3. **Perubahan yang aman di skala**: feature flag, canary, rollback otomatis berdasarkan SLO. Deploy ratusan kali sehari tanpa rapat.
4. **Fraud dan compliance sebagai fungsi engineering**: skor risiko real-time, graph akun-perangkat, rekonsiliasi otomatis dengan bank dan gateway. Dijelaskan sebagai pola, bukan lab.
5. **Biaya sebagai constraint arsitektur** (FinOps): keputusan Amazon Prime Video di bawah adalah contoh utamanya.

### Studi kasus: Amazon Prime Video kembali ke satu proses

Tim Video Quality Analysis Prime Video memindahkan layanan monitoring audio/video dari rangkaian AWS Step Functions dan Lambda ke satu proses di ECS/EC2, dan melaporkan biaya infrastruktur turun lebih dari 90% sekaligus kapasitasnya naik ([arsip blog resmi Prime Video Tech, Mei 2023](https://web.archive.org/web/20230504060528/https://www.primevideotech.com/video-streaming/scaling-up-the-prime-video-audio-video-monitoring-service-and-reducing-costs-by-90), [liputan DevClass](https://devclass.com/?p=5603)). Dua sumber biaya yang mereka temukan: orkestrasi dikenakan biaya per transisi state, dan frame video bolak-balik lewat S3 antar komponen ([rangkuman](https://levelup.gitconnected.com/scalability-lessons-learned-from-amazon-return-to-the-monolith-7fe091354cd5)).

Cara panduan memakainya di Tahap 5, halaman "Kapan menggabungkan kembali":

- Ini **satu service** dari banyak service Prime Video, bukan seluruh Prime Video jadi monolith ([Simform](https://simformnewsletter.substack.com/p/amazon-cuts-90-infra-cost-by-going)). Panduan menegaskan ini supaya pembaca tidak salah tarik kesimpulan.
- Pelajarannya untuk Rekeningo: komponen yang **bertukar data besar dan sering** (konversi frame → deteksi) rugi kalau dipisah lewat jaringan. Padanannya di cerita: skor risiko per transaksi yang butuh data akun, perangkat, dan riwayat dalam 50 ms; memisahkannya jadi tiga service justru menambah latensi dan biaya.
- Lab-nya: dua versi alur "skor risiko" di `labs/t5-gabung`, satu dipecah tiga proses dengan antrean, satu dalam satu proses; yang diukur latensi p95 dan jumlah panggilan jaringan per transaksi. Angka absolutnya berbeda di tiap mesin, tapi rasionya yang jadi pelajaran.

## Clean architecture: Flutter dan backend, dari awal sampai scaling

Aturannya sama di app dan backend: struktur folder adalah keputusan bertahap. Pembaca melihat folder yang sama di tiap tahap dan melihat apa yang berubah, kenapa, dan apa yang pecah kalau tidak diubah.

### Flutter: ikuti panduan resmi, lalu tumbuhkan

Fondasinya adalah panduan arsitektur resmi Flutter: pisahkan UI layer dan data layer, pakai MVVM (view = widget, view model = logika UI, repository dan service = model), satu service per sumber data, dan go\_router untuk 90% kasus navigasi ([docs.flutter.dev/app-architecture](https://docs.flutter.dev/app-architecture/guide), [rekomendasi resmi](https://docs.flutter.dev/app-architecture/recommendations)). Panduan ini ditulis untuk "tim dan codebase yang tumbuh", persis cerita Rekeningo. Contoh lengkapnya adalah Compass app dari tim Flutter.

Pilihan yang ditetapkan: Riverpod 3 (`@riverpod` code-gen) untuk state dan dependency injection, go\_router untuk navigasi, `freezed` untuk model, dan `dio` untuk HTTP. Riverpod 3 dan go\_router jadi standar de facto proyek baru 2026 ([dev.to](https://dev.to/hamberluo/modern-flutter-best-practices-for-2026-56o3)). Bloc disebut sebagai alternatif setara di "Di stack lain" untuk app, bukan dilarang.

Tahap 1, satu orang, satu paket (`lib/`):

```text
lib/
├── main.dart
├── app/                      router, theme, bootstrap
├── core/
│   ├── network/              dio client, interceptor auth, retry + idempotency key
│   ├── storage/              secure storage untuk token
│   └── error/                AppError, mapping dari problem+json
├── features/
│   ├── auth/
│   │   ├── data/             auth_service.dart (HTTP), auth_repository.dart
│   │   ├── domain/           user.dart, session.dart
│   │   └── ui/               login_screen.dart, login_view_model.dart
│   ├── saldo/
│   └── transfer/
└── shared/widgets/           tombol, toast, format Rupiah
```

Tahap 2–3, dua mode (user dan merchant) dan offline-first: `features/` bertambah, `core/sync/` menampung queue lokal (sqflite/drift) dan `core/connectivity/`. Aturan baru: tidak ada `features/a` yang mengimpor `features/b/data`; komunikasi antar fitur lewat provider di `domain/`.

Tahap 4, tiga tim, satu app dua mode: pindah ke **multi-package** dalam satu repo (melos atau pub workspaces):

```text
apps/
├── rekeningo/                shell: router, flavor, DI root
└── merchant/                 shell kedua, memakai paket yang sama
packages/
├── core_network/             dimiliki tim platform mobile
├── core_design/              design system, dimiliki tim web+mobile
├── feature_pembayaran/       dimiliki tim Pembayaran
├── feature_merchant/         dimiliki tim Merchant
└── api_client/               DIBUAT OTOMATIS dari OpenAPI backend
```

`api_client/` yang dibuat otomatis dari OpenAPI adalah kuncinya: kontrak API jadi perjanjian yang bisa dicek CI di kedua sisi. Perubahan yang merusak terdeteksi di PR backend sebelum app crash (menghubungkan halaman 1.7, 2.9, dan lab `b1-openapi`).

Tahap 5–6: build flavor per lingkungan, feature flag dari backend, Shorebird code push untuk perbaikan kecil tanpa rilis store (dijelaskan dengan batasannya, [contoh pipeline](https://hasankarli.medium.com/flutter-ci-cd-github-actions-codemagic-shorebird-b0b5ddb9c168)), dan certificate pinning dengan rotasi yang direncanakan.

### Backend: dari tiga lapisan ke modul ke service

Struktur Tahap 1 dan 4 sudah ada di bagian "Lima dimensi". Yang ditambahkan di sini: aturan yang membuatnya *tetap* bersih saat tumbuh, dan padanannya di tiap stack.

| Aturan | Tahap mulai | Cara dipaksakan | Padanan di stack lain |
| --- | --- | --- | --- |
| Handler tidak tahu SQL; repo tidak tahu HTTP | 1 | Review + lint impor (`depguard` di Go) | NestJS modules; Laravel service classes; Django apps; Serverpod endpoints vs services |
| Aturan uang hanya di `service/` dan ledger | 2 | Tes: handler tidak boleh memanggil repo ledger langsung | Sama |
| Modul hanya diekspor lewat `api.go` | 4 | `internal/` Go + cek import cycle (sudah ada di `b7-2-modul`) | ArchUnit (Spring), eslint-boundaries (Node), `__all__` + import-linter (Python) |
| Satu modul = satu schema DB = satu role DB | 4 | Role PostgreSQL per schema (sudah ada) | Sama di semua stack |
| Modul jadi service tanpa mengubah kode domain | 5 | Antarmuka yang sama diimplementasi lewat HTTP/gRPC; tes kontrak | Sama |
| Event antar service lewat outbox, bukan panggilan langsung | 5 | Lint: service tidak boleh punya client HTTP ke service lain kecuali lewat gateway | Sama |

Ledger diperlakukan sebagai modul terpisah sejak Tahap 2 (`internal/ledger/`) dengan API hanya dua fungsi: `Posting(entries []Entry)` dan `Saldo(akun)`. Ini yang membuat pemisahannya jadi service di Tahap 5 hampir tanpa perubahan kode domain.

### Scaling: urutan yang diajarkan, dan kapan berhenti

| Urutan | Langkah | Pemicu di cerita | Batas (kapan tidak cukup lagi) |
| --- | --- | --- | --- |
| 1 | Perbaiki query dan index | T2: riwayat lambat | Saat query sudah optimal tapi CPU DB tetap tinggi |
| 2 | Keluarkan kerja lambat dari request (outbox + worker) | T3: notifikasi menahan pool | Saat worker tunggal tidak mengejar antrean |
| 3 | Cache hasil baca yang sama | T3: katalog | Saat yang berat adalah tulis, bukan baca |
| 4 | Tambah instance API (stateless) | T3: 1 instance mati = app mati | Saat DB jadi bottleneck |
| 5 | Read replica untuk laporan | T5: laporan mengganggu transaksi | Saat replication lag mengganggu user (halaman 5.2) |
| 6 | Partisi tabel besar | T5: tabel ledger ratusan juta baris | Saat satu DB primary tidak cukup untuk tulis |
| 7 | Pecah service dengan DB sendiri | T5: tim dan beban berbeda | Saat biaya koordinasi melebihi manfaat (kasus Amazon) |
| 8 | Event streaming untuk fan-out | T5: notifikasi 1 juta user | Saat urutan dan exactly-once jadi masalah |
| 9 | Multi-region | T6 (proyeksi) | Dibahas konseptual |

Untuk app, urutan scaling-nya beda dan juga diajarkan: payload lebih kecil → cache lokal → pagination kursor → offline queue → BFF yang menggabungkan request → push menggantikan polling.

## CI/CD final: tiga pipeline yang tumbuh bersama cerita

Ada tiga hal yang di-deploy: situs Belajar Backend, backend Rekeningo (lab), dan app Flutter (lab). Ketiganya memakai GitHub Actions supaya pembaca melihat satu alat yang sama tumbuh. Setiap tahap cerita menambah satu kemampuan pipeline, dan file workflow-nya adalah bagian dari lab yang bisa dibaca.

### Pipeline backend Rekeningo per tahap

| Tahap | Pemicu | Tahapan pipeline | Deploy | Yang baru dipelajari |
| --- | --- | --- | --- | --- |
| 1 | Manual | `go test`, `go vet` di laptop | `docker compose up` di satu VPS lewat SSH | Tidak ada pipeline; halaman 1.16 menunjukkan kenapa itu sakit |
| 2 | Push ke PR | lint → unit test → build image → push ke registry | Tag image = SHA commit; deploy manual dengan satu perintah; rollback = image sebelumnya | CI pertama, image yang tidak bisa diubah, `.env` tidak pernah di repo (gitleaks sudah ada) |
| 3 | Merge ke main | + integration test dengan Testcontainers (PostgreSQL + Redis nyata) + migration dry-run + k6 smoke 30 detik | Staging otomatis; produksi lewat tombol approve | Lingkungan terpisah, migrasi expand/contract dicek otomatis (menghubungkan 2.8) |
| 4 | Merge per modul | + tes kontrak OpenAPI (oasdiff, sudah ada) + SAST (gosec, semgrep) + audit dependency + SBOM + image ditandatangani (cosign) | Blue/green dengan dua instance | Supply chain (OWASP A03:2025), CODEOWNERS menentukan reviewer wajib |
| 5 | Merge per service | + canary 5% dengan rollback otomatis berdasarkan error rate dan p95 (Argo Rollouts) + tes beban terjadwal | GitOps: Argo CD menyamakan cluster dengan repo konfigurasi | Progressive delivery, pemisahan repo kode dan repo konfigurasi, promosi antar lingkungan |
| 6 | Konseptual | Pipeline sebagai template milik platform team; tim produk hanya mengisi `service.yaml` | Golden path | Platform sebagai produk |

### Pipeline app Flutter per tahap

| Tahap | Tahapan | Distribusi | Catatan |
| --- | --- | --- | --- |
| 1 | `flutter analyze` + `flutter test` di laptop | APK dibagikan manual | – |
| 2 | GitHub Actions: analyze → test → build APK debug | Firebase App Distribution ke 20 penguji | Secret keystore disimpan sebagai GitHub secret terenkripsi |
| 3 | + build iOS di runner macOS, signing lewat fastlane match, + golden test | TestFlight + App Distribution; tag git = versi | Pola standar GitHub Actions + fastlane + Firebase ([freeCodeCamp](https://www.freecodecamp.org/news/how-to-automate-flutter-releases-with-fastlane-and-github-actions/)) |
| 4 | + `api_client` dibuat ulang dari OpenAPI dan diff-nya diperiksa; + integration test di emulator | Rilis store bertahap (staged rollout 10% → 100%) | Kontrak API dicek di kedua sisi |
| 5 | + Shorebird code push untuk perbaikan Dart tanpa rilis store; + feature flag | Rilis store + patch | Batasan code push dijelaskan jujur: tidak untuk perubahan native, dan kebijakan store harus dicek \[perlu verifikasi\] |

### Pipeline situs Belajar Backend

Satu workflow di tiap PR: sinkron registry → audit bahasa → build Astro → tes widget (Vitest) → Playwright layar pertama 60+ halaman × 4 ukuran + screenshot diff → link checker → deploy preview ke Cloudflare Pages. Merge ke `main` = produksi. Lab dijalankan di job terpisah hanya saat `labs/` berubah, dengan PostgreSQL dan Redis sebagai service container, dan output rekamannya dibandingkan dengan yang di-commit (status code, saldo, urutan; bukan waktu).

Jenkins dan GitLab CI disebut di "Di tools lain" dengan satu file setara untuk pipeline Tahap 2, supaya pembaca yang bekerja di perusahaan dengan Jenkins bisa memetakan konsepnya.

## Teknik terbaru yang masuk materi, dengan referensi

Ini daftar teknik yang **belum ada** di panduan sekarang dan saya putuskan masuk. Tiap baris menyebut tahap, bentuk hands-on-nya, dan sumber yang dibuka. Yang paling penting ada di baris pertama.

| Teknik | Kenapa masuk | Tahap | Hands-on | Sumber |
| --- | --- | --- | --- | --- |
| **Ledger double-entry append-only** | Panduan sekarang memakai kolom saldo yang di-UPDATE. Standar fintech (Stripe, bank, TigerBeetle) adalah ledger: tiap pergerakan uang dicatat sebagai debit + kredit yang selalu seimbang, baris tidak pernah diubah, koreksi = entri pembalik, saldo = jumlah entri. Ini menghapus satu kelas race condition dan memberi audit trail gratis | 2 | Lab `b3-ledger`: skema `akun`, `jurnal`, `posting`; constraint DB yang menolak jurnal tidak seimbang; widget runsql "saldo kolom vs saldo ledger" saat dua transfer bersamaan | [glosarium](https://singhajit.com/glossary/double-entry-ledger/), [desain ledger pembayaran](https://dodopayments.com/blogs/payment-ledger-design), [kesalahan umum](https://trio.dev/?p=40450), [TigerBeetle](https://jacar.es/en/tigerbeetle-a-database-built-for-financial-transactions/) |
| Running balance / snapshot di ledger | Menjumlah jutaan entri tiap baca lambat; simpan saldo turunan yang bisa diverifikasi | 5 | Lab yang sama, ditambah tabel snapshot dan job rekonsiliasi | [dev.to](https://dev.to/roni_das_b1b76c5ee6583027/designing-a-digital-wallet-with-a-double-entry-ledger-dik) |
| Rekonsiliasi otomatis | Ledger internal vs laporan gateway/bank harus cocok; selisih = insiden | 4 | Worker rekonsiliasi dengan gateway tiruan yang sengaja menghilangkan satu transaksi | [Modern Treasury](https://www.moderntreasury.com/ebooks/how-to-scale-a-ledger) |
| Passkey (WebAuthn) sebagai faktor utama | SMS OTP rapuh karena SIM swap (lihat Ancaman) | 3 | Lab passkey di dashboard web dengan authenticator tiruan; app Flutter memakai package passkeys | OWASP ASVS, data SIM swap di bagian Ancaman |
| OpenTelemetry sungguhan | Standar instrumentasi yang menang di 2026; panduan sekarang hanya field log | 3 | Collector lokal + Jaeger/Grafana Tempo di Compose; trace dari app → API → worker | Bagian Tren (DevOps) |
| Durable execution di PostgreSQL | Workflow panjang (cicilan, pencairan) yang tahan crash tanpa server workflow terpisah; memperkuat "Postgres untuk semuanya" | 5 | Lab dengan DBOS Go atau implementasi outbox + step table buatan sendiri, dibandingkan | [DBOS blog](https://www.plushcap.com/companies/dbos/blog/2026) |
| OpenAPI-first + codegen dua arah | Server (oapi-codegen) dan client Dart dibuat dari satu kontrak; breaking change ditangkap CI | 2 | Perluas `b1-openapi` | Dokumentasi oapi-codegen dan openapi-generator \[perlu verifikasi: versi\] |
| Testcontainers + Dev Containers | Tes integrasi dengan DB nyata; lingkungan yang sama untuk semua yang clone repo | 3 | Semua lab Go memakai Testcontainers; repo punya `devcontainer.json` | Dokumentasi resmi masing-masing |
| Progressive delivery (canary + rollback otomatis) | Deploy ratusan kali sehari aman hanya kalau rollback otomatis | 5 | Argo Rollouts di k3s lokal; metrik dari OpenTelemetry memutuskan rollback | Bagian Tren (GitOps) |
| Supply chain: SBOM, image ditandatangani, lockfile | Kategori baru OWASP A03:2025 | 4 | cosign + syft di pipeline; lab "paket palsu" yang ditangkap audit | Bagian Ancaman (OWASP 2025) |
| Feature flag (OpenFeature) | Memisahkan deploy dari rilis; dasar canary dan eksperimen | 4 | Flag dari back office mengubah perilaku app tanpa rilis | Spesifikasi OpenFeature \[perlu verifikasi\] |
| Shorebird code push | Perbaikan Dart tanpa rilis store | 5 | Pipeline Flutter Tahap 5 | [contoh](https://hasankarli.medium.com/flutter-ci-cd-github-actions-codemagic-shorebird-b0b5ddb9c168) |
| MCP server untuk sistem internal | Agent membaca ledger dan ADR lewat tool yang diaudit; contoh hidup "AI di backend" | 4 | MCP server Rekeningo (read-only) + MCP server Belajar Backend | Bagian Lima dimensi |
| Audit log hash-chain | Perubahan langsung di DB terdeteksi | 4 | Tabel audit dengan hash baris sebelumnya; lab mengubah satu baris dan menunjukkan rantai putus | Prinsip yang sama dengan ledger TigerBeetle (checksummed, hash-chained) |
| Envelope encryption + KMS tiruan | Backup bocor tidak berarti data bocor | 5 | Lab Go: data key per baris dibungkus master key; backup dibuka tanpa KMS = tidak terbaca | NIST SP 800-57 \[perlu verifikasi: edisi\] |

Yang sengaja **tidak** masuk: service mesh (Istio/Linkerd), multi-region aktif-aktif, event sourcing penuh untuk semua domain, dan GraphQL. Keempatnya disebut di Tahap 6 sebagai "ada, dan ini kapan kamu akan butuh", tanpa lab.

## Desain visual final: gelap, jelas, dan navigasi yang tidak membuat tersesat

Acuan rasa: Medium dalam mode gelap. Latar hampir hitam, teks terang, judul besar, satu kolom baca yang lebar, hampir tanpa garis dan kotak. Kesan pertama yang dituju: tenang, serius, dan langsung terbaca.

### Warna dan tipografi

| Elemen | Nilai | Catatan |
| --- | --- | --- |
| Latar halaman | `#0B0B0C` (bukan `#000`) | Hitam murni membuat teks putih "bersinar" (halation); hampir hitam lebih nyaman |
| Latar kotak, kode, widget | `#141416` dan `#1C1C1F` | Dua tingkat saja |
| Teks isi | `#E6E6E6` | Bukan putih murni; kontras ±15:1, jauh di atas WCAG AA 4,5:1 |
| Judul | `#FFFFFF` | Putih hanya untuk judul, supaya hierarki terasa |
| Teks sekunder | `#A3A3A8` | Kontras ±7:1, masih AA |
| Aksen | Satu warna: biru `#7AB8FF` untuk link dan komponen baru | Palet makna lama (system/good/warn/old) dipetakan ulang ke versi gelap dengan `contrast.py` yang sudah ada |
| Ukuran teks isi | 19–20 px desktop, 17 px HP; line-height 1,65; lebar kolom 680–720 px | Mengikuti Medium; teks lebih besar mengkompensasi mode gelap |
| Huruf isi | Satoshi tetap, atau Inter sebagai fallback | Berat 400 untuk isi, 600 untuk judul; hindari 300 di mode gelap |
| Huruf kode | JetBrains Mono tetap | Warna sintaks dicek ulang di latar gelap |
| Mode terang | Tersedia, satu klik, disimpan di `localStorage` | NN/g: performa membaca panjang sedikit lebih baik di teks gelap latar terang, jadi pilihannya diberikan ke pembaca ([rangkuman riset NN/g](https://watsspace.com/blog/dark-mode-vs-light-mode-for-website-design/), [NN/g](https://www.nngroup.com/articles/dark-mode/)) |

Semua widget, diagram, dan ilustrasi SVG dibuat dengan token warna, bukan nilai tetap, supaya kedua mode benar tanpa dua set gambar. `tools/contrast.py` memeriksa kedua mode di CI.

### Layar pertama (first impression)

Beranda baru bukan "Cara pakai panduan ini". Beranda adalah satu layar: judul besar, satu kalimat janji, satu tombol "Mulai dari cerita", dan tiga kartu pintu masuk (Cerita, Peran, Masalah). Di bawahnya peta enam tahap sebagai satu diagram. Tidak ada daftar fitur. Halaman "Cara pakai" dipindah ke tautan kecil.

### Navigasi: tiga pintu, satu sidebar

| Elemen | Perilaku | Alasan UX |
| --- | --- | --- |
| Sidebar kiri | Hanya satu: urutan cerita per tahap, grup bisa dilipat, ★ jalur inti. Tidak ada tab atas | Satu model mental; pembaca tidak perlu memilih antara dua navigasi |
| Pemilih peran | Chip di atas sidebar: Generalis / Mobile / Web / Backend / DevOps / Security. Memilih peran menandai halaman yang ditonjolkan, tidak menyembunyikan apa pun | Progressive disclosure tanpa menghilangkan jalan |
| "Kamu di sini" | Tetap, dipadatkan jadi breadcrumb: Tahap 2 › Data › 2.1 Race condition, plus rekap satu kalimat | Orientasi tanpa membuka halaman lain |
| Berikutnya | Tombol besar di akhir setiap blok, bukan hanya di akhir halaman, dengan judul dan perkiraan menit halaman berikutnya | Pembaca ADHD butuh langkah berikutnya yang jelas kapan pun berhenti |
| Indeks masalah | Pencarian "apa yang salah?" di beranda dan di sidebar: ketik "dobel bayar" → 2.3 | Pembaca sering datang dengan masalah, bukan dengan nama konsep |
| Daftar isi kanan | Hanya lima blok (Mulai, Coba, Paham, Putuskan, Kunci) dengan status selesai | Lebih sedikit, lebih berguna |
| Pencarian | Pagefind, dengan istilah glosarium diprioritaskan | Jawaban satu kalimat muncul sebelum daftar halaman |
| Mode fokus | Sembunyikan sidebar dan daftar isi, lebar kolom tetap | Satu tugas di layar |

Prinsip yang dipakai dan diperiksa saat review tampilan: pembaca selalu bisa menjawab tiga pertanyaan tanpa berpikir: di mana saya, dari mana saya datang, ke mana selanjutnya. Setiap halaman yang gagal menjawab salah satunya dianggap bug tampilan.

## Pengalaman belajar: ADHD-friendly, hands-on, multi-bahasa

### ADHD-friendly: pecah, tunjukkan, beri jalan keluar

Prinsip yang dipakai: satu layar satu ide, selalu ada sesuatu yang bisa dilakukan, dan pembaca tahu kapan boleh berhenti. Susunan 13 bagian dikelompokkan jadi 5 blok, dan hanya blok pertama yang terbuka saat halaman dimuat.

| Blok | Isi | Status awal | Target waktu |
| --- | --- | --- | --- |
| Mulai | Kamu di sini, Inti, diagram, pretest | Terbuka | 1 menit |
| Coba | Lihat sendiri (widget atau terminal) | Terbuka | 2–4 menit |
| Paham | Kenapa ini ada, cara kerjanya, Di stack lain | Dilipat, dibuka satu per satu | 4–6 menit |
| Putuskan | Trade-off, ADR, Sengaja belum dilakukan | Dilipat | 2 menit |
| Kunci | Cek diri, checklist review AI, bacaan lanjut, umpan balik | Dilipat | 2 menit |

Aturan tambahan:

1. **Progres terlihat** di tiap blok ("3 dari 5"), bukan hanya di Peta cerita.
2. **Titik berhenti aman**: di akhir blok Coba, tulis "Kalau berhenti di sini, kamu sudah tahu X". Pembaca yang tidak punya 10 menit tetap pulang dengan sesuatu.
3. **Halaman panjang dipecah** jadi halaman anak (mis. 2.1 jadi 2.1a Race condition, 2.1b Empat cara mengunci), dengan cerita tetap satu alur. Pecahannya mengikuti batas "satu widget per halaman".
4. **Satu tugas aktif di layar**. Widget tidak menampilkan semua kontrol sekaligus; kontrol berikutnya muncul setelah langkah sebelumnya selesai.
5. **Mode fokus**: sembunyikan sidebar dan daftar isi dengan satu tombol. Mode gelap ikut ditambahkan (ini juga permintaan di brief).
6. **Tanpa animasi yang jalan sendiri**. Semua gerakan dipicu klik, dan `prefers-reduced-motion` tetap dihormati.

### Hands-on: tiga tingkat kedalaman

| Tingkat | Wujud | Siapa yang memakai | Infra |
| --- | --- | --- | --- |
| Lihat | Widget replay dan simulasi (sudah ada) | Semua pembaca | Statis |
| Jalankan | SQL live di PGlite; latihan kecil yang dinilai otomatis (tulis `WHERE` yang benar, perbaiki handler dengan bug) | Pembaca yang ingin mencoba | Statis, WebAssembly |
| Bangun | Terminal di browser ke sandbox nyata: Go + PostgreSQL + Redis, menjalankan lab yang sama persis dengan yang direkam | Pembaca serius | VPS Oracle (bagian berikutnya) |

Latihan tingkat "Jalankan" yang paling cocok untuk konsep backend:

- **Parsons problem**: potongan kode transfer diacak, pembaca menyusun urutannya (BEGIN, SELECT FOR UPDATE, UPDATE, COMMIT). Dinilai otomatis tanpa menjalankan kode.
- **Cari bug-nya**: handler buatan "AI" dengan satu bug tersembunyi (SQL injection, lupa cek pemilik, retry tanpa idempotency key). Pembaca menandai barisnya.
- **Ubah query**: query N+1 diberikan, pembaca menulis versi JOIN, dinilai dengan membandingkan hasil dan jumlah query di PGlite.

### Multi-bahasa

Keputusan kamu: bahasa lain memakai terjemahan bawaan browser, bukan konten paralel. Konsekuensinya untuk desain situs:

- Semua teks adalah HTML biasa. Tidak ada teks di dalam SVG ilustrasi atau canvas; label widget dirender sebagai elemen DOM supaya ikut diterjemahkan.
- Istilah teknis diberi `translate="no"` supaya *transaction*, *idempotency key*, dan nama tokoh tidak diterjemahkan mesin.
- Kode, output rekaman, dan nama file juga `translate="no"`.
- Struktur i18n Starlight tetap disiapkan kosong, supaya kalau suatu saat ingin menulis versi Inggris untuk jalur inti, tidak perlu migrasi lagi.

### Glosarium jadi halaman mendalam per istilah

Glosarium sekarang satu halaman dengan definisi satu kalimat untuk 98 istilah. Usulannya: tiap istilah mendapat halaman sendiri dengan susunan tetap, dan tooltip tetap memakai kalimat pertamanya.

| Bagian halaman istilah | Isi | Contoh untuk *idempotency key* |
| --- | --- | --- |
| Satu kalimat | Definisi yang dipakai tooltip | Kunci unik dari client supaya request yang diulang hanya diproses sekali |
| Dalam bahasa sehari-hari | Analogi singkat tanpa metafora berlapis | Seperti nomor antrean: datang dua kali dengan nomor sama, dilayani sekali |
| Di mana ia muncul di cerita | Link ke adegan dan halaman | Tahap 2, Budi dobel bayar |
| Mekanismenya | 3–5 langkah | Client buat key → server cek tabel → simpan hasil → balas yang sama |
| Di tiap stack | Nama API atau pola per stack | Header `Idempotency-Key`, tabel `idempotency_keys` |
| Jebakan umum | 2–3 kesalahan yang sering terjadi | Key baru di tiap retry; key tanpa masa berlaku |
| Istilah terkait | Link ke istilah lain | retry, at-least-once, outbox |
| Sumber | RFC atau dokumentasi resmi | Draft IETF Idempotency-Key header \[perlu verifikasi: status draft\] |

Istilah yang sekarang belum punya entri (DTO, dependency injection, PL/pgSQL, Kubernetes, bottleneck, service mesh, event bus, authorization code, Read Committed) ditambahkan dengan format yang sama. Target: ±130 istilah.

## Arsitektur teknis dan tech stack baru

Rekomendasi (diperbarui setelah jawabanmu): Astro + Starlight untuk situs, **React + TypeScript** untuk widget (kamu sudah nyaman dengan React, dan Astro memuatnya sebagai island hanya di halaman yang perlu), PGlite untuk SQL di browser, GitHub Actions + Cloudflare Pages untuk CI dan hosting statis. Tanpa akun, tanpa backend progres. Semua versi di bawah perlu dicek ke dokumentasi resmi saat kamu mulai \[perlu verifikasi\].

### Generator situs

| Opsi | Komponen interaktif | i18n | Pencarian | Mode gelap | Biaya migrasi 60 halaman | Catatan |
| --- | --- | --- | --- | --- | --- | --- |
| Tetap MkDocs Material | Hanya lewat JS manual | Plugin i18n | Client-side bawaan | Bawaan | 0 | **Maintenance mode sejak 5 Nov 2025, dukungan 12 bulan**; MkDocs 2.0 tidak membangun proyek 1.x ([Zensical Monthly](https://mail.zensical.org/monthly/2026/02/)). Bukan pilihan jangka panjang. |
| Zensical (penerus Material) | Belum ada model island | Lewat modul | Bawaan | Bawaan | Rendah (membaca `mkdocs.yml`) | Masih alpha, sistem modul baru dibuka; kompatibilitas plugin belum lengkap ([blog praktisi](https://scour.ing/p/https://duerrenberger.dev/blog/2025/11/06/material-for-mkdocs-is-no-more-long-live-zensical)). Cocok kalau tujuannya hanya bertahan, bukan menambah interaktivitas. |
| **Astro + Starlight** | Islands: React, Preact, Svelte, Vue dalam satu situs, hanya di-hydrate saat perlu | Bawaan Starlight | Pagefind bawaan (statis) | Bawaan | Sedang: Markdown hampir sama, snippets dan admonition perlu diganti | Output statis, bisa tambah API route kalau perlu |
| Docusaurus | React MDX | Bawaan | Algolia atau plugin lokal | Bawaan | Sedang | Terkunci ke React (tidak masalah untuk kamu); bundle lebih besar; alternatif terdekat |
| VitePress | Vue | Bawaan | Lokal bawaan | Bawaan | Sedang | Terkunci ke Vue |
| Next.js + MDX | React penuh | Manual | Manual | Manual | Tinggi | Terlalu banyak yang harus dibangun sendiri untuk situs dokumentasi |

Kenapa Astro + Starlight: ia satu-satunya yang membiarkan widget ditulis di framework apa pun tanpa mengunci seluruh situs, output tetap statis (cocok untuk hosting gratis), dan Pagefind memberi pencarian tanpa server. Alternatif terdekat adalah Docusaurus kalau kamu sudah nyaman dengan React.

Yang perlu dibangun ulang saat migrasi: sisip kode dari lab (`--8<--` jadi komponen `<Snippet file="..." region="transfer" />`), rujukan `[[ID]]` (jadi remark plugin), nav otomatis dari `cerita.json` (jadi konfigurasi sidebar yang dibuat skrip), dan hook validasi skenario (jadi skrip pra-build atau Astro integration).

### Widget

| Opsi | Ukuran runtime | Cocok untuk widget kamu? |
| --- | --- | --- |
| **React 19 + TypeScript** | Sedang (±40 KB gzip, dimuat sekali per halaman yang punya widget) | Ya, karena kamu sudah nyaman. Astro hanya meng-hydrate island yang perlu, jadi halaman tanpa widget tetap nol JavaScript. Docusaurus jadi alternatif generator yang masuk akal kalau ingin React di seluruh situs. |
| Preact (compat) | Kecil | Kode React yang sama, runtime lebih kecil. Bisa jadi langkah optimasi belakangan tanpa menulis ulang. |
| Svelte 5 | Sangat kecil | Rekomendasi awal; dicoret karena biaya belajar tidak sebanding dengan hematnya ukuran. |

Aturan yang dipertahankan: logika murni (`alur-core`, `runsql-core`, token bucket) tetap di file `.ts` tanpa DOM, dites dengan Vitest. Data skenario JSON divalidasi dengan Zod, dan skema Zod yang sama menghasilkan JSON Schema untuk editor.

### PostgreSQL di browser

PGlite (PostgreSQL yang dikompilasi ke WebAssembly) menggantikan sql.js. Yang jadi mungkin: `FOR UPDATE`, isolation level, `EXPLAIN` dengan planner PostgreSQL asli, dan constraint yang sama dengan lab.

Batasannya: ukuran unduhan beberapa MB (dimuat saat tombol Jalankan pertama ditekan, seperti sql.js sekarang), dan PGlite satu koneksi per instance \[perlu verifikasi: dukungan multi-koneksi saat ini\]. Untuk demo race condition dua client, widget replay rekaman tetap dipertahankan, atau dua instance PGlite berjalan bergantian dengan penjelasan bahwa ini simulasi.

### CI/CD dan hosting situs

| Pemeriksaan | Sekarang | Di CI |
| --- | --- | --- |
| Build strict | Lokal | GitHub Actions, tiap PR |
| Audit bahasa | Lokal, Python | Tetap Python, jalan di CI |
| Tes widget | `node --test` | Vitest |
| Layar pertama 60×4 | CDP buatan sendiri | Playwright, plus screenshot diff untuk visual regression |
| Link checker | Belum ada | lychee atau sejenis |
| Lab | Manual, direkam | Job terpisah dengan Docker services; jalan saat folder `labs/` berubah |

Hosting situs statis: Cloudflare Pages atau GitHub Pages. Keduanya gratis untuk situs ini. VPS Oracle dipakai hanya untuk yang butuh proses hidup: sandbox terminal, backend progres, dan MCP server.

### Progres pembaca: tetap lokal, tanpa akun

Keputusan kamu: tidak ada registrasi. Progres, kartu ulang, dan umpan balik tetap di `localStorage`, seperti sekarang. Yang ditambah hanya dua hal kecil: tombol **ekspor/impor progres** sebagai file JSON (supaya pindah perangkat tetap bisa, tanpa server), dan umpan balik halaman diarahkan ke GitHub Discussions atau issue template, bukan ke backend.

## Hands-on: lokal dulu, server belakangan

Keputusan kamu: semua harus jalan di Mac dan di mesin siapa pun yang clone repo. Jadi urutannya dibalik dari proposal awal: jalur A (browser) dan jalur B (satu perintah di mesin sendiri) adalah produk utama; jalur C (terminal di situs lewat VPS) jadi opsi masa depan. Fakta baru yang mendukung: Oracle memangkas Always Free ARM jadi 2 OCPU / 12 GB sejak Juni 2026 (lihat tabel tren), jadi kapasitas untuk sandbox publik tinggal separuh.

### Jalur B diperjelas: `make lab` di Mac

Satu perintah di root repo menyiapkan semuanya: Docker Compose untuk PostgreSQL 17 dan Redis 8, lalu memeriksa Go, Node, Python, dan Dart. Yang kurang ditunjukkan dengan perintah instalasinya. Lab PHP/Laravel dipisah jadi opsional supaya tidak menghalangi. `devcontainer.json` yang sama membuat repo bisa dibuka di VS Code Dev Containers atau GitHub Codespaces tanpa instalasi apa pun, dan file ini sekaligus bahan halaman "Cara kerja tim" Tahap 3.

### Tiga jalur, dari yang paling aman

| Jalur | Cara kerja | Bisa untuk lab apa | Risiko | Biaya |
| --- | --- | --- | --- | --- |
| A. Tanpa server | PGlite + kode yang dijalankan di browser (SQL, JavaScript, Python lewat Pyodide) | SQL, index, N+1, pagination, isolation level satu koneksi | Hampir nol | 0 |
| B. Satu klik ke cloud dev | Tombol "Buka di Codespaces" atau Gitpod dengan Dev Container yang sudah berisi Go, Docker, PostgreSQL, Redis | Semua 26 lab, persis seperti di laptop kamu | Rendah; kuota gratis per user, bukan milik kamu | 0 untuk kamu \[perlu verifikasi: kuota gratis saat ini\] |
| C. Terminal di situs | xterm.js di halaman → WebSocket → container sekali pakai di VPS Oracle | Lab pilihan yang butuh race dua koneksi, pool, replica, rate limit | Tinggi: eksekusi kode orang lain di server kamu | VPS gratis, tapi waktu kamu untuk mengamankannya |

Rekomendasi: A dan B dikerjakan di fase 2 dan 3. C ditunda sampai A dan B stabil, dan baru dibuka kalau ada server yang kamu kendalikan. Rancangan C di bawah tetap disimpan supaya keputusan nanti tidak mulai dari nol.

### Rancangan jalur C kalau diambil

```text
Browser (xterm.js)
   │ WebSocket, token sesi 20 menit
   ▼
Gateway Go di VPS (reverse proxy Caddy, TLS otomatis)
   │ satu container per sesi, antrean kalau penuh
   ▼
Container lab sekali pakai
   ├── rootless, tanpa akses jaringan keluar
   ├── batas CPU 0,5 core, RAM 512 MB, disk 200 MB, umur 20 menit
   ├── PostgreSQL dan Redis di dalam container yang sama
   └── dihapus saat sesi putus
```

Batas Oracle Always Free sejak Juni 2026: Ampere A1 2 OCPU dan 12 GB RAM, atau dua instance x86 1/8 OCPU dan 1 GB ([InfoQ](https://infoq.com/news/2026/07/oracle-cloud-free-tier-limits/), [dokumen Oracle](https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm)). Dengan 2 OCPU, sekitar 5–8 sesi lab bersamaan masuk akal. Ketersediaan ARM juga sering habis di banyak region, jadi ini tidak bisa jadi fondasi produk.

Syarat keamanan minimum sebelum jalur C dibuka ke publik:

1. Runtime yang mengisolasi lebih kuat dari Docker biasa: gVisor atau Firecracker (lewat alat seperti firecracker-containerd) \[perlu verifikasi: dukungan di ARM\].
2. Tanpa jaringan keluar dari container. Lab yang butuh "pihak ketiga" memakai program tiruan di dalam container, seperti sekarang.
3. Rate limit per IP dan per sesi, dan ini sendiri jadi contoh hidup halaman 3.7.
4. Image lab dibangun di CI, ditandatangani, dan hanya image itu yang boleh jalan.
5. Log semua perintah, tanpa menyimpan isi file user.

Sisi positifnya: seluruh gateway ini adalah bahan halaman baru yang jujur, "Kenapa menjalankan kode orang lain itu sulit", lengkap dengan ADR dan kode yang benar-benar dipakai situs.

## Keamanan: skenario bertingkat dari MITM sampai enkripsi skala besar

Rekomendasi: keamanan bukan satu bab di akhir, tapi satu *serangan per tahap* yang muncul dari cerita, dengan pola yang sama seperti konsep lain: adegan → lihat serangannya di lab → lihat pertahanannya → ADR. Setiap tahap juga punya halaman "Threat model tahap ini": apa yang dilindungi, dari siapa, dan apa yang sengaja belum dilindungi.

Penyerang di cerita diberi satu tokoh baru tanpa nama merek, misalnya **"Pihak yang mencoba"**, supaya narasinya tetap konkret tanpa menuduh siapa pun.

| Tahap | Serangan di cerita | Apa yang dilihat Budi atau Ani | Pertahanan yang dipelajari | Lab |
| --- | --- | --- | --- | --- |
| 1 | Budi mengubah `id` di URL dan melihat saldo Ani (sudah ada). **SQL injection** di pencarian warung: `' OR 1=1 --` menampilkan semua akun. | Data orang lain muncul | Authorization per baris, parameterized query, RLS | Perluas `api-t1`: mode rentan vs aman, direkam |
| 2 | **Brute force** dan **credential stuffing** pada login. Password tersimpan plain. | Akun Ani diambil alih | Hash password (argon2id), rate limit per akun, lockout bertahap | Perluas `c4-ratelimit` |
| 3 | **Man-in-the-middle** di Wi-Fi warung: proxy tiruan membaca token Budi. **Token dicuri** dari log. | Transfer yang tidak dia lakukan | TLS wajib, HSTS, certificate pinning di Flutter (dan risikonya saat sertifikat ganti), token pendek + refresh, redaksi log | Lab baru: mitmproxy tiruan dalam container, client Dart dengan dan tanpa pinning |
| 3 | **XSS dan CSRF** di dashboard web Ani | Pesanan palsu dibuat dari tab lain | Escape output, CSP, SameSite cookie, CSRF token | Lab baru: dashboard kecil (HTML + Go) |
| 4 | **Webhook palsu** (sudah ada), **SSRF** lewat URL gambar produk, **secret bocor** di repo | Saldo bertambah tanpa bayar; server internal terbaca | Signature webhook, allowlist URL keluar, secret manager, gitleaks di CI (sudah ada) | Perluas `b10-2-webhook`, lab baru SSRF |
| 4 | **Insider**: engineer baca tabel transaksi langsung | Bocor data pribadi | Role DB per modul (sudah ada di `b7-2-modul`), audit log yang tidak bisa diubah, akses produksi lewat bastion | Perluas `b7-2-modul` |
| 5 | **Skala**: DDoS lapisan 7, enumerasi akun massal, **replay transaksi** antar service, pencurian backup | Layanan mati; data jutaan user bocor | WAF/CDN, mTLS antar service, idempotency lintas service, enkripsi at rest dengan KMS, envelope encryption, HSM untuk kunci utama, tokenisasi nomor kartu, key rotation | Lab baru: KMS tiruan + envelope encryption di Go; mTLS dua service |

### Enkripsi untuk transaksi ratusan miliar rupiah

Di Tahap 5, topik enkripsi dipecah supaya tidak jadi satu halaman raksasa:

1. **In transit**: TLS 1.3 ke app, mTLS antar service, kapan pinning layak.
2. **At rest**: enkripsi disk saja tidak cukup; envelope encryption (data key per baris atau per tabel, dibungkus master key di KMS). Lab menunjukkan apa yang terbaca kalau backup bocor dengan dan tanpa envelope.
3. **Kunci**: siapa pegang master key, rotasi tanpa downtime, HSM sebagai akar kepercayaan. HSM diperagakan dengan tiruan (antarmuka yang sama, tanpa perangkat).
4. **Data yang tidak perlu disimpan**: tokenisasi dan minimisasi. Cara paling aman menyimpan nomor kartu adalah tidak menyimpannya.
5. **Integritas**: audit log append-only dengan hash berantai, supaya perubahan saldo yang "diedit langsung" terdeteksi.

Semua ini tetap dengan penafian kamu: tidak mengklaim kepatuhan regulasi mana pun. Standar yang dirujuk hanya sebagai sumber primer (OWASP ASVS, OWASP Mobile Top 10, NIST SP 800-57 untuk key management) \[perlu verifikasi: versi terbaru tiap dokumen\].

### Aturan khusus halaman keamanan

- Lab serangan hanya menyerang sistem tiruan di dalam lab. Tidak ada perintah yang bisa diarahkan ke target luar.
- Mode rentan di lab dinyalakan lewat flag eksplisit dan tidak pernah jadi default, seperti flag di `api-t1` sekarang.
- Checklist "Saat me-review kode AI" di tiap halaman ditambah satu butir keamanan yang relevan.
- Halaman keamanan masuk jalur inti mulai Tahap 1. Ini perubahan dari sekarang, di mana 3.7 adalah satu-satunya halaman keamanan di jalur inti.

## Rencana migrasi bertahap

&#91;embedded content: rencana migrasi · 5 fase, 4 gerbang\]

Fase 0 sampai 2 hanya mengganti wadah; konten 60 halaman tidak berubah artinya. Fase 3 adalah fase konten, dan baru di sini cerita, ADR, dan keamanan ditulis. Fase 4 menambah yang butuh server. Setiap gerbang berarti `cek_batch` (atau penggantinya di CI) hijau dan situs bisa di-deploy saat itu juga.

| Fase | Yang dilakukan | Yang sengaja tidak disentuh | Perkiraan beban |
| --- | --- | --- | --- |
| 0 · Fondasi | GitHub Actions menjalankan `cek_batch.sh` apa adanya; deploy ke Cloudflare Pages; ganti CDP buatan sendiri dengan Playwright; tambah link checker | Konten, widget, MkDocs | 1–2 minggu |
| 1 · Situs baru | Astro + Starlight berdampingan di folder `site-baru/`; porting komponen Snippet, remark `[[ID]]`, sidebar dari `cerita.json`; 60 halaman dipindah per tahap; widget lama dimuat apa adanya lewat `<script>` | Isi halaman, data widget, lab | 4–6 minggu |
| 2 · Widget | Satu widget per PR ditulis ulang ke Svelte + TS, dimulai dari yang paling banyak dipakai (`alur`, `pilah`); Zod untuk semua JSON; PGlite menggantikan sql.js di `runsql`; teks widget dipisah per bahasa | Konten, lab | 6–8 minggu |
| 3 · Konten | Template halaman ADR; halaman panjang dipecah; dimensi tim, infra, keamanan ditulis per tahap; lab keamanan baru direkam; mode gelap dan blok lipat ADHD | Hands-on tingkat Bangun | Terpanjang, bertahap per tahap cerita |
| 4 · Hands-on + AI | `devcontainer.json`; gateway terminal di VPS untuk 5–8 lab; MCP server; backend progres Go; konten bahasa Inggris dimulai | – | Bergantung hasil uji VPS |

MkDocs dihapus hanya setelah fase 1 lolos gerbangnya. Sampai saat itu dua situs dibangun di CI, dan `cek_layar_pertama` dijalankan ke keduanya supaya regresi tampilan langsung terlihat.

**Revisi urutan kerja, 2026-10-08 (setelah fase 1 selesai).** Fase 0 dan 1 di atas sudah dijalankan: 60 halaman lama ada di `situs/` tanpa perubahan isi. Mulai sekarang urutannya dibalik menjadi **konten dulu, satu tahap sampai tuntas**: Tahap 1 dibangun utuh sesuai `plan/CERITA-TAHAP-1.md` (PRD → fitur ke teknis → pertukaran saldo → masalah → konsep → ADR, 42 halaman, enam template, lima blok lipat, beranda satu layar, widget React pertama), lalu Tahap 2 menunggu naskahnya. Fase 2–4 di tabel tidak dihapus; isinya dikerjakan di dalam tahap cerita yang membutuhkannya. Yang tetap dikerjakan sebelum konten: hapus MkDocs, pindahkan audit bahasa, sinkron registry, dan cek ID ke `situs/`, lalu Cloudflare Pages dengan preview per PR. Dicatat sebagai keputusan 109.

## Risiko terbesar

Risiko terbesar bukan teknis, tapi cakupan: lima dimensi baru dikalikan lima tahap bisa jadi 100+ halaman baru untuk satu orang. Tabel ini mengurutkan dari yang paling mungkin menggagalkan project.

| Risiko | Kemungkinan | Dampak | Cara mengukur lebih awal | Pengaman |
| --- | --- | --- | --- | --- |
| Cakupan membengkak, project mandek di fase 3 | Tinggi | Situs lama ditinggal, situs baru tidak selesai | Jumlah halaman "ada: false" di registry naik terus | Satu tahap cerita selesai utuh (semua dimensi) sebelum tahap berikutnya dimulai; Tahap 5 boleh tetap tipis |
| Terminal di VPS disalahgunakan (mining, serangan keluar) | Sedang | VPS diblokir Oracle, situs ikut mati | Uji sendiri dengan skenario penyalahgunaan sebelum publik | Jalur A dan B dulu; jalur C di VPS terpisah dari situs, tanpa jaringan keluar |
| Widget ditulis ulang, perilaku berubah diam-diam | Sedang | Pembaca lama bingung, tes tidak menangkap | 103 tes lama dijalankan terhadap widget baru lewat adapter | Tulis ulang satu widget per PR, screenshot diff Playwright sebelum dan sesudah |
| PGlite tidak bisa meniru demo race dua koneksi | Sedang | Janji "live" tidak terpenuhi di halaman paling penting | Prototipe 1 hari sebelum fase 2 | Widget replay rekaman tetap dipertahankan sebagai fallback |
| Konten keamanan salah atau berbahaya | Rendah, tapi dampak besar | Pembaca mempraktikkan hal yang keliru | Review oleh orang dengan latar security sebelum publik | Semua lab serangan hanya ke target tiruan; label \[perlu verifikasi\] wajib sampai direview |
| Ekosistem Astro/Starlight atau PGlite berubah arah | Rendah | Migrasi kedua | Cek rilis dan aktivitas repo sebelum fase 1 | Konten tetap Markdown + JSON; widget logika murni tidak bergantung framework |
| Versi Inggris menua lebih cepat dari versi Indonesia | Tinggi, kalau dimulai | Konten dua bahasa tidak sinkron | Pemeriksaan CI: halaman `en` yang `id`-nya berubah ditandai | Mulai Inggris hanya untuk jalur inti, dan hanya setelah fase 3 stabil |

## Pertanyaan sebelum rekomendasi final

Jawaban kamu di sini menentukan bagian mana dari proposal yang dipertahankan. Centang yang sudah bisa dijawab.

- [x] Kapasitas: penuh waktu, langsung dikerjakan.
- [x] VPS: belum ada; lokal dulu, server belakangan.
- [x] Framework: React.
- [x] Akun pembaca: tidak ada registrasi.
- [x] Cakupan keamanan: bertingkat sampai Tahap 4 direkam, Tahap 5–6 konseptual.
- [x] Bahasa: terjemahan bawaan browser; glosarium jadi halaman mendalam.
- [x] Stack pembanding: Dart server (Serverpod) menggantikan Spring.
- [x] Web dashboard: dibuat sebagai lab.
- [x] Tokoh penyerang: "Pihak yang mencoba".
- [x] Ilustrasi: satu per tahap, Tahap 3–6.
- [x] MCP server: fase 4, dijalankan pembaca di mesin sendiri.
- [x] Ledger double-entry sejak Tahap 2: disetujui 2026-10-08. Jadi pekerjaan pertama fase 3.
- [x] Tampilan gelap gaya Medium dan navigasi tiga pintu: ditetapkan di "Desain visual final".

Tidak ada pertanyaan terbuka. Dokumen ini final per 2026-10-08 dan jadi sumber kebenaran untuk `CLAUDE.md` di repo.

Setelah ini terjawab, langkah berikutnya yang saya usulkan: prototipe fase 1 untuk satu halaman saja (1.11 Transaction, karena punya snippet lab, stackstep, dan runsql) di Astro + Starlight, supaya biaya porting terukur sebelum memutuskan generator.

### Sumber yang dirujuk

Tautan sumber ada langsung di tabel dan daftar tempat klaimnya dipakai (bagian Fitur, Ancaman, Tren, Tech stack, dan Hands-on). Sumber primer yang masih harus dibuka saat menulis halaman: dokumentasi Astro dan Starlight, PGlite, Playwright, Cloudflare Pages, GitHub Codespaces, OWASP Top 10:2025 dan ASVS, OWASP Mobile Top 10, NIST SP 800-57, laporan FBI IC3, dan survei CNCF yang angkanya baru saya lihat lewat kutipan sekunder. Tiga tautan yang kamu kirim (OWASP Input Validation Cheat Sheet, OWASP Mobile Top 10, Flutter Networking) tetap cocok untuk bacaan lanjut Tahap 1 dan 3.
