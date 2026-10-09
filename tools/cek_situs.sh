#!/usr/bin/env bash
# Gerbang kualitas situs Astro (CLAUDE.md "gerbang_kualitas"), sama di laptop dan CI (keputusan 111).
# Syarat minimum, bukan bukti kualitas.
#
#   bash tools/cek_situs.sh           # semua pemeriksaan tanpa browser
#   bash tools/cek_situs.sh --layar   # + layar pertama 4 ukuran dan tangkapan 2 ukuran x 2 mode (Playwright)
#
# Python yang dipakai hanya pustaka standar, jadi tidak butuh .venv.
set -euo pipefail
cd "$(dirname "$0")/.."
PY=${PYTHON:-python3}

echo "== sinkron registry (prasyarat, nomor, [[ID]], angka asumsi, kartu, indeks)"
$PY tools/sinkron_cerita.py --check | grep -v "^PERINGATAN" || true
$PY tools/sinkron_cerita.py --check >/dev/null

echo "== antrean loop otomatis"; $PY tools/antrean.py --check
echo "== istilah";              $PY tools/build_istilah.py --check
echo "== audit bahasa";         $PY tools/audit_bahasa.py --check | tail -1
$PY tools/audit_bahasa.py --check >/dev/null

echo "== build strict"
LOG=$(mktemp)
if bun run --cwd situs build >"$LOG" 2>&1; then OK=1; else OK=0; fi
if grep -E "\[WARN\]|\[ERROR\]" "$LOG"; then OK=0; fi
# Urutan argumen bun yang salah (`bun --cwd x run build`) mencetak bantuan dengan exit 0 (keputusan 225).
grep -q "Complete!" "$LOG" || OK=0
rm -f "$LOG"
if [ "$OK" != 1 ]; then echo "GAGAL: build strict"; exit 1; fi
echo "build strict lolos (0 warning)"

echo "== ID internal tidak tampil"; $PY tools/cek_id_tampil.py
echo "== kontras dua mode";          $PY tools/contrast.py | tail -1
echo "== tipe (astro check, strict)"
LOG=$(mktemp)
if ! bun run --cwd situs cek-tipe >"$LOG" 2>&1; then sed 's/\x1b\[[0-9;]*m//g' "$LOG" | grep -B1 -A4 " - error" || true; rm -f "$LOG"; echo "GAGAL: tipe"; exit 1; fi
sed 's/\x1b\[[0-9;]*m//g' "$LOG" | grep -E "^- [0-9]+ errors"; rm -f "$LOG"
echo "== tes situs (node:test + Vitest)"
bun run --cwd situs test 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "^# (pass|fail)|Tests +[0-9]"
echo "== tes widget lama";           node --test tests/widgets/*.cjs 2>&1 | grep -E "^# (pass|fail)"
node --test tests/widgets/*.cjs >/dev/null 2>&1

if [ "${1:-}" = "--layar" ]; then
  echo "== layar pertama 4 ukuran + tangkapan"
  PORT="${PORT_PREVIEW:-4321}"   # worktree paralel memakai port lain, mis. PORT_PREVIEW=4323
  bun run --cwd situs preview --port "$PORT" --host 127.0.0.1 >/dev/null 2>&1 &
  PID=$!
  trap 'kill $PID 2>/dev/null || true' EXIT
  for _ in $(seq 1 30); do curl -sf "http://127.0.0.1:$PORT/" >/dev/null && break; sleep 1; done
  (cd situs && node tools/layar.mjs --url "http://127.0.0.1:$PORT" && node tools/tangkap.mjs --url "http://127.0.0.1:$PORT")
  echo "== jarak judul ke meta (K0d)"
  (cd situs && node tools/ukur-judul.mjs --url "http://127.0.0.1:$PORT" | grep -v "^ok ")
  echo "== teks ilustrasi di dalam bingkai (K0c, K0e)"
  (cd situs && node tools/ukur-ilustrasi.mjs --url "http://127.0.0.1:$PORT")
fi
echo "== semua pemeriksaan lolos"
