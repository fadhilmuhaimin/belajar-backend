-- Lab B2.3/B2.4 · riwayat penjualan toko. Data dibangkitkan (deterministik), skema b2q.
DROP SCHEMA IF EXISTS b2q CASCADE;
CREATE SCHEMA b2q;
SET search_path = b2q;
SELECT setseed(0.42);
CREATE TABLE pesanan (
  id      bigint PRIMARY KEY,
  toko_id int    NOT NULL,
  akun_id int    NOT NULL,
  total   bigint NOT NULL,
  dibuat  timestamptz NOT NULL
);
CREATE TABLE item_pesanan (
  pesanan_id bigint NOT NULL REFERENCES pesanan(id),
  nama       text   NOT NULL,
  jumlah     int    NOT NULL,
  harga      bigint NOT NULL
);
-- 200.000 pesanan untuk 50 toko selama 1 tahun; toko 1 = Warung Ani.
INSERT INTO pesanan
SELECT g, 1 + (g % 50), 1 + (g % 3000), 0, timestamptz '2026-01-01' + (g * interval '157 seconds')
FROM generate_series(1, 200000) g;
INSERT INTO item_pesanan
SELECT p.id, (ARRAY['Nasi goreng','Es teh','Mie ayam','Kopi'])[1 + (p.id + k) % 4], 1 + (p.id + k) % 2,
       (ARRAY[25000, 5000, 20000, 8000])[1 + (p.id + k) % 4]
FROM pesanan p, generate_series(1, 3) k;
UPDATE pesanan p SET total = s.t FROM (SELECT pesanan_id, sum(jumlah * harga) t FROM item_pesanan GROUP BY 1) s
WHERE s.pesanan_id = p.id;
ANALYZE;
SELECT (SELECT count(*) FROM pesanan) AS pesanan, (SELECT count(*) FROM item_pesanan) AS item,
       (SELECT count(*) FROM pesanan WHERE toko_id = 1) AS pesanan_warung_ani;
