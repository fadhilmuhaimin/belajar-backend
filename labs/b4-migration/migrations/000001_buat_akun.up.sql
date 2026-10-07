CREATE TABLE akun (
  id    text PRIMARY KEY,
  nama  text NOT NULL,
  saldo bigint NOT NULL DEFAULT 0 CHECK (saldo >= 0)
);
