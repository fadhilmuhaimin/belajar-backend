# Belajar Backend

Panduan konsep backend lintas stack untuk mobile engineer. Kamu mengikuti aplikasi fiktif **Rekeningo** yang tumbuh dalam lima tahap: dari MVP, ke saldo yang salah dan request ganda, ke lambat di jam sibuk, ke integrasi pihak ketiga, sampai satu database tidak cukup. Setiap masalah di cerita membawa kamu ke satu konsep: transaction, lock, idempotency key, connection pool, queue, cache, webhook, replica, dan lainnya.

Panduan ini ditulis dalam bahasa Indonesia. Istilah teknis tetap dalam bahasa Inggris, karena istilah itu yang akan kamu temui di dokumentasi dan kode.

Yang membedakan panduan ini:

- **Konsep dulu, stack kemudian.** Contoh utama memakai Go dan PostgreSQL. Bagian "Di stack lain" membandingkannya dengan Laravel, Express, Django, Spring, dan BaaS.
- **Output asli, bukan karangan.** Setiap status code, query plan, dan angka di halaman yang ditandai **Rekaman lab** berasal dari lab di folder `labs/` yang bisa kamu jalankan sendiri. Yang tidak direkam ditandai **Ilustrasi**, **asumsi**, atau **[perlu verifikasi]**.
- **Dari sudut pandang app.** Banyak halaman dimulai dari layar HP: apa yang dilihat user saat backend salah.

## Isi repo

| Folder | Isi |
|---|---|
| `docs/` | Halaman panduan (Markdown), widget interaktif, dan data cerita |
| `docs/widgets/data/cerita.json` | Registry semua halaman dan angka asumsi cerita; satu-satunya sumber urutan baca |
| `labs/` | Lab yang menghasilkan rekaman di halaman (Go, Python, Dart, Node, PostgreSQL, Redis) |
| `tools/` | Skrip sinkronisasi, pemeriksaan, dan hook MkDocs |
| `tests/` | Tes widget (Node) |
| `plan/` | Rancangan cerita (`STORY.md`) dan catatan keputusan desain (`KEPUTUSAN.md`) |

## Menjalankan situs

Butuh Python 3.10 atau lebih baru (dikunci dan dites dengan 3.14).

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/mkdocs serve
```

Buka `http://127.0.0.1:8000`. Versi yang dikunci di `requirements.txt` antara lain `mkdocs==1.6.1` dan `mkdocs-material==9.7.7`. Versi lain belum dites, dan build strict bisa gagal karena perubahan perilaku plugin.

Build statis, wajib lolos sebelum perubahan dikirim:

```bash
.venv/bin/mkdocs build --strict
```

### Font

File font tidak ikut repo. Satoshi memakai ITF Free Font License, yang mengizinkan self-host untuk situs sendiri tetapi melarang redistribusi file font, termasuk lewat repo publik. Unduh font ke folder proyek (bukan instalasi sistem):

```bash
bash tools/get_fonts.sh
```

Tanpa langkah ini situs tetap berjalan dengan font fallback (`Inter, system-ui, sans-serif`). JetBrains Mono untuk kode memakai SIL Open Font License 1.1.

## Pemeriksaan

```bash
bash tools/cek_batch.sh
```

Skrip ini memeriksa sinkronisasi cerita dan angka asumsi, istilah, build strict, ID internal yang tidak boleh tampil, audit bahasa, tes widget, dan layar pertama setiap halaman di empat ukuran layar. Selain Python, kamu butuh Node 22 atau lebih baru, dan Chrome atau Chromium untuk pemeriksaan layar pertama (`CHROME_PATH` kalau lokasinya tidak standar). Pemeriksaan layar pertama mengukur dengan font asli, jadi jalankan `bash tools/get_fonts.sh` dulu. Dengan font fallback, teks lebih tinggi dan halaman bisa gagal di layar 375×667. Lama jalannya sekitar 2–3 menit.

Lolos semua adalah syarat minimum, bukan bukti kualitas.

