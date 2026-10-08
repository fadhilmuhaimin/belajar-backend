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

echo "== istilah";              $PY tools/build_istilah.py --check
echo "== audit bahasa";         $PY tools/audit_bahasa.py --check | tail -1
$PY tools/audit_bahasa.py --check >/dev/null

echo "== build strict"
LOG=$(mktemp)
if npm --prefix situs run build >"$LOG" 2>&1; then OK=1; else OK=0; fi
if grep -E "\[WARN\]|\[ERROR\]" "$LOG"; then OK=0; fi
rm -f "$LOG"
if [ "$OK" != 1 ]; then echo "GAGAL: build strict"; exit 1; fi
echo "build strict lolos (0 warning)"

echo "== ID internal tidak tampil"; $PY tools/cek_id_tampil.py
echo "== kontras dua mode";          $PY tools/contrast.py | tail -1
echo "== tes situs";                 npm --prefix situs test 2>&1 | grep -E "^# (pass|fail)"
echo "== tes widget lama";           node --test tests/widgets/*.cjs 2>&1 | grep -E "^# (pass|fail)"
node --test tests/widgets/*.cjs >/dev/null 2>&1

if [ "${1:-}" = "--layar" ]; then
  echo "== layar pertama 4 ukuran + tangkapan"
  npm --prefix situs run preview -- --port 4321 --host 127.0.0.1 >/dev/null 2>&1 &
  PID=$!
  trap 'kill $PID 2>/dev/null || true' EXIT
  for _ in $(seq 1 30); do curl -sf http://127.0.0.1:4321/ >/dev/null && break; sleep 1; done
  (cd situs && node tools/layar.mjs --url http://127.0.0.1:4321 && node tools/tangkap.mjs --url http://127.0.0.1:4321)
fi
echo "== semua pemeriksaan lolos"
