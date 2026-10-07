SET search_path = b2;
-- 1. Pesanan untuk toko yang tidak ada
INSERT INTO pesanan (id, akun_id, toko_id) VALUES (2, 'budi', 99);
-- 2. Menghapus toko yang masih punya pesanan
DELETE FROM toko WHERE id = 1;
-- 3. Ani menaikkan harga nasi goreng. Total pesanan lama tidak berubah, karena harga disalin ke item.
UPDATE produk SET harga = 28000 WHERE id = 1;
SELECT p.nama, p.harga AS harga_sekarang, i.harga AS harga_di_pesanan_1, i.jumlah
  FROM item_pesanan i JOIN produk p ON p.id = i.produk_id WHERE i.pesanan_id = 1 ORDER BY p.id;
SELECT sum(i.harga * i.jumlah) AS total_pesanan_1 FROM item_pesanan i WHERE i.pesanan_id = 1;
