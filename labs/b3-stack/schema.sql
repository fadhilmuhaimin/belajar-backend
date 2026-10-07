-- Skema bersama untuk semua contoh stack di B3.
-- Nilai dalam rupiah (integer, bukan float). Batas saldo Rp1.000.000 supaya transfer ke Ani gagal di UPDATE kedua.
DROP TABLE IF EXISTS akun;
CREATE TABLE akun (
  nama  text PRIMARY KEY,
  saldo int  NOT NULL,
  batas int  NOT NULL,
  CHECK (saldo >= 0 AND saldo <= batas)
);
INSERT INTO akun (nama, saldo, batas) VALUES ('budi', 100000, 1000000), ('ani', 980000, 1000000);
