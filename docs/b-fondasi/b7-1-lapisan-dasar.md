---
title: "1.14 Lapisan dasar"
---

<div data-bb="kamu-di-sini" data-tahap="1"></div>

# 1.14 Lapisan dasar

Baca 6 menit · coba 3 menit · Prasyarat: [[A2]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Di lapisan mana aturan "saldo harus cukup" ditulis?
    2. Kenapa logika bisnis sebaiknya tidak tahu soal HTTP?
    3. Untuk satu developer di Tahap 1, kapan lapisan tambahan jadi berlebihan?

    Yakin dengan ketiganya? [Lompat ke Tahap 1](../cerita/tahap-1.md).

## Inti

Tiga lapisan cukup untuk Tahap 1: handler untuk HTTP, logika bisnis untuk aturan, akses data untuk SQL. Lapisan tambahan baru dibuat saat ada masalah yang dijawabnya.

<div data-bb="arsitektur" data-tahap="1"></div>

## Lihat sendiri

Baris-baris di bawah diambil dari server lab Rekeningo. Pilih lapisan untuk tiap baris, lalu cek.

<div data-bb="pilah" data-src="data/b7-1-pilah.json"></div>

## Kenapa ini ada

Endpoint transfer versi pertama Raka adalah satu fungsi 120 baris. Fungsi itu membaca JSON, memeriksa token, menghitung saldo, menulis SQL, lalu menyusun response.

Masalahnya muncul saat Sinta meminta fitur "transfer terjadwal": transfer dijalankan otomatis tiap tanggal 1. Tidak ada request HTTP di sana. Raka harus menyalin aturan transfer ke kode baru, dan dua salinan aturan mulai berbeda: batas Rp5.000.000 hanya diperbarui di salah satunya.

Di Flutter, Raka sudah terbiasa memisahkan widget, view model, dan repository. Panduan arsitektur Flutter memakai pemisahan serupa: UI layer dan data layer, dengan repository sebagai sumber data ([Flutter: Guide to app architecture](https://docs.flutter.dev/app-architecture/guide)). Analogi ini hanya berlaku untuk pembagian tanggung jawab. Di backend, yang paling penting dijaga adalah aturan bisnis, karena aturan itu berlaku untuk semua client.

## Cara kerjanya

| Lapisan | Tahu tentang | Tidak boleh tahu | File di lab |
|---|---|---|---|
| Handler | HTTP: path, header, JSON, status code | SQL, tabel | `handler.go` |
| Logika bisnis | Aturan Rekeningo: batas, saldo, penerima | HTTP, SQL | `layanan.go` |
| Akses data | SQL, transaction, nama tabel | HTTP, aturan bisnis | `data.go` |

Satu transfer melewati ketiganya:

=== "Handler"

    ```go
    --8<-- "labs/api-t1/handler.go:transfer"
    ```

=== "Logika bisnis"

    ```go
    --8<-- "labs/api-t1/layanan.go:aturan"
    ```

=== "Akses data"

    ```go
    --8<-- "labs/api-t1/data.go:transfer"
    ```

Perhatikan arah ketergantungannya. Logika bisnis tidak memanggil `DataPG` langsung. Ia memakai interface kecil `Data` dengan dua method. Hasilnya, aturan transfer bisa dites tanpa database dan tanpa server.

Rekaman `go test` di lab menunjukkan unit test aturan berjalan bersama integration test yang memakai PostgreSQL sungguhan:

```text title="Output rekaman: labs/api-t1/output/c1-test.txt"
--8<-- "labs/api-t1/output/c1-test.txt"
```

**Kapan berlebihan.** Untuk satu developer, lapisan berikut biasanya menambah file tanpa menjawab masalah:

- Interface untuk setiap struct, padahal implementasinya hanya satu dan tidak pernah diganti di test.
- DTO, entity, dan model terpisah untuk data yang bentuknya sama.
- Framework dependency injection, padahal `main.go` cukup menyusun tiga objek.

Satu interface di lab (`Data`) ada karena dipakai unit test. Itu alasan yang cukup.

## Di stack lain

Halaman ini membahas pembagian tanggung jawab, bukan sintaks. Nama lapisannya berbeda di tiap stack:

| Stack | Handler | Logika bisnis | Akses data |
|---|---|---|---|
| Go | `http.HandlerFunc` | struct biasa, mis. `Layanan` | `database/sql` atau sqlc |
| Express | route handler | modul fungsi biasa | driver `pg` atau query builder |
| Laravel | Controller | class service atau action | Eloquent model, query builder |
| Django | View | modul fungsi, sering `services.py` (konvensi tim) | ORM model dan manager |
| Spring | `@RestController` | `@Service` | `@Repository`, Spring Data |
| Supabase | API otomatis (PostgREST) | fungsi SQL atau Edge Function | tabel + RLS |

Baris Go diambil dari lab yang dijalankan. Baris lain dicek ke dokumentasi masing-masing dan tidak dijalankan. Framework hanya menyediakan tempat untuk handler dan akses data. Lapisan logika bisnis hampir selalu harus kamu jaga sendiri.

## Trade-off: kapan pakai apa

| Pilihan | Kelebihan | Kekurangan |
|---|---|---|
| Semua di handler | Tercepat ditulis, satu file | Aturan tidak bisa dipakai ulang dan sulit dites tanpa server |
| Tiga lapisan sederhana | Aturan di satu tempat, bisa dites tanpa database | Beberapa file tambahan |
| Banyak lapisan (port/adapter, DI, DTO per lapisan) | Berguna di tim besar dengan banyak sumber data | Banyak kode perantara; untuk satu developer lebih banyak merawat struktur daripada fitur |

Batas modul untuk tim yang lebih besar dibahas di [[B7.2]] (Tahap 4).

## Cek diri

**1.** Fitur transfer terjadwal dijalankan worker tiap tanggal 1. Lapisan mana yang dipakai worker?

??? success "Jawaban"

    Logika bisnis dan akses data. Worker tidak menerima HTTP request, jadi handler tidak terlibat. Karena aturan ada di `Layanan.Transfer`, batas dan cek saldo otomatis berlaku untuk transfer terjadwal.

**2.** Jelaskan kenapa pemetaan `ErrSaldoKurang` ke `422` ditulis di handler, bukan di logika bisnis.

??? success "Jawaban"

    Status code adalah konsep HTTP. Worker atau test tidak butuh `422`, mereka butuh tahu "saldo kurang". Kalau logika bisnis mengembalikan status HTTP, ia jadi bergantung pada HTTP dan sulit dipakai di luar request.

**3.** AI menghasilkan `TransferService`, `TransferServiceImpl`, `TransferRepository`, `TransferRepositoryImpl`, `TransferDTO`, `TransferEntity`, dan `TransferMapper` untuk satu endpoint. Apa yang kamu tanyakan?

??? success "Jawaban"

    Masalah apa yang dijawab setiap file. Interface tanpa implementasi kedua, atau DTO dan entity yang bentuknya sama, menambah kode tanpa manfaat. Pertahankan yang punya alasan, mis. interface yang dipakai unit test.

## Saat me-review kode AI, cek ini

- [ ] Handler tidak berisi SQL atau aturan bisnis.
- [ ] Logika bisnis tidak membaca `http.Request`, header, atau menulis status code.
- [ ] Transaction dibuka di satu tempat yang menjalankan semua query terkait.
- [ ] Setiap interface punya alasan: lebih dari satu implementasi, atau dipakai di test.
- [ ] Aturan yang sama tidak ditulis di dua tempat.

## Bacaan lanjut

- [Flutter: Guide to app architecture](https://docs.flutter.dev/app-architecture/guide)
- [Martin Fowler: Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Go: Organizing a Go module](https://go.dev/doc/modules/layout)

<div data-bb="umpan-balik"></div>
