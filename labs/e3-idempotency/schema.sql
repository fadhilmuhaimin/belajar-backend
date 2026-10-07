-- Lab E3 · idempotency key. Rekeningo (fiktif): Budi membayar pesanan di Warung Ani.
-- Schema e3, terpisah dari lab lain di database bersama (server dan psql memakai search_path=e3).
DROP SCHEMA IF EXISTS e3 CASCADE;
CREATE SCHEMA e3;
SET search_path = e3;
CREATE TABLE akun (
  id    text PRIMARY KEY,
  saldo bigint NOT NULL CHECK (saldo >= 0)
);
CREATE TABLE pembayaran (
  id     bigserial PRIMARY KEY,
  akun   text NOT NULL REFERENCES akun(id),
  toko   text NOT NULL,
  jumlah bigint NOT NULL CHECK (jumlah > 0)
);
-- Satu baris per aksi bayar di app. PRIMARY KEY = constraint unik pada key.
CREATE TABLE idempotency_key (
  key         text PRIMARY KEY,
  akun        text NOT NULL,
  status_code int,            -- NULL = sedang diproses
  body        jsonb,
  dibuat      timestamptz NOT NULL DEFAULT now()
);
INSERT INTO akun VALUES ('budi', 100000), ('warung_ani', 0);
