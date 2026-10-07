---
title: "1.15 Testing: apa dites di level mana"
---

<div data-bb="kamu-di-sini" data-tahap="1"></div>

# 1.15 Testing: apa dites di level mana

Baca 7 menit · coba 3 menit · Prasyarat: [[B7.1]] · Jalur inti
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Aturan "maksimal Rp5.000.000 per transfer": unit test atau integration test?
    2. Kenapa test yang memakai data palsu di memori tidak bisa membuktikan `UPDATE ... WHERE saldo >= jumlah` aman dari race?
    3. Apakah `go test -race` menangkap race condition di database?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

Aturan bisnis dites di unit test yang cepat, tanpa database. Perilaku yang ditentukan database dan HTTP dites dengan database dan HTTP sungguhan. Setiap bug yang pernah lolos dijadikan regression test.

<div data-bb="arsitektur" data-tahap="1"></div>

## Lihat sendiri

Pilih level test yang paling tepat untuk tiap hal, lalu cek. Semua contoh punya pasangan test yang dijalankan di lab Rekeningo.

<div data-bb="pilah" data-src="data/c1-pilah.json"></div>

## Kenapa ini ada

Tahap 1 berjalan, dan Raka mulai takut mengubah kode. Setiap perubahan kecil ia uji dengan membuka app, login, lalu transfer. Satu perubahan makan waktu sepuluh menit.

Lalu satu perbaikan kecil di validasi diam-diam merusak format error. App menampilkan "Terjadi kesalahan" untuk saldo kurang selama dua hari, sampai ada penguji yang mengeluh.

Di Flutter, Raka menulis widget test dan unit test untuk view model. Backend butuh kebiasaan yang sama, dengan satu perbedaan penting: banyak bug backend hanya muncul di database sungguhan.

## Cara kerjanya

Tiga level, dengan porsi yang berbeda ([Fowler: Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)):

| Level | Menguji | Kecepatan | Di lab Rekeningo |
|---|---|---|---|
| Unit | Satu fungsi atau aturan, ketergantungan diganti data palsu | Milidetik | `TestTransferMenolakInputSalah` |
| Integration | Kode + database sungguhan + HTTP lewat `httptest` | Ratusan milidetik | `TestTransferLewatHTTP`, `TestDuaTransferBersamaan` |
| End-to-end | App + API + database bersama | Detik sampai menit | Sedikit saja, untuk jalur login dan transfer |

Unit test memakai data palsu yang memenuhi interface `Data` ([[B7.1]]):

```go
--8<-- "labs/api-t1/layanan_test.go:unit"
```

**Yang tidak bisa dibuktikan data palsu:** perilaku PostgreSQL. Constraint, transaction, dan lock hanya teruji di database sungguhan. Lab memakai PostgreSQL di Docker. Library seperti Testcontainers melakukan hal yang sama secara otomatis dari kode test.

**Regression test untuk race condition (pratinjau Tahap 2).** Race condition terjadi saat dua request membaca saldo yang sama, lalu sama-sama menulis hasil hitungannya sendiri. Bug dua penarikan di [[B3.2]] dijadikan test yang mengirim dua request paralel, lalu memeriksa total saldo:

```go
--8<-- "labs/api-t1/api_test.go:race"
```

```text title="Output rekaman: labs/api-t1/output/c1-race.txt"
--8<-- "labs/api-t1/output/c1-race.txt"
```

Test yang sama lolos untuk `UPDATE` atomik (saldo dikurangi di database dalam satu perintah) dan gagal untuk pola baca-hitung-tulis. Itulah syarat regression test yang berguna: ia harus gagal untuk bug yang ingin dicegahnya. Satu catatan jujur: implementasi naif di lab diberi jeda 50 ms supaya race-nya terjadi setiap kali. Di production, jendela race lebih sempit, dan test seperti ini bisa lolos secara kebetulan.

