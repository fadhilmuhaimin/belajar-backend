-- API v3 membaca kolom baru, tapi response tetap membawa field lama untuk app v1.4.
SELECT json_build_object('nama', nama, 'telp', no_hp, 'no_hp', no_hp) AS response FROM akun WHERE id = 1;
