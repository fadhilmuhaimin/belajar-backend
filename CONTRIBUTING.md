# Kontribusi

Terima kasih sudah mau membantu. Koreksi kecil (salah ketik, tautan mati, klaim yang keliru) paling berguna. Untuk halaman atau lab baru, buka issue dulu supaya kita sepakat di mana tempatnya di cerita.

Repo ini adalah tempat kerja utama panduan. Semua perubahan, termasuk dari pemelihara, dibuat langsung di sini lewat branch dan pull request.

## Sebelum mengirim perubahan

1. Pasang pre-commit hook (hook tidak ikut ter-clone):

   ```bash
   cp tools/hooks/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
   ```

   Hook menolak commit kalau ada file `.env*` atau kalau gitleaks menemukan kemungkinan secret. Hook butuh `gitleaks` terpasang.

2. Jalankan pemeriksaan lengkap:

   ```bash
   bash tools/cek_situs.sh --layar
   ```

3. Kalau kamu mengubah lab, rekam ulang di database lab yang bersih, lalu commit output-nya bersama perubahan kode. Angka di halaman harus sama dengan file di `labs/*/output/`.

   ```bash
   make -C labs/b3-race down && make -C labs/b3-race up
   ```

   Setelah itu jalankan lab yang kamu ubah (lihat README, bagian "Kontainer lab dan reset"). Rekaman dari database yang sudah dipakai lab lain tidak diterima: lab yang rusak bisa tetap terlihat lolos. Kalau output baru hanya berbeda di angka waktu, token, atau id acak, jangan ikut commit file itu kecuali halamannya juga kamu perbarui.

## Aturan konten

- **Sapaan "kamu".** Kalimat pendek: satu ide per kalimat, paling banyak sekitar 25 kata.
- **Istilah teknis tetap bahasa Inggris** (transaction, lock, queue, retry, idempotency key). Jangan diterjemahkan, dan jangan diganti metafora. `tools/audit_bahasa.py --check` harus lolos (0 error).
- **Tanpa nama merek di cerita.** Payment gateway, bank, dan layanan lain di cerita Rekeningo tidak diberi nama. Nama produk hanya boleh sebagai sumber rujukan atau stack yang dibandingkan.
- **Label kejujuran.** Output dari lab ditandai **Rekaman lab** dan menyebut file-nya. Selain itu pakai **Ilustrasi**, **tidak dijalankan**, **asumsi**, atau **[perlu verifikasi]**. Klaim tentang perilaku library atau standar ditautkan ke sumber primer.
- **Pihak ketiga di lab selalu tiruan** dengan nama netral. Jangan menambah lab yang butuh akun vendor atau menghubungi layanan luar.
- **Data karangan saja.** Jangan memasukkan data, kode, atau nama dari sistem nyata milik siapa pun.
- **Jangan menyalin dari repo atau dokumen lain tanpa memeriksa nama nyata.** Ini berlaku untuk teks, kode, output, dan catatan dari project kerja, catatan pribadi, atau repo lain milikmu sendiri. Sebelum commit, periksa nama orang, instansi, perusahaan, sistem, domain, path, nama tabel, dan nama fungsi. `tools/audit_bahasa.py` hanya menangkap merek umum. Nama lain tetap tanggung jawabmu saat review.

## Menambah halaman

1. Daftarkan halaman di `situs/data/cerita.json` (`id`, `judul`, `tahap`, `path`, `prasyarat`, `masalah`). Urutan di registry adalah urutan baca.
2. Tulis file-nya sebagai MDX di `situs/src/content/docs/<path>.mdx`. Rujuk halaman lain dengan `[[ID]]` atau `[[ID|teks]]`, bukan link biasa. Pembaca hanya melihat nomor tampilan seperti 2.1, tidak pernah ID internal.
3. Jalankan `python3 tools/sinkron_cerita.py`. Skrip ini menulis nomor di judul, baris prasyarat, indeks per topik, dan kartu ulang. Sidebar dibuat langsung dari registry saat build.
4. Catat keputusan desain yang tidak jelas dari kodenya di `plan/KEPUTUSAN.md`: apa, kenapa, dan alternatif yang ditolak. Nomornya melanjutkan baris terakhir di tabel. Nomor lama tidak pernah dipakai ulang atau digeser.

## Lisensi kontribusi

Dengan mengirim perubahan, kamu setuju teks dan gambar kontribusimu dilisensikan CC BY-SA 4.0 dan kodenya MIT, sama dengan isi repo ini (lihat `LICENSE`).
