ALTER TABLE akun ADD COLUMN telp text;
-- Salah ketik: tabelnya "akun", bukan "akuns".
CREATE INDEX akun_telp_idx ON akuns (telp);
