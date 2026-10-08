package repo

import (
	"context"
	"fmt"
)

// AkunLewatEmailSemua: nomor dan jenis akun untuk setiap email, satu query.
func (r Repo) JenisAkunLewatEmail(ctx context.Context, email []string) (map[string]struct {
	ID    int64
	Jenis string
}, error) {
	hasil := map[string]struct {
		ID    int64
		Jenis string
	}{}
	rows, err := r.db.QueryContext(ctx, `SELECT email, id, jenis FROM akun WHERE email = ANY($1)`, email)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var e string
		var v struct {
			ID    int64
			Jenis string
		}
		if err := rows.Scan(&e, &v.ID, &v.Jenis); err != nil {
			return nil, err
		}
		hasil[e] = v
	}
	return hasil, rows.Err()
}

type BarisTopup struct {
	AkunID  int64
	Nominal int64
}

// --8<-- [start:topup]
// Topup mengisi saldo semua baris dalam satu transaction: semua tersimpan, atau tidak ada sama sekali.
func (r Repo) Topup(ctx context.Context, adminID int64, keterangan string, baris []BarisTopup) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback() // tidak berpengaruh setelah Commit berhasil
	for _, b := range baris {
		if _, err := tx.ExecContext(ctx, `UPDATE akun SET saldo = saldo + $1 WHERE id = $2`, b.Nominal, b.AkunID); err != nil {
			return fmt.Errorf("akun %d: %w", b.AkunID, err)
		}
		if _, err := tx.ExecContext(ctx,
			`INSERT INTO topup (akun_id, nominal, admin_id, keterangan) VALUES ($1, $2, $3, $4)`,
			b.AkunID, b.Nominal, adminID, keterangan); err != nil {
			return fmt.Errorf("catatan akun %d: %w", b.AkunID, err)
		}
	}
	return tx.Commit()
}

// --8<-- [end:topup]
