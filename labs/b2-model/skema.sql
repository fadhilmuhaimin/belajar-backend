-- Lab B2.1 · relasi dan foreign key di PostgreSQL 17. Skema b2, terpisah dari lab lain.
DROP SCHEMA IF EXISTS b2 CASCADE;
CREATE SCHEMA b2;
SET search_path = b2;

-- --8<-- [start:skema]
CREATE TABLE toko (
  id   bigint PRIMARY KEY,
  nama text NOT NULL
);
CREATE TABLE produk (
  id      bigint PRIMARY KEY,
  toko_id bigint NOT NULL REFERENCES toko(id),
  nama    text NOT NULL,
  harga   bigint NOT NULL CHECK (harga > 0)          -- harga saat ini
);
CREATE TABLE pesanan (
  id      bigint PRIMARY KEY,
  akun_id text NOT NULL,
  toko_id bigint NOT NULL REFERENCES toko(id),
  dibuat  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE item_pesanan (
  pesanan_id bigint NOT NULL REFERENCES pesanan(id),
  produk_id  bigint NOT NULL REFERENCES produk(id),
  jumlah     int    NOT NULL CHECK (jumlah > 0),
  harga      bigint NOT NULL,                          -- salinan harga saat dipesan
  PRIMARY KEY (pesanan_id, produk_id)
);
-- --8<-- [end:skema]

INSERT INTO toko VALUES (1, 'Warung Ani');
INSERT INTO produk VALUES (1, 1, 'Nasi goreng', 25000), (2, 1, 'Es teh', 5000);
INSERT INTO pesanan (id, akun_id, toko_id) VALUES (1, 'budi', 1);
INSERT INTO item_pesanan VALUES (1, 1, 1, 25000), (1, 2, 2, 5000);
