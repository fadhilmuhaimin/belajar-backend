package repo

import "context"

// --8<-- [start:pindahkan]
// Pindahkan mengurangi saldo pembayar, menambah saldo penerima, dan mencatat transaksinya
// dalam satu transaction. Kalau salah satu gagal, ketiganya batal.
func (r Repo) Pindahkan(ctx context.Context, dari, ke, jumlah int64) (id, saldoBaru int64, err error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, 0, err
	}
	defer tx.Rollback() // tidak berpengaruh setelah Commit berhasil
	if err := tx.QueryRowContext(ctx, `UPDATE akun SET saldo = saldo - $1 WHERE id = $2 RETURNING saldo`,
		jumlah, dari).Scan(&saldoBaru); err != nil {
		return 0, 0, err
	}
	if _, err := tx.ExecContext(ctx, `UPDATE akun SET saldo = saldo + $1 WHERE id = $2`, jumlah, ke); err != nil {
		return 0, 0, err
	}
	if err := tx.QueryRowContext(ctx, `INSERT INTO transaksi (dari, ke, jumlah) VALUES ($1, $2, $3) RETURNING id`,
		dari, ke, jumlah).Scan(&id); err != nil {
		return 0, 0, err
	}
	return id, saldoBaru, tx.Commit()
}

// --8<-- [end:pindahkan]
