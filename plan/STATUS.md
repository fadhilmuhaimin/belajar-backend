# Status

Diperbarui: 2026-10-07. Catatan singkat tentang keadaan panduan dan pekerjaan yang masih terbuka. Keputusan dan alasannya ada di [KEPUTUSAN.md](KEPUTUSAN.md).

## Keadaan sekarang

- 60 halaman ada (pembuka, Tahap 1–5, satu studi desain sampingan, enam halaman alat). `tools/cek_batch.sh` lolos: build strict, ID internal, audit bahasa (0 error), 103 tes widget, layar pertama 60 halaman × 4 ukuran.
- 26 lab. Semua lab di database bersama memakai schema sendiri dan gagal keras bila skema atau hasilnya salah (keputusan 79–81). Rekaman `b3-race`, `b3-stack`, `e3-idempotency`, `b11-2-proxy`, `b11-integrasi`, `c4-ratelimit`, dan `t5-replika` direkam ulang di database bersih pada 2026-10-07.
- Glosarium punya 79 istilah di bagian "Semua istilah", termasuk token, idempotency key, CI, ORM, microservice, primary, p95/p50, token bucket, dan source of truth.
- Istilah key, signature, bucket, session, dan topic ditulis dalam bahasa Inggris; idiom terjemahan literal diganti (keputusan 86–87). Tabel angka di kelima halaman tahap berlabel asumsi per baris (keputusan 88).

## Terbuka

| Topik | Catatan |
|---|---|
| Halaman dengan perkiraan waktu baca > 7 menit | Terutama 2.1 dan 1.11. Menunggu catatan review; jangan dipecah atau diringkas sebelum itu. |
| Istilah yang dipakai sebelum dijelaskan dan belum ada di glosarium | router, middleware (sebelum 1.14), invarian, lease, at-least-once, FCM, reverse proxy, API gateway, semaphore, phantom read, nonrepeatable read, serialization anomaly, snapshot, LSN/WAL, partitioning, round trip, fan-out, saga, read-your-writes. |
| Rujukan glosarium yang tidak cocok | MVCC menunjuk 2.2, padahal 2.2 tidak menyebut MVCC. Monolith menunjuk 1.1, padahal prosa 1.1 tidak mendefinisikannya. |
| Fragmen kalimat tanpa predikat | Contoh: tahap-1 "Satu request per tujuh detik…", 1.15 "Sepuluh menit per perubahan.", 3.3 "Gantinya: retry, dead-letter…" (di bagian Inti), 3.4, studi desain sampingan, beberapa widget. |
| Halaman Tahap 1 yang bertumpu pada materi Tahap 2 | 1.15 bagian regression test race, 1.11 rujukan rekaman Tahap 2, 1.18 bagian race. |
| Kalimat basi | 2.1 masih menulis "Halaman lain di Tahap 2 dan Tahap 3 menyusul." |
| `plan/STORY.md` | Masih memuat jejak percakapan perencanaan ("GATE A", "usulanmu", "sesi ini"). |
| Lab | Urutan baris log dari dua proses paralel bisa tertukar (`b11-2-proxy` bagian D, `t3-bayar` worker-retry). Lab sebelum halaman 3.7 belum semuanya gagal keras bila port terpakai. File output yang tidak dirujuk halaman: `e2-sync/output/tanpa-antrean.txt` (duplikat `tanpa-queue.txt`), `b10-2-webhook/output/a-normal.txt`, `b11-2-proxy/output/b-timeout.txt`, `c-tanpa-timeout.txt`. |
| Link | `doi.org/10.1287/opre.9.3.383` dan dua tautan PubMed memasang verifikasi bot; perlu dicek manual oleh manusia. |
| Build | Banner peringatan Material ("MkDocs 2.0") tercetak di setiap build; tidak menggagalkan apa pun. Dependency tetap di-pin (`mkdocs==1.6.1`, `mkdocs-material==9.7.7`). |
