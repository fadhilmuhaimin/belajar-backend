# Lab b5-rls · RLS di PostgreSQL 17 (container lab b3-race), akun v1 lab api-t1 (keputusan 237).
DC := docker compose -f ../b3-race/docker-compose.yml exec -T db
.PHONY: run
run:
	$(MAKE) -C ../b3-race up
	{ printf -- '-- PostgreSQL %s\n' "$$($(DC) psql -U lab -d lab -At -c 'SHOW server_version' | cut -d' ' -f1)"; $(DC) sh -c 'psql -U lab -d lab -v ON_ERROR_STOP=1 -e 2>&1' < rls.sql | grep -v "^SET\|^RESET\|^NOTICE\|^DROP\|^CREATE\|^INSERT\|^ALTER\|^GRANT\|^DO\|^  IF\|^END\|^--8<--\|^  USING"; } > output/rls.txt
	@grep -q '^UPDATE 0$$' output/rls.txt || { echo "GAGAL: UPDATE dari Dimas ke 418 harus UPDATE 0"; exit 1; }
	@grep -q '^ app_rekeningo | 417 | Dimas | 250000$$' output/rls.txt || { echo "GAGAL: Dimas harus hanya melihat akun 417"; exit 1; }
	@test "$$(grep -c '^ pemilik_b5' output/rls.txt)" = 2 && grep -q '^ pemilik_b5   |        3$$' output/rls.txt && grep -q '^ pemilik_b5   |        0$$' output/rls.txt || { echo "GAGAL: pemilik tabel harus 3 baris tanpa FORCE, 0 sesudahnya"; exit 1; }
	@test "$$(grep -c '^ 418 | Warung Ani |  25000$$' output/rls.txt)" = 1 || { echo "GAGAL: saldo Ani di akhir harus tetap 25000"; exit 1; }
	@echo "rls.txt: hasil sesuai"
