-- Keadaan awal: kolom telp dipakai API v1 dan app v1.4.
DROP SCHEMA IF EXISTS b4 CASCADE;
CREATE SCHEMA b4;
CREATE TABLE akun (id bigint PRIMARY KEY, nama text NOT NULL, telp text);
INSERT INTO akun SELECT g, 'user ' || g, '0812' || lpad(g::text, 8, '0') FROM generate_series(1, 2500) g;
UPDATE akun SET nama = 'Budi' WHERE id = 1;
