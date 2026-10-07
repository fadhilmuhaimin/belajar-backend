#!/usr/bin/env bash
# Pemeriksaan per batch (Definition of Done minimum, bukan bukti kualitas):
# sinkron cerita (prasyarat, nomor, angka asumsi), istilah, build strict, ID internal tidak tampil, audit bahasa, tes widget, layar pertama.
set -euo pipefail
cd "$(dirname "$0")/.."
PY=.venv/bin/python
echo "== sinkron cerita, kartu, angka asumsi";  $PY tools/sinkron_cerita.py --check
echo "== istilah";                              $PY tools/build_istilah.py --check
echo "== build strict";                         .venv/bin/mkdocs build --strict -q 2>&1 | grep -v "│\|^\s*$\|MkDocs 2.0\|squidfunk" || true
test -f site/index.html
for f in tools/lokal/cek-*.sh; do [ -f "$f" ] && { echo "== lokal: $f"; bash "$f"; }; done   # opsional, tidak ikut repo
echo "== ID internal tidak tampil";           $PY tools/cek_id_tampil.py
echo "== audit bahasa";                         $PY tools/audit_bahasa.py --check | tail -3
echo "== tes widget";                           node --test tests/widgets/*.cjs 2>&1 | grep -E "^# (pass|fail)"
node --test tests/widgets/*.cjs >/dev/null 2>&1
echo "== layar pertama";                        node tools/cek_layar_pertama.mjs | grep -v "^  ok " 
