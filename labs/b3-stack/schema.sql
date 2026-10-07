-- Skema bersama untuk semua contoh stack di B3.
-- Nilai dalam rupiah (integer, bukan float). Batas saldo Rp1.000.000 supaya transfer ke Ani gagal di UPDATE kedua.
-- Schema b3s, terpisah dari lab lain di database bersama (client juga memakai search_path=b3s).
DROP SCHEMA IF EXISTS b3s CASCADE;
CREATE SCHEMA b3s;
SET search_path = b3s;
CREATE TABLE akun (
  nama  text PRIMARY KEY,
  saldo int  NOT NULL,
  batas int  NOT NULL,
  CHECK (saldo >= 0 AND saldo <= batas)
);
INSERT INTO akun (nama, saldo, batas) VALUES ('budi', 100000, 1000000), ('ani', 980000, 1000000);
