-- Lab E2 · offline-first dan sync. Rekeningo (fiktif): stok dan harga di Warung Ani.
DROP SCHEMA IF EXISTS e2 CASCADE;
CREATE SCHEMA e2;
SET search_path = e2;
CREATE TABLE produk (
  id    text PRIMARY KEY,
  nama  text NOT NULL,
  stok  int NOT NULL CHECK (stok >= 0),
  harga bigint NOT NULL CHECK (harga > 0),
  versi int NOT NULL DEFAULT 1          -- naik setiap harga diubah
);
-- Satu baris per operasi dari antrean app. PRIMARY KEY = operasi yang dikirim ulang tidak diterapkan dua kali.
CREATE TABLE op_sync (
  op_id     text PRIMARY KEY,
  hasil     jsonb NOT NULL,
  diterima  timestamptz NOT NULL DEFAULT now()
);
INSERT INTO produk (id, nama, stok, harga) VALUES ('nasgor', 'Nasi goreng', 25, 25000);
