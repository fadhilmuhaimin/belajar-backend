---
title: "Tahap 4 · Integrasi pihak ketiga"
---

<div data-bb="kamu-di-sini" data-tahap="4"></div>

# Tahap 4 · Integrasi pihak ketiga

Baca 5 menit · Halaman tahap · Jalur inti
{: .meta }

## Inti

Sistem pihak ketiga bisa lambat, mati, atau mengirim data dua kali. Hanya pembayaran yang keluar dari monolith.

<div data-bb="arsitektur" data-tahap="4"></div>

## Ceritanya

Sinta bekerja sama dengan sebuah payment gateway untuk top-up. Gateway itu kadang mengirim webhook yang sama dua kali.

Untuk saldo besar, Rekeningo harus memverifikasi identitas lewat layanan pihak ketiga. Layanan itu hanya menerima request dari IP yang didaftarkan. Ini asumsi cerita, bukan klaim regulasi.

Foto produk dan bukti pembayaran mulai menumpuk di server. Tim kini delapan orang dalam dua tim, dan keduanya sering bentrok saat deploy monolith yang sama.

## Angka di tahap ini

| Besaran | Nilai | Cara hitung |
|---|---|---|
| User terdaftar | 100.000 | asumsi |
| User aktif harian (DAU) | 20.000 | 100.000 × 20% |
| Request per hari | 1,2 juta | 20.000 × 60 request |
| Puncak request per detik | ±140 | 1,2 juta ÷ 86.400 × 10 |
| Data transaksi per tahun | ±4,4 GB | 20.000 × 2 transaksi × 365 × 300 B |
| File per tahun | ±365 GB | 2.000 upload per hari × 500 KB × 365 |

Angka file jauh lebih besar dari data transaksi. Karena itu file disimpan di object storage, bukan di database.

## Kenapa pembayaran yang dipecah

Memecah service menambah deploy, monitoring, dan panggilan jaringan yang bisa gagal. Jadi hanya modul yang punya alasan kuat yang dipecah.

| Modul | Alasan dipecah | Keputusan |
|---|---|---|
| Pembayaran | Credential gateway, audit ketat, ritme rilis lebih hati-hati | Service sendiri |
| Notifikasi | Sudah dipisah sebagai worker di Tahap 3 | Tetap worker |
| Katalog, pesanan | Belum ada kebutuhan yang berbeda | Modul di monolith |

## Masalah yang muncul

<!-- daftar-tahap -->
| Masalah | Halaman |
|---|---|
| Payment gateway lambat, request ikut menggantung | [4.1 Integrasi pihak ketiga](../b-fondasi/b11-integrasi-pihak-ketiga.md) |
| Layanan luar hanya menerima IP terdaftar; layar beranda butuh 5 request | [4.2 Proxy dan BFF](../b-fondasi/b11-2-proxy-bff.md) |
| Webhook dikirim dua kali; saldo bertambah dua kali | [4.3 Webhook dan outbox](../b-fondasi/b10-2-webhook-outbox.md) |
| Ingin login dengan akun lain milik user (login sosial) | [4.4 OAuth dan login sosial](../b-fondasi/b5-2-oauth-oidc.md) |
| Dua tim bentrok di satu codebase | [4.5 Modular monolith](../b-fondasi/b7-2-batas-modul.md) |
| Keputusan desain lupa alasannya | [4.6 Template ADR](../d-system-design/d5-adr.md) |
<!-- /daftar-tahap -->

## Sengaja belum dilakukan

- **Memecah semua modul jadi service.** Hanya pembayaran yang punya alasan kuat.
- **Service mesh atau event bus untuk semua hal.** Masalahnya belum ada.
- **Multi-region.** Belum ada tuntutan ketersediaan setinggi itu.


<div data-bb="umpan-balik"></div>
