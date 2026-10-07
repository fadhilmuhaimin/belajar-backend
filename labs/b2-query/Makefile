# Lab B2.3 (index) dan B2.4 (N+1) di PostgreSQL 17 (container lab b3-race).
DC := docker compose -f ../b3-race/docker-compose.yml exec -T db
.PHONY: run
run:
	$(MAKE) -C ../b3-race up
	$(DC) psql -U lab -d lab -q -v ON_ERROR_STOP=1 < data.sql > /dev/null
	{ echo "-- PostgreSQL 17.11 · 200.000 pesanan, 600.000 item, data dari data.sql"; $(DC) sh -c 'psql -U lab -d lab -q -e 2>&1' < index.sql | grep -v "^SET\|^--"; } > output/index.txt
	../.venv/bin/python n1.py
	../.venv/bin/python pagination.py
