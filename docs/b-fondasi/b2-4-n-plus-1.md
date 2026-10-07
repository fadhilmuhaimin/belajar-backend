---
title: "2.5 N+1 query"
---

<div data-bb="kamu-di-sini" data-tahap="2"></div>

# 2.5 N+1 query

Baca 6 menit · coba 2 menit · Prasyarat: [[B2.1]]
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Layar menampilkan 100 pesanan beserta itemnya. Berapa query kalau item diambil per pesanan?
    2. Kenapa N+1 sering tidak terlihat di laptop developer?
    3. Apa bedanya `select_related` dan `prefetch_related` di Django?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

N+1 terjadi saat kode menjalankan satu query untuk daftar, lalu satu query lagi untuk setiap item. Jumlah query tumbuh bersama jumlah data, dan setiap query menambah satu perjalanan ke database. Perbaikannya: ambil semua sekaligus.

<div data-bb="arsitektur" data-tahap="2"></div>

## Lihat sendiri

Jalankan SQL sungguhan di browser. Hitung langkah di kedua panel.

<div data-bb="runsql" data-src="data/b2-4-n1.json"></div>

## Kenapa ini ada

Di Tahap 2, Ani mengeluh layar riwayat penjualannya lambat. Raka heran, karena tabel pesanan Warung Ani baru beberapa ribu baris.

Ternyata kodenya mengambil 100 pesanan terbaru, lalu untuk setiap pesanan mengambil itemnya. Satu layar, 101 query. Di laptop Raka, dengan 10 pesanan uji dan database di mesin yang sama, layar itu terasa instan.

Di Flutter, pola yang sama muncul saat `ListView.builder` memanggil API detail untuk setiap baris. Bedanya, di backend setiap query juga memegang koneksi database yang jumlahnya terbatas ([[B2.5]]).

## Cara kerjanya

**Sumber biayanya adalah jumlah perjalanan, bukan ukuran data.** Setiap query butuh perjalanan bolak-balik ke database: kirim, parse, rencanakan, jalankan, kirim hasil. Rekaman di PostgreSQL 17 dengan 200.000 pesanan, index sudah terpasang:

```text title="Output rekaman: labs/b2-query/output/n1.txt"
--8<-- "labs/b2-query/output/n1.txt"
```

Ini di localhost, tanpa jaringan. Di production, database biasanya di mesin lain. Setiap query menambah latency jaringan, jadi selisihnya makin besar. Berapa tepatnya bergantung pada jaringanmu sendiri; ukur, jangan ditebak.

**Dua cara memperbaiki:**

| Cara | Query | Cocok untuk |
|---|---|---|
| `JOIN` | 1 | Data induk dan anak dibaca bersama, jumlah anak sedikit |
| Dua query: daftar, lalu `WHERE pesanan_id IN (...)` | 2 | Anak banyak atau berat, supaya baris induk tidak terulang |

**Cara menemukan N+1:** hitung query per request di log atau trace ([[C2]]). Pola yang jelas: query yang sama dengan parameter berbeda, berulang puluhan kali dalam satu request.

## Di stack lain

**Skenario:** riwayat 100 pesanan Warung Ani beserta itemnya. Tidak ada tab yang dijalankan di lab; semua dicek ke dokumentasi. Angka di atas berasal dari SQL langsung.

Yang sama di semua stack: relasi yang diakses di dalam loop memicu query baru. Yang berbeda: **cara meminta data berelasi sekaligus**.

=== "Go"

    *Tidak dijalankan. Pola SQL-nya sama dengan panel After di widget.*

    ```go
    rows, err := db.QueryContext(ctx, `
        SELECT p.id, p.total, i.nama, i.jumlah, i.harga
        FROM pesanan p JOIN item_pesanan i ON i.pesanan_id = p.id
        WHERE p.toko_id = $1 ORDER BY p.dibuat DESC`, tokoID)
    ```

    **Yang berbeda di stack ini:** tidak ada ORM yang menyembunyikan query. N+1 terlihat jelas sebagai query di dalam `for`.
    {: .bb-beda }

