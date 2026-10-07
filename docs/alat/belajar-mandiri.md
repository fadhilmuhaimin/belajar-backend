---
title: Belajar mandiri
---

# Belajar mandiri

Baca 6 menit · di luar cerita · keterampilan, bukan konsep sistem
{: .meta }

Panduan ini tidak akan pernah lengkap. Halaman ini membahas cara mencari jawaban sendiri: membaca dokumentasi resmi, membaca RFC, dan menilai sumber.

## Urutan mencari jawaban

| Urutan | Sumber | Pakai untuk | Hati-hati |
|---|---|---|---|
| 1 | Dokumentasi resmi versi yang kamu pakai | Perilaku API, nilai bawaan, batasan | Cek nomor versi di URL. `stable` dan `current` bisa berubah |
| 2 | Spesifikasi (RFC, standar SQL, OpenAPI) | Arti status code, header, format | Bahasanya formal. Baca bagian definisi dulu |
| 3 | Kode sumber dan changelog library | Perilaku yang tidak tertulis di dokumentasi | Perilaku internal bisa berubah tanpa pemberitahuan |
| 4 | Artikel praktisi, blog engineering | Pengalaman, trade-off di sistem nyata | Satu pengalaman bukan bukti umum |
| 5 | Jawaban AI dan forum | Titik awal, kata kunci | Selalu cek ke sumber 1–3 sebelum dipakai |

Contoh di panduan ini: ukuran pool bawaan node-postgres dan HikariCP diambil dari dokumentasi resminya, bukan dari artikel blog (lihat [[B2.5]]).

## Membaca dokumentasi resmi dengan cepat

1. **Cari halaman konsep, bukan tutorial.** Tutorial menunjukkan jalur bahagia. Halaman konsep atau referensi menjelaskan perilaku saat gagal.
2. **Cari kata "default", "must", "should", "note", "warning".** Nilai bawaan dan peringatan biasanya ada di sana.
3. **Catat versi.** Tulis versi di catatan atau di komentar kode, mis. "Django 6.1, `CONN_MAX_AGE` bawaan 0".
4. **Coba di lab kecil.** Kalau perilakunya penting, jalankan sekali. Panduan ini melakukannya di `labs/`.

## Membaca RFC

RFC adalah dokumen spesifikasi internet, mis. [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) untuk HTTP. Tiga hal yang mempercepat:

- **Kata kunci punya arti tetap.** MUST, SHOULD, dan MAY didefinisikan di [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119.html) dan [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174.html). SHOULD berarti boleh menyimpang, asal paham akibatnya.
- **Cek status dokumen.** "Internet-Draft" belum standar dan bisa berubah. Contohnya header `Idempotency-Key`: draft-nya kini kedaluwarsa, jadi belum pernah jadi standar.
- **Cek apakah sudah digantikan.** Halaman RFC menulis "Obsoletes" dan "Obsoleted by". RFC 9110 menggantikan RFC 7231.

Kapan perlu membaca RFC? Saat dua sumber sekunder saling bertentangan, saat menulis library atau proxy, atau saat review kode yang memakai status code dan header secara tidak biasa.

## Menilai sumber

Panduan ini memakai empat tingkat bukti untuk klaim tentang cara belajar:

| Tingkat | Artinya |
|---|---|
| Meta-analisis | Gabungan banyak studi. Paling kuat |
| Eksperimen terkontrol | Satu studi dengan kelompok pembanding |
| Studi kecil atau observasi | Petunjuk, belum kesimpulan |
| Opini | Pengalaman praktisi. Berguna, tapi bukan bukti |

Untuk klaim teknis, ujinya lebih sederhana: **bisakah kamu menunjukkan baris dokumentasi atau output program yang membuktikannya?** Kalau tidak, tulis [perlu verifikasi].

## Saat memakai AI untuk belajar

- Minta AI menyebut sumbernya, lalu buka sumber itu. AI bisa menyebut halaman dokumentasi yang tidak ada.
- Minta AI menjelaskan **kenapa**, lalu bandingkan dengan dokumentasi. Ini juga latihan self-explanation.
- Jangan menyalin angka (ukuran pool, timeout, batas) tanpa mengecek versi dokumentasinya.

## Bacaan lanjut

- [RFC Editor: cara membaca RFC](https://www.rfc-editor.org/faq/)
- [Dunlosky dkk. 2013: strategi belajar mana yang efektif](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html)

<div data-bb="umpan-balik"></div>
