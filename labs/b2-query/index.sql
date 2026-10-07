SET search_path = b2q;
-- 1. Riwayat penjualan Warung Ani: 20 pesanan terbaru. Belum ada index selain primary key.
EXPLAIN (ANALYZE, COSTS OFF, TIMING ON, SUMMARY ON)
SELECT id, total, dibuat FROM pesanan WHERE toko_id = 1 ORDER BY dibuat DESC LIMIT 20;

-- 2. Item satu pesanan. pesanan_id adalah foreign key, tapi foreign key tidak otomatis punya index.
EXPLAIN (ANALYZE, COSTS OFF, TIMING ON, SUMMARY ON)
SELECT nama, jumlah, harga FROM item_pesanan WHERE pesanan_id = 199951;

-- 3. Index sesuai pola query.
\timing on
CREATE INDEX pesanan_toko_dibuat_idx ON pesanan (toko_id, dibuat DESC);
CREATE INDEX item_pesanan_pesanan_idx ON item_pesanan (pesanan_id);
\timing off
SELECT relname AS index, pg_size_pretty(pg_relation_size(oid)) AS ukuran
FROM pg_class WHERE relname IN ('pesanan_toko_dibuat_idx', 'item_pesanan_pesanan_idx') ORDER BY relname;

EXPLAIN (ANALYZE, COSTS OFF, TIMING ON, SUMMARY ON)
SELECT id, total, dibuat FROM pesanan WHERE toko_id = 1 ORDER BY dibuat DESC LIMIT 20;
EXPLAIN (ANALYZE, COSTS OFF, TIMING ON, SUMMARY ON)
SELECT nama, jumlah, harga FROM item_pesanan WHERE pesanan_id = 199951;

-- 4. Index tidak dipakai kalau kolom pertamanya tidak ada di WHERE.
EXPLAIN (COSTS OFF)
SELECT id, total FROM pesanan WHERE dibuat > '2026-12-01' ORDER BY dibuat DESC LIMIT 20;
