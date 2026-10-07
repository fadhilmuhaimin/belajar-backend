package main

// Lapisan akses data: hanya SQL. Tidak tahu HTTP, tidak tahu aturan bisnis.

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

type Akun struct {
	ID    string `json:"id"`
	Nama  string `json:"nama"`
	Saldo int64  `json:"saldo"`
}

type DataPG struct {
	db   *sql.DB
	naif bool // hanya untuk lab C1: baca saldo, hitung di Go, lalu tulis (pola yang salah di B3.2)
}

var errTidakAda = errors.New("tidak ada")

func (r DataPG) Akun(ctx context.Context, id string) (Akun, string, error) {
	var a Akun
	var hash string
	err := r.db.QueryRowContext(ctx, `SELECT id, nama, saldo, pin_hash FROM akun WHERE id = $1`, id).
		Scan(&a.ID, &a.Nama, &a.Saldo, &hash)
	if errors.Is(err, sql.ErrNoRows) {
		return a, "", errTidakAda
	}
	return a, hash, err
}

// --8<-- [start:transfer]
// Pindahkan saldo dalam satu transaction. UPDATE atomik dengan syarat saldo cukup (lihat halaman Race condition dan lock).
func (r DataPG) Pindahkan(ctx context.Context, dari, ke string, jumlah int64) (id, saldo int64, err error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, 0, err
	}
	defer tx.Rollback()
	if r.naif {
		saldo, err = r.kurangiNaif(ctx, tx, dari, jumlah)
	} else {
		err = tx.QueryRowContext(ctx,
			`UPDATE akun SET saldo = saldo - $1 WHERE id = $2 AND saldo >= $1 RETURNING saldo`,
			jumlah, dari).Scan(&saldo)
	}
	if errors.Is(err, sql.ErrNoRows) {
		return 0, 0, ErrSaldoKurang
	}
	if err != nil {
		return 0, 0, err
	}
	if _, err = tx.ExecContext(ctx, `UPDATE akun SET saldo = saldo + $1 WHERE id = $2`, jumlah, ke); err != nil {
		return 0, 0, err
	}
	if err = tx.QueryRowContext(ctx,
		`INSERT INTO transfer (dari, ke, jumlah) VALUES ($1, $2, $3) RETURNING id`, dari, ke, jumlah).Scan(&id); err != nil {
		return 0, 0, err
	}
	return id, saldo, tx.Commit()
}

// --8<-- [end:transfer]

// Pola baca-hitung-tulis (salah). Jeda 50 ms memperlebar jendela race supaya hasil lab bisa diulang.
func (r DataPG) kurangiNaif(ctx context.Context, tx *sql.Tx, dari string, jumlah int64) (int64, error) {
	var saldo int64
	if err := tx.QueryRowContext(ctx, `SELECT saldo FROM akun WHERE id = $1`, dari).Scan(&saldo); err != nil {
		return 0, err
	}
	if saldo < jumlah {
		return 0, sql.ErrNoRows
	}
	time.Sleep(50 * time.Millisecond)
	_, err := tx.ExecContext(ctx, `UPDATE akun SET saldo = $1 WHERE id = $2`, saldo-jumlah, dari)
	return saldo - jumlah, err
}
