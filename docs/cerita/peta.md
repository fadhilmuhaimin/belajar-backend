---
title: Peta cerita
---

# Peta cerita

Halaman navigasi · progress tersimpan di browser ini
{: .meta }

## Inti

Lima tahap Rekeningo (fiktif), dari 100 sampai sejuta user. Biru menandai komponen yang baru di tahap itu. Progress dihitung dari halaman yang kamu tandai selesai.

<div data-bb="peta-cerita"></div>

## Ketemu masalah? Cari di sini

Setiap halaman konsep menjawab satu masalah. Ketik kata kuncinya, mis. "lambat" atau "dobel".

<div data-bb="indeks-masalah"></div>

## Arah arsitekturnya

Rekeningo tidak langsung memakai microservice. Setiap langkah baru diambil setelah sinyalnya terlihat.

| Perubahan | Kapan | Sinyal yang harus terlihat dulu |
|---|---|---|
| Monolith | Tahap 1 | – |
| Monolith + worker | Tahap 3 | Trace menunjukkan request menunggu email atau API luar |
| Modular monolith | Tahap 4 awal | Dua tim sering bentrok di codebase yang sama |
| Pecah satu service (pembayaran) | Tahap 4 akhir | Satu modul butuh audit, credential, dan ritme rilis yang berbeda |
| Data antar service | Tahap 5 | Satu operasi bisnis menyentuh dua database |

Dasar urutan "monolith dulu" adalah pengamatan praktisi, bukan hasil penelitian terkontrol ([Fowler: Monolith First](https://martinfowler.com/bliki/MonolithFirst.html)).

<div data-bb="umpan-balik"></div>
