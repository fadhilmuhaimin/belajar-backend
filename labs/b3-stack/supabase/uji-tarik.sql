-- Meniru dua supabase.rpc('tarik', ...) dari app.
select 'tarik 70000: ' || case when tarik('budi', 70000) then 'sukses' else 'saldo tidak cukup' end;
select 'tarik 50000: ' || case when tarik('budi', 50000) then 'sukses' else 'saldo tidak cukup' end;
select nama || '=' || saldo from akun order by nama desc;
