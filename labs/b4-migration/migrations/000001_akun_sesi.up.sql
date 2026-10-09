-- Minggu 1: akun dan sesi login.
-- Isi tabel sama dengan labs/api-t1/schema.sql (skema v1 Rekeningo).
CREATE TABLE akun (
  id            bigint PRIMARY KEY,                -- nomor akun, terlihat di URL
  jenis         text   NOT NULL CHECK (jenis IN ('karyawan', 'warung', 'admin')),
  nama          text   NOT NULL,
  email         text   NOT NULL UNIQUE,            -- email perusahaan, untuk login
  password_hash text   NOT NULL,                   -- bcrypt, bukan password asli
  saldo         bigint NOT NULL DEFAULT 0          -- rupiah, integer
                CONSTRAINT saldo_tidak_negatif CHECK (saldo >= 0)
);

CREATE TABLE sesi (
  token_hash  text        PRIMARY KEY,             -- SHA-256 dari token; token aslinya hanya ada di HP
  akun_id     bigint      NOT NULL REFERENCES akun(id),
  kedaluwarsa timestamptz NOT NULL
);