`go test -race` mendeteksi data race di memori proses Go yang sedang berjalan ([Go: Data Race Detector](https://go.dev/doc/articles/race_detector)). Ia tidak melihat dua transaction yang bertabrakan di PostgreSQL. Untuk itu butuh test seperti di atas.

Semua test lab:

```text title="Output rekaman: labs/api-t1/output/c1-test.txt"
--8<-- "labs/api-t1/output/c1-test.txt"
```

## Di stack lain

**Skenario:** integration test transfer Rp70.000 lewat HTTP, lalu cek saldo di database. Tab Go dijalankan di lab. Tab lain tidak dijalankan, hanya dicek ke dokumentasi.

Yang sama di semua stack: siapkan data, kirim request HTTP, cek status, lalu cek database. Yang berbeda: alat untuk mengirim request tanpa server sungguhan, dan cara membersihkan database antar-test.

<div data-bb="stackstep" data-src="data/c1-stackstep.json"></div>

=== "Go"

    *Dijalankan: Go 1.27.1 `net/http/httptest`, PostgreSQL 17.11.*

    ```go
    --8<-- "labs/api-t1/api_test.go:integrasi"
    ```

    **Yang berbeda di stack ini:** `httptest.NewServer` menjalankan router sungguhan di port acak. Data dibersihkan manual dengan `TRUNCATE` di `siapkan`.
    {: .bb-beda }

=== "Express"

    *Tidak dijalankan. Dicek ke [supertest](https://github.com/ladjs/supertest).*

    ```js
    beforeEach(() => db.query("TRUNCATE transfer, akun; INSERT INTO akun ..."));

    test("transfer", async () => {
      await request(app).post("/transfers").set("Authorization", `Bearer ${token}`)
        .send({ ke: "ani", jumlah: 70000 })
        .expect(201).expect("Location", /\/transfers\/\d+/);
      const { rows } = await db.query("SELECT saldo FROM akun WHERE id = 'budi'");
      expect(rows[0].saldo).toBe("30000");   // pg mengembalikan bigint sebagai string
    });
    ```

    **Yang berbeda di stack ini:** `supertest` adalah library terpisah. Driver `pg` mengembalikan `bigint` sebagai string. Ini dicek langsung di lab dengan `pg` 8.23.1: `SELECT 30000::bigint` menghasilkan `"30000"`.
    {: .bb-beda }

=== "Laravel"

    *Tidak dijalankan. Dicek ke [Laravel: HTTP tests](https://laravel.com/docs/12.x/http-tests) dan [database testing](https://laravel.com/docs/12.x/database-testing).*

    ```php
    use RefreshDatabase;

    public function test_transfer(): void {
        $this->actingAs($this->budi)
             ->postJson('/transfers', ['ke' => 'ani', 'jumlah' => 70000])
             ->assertCreated()->assertHeader('Location');
        $this->assertDatabaseHas('akun', ['id' => 'budi', 'saldo' => 30000]);
    }
    ```

    **Yang berbeda di stack ini:** trait `RefreshDatabase` menjalankan migration dan membungkus tiap test dalam transaction yang di-rollback.
    {: .bb-beda }

=== "Django"

    *Tidak dijalankan. Dicek ke [Django: Testing tools](https://docs.djangoproject.com/en/stable/topics/testing/tools/).*

    ```python
    class TransferTest(TestCase):
        def setUp(self):
            self.budi = Akun.objects.create(id="budi", saldo=100000)
            Akun.objects.create(id="ani", saldo=250000)

        def test_transfer(self):
            res = self.client.post("/transfers", {"ke": "ani", "jumlah": 70000},
                                   content_type="application/json", headers={"Authorization": f"Bearer {TOKEN}"})
            self.assertEqual(res.status_code, 201)
            self.assertIn("Location", res.headers)
            self.budi.refresh_from_db()
            self.assertEqual(self.budi.saldo, 30000)
    ```

    **Yang berbeda di stack ini:** `TestCase` membungkus tiap test dalam transaction. Akibatnya, test race dengan dua koneksi butuh `TransactionTestCase`.
    {: .bb-beda }

=== "Spring"

    *Tidak dijalankan. Dicek ke [Spring: MockMvc](https://docs.spring.io/spring-framework/reference/testing/mockmvc.html) dan [@Sql](https://docs.spring.io/spring-framework/reference/testing/testcontext-framework/executing-sql.html).*

    ```java
    @Test @Sql("/data-awal.sql")
    void transfer() throws Exception {
        mockMvc.perform(post("/transfers").header("Authorization", "Bearer " + token)
                .contentType(APPLICATION_JSON).content("{\"ke\":\"ani\",\"jumlah\":70000}"))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"));
        assertEquals(30000L, jdbc.queryForObject("SELECT saldo FROM akun WHERE id = 'budi'", Long.class));
    }
    ```

    **Yang berbeda di stack ini:** `MockMvc` memanggil controller tanpa server HTTP. Database sungguhan biasanya disediakan Testcontainers.
    {: .bb-beda }

## Trade-off: kapan pakai apa

| Pilihan | Kelebihan | Kekurangan |
|---|---|---|
| Banyak unit test dengan mock database | Sangat cepat | Bisa lolos semua padahal query-nya salah |
| Integration test dengan database sungguhan | Menguji perilaku nyata: constraint, lock, SQL | Lebih lambat, butuh Docker di CI |
| Banyak test end-to-end | Paling mirip pengalaman user | Lambat, rapuh, sulit mencari penyebab gagal |

Rekeningo: unit test untuk semua aturan, integration test untuk setiap endpoint dan setiap bug yang pernah lolos, dan dua test end-to-end (login, transfer).

## Cek diri

**1.** AI menulis test transfer dengan mock repository yang selalu mengembalikan "sukses". Test lolos. Apa yang belum terbukti?

??? success "Jawaban"

    Semua yang dikerjakan database: SQL-nya benar, constraint berlaku, transaction rollback saat gagal, dan lock mencegah race. Mock hanya membuktikan logika bisnis memanggil method yang benar.

**2.** Jelaskan kenapa regression test race di rekaman memeriksa **total** saldo, bukan saldo Budi saja.

??? success "Jawaban"

    Urutan dua request paralel tidak bisa ditebak, jadi saldo akhir Budi bisa Rp30.000 atau Rp50.000, dan keduanya sah. Yang selalu benar adalah invarian: total uang Budi + Ani tetap Rp350.000. Di mode naif, total juga bergantung urutan: rekaman ini Rp400.000 (Rp50.000 tercipta), dan run lain bisa Rp420.000 (Rp70.000 tercipta).

**3.** `go test -race ./...` lolos tanpa peringatan. Apakah endpoint transfer aman dari race condition?

??? success "Jawaban"

    Belum tentu. Race detector hanya melihat akses memori di dalam proses Go. Race di [[B3.2]] terjadi di antara dua transaction di PostgreSQL, di luar pengamatannya. Yang membuktikan adalah test dengan request paralel ke database sungguhan.

## Saat me-review kode AI, cek ini

- [ ] Aturan bisnis punya unit test, termasuk kasus batas (0, negatif, tepat di batas).
- [ ] Ada integration test dengan database sungguhan, bukan hanya mock.
- [ ] Setiap endpoint ber-ID punya test "user A meminta data user B" ([[B5.3]]).
- [ ] Test memeriksa invarian, mis. total saldo, bukan hanya status `200`.
- [ ] Bug yang diperbaiki di pull request ini disertai test yang gagal tanpa perbaikannya.

## Bacaan lanjut

- [Martin Fowler: The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Go: testing](https://pkg.go.dev/testing) · [Go: Data Race Detector](https://go.dev/doc/articles/race_detector)
- [Testcontainers](https://testcontainers.com/)

<div data-bb="umpan-balik"></div>
