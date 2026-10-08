# Kerangka halaman per jenis

Salin kerangka yang sesuai ke `src/content/docs/<path>.mdx`, daftarkan halamannya di `data/cerita.json`
(`jenis`, `bagian`, `peran`), lalu jalankan `python3 tools/sinkron_cerita.py` dari root repo.
Urutan blok diperiksa `src/lib/templat.test.ts` terhadap `data/templat.json` (keputusan 118).
Teks di kerangka adalah petunjuk penulisan, bukan isi; semuanya diganti.
