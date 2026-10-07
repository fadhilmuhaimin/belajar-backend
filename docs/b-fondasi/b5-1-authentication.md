---
title: "1.12 Authentication: session atau token"
---

<div data-bb="kamu-di-sini" data-tahap="1"></div>

# 1.12 Authentication: session atau token

Baca 7 menit · coba 3 menit · Prasyarat: [[B1.1]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Isi payload JWT bisa dibaca siapa saja. Lalu apa yang mencegah user mengubahnya?
    2. Apa kelemahan utama JWT dibanding session yang disimpan di server?
    3. Di HP, token sebaiknya disimpan di mana?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

Authentication menjawab siapa pengirim request. Setelah login, server memberi bukti berumur pendek: session id yang dicek ke database, atau token bertanda tangan.

<div data-bb="arsitektur" data-tahap="1"></div>

## Lihat sendiri

Login, lalu membuka saldo. Request, response, dan isi token di widget ini direkam dari server lab Rekeningo.

<div data-bb="alur" data-src="data/skenario/b5-1-token.json"></div>

## Kenapa ini ada

Versi pertama endpoint saldo Rekeningo menerima `GET /akun/budi?pin=123456`. Setiap request membawa PIN.

Raka segera melihat tiga masalah. PIN ikut tercatat di log server, karena URL selalu dicatat. App harus menyimpan PIN di HP untuk dikirim terus. Dan untuk mengganti PIN, semua sesi di semua perangkat harus ikut berubah.

Raka butuh pola yang dipakai semua app yang ia kenal: login sekali, lalu bawa bukti yang berumur pendek.

## Cara kerjanya

**Simpan hash, bukan PIN.** Database menyimpan hasil fungsi hash yang sengaja lambat, mis. bcrypt. Login membandingkan hash, bukan teks.

OWASP mencantumkan Argon2id, scrypt, bcrypt, dan PBKDF2 sebagai pilihan ([Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)). PIN 6 digit hanya punya sejuta kemungkinan, jadi pembatasan percobaan login ([[C4]]) tetap wajib.

**Dua cara membawa bukti setelah login:**

| | Session | Token bertanda tangan (JWT) |
|---|---|---|
| Yang dipegang app | Session id acak | Token berisi data (`sub`, `exp`) + signature |
| Cara server memeriksa | Cari session id di database atau cache | Hitung ulang signature dengan secret |
| Mencabut akses | Hapus baris session, langsung berlaku | Sulit sebelum `exp`, kecuali ada daftar token yang dicabut |
| Beban per request | Satu query | Perhitungan kriptografi, tanpa query |

**Isi JWT terbuka, tapi tidak bisa diubah.** Header dan payload hanya base64url, bukan enkripsi ([RFC 7519](https://www.rfc-editor.org/rfc/rfc7519.html)). Signature mengikat keduanya ke secret server. Rekaman lab membuktikannya: payload yang diubah ditolak, dan header `"alg": "none"` juga ditolak.

```text title="Output rekaman: labs/api-t1/output/b5-1-token.txt"
--8<-- "labs/api-t1/output/b5-1-token.txt"
```

Penolakan `"alg": "none"` bukan kebetulan. RFC 8725 mewajibkan library JWT memeriksa algoritma dari daftar yang diizinkan, bukan mempercayai header token ([RFC 8725 §3.1](https://www.rfc-editor.org/rfc/rfc8725.html#name-perform-algorithm-verificat)).

**Umur pendek + refresh token.** Token akses berumur pendek (lab: 15 menit) membatasi kerugian kalau token dicuri. Supaya user tidak login ulang terus, app memegang refresh token yang berumur panjang dan bisa dicabut di server. Contoh nyata: Supabase Auth memakai access token JWT berumur 5 menit sampai 1 jam, dan refresh token yang hanya bisa dipakai sekali ([Supabase: Sessions](https://supabase.com/docs/guides/auth/sessions)).

**Di HP**, simpan token di Keychain (iOS) atau Keystore (Android), mis. lewat [flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage). Jangan di penyimpanan biasa, dan jangan di URL.

## Di stack lain

**Skenario:** memeriksa bukti login di setiap request. Tab Go dijalankan di lab. Tab lain tidak dijalankan, hanya dicek ke dokumentasi.

Yang sama di semua stack: bukti dibawa di header atau cookie, diperiksa sebelum handler, dan punya batas umur. Yang berbeda: **jenis buktinya**.

=== "Go"

    *Dijalankan: Go 1.27.1, HMAC-SHA256 dari pustaka standar.*

    ```go
    --8<-- "labs/api-t1/token.go:token"
    ```

    **Yang berbeda di stack ini:** lab menulis JWT sendiri supaya isinya terlihat. Di production, pakai library yang teruji, mis. `golang-jwt`, dan tetap batasi algoritmanya.
    {: .bb-beda }

=== "Laravel (Sanctum)"

    *Tidak dijalankan. Dicek ke [Laravel Sanctum](https://laravel.com/docs/12.x/sanctum).*

    ```php
    $token = $user->createToken('hp-budi')->plainTextToken;   // dikirim sekali ke app
    Route::get('/akun/{id}', [AkunController::class, 'show'])->middleware('auth:sanctum');
    ```

    **Yang berbeda di stack ini:** token API Sanctum bukan JWT. Token disimpan di database sebagai hash SHA-256, jadi perilakunya seperti session: mudah dicabut, butuh query per request.
    {: .bb-beda }

=== "Django"

    *Tidak dijalankan. Dicek ke [Django: Sessions](https://docs.djangoproject.com/en/stable/topics/http/sessions/).*

    ```python
    from django.contrib.auth import authenticate, login

    user = authenticate(request, username="budi", password=pin)
    if user is not None:
        login(request, user)        # membuat session; id-nya dikirim lewat cookie
    ```

    **Yang berbeda di stack ini:** bawaan Django adalah session yang disimpan di database. Untuk app mobile, banyak tim memakai token lewat library tambahan.
    {: .bb-beda }

=== "Spring"

    *Tidak dijalankan. Dicek ke [Spring Security: OAuth 2.0 Resource Server JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html).*

    ```java
    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()));
        return http.build();
    }
    ```

    **Yang berbeda di stack ini:** Spring Security memeriksa JWT sebelum controller. Biasanya token diterbitkan oleh server login terpisah ([[B5.2]]), bukan oleh API itu sendiri.
    {: .bb-beda }

=== "Supabase"

    *Tidak dijalankan. Dicek ke [Supabase: Sessions](https://supabase.com/docs/guides/auth/sessions).*

    ```dart
    final res = await supabase.auth.signInWithPassword(email: email, password: pin);
    // supabase_flutter menyimpan access token + refresh token dan memperbaruinya otomatis
    ```

    **Yang berbeda di stack ini:** login, penyimpanan token, dan refresh sudah disediakan. Yang tetap tugasmu: aturan akses data (RLS, [[B5.3]]).
    {: .bb-beda }

## Trade-off: kapan pakai apa

| Pilihan | Kelebihan | Kekurangan |
|---|---|---|
| Session di server | Cabut akses langsung, mis. saat HP hilang | Satu query per request; perlu penyimpanan bersama kalau server lebih dari satu (Tahap 3) |
| JWT tanpa refresh token, umur panjang | Paling sederhana | Token curian berlaku lama dan tidak bisa dicabut |
| JWT umur pendek + refresh token di server | Pemeriksaan tanpa query, tetap bisa dicabut lewat refresh token | Dua jenis token; app harus menangani refresh ([[E3]]) |

Rekeningo memakai JWT 15 menit + refresh token. Alasannya: pemeriksaan tanpa query untuk request yang sering, dan "keluar dari semua perangkat" tetap bisa dilakukan lewat refresh token.

## Cek diri

**1.** Budi mendekode token-nya dan membaca `"sub": "budi"`. Apakah ini celah keamanan?

??? success "Jawaban"

    Bukan. Payload JWT memang tidak rahasia, hanya tidak bisa diubah tanpa ketahuan. Karena itu, jangan pernah menaruh data rahasia (PIN, nomor identitas) di payload.

**2.** HP Budi hilang. Dengan JWT 15 menit + refresh token, apa yang dilakukan server supaya pencuri tidak bisa memakai akun Budi?

??? success "Jawaban"

    Mencabut refresh token milik HP itu di database. Token akses yang sudah ada masih berlaku sampai `exp`, paling lama 15 menit. Setelah itu, refresh ditolak dan pencuri harus login ulang, padahal ia tidak tahu PIN.

**3.** Jelaskan kenapa server harus menolak token dengan `"alg": "none"`, walau token itu "valid" menurut format JWT.

??? success "Jawaban"

    `"none"` berarti tanpa signature. Kalau server mempercayai algoritma dari header token, siapa pun bisa membuat token tanpa secret. RFC 8725 mewajibkan daftar algoritma yang diizinkan ditentukan server, bukan oleh token.

## Saat me-review kode AI, cek ini

- [ ] PIN atau password disimpan sebagai hash lambat (Argon2id, bcrypt, scrypt), bukan teks atau SHA-256 polos.
- [ ] Token dikirim di header `Authorization`, tidak pernah di URL atau query string.
- [ ] Verifikasi JWT menetapkan algoritma yang diizinkan, memeriksa `exp`, dan memakai perbandingan signature yang aman.
- [ ] Ada cara mencabut akses: session dihapus, atau refresh token dicabut.
- [ ] Pesan login gagal sama untuk "akun tidak ada" dan "PIN salah".

## Bacaan lanjut

- [RFC 7519: JWT](https://www.rfc-editor.org/rfc/rfc7519.html) · [RFC 8725: JWT Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html) · [RFC 6750: Bearer token](https://www.rfc-editor.org/rfc/rfc6750.html)
- [OWASP: Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) · [OWASP: JWT](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
- [Android Keystore](https://developer.android.com/privacy-and-security/keystore) · [Apple Keychain Services](https://developer.apple.com/documentation/security/keychain-services)

<div data-bb="umpan-balik"></div>
