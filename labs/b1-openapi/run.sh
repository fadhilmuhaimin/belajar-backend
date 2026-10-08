#!/usr/bin/env bash
# Lab 1.18 (B1.4) · lint kontrak OpenAPI v1 + deteksi breaking change. Keluaran: output/kontrak.txt
cd "$(dirname "$0")"
OASDIFF="tufin/oasdiff@sha256:64c510d2535e1aa2332e864d696ecdecd2c652b3da5e97d4c3a9c5350713a8ee"
{
  echo "\$ npx @redocly/cli@2.58.2 lint openapi.yaml"
  npx -y @redocly/cli@2.58.2 lint openapi.yaml 2>&1 | sed -E 's/in [0-9]+ms/in …ms/; s/\x1b\[[0-9;]*m//g' | grep -v "^$" | grep -v "Woohoo\|run with --" | grep -vF -e "╔" -e "║" -e "╚" 
  echo
  echo "\$ oasdiff breaking openapi.yaml v1-tambah-field.yaml   # Akun + field opsional no_hp"
  docker run --rm -v "$PWD:/s" "$OASDIFF" breaking /s/openapi.yaml /s/v1-tambah-field.yaml 2>&1
  echo "(exit code $?)"
  echo
  echo "\$ oasdiff breaking openapi.yaml v1-ganti-nama.yaml --fail-on ERR   # Akun.saldo diganti balance"
  docker run --rm -v "$PWD:/s" "$OASDIFF" breaking /s/openapi.yaml /s/v1-ganti-nama.yaml --fail-on ERR 2>&1
  echo "(exit code $?)"
} > output/kontrak.txt
cat output/kontrak.txt
