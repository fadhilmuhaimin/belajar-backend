-- VARIAN: rename langsung saat API lama masih berjalan.
ALTER TABLE akun RENAME COLUMN telp TO no_hp;
-- Query dari instance API v1 yang belum diganti:
SELECT json_build_object('nama', nama, 'telp', telp) AS response FROM akun WHERE id = 1;
-- Query dari API v2 yang sudah memakai nama baru:
SELECT json_build_object('nama', nama, 'no_hp', no_hp) AS response FROM akun WHERE id = 1;
