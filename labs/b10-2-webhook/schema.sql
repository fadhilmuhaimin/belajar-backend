-- Lab B10.2 · webhook top-up dan outbox. Rekeningo (fiktif): Budi top-up Rp200.000.
DROP SCHEMA IF EXISTS t4w CASCADE;
CREATE SCHEMA t4w;
SET search_path = t4w;
CREATE TABLE akun (id text PRIMARY KEY, saldo bigint NOT NULL CHECK (saldo >= 0));
CREATE TABLE topup (
  id     text PRIMARY KEY,               -- order_id yang dikirim ke gateway
  akun   text NOT NULL REFERENCES akun(id),
  jumlah bigint NOT NULL CHECK (jumlah > 0),
  status text NOT NULL                   -- menunggu | dibayar
);
-- Satu baris per event webhook yang sudah diproses. PRIMARY KEY = event yang sama tidak diproses dua kali.
CREATE TABLE webhook_event (event_id text PRIMARY KEY, diterima timestamptz NOT NULL DEFAULT now());
CREATE TABLE outbox (
  id        bigserial PRIMARY KEY,
  jenis     text NOT NULL,
  data      jsonb NOT NULL,
  terkirim  boolean NOT NULL DEFAULT false
);
INSERT INTO akun VALUES ('budi', 50000);
INSERT INTO topup VALUES ('tp_5521', 'budi', 200000, 'menunggu');
