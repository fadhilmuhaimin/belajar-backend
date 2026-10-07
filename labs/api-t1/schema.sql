-- Lab API Tahap 1 · Rekeningo (fiktif). Skema t1, terpisah dari lab lain.
DROP SCHEMA IF EXISTS t1 CASCADE;
CREATE SCHEMA t1;
SET search_path = t1;

-- --8<-- [start:skema]
CREATE TABLE akun (
  id       text PRIMARY KEY,
  nama     text NOT NULL,
  pin_hash text NOT NULL,                       -- bcrypt, bukan PIN asli
  saldo    bigint NOT NULL CHECK (saldo >= 0)   -- rupiah, integer
);
CREATE TABLE transfer (
  id     bigserial PRIMARY KEY,
  dari   text NOT NULL REFERENCES akun(id),
  ke     text NOT NULL REFERENCES akun(id),
  jumlah bigint NOT NULL CHECK (jumlah > 0),
  dibuat timestamptz NOT NULL DEFAULT now(),
  CHECK (dari <> ke)
);
-- --8<-- [end:skema]
