# Status

Diperbarui: 2026-10-07. Catatan singkat tentang keadaan panduan dan pekerjaan yang masih terbuka. Keputusan dan alasannya ada di [KEPUTUSAN.md](KEPUTUSAN.md).

## Keadaan sekarang

- 60 halaman ada (pembuka, Tahap 1–5, satu studi desain sampingan, enam halaman alat). `tools/cek_batch.sh` lolos: build strict, ID internal, audit bahasa (0 error), 103 tes widget, layar pertama 60 halaman × 4 ukuran.
- 26 lab. Semua lab di database bersama memakai schema sendiri, dan lab gagal keras bila skema, hasil, atau port-nya salah (keputusan 79–81, 95). Log beberapa proses diurutkan menurut waktu tulis (keputusan 96).
- Glosarium punya 98 istilah di bagian "Semua istilah". Rujukan halaman MVCC dan monolith sudah cocok dengan isi halamannya (keputusan 94).
- Istilah teknis ditulis dalam bahasa Inggris, idiom terjemahan literal sudah diganti, dan fragmen kalimat di prosa diberi predikat (keputusan 86, 87, 93). Tabel angka di kelima halaman tahap berlabel asumsi per baris (keputusan 88).
- Halaman Tahap 1 yang memakai materi Tahap 2 punya penjelasan singkat di tempat (keputusan 92).
- Link yang menolak bot sudah diverifikasi lewat API metadata (keputusan 98).

## Terbuka

| Topik | Catatan |
|---|---|
| Halaman dengan perkiraan waktu baca > 7 menit | Terutama 2.1 dan 1.11, juga 1.7, 1.12, 1.15, 2.3, 2.8, 3.7, 4.1. Menunggu catatan review; jangan dipecah atau diringkas sebelum itu. |
| Istilah lain tanpa entri glosarium | Belum dipindai ulang setelah penambahan 2026-10-07. Kandidat dari pemindaian sebelumnya: DTO, dependency injection, PL/pgSQL, Kubernetes, bottleneck, service mesh, event bus, authorization code, Read Committed. |
| Label pendek di widget pilah | Field "kenapa" di beberapa widget pilah dibuka dengan label tanpa predikat ("Faktor puncak."). Dibiarkan sebagai gaya kartu (keputusan 93). |
| Mode lab berbahasa Indonesia | Nama mode dan file `e3-idempotency` (`kunci-sama`, `kunci-baru`) dan identifier widget `ember` tetap (keputusan 86). |
