---
title: "1.6 Validation dan error handling"
---

<div data-bb="kamu-di-sini" data-tahap="1"></div>

# 1.6 Validation dan error handling

Baca 7 menit · coba 3 menit · Prasyarat: [[B1.2]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. App sudah menolak nominal negatif. Perlukah server memeriksanya lagi?
    2. Apa bedanya error yang dijawab `400` dan `422`?
    3. Error database yang tidak terduga: apa yang dikirim ke app, dan apa yang ditulis ke log?

    Yakin dengan ketiganya? [Lompat ke Tahap 1](../cerita/tahap-1.md).

## Inti

Validasi di app untuk kenyamanan, validasi di server untuk keamanan. Database memegang constraint sebagai pertahanan terakhir. Detail error masuk log, bukan ke app.

<div data-bb="arsitektur" data-tahap="1"></div>

## Lihat sendiri

Budi mengirim transfer Rp−70.000 dengan `curl`, tanpa lewat app. Semua request, response, dan saldo di widget ini direkam dari server lab dan PostgreSQL 17.

<div data-bb="alur" data-src="data/skenario/b6-validasi.json"></div>

## Kenapa ini ada

Form transfer di app Rekeningo sudah rapi. Nominal harus angka, lebih dari nol, dan tombol Kirim mati kalau salah.

Di minggu kedua uji coba, seorang penguji yang juga developer mencoba hal lain. Ia mengambil token dari app miliknya, lalu mengirim request dengan `curl`. Nominalnya negatif.

Raka menemukan masalah ini di log, bukan dari keluhan. Untung saja, karena di server belum ada satu pun pemeriksaan nominal. Validasi di app tidak melindungi apa pun dari request yang tidak lewat app.

## Cara kerjanya

Validasi dikerjakan berlapis. Setiap lapisan memeriksa hal yang berbeda:

| Lapisan | Memeriksa | Kalau gagal | Contoh di lab |
|---|---|---|---|
| App | Format, supaya user langsung tahu salahnya | Pesan di bawah input | Tombol Kirim mati |
| Handler | Bentuk request: JSON valid, tipe data benar | `400` | `"jumlah": "tujuh puluh ribu"` |
| Logika bisnis | Aturan Rekeningo: jumlah > 0, batas Rp5.000.000, bukan ke diri sendiri | `422` dengan error per field | `"jumlah": -70000` |
| Database | Constraint: `CHECK (jumlah > 0)`, `CHECK (saldo >= 0)`, foreign key | `500`, lalu bug diperbaiki | Rekaman di bawah |

Aturan bisnis ditulis **sekali**, di logika bisnis. Semua jalur masuk lewat sana: app, `curl`, worker, atau service lain.

```go
--8<-- "labs/api-t1/layanan.go:aturan"
```

Constraint database tidak menggantikan validasi. Ia menangkap bug di kodemu sendiri. Kalau constraint sampai menolak data, artinya ada jalur yang lolos dari validasi, dan itu harus terlihat di log sebagai `500`:

```text title="Output rekaman: labs/api-t1/output/b6-validasi.txt"
--8<-- "labs/api-t1/output/b6-validasi.txt"
```

Perhatikan tiga hal di rekaman:

1. Dengan validasi: `422` dan saldo tidak berubah.
2. Tanpa validasi, dengan `CHECK`: PostgreSQL menolak, app menerima `500` umum, dan pesan aslinya hanya ada di log server.
3. Tanpa keduanya: `201 Created`, saldo Budi naik jadi Rp170.000 dan saldo Ani turun jadi Rp180.000.

**Error handling.** Tiga kebiasaan yang membuat error bisa dilacak:

- **Petakan sekali, di tepi.** Logika bisnis mengembalikan error bertipe (`ErrValidasi`, `ErrSaldoKurang`). Hanya handler yang mengubahnya jadi status code.
- **Jangan buang error.** Error yang ditangkap lalu diabaikan (di-swallow) membuat bug tidak terlihat. Kalau sengaja diabaikan, tulis alasannya.
- **Detail ke log, pesan umum ke client.** Pesan database bisa membocorkan nama tabel dan kolom.

## Di stack lain

**Skenario:** aturan "jumlah harus lebih dari 0" untuk transfer. Tab Go dijalankan di lab. Tab lain tidak dijalankan, hanya dicek ke dokumentasi.

Yang sama di semua stack: aturan ditulis di server, dan database punya constraint sendiri. Yang berbeda: **status bawaan** saat validasi gagal.

<div data-bb="stackstep" data-src="data/b6-stackstep.json"></div>

=== "Go"

    *Potongan dari `labs/api-t1/layanan.go`, dijalankan: Go 1.27.1, PostgreSQL 17.11.*

    ```go
    if !l.tanpaValidasi {
        if jumlah <= 0 {
            return 0, 0, ErrValidasi{"jumlah", "harus lebih dari 0"}
        }
    }
    ```

    **Yang berbeda di stack ini:** tidak ada validator bawaan. Aturan ditulis sebagai kode biasa, atau lewat library seperti `go-playground/validator`.
    {: .bb-beda }

=== "Laravel"

    *Tidak dijalankan. Dicek ke [Laravel: Validation](https://laravel.com/docs/12.x/validation).*

    ```php
    $data = $request->validate([
        'ke'     => 'required|string',
        'jumlah' => 'required|integer|min:1',
    ]);
    ```

    **Yang berbeda di stack ini:** untuk request JSON, validasi gagal otomatis dijawab `422` dengan daftar error per field.
    {: .bb-beda }

=== "Django"

    *Tidak dijalankan. Dicek ke [Django: Validators](https://docs.djangoproject.com/en/stable/ref/validators/), [model instance](https://docs.djangoproject.com/en/stable/ref/models/instances/), dan [constraints](https://docs.djangoproject.com/en/stable/ref/models/constraints/).*

    ```python
    class Transfer(models.Model):
        jumlah = models.BigIntegerField(validators=[MinValueValidator(1)])

        class Meta:
            constraints = [models.CheckConstraint(condition=Q(jumlah__gt=0), name="jumlah_positif")]
    ```

    **Yang berbeda di stack ini:** validator di field **tidak** dijalankan oleh `save()`. Dokumentasi Django menyebut `full_clean()` harus dipanggil sendiri. `CheckConstraint` tetap berlaku di database.
    {: .bb-beda }

=== "Spring"

    *Tidak dijalankan. Dicek ke [Spring: Bean Validation](https://docs.spring.io/spring-framework/reference/core/validation/beanvalidation.html) dan [DefaultHandlerExceptionResolver](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/mvc/support/DefaultHandlerExceptionResolver.html).*

    ```java
    record Permintaan(@NotBlank String ke, @Positive long jumlah) {}

    @PostMapping("/transfers")
    ResponseEntity<Hasil> transfer(@Valid @RequestBody Permintaan p) { ... }
    ```

    **Yang berbeda di stack ini:** validasi gagal dijawab **`400`** secara bawaan, bukan `422`. Kalau tim memilih `422`, petakan sendiri lewat exception handler.
    {: .bb-beda }

## Trade-off: kapan pakai apa

| Di mana aturan ditulis | Kelebihan | Kekurangan |
|---|---|---|
| Hanya di app | Paling cepat dibuat | Tidak melindungi dari request langsung. Rekaman lab: saldo berubah |
| Di server (logika bisnis) + constraint database | Aman untuk semua jalur masuk | Aturan ditulis dua kali (app dan server) dan bisa tidak sinkron |
| Hanya constraint database | Tidak bisa dilewati | Error yang muncul `500`, tanpa pesan yang bisa ditampilkan ke user |

Rule of thumb: semua aturan yang menyangkut uang dan izin ada di server. App boleh menduplikasi aturan format demi kenyamanan.

## Cek diri

**1.** Transfer ke akun sendiri ditolak di app. Di server tidak ada pemeriksaan, tapi tabel punya `CHECK (dari <> ke)`. Apa yang diterima `curl` yang mengirim transfer ke diri sendiri?

??? success "Jawaban"

    `500` dengan pesan umum. PostgreSQL menolak baris itu, jadi data tetap benar. Tapi user tidak mendapat pesan yang jelas, dan error ini seharusnya memicu perbaikan: pindahkan aturannya ke logika bisnis, supaya dijawab `422` dengan `field: "ke"`.

**2.** Jelaskan kenapa `UPDATE ... WHERE saldo >= jumlah` tidak cukup melindungi dari jumlah negatif.

??? success "Jawaban"

    Dengan jumlah −70.000, syaratnya jadi `saldo >= -70000`, yang selalu benar untuk saldo positif. Lalu `saldo - (-70000)` menambah saldo. Syarat itu melindungi dari saldo kurang, bukan dari input yang tidak masuk akal. Rekaman lab menunjukkan saldo Budi naik ke Rp170.000.

**3.** Error dari database ditangkap dengan `catch (e) { return null; }`. Apa risikonya?

??? success "Jawaban"

    Error di-swallow: tidak tercatat di log, dan pemanggil mengira tidak ada data. Bug jadi tidak terlihat, dan user mungkin melihat layar kosong tanpa penjelasan. Minimal catat errornya, lalu kembalikan error yang bisa dipetakan ke `500`.

## Saat me-review kode AI, cek ini

- [ ] Setiap aturan yang ada di app juga ada di server, terutama yang menyangkut uang dan izin.
- [ ] Format salah dijawab `400`, aturan bisnis dijawab `422` (atau status yang disepakati tim).
- [ ] Tabel punya constraint untuk invarian penting: `CHECK`, `NOT NULL`, `UNIQUE`, foreign key.
- [ ] Tidak ada `catch` atau `if err != nil` yang mengabaikan error tanpa mencatatnya.
- [ ] Response `500` tidak berisi pesan database atau stack trace.

## Bacaan lanjut

- [OWASP: Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [PostgreSQL: Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [RFC 9457: Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html)

<div data-bb="umpan-balik"></div>
