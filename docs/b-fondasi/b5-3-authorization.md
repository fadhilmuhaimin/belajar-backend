---
title: "1.13 Authorization: siapa boleh apa"
---

<div data-bb="kamu-di-sini" data-tahap="1"></div>

# 1.13 Authorization: siapa boleh apa

Baca 7 menit · coba 2 menit · Prasyarat: [[B5.1]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Token Budi valid. Apakah itu berarti Budi boleh membaca `GET /akun/ani`?
    2. Kenapa Rekeningo menjawab akun orang lain dengan `404`, bukan `403`?
    3. Di Supabase dengan RLS aktif tanpa satu pun policy, siapa yang bisa membaca tabel itu?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

Authentication menjawab siapa kamu, authorization menjawab boleh tidaknya aksi ini pada data ini. Setiap endpoint yang menerima ID harus memeriksa kepemilikan. Lupa sekali, semua data bisa dibaca.

<div data-bb="arsitektur" data-tahap="1"></div>

## Lihat sendiri

Budi mengganti ID di URL. Request dan response di widget ini direkam dari server lab Rekeningo.

<div data-bb="alur" data-src="data/skenario/b5-3-pemilik.json"></div>

## Kenapa ini ada

Minggu keempat uji coba. Seorang penguji melaporkan hal aneh: ia bisa melihat saldo Warung Ani.

Caranya sederhana. Ia memasang proxy di laptop, melihat request `GET /akun/budi` dari app, lalu mengganti `budi` dengan `ani`. Token-nya asli, jadi server menjawab.

Raka sudah memasang pemeriksaan token di semua endpoint ([[B5.1]]). Yang lupa: membandingkan pemilik token dengan pemilik data. Di app, tombol "lihat akun orang lain" memang tidak ada. Tapi request tidak harus lewat tombol.

## Cara kerjanya

**Tiga bentuk authorization**, dari yang paling sering:

| Bentuk | Pertanyaan | Contoh di Rekeningo |
|---|---|---|
| Kepemilikan (object-level) | Apakah data ini milik peminta? | Budi hanya boleh membaca akun dan riwayat Budi |
| Peran (RBAC) | Apakah peran peminta boleh melakukan aksi ini? | Hanya peran `admin` yang boleh membekukan akun |
| Atribut | Apakah kondisi tertentu terpenuhi? | Transfer di atas Rp5.000.000 hanya untuk akun terverifikasi (Tahap 4) |

OWASP menempatkan kegagalan cek kepemilikan, disebut **BOLA** (Broken Object Level Authorization), di peringkat pertama API Security Top 10 2023. Panduannya: setiap endpoint yang menerima ID objek harus memeriksa hak peminta atas objek itu ([OWASP API1:2023](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)).

Kode cek kepemilikan di lab:

```go
--8<-- "labs/api-t1/layanan.go:pemilik"
```

```text title="Output rekaman: labs/api-t1/output/b5-3-pemilik.txt"
--8<-- "labs/api-t1/output/b5-3-pemilik.txt"
```

**Keputusan desain: `404` atau `403`.** `403` jujur: "kamu dikenal, tapi tidak boleh". Tapi `403` untuk ID yang ada dan `404` untuk yang tidak ada membuka jalan menebak akun mana yang terdaftar. Rekeningo memilih `404` untuk keduanya. Tim lain boleh memilih `403`, asal konsisten dan sadar risikonya.

**Row Level Security (RLS)** memindahkan cek kepemilikan ke dalam PostgreSQL. Database menyaring baris berdasarkan policy, apa pun query-nya ([PostgreSQL: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)). Supabase memakainya sebagai pengaman utama, karena app membaca tabel langsung.

```sql
--8<-- "labs/b5-rls/rls.sql:policy"
```

```text title="Output rekaman: labs/b5-rls/output/rls.txt"
--8<-- "labs/b5-rls/output/rls.txt"
```

Tiga hal dari dokumentasi dan rekaman di atas:

- Superuser dan role dengan atribut `BYPASSRLS` selalu melewati RLS. Pemilik tabel juga, kecuali tabelnya diberi `FORCE ROW LEVEL SECURITY`. Karena itu role `lab` di rekaman melihat semua baris.
- Policy menyaring, tidak melempar error. `UPDATE` ke akun Ani menghasilkan `UPDATE 0`, bukan penolakan.
- Tanpa identitas user, policy ini tidak cocok dengan baris mana pun, jadi hasilnya kosong. Tabel dengan RLS aktif tanpa policy sama sekali juga menolak semua akses (default deny).

## Di stack lain

**Skenario:** Budi meminta akun Ani. Tab Go dijalankan di lab. Tab lain tidak dijalankan, hanya dicek ke dokumentasi.

Yang sama di semua stack: cek dilakukan di server, setelah authentication. Yang berbeda: **di mana aturan ditulis**.

=== "Go"

    *Dijalankan: Go 1.27.1, PostgreSQL 17.11.*

    ```go
    if !tanpaCekPemilik && peminta != id {
        return Akun{}, ErrTidakDitemukan
    }
    ```

    **Yang berbeda di stack ini:** aturan ditulis sebagai kode biasa di logika bisnis.
    {: .bb-beda }

=== "Laravel"

    *Tidak dijalankan. Dicek ke [Laravel: Authorization (policies)](https://laravel.com/docs/12.x/authorization).*

    ```php
    class AkunPolicy {
        public function view(User $user, Akun $akun): bool {
            return $user->id === $akun->user_id;
        }
    }
    // di controller
    Gate::authorize('view', $akun);
    ```

    **Yang berbeda di stack ini:** aturan per model ditulis di class Policy. Gagal otomatis dijawab `403`. Untuk `404`, cari data lewat relasi milik user, mis. `$request->user()->akun()->findOrFail($id)`.
    {: .bb-beda }

=== "Django"

    *Tidak dijalankan. Dicek ke [Django: get_object_or_404](https://docs.djangoproject.com/en/stable/topics/http/shortcuts/#get-object-or-404).*

    ```python
    def lihat_akun(request, id):
        akun = get_object_or_404(Akun, id=id, pemilik=request.user)
        return JsonResponse({"id": akun.id, "saldo": akun.saldo})
    ```

    **Yang berbeda di stack ini:** filter pemilik ditulis langsung di query. Akun orang lain otomatis jadi `404`.
    {: .bb-beda }

=== "Spring"

    *Tidak dijalankan. Dicek ke [Spring Security: Method security](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html).*

    ```java
    @PreAuthorize("#id == authentication.name")
    @GetMapping("/akun/{id}")
    Akun lihat(@PathVariable String id) { return layanan.akun(id); }
    ```

    **Yang berbeda di stack ini:** aturan ditulis sebagai ekspresi di anotasi. Gagal dijawab `403`.
    {: .bb-beda }

=== "Supabase"

    *Rekaman SQL di atas dijalankan di PostgreSQL 17.11. Bentuk Supabase dicek ke [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).*

    ```sql
    alter table akun enable row level security;
    create policy "pemilik saja" on akun for select
      using ((select auth.uid()) = user_id);
    ```

    **Yang berbeda di stack ini:** app membaca tabel langsung, jadi RLS satu-satunya pengaman. `auth.uid()` mengambil id user dari JWT Supabase.
    {: .bb-beda }

## Trade-off: kapan pakai apa

| Di mana cek ditulis | Kelebihan | Kekurangan |
|---|---|---|
| Kode di logika bisnis | Mudah dibaca dan dites, pesan error bebas | Harus diingat di setiap endpoint |
| Filter di query (`WHERE pemilik = ...`) | Lupa cek = data tidak ditemukan, bukan bocor | Aturan tersebar di banyak query |
| RLS di database | Berlaku untuk semua query, termasuk yang lupa | Lebih sulit di-debug; superuser dan pemilik tabel melewatinya |

Rekeningo memakai cek di logika bisnis ditambah test untuk setiap endpoint ber-ID ([[C1]]). RLS dipertimbangkan kalau suatu saat app membaca database langsung.

## Cek diri

**1.** Endpoint `GET /transfers/{id}` sudah memeriksa token. Apa yang masih kurang?

??? success "Jawaban"

    Cek bahwa transfer itu milik peminta: peminta adalah pengirim atau penerima. Tanpa itu, Budi bisa membaca transfer siapa pun dengan menebak ID, yang biasanya berurutan.

**2.** Jelaskan kenapa menyembunyikan tombol di app bukan authorization.

??? success "Jawaban"

    Request bisa dikirim tanpa app, mis. lewat proxy atau `curl`, dengan token yang sah. Server tidak bisa membedakan request dari tombol dan request buatan tangan. Hanya pemeriksaan di server yang berlaku untuk semua jalur.

**3.** Di rekaman RLS, `UPDATE akun SET saldo = 0 WHERE id = 'ani'` sebagai Budi menghasilkan `UPDATE 0`. Kenapa bukan error?

??? success "Jawaban"

    Policy menyaring baris yang terlihat. Bagi Budi, baris Ani tidak ada, jadi `UPDATE` tidak menemukan baris untuk diubah. Artinya, kode yang memakai RLS harus memeriksa jumlah baris berubah, bukan hanya ada tidaknya error.

## Saat me-review kode AI, cek ini

- [ ] Setiap endpoint yang menerima ID memeriksa hubungan peminta dengan objek itu.
- [ ] Query mengambil data lewat pemilik (`WHERE id = $1 AND pemilik = $2`), bukan hanya ID.
- [ ] Ada test yang memakai token user A untuk meminta data user B.
- [ ] Cek peran admin ada di server, bukan flag `isAdmin` dari body request.
- [ ] Kalau memakai RLS: aplikasi tidak terhubung sebagai superuser atau pemilik tabel.

## Bacaan lanjut

- [OWASP API Security Top 10 2023: API1 BOLA](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- [PostgreSQL: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

<div data-bb="umpan-balik"></div>
