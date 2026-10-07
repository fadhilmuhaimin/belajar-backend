-- BACKFILL: isi kolom baru untuk baris lama, 1.000 baris per batch (satu transaction pendek per batch).
UPDATE akun SET no_hp = telp WHERE id IN (SELECT id FROM akun WHERE no_hp IS NULL ORDER BY id LIMIT 1000);
UPDATE akun SET no_hp = telp WHERE id IN (SELECT id FROM akun WHERE no_hp IS NULL ORDER BY id LIMIT 1000);
UPDATE akun SET no_hp = telp WHERE id IN (SELECT id FROM akun WHERE no_hp IS NULL ORDER BY id LIMIT 1000);
UPDATE akun SET no_hp = telp WHERE id IN (SELECT id FROM akun WHERE no_hp IS NULL ORDER BY id LIMIT 1000);
SELECT count(*) AS belum_terisi FROM akun WHERE no_hp IS NULL;
