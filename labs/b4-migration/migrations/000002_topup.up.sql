-- Minggu 1: catatan top-up dari admin.
-- Isi tabel sama dengan labs/api-t1/schema.sql (skema v1 Rekeningo).
-- Aturan Pak Hadi: tidak ada angka yang berubah tanpa catatan siapa, kapan, kenapa.
CREATE TABLE topup (
  id         bigserial   PRIMARY KEY,
  akun_id    bigint      NOT NULL REFERENCES akun(id),
  nominal    bigint      NOT NULL CHECK (nominal > 0),
  admin_id   bigint      NOT NULL REFERENCES akun(id),   -- siapa
  dibuat     timestamptz NOT NULL DEFAULT now(),         -- kapan
  keterangan text        NOT NULL                        -- kenapa
);
