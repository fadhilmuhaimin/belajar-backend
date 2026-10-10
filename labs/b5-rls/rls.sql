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

\echo '-- 5. Saldo sesudah semua langkah, dilihat superuser'
SELECT id, nama, saldo FROM akun ORDER BY id;