## Menjalankan lab

Setiap halaman yang menampilkan **Rekaman lab** menyebut file output-nya, misalnya `labs/api-t1/output/b1-1-http.txt`. Output yang direkam sudah ada di repo. Kamu menjalankan lab untuk melihat perilakunya sendiri, atau untuk membuat ulang rekaman setelah mengubah kode lab.

### Yang dibutuhkan

| Alat | Versi yang direkam | Dipakai lab |
|---|---|---|
| Docker + Compose | – | Semua lab database (PostgreSQL 17), cache (Redis 8), replica, dan beberapa alat di image |
| Go | 1.27 | Sebagian besar server dan client lab |
| Python 3 | 3.14 | Skrip penggerak lab (`run.py`), dengan venv `labs/.venv` |
| Dart | 3.11 | Client app di lab retry, sync, dan ukuran payload |
| Node | 22+ | Lab concurrency dan perbandingan stack |
| PHP + Composer | – | Hanya untuk bagian Laravel di lab perbandingan stack |

### Langkah pertama

Hampir semua lab memakai satu PostgreSQL bersama di port `54333`. Setiap lab punya schema sendiri dan membuatnya ulang setiap kali dijalankan, jadi lab bisa dijalankan dalam urutan apa pun. Tidak ada lab yang menulis ke schema `public`.

| Schema | Lab |
|---|---|
| `t1` | `api-t1` |
| `b2`, `b2q` | `b2-model`, `b2-query` (`e5-payload` membaca `b2q`, jadi jalankan `b2-query` dulu) |
| `b3r`, `b3s`, `b33` | `b3-race`, `b3-stack`, `b3-isolasi` |
| `b4m`, `b4` | `b4-migration`, `b4-skema` |
| `b5`, `b9` | `b5-rls`, `b9-cache` |
| `pembayaran`, `pesanan` | `b7-2-modul` (dua modul, dua schema) |
| `e2`, `e3` | `e2-sync`, `e3-idempotency` |
| `t3`, `t4w`, `t5p` | `t3-bayar`, `b10-2-webhook`, `t5-skala` |

Lab yang gagal membuat schema-nya berhenti dengan error, bukan merekam hasil dari schema lama. Untuk mengosongkan seluruh database lab bersama, jalankan `make -C labs/b3-race down` lalu `make -C labs/b3-race up`. `t5-replika` dan Redis `b9-cache` memakai kontainer sendiri.

```bash
make -C labs/b3-race setup
```

```bash
make -C labs/b3-race up
```

`setup` membuat `labs/.venv` dan memasang `labs/requirements.txt`. `up` menjalankan PostgreSQL 17 di Docker. Kredensialnya (`lab`/`lab`) khusus lab lokal dan hanya mendengarkan `127.0.0.1`.

### Daftar lab

Lab yang punya `Makefile` dijalankan dengan `make -C labs/<nama> run`. Sisanya dijalankan dari foldernya.

