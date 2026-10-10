# Lab b5-rls · RLS di PostgreSQL 17 (container lab b3-race), akun v1 lab api-t1 (keputusan 237).
DC := docker compose -f ../b3-race/docker-compose.yml exec -T db
.PHONY: run
run:
	$(MAKE) -C ../b3-race up
	{ printf -- '-- PostgreSQL %s\n' "$$($(DC) psql -U lab -d lab -At -c 'SHOW server_version' | cut -d' ' -f1)"; $(DC) sh -c 'psql -U lab -d lab -v ON_ERROR_STOP=1 -e 2>&1' < rls.sql | grep -v "^SET\|^RESET\|^NOTICE\|^DETAIL:  drop cascades\|^drop cascades\|^DROP\|^CREATE\|^INSERT INTO akun\|^INSERT 0\|^REVOKE\|^ALTER\|^GRANT\|^DO\|^  IF\|^END\|^--8<--\|^  USING"; } > output/rls.txt
	@grep -q '^UPDATE 0$$' output/rls.txt || { echo "GAGAL: UPDATE dari Dimas ke 418 harus UPDATE 0"; exit 1; }
	@grep -q '^ app_rekeningo | 417 | Dimas | 250000$$' output/rls.txt || { echo "GAGAL: Dimas harus hanya melihat akun 417"; exit 1; }
	@test "$$(grep -c '^ pemilik_b5' output/rls.txt)" = 2 && grep -q '^ pemilik_b5   |        3$$' output/rls.txt && grep -q '^ pemilik_b5   |        0$$' output/rls.txt || { echo "GAGAL: pemilik tabel harus 3 baris tanpa FORCE, 0 sesudahnya"; exit 1; }
	@test "$$(grep -c '^ 418 | Warung Ani |  25000$$' output/rls.txt)" = 1 || { echo "GAGAL: saldo Ani di akhir harus tetap 25000"; exit 1; }
	@grep -q '^ t                    | f$$' output/rls.txt || { echo "GAGAL: sesudah RESET, setting harus kosong dan tidak bisa jadi bigint"; exit 1; }
	@test "$$(grep -c '^UPDATE 0$$' output/rls.txt)" = 2 && grep -q '^UPDATE 1$$' output/rls.txt || { echo "GAGAL: bayar ke 418 di bawah policy pemilik harus UPDATE 1 lalu UPDATE 0"; exit 1; }
	@grep -Eq '^ 417 +\| 417 \| Dimas \| 250000$$' output/rls.txt || { echo "GAGAL: SET biasa harus tertinggal: request Budi membaca akun 417"; exit 1; }
	@grep -Eq '^ +\| +0$$' output/rls.txt || { echo "GAGAL: set_config lokal harus hilang saat COMMIT: request Budi 0 baris"; exit 1; }
	@grep -q 'ERROR:  new row violates row-level security policy for table "entri"$$' output/rls.txt || { echo "GAGAL: policy pemilik untuk semua perintah harus menolak INSERT entri Ani dengan error"; exit 1; }
	@test "$$(grep -Ec '^ +41[78] \| +-?5000$$' output/rls.txt)" = 2 && grep -Eq '^ +417 \| +-5000$$' output/rls.txt && grep -Eq '^ +418 \| +5000$$' output/rls.txt || { echo "GAGAL: bayar lewat fungsi harus menulis dua entri; Dimas dan Ani masing-masing hanya melihat entrinya"; exit 1; }
	@grep -q 'ERROR:  permission denied for table entri$$' output/rls.txt || { echo "GAGAL: role aplikasi tidak boleh INSERT langsung ke entri"; exit 1; }
	@grep -q 'ERROR:  pembayaran ditolak$$' output/rls.txt || { echo "GAGAL: bayar tanpa identitas harus ditolak"; exit 1; }
	@echo "rls.txt: hasil sesuai"
