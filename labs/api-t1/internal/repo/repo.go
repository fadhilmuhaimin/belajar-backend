// Package repo adalah lapisan akses data: hanya SQL. Tidak tahu HTTP, tidak tahu aturan uang.
package repo

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

type Akun struct {
	ID    int64  `json:"id"`
	Jenis string `json:"jenis"`
	Nama  string `json:"nama"`
	Saldo int64  `json:"saldo"`
}

var ErrTidakAda = errors.New("tidak ada")

type Repo struct{ db *sql.DB }

func Baru(db *sql.DB) Repo { return Repo{db: db} }

func (r Repo) Akun(ctx context.Context, id int64) (Akun, error) {
	var a Akun
	err := r.db.QueryRowContext(ctx, `SELECT id, jenis, nama, saldo FROM akun WHERE id = $1`, id).
		Scan(&a.ID, &a.Jenis, &a.Nama, &a.Saldo)
	if errors.Is(err, sql.ErrNoRows) {
		return a, ErrTidakAda
	}
	return a, err
}

func (r Repo) AkunLewatEmail(ctx context.Context, email string) (id int64, passwordHash string, err error) {
	err = r.db.QueryRowContext(ctx, `SELECT id, password_hash FROM akun WHERE email = $1`, email).Scan(&id, &passwordHash)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, "", ErrTidakAda
	}
	return id, passwordHash, err
}

// --8<-- [start:sesi]
func (r Repo) SimpanSesi(ctx context.Context, tokenHash string, akunID int64, kedaluwarsa time.Time) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO sesi (token_hash, akun_id, kedaluwarsa) VALUES ($1, $2, $3)`, tokenHash, akunID, kedaluwarsa)
	return err
}

// SesiAktif mengembalikan pemilik sesi yang belum kedaluwarsa pada waktu kini.
func (r Repo) SesiAktif(ctx context.Context, tokenHash string, kini time.Time) (int64, error) {
	var akunID int64
	err := r.db.QueryRowContext(ctx,
		`SELECT akun_id FROM sesi WHERE token_hash = $1 AND kedaluwarsa > $2`, tokenHash, kini).Scan(&akunID)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, ErrTidakAda
	}
	return akunID, err
}

func (r Repo) HapusSesi(ctx context.Context, tokenHash string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM sesi WHERE token_hash = $1`, tokenHash)
	return err
}

// --8<-- [end:sesi]

// SeedAkun dipakai -seed: isi data awal uji coba Gedung A.
func (r Repo) SeedAkun(ctx context.Context, a Akun, email, passwordHash string) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO akun (id, jenis, nama, email, password_hash, saldo) VALUES ($1, $2, $3, $4, $5, $6)`,
		a.ID, a.Jenis, a.Nama, email, passwordHash, a.Saldo)
	return err
}
