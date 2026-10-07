-- EXPAND: tambah kolom baru. Tanpa DEFAULT, PostgreSQL tidak menulis ulang tabel.
\timing on
ALTER TABLE akun ADD COLUMN no_hp text;
\timing off
