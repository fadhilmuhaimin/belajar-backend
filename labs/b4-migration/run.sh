#!/usr/bin/env bash
# Lab B4.1 · golang-migrate v4.20.1 ke PostgreSQL 17 (skema b4m). Keluaran: output/migrate.txt
set -u
cd "$(dirname "$0")"
DC="docker compose -f ../b3-race/docker-compose.yml exec -T db"
DB="postgres://lab:lab@127.0.0.1:54333/lab?sslmode=disable&search_path=b4m&x-migrations-table=schema_migrations"
M="go run -tags postgres github.com/golang-migrate/migrate/v4/cmd/migrate@v4.20.1"
$DC psql -U lab -d lab -q -c "DROP SCHEMA IF EXISTS b4m CASCADE; CREATE SCHEMA b4m;" >/dev/null 2>&1
rm -f migrations/000003_*
jalan() { echo "\$ migrate $*"; $M -path migrations -database "$DB" "$@" 2>&1 | sed -E 's/^[0-9]{4}\/[0-9]{2}\/[0-9]{2} [0-9:]{8} //'; echo; }
sql() { echo "\$ psql -c \"$1\""; $DC psql -U lab -d lab -c "SET search_path = b4m; $1" 2>&1 | grep -v "^SET$"; echo; }
{
  echo "# golang-migrate v4.20.1 · PostgreSQL 17.11"
  jalan up
  jalan version
  sql "SELECT * FROM schema_migrations"
  echo "# Migration 3 ditambahkan, dengan salah ketik di statement kedua."
  cp rusak/000003_* migrations/
  jalan up
  jalan version
  sql "SELECT * FROM schema_migrations"
  sql "SELECT column_name FROM information_schema.columns WHERE table_schema = 'b4m' AND table_name = 'akun' ORDER BY ordinal_position"
  jalan up
  echo "# Kolom telp TIDAK ada: PostgreSQL menjalankan isi file ini sebagai satu transaction implisit,"
  echo "# jadi ALTER TABLE ikut dibatalkan. Yang tertinggal hanya tanda dirty. Tandai versi 2 sebagai bersih:"
  jalan force 2
  sed -i '' 's/ON akuns/ON akun/' migrations/000003_tambah_telp.up.sql
  echo "# Salah ketik di file migration 3 diperbaiki."
  jalan up
  jalan version
} > output/migrate.txt
rm -f migrations/000003_*
cat output/migrate.txt
