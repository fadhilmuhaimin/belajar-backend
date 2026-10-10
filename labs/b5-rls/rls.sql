-- Lab b5-rls · Row Level Security di PostgreSQL 17 dengan akun v1 lab api-t1 (keputusan 237).
-- Skema b5, terpisah dari tahap1. Role app_rekeningo = role aplikasi; pemilik_b5 = pemilik tabel.
DROP SCHEMA IF EXISTS b5 CASCADE;
CREATE SCHEMA b5;
SET search_path = b5;
CREATE TABLE akun (id bigint PRIMARY KEY, jenis text NOT NULL, nama text NOT NULL, saldo bigint NOT NULL);
INSERT INTO akun VALUES (417, 'karyawan', 'Dimas', 250000), (418, 'warung', 'Warung Ani', 25000), (419, 'karyawan', 'Budi', 225000);

-- --8<-- [start:policy]
ALTER TABLE akun ENABLE ROW LEVEL SECURITY;
CREATE POLICY pemilik_saja ON akun
  USING (id = nullif(current_setting('app.akun_id', true), '')::bigint);
-- --8<-- [end:policy]

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_rekeningo') THEN CREATE ROLE app_rekeningo; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pemilik_b5') THEN CREATE ROLE pemilik_b5; END IF;
END $$;
GRANT USAGE ON SCHEMA b5 TO app_rekeningo, pemilik_b5;
GRANT SELECT, UPDATE ON akun TO app_rekeningo;
ALTER TABLE akun OWNER TO pemilik_b5;

\echo '-- 1. Role lab adalah superuser: superuser selalu melewati RLS'
SELECT current_user, id, nama, saldo FROM akun ORDER BY id;

\echo '-- 2. Role aplikasi, request dari Dimas (417); query di bawah tidak menulis WHERE pemilik'
SET ROLE app_rekeningo;
SET app.akun_id = '417';
SELECT current_user, id, nama, saldo FROM akun ORDER BY id;
SELECT id, nama, saldo FROM akun WHERE id = 418;
UPDATE akun SET saldo = 0 WHERE id = 418;

\echo '-- 3. Request tanpa identitas akun'
RESET app.akun_id;
SELECT current_setting('app.akun_id', true) = '' AS kosong_sesudah_reset,
       pg_input_is_valid(current_setting('app.akun_id', true), 'bigint') AS bisa_jadi_bigint;
SELECT id, nama, saldo FROM akun ORDER BY id;
RESET ROLE;

\echo '-- 4. Pemilik tabel juga melewati RLS, sampai tabelnya diberi FORCE ROW LEVEL SECURITY'
SET ROLE pemilik_b5;
SELECT current_user, count(*) AS terlihat FROM akun;
RESET ROLE;
\echo '-- sesudah ALTER TABLE akun FORCE ROW LEVEL SECURITY'
ALTER TABLE akun FORCE ROW LEVEL SECURITY;
SET ROLE pemilik_b5;
SELECT current_user, count(*) AS terlihat FROM akun;
RESET ROLE;

\echo '-- 5. Policy yang sama saat Dimas membayar Rp5.000 ke Warung Ani (dibatalkan di akhir)'
SET ROLE app_rekeningo;
SET app.akun_id = '417';
BEGIN;
UPDATE akun SET saldo = saldo - 5000 WHERE id = 417;
UPDATE akun SET saldo = saldo + 5000 WHERE id = 418;
ROLLBACK;
RESET app.akun_id;
RESET ROLE;

-- --8<-- [start:pool-set]
\echo '-- 6. Satu koneksi dari pool, dua request berurutan; identitas diisi dengan SET biasa'
SET ROLE app_rekeningo;
\echo '-- request Dimas'
SET app.akun_id = '417';
SELECT id, nama, saldo FROM akun ORDER BY id;
\echo '-- request Budi di koneksi yang sama, lewat endpoint yang lupa mengisi app.akun_id'
SELECT current_setting('app.akun_id', true) AS akun_id_terbaca, id, nama, saldo FROM akun ORDER BY id;
-- --8<-- [end:pool-set]
RESET app.akun_id;
RESET ROLE;

-- --8<-- [start:pool-lokal]
\echo '-- 7. Sama, tapi identitas diisi set_config(..., true) di dalam transaction request'
SET ROLE app_rekeningo;
\echo '-- request Dimas'
BEGIN;
SELECT set_config('app.akun_id', '417', true);
SELECT id, nama, saldo FROM akun ORDER BY id;
COMMIT;
\echo '-- request Budi di koneksi yang sama, lewat endpoint yang lupa mengisi app.akun_id'
SELECT current_setting('app.akun_id', true) AS akun_id_terbaca, count(*) AS terlihat FROM akun;
-- --8<-- [end:pool-lokal]
RESET ROLE;

