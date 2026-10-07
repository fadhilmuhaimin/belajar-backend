---
title: "3.7 Security dasar dan rate limit"
---

<div data-bb="kamu-di-sini" data-tahap="3"></div>

# 3.7 Security dasar dan rate limit

Baca 7 menit · coba 3 menit · Prasyarat: [[B5.1]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Kenapa rate limit per IP saja bisa memblokir user asli?
    2. Status code dan header apa yang dikirim saat request ditolak rate limit?
    3. API berjalan di dua instance, rate limiter disimpan di memori, batasnya 5 percobaan per akun. Berapa tebakan yang bisa lolos?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

Batasi percobaan login per akun, bukan hanya per IP. Satu IP bisa dipakai puluhan user asli. Tolak dengan 429.

<div data-bb="arsitektur" data-tahap="3"></div>

## Lihat sendiri

Login Rekeningo memakai nomor HP dan PIN 6 digit. Rate limit di sini memakai token bucket: setiap IP atau akun punya ember berisi 5 token, dan setiap percobaan login mengambil satu token. Kirim tebakan, lalu ganti kunci embernya.

<div data-bb="ember" data-src="data/c4-ember.json"></div>

## Kenapa ini ada

Senin pagi, metric login ([[C2]]) melonjak: ±4.000 percobaan gagal dalam satu jam, semuanya dari satu IP. Seseorang menebak PIN akun-akun Rekeningo satu per satu.

PIN 6 digit punya 1.000.000 kemungkinan. Tanpa batas, script bisa mencoba ratusan PIN per detik. Raka memasang rate limit per IP: 5 percobaan, lalu satu lagi setiap 12 detik.

Besoknya, keluhan baru datang dari satu gedung perkantoran. Jam makan siang, 30 karyawan membuka Rekeningo lewat Wi-Fi yang sama. Hanya 5 yang bisa login.

## Cara kerjanya

**Token bucket.** Setiap kunci (IP atau akun) punya ember berisi token. Setiap request mengambil satu token. Ember terisi lagi dengan laju tetap, sampai penuh. Ember kosong berarti request ditolak sebelum PIN dicek.

```go title="labs/c4-ratelimit/main.go"
--8<-- "labs/c4-ratelimit/main.go:ember"
```

Kapasitas ember menentukan burst: berapa request boleh datang sekaligus. Laju isi menentukan rata-rata jangka panjang. Ini definisi yang sama dengan `golang.org/x/time/rate` ([dokumentasi](https://pkg.go.dev/golang.org/x/time/rate)). Di production, pakai library itu atau fitur gateway, bukan kode sendiri.

Penolakan memakai `429 Too Many Requests`. Header `Retry-After` memberi tahu berapa detik harus menunggu ([RFC 6585 §4](https://www.rfc-editor.org/rfc/rfc6585.html#section-4)). App membaca header ini, menampilkan "coba lagi dalam 12 detik", dan tidak langsung retry ([[E3]]).

```text title="Output rekaman: labs/c4-ratelimit/output/ratelimit.txt (bagian A dan B)"
--8<-- "labs/c4-ratelimit/output/ratelimit.txt:1:13"
```

**Kunci ember.** Bagian B adalah keluhan tadi: satu IP Wi-Fi dipakai 30 orang. OWASP menyarankan penghitung percobaan login dikaitkan ke akun, bukan ke IP, supaya penyerang tidak bisa berganti IP ([Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#account-lockout)). Rekeningo memakai dua ember: per akun yang ketat, dan per IP yang longgar untuk menahan banjir request.

```text title="Bagian C: ember per akun (5) + per IP longgar (60)"
--8<-- "labs/c4-ratelimit/output/ratelimit.txt:15:24"
```

Penyerang berganti IP di setiap tebakan, tapi tetap berhenti di 5. Ke-30 karyawan semuanya masuk. Rata-rata, PIN ketemu setelah separuh kemungkinan dicoba. Dengan batas ini, itu 500.000 ÷ 5 per menit = 100.000 menit, ±69 hari per akun (hitungan, bukan rekaman).

**IP di belakang load balancer.** Tahap 3 punya dua instance di belakang load balancer, jadi IP koneksi adalah IP load balancer. IP asli ada di header `X-Forwarded-For`, yang bisa dipalsukan siapa pun. Pakai hanya bagian yang ditambahkan proxy milikmu sendiri ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For#security_and_privacy_concerns)).

Lab ini meniru IP lewat header `X-Lab-IP`, khusus lab.

**Dua instance, dua ember.** Ember di lab disimpan di memori proses. Dengan dua instance, setiap instance punya embernya sendiri:

```text title="Bagian D: dua instance, ember di memori masing-masing"
--8<-- "labs/c4-ratelimit/output/ratelimit.txt:26:39"
```

Batas 5 jadi 10. Perbaikannya: simpan ember di tempat bersama, mis. Redis yang sudah ada di arsitektur Tahap 3 (tidak dijalankan di lab ini).

**Security dasar lain** sudah dibahas di halaman sebelumnya. Password di-hash dan token berumur pendek ([[B5.1]]). Pemilik data dicek ([[B5.3]]), input divalidasi di server ([[B6]]), dan secret dibaca dari environment ([[C3]]). Daftar risiko API yang lebih lengkap ada di [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x11-t10/).

## Di stack lain

Yang sama di semua stack: hitung request per kunci, tolak dengan `429`. Yang berbeda: tempat hitungan disimpan, dan siapa yang mengerjakannya (aplikasi atau gateway). Hanya Go yang dijalankan di lab. Baris lain dicek ke dokumentasi.

| Stack | Cara umum | Hitungan disimpan di | Sumber |
|---|---|---|---|
| Go | `rate.NewLimiter(r, b)` per kunci (token bucket) | Memori proses | [x/time/rate](https://pkg.go.dev/golang.org/x/time/rate) |
| Express | Middleware `rateLimit({ windowMs, limit })` | Memori bawaan; `store` untuk berbagi antar-node | [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) |
| Laravel | `RateLimiter::for(...)` + middleware `throttle` | Cache aplikasi; bisa diarahkan ke Redis | [Laravel: Rate limiting](https://laravel.com/docs/12.x/routing#rate-limiting) |
| Django REST framework | `AnonRateThrottle`, `UserRateThrottle` | Cache Django; bawaannya `LocMemCache`, memori per proses | [DRF: Throttling](https://www.django-rest-framework.org/api-guide/throttling/) |
| Spring Cloud Gateway | Filter `RequestRateLimiter` (token bucket) | Redis | [Spring Cloud Gateway](https://docs.spring.io/spring-cloud-gateway/reference/spring-cloud-gateway-server-webflux/gatewayfilter-factories/requestratelimiter-factory.html) |

Dokumentasi DRF mencatat bahwa throttle bawaannya bisa meloloskan beberapa request lebih saat concurrency tinggi. Untuk login, itu masih bisa diterima. Untuk kuota berbayar, mungkin tidak.

## Trade-off: kapan pakai apa

| Pilihan | Kelebihan | Kekurangan |
|---|---|---|
| Ember per IP saja | Sederhana, menahan banjir request | Memblokir banyak user di satu Wi-Fi; penyerang tinggal ganti IP |
| Ember per akun saja | Tebakan per akun tetap lambat walau IP berganti | Penyerang bisa mencoba satu PIN ke banyak akun |
| Per akun + per IP longgar | Menahan dua pola serangan, user satu Wi-Fi tetap masuk | Dua ember dicek di setiap login |
| Kunci akun setelah N gagal (lockout) | Tebakan berhenti total | Penyerang bisa sengaja mengunci akun orang lain |

## Cek diri

**1.** Ember 5 token, terisi 1 token per 12 detik. Penyerang mengirim 8 tebakan, lalu menunggu 30 detik dan mengirim 3 lagi. Berapa dari 3 tebakan terakhir yang sampai ke pemeriksaan PIN?

??? success "Jawaban"

    Dua. Setelah 8 tebakan, ember kosong. Dalam 30 detik terisi 30 ÷ 12 = 2,5 token. Dua tebakan mengambil dua token penuh, yang ketiga ditolak `429`.

**2.** Jelaskan kenapa rate limit di memori proses tidak cukup untuk Rekeningo Tahap 3.

??? success "Jawaban"

    Tahap 3 menjalankan dua instance API. Setiap instance menyimpan embernya sendiri, jadi batas 5 per akun menjadi 10 (rekaman bagian D). Hitungan harus disimpan di tempat bersama, mis. Redis, atau dikerjakan gateway di depan kedua instance.

**3.** App menerima `429` dengan `Retry-After: 12`. Apa yang sebaiknya dilakukan app?

??? success "Jawaban"

    Tampilkan pesan dengan waktu tunggu, mis. "Coba lagi dalam 12 detik", dan nonaktifkan tombol sampai waktunya habis. Jangan retry otomatis. Retry langsung hanya menghabiskan token berikutnya.

## Saat me-review kode AI, cek ini

- [ ] Rate limit login memakai kunci akun, bukan hanya IP.
- [ ] Batas dicek sebelum PIN atau password diverifikasi.
- [ ] Hitungan disimpan di tempat bersama kalau ada lebih dari satu instance.
- [ ] IP diambil dari koneksi atau dari proxy tepercaya, bukan langsung dari `X-Forwarded-For`.
- [ ] Response `429` menyertakan `Retry-After`, dan app menghormatinya.

## Bacaan lanjut

- [RFC 6585 §4: 429 Too Many Requests](https://www.rfc-editor.org/rfc/rfc6585.html#section-4)
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP API4:2023 Unrestricted Resource Consumption](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/)
- [Go: golang.org/x/time/rate](https://pkg.go.dev/golang.org/x/time/rate)

<div data-bb="umpan-balik"></div>