=== "Laravel"

    *Tidak dijalankan. Dicek ke [Laravel: Eager loading](https://laravel.com/docs/12.x/eloquent-relationships#eager-loading).*

    ```php
    $pesanan = Pesanan::with('items')->where('toko_id', $tokoId)->latest()->take(100)->get();

    // AppServiceProvider::boot(): gagal keras kalau ada lazy loading di development
    Model::preventLazyLoading(! app()->isProduction());
    ```

    **Yang berbeda di stack ini:** `with()` memakai dua query (daftar + `IN`). `preventLazyLoading` membuat N+1 jadi error di development.
    {: .bb-beda }

=== "Django"

    *Tidak dijalankan. Dicek ke [Django: prefetch_related](https://docs.djangoproject.com/en/stable/ref/models/querysets/#prefetch-related).*

    ```python
    pesanan = (Pesanan.objects.filter(toko_id=toko_id)
               .order_by("-dibuat")
               .prefetch_related("items")[:100])
    ```

    **Yang berbeda di stack ini:** `select_related` memakai `JOIN` untuk relasi ke satu objek. `prefetch_related` memakai query terpisah untuk relasi ke banyak objek, lalu menggabungkannya di Python.
    {: .bb-beda }

=== "Spring"

    *Tidak dijalankan. Dicek ke [Spring Data JPA: query methods (@EntityGraph)](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html).*

    ```java
    @EntityGraph(attributePaths = "items")
    List<Pesanan> findTop100ByTokoIdOrderByDibuatDesc(Long tokoId);
    ```

    **Yang berbeda di stack ini:** relasi koleksi JPA bersifat lazy secara bawaan, jadi N+1 muncul saat `getItems()` dipanggil di loop.
    {: .bb-beda }

=== "Supabase"

    *Tidak dijalankan. Dicek ke [Supabase: Joins and nesting](https://supabase.com/docs/guides/database/joins-and-nesting).*

    ```dart
    final data = await supabase.from('pesanan')
        .select('id, total, item_pesanan(nama, jumlah, harga)')
        .eq('toko_id', tokoId).order('dibuat', ascending: false).limit(100);
    ```

    **Yang berbeda di stack ini:** relasi dideteksi dari foreign key, dan satu request mengambil induk beserta anaknya.
    {: .bb-beda }

## Trade-off: kapan pakai apa

| Pilihan | Kelebihan | Kekurangan |
|---|---|---|
| Lazy loading (bawaan banyak ORM) | Kode paling ringkas | N+1 tersembunyi, jumlah query tumbuh bersama data |
| `JOIN` | Satu perjalanan | Baris induk terulang untuk setiap anak |
| Dua query dengan `IN` | Tanpa duplikasi baris induk | Dua perjalanan, dan daftar `IN` bisa panjang |
| Cache hasilnya | Cepat setelah pertama | Menyembunyikan query yang buruk; data bisa stale (Tahap 3) |

## Cek diri

**1.** Endpoint riwayat memakai pagination 20 per halaman. Apakah N+1 masih masalah?

??? success "Jawaban"

    Masih. 21 query per halaman, setiap kali halaman dibuka. Rekaman: 4,5 ms vs 0,5 ms di localhost. Dengan latency jaringan, selisihnya membesar sebanding jumlah query.

**2.** Jelaskan kenapa N+1 tidak terlihat di laptop developer, tapi terasa di production.

??? success "Jawaban"

    Di laptop, datanya sedikit dan database ada di mesin yang sama, jadi setiap perjalanan hampir tanpa latency. Di production, jumlah pesanan lebih banyak dan setiap query menyeberangi jaringan. Biaya per query kecil, tapi dikali N.

**3.** Raka berencana memasang cache untuk riwayat penjualan. Apa yang sebaiknya dilakukan dulu?

??? success "Jawaban"

    Hitung query per request dan perbaiki N+1. Cache di atas N+1 tetap menjalankan 101 query setiap kali cache kosong atau kedaluwarsa, dan menambah risiko data stale.

## Saat me-review kode AI, cek ini

- [ ] Tidak ada query database di dalam loop atas hasil query lain.
- [ ] Relasi yang dipakai di response diminta sekaligus (`JOIN`, `with`, `prefetch_related`, `@EntityGraph`).
- [ ] Ada batas jumlah baris (pagination) untuk daftar.
- [ ] Untuk endpoint daftar, jumlah query per request tidak bergantung pada jumlah baris.

## Bacaan lanjut

- [Laravel: Eager loading](https://laravel.com/docs/12.x/eloquent-relationships#eager-loading)
- [Django: select_related](https://docs.djangoproject.com/en/stable/ref/models/querysets/#select-related) · [prefetch_related](https://docs.djangoproject.com/en/stable/ref/models/querysets/#prefetch-related)
- [Use The Index, Luke](https://use-the-index-luke.com/)

<div data-bb="umpan-balik"></div>
