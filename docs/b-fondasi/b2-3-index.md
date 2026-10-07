---
title: "2.6 Index dan query plan"
---

<div data-bb="kamu-di-sini" data-tahap="2"></div>

# 2.6 Index dan query plan

Baca 7 menit · coba 3 menit · Prasyarat: [[B2.4]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Apakah foreign key otomatis punya index di PostgreSQL?
    2. Index `(toko_id, dibuat)` membantu query yang hanya memfilter `dibuat`?
    3. Apa biaya sebuah index?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

Tanpa index, database membaca seluruh tabel untuk menemukan beberapa baris. Index dibuat dari pola query: kolom di `WHERE`, lalu kolom urutan. `EXPLAIN` menunjukkan apakah index benar-benar dipakai.

<div data-bb="arsitektur" data-tahap="2"></div>

## Lihat sendiri

SQLite sungguhan di browser, 20.000 pesanan. Tebak dulu, lalu bandingkan rencana query di kedua panel.

<div data-bb="runsql" data-src="data/b2-3-index.json"></div>

## Kenapa ini ada

Setelah N+1 diperbaiki ([[B2.4]]), riwayat penjualan Ani lebih cepat. Tapi seiring bulan berjalan, layar itu melambat lagi.

Tabel pesanan kini berisi pesanan dari semua toko. Untuk menampilkan 20 pesanan terbaru Warung Ani, database memeriksa setiap baris pesanan semua toko, lalu mengurutkannya. Semakin banyak toko bergabung, semakin lambat layar Ani, padahal jumlah pesanan Ani sendiri tidak berubah banyak.

## Cara kerjanya

**Index** adalah struktur data tambahan, biasanya B-tree, yang menyimpan nilai kolom secara terurut beserta letak barisnya. Mirip daftar isi: database bisa lompat ke baris yang dicari tanpa membaca semuanya ([PostgreSQL: Indexes](https://www.postgresql.org/docs/current/indexes.html)).

Rekaman di PostgreSQL 17 dengan 200.000 pesanan dan 600.000 item:

```text title="Output rekaman: labs/b2-query/output/index.txt"
--8<-- "labs/b2-query/output/index.txt"
```

Yang terbaca dari rekaman:

| Query | Tanpa index | Dengan index |
|---|---|---|
| 20 pesanan terbaru toko 1 | Parallel Seq Scan, 98.000 baris dibuang per proses paralel, ±4,3 ms | Index Scan, ±0,04 ms |
| Item satu pesanan | Parallel Seq Scan atas 600.000 item, ±6,7 ms | Index Scan, ±0,02 ms |

Angka ini dari satu mesin lab. Besaran relatifnya yang penting: ratusan kali lipat. Waktu absolut di sistemmu akan berbeda.

**Tiga aturan dari rekaman:**

1. **Foreign key tidak otomatis di-index.** `item_pesanan.pesanan_id` menunjuk `pesanan.id`, tapi query item tetap memindai seluruh tabel sampai index dibuat. Dokumentasi PostgreSQL menyebut deklarasi foreign key tidak membuat index pada kolom perujuk ([Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)).
2. **Urutan kolom penting.** Index `(toko_id, dibuat DESC)` melayani "toko ini, urut terbaru". Query yang hanya memfilter `dibuat` tidak bisa memakainya, dan kembali ke Seq Scan (bagian 4 rekaman).
3. **Index punya biaya.** Ukurannya 6–10 MB di sini, dan setiap `INSERT` atau `UPDATE` juga harus memperbarui index. Buat index untuk query yang benar-benar ada, bukan untuk setiap kolom.

**Membaca rencana query:** `Seq Scan` (PostgreSQL) atau `SCAN` (SQLite) berarti membaca seluruh tabel. `Index Scan` atau `SEARCH ... USING INDEX` berarti memakai index. `EXPLAIN ANALYZE` menjalankan query dan menampilkan waktu sebenarnya ([PostgreSQL: Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)).

## Di stack lain

**Skenario:** index `(toko_id, dibuat)` untuk riwayat penjualan. Tidak ada tab yang dijalankan; semua dicek ke dokumentasi. Perilaku index-nya dijalankan di rekaman PostgreSQL di atas.

Yang sama di semua stack: index dibuat lewat migration, dan diperiksa dengan `EXPLAIN`. Yang berbeda: sintaks migration.

=== "SQL (Go, Spring)"

    *Index biasa dijalankan di rekaman di atas. Varian `CONCURRENTLY` tidak dijalankan, dicek ke dokumentasi.*

    ```sql
    CREATE INDEX CONCURRENTLY pesanan_toko_dibuat_idx ON pesanan (toko_id, dibuat DESC);
    ```

    **Yang berbeda di stack ini:** `CONCURRENTLY` membuat index tanpa memblokir penulisan, tapi tidak bisa dijalankan di dalam transaction ([CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)). Banyak alat migration perlu konfigurasi khusus untuk itu.
    {: .bb-beda }

=== "Laravel"

    *Tidak dijalankan. Dicek ke [Laravel: Indexes](https://laravel.com/docs/12.x/migrations#indexes).*

    ```php
    Schema::table('pesanan', function (Blueprint $table) {
        $table->index(['toko_id', 'dibuat']);
    });
    ```

    **Yang berbeda di stack ini:** `foreignId()->constrained()` membuat foreign key. Index-nya tetap harus diperiksa sesuai database yang dipakai.
    {: .bb-beda }

=== "Django"

    *Tidak dijalankan. Dicek ke [Django: Model Meta options (indexes)](https://docs.djangoproject.com/en/stable/ref/models/options/#indexes).*

    ```python
    class Pesanan(models.Model):
        class Meta:
            indexes = [models.Index(fields=["toko", "-dibuat"])]
    ```

    **Yang berbeda di stack ini:** Django membuat index untuk `ForeignKey` secara bawaan (`db_index=True`), jadi kasus item di rekaman tidak terjadi kalau tabel dibuat lewat model Django.
    {: .bb-beda }

=== "Supabase"

    *Tidak dijalankan. Dicek ke [Supabase: Index advisor](https://supabase.com/docs/guides/database/extensions/index_advisor).*

    ```sql
    create index pesanan_toko_dibuat_idx on pesanan (toko_id, dibuat desc);
    ```

    **Yang berbeda di stack ini:** PostgreSQL biasa. Ada extension `index_advisor` yang mengusulkan index untuk sebuah query.
    {: .bb-beda }

## Trade-off: kapan pakai apa

| Pilihan | Kelebihan | Kekurangan |
|---|---|---|
| Tanpa index tambahan | Tulis paling cepat, ruang paling kecil | Baca melambat seiring tabel membesar |
| Index sesuai pola query | Baca jauh lebih cepat (rekaman: ratusan kali) | Ruang disk, penulisan sedikit lebih lambat |
| Index di setiap kolom | Terasa aman | Banyak index tidak pernah dipakai, tapi semua dibayar saat menulis |

## Cek diri

**1.** Query `WHERE toko_id = 1 ORDER BY dibuat DESC LIMIT 20` lambat. Index mana yang kamu buat: `(dibuat)`, `(toko_id)`, atau `(toko_id, dibuat)`?

??? success "Jawaban"

    `(toko_id, dibuat)`. Kolom di `WHERE` lebih dulu, lalu kolom urutan. Database lompat ke toko 1 dan membaca 20 baris pertama yang sudah terurut. Di widget, index `(dibuat)` saja membuat SQLite memindai index sambil menyaring toko.

**2.** Jelaskan kenapa menambah index tidak selalu membuat sistem lebih cepat.

??? success "Jawaban"

    Setiap index harus diperbarui saat baris ditulis atau diubah, dan memakan ruang disk serta memori. Index yang tidak dipakai query mana pun hanya menambah biaya penulisan. Index dipilih dari query yang benar-benar dijalankan.

**3.** Kolom `item_pesanan.pesanan_id` punya foreign key. Perlukah index?

??? success "Jawaban"

    Di PostgreSQL, ya, kalau item dicari per pesanan atau kalau pesanan pernah dihapus. Foreign key tidak membuat index sendiri. Rekaman: tanpa index, mencari 3 item memindai 600.000 baris.

## Saat me-review kode AI, cek ini

- [ ] Setiap query daftar yang sering dipakai punya index yang cocok dengan `WHERE` dan `ORDER BY`-nya.
- [ ] Kolom foreign key yang dipakai untuk mencari punya index.
- [ ] Index baru di tabel besar dibuat tanpa memblokir penulisan (`CONCURRENTLY` di PostgreSQL).
- [ ] Ada bukti `EXPLAIN` untuk query yang diklaim "sudah dioptimasi".

## Bacaan lanjut

- [PostgreSQL: Indexes](https://www.postgresql.org/docs/current/indexes.html) · [Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [SQLite: EXPLAIN QUERY PLAN](https://www.sqlite.org/eqp.html)
- [Use The Index, Luke](https://use-the-index-luke.com/)

<div data-bb="umpan-balik"></div>
