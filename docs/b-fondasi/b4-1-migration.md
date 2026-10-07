---
title: "1.10 Migration: skema sebagai kode"
---

<div data-bb="kamu-di-sini" data-tahap="1"></div>

# 1.10 Migration: skema sebagai kode

Baca 6 menit · coba 2 menit · Prasyarat: [[B2.1]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Di mana database menyimpan "skema ini sudah sampai versi berapa"?
    2. Migration yang sudah jalan di production ternyata salah. Edit file-nya, atau buat file baru?
    3. Apa arti status "dirty"?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

Setiap perubahan skema adalah file bernomor di Git. Database mencatat versi yang sudah dijalankan. Hasilnya, skema di semua environment sama dan bisa dibuktikan.

<div data-bb="arsitektur" data-tahap="1"></div>

## Lihat sendiri

Semua perintah dan output di widget ini direkam dari golang-migrate v4.20.1 dan PostgreSQL 17.

<div data-bb="alur" data-src="data/skenario/b4-1-migration.json"></div>

## Kenapa ini ada

Minggu kedua, Raka menambah kolom `telp` lewat aplikasi database di laptopnya. Endpoint profil berjalan lancar.

Saat deploy, server langsung error: `column "telp" does not exist`. Raka lupa menjalankan perubahan yang sama di server. Ia menambahkannya manual, kali ini dengan nama `no_telp`, karena tidak ingat nama persisnya.

Sekarang skema laptop dan server berbeda, dan tidak ada catatan apa saja yang pernah diubah. Di Flutter, Raka tidak pernah mengalami ini: perubahan model ada di kode, dan kode ada di Git. Migration membawa kebiasaan yang sama ke database.

## Cara kerjanya

**Satu perubahan, satu file bernomor.** Alat migration menjalankan file yang belum pernah dijalankan, berurutan, lalu mencatatnya:

```text title="Output rekaman: labs/b4-migration/output/migrate.txt"
--8<-- "labs/b4-migration/output/migrate.txt"
```

Tiga aturan kerja:

1. **File yang sudah jalan di production tidak diubah.** Database tidak akan menjalankannya lagi, jadi perubahanmu tidak pernah sampai. Buat file baru.
2. **Migration jalan sebelum kode baru.** Pipeline deploy berhenti kalau migration gagal, seperti di rekaman.
3. **`down` hanya untuk development.** Di production, mundur biasanya dengan migration baru, karena `down` yang menghapus kolom juga menghapus datanya.

**Arti "dirty".** Kalau migration gagal, golang-migrate menandai versinya dirty dan menolak menjalankan migration lain. Dokumentasinya meminta kamu memeriksa dulu: migration itu terpasang sebagian, atau tidak sama sekali? Setelah itu, `force` ke versi yang sesuai dengan keadaan sebenarnya ([golang-migrate: Getting started](https://github.com/golang-migrate/migrate/blob/master/GETTING_STARTED.md)).

Rekaman ini juga mengoreksi dugaan umum. Statement pertama di migration 3 (`ADD COLUMN telp`) **tidak** tertinggal. PostgreSQL menjalankan beberapa statement dalam satu kiriman sebagai satu transaction implisit, jadi error di statement kedua membatalkan semuanya ([PostgreSQL: Multiple statements in a simple query](https://www.postgresql.org/docs/current/protocol-flow.html#PROTOCOL-FLOW-MULTI-STATEMENT)). Jangan mengandalkan perilaku ini di database lain, dan tetap periksa skema sebelum `force`.

## Di stack lain

**Skenario:** menambah kolom `telp` di tabel `akun`. Tab Go dijalankan di lab. Tab lain tidak dijalankan, hanya dicek ke dokumentasi.

Yang sama di semua stack: file berurutan di Git, dan tabel riwayat di database. Yang berbeda: format file dan cara memperbaiki migration yang gagal.

=== "Go (golang-migrate)"

    *Dijalankan: golang-migrate v4.20.1, PostgreSQL 17.11.*

    ```sql
    -- migrations/000003_tambah_telp.up.sql
    ALTER TABLE akun ADD COLUMN telp text;
    CREATE INDEX akun_telp_idx ON akun (telp);

    -- migrations/000003_tambah_telp.down.sql
    ALTER TABLE akun DROP COLUMN telp;
    ```

    **Yang berbeda di stack ini:** SQL apa adanya. Riwayat di tabel `schema_migrations` (versi + dirty). Perbaikan setelah gagal: `migrate force <versi>` ([golang-migrate](https://github.com/golang-migrate/migrate)).
    {: .bb-beda }

=== "Laravel"

    *Tidak dijalankan. Dicek ke [Laravel: Migrations](https://laravel.com/docs/12.x/migrations).*

    ```php
    // database/migrations/2026_10_06_000003_tambah_telp.php
    return new class extends Migration {
        public function up(): void {
            Schema::table('akun', fn (Blueprint $t) => $t->string('telp')->nullable()->index());
        }
        public function down(): void {
            Schema::table('akun', fn (Blueprint $t) => $t->dropColumn('telp'));
        }
    };
    ```

    **Yang berbeda di stack ini:** skema ditulis dengan PHP, nomornya tanggal. `php artisan migrate` menjalankan, `migrate:rollback` membatalkan batch terakhir.
    {: .bb-beda }

=== "Django"

    *Tidak dijalankan. Dicek ke [Django: Migrations](https://docs.djangoproject.com/en/stable/topics/migrations/).*

    ```python
    # akun/models.py: tambah field, lalu jalankan makemigrations
    class Akun(models.Model):
        telp = models.TextField(null=True, db_index=True)
    ```

    **Yang berbeda di stack ini:** file migration dibuat otomatis oleh `makemigrations` dari perubahan model. Tetap baca file hasilnya sebelum commit. Di PostgreSQL, setiap migration dijalankan dalam satu transaction.
    {: .bb-beda }

=== "Spring (Flyway)"

    *Tidak dijalankan. Dicek ke [Flyway: schema history table](https://documentation.red-gate.com/flyway/flyway-concepts/migrations/flyway-schema-history-table) dan [repair](https://documentation.red-gate.com/flyway/reference/commands/repair).*

    ```sql
    -- src/main/resources/db/migration/V3__tambah_telp.sql
    ALTER TABLE akun ADD COLUMN telp text;
    CREATE INDEX akun_telp_idx ON akun (telp);
    ```

    **Yang berbeda di stack ini:** riwayat di tabel `flyway_schema_history`. Perbaikan setelah gagal: `flyway repair`. Spring Boot menjalankan Flyway saat aplikasi start.
    {: .bb-beda }

=== "Supabase"

    *Tidak dijalankan. Dicek ke [Supabase: Database migrations](https://supabase.com/docs/guides/deployment/database-migrations) dan [migration repair](https://supabase.com/docs/reference/cli/supabase-migration-repair).*

    ```sql
    -- supabase/migrations/20261006000003_tambah_telp.sql   (dibuat: supabase migration new tambah_telp)
    ALTER TABLE akun ADD COLUMN telp text;
    ```

    **Yang berbeda di stack ini:** perubahan lewat dashboard tidak tercatat sebagai file. Disiplinnya sama: ubah skema lewat file migration, bukan klik.
    {: .bb-beda }

## Trade-off: kapan pakai apa

| Cara mengubah skema | Kelebihan | Kekurangan |
|---|---|---|
| Manual di tool database | Paling cepat untuk eksperimen | Tidak ada catatan, environment berbeda-beda |
| Migration SQL (golang-migrate, Flyway) | Persis yang dijalankan database, mudah direview | Tulis SQL sendiri, termasuk `down` |
| Migration dari ORM (Laravel, Django) | Ditulis dalam bahasa yang sama dengan kode | SQL yang dihasilkan perlu dicek, terutama untuk tabel besar ([[B4.2]]) |
| ORM "sync otomatis" saat start | Nol usaha di awal | Tidak cocok untuk production: bisa menghapus kolom atau data tanpa review |

## Cek diri

**1.** Migration 2 sudah jalan di production. Raka sadar kolom `jumlah` seharusnya `bigint`, lalu mengedit file 2. Apa yang terjadi saat deploy?

??? success "Jawaban"

    Tidak ada. Database sudah mencatat versi 2, jadi file 2 tidak dijalankan lagi. Production tetap memakai tipe lama, sementara database baru di laptop orang lain memakai tipe baru. Perbaikan yang benar adalah migration 4 yang mengubah tipe kolom.

**2.** Jelaskan kenapa alat migration menolak `migrate up` saat versinya dirty, padahal bisa saja mencoba lagi.

??? success "Jawaban"

    Alat tidak tahu seberapa jauh migration yang gagal sempat berjalan. Mengulang bisa menjalankan statement yang sudah berhasil dua kali, atau melewati yang belum. Manusia harus memeriksa skema dulu, baru menandai versi yang benar dengan `force`.

**3.** Di rekaman, kolom `telp` tidak ada setelah migration 3 gagal. Apa yang membuat PostgreSQL membatalkan `ADD COLUMN`?

??? success "Jawaban"

    Isi file dikirim sebagai satu query berisi beberapa statement. PostgreSQL menjalankannya sebagai satu transaction implisit, jadi error di statement kedua membatalkan statement pertama juga.

## Saat me-review kode AI, cek ini

- [ ] Perubahan skema ada di file migration baru, bukan di file lama atau di kode start aplikasi.
- [ ] Tidak ada "auto sync" skema ORM yang aktif di production.
- [ ] Migration tidak menghapus atau me-rename kolom yang masih dipakai ([[B4.2]]).
- [ ] Ada `down`, atau ada catatan kenapa tidak bisa dibatalkan.
- [ ] Pipeline deploy menjalankan migration sebelum kode baru, dan berhenti kalau gagal.

## Bacaan lanjut

- [golang-migrate](https://github.com/golang-migrate/migrate) · [Flyway: schema history](https://documentation.red-gate.com/flyway/flyway-concepts/migrations/flyway-schema-history-table)
- [Laravel: Migrations](https://laravel.com/docs/12.x/migrations) · [Django: Migrations](https://docs.djangoproject.com/en/stable/topics/migrations/)
- [PostgreSQL: Multiple statements in a simple query](https://www.postgresql.org/docs/current/protocol-flow.html#PROTOCOL-FLOW-MULTI-STATEMENT)

<div data-bb="umpan-balik"></div>