\echo '-- 8. Saldo sesudah semua langkah, dilihat superuser'
SELECT id, nama, saldo FROM akun ORDER BY id;

\echo '-- 9. Sketsa ledger Tahap 2: tabel entri dengan policy pemilik untuk semua perintah'
\set ECHO none
CREATE TABLE entri (id bigserial PRIMARY KEY, akun_id bigint NOT NULL, jumlah bigint NOT NULL);
GRANT SELECT, INSERT ON entri TO app_rekeningo;
GRANT USAGE ON SEQUENCE entri_id_seq TO app_rekeningo;
ALTER TABLE entri OWNER TO pemilik_b5;
ALTER TABLE entri ENABLE ROW LEVEL SECURITY;
ALTER TABLE entri FORCE ROW LEVEL SECURITY;
CREATE POLICY pemilik_entri ON entri
  USING (akun_id = nullif(current_setting('app.akun_id', true), '')::bigint);
\set ECHO queries
SET ROLE app_rekeningo;
\echo '-- request Dimas: bayar Rp5.000 ke Warung Ani menulis dua entri'
BEGIN;
SELECT set_config('app.akun_id', '417', true);
\set ON_ERROR_STOP 0
INSERT INTO entri (akun_id, jumlah) VALUES (417, -5000), (418, 5000);
\set ON_ERROR_STOP 1
ROLLBACK;
RESET ROLE;

\echo '-- 10. Policy per perintah: role aplikasi hanya membaca; entri ditulis fungsi bayar'
\set ECHO none
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'penulis_b5') THEN CREATE ROLE penulis_b5; END IF;
END $$;
GRANT USAGE ON SCHEMA b5 TO penulis_b5;
GRANT USAGE ON SEQUENCE entri_id_seq TO penulis_b5;
REVOKE USAGE ON SEQUENCE entri_id_seq FROM app_rekeningo;
DROP POLICY pemilik_entri ON entri;
-- --8<-- [start:ledger]
REVOKE INSERT ON entri FROM app_rekeningo; -- role aplikasi tinggal punya SELECT
GRANT INSERT ON entri TO penulis_b5;       -- role penulis: tanpa LOGIN, tanpa SELECT
CREATE POLICY baca_pemilik ON entri FOR SELECT TO app_rekeningo
  USING (akun_id = nullif(current_setting('app.akun_id', true), '')::bigint);
CREATE POLICY tulis_lewat_bayar ON entri FOR INSERT TO penulis_b5
  WITH CHECK (true);
CREATE FUNCTION bayar(ke bigint, jumlah bigint) RETURNS integer
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = b5, pg_temp AS $$
DECLARE
  dari bigint := nullif(current_setting('app.akun_id', true), '')::bigint;
BEGIN
  IF dari IS NULL OR jumlah <= 0 OR ke = dari THEN
    RAISE EXCEPTION 'pembayaran ditolak';
  END IF;
  INSERT INTO entri (akun_id, jumlah) VALUES (dari, -jumlah), (ke, jumlah);
  RETURN 2;
END $$;
ALTER FUNCTION bayar(bigint, bigint) OWNER TO penulis_b5;
REVOKE ALL ON FUNCTION bayar(bigint, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION bayar(bigint, bigint) TO app_rekeningo;
-- --8<-- [end:ledger]
\set ECHO queries
SET ROLE app_rekeningo;
\echo '-- request Dimas: bayar Rp5.000 ke Warung Ani lewat fungsi bayar'
BEGIN;
SELECT set_config('app.akun_id', '417', true);
SELECT bayar(418, 5000);
SELECT akun_id, jumlah FROM entri ORDER BY id;
COMMIT;
\echo '-- request Warung Ani membaca entri miliknya'
BEGIN;
SELECT set_config('app.akun_id', '418', true);
SELECT akun_id, jumlah FROM entri ORDER BY id;
COMMIT;
\echo '-- request Dimas menulis entri +5.000 untuk dirinya sendiri, langsung ke tabel'
BEGIN;
SELECT set_config('app.akun_id', '417', true);
\set ON_ERROR_STOP 0
INSERT INTO entri (akun_id, jumlah) VALUES (417, 5000);
ROLLBACK;
\echo '-- request tanpa identitas memanggil bayar'
SELECT bayar(418, 5000);
\set ON_ERROR_STOP 1
RESET ROLE;
