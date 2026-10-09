-- Minggu 3: batas yang di minggu 2 ditambah tangan di server, kini ditulis sebagai file.
-- Laptop dan server baru mendapatkannya dari sini. Server lama sudah punya batas ini.
ALTER TABLE akun ADD CONSTRAINT batas_saldo_warung CHECK (jenis <> 'warung' OR saldo <= 1500000);
