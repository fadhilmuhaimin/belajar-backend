-- Lab API Tahap 1 · Rekeningo (fiktif), mengikuti plan/CERITA-TAHAP-1.md (keputusan 132).
-- Schema tahap1, terpisah dari lab lain dan dari api-t1-lama (schema t1).
DROP SCHEMA IF EXISTS tahap1 CASCADE;
CREATE SCHEMA tahap1;
SET search_path = tahap1;

-- --8<-- [start:akun]
CREATE TABLE akun (
  id            bigint PRIMARY KEY,                -- nomor akun, terlihat di URL
  jenis         text   NOT NULL CHECK (jenis IN ('karyawan', 'warung', 'admin')),
  nama          text   NOT NULL,
  email         text   NOT NULL UNIQUE,            -- email perusahaan, untuk login
  password_hash text   NOT NULL,                   -- bcrypt, bukan password asli
  saldo         bigint NOT NULL DEFAULT 0          -- rupiah, integer
);
-- --8<-- [end:akun]

-- --8<-- [start:sesi]
CREATE TABLE sesi (
  token_hash  text        PRIMARY KEY,             -- SHA-256 dari token; token aslinya hanya ada di HP
  akun_id     bigint      NOT NULL REFERENCES akun(id),
  kedaluwarsa timestamptz NOT NULL
);
-- --8<-- [end:sesi]

-- --8<-- [start:topup]
-- Aturan Pak Hadi: tidak ada angka yang berubah tanpa catatan siapa, kapan, kenapa.
CREATE TABLE topup (
  id         bigserial   PRIMARY KEY,
  akun_id    bigint      NOT NULL REFERENCES akun(id),
  nominal    bigint      NOT NULL CHECK (nominal > 0),
  admin_id   bigint      NOT NULL REFERENCES akun(id),   -- siapa
  dibuat     timestamptz NOT NULL DEFAULT now(),         -- kapan
  keterangan text        NOT NULL                        -- kenapa
);
-- --8<-- [end:topup]
