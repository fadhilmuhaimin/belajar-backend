# Protokol iterasi otomatis

Dibaca di awal SETIAP iterasi `tools/jalankan-otomatis.sh` (keputusan 216). Kamu satu-satunya pekerja di repo ini: tidak ada sesi lain, tidak ada worktree. Pemilik sedang tidak ada; tidak ada yang menjawab pertanyaan, dan izin di luar allowlist `.claude/settings.json` langsung ditolak (mode `dontAsk`). Kalau sebuah perintah ditolak, ganti caranya; jangan ulangi perintah yang sama. Jalankan perintah dari root repo; `cd <folder> && git ...` ditolak (pakai `git -C`). `sleep` di depan diblokir: tunggu dengan `gh pr checks --watch`, `gh run watch`, atau perintah yang memang berjalan lama. macOS ini tidak punya `timeout`.

Pola perintah yang ditolak di uji kering 2026-10-10 (log `log/otomatis-2026-10-10/`), dan penggantinya:

| Ditolak | Pakai |
|---|---|
| Path absolut ke skrip repo: `bash /Users/.../tools/cek_situs.sh` | Path relatif dari root: `bash tools/cek_situs.sh` |
| Heredoc: `python3 - <<'EOF' ... EOF` | Tulis skrip ke `tmp/<nama>.py` dengan Write, lalu `python3 tmp/<nama>.py` |
| Loop shell: `for f in ...; do ...; done` | Skrip Python di `tmp/`, atau satu perintah per file |
| `$?` dan `echo ... >> berkas`: `...; echo "exit $?" >> tmp/cek.txt` | `... && echo LOLOS \|\| echo GAGAL` |

Urutan sumber kebenaran tetap seperti CLAUDE.md: CERITA > PROPOSAL > KEPUTUSAN > MEMORI > STATUS. Protokol ini mengatur cara kerja loop, bukan isi.

## a. Ambil satu tugas

1. `git checkout main && git pull --ff-only`. Working tree harus bersih.
2. `python3 tools/antrean.py berikut` memberi tugasnya. Kerjakan HANYA tugas itu di iterasi ini.
3. Kalau stderr menulis `PERLU DIPARKIR <id>`, parkir tugas itu di ANTREAN (status diparkir, catatan "bergantung pada <id> yang diparkir") di PR tugas iterasi ini.
4. Kalau `berikut` tidak memberi apa-apa, antrean habis: tulis "Iterasi selesai: - antrean-habis" dan berhenti.
5. Cek sisa iterasi yang terhenti: `git branch -a | grep -i <slug-atau-id>`. Kalau ada branch untuk tugas ini, lanjutkan dari branch itu (rebase ke main), jangan mulai dari nol.

## b. Prasyarat: main hijau

- `gh run list --branch main --workflow cek --limit 1 --json status,conclusion,headSha`. Kalau masih berjalan, tunggu dengan `gh run watch <id> --exit-status` (timeout Bash 600000; ulangi bila belum selesai).
- Kalau kesimpulannya bukan `success`, tugas iterasi ini diganti: sisipkan tugas `M<n> · Perbaiki main` (jenis perbaikan, status dikerjakan) paling atas di bagian Tugas, cari penyebabnya dari `gh run view <id> --log-failed | tail -80`, perbaiki lewat PR. Tugas yang tadi terpilih tetap antre.

## c. Rencana dan branch

1. Branch baru dari main: konten `tahap-1/<slug>`, interaksi `interaksi/<id>`, perbaikan `perbaikan/<id>`, crosscheck `crosscheck/<id>` (huruf kecil, titik jadi strip).
2. Tulis rencana 5 baris di `plan/MEMORI.md` bagian "Sedang dikerjakan" (tanggal, id tugas, langkah, file yang disentuh). Ganti paragraf iterasi sebelumnya; MEMORI paling banyak 200 baris.
3. Di ANTREAN: status tugas `dikerjakan`.
4. Pakai ketiga skill: gaya-bahasa (teks), visualisasi (visual, widget, interaksi, layout), analisis-kritis (klaim, versi, ADR, review kode). Sebut di PR skill mana yang dipakai.
5. Kerjakan sesuai "selesai bila" tugas, "Definisi selesai bersama" di ANTREAN, dan CLAUDE.md. Kalau halaman butuh rekaman lab yang belum ada, sisipkan tugas `<nomor>-lab` tepat sebelum tugas halaman, kerjakan lab itu sebagai tugas iterasi ini, dan biarkan halamannya antre.

## d. Verifikasi dengan sinyal luar

"Kelihatannya benar" bukan verifikasi. Yang dihitung (setelah I1 selesai, perintah npm diganti padanannya di README dan `tools/cek_situs.sh`):

- Gerbang penuh: `bash tools/cek_situs.sh --layar > tmp/cek.txt 2>&1 && echo LOLOS || echo GAGAL`, lalu `tail -30 tmp/cek.txt` sebagai perintah terpisah. Sebelumnya hentikan preview yang tertinggal: `npx --prefix situs astro preview stop`.
- Tangkapan: `npm --prefix situs run preview -- --port 4321 --host 127.0.0.1` di latar, lalu dari `situs/` `node tools/tangkap.mjs --url http://127.0.0.1:4321 --path /<path>/`. Buka PNG-nya dengan Read dan lihat sendiri.
- Rekaman lab dari database bersih dibandingkan dengan yang di-commit (status, saldo, urutan; bukan waktu).
- Sumber primer untuk setiap versi, API, dan klaim (WebSearch/WebFetch). Yang tidak bisa dicek diberi [perlu verifikasi] dan dicatat di MEMORI "Perlu dicek pemilik".

