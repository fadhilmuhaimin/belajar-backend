-- Lab B3 · fungsi Postgres yang dipanggil dari app lewat supabase.rpc().
-- Satu panggilan rpc = satu request PostgREST = satu transaction.
-- --8<-- [start:transfer]
create or replace function transfer(dari text, ke text, jumlah int)
returns void
language plpgsql
as $$
begin
  update akun set saldo = saldo - jumlah where nama = dari;
  update akun set saldo = saldo + jumlah where nama = ke;
end;
$$;
-- --8<-- [end:transfer]

-- --8<-- [start:tarik]
create or replace function tarik(p_nama text, p_jumlah int)
returns boolean
language plpgsql
as $$
begin
  update akun set saldo = saldo - p_jumlah
  where nama = p_nama and saldo >= p_jumlah;
  return found;  -- true kalau ada baris yang berubah
end;
$$;
-- --8<-- [end:tarik]