| Lab | Halaman | Cara menjalankan |
|---|---|---|
| `api-t1` | 1.4–1.6, 1.12–1.16, 2.9 | `make -C labs/api-t1 run`; deploy: `labs/.venv/bin/python labs/api-t1/deploy.py` |
| `b1-openapi` | 1.7 | `make -C labs/b1-openapi run` |
| `b2-model` | 1.8 | `make -C labs/b2-model run` |
| `b4-migration` | 1.10 | `make -C labs/b4-migration run` |
| `b3-stack` | 1.11, 2.1 | `make -C labs/b3-stack run` (butuh Go, Node, PHP + Composer; gagal bila hasil satu stack tidak sesuai skenario) |
| `b5-rls` | 1.13 | `make -C labs/b5-rls run` |
| `f2-review` | 1.19 | `make -C labs/f2-review run` |
| `b3-race` | 2.1 | `make -C labs/b3-race run` |
| `b3-isolasi` | 2.2 | `make -C labs/b3-isolasi run` |
| `e3-idempotency` | 2.3 | `make -C labs/e3-idempotency run` |
| `b2-query` | 2.4–2.6 | `make -C labs/b2-query run` |
| `e5-payload` | 2.7 | `make -C labs/e5-payload run` |
| `b4-skema` | 2.8 | `make -C labs/b4-skema run` |
| `t3-bayar` | 3.1–3.3 | `make -C labs/t3-bayar run` |
| `b8-concurrency` | 3.4 | `make -C labs/b8-concurrency run` |
| `e4-realtime` | 3.5 | `make -C labs/e4-realtime run` |
| `b9-cache` | 3.6 | `make -C labs/b9-cache run` (Redis di compose sendiri) |
| `c4-ratelimit` | 3.7 | `make -C labs/c4-ratelimit run` |
| `e2-sync` | 3.8 | `make -C labs/e2-sync run` |
| `b11-integrasi` | 4.1 | `cd labs/b11-integrasi && ../.venv/bin/python run.py` |
| `b11-2-proxy` | 4.2 | `cd labs/b11-2-proxy && ../.venv/bin/python run.py` |
| `b10-2-webhook` | 4.3 | `make -C labs/b10-2-webhook run` |
| `b5-2-oidc` | 4.4 | `cd labs/b5-2-oidc && go run .` |
| `b7-2-modul` | 4.5 | `make -C labs/b7-2-modul run` |
| `t5-skala` | 5.1 | `make -C labs/t5-skala run` |
| `t5-replika` | 5.2 | `make -C labs/t5-replika run`, lalu `make -C labs/t5-replika down` (primary + replica di compose sendiri, port 54340–54341) |

Lab server memakai port tetap di rentang 18080–18142. Lab sejak halaman 3.7 sengaja gagal kalau port sudah terpakai, supaya rekaman tidak diam-diam diambil dari server lama. Lab yang lebih lama belum semuanya diperiksa untuk pola ini, jadi pastikan proses lab sebelumnya sudah mati sebelum kamu menjalankan lab berikutnya.

Angka waktu (latency, downtime, jumlah request per detik) bergantung pada mesinmu. Yang harus sama dengan halaman adalah perilakunya: status code, saldo akhir, urutan kejadian.

### Semua pihak ketiga di lab adalah tiruan

Tidak ada lab yang menghubungi layanan luar atau butuh akun vendor. Payment gateway, layanan verifikasi identitas, object storage, server identitas (OAuth/OpenID Connect), layanan notifikasi, dan pengirim webhook di lab adalah program kecil di folder lab itu sendiri. Namanya netral, dan perilakunya (lambat, gagal, mengirim ulang) diatur supaya konsepnya terlihat. Program-program ini tidak meniru API vendor tertentu. Format webhook mengikuti spesifikasi terbuka Standard Webhooks.

Data di lab dan halaman juga karangan: nama user, NIK, nomor HP, email (`@contoh.test`), dan saldo. Kunci dan token dibuat ulang setiap kali lab berjalan, dan token di output disensor.

## Kontribusi

Lihat [CONTRIBUTING.md](CONTRIBUTING.md).

## Lisensi

- **Teks dan gambar panduan** (`docs/**/*.md`, data cerita dan skenario di `docs/widgets/data/`, ilustrasi di `docs/assets/cerita/`, `includes/`, `plan/`): [CC BY-SA 4.0](LICENSES/CC-BY-SA-4.0.txt). Kamu boleh menyalin, mengubah, dan menerbitkan ulang, termasuk untuk tujuan komersial, asal mencantumkan sumber dan membagikan hasil turunannya dengan lisensi yang sama.
- **Kode** (`tools/`, `labs/`, `tests/`, JavaScript dan CSS widget, `mkdocs.yml`): [MIT](LICENSE).
- **Pengecualian:** `docs/vendor/` (sql.js) dan dependency yang diunduh package manager memakai lisensinya masing-masing. File font tidak ikut repo (lihat bagian Font).
