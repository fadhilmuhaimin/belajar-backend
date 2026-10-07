---
title: "Tahap 3 · Lambat di jam sibuk"
---

<div data-bb="kamu-di-sini" data-tahap="3"></div>

# Tahap 3 · Lambat di jam sibuk

Baca 5 menit · Halaman tahap · Jalur inti
{: .meta }

## Inti

Puncak Rekeningo hanya ±17 request per detik, tapi app lambat di jam makan siang. Penyebabnya pekerjaan lambat di jalur request.

<div data-bb="arsitektur" data-tahap="3"></div>

## Ceritanya

Rekeningo kini dipakai warung dan apotek kecil di satu kota. Tim backend jadi empat orang.

Setiap hari jam 12.00–12.30, keluhan masuk: tombol Bayar berputar lama, lalu muncul "timeout". Raka ingin langsung menambah server. Tapi ia belum tahu bagian mana yang lambat.

Setelah memasang trace, jawabannya terlihat. Endpoint bayar membuka transaction, lalu memanggil API notifikasi dan mengirim email **di dalam transaction itu**. Koneksi database tertahan sekitar 2 detik per request. Request lain menunggu koneksi kosong dari pool.

Ani juga mengeluh. Perubahan stok yang ia buat saat sinyal hilang ikut hilang.

## Angka di tahap ini

Semua angka adalah asumsi cerita.

| Besaran | Nilai | Cara hitung |
|---|---|---|
| User terdaftar | 10.000 | asumsi |
| User aktif harian (DAU) | 2.500 | 10.000 × 25% |
| Request per hari | 150.000 | 2.500 × 60 request (polling status pesanan menambah request) |
| Puncak request per detik | ±17 | 150.000 ÷ 86.400 × 10 |
| Data transaksi per tahun | ±550 MB | 2.500 × 2 transaksi × 365 × 300 B |

Kenapa 17 request per detik bisa membuat app lambat? **Little's Law**: jumlah koneksi yang sedang dipegang (L) sama dengan laju request (λ) dikali lama koneksi dipegang (W).

| Kondisi | λ (asumsi) | W (asumsi) | L = λ × W |
|---|---|---|---|
| Notifikasi + email di dalam transaction | 17 per detik | 2 detik | **±34 koneksi** |
| Notifikasi dipindah ke worker | 17 per detik | 0,02 detik | **±0,34 koneksi** |

Pool bawaan [node-postgres](https://node-postgres.com/apis/pool) dan [HikariCP](https://github.com/brettwooldridge/HikariCP) berisi 10 koneksi. Jadi 34 koneksi yang dibutuhkan tidak muat, dan request lain mengantre. Perbaikan yang tepat adalah memperkecil W, bukan memperbesar pool. Hitungan lengkapnya ada di [[B2.5]].

## Masalah yang muncul

Urutan di tabel ini adalah urutan baca yang disarankan.

<!-- daftar-tahap -->
| Masalah | Halaman |
|---|---|
| Tidak tahu bagian mana yang lambat | [3.1 Observability: log, metric, trace](../c-operasional/c2-observability.md) |
| Request menunggu koneksi database di jam sibuk | [3.2 Connection pool](../b-fondasi/b2-5-connection-pool.md) |
| Notifikasi dan email memperlambat request bayar | [3.3 Background job, queue, retry](../b-fondasi/b10-1-background-job.md) |
| Bingung: thread, event loop, goroutine, worker | [3.4 Concurrency dan async](../b-fondasi/b8-concurrency.md) |
| App polling status pesanan tiap 5 detik | [3.5 Push dan real-time](../e-mobile/e4-push-real-time.md) |
| Katalog dibaca ribuan kali dengan isi sama; harga lama muncul | [3.6 Caching dan invalidation](../b-fondasi/b9-caching.md) |
| Login dicoba ribuan kali dari satu IP | [3.7 Security dasar dan rate limit](../c-operasional/c4-security-dasar.md) |
| Perubahan stok saat offline hilang | [3.8 Offline-first dan sync](../e-mobile/e2-offline-first.md) |
<!-- /daftar-tahap -->

## Sengaja belum dilakukan

- **Microservice.** Masalahnya pekerjaan lambat di jalur request, bukan batas tim. Worker dari codebase yang sama sudah cukup.
- **Read replica.** Database belum jadi bottleneck menurut metric. Replica menambah masalah consistency.
- **Message broker besar.** Redis atau tabel database sebagai queue sudah cukup untuk volume ini [perlu verifikasi dengan load test].
- **Menambah server tanpa mengukur.** Dua instance dipasang untuk deploy tanpa downtime, bukan untuk "mengatasi lambat".


<div data-bb="umpan-balik"></div>