## e. Perbaikan diri: paling banyak 3 percobaan

Kalau gerbang atau CI gagal: baca keluarannya, tulis penyebabnya dalam satu kalimat di catatan tugas ANTREAN, perbaiki, ulangi. Naikkan `percobaan`. Setiap percobaan harus mengubah pendekatan, bukan mengulang hal yang sama dengan harapan hasil berbeda.

## f. Gagal tiga kali: parkir

1. Hapus branch tugas (lokal dan remote), `git checkout main`.
2. Branch `antrean/parkir-<id>`: status tugas `diparkir`, catatan berisi penyebab, apa yang sudah dicoba di tiap percobaan, dan apa yang dibutuhkan dari pemilik. Tugas yang bergantung padanya ikut diparkir. Tambahkan juga ke MEMORI "Perlu dicek pemilik".
3. PR kecil, tunggu CI, merge. Lanjut ke penutup iterasi (h). Jangan mulai tugas berikutnya di iterasi yang sama.

## g. Lolos: commit, PR, merge

1. Satu perubahan per commit; lebih dari 300 baris non-generated dipecah. Pesan bahasa Indonesia, kata kerja di depan, sebut nomor keputusan. Tanpa trailer Co-Authored-By, tanpa nama alat AI (CI menolak kata itu), tanpa emoji.
2. Commit penutup di branch yang sama: ANTREAN (status selesai, catatan singkat), MEMORI, STATUS, KEPUTUSAN.
3. `git push -u origin <branch>`, `gh pr create` dengan isi: apa yang berubah, apa yang dicek (dengan potongan output), jawaban tiga pertanyaan navigasi, skill yang dipakai, apa yang belum. Untuk halaman, akhiri dengan "Siap dilanjutkan dari <nomor>".
4. Tunggu CI: `gh pr checks <n> --watch --interval 30` dengan timeout Bash 600000; ulangi kalau belum selesai. Merah = kembali ke (e).
5. Hijau: `gh pr merge <n> --merge --delete-branch`, `git checkout main && git pull --ff-only`, lalu gerbang penuh lagi di main.
6. Kalau gerbang di main merah: branch `revert/<id>`, `git revert -m 1 <sha merge>`, PR, CI, merge; parkir tugasnya seperti (f) dengan penyebabnya. Jangan pernah push langsung atau force-push ke main.

## h. Tutup iterasi

1. ANTREAN, MEMORI "Sedang dikerjakan" (keadaan terakhir dan perintah untuk melanjutkan), dan STATUS sudah ikut PR tugas atau PR parkir. Kalau ada yang tertinggal, PR kecil `antrean/<id>-tutup`.
2. Akhiri di main, working tree bersih, tanpa PR terbuka (`gh pr list --state open` kosong).
3. Baris terakhir jawabanmu persis: `Iterasi selesai: <id> <status>` (status: selesai, diparkir, atau dikerjakan bila iterasi terhenti di tengah).

## i. Retrospektif tiap 5 tugas selesai

Kalau jumlah tugas selesai di ANTREAN (`python3 tools/antrean.py ringkas`) jadi kelipatan 5 karena tugas ini: tulis retrospektif singkat di MEMORI "Pelajaran" (pola kegagalan, apa yang berhasil; paling banyak 5 baris). Usulan perubahan skill, CLAUDE.md, atau protokol ini ditulis di `plan/USULAN-PERBAIKAN.md`, TIDAK diterapkan sendiri.

## j. Yang tidak pernah dilakukan sendiri

- Mengubah `plan/CERITA-*.md`, `plan/PROPOSAL.md`, `CLAUDE.md`, skill di `.claude/`, atau protokol ini. Usulan cerita masuk MEMORI "Usulan perubahan cerita"; usulan lain masuk `plan/USULAN-PERBAIKAN.md`.
- Menghapus lab atau halaman yang sudah ada, kecuali tugas ANTREAN menyebut persetujuan pemilik atau rencana registry untuknya (P2, 1.39).
- Force-push, push langsung ke main, merge PR yang CI-nya merah.
- Menyentuh secret (Cloudflare, token), `.env`, atau `gh secret`.
- Menjalankan lab serangan ke target di luar container atau folder sementara lab.

Semua itu menjadi catatan di MEMORI "Perlu dicek pemilik".

## Laporan pagi

Dijalankan sekali saat loop berhenti, apa pun alasannya; prompt dari skrip menyebut alasan berhenti dan folder log. Tidak mengerjakan tugas antrean. Tulis `plan/LAPORAN-PAGI.md` (timpa yang lama):

1. Alasan berhenti dan jam.
2. Tugas selesai malam ini, masing-masing dengan nomor PR (`gh pr list --state merged --search "merged:>=<tanggal mulai>"`).
3. Tugas diparkir: alasan dan apa yang dibutuhkan dari pemilik.
4. Status main: CI terakhir dan hasil gerbang penuh di main.
5. Lima tangkapan layar terpenting untuk dilihat pemilik: salin ke `tmp/laporan-pagi/` dan tulis path lengkap serta alasannya.
6. Isi MEMORI "Perlu dicek pemilik".
7. Usulan baru di `plan/USULAN-PERBAIKAN.md` sejak laporan sebelumnya.

Commit lewat PR `laporan/pagi-<tanggal>`, merge bila CI hijau, akhiri di main bersih. Baris terakhir: `Iterasi selesai: laporan-pagi selesai`.
