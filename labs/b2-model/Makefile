# Lab B2.1 · relasi dan foreign key di PostgreSQL 17 (container lab b3-race).
DC := docker compose -f ../b3-race/docker-compose.yml exec -T db
.PHONY: run
run:
	$(MAKE) -C ../b3-race up
	$(DC) psql -U lab -d lab -q < skema.sql
	{ echo "-- PostgreSQL 17.11, skema dari skema.sql"; $(DC) sh -c 'psql -U lab -d lab -q -e 2>&1' < uji.sql | grep -v "^SET"; } > output/relasi.txt
