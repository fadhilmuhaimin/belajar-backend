---
title: "2.2 Isolation level secara praktis"
---

<div data-bb="kamu-di-sini" data-tahap="2"></div>

# 2.2 Isolation level secara praktis

Baca 7 menit · coba 3 menit · Prasyarat: [[B3.2]]
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Isolation level bawaan PostgreSQL apa?
    2. Dalam satu transaction, `SELECT` yang sama dijalankan dua kali. Bisakah hasilnya berbeda?
    3. Apa yang wajib dilakukan aplikasi kalau memakai `REPEATABLE READ` atau `SERIALIZABLE`?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

Isolation level menentukan seberapa banyak perubahan transaction lain yang terlihat oleh transaction-mu. Level yang lebih ketat mencegah lebih banyak anomali, tapi harganya error yang harus di-retry.

<div data-bb="arsitektur" data-tahap="2"></div>

## Lihat sendiri

Kodenya sama dengan versi salah di [[B3.2]]: baca saldo, hitung di aplikasi, tulis. Yang diubah hanya isolation level. Semua SQL dan hasilnya direkam dari PostgreSQL 17.

<div data-bb="alur" data-src="data/skenario/b3-3-isolasi.json"></div>

## Kenapa ini ada

Setelah [[B3.2]], Raka bertanya: kenapa transaction tidak otomatis mencegah lost update? Bukankah huruf I di ACID adalah isolation?

Jawabannya: isolation punya beberapa tingkat, dan bawaan PostgreSQL bukan yang paling ketat. Masalah kedua muncul di laporan harian Ani. Laporan membaca saldo di awal dan di akhir, dalam satu transaction. Kadang dua angka itu berbeda, karena ada pembayaran masuk di tengah laporan.

## Cara kerjanya

**Empat level standar SQL, tiga di PostgreSQL** ([PostgreSQL: Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)):

| Level | Nonrepeatable read | Phantom read | Serialization anomaly |
|---|---|---|---|
| Read uncommitted | Di PostgreSQL berperilaku seperti read committed | | |
| **Read committed** (bawaan) | Mungkin | Mungkin | Mungkin |
| Repeatable read | Tidak | Tidak di PostgreSQL | Mungkin |
| Serializable | Tidak | Tidak | Tidak |

Di PostgreSQL, dirty read (membaca data yang belum commit) tidak mungkin di level mana pun.

**Read committed: setiap query melihat snapshot baru.** Laporan Ani di bawah membaca saldo dua kali dalam satu transaction, dan hasilnya berbeda:

```text title="Output rekaman: labs/b3-isolasi/output/laporan-read-committed.txt"
--8<-- "labs/b3-isolasi/output/laporan-read-committed.txt"
```

**Repeatable read: satu snapshot untuk seluruh transaction.** Laporan yang sama konsisten:

```text title="Output rekaman: labs/b3-isolasi/output/laporan-repeatable-read.txt"
--8<-- "labs/b3-isolasi/output/laporan-repeatable-read.txt"
```

**Harganya: serialization failure.** Kalau transaction repeatable read mencoba mengubah baris yang sudah diubah transaction lain setelah snapshot-nya, PostgreSQL menolak. Dokumentasinya jelas: aplikasi harus membatalkan dan mengulang **seluruh** transaction dari awal.

```text title="Output rekaman: labs/b3-isolasi/output/tarik-repeatable-read.txt"
--8<-- "labs/b3-isolasi/output/tarik-repeatable-read.txt"
```

**Kapan dipakai di Rekeningo:**

- Transfer dan penarikan: tetap read committed + `UPDATE` atomik ([[B3.2]]). Paling sederhana, tanpa retry.
- Laporan yang membaca banyak tabel dan harus konsisten: repeatable read, hanya baca, jadi tidak ada serialization failure dari penulisan.
- Aturan yang melibatkan banyak baris sekaligus, mis. "total penarikan hari ini maksimal Rp2.000.000": pertimbangkan serializable + retry, atau lock eksplisit.

## Di stack lain

**Skenario:** transaction laporan dengan repeatable read, dan retry saat serialization failure. Tidak ada tab yang dijalankan di lab; semua dicek ke dokumentasi. Perilaku database-nya dijalankan di rekaman di atas.

Yang sama di semua stack: level dipilih per transaction atau per koneksi, dan retry ditulis di aplikasi. Yang berbeda: **siapa yang mengulang**.

