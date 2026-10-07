#!/bin/bash
# Role untuk replikasi + izin koneksi replikasi dari jaringan docker. Kredensial lab lokal, bukan rahasia.
set -e
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE ROLE replikator WITH REPLICATION LOGIN PASSWORD 'lab';"
echo "host replication replikator all scram-sha-256" >> "$PGDATA/pg_hba.conf"
