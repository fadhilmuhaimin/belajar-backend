-- Meniru dua panggilan rpc dari app. Tiap SELECT berjalan sebagai transaction sendiri.
\set ON_ERROR_STOP off
select transfer('budi', 'ani', 70000);
select nama, saldo from akun order by nama desc;
select tarik('budi', 70000) as tarik_70;
select tarik('budi', 50000) as tarik_50;
select nama, saldo from akun order by nama desc;
