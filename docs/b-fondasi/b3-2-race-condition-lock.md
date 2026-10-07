---
title: "2.1 Race condition & lock"
---

<div data-bb="kamu-di-sini" data-tahap="2"></div>

# 2.1 Race condition & lock

Baca 7 menit · coba 3 menit · Prasyarat: [[B3.1]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Dua request sama-sama membaca saldo Rp100.000, lalu masing-masing menulis saldo baru. Keduanya memakai transaction. Bisakah tetap ada uang yang "tercipta"?
    2. Apa beda `SELECT ... FOR UPDATE` dengan `UPDATE ... SET saldo = saldo - 50000 WHERE saldo >= 50000`?
    3. Kapan optimistic lock lebih cocok daripada pessimistic lock?

    Yakin dengan ketiganya? Langsung ke [Saat me-review kode AI](#saat-me-review-kode-ai-cek-ini).

## Inti

Race condition: hasil akhir bergantung pada urutan dua request yang berjalan bersamaan. Pola tersering: baca, hitung di aplikasi, tulis. Transaction saja tidak cukup; butuh lock, `UPDATE` atomik, atau cek version.

<div data-bb="arsitektur" data-tahap="2"></div>

## Lihat sendiri

Budi menarik Rp70.000 dari HP dan Rp50.000 dari tablet, dari saldo Rp100.000. Setiap SQL dan hasilnya di widget ini diambil dari rekaman **PostgreSQL sungguhan**, dengan urutan langkah terburuk.

<div data-bb="alur" data-src="data/skenario/b3-2-dua-perangkat.json"></div>

### Bandingkan empat cara

Widget di bawah memutar rekaman yang sama dari sudut database. A adalah request dari HP, B dari tablet. Setelah tiap langkah, koneksi ketiga mencatat saldo yang sudah di-commit, siapa yang memegang **row lock**, dan siapa yang sedang menunggu. Row lock adalah penanda bahwa satu baris sedang dipakai transaction tertentu.

<div data-bb="race" data-modes="tx-tanpa-lock,for-update,atomic,optimistic"></div>

Perhatikan tab pertama di langkah 8. B **memang** menunggu lock, karena `UPDATE` milik A sedang memegang baris itu. Tapi angka Rp50.000 yang ditulis B sudah dihitung dari bacaan lama. Lock datang terlambat: keputusannya sudah diambil sebelum lock didapat.

??? abstract "Rekaman mentah (teks)"

    ```text
    --8<-- "labs/b3-race/output/tx-tanpa-lock.txt"
    ```

    ```text
    --8<-- "labs/b3-race/output/for-update.txt"
    ```

## Kenapa ini ada

Tiga minggu setelah Rekeningo dibuka untuk tiga kompleks, keluhan pertama yang aneh masuk. Budi membuka Rekeningo di HP dan tablet, lalu menarik Rp70.000 dan Rp50.000 ke rekening bank hampir bersamaan. Saldonya Rp100.000, tapi dua penarikan itu sukses.

Budi menerima Rp120.000, dan saldonya masih tercatat Rp50.000. Rekeningo rugi Rp70.000. Raka memeriksa kode tarik saldo. Kode itu sudah memakai transaction sejak Tahap 1, jadi Raka sempat yakin aman.

Masalahnya ada di pola **baca saldo → hitung di aplikasi → tulis hasilnya**. Dua request membaca Rp100.000 sebelum ada yang menulis, jadi keduanya lolos cek "saldo cukup". Ini disebut **lost update**: tulisan pertama tertimpa tulisan kedua, seolah tidak pernah terjadi.

Di Kotlin, dua coroutine yang mengubah variabel yang sama tanpa `Mutex` punya masalah yang sama. Bedanya penting: `Mutex` hanya hidup di memori satu proses. Server production biasanya berjalan di beberapa instance, jadi pengamannya harus ada di database, tempat semua instance bertemu.

## Cara kerjanya

Lost update selalu punya bentuk yang sama:

<figure class="bb-fig" role="img" aria-label="Lost update: A membaca saldo Rp100.000, B membaca saldo Rp100.000, A menulis Rp30.000, B menulis Rp50.000 dan menimpa tulisan A.">
<ol class="bb-flow">
<li>A baca Rp100.000</li>
<li>B baca Rp100.000</li>
<li>A tulis Rp30.000</li>
<li class="is-warn">B tulis Rp50.000</li>
</ol>
<figcaption><strong>Lost update:</strong> tulisan A tertimpa. Saldo Rp50.000, padahal Rp120.000 keluar.</figcaption>
</figure>

Ada tiga cara memastikan keputusan "saldo cukup?" diambil dari nilai terbaru.

**1. Pessimistic lock: `SELECT ... FOR UPDATE`.** Baris di-lock sejak dibaca, sampai transaction selesai. Transaction lain yang mau mengunci atau mengubah baris yang sama harus menunggu ([PostgreSQL](https://www.postgresql.org/docs/current/explicit-locking.html)). Disebut pessimistic karena kamu berasumsi bentrok akan terjadi, jadi lock diambil di depan.

**2. `UPDATE` atomik dengan syarat.** Hitungan dipindah dari aplikasi ke database: `SET saldo = saldo - 50000 WHERE saldo >= 50000`. Di PostgreSQL dengan isolation default (Read Committed), `UPDATE` kedua menunggu yang pertama selesai. Setelah itu, syarat `WHERE` dicek ulang ke versi baris terbaru ([PostgreSQL](https://www.postgresql.org/docs/current/transaction-iso.html)).

Aplikasi cukup memeriksa jumlah baris yang berubah: 1 berarti sukses, 0 berarti ditolak.

**3. Optimistic lock: kolom `version`.** Tidak ada lock saat membaca. Saat menulis, kamu menambahkan syarat `WHERE version = <version yang tadi dibaca>`. Kalau 0 baris berubah, berarti ada yang menulis duluan.

Aplikasi lalu membaca ulang dan mencoba lagi, atau mengembalikan `409 Conflict` ke app. Di sisi Flutter atau Android, itu sinyal untuk me-refresh layar.

### Coba: ubah satu hal

Panel ini menjalankan pola lost update dan `UPDATE` atomik di SQLite. SQLite di browser hanya punya satu koneksi, jadi urutan A dan B dijalankan bergantian, bukan bersamaan. Itu cukup untuk melihat logikanya. Setelah menjalankan sekali, centang **Ubah satu hal** untuk menghapus syarat `AND saldo >= ...`.

<div data-bb="runsql" data-src="data/b3-2-lost-update.json"></div>

## Di stack lain

**Skenario:** Budi menarik Rp70.000 dari HP dan Rp50.000 dari tablet, bersamaan. Saldo Rp100.000.

Yang sama di semua stack: keputusan "saldo cukup?" diambil dari nilai terbaru, bukan dari bacaan lama. Yang berbeda: **teknik yang umum di tiap ekosistem**, dan siapa yang mengirim `COMMIT` atau `ROLLBACK`. Klik satu langkah. Baris yang mengerjakannya tersorot di setiap tab.

<div data-bb="stackstep" data-src="data/b3-2-stackstep.json"></div>

=== "Go · FOR UPDATE"

    *Dijalankan: Go 1.27.1, pgx v5.11.0, dua goroutine, PostgreSQL 17.11.*

    ```go
    --8<-- "labs/b3-stack/go/main.go:tarik"
    ```

    **Yang berbeda di stack ini:** penarikan yang ditolak keluar lewat `return ErrSaldoKurang`, dan `defer tx.Rollback()` mengirim `ROLLBACK`. Penolakan juga mengakhiri transaction.
    {: .bb-beda }

    ```text title="Output rekaman"
    --8<-- "labs/b3-stack/output/go-tarik.txt"
    ```

=== "Node.js · UPDATE atomik"

    *Dijalankan: Node 22.17.1, `pg` 8.23.1, dua request bersamaan, PostgreSQL 17.11.*

    ```js
    --8<-- "labs/b3-stack/node/main.js:tarik"
    ```

    **Yang berbeda di stack ini:** tidak ada `BEGIN`, `COMMIT`, atau `ROLLBACK`. Baca, cek, dan tulis terjadi dalam satu `UPDATE`. Output di bawah menunjukkan PostgreSQL hanya menerima dua `UPDATE`. Keputusan ada di `rowCount`.
    {: .bb-beda }

    ```text title="Output rekaman"
    --8<-- "labs/b3-stack/output/node-tarik.txt"
    ```

=== "Laravel · lockForUpdate"

    *Dijalankan: PHP 8.5.8, `illuminate/database` 13.34.0, dua proses PHP bersamaan, PostgreSQL 17.11.*

    ```php
    --8<-- "labs/b3-stack/laravel/main.php:tarik"
    ```

    **Yang berbeda di stack ini:** `lockForUpdate()` menghasilkan `SELECT ... FOR UPDATE`, dan Laravel menyarankan memakainya di dalam transaction ([Laravel](https://laravel.com/docs/12.x/queries#pessimistic-locking)). Yang ditolak melempar exception, lalu Laravel mengirim `ROLLBACK`.
    {: .bb-beda }

    ```text title="Output rekaman"
    --8<-- "labs/b3-stack/output/laravel-tarik.txt"
    ```

=== "Django · select_for_update"

    *Dijalankan: Django 6.1.1, dua thread, PostgreSQL 17.11.*

    ```python
    --8<-- "labs/b3-stack/django/main.py:tarik"
    ```

    **Yang berbeda di stack ini:** `select_for_update()` di luar `atomic()` menghasilkan `TransactionManagementError` ([Django](https://docs.djangoproject.com/en/stable/ref/models/querysets/)). Catatan membaca output: log mencatat statement saat **diterima**, bukan saat lock didapat. Jadi `SELECT` milik B bisa tercatat lebih dulu, padahal A yang mendapat lock.
    {: .bb-beda }

    ```text title="Output rekaman"
    --8<-- "labs/b3-stack/output/django-tarik.txt"
    ```

=== "Spring · @Lock"

    *Kode ini tidak dijalankan di lab. Perilakunya hanya dicek ke dokumentasi [Spring Data JPA](https://docs.spring.io/spring-data/jpa/reference/jpa/locking.html) dan [Jakarta Persistence](https://jakarta.ee/learn/jakartaee-tutorial/9.1/persist/persistence-locking/persistence-locking.html).*

    ```java
    interface AkunRepository extends JpaRepository<Akun, String> {
      @Lock(LockModeType.PESSIMISTIC_WRITE)
      @Query("select a from Akun a where a.nama = :nama")
      Akun findForUpdate(@Param("nama") String nama);
    }

    @Transactional
    public void tarik(String nama, int jumlah) {
      Akun akun = repo.findForUpdate(nama);
      if (akun.getSaldo() < jumlah) throw new SaldoKurangException(); // RuntimeException
      akun.setSaldo(akun.getSaldo() - jumlah); // ditulis saat commit
    }
    ```

    **Yang berbeda di stack ini:** `PESSIMISTIC_WRITE` setara `FOR UPDATE`, dan perubahan entity ditulis saat commit tanpa memanggil `save`. Untuk optimistic lock, tambahkan field `@Version`. Tidak ada output rekaman, karena contoh ini tidak dijalankan.
    {: .bb-beda }

=== "Supabase · fungsi + rpc"

    *Fungsi SQL dijalankan di PostgreSQL 17.11 lewat psql. Panggilan `supabase.rpc()` tidak dijalankan.*

    ```sql
    --8<-- "labs/b3-stack/supabase/fungsi.sql:tarik"
    ```

    **Yang berbeda di stack ini:** logikanya sama dengan `UPDATE` atomik, dibungkus fungsi. `found` bernilai true kalau ada baris yang berubah. Dari app cukup `supabase.rpc('tarik', ...)`.
    {: .bb-beda }

    ```text title="Output rekaman"
    --8<-- "labs/b3-stack/output/supabase-tarik.txt"
    ```

=== "Firebase · transaction"

    *Kode ini tidak dijalankan di lab. Perilakunya hanya dicek ke [dokumentasi Firestore](https://firebase.google.com/docs/firestore/transaction-data-contention).*

    ```js
    await runTransaction(db, async (tx) => {
      const akun = await tx.get(budiRef)            // baca dulu, baru tulis
      if (akun.data().saldo < 50000) throw new Error('saldo tidak cukup')
      tx.update(budiRef, { saldo: akun.data().saldo - 50000 })
    })
    ```

    **Yang berbeda di stack ini:** tidak ada lock. SDK mobile dan web memakai optimistic concurrency. Kalau dokumen yang dibaca diubah client lain, seluruh fungsi diulang otomatis sampai batas tertentu. Transaction gagal saat client offline ([Firestore](https://firebase.google.com/docs/firestore/manage-data/transactions)). Tidak ada output rekaman.
    {: .bb-beda }

Rekaman lab (`labs/b3-stack/output/ulang-10.txt`): skenario ini diulang 10 kali di Go, Node, Laravel, dan Django, dan di setiap run tepat satu dari dua penarikan yang sukses. Pemenangnya ditentukan oleh siapa yang lebih dulu mendapat lock. Di Go, Laravel, dan Django pemenangnya berganti-ganti antar run. Di Node, Rp70.000 menang di kesepuluh run.

## Trade-off: kapan pakai apa

| Cara | Cocok untuk | Biaya |
|---|---|---|
| `UPDATE` atomik dengan syarat | Perubahan sederhana: saldo, stok, kuota, counter | Seluruh logika harus muat dalam satu perintah SQL |
| `SELECT ... FOR UPDATE` | Logika rumit di aplikasi antara baca dan tulis | Request lain menunggu. Kalau dua transaction mengunci beberapa baris dengan urutan berbeda, bisa **deadlock** (saling menunggu selamanya, lalu salah satu dibatalkan database). Pencegahannya: selalu mengunci dengan urutan yang sama ([PostgreSQL](https://www.postgresql.org/docs/current/explicit-locking.html)) |
| Optimistic lock (`version`) | Bentrok jarang terjadi, atau user mengedit lama (form profil, dokumen) | Wajib ada jalur retry atau pesan konflik ke user |

Rule of thumb: mulai dari `UPDATE` atomik. Naik ke `FOR UPDATE` kalau logikanya tidak muat di satu SQL. Pilih optimistic lock kalau tidak ingin request saling menunggu.

## Cek diri

Jawab dulu, baru buka jawabannya.

**1.** AI menulis kode ini, lengkap dengan transaction. Aman dari lost update?

```go
tx, _ := db.BeginTx(ctx, nil)
defer tx.Rollback()
tx.QueryRowContext(ctx, `SELECT saldo FROM akun WHERE id = $1`, id).Scan(&saldo)
if saldo < jumlah { return ErrSaldoKurang }
tx.ExecContext(ctx, `UPDATE akun SET saldo = $1 WHERE id = $2`, saldo-jumlah, id)
return tx.Commit()
```

??? success "Jawaban"

    Tidak aman. Ini persis tab pertama di rekaman: `SELECT` tanpa `FOR UPDATE` tidak mengunci apa pun, jadi dua request bisa membaca Rp100.000 bersamaan. Perbaikan paling kecil: tambahkan `FOR UPDATE` di `SELECT`. Alternatifnya, ganti dengan `UPDATE` atomik dan periksa `RowsAffected()`.

**2.** Di tab "UPDATE atomik", `UPDATE` milik B dikirim saat saldo masih Rp100.000. Kenapa hasilnya tidak -Rp20.000?

??? success "Jawaban"

    B menunggu lock milik A. Setelah A commit, PostgreSQL mengecek ulang syarat `WHERE saldo >= 50000` ke versi baris terbaru (saldo Rp30.000). Syaratnya gagal, jadi 0 baris berubah ([sumber](https://www.postgresql.org/docs/current/transaction-iso.html)).

**3.** Jelaskan dalam satu kalimat: kenapa `Mutex` atau `synchronized` di kode aplikasi tidak cukup untuk mencegah race ini di production?

??? success "Jawaban"

    Lock di memori hanya berlaku di satu proses. Production biasanya punya beberapa instance atau proses worker yang tidak berbagi memori, jadi pengamannya harus ada di database.

## Saat me-review kode AI, cek ini

- [ ] Cari pola baca → hitung di aplikasi → tulis. Pastikan ada `FOR UPDATE`, `UPDATE` atomik, atau cek `version`.
- [ ] `FOR UPDATE` (`lockForUpdate`, `select_for_update`, `@Lock`) dipakai di dalam transaction.
- [ ] Jumlah baris yang berubah (`RowsAffected`, `rowCount`, hasil `update()`) diperiksa, bukan diabaikan.
- [ ] Optimistic lock punya penanganan konflik: retry terbatas, atau `409 Conflict` ke app.
- [ ] Tidak ada panggilan lambat (HTTP ke luar, sleep) selama lock dipegang.

## Bacaan lanjut

- [PostgreSQL: Explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html) (row lock dan deadlock)
- [PostgreSQL: Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html) (bagian Read Committed)
- [Laravel: Pessimistic locking](https://laravel.com/docs/12.x/queries#pessimistic-locking) · [Django: select_for_update](https://docs.djangoproject.com/en/stable/ref/models/querysets/) · [Jakarta Persistence: Locking](https://jakarta.ee/learn/jakartaee-tutorial/9.1/persist/persistence-locking/persistence-locking.html)
- [Firestore: Transaction serializability and isolation](https://firebase.google.com/docs/firestore/transaction-data-contention)

Halaman lain di Tahap 2 dan Tahap 3 menyusul. [Kembali ke halaman Tahap 2](../cerita/tahap-2.md) untuk melihat daftar masalahnya.

<div data-bb="umpan-balik"></div>
