---
title: "4.6 Template ADR"
---

<div data-bb="kamu-di-sini" data-tahap="4"></div>

# 4.6 Template ADR

Baca 6 menit · template bisa disalin · Prasyarat: [[D1]]
{: .meta }

<div data-bb="selesai"></div>

??? question "Sudah tahu? Cek 3 pertanyaan"

    1. Keputusan seperti apa yang layak ditulis sebagai ADR?
    2. Keputusan lama ternyata salah. ADR-nya dihapus atau diubah?
    3. Bagian mana yang paling sering hilang dari ADR buatan AI?

    Yakin dengan ketiganya? Lompat ke [[berikutnya]].

## Inti

ADR mencatat satu keputusan: konteks, pilihan, alasan, dan akibatnya. Tulis untuk orang yang datang setahun lagi.

<div data-bb="arsitektur" data-tahap="4"></div>

## Lihat sendiri

Tidak semua keputusan butuh ADR. Pilah dulu, lalu cek.

<div data-bb="pilah" data-src="data/d5-pilah.json"></div>

## Kenapa ini ada

Developer baru di tim pembayaran bertanya: kenapa notifikasi memakai tabel outbox, padahal Redis sudah ada? Tidak ada yang ingat. Raka mencari di chat lama dan menemukan diskusinya terpotong di tengah.

Dua minggu kemudian, tim hampir memindahkan notifikasi ke Redis. Alasan awalnya, atomik dengan transaction pembayaran, baru teringat saat review. Setelah itu tim sepakat: keputusan yang sulit dibatalkan ditulis sebagai ADR.

## Cara kerjanya

**ADR (Architecture Decision Record)** adalah dokumen pendek untuk satu keputusan. Formatnya diperkenalkan Michael Nygard: judul, konteks, keputusan, status, dan konsekuensi, satu atau dua halaman saja ([Nygard, 2011](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions)).

Aturan yang membuatnya berguna:

1. **Disimpan di repo**, mis. `docs/adr/0007-pembayaran-jadi-service.md`, dan di-review seperti kode.
2. **Bernomor urut, tidak pernah dipakai ulang.** Keputusan yang dibatalkan tidak dihapus. Statusnya diubah jadi digantikan (superseded), dengan rujukan ke ADR penggantinya.
3. **Satu keputusan per ADR.** Kalau judulnya butuh kata "dan", pecah jadi dua.
4. **Alternatif ditulis.** Yang membuat ADR berharga adalah alasan menolak pilihan lain, bukan pilihan yang menang.

