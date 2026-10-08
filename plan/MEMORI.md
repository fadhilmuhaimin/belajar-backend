# Memori kerja

Catatan kerja lintas sesi dan lintas model. Maksimal 200 baris; baris yang tidak relevan lagi dihapus.

## Keputusan baru

## Sedang dikerjakan

2026-10-08 · Fase 0 · Tugas pertama (CLAUDE.md). Selesai: (1) `cek_batch.sh` lolos lokal; (2) `.github/workflows/cek.yml` hijau di branch `percobaan/ci-fase-0` (run 37737472090, kedua job); (3) `make lab`, `tools/cek_lab_env.sh`, `.devcontainer/`, `make -C labs/b3-race run` terbukti dari nol. Setengah jalan: (4) rencana fase 1 untuk 1.11 di `plan/RENCANA-FASE-1-1-11.md` menunggu persetujuan pemilik; belum ada file di `site-baru/`. Belum dibuat: PR dari `percobaan/ci-fase-0` ke `main` (pemilik yang memutuskan merge). Untuk melanjutkan: baca `plan/RENCANA-FASE-1-1-11.md`, kalau disetujui mulai langkah 1 tabel "Urutan kerja" dan catat ADR dependency di KEPUTUSAN 102+.

## Pelajaran

- `tools/cek_batch.sh` lokal (2026-10-08, sebelum perubahan apa pun): lolos; 60/60 halaman, 103 tes widget, layar pertama 0 gagal; 52 peringatan audit bahasa (bukan error) dan 19 peringatan "Inti > 175 karakter" adalah keadaan normal, bukan regresi. Lama ±3 menit.
- `make -C labs/b3-race run` dari nol (venv dihapus, container `down -v`): `make lab` 13 detik, `run` 3 detik. Satu-satunya diff adalah baris tanggal `direkam`/`recorded`; dikembalikan sesuai keputusan 82.
- Workflow `on: pull_request` + `push: [main]` tidak jalan saat branch percobaan didorong; branch `percobaan/**` ditambahkan ke pemicu push supaya pembuktian CI tidak butuh PR.
- `act` tidak terpasang di mesin ini; pembuktian CI memakai branch percobaan di GitHub.
- Foreground `sleep` diblokir di lingkungan Claude Code; pakai `gh run watch` di background.
- Di runner `ubuntu-latest` (24.04) Chrome headless mati dengan `ENOENT DevToolsActivePort`: penyebabnya AppArmor membatasi user namespace. Perbaikan lingkungan: `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0` sebelum `cek_batch.sh`; kode `tools/lib/chrome.mjs` tidak diubah.
