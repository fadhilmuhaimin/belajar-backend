-- Lab B5.3 · Row Level Security di PostgreSQL 17. Skema b5, peran app_rekeningo.
DROP SCHEMA IF EXISTS b5 CASCADE;
CREATE SCHEMA b5;
SET search_path = b5;
CREATE TABLE akun (id text PRIMARY KEY, nama text NOT NULL, saldo bigint NOT NULL);
INSERT INTO akun VALUES ('budi', 'Budi', 100000), ('ani', 'Warung Ani', 250000);

-- --8<-- [start:policy]
ALTER TABLE akun ENABLE ROW LEVEL SECURITY;
CREATE POLICY pemilik_saja ON akun
  USING (id = current_setting('app.user_id', true));
-- --8<-- [end:policy]

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_rekeningo') THEN CREATE ROLE app_rekeningo; END IF;
END $$;
GRANT USAGE ON SCHEMA b5 TO app_rekeningo;
GRANT SELECT, UPDATE ON akun TO app_rekeningo;

-- 1. Sebagai role lab (superuser): superuser selalu melewati RLS.
SELECT current_user, id, saldo FROM akun ORDER BY id;

-- 2. Sebagai role aplikasi, request dari Budi.
SET ROLE app_rekeningo;
SET app.user_id = 'budi';
SELECT current_user, id, saldo FROM akun ORDER BY id;
SELECT id, saldo FROM akun WHERE id = 'ani';
UPDATE akun SET saldo = 0 WHERE id = 'ani';

-- 3. Request tanpa identitas user.
RESET app.user_id;
SELECT id, saldo FROM akun ORDER BY id;
RESET ROLE;

