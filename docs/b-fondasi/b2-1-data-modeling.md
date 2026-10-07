---
title: "1.8 Data modeling dan relasi"
---

<div data-bb="kamu-di-sini" data-tahap="1"></div>

# 1.8 Data modeling dan relasi

Baca 7 menit · coba 2 menit · Prasyarat: [[A1]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Pesanan menunjuk toko lewat `toko_id`. Apa yang menjamin toko itu benar-benar ada?
    2. Harga nasi goreng naik. Kenapa total pesanan kemarin tidak boleh ikut berubah?
    3. Kapan `ON DELETE CASCADE` berbahaya?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

Satu tabel untuk satu jenis benda, dan database menjaga relasinya lewat foreign key. Data yang harus tetap seperti saat kejadian, mis. harga, disalin.

<div data-bb="arsitektur" data-tahap="1"></div>

## Lihat sendiri

Jalankan SQL sungguhan di browser (SQLite lewat sql.js). Tebak dulu, lalu bandingkan panel Before dan After.

<div data-bb="runsql" data-src="data/b2-1-relasi.json"></div>

## Kenapa ini ada

Minggu pertama, Raka merancang tabel untuk transfer dan pesanan. Versi pertamanya satu tabel `pesanan` dengan kolom `nama_toko`, `nama_produk`, dan `harga`, persis seperti JSON yang ditampilkan app.

Masalahnya muncul cepat. Ani mengganti nama warungnya, dan pesanan lama tetap memakai nama lama. Lalu Ani menaikkan harga nasi goreng, dan Raka bingung: kolom `harga` di pesanan itu harga sekarang atau harga waktu dipesan?

Di app Flutter, bentuk data mengikuti layar. Di database, bentuk data mengikuti **benda dan hubungannya**, karena satu tabel dipakai banyak layar sekaligus.

## Cara kerjanya

**Satu tabel, satu jenis benda.** Rekeningo Tahap 1 punya enam tabel inti:

| Tabel | Satu baris adalah | Menunjuk ke |
|---|---|---|
| `akun` | Satu user atau satu toko | – |
| `transfer` | Satu perpindahan saldo | `akun` (dari, ke) |
| `toko` | Satu toko | `akun` pemiliknya |
| `produk` | Satu barang di satu toko | `toko` |
| `pesanan` | Satu pesanan | `akun`, `toko` |
| `item_pesanan` | Satu baris barang di satu pesanan | `pesanan`, `produk` |

**Primary key** mengenali satu baris. **Foreign key** adalah kolom yang menunjuk primary key tabel lain, dan database menolak rujukan ke baris yang tidak ada. Relasi "satu pesanan punya banyak item" dibuat dengan tabel `item_pesanan`, bukan kolom berisi daftar.

**Salin yang harus tetap, rujuk yang harus terkini.** Nama toko dirujuk lewat `toko_id`, karena pesanan lama sebaiknya menampilkan nama toko terbaru. Harga justru disalin ke `item_pesanan.harga`, karena total pesanan kemarin tidak boleh berubah saat harga hari ini naik.

Rekaman dari PostgreSQL 17, dengan skema yang sama:

```sql
--8<-- "labs/b2-model/skema.sql:skema"
```

```text title="Output rekaman: labs/b2-model/output/relasi.txt"
--8<-- "labs/b2-model/output/relasi.txt"
```

Perhatikan: harga nasi goreng di `produk` sudah Rp28.000, tapi total pesanan 1 tetap Rp35.000.

**Satu hal yang sering terlewat di mobile.** SQLite menulis foreign key di skema, tapi tidak menegakkannya kecuali setiap koneksi menjalankan `PRAGMA foreign_keys = ON` ([SQLite](https://www.sqlite.org/foreignkeys.html)). Panel Before di widget menunjukkannya. Ini juga berlaku untuk database lokal di app, mis. sqflite.

## Di stack lain

**Skenario:** relasi `pesanan.toko_id → toko.id`, penghapusan toko ditolak selama masih ada pesanan. Tab SQL dijalankan di lab. Tab lain tidak dijalankan, hanya dicek ke dokumentasi.

Yang sama di semua stack: relasinya jadi foreign key di database. Yang berbeda: **siapa yang menjalankan aturan saat baris induk dihapus**, database atau framework.

=== "SQL (Go, Spring)"

    *Dijalankan: PostgreSQL 17.11.*

    ```sql
    CREATE TABLE pesanan (
      id      bigint PRIMARY KEY,
      toko_id bigint NOT NULL REFERENCES toko(id)  -- bawaan: NO ACTION, hapus toko ditolak
    );
    ```

    **Yang berbeda di stack ini:** Go dan Spring dengan Flyway biasanya menulis skema sebagai SQL apa adanya. Aturannya terlihat langsung di file migration.
    {: .bb-beda }

=== "Laravel"

    *Tidak dijalankan. Dicek ke [Laravel: Foreign key constraints](https://laravel.com/docs/12.x/migrations#foreign-key-constraints).*

    ```php
    Schema::create('pesanan', function (Blueprint $table) {
        $table->id();
        $table->foreignId('toko_id')->constrained('toko')->restrictOnDelete();
    });
    ```

    **Yang berbeda di stack ini:** `constrained()` membuat foreign key di database, dan `restrictOnDelete()` menolak penghapusan toko.
    {: .bb-beda }

=== "Django"

    *Tidak dijalankan. Dicek ke [Django: ForeignKey.on_delete](https://docs.djangoproject.com/en/stable/ref/models/fields/#django.db.models.ForeignKey.on_delete).*

    ```python
    class Pesanan(models.Model):
        toko = models.ForeignKey(Toko, on_delete=models.PROTECT)
    ```

    **Yang berbeda di stack ini:** `PROTECT` dijalankan oleh Django di Python, bukan oleh database. Query SQL langsung yang menghapus toko tidak melewati aturan itu, kecuali foreign key di database juga menolaknya. Sejak Django 6.1 ada varian `DB_*` yang dikerjakan database.
    {: .bb-beda }

=== "Supabase"

    *Tidak dijalankan. Dicek ke [Supabase: Tables](https://supabase.com/docs/guides/database/tables).*

    ```sql
    -- supabase/migrations/..._pesanan.sql
    CREATE TABLE pesanan (
      id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      toko_id bigint NOT NULL REFERENCES toko(id)
    );
    ```

    **Yang berbeda di stack ini:** ini PostgreSQL biasa, jadi perilakunya sama dengan tab SQL. Relasi ini juga yang dipakai API otomatis untuk mengambil data berelasi.
    {: .bb-beda }

## Trade-off: kapan pakai apa

| Saat baris induk dihapus | Kelebihan | Kekurangan |
|---|---|---|
| `NO ACTION` / `RESTRICT` (tolak) | Riwayat aman, tidak ada baris yatim | Harus menghapus atau memindahkan anaknya dulu |
| `CASCADE` (ikut hapus) | Praktis untuk data turunan, mis. item draft keranjang | Satu `DELETE` bisa menghapus riwayat uang. Lihat toggle di widget |
| `SET NULL` | Anak tetap ada | Kolom harus boleh kosong, dan kode harus siap dengan `NULL` |
| Soft delete (kolom `dihapus_pada`) | Tidak ada yang benar-benar hilang | Setiap query harus ingat menyaring baris yang dihapus |

Untuk data uang dan riwayat transaksi, Rekeningo memakai tolak atau soft delete, dan tidak pernah `CASCADE`.

## Cek diri

**1.** Ani mengganti nama warungnya. Pesanan bulan lalu sebaiknya menampilkan nama lama atau nama baru, dan apa akibatnya ke desain tabel?

??? success "Jawaban"

    Untuk Rekeningo, nama baru, supaya Budi tetap mengenali tokonya. Jadi nama tidak disalin ke pesanan, cukup `toko_id`. Kalau suatu saat butuh nama persis seperti di struk, simpan salinannya di kolom terpisah, sama seperti harga.

**2.** Jelaskan kenapa `harga` di `item_pesanan` disalin, padahal sudah ada di `produk`.

??? success "Jawaban"

    `produk.harga` adalah harga sekarang dan bisa berubah. Pesanan mencatat kejadian di masa lalu, dan totalnya sudah dibayar. Kalau harga hanya dirujuk, total pesanan lama ikut berubah setiap harga naik. Rekaman lab: harga nasi goreng Rp28.000, total pesanan 1 tetap Rp35.000.

**3.** Di app Flutter dengan sqflite, kamu mendeklarasikan `REFERENCES` tapi data yatim tetap bisa masuk. Kenapa?

??? success "Jawaban"

    SQLite tidak menegakkan foreign key kecuali koneksi menjalankan `PRAGMA foreign_keys = ON`. Tanpa itu, `REFERENCES` hanya tulisan di skema. Panel Before di widget menunjukkan efeknya.

## Saat me-review kode AI, cek ini

- [ ] Setiap kolom `..._id` yang menunjuk tabel lain punya foreign key di database, bukan hanya di model ORM.
- [ ] Tidak ada `ON DELETE CASCADE` dari data utama ke riwayat uang atau transaksi.
- [ ] Data yang harus tetap seperti saat kejadian (harga, kurs, alamat kirim) disalin ke baris transaksinya.
- [ ] Daftar disimpan sebagai tabel relasi, bukan kolom teks berisi koma atau JSON yang perlu di-query.
- [ ] Nominal uang memakai integer (rupiah) atau `numeric`, bukan `float`.

## Bacaan lanjut

- [PostgreSQL: Foreign keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [SQLite: Foreign key support](https://www.sqlite.org/foreignkeys.html)
- Kleppmann & Riccomini, *Designing Data-Intensive Applications*, edisi 2 (2026), bab tentang model data

<div data-bb="umpan-balik"></div>
