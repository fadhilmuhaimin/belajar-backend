// Lab B3 · Node 22 + node-postgres (pg). Jalankan: make node
import { readFile } from 'node:fs/promises'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// --8<-- [start:transfer]
// Transaction: satu client untuk seluruh transaction (bukan pool.query).
async function transfer(dari, ke, jumlah) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('UPDATE akun SET saldo = saldo - $1 WHERE nama = $2', [jumlah, dari])
    await client.query('UPDATE akun SET saldo = saldo + $1 WHERE nama = $2', [jumlah, ke])
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}
// --8<-- [end:transfer]

// --8<-- [start:tarik]
// Race condition: UPDATE atomik dengan syarat. Tidak perlu SELECT dulu.
async function tarik(nama, jumlah) {
  const res = await pool.query(
    'UPDATE akun SET saldo = saldo - $1 WHERE nama = $2 AND saldo >= $1', [jumlah, nama])
  if (res.rowCount === 0) throw new Error('saldo tidak cukup')
}
// --8<-- [end:tarik]

async function cetak() {
  const { rows } = await pool.query('SELECT nama, saldo FROM akun ORDER BY nama DESC')
  const total = rows.reduce((s, r) => s + r.saldo, 0)
  console.log(rows.map(r => `${r.nama}=${r.saldo}`).join(' '), `total=${total}`)
}

const mode = process.argv[2] ?? 'semua'
await pool.query(await readFile('../schema.sql', 'utf8'))
if (mode === 'transfer' || mode === 'semua') {
  await transfer('budi', 'ani', 70000).catch(e => console.log('transfer budi -> ani 70000:', e.message))
  await cetak()
}
if (mode === 'tarik' || mode === 'semua') {
  const hasil = await Promise.allSettled([tarik('budi', 70000), tarik('budi', 50000)])
  hasil.forEach((h, i) => console.log(`tarik ${[70000, 50000][i]}:`, h.status === 'fulfilled' ? 'sukses' : h.reason.message))
  await cetak()
}
await pool.end()