**Template.** Salin, isi, simpan di repo. Bagian "Alternatif yang ditolak" diambil dari format MADR ([MADR](https://adr.github.io/madr/)).

```markdown title="docs/adr/NNNN-judul-singkat.md"
# NNNN. <Keputusan sebagai frasa pendek>

- Status: diusulkan | diterima | digantikan oleh NNNN
- Tanggal: YYYY-MM-DD
- Pengambil keputusan: <nama atau tim>

## Konteks
Masalah apa yang memaksa keputusan ini? Sertakan angka (beban, biaya, insiden)
dan batasan (tim, waktu, aturan). Tulis fakta, bukan pilihan.

## Keputusan
Kami akan <...>. Kalimat aktif, cukup spesifik sehingga bisa dicek di kode.

## Alternatif yang ditolak
- <Pilihan A>: kenapa ditolak.
- <Pilihan B>: kenapa ditolak.

## Konsekuensi
- Yang jadi lebih mudah:
- Yang jadi lebih sulit atau lebih mahal:
- Yang harus dipantau (metric, tanda bahwa keputusan ini perlu ditinjau ulang):
```

**Contoh terisi** dari Tahap 4 Rekeningo:

??? example "0007. Pembayaran dipecah jadi service sendiri"

    - Status: diterima
    - Tanggal: 2026-03-02
    - Pengambil keputusan: Raka (tech lead), tim pembayaran

    **Konteks.** Tim kini delapan orang dalam dua tim. Modul pembayaran memegang credential payment gateway dan butuh audit ketat. Tim pembayaran ingin rilis lebih jarang dan lebih hati-hati daripada tim toko. Dua kali dalam sebulan, deploy fitur toko tertunda karena menunggu review perubahan pembayaran.

    **Keputusan.** Kami akan memindahkan modul pembayaran ke service sendiri, dengan database sendiri. Monolith memanggilnya lewat API internal, dan menerima hasilnya lewat outbox.

    **Alternatif yang ditolak.**

    - Tetap modul di monolith: batasnya sudah tegas ([[B7.2]]), tapi credential dan ritme rilis tetap bercampur.
    - Memecah semua modul: katalog dan pesanan belum punya alasan yang berbeda; hanya menambah panggilan jaringan.

    **Konsekuensi.**

    - Lebih mudah: deploy pembayaran terpisah, akses credential hanya untuk satu tim.
    - Lebih sulit: transaction lintas pembayaran dan pesanan tidak ada lagi; diganti outbox dan status pending ([[B10.2]]). Ada satu service lagi untuk dipantau ([[C2]]).
    - Dipantau: jumlah pembayaran berstatus pending lebih dari 5 menit. Kalau sering terjadi, tinjau ulang keputusan ini.

## Di stack lain

ADR tidak bergantung pada stack. Yang berbeda: format dan alat bantunya.

| Format atau alat | Ciri | Sumber |
|---|---|---|
| Nygard | Lima bagian, paling ringkas | [Nygard, 2011](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions) |
| MADR | Menambah "Considered Options" dan kelebihan atau kekurangan tiap opsi | [MADR](https://adr.github.io/madr/) |
| adr-tools | Skrip shell: `adr new <judul>` membuat file bernomor | [adr-tools](https://github.com/npryce/adr-tools) |

## Trade-off: kapan pakai apa

| Pilihan | Kelebihan | Kekurangan |
|---|---|---|
| Tanpa catatan keputusan | Tidak ada pekerjaan tambahan | Alasan hilang saat orangnya pindah; keputusan diulang atau dibatalkan tanpa sadar |
| Catatan di chat atau tiket | Terjadi alami saat diskusi | Sulit dicari, terpotong, tidak ikut repo |
| ADR di repo | Ikut di-review, dicari dengan grep, punya riwayat | Butuh disiplin; ADR yang terlalu panjang tidak dibaca |
| Dokumen desain panjang | Cocok untuk perubahan besar yang belum diputuskan | Berat untuk keputusan tunggal; sering tidak diperbarui setelah implementasi |

## Cek diri

**1.** Rekeningo memutuskan saldo kurang dijawab `422`. Tulis bagian "Alternatif yang ditolak" dalam dua butir.

??? success "Jawaban"

    Contoh: "`400`: ditolak, supaya `400` tetap berarti format salah dan app bisa membedakannya dari saldo kurang." "`409`: sah juga, tapi ditolak supaya `409` disimpan untuk bentrok versi data." Alasan lengkapnya ada di [[A2]].

**2.** Jelaskan kenapa ADR lama yang dibatalkan tidak dihapus.

??? success "Jawaban"

    Riwayatnya tetap berguna: orang bisa melihat keputusan apa yang pernah berlaku, kapan, dan kenapa diganti. Kode lama yang masih mengikuti keputusan lama juga jadi bisa dijelaskan. Statusnya diubah jadi digantikan, dengan rujukan ke ADR baru.

**3.** AI membuat draft ADR dari rangkuman rapat. Bagian apa yang paling perlu kamu periksa?

??? success "Jawaban"

    Alternatif dan konsekuensi negatif. AI cenderung menulis keputusan yang terdengar meyakinkan, tapi melewatkan pilihan yang ditolak atau biaya yang muncul. Periksa juga angka di konteks: harus berasal dari data atau asumsi yang ditulis terbuka, bukan karangan.

## Saat me-review ADR buatan AI, cek ini

- [ ] Satu ADR, satu keputusan.
- [ ] Konteks berisi fakta dan angka yang bisa dicek, bukan kesimpulan.
- [ ] Minimal dua alternatif, masing-masing dengan alasan ditolak.
- [ ] Konsekuensi negatif ditulis, termasuk tanda kapan keputusan perlu ditinjau ulang.
- [ ] Status dan rujukan ke ADR yang digantikan, kalau ada.

## Bacaan lanjut

- [Michael Nygard: Documenting Architecture Decisions](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [MADR: Markdown Architectural Decision Records](https://adr.github.io/madr/)
- [adr.github.io](https://adr.github.io/)

<div data-bb="umpan-balik"></div>
