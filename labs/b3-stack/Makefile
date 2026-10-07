# Lab B3 · contoh transaction & lock di beberapa stack, ke Postgres yang sama.
# Butuh: lab db jalan (make -C ../b3-race up), Go, Node, PHP + Composer, Python venv labs/.venv.
export DATABASE_URL := postgres://lab:lab@127.0.0.1:54333/lab
# Gagal keras: error di tengah pipeline atau di psql tidak boleh tertelan.
SHELL := /bin/bash
.SHELLFLAGS := -eo pipefail -c
PSQL := docker compose -f ../b3-race/docker-compose.yml exec -T db psql -U lab -d lab -q -v ON_ERROR_STOP=1

.PHONY: all run rekam go node django laravel supabase

# Rekaman yang dipakai halaman: output/<stack>-<skenario>.txt (lihat rekam.py).
all run: rekam

# Rekam output + statement yang diterima PostgreSQL per stack.
# Butuh PostgreSQL lab dengan log_statement=all: make -C ../b3-race up
rekam:
	cd laravel && composer install -q
	cd node && npm install --silent --no-audit --no-fund
	../.venv/bin/python rekam.py

# Menjalankan satu stack di terminal tanpa merekam (untuk mencoba sendiri).
go:
	cd go && go run . transfer && go run . tarik

node:
	cd node && npm install --silent --no-audit --no-fund && node main.js transfer && node main.js tarik

django:
	../.venv/bin/python django/main.py transfer && ../.venv/bin/python django/main.py tarik

laravel:
	cd laravel && composer install -q && php main.php transfer
	$(PSQL) < schema.sql
	cd laravel && { php main.php tarik 70000 & a=$$!; php main.php tarik 50000 & b=$$!; wait $$a; wait $$b; php main.php cetak; }

supabase:
	$(PSQL) < schema.sql
	$(PSQL) < supabase/fungsi.sql
	$(PSQL) -v ON_ERROR_STOP=0 < supabase/uji-transfer.sql
	$(PSQL) < schema.sql
	$(PSQL) < supabase/fungsi.sql
	$(PSQL) < supabase/uji-tarik.sql
