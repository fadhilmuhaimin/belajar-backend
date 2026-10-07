-- Lab Tahap 3 · pembayaran di jam sibuk. Skema t3.
DROP SCHEMA IF EXISTS t3 CASCADE;
CREATE SCHEMA t3;
SET search_path = t3;
CREATE TABLE akun (id int PRIMARY KEY, saldo bigint NOT NULL CHECK (saldo >= 0));
INSERT INTO akun SELECT g, 1000000 FROM generate_series(1, 5000) g;
CREATE TABLE pembayaran (id bigserial PRIMARY KEY, akun_id int NOT NULL, jumlah bigint NOT NULL, dibuat timestamptz NOT NULL DEFAULT now());
-- --8<-- [start:outbox]
CREATE TABLE outbox (
  id         bigserial PRIMARY KEY,
  jenis      text NOT NULL,
  data       jsonb NOT NULL,
  status     text NOT NULL DEFAULT 'menunggu',   -- menunggu | terkirim | gagal (dead-letter)
  percobaan  int  NOT NULL DEFAULT 0,
  coba_lagi  timestamptz NOT NULL DEFAULT now(),
  error_akhir text
);
CREATE INDEX outbox_siap_idx ON outbox (coba_lagi) WHERE status = 'menunggu';
-- --8<-- [end:outbox]