=== "Go"

    *Tidak dijalankan. Dicek ke [database/sql TxOptions](https://pkg.go.dev/database/sql#TxOptions).*

    ```go
    tx, err := db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelRepeatableRead, ReadOnly: true})
    ```

    **Yang berbeda di stack ini:** retry ditulis sendiri: periksa SQLSTATE `40001`, lalu ulang seluruh fungsi.
    {: .bb-beda }

=== "Laravel"

    *Tidak dijalankan. Dicek ke [Laravel: Database transactions](https://laravel.com/docs/12.x/database#handling-deadlocks) dan source `ConcurrencyErrorDetector` di Laravel 12.x.*

    ```php
    DB::transaction(function () {
        DB::statement('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
        // ... query laporan
    }, attempts: 3);
    ```

    **Yang berbeda di stack ini:** argumen `attempts` mengulang closure saat deadlock. Di source Laravel 12.x, kode SQLSTATE `40001` (serialization failure) juga ikut diulang. Level ditetapkan dengan SQL biasa.
    {: .bb-beda }

=== "Django"

    *Tidak dijalankan. Dicek ke [Django: PostgreSQL isolation level](https://docs.djangoproject.com/en/stable/ref/databases/#isolation-level).*

    ```python
    DATABASES = {"default": {
        # ...
        "OPTIONS": {"isolation_level": IsolationLevel.REPEATABLE_READ},
    }}
    ```

    **Yang berbeda di stack ini:** level diatur per koneksi di settings, bukan per transaction. Dokumentasi Django mengingatkan aplikasi harus siap menangani serialization failure.
    {: .bb-beda }

=== "Spring"

    *Tidak dijalankan. Dicek ke [Spring: @Transactional settings](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html).*

    ```java
    @Transactional(isolation = Isolation.REPEATABLE_READ, readOnly = true)
    public Laporan laporanHarian(String tokoId) { ... }
    ```

    **Yang berbeda di stack ini:** level ditulis per method. Retry tidak otomatis; biasanya ditambah lewat library terpisah.
    {: .bb-beda }

## Trade-off: kapan pakai apa

| Level | Kelebihan | Kekurangan |
|---|---|---|
| Read committed + update atomik / lock | Tanpa retry, perilaku mudah ditebak | Laporan multi-query bisa tidak konsisten |
| Repeatable read | Snapshot konsisten untuk seluruh transaction | Penulisan bisa gagal dengan serialization failure |
| Serializable | Hasil sama seperti dijalankan satu per satu | Lebih sering gagal; semua transaction penulis wajib punya retry |

## Cek diri

**1.** Rekaman laporan read committed membaca 250.000 lalu 275.000 dalam satu transaction. Apakah ini bug PostgreSQL?

??? success "Jawaban"

    Bukan. Di read committed, setiap query melihat data yang sudah commit saat query itu dimulai. Pembayaran ke Ani commit di antara dua query, jadi query kedua melihatnya. Kalau laporan butuh satu snapshot, pakai repeatable read.

**2.** Jelaskan kenapa repeatable read "aman" untuk penarikan di rekaman, tapi tetap menuntut kode tambahan.

??? success "Jawaban"

    PostgreSQL menolak `UPDATE` milik B yang dihitung dari snapshot lama, jadi lost update tidak terjadi. Tapi B menerima error, bukan hasil. Tanpa kode yang mengulang transaction, user menerima `500`. Rekaman menunjukkan ulangan B membaca Rp30.000 dan menolak dengan benar.

**3.** Ganti seluruh aplikasi ke serializable, lalu semua race selesai. Setuju?

??? success "Jawaban"

    Tidak sesederhana itu. Semua transaction penulis harus punya retry yang benar, termasuk efek di luar database yang tidak boleh terulang, mis. notifikasi. Tingkat kegagalan juga naik saat beban tinggi. Untuk satu baris saldo, `UPDATE` atomik lebih sederhana.

## Saat me-review kode AI, cek ini

- [ ] Tidak ada asumsi "transaction = aman dari race" tanpa melihat level dan pola query.
- [ ] Kode yang memakai repeatable read atau serializable menangani SQLSTATE `40001` dengan mengulang seluruh transaction.
- [ ] Retry tidak mengulang efek di luar database (email, notifikasi, panggilan API).
- [ ] Laporan multi-query yang harus konsisten berjalan di satu transaction repeatable read, read-only.

## Bacaan lanjut

- [PostgreSQL: Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Jepsen: Consistency models](https://jepsen.io/consistency)
- Kleppmann & Riccomini, *Designing Data-Intensive Applications*, edisi 2 (2026), bab transaction

<div data-bb="umpan-balik"></div>
