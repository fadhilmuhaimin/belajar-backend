---
title: "1.4 HTTP: method, status, header"
---

<div data-bb="kamu-di-sini" data-tahap="1"></div>

# 1.4 HTTP: method, status, header

Baca 7 menit · coba 3 menit · Prasyarat: [[A2]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Method apa untuk "buat transfer baru", dan status apa kalau berhasil?
    2. Apa beda `401` dan `403`?
    3. Di header mana token login dikirim, dan header apa yang wajib menyertai `401`?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

Method menyatakan maksud request. Status code menyatakan hasilnya, dan header membawa informasi tambahan. App harus bisa memutuskan apa yang ditampilkan dari ketiganya, tanpa menebak isi body.

<div data-bb="arsitektur" data-tahap="1"></div>

## Lihat sendiri

Pilih status code untuk tiap kejadian, lalu cek. Semua contoh diambil dari server lab Rekeningo yang direkam dengan `curl -i`.

<div data-bb="pilah" data-src="data/b1-1-pilah.json"></div>

## Kenapa ini ada

Di minggu pertama, endpoint transfer buatan Raka selalu menjawab `200`. Kalau gagal, body-nya berisi `{"error": "saldo kurang"}`.

Di Flutter, kode lama Raka berbunyi `if (res.statusCode == 200) tampilkanSukses()`. Hasilnya, Budi melihat toast "Transfer berhasil" untuk transfer yang ditolak. Budi baru sadar saat saldo di layar tidak berubah.

Masalahnya bukan di app. Server membuang informasi yang paling dasar: berhasil atau tidak. Raka memutuskan setiap kegagalan harus punya status code yang tepat.

## Cara kerjanya

**Method** menyatakan maksud. Dua sifatnya penting untuk app, karena menentukan boleh tidaknya request diulang ([RFC 9110 §9.2](https://www.rfc-editor.org/rfc/rfc9110.html#name-common-method-properties)):

| Method | Untuk | Safe (tidak mengubah data) | Idempotent (aman diulang) |
|---|---|---|---|
| `GET` | Membaca: `GET /akun/budi` | Ya | Ya |
| `POST` | Membuat atau memproses: `POST /transfers` | Tidak | Tidak |
| `PUT` | Mengganti seluruh resource | Tidak | Ya |
| `PATCH` | Mengubah sebagian resource ([RFC 5789](https://www.rfc-editor.org/rfc/rfc5789.html)) | Tidak | Tidak (RFC 5789) |
| `DELETE` | Menghapus | Tidak | Ya |

**Status code** dikelompokkan oleh digit pertamanya: `2xx` berhasil, `4xx` kesalahan di sisi pengirim, `5xx` kesalahan di sisi server ([RFC 9110 §15](https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes)). Bedakan dua yang sering tertukar:

- `401 Unauthorized`: server belum tahu siapa kamu. Token tidak ada, salah, atau kedaluwarsa.
- `403 Forbidden`: server tahu siapa kamu, tapi kamu tidak boleh melakukannya.

**Header** membawa informasi di luar body. Yang muncul di rekaman lab:

| Header | Arah | Isinya |
|---|---|---|
| `Authorization: Bearer <token>` | request | Token login |
| `Content-Type` | keduanya | Format body, mis. `application/json` atau `application/problem+json` untuk error |
| `Location: /transfers/1` | response `201` | Alamat resource yang baru dibuat |
| `WWW-Authenticate` | response `401` | Cara autentikasi yang diterima. Wajib menyertai `401` ([RFC 9110 §15.5.2](https://www.rfc-editor.org/rfc/rfc9110.html#status.401)) |
| `Allow: GET, HEAD` | response `405` | Method yang diterima path ini |

Rekaman lengkap dari server lab:

```text title="Output rekaman: labs/api-t1/output/b1-1-http.txt"
--8<-- "labs/api-t1/output/b1-1-http.txt"
```

Dua detail dari rekaman di atas:

- Go menulis `422 Unprocessable Entity`, nama lama sebelum RFC 9110 menggantinya jadi "Unprocessable Content". Tidak masalah, karena client wajib mengabaikan teks itu dan hanya membaca angkanya ([RFC 9112 §4](https://www.rfc-editor.org/rfc/rfc9112.html#name-status-line)).
- `405` dari router bawaan Go berupa teks biasa, bukan JSON. Kalau app mengharapkan semua error berformat JSON, router perlu dikonfigurasi. Format error dibahas di [[B1.2]].

## Di stack lain

**Skenario:** Budi mengirim Rp70.000 ke Ani lewat `POST /transfers`. Tab Go dijalankan di lab. Tab lain tidak dijalankan, hanya dicek ke dokumentasi masing-masing.

Yang sama di semua stack: router mencocokkan method dan path, middleware membaca token, handler membaca body, lalu menjawab `201` dengan `Location`. Klik satu langkah, dan baris yang mengerjakannya tersorot.

<div data-bb="stackstep" data-src="data/b1-1-stackstep.json"></div>

=== "Go"

    *Dijalankan: Go 1.27.1 `net/http`, PostgreSQL 17.11.*

    ```go
    --8<-- "labs/api-t1/main.go:rute"
    ```

    **Yang berbeda di stack ini:** sejak Go 1.22, method dan path ditulis dalam satu pola, `"POST /transfers"`. Method lain otomatis dijawab `405` dengan header `Allow` ([net/http ServeMux](https://pkg.go.dev/net/http#ServeMux)).
    {: .bb-beda }

=== "Node.js (Express)"

    *Tidak dijalankan. Dicek ke [Express routing](https://expressjs.com/en/guide/routing.html) dan [API reference](https://expressjs.com/en/5x/api/).*

    ```js
    app.post("/transfers", wajibLogin, async (req, res) => {
      const { id, saldo } = await layanan.transfer(req.user, req.body.ke, req.body.jumlah);
      res.status(201).location(`/transfers/${id}`).json({ id, saldo });
    });
    ```

    **Yang berbeda di stack ini:** `req.body` hanya terisi kalau middleware `express.json()` dipasang. Status bawaan `res.json()` adalah `200`, jadi `201` harus ditulis sendiri.
    {: .bb-beda }

=== "Laravel"

    *Tidak dijalankan. Dicek ke [Laravel routing](https://laravel.com/docs/12.x/routing) dan [responses](https://laravel.com/docs/12.x/responses).*

    ```php
    Route::post('/transfers', [TransferController::class, 'store'])->middleware('auth:sanctum');

    public function store(Request $request)
    {
        [$id, $saldo] = $this->layanan->transfer($request->user(), $request->input('ke'), $request->integer('jumlah'));
        return response()->json(['id' => $id, 'saldo' => $saldo], 201)
            ->header('Location', "/transfers/{$id}");
    }
    ```

    **Yang berbeda di stack ini:** token dibaca middleware `auth:sanctum`, bukan di controller.
    {: .bb-beda }

=== "Django"

    *Tidak dijalankan. Dicek ke [Django views](https://docs.djangoproject.com/en/stable/topics/http/views/) dan [request/response](https://docs.djangoproject.com/en/stable/ref/request-response/).*

    ```python
    urlpatterns = [path("transfers", transfers)]

    @require_POST
    def transfers(request):
        peminta = cek_token(request.headers.get("Authorization", ""))
        data = json.loads(request.body)
        id, saldo = layanan.transfer(peminta, data["ke"], data["jumlah"])
        res = JsonResponse({"id": id, "saldo": saldo}, status=201)
        res["Location"] = f"/transfers/{id}"
        return res
    ```

    **Yang berbeda di stack ini:** path tidak memuat method. Decorator `@require_POST` yang menolak method lain dengan `405`.
    {: .bb-beda }

=== "Spring"

    *Tidak dijalankan. Dicek ke [Spring MVC annotated controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html).*

    ```java
    @PostMapping("/transfers")
    ResponseEntity<Hasil> transfer(@RequestHeader("Authorization") String auth,
                                   @RequestBody Permintaan p) {
        Hasil h = layanan.transfer(peminta(auth), p.ke(), p.jumlah());
        return ResponseEntity.created(URI.create("/transfers/" + h.id())).body(h);
    }
    ```

    **Yang berbeda di stack ini:** `ResponseEntity.created(...)` mengisi status `201` dan header `Location` sekaligus. Di proyek nyata, token biasanya dibaca Spring Security, bukan `@RequestHeader`.
    {: .bb-beda }

## Trade-off: kapan pakai apa

| Pilihan | Kelebihan | Kekurangan |
|---|---|---|
| Selalu `200`, status di body | Satu jalur parsing di app | App, proxy, log, dan monitoring tidak bisa membedakan sukses dari gagal |
| Status code yang tepat | App, log, dan metric error bekerja tanpa membaca body | Tim harus sepakat status mana untuk kasus mana |
| Status yang tepat + body error standar ([[B1.2]]) | App bisa menampilkan pesan yang spesifik | Sedikit lebih banyak kode di server |

## Cek diri

**1.** Budi mengirim `GET /akun/budi` dengan token yang sudah kedaluwarsa. Status apa yang tepat: `401` atau `403`?

??? success "Jawaban"

    `401`. Token kedaluwarsa berarti server tidak bisa memastikan siapa pengirimnya. `403` dipakai kalau server tahu siapa kamu, tapi aksinya tidak diizinkan. Rekaman lab: `{"detail":"token kedaluwarsa"}` dengan status `401`.

**2.** Jelaskan kenapa app tidak boleh bergantung pada teks "Unprocessable Entity" di status line.

??? success "Jawaban"

    RFC 9112 menyatakan client harus mengabaikan teks itu, karena bisa diterjemahkan, diubah perantara, atau hilang di HTTP/2. Buktinya ada di lab: Go menulis "Unprocessable Entity", padahal RFC 9110 menamainya "Unprocessable Content". Yang bisa diandalkan hanya angka `422`.

**3.** Response `201` membawa header `Location: /transfers/1`. Apa gunanya bagi app?

??? success "Jawaban"

    App tahu alamat transfer yang baru dibuat. App bisa membukanya lagi, mis. untuk layar detail atau bukti transfer, tanpa menyusun URL sendiri.

## Saat me-review kode AI, cek ini

- [ ] Tidak ada `200` untuk kegagalan, dan tidak ada `{"success": false}` dengan status `200`.
- [ ] `POST` yang membuat resource menjawab `201` dengan header `Location`.
- [ ] `401` hanya untuk "belum dikenali", `403` atau `404` untuk "dikenali tapi tidak boleh".
- [ ] `GET` tidak mengubah data, karena bisa diulang oleh app, proxy, atau browser.
- [ ] Response error memakai `Content-Type` yang benar, dan app tidak membaca teks status line.

## Bacaan lanjut

- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) · [RFC 9112 §4: Status line](https://www.rfc-editor.org/rfc/rfc9112.html#name-status-line)
- [MDN: HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods) · [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

<div data-bb="umpan-balik"></div>
