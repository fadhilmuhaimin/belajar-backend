package repo

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

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

// Transaksi adalah satu baris pembayaran, untuk GET /transfers/{id}.
type Transaksi struct {
	ID     int64     `json:"id"`
	Dari   int64     `json:"dari"`
	Ke     int64     `json:"ke"`
	Jumlah int64     `json:"jumlah"`
	Waktu  time.Time `json:"waktu"`
}

func (r Repo) Transaksi(ctx context.Context, id int64) (Transaksi, error) {
	var t Transaksi
	err := r.db.QueryRowContext(ctx, `SELECT id, dari, ke, jumlah, dibuat FROM transaksi WHERE id = $1`, id).
		Scan(&t.ID, &t.Dari, &t.Ke, &t.Jumlah, &t.Waktu)
	if errors.Is(err, sql.ErrNoRows) {
		return t, ErrTidakAda
	}
	return t, err
}

// --8<-- [start:m4]
// PindahkanM4 adalah Pindahkan versi minggu 3: tiga perintah terpisah, tanpa transaction.
// Setiap perintah langsung tersimpan; kalau perintah kedua gagal, perintah pertama tidak batal.
// Hanya dipakai mode -rentan m4.
func (r Repo) PindahkanM4(ctx context.Context, dari, ke, jumlah int64) (id, saldoBaru int64, err error) {
	if err := r.db.QueryRowContext(ctx, `UPDATE akun SET saldo = saldo - $1 WHERE id = $2 RETURNING saldo`,
		jumlah, dari).Scan(&saldoBaru); err != nil {
		return 0, 0, err
	}
	if _, err := r.db.ExecContext(ctx, `UPDATE akun SET saldo = saldo + $1 WHERE id = $2`, jumlah, ke); err != nil {
		return 0, 0, err
	}
	if err := r.db.QueryRowContext(ctx, `INSERT INTO transaksi (dari, ke, jumlah) VALUES ($1, $2, $3) RETURNING id`,
		dari, ke, jumlah).Scan(&id); err != nil {
		return 0, 0, err
	}
	return id, saldoBaru, nil
}

// --8<-- [end:m4]
