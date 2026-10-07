---
title: "1.3 Perjalanan satu request"
---

<div data-bb="kamu-di-sini" data-tahap="1"></div>

# 1.3 Perjalanan satu request

Baca 6 menit · coba 3 menit · Prasyarat: [[A1]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Budi menekan Kirim. Lewat lapisan apa saja request itu sebelum saldo berubah?
    2. Apa arti status `201`, `400`, dan `401`?
    3. Database sudah menyimpan transfer, tapi sinyal putus sebelum response sampai. Apa yang dilihat Budi?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

Tap Kirim menghasilkan satu HTTP request. Request melewati handler, logika bisnis, dan akses data, lalu kembali sebagai response. Setiap langkah bisa gagal, dan app harus siap.

<div data-bb="arsitektur" data-tahap="1"></div>

## Lihat sendiri

Ikuti satu transfer dari tap sampai layar berubah. Paket biru di bawah jalur menunjukkan posisi data saat ini. Di jalur API, lapisan yang sedang bekerja ikut tersorot.

<div data-bb="alur" data-src="data/a2-alur.json"></div>

## Kenapa ini ada

Ini minggu pertama uji coba. Raka menulis endpoint transfer pertamanya. Selama ini, di sisi Flutter, ia hanya menulis satu baris:

```dart
final res = await http.post(Uri.parse('$baseUrl/transfers'), headers: headers, body: jsonEncode(body));
```

Semua yang terjadi setelah `await` dulu adalah kotak hitam. Sekarang Raka yang mengisi kotak itu, dan ia harus menjawab tiga pertanyaan:

1. **Di mana aturan dicek?** Ambil aturan "saldo harus cukup" sebagai contoh. App boleh memeriksa format nominal lebih dulu (langkah 1), tapi saldo hanya bisa diputuskan oleh logika bisnis di server (langkah 4).
2. **Status apa untuk tiap kegagalan?** Token salah ditolak handler dengan `401` (langkah 3). Saldo kurang ditolak logika bisnis dengan `422` (langkah 4). Database tidak terjangkau berakhir sebagai `500` (langkah 5).
3. **Apa yang dikirim balik di response, supaya app tidak perlu request kedua?** Response transfer membawa saldo terbaru (langkah 8), jadi app langsung memperbarui layar (langkah 9).

Varian "sinyal putus" di widget juga bukan teori. Di kantin kompleks, sinyal sering hilang di lift dan tangga. Masalah ini akan kembali di Tahap 2 sebagai dobel bayar.

## Cara kerjanya

Satu request terdiri dari empat bagian. Satu response terdiri dari dua.

| Request | Contoh di transfer | Response | Contoh |
|---|---|---|---|
| Method | `POST` (membuat data baru) | Status | `201 Created` |
| Path | `/transfers` | Body | `{"id": 812, "saldo": 30000}` |
| Header | `Authorization: Bearer ...` | | |
| Body | `{"ke": "ani", "jumlah": 70000}` | | |

Di dalam API, request melewati tiga lapisan. Masing-masing boleh menghentikan perjalanan:

| Lapisan | Memeriksa | Kalau gagal, app menerima |
|---|---|---|
| Handler | Token, format JSON, tipe data | `401` belum login, `400` format salah |
| Logika bisnis | Aturan Rekeningo: penerima ada, saldo cukup | `422`, dengan pesan yang bisa ditampilkan |
| Akses data | Query berhasil, constraint database | `500` kalau ada error yang tidak terduga |

**Keputusan desain: status untuk saldo kurang.** HTTP tidak punya status khusus "saldo kurang". Raka harus memilih, dan ada tiga kandidat yang wajar:

| Status | Definisi di RFC 9110 | Cocok untuk saldo kurang? |
|---|---|---|
| [`400`](https://www.rfc-editor.org/rfc/rfc9110.html#status.400) Bad Request | Server menganggap ada kesalahan di sisi client, mis. sintaks request rusak | Kurang tepat. Request Budi tidak rusak |
| [`409`](https://www.rfc-editor.org/rfc/rfc9110.html#status.409) Conflict | Request bentrok dengan keadaan resource saat ini, dan user mungkin bisa menyelesaikannya lalu mengirim ulang | Masuk akal. Saldo memang keadaan saat ini |
| [`422`](https://www.rfc-editor.org/rfc/rfc9110.html#status.422) Unprocessable Content | Format dan sintaks benar, tapi instruksi di dalamnya tidak bisa diproses | **Dipilih Rekeningo** |

Raka memilih `422`, supaya `400` tetap berarti "format salah" dan `409` disimpan untuk bentrok versi data. Pilihan `409` juga sah, asal dipakai konsisten. Yang penting, app bisa membedakan "perbaiki input" dari "saldo tidak cukup" lewat kode error di body ([[B1.2]]).

Ada satu kegagalan yang **tidak** menghasilkan status apa pun: response hilang di jalan. App hanya tahu "tidak ada jawaban". App tidak bisa membedakan "server gagal" dari "server sukses, tapi jawabannya hilang".

Karena itu tombol "Coba lagi" berbahaya untuk aksi yang memindahkan uang. Solusinya, idempotency key, ada di Tahap 2.

Arti tiap status code didefinisikan di [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html). Ringkasannya ada di [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status). Detail pemilihan status dibahas di [[B1.1]] dan [[B1.2]].

## Di stack lain

Ketiga lapisan ada di semua stack, dengan nama berbeda.

| Stack | Handler | Logika bisnis | Akses data |
|---|---|---|---|
| Go (`net/http`) | `http.HandlerFunc` | struct service biasa | `database/sql` atau sqlc |
| Node.js (Express) | route handler `app.post(...)` | modul fungsi biasa | `pg` atau query builder |
| Laravel | Controller | class service atau action | Eloquent model atau query builder |
| Django | View | modul fungsi (sering `services.py`, konvensi tim) | ORM model |
| Spring | `@RestController` | `@Service` | `@Repository` / Spring Data |
| Supabase | PostgREST (otomatis) | fungsi SQL atau Edge Function | tabel + RLS |

Framework hanya menyediakan tempat untuk handler dan akses data. Lapisan logika bisnis biasanya harus kamu jaga sendiri, karena kode paling mudah ditulis langsung di handler. Itu topik [[B7.1]].

## Trade-off: kapan pakai apa

Satu keputusan kecil yang langsung terasa di app: berapa lama app menunggu response sebelum menyerah?

| Timeout di app | Kelebihan | Kekurangan |
|---|---|---|
| Pendek (mis. 5 detik) | Budi cepat dapat kabar | Lebih sering "gagal" padahal server sukses |
| Panjang (mis. 30 detik) | Lebih jarang gagal palsu | Budi menatap loading lama, lalu menutup app |
| Mana pun, ditambah idempotency key | Aman diulang | Butuh kerja di app dan backend (Tahap 2) |

Angka 5 dan 30 detik di atas hanya contoh. Ukur waktu respons API-mu sendiri sebelum memilih.

## Cek diri

**1.** Budi mengirim nominal `"tujuh puluh ribu"` (teks, bukan angka). Lapisan mana yang menolak, dan status apa yang ia terima?

??? success "Jawaban"

    Handler yang menolaknya, karena ini soal format data. App menerima status `400 Bad Request`. Logika bisnis tidak perlu dijalankan sama sekali.

**2.** Response transfer membawa `saldo` terbaru. Apa untungnya bagi app?

??? success "Jawaban"

    App bisa langsung memperbarui layar tanpa request `GET` kedua. Satu perjalanan lebih sedikit berarti lebih cepat dan lebih sedikit tempat yang bisa gagal.

**3.** Jelaskan kenapa app tidak boleh otomatis mengulang `POST /transfers` setelah timeout.

??? success "Jawaban"

    Timeout tidak berarti gagal. Database mungkin sudah COMMIT, dan hanya response yang hilang. Mengulang request berarti meminta transfer kedua. Tanpa idempotency key, backend akan memprosesnya, dan Budi tertagih dua kali.

## Saat me-review kode AI, cek ini

- [ ] Handler hanya mengurus HTTP: parsing, token, format. Aturan bisnis ada di lapisan lain.
- [ ] Setiap jalur gagal mengembalikan status yang tepat, bukan `200` dengan `{"error": ...}`.
- [ ] Response aksi tulis membawa data yang dibutuhkan app untuk memperbarui layar.
- [ ] Di app: `POST` yang memindahkan uang tidak di-retry otomatis tanpa idempotency key.
- [ ] Ada timeout eksplisit di client HTTP app, bukan bawaan tanpa batas.

## Bacaan lanjut

- [MDN: Overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview) · [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Flutter: Send data to the internet](https://docs.flutter.dev/cookbook/networking/send-data) · [package http](https://pub.dev/packages/http)
- Handler di tiap stack: [Go net/http](https://pkg.go.dev/net/http) · [Express routing](https://expressjs.com/en/guide/routing.html) · [Laravel controllers](https://laravel.com/docs/12.x/controllers) · [Django views](https://docs.djangoproject.com/en/stable/topics/http/views/) · [Spring MVC controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html)


<div data-bb="umpan-balik"></div>
