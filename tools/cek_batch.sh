#!/usr/bin/env bash
# Pemeriksaan per batch (Definition of Done minimum, bukan bukti kualitas):
# sinkron cerita (prasyarat, nomor, angka asumsi), istilah, build strict, ID internal tidak tampil, audit bahasa, tes widget, layar pertama.
set -euo pipefail
cd "$(dirname "$0")/.."
PY=.venv/bin/python
# Banner informasi Material soal MkDocs 2.0 dimatikan dengan saklar resminya; dependency tetap di-pin (README).
export NO_MKDOCS_2_WARNING=1
echo "== sinkron cerita, kartu, angka asumsi";  $PY tools/sinkron_cerita.py --check
echo "== istilah";                              $PY tools/build_istilah.py --check
echo "== build strict"
# Tanpa -q: WARNING harus terlihat. Exit code mkdocs dipakai langsung, karena site/ tetap
# tertulis walau strict membatalkan build (test -f site/index.html tidak cukup).
LOG_BUILD=$(mktemp)
if .venv/bin/mkdocs build --strict >"$LOG_BUILD" 2>&1; then BUILD_OK=1; else BUILD_OK=0; fi
if grep -E "^(WARNING|ERROR)|Aborted" "$LOG_BUILD"; then :; fi   # baris INFO tidak dicetak
rm -f "$LOG_BUILD"
if [ "$BUILD_OK" != 1 ]; then echo "GAGAL: build strict"; exit 1; fi
echo "build strict lolos"
echo "== ID internal tidak tampil";           $PY tools/cek_id_tampil.py
echo "== audit bahasa";                         $PY tools/audit_bahasa.py --check | tail -3
echo "== tes widget";                           node --test tests/widgets/*.cjs 2>&1 | grep -E "^# (pass|fail)"
node --test tests/widgets/*.cjs >/dev/null 2>&1
echo "== layar pertama";                        node tools/cek_layar_pertama.mjs | grep -v "^  ok " 
