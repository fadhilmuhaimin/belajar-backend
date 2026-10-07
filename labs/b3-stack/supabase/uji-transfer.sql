-- Meniru supabase.rpc('transfer', ...) dari app: satu panggilan = satu transaction.
select transfer('budi', 'ani', 70000);
select nama || '=' || saldo from akun order by nama desc;
