-- Minggu 3, ADR 6: tabel koreksi.
-- Isi tabel sama dengan labs/api-t1/schema.sql (skema v1 Rekeningo).
-- ADR 6: setiap perubahan saldo di luar bayar dan top-up punya baris di sini. Baris tidak pernah diubah atau dihapus.
CREATE TABLE koreksi (
  id       bigserial   PRIMARY KEY,
  akun_id  bigint      NOT NULL REFERENCES akun(id),
  jumlah   bigint      NOT NULL CHECK (jumlah <> 0),                -- positif menambah, negatif mengurangi
  alasan   text        NOT NULL CHECK (length(trim(alasan)) >= 20), -- kenapa
  admin_id bigint      NOT NULL REFERENCES akun(id),                -- siapa
  dibuat   timestamptz NOT NULL DEFAULT now()                       -- kapan
);
