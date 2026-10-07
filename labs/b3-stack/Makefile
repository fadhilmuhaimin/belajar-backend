# Lab B3 · contoh transaction & lock di beberapa stack, ke Postgres yang sama.
# Butuh: lab db jalan (make -C ../b3-race up), Go, Node, PHP + Composer, Python venv labs/.venv.
export DATABASE_URL := postgres://lab:lab@127.0.0.1:54333/lab
PSQL := docker compose -f ../b3-race/docker-compose.yml exec -T db psql -U lab -d lab -q

.PHONY: all go node django laravel supabase

all: go node django laravel supabase

go:
	cd go && go run . | tee ../output/go.txt

node:
	cd node && npm install --silent --no-audit --no-fund && node main.js | tee ../output/node.txt

django:
	../.venv/bin/python django/main.py | tee output/django.txt

laravel:
	cd laravel && composer install -q && { php main.php transfer; \
	  php main.php tarik 70000 & php main.php tarik 50000 & wait; php main.php cetak; } | tee ../output/laravel.txt

supabase:
	{ $(PSQL) < schema.sql; $(PSQL) < supabase/fungsi.sql; $(PSQL) < supabase/uji.sql; } 2>&1 | tee output/supabase.txt

# Rekam output + statement yang diterima PostgreSQL per stack (output/<stack>-<skenario>.txt).
# Butuh PostgreSQL lab dengan log_statement=all: make -C ../b3-race up
.PHONY: rekam
rekam:
	cd laravel && composer install -q
	cd node && npm install --silent --no-audit --no-fund
	../.venv/bin/python rekam.py
