-- CONTRACT: setelah app v1.4 tidak dipakai lagi (lihat E1), hapus kolom lama.
ALTER TABLE akun DROP COLUMN telp;
SELECT json_build_object('nama', nama, 'no_hp', no_hp) AS response FROM akun WHERE id = 1;
