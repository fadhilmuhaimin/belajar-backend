#!/usr/bin/env bash
# Lab F2 · apa yang ditangkap alat otomatis dari kode_ai.go. Keluaran: output/alat.txt
cd "$(dirname "$0")"
go install github.com/securego/gosec/v2/cmd/gosec@v2.29.0 2>/dev/null
GOSEC="$(go env GOPATH)/bin/gosec"
{
  echo "\$ go vet ./...   # $(go env GOVERSION)"
  go vet ./... 2>&1; echo "(exit code $?)"; echo
  echo "\$ gosec ./...    # gosec v2.29.0"
  "$GOSEC" -quiet -fmt text ./... 2>&1 | sed -E "s#$PWD/##; s/\x1b\[[0-9;]*m//g" \
    | grep -E "^\[|^Results" ; echo "(exit code ${PIPESTATUS[0]})"
} > output/alat.txt
cat output/alat.txt
