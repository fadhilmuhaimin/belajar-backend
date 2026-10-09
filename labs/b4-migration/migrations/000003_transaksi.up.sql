-- Minggu 1: pembayaran ke warung.
-- Isi tabel sama dengan labs/api-t1/schema.sql (skema v1 Rekeningo).
CREATE TABLE transaksi (
  id     bigserial   PRIMARY KEY,
  dari   bigint      NOT NULL REFERENCES akun(id),      -- siapa yang membayar
  ke     bigint      NOT NULL REFERENCES akun(id),      -- warung penerima
  jumlah bigint      NOT NULL CONSTRAINT jumlah_positif CHECK (jumlah > 0),
  dibuat timestamptz NOT NULL DEFAULT now(),
  CHECK (dari <> ke)
);
-- Riwayat dan laporan selalu mencari per akun lalu mengurutkan menurut waktu.
CREATE INDEX transaksi_dari_dibuat ON transaksi (dari, dibuat DESC);
CREATE INDEX transaksi_ke_dibuat   ON transaksi (ke, dibuat DESC);
