-- Lab E3 · idempotency key. Rekeningo (fiktif): Budi membayar pesanan di Warung Ani.
DROP TABLE IF EXISTS idempotency_key, pembayaran, akun;
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
