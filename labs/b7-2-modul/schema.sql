-- Lab B7.2 · satu database, satu schema per modul, satu role per modul.
DROP SCHEMA IF EXISTS pesanan, pembayaran CASCADE;
DROP ROLE IF EXISTS modul_pesanan;
DROP ROLE IF EXISTS modul_pembayaran;
CREATE SCHEMA pesanan;
CREATE SCHEMA pembayaran;
CREATE TABLE pesanan.pesanan (id text PRIMARY KEY, total bigint NOT NULL);
CREATE TABLE pembayaran.transaksi (id text PRIMARY KEY, pesanan_id text NOT NULL, jumlah bigint NOT NULL);
INSERT INTO pesanan.pesanan VALUES ('812', 25000);
INSERT INTO pembayaran.transaksi VALUES ('trx-812', '812', 25000);
CREATE ROLE modul_pesanan LOGIN PASSWORD 'lab';
CREATE ROLE modul_pembayaran LOGIN PASSWORD 'lab';
GRANT USAGE ON SCHEMA pesanan TO modul_pesanan;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA pesanan TO modul_pesanan;
GRANT USAGE ON SCHEMA pembayaran TO modul_pembayaran;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA pembayaran TO modul_pembayaran;
