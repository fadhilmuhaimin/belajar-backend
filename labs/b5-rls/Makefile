# Lab B5.3 · RLS di PostgreSQL 17 (container lab b3-race).
DC := docker compose -f ../b3-race/docker-compose.yml exec -T db
.PHONY: run
run:
	$(MAKE) -C ../b3-race up
	{ echo "-- PostgreSQL 17.11"; $(DC) sh -c 'psql -U lab -d lab -e 2>&1' < rls.sql | grep -v "^SET\|^RESET\|^NOTICE\|^DROP\|^CREATE\|^INSERT\|^ALTER\|^GRANT\|^DO\|^  IF\|^END\|^--8<--\|^  USING"; } > output/rls.txt
