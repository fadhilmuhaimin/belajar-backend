#!/usr/bin/env bash
# Situs lama (MkDocs) saja: build strict, tes widget, layar pertama. Registry, istilah, audit bahasa, dan
# ID internal sudah membaca situs/ dan dijalankan tools/cek_situs.sh (keputusan 111). Dihapus bersama MkDocs.
set -euo pipefail
cd "$(dirname "$0")/.."
PY=.venv/bin/python
# Banner informasi Material soal MkDocs 2.0 dimatikan dengan saklar resminya; dependency tetap di-pin (README).
export NO_MKDOCS_2_WARNING=1
echo "== build strict"
# Tanpa -q: WARNING harus terlihat. Exit code mkdocs dipakai langsung, karena site/ tetap
# tertulis walau strict membatalkan build (test -f site/index.html tidak cukup).
LOG_BUILD=$(mktemp)
if .venv/bin/mkdocs build --strict >"$LOG_BUILD" 2>&1; then BUILD_OK=1; else BUILD_OK=0; fi
if grep -E "^(WARNING|ERROR)|Aborted" "$LOG_BUILD"; then :; fi   # baris INFO tidak dicetak
rm -f "$LOG_BUILD"
if [ "$BUILD_OK" != 1 ]; then echo "GAGAL: build strict"; exit 1; fi
echo "build strict lolos"
echo "== tes widget";                           node --test tests/widgets/*.cjs 2>&1 | grep -E "^# (pass|fail)"
node --test tests/widgets/*.cjs >/dev/null 2>&1
echo "== layar pertama";                        node tools/cek_layar_pertama.mjs | grep -v "^  ok " 
